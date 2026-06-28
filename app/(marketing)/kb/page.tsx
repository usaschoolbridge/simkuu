"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Zap, Settings, CreditCard, Smartphone, ChevronRight } from "lucide-react";

const CATEGORIES = [
  {
    icon: Zap,
    title: "Getting Started",
    color: "blue",
    articles: [
      { title: "What is an eSIM and how does it work?", slug: "what-is-esim", readTime: "3 min" },
      { title: "How to check if your device supports eSIM", slug: "check-device-compatibility", readTime: "2 min" },
      { title: "Choosing the right Simkuu plan for you", slug: "choosing-your-plan", readTime: "4 min" },
      { title: "Creating your Simkuu account", slug: "create-account", readTime: "2 min" },
    ],
  },
  {
    icon: Settings,
    title: "Activation",
    color: "purple",
    articles: [
      { title: "How to activate your eSIM on iPhone", slug: "activate-esim-iphone", readTime: "3 min" },
      { title: "How to activate your eSIM on Android", slug: "activate-esim-android", readTime: "3 min" },
      { title: "Setting up Dual SIM on your device", slug: "dual-sim-setup", readTime: "4 min" },
      { title: "Configuring APN settings manually", slug: "apn-settings", readTime: "5 min" },
    ],
  },
  {
    icon: BookOpen,
    title: "Troubleshooting",
    color: "red",
    articles: [
      { title: "eSIM QR code not scanning — what to do", slug: "qr-code-not-scanning", readTime: "3 min" },
      { title: "No signal after eSIM activation", slug: "no-signal-after-activation", readTime: "4 min" },
      { title: "eSIM showing as inactive or disabled", slug: "esim-inactive", readTime: "3 min" },
      { title: "Data not working — troubleshooting guide", slug: "data-not-working", readTime: "5 min" },
    ],
  },
  {
    icon: CreditCard,
    title: "Billing",
    color: "green",
    articles: [
      { title: "Understanding your Simkuu invoice", slug: "understanding-invoice", readTime: "2 min" },
      { title: "How to update your payment method", slug: "update-payment-method", readTime: "2 min" },
      { title: "Requesting a refund", slug: "requesting-refund", readTime: "3 min" },
      { title: "Cancelling your subscription", slug: "cancel-subscription", readTime: "2 min" },
    ],
  },
  {
    icon: Smartphone,
    title: "Device Compatibility",
    color: "amber",
    articles: [
      { title: "Compatible iPhone models for eSIM", slug: "iphone-compatibility", readTime: "3 min" },
      { title: "Compatible Android devices for eSIM", slug: "android-compatibility", readTime: "4 min" },
      { title: "How to unlock your device for eSIM", slug: "unlock-device-esim", readTime: "5 min" },
      { title: "eSIM support on Samsung Galaxy devices", slug: "samsung-galaxy-esim", readTime: "3 min" },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
  green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
};

export default function KbPage() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(query.toLowerCase()) ||
            cat.title.toLowerCase().includes(query.toLowerCase())
        ),
      })).filter((cat) => cat.articles.length > 0)
    : CATEGORIES;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-black/[0.06]">
        <div className="container-xl py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            Knowledge Base
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-xl text-black/50 max-w-2xl mx-auto mb-10">
            Browse articles, guides, and tutorials to get the most out of your Simkuu eSIM.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full h-12 pl-11 pr-4 rounded-full border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container-xl py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-bold text-black mb-2">No articles found</h3>
            <p className="text-black/50 text-sm">Try a different search term or <Link href="/contact" className="text-blue-600 hover:underline">contact support</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cat) => {
              const Icon = cat.icon;
              const colors = COLOR_MAP[cat.color];
              return (
                <div key={cat.title} className={`rounded-2xl border ${colors.border} bg-white overflow-hidden`}>
                  <div className={`${colors.bg} px-6 py-5 flex items-center gap-3`}>
                    <div className={`w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>
                    <h2 className="font-display font-bold text-black">{cat.title}</h2>
                  </div>
                  <ul className="divide-y divide-black/[0.05]">
                    {cat.articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/kb/${article.slug}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAFA] transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-black/70 group-hover:text-black transition-colors">{article.title}</span>
                            <span className="block text-xs text-black/30 mt-0.5">{article.readTime} read</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-black/40 flex-shrink-0 ml-3 transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-black mb-3">Can&apos;t find what you&apos;re looking for?</h2>
          <p className="text-black/50 mb-6 text-sm">Our support team is always ready to help with anything not covered here.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity">
              Contact Support
            </Link>
            <Link href="/support" className="px-8 py-3 rounded-full border border-black/10 text-black text-sm font-semibold hover:bg-[#FAFAFA] transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
