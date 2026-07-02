"use client";

import { useEffect, useState, useTransition } from "react";
import { getPlanForEditing, saveSplitChanges } from "@/server/actions/plans";
import { getExercisesList } from "@/server/actions/exercises";

interface EditPlanModalProps {
  planId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type ExerciseItem = {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
};

type EditDay = {
  id: string;
  dayName: string;
  sessionName: string;
  isRest: boolean;
  order: number;
  exercises: {
    id: string;
    exerciseId: string;
    exercise: ExerciseItem;
    targetSets: number;
    targetReps: string;
    restSeconds: number;
  }[];
};

type EditPlan = {
  id: string;
  name: string;
  goal: string;
  days: EditDay[];
};

export function EditPlanModal({ planId, isOpen, onClose }: EditPlanModalProps) {
  const [plan, setPlan] = useState<EditPlan | null>(null);
  const [catalog, setCatalog] = useState<ExerciseItem[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSave, startSaveTransition] = useTransition();

  // Load plan and exercises catalogue
  useEffect(() => {
    if (!isOpen || !planId) return;

    setLoading(true);
    setError(null);

    Promise.all([getPlanForEditing(planId), getExercisesList()])
      .then(([planData, exercisesData]) => {
        setPlan(planData as EditPlan);
        setCatalog(exercisesData as ExerciseItem[]);
        setSelectedDayIdx(0);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar los datos de edición");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, planId]);

  if (!isOpen || !planId) return null;

  const handleDayNameChange = (val: string) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return null;
      const updatedDays = prev.days.map((d, idx) =>
        idx === selectedDayIdx ? { ...d, sessionName: val } : d
      );
      return { ...prev, days: updatedDays };
    });
  };

  const handleToggleRest = () => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return null;
      const updatedDays = prev.days.map((d, idx) => {
        if (idx !== selectedDayIdx) return d;
        const newRest = !d.isRest;
        return {
          ...d,
          isRest: newRest,
          sessionName: newRest ? "Descanso" : "Entrenamiento",
          exercises: newRest ? [] : d.exercises,
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleRemoveExercise = (exIdx: number) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return null;
      const updatedDays = prev.days.map((d, idx) => {
        if (idx !== selectedDayIdx) return d;
        return {
          ...d,
          exercises: d.exercises.filter((_, eIdx) => eIdx !== exIdx),
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddExercise = (exercise: ExerciseItem) => {
    if (!plan) return;
    setPlan((prev) => {
      if (!prev) return null;
      const updatedDays = prev.days.map((d, idx) => {
        if (idx !== selectedDayIdx) return d;

        // Prevent adding duplicate exercise in the same session
        if (d.exercises.some((e) => e.exerciseId === exercise.id)) {
          return d;
        }

        const newDayEx = {
          id: `temp-${Date.now()}-${Math.random()}`,
          exerciseId: exercise.id,
          exercise: exercise,
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 180, // Default 3 min
        };

        return {
          ...d,
          exercises: [...d.exercises, newDayEx],
        };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleMoveExercise = (exIdx: number, direction: "up" | "down") => {
    if (!plan) return;
    const targetIdx = direction === "up" ? exIdx - 1 : exIdx + 1;
    if (targetIdx < 0 || targetIdx >= plan.days[selectedDayIdx].exercises.length) return;

    setPlan((prev) => {
      if (!prev) return null;
      const updatedDays = prev.days.map((d, idx) => {
        if (idx !== selectedDayIdx) return d;
        const reordered = [...d.exercises];
        const temp = reordered[exIdx];
        reordered[exIdx] = reordered[targetIdx];
        reordered[targetIdx] = temp;
        return { ...d, exercises: reordered };
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleSave = () => {
    if (!plan) return;
    setError(null);

    startSaveTransition(async () => {
      try {
        await saveSplitChanges({
          planId: plan.id,
          days: plan.days.map((d) => ({
            id: d.id,
            dayName: d.dayName,
            sessionName: d.sessionName,
            isRest: d.isRest,
            exercises: d.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              restSeconds: e.restSeconds,
            })),
          })),
        });
        onClose();
      } catch (err) {
        setError((err as Error).message || "Error al guardar los cambios.");
      }
    });
  };

  const currentDay = plan?.days[selectedDayIdx];

  // Exercises filtered by search input
  const filteredCatalog = catalog.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Suggestions based on active day muscles
  const getSuggestions = () => {
    if (!currentDay || currentDay.isRest) return [];
    const nameLower = currentDay.sessionName.toLowerCase();
    let targetMuscles: string[] = [];

    if (nameLower.includes("empuje") || nameLower.includes("push")) {
      targetMuscles = ["Pecho", "Hombros", "Tríceps"];
    } else if (nameLower.includes("tiron") || nameLower.includes("tirón") || nameLower.includes("pull")) {
      targetMuscles = ["Espalda", "Bíceps"];
    } else if (nameLower.includes("pierna") || nameLower.includes("legs")) {
      targetMuscles = ["Cuádriceps", "Femoral", "Glúteo", "Gemelos"];
    } else if (nameLower.includes("torso") || nameLower.includes("upper")) {
      targetMuscles = ["Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps"];
    } else {
      // Default general suggestions if custom
      targetMuscles = ["Pecho", "Espalda", "Cuádriceps", "Hombros"];
    }

    return catalog
      .filter((e) => targetMuscles.includes(e.muscle))
      .slice(0, 5); // Max 5 suggestions
  };

  const suggestions = getSuggestions();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[overlayIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-[980px] h-[88vh] overflow-hidden border border-white/5 bg-[#14161D] shadow-2xl flex flex-col animate-[panelIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-border bg-[#1C1F26]/30">
              <div>
                <div className="h-3 w-24 bg-surface-2 rounded mb-2" />
                <div className="h-6 w-48 bg-surface-2 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-20 bg-surface-2 rounded-lg" />
                <div className="h-8 w-28 bg-surface-2 rounded-lg" />
                <div className="h-8 w-8 bg-surface-2 rounded-lg" />
              </div>
            </div>
            {/* Sidebar + Main Skeleton */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-[240px] border-r border-border bg-[#16181F]/40 p-4 space-y-2">
                <div className="h-3 w-10 bg-surface-2 rounded mb-4" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="p-3 border border-transparent rounded-lg space-y-2">
                    <div className="h-2 w-12 bg-surface-2 rounded" />
                    <div className="h-4 w-28 bg-surface-2 rounded" />
                  </div>
                ))}
              </div>
              {/* Main Content Area */}
              <div className="flex-1 p-8 space-y-6">
                <div className="flex justify-between items-end pb-6 border-b border-border/50">
                  <div className="flex-1">
                    <div className="h-3 w-28 bg-surface-2 rounded mb-2" />
                    <div className="h-10 w-[300px] bg-surface-2 rounded-lg" style={{ backgroundColor: 'var(--surface)' }} />
                  </div>
                  <div className="h-8 w-32 bg-surface-2 rounded-lg" />
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-24 bg-surface-2 rounded" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 w-full bg-surface-2/40 border border-border rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : error && !plan ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-[rgba(224,123,74,0.10)] border border-[rgba(224,123,74,0.3)] rounded-lg px-4 py-3 mb-6 text-sm text-warn max-w-md text-center">
              {error}
            </div>
            <button onClick={onClose} className="btn-ghost text-xs">
              Cerrar
            </button>
          </div>
        ) : plan ? (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-5 border-b border-border bg-[#1C1F26]/30">
              <div>
                <span className="label-eyebrow text-t3 text-[10px] tracking-widest">
                  EDITOR DE RUTINA
                </span>
                <h2 className="text-lg md:text-xl font-bold text-t1 mt-0.5 tracking-tight truncate max-w-[280px] sm:max-w-none">
                  {plan.name}
                </h2>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {error && <span className="text-xs text-warn truncate max-w-[150px]">{error}</span>}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost text-[11px] md:text-xs py-1.5 md:py-2 px-3 md:px-4 text-t2 hover:text-t1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={pendingSave}
                    className="bg-[#5B8EF0] hover:bg-[#6E9CF3] text-white text-[11px] md:text-xs font-semibold py-1.5 md:py-2 px-4 md:px-5 rounded-lg transition-all"
                  >
                    {pendingSave ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-[#23272F]/50 hover:bg-[#23272F] text-t2 hover:text-t1 p-2 rounded-lg border border-white/5 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content body split */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Sidebar: Days */}
              <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-border bg-[#16181F]/40 p-3 md:p-4 overflow-x-auto md:overflow-y-auto scrollbar-none flex-shrink-0">
                <span className="hidden md:block label-section text-[11px] text-t3 mb-3">DÍAS</span>
                <div className="flex flex-row md:flex-col gap-1.5 flex-nowrap md:space-y-0">
                  {plan.days.map((d, idx) => {
                    const isSelected = idx === selectedDayIdx;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`text-left p-2.5 md:p-3 rounded-lg border transition-all flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0.5 flex-shrink-0 ${
                          isSelected
                            ? "bg-[#1F232B] border-accent/40 text-t1 shadow-sm"
                            : "border-transparent bg-transparent text-t2 hover:bg-[#1C1F26]/30 hover:text-t1"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-t3 flex-shrink-0">
                          {d.dayName}
                        </span>
                        <span className={`text-[12px] md:text-[13px] font-semibold truncate max-w-[120px] md:max-w-none ${isSelected ? "text-[#5B8EF0]" : "text-t2"}`}>
                          {d.isRest ? "Descanso" : d.sessionName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Panel: Day Configuration */}
              <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col gap-6">
                {currentDay && (
                  <>
                    {/* Day settings */}
                    <div className="flex items-end justify-between gap-6 pb-6 border-b border-border/50">
                      <div className="flex-1">
                        <label className="block label-section text-[10px] text-t3 uppercase mb-2">
                          NOMBRE DEL DÍA
                        </label>
                        <input
                          type="text"
                          value={currentDay.sessionName}
                          disabled={currentDay.isRest}
                          onChange={(e) => handleDayNameChange(e.target.value)}
                          placeholder="Ej. Empuje A, Torso, Pierna..."
                          className="w-full max-w-[400px] bg-[#111318] text-t1 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent disabled:opacity-50"
                        />
                      </div>
                      <div className="flex items-center gap-3 h-10">
                        <span className="text-xs font-semibold text-t2">
                          Día de descanso
                        </span>
                        <button
                          type="button"
                          onClick={handleToggleRest}
                          className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                            currentDay.isRest ? "bg-accent" : "bg-[#23272F]"
                          }`}
                        >
                          <div
                            className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transition-transform ${
                              currentDay.isRest ? "translate-x-5.5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Exercises display */}
                    {!currentDay.isRest ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="label-section text-[10px] text-t3 uppercase mb-3">
                            EJERCICIOS ({currentDay.exercises.length})
                          </h3>
                          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-none">
                            {currentDay.exercises.map((e, eIdx) => (
                              <div
                                key={e.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-[#23272F]/20 text-sm hover:border-[#2C303A] transition-all group"
                              >
                                {/* Reordering Arrows */}
                                <div className="flex flex-col gap-0.5 text-t3 group-hover:text-t2">
                                  <button
                                    onClick={() => handleMoveExercise(eIdx, "up")}
                                    disabled={eIdx === 0}
                                    className="p-0.5 hover:text-accent disabled:opacity-30 disabled:hover:text-t3"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => handleMoveExercise(eIdx, "down")}
                                    disabled={eIdx === currentDay.exercises.length - 1}
                                    className="p-0.5 hover:text-accent disabled:opacity-30 disabled:hover:text-t3"
                                  >
                                    ▼
                                  </button>
                                </div>

                                <span className="font-bold text-t3 text-xs w-4 text-center num">
                                  {eIdx + 1}
                                </span>
                                <span className="font-semibold text-t1 flex-1">
                                  {e.exercise.name}
                                </span>
                                <span className="text-xs text-t3 px-2 py-0.5 rounded bg-[#1C1F26] border border-border">
                                  {e.exercise.muscle}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExercise(eIdx)}
                                  className="text-t3 hover:text-warn p-1 ml-2 transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            {currentDay.exercises.length === 0 && (
                              <div className="py-8 text-center text-t3 italic border border-dashed border-border rounded-xl">
                                Sin ejercicios agregados. Utiliza los sugeridos o el buscador abajo.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Add exercise section */}
                        <div className="space-y-4 pt-4 border-t border-border/30">
                          <div>
                            <h3 className="label-section text-[10px] text-t3 uppercase mb-2">
                              AÑADIR EJERCICIO
                            </h3>
                            {suggestions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3.5">
                                {suggestions.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => handleAddExercise(s)}
                                    className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-border bg-[#1C1F26] text-t2 hover:text-t1 hover:border-accent/40 transition-all"
                                  >
                                    + {s.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Search Catalog */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Buscar ejercicio en catálogo..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full bg-[#111318] text-t1 border border-border rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-accent"
                            />
                            {searchQuery.trim() && (
                              <div className="absolute left-0 right-0 mt-1 max-h-[160px] overflow-y-auto bg-[#1C1F26] border border-border rounded-lg shadow-xl z-20 p-1">
                                {filteredCatalog.slice(0, 10).map((ex) => (
                                  <button
                                    key={ex.id}
                                    onClick={() => {
                                      handleAddExercise(ex);
                                      setSearchQuery("");
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs rounded hover:bg-[#23272F] text-t1 flex justify-between items-center"
                                  >
                                    <span>{ex.name}</span>
                                    <span className="text-[10px] text-t3 font-semibold uppercase">
                                      {ex.muscle}
                                    </span>
                                  </button>
                                ))}
                                {filteredCatalog.length === 0 && (
                                  <div className="py-3 text-center text-xs text-t3 italic">
                                    No se encontraron resultados
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-4xl mb-3">😴</span>
                        <h4 className="text-base font-bold text-t1 mb-1">
                          Día de descanso configurado
                        </h4>
                        <p className="text-sm text-t3 max-w-xs">
                          Los días de descanso no contienen ejercicios y están dedicados a la recuperación. Puedes desactivarlo arriba si entrenas este día.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
