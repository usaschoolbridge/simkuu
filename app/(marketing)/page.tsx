import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { CarrierCards } from "@/components/sections/carrier-cards";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PricingSection } from "@/components/sections/pricing";
// Below-the-fold heavy components loaded lazily
import { LazyCoverageMap, LazyTestimonials, LazyFAQ } from "@/components/lazy";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";

const HOME_FAQS = [
  { question: "What is an eSIM and how does it work?", answer: "An eSIM (embedded SIM) is a digital SIM card built into your phone. Instead of inserting a physical SIM card, you scan a QR code in your phone's settings to activate service. It works exactly like a regular SIM — calls, texts, and data all included." },
  { question: "Which phones support eSIM?", answer: "Most modern smartphones support eSIM, including iPhone XS and later, Google Pixel 3 and later, Samsung Galaxy S20 and later, and many other Android devices. Check your phone's settings under Cellular or Mobile Data to confirm." },
  { question: "How quickly will I receive my eSIM after purchase?", answer: "Instantly. Your eSIM QR code is delivered to your email address within seconds of completing your purchase. You can activate it immediately — no waiting, no shipping." },
  { question: "Are there any contracts or cancellation fees?", answer: "None at all. Every Simkuu plan is month-to-month with zero contracts. You can cancel, pause, or switch plans at any time — no cancellation fees, no commitments." },
  { question: "What payment methods do you accept?", answer: "We accept Stripe (all major credit/debit cards), PayPal, Apple Pay, Google Pay, and cryptocurrency including Bitcoin, Ethereum, USDT (ERC20 & TRC20), and USDC." },
  { question: "How do I activate my eSIM?", answer: "Open your phone's Settings → Cellular/Mobile Data → Add Plan → Scan QR Code. Point your camera at the QR code we emailed you. Your eSIM activates within 2 minutes. Our support team is available 24/7 if you need help." },
];

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og?title=USA+eSIM+Provider&sub=T-Mobile+%C2%B7+Verizon+%C2%B7+AT%26T+%C2%B7+MVNO&tag=250K%2B+eSIMs+Activated`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Premium USA eSIM Plans`,
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og?title=USA+eSIM+Provider&sub=T-Mobile+%C2%B7+Verizon+%C2%B7+AT%26T+%C2%B7+MVNO&tag=250K%2B+eSIMs+Activated`],
    site: "@simkuu",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(HOME_FAQS)} />
      <HeroSection />
      <WhyChooseUs />
      <CarrierCards />
      <PricingSection />
      <HowItWorks />
      <LazyCoverageMap />
      <LazyTestimonials />
      <LazyFAQ />
    </>
  );
}
