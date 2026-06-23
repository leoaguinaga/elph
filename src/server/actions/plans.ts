"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function createPlan(input: {
  name: string;
  goal?: string;
  days?: { dayName: string; sessionName: string; isRest: boolean; order: number; exercises?: string[] }[];
}) {
  const userId = await requireUserId();
  const name = input.name.trim();
  if (!name) throw new Error("Nombre requerido");

  // Desactivar planes anteriores y crear el nuevo activo en una transacción
  const plan = await prisma.$transaction(async (tx) => {
    await tx.workoutPlan.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    const createdPlan = await tx.workoutPlan.create({
      data: {
        userId,
        name,
        goal: input.goal?.trim() || "Hipertrofia",
        isActive: true,
      },
    });

    if (input.days) {
      for (const d of input.days) {
        const createdDay = await tx.workoutDay.create({
          data: {
            planId:      createdPlan.id,
            dayName:     d.dayName,
            sessionName: d.sessionName,
            isRest:      d.isRest,
            order:       d.order,
          },
        });

        if (d.exercises && d.exercises.length > 0) {
          const systemExs = await tx.exercise.findMany({
            where: { name: { in: d.exercises }, userId: null },
          });

          for (let idx = 0; idx < d.exercises.length; idx++) {
            const exName = d.exercises[idx];
            const exObj = systemExs.find((e) => e.name === exName);
            if (exObj) {
              await tx.dayExercise.create({
                data: {
                  dayId:       createdDay.id,
                  exerciseId:  exObj.id,
                  order:       idx,
                  targetSets:  exName.includes("banca") || exName.includes("Sentadilla") || exName.includes("militar") ? 4 : 3,
                  targetReps:  "8-10",
                  restSeconds: 180, // 3 minutos de descanso
                },
              });
            }
          }
        }
      }
    }

    return createdPlan;
  });

  revalidatePath("/split");
  revalidatePath("/dashboard");
  return plan;
}

export async function setActivePlan(planId: string) {
  const userId = await requireUserId();
  await prisma.$transaction([
    prisma.workoutPlan.updateMany({ where: { userId }, data: { isActive: false } }),
    prisma.workoutPlan.update({ where: { id: planId, userId }, data: { isActive: true } }),
  ]);
  revalidatePath("/split");
  revalidatePath("/dashboard");
}

export async function deletePlan(planId: string) {
  const userId = await requireUserId();
  const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) throw new Error("Sin permisos");
  await prisma.workoutPlan.delete({ where: { id: planId } });
  revalidatePath("/split");
}

export async function addDay(input: {
  planId: string;
  dayName: string;
  sessionName: string;
  isRest?: boolean;
}) {
  const userId = await requireUserId();
  const plan = await prisma.workoutPlan.findUnique({ where: { id: input.planId } });
  if (!plan || plan.userId !== userId) throw new Error("Sin permisos");
  const lastOrder = await prisma.workoutDay.aggregate({
    where: { planId: plan.id },
    _max:  { order: true },
  });
  const day = await prisma.workoutDay.create({
    data: {
      planId:      plan.id,
      dayName:     input.dayName.trim(),
      sessionName: input.sessionName.trim(),
      isRest:      input.isRest ?? false,
      order:       (lastOrder._max.order ?? -1) + 1,
    },
  });
  revalidatePath("/split");
  return day;
}

export async function deleteDay(dayId: string) {
  const userId = await requireUserId();
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId }, include: { plan: true },
  });
  if (!day || day.plan.userId !== userId) throw new Error("Sin permisos");
  await prisma.workoutDay.delete({ where: { id: dayId } });
  revalidatePath("/split");
}

