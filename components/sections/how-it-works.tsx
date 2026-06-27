"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShoppingCart, Mail, QrCode, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    icon: ShoppingCart,
    step: "01",
    title: "Choose Your Plan",
    description: "Browse our carrier plans and select the one that fits your needs and budget.",
    color: "#3B82F6",
    light: "rgba(59,130,246,0.1)",
  },
  {
    icon: ShoppingCart,
    step: "02",
    title: "Instant Purchase",
    description: "Check out securely with Stripe, PayPal, Apple Pay, or crypto in seconds.",
    color: "#8B5CF6",
    light: "rgba(139,92,246,0.1)",
  },
  {
    icon: Mail,
    step: "03",
    title: "Receive Your QR Code",
    description: "Your eSIM QR code is delivered instantly to your email inbox.",
    color: "#06B6D4",
    light: "rgba(6,182,212,0.1)",
  },
  {
    icon: QrCode,
    step: "04",
    title: "Scan & Activate",
    description: "Scan the QR code in your phone settings. You're live in under 2 minutes.",
    color: "#10B981",
    light: "rgba(16,185,129,0.1)",
  },
];

function StepCard({ step: s, index }: { step: typeof STEPS[0]; index: number }) {
  const Icon = s.icon;

  return (
    <Reveal variant="fadeUp" delay={index * 0.1}>
      <div className="relative group">
        {/* Connector line */}
        {index < STEPS.length - 1 && (
          <div className="hidden lg:block absolute top-10 left-[calc(100%_-_1rem)] w-[calc(100%_-_2rem)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-black/10 to-black/5" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.3, duration: 0.8 }}
            />
          </div>
        )}

        <div className="text-center">
          {/* Step icon */}
          <div className="relative inline-flex mb-6">
            <motion.div
              className="w-20 h-20 rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: s.light }}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-8 h-8" style={{ color: s.color }} />
            </motion.div>

            {/* Step number */}
            <div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg"
              style={{ background: s.color }}
            >
              {index + 1}
            </div>
          </div>

          <h3 className="font-display font-bold text-lg text-black mb-2">{s.title}</h3>
          <p className="text-sm text-black/50 leading-relaxed max-w-[200px] mx-auto">{s.description}</p>
        </div>
      </div>
    </Reveal>
  );
}

function TimelineBar() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 20%"] });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="hidden lg:block relative h-0.5 bg-black/5 mx-16 mb-16 overflow-visible">
      <motion.div
        style={{ scaleX, originX: 0 }}
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full"
      />
      {/* Dots */}
      {[0, 33, 67, 100].map((pct, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
          style={{ left: `${pct}%`, background: STEPS[i].color }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 400, damping: 20 }}
        />
      ))}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              How It Works
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
              Live in{" "}
              <span className="text-gradient">4 simple steps</span>
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-black/50 text-lg max-w-lg mx-auto">
              From purchase to connected — in under 2 minutes. No physical SIM. No store visit.
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <TimelineBar />

        {/* Steps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {STEPS.map((step, i) => (
            <StepCard key={step.step} step={step} index={i} />
          ))}
        </div>

        {/* Bottom time badge */}
        <Reveal variant="scaleIn" delay={0.4} className="flex justify-center mt-14">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl glass border border-black/[0.06] shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-black/40 uppercase tracking-wider">Average activation</div>
              <div className="font-display text-xl font-black text-black">Under 2 minutes</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
