import type { Metadata } from "next";
import { FAQ } from "@/components/sections/faq";
import { JsonLd, faqSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { Reveal } from "@/components/motion/reveal";
import { HelpCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

const ALL_FAQS = [
  { question: "What is an eSIM and how does it work?", answer: "An eSIM (embedded SIM) is a digital SIM card built into your phone. Instead of inserting a physical SIM card, you scan a QR code in your phone's settings to activate service." },
  { question: "Which phones support eSIM?", answer: "Most modern smartphones support eSIM, including iPhone XS and later, Google Pixel 3 and later, Samsung Galaxy S20 and later, and many other Android devices." },
  { question: "How quickly will I receive my eSIM after purchase?", answer: "Instantly. Your eSIM QR code is delivered to your email address within seconds of completing your purchase." },
  { question: "Can I keep my existing phone number?", answer: "Yes. You can port your existing number from your current carrier to your new Simkuu plan at no charge. The transfer process typically takes 24-48 hours." },
  { question: "Are there any contracts or cancellation fees?", answer: "None at all. Every Simkuu plan is month-to-month with zero contracts. You can cancel, pause, or switch plans at any time." },
  { question: "What happens when my plan expires?", answer: "You'll receive email reminders before your plan expires. If you don't renew, service pauses automatically — your data and number are preserved for 30 days." },
  { question: "Can I use my eSIM internationally?", answer: "Our eSIMs are optimized for USA usage. Some plans include international roaming — check the plan details for specific countries and rates." },
  { question: "How do I activate my eSIM?", answer: "Open your phone's Settings → Cellular/Mobile Data → Add Plan → Scan QR Code. Point your camera at the QR code we emailed you. Your eSIM activates within 2 minutes." },
  { question: "What payment methods do you accept?", answer: "We accept Stripe (all major credit/debit cards), PayPal, Apple Pay, Google Pay, and cryptocurrency including Bitcoin, Ethereum, USDT (ERC20 & TRC20), and USDC." },
  { question: "Can I have multiple eSIMs on one phone?", answer: "Most modern phones support multiple eSIM profiles (2-8 depending on the model). You can install multiple Simkuu plans and switch between them instantly." },
];

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description: "Answers to the most common questions about Simkuu plans, activation, payments, and support.",
  alternates: { canonical: `${siteConfig.url}/faq` },
  openGraph: {
    title: "FAQ — Simkuu Frequently Asked Questions",
    description: "Answers to the most common questions about Simkuu plans, activation, payments, and support.",
    url: `${siteConfig.url}/faq`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=FAQ&sub=Everything+about+eSIM+plans+%26+activation&tag=Quick+Answers`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "FAQ — Simkuu", images: [`${siteConfig.url}/og?title=FAQ&sub=Everything+about+eSIM&tag=Quick+Answers`], site: "@simkuu" },
};

export default function FAQPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "FAQ", href: "/faq" }])} />
      <JsonLd data={faqSchema(ALL_FAQS)} />
      <section className="pt-32 pb-4">
        <div className="container-xl text-center">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium mb-6">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
              Frequently asked <span className="text-gradient">questions</span>
            </h1>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-xl text-black/50 max-w-xl mx-auto">
              Everything you need to know about Simkuu. Still have questions?{" "}
              <a href="/contact" className="text-blue-500 hover:underline">Talk to us.</a>
            </p>
          </Reveal>
        </div>
      </section>
      <FAQ />
    </>
  );
}
