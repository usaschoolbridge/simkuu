import { StatCardsSkeleton, EsimCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Page title */}
      <div className="space-y-2">
        <div className="animate-pulse h-8 w-40 rounded-lg bg-black/6" />
        <div className="animate-pulse h-5 w-64 rounded-lg bg-black/6" />
      </div>

      {/* Stat cards */}
      <StatCardsSkeleton />

      {/* Two-column lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-black/8 p-5">
            <div className="animate-pulse h-6 w-32 rounded-lg bg-black/6 mb-4" />
            <EsimCardSkeleton count={3} />
          </div>
        </div>
        <div className="rounded-2xl border border-black/8 p-5 space-y-4">
          <div className="animate-pulse h-6 w-28 rounded-lg bg-black/6" />
          <TableSkeleton rows={5} cols={2} />
        </div>
      </div>
    </div>
  );
}
