"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { heroTitle, heroSubtitle, heroButtons, heroFloat, staggerContainer, fadeUp } from "@/animations/variants";
import { Magnetic } from "@/components/motion/magnetic";

// ---- Particle System ----
function Particles({ count = 60 }: { count?: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number; opacity: number }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      }))
    );
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ---- Animated Phone Mockup ----
function PhoneMockup() {
  return (
    <motion.div variants={heroFloat} className="relative w-full max-w-xs mx-auto">
      {/* Glow behind phone */}
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-b from-blue-400/20 via-purple-400/20 to-transparent blur-3xl scale-110 animate-pulse-glow" />

      {/* Phone shell */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-gray-900 to-black shadow-[0_40px_80px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-10" />

        {/* Screen */}
        <div className="pt-10 pb-4 px-1.5 bg-gradient-to-b from-[#0A0A12] to-[#060608] min-h-[520px]">
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 py-2 text-white text-[10px]">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="w-3 h-3" />
              <span>5G</span>
            </div>
          </div>

          {/* eSIM Card UI */}
          <div className="px-3 mt-3 space-y-3">
            {/* Active eSIM */}
            <motion.div
              className="rounded-2xl p-4 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <div className="text-white/60 text-[10px] mb-1">Active Plan</div>
              <div className="text-white font-bold text-base">T-Mobile Unlimited</div>
              <div className="text-white/80 text-xs mt-1">5G · Unlimited Data</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "72%" }}
                    transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-white/60 text-[10px]">28 days left</span>
              </div>
            </motion.div>

            {/* Stats row */}
            {[
              { label: "Data Used", value: "28.4 GB", color: "from-cyan-500 to-blue-500" },
              { label: "Calls", value: "∞", color: "from-purple-500 to-pink-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.15 }}
                className="rounded-xl p-3 bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="text-white/40 text-[10px]">{stat.label}</div>
                  <div className="text-white font-semibold text-sm">{stat.value}</div>
                </div>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stat.color} opacity-80`} />
              </motion.div>
            ))}

            {/* QR code placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.07] flex items-center gap-3"
            >
              <div className="w-10 h-10 grid grid-cols-3 gap-0.5 shrink-0">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${[0,1,3,4,5,7,8].includes(i) ? "bg-white/70" : "bg-transparent"}`} />
                ))}
              </div>
              <div>
                <div className="text-white/40 text-[10px]">eSIM QR Code</div>
                <div className="text-white/70 text-xs">Ready to scan</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 bg-[#060608]">
          <div className="w-24 h-1 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-black/[0.06] px-3.5 py-2.5"
      >
        <div className="text-xs text-black/40 leading-none mb-0.5">Status</div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-black">Active</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-3 -left-6 bg-white rounded-2xl shadow-xl border border-black/[0.06] px-3.5 py-2.5"
      >
        <div className="text-xs text-black/40 leading-none mb-0.5">Network</div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-sm font-semibold text-black">5G Ultra</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Live Stats Bar ----
function LiveStats() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-16"
    >
      {siteConfig.stats.map((stat) => (
        <motion.div key={stat.label} variants={fadeUp} className="flex items-baseline gap-1.5 text-center">
          <AnimatedStat target={stat.value} suffix={stat.suffix} />
          <span className="text-sm text-black/40">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AnimatedStat({ target, suffix }: { target: string; suffix: string }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const prefix = target.includes("<") ? "< " : "";
    const plus = target.includes("+") ? "+" : "";

    if (isNaN(num)) { setDisplay(target); return; }

    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (num - start) * ease;
      setDisplay(`${prefix}${num % 1 !== 0 ? current.toFixed(1) : Math.round(current)}${plus}`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  return (
    <span className="font-display text-2xl md:text-3xl font-black text-black">
      {display}{suffix}
    </span>
  );
}

// ---- Carrier Logos ----
function CarrierLogos() {
  const carriers = [
    { name: "T-Mobile", color: "#E20074" },
    { name: "Verizon", color: "#CD040B" },
    { name: "AT&T", color: "#00A8E0" },
    { name: "T-Mobile MVNO", color: "#8B5CF6" },
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-wrap items-center justify-center gap-6 mt-8"
    >
      <span className="text-xs text-black/30 font-medium uppercase tracking-widest">Powered by</span>
      {carriers.map((c) => (
        <motion.div
          key={c.name}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] border border-black/[0.06]"
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
          <span className="text-xs font-semibold text-black/60">{c.name}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---- Hero Section ----
export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Background mesh */}
      <div className="absolute inset-0 mesh-bg" />

      {/* Radial hero glow */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full opacity-50 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
          x: useTransform(springX, [-0.5, 0.5], [-30, 30]),
          y: useTransform(springY, [-0.5, 0.5], [-20, 20]),
        }}
      />

      {/* Particles */}
      <Particles count={50} />

      <motion.div style={{ y, opacity }} className="relative z-10 w-full">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Text */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                USA&apos;s #1 eSIM Marketplace
              </motion.div>

              {/* Headline */}
              <div className="overflow-hidden mb-6">
                <motion.h1
                  variants={heroTitle}
                  initial="hidden"
                  animate="visible"
                  className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight text-black"
                >
                  Premium{" "}
                  <span className="text-gradient">USA eSIM</span>
                  <br />
                  On Your Terms
                </motion.h1>
              </div>

              {/* Subheadline */}
              <motion.p
                variants={heroSubtitle}
                initial="hidden"
                animate="visible"
                className="text-lg md:text-xl text-black/50 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
              >
                Instant access to T-Mobile, Verizon, AT&T and MVNO networks.
                No contracts. No SIM cards. Activate in under 2 minutes.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={heroButtons}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
              >
                <Magnetic strength={0.3}>
                  <Link href="/plans">
                    <Button variant="gradient" size="xl" className="group">
                      Browse Plans
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </Magnetic>

                <Magnetic strength={0.2}>
                  <Link href="/coverage">
                    <Button variant="outline" size="xl" className="group">
                      <Play className="w-4 h-4 fill-black" />
                      See Coverage
                    </Button>
                  </Link>
                </Magnetic>
              </motion.div>

              {/* Trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10"
              >
                {["No contracts", "Instant QR", "5G included"].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-black/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Phone mockup */}
            <motion.div
              variants={heroFloat}
              initial="hidden"
              animate="visible"
              className="lg:flex justify-center hidden"
            >
              <PhoneMockup />
            </motion.div>
          </div>

          {/* Carrier logos */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 1 } } }}
          >
            <CarrierLogos />
            <LiveStats />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-black/20 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-black/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