export async function addExerciseToDay(input: {
  dayId: string;
  exerciseId: string;
  targetSets?: number;
  targetReps?: string;
  restSeconds?: number;
}) {
  const userId = await requireUserId();
  const day = await prisma.workoutDay.findUnique({
    where: { id: input.dayId }, include: { plan: true },
  });
  if (!day || day.plan.userId !== userId) throw new Error("Sin permisos");

  const lastOrder = await prisma.dayExercise.aggregate({
    where: { dayId: day.id },
    _max:  { order: true },
  });
  const dx = await prisma.dayExercise.create({
    data: {
      dayId:       day.id,
      exerciseId:  input.exerciseId,
      order:       (lastOrder._max.order ?? -1) + 1,
      targetSets:  input.targetSets  ?? 3,
      targetReps:  input.targetReps  ?? "8-10",
      restSeconds: input.restSeconds ?? 90,
    },
  });
  revalidatePath("/split");
  return dx;
}

export async function removeExerciseFromDay(dayExerciseId: string) {
  const userId = await requireUserId();
  const dx = await prisma.dayExercise.findUnique({
    where: { id: dayExerciseId }, include: { day: { include: { plan: true } } },
  });
  if (!dx || dx.day.plan.userId !== userId) throw new Error("Sin permisos");
  await prisma.dayExercise.delete({ where: { id: dayExerciseId } });
  revalidatePath("/split");
}

export async function reorderDayExercises(dayId: string, orderedIds: string[]) {
  const userId = await requireUserId();
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId }, include: { plan: true },
  });
  if (!day || day.plan.userId !== userId) throw new Error("Sin permisos");
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.dayExercise.update({ where: { id }, data: { order: idx } }),
    ),
  );
  revalidatePath("/split");
}

export async function getDayDetails(dayId: string) {
  const userId = await requireUserId();
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId },
    include: {
      plan: true,
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  });

  if (!day || day.plan.userId !== userId) {
    throw new Error("Día no encontrado o sin permisos");
  }

  const muscles = Array.from(new Set(day.exercises.map((e) => e.exercise.muscle)));

  // Intentar buscar un consejo/tip sobre los músculos trabajados
  let tip = await prisma.tip.findFirst({
    where: {
      muscle: { in: muscles },
    },
  });

  if (!tip) {
    tip = await prisma.tip.findFirst();
  }

  return {
    id: day.id,
    dayName: day.dayName,
    sessionName: day.sessionName,
    isRest: day.isRest,
    muscles,
    exercises: day.exercises.map((e) => ({
      id: e.id,
      name: e.exercise.name,
      muscle: e.exercise.muscle,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      restSeconds: e.restSeconds,
    })),
    tip: tip ? tip.content : "Calienta de forma adecuada antes de empezar a levantar pesado.",
  };
}

export async function getPlanForEditing(planId: string) {
  const userId = await requireUserId();
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: planId, userId },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });

  if (!plan) throw new Error("Plan no encontrado");

  return plan;
}

export async function saveSplitChanges(input: {
  planId: string;
  days: {
    id: string;
    dayName: string;
    sessionName: string;
    isRest: boolean;
    exercises: { exerciseId: string; targetSets?: number; targetReps?: string; restSeconds?: number }[];
  }[];
}) {
  const userId = await requireUserId();
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: input.planId },
  });
  if (!plan || plan.userId !== userId) throw new Error("Sin permisos");

  await prisma.$transaction(async (tx) => {
    for (const d of input.days) {
      // 1. Actualizar día
      await tx.workoutDay.update({
        where: { id: d.id },
        data: {
          dayName: d.dayName.trim(),
          sessionName: d.sessionName.trim(),
          isRest: d.isRest,
        },
      });

      // 2. Eliminar ejercicios anteriores
      await tx.dayExercise.deleteMany({
        where: { dayId: d.id },
      });

      // 3. Crear los ejercicios nuevos
      if (!d.isRest && d.exercises && d.exercises.length > 0) {
        for (let idx = 0; idx < d.exercises.length; idx++) {
          const ex = d.exercises[idx];
          await tx.dayExercise.create({
            data: {
              dayId:       d.id,
              exerciseId:  ex.exerciseId,
              order:       idx,
              targetSets:  ex.targetSets ?? 3,
              targetReps:  ex.targetReps ?? "8-10",
              restSeconds: ex.restSeconds ?? 180, // 3 min de descanso por defecto
            },
          });
        }
      }
    }
  });

  revalidatePath("/split");
  revalidatePath("/dashboard");
}


