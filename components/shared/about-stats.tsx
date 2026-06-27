"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/animations/variants";
import { StaggerReveal } from "@/components/motion/reveal";

export function AboutStats({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {stats.map((s) => (
        <motion.div key={s.label} variants={fadeUp} className="text-center">
          <div className="font-display text-4xl md:text-5xl font-black text-black mb-2">{s.value}</div>
          <div className="text-sm text-black/40">{s.label}</div>
        </motion.div>
      ))}
    </StaggerReveal>
  );
}
