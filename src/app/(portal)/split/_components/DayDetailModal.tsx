"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDayDetails } from "@/server/actions/plans";
import { startSession } from "@/server/actions/sessions";

interface DayDetailModalProps {
  dayId: string | null;
  onClose: () => void;
}

type DayDetails = {
  id: string;
  dayName: string;
  sessionName: string;
  isRest: boolean;
  muscles: string[];
  exercises: {
    id: string;
    name: string;
    muscle: string;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
  }[];
  tip: string;
};

function formatRest(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function DayDetailModal({ dayId, onClose }: DayDetailModalProps) {
  const router = useRouter();
  const [details, setDetails] = useState<DayDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingStart, startSessionTransition] = useTransition();

  useEffect(() => {
    if (!dayId) return;

    setLoading(true);
    setError(null);
    getDayDetails(dayId)
      .then((data) => {
        setDetails(data);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar los detalles.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dayId]);

  if (!dayId) return null;

  const handleStartSession = () => {
    startSessionTransition(async () => {
      try {
        await startSession(dayId);
        router.push("/workout");
        onClose();
      } catch (err) {
        setError("Error al iniciar sesión de entrenamiento");
      }
    });
  };

  // Calculate stats
  const totalExercises = details?.exercises.length || 0;
  const totalSets =
    details?.exercises.reduce((sum, e) => sum + e.targetSets, 0) || 0;
  const totalSeconds =
    details?.exercises.reduce(
      (sum, e) => sum + e.targetSets * (e.restSeconds + 30),
      0,
    ) || 0;
  const estimatedMin = Math.round(totalSeconds / 60) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[overlayIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-[850px] max-h-[92vh] overflow-y-auto border border-white/5 bg-[#14161D] p-8 shadow-2xl flex flex-col animate-[panelIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-t2 font-medium">
              Cargando detalles de rutina...
            </span>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="bg-[rgba(224,123,74,0.10)] border border-[rgba(224,123,74,0.3)] rounded-lg px-4 py-3 mb-6 text-sm text-warn inline-block max-w-md">
              {error}
            </div>
            <div>
              <button onClick={onClose} className="btn-ghost text-xs">
                Cerrar
              </button>
            </div>
          </div>
        ) : details ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="label-eyebrow text-t3 tracking-wider text-[11px]">
                  DETALLE DE RUTINA · ~{estimatedMin} MIN
                </span>
                <h2 className="text-3xl font-extrabold text-t1 mt-1 tracking-tight">
                  {details.sessionName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartSession}
                  disabled={pendingStart || totalExercises === 0}
                  className="btn-primary"
                >
                  {pendingStart ? "Iniciando..." : "Iniciar sesión"}
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#23272F]/50 hover:bg-[#23272F] text-t2 hover:text-t1 p-2.5 rounded-lg border border-white/5 transition-all"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chips */}
            {details.muscles.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6">
                {details.muscles.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-semibold px-3 py-1 bg-[#1C1F26] border border-border text-t2 rounded-md"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1C1F26]/75 border border-white/5 rounded-xl p-5">
                <span className="block text-[11px] font-bold text-t3 tracking-wider uppercase mb-1">
                  EJERCICIOS
                </span>
                <span className="text-3xl font-extrabold text-t1 num">
                  {totalExercises}
                </span>
              </div>
              <div className="bg-[#1C1F26]/75 border border-white/5 rounded-xl p-5">
                <span className="block text-[11px] font-bold text-t3 tracking-wider uppercase mb-1">
                  SERIES TOTALES
                </span>
                <span className="text-3xl font-extrabold text-t1 num">
                  {totalSets}
                </span>
              </div>
              <div className="bg-[#1C1F26]/75 border border-white/5 rounded-xl p-5">
                <span className="block text-[11px] font-bold text-t3 tracking-wider uppercase mb-1">
                  TIEMPO ESTIMADO
                </span>
                <span className="text-3xl font-extrabold text-t1 num">
                  ~{estimatedMin} min
                </span>
              </div>
            </div>

            {/* Notes Section with Accent Border */}
            <div className="border-l-[3px] border-[#5B8EF0] bg-[#1C1F26]/40 rounded-r-xl p-4.5 mb-8">
              <span className="block text-[10px] font-bold text-t3 tracking-widest uppercase mb-1">
                NOTAS DE LA RUTINA
              </span>
              <p className="text-t2 text-[13px] leading-relaxed">
                {details.tip}
              </p>
            </div>

            {/* Exercises List Table */}
            <div>
              <h3 className="text-xs font-bold text-t2 tracking-widest uppercase mb-3">
                LISTA DE EJERCICIOS
              </h3>
              <div className="bg-[#1C1F26]/30 border border-white/5 rounded-xl overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#2C303A]/50 bg-[#1C1F26]/50 text-t3 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Ejercicio</th>
                      <th className="py-3 px-4 w-24 text-center">Series</th>
                      <th className="py-3 px-4 w-24 text-center">Reps</th>
                      <th className="py-3 px-4 w-28 text-right">Descanso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.exercises.map((e, index) => (
                      <tr
                        key={e.id}
                        className="border-b border-[#2C303A]/30 last:border-0 hover:bg-[#23272F]/20 transition-colors"
                      >
                        <td className="py-4 px-4 text-center font-bold text-t3 num">
                          {index + 1}
                        </td>
                        <td className="py-4 px-4 font-semibold text-t1">
                          <div>{e.name}</div>
                          {index === 0 &&
                            e.name.toLowerCase().includes("banca") && (
                              <span className="text-[10px] text-t3 font-normal mt-0.5 block">
                                Calentar con 50% x 8
                              </span>
                            )}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-t1 num">
                          {e.targetSets}
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-t1 num">
                          {e.targetReps}
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-t2 num">
                          {formatRest(e.restSeconds)}
                        </td>
                      </tr>
                    ))}
                    {totalExercises === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-t3 italic"
                        >
                          No hay ejercicios asignados a este día.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
