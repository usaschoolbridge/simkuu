import type { Metadata } from "next";
import { PricingSection } from "@/components/sections/pricing";
import { Reveal } from "@/components/motion/reveal";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Pricing — Simple, Transparent eSIM Plans",
  description: "No contracts, no hidden fees. Simkuu pricing starts at $10/mo. Monthly, quarterly, and yearly options.",
  alternates: { canonical: `${siteConfig.url}/pricing` },
  openGraph: {
    title: "Pricing — Simple, Transparent eSIM Plans",
    description: "No contracts, no hidden fees. Simkuu pricing starts at $10/mo.",
    url: `${siteConfig.url}/pricing`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=eSIM+Pricing&sub=No+contracts+%C2%B7+No+hidden+fees&tag=From+%2410%2Fmo`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Pricing — Simkuu", images: [`${siteConfig.url}/og?title=eSIM+Pricing&sub=From+%2410%2Fmo&tag=No+Contracts`], site: "@simkuu" },
};

export default function PricingPage() {
  return (
    <>
      <section className="pt-32 pb-4">
        <div className="container-xl text-center">
          <Reveal variant="fadeUp">
            <h1 className="font-display text-5xl md:text-7xl font-black text-black tracking-tight mb-4">
              Simple, <span className="text-gradient">honest</span> pricing
            </h1>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <p className="text-xl text-black/50 max-w-2xl mx-auto">
              No contracts. No hidden fees. No activation charges. Just great plans at great prices.
            </p>
          </Reveal>
        </div>
      </section>
      <PricingSection />
    </>
  );
}
