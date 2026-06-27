import { HeroSkeleton, SectionSkeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="min-h-screen">
      <HeroSkeleton />
      <SectionSkeleton rows={4} />
      <SectionSkeleton rows={3} />
    </div>
  );
}
