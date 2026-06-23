export default function ProgressLoading() {
  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24 animate-pulse">
      {/* Title Skeleton */}
      <div className="mb-7">
        <div className="h-3.5 w-28 bg-surface-2 rounded mb-2" />
        <div className="h-8 w-40 bg-surface-2 rounded" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-[22px] bg-surface border border-white/5 opacity-85">
            <div className="h-3 w-16 bg-surface-2 rounded mb-2.5" />
            <div className="h-7 w-20 bg-surface-2 rounded mb-2" />
            <div className="h-3 w-24 bg-surface-2 rounded" />
          </div>
        ))}
      </div>

      {/* PR Sparklines Row Skeleton */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-6 bg-surface border border-white/5 opacity-85">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-surface-2 rounded" />
                <div className="flex items-baseline gap-2">
                  <div className="h-7 w-16 bg-surface-2 rounded" />
                  <div className="h-3.5 w-6 bg-surface-2 rounded" />
                </div>
                <div className="h-3.5 w-32 bg-surface-2 rounded" />
              </div>
            </div>
            {/* Sparkline chart placeholder */}
            <div className="h-[120px] w-full bg-surface-2/40 rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }} />
          </div>
        ))}
      </div>

      {/* Volume chart Skeleton */}
      <div className="card p-6 bg-surface border border-white/5 opacity-85">
        <div className="h-3 w-28 bg-surface-2 rounded mb-3" />
        <div className="h-[160px] w-full bg-surface-2/40 rounded-lg" style={{ backgroundColor: 'var(--surface-2)' }} />
      </div>
    </main>
  );
}
