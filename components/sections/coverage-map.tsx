"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Signal, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const CARRIER_COLORS: Record<string, string> = {
  "T-Mobile": "#E20074",
  Verizon: "#CD040B",
  "AT&T": "#00A8E0",
  MVNO: "#8B5CF6",
};

// Major USA cities with coordinates (% of map width/height)
const CITIES = [
  { name: "New York", x: 82, y: 28, carrier: "All Networks" },
  { name: "Los Angeles", x: 10, y: 58, carrier: "All Networks" },
  { name: "Chicago", x: 62, y: 28, carrier: "All Networks" },
  { name: "Houston", x: 46, y: 70, carrier: "All Networks" },
  { name: "Phoenix", x: 18, y: 60, carrier: "T-Mobile" },
  { name: "Philadelphia", x: 80, y: 32, carrier: "Verizon" },
  { name: "San Antonio", x: 44, y: 74, carrier: "AT&T" },
  { name: "San Diego", x: 9, y: 62, carrier: "T-Mobile" },
  { name: "Dallas", x: 48, y: 64, carrier: "AT&T" },
  { name: "San Jose", x: 6, y: 45, carrier: "T-Mobile" },
  { name: "Seattle", x: 7, y: 14, carrier: "T-Mobile" },
  { name: "Denver", x: 30, y: 44, carrier: "Verizon" },
  { name: "Boston", x: 85, y: 22, carrier: "Verizon" },
  { name: "Miami", x: 72, y: 82, carrier: "AT&T" },
  { name: "Atlanta", x: 66, y: 66, carrier: "AT&T" },
];

function CoveragePoint({
  city,
  active,
  onClick,
}: {
  city: (typeof CITIES)[0];
  active: boolean;
  onClick: () => void;
}) {
  const isAll = city.carrier === "All Networks";
  const color = isAll ? "#3B82F6" : CARRIER_COLORS[city.carrier] ?? "#3B82F6";

  return (
    <motion.button
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 group"
      onClick={onClick}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ backgroundColor: color }}
      />

      {/* Dot */}
      <div
        className="relative w-3 h-3 rounded-full border-2 border-white shadow-lg"
        style={{ backgroundColor: color }}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-10"
          >
            <div className="bg-white rounded-xl px-3 py-2 shadow-xl border border-black/[0.06] whitespace-nowrap text-center">
              <div className="text-xs font-bold text-black">{city.name}</div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color }}>
                {city.carrier}
              </div>
            </div>
            {/* Arrow */}
            <div className="w-2 h-2 bg-white border-b border-r border-black/[0.06] rotate-45 mx-auto -mt-1 shadow" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function CoverageMap() {
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filters = ["All", "T-Mobile", "Verizon", "AT&T", "MVNO"];

  const filteredCities = CITIES.filter(
    (c) => activeFilter === "All" || c.carrier === activeFilter || c.carrier === "All Networks"
  );

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-sm font-medium mb-6">
              <Map className="w-3.5 h-3.5" />
              Coverage Map
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
              Coverage across{" "}
              <span className="text-gradient-aurora">all 50 states</span>
            </h2>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-black/50 text-lg max-w-xl mx-auto">
              Whether you&apos;re in Times Square or Yellowstone, we&apos;ve got you connected.
            </p>
          </Reveal>
        </div>

        {/* Filter pills */}
        <Reveal variant="fadeUp" delay={0.25} className="flex flex-wrap gap-2 justify-center mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f
                  ? "bg-black text-white shadow-md"
                  : "bg-gray-100 text-black/50 hover:bg-gray-200"
              }`}
            >
              {f === "All" ? "All Networks" : f}
            </button>
          ))}
        </Reveal>

        {/* Map container */}
        <Reveal variant="scaleIn" delay={0.3}>
          <div className="relative w-full rounded-3xl overflow-hidden border border-black/[0.06] shadow-xl bg-gradient-to-b from-blue-50/50 to-white aspect-[16/7]">
            {/* USA SVG Outline */}
            <svg
              viewBox="0 0 1000 480"
              className="absolute inset-0 w-full h-full"
              fill="none"
            >
              {/* Simplified USA outline paths */}
              <defs>
                <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EFF6FF" />
                  <stop offset="100%" stopColor="#F0FAFE" />
                </linearGradient>
              </defs>

              {/* Conus shape approximation */}
              <path
                d="M 80 100 L 80 120 L 60 140 L 50 180 L 60 220 L 80 250 L 100 280 L 130 310 L 160 330 L 200 340 L 240 345 L 280 348 L 320 350 L 360 352 L 400 350 L 440 348 L 480 345 L 520 342 L 560 340 L 600 345 L 640 350 L 680 340 L 720 330 L 750 310 L 760 280 L 760 260 L 770 240 L 780 220 L 800 200 L 810 180 L 800 160 L 790 140 L 780 120 L 770 100 L 760 90 L 740 88 L 720 85 L 700 82 L 680 80 L 660 78 L 640 76 L 620 75 L 600 74 L 580 73 L 560 72 L 540 71 L 520 70 L 500 70 L 480 70 L 460 70 L 440 72 L 420 74 L 400 75 L 380 76 L 360 77 L 340 79 L 320 81 L 300 84 L 280 87 L 260 90 L 240 94 L 220 97 L 200 100 L 180 102 L 160 103 L 140 103 L 120 102 L 100 101 Z"
                fill="url(#mapGrad)"
                stroke="rgba(59,130,246,0.12)"
                strokeWidth="1.5"
              />

              {/* State grid lines (subtle) */}
              {[200, 320, 440, 560, 680].map((x) => (
                <line key={x} x1={x} y1="70" x2={x} y2="360" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
              ))}
              {[140, 210, 280].map((y) => (
                <line key={y} x1="80" y1={y} x2="810" y2={y} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
              ))}

              {/* Alaska */}
              <ellipse cx="120" cy="400" rx="60" ry="45" fill="url(#mapGrad)" stroke="rgba(59,130,246,0.12)" strokeWidth="1.5" />
              {/* Hawaii */}
              <ellipse cx="260" cy="410" rx="30" ry="18" fill="url(#mapGrad)" stroke="rgba(59,130,246,0.12)" strokeWidth="1.5" />
            </svg>

            {/* City points */}
            <div className="absolute inset-0">
              <AnimatePresence>
                {filteredCities.map((city) => (
                  <CoveragePoint
                    key={city.name}
                    city={city}
                    active={activeCity === city.name}
                    onClick={() => setActiveCity(activeCity === city.name ? null : city.name)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Coverage legend */}
            <div className="absolute bottom-4 right-4 glass rounded-2xl p-4 border border-white/80 space-y-2">
              {Object.entries(CARRIER_COLORS).map(([name, color]) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-black/50">{name}</span>
                </div>
              ))}
            </div>

            {/* Coverage badge */}
            <div className="absolute top-4 left-4 glass rounded-2xl px-4 py-3 border border-white/80">
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-xs text-black/40">Coverage</div>
                  <div className="text-sm font-bold text-black">99% USA</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Stats below map */}
        <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg mx-auto">
          {[
            { label: "States Covered", value: "50" },
            { label: "Cell Towers", value: "120K+" },
            { label: "Uptime", value: "99.9%" },
          ].map((s) => (
            <Reveal key={s.label} variant="fadeUp" className="text-center">
              <div className="text-2xl font-black font-display text-black">{s.value}</div>
              <div className="text-xs text-black/40 mt-1">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
