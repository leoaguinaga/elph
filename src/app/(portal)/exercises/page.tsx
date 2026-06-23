import { requireSession } from "@/lib/session";
import { listExercises } from "@/server/db/exercises";
import { ExercisesScreen } from "./_ExercisesScreen";

export default async function ExercisesPage() {
  const session   = await requireSession();
  const exercises = await listExercises(session.user.id);
  return <ExercisesScreen exercises={exercises} />;
}
