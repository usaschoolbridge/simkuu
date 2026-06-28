"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Phone, ChevronDown, ExternalLink } from "lucide-react";

const FAQS = [
  {
    q: "What is an eSIM?",
    a: "An eSIM (embedded SIM) is a digital SIM card built into your device. Instead of a physical plastic SIM, you download your carrier plan wirelessly via a QR code. It works exactly like a regular SIM but activates in minutes from anywhere.",
  },
  {
    q: "How do I install my eSIM?",
    a: "After purchasing, you'll receive an email with a QR code. On iPhone: Settings → Cellular → Add eSIM → Use QR Code. On Android: Settings → Network → SIM → Add eSIM. Scan the QR code and follow the on-screen instructions. It takes under 2 minutes.",
  },
  {
    q: "Is my device compatible with eSIM?",
    a: "Most flagship smartphones released after 2018 support eSIM, including iPhone XS and later, Samsung Galaxy S20+, Google Pixel 3+, and many others. Check our Shipping Policy page for a full device compatibility list. Your device must also be eSIM-unlocked (not carrier-locked).",
  },
  {
    q: "Can I use two SIMs at the same time?",
    a: "Yes! Most modern smartphones support Dual SIM via one physical SIM + one eSIM. This allows you to keep your existing number for calls and texts while using your Simkuu eSIM for data. This is ideal for travelers and international users.",
  },
  {
    q: "How long does activation take?",
    a: "Your eSIM QR code is typically delivered within 2–5 minutes of purchase. Once you scan the QR code on your device, the plan activates within 60–120 seconds. Total time from purchase to connected: under 5 minutes in most cases.",
  },
  {
    q: "Can I get a refund if I change my mind?",
    a: "Yes — if you have not yet activated the eSIM, you can request a full refund within 24 hours of purchase. Once the eSIM is activated, it is non-refundable. For technical issues caused by our platform, we offer a full refund or free replacement. See our Refund Policy for full details.",
  },
  {
    q: "What networks do you offer?",
    a: "We offer eSIM plans on T-Mobile (nationwide 5G, 99% coverage), Verizon (Ultra Wideband 5G, 98% coverage), AT&T (5G/FirstNet, 97% coverage), and T-Mobile MVNO networks. Each network has different plan options and pricing.",
  },
  {
    q: "What happens to my eSIM if I cancel?",
    a: "If you cancel a subscription plan, your service continues until the end of the current billing period. After that, the eSIM data service is deactivated. The eSIM profile stays on your device — you can reactivate by purchasing a new plan anytime.",
  },
  {
    q: "Do your plans include hotspot/tethering?",
    a: "Yes. All Simkuu unlimited data plans include mobile hotspot/tethering at no extra cost. You can share your connection with laptops, tablets, and other devices. Hotspot speeds may vary by carrier and plan tier.",
  },
  {
    q: "What should I do if my eSIM isn't working?",
    a: "First, restart your device. Check that eSIM is enabled in Settings → Cellular. Ensure airplane mode is off. If still not working, contact us at support@simkuu.com with your Order ID. Our team responds within 2 hours and can remotely diagnose most issues.",
  },
];

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-black/[0.06]">
        <div className="container-xl py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            Help Center
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-xl text-black/50 max-w-2xl mx-auto">
            Find answers to common questions or reach our support team — real humans, fast responses.
          </p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="container-xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-16">
          {[
            { icon: Mail, title: "Email Support", body: "support@simkuu.com", sub: "Response within 24 hours", href: "mailto:support@simkuu.com", cta: "Send Email" },
            { icon: Phone, title: "Phone / WhatsApp", body: "+1 (302) 555-0147", sub: "Mon–Fri, 9 AM – 6 PM EST", href: "tel:+13025550147", cta: "Call Now" },
            { icon: MessageSquare, title: "Knowledge Base", body: "Browse articles", sub: "Guides, tutorials, and tips", href: "/kb", cta: "Browse KB" },
          ].map(({ icon: Icon, title, body, sub, href, cta }) => (
            <div key={title} className="rounded-2xl border border-black/[0.08] p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-black mb-1">{title}</h3>
              <p className="text-sm text-black/70 font-medium mb-1">{body}</p>
              <p className="text-xs text-black/40 mb-4">{sub}</p>
              <a href={href} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                {cta} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl font-bold text-black mb-3">Frequently Asked Questions</h2>
          <p className="text-black/50 mb-8">Quick answers to the most common eSIM questions.</p>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-black/[0.08] overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAFA] transition-colors"
                >
                  <span className="font-semibold text-black text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-black/40 flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                {open === i && (
                  <div className="px-5 pb-5 text-sm text-black/60 leading-relaxed border-t border-black/[0.06] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-black/40 text-sm mb-3">Still have questions?</p>
            <Link href="/faq" className="text-blue-600 font-semibold hover:underline text-sm">
              View all FAQs →
            </Link>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-black mb-3">Can&apos;t find what you need?</h2>
          <p className="text-black/50 mb-6">Our support team is standing by to help you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity">
              Contact Support
            </Link>
            <Link href="/status" className="px-8 py-3 rounded-full border border-black/10 text-black text-sm font-semibold hover:bg-white transition-colors">
              System Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
