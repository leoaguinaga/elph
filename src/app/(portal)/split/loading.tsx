export default function SplitLoading() {
  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="h-4 w-28 bg-surface-2 rounded mb-2" />
          <div className="h-8 w-64 bg-surface-2 rounded mb-3" />
          <div className="h-4 w-48 bg-surface-2 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-surface-2 rounded-lg" />
          <div className="h-10 w-28 bg-surface-2 rounded-lg" />
        </div>
      </div>

      {/* Grid of Day Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="card p-6 bg-surface border border-white/5 opacity-70">
            <div className="flex justify-between items-center mb-4">
              <div className="h-3 w-20 bg-surface-2 rounded" />
              <div className="h-3 w-16 bg-surface-2 rounded" />
            </div>
            <div className="h-6 w-44 bg-surface-2 rounded mb-4" />
            <div className="flex gap-1.5 mb-5">
              <div className="h-6 w-12 bg-surface-2 rounded-md" />
              <div className="h-6 w-16 bg-surface-2 rounded-md" />
              <div className="h-6 w-14 bg-surface-2 rounded-md" />
            </div>
            <div className="pt-4 border-t border-border/50 flex justify-between items-center">
              <div className="h-3.5 w-20 bg-surface-2 rounded" />
              <div className="h-3.5 w-16 bg-surface-2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
