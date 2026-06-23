"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export type CreateExerciseInput = {
  name: string;
  muscle: string;
  equipment: string;
};

export async function createCustomExercise(input: CreateExerciseInput) {
  const userId = await requireUserId();
  const name = input.name.trim();
  const muscle = input.muscle.trim();
  const equipment = input.equipment.trim();
  if (!name || !muscle || !equipment) throw new Error("Campos requeridos");

  // Si ya existe uno con el mismo nombre (del sistema o custom del user), avisar
  const existing = await prisma.exercise.findFirst({
    where: { name, OR: [{ userId: null }, { userId }] },
  });
  if (existing) throw new Error("Ya existe un ejercicio con ese nombre");

  const created = await prisma.exercise.create({
    data: { name, muscle, equipment, userId },
  });
  revalidatePath("/exercises");
  return created;
}

export async function updateCustomExercise(
  id: string,
  data: Partial<CreateExerciseInput>,
) {
  const userId = await requireUserId();
  // Guard: solo el dueño puede editar (no el catálogo del sistema)
  const ex = await prisma.exercise.findUnique({ where: { id } });
  if (!ex || ex.userId !== userId) throw new Error("Sin permisos");

  const updated = await prisma.exercise.update({
    where: { id },
    data: {
      ...(data.name      ? { name: data.name.trim() }            : {}),
      ...(data.muscle    ? { muscle: data.muscle.trim() }        : {}),
      ...(data.equipment ? { equipment: data.equipment.trim() } : {}),
    },
  });
  revalidatePath("/exercises");
  return updated;
}

export async function deleteCustomExercise(id: string) {
  const userId = await requireUserId();
  const ex = await prisma.exercise.findUnique({ where: { id } });
  if (!ex || ex.userId !== userId) throw new Error("Sin permisos");
  await prisma.exercise.delete({ where: { id } });
  revalidatePath("/exercises");
}

export async function getExercisesList() {
  const userId = await requireUserId();
  return prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: { name: "asc" },
  });
}

