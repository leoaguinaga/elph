import { prisma } from "@/lib/prisma";

export type DayWithExercises = {
  id: string;
  dayName: string;
  sessionName: string;
  isRest: boolean;
  order: number;
  exercises: {
    id: string;
    order: number;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
    exercise: { id: string; name: string; muscle: string; equipment: string };
  }[];
};

export type PlanWithDays = {
  id: string;
  name: string;
  goal: string;
  isActive: boolean;
  createdAt: Date;
  days: DayWithExercises[];
};

/** Devuelve el plan activo del usuario (o null si no tiene). */
export async function getActivePlan(userId: string): Promise<PlanWithDays | null> {
  const plan = await prisma.workoutPlan.findFirst({
    where:   { userId, isActive: true },
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
  return plan as PlanWithDays | null;
}

/** Devuelve todos los planes del usuario (resumen, sin días). */
export async function listPlans(userId: string) {
  return prisma.workoutPlan.findMany({
    where:   { userId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

/**
 * Resumen para el frontend de `/split`: incluye solo el conteo de ejercicios y
 * músculos distintos por día, sin cargar todos los Exercise rows.
 */
export type SplitDaySummary = {
  id: string;
  dayName: string;
  sessionName: string;
  isRest: boolean;
  order: number;
  exercisesCount: number;
  muscles: string[];
  estimatedMinutes: number;
};

export async function getActivePlanSummary(userId: string) {
  const plan = await getActivePlan(userId);
  if (!plan) return null;

  const days: SplitDaySummary[] = plan.days.map((d) => {
    const muscles = Array.from(new Set(d.exercises.map((e) => e.exercise.muscle)));
    // Heurística simple para tiempo: targetSets * restSeconds + 30s por serie
    const totalSeconds = d.exercises.reduce((acc, e) => acc + e.targetSets * (e.restSeconds + 30), 0);
    return {
      id:             d.id,
      dayName:        d.dayName,
      sessionName:    d.sessionName,
      isRest:         d.isRest,
      order:          d.order,
      exercisesCount: d.exercises.length,
      muscles,
      estimatedMinutes: Math.round(totalSeconds / 60),
    };
  });

  return {
    id:       plan.id,
    name:     plan.name,
    goal:     plan.goal,
    createdAt: plan.createdAt,
    days,
  };
}
