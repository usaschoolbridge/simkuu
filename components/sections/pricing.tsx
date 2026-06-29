"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { fadeUp } from "@/animations/variants";
import { cn, discountPercent } from "@/lib/utils";
import type { PlanInterval } from "@/types";
import { useCurrency } from "@/contexts/currency";

type Interval = PlanInterval;

const PLANS = [
  {
    name: "Starter",
    description: "Perfect for light users",
    prices: { monthly: 15, quarterly: 13, yearly: 11 },
    data: "5GB",
    calls: "Unlimited",
    sms: "Unlimited",
    features: ["T-Mobile network", "5G ready", "Wi-Fi calling", "Mobile hotspot"],
    badge: null,
    carrier: "T-Mobile",
  },
  {
    name: "Standard",
    description: "Most popular for everyday use",
    prices: { monthly: 25, quarterly: 21, yearly: 18 },
    data: "Unlimited",
    calls: "Unlimited",
    sms: "Unlimited",
    features: ["T-Mobile network", "5G Ultra", "30GB hotspot", "International SMS", "HD streaming"],
    badge: "Most Popular",
    carrier: "T-Mobile",
  },
  {
    name: "Premium",
    description: "For power users who demand the best",
    prices: { monthly: 45, quarterly: 38, yearly: 32 },
    data: "Unlimited+",
    calls: "Unlimited",
    sms: "Unlimited",
    features: ["Verizon Ultra Wideband", "Fastest 5G", "Unlimited hotspot", "Priority data", "VoIP calls", "All carriers"],
    badge: "Best Value",
    carrier: "Verizon",
  },
];

const INTERVAL_LABELS: Record<Interval, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const SAVINGS: Record<Interval, string | null> = {
  monthly: null,
  quarterly: "Save 15%",
  yearly: "Save 30%",
};

function PlanCard({
  plan,
  interval,
  featured,
}: {
  plan: (typeof PLANS)[0];
  interval: Interval;
  featured: boolean;
}) {
  const price = plan.prices[interval];
  const monthlyPrice = plan.prices.monthly;
  const savings = interval !== "monthly" ? discountPercent(monthlyPrice, price) : 0;
  const { format } = useCurrency();

  return (
    <motion.div variants={fadeUp} className={cn("relative", featured && "lg:-mt-4 lg:mb-4")}>
      {/* Featured ring */}
      {featured && (
        <div className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 animate-pulse-glow" />
      )}

      <div className={cn(
        "relative rounded-[1.5rem] overflow-hidden border bg-white h-full flex flex-col",
        featured
          ? "border-transparent shadow-2xl"
          : "border-black/[0.06] shadow-md",
      )}>
        {/* Badge */}
        {plan.badge && (
          <div className="absolute top-5 right-5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold shadow-lg">
              <Sparkles className="w-3 h-3" />
              {plan.badge}
            </div>
          </div>
        )}

        <div className="p-7 flex flex-col flex-1">
          {/* Plan info */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-1">{plan.carrier}</div>
            <h3 className="font-display text-xl font-bold text-black mb-1">{plan.name}</h3>
            <p className="text-sm text-black/40">{plan.description}</p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${price}-${format(price)}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="font-display text-5xl font-black text-black"
                >
                  {format(price)}
                </motion.span>
              </AnimatePresence>
              <span className="text-black/40 text-base">/mo</span>
            </div>
            {savings > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 mt-1.5 text-emerald-600 text-sm font-medium"
              >
                <Tag className="w-3.5 h-3.5" />
                Save {savings}% vs monthly
              </motion.div>
            )}
          </div>

          {/* Data highlight */}
          <div className="rounded-2xl px-4 py-3 mb-6 border border-black/[0.06]"
            style={{ background: featured ? "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))" : "#FAFAFA" }}>
            <div className="text-xs text-black/30 uppercase tracking-wider mb-0.5">Data</div>
            <div className="font-display text-2xl font-black text-black">{plan.data}</div>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-black/60">
                <div className={cn(
                  "w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0",
                  featured ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <Check className={cn("w-2.5 h-2.5", featured ? "text-blue-600" : "text-black/50")} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link href="/checkout">
            <Button
              variant={featured ? "gradient" : "outline"}
              className="w-full"
              size="lg"
            >
              Get {plan.name}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  const [interval, setInterval] = useState<Interval>("monthly");

  return (
    <section className="section-padding bg-[#FAFAFA] relative overflow-hidden" id="pricing">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139,92,246,0.05) 0%, transparent 100%)" }}
      />

      <div className="container-xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-600 text-sm font-medium mb-6">
              <Tag className="w-3.5 h-3.5" />
              Simple Pricing
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
              Plans that fit{" "}
              <span className="text-gradient">any lifestyle</span>
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-black/50 text-lg max-w-lg mx-auto">
              No contracts, no hidden fees. Cancel or change plans anytime.
            </p>
          </Reveal>
        </div>

        {/* Interval toggle */}
        <Reveal variant="fadeUp" delay={0.25} className="flex justify-center mb-12">
          <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-black/[0.06]">
            {(Object.keys(INTERVAL_LABELS) as Interval[]).map((key) => (
              <button
                key={key}
                onClick={() => setInterval(key)}
                className={cn(
                  "relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  interval === key
                    ? "text-black"
                    : "text-black/40 hover:text-black/70"
                )}
              >
                {interval === key && (
                  <motion.div
                    layoutId="interval-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-black/[0.06]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {INTERVAL_LABELS[key]}
                  {SAVINGS[key] && (
                    <span className="ml-1.5 text-[10px] text-emerald-500 font-semibold">
                      {SAVINGS[key]}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Plan cards */}
        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              interval={interval}
              featured={plan.badge === "Most Popular"}
            />
          ))}
        </StaggerReveal>

        {/* Footer note */}
        <Reveal variant="fadeUp" delay={0.3} className="text-center mt-10">
          <p className="text-sm text-black/30">
            All plans include unlimited calls & SMS · No activation fees · Instant eSIM delivery
          </p>
        </Reveal>
      </div>
    </section>
  );
}
