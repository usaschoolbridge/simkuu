import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

import { siteConfig } from "@/config/site";
export const metadata: Metadata = { title: "Privacy Policy", description: "Simkuu Privacy Policy — how we collect, use, and protect your personal data.", alternates: { canonical: `${siteConfig.url}/privacy` }, robots: { index: true, follow: true } };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="June 1, 2026"
      intro="At Simkuu, we take your privacy seriously. This policy explains what data we collect, why we collect it, how we use it, and your rights regarding that data."
      sections={[
        { title: "Information We Collect", content: "We collect information you provide directly (name, email, payment details) and information collected automatically (device info, usage analytics, IP address). We never sell your personal data to third parties." },
        { title: "How We Use Your Information", content: "Your data is used to process orders, deliver eSIM QR codes, provide customer support, send transactional emails, improve our platform, and comply with legal obligations. We do not use your data for advertising targeting." },
        { title: "Data Storage & Security", content: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Payment information is handled exclusively by PCI-compliant processors (Stripe, PayPal). We never store full card numbers." },
        { title: "Cookies & Tracking", content: "We use essential cookies for authentication and session management. We use analytics cookies (with your consent) to understand how users interact with our platform. You can opt out of analytics cookies at any time." },
        { title: "Third-Party Services", content: "We share data with trusted service providers including Stripe (payments, USA/global), Razorpay (payments, India), Resend (transactional email), Upstash (rate limiting), and Cloudflare (CDN/security). We share only the minimum data required for each provider to perform their service. All processors are GDPR-compliant and operate under Data Processing Agreements. Carrier networks (T-Mobile, Verizon, AT&T) receive your eSIM activation request data to provision your service." },
        { title: "Your Rights", content: "You have the right to access, correct, export, or delete your personal data at any time. To exercise these rights, contact us at privacy@simkuu.com. We respond within 72 hours." },
        { title: "Data Retention", content: "We retain account data for as long as your account is active plus 90 days after deletion. Transaction records are retained for 7 years for legal compliance. You may request earlier deletion where legally permitted." },
        { title: "Changes to This Policy", content: "We may update this policy from time to time. We will notify you of significant changes via email and by updating the 'last updated' date above. Continued use of our service constitutes acceptance." },
      ]}
    />
  );
}
