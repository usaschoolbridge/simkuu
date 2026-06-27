"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const TESTIMONIALS = [
  { id: 1, name: "Marcus Johnson", role: "Software Engineer, NYC", rating: 5, content: "Switched from my carrier's physical SIM. The activation took literally 90 seconds. T-Mobile 5G is blazing fast.", carrier: "T-Mobile", verified: true },
  { id: 2, name: "Priya Patel", role: "Remote Worker, Austin", rating: 5, content: "I travel across states weekly. Simkuu's Verizon plan keeps me connected even in rural areas. Absolutely premium.", carrier: "Verizon", verified: true },
  { id: 3, name: "Jake Rodriguez", role: "Content Creator, LA", rating: 5, content: "Hotspot works flawlessly for live streaming. AT&T coverage in downtown LA is unmatched. 10/10 would recommend.", carrier: "AT&T", verified: true },
  { id: 4, name: "Sarah Kim", role: "Startup Founder, Seattle", rating: 5, content: "Onboarded my whole team to the MVNO plan. Saved 40% compared to our old carrier. Setup was insanely easy.", carrier: "MVNO", verified: true },
  { id: 5, name: "David Chen", role: "Consultant, Chicago", rating: 5, content: "Best eSIM experience I've had. The QR code arrived before I even finished reading the confirmation email.", carrier: "T-Mobile", verified: true },
  { id: 6, name: "Ashley Williams", role: "Nurse, Houston", rating: 5, content: "Priority data on Verizon means I never drop a call with patients. Simkuu made the switch effortless.", carrier: "Verizon", verified: true },
  { id: 7, name: "Omar Farouk", role: "Student, Miami", rating: 5, content: "Most affordable unlimited plan I found. MVNO on T-Mobile gives me full 5G. Perfect for a college budget.", carrier: "MVNO", verified: true },
  { id: 8, name: "Lisa Park", role: "Digital Nomad, San Francisco", rating: 5, content: "Changed plans twice in one month based on where I was. Zero contract headaches. This is the future of mobile.", carrier: "AT&T", verified: true },
];

const CARRIER_COLORS: Record<string, string> = {
  "T-Mobile": "#E20074",
  Verizon: "#CD040B",
  "AT&T": "#00A8E0",
  MVNO: "#8B5CF6",
};

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  const color = CARRIER_COLORS[t.carrier] ?? "#3B82F6";

  return (
    <div className="w-80 lg:w-96 shrink-0 mx-3">
      <div className="relative h-full rounded-2xl bg-white border border-black/[0.06] shadow-md p-6 overflow-hidden group hover:shadow-lg transition-shadow duration-300">
        {/* Carrier color accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />

        {/* Quote icon */}
        <div className="absolute top-4 right-5 opacity-5 group-hover:opacity-10 transition-opacity">
          <Quote className="w-16 h-16 text-black" />
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Content */}
        <p className="text-black/70 text-sm leading-relaxed mb-5 relative">
          &ldquo;{t.content}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {t.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-black">{t.name}</div>
            <div className="text-xs text-black/40">{t.role}</div>
          </div>
          <div className="ml-auto">
            <div
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color, background: color + "15" }}
            >
              {t.carrier}
            </div>
          </div>
        </div>

        {/* Verified badge */}
        {t.verified && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
            <div className="w-3 h-3 rounded-full bg-emerald-100 flex items-center justify-center text-[8px]">✓</div>
            Verified
          </div>
        )}
      </div>
    </div>
  );
}

function MarqueeRow({ testimonials, direction = 1, speed = 40 }: {
  testimonials: typeof TESTIMONIALS;
  direction?: 1 | -1;
  speed?: number;
}) {
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth / 2);
    }
  }, []);

  useAnimationFrame((_, delta) => {
    if (paused || !width) return;
    x.set((x.get() + (direction * speed * delta) / 1000) % width);
  });

  const doubled = [...testimonials, ...testimonials];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        ref={containerRef}
        style={{ x: direction === -1 ? x : useMotionValue(0) }}
        className="flex"
      >
        {direction === 1 ? (
          <motion.div style={{ x }} className="flex">
            {doubled.map((t, i) => <TestimonialCard key={`${t.id}-${i}`} t={t} />)}
          </motion.div>
        ) : (
          <motion.div style={{ x: useMotionValue(0) }} className="flex">
            {doubled.map((t, i) => <TestimonialCard key={`${t.id}-${i}`} t={t} />)}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function AutoScrollRow({ testimonials, reverse = false }: { testimonials: typeof TESTIMONIALS; reverse?: boolean }) {
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const speed = 35;

  useEffect(() => {
    if (ref.current) setWidth(ref.current.scrollWidth / 2);
  }, []);

  useAnimationFrame((_, delta) => {
    if (paused || !width) return;
    const direction = reverse ? 1 : -1;
    let next = x.get() + (direction * speed * delta) / 1000;
    if (Math.abs(next) >= width) next = 0;
    x.set(next);
  });

  const doubled = [...testimonials, ...testimonials];

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div ref={ref} style={{ x }} className="flex py-3">
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const row1 = TESTIMONIALS.slice(0, half);
  const row2 = TESTIMONIALS.slice(half);

  return (
    <section className="section-padding bg-[#FAFAFA] relative overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.03) 0%, transparent 70%)"
      }} />

      <div className="container-xl mb-12">
        <div className="text-center">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              Customer Reviews
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
              Loved by{" "}
              <span className="text-gradient">250,000+</span> users
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-lg font-bold text-black ml-1">4.9</span>
              <span className="text-black/40">/ 5 average rating</span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Scrolling rows */}
      <div className="space-y-3">
        <AutoScrollRow testimonials={row1} />
        <AutoScrollRow testimonials={row2} reverse />
      </div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent pointer-events-none z-10" />
    </section>
  );
}
