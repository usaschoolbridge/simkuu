import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Careers at Simkuu | Join Our Team",
  description: "Join the team building the future of USA mobile connectivity. Explore open positions at Simkuu.",
  alternates: { canonical: `${siteConfig.url}/careers` },
  openGraph: {
    title: "Careers at Simkuu | Join Our Team",
    description: "Join the team building the future of USA mobile connectivity.",
    url: `${siteConfig.url}/careers`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const VALUES = [
  { emoji: "⚡", title: "Move Fast", desc: "We ship, learn, and iterate quickly. No unnecessary meetings, no bureaucracy." },
  { emoji: "🎯", title: "Customer First", desc: "Every decision starts with what's best for our customers. Always." },
  { emoji: "🌍", title: "Remote-Friendly", desc: "We're a distributed team. Work from wherever you're most productive." },
  { emoji: "🔓", title: "Radical Transparency", desc: "We share financials, roadmaps, and strategy openly with the whole team." },
  { emoji: "📈", title: "Ownership", desc: "Every team member is empowered to own their work and make real decisions." },
  { emoji: "🤝", title: "No Ego Culture", desc: "Great ideas can come from anywhere. Title doesn't determine whose voice matters." },
];

const PERKS = [
  "Competitive salary & equity",
  "Fully remote team",
  "Flexible working hours",
  "Health, dental, and vision insurance (USA employees)",
  "Annual learning & development budget ($2,000/year)",
  "Home office stipend",
  "Unlimited PTO (we actually take ours)",
  "Free Simkuu eSIM plan",
  "Team retreats (2×/year)",
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-b border-black/[0.06]">
        <div className="container-xl py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-purple-100 text-purple-600 text-sm font-medium mb-6">
              We&apos;re Hiring
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-6">
              Help us connect{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                America
              </span>
            </h1>
            <p className="text-xl text-black/50 leading-relaxed">
              We&apos;re a small, ambitious team building the infrastructure for the next generation of mobile connectivity.
              If you care about making technology simple and accessible, we&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="container-xl py-16">
        <div className="max-w-4xl mx-auto">

          <section className="mb-20">
            <h2 className="font-display text-3xl font-bold text-black mb-3">Open Positions</h2>
            <p className="text-black/50 mb-10">We&apos;re growing! We don&apos;t have any open positions at the moment, but we&apos;re always interested in meeting great people.</p>

            <div className="rounded-2xl border border-black/[0.08] bg-[#FAFAFA] p-12 text-center">
              <div className="text-5xl mb-4">🔭</div>
              <h3 className="font-display text-xl font-bold text-black mb-3">No Open Roles Right Now</h3>
              <p className="text-black/50 text-sm max-w-md mx-auto leading-relaxed mb-8">
                We don&apos;t currently have any open positions listed, but we&apos;re always on the lookout for exceptional talent.
                If you think you&apos;d be a great fit for Simkuu, send us your CV — we keep exceptional applications on file.
              </p>
              <a
                href="mailto:careers@simkuu.com?subject=General Application — Simkuu"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity"
              >
                Send Your CV →
              </a>
              <p className="text-black/30 text-xs mt-4">careers@simkuu.com</p>
            </div>
          </section>

          {/* Culture */}
          <section className="mb-20">
            <h2 className="font-display text-3xl font-bold text-black mb-3">Our Culture</h2>
            <p className="text-black/50 mb-10 leading-relaxed">
              We&apos;re building Simkuu the way we wish all software companies were built — fast, transparent, and with genuine care for both customers and teammates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {VALUES.map(({ emoji, title, desc }) => (
                <div key={title} className="rounded-2xl border border-black/[0.08] p-6">
                  <div className="text-3xl mb-3">{emoji}</div>
                  <div className="font-display font-bold text-black mb-2">{title}</div>
                  <p className="text-sm text-black/50 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Perks */}
          <section className="mb-20">
            <h2 className="font-display text-3xl font-bold text-black mb-3">Perks & Benefits</h2>
            <p className="text-black/50 mb-8">We invest in the people who build Simkuu.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-black/70 text-sm">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <section className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-10 text-center">
            <h2 className="font-display text-2xl font-bold text-black mb-3">Interested in joining us?</h2>
            <p className="text-black/50 mb-6 leading-relaxed">
              Even without open positions listed, we&apos;re always happy to receive speculative applications from talented people.
              Introduce yourself and tell us what you could bring to the team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@simkuu.com?subject=Speculative Application"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity"
              >
                Email Your CV
              </a>
              <a
                href="/contact"
                className="px-8 py-3 rounded-full border border-black/10 text-black text-sm font-semibold hover:bg-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
