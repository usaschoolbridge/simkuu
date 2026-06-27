"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const FAQS = [
  { q: "Can I switch plans at any time?", a: "Yes, you can upgrade, downgrade, or switch carriers at any time from your dashboard. Changes take effect at the start of your next billing cycle." },
  { q: "Do all plans include 5G?", a: "Yes, all Simkuu plans include access to 5G where available on the respective carrier network." },
  { q: "What is the difference between Unlimited and Unlimited+?", a: "Unlimited+ plans include priority data access, meaning your speeds are maintained even during network congestion. They also typically include more hotspot data and higher streaming resolutions." },
  { q: "Are there any activation fees?", a: "Never. There are no activation fees, setup fees, or hidden charges. You only pay the plan price listed." },
];

export function PlansFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="container-xl max-w-2xl">
        <Reveal variant="fadeUp" className="text-center mb-10">
          <h2 className="font-display text-3xl font-black text-black mb-3">Plan questions</h2>
          <p className="text-black/50">Quick answers before you choose.</p>
        </Reveal>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <Reveal key={i} variant="fadeUp" delay={i * 0.05}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left">
                <div className={`flex items-start justify-between gap-4 p-5 rounded-2xl transition-all duration-300 ${open === i ? "bg-white shadow-md border border-black/[0.06]" : "hover:bg-black/[0.02]"}`}>
                  <span className="font-display font-semibold text-black text-sm">{f.q}</span>
                  <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                    className="w-6 h-6 rounded-full bg-black/[0.05] flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden px-5">
                      <p className="text-sm text-black/50 leading-relaxed py-3">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
