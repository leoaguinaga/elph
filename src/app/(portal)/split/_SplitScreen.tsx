"use client";

import { useState, useTransition } from "react";
import type { SplitDaySummary } from "@/server/db/plans";
import { NewPlanModal } from "./_components/NewPlanModal";
import { DayDetailModal } from "./_components/DayDetailModal";
import { EditPlanModal } from "./_components/EditPlanModal";
import { updatePlanInfo } from "@/server/actions/plans";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Plan = {
  id: string;
  name: string;
  goal: string;
  createdAt: Date;
  days: SplitDaySummary[];
};

const toMondayIdx = (jsDay: number) => (jsDay + 6) % 7;

export function SplitScreen({
  plan,
  todayWeekday,
}: {
  plan: Plan | null;
  todayWeekday: number;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(plan?.name || "");
  const [isPending, startTransition] = useTransition();

  if (!plan) {
    return (
      <>
        <EmptyState onOpenModal={() => setIsModalOpen(true)} />
        <NewPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  const todayIdx = toMondayIdx(todayWeekday);
  const weeksSinceStart =
    Math.floor(
      (Date.now() - new Date(plan.createdAt).getTime()) / (7 * 24 * 3600_000),
    ) + 1;
  const startedAt = new Date(plan.createdAt).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
  });

  const handleSaveName = () => {
    if (!name.trim() || name.trim() === plan.name) {
      setIsEditingName(false);
      setName(plan.name);
      return;
    }
    startTransition(async () => {
      await updatePlanInfo(plan.id, name, plan.goal);
      setIsEditingName(false);
    });
  };

  const handleGoalChange = (newGoal: string | null) => {
    if (!newGoal || newGoal === plan.goal) return;
    startTransition(async () => {
      await updatePlanInfo(plan.id, plan.name, newGoal);
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div className="flex-1">
          <div className="text-muted-foreground text-sm mb-2">Mi programación actual</div>
          {isEditingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="text-[28px] font-semibold bg-bg text-t1 border border-border focus:outline-none focus:border-none focus:underline underline-offset-6 w-full max-w-md"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditingName(true)}
              className="text-[28px] font-semibold m-0 text-t1 cursor-pointer hover:opacity-85 border-t3/50 hover:border-accent w-fit transition-all"
              title="Haz clic para editar nombre"
            >
              {plan.name}
            </h1>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap text-sm text-t2">
            <span className="text-xs font-semibold text-t3 uppercase tracking-wider">OBJETIVO:</span>
            <Select value={plan.goal} onValueChange={handleGoalChange}>
              <SelectTrigger className="inline-flex h-8 items-center border border-border bg-input/20 px-2.5 rounded-lg text-xs font-semibold text-accent hover:bg-input/40 transition-colors">
                <SelectValue placeholder="Selecciona objetivo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1F26] border border-border text-t1">
                <SelectItem value="Ganar masa muscular">Ganar masa muscular</SelectItem>
                <SelectItem value="Aumentar la fuerza">Aumentar la fuerza</SelectItem>
                <SelectItem value="Disminuir de peso">Disminuir de peso</SelectItem>
                <SelectItem value="Aumentar de peso">Aumentar de peso</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-t3">·</span>
            <span>Semana {weeksSinceStart}</span>
            <span className="text-t3">·</span>
            <span>Iniciada el {startedAt}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => plan ? setIsEditOpen(true) : setIsModalOpen(true)} className="btn-primary">
            {plan ? "Editar rutina" : "Nueva rutina"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.days.map((d, i) => (
          <DayCard
            key={d.id}
            d={d}
            isToday={i === todayIdx}
            onShowDetail={setSelectedDayId}
          />
        ))}
      </div>

      <NewPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DayDetailModal
        dayId={selectedDayId}
        onClose={() => setSelectedDayId(null)}
      />
      <EditPlanModal
        planId={plan.id}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </main>
  );
}

function DayCard({
  d,
  isToday,
  onShowDetail,
}: {
  d: SplitDaySummary;
  isToday: boolean;
  onShowDetail: (id: string) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="card p-6 transition-colors duration-200"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#1F232B" : "var(--surface)",
        opacity: d.isRest ? 0.65 : 1,
        borderTop: isToday ? "2px solid var(--accent)" : undefined,
      }}
    >
      <div className="flex justify-between items-center mb-3.5">
        <div
          className="label-eyebrow"
          style={{ color: isToday ? "var(--accent)" : undefined }}
        >
          {d.dayName}
          {isToday ? " · Hoy" : ""}
        </div>
        <div className="meta num">
          {d.isRest ? "Recuperación" : `~${d.estimatedMinutes} min`}
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-[-0.01em] mb-3.5 text-t1">
        {d.sessionName}
      </h3>
      {d.muscles.length > 0 ? (
        <div className="flex gap-1.5 flex-wrap mb-[18px]">
          {d.muscles.map((m) => (
            <span key={m} className="chip">
              {m}
            </span>
          ))}
        </div>
      ) : (
        <div className="body mb-[18px] text-[13px]">
          Caminata ligera opcional · movilidad
        </div>
      )}
      <div
        className="flex justify-between items-center pt-3.5"
        style={{ borderTop: "1px solid rgba(44,48,58,0.5)" }}
      >
        <span className="body text-[13px]">
          {d.exercisesCount > 0
            ? `${d.exercisesCount} ejercicios`
            : "Sin ejercicios"}
        </span>
        {!d.isRest && (
          <button
            onClick={() => onShowDetail(d.id)}
            className="link-accent p-0 text-[13px] border-none bg-none hover:cursor-pointer"
          >
            Ver detalle →
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <main className="max-w-[720px] mx-auto px-12 pt-24 pb-24 text-center">
      <div className="meta mb-3">Sin rutina activa</div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] mb-4 text-t1">
        Crea tu primera rutina.
      </h1>
      <p className="body text-base mb-8">
        Una rutina estructurada te ayuda a progresar de forma constante.
        Comienza con una plantilla o diséñala a tu medida.
      </p>
      <button onClick={onOpenModal} className="btn-primary">
        Crear nueva rutina
      </button>
    </main>
  );
}
