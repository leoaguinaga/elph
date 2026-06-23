import { prisma } from "@/lib/prisma";

export type WeightEntryView = {
  id:     string;
  weight: number;
  date:   Date;
};

/** Returns weight entries ordered oldest-first, default last 30 days. */
export async function getWeightHistory(
  userId: string,
  days = 30,
): Promise<WeightEntryView[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const entries = await prisma.weightEntry.findMany({
    where:   { userId, date: { gte: since } },
    orderBy: { date: "asc" },
    select:  { id: true, weight: true, date: true },
  });
  return entries;
}

/** Latest weight entry for the user, or null if none exists. */
export async function getLastWeight(userId: string): Promise<WeightEntryView | null> {
  const entry = await prisma.weightEntry.findFirst({
    where:   { userId },
    orderBy: { date: "desc" },
    select:  { id: true, weight: true, date: true },
  });
  return entry ?? null;
}
