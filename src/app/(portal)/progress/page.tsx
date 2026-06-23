import { requireSession } from "@/lib/session";
import { getProgressStats, getExercisePRHistory, getWeeklyVolume } from "@/server/db/progress";
import { ProgressScreen } from "./_ProgressScreen";

export default async function ProgressPage() {
  const session = await requireSession();
  const userId  = session.user.id;

  const [stats, benchHistory, squatHistory, weeklyVolume] = await Promise.all([
    getProgressStats(userId, 8),
    getExercisePRHistory(userId, "Press banca con barra", 9),
    getExercisePRHistory(userId, "Sentadilla con barra", 9),
    getWeeklyVolume(userId, 8),
  ]);

  return (
    <ProgressScreen
      stats={stats}
      benchHistory={benchHistory}
      squatHistory={squatHistory}
      weeklyVolume={weeklyVolume}
    />
  );
}
