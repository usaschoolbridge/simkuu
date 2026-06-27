import { AdminKPISkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Alert banners */}
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse h-12 w-full rounded-xl bg-white/6" />
        ))}
      </div>

      {/* KPI cards */}
      <AdminKPISkeleton />

      {/* Sparkline placeholder */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <div className="animate-pulse h-6 w-32 rounded-lg bg-white/10 mb-4" />
        <div className="animate-pulse h-40 w-full rounded-lg bg-white/6" />
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <div className="animate-pulse h-6 w-32 rounded-lg bg-white/10 mb-4" />
        <TableSkeleton rows={6} cols={6} />
      </div>
    </div>
  );
}
