import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getTodaysWorkout } from "@/server/db/sessions";
import { WorkoutScreen } from "./_WorkoutScreen";

export default async function WorkoutPage() {
  const session = await requireSession();
  const workout = await getTodaysWorkout(session.user.id);

  if (!workout) {
    return (
      <main className="max-w-[720px] mx-auto px-12 pt-24 pb-24 text-center">
        <div className="meta mb-3">Sin rutina activa</div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] mb-4 text-t1">
          No tienes un plan activo.
        </h1>
        <p className="body text-base mb-8">
          Crea uno en la sección Mi Split para empezar a registrar sesiones.
        </p>
        <Link href="/split" className="btn-primary inline-flex">Ir a Mi Split</Link>
      </main>
    );
  }

  if (workout.isRest || workout.exercises.length === 0) {
    return (
      <main className="max-w-[720px] mx-auto px-12 pt-24 pb-24 text-center">
        <div className="meta mb-3">Hoy</div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] mb-4 text-t1">
          {workout.isRest ? "Día de descanso" : "Sin ejercicios programados"}
        </h1>
        <p className="body text-base mb-8">
          {workout.isRest
            ? "Aprovecha para recuperarte. Movilidad ligera y buena hidratación."
            : "Tu plan no tiene ejercicios programados para hoy. Añádelos en Mi Split."}
        </p>
        <Link href="/dashboard" className="btn-ghost inline-flex">Volver al inicio</Link>
      </main>
    );
  }

  return <WorkoutScreen initial={workout} />;
}
