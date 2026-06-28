import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Cancellation Policy | Simkuu",
  description: "Learn how to cancel your Simkuu eSIM subscription, what happens after cancellation, and how refunds are handled.",
  alternates: { canonical: `${siteConfig.url}/cancellation` },
  openGraph: {
    title: "Cancellation Policy | Simkuu",
    description: "Learn how to cancel your Simkuu eSIM subscription.",
    url: `${siteConfig.url}/cancellation`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-black/[0.06]">
        <div className="container-xl py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              Cancellation Policy
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
              Cancel Anytime, No Strings Attached
            </h1>
            <p className="text-black/50 text-lg leading-relaxed">
              We believe in keeping you in control. Cancel your eSIM plan at any time — no cancellation fees, no penalties, no nonsense.
            </p>
            <p className="text-black/40 text-sm mt-4">Effective Date: January 1, 2025 · Last Updated: June 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-xl py-16">
        <div className="max-w-3xl mx-auto space-y-12">

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">1. How to Cancel Your Subscription</h2>
            <p className="text-black/60 leading-relaxed mb-4">
              You may cancel your Simkuu eSIM plan or subscription at any time through any of the following methods:
            </p>
            <ul className="space-y-3">
              {[
                "Log in to your Simkuu account, navigate to Account → Subscriptions, and click \"Cancel Plan.\"",
                "Email us at support@simkuu.com with your order ID and the subject line \"Cancellation Request.\"",
                "Contact our support team via live chat at simkuu.com and request a cancellation.",
                "Call or WhatsApp us at +1 (302) 555-0147 during business hours (Monday–Friday, 9 AM – 6 PM EST).",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-black/60">
                  <span className="mt-1 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">2. When Cancellation Takes Effect</h2>
            <p className="text-black/60 leading-relaxed mb-4">
              Cancellation requests submitted before your next billing cycle renews will take effect immediately upon confirmation. Specifically:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <ul className="space-y-2 text-black/70 text-sm leading-relaxed">
                <li>• <strong>Monthly plans:</strong> Cancellation is effective at the end of the current paid period. You retain full access until your billing cycle ends.</li>
                <li>• <strong>Day/Weekly plans:</strong> Cancellation is effective immediately. No future charges will occur.</li>
                <li>• <strong>Annual plans:</strong> Cancellation stops future annual renewals. Access continues until the end of the current paid year.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">3. What Happens to Your eSIM After Cancellation</h2>
            <p className="text-black/60 leading-relaxed mb-4">
              After your plan period ends following cancellation:
            </p>
            <ul className="space-y-3 text-black/60">
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-0.5">✗</span>
                Your eSIM data service will be deactivated. You will no longer be able to use data, calls, or SMS through the eSIM.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-500 font-bold mt-0.5">→</span>
                The eSIM profile will remain on your device but will show as inactive. You do not need to remove it.
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                You can reactivate by purchasing a new plan at any time — your eSIM profile stays on the device and can be reused.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">4. No Cancellation Fees</h2>
            <p className="text-black/60 leading-relaxed">
              Simkuu does not charge any cancellation fees, early termination fees, or penalties of any kind. There are no minimum contract periods. You are free to cancel at any time for any reason without incurring additional charges.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">5. Refunds Upon Cancellation</h2>
            <p className="text-black/60 leading-relaxed mb-4">
              Refund eligibility upon cancellation is governed by our <a href="/refund" className="text-blue-600 hover:underline font-medium">Refund Policy</a>. In summary:
            </p>
            <div className="grid gap-4">
              {[
                { label: "Not Yet Activated", desc: "If you cancel within 24 hours of purchase and have NOT activated the eSIM, you are eligible for a full refund.", color: "green" },
                { label: "Already Activated", desc: "If the eSIM has been activated and you have used data/calls/SMS, the plan is non-refundable for the current billing period.", color: "red" },
                { label: "Technical Failure", desc: "If a platform or carrier error caused service disruption, you may be eligible for a prorated refund. Contact support.", color: "blue" },
              ].map(({ label, desc, color }) => (
                <div key={label} className={`rounded-2xl border p-5 ${color === "green" ? "bg-green-50 border-green-200" : color === "red" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
                  <div className={`font-semibold text-sm mb-1 ${color === "green" ? "text-green-700" : color === "red" ? "text-red-700" : "text-blue-700"}`}>{label}</div>
                  <p className="text-black/60 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">6. Auto-Renewal</h2>
            <p className="text-black/60 leading-relaxed">
              Subscription plans are set to auto-renew by default to ensure uninterrupted service. You will receive an email reminder 3 days before each renewal. Auto-renewal can be disabled at any time from your account settings without cancelling your current service period.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">7. Contact Us</h2>
            <p className="text-black/60 leading-relaxed mb-4">
              For cancellation assistance, please reach out to our support team:
            </p>
            <div className="bg-[#FAFAFA] rounded-2xl border border-black/[0.06] p-6 space-y-3 text-sm text-black/60">
              <div><strong className="text-black">Email:</strong> support@simkuu.com</div>
              <div><strong className="text-black">Phone / WhatsApp:</strong> +1 (302) 555-0147</div>
              <div><strong className="text-black">Hours:</strong> Monday–Friday, 9 AM – 6 PM EST</div>
              <div><strong className="text-black">Address:</strong> Simkuu Inc., 2093 Philadelphia Pike, Suite 1234, Claymont, DE 19703, United States</div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
