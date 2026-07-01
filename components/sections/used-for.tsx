"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";

const APPS = [
  { name: "WhatsApp", emoji: "💬", color: "#25D366" },
  { name: "Telegram", emoji: "✈️", color: "#229ED9" },
  { name: "Google", emoji: "🔍", color: "#4285F4" },
  { name: "Microsoft", emoji: "🪟", color: "#0078D4" },
  { name: "Netflix", emoji: "🎬", color: "#E50914" },
  { name: "Discord", emoji: "🎮", color: "#5865F2" },
  { name: "Zoom", emoji: "📹", color: "#2D8CFF" },
  { name: "Instagram", emoji: "📸", color: "#E1306C" },
  { name: "Spotify", emoji: "🎵", color: "#1DB954" },
  { name: "YouTube", emoji: "▶️", color: "#FF0000" },
  { name: "TikTok", emoji: "🎵", color: "#010101" },
  { name: "Uber", emoji: "🚗", color: "#000000" },
];

export function UsedFor() {
  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="container-xl">
        <div className="text-center mb-12">
          <Reveal variant="fadeUp">
            <p className="text-sm font-semibold text-black/30 uppercase tracking-widest mb-3">Works with every app you love</p>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h2 className="font-display text-3xl md:text-4xl font-black text-black">
              Browse, stream, and stay connected
            </h2>
          </Reveal>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {APPS.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.08, y: -2 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-50 border border-black/[0.06] hover:bg-white hover:shadow-md transition-all duration-200 cursor-default"
            >
              <span className="text-lg">{app.emoji}</span>
              <span className="text-sm font-medium text-black/70">{app.name}</span>
            </motion.div>
          ))}
        </div>

        <Reveal variant="fadeUp" delay={0.3} className="text-center mt-10">
          <p className="text-sm text-black/30">
            Full-speed 5G on America&apos;s nationwide networks — no throttling, no limits
          </p>
        </Reveal>
      </div>
    </section>
  );
}
