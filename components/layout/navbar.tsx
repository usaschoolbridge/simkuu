"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ChevronDown, Wifi } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/currency";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export function SimkuuLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const iconInner = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-[18px]";
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0", iconSize)}>
        <Wifi className={cn("text-white", iconInner)} />
      </div>
      <span className={cn("font-black text-black tracking-tight leading-none", textSize)} style={{ fontFamily: "var(--font-space-grotesk)" }}>
        Simkuu
      </span>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency } = useCurrency();

  // Simple passive scroll listener — no framer-motion useScroll overhead
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-black/[0.06] shadow-sm"
          : "bg-white/80 backdrop-blur-md border-b border-transparent"
      )}
    >
      <div className="container-xl">
        <div className="flex items-center justify-between h-16 md:h-[68px]">
          {/* Logo */}
          <Link href="/" aria-label="Simkuu home">
            <SimkuuLogo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5" ref={dropdownRef}>
            {(siteConfig.nav.main as unknown as NavItem[]).map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <>
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        "text-black/60 hover:text-black hover:bg-black/[0.05]",
                        activeDropdown === item.label && "text-black bg-black/[0.05]"
                      )}
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.label ? null : item.label)
                      }
                    >
                      {item.label}
                      <motion.span
                        animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-black/[0.06] overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center px-4 py-3 text-sm text-black/70 hover:text-black hover:bg-black/[0.03] transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="px-3.5 py-2 rounded-full text-sm font-medium text-black/60 hover:text-black hover:bg-black/[0.05] transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Currency Toggle */}
            <div className="flex items-center rounded-full border border-black/10 bg-black/[0.03] p-0.5 text-xs font-semibold mr-1">
              <button
                onClick={() => setCurrency("USD")}
                className={cn(
                  "px-2.5 py-1.5 rounded-full transition-all duration-200",
                  currency === "USD"
                    ? "bg-white text-black shadow-sm"
                    : "text-black/40 hover:text-black/60"
                )}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency("INR")}
                className={cn(
                  "px-2.5 py-1.5 rounded-full transition-all duration-200",
                  currency === "INR"
                    ? "bg-white text-black shadow-sm"
                    : "text-black/40 hover:text-black/60"
                )}
              >
                ₹ INR
              </button>
            </div>

            <Link href="/login">
              <button className="px-4 py-2 rounded-full text-sm font-medium text-black/60 hover:text-black hover:bg-black/[0.05] transition-all duration-200">
                Log In
              </button>
            </Link>
            <Link href="/plans">
              <button className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.05] transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-black/[0.06] overflow-hidden bg-white"
          >
            <div className="container-xl py-4 space-y-1">
              {(siteConfig.nav.main as unknown as NavItem[]).map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {item.children ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 text-[11px] font-semibold text-black/30 uppercase tracking-wider">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block px-5 py-2.5 text-sm text-black/70 hover:text-black rounded-xl hover:bg-black/[0.04] transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 text-sm font-medium text-black/70 hover:text-black rounded-xl hover:bg-black/[0.04] transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <div className="pt-4 pb-2 flex flex-col gap-2.5 border-t border-black/[0.06] mt-3">
                <div className="flex items-center rounded-full border border-black/10 bg-black/[0.02] p-0.5 text-xs font-semibold self-start">
                  <button
                    onClick={() => setCurrency("USD")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-full transition-all duration-200",
                      currency === "USD" ? "bg-white text-black shadow-sm" : "text-black/40"
                    )}
                  >
                    $ USD
                  </button>
                  <button
                    onClick={() => setCurrency("INR")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-full transition-all duration-200",
                      currency === "INR" ? "bg-white text-black shadow-sm" : "text-black/40"
                    )}
                  >
                    ₹ INR
                  </button>
                </div>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <button className="w-full py-3 rounded-full border border-black/10 text-sm font-medium text-black/70 hover:bg-black/[0.04] transition-colors">
                    Log In
                  </button>
                </Link>
                <Link href="/plans" onClick={() => setOpen(false)}>
                  <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20">
                    Get Started →
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
