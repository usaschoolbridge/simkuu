import type { Metadata } from "next";
import { ContactForm } from "@/components/shared/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { Mail, MessageSquare, Clock, Phone, MapPin } from "lucide-react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Simkuu — Support & Business Enquiries",
  description: "Get in touch with Simkuu support. Email, phone, WhatsApp, or fill in our contact form. Response within 24 hours.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact Simkuu — Support & Business Enquiries",
    description: "Get in touch with Simkuu support. Email, phone, WhatsApp, or fill in our contact form.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=Contact+Us&sub=Email+%C2%B7+Phone+%C2%B7+WhatsApp&tag=24hr+Response`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Contact Simkuu", images: [`${siteConfig.url}/og?title=Contact+Us&sub=Support+%26+Business+Enquiries`], site: "@simkuu" },
};

const CHANNELS = [
  { icon: Mail, title: "Email Support", body: "support@simkuu.com", sub: "Response within 24 hours", cta: "Send Email", href: "mailto:support@simkuu.com" },
  { icon: Phone, title: "Phone / WhatsApp", body: "+1 (302) 555-0147", sub: "Mon–Fri, 9 AM – 6 PM EST", cta: "Call Now", href: "tel:+13025550147" },
  { icon: Clock, title: "Support Hours", body: "Mon–Fri, 9 AM – 6 PM EST", sub: "Avg response under 2 hours", cta: null, href: null },
];

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-16">
        <div className="container-xl text-center">
          <Reveal variant="fadeUp">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              <Mail className="w-3.5 h-3.5" /> Get In Touch
            </div>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.1}>
            <h1 className="font-display text-5xl md:text-6xl font-black text-black tracking-tight mb-4">
              We&apos;re here to <span className="text-gradient">help</span>
            </h1>
          </Reveal>
          <Reveal variant="fadeUp" delay={0.2}>
            <p className="text-xl text-black/50 max-w-xl mx-auto">Real humans. Real answers. No chatbots.</p>
          </Reveal>
        </div>
      </section>

      {/* Channels */}
      <section className="pb-16">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto mb-16">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.title} variant="fadeUp">
                  <div className="card-premium p-6 text-center h-full flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-display font-bold text-black mb-1">{c.title}</h3>
                    <p className="text-sm text-black font-medium mb-1">{c.body}</p>
                    <p className="text-xs text-black/40 mb-4 flex-1">{c.sub}</p>
                    {c.cta && c.href && (
                      <a href={c.href} className="text-sm font-semibold text-blue-600 hover:underline">{c.cta} →</a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Contact form */}
            <div className="lg:col-span-3">
              <Reveal variant="fadeUp">
                <div className="card-premium p-8">
                  <h2 className="font-display text-2xl font-black text-black mb-6">Send us a message</h2>
                  <ContactForm />
                </div>
              </Reveal>
            </div>

            {/* Business details */}
            <div className="lg:col-span-2 space-y-5">
              <Reveal variant="fadeUp" delay={0.1}>
                <div className="card-premium p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="font-display font-bold text-black text-sm">Business Address</h3>
                  </div>
                  <address className="not-italic text-sm text-black/60 leading-relaxed">
                    Simkuu Inc.<br />
                    2093 Philadelphia Pike<br />
                    Suite 1234<br />
                    Claymont, DE 19703<br />
                    United States
                  </address>
                </div>
              </Reveal>

              <Reveal variant="fadeUp" delay={0.15}>
                <div className="card-premium p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h3 className="font-display font-bold text-black text-sm">Social Media</h3>
                  </div>
                  <div className="space-y-2 text-sm text-black/60">
                    <a href="https://twitter.com/simkuu" target="_blank" rel="noopener noreferrer" className="block hover:text-black transition-colors">Twitter / X: @simkuu</a>
                    <a href="https://instagram.com/simkuu" target="_blank" rel="noopener noreferrer" className="block hover:text-black transition-colors">Instagram: @simkuu</a>
                    <a href="https://linkedin.com/company/simkuu" target="_blank" rel="noopener noreferrer" className="block hover:text-black transition-colors">LinkedIn: Simkuu</a>
                  </div>
                </div>
              </Reveal>

              <Reveal variant="fadeUp" delay={0.2}>
                <div className="card-premium p-6">
                  <h3 className="font-display font-bold text-black text-sm mb-3">Quick Links</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "FAQ", href: "/faq" },
                      { label: "Knowledge Base", href: "/kb" },
                      { label: "System Status", href: "/status" },
                      { label: "Refund Policy", href: "/refund" },
                    ].map(({ label, href }) => (
                      <a key={label} href={href} className="block text-black/60 hover:text-black transition-colors">{label} →</a>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
