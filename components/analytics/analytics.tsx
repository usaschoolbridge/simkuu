"use client";

import Script from "next/script";

/**
 * Analytics scripts injected into the <head> via next/script.
 * Add this to your root layout inside <body>.
 *
 * Supports:
 *  - Plausible (privacy-first, recommended)
 *  - Google Analytics 4
 *
 * Only loads in production to avoid polluting analytics with dev traffic.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {/* ── Plausible ── */}
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}

      {/* ── Google Analytics 4 ── */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                cookie_flags: 'SameSite=None;Secure',
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

// ── Typed event tracking ──────────────────────────────────────────────────────

type TrackEvent =
  | { name: "plan_viewed"; props: { plan: string; carrier: string } }
  | { name: "checkout_started"; props: { plan: string; price: number } }
  | { name: "payment_completed"; props: { plan: string; method: string; price: number } }
  | { name: "esim_activated"; props: { carrier: string } }
  | { name: "referral_shared"; props: { method: "copy" | "share" | "email" | "sms" } }
  | { name: "coupon_applied"; props: { code: string; discount: number } };

/**
 * Fire a typed analytics event.
 * Works with both Plausible and GA4.
 *
 * @example
 * track({ name: "checkout_started", props: { plan: "tmobile-unlimited", price: 2500 } });
 */
export function track(event: TrackEvent) {
  if (typeof window === "undefined") return;

  const w = window as unknown as Record<string, ((...args: unknown[]) => void) | undefined>;

  // Plausible
  if (typeof w.plausible === "function") {
    w.plausible(event.name, { props: event.props });
  }

  // GA4
  if (typeof w.gtag === "function") {
    w.gtag("event", event.name, event.props);
  }
}
