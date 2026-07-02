import type { Metadata } from "next";
import { CarrierPage } from "@/components/shared/carrier-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "T-Mobile MVNO eSIM Plans — Same 5G, Half the Price",
  description: "T-Mobile MVNO eSIM — same 5G network at half the price. No contracts, instant activation.",
  alternates: { canonical: `${siteConfig.url}/t-mobile-mvno` },
  openGraph: {
    title: "T-Mobile MVNO eSIM Plans — Same 5G, Half the Price",
    description: "T-Mobile MVNO eSIM — same 5G network at half the price. No contracts, instant activation.",
    url: `${siteConfig.url}/t-mobile-mvno`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=T-Mobile+MVNO+eSIM&sub=Same+5G+Coverage+%C2%B7+50%25+Less&tag=From+%2410%2Fmo`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "T-Mobile MVNO eSIM Plans", images: [`${siteConfig.url}/og?title=T-Mobile+MVNO+eSIM&sub=From+%2410%2Fmo`], site: "@simkuu" },
};

export default function MVNOPage() {
  return (
    <CarrierPage
      name="T-Mobile MVNO"
      slug="mvno"
      color="#8B5CF6"
      tagline="T-Mobile speeds at half the price"
      description="Get full access to T-Mobile's 5G nationwide network through our MVNO partnership — at a fraction of retail cost. Same towers, same speeds, smarter price."
      coverage="99% USA"
      network="5G via T-Mobile"
      heroStat={{ value: "50%", label: "Less Than Retail" }}
      highlights={[
        { icon: "Zap", title: "Same T-Mobile Network", body: "Our MVNO runs on T-Mobile's full 5G nationwide infrastructure — exact same towers, same speeds, same coverage." },
        { icon: "Shield", title: "No Contracts Ever", body: "Month-to-month only. Cancel or change plans instantly from your dashboard with zero fees." },
        { icon: "Globe", title: "Best Value in USA", body: "Save up to 50% compared to T-Mobile retail pricing with no sacrifice in network quality." },
      ]}
    />
  );
}
