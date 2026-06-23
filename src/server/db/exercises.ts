import { prisma } from "@/lib/prisma";

export type ExerciseListItem = {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  isCustom: boolean;
  setsCount: number;
  prKg: number | null;
};

/**
 * Devuelve el catálogo completo de ejercicios visibles para el usuario:
 *  - todos los del sistema (userId = null)
 *  - + los custom del propio usuario (userId = userId)
 * Para cada ejercicio, agrega contador de series y PR del usuario.
 */
export async function listExercises(userId: string): Promise<ExerciseListItem[]> {
  const exercises = await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: { name: "asc" },
  });

  if (exercises.length === 0) return [];

  // Agregar setsCount + PR por ejercicio para este usuario en una sola query
  const stats = await prisma.setRecord.groupBy({
    by: ["exerciseId"],
    where: {
      exerciseId: { in: exercises.map((e) => e.id) },
      session: { userId },
      done: true,
    },
    _count: { _all: true },
    _max:   { weight: true },
  });
  const byId = new Map(stats.map((s) => [s.exerciseId, s]));

  return exercises
    .map((e) => {
      const s = byId.get(e.id);
      return {
        id:        e.id,
        name:      e.name,
        muscle:    e.muscle,
        equipment: e.equipment,
        isCustom:  e.userId === userId,
        setsCount: s?._count._all ?? 0,
        prKg:      s?._max.weight ?? null,
      };
    })
    .sort((a, b) => b.setsCount - a.setsCount || a.name.localeCompare(b.name));
}
