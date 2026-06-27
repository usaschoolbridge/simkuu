"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { fadeUp } from "@/animations/variants";

const FAQS = [
  {
    q: "What is an eSIM and how does it work?",
    a: "An eSIM (embedded SIM) is a digital SIM card built into your phone. Instead of inserting a physical SIM card, you scan a QR code in your phone's settings to activate service. It works exactly like a regular SIM — calls, texts, and data all included.",
  },
  {
    q: "Which phones support eSIM?",
    a: "Most modern smartphones support eSIM, including iPhone XS and later, Google Pixel 3 and later, Samsung Galaxy S20 and later, and many other Android devices. Check your phone's settings under Cellular or Mobile Data to confirm.",
  },
  {
    q: "How quickly will I receive my eSIM after purchase?",
    a: "Instantly. Your eSIM QR code is delivered to your email address within seconds of completing your purchase. You can activate it immediately — no waiting, no shipping.",
  },
  {
    q: "Can I keep my existing phone number?",
    a: "Yes. You can port your existing number from your current carrier to your new Simkuu plan at no charge. The transfer process typically takes 24-48 hours. During the port, you can still use your new eSIM for data.",
  },
  {
    q: "Are there any contracts or cancellation fees?",
    a: "None at all. Every Simkuu plan is month-to-month with zero contracts. You can cancel, pause, or switch plans at any time — no cancellation fees, no commitments.",
  },
  {
    q: "What happens when my plan expires?",
    a: "You'll receive email reminders before your plan expires. You can renew, upgrade, or switch carriers directly from your dashboard. If you don't renew, service pauses automatically — your data and number are preserved for 30 days.",
  },
  {
    q: "Can I use my eSIM internationally?",
    a: "Our eSIMs are optimized for USA usage. Some plans include international roaming — check the plan details for specific countries and rates. For extended international travel, we recommend a dedicated travel eSIM alongside your USA plan.",
  },
  {
    q: "How do I activate my eSIM?",
    a: "Open your phone's Settings → Cellular/Mobile Data → Add Plan → Scan QR Code. Point your camera at the QR code we emailed you. Your eSIM activates within 2 minutes. Our support team is available 24/7 if you need help.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Stripe (all major credit/debit cards), PayPal, Apple Pay, Google Pay, and cryptocurrency including Bitcoin, Ethereum, USDT (ERC20 & TRC20), and USDC.",
  },
  {
    q: "Can I have multiple eSIMs on one phone?",
    a: "Most modern phones support multiple eSIM profiles (2-8 depending on the model). You can install multiple Simkuu plans and switch between them instantly without swapping cards.",
  },
];

function FAQItem({ item, index, isOpen, onToggle }: {
  item: typeof FAQS[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div variants={fadeUp}>
      <button
        onClick={onToggle}
        className="w-full text-left group"
        aria-expanded={isOpen}
      >
        <div className={`flex items-start justify-between gap-4 py-5 px-6 rounded-2xl transition-all duration-300 ${
          isOpen ? "bg-white shadow-md border border-black/[0.06]" : "hover:bg-black/[0.02]"
        }`}>
          <div className="flex items-start gap-4 flex-1">
            {/* Number */}
            <span className="shrink-0 font-display text-sm font-bold text-black/20 mt-0.5">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="flex-1">
              <div className="font-display font-semibold text-black text-base group-hover:text-gradient transition-all duration-300">
                {item.q}
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-black/50 text-sm leading-relaxed mt-3 pb-1">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.04] group-hover:bg-black/[0.07] transition-colors mt-0.5"
          >
            {isOpen ? (
              <Minus className="w-3.5 h-3.5 text-black" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-black/50" />
            )}
          </motion.div>
        </div>
      </button>
    </motion.div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-white relative overflow-hidden" id="faq">
      <div className="container-xl">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Reveal variant="fadeUp">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium mb-6">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked
              </div>
            </Reveal>
            <Reveal variant="fadeUp" delay={0.1}>
              <h2 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
                Got questions?{" "}
                <span className="text-gradient">We have answers</span>
              </h2>
            </Reveal>
            <Reveal variant="fadeUp" delay={0.2}>
              <p className="text-black/50 text-lg">
                Everything you need to know about Simkuu. Can&apos;t find what you&apos;re looking for?{" "}
                <a href="/contact" className="text-blue-500 hover:underline">Contact us.</a>
              </p>
            </Reveal>
          </div>

          {/* FAQ list */}
          <StaggerReveal className="space-y-2">
            {FAQS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
