"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tilt } from "@/components/motion/tilt";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { fadeUp } from "@/animations/variants";
import { siteConfig } from "@/config/site";

const CARRIER_FEATURES: Record<string, string[]> = {
  tmobile: ["Largest 5G network", "99% nationwide coverage", "Unlimited hotspot", "HD streaming"],
  verizon: ["Most reliable network", "Ultra Wideband 5G", "Premium data priority", "99.9% uptime"],
  att: ["FirstNet backbone", "Deep urban coverage", "WiFi calling", "International roaming"],
  mvno: ["T-Mobile network", "Lowest prices", "No contracts", "Same 5G speeds"],
};

function CarrierCard({
  carrier,
  index,
}: {
  carrier: (typeof siteConfig.carriers)[number];
  index: number;
}) {
  const features = CARRIER_FEATURES[carrier.id] ?? [];

  return (
    <motion.div variants={fadeUp}>
      <Tilt maxTilt={6} scale={1.02} className="h-full">
        <div className="group relative h-full rounded-[1.5rem] overflow-hidden border border-black/[0.06] bg-white shadow-md hover:shadow-xl transition-shadow duration-500">
          {/* Top gradient bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(to right, ${carrier.color}80, ${carrier.color})` }}
          />

          {/* Carrier color glow background */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{ background: carrier.color + "18", transform: "translate(30%, -30%)" }}
          />

          <div className="relative p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                {/* Carrier logo placeholder — colored badge */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg mb-4"
                  style={{ background: `linear-gradient(135deg, ${carrier.color}, ${carrier.color}CC)` }}
                >
                  {carrier.name.charAt(0)}
                </div>
                <h3 className="font-display font-bold text-xl text-black">{carrier.name}</h3>
                <p className="text-sm text-black/40 mt-1">{carrier.description}</p>
              </div>
            </div>

            {/* Coverage & Network */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 rounded-xl px-3 py-2.5 bg-gray-50 border border-black/[0.04]">
                <div className="text-[10px] text-black/30 uppercase tracking-wider mb-0.5">Coverage</div>
                <div className="text-sm font-semibold text-black">{carrier.coverage}</div>
              </div>
              <div className="flex-1 rounded-xl px-3 py-2.5 bg-gray-50 border border-black/[0.04]">
                <div className="text-[10px] text-black/30 uppercase tracking-wider mb-0.5">Network</div>
                <div className="text-sm font-semibold text-black">{carrier.network}</div>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-7">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-black/60">
                  <div
                    className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: carrier.color + "20" }}
                  >
                    <Check className="w-2.5 h-2.5" style={{ color: carrier.color }} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {/* Pricing teaser */}
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-2xl font-black font-display text-black">
                {["$15", "$20", "$18", "$12"][index]}
              </span>
              <span className="text-black/40 text-sm">/mo</span>
              <span className="ml-2 text-xs text-black/30">starting at</span>
            </div>

            {/* CTA */}
            <Link href={`/${carrier.slug}`}>
              <Button
                variant="outline"
                className="w-full group/btn hover:text-white hover:border-transparent transition-all duration-300"
                style={{ "--hover-bg": carrier.color } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = carrier.color;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = carrier.color;
                  (e.currentTarget as HTMLButtonElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "";
                  (e.currentTarget as HTMLButtonElement).style.color = "";
                }}
              >
                Explore {carrier.name}
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
}

export function CarrierCards() {
  return (
    <section className="section-padding bg-[#FAFAFA] relative overflow-hidden">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              <Signal className="w-3.5 h-3.5" />
              USA Carriers
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-black leading-tight tracking-tight mb-6">
              Choose your{" "}
              <span className="text-gradient">carrier</span>
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-lg text-black/50 max-w-xl mx-auto">
              All four major USA networks. Same instant activation. Pick the one that fits your needs.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {siteConfig.carriers.map((carrier, i) => (
            <CarrierCard key={carrier.id} carrier={carrier} index={i} />
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
