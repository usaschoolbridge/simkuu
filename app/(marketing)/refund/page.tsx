import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

import { siteConfig } from "@/config/site";
export const metadata: Metadata = { title: "Refund Policy", description: "Simkuu Refund Policy — clear, fair, and no-questions-asked within 24 hours.", alternates: { canonical: `${siteConfig.url}/refund` }, robots: { index: true, follow: true } };

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      lastUpdated="June 1, 2026"
      intro="We stand behind our product. Our refund policy is designed to be fair, transparent, and easy to understand. No jargon, no runarounds."
      sections={[
        { title: "24-Hour Full Refund", content: "If you purchase an eSIM plan and have not yet activated it, you are eligible for a full refund within 24 hours of purchase. No questions asked. Contact support@simkuu.com with your order ID." },
        { title: "Activated eSIM Plans", content: "Once an eSIM QR code has been scanned and activated on a device, the plan is considered used and is non-refundable. This is because the activation process immediately consumes carrier resources." },
        { title: "Technical Failures", content: "If a technical error on our side prevents your eSIM from activating (e.g., invalid QR code, delivery failure, platform error), you are entitled to a full refund or a free replacement — your choice." },
        { title: "Carrier Network Issues", content: "Refunds are not issued for temporary carrier network outages or coverage gaps, as these are outside our control. However, we will work with you to switch to a different carrier at no additional cost." },
        { title: "Partial Refunds", content: "Partial refunds may be issued at our discretion for extenuating circumstances, such as significant service degradation over an extended period. These are evaluated case by case." },
        { title: "Refund Processing Time", content: "Approved refunds are processed within 24 hours of approval. The time for funds to appear in your account depends on your payment provider: Stripe (3-5 business days), PayPal (1-2 business days), Crypto (varies by network)." },
        { title: "How to Request a Refund", content: "Email support@simkuu.com with subject 'Refund Request — [Order ID]'. Include your order ID, the reason for the refund, and whether the eSIM was activated. Our team responds within 4 hours." },
      ]}
    />
  );
}
