"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { TodaysWorkout } from "@/server/db/sessions";
import {
  startSession, finishSession, logSet, updateSessionNotes, deleteSet
} from "@/server/actions/sessions";

// ── Helpers ────────────────────────────────────────────────────────────────

type SetRow = { kg: number; reps: number; rpe: number | ""; done: boolean };
type ExData = { notes: string; sets: SetRow[] };

const pad      = (n: number) => String(n).padStart(2, "0");
const fmtClock = (s: number) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`; };
const fmtRest  = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

/** Hidrata el estado inicial a partir del workout + sets ya logueados. */
function buildInitialState(initial: TodaysWorkout): ExData[] {
  const activeSets = initial.activeSession?.sets ?? [];
  return initial.exercises.map((ex) => {
    const setsForEx = activeSets.filter((s) => s.exerciseId === ex.exerciseId);
    const totalSets = Math.max(ex.targetSets, setsForEx.length);
    return {
      notes: "", // notas viven a nivel sesión, no aquí
      sets: Array.from({ length: totalSets }, (_, i) => {
        const existing = setsForEx.find((s) => s.setNumber === i + 1);
        if (existing) {
          return {
            kg:   existing.weight,
            reps: existing.reps,
            rpe:  existing.rpe ?? "",
            done: existing.done,
          };
        }
        return {
          kg:   ex.suggested.kg,
          reps: ex.suggested.reps,
          rpe:  "" as const,
          done: false,
        };
      }),
    };
  });
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkoutScreen({ initial }: { initial: TodaysWorkout }) {
  const router = useRouter();

  const [data, setData]     = useState<ExData[]>(() => buildInitialState(initial));
  const [exIdx, setExIdx]   = useState(0);
  const [elapsed, setElapsed] = useState(() => {
    if (initial.activeSession) {
      return Math.floor((Date.now() - new Date(initial.activeSession.startedAt).getTime()) / 1000);
    }
    return 0;
  });
  const [sessionId, setSessionId] = useState<string | null>(initial.activeSession?.id ?? null);
  const [sessionNotes, setSessionNotes] = useState<string>(initial.activeSession?.notes ?? "");
  const [restTarget, setRestTarget] = useState(0);
  const [restElapsed, setRestElapsed] = useState(0);
  const [finishing, startFinish] = useTransition();

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!restTarget) return;
    const t = setInterval(() => setRestElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [restTarget]);

  // Garantiza que existe una sesión iniciada antes de loggear sets.
  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId;
    const s = await startSession(initial.dayId);
    setSessionId(s.id);
    return s.id;
  };

  const startRest  = (secs: number) => { setRestTarget(secs); setRestElapsed(0); };
  const adjustRest = (d: number)    => setRestTarget((t) => Math.max(15, t + d));
  const skipRest   = ()             => { setRestTarget(0); setRestElapsed(0); };

  const onLogSet = async (exVisualIdx: number, setIdx: number, payload: SetRow) => {
    const ex = initial.exercises[exVisualIdx];
    const sid = await ensureSession();
    await logSet({
      sessionId:  sid,
      exerciseId: ex.exerciseId,
      setNumber:  setIdx + 1,
      weight:     payload.kg,
      reps:       payload.reps,
      rpe:        payload.rpe === "" ? null : payload.rpe,
      done:       payload.done,
    });
  };

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishStep, setFinishStep] = useState(1);

  const onFinish = () => {
    if (!sessionId) {
      router.push("/dashboard");
      return;
    }
    setFinishStep(1);
    setShowFinishModal(true);
  };

  const confirmFinish = () => {
    if (!sessionId) return;
    startFinish(async () => {
      await finishSession(sessionId, sessionNotes || undefined);
      setShowFinishModal(false);
      router.push("/dashboard");
    });
  };

  const handleTagClick = (tag: string) => {
    setSessionNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return prev;
      return `${trimmed}, ${tag}`;
    });
    if (sessionId) {
      const updatedNotes = sessionNotes ? `${sessionNotes}, ${tag}` : tag;
      updateSessionNotes(sessionId, updatedNotes).catch(console.error);
    }
  };

  return (
    <div>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[rgba(17,19,24,0.92)] backdrop-blur-[12px] border-b border-border">
        <div className="max-w-[1280px] mx-auto px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="btn-ghost px-3 py-2 gap-1.5">
              <span className="inline-flex" style={{ transform: "scaleX(-1)" }}>
                <Icon name="chevron-r" size={14} color="var(--text-2)" />
              </span>
              Salir
            </button>
            <div className="w-px h-5 bg-border" />
            <div>
              <div className="label-eyebrow mb-0.5">Sesión en curso</div>
              <div className="text-[15px] font-semibold text-t1 tracking-[-0.01em]">{initial.sessionName}</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[rgba(91,142,240,0.10)] rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" style={{ animation: "pulse 1.6s infinite" }} />
              <span className="num text-sm text-accent font-semibold">{fmtClock(elapsed)}</span>
            </div>
            <button onClick={onFinish} disabled={finishing} className="btn-primary px-[18px] py-2.5">
              {finishing ? "Cerrando…" : "Finalizar sesión"}
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-16">
        <div className="grid gap-8 items-start" style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)" }}>
          <ExercisePanel
            exIdx={exIdx} data={data} setData={setData}
            initial={initial}
            sessionNotes={sessionNotes}
            setSessionNotes={(n) => {
              setSessionNotes(n);
              if (sessionId) updateSessionNotes(sessionId, n).catch(console.error);
            }}
            onPrev={() => setExIdx((i) => Math.max(0, i - 1))}
            onNext={() => setExIdx((i) => Math.min(initial.exercises.length - 1, i + 1))}
            onStartRest={startRest}
            onLogSet={onLogSet}
            onDeleteSet={async (setIdx) => {
              if (sessionId) {
                const ex = initial.exercises[exIdx];
                await deleteSet(sessionId, ex.exerciseId, setIdx + 1);
              }
            }}
          />
          <div className="sticky flex flex-col gap-3.5" style={{ top: 88 }}>
            {restTarget > 0
              ? <RestTimer seconds={restElapsed} target={restTarget} onAdjust={adjustRest} onSkip={skipRest} />
              : (
                <div className="card p-[22px] text-center">
                  <div className="label-eyebrow mb-2">Descanso</div>
                  <div className="text-sm text-t2">Marca una serie para iniciar el cronómetro.</div>
                </div>
              )
            }
            <ExerciseList exercises={initial.exercises} data={data} activeIdx={exIdx} onJump={setExIdx} />
          </div>
        </div>
      </main>

      {/* Finish Session Custom Modal */}
      {showFinishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[overlayIn_0.2s_ease-out]"
          onClick={() => !finishing && setShowFinishModal(false)}
        >
          <div
            className="card w-full max-w-[460px] border border-white/5 bg-[#1C1F26] p-8 shadow-2xl flex flex-col animate-[panelIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {finishStep === 1 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-t1 mb-2">¿Finalizar entrenamiento?</h3>
                  <p className="text-sm text-t2 leading-relaxed">
                    ¿Estás seguro de que quieres dar por terminada la sesión de entrenamiento actual?
                  </p>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowFinishModal(false)}
                    className="btn-ghost text-xs py-2.5 px-4.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinishStep(2)}
                    className="bg-[#5B8EF0] hover:bg-[#6E9CF3] text-white text-xs font-semibold py-2.5 px-5 rounded-lg transition-all"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-t1 mb-2">Motivo o Notas</h3>
                  <p className="text-xs text-t3 mb-4 leading-relaxed">
                    Puedes agregar notas sobre tu rendimiento o seleccionar un motivo frecuente de término anticipado.
                  </p>
                </div>
                <div className="space-y-3.5">
                  <textarea
                    rows={3}
                    placeholder="Escribe alguna nota sobre la sesión..."
                    value={sessionNotes}
                    onChange={(e) => {
                      setSessionNotes(e.target.value);
                      if (sessionId) updateSessionNotes(sessionId, e.target.value).catch(console.error);
                    }}
                    className="w-full bg-[#111318] text-t1 border border-border rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-accent resize-none"
                  />
                  <div>
                    <span className="block text-[10px] text-t3 font-bold uppercase tracking-wider mb-2">
                      Motivos frecuentes (haz clic):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Falta de tiempo",
                        "Poca energía",
                        "Lesión",
                        "Gimnasio lleno",
                        "Completado",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="text-[11px] px-2.5 py-1.5 rounded bg-surface-2 border border-border text-t2 hover:text-t1 hover:border-accent/40 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
                  <button
                    type="button"
                    disabled={finishing}
                    onClick={() => setFinishStep(1)}
                    className="btn-ghost text-xs py-2.5 px-4"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    disabled={finishing}
                    onClick={confirmFinish}
                    className="bg-[#5B8EF0] hover:bg-[#6E9CF3] text-white text-xs font-semibold py-2.5 px-5 rounded-lg transition-all"
                  >
                    {finishing ? "Guardando..." : "Guardar y Finalizar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ExercisePanel({
  exIdx, data, setData, initial, sessionNotes, setSessionNotes,
  onPrev, onNext, onStartRest, onLogSet, onDeleteSet,
}: {
  exIdx: number; data: ExData[]; setData: React.Dispatch<React.SetStateAction<ExData[]>>;
  initial: TodaysWorkout;
  sessionNotes: string; setSessionNotes: (n: string) => void;
  onPrev: () => void; onNext: () => void;
  onStartRest: (s: number) => void;
  onLogSet: (exVisualIdx: number, setIdx: number, payload: SetRow) => Promise<void>;
  onDeleteSet: (setIdx: number) => Promise<void>;
}) {
  const ex = initial.exercises[exIdx];
  const exData = data[exIdx];
  const done = exData.sets.filter((s) => s.done).length;
  const nextSetIdx = exData.sets.findIndex((s) => !s.done);
  const debounceRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const updateSet = (i: number, newSet: SetRow, persist: boolean) => {
    setData((d) => d.map((dd, di) => di === exIdx
      ? { ...dd, sets: dd.sets.map((s, si) => si === i ? newSet : s) }
      : dd));
    if (persist) {
      // Debounce las escrituras (evitar spam cuando se toca el stepper)
      const existing = debounceRefs.current.get(i);
      if (existing) clearTimeout(existing);
      debounceRefs.current.set(i, setTimeout(() => {
        onLogSet(exIdx, i, newSet).catch(console.error);
      }, 400));
    }
  };

  const toggleDone = async (i: number) => {
    const wasDone = exData.sets[i].done;
    const newSet  = { ...exData.sets[i], done: !wasDone };
    // El toggle se persiste inmediatamente (sin debounce)
    setData((d) => d.map((dd, di) => di === exIdx
      ? { ...dd, sets: dd.sets.map((s, si) => si === i ? newSet : s) }
      : dd));
    try {
      await onLogSet(exIdx, i, newSet);
    } catch (err) {
      console.error(err);
      // revertir si falla
      setData((d) => d.map((dd, di) => di === exIdx
        ? { ...dd, sets: dd.sets.map((s, si) => si === i ? { ...newSet, done: wasDone } : s) }
        : dd));
      alert("No se pudo guardar la serie. Reintenta.");
      return;
    }
    if (!wasDone) onStartRest(ex.restSeconds);
  };

  const addSet = () => {
    const last = exData.sets[exData.sets.length - 1];
    setData((d) => d.map((dd, di) => di === exIdx
      ? {
          ...dd,
          sets: [...dd.sets, {
            kg:   last?.kg   ?? ex.suggested.kg,
            reps: last?.reps ?? ex.suggested.reps,
            rpe:  "" as const,
            done: false,
          }],
        }
      : dd));
  };

  const removeSet = async () => {
    if (exData.sets.length <= 1) return;
    const targetSetIdx = exData.sets.length - 1;
    setData((d) => d.map((dd, di) => di === exIdx
      ? {
          ...dd,
          sets: dd.sets.filter((_, idx) => idx !== targetSetIdx),
        }
      : dd));
    try {
      await onDeleteSet(targetSetIdx);
    } catch (err) {
      console.error("Error al eliminar la serie del servidor:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="label-eyebrow mb-2">Ejercicio {exIdx + 1} de {initial.exercises.length}</div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2.5 text-t1">{ex.name}</h2>
          <div className="flex gap-1.5">
            <span className="chip">{ex.muscle}</span>
            <span className="chip">{ex.equipment}</span>
            <span className="chip">{ex.targetSets} × {ex.targetReps}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="meta mb-1">Progreso</div>
          <div className="num text-[22px] font-semibold" style={{ color: done === exData.sets.length ? "var(--success)" : "var(--text-1)" }}>
            {done} <span className="text-t3 font-normal">/ {exData.sets.length}</span>
          </div>
        </div>
      </div>

      {/* Sets table */}
      <div className="card mb-[18px]" style={{ padding: 6 }}>
        <div className="grid gap-3 px-3.5 py-2.5 text-[11px] text-t3 tracking-[0.06em] uppercase font-semibold"
          style={{ gridTemplateColumns: "32px 110px 1fr 1fr 88px 48px" }}>
          <span className="text-center">#</span>
          <span>Anterior</span>
          <span className="text-center">Peso (kg)</span>
          <span className="text-center">Reps</span>
          <span className="text-center">RPE</span>
          <span className="text-center">✓</span>
        </div>
        <div className="flex flex-col gap-1">
          {exData.sets.map((s, i) => (
            <SetRowComp
              key={i} idx={i} set={s} prev={ex.previous[i]}
              onChange={(ns) => updateSet(i, ns, true)}
              onDone={() => toggleDone(i)}
              isNext={i === nextSetIdx}
            />
          ))}
        </div>
        <div className="px-3.5 py-2 pb-1.5 flex gap-4">
          <button onClick={addSet} className="text-t2 text-[13px] py-1.5 inline-flex items-center gap-1.5 cursor-pointer">
            <Icon name="plus" size={12} color="var(--text-2)" />
            Añadir serie
          </button>
          {exData.sets.length > 1 && (
            <button onClick={removeSet} className="text-warn hover:text-warn/80 text-[13px] py-1.5 inline-flex items-center gap-1.5 cursor-pointer">
              <span className="font-semibold">-</span>
              Eliminar serie
            </button>
          )}
        </div>
      </div>

      {/* Previous session reference */}
      {ex.previous.length > 0 && (
        <div className="card mb-[22px]" style={{ padding: "16px 20px" }}>
          <div className="label-eyebrow mb-2.5">Sesión anterior</div>
          <div className="flex gap-4 flex-wrap">
            {ex.previous.map((p, i) => (
              <div key={i} className="text-[13px] text-t2">
                <span className="meta">S{p.setNumber}:</span>{" "}
                <span className="num text-t1">{p.weight} × {p.reps}</span>
                {p.rpe !== null && <span className="meta num"> · RPE {p.rpe}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes (a nivel sesión) */}
      <div className="mb-7">
        <label className="label-eyebrow block mb-2">Notas de la sesión</label>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Sensación, técnica, dolor o cualquier observación…"
          className="w-full min-h-[64px] resize-y bg-surface border border-border rounded-lg px-3.5 py-3 text-t1 text-sm outline-none leading-relaxed transition-colors duration-150 focus:border-accent"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button onClick={onPrev} disabled={exIdx === 0} className="btn-ghost"
          style={{ opacity: exIdx === 0 ? 0.3 : 1 }}>
          ← Anterior
        </button>
        <button onClick={onNext} disabled={exIdx === initial.exercises.length - 1} className="btn-primary"
          style={{ opacity: exIdx === initial.exercises.length - 1 ? 0.5 : 1 }}>
          Siguiente ejercicio →
        </button>
      </div>
    </div>
  );
}

function SetRowComp({ idx, set, prev, onChange, onDone, isNext }: {
  idx: number; set: SetRow; prev?: { setNumber: number; weight: number; reps: number; rpe: number | null };
  onChange: (s: SetRow) => void; onDone: () => void; isNext: boolean;
}) {
  const update = (k: keyof SetRow, v: SetRow[keyof SetRow]) => onChange({ ...set, [k]: v });
  return (
    <div className="grid gap-3 items-center px-3.5 py-2.5 rounded-md transition-colors duration-200"
      style={{
        gridTemplateColumns: "32px 110px 1fr 1fr 88px 48px",
        background: set.done ? "rgba(76,175,130,0.05)" : isNext ? "rgba(91,142,240,0.05)" : "transparent",
      }}>
      <span className="num text-sm font-semibold text-center"
        style={{ color: set.done ? "var(--text-3)" : isNext ? "var(--accent)" : "var(--text-2)" }}>
        {idx + 1}
      </span>
      <span className="num text-[13px] text-t3">{prev ? `${prev.weight} × ${prev.reps}` : "—"}</span>
      <Stepper value={set.kg}   onChange={(v) => update("kg",   v)} step={2.5} disabled={set.done} />
      <Stepper value={set.reps} onChange={(v) => update("reps", v)} step={1}   disabled={set.done} />
      <RpePill value={set.rpe}  onChange={(v) => update("rpe",  v)}            disabled={set.done} />
      <button onClick={onDone}
        className="w-9 h-[34px] rounded-md flex items-center justify-center cursor-pointer transition-colors duration-150"
        style={{ background: set.done ? "var(--success)" : isNext ? "var(--accent)" : "var(--surface-2)" }}>
        <Icon name="check" size={15} color={set.done ? "#0F1419" : isNext ? "#fff" : "var(--text-2)"} />
      </button>
    </div>
  );
}

function Stepper({ value, onChange, step, disabled }: {
  value: number; onChange: (v: number) => void; step: number; disabled: boolean;
}) {
  return (
    <div className="inline-flex items-center rounded-md overflow-hidden"
      style={{
        background: disabled ? "transparent" : "var(--surface-2)",
        border: `1px solid ${disabled ? "transparent" : "var(--border)"}`,
        opacity: disabled ? 0.55 : 1,
      }}>
      <button onClick={() => !disabled && onChange(Math.max(0, value - step))} disabled={disabled}
        className="w-7 h-[34px] text-t2 text-base font-medium bg-transparent"
        style={{ cursor: disabled ? "default" : "pointer" }}>
        −
      </button>
      <input type="text" value={value} disabled={disabled}
        onChange={(e) => { const v = parseFloat(e.target.value.replace(",", ".")); if (!isNaN(v)) onChange(v); }}
        className="num flex-1 min-w-0 bg-transparent border-none outline-none text-t1 text-center text-sm font-medium w-12" />
      <button onClick={() => !disabled && onChange(value + step)} disabled={disabled}
        className="w-7 h-[34px] text-t2 text-base font-medium bg-transparent"
        style={{ cursor: disabled ? "default" : "pointer" }}>
        +
      </button>
    </div>
  );
}

function RpePill({ value, onChange, disabled }: {
  value: number | ""; onChange: (v: number) => void; disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const options = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
  return (
    <div className="relative">
      <button onClick={() => !disabled && setOpen((o) => !o)} disabled={disabled}
        className="num h-[34px] px-2.5 rounded-md text-[13px] font-medium transition-colors"
        style={{
          minWidth: 56,
          background: value === "" ? "transparent" : "var(--surface-2)",
          border: `1px ${value === "" ? "dashed" : "solid"} ${value === "" ? "var(--border)" : "transparent"}`,
          color:   value === "" ? "var(--text-3)" : "var(--text-1)",
          cursor:  disabled ? "default" : "pointer",
          opacity: disabled ? 0.55 : 1,
        }}>
        {value === "" ? "RPE" : value}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-10 bg-surface border border-border rounded-lg p-1 grid grid-cols-3 gap-0.5 shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
          {options.map((o) => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }}
              className="num px-2.5 py-1.5 rounded text-[13px] cursor-pointer"
              style={{
                background: value === o ? "var(--accent)" : "transparent",
                color:      value === o ? "#fff"          : "var(--text-2)",
              }}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RestTimer({ seconds, target, onAdjust, onSkip }: {
  seconds: number; target: number; onAdjust: (d: number) => void; onSkip: () => void;
}) {
  const remaining = Math.max(0, target - seconds);
  const overtime  = seconds > target;
  const pct       = Math.min(1, seconds / target);
  return (
    <div className="card p-[22px] text-center">
      <div className="label-eyebrow mb-3.5"
        style={{ color: overtime ? "var(--warn)" : "var(--accent)" }}>
        {overtime ? "Descanso prolongado" : "Descanso"}
      </div>
      <div className="num text-[56px] font-semibold tracking-[-0.03em] leading-none"
        style={{ color: overtime ? "var(--warn)" : "var(--text-1)" }}>
        {fmtRest(overtime ? seconds - target : remaining)}
      </div>
      <div className="meta mt-2">objetivo {fmtRest(target)}</div>
      <div className="h-[3px] bg-surface-2 rounded-full my-[18px] mb-3.5 overflow-hidden">
        <div className="h-full transition-[width] duration-[0.4s] linear"
          style={{ width: `${pct * 100}%`, background: overtime ? "var(--warn)" : "var(--accent)" }} />
      </div>
      <div className="flex justify-center gap-1.5">
        {[{ label: "−15s", d: -15 }, { label: "+15s", d: 15 }].map(({ label, d }) => (
          <button key={label} onClick={() => onAdjust(d)} className="btn-ghost px-3 py-1.5 text-[13px]">
            {label}
          </button>
        ))}
        <button onClick={onSkip} className="btn-ghost px-3 py-1.5 text-[13px]">Saltar</button>
      </div>
    </div>
  );
}

function ExerciseList({
  exercises, data, activeIdx, onJump,
}: {
  exercises: TodaysWorkout["exercises"];
  data: ExData[]; activeIdx: number; onJump: (i: number) => void;
}) {
  return (
    <div className="card p-5">
      <div className="label-section mb-3.5">Ejercicios</div>
      {exercises.map((ex, i) => {
        const done    = data[i].sets.filter((s) => s.done).length;
        const total   = data[i].sets.length;
        const isActive = i === activeIdx;
        const allDone  = done === total;
        return (
          <button key={ex.dayExerciseId} onClick={() => onJump(i)}
            className="w-full flex items-center gap-3 px-2.5 py-3 rounded-md text-left cursor-pointer transition-colors duration-150"
            style={{ background: isActive ? "rgba(91,142,240,0.08)" : "transparent" }}>
            <div className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
              style={{
                background: allDone ? "var(--success)" : "transparent",
                border: allDone ? "none" : `1.5px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              }}>
              {allDone && <Icon name="check" size={11} color="#0F1419" />}
              {isActive && !allDone && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] overflow-hidden text-ellipsis whitespace-nowrap"
                style={{
                  color:      isActive ? "var(--text-1)" : allDone ? "var(--text-3)" : "var(--text-2)",
                  fontWeight: isActive ? 500 : 400,
                }}>
                {ex.name}
              </div>
            </div>
            <span className="num text-xs font-medium"
              style={{ color: allDone ? "var(--success)" : "var(--text-3)" }}>
              {done}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
