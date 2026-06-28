import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Static sample posts for now
const SAMPLE_POSTS: Record<string, { title: string; date: string; content: string; description: string }> = {
  "how-to-activate-esim-usa": {
    title: "How to Activate Your eSIM in the USA",
    date: "January 15, 2025",
    description: "Step-by-step guide to activating your Simkuu eSIM on any compatible device.",
    content: `eSIM technology makes it easier than ever to get connected in the USA without needing a physical SIM card. Here's how to activate yours...`,
  },
  "tmobile-vs-verizon-esim": {
    title: "T-Mobile vs Verizon eSIM: Which is Better?",
    date: "January 10, 2025",
    description: "A detailed comparison of T-Mobile and Verizon eSIM coverage, speeds, and pricing.",
    content: `Choosing between T-Mobile and Verizon for your USA eSIM? We break down coverage, pricing, and performance...`,
  },
  "best-esim-for-tourists-usa": {
    title: "Best eSIM Plans for Tourists Visiting the USA",
    date: "January 5, 2025",
    description: "Find the perfect eSIM plan for your trip to the United States.",
    content: `Planning a trip to the USA? A Simkuu eSIM is the most convenient way to stay connected...`,
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = SAMPLE_POSTS[slug];
  if (!post) return { title: "Post Not Found | Simkuu Blog" };
  return {
    title: `${post.title} | Simkuu Blog`,
    description: post.description,
    alternates: { canonical: `https://simkuu.com/blog/${slug}` },
    openGraph: { title: post.title, description: post.description, url: `https://simkuu.com/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = SAMPLE_POSTS[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-black/[0.06]">
        <div className="container-xl py-16">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <p className="text-sm text-blue-600 font-medium mb-3">{post.date}</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-black max-w-3xl">{post.title}</h1>
        </div>
      </div>
      <div className="container-xl py-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-black/60 leading-relaxed mb-8">{post.description}</p>
          <div className="prose prose-gray max-w-none">
            <p>{post.content}</p>
          </div>
          <div className="mt-16 pt-8 border-t border-black/[0.06]">
            <Link href="/plans" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              Get Your eSIM Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
