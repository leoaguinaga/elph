import { prisma } from "@/lib/prisma";

export type WorkoutExerciseView = {
  dayExerciseId: string;
  exerciseId:    string;
  name:          string;
  muscle:        string;
  equipment:     string;
  targetSets:    number;
  targetReps:    string;
  restSeconds:   number;
  /** Series del último entrenamiento de este ejercicio (para mostrar "anterior"). */
  previous: { setNumber: number; weight: number; reps: number; rpe: number | null }[];
  /** Sugerencia: usa la primera serie anterior como base. */
  suggested: { kg: number; reps: number };
};

export type TodaysWorkout = {
  dayId:       string;
  sessionName: string;
  dayName:     string;
  planName:    string;
  isRest:      boolean;
  exercises:   WorkoutExerciseView[];
  /** Si ya hay una sesión iniciada hoy, sus datos. */
  activeSession: ActiveSession | null;
};

export type ActiveSession = {
  id:        string;
  startedAt: Date;
  notes:     string | null;
  sets:      {
    setNumber:  number;
    exerciseId: string;
    weight:     number;
    reps:       number;
    rpe:        number | null;
    done:       boolean;
  }[];
};

const toMondayIdx = (jsDay: number) => (jsDay + 6) % 7;

/**
 * Devuelve el WorkoutDay correspondiente a hoy según el plan activo.
 * Estrategia: matchea por orden del día (Lun=0, ..., Dom=6).
 * Si no hay plan activo o el día de hoy es de descanso, lo indica.
 */
export async function getTodaysWorkout(userId: string): Promise<TodaysWorkout | null> {
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
  if (!plan) return null;

  const todayIdx = toMondayIdx(new Date().getDay());
  const day = plan.days.find((d) => d.order === todayIdx) ?? plan.days[0];
  if (!day) return null;

  // Para cada DayExercise, busca el último SetRecord del usuario para ese exercise
  // (de una sesión anterior, no la activa de hoy).
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const exercises: WorkoutExerciseView[] = await Promise.all(
    day.exercises.map(async (dx) => {
      const lastSession = await prisma.workoutSession.findFirst({
        where: {
          userId,
          startedAt: { lt: todayStart },
          sets: { some: { exerciseId: dx.exerciseId, done: true } },
        },
        orderBy: { startedAt: "desc" },
        include: {
          sets: {
            where:   { exerciseId: dx.exerciseId, done: true },
            orderBy: { setNumber: "asc" },
          },
        },
      });
      const previous = (lastSession?.sets ?? []).map((s) => ({
        setNumber: s.setNumber, weight: s.weight, reps: s.reps, rpe: s.rpe,
      }));
      const firstPrev = previous[0];
      const suggested = firstPrev
        ? { kg: firstPrev.weight, reps: firstPrev.reps }
        : { kg: 0, reps: 8 };
      return {
        dayExerciseId: dx.id,
        exerciseId:    dx.exerciseId,
        name:          dx.exercise.name,
        muscle:        dx.exercise.muscle,
        equipment:     dx.exercise.equipment,
        targetSets:    dx.targetSets,
        targetReps:    dx.targetReps,
        restSeconds:   dx.restSeconds,
        previous, suggested,
      };
    }),
  );

  const activeSession = await getActiveSession(userId);

  return {
    dayId:       day.id,
    sessionName: day.sessionName,
    dayName:     day.dayName,
    planName:    plan.name,
    isRest:      day.isRest,
    exercises,
    activeSession,
  };
}

/** Sesión sin `finishedAt` (en curso). */
export async function getActiveSession(userId: string): Promise<ActiveSession | null> {
  const session = await prisma.workoutSession.findFirst({
    where:   { userId, finishedAt: null },
    orderBy: { startedAt: "desc" },
    include: { sets: { orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }] } },
  });
  if (!session) return null;
  return {
    id:        session.id,
    startedAt: session.startedAt,
    notes:     session.notes,
    sets: session.sets.map((s) => ({
      setNumber:  s.setNumber,
      exerciseId: s.exerciseId,
      weight:     s.weight,
      reps:       s.reps,
      rpe:        s.rpe,
      done:       s.done,
    })),
  };
}
