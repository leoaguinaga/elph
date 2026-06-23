import { prisma } from "@/lib/prisma";
import { getTodaysWorkout, type TodaysWorkout } from "./sessions";
import { getWeightHistory, type WeightEntryView } from "./weight";

export type WeekDayStatus = {
  letter:    string;   /** L M X J V S D */
  dayName:   string;
  label:     string;   /** session name or "Descanso" */
  isTraining: boolean;
  isToday:   boolean;
  done:      boolean;  /** has a finished session on that calendar day this week */
};

export type LastPR = {
  exerciseName: string;
  weightKg:     number;
  daysAgo:      number;
  deltaKg:      number | null;
} | null;

export type DashboardData = {
  todaysWorkout:  TodaysWorkout | null;
  weekStrip:      WeekDayStatus[];
  weightHistory:  WeightEntryView[];
  lastPR:         LastPR;
  tipContent:     string | null;
  /** ISO week number of today */
  weekNumber:     number;
};

const DAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"];
const toMondayIdx = (jsDay: number) => (jsDay + 6) % 7;

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  // Run independent queries in parallel
  const [todaysWorkout, weightHistory, plan, tip] = await Promise.all([
    getTodaysWorkout(userId),
    getWeightHistory(userId, 30),
    prisma.workoutPlan.findFirst({
      where:   { userId, isActive: true },
      include: { days: { orderBy: { order: "asc" } } },
    }),
    prisma.tip.findFirst({ orderBy: { id: "desc" } }),
  ]);

  // Build week strip
  const today     = new Date();
  const todayIdx  = toMondayIdx(today.getDay());
  // Start of this week (Monday)
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIdx);
  monday.setHours(0, 0, 0, 0);

  // Finished sessions this week keyed by day index
  const weekSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      finishedAt: { not: null, gte: monday },
    },
    select: { finishedAt: true },
  });
  const doneIdxSet = new Set(
    weekSessions
      .filter((s) => s.finishedAt)
      .map((s) => toMondayIdx(s.finishedAt!.getDay())),
  );

  const weekStrip: WeekDayStatus[] = DAY_LETTERS.map((letter, i) => {
    const day = plan?.days.find((d) => d.order === i);
    return {
      letter,
      dayName:    ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"][i],
      label:      day ? (day.isRest ? "Descanso" : day.sessionName) : "—",
      isTraining: day ? !day.isRest : false,
      isToday:    i === todayIdx,
      done:       doneIdxSet.has(i),
    };
  });

  // Last PR: find the most recent set that is a personal record
  const lastPRData = await getLastPR(userId);

  // Tip: random-ish, pick by rotating on date
  const tipContent = tip?.content ?? null;

  return {
    todaysWorkout,
    weekStrip,
    weightHistory,
    lastPR:     lastPRData,
    tipContent,
    weekNumber: getISOWeek(today),
  };
}

async function getLastPR(userId: string): Promise<LastPR> {
  // Get all exercises the user has logged
  const recentSessions = await prisma.workoutSession.findMany({
    where:   { userId, finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
    take:    10,
    include: { sets: { where: { done: true } } },
  });

  if (recentSessions.length === 0) return null;

  // For each set in recent sessions, check if it's a PR
  for (const session of recentSessions) {
    for (const set of session.sets) {
      const prevBest = await prisma.setRecord.aggregate({
        where: {
          exerciseId: set.exerciseId,
          done:       true,
          session: {
            userId,
            finishedAt: { not: null, lt: session.finishedAt! },
          },
        },
        _max: { weight: true },
      });

      if (set.weight > (prevBest._max.weight ?? 0)) {
        // This is a PR!
        const exercise = await prisma.exercise.findUnique({
          where:  { id: set.exerciseId },
          select: { name: true },
        });
        const daysAgo  = Math.floor((Date.now() - session.finishedAt!.getTime()) / 86400000);
        const deltaKg  = prevBest._max.weight != null ? set.weight - prevBest._max.weight : null;
        return {
          exerciseName: exercise?.name ?? "Ejercicio",
          weightKg:     set.weight,
          daysAgo,
          deltaKg,
        };
      }
    }
  }

  return null;
}
