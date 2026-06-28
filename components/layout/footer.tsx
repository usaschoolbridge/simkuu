"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wifi, ArrowUpRight, Mail, MapPin } from "lucide-react";
// Social icons via simple SVG since lucide v0.400+ renamed these
function TwitterIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.845L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>;
}
function InstagramIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
function LinkedinIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
}
import { siteConfig } from "@/config/site";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch {
      // silently fail for now
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#FAFAFA] border-t border-black/[0.06]">
      {/* Newsletter CTA */}
      <div className="border-b border-black/[0.06]">
        <div className="container-xl py-16">
          <div className="max-w-2xl">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-black mb-3">
              Stay in the loop
            </h3>
            <p className="text-black/50 mb-8 text-lg">
              Get exclusive deals, plan updates, and early access to new carriers.
            </p>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-green-600"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">✓</div>
                <span className="font-medium">You&apos;re subscribed! Welcome aboard.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-3 flex-col sm:flex-row max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-12 px-4 rounded-full border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
                <button type="submit" className="shrink-0 h-12 px-6 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity shadow-md shadow-blue-500/20">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-xl py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Wifi className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg text-black tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Simkuu
              </span>
            </Link>
            <p className="text-sm text-black/40 leading-relaxed mb-4">
              Premium USA carrier eSIMs. No contracts. Instant activation.
            </p>
            <div className="space-y-2 mb-6">
              <a href="mailto:support@simkuu.com" className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                support@simkuu.com
              </a>
              <div className="flex items-center gap-2 text-sm text-black/40">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                United States
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[
                { icon: TwitterIcon, href: siteConfig.social.twitter, label: "Twitter" },
                { icon: InstagramIcon, href: siteConfig.social.instagram, label: "Instagram" },
                { icon: LinkedinIcon, href: siteConfig.social.linkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-black/40 hover:text-black hover:border-black/20 transition-colors"
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: siteConfig.footer.product },
            { title: "Company", links: siteConfig.footer.company },
            { title: "Support", links: siteConfig.footer.support },
            { title: "Legal", links: siteConfig.footer.legal },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-black/50 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-black/[0.06]">
        <div className="container-xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-black/30">
            © {new Date().getFullYear()} Simkuu. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-black/30">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>in the USA</span>
          </div>
          <a
            href="https://simkuu.com"
            className="flex items-center gap-1 text-xs text-black/30 hover:text-black transition-colors"
          >
            simkuu.com <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
