import type { Metadata } from "next";
import { Reveal, StaggerReveal } from "@/components/motion/reveal";
import { AboutStats } from "@/components/shared/about-stats";
import { Users, Zap, Shield, Globe } from "lucide-react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Simkuu — Premium USA eSIM Marketplace",
  description: "Learn about Simkuu — the premium USA eSIM marketplace built for modern connectivity.",
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: "About Simkuu — Premium USA eSIM Marketplace",
    description: "Learn about Simkuu — the premium USA eSIM marketplace built for modern connectivity.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=About+Simkuu&sub=Built+for+modern+connectivity&tag=250K%2B+eSIMs+Activated`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "About Simkuu", images: [`${siteConfig.url}/og?title=About+Simkuu&sub=Premium+USA+eSIM+Marketplace`], site: "@simkuu" },
};

const VALUES = [
  { icon: Zap, title: "Speed First", body: "We obsess over activation time. Getting you connected in under 2 minutes is our baseline, not our goal." },
  { icon: Shield, title: "No BS Pricing", body: "What you see is what you pay. No activation fees, no hidden charges, no contracts, ever." },
  { icon: Users, title: "Customer Obsessed", body: "Our 24/7 support team consists of real humans who actually use the product they support." },
  { icon: Globe, title: "USA Focused", body: "We only sell USA eSIMs. That focus means we know every nuance of every carrier we offer." },
];

const STATS = [
  { value: "250K+", label: "eSIMs Activated" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "< 2min", label: "Avg Activation" },
  { value: "99%", label: "USA Coverage" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="container-xl text-center relative">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              Our Story
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h1 className="font-display text-5xl md:text-7xl font-black text-black tracking-tight mb-6">
              Built for the{" "}
              <span className="text-gradient">connected era</span>
            </h1>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-xl text-black/50 max-w-3xl mx-auto leading-relaxed">
              We started Simkuu because getting a reliable USA phone plan was unnecessarily painful.
              Too many contracts. Too many fees. Too many visits to carrier stores.
              We built the alternative — a premium eSIM marketplace that gets you connected instantly,
              with the best networks, at honest prices.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#FAFAFA] border-y border-black/[0.04]">
        <div className="container-xl">
              <AboutStats stats={STATS} />
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="container-xl max-w-4xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal variant="fadeLeft">
              <div>
                <div className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">Our Mission</div>
                <h2 className="font-display text-4xl font-black text-black mb-6 leading-tight">
                  Make premium connectivity accessible to everyone
                </h2>
                <p className="text-black/50 leading-relaxed mb-4">
                  We believe that access to fast, reliable mobile connectivity should be simple,
                  transparent, and affordable. No expertise required. No fine print.
                </p>
                <p className="text-black/50 leading-relaxed">
                  By partnering directly with T-Mobile, Verizon, AT&T, and MVNO operators,
                  we can offer wholesale-grade pricing with a premium consumer experience on top.
                </p>
              </div>
            </Reveal>
            <Reveal variant="fadeRight">
              <div className="grid grid-cols-2 gap-4">
                {VALUES.map((v) => {
                  const Icon = v.icon;
                  return (
                    <div key={v.title} className="card-premium p-5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="font-display font-bold text-sm text-black mb-1">{v.title}</div>
                      <p className="text-xs text-black/50 leading-relaxed">{v.body}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Team note */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container-xl text-center max-w-2xl">
          <Reveal variant="fadeUp">
            <h2 className="font-display text-3xl font-black text-black mb-4">A small team with big ambitions</h2>
            <p className="text-black/50 leading-relaxed mb-8">
              We&apos;re a lean team of engineers, designers, and telecom nerds who believe the future of mobile
              is digital-first. We use Simkuu ourselves, which means every feature we ship is one we actually need.
            </p>
            <a href="/contact" className="text-blue-600 font-semibold hover:underline">Say hello →</a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
