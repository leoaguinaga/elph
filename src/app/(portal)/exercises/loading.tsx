export default function ExercisesLoading() {
  return (
    <main className="max-w-[1280px] mx-auto px-12 pt-8 pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="h-3.5 w-24 bg-surface-2 rounded mb-2" />
          <div className="h-8 w-44 bg-surface-2 rounded mb-3" />
          <div className="h-3.5 w-60 bg-surface-2 rounded" />
        </div>
        <div className="h-10 w-36 bg-surface-2 rounded-lg" />
      </div>

      {/* Filter and Search Skeleton */}
      <div className="flex items-center gap-3.5 mb-[22px]">
        <div className="h-10 w-[360px] bg-surface-2/60 border border-border/40 rounded-lg" />
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-16 bg-surface-2 rounded-md" />
          ))}
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="card overflow-hidden p-0 border border-white/5 bg-surface">
        {/* Table Header */}
        <div
          className="grid px-6 py-3.5 border-b border-border text-[11px]"
          style={{ gridTemplateColumns: "2.2fr 1fr 1fr 0.8fr 1fr 24px" }}
        >
          <div className="h-3 w-16 bg-surface-2 rounded" />
          <div className="h-3 w-14 bg-surface-2 rounded" />
          <div className="h-3 w-12 bg-surface-2 rounded" />
          <div className="h-3 w-10 bg-surface-2 rounded justify-self-end" />
          <div className="h-3 w-8 bg-surface-2 rounded justify-self-end" />
          <div />
        </div>

        {/* Table Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid px-6 py-4 items-center border-b border-border/40 last:border-0"
            style={{ gridTemplateColumns: "2.2fr 1fr 1fr 0.8fr 1fr 24px" }}
          >
            <div className="h-4.5 w-52 bg-surface-2 rounded" />
            <div className="h-4 w-20 bg-surface-2 rounded" />
            <div className="h-4 w-20 bg-surface-2 rounded" />
            <div className="h-4 w-8 bg-surface-2 rounded justify-self-end" />
            <div className="h-4 w-12 bg-surface-2 rounded justify-self-end" />
            <div className="h-4 w-4 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
