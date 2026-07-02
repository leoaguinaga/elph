"use client";

import { useState, useTransition } from "react";
import { createPlan } from "@/server/actions/plans";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TemplateDay = {
  dayName: string;
  sessionName: string;
  isRest: boolean;
  exercises?: string[];
};

type Template = {
  id: string;
  name: string;
  description: string;
  days: TemplateDay[];
};

const TEMPLATES: Template[] = [
  {
    id: "ppl_3",
    name: "Tirón / Empuje / Pierna (PPL) - 3 Días",
    description: "Frecuencia 1x ideal si tienes tiempo limitado. 3 días de entreno, 4 de descanso.",
    days: [
      { dayName: "Lunes", sessionName: "Empuje (Pecho, Hombro, Tríceps)", isRest: false, exercises: ["Press banca con barra", "Press militar de pie", "Extensiones de tríceps en polea"] },
      { dayName: "Martes", sessionName: "Descanso", isRest: true },
      { dayName: "Miércoles", sessionName: "Tirón (Espalda, Bíceps)", isRest: false, exercises: ["Remo con barra", "Jalón al pecho", "Curl con barra Z"] },
      { dayName: "Jueves", sessionName: "Descanso", isRest: true },
      { dayName: "Viernes", sessionName: "Pierna (Cuádriceps, Femorales, Pantorrillas)", isRest: false, exercises: ["Sentadilla con barra", "Peso muerto rumano", "Elevación de gemelos de pie"] },
      { dayName: "Sábado", sessionName: "Descanso", isRest: true },
      { dayName: "Domingo", sessionName: "Descanso", isRest: true },
    ],
  },
  {
    id: "ppl_6",
    name: "Tirón / Empuje / Pierna (PPL) - 6 Días",
    description: "Frecuencia 2x ideal para hipertrofia avanzada. Alto volumen semanal.",
    days: [
      { dayName: "Lunes", sessionName: "Empuje A (Pecho, Hombro, Tríceps)", isRest: false, exercises: ["Press banca con barra", "Press militar de pie", "Extensiones de tríceps en polea"] },
      { dayName: "Martes", sessionName: "Tirón A (Espalda, Bíceps)", isRest: false, exercises: ["Remo con barra", "Jalón al pecho", "Curl con barra Z"] },
      { dayName: "Miércoles", sessionName: "Pierna A (Cuádriceps, Femorales)", isRest: false, exercises: ["Sentadilla con barra", "Peso muerto rumano", "Elevación de gemelos de pie"] },
      { dayName: "Jueves", sessionName: "Empuje B (Pecho, Hombro, Tríceps)", isRest: false, exercises: ["Press inclinado con mancuernas", "Elevaciones laterales", "Fondos en paralelas"] },
      { dayName: "Viernes", sessionName: "Tirón B (Espalda, Bíceps)", isRest: false, exercises: ["Dominadas", "Remo con mancuerna", "Curl martillo"] },
      { dayName: "Sábado", sessionName: "Pierna B (Cuádriceps, Glúteos)", isRest: false, exercises: ["Prensa de pierna", "Hip thrust", "Zancadas con mancuernas"] },
      { dayName: "Domingo", sessionName: "Descanso", isRest: true },
    ],
  },
  {
    id: "ul_4",
    name: "Torso / Pierna - 4 Días",
    description: "Excelente balance entre estímulo y recuperación muscular (Frecuencia 2x).",
    days: [
      { dayName: "Lunes", sessionName: "Torso A", isRest: false, exercises: ["Press banca con barra", "Remo con barra", "Press militar de pie", "Fondos en paralelas"] },
      { dayName: "Martes", sessionName: "Pierna A", isRest: false, exercises: ["Sentadilla con barra", "Peso muerto rumano", "Prensa de pierna"] },
      { dayName: "Miércoles", sessionName: "Descanso", isRest: true },
      { dayName: "Jueves", sessionName: "Torso B", isRest: false, exercises: ["Press inclinado con mancuernas", "Jalón al pecho", "Elevaciones laterales", "Curl con barra Z"] },
      { dayName: "Viernes", sessionName: "Pierna B", isRest: false, exercises: ["Sentadilla frontal", "Curl femoral en máquina", "Hip thrust"] },
      { dayName: "Sábado", sessionName: "Descanso", isRest: true },
      { dayName: "Domingo", sessionName: "Descanso", isRest: true },
    ],
  },
  {
    id: "fb_3",
    name: "Cuerpo Completo (Fullbody) - 3 Días",
    description: "Entrena todo el cuerpo en cada sesión. Ideal para principiantes.",
    days: [
      { dayName: "Lunes", sessionName: "Full Body A", isRest: false, exercises: ["Sentadilla con barra", "Press banca con barra", "Remo con barra"] },
      { dayName: "Martes", sessionName: "Descanso", isRest: true },
      { dayName: "Miércoles", sessionName: "Full Body B", isRest: false, exercises: ["Peso muerto", "Press militar de pie", "Dominadas"] },
      { dayName: "Jueves", sessionName: "Descanso", isRest: true },
      { dayName: "Viernes", sessionName: "Full Body C", isRest: false, exercises: ["Prensa de pierna", "Press inclinado con mancuernas", "Curl con barra Z"] },
      { dayName: "Sábado", sessionName: "Descanso", isRest: true },
      { dayName: "Domingo", sessionName: "Descanso", isRest: true },
    ],
  },
  {
    id: "custom",
    name: "Personalizado (Desde Cero)",
    description: "Crea tu split configurando cada día manualmente.",
    days: [
      { dayName: "Lunes", sessionName: "Descanso", isRest: true },
      { dayName: "Martes", sessionName: "Descanso", isRest: true },
      { dayName: "Miércoles", sessionName: "Descanso", isRest: true },
      { dayName: "Jueves", sessionName: "Descanso", isRest: true },
      { dayName: "Viernes", sessionName: "Descanso", isRest: true },
      { dayName: "Sábado", sessionName: "Descanso", isRest: true },
      { dayName: "Domingo", sessionName: "Descanso", isRest: true },
    ],
  },
];

