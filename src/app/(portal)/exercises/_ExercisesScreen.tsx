"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import type { ExerciseListItem } from "@/server/db/exercises";
import { createCustomExercise, deleteCustomExercise } from "@/server/actions/exercises";

const FILTERS = ["Todos", "Pecho", "Espalda", "Pierna", "Hombros", "Brazos"];

export function ExercisesScreen({ exercises }: { exercises: ExerciseListItem[] }) {
  const [q, setQ]         = useState("");
  const [filter, setFilter] = useState("Todos");
  const [showNew, setShowNew] = useState(false);

  const filtered = exercises.filter((e) => {
    const okQ = e.name.toLowerCase().includes(q.toLowerCase());
    const okF =
      filter === "Todos" ||
      (filter === "Brazos" && (e.muscle === "Bíceps" || e.muscle === "Tríceps")) ||
      (filter === "Pierna" && ["Pierna", "Cuádriceps", "Femoral", "Glúteo", "Gemelos"].includes(e.muscle)) ||
      e.muscle === filter;
    return okQ && okF;
  });

  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24">
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="meta mb-2">Tu biblioteca</div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] m-0 text-t1">Ejercicios</h1>
          <div className="body mt-2 text-sm">
            {exercises.length} ejercicios disponibles · ordenados por uso
          </div>
        </div>
        <button className="btn-primary gap-1.5" onClick={() => setShowNew(true)}>
          <Icon name="plus" size={14} color="#fff" />
          Añadir ejercicio
        </button>
      </div>

      <div className="flex items-center gap-3.5 mb-[22px]">
        <div className="flex items-center gap-2 bg-surface rounded-lg px-3.5 py-2.5 border border-border flex-1 max-w-[360px]">
          <Icon name="search" size={14} color="var(--text-3)" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar ejercicio…"
            className="bg-transparent border-none outline-none text-t1 text-sm w-full"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "px-3.5 py-2 rounded-md text-[13px] transition-all duration-150",
                filter === f ? "bg-surface-2 text-t1 font-medium" : "bg-transparent text-t2 font-normal",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div
          className="grid px-6 py-3.5 text-[11px] text-t3 tracking-[0.08em] uppercase font-semibold border-b border-border"
          style={{ gridTemplateColumns: "2.2fr 1fr 1fr 0.8fr 1fr 24px" }}
        >
          <span>Ejercicio</span>
          <span>Músculo</span>
          <span>Equipo</span>
          <span className="text-right">Series</span>
          <span className="text-right">PR</span>
          <span />
        </div>
        {filtered.map((ex, i) => (
          <ExRow key={ex.id} ex={ex} isLast={i === filtered.length - 1} />
        ))}
        {filtered.length === 0 && (
          <div className="p-12 text-center text-t3 text-sm">
            {q ? <>Sin resultados para &ldquo;{q}&rdquo;.</> : "Sin ejercicios para este filtro."}
          </div>
        )}
      </div>

      {showNew && <NewExerciseModal onClose={() => setShowNew(false)} />}
    </main>
  );
}

function ExRow({ ex, isLast }: { ex: ExerciseListItem; isLast: boolean }) {
  const [hover, setHover] = useState(false);
  const [pending, start] = useTransition();

  const onDelete = () => {
    if (!ex.isCustom) return;
    if (!confirm(`¿Eliminar "${ex.name}"? Se borrará el ejercicio y todos sus registros.`)) return;
    start(async () => {
      try {
        await deleteCustomExercise(ex.id);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="grid px-6 py-4 items-center transition-colors duration-150"
      style={{
        gridTemplateColumns: "2.2fr 1fr 1fr 0.8fr 1fr 24px",
        background:  hover ? "#1F232B" : "transparent",
        borderBottom: isLast ? "none" : "1px solid rgba(44,48,58,0.5)",
        opacity:     pending ? 0.5 : 1,
      }}
    >
      <span className="text-sm text-t1 font-medium flex items-center gap-2">
        {ex.name}
        {ex.isCustom && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Custom</span>
        )}
      </span>
      <span className="text-[13px] text-t2">{ex.muscle}</span>
      <span className="text-[13px] text-t2">{ex.equipment}</span>
      <span className="num text-[13px] text-t2 text-right">{ex.setsCount}</span>
      <span className="num text-[13px] text-t1 text-right font-medium">
        {ex.prKg !== null ? `${ex.prKg} kg` : "—"}
      </span>
      {ex.isCustom ? (
        <button onClick={onDelete} disabled={pending} className="bg-transparent p-0" title="Eliminar">
          <Icon name="chevron-r" size={14} color="var(--text-3)" />
        </button>
      ) : (
        <Icon name="chevron-r" size={14} color="var(--text-3)" />
      )}
    </div>
  );
}

function NewExerciseModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("Pecho");
  const [equipment, setEquipment] = useState("Barra");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        await createCustomExercise({ name, muscle, equipment });
        onClose();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/60"
      onClick={onClose}
    >
      <div
        className="card w-[420px] p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-t1 mb-1">Nuevo ejercicio</h2>
        <p className="meta mb-6">Se añadirá a tu biblioteca personal.</p>

        {error && (
          <div className="bg-[rgba(224,123,74,0.10)] border border-[rgba(224,123,74,0.3)] rounded-lg px-3.5 py-3 mb-4 text-sm text-warn">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <label className="block text-[11px] text-t3 tracking-[0.04em] uppercase font-semibold mb-2">Nombre</label>
          <input
            required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Press inclinado con polea baja"
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-t1 text-sm outline-none mb-4 focus:border-accent transition-colors"
          />

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="block text-[11px] text-t3 tracking-[0.04em] uppercase font-semibold mb-2">Músculo</label>
              <select
                value={muscle} onChange={(e) => setMuscle(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-t1 text-sm outline-none focus:border-accent transition-colors"
              >
                {["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Cuádriceps", "Femoral", "Glúteo", "Gemelos", "Core"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-t3 tracking-[0.04em] uppercase font-semibold mb-2">Equipo</label>
              <select
                value={equipment} onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-t1 text-sm outline-none focus:border-accent transition-colors"
              >
                {["Barra", "Mancuernas", "Barra Z", "Polea", "Máquina", "Peso corp.", "Banda"].map((eq) => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Guardando…" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
