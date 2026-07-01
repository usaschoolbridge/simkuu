"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Lock, Zap, Headphones, Shield,
  MessageSquare, Phone, Signal, Wifi, Globe,
  CheckCircle, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroTitle, heroSubtitle, heroButtons, heroFloat, staggerContainer, fadeUp } from "@/animations/variants";
import { Magnetic } from "@/components/motion/magnetic";

// ── Smooth scroll to #pricing with header offset ──────────────────────────────
function useSmoothScrollTo(id: string) {
  return useCallback(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const headerH = 72; // navbar height
    const top = el.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: "smooth" });
  }, [id]);
}

// ── Floating background dots (CSS animation, zero rAF) ───────────────────────
function FloatingDots() {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; size: number; dur: number; del: number; op: number }[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        dur: Math.random() * 12 + 18,
        del: Math.random() * 8,
        op: Math.random() * 0.2 + 0.06,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {dots.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full bg-blue-400 animate-float"
          style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.size, height: d.size,
            opacity: d.op,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.del}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Feature badges ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BadgeCheck, label: "No KYC Required",      color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100" },
  { icon: Phone,      label: "Unlimited Calling",    color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-100" },
  { icon: MessageSquare, label: "Unlimited SMS",     color: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-100" },
  { icon: CheckCircle, label: "Receive OTPs",        color: "text-cyan-600",    bg: "bg-cyan-50",     border: "border-cyan-100" },
  { icon: Zap,        label: "Instant Activation",   color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-100" },
  { icon: Wifi,       label: "WiFi Calling",         color: "text-indigo-600",  bg: "bg-indigo-50",   border: "border-indigo-100" },
  { icon: Globe,      label: "International Roaming",color: "text-teal-600",    bg: "bg-teal-50",     border: "border-teal-100" },
  { icon: Signal,     label: "Real USA Number",      color: "text-violet-600",  bg: "bg-violet-50",   border: "border-violet-100" },
];

// ── Trust row ─────────────────────────────────────────────────────────────────
const TRUST = [
  { icon: Zap,        label: "Instant Delivery" },
  { icon: Lock,       label: "Secure Checkout" },
  { icon: Headphones, label: "24/7 Support" },
  { icon: Shield,     label: "Real USA Numbers" },
];

// ── Carrier pills ─────────────────────────────────────────────────────────────
const CARRIERS = [
  { name: "T-Mobile", color: "#E20074" },
  { name: "Verizon",  color: "#CD040B" },
  { name: "AT&T",     color: "#00A8E0" },
  { name: "MVNO",     color: "#8B5CF6" },
];

// ── Animated stat counter ─────────────────────────────────────────────────────
function AnimatedStat({ target, suffix }: { target: string; suffix: string }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const raw = target.replace(/[^0-9.]/g, "");
    const num = parseFloat(raw);
    const prefix = target.includes("<") ? "< " : "";
    const plus   = target.includes("+") ? "+" : "";
    if (isNaN(num)) { setDisplay(target); return; }

    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const ease = 1 - Math.pow(1 - Math.min((now - start) / duration, 1), 3);
      setDisplay(`${prefix}${num % 1 !== 0 ? (num * ease).toFixed(1) : Math.round(num * ease)}${plus}`);
      if (ease < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <span className="font-display text-2xl md:text-3xl font-black text-black">
      {display}{suffix}
    </span>
  );
}

// ── Phone mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  const msgs = [
    { from: "Google",           text: "Your verification code is 847291. Valid for 10 min.", time: "9:41" },
    { from: "Apple",            text: "Your Apple ID code is: 519384. Don't share it.",       time: "9:43" },
    { from: "Bank of America",  text: "One-time passcode: 723948. Do not share.",             time: "9:45" },
  ];

  return (
    <motion.div variants={heroFloat} className="relative w-full max-w-[268px] mx-auto">
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-b from-blue-400/15 via-purple-400/10 to-transparent blur-3xl scale-125" />

      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-gray-900 to-[#0a0a12] shadow-[0_40px_80px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />

        <div className="pt-9 pb-4 px-1.5 min-h-[480px]">
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 py-2 text-white/60 text-[10px]">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" /><Wifi className="w-3 h-3" />
              <span className="font-semibold">5G</span>
            </div>
          </div>

          {/* Number card */}
          <motion.div
            className="mx-3 mt-1 mb-3 rounded-2xl p-4 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.45 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="text-white/55 text-[10px] font-medium mb-1">Your USA Number</div>
            <div className="text-white font-bold text-lg tracking-wide">+1 (212) 555-0147</div>
            <div className="flex items-center gap-3 mt-2">
              {[["Phone","Calls"],["MessageSquare","SMS & OTP"],["Wifi","WiFi Call"]].map(([, label]) => (
                <span key={label} className="text-white/60 text-[10px]">{label}</span>
              ))}
            </div>
          </motion.div>

          {/* OTP messages */}
          <div className="px-3 space-y-2">
            <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wider px-1 mb-2">Recent OTPs received</p>
            {msgs.map((m, i) => (
              <motion.div
                key={m.from}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + i * 0.16, duration: 0.38 }}
                className="rounded-xl p-2.5 bg-white/[0.055] border border-white/[0.07]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-[11px] font-semibold">{m.from}</span>
                  <span className="text-white/25 text-[9px]">{m.time}</span>
                </div>
                <p className="text-white/50 text-[10px] leading-relaxed">{m.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pb-2.5">
          <div className="w-20 h-1 bg-white/15 rounded-full" />
        </div>
      </div>

      {/* Status badge */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -right-5 bg-white rounded-2xl shadow-xl border border-black/[0.06] px-3 py-2"
      >
        <div className="text-[10px] text-black/35 mb-0.5">Status</div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-bold text-black">Active</span>
        </div>
      </motion.div>

      {/* Delivery badge */}
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-xl border border-black/[0.06] px-3 py-2"
      >
        <div className="text-[10px] text-black/35 mb-0.5">Delivery</div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-sm font-bold text-black">Instant</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export function HeroSection() {
  const scrollToPlans = useSmoothScrollTo("pricing");

  return (
    <section className="relative flex flex-col items-center justify-center pt-20 pb-12 md:pt-24 md:pb-16 overflow-hidden min-h-[90vh]">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[480px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, rgba(139,92,246,0.09) 45%, transparent 70%)" }}
      />
      <FloatingDots />

      <div className="relative z-10 w-full">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left copy ── */}
            <div className="text-center lg:text-left">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.38 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-7"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                USA&apos;s Most Trusted eSIM Provider
              </motion.div>

              {/* Main heading */}
              <motion.h1
                variants={heroTitle}
                initial="hidden"
                animate="visible"
                className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight text-black mb-4"
              >
                Real USA<br />Numbers
              </motion.h1>

              {/* Subheading pill row */}
              <motion.p
                variants={heroSubtitle}
                initial="hidden"
                animate="visible"
                className="text-base md:text-lg font-medium text-black/50 mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1"
              >
                <span>Real USA Numbers</span>
                <span className="text-black/20">•</span>
                <span>No KYC Required</span>
                <span className="text-black/20">•</span>
                <span>Unlimited Calling &amp; SMS</span>
              </motion.p>

              {/* Feature badges — premium pill grid */}
              <motion.div
                variants={heroButtons}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2 mb-9 max-w-md mx-auto lg:mx-0"
              >
                {FEATURES.map(({ icon: Icon, label, color, bg, border }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${bg} ${border} group`}
                  >
                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <span className="text-xs font-semibold text-black/70 leading-tight">{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.45 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-7"
              >
                <Magnetic strength={0.3}>
                  <button
                    onClick={scrollToPlans}
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold text-base bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 hover:opacity-92 transition-opacity"
                  >
                    Get a USA Number
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Magnetic>

                <Magnetic strength={0.2}>
                  <Link href="/plans">
                    <Button variant="outline" size="xl">
                      View All Plans
                    </Button>
                  </Link>
                </Magnetic>
              </motion.div>

              {/* Trust micro-row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-5"
              >
                {TRUST.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-black/40 font-medium">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right — phone ── */}
            <motion.div
              variants={heroFloat}
              initial="hidden"
              animate="visible"
              className="lg:flex justify-center hidden"
            >
              <PhoneMockup />
            </motion.div>
          </div>

          {/* Carriers + stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.9 } } }}
            className="mt-14"
          >
            {/* Carrier pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-xs text-black/25 font-semibold uppercase tracking-widest">Powered by</span>
              {CARRIERS.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.06]"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-semibold text-black/55">{c.name}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 mt-10"
            >
              {[
                { value: "25000+", label: "Numbers Activated", suffix: "" },
                { value: "99.8",   label: "Activation Success", suffix: "%" },
                { value: "2",      label: "Avg Activation",     suffix: "min" },
                { value: "4.9",    label: "Customer Rating",    suffix: "/5" },
              ].map((s) => (
                <motion.div key={s.label} variants={fadeUp} className="flex items-baseline gap-1.5">
                  <AnimatedStat target={s.value} suffix={s.suffix} />
                  <span className="text-sm text-black/38">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={scrollToPlans}
        role="button"
        aria-label="Scroll to plans"
      >
        <div className="w-5 h-8 rounded-full border-2 border-black/15 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 rounded-full bg-black/25"
          />
        </div>
      </motion.div>
    </section>
  );
}
