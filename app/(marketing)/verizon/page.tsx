import type { Metadata } from "next";
import { CarrierPage } from "@/components/shared/carrier-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Verizon eSIM Plans — Ultra Wideband 5G, No Contract",
  description: "Verizon eSIM — America's most reliable network. Ultra Wideband 5G, priority data, instant activation.",
  alternates: { canonical: `${siteConfig.url}/verizon` },
  openGraph: {
    title: "Verizon eSIM Plans — Ultra Wideband 5G, No Contract",
    description: "Verizon eSIM — America's most reliable network. Ultra Wideband 5G, priority data, instant activation.",
    url: `${siteConfig.url}/verizon`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=Verizon+eSIM+Plans&sub=Ultra+Wideband+5G+%C2%B7+Most+Reliable&tag=From+%2418%2Fmo`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Verizon eSIM Plans", images: [`${siteConfig.url}/og?title=Verizon+eSIM&sub=From+%2418%2Fmo`], site: "@simkuu" },
};

export default function VerizonPage() {
  return (
    <CarrierPage
      name="Verizon"
      slug="verizon"
      color="#CD040B"
      tagline="America's most reliable network"
      description="Verizon has been the gold standard for network reliability since 1983. Ultra Wideband 5G delivers multi-gigabit speeds in dense cities and stadiums."
      coverage="98% USA"
      network="5G Ultra Wideband"
      heroStat={{ value: "#1", label: "Network Reliability" }}
      highlights={[
        { icon: "Shield", title: "Most Reliable", body: "Verizon is consistently ranked the most reliable network in the USA by RootMetrics and J.D. Power." },
        { icon: "Zap", title: "Ultra Wideband 5G", body: "Experience multi-gigabit speeds with Verizon's C-Band and mmWave 5G in hundreds of cities." },
        { icon: "Signal", title: "99.9% Uptime", body: "Verizon's network redundancy ensures you stay connected even during outages and extreme weather." },
      ]}
    />
  );
}
