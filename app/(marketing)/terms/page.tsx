import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";

import { siteConfig } from "@/config/site";
export const metadata: Metadata = { title: "Terms of Service", description: "Simkuu Terms of Service — your agreement with Simkuu.", alternates: { canonical: `${siteConfig.url}/terms` }, robots: { index: true, follow: true } };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="June 1, 2026"
      intro="By using Simkuu services, you agree to these terms. Please read them carefully. If you do not agree, do not use our platform."
      sections={[
        { title: "Acceptance of Terms", content: "By creating an account or purchasing an eSIM plan, you agree to be bound by these Terms of Service and our Privacy Policy. These terms apply to all users of the Simkuu platform." },
        { title: "Service Description", content: "Simkuu is a marketplace for USA eSIM plans from T-Mobile, Verizon, AT&T, and MVNO operators. We provide eSIM QR codes and activation codes upon purchase. Service availability depends on carrier network coverage." },
        { title: "Account Responsibilities", content: "You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating your account. One account per person. You must be 18 or older to use this service." },
        { title: "Payments & Billing", content: "All prices are in USD. Payment is due at time of purchase. We use Stripe and PayPal for secure payment processing. Cryptocurrency payments are processed at the exchange rate at time of transaction." },
        { title: "Refund Policy", content: "We offer a full refund within 24 hours of purchase if the eSIM has not been activated. Once an eSIM is activated, it is non-refundable. Technical issues caused by our platform are fully refundable. See our Refund Policy for complete details." },
        { title: "Prohibited Uses", content: "You may not use our service for illegal activities, SPAM, network abuse, resale without authorization, or any purpose that violates carrier terms. Violations result in immediate account termination without refund." },
        { title: "Service Modifications", content: "We reserve the right to modify, suspend, or discontinue any part of our service with reasonable notice. Plan prices may change; existing plans are honored until their expiration date." },
        { title: "Limitation of Liability", content: "Simkuu is not liable for carrier network outages, coverage gaps, or service interruptions beyond our control. Our maximum liability is limited to the amount paid for the affected eSIM plan. To the fullest extent permitted by applicable law, Simkuu disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose." },
        { title: "Intellectual Property", content: "All content on simkuu.com — including text, graphics, logos, icons, software, and eSIM branding — is the exclusive property of Simkuu Inc. and is protected by US and international copyright law. You may not reproduce, distribute, or create derivative works without our express written consent." },
        { title: "Governing Law", content: "These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the state and federal courts located in New Castle County, Delaware." },
        { title: "Changes to Terms", content: "We reserve the right to update these Terms of Service at any time. We will notify users of material changes via email and by updating the date at the top of this page. Continued use of Simkuu after changes take effect constitutes acceptance of the updated terms. Contact support@simkuu.com for any questions." },
      ]}
    />
  );
}
