"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Icon } from "@/components/Icon";
import type { ProfileData } from "@/server/db/profile";

const PREF_LABELS: Record<string, (v: unknown) => string> = {
  units:              (v) => v === "kg" ? "Métricas (kg, cm)" : "Imperial (lb, in)",
  defaultRestSeconds: (v) => `${v} s`,
  notifications:      (v) => v ? "Activas · solo sesiones" : "Desactivadas",
  theme:              (v) => v === "dark" ? "Oscuro (automático)" : "Claro",
  language:           (v) => v === "es" ? "Español" : String(v),
};

const ACHIEVEMENT_TAG: Record<string, string> = {
  PR:        "PR",
  Streak:    "Racha",
  Milestone: "Hito",
};

function achievedRelativeTime(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7)  return `Hace ${days} días`;
  const weeks = Math.floor(days / 7);
  return `Hace ${weeks} semana${weeks !== 1 ? "s" : ""}`;
}

interface ProfileScreenProps {
  user:    { name: string; email: string };
  profile: ProfileData;
}

export function ProfileScreen({ user, profile }: ProfileScreenProps) {
  const router   = useRouter();
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const { preferences, stats, achievements } = profile;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const prefRows: [string, string][] = [
    ["Unidades",             PREF_LABELS.units(preferences.units)],
    ["Descanso por defecto", PREF_LABELS.defaultRestSeconds(preferences.defaultRestSeconds)],
    ["Notificaciones",       PREF_LABELS.notifications(preferences.notifications)],
    ["Tema",                 PREF_LABELS.theme(preferences.theme)],
    ["Idioma",               PREF_LABELS.language(preferences.language)],
  ];

  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24">
      <div className="grid gap-7 mt-2" style={{ gridTemplateColumns: "1.4fr 1fr" }}>

        {/* ── Left column ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-5 mb-8">
            <div
              className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-2xl font-semibold text-t1 border border-border"
              style={{ background: "linear-gradient(135deg, #2C303A, #1C1F26)" }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.02em] mb-1 text-t1">{user.name}</h1>
              <div className="body text-sm">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5 mb-7">
            {[
              { label: "Sesiones", value: String(stats.sessionsCount) },
              { label: "Semanas",  value: String(stats.weeksTraining) },
              { label: "Objetivo", value: stats.goal                  },
            ].map((s) => (
              <div key={s.label} className="card p-[22px]">
                <div className="label-eyebrow mb-2.5">{s.label}</div>
                <div className="num text-2xl font-semibold text-t1">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-[18px]">
              <div className="label-section">Preferencias</div>
            </div>
            {prefRows.map(([k, v], i, arr) => (
              <div
                key={k}
                className="flex justify-between items-center py-3.5"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(44,48,58,0.5)" : "none" }}
              >
                <span className="text-sm text-t2">{k}</span>
                <span className="text-sm text-t1">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3.5">
          <div className="card p-6">
            <div className="label-section mb-4">Logros recientes</div>
            {achievements.length === 0 ? (
              <div className="body text-[13px] text-t3 py-4 text-center">
                Completa sesiones para desbloquear logros.
              </div>
            ) : (
              achievements.map((a, i) => {
                const tag = ACHIEVEMENT_TAG[a.type] ?? a.type;
                const isPR = a.type === "PR";
                return (
                  <div
                    key={a.id}
                    className="flex justify-between items-center py-3.5"
                    style={{ borderBottom: i < achievements.length - 1 ? "1px solid rgba(44,48,58,0.5)" : "none" }}
                  >
                    <div>
                      <div className="text-sm text-t1 font-medium mb-0.5">{a.title}</div>
                      <div className="meta">
                        {a.subtitle ?? achievedRelativeTime(a.achievedAt)}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-bold tracking-[0.08em] px-2 py-1 rounded"
                      style={{
                        background: isPR ? "rgba(224,123,74,0.12)" : "rgba(91,142,240,0.10)",
                        color:      isPR ? "var(--warn)"           : "var(--accent)",
                      }}
                    >
                      {tag.toUpperCase()}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="card p-6">
            <div className="label-section mb-3.5">Cuenta</div>
            {[
              { label: "Suscripción · TrainURSelf Pro", action: null,         warn: false },
              { label: "Datos y privacidad",            action: null,         warn: false },
              { label: "Exportar mi entrenamiento",     action: null,         warn: false },
              { label: "Cerrar sesión",                 action: handleLogout, warn: true  },
            ].map((item, i, arr) => (
              <button
                key={item.label}
                onClick={() => item.action?.()}
                className="w-full text-left flex justify-between items-center py-3.5 text-sm bg-transparent"
                style={{
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(44,48,58,0.5)" : "none",
                  color:  item.warn ? "var(--warn)" : "var(--text-1)",
                  cursor: item.action ? "pointer" : "default",
                }}
              >
                {item.label}
                <Icon name="chevron-r" size={14} color="var(--text-3)" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
