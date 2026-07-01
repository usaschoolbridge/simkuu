"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const REVIEWS = [
  {
    name: "Arjun Mehta",
    location: "New York, USA",
    rating: 5,
    text: "Got my USA number in 30 seconds flat. Activated before I even left the website. Verified OTPs from Google and Apple straight away. Incredible.",
    plan: "USA Unlimited",
    avatar: "AM",
    color: "#3B82F6",
  },
  {
    name: "Priya Sharma",
    location: "Texas, USA",
    rating: 5,
    text: "Was skeptical about crypto payment but it worked perfectly. eSIM QR code came instantly. 5G is blazing fast in Houston. No issues at all.",
    plan: "USA 15GB",
    avatar: "PS",
    color: "#8B5CF6",
  },
  {
    name: "Rahul Singh",
    location: "California, USA",
    rating: 5,
    text: "Tried 3 other eSIM providers before Simkuu. Nothing compares. Price is fair, support replied in 2 minutes, and coverage is perfect coast to coast.",
    plan: "USA Unlimited",
    avatar: "RS",
    color: "#06B6D4",
  },
  {
    name: "Divya Patel",
    location: "Illinois, USA",
    rating: 5,
    text: "Moving to the US for work, needed a number urgently. Simkuu sorted me out before I even cleared customs. Received OTPs instantly. 10/10.",
    plan: "USA Value",
    avatar: "DP",
    color: "#10B981",
  },
  {
    name: "Vikram Nair",
    location: "Florida, USA",
    rating: 5,
    text: "The QR code scan took 90 seconds and I had full 5G coverage. No paperwork, no store visit, no ID proof needed. This is how it should be.",
    plan: "USA Premium",
    avatar: "VN",
    color: "#6366F1",
  },
  {
    name: "Ananya Krishnan",
    location: "Washington, USA",
    rating: 5,
    text: "Used USDT to pay — payment confirmed instantly. Support helped me set up the eSIM on my Pixel 8. These guys actually care about customers.",
    plan: "USA Unlimited",
    avatar: "AK",
    color: "#F59E0B",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: typeof REVIEWS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="card-premium p-6 flex flex-col gap-4 h-full"
    >
      <div className="flex items-start justify-between">
        <StarRating count={review.rating} />
        <span className="text-[10px] text-black/30 font-medium px-2 py-1 rounded-full bg-black/[0.03] border border-black/[0.06]">
          {review.plan}
        </span>
      </div>

      <p className="text-sm text-black/70 leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>

      <div className="flex items-center gap-3 pt-2 border-t border-black/[0.06]">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: review.color }}
        >
          {review.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-black">{review.name}</div>
          <div className="text-xs text-black/40">{review.location}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function SocialProof() {
  return (
    <section className="section-padding bg-gray-50/50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(226,0,116,0.04) 0%, transparent 60%)" }}
      />

      <div className="container-xl relative">
        {/* Header */}
        <div className="text-center mb-14">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              Rated 4.9 / 5 by 25,000+ customers
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl font-black text-black leading-tight tracking-tight mb-4">
              Real people.{" "}
              <span className="text-gradient">Real results.</span>
            </h2>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-lg text-black/50 max-w-xl mx-auto">
              Over 25,000 customers connected — mostly Indians living and working in the USA.
            </p>
          </Reveal>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REVIEWS.map((review, i) => (
            <ReviewCard key={review.name} review={review} index={i} />
          ))}
        </div>

        {/* Bottom aggregate */}
        <Reveal variant="fadeUp" delay={0.3} className="flex justify-center mt-12">
          <div className="flex items-center gap-6 px-8 py-4 rounded-2xl glass border border-black/[0.06] shadow-lg">
            <div className="text-center">
              <div className="font-display text-3xl font-black text-black">4.9</div>
              <StarRating count={5} />
              <div className="text-xs text-black/40 mt-1">Average rating</div>
            </div>
            <div className="w-px h-12 bg-black/10" />
            <div className="text-center">
              <div className="font-display text-3xl font-black text-black">25K+</div>
              <div className="text-xs text-black/40 mt-1">Happy customers</div>
            </div>
            <div className="w-px h-12 bg-black/10" />
            <div className="text-center">
              <div className="font-display text-3xl font-black text-black">99.8%</div>
              <div className="text-xs text-black/40 mt-1">Activation success</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
