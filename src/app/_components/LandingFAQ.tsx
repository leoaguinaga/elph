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
    <section id="faq" style={{ padding: "80px 48px 100px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 80, alignItems: "start" }}>
        <div style={{ position: "sticky", top: 100 }}>
          <div className="label-eyebrow" style={{ marginBottom: 14, color: "var(--accent)" }}>FAQ</div>
          <h2 style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.1, margin: "0 0 18px", color: "var(--text-1)" }}>
            Preguntas frecuentes.
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 18px" }}>
            ¿No encuentras lo que buscas? Escríbenos a soporte.
          </p>
          <a href="mailto:hola@trainurself.app" className="link-accent" style={{ fontSize: 14 }}>
            hola@trainurself.app →
          </a>
        </div>
        <div>
          {faqItems.map((it, i) => (
            <div key={i} style={{ borderBottom: i < faqItems.length - 1 ? "1px solid var(--border)" : "none" }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                style={{ width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, padding: "24px 0", background: "transparent", cursor: "pointer" }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 500, margin: 0, color: openIdx === i ? "var(--text-1)" : "var(--text-2)", letterSpacing: "-0.005em", lineHeight: 1.4, transition: "color .15s" }}>{it.q}</h3>
                <div style={{ flexShrink: 0, marginTop: 4, transform: openIdx === i ? "rotate(45deg)" : "rotate(0)", transition: "transform .2s", color: openIdx === i ? "var(--accent)" : "var(--text-3)", fontSize: 20, lineHeight: 1, fontWeight: 300 }}>+</div>
              </button>
              <div style={{ maxHeight: openIdx === i ? 200 : 0, overflow: "hidden", transition: "max-height .3s ease, opacity .25s ease", opacity: openIdx === i ? 1 : 0 }}>
                <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.65, margin: 0, paddingBottom: 24, maxWidth: 700 }}>{it.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
