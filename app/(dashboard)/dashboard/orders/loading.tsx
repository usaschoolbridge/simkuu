import { TableSkeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="animate-pulse h-8 w-32 rounded-lg bg-black/6" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-9 w-20 rounded-full bg-black/6" />
        ))}
      </div>
      <div className="rounded-2xl border border-black/8 overflow-hidden">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
