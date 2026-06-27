"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wifi, Shield, Zap, Globe } from "lucide-react";

const FEATURES = [
  { icon: Zap, text: "Instant activation in under 2 minutes" },
  { icon: Shield, text: "256-bit encrypted eSIM delivery" },
  { icon: Globe, text: "Nationwide 5G coverage on T-Mobile & Verizon" },
  { icon: Wifi, text: "No physical SIM. No store visit." },
];

const floatVariants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden bg-black flex-col justify-between p-12">
        {/* Background mesh */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20" />
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-xl text-white tracking-tight">Simkuu</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-start">
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="mb-8 w-72 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">T-Mobile Unlimited</div>
                <div className="text-white/40 text-xs">Active · 5G Connected</div>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Data used</span>
                <span className="text-white font-medium">18.4 GB / ∞</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "32%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="text-xs text-white/30">Unlimited · Resets in 12 days</div>
            </div>
          </motion.div>

          <h2 className="font-display text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            The fastest way to get<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">connected in the USA.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-sm leading-relaxed mb-8">
            Join 50,000+ customers who trust Simkuu for instant, reliable eSIM activation.
          </p>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-white/60 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust badges */}
        <div className="relative z-10 flex items-center gap-6">
          {["T-Mobile", "Verizon", "AT&T"].map((carrier) => (
            <div key={carrier} className="text-white/20 text-xs font-semibold tracking-wider uppercase">{carrier}</div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-lg text-black">Simkuu</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        <p className="mt-8 text-center text-xs text-black/30 max-w-xs">
          By using Simkuu, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-black transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-black transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
