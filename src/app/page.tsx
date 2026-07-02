import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/Avatar";
import { LandingFAQ } from "./_components/LandingFAQ";
import { CTAButton } from "./_components/CTAButton";
import Header from "./_components/Header";

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-bg overflow-x-hidden">
      <Header />
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

function LandingHero() {
  return (
    <section className="py-16 md:py-28 px-6 md:px-12 max-w-3000 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
        <div>
          <div className="label-eyebrow mb-4.5 text-accent">Para quien entrena en serio</div>
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-semibold tracking-[-0.035em] leading-[1.1] mb-6 text-t1 max-w-2xl">
            Tu cuaderno de<br className="hidden sm:inline" /> entrenamiento,<br className="hidden sm:inline" /> sin distracciones.
          </h1>
          <p className="text-base md:text-lg text-t2 leading-[1.6] mb-8 max-w-120">
            Registra cada serie, recuerda exactamente cuánto levantaste la última vez, y ve tu progreso real semana a semana. Sin gamificación. Sin ruido.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <CTAButton className="btn-primary px-6 py-3.5 text-[15px]">Empezar ahora</CTAButton>
            <a href="#como-funciona" className="link-accent text-sm">Ver demostración →</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="meta">14 días gratis · Sin tarjeta</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-t3" />
            <span className="meta">iOS, Android, Web</span>
          </div>
        </div>

        {/* Preview card */}
        <div className="card p-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="label-eyebrow mb-3">Sesión de hoy · Empuje A</div>
          <h3 className="text-lg md:text-xl font-semibold mb-3.5 text-t1">Press banca con barra</h3>
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
    <section id="producto" className="px-6 md:px-12 py-16 md:py-28 max-w-[1200px] mx-auto">
      <div className="max-w-[720px] mb-12 md:mb-16">
        <div className="label-eyebrow mb-3.5 text-accent">Producto</div>
        <h2 className="text-3xl md:text-[44px] font-semibold tracking-[-0.025em] leading-[1.1] mb-[18px] text-t1">
          Cada serie, en su sitio.
        </h2>
        <p className="text-base md:text-lg text-t2 leading-[1.55] max-w-[600px]">
          Tres pilares que hacen de tu entrenamiento un proceso medible, sin que la app estorbe entre serie y serie.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <div className="card p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="label-eyebrow text-accent mb-3.5">01 · Registro</div>
            <h3 className="text-xl md:text-[22px] font-semibold tracking-[-0.015em] mb-3 text-t1 leading-snug">
              Series en vivo, junto a tu última sesión.
            </h3>
            <p className="text-xs md:text-sm text-t2 leading-[1.6] mb-6">
              Cada fila muestra cuánto levantaste la última vez. Decides al instante si subir, mantener o ajustar.
            </p>
          </div>
          <div className="bg-bg rounded-lg border border-border p-3.5 mt-auto">
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
        <div className="card p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="label-eyebrow text-accent mb-3.5">02 · Progresión</div>
            <h3 className="text-xl md:text-[22px] font-semibold tracking-[-0.015em] mb-3 text-t1 leading-snug">
              Tus PRs y volumen, semana a semana.
            </h3>
            <p className="text-xs md:text-sm text-t2 leading-[1.6] mb-6">
              Gráficas simples de lo que importa: tu récord personal en los levantamientos clave y el volumen total movido.
            </p>
          </div>
          <div className="bg-bg rounded-lg border border-border p-4 mt-auto">
            {[
              { l: "Press Banca", v: "85 kg",  delta: "+15 kg", weeks: 12 },
              { l: "Sentadilla",  v: "120 kg", delta: "+25 kg", weeks: 12 },
            ].map((item) => (
              <div key={item.l} className="mb-3.5 last:mb-2">
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
        <div className="card p-6 md:p-7 flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="label-eyebrow text-accent mb-3.5">03 · Splits</div>
            <h3 className="text-xl md:text-[22px] font-semibold tracking-[-0.015em] mb-3 text-t1 leading-snug">
              Tu rutina semanal, siempre a mano.
            </h3>
            <p className="text-xs md:text-sm text-t2 leading-[1.6] mb-6">
              Crea tu split con los días que quieras o usa plantillas probadas. Edítalo sin perder el historial.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap mt-auto pt-4 justify-between sm:justify-start">
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
                  {day.today ? "HOY" : "\u00A0"}
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
    <section className="py-16 md:py-24 px-6 md:px-12 bg-surface border-y border-border">
      <div className="max-w-[800px] mx-auto text-center">
        <p className="text-xl md:text-2xl lg:text-[28px] font-medium tracking-[-0.015em] leading-[1.4] text-t1 mb-8">
          &ldquo;Llevaba años usando hojas de cálculo. TrainURSelf hace exactamente eso, pero deja de estorbar cuando entreno.&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          <Avatar name="Ana Ruiz" size={36} />
          <div className="text-left">
            <div className="text-sm md:text-base text-t1 font-medium">Ana Ruiz</div>
            <div className="meta text-xs md:text-sm">Powerlifter · 3 años entrenando</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 md:px-12 py-16 md:py-28 max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
        <div>
          <div className="label-eyebrow mb-3.5 text-accent">Cómo funciona</div>
          <h2 className="text-3xl md:text-[40px] font-semibold tracking-[-0.025em] leading-[1.1] mb-[18px] text-t1">
            De cero a primera sesión en cinco minutos.
          </h2>
          <p className="text-base md:text-[17px] text-t2 leading-[1.6]">
            Sin tutoriales largos, sin formularios. Eliges tu rutina, registras tu primera serie, y la app se queda en segundo plano.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { n: "01", t: "Elige una rutina o crea la tuya", d: "Plantillas Push-Pull-Legs, Full Body, Upper-Lower y Bro Split listas para usar. O construye la tuya día por día, ejercicio por ejercicio." },
            { n: "02", t: "Registra mientras entrenas",      d: "Abre la sesión del día, marca cada serie con un toque. Verás siempre lo que hiciste la última vez al lado de cada serie nueva." },
            { n: "03", t: "Revisa tu progreso cuando quieras", d: "Cada semana ves tus PRs nuevos, volumen total y adherencia. Sin gráficos vanidosos: solo lo que importa para saber si avanzas." },
          ].map((s, i, arr) => (
            <div
              key={s.n}
              className="grid gap-6 py-6"
              style={{
                gridTemplateColumns: "48px 1fr",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="num text-2xl md:text-[28px] font-semibold text-t3 tracking-[-0.01em] leading-none">{s.n}</div>
              <div>
                <h3 className="text-lg md:text-[19px] font-semibold mb-2 text-t1 tracking-[-0.01em]">{s.t}</h3>
                <p className="text-sm md:text-[15px] text-t2 leading-[1.6]">{s.d}</p>
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
    <section className="py-20 md:py-32 px-6 md:px-12 bg-surface border-t border-border">
      <div className="max-w-[720px] mx-auto text-center">
        <h2 className="text-3xl md:text-[36px] font-semibold tracking-[-0.025em] leading-[1.2] mb-5 text-t1">
          Empieza a registrar tu próxima sesión.
        </h2>
        <p className="text-base md:text-[17px] text-t2 leading-[1.6] mb-8">
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
    <footer className="px-6 md:px-12 py-16 bg-bg border-t border-border/60">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12 pb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <span className="text-[20px] font-bold tracking-[-0.025em] text-t1">Elph</span>
            <p className="text-sm text-t2 leading-[1.6] max-w-[280px]">
              El cuaderno de entrenamiento digital premium, minimalista y libre de distracciones. Diseñado para atletas serios.
            </p>
            {/* Social Icons placeholder/minimal SVGs */}
            <div className="flex gap-4.5 mt-2">
              <a href="#" className="text-t3 hover:text-accent transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="text-t3 hover:text-accent transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="text-t3 hover:text-accent transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-t1">Producto</span>
            <ul className="flex flex-col gap-2.5">
              <li><a href="#producto" className="text-sm text-t2 hover:text-t1 transition-colors">Funcionalidades</a></li>
              <li><a href="#como-funciona" className="text-sm text-t2 hover:text-t1 transition-colors">Cómo funciona</a></li>
              <li><a href="#faq" className="text-sm text-t2 hover:text-t1 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Precios</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-t1">Recursos</span>
            <ul className="flex flex-col gap-2.5">
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Guías de Fuerza</a></li>
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Calculadora de 1RM</a></li>
              <li><a href="mailto:hola@trainurself.app" className="text-sm text-t2 hover:text-t1 transition-colors">Soporte</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-t1">Compañía</span>
            <ul className="flex flex-col gap-2.5">
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Privacidad</a></li>
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Términos de Uso</a></li>
              <li><a href="#" className="text-sm text-t2 hover:text-t1 transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom meta */}
        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="meta text-xs">
            © {new Date().getFullYear()} Elph · TrainURSelf. Todos los derechos reservados.
          </div>
          <div className="meta text-xs text-t3">
            Hecho para quien levanta peso de verdad.
          </div>
        </div>
      </div>
    </footer>
  );
}
