import type { Metadata } from "next";
import { PlansHero } from "@/components/sections/plans/plans-hero";
import { PlansGrid } from "@/components/sections/plans/plans-grid";
import { PlansFAQ } from "@/components/sections/plans/plans-faq";
import { JsonLd, faqSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "eSIM Plans — T-Mobile, Verizon, AT&T & MVNO",
  description: `Browse all USA eSIM plans from T-Mobile, Verizon, AT&T, and MVNO. ${siteConfig.description}`,
  alternates: { canonical: `${siteConfig.url}/plans` },
  openGraph: {
    title: "USA eSIM Plans — T-Mobile, Verizon, AT&T & MVNO",
    description: `Browse all USA eSIM plans from T-Mobile, Verizon, AT&T, and MVNO. No contracts, instant activation.`,
    url: `${siteConfig.url}/plans`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=USA+eSIM+Plans&sub=T-Mobile+%C2%B7+Verizon+%C2%B7+AT%26T+%C2%B7+MVNO&tag=From+%2410%2Fmo`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "USA eSIM Plans — T-Mobile, Verizon, AT&T & MVNO",
    description: "Browse all USA eSIM plans. No contracts, instant activation.",
    images: [`${siteConfig.url}/og?title=USA+eSIM+Plans&sub=T-Mobile+%C2%B7+Verizon+%C2%B7+AT%26T+%C2%B7+MVNO&tag=From+%2410%2Fmo`],
    site: "@simkuu",
  },
};

const PLANS_FAQS = [
  { question: "What eSIM plans does Simkuu offer?", answer: "We offer USA eSIM plans on four networks: T-Mobile (nationwide 5G), Verizon (Ultra Wideband 5G), AT&T (FirstNet 5G), and T-Mobile MVNO (budget-friendly T-Mobile backbone). All plans include unlimited calls, texts, and data." },
  { question: "How do I choose between T-Mobile, Verizon, and AT&T?", answer: "T-Mobile has the widest 5G coverage. Verizon has the strongest signal in urban areas. AT&T excels in first responder coverage and rural areas. T-Mobile MVNO offers the same T-Mobile coverage at a lower price point." },
  { question: "Can I switch plans after purchase?", answer: "Yes. You can upgrade, downgrade, or switch carriers at any time from your dashboard. Plan changes take effect at the start of your next billing cycle." },
  { question: "Do plans include mobile hotspot?", answer: "Yes, all Simkuu plans include unlimited mobile hotspot. You can share your connection with up to 10 devices simultaneously." },
];

export default function PlansPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "Plans", href: "/plans" }])} />
      <JsonLd data={faqSchema(PLANS_FAQS)} />
      <PlansHero />
      <PlansGrid />
      <PlansFAQ />
    </>
  );
}
