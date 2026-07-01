"use client";

import { motion } from "framer-motion";
import { Lock, Zap, Bitcoin, CheckCircle2, Headphones, ShieldCheck } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Lock, label: "SSL Secured", sub: "256-bit encryption" },
  { icon: Bitcoin, label: "Crypto Accepted", sub: "BTC · ETH · USDT · SOL" },
  { icon: Zap, label: "Instant Delivery", sub: "QR in seconds" },
  { icon: CheckCircle2, label: "Verified Provider", sub: "USA networks certified" },
  { icon: ShieldCheck, label: "No Hidden Fees", sub: "Price you see = price you pay" },
  { icon: Headphones, label: "24/7 Support", sub: "Chat · Email · Phone" },
];

export function TrustBar() {
  return (
    <section className="border-y border-black/[0.06] bg-gray-50/50 py-5 overflow-hidden">
      <div className="container-xl">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.06] shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-4 h-4 text-black/60" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-black/80 leading-none">{item.label}</div>
                  <div className="text-[10px] text-black/40 mt-0.5 leading-none">{item.sub}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
