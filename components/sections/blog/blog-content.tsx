"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { fadeUp } from "@/animations/variants";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

const POSTS = [
  { slug: "what-is-esim", title: "What is an eSIM? Complete Beginner's Guide", excerpt: "Everything you need to know about embedded SIM technology — how it works, which phones support it, and why it's replacing physical SIM cards.", tag: "Guide", readTime: 7, date: "June 15, 2026", featured: true },
  { slug: "t-mobile-vs-verizon", title: "T-Mobile vs Verizon: Which Network is Right for You?", excerpt: "We compare coverage, speeds, pricing, and reliability head-to-head so you can make the best choice for your lifestyle.", tag: "Comparison", readTime: 9, date: "June 10, 2026", featured: true },
  { slug: "esim-activation-guide", title: "How to Activate Your eSIM in Under 2 Minutes", excerpt: "Step-by-step activation guide for iPhone, Android, and Samsung Galaxy devices. QR code method and manual entry covered.", tag: "Tutorial", readTime: 5, date: "June 5, 2026", featured: false },
  { slug: "best-esim-plans-2026", title: "Best USA eSIM Plans in 2026", excerpt: "We reviewed every major carrier and ranked the best value eSIM plans by data, price, and network quality.", tag: "Review", readTime: 11, date: "June 1, 2026", featured: false },
  { slug: "mvno-explained", title: "MVNOs Explained: How to Get T-Mobile at Half the Price", excerpt: "Mobile Virtual Network Operators run on the same towers as the big carriers. Here's how they work and why you should care.", tag: "Education", readTime: 6, date: "May 28, 2026", featured: false },
  { slug: "5g-esim-guide", title: "5G eSIM: What You Need to Know in 2026", excerpt: "Not all 5G is created equal. We break down the difference between Sub-6, mmWave, and C-Band 5G and which eSIM gives you access.", tag: "Guide", readTime: 8, date: "May 22, 2026", featured: false },
];

const TAG_COLORS: Record<string, string> = {
  Guide: "bg-blue-50 text-blue-600 border-blue-100",
  Comparison: "bg-purple-50 text-purple-600 border-purple-100",
  Tutorial: "bg-green-50 text-green-600 border-green-100",
  Review: "bg-amber-50 text-amber-600 border-amber-100",
  Education: "bg-cyan-50 text-cyan-600 border-cyan-100",
};

function PostCard({ post, large = false }: { post: typeof POSTS[0]; large?: boolean }) {
  return (
    <motion.article variants={fadeUp}>
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <div className={`h-full rounded-2xl bg-white border border-black/[0.06] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${large ? "flex flex-col md:flex-row" : ""}`}>
          <div className={`bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center ${large ? "md:w-2/5 h-48 md:h-auto" : "h-44"}`}>
            <BookOpen className="w-10 h-10 text-blue-300" />
          </div>
          <div className={`p-6 flex flex-col ${large ? "flex-1" : ""}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TAG_COLORS[post.tag] ?? ""}`}>{post.tag}</span>
              <span className="flex items-center gap-1 text-xs text-black/30"><Clock className="w-3 h-3" /> {post.readTime} min read</span>
            </div>
            <h2 className={`font-display font-bold text-black leading-tight mb-2 group-hover:text-gradient transition-all ${large ? "text-2xl md:text-3xl" : "text-lg"}`}>{post.title}</h2>
            <p className="text-sm text-black/50 leading-relaxed flex-1 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/30">{post.date}</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">Read more <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function BlogContent() {
  const featured = POSTS.filter((p) => p.featured);
  const rest = POSTS.filter((p) => !p.featured);

  return (
    <section className="pt-32 pb-16">
      <div className="container-xl">
        <div className="text-center mb-14">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-medium mb-6">
              <BookOpen className="w-3.5 h-3.5" /> Blog
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
              eSIM insights & <span className="text-gradient">guides</span>
            </h1>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-xl text-black/50 max-w-xl mx-auto">Tips, comparisons, and tutorials from the team that lives and breathes eSIM.</p>
          </Reveal>
        </div>
        <StaggerReveal className="grid grid-cols-1 gap-5 mb-5">
          {featured.map((p) => <PostCard key={p.slug} post={p} large />)}
        </StaggerReveal>
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((p) => <PostCard key={p.slug} post={p} />)}
        </StaggerReveal>
      </div>
    </section>
  );
}
