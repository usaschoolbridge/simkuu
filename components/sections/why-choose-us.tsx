"use client";

import { motion } from "framer-motion";
import {
  Zap, Shield, Wifi, Phone, MessageSquare,
  Signal, Globe, Headphones, Clock
} from "lucide-react";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { fadeUp } from "@/animations/variants";
import { siteConfig } from "@/config/site";

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Shield, Wifi, Phone, MessageSquare,
  Signal, Globe, Headphones, Clock,
};

function FeatureCard({
  icon,
  label,
  description,
  index,
}: {
  icon: string;
  label: string;
  description: string;
  index: number;
}) {
  const Icon = ICON_MAP[icon] ?? Zap;

  return (
    <motion.div
      variants={fadeUp}
      className="group relative card-premium p-6 cursor-default"
    >
      {/* Gradient hover overlay */}
      <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Icon */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>

        {/* Content */}
        <h3 className="font-display font-semibold text-base text-black mb-2">
          {label}
        </h3>
        <p className="text-sm text-black/50 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Animated border on hover */}
      <div className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none gradient-border" />
    </motion.div>
  );
}

export function WhyChooseUs() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)" }}
      />

      <div className="container-xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-sm font-medium mb-6">
              <Signal className="w-3.5 h-3.5" />
              Why Simkuu
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-black leading-tight tracking-tight mb-6">
              Everything you need,{" "}
              <span className="text-gradient">nothing you don&apos;t</span>
            </h2>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-lg text-black/50 max-w-2xl mx-auto leading-relaxed">
              We obsess over every detail so you get the most premium eSIM experience
              available in the USA. No compromises.
            </p>
          </Reveal>
        </div>

        {/* Features grid */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {siteConfig.features.map((feature, i) => (
            <FeatureCard key={feature.label} {...feature} index={i} />
          ))}
        </StaggerReveal>

        {/* Bottom CTA */}
        <Reveal variant="fadeUp" delay={0.3} className="text-center mt-14">
          <p className="text-black/40 text-sm">
            Trusted by{" "}
            <span className="text-black font-semibold">250,000+</span>{" "}
            customers across the USA
          </p>
        </Reveal>
      </div>
    </section>
  );
}
