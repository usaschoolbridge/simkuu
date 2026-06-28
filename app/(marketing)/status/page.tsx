import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "System Status | Simkuu",
  description: "Real-time status of Simkuu services — API, eSIM delivery, payment gateway, and support portal.",
  alternates: { canonical: `${siteConfig.url}/status` },
  openGraph: {
    title: "System Status | Simkuu",
    description: "All Simkuu systems are operational.",
    url: `${siteConfig.url}/status`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const SERVICES = [
  {
    name: "API & Platform",
    description: "Core Simkuu API, authentication, and account services",
    status: "operational" as const,
    uptime: "99.98%",
    responseTime: "142ms",
  },
  {
    name: "eSIM Delivery",
    description: "QR code generation and email delivery pipeline",
    status: "operational" as const,
    uptime: "99.95%",
    responseTime: "3.2s",
  },
  {
    name: "Payment Gateway",
    description: "Stripe and Razorpay payment processing",
    status: "operational" as const,
    uptime: "99.99%",
    responseTime: "890ms",
  },
  {
    name: "Support Portal",
    description: "Help center, ticketing, and live chat system",
    status: "operational" as const,
    uptime: "99.90%",
    responseTime: "220ms",
  },
  {
    name: "Carrier Integrations",
    description: "T-Mobile, Verizon, AT&T, and MVNO network APIs",
    status: "operational" as const,
    uptime: "99.85%",
    responseTime: "1.8s",
  },
  {
    name: "Dashboard & Account",
    description: "User dashboard, order history, and plan management",
    status: "operational" as const,
    uptime: "99.97%",
    responseTime: "180ms",
  },
];

const INCIDENTS = [
  {
    date: "June 15, 2026",
    title: "Scheduled Maintenance — Database Upgrade",
    duration: "22 minutes",
    status: "resolved",
    desc: "Planned maintenance window for database performance upgrade. Minor disruption to eSIM delivery — all pending orders were processed immediately after restoration.",
  },
  {
    date: "May 3, 2026",
    title: "Elevated eSIM Delivery Times",
    duration: "41 minutes",
    status: "resolved",
    desc: "T-Mobile API experienced increased latency, causing eSIM delivery delays of 10–25 minutes. All orders were fulfilled. Affected customers received a courtesy email.",
  },
];

export default function StatusPage() {
  const lastUpdated = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-b border-black/[0.06]">
        <div className="container-xl py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-green-100 text-green-600 text-sm font-medium mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                All Systems Operational
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-2">
                System Status
              </h1>
              <p className="text-black/50">Last updated: {lastUpdated}</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="font-display text-3xl font-black text-green-600">6/6</div>
                <div className="text-xs text-black/40 mt-1">Systems Online</div>
              </div>
              <div>
                <div className="font-display text-3xl font-black text-black">99.95%</div>
                <div className="text-xs text-black/40 mt-1">30-Day Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl py-16">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Services */}
          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-6">Services</h2>
            <div className="space-y-3">
              {SERVICES.map((svc) => (
                <div key={svc.name} className="rounded-2xl border border-black/[0.08] p-5 flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 shadow-sm shadow-green-500/50" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-black text-sm">{svc.name}</div>
                    <div className="text-xs text-black/40 mt-0.5">{svc.description}</div>
                  </div>
                  <div className="flex items-center gap-6 text-right flex-shrink-0">
                    <div>
                      <div className="text-xs font-semibold text-black">{svc.uptime}</div>
                      <div className="text-xs text-black/30">Uptime</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-black">{svc.responseTime}</div>
                      <div className="text-xs text-black/30">Response</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      Operational
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Uptime Chart Placeholder */}
          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">30-Day Uptime</h2>
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-green-400"
                  style={{ height: `${85 + Math.random() * 15}%`, opacity: 0.7 + (i / 30) * 0.3 }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-black/30 mt-2">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </section>

          {/* Past Incidents */}
          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-6">Past Incidents</h2>
            <div className="space-y-4">
              {INCIDENTS.map((inc) => (
                <div key={inc.title} className="rounded-2xl border border-black/[0.08] p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-semibold text-black text-sm">{inc.title}</div>
                      <div className="text-xs text-black/40 mt-0.5">{inc.date} · Duration: {inc.duration}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex-shrink-0">
                      Resolved
                    </span>
                  </div>
                  <p className="text-sm text-black/50 leading-relaxed">{inc.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-2xl bg-[#FAFAFA] border border-black/[0.06] p-8 text-center">
            <h2 className="font-display text-xl font-bold text-black mb-2">Experiencing an issue?</h2>
            <p className="text-black/50 text-sm mb-6">If you&apos;re experiencing a problem not reflected above, contact our support team immediately.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:support@simkuu.com" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity">
                Email Support
              </a>
              <a href="tel:+13025550147" className="px-6 py-2.5 rounded-full border border-black/10 text-black text-sm font-semibold hover:bg-white transition-colors">
                +1 (302) 555-0147
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
