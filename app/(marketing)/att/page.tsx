import type { Metadata } from "next";
import { CarrierPage } from "@/components/shared/carrier-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "AT&T eSIM Plans — 5G+ FirstNet Coverage, No Contract",
  description: "AT&T eSIM plans with 5G+, deep urban coverage, and FirstNet backbone. Instant QR activation.",
  alternates: { canonical: `${siteConfig.url}/att` },
  openGraph: {
    title: "AT&T eSIM Plans — 5G+ FirstNet Coverage",
    description: "AT&T eSIM plans with 5G+, deep urban coverage, and FirstNet backbone. Instant QR activation.",
    url: `${siteConfig.url}/att`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=AT%26T+eSIM+Plans&sub=5G%2B+%C2%B7+FirstNet+%C2%B7+Deep+Urban+Coverage&tag=From+%2416%2Fmo`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "AT&T eSIM Plans", images: [`${siteConfig.url}/og?title=AT%26T+eSIM&sub=From+%2416%2Fmo`], site: "@simkuu" },
};

export default function ATTPage() {
  return (
    <CarrierPage
      name="AT&T"
      slug="att"
      color="#00A8E0"
      tagline="Deep coverage where it matters most"
      description="AT&T's FirstNet-backed network delivers outstanding coverage in dense urban areas, buildings, and underground. Trusted by first responders and business professionals."
      coverage="97% USA"
      network="5G+ / FirstNet"
      heroStat={{ value: "First", label: "Responder Network" }}
      highlights={[
        { icon: "Shield", title: "FirstNet Backbone", body: "AT&T powers FirstNet, the dedicated network for first responders — meaning unmatched resilience and priority during emergencies." },
        { icon: "Signal", title: "Deep Urban Coverage", body: "AT&T excels in dense cities, penetrating buildings, subways, and stadiums better than any other carrier." },
        { icon: "Globe", title: "5G+ Nationwide", body: "AT&T's 5G+ (C-Band) brings mid-band 5G speeds to millions of Americans in hundreds of cities." },
      ]}
    />
  );
}
