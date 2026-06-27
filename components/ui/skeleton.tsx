import { cn } from "@/lib/utils";

/** Base pulse skeleton block */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-black/6", className)} />
  );
}

// ── Page-level skeletons ──────────────────────────────────────────────────────

/** Hero section skeleton — full-width above-the-fold */
export function HeroSkeleton() {
  return (
    <section className="pt-32 pb-24 px-4">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <Skeleton className="h-6 w-40 mx-auto rounded-full" />
        <Skeleton className="h-16 w-3/4 mx-auto" />
        <Skeleton className="h-16 w-2/3 mx-auto" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
        <div className="flex gap-4 justify-center mt-8">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-4 gap-8 max-w-2xl mx-auto mt-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-24 mx-auto" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Card grid skeleton — for plans, carrier cards etc */
export function CardGridSkeleton({ count = 3, cols = 3 }: { count?: number; cols?: number }) {
  const colClass = cols === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid ${colClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-black/8 p-6 space-y-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}

/** Full page section skeleton */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto mb-12" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </section>
  );
}

// ── Dashboard skeletons ───────────────────────────────────────────────────────

/** Dashboard stat cards row */
export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-black/8 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Dashboard eSIM card skeleton */
export function EsimCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-black/8 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Table skeleton */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className={`grid gap-4 p-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid gap-4 p-4 border-t border-black/5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-5 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Admin dashboard KPI skeleton */
export function AdminKPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/8 p-5 bg-white/3 space-y-3">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-8 w-32 bg-white/10" />
          <Skeleton className="h-4 w-20 bg-white/10" />
        </div>
      ))}
    </div>
  );
}

/** Blog card grid skeleton */
export function BlogCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-black/8 overflow-hidden">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Checkout skeleton */
export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto px-4 py-24">
      <div className="lg:col-span-3 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="rounded-2xl border border-black/8 p-6 space-y-5">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="rounded-2xl border border-black/8 p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-black/8 p-6 space-y-5 sticky top-24">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