interface NewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPlanModal({ isOpen, onClose }: NewPlanModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Ganar masa muscular");
  const [selectedTemplateId, setSelectedTemplateId] = useState("ppl_3");
  const [days, setDays] = useState<TemplateDay[]>(TEMPLATES[0].days);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setDays(JSON.parse(JSON.stringify(template.days))); // Deep copy
    }
  };

  const handleToggleRest = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const willBeRest = !d.isRest;
        return {
          ...d,
          isRest: willBeRest,
          sessionName: willBeRest ? "Descanso" : "Entrenamiento",
        };
      })
    );
  };

  const handleSessionNameChange = (index: number, newName: string) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, sessionName: newName } : d))
    );
  };

  const handleSubmit = () => {
    setError(null);
    if (!name.trim()) {
      setError("Por favor ingresa un nombre para la rutina.");
      return;
    }

    startTransition(async () => {
      try {
        await createPlan({
          name: name.trim(),
          goal: goal,
          days: days.map((d, i) => ({
            dayName: d.dayName,
            sessionName: d.sessionName,
            isRest: d.isRest,
            order: i,
          })),
        });
        onClose();
        // Reset states
        setStep(1);
        setName("");
        setGoal("Ganar masa muscular");
        setSelectedTemplateId("ppl_3");
        setDays(TEMPLATES[0].days);
      } catch (err) {
        setError((err as Error).message || "Ocurrió un error inesperado.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[overlayIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-[620px] max-h-[90vh] overflow-y-auto border border-white/5 bg-[#1C1F26] p-8 shadow-2xl flex flex-col animate-[panelIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <div>
            <span className="label-eyebrow text-accent">Paso {step} de 3</span>
            <h2 className="text-xl font-bold text-t1 mt-1">Crear Nueva Rutina</h2>
          </div>
          <button onClick={onClose} className="text-t3 hover:text-t2 text-xl font-light p-1">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-[rgba(224,123,74,0.10)] border border-[rgba(224,123,74,0.3)] rounded-lg px-4 py-3 mb-6 text-sm text-warn">
            {error}
          </div>
        )}

        {/* Content Steps */}
        <div className="flex-1 min-h-0">
          {step === 1 && (
            <div className="space-y-5 animate-[panelIn_0.2s_ease-out]">
              <div>
                <label className="block label-section mb-2 text-t2">Nombre de la Rutina</label>
                <input
                  type="text"
                  placeholder="Ej. Mi Split de Fuerza, Empuje 2.0..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111318] text-t1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent"
                />
                <div className="mt-2.5">
                  <span className="block text-[11px] text-t3 font-medium uppercase tracking-wider mb-2">
                    Sugerencias populares (haz clic para usar):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Push / Pull / Legs (PPL)",
                      "Torso / Pierna (Frecuencia 2x)",
                      "Fuerza 5x5 / Básicos",
                      "Full Body (Cuerpo Completo)",
                      "Arnold Split (Pecho/Espalda)",
                      "Acondicionamiento y Cárdio",
                      "Rutina Estética de Hipertrofia",
                    ].map((sName) => (
                      <button
                        key={sName}
                        type="button"
                        onClick={() => setName(sName)}
                        className={`text-xs px-2.5 py-1.5 rounded-md transition-all border ${
                          name === sName
                            ? "bg-accent/15 border-accent text-accent"
                            : "bg-[#23272F] border-border text-t2 hover:text-t1 hover:border-accent/40"
                        }`}
                      >
                        {sName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block label-section mb-2 text-t2">Objetivo Principal</label>
                <Select value={goal} onValueChange={(val) => val && setGoal(val)}>
                  <SelectTrigger className="w-full text-t1 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent flex justify-between items-center" style={{ backgroundColor: '#111318', height: '46px', borderColor: 'var(--border)' }}>
                    <SelectValue placeholder="Selecciona un objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1F26] border border-border text-t1">
                    <SelectItem value="Ganar masa muscular" className="hover:bg-accent/10 focus:bg-accent focus:text-white">
                      Ganar masa muscular
                    </SelectItem>
                    <SelectItem value="Aumentar la fuerza" className="hover:bg-accent/10 focus:bg-accent focus:text-white">
                      Aumentar la fuerza
                    </SelectItem>
                    <SelectItem value="Disminuir de peso" className="hover:bg-accent/10 focus:bg-accent focus:text-white">
                      Disminuir de peso
                    </SelectItem>
                    <SelectItem value="Aumentar de peso" className="hover:bg-accent/10 focus:bg-accent focus:text-white">
                      Aumentar de peso
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-[panelIn_0.2s_ease-out]">
              <label className="block label-section text-t2">Selecciona una plantilla base</label>
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTemplate(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplateId === t.id
                        ? "border-accent bg-[#1F232B]"
                        : "border-border bg-[#1C1F26] hover:bg-[#1E2129]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-t1 text-sm">{t.name}</span>
                      {selectedTemplateId === t.id && (
                        <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-t2">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-[panelIn_0.2s_ease-out]">
              <div className="flex justify-between items-center">
                <label className="block label-section text-t2">Configura el Split Semanal</label>
                <span className="meta text-xs text-t3">Haz clic en entrenar/descanso</span>
              </div>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {days.map((d, i) => (
                  <div
                    key={d.dayName}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                      d.isRest ? "border-border/30 bg-[#16181F]/50 opacity-60" : "border-border bg-[#23272F]"
                    }`}
                  >
                    {/* Día de la semana */}
                    <span className="w-18 font-medium text-t1 text-xs">{d.dayName}</span>

                    {/* Input o texto de descanso */}
                    {d.isRest ? (
                      <span className="flex-1 text-t3 text-xs italic">Descanso activo / Recuperación</span>
                    ) : (
                      <input
                        type="text"
                        value={d.sessionName}
                        onChange={(e) => handleSessionNameChange(i, e.target.value)}
                        placeholder="Nombre de la sesión (ej. Pecho y Tríceps)"
                        className="flex-1 bg-[#111318]/60 text-t1 border border-border/40 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-accent/60"
                      />
                    )}

                    {/* Botón de alternar descanso */}
                    <button
                      type="button"
                      onClick={() => handleToggleRest(i)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        d.isRest ? "bg-accent/15 text-accent hover:bg-accent/25" : "bg-[#111318] text-t2 hover:bg-[#1C1F26]"
                      }`}
                    >
                      {d.isRest ? "Entrenar" : "Descanso"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Atrás
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost text-xs py-2 px-4">
              Cancelar
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !name.trim()}
                className="btn-primary text-xs py-2 px-5"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={pending}
                className="btn-primary text-xs py-2 px-5"
              >
                {pending ? "Guardando..." : "Finalizar y Activar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
