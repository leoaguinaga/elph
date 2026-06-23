"use client";

import { Sparkline } from "@/components/Sparkline";
import type { ProgressStats, VolumeDataPoint } from "@/server/db/progress";

type PRPoint = { week: number; weightKg: number };

interface ProgressScreenProps {
  stats:         ProgressStats;
  benchHistory:  PRPoint[];
  squatHistory:  PRPoint[];
  weeklyVolume:  VolumeDataPoint[];
}

export function ProgressScreen({
  stats,
  benchHistory,
  squatHistory,
  weeklyVolume,
}: ProgressScreenProps) {
  const benchData = benchHistory.map((p) => p.weightKg);
  const squatData = squatHistory.map((p) => p.weightKg);
  const volumeData = weeklyVolume.map((p) => p.volumeKg);
  const maxVol = Math.max(...volumeData, 1);

  const benchLast  = benchData[benchData.length - 1]  ?? 0;
  const squatLast  = squatData[squatData.length - 1]  ?? 0;
  const benchDelta = benchLast - (benchData[0] ?? 0);
  const squatDelta = squatLast - (squatData[0] ?? 0);

  const volumeTonne = (stats.totalVolumeKg / 1000).toFixed(1);
  const volumeDeltaPct = stats.prevTotalVolumeKg > 0
    ? Math.round(((stats.totalVolumeKg - stats.prevTotalVolumeKg) / stats.prevTotalVolumeKg) * 100)
    : 0;

  const sessionsDelta = stats.sessionsCount - stats.prevSessionsCount;

  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24">
      <div className="mb-7">
        <div className="meta mb-2">Últimas 8 semanas</div>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] m-0 text-t1">Progreso</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <div className="card p-[22px]">
          <div className="label-eyebrow mb-2.5">Sesiones</div>
          <div className="num text-[28px] font-semibold tracking-[-0.02em] text-t1">
            {stats.sessionsCount}
          </div>
          <div className={`text-xs mt-1 font-medium ${sessionsDelta >= 0 ? "text-success" : "text-warn"}`}>
            {sessionsDelta >= 0 ? "+" : ""}{sessionsDelta} vs anterior
          </div>
        </div>

        <div className="card p-[22px]">
          <div className="label-eyebrow mb-2.5">Volumen total</div>
          <div className="num text-[28px] font-semibold tracking-[-0.02em] text-t1">
            {stats.totalVolumeKg >= 1000 ? `${volumeTonne} t` : `${stats.totalVolumeKg} kg`}
          </div>
          <div className={`text-xs mt-1 font-medium ${volumeDeltaPct >= 0 ? "text-success" : "text-warn"}`}>
            {volumeDeltaPct > 0 ? "+" : ""}{volumeDeltaPct}%
          </div>
        </div>

        <div className="card p-[22px]">
          <div className="label-eyebrow mb-2.5">PRs nuevos</div>
          <div className="num text-[28px] font-semibold tracking-[-0.02em] text-t1">
            {stats.newPRsCount}
          </div>
          <div className="text-xs mt-1 font-medium text-warn">
            esta semana
          </div>
        </div>

        <div className="card p-[22px]">
          <div className="label-eyebrow mb-2.5">Adherencia</div>
          <div className="num text-[28px] font-semibold tracking-[-0.02em] text-t1">
            {stats.adherencePct}%
          </div>
          <div className={`text-xs mt-1 font-medium ${stats.adherencePct >= 80 ? "text-success" : "text-warn"}`}>
            {stats.sessionsCount} de {Math.round(stats.sessionsCount / Math.max(stats.adherencePct / 100, 0.01))} sesiones
          </div>
        </div>
      </div>

      {/* PR sparklines */}
      {(benchData.some((v) => v > 0) || squatData.some((v) => v > 0)) ? (
        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          {[
            { title: "Press Banca · PR", data: benchData, last: benchLast, delta: benchDelta },
            { title: "Sentadilla · PR",  data: squatData, last: squatLast, delta: squatDelta },
          ].filter(({ data }) => data.some((v) => v > 0)).map(({ title, data, last, delta }) => (
            <div key={title} className="card p-6">
              <div className="flex justify-between items-start mb-[18px]">
                <div>
                  <div className="label-eyebrow mb-1.5">{title}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="num text-[28px] font-semibold text-t1">{last}</span>
                    <span className="text-sm text-t2">kg</span>
                    {delta > 0 && (
                      <span className="num text-xs text-success ml-1.5">+{delta} kg</span>
                    )}
                  </div>
                  <div className="meta mt-1.5">Mejor serie por semana</div>
                </div>
              </div>
              <Sparkline data={data} color="var(--accent)" width={520} height={120} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 mb-3.5 text-center py-12">
          <div className="body text-t3">Registra tus entrenamientos para ver tu progreso en los ejercicios principales.</div>
        </div>
      )}

      {/* Volume bar chart */}
      <div className="card p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="label-eyebrow mb-1.5">Volumen semanal</div>
            <div className="text-sm text-t2">Kilogramos totales movidos por semana</div>
          </div>
        </div>
        {volumeData.some((v) => v > 0) ? (
          <div className="flex items-stretch gap-3.5 h-[180px] px-1">
            {weeklyVolume.map((v, i) => {
              const h      = (v.volumeKg / maxVol) * 100;
              const isLast = i === weeklyVolume.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(h, 2)}%`, background: isLast ? "var(--accent)" : "var(--surface-2)" }}
                    />
                  </div>
                  <span className="text-[11px] text-t3">{v.weekLabel}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-t3 body text-sm">
            Sin datos de volumen aún.
          </div>
        )}
      </div>
    </main>
  );
}
