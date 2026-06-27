import { BlogCardsSkeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen pt-32">
      <div className="container-xl space-y-4 mb-12 text-center">
        <div className="animate-pulse h-8 w-32 rounded-full bg-black/6 mx-auto" />
        <div className="animate-pulse h-14 w-2/3 rounded-lg bg-black/6 mx-auto" />
        <div className="animate-pulse h-5 w-1/2 rounded-lg bg-black/6 mx-auto" />
      </div>
      <div className="container-xl">
        <BlogCardsSkeleton count={6} />
      </div>
    </div>
  );
}
