import { EsimCardSkeleton } from "@/components/ui/skeleton";

export default function EsimsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="animate-pulse h-8 w-32 rounded-lg bg-black/6" />
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-9 w-20 rounded-full bg-black/6" />
        ))}
      </div>
      <EsimCardSkeleton count={4} />
    </div>
  );
}
