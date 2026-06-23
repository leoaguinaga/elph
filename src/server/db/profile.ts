import { prisma } from "@/lib/prisma";

export type UserPreferencesView = {
  units:              string;
  defaultRestSeconds: number;
  notifications:      boolean;
  theme:              string;
  language:           string;
};

export type AchievementView = {
  id:          string;
  type:        string;
  title:       string;
  subtitle:    string | null;
  achievedAt:  Date;
};

export type ProfileStats = {
  sessionsCount:  number;
  weeksTraining:  number;
  goal:           string;
};

export type ProfileData = {
  preferences: UserPreferencesView;
  stats:       ProfileStats;
  achievements: AchievementView[];
};

const DEFAULT_PREFS: UserPreferencesView = {
  units:              "kg",
  defaultRestSeconds: 90,
  notifications:      true,
  theme:              "dark",
  language:           "es",
};

export async function getProfile(userId: string): Promise<ProfileData> {
  const [prefs, sessionsCount, plan, achievements] = await Promise.all([
    prisma.userPreferences.findUnique({ where: { userId } }),
    prisma.workoutSession.count({ where: { userId, finishedAt: { not: null } } }),
    prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      select: { goal: true, createdAt: true },
    }),
    prisma.achievement.findMany({
      where:   { userId },
      orderBy: { achievedAt: "desc" },
      take:    5,
    }),
  ]);

  const weeksTraining = plan
    ? Math.max(1, Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / (7 * 24 * 3600_000)) + 1)
    : 0;

  return {
    preferences: prefs
      ? {
          units:              prefs.units,
          defaultRestSeconds: prefs.defaultRestSeconds,
          notifications:      prefs.notifications,
          theme:              prefs.theme,
          language:           prefs.language,
        }
      : DEFAULT_PREFS,
    stats: {
      sessionsCount,
      weeksTraining,
      goal: plan?.goal ?? "—",
    },
    achievements: achievements.map((a) => ({
      id:         a.id,
      type:       a.type,
      title:      a.title,
      subtitle:   a.subtitle,
      achievedAt: a.achievedAt,
    })),
  };
}
