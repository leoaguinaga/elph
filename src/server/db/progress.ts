import { prisma } from "@/lib/prisma";

export type ProgressStats = {
  sessionsCount:  number;
  totalVolumeKg:  number;
  newPRsCount:    number;
  adherencePct:   number;
  /** For "vs anterior" delta comparison (previous period). */
  prevSessionsCount: number;
  prevTotalVolumeKg: number;
};

export type PRDataPoint = {
  week:      number; /** 0-indexed, oldest first */
  weightKg:  number;
  exerciseName: string;
};

export type VolumeDataPoint = {
  week:       number; /** 0-indexed, oldest first */
  weekLabel:  string; /** e.g. "S22" */
  volumeKg:   number;
};

/** Stats for the last `weeks` weeks, compared to the previous same-length window. */
export async function getProgressStats(
  userId: string,
  weeks = 8,
): Promise<ProgressStats> {
  const now      = new Date();
  const weekMs   = 7 * 24 * 3600_000;
  const from     = new Date(now.getTime() - weeks * weekMs);
  const prevFrom = new Date(from.getTime() - weeks * weekMs);

  // Current period sessions
  const sessions = await prisma.workoutSession.findMany({
    where:   { userId, finishedAt: { not: null, gte: from } },
    include: { sets: { where: { done: true } } },
  });

  // Previous period sessions (for delta)
  const prevSessions = await prisma.workoutSession.findMany({
    where:   { userId, finishedAt: { not: null, gte: prevFrom, lt: from } },
    include: { sets: { where: { done: true } } },
  });

  const totalVolumeKg = sessions.reduce((acc, s) => {
    return acc + s.sets.reduce((a, set) => a + set.weight * set.reps, 0);
  }, 0);

  const prevTotalVolumeKg = prevSessions.reduce((acc, s) => {
    return acc + s.sets.reduce((a, set) => a + set.weight * set.reps, 0);
  }, 0);

  // Count new PRs: for each exercise, did the user beat their all-time max in this period?
  // Simplified: count exercises where max weight in current period > max weight before current period.
  const currentSets = sessions.flatMap((s) => s.sets);
  const exercisesInPeriod = [...new Set(currentSets.map((s) => s.exerciseId))];

  let newPRsCount = 0;
  for (const exerciseId of exercisesInPeriod) {
    const currentMax = Math.max(
      ...currentSets.filter((s) => s.exerciseId === exerciseId).map((s) => s.weight),
    );
    const historicBest = await prisma.setRecord.aggregate({
      where: {
        exerciseId,
        done:    true,
        session: { userId, finishedAt: { lt: from } },
      },
      _max: { weight: true },
    });
    const prevBest = historicBest._max.weight ?? 0;
    if (currentMax > prevBest) newPRsCount++;
  }

  // Adherence: sessions completed / plan sessions expected
  // Simple heuristic: plan has N training days per week → expected = N * weeks
  const activePlan = await prisma.workoutPlan.findFirst({
    where:   { userId, isActive: true },
    include: { days: { where: { isRest: false } } },
  });
  const trainingDaysPerWeek = activePlan?.days.length ?? 5;
  const expectedSessions    = trainingDaysPerWeek * weeks;
  const adherencePct = expectedSessions > 0
    ? Math.round((sessions.length / expectedSessions) * 100)
    : 0;

  return {
    sessionsCount:     sessions.length,
    totalVolumeKg:     Math.round(totalVolumeKg),    // raw kg total
    newPRsCount,
    adherencePct:      Math.min(adherencePct, 100),
    prevSessionsCount: prevSessions.length,
    prevTotalVolumeKg: Math.round(prevTotalVolumeKg), // raw kg total
  };
}

/**
 * Weekly best set weight for a given exercise (by name), oldest-first.
 * Returns up to `weeks` data points.
 */
export async function getExercisePRHistory(
  userId:       string,
  exerciseName: string,
  weeks         = 9,
): Promise<{ week: number; weightKg: number }[]> {
  const exercise = await prisma.exercise.findFirst({
    where: { name: { equals: exerciseName, mode: "insensitive" } },
  });
  if (!exercise) return [];

  const now    = new Date();
  const weekMs = 7 * 24 * 3600_000;
  const result: { week: number; weightKg: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd   = new Date(now.getTime() - i * weekMs);
    const weekStart = new Date(weekEnd.getTime() - weekMs);

    const best = await prisma.setRecord.aggregate({
      where: {
        exerciseId: exercise.id,
        done:       true,
        session: {
          userId,
          finishedAt: { gte: weekStart, lt: weekEnd },
        },
      },
      _max: { weight: true },
    });

    result.push({
      week:     weeks - 1 - i,
      weightKg: best._max.weight ?? 0,
    });
  }

  return result;
}

/** Sum of weight × reps per week, oldest-first. */
export async function getWeeklyVolume(
  userId: string,
  weeks  = 8,
): Promise<VolumeDataPoint[]> {
  const now    = new Date();
  const weekMs = 7 * 24 * 3600_000;
  const result: VolumeDataPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd   = new Date(now.getTime() - i * weekMs);
    const weekStart = new Date(weekEnd.getTime() - weekMs);

    const sets = await prisma.setRecord.findMany({
      where: {
        done:    true,
        session: { userId, finishedAt: { gte: weekStart, lt: weekEnd } },
      },
      select: { weight: true, reps: true },
    });

    const volumeKg = sets.reduce((acc, s) => acc + s.weight * s.reps, 0);

    // Label: ISO week number
    const weekNum = getISOWeek(weekEnd);
    result.push({
      week:      weeks - 1 - i,
      weekLabel: `S${weekNum}`,
      volumeKg:  Math.round(volumeKg),
    });
  }

  return result;
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
