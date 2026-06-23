import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { LandingFAQ } from "./_components/LandingFAQ";
import { CTAButton } from "./_components/CTAButton";

export default function LandingPage() {
  return (
    <div className="min-w-[1280px]">
      <LandingHeader />
      <LandingHero />
      <FeatureRow />
      <QuoteBlock />
      <HowItWorks />
      <LandingFAQ />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[rgba(17,19,24,0.9)] backdrop-blur-[10px] border-b border-border">
      <div className="max-w-[1200px] mx-auto px-12 h-[72px] flex items-center justify-between">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-t1">Elph</span>
        <nav className="flex gap-1 items-center">
          {[["Producto", "#producto"], ["Cómo funciona", "#como-funciona"], ["FAQ", "#faq"]].map(([label, href]) => (
            <a key={href} href={href} className="btn-ghost text-sm">{label}</a>
          ))}
          <CTAButton className="btn-ghost">Iniciar sesión</CTAButton>
          <CTAButton className="btn-primary ml-2">Probar gratis</CTAButton>
        </nav>
      </div>
    </header>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────────── */
function LandingHero() {
  return (
    <section className="py-[120px] px-12 pb-[100px] max-w-[1200px] mx-auto">
      <div className="grid gap-20 items-center" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        <div>
          <div className="label-eyebrow mb-[18px] text-accent">Para quien entrena en serio</div>
          <h1 className="text-[64px] font-semibold tracking-[-0.035em] leading-[1.05] mb-7 text-t1">
            Tu cuaderno de<br />entrenamiento,<br />sin distracciones.
          </h1>
          <p className="text-lg text-t2 leading-[1.55] mb-9 max-w-[480px]">
            Registra cada serie, recuerda exactamente cuánto levantaste la última vez, y ve tu progreso real semana a semana. Sin gamificación. Sin ruido.
          </p>
          <div className="flex items-center gap-4">
            <CTAButton className="btn-primary px-6 py-3.5 text-[15px]">Empezar ahora</CTAButton>
            <a href="#como-funciona" className="link-accent text-sm">Ver demostración →</a>
          </div>
          <div className="mt-9 flex items-center gap-6">
            <span className="meta">14 días gratis · Sin tarjeta</span>
            <span className="w-1 h-1 rounded-full bg-t3 inline-block" />
            <span className="meta">iOS, Android, Web</span>
          </div>
        </div>

        {/* Preview card */}
        <div className="card p-6">
          <div className="label-eyebrow mb-3">Sesión de hoy · Empuje A</div>
          <h3 className="text-xl font-semibold mb-3.5 text-t1">Press banca con barra</h3>
          <div className="border-t border-border pt-3.5">
            {[
              { n: 1, kg: 80,   reps: 8, done: true             },
              { n: 2, kg: 80,   reps: 7, done: true             },
              { n: 3, kg: 80,   reps: 6, done: true             },
              { n: 4, kg: 82.5, reps: 6, done: true, pr: true   },
            ].map((s) => (
              <div
                key={s.n}
                className="grid items-center gap-3 py-2.5"
                style={{
                  gridTemplateColumns: "24px 1fr 1fr 60px 24px",
                  borderBottom: s.n < 4 ? "1px solid rgba(44,48,58,0.5)" : "none",
                }}
              >
                <span className="meta num">{s.n}</span>
                <span className="num text-sm text-t1">{s.kg} kg</span>
                <span className="num text-sm text-t1">{s.reps} reps</span>
                {s.pr
                  ? <span className="bg-[rgba(224,123,74,0.12)] text-warn text-[10px] font-bold px-1.5 py-0.5 rounded tracking-[0.06em]">PR</span>
                  : <span />
                }
                <div className="w-[18px] h-[18px] rounded-full bg-success flex items-center justify-center">
                  <Icon name="check" size={11} color="#0F1419" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 px-3.5 py-3 bg-surface-2 rounded-md text-xs text-t2">
            <span className="text-success font-semibold">+2.5 kg</span> vs sesión anterior · Buen trabajo.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features ────────────────────────────────────────────────────────────────── */
function FeatureRow() {
  return (
    <section id="producto" className="px-12 pt-[100px] pb-10 max-w-[1200px] mx-auto">
      <div className="max-w-[720px] mb-16">
        <div className="label-eyebrow mb-3.5 text-accent">Producto</div>
        <h2 className="text-[44px] font-semibold tracking-[-0.025em] leading-[1.1] mb-[18px] text-t1">
          Cada serie, en su sitio.
        </h2>
        <p className="text-lg text-t2 leading-[1.55] max-w-[600px]">
          Tres pilares que hacen de tu entrenamiento un proceso medible, sin que la app estorbe entre serie y serie.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Feature 1 */}
        <div className="card p-7">
          <div className="label-eyebrow text-accent mb-3.5">01 · Registro</div>
          <h3 className="text-[22px] font-semibold tracking-[-0.015em] mb-3 text-t1">
            Series en vivo, junto a tu última sesión.
          </h3>
          <p className="text-sm text-t2 leading-[1.6] mb-6">
            Cada fila muestra cuánto levantaste la última vez. Decides al instante si subir, mantener o ajustar.
          </p>
          <div className="bg-bg rounded-lg border border-border p-3.5">
            {[
              { n: 1, prev: "80×8", kg: 82.5, reps: 6, done: true,  pr: true  },
              { n: 2, prev: "80×7", kg: 80,   reps: 7, done: true,  pr: false },
              { n: 3, prev: "80×6", kg: 80,   reps: 6, done: false, next: true },
            ].map((s) => (
              <div
                key={s.n}
                className="grid items-center gap-2 px-1.5 py-2 rounded"
                style={{
                  gridTemplateColumns: "18px 38px 1fr 1fr 22px",
                  background: s.done ? "rgba(76,175,130,0.05)" : s.next ? "rgba(91,142,240,0.06)" : "transparent",
                  borderBottom: s.n < 3 ? "1px solid rgba(44,48,58,0.5)" : "none",
                }}
              >
                <span className="num text-[11px] text-t3 font-semibold">{s.n}</span>
                <span className="num text-[11px] text-t3">{s.prev}</span>
                <span className="num text-xs text-t1">{s.kg} kg</span>
                <span className="num text-xs text-t1">{s.reps} reps</span>
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{
                    background: s.done ? "var(--success)" : "transparent",
                    border: s.done ? "none" : `1.5px solid ${s.next ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {s.done && <Icon name="check" size={9} color="#0F1419" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 2 */}
        <div className="card p-7">
          <div className="label-eyebrow text-accent mb-3.5">02 · Progresión</div>
          <h3 className="text-[22px] font-semibold tracking-[-0.015em] mb-3 text-t1">
            Tus PRs y volumen, semana a semana.
          </h3>
          <p className="text-sm text-t2 leading-[1.6] mb-6">
            Gráficas simples de lo que importa: tu récord personal en los levantamientos clave y el volumen total movido.
          </p>
          <div className="bg-bg rounded-lg border border-border p-4">
            {[
              { l: "Press Banca", v: "85 kg",  delta: "+15 kg", weeks: 12 },
              { l: "Sentadilla",  v: "120 kg", delta: "+25 kg", weeks: 12 },
            ].map((item) => (
              <div key={item.l} className="mb-3.5">
                <div className="flex justify-between mb-1.5 text-xs text-t2">
                  <span>{item.l}</span>
                  <span className="num text-success font-semibold">{item.delta} en {item.weeks}s</span>
                </div>
                <div className="h-[3px] bg-surface-2 rounded-full">
                  <div className="w-[68%] h-full bg-accent rounded-full" />
                </div>
              </div>
            ))}
            <div className="text-[22px] font-semibold text-t1 mt-1">
              <span className="num">85 kg</span>
              <span className="text-[13px] text-warn ml-2.5 font-bold">PR</span>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="card p-7">
          <div className="label-eyebrow text-accent mb-3.5">03 · Splits</div>
          <h3 className="text-[22px] font-semibold tracking-[-0.015em] mb-3 text-t1">
            Tu rutina semanal, siempre a mano.
          </h3>
          <p className="text-sm text-t2 leading-[1.6] mb-6">
            Crea tu split con los días que quieras o usa plantillas probadas. Edítalo sin perder el historial.
          </p>
          <div className="flex gap-2 flex-wrap">
            {[
              { d: "L", label: "Empuje A", done: true              },
              { d: "M", label: "Jalón A",  done: true              },
              { d: "X", label: "Descanso", rest: true              },
              { d: "J", label: "Pierna",   done: false             },
              { d: "V", label: "Empuje B", today: true             },
              { d: "S", label: "Jalón B",  done: false             },
              { d: "D", label: "Descanso", rest: true              },
            ].map((day) => (
              <div key={day.d} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  style={{
                    background: day.done ? "var(--success)" : "transparent",
                    border: `1.5px solid ${day.today ? "var(--accent)" : "var(--border)"}`,
                    color: day.done ? "#0F1419" : day.today ? "var(--accent)" : "var(--text-2)",
                  }}
                >
                  {day.done ? <Icon name="check" size={13} color="#0F1419" /> : day.d}
                </div>
                <span className="text-[9px] tracking-[0.04em]" style={{ color: day.today ? "var(--accent)" : "var(--text-3)" }}>
                  {day.today ? "HOY" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Quote ───────────────────────────────────────────────────────────────────── */
function QuoteBlock() {
  return (
    <section className="py-20 px-12 bg-surface border-y border-border mt-[60px]">
      <div className="max-w-[900px] mx-auto text-center">
        <p className="text-[28px] font-medium tracking-[-0.015em] leading-[1.35] text-t1 mb-7">
          &ldquo;Llevaba años usando hojas de cálculo. TrainURSelf hace exactamente eso, pero deja de estorbar cuando entreno.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          <Avatar name="Ana Ruiz" size={32} />
          <div className="text-left">
            <div className="text-sm text-t1 font-medium">Ana Ruiz</div>
            <div className="meta">Powerlifter · 3 años entrenando</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="como-funciona" className="px-12 py-20 pb-[100px] max-w-[1200px] mx-auto">
      <div className="grid gap-20" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div>
          <div className="label-eyebrow mb-3.5 text-accent">Cómo funciona</div>
          <h2 className="text-[40px] font-semibold tracking-[-0.025em] leading-[1.1] mb-[18px] text-t1">
            De cero a primera sesión en cinco minutos.
          </h2>
          <p className="text-[17px] text-t2 leading-[1.55]">
            Sin tutoriales largos, sin formularios. Eliges tu rutina, registras tu primera serie, y la app se queda en segundo plano.
          </p>
        </div>
        <div>
          {[
            { n: "01", t: "Elige una rutina o crea la tuya", d: "Plantillas Push-Pull-Legs, Full Body, Upper-Lower y Bro Split listas para usar. O construye la tuya día por día, ejercicio por ejercicio." },
            { n: "02", t: "Registra mientras entrenas",      d: "Abre la sesión del día, marca cada serie con un toque. Verás siempre lo que hiciste la última vez al lado de cada serie nueva." },
            { n: "03", t: "Revisa tu progreso cuando quieras", d: "Cada semana ves tus PRs nuevos, volumen total y adherencia. Sin gráficos vanidosos: solo lo que importa para saber si avanzas." },
          ].map((s, i, arr) => (
            <div
              key={s.n}
              className="grid gap-6 py-6"
              style={{
                gridTemplateColumns: "60px 1fr",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="num text-[28px] font-semibold text-t3 tracking-[-0.01em] leading-none">{s.n}</div>
              <div>
                <h3 className="text-[19px] font-semibold mb-2 text-t1 tracking-[-0.01em]">{s.t}</h3>
                <p className="text-[15px] text-t2 leading-[1.6]">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ───────────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-20 px-12 bg-surface border-t border-border">
      <div className="max-w-[720px] mx-auto text-center">
        <h2 className="text-[36px] font-semibold tracking-[-0.025em] leading-[1.15] mb-[18px] text-t1">
          Empieza a registrar tu próxima sesión.
        </h2>
        <p className="text-[17px] text-t2 leading-[1.55] mb-8">
          14 días gratis, sin tarjeta. Si no es para ti, exporta tus datos y sigue tu camino.
        </p>
        <CTAButton className="btn-primary px-7 py-3.5 text-[15px]">
          Crear mi cuenta
        </CTAButton>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
function LandingFooter() {
  return (
    <footer className="px-12 py-12 border-t border-border">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <span className="text-[15px] font-semibold text-t2">TrainURSelf</span>
        <div className="meta">© 2025 TrainURSelf · Hecho para quien levanta peso de verdad.</div>
      </div>
    </footer>
  );
}
