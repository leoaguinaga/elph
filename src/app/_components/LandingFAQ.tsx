"use client";

import { useState } from "react";

const faqItems = [
  { q: "¿Qué hace diferente a TrainURSelf de otras apps?", a: "No te recompensa con medallas ni rachas ficticias. Solo te muestra lo que levantaste, lo que estás levantando ahora, y si estás progresando. Para quien lleva años entrenando y quiere registrar — no jugar." },
  { q: "¿Puedo usar mis propias rutinas o tengo que seguir una plantilla?", a: "Las dos. Hay plantillas listas (PPL, Full Body, Upper-Lower) que puedes usar tal cual, o construir tu split desde cero: días, ejercicios, series, descansos. Todo es editable, incluso a mitad de sesión." },
  { q: "¿Funciona sin conexión a internet?", a: "Sí. Registras y consultas tu rutina offline; los datos sincronizan en cuanto recuperas conexión. Pensada para gimnasios con cobertura mala." },
  { q: "¿En qué dispositivos puedo usarla?", a: "iOS, Android y navegador web. Tu cuenta sincroniza entre los tres. Empieza una sesión en el móvil del gimnasio y revísala desde el portátil en casa." },
  { q: "¿Qué pasa con mis datos si dejo de usarla?", a: "Puedes exportar todo tu historial en cualquier momento (CSV o JSON) desde Perfil → Exportar mi entrenamiento. Sin atarte a la plataforma." },
  { q: "¿Hay una versión gratuita?", a: "Sí: registrar sesiones, ver tu rutina semanal y consultar tu historial es gratis para siempre. El plan Pro añade gráficas avanzadas, exportación y sincronización ilimitada." },
];

export function LandingFAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" className="py-20 md:py-32 px-6 md:px-12 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-24">
          <div className="label-eyebrow mb-3.5 text-accent">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] leading-tight mb-4 text-t1">
            Preguntas frecuentes.
          </h2>
          <p className="text-sm md:text-base text-t2 leading-relaxed mb-6">
            ¿No encuentras lo que buscas? Escríbenos a soporte.
          </p>
          <a href="mailto:hola@trainurself.app" className="link-accent text-sm flex items-center gap-1">
            hola@trainurself.app →
          </a>
        </div>
        <div className="divide-y divide-border/50">
          {faqItems.map((it, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                className="w-full text-left flex justify-between items-start gap-6 py-4 bg-transparent cursor-pointer group"
              >
                <h3 className={`text-base md:text-lg font-medium text-t2 group-hover:text-t1 transition-colors duration-150 ${openIdx === i ? "!text-t1" : ""}`}>
                  {it.q}
                </h3>
                <span className={`flex-shrink-0 mt-0.5 text-xl font-light transition-transform duration-200 ${openIdx === i ? "rotate-45 text-accent" : "text-t3"}`}>
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIdx === i ? "max-h-[300px] opacity-100 pb-4" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-sm md:text-base text-t2 leading-relaxed max-w-[640px]">
                  {it.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
