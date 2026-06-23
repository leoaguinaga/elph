export default function DashboardLoading() {
  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24 animate-pulse">
      <div className="grid gap-10 items-start" style={{ gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)" }}>
        
        {/* Left Column Skeleton */}
        <div>
          {/* Greeting Skeleton */}
          <div className="mb-8">
            <div className="h-3 w-32 bg-surface-2 rounded mb-2.5" />
            <div className="h-8 w-80 bg-surface-2 rounded mb-2" />
            <div className="h-4.5 w-60 bg-surface-2 rounded" />
          </div>

          {/* Today Card Skeleton */}
          <div className="card p-7 bg-surface border border-white/5 opacity-80 min-h-[160px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4.5 w-32 bg-surface-2 rounded" />
              <div className="h-3 w-48 bg-surface-2 rounded" />
            </div>
            <div className="flex gap-2.5 mt-8">
              <div className="h-10 w-28 bg-surface-2 rounded-lg" />
              <div className="h-10 w-28 bg-surface-2 rounded-lg" />
            </div>
          </div>

          {/* Week Strip Skeleton */}
          <div className="mt-10">
            <div className="flex justify-between items-baseline mb-4">
              <div className="h-3.5 w-24 bg-surface-2 rounded" />
              <div className="h-3.5 w-16 bg-surface-2 rounded" />
            </div>
            <div className="flex gap-3.5 mb-5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-surface-2/40" />
                  <div className="h-2 w-3 bg-surface-2 rounded" />
                </div>
              ))}
            </div>
            <div className="h-3.5 w-60 bg-surface-2 rounded" />
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex flex-col gap-3.5">
          {/* Weight Card Skeleton */}
          <div className="card p-[22px] bg-surface border border-white/5 opacity-80">
            <div className="flex justify-between items-start mb-4">
              <div className="h-3 w-12 bg-surface-2 rounded" />
              <div className="h-3 w-16 bg-surface-2 rounded" />
            </div>
            <div className="h-8 w-24 bg-surface-2 rounded mb-2" />
            <div className="h-3 w-36 bg-surface-2 rounded mb-4" />
            <div className="h-12 w-full bg-surface-2/40 rounded-lg" />
          </div>

          {/* Next Session Skeleton */}
          <div className="card p-[22px] bg-surface border border-white/5 opacity-80">
            <div className="h-3 w-24 bg-surface-2 rounded mb-3" />
            <div className="h-5.5 w-40 bg-surface-2 rounded mb-2" />
            <div className="h-3.5 w-20 bg-surface-2 rounded" />
          </div>

          {/* Last PR Skeleton */}
          <div className="card p-[22px] bg-surface border border-white/5 opacity-80">
            <div className="flex justify-between items-start mb-3">
              <div className="h-3 w-20 bg-surface-2 rounded" />
              <div className="h-4.5 w-8 bg-surface-2 rounded" />
            </div>
            <div className="h-5.5 w-48 bg-surface-2 rounded mb-2" />
            <div className="h-3.5 w-32 bg-surface-2 rounded" />
          </div>

          {/* Tip Skeleton */}
          <div className="bg-surface border-l-[3px] border-accent/40 rounded-md px-[18px] py-4 space-y-3">
            <div className="h-3 w-20 bg-surface-2 rounded" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-surface-2 rounded" />
              <div className="h-3.5 w-[90%] bg-surface-2 rounded" />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
