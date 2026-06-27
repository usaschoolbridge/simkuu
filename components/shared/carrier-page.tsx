"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Signal, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { fadeUp } from "@/animations/variants";
import { Tilt } from "@/components/motion/tilt";

interface CarrierPageProps {
  name: string;
  color: string;
  description: string;
  tagline: string;
  coverage: string;
  network: string;
  heroStat: { value: string; label: string };
  plans: { name: string; price: number; data: string; features: string[]; badge?: string }[];
  highlights: { icon: string; title: string; body: string }[];
  slug: string;
}

const ICON_MAP: Record<string, React.ElementType> = { Signal, Shield, Zap, Globe };

export function CarrierPage({
  name, color, description, tagline, coverage, network,
  heroStat, plans, highlights, slug,
}: CarrierPageProps) {
  return (
    <>
      {/* ---- Hero ---- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${color}14 0%, transparent 70%)` }} />

        <div className="container-xl text-center relative">
          {/* Carrier badge */}
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm font-bold mb-8 shadow-sm"
              style={{ background: color + "12", borderColor: color + "30", color }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
              {name} eSIM
            </div>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.1}>
            <h1 className="font-display text-5xl md:text-7xl font-black text-black tracking-tight mb-6">
              {tagline.split(" ").slice(0, -2).join(" ")}{" "}
              <span style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {tagline.split(" ").slice(-2).join(" ")}
              </span>
            </h1>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-xl text-black/50 max-w-2xl mx-auto leading-relaxed mb-10">{description}</p>
          </Reveal>

          <Reveal variant="fadeUp" delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/plans?carrier=${slug}`}>
                <Button variant="gradient" size="xl">Browse {name} Plans <ArrowRight className="w-5 h-5" /></Button>
              </Link>
              <Link href="/coverage">
                <Button variant="outline" size="xl">Check Coverage</Button>
              </Link>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal variant="fadeUp" delay={0.4} className="flex items-center justify-center gap-10 mt-14 flex-wrap">
            {[
              { value: heroStat.value, label: heroStat.label },
              { value: coverage, label: "Coverage" },
              { value: network, label: "Network" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-black text-black">{s.value}</div>
                <div className="text-sm text-black/40 mt-1">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---- Highlights ---- */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="container-xl">
          <Reveal variant="fadeUp" className="text-center mb-12">
            <h2 className="font-display text-4xl font-black text-black mb-3">Why {name}?</h2>
            <p className="text-black/50 text-lg">What makes this network stand out</p>
          </Reveal>
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {highlights.map((h) => {
              const Icon = ICON_MAP[h.icon] ?? Zap;
              return (
                <motion.div key={h.title} variants={fadeUp}>
                  <div className="card-premium p-6 h-full">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: color + "15" }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-black mb-2">{h.title}</h3>
                    <p className="text-sm text-black/50 leading-relaxed">{h.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerReveal>
        </div>
      </section>

      {/* ---- Plans ---- */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <Reveal variant="fadeUp" className="text-center mb-12">
            <h2 className="font-display text-4xl font-black text-black mb-3">{name} Plans</h2>
            <p className="text-black/50 text-lg">Choose your perfect plan — no contracts, ever</p>
          </Reveal>
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <Tilt maxTilt={5} className="h-full">
                  <div className={`relative rounded-2xl bg-white border h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl ${plan.badge ? "border-transparent shadow-lg" : "border-black/[0.06] shadow-sm"}`}>
                    {plan.badge && (
                      <div className="absolute inset-0 rounded-2xl -z-10" style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)` }} />
                    )}
                    <div className="h-0.5" style={{ background: color }} />
                    {plan.badge && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: color }}>
                        {plan.badge}
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-display font-bold text-xl text-black mb-1">{plan.name}</h3>
                      <div className="rounded-xl px-3 py-2 bg-black/[0.03] mb-4 mt-2">
                        <div className="text-[10px] text-black/30 uppercase tracking-wider">Data</div>
                        <div className="font-display text-2xl font-black text-black">{plan.data}</div>
                      </div>
                      <div className="flex items-baseline gap-1 mb-5">
                        <span className="font-display text-4xl font-black text-black">${plan.price}</span>
                        <span className="text-black/40">/mo</span>
                      </div>
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-black/60">
                            <Check className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link href="/checkout">
                        <Button className="w-full" size="default"
                          style={{ background: plan.badge ? color : undefined }}
                          variant={plan.badge ? "primary" : "outline"}>
                          Get {plan.name}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${color}0A, ${color}18)` }}>
        <div className="container-xl text-center">
          <Reveal variant="fadeUp">
            <h2 className="font-display text-4xl md:text-5xl font-black text-black mb-4">
              Ready to switch to {name}?
            </h2>
            <p className="text-black/50 text-lg mb-8 max-w-lg mx-auto">
              Activate in under 2 minutes. No store. No physical SIM. No contract.
            </p>
            <Link href="/plans">
              <Button variant="gradient" size="xl">Start Now <ArrowRight className="w-5 h-5" /></Button>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
