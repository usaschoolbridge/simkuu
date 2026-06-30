"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Signal, Wifi, Check, Zap, Globe, ShieldCheck, Star, ChevronDown } from "lucide-react";

// Load Hyperspeed only client-side (requires WebGL)
const Hyperspeed = dynamic(() => import("@/components/ui/Hyperspeed"), { ssr: false });

// White-background friendly color scheme for Hyperspeed
const HYPERSPEED_WHITE = {
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.8, 0.8] as [number, number],
  carFloorSeparation: [0, 5] as [number, number],
  colors: {
    roadColor:    0xf0f0f2,   // near-white road
    islandColor:  0xf5f5f7,   // near-white island
    background:   0xffffff,   // pure white scene background
    shoulderLines: 0xd1d5db,  // light gray road markings
    brokenLines:   0xd1d5db,
    leftCars:  [0xd856bf, 0x7c3aed, 0xc247ac] as number[],  // vivid pink/purple
    rightCars: [0x06b6d4, 0x3b82f6, 0x0ea5e9] as number[],  // vivid teal/blue
    sticks:    0x06b6d4 as number,
  },
};

/* ─────────── Mini re-implementations of the real page sections ─────────── */

function PreviewNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-black/[0.06] bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Wifi className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-base text-black">Simkuu</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-black/60">
          {["Plans","Coverage","Carriers","Pricing","Blog"].map(n => (
            <Link key={n} href="/" className="hover:text-black transition-colors">{n}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-black/60 hover:text-black">Log In</Link>
          <Link href="/plans" className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function PreviewHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-14 overflow-hidden bg-white">

      {/* ── Hyperspeed WebGL fills the whole hero background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Hyperspeed effectOptions={HYPERSPEED_WHITE} />
      </div>

      {/* Soft vignette: heavy top fade keeps text legible, open bottom shows road */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(255,255,255,0.97) 0%,
              rgba(255,255,255,0.88) 30%,
              rgba(255,255,255,0.55) 60%,
              rgba(255,255,255,0.10) 80%,
              rgba(255,255,255,0.00) 100%
            )
          `
        }}
      />
      {/* Side fades */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(255,255,255,0.6) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.6) 100%)" }}
      />

      {/* ── Hero content ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 py-20 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          USA&apos;s #1 eSIM Marketplace
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-black text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-black mb-6"
        >
          Premium{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
            USA eSIM
          </span>
          <br />
          On Your Terms
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-black/50 leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Instant access to T-Mobile, Verizon, AT&T and MVNO networks.
          No contracts. No SIM cards. Activate in under 2 minutes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
        >
          <Link
            href="/plans"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-black text-white font-bold text-base hover:bg-black/80 transition-colors shadow-lg"
          >
            Browse Plans <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/coverage"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white border border-black/10 text-black font-semibold text-base hover:bg-black/[0.03] transition-colors shadow-sm"
          >
            <Play className="w-4 h-4 fill-black" /> See Coverage
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 mb-14"
        >
          {["No contracts", "Instant QR", "5G included"].map(t => (
            <div key={t} className="flex items-center gap-2 text-sm text-black/40">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t}
            </div>
          ))}
        </motion.div>

        {/* Carrier pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <span className="text-xs text-black/30 font-medium uppercase tracking-widest">Powered by</span>
          {[
            { name: "T-Mobile",     color: "#E20074" },
            { name: "Verizon",      color: "#CD040B" },
            { name: "AT&T",         color: "#00A8E0" },
            { name: "T-Mobile MVNO",color: "#8B5CF6" },
          ].map(c => (
            <div key={c.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] border border-black/[0.06]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-xs font-semibold text-black/60">{c.name}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-black/20">
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
}

function PreviewWhyChooseUs() {
  const features = [
    { icon: Zap,        title: "Instant Delivery",    desc: "Your eSIM QR code arrives in your inbox within seconds of purchase. No waiting, no shipping." },
    { icon: Globe,      title: "5G USA Coverage",     desc: "Full nationwide 5G access on T-Mobile, Verizon, AT&T and partner MVNO networks." },
    { icon: ShieldCheck,title: "Zero Contracts",      desc: "Month-to-month plans with no hidden fees. Cancel or switch at any time — zero penalties." },
    { icon: Star,       title: "24/7 Support",        desc: "Our team is online around the clock to help you set up, troubleshoot, or switch plans." },
  ];
  return (
    <section className="py-24 bg-white border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Why Simkuu</p>
          <h2 className="font-black text-4xl md:text-5xl text-black">Everything you need,<br/>nothing you don&apos;t</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="rounded-2xl border border-black/[0.06] p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-base text-black mb-2">{f.title}</h3>
              <p className="text-sm text-black/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewPlans() {
  const plans = [
    { name: "T-Mobile 15GB", carrier: "T-Mobile", data: "15 GB", price: "$19.99", color: "from-pink-500 to-rose-600", badge: null },
    { name: "T-Mobile Unlimited", carrier: "T-Mobile", data: "Unlimited", price: "$29.99", color: "from-blue-600 to-purple-700", badge: "Popular" },
    { name: "Verizon 25GB", carrier: "Verizon", data: "25 GB", price: "$24.99", color: "from-red-500 to-orange-600", badge: null },
    { name: "Verizon 50GB", carrier: "Verizon", data: "50 GB", price: "$39.99", color: "from-emerald-500 to-teal-600", badge: "Best Value" },
  ];
  return (
    <section className="py-24 bg-gray-50/50 border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Plans & Pricing</p>
          <h2 className="font-black text-4xl md:text-5xl text-black">Simple, transparent pricing</h2>
          <p className="text-black/40 mt-4 max-w-md mx-auto">No hidden fees. No contracts. Cancel anytime.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map(p => (
            <div key={p.name} className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {p.badge && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider z-10">
                  {p.badge}
                </div>
              )}
              <div className={`bg-gradient-to-br ${p.color} p-5 text-white`}>
                <div className="text-white/60 text-xs mb-1">{p.carrier}</div>
                <div className="font-black text-lg mb-1">{p.name}</div>
                <div className="font-black text-3xl">{p.data}</div>
              </div>
              <div className="bg-white p-5">
                <div className="font-black text-2xl text-black mb-4">{p.price}<span className="text-sm font-normal text-black/30">/mo</span></div>
                {["Instant QR delivery","5G access","24/7 support"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-black/60 mb-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />{f}
                  </div>
                ))}
                <Link href="/plans" className="mt-4 block text-center py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors">
                  Get This Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/plans" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:gap-3 transition-all">
            View all plans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PreviewHowItWorks() {
  const steps = [
    { n: "01", title: "Choose a plan", desc: "Pick any plan from our lineup — T-Mobile, Verizon, AT&T or MVNO." },
    { n: "02", title: "Complete checkout", desc: "Pay securely with card, PayPal, Apple Pay, or crypto." },
    { n: "03", title: "Scan QR code",   desc: "Your QR code arrives instantly. Scan it in your phone settings." },
    { n: "04", title: "You're connected",desc: "Your eSIM activates in under 2 minutes. Enjoy 5G nationwide." },
  ];
  return (
    <section className="py-24 bg-white border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="font-black text-4xl md:text-5xl text-black">Up and running in minutes</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-black/10 -translate-y-px z-0" style={{ width: "calc(100% - 2.5rem)", left: "calc(100% - 1.25rem)" }} />
              )}
              <div className="text-4xl font-black text-black/[0.06] mb-3">{s.n}</div>
              <h3 className="font-bold text-base text-black mb-2">{s.title}</h3>
              <p className="text-sm text-black/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewTestimonials() {
  const reviews = [
    { name: "Sarah M.", loc: "New York", stars: 5, text: "Set up in 3 minutes. I was nervous about eSIM but Simkuu made it completely painless. The QR code arrived instantly." },
    { name: "James T.", loc: "Los Angeles", stars: 5, text: "Best eSIM service I've used. T-Mobile coverage is excellent and the price is unbeatable. No contracts is a huge plus." },
    { name: "Priya K.", loc: "Austin", stars: 5, text: "Switched from a carrier store eSIM and paying half the price for the same 5G network. Wish I found this sooner!" },
  ];
  return (
    <section className="py-24 bg-gray-50/50 border-t border-black/[0.04]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Reviews</p>
          <h2 className="font-black text-4xl md:text-5xl text-black">Loved by 250K+ customers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div key={r.name} className="bg-white rounded-2xl border border-black/[0.06] p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-black/70 leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">{r.name}</div>
                  <div className="text-xs text-black/30">{r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreviewFooter() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wifi className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-black text-base">Simkuu</span>
            </div>
            <p className="text-white/40 text-sm max-w-xs leading-relaxed">
              Premium USA eSIM plans on T-Mobile, Verizon, AT&T and MVNO networks. Instant delivery, no contracts.
            </p>
          </div>
          {[
            { title: "Plans", links: ["T-Mobile","Verizon","AT&T","MVNO"] },
            { title: "Company", links: ["About","Blog","Careers","Contact"] },
            { title: "Legal", links: ["Privacy","Terms","Cancellation","FAQ"] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{col.title}</div>
              <div className="space-y-2">
                {col.links.map(l => (
                  <div key={l} className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">{l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex items-center justify-between text-xs text-white/20">
          <span>© 2026 Simkuu Inc. All rights reserved.</span>
          <span>Made in USA 🇺🇸</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── Full preview page ─────────── */
export default function PreviewHyperspeedPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed preview badge */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-400/95 backdrop-blur-sm shadow-lg text-black text-sm font-semibold whitespace-nowrap">
        <Wifi className="w-4 h-4" />
        Preview only — not deployed
        <Link href="/" className="ml-2 underline text-black/60 hover:text-black text-xs">← Back to site</Link>
      </div>

      <PreviewNav />
      <PreviewHero />
      <PreviewWhyChooseUs />
      <PreviewPlans />
      <PreviewHowItWorks />
      <PreviewTestimonials />
      <PreviewFooter />
    </div>
  );
}
