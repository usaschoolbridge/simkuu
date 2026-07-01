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

const ICON_COLORS: Record<string, { from: string; to: string; text: string }> = {
  Zap: { from: "#F59E0B", to: "#EF4444", text: "#F59E0B" },
  Shield: { from: "#10B981", to: "#059669", text: "#10B981" },
  Wifi: { from: "#3B82F6", to: "#2563EB", text: "#3B82F6" },
  Phone: { from: "#E20074", to: "#7c0040", text: "#E20074" },
  MessageSquare: { from: "#8B5CF6", to: "#7C3AED", text: "#8B5CF6" },
  Signal: { from: "#06B6D4", to: "#0891B2", text: "#06B6D4" },
  Globe: { from: "#10B981", to: "#0D9488", text: "#10B981" },
  Headphones: { from: "#F59E0B", to: "#D97706", text: "#F59E0B" },
  Clock: { from: "#6366F1", to: "#4F46E5", text: "#6366F1" },
};

function FeatureCard({
  icon,
  label,
  description,
}: {
  icon: string;
  label: string;
  description: string;
  index: number;
}) {
  const Icon = ICON_MAP[icon] ?? Zap;
  const colors = ICON_COLORS[icon] ?? { from: "#3B82F6", to: "#2563EB", text: "#3B82F6" };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-[1.25rem] border border-white/60 bg-white/70 backdrop-blur-sm p-6 cursor-default shadow-sm hover:shadow-lg hover:border-white/80 transition-all duration-300"
      style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)" }}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(145deg, ${colors.from}08 0%, ${colors.to}04 100%)` }}
      />

      <div className="relative">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${colors.from}18 0%, ${colors.to}10 100%)` }}
        >
          <Icon className="w-5 h-5" style={{ color: colors.text }} />
        </div>

        {/* Content */}
        <h3 className="font-display font-bold text-base text-black mb-2">
          {label}
        </h3>
        <p className="text-sm text-black/50 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function WhyChooseUs() {
  return (
    <section className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[700px] rounded-full opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(226,0,116,0.04) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)" }}
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
              Every plan includes unlimited calls, SMS, data, and OTP delivery —
              no add-ons, no hidden fees, no compromises.
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
            <span className="text-black font-semibold">25,000+</span>{" "}
            customers — mostly Indians living &amp; working in the USA
          </p>
        </Reveal>
      </div>
    </section>
  );
}
