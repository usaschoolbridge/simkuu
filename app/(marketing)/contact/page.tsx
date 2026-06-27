import type { Metadata } from "next";
import { ContactForm } from "@/components/shared/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { Mail, MessageSquare, Clock } from "lucide-react";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact Simkuu — 24/7 Support",
  description: "Get in touch with Simkuu support. Available 24/7 via email, chat, and phone.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact Simkuu — 24/7 Support",
    description: "Get in touch with Simkuu support. Available 24/7 via email, chat, and phone.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=Contact+Us&sub=24%2F7+Support+via+Chat+%C2%B7+Email+%C2%B7+Phone&tag=Avg+2+min+response`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Contact Simkuu", images: [`${siteConfig.url}/og?title=Contact+Us&sub=24%2F7+Support`], site: "@simkuu" },
};

const CHANNELS = [
  { icon: MessageSquare, title: "Live Chat", body: "Chat with our team in real time. Average response under 2 minutes.", cta: "Start Chat", href: "#" },
  { icon: Mail, title: "Email Support", body: "Send us a detailed message and we'll reply within 4 hours.", cta: "Send Email", href: "mailto:support@simkuu.com" },
  { icon: Clock, title: "24/7 Available", body: "Our support team operates around the clock, 365 days a year.", cta: null, href: null },
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
                    <h3 className="font-display font-bold text-black mb-2">{c.title}</h3>
                    <p className="text-sm text-black/50 leading-relaxed mb-4 flex-1">{c.body}</p>
                    {c.cta && c.href && (
                      <a href={c.href} className="text-sm font-semibold text-blue-600 hover:underline">{c.cta} →</a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Contact form */}
          <div className="max-w-2xl mx-auto">
            <Reveal variant="fadeUp">
              <div className="card-premium p-8">
                <h2 className="font-display text-2xl font-black text-black mb-6">Send us a message</h2>
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
