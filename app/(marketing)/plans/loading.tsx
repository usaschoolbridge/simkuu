import { SectionSkeleton, CardGridSkeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <div className="min-h-screen pt-32">
      <div className="container-xl space-y-6 mb-16 text-center">
        <div className="animate-pulse h-8 w-40 rounded-full bg-black/6 mx-auto" />
        <div className="animate-pulse h-14 w-2/3 rounded-lg bg-black/6 mx-auto" />
        <div className="animate-pulse h-5 w-1/2 rounded-lg bg-black/6 mx-auto" />
      </div>
      <div className="container-xl">
        <CardGridSkeleton count={6} cols={3} />
      </div>
      <SectionSkeleton rows={4} />
    </div>
  );
}
