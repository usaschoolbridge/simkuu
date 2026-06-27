import type { Metadata } from "next";
import { CoverageMap } from "@/components/sections/coverage-map";
import { Reveal } from "@/components/motion/reveal";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "USA Coverage Map — T-Mobile, Verizon & AT&T",
  description: "Check T-Mobile, Verizon, AT&T, and MVNO eSIM coverage across all 50 US states.",
  alternates: { canonical: `${siteConfig.url}/coverage` },
  openGraph: {
    title: "USA eSIM Coverage Map — 50 States",
    description: "Check T-Mobile, Verizon, AT&T, and MVNO eSIM coverage across all 50 US states.",
    url: `${siteConfig.url}/coverage`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=USA+Coverage+Map&sub=99%25+Coverage+%C2%B7+All+50+States&tag=T-Mobile+%C2%B7+Verizon+%C2%B7+AT%26T`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "USA eSIM Coverage Map", images: [`${siteConfig.url}/og?title=USA+Coverage+Map&sub=All+50+States`], site: "@simkuu" },
};

export default function CoveragePage() {
  return (
    <>
      <section className="pt-32 pb-8">
        <div className="container-xl text-center">
          <Reveal variant="fadeUp">
            <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
              Coverage across <span className="text-gradient">all 50 states</span>
            </h1>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <p className="text-xl text-black/50 max-w-2xl mx-auto">
              Explore real-time coverage from every carrier we offer. Click a city to see which networks are available.
            </p>
          </Reveal>
        </div>
      </section>
      <CoverageMap />
    </>
  );
}
