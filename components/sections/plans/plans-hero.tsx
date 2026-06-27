"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function PlansHero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />

      <div className="container-xl relative text-center">
        <Reveal variant="fadeUp">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            All Plans
          </div>
        </Reveal>
        <Reveal variant="fadeUp" delay={0.1}>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-black tracking-tight mb-6">
            Find your perfect{" "}
            <span className="text-gradient">eSIM plan</span>
          </h1>
        </Reveal>
        <Reveal variant="fadeUp" delay={0.2}>
          <p className="text-xl text-black/50 max-w-2xl mx-auto leading-relaxed">
            All four major USA networks. Every budget. Zero contracts.
            Filter by carrier, data, or price to find exactly what you need.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
