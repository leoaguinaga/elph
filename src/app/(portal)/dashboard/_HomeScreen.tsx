"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Sparkline } from "@/components/Sparkline";
import { addWeightEntry } from "@/server/actions/weight";
import type { DashboardData } from "@/server/db/dashboard";

function fmtTime(s: number) {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function todayLabel() {
  return new Date().toLocaleDateString("es", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  });
}

interface HomeScreenProps {
  userName:  string;
  dashboard: DashboardData;
}

export function HomeScreen({ userName, dashboard }: HomeScreenProps) {
  const { todaysWorkout, weekStrip, weightHistory, lastPR, tipContent, weekNumber } = dashboard;

  const [running,   setRunning]   = useState(false);
  const [completed, setCompleted] = useState(false);
  const [elapsed,   setElapsed]   = useState(0);

  // Weight input state
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightValue,     setWeightValue]     = useState("");
  const [isPending,       startTransition]    = useTransition();

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const firstName    = userName.split(" ")[0];
  const greeting     = completed ? `Buen trabajo, ${firstName}.`
                     : running   ? "Sesión en curso"
                     :             `Buenos días, ${firstName}.`;
  const subGreeting  = completed
    ? "Ya completaste tu sesión de hoy."
    : running
      ? <span className="num text-accent">{fmtTime(elapsed)}</span>
      : todaysWorkout && !todaysWorkout.isRest
        ? `Hoy tienes ${todaysWorkout.sessionName} programado.`
        : "Sin entrenamiento programado para hoy.";

  const activeHasSession = !!todaysWorkout?.activeSession;
  const lastWeight       = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : null;
  const firstWeight      = weightHistory.length > 0 ? weightHistory[0].weight : null;
  const weightDelta      = lastWeight != null && firstWeight != null ? +(lastWeight - firstWeight).toFixed(1) : null;
  const weightSparkData  = weightHistory.map((e) => e.weight);

  const handleAddWeight = () => {
    const w = parseFloat(weightValue);
    if (isNaN(w) || w <= 0) return;
    startTransition(async () => {
      await addWeightEntry({ weight: w });
      setWeightValue("");
      setShowWeightInput(false);
    });
  };

  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24">
      <div className="grid gap-10 items-start" style={{ gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)" }}>

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div>
          {/* Greeting */}
          <div className="mb-8">
            <div className="meta mb-2.5 capitalize">{todayLabel()}</div>
            <h1 className="text-[32px] font-semibold tracking-[-0.02em] mb-2 text-t1">{greeting}</h1>
            <div className="text-base text-t2">{subGreeting}</div>
          </div>

          {/* Today session card */}
          {todaysWorkout && !todaysWorkout.isRest && todaysWorkout.exercises.length > 0 ? (
            <TodayCard
              workout={todaysWorkout}
              running={running}
              completed={completed}
              elapsed={elapsed}
              hasActiveSession={activeHasSession}
              onStart={() => { setRunning(true); setElapsed(0); }}
              onContinue={() => setRunning(true)}
            />
          ) : (
            <div className="card p-7 text-center py-12">
              <div className="body text-t3 mb-4">
                {!todaysWorkout
                  ? "No tienes un plan activo."
                  : todaysWorkout.isRest
                    ? "Día de descanso — aprovecha para recuperarte."
                    : "Sin ejercicios programados para hoy."}
              </div>
              <Link href="/split" className="link-accent text-[13px]">Ver mi rutina →</Link>
            </div>
          )}

          {/* Week strip */}
          <div className="mt-10">
            <div className="flex justify-between items-baseline mb-4">
              <div className="label-section">Esta semana</div>
              <div className="meta num">Semana {weekNumber}</div>
            </div>
            <div className="flex gap-3.5 mb-3.5">
              {weekStrip.map((d, i) => {
                const filled = d.isTraining && d.done;
                return (
                  <div
                    key={i}
                    title={`${d.dayName}: ${d.label}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{
                        background: filled ? "var(--success)" : "transparent",
                        border: filled ? "none" : `1.5px solid ${d.isToday ? "var(--accent)" : "var(--border)"}`,
                        color: filled ? "#0F1419" : d.isToday ? "var(--accent)" : !d.isTraining ? "var(--text-3)" : "var(--text-2)",
                      }}
                    >
                      {filled ? <Icon name="check" size={14} color="#0F1419" /> : d.letter}
                    </div>
                    <span className="text-[10px] tracking-[0.04em]" style={{ color: d.isToday ? "var(--accent)" : "var(--text-3)" }}>
                      {d.isToday ? "HOY" : !d.isTraining ? "·" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="body text-[13px]">
              <span className="text-t1 font-medium num">
                {weekStrip.filter((d) => d.isTraining && d.done).length} de {weekStrip.filter((d) => d.isTraining).length}
              </span>{" "}
              sesiones completadas esta semana
            </div>
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3.5">

          {/* Weight card */}
          <div className="card p-[22px]">
            <div className="flex justify-between items-start mb-2.5">
              <div className="label-eyebrow">Peso</div>
              <button
                onClick={() => setShowWeightInput((v) => !v)}
                className="meta text-accent hover:text-t1 transition-colors text-[11px] tracking-[0.04em]"
              >
                {showWeightInput ? "Cancelar" : "+ Registrar"}
              </button>
            </div>

            {showWeightInput ? (
              <div className="flex gap-2 items-center mb-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="ej. 78.5"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-t1 outline-none focus:border-accent"
                  onKeyDown={(e) => e.key === "Enter" && handleAddWeight()}
                  autoFocus
                />
                <span className="text-sm text-t2">kg</span>
                <button
                  onClick={handleAddWeight}
                  disabled={isPending}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  {isPending ? "…" : "Guardar"}
                </button>
              </div>
            ) : lastWeight != null ? (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="num text-[32px] font-semibold tracking-[-0.02em] text-t1">{lastWeight}</span>
                  <span className="text-sm text-t2">kg</span>
                </div>
                {weightDelta != null && (
                  <div className={`text-xs font-medium mb-4 ${weightDelta <= 0 ? "text-success" : "text-warn"}`}>
                    <span className="num">{weightDelta > 0 ? "+" : ""}{weightDelta} kg</span>{" "}
                    <span className="text-t3">desde hace 30 días</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-t3 mb-4">Sin registros aún.</div>
            )}

            {weightSparkData.length > 1 && (
              <Sparkline data={weightSparkData} width={260} height={48} />
            )}
          </div>

          {/* Next session */}
          {todaysWorkout && (
            <div className="card p-[22px]">
              <div className="label-eyebrow mb-2.5">Sesión de hoy</div>
              <div className="text-base font-semibold text-t1 mb-1">
                {todaysWorkout.isRest ? "Día de descanso" : todaysWorkout.sessionName}
              </div>
              {!todaysWorkout.isRest && (
                <div className="body text-[13px]">
                  {todaysWorkout.exercises.length} ejercicios
                </div>
              )}
            </div>
          )}

          {/* Last PR */}
          {lastPR && (
            <div className="card p-[22px]">
              <div className="flex justify-between items-start mb-2.5">
                <div className="label-eyebrow">Último PR</div>
                <span className="bg-[rgba(224,123,74,0.12)] text-warn text-[10px] font-bold tracking-[0.08em] px-[7px] py-1 rounded">PR</span>
              </div>
              <div className="text-base font-semibold text-t1 mb-1">
                {lastPR.exerciseName} · <span className="num">{lastPR.weightKg} kg</span>
              </div>
              <div className="body text-[13px]">
                Hace {lastPR.daysAgo === 0 ? "hoy" : `${lastPR.daysAgo} día${lastPR.daysAgo !== 1 ? "s" : ""}`}
                {lastPR.deltaKg != null && lastPR.deltaKg > 0 ? ` · +${lastPR.deltaKg} kg vs anterior` : ""}
              </div>
            </div>
          )}

          {/* Tip */}
          {tipContent && (
            <div className="bg-surface border-l-[3px] border-accent rounded-md px-[18px] py-4">
              <div className="label-eyebrow mb-2">Para hoy</div>
              <div className="text-sm leading-relaxed text-t1">{tipContent}</div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

// ─── TodayCard ────────────────────────────────────────────────────────────────

import type { TodaysWorkout } from "@/server/db/sessions";

function TodayCard({
  workout, running, completed, elapsed, hasActiveSession, onStart, onContinue,
}: {
  workout:          TodaysWorkout;
  running:          boolean;
  completed:        boolean;
  elapsed:          number;
  hasActiveSession: boolean;
  onStart:          () => void;
  onContinue:       () => void;
}) {
  const exercises = workout.exercises;
  const total     = exercises.length;
  const shown     = exercises.slice(0, 5);

  return (
    <div className="card p-7">
      <div className="label-eyebrow mb-2.5">Sesión de hoy</div>
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] m-0 text-t1">{workout.sessionName}</h2>
        <div className="meta num">~{Math.round(exercises.reduce((a, e) => a + e.targetSets * (e.restSeconds + 30), 0) / 60)} min</div>
      </div>
      <div className="flex gap-1.5 mb-[22px] flex-wrap">
        {[...new Set(exercises.map((e) => e.muscle))].map((m) => (
          <span key={m} className="chip">{m}</span>
        ))}
      </div>

      <ul className="list-none p-0 mb-6">
        {shown.map((ex, i) => (
          <li
            key={ex.exerciseId}
            className="flex items-center justify-between py-3"
            style={{ borderBottom: i < shown.length - 1 ? "1px solid rgba(44,48,58,0.5)" : "none" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center"
                style={{ border: "1.5px solid var(--border)", background: "transparent" }}>
              </div>
              <span className="text-sm text-t1">{ex.name}</span>
            </div>
            <span className="num text-[13px] text-t2">{ex.targetSets} × {ex.targetReps}</span>
          </li>
        ))}
        {total > 5 && (
          <li className="pt-3 text-[13px] text-t3">+ {total - 5} ejercicio{total - 5 !== 1 ? "s" : ""} más</li>
        )}
      </ul>

      <div className="flex items-center gap-5">
        <Link
          href="/workout"
          onClick={hasActiveSession || running ? onContinue : onStart}
          className="btn-primary gap-2"
        >
          <Icon name={hasActiveSession || running ? "arrow" : "play"} size={14} color="#fff" />
          {hasActiveSession || running ? "Continuar sesión" : "Iniciar sesión"}
        </Link>
        <Link href="/split" className="link-accent p-0 text-[13px]">Ver rutina completa →</Link>
      </div>
    </div>
  );
}
