import type { Metadata } from "next";
import { CarrierPage } from "@/components/shared/carrier-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "T-Mobile eSIM Plans — Unlimited 5G, No Contract",
  description: "Get a T-Mobile eSIM instantly. Unlimited data, 5G, no contracts. Activate in under 2 minutes.",
  alternates: { canonical: `${siteConfig.url}/t-mobile` },
  openGraph: {
    title: "T-Mobile eSIM Plans — Unlimited 5G, No Contract",
    description: "Get a T-Mobile eSIM instantly. Unlimited data, 5G, no contracts. Activate in under 2 minutes.",
    url: `${siteConfig.url}/t-mobile`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=T-Mobile+eSIM+Plans&sub=Unlimited+5G+%C2%B7+No+Contract+%C2%B7+Instant+QR&tag=From+%2415%2Fmo`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "T-Mobile eSIM Plans", images: [`${siteConfig.url}/og?title=T-Mobile+eSIM&sub=From+%2415%2Fmo`], site: "@simkuu" },
};

export default function TMobilePage() {
  return (
    <CarrierPage
      name="T-Mobile"
      slug="tmobile"
      color="#E20074"
      tagline="America's largest 5G network"
      description="T-Mobile covers 99% of the USA with the nation's largest 5G network. Get blazing-fast speeds, unlimited everything, and instant eSIM activation."
      coverage="99% USA"
      network="5G Nationwide"
      heroStat={{ value: "320M+", label: "People Covered" }}
      highlights={[
        { icon: "Signal", title: "Largest 5G Network", body: "T-Mobile operates the USA's largest and fastest 5G network, covering more Americans than any other carrier." },
        { icon: "Zap", title: "Fastest Speeds", body: "Consistently ranked #1 in 5G speed by independent testers. Stream, download, and game without limits." },
        { icon: "Globe", title: "Deep Rural Reach", body: "Mid-band and low-band spectrum combines to deliver coverage even in hard-to-reach rural areas." },
      ]}
    />
  );
}
