export default function ProfileLoading() {
  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24 animate-pulse">
      <div className="grid gap-7 mt-2" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        
        {/* Left Column Skeleton */}
        <div>
          {/* User Info Skeleton */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-[76px] h-[76px] rounded-full bg-surface-2" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-surface-2 rounded" />
              <div className="h-4 w-44 bg-surface-2 rounded" />
            </div>
          </div>

          {/* Quick Stats Grid Skeleton */}
          <div className="grid grid-cols-3 gap-3.5 mb-7">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-[22px] bg-surface border border-white/5 opacity-85">
                <div className="h-3 w-16 bg-surface-2 rounded mb-2.5" />
                <div className="h-6 w-12 bg-surface-2 rounded" />
              </div>
            ))}
          </div>

          {/* Preferences Settings Skeleton */}
          <div className="card p-6 bg-surface border border-white/5 opacity-85">
            <div className="h-3.5 w-24 bg-surface-2 rounded mb-5" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-border/40 last:border-0"
              >
                <div className="h-4 w-32 bg-surface-2 rounded" />
                <div className="h-4 w-28 bg-surface-2 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="flex flex-col gap-3.5">
          {/* Recent Achievements Skeleton */}
          <div className="card p-6 bg-surface border border-white/5 opacity-85">
            <div className="h-3.5 w-32 bg-surface-2 rounded mb-5" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-border/40 last:border-0"
              >
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-surface-2 rounded" />
                  <div className="h-3 w-16 bg-surface-2 rounded" />
                </div>
                <div className="h-6 w-12 bg-surface-2 rounded" />
              </div>
            ))}
          </div>

          {/* Account Actions Skeleton */}
          <div className="card p-6 bg-surface border border-white/5 opacity-85">
            <div className="h-3.5 w-16 bg-surface-2 rounded mb-5" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-border/40 last:border-0"
              >
                <div className="h-4 w-40 bg-surface-2 rounded" />
                <div className="h-4.5 w-4 bg-surface-2 rounded" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
