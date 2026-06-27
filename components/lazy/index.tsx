"use client";

/**
 * Lazy-loaded wrappers for heavy client components.
 * Import from here instead of the direct path to get automatic
 * code splitting — each chunk is only loaded when the component
 * enters the viewport.
 */

import dynamic from "next/dynamic";
import { SectionSkeleton, CardGridSkeleton, BlogCardsSkeleton } from "@/components/ui/skeleton";

// ── Marketing page sections ───────────────────────────────────────────────────

export const LazyCoverageMap = dynamic(
  () => import("@/components/sections/coverage-map").then((m) => ({ default: m.CoverageMap })),
  {
    loading: () => <SectionSkeleton rows={2} />,
    ssr: false, // canvas/map — client only
  }
);

export const LazyTestimonials = dynamic(
  () => import("@/components/sections/testimonials").then((m) => ({ default: m.Testimonials })),
  {
    loading: () => <SectionSkeleton rows={3} />,
    ssr: true,
  }
);

export const LazyFAQ = dynamic(
  () => import("@/components/sections/faq").then((m) => ({ default: m.FAQ })),
  {
    loading: () => <SectionSkeleton rows={5} />,
    ssr: true,
  }
);

export const LazyBlogContent = dynamic(
  () => import("@/components/sections/blog/blog-content").then((m) => ({ default: m.BlogContent })),
  {
    loading: () => (
      <div className="pt-32 pb-24">
        <div className="container-xl">
          <BlogCardsSkeleton count={6} />
        </div>
      </div>
    ),
    ssr: true,
  }
);

export const LazyPlansGrid = dynamic(
  () => import("@/components/sections/plans/plans-grid").then((m) => ({ default: m.PlansGrid })),
  {
    loading: () => (
      <div className="container-xl py-12">
        <CardGridSkeleton count={6} cols={3} />
      </div>
    ),
    ssr: true,
  }
);

// ── Checkout ──────────────────────────────────────────────────────────────────

export const LazyCryptoPayment = dynamic(
  () => import("@/components/checkout/crypto-payment").then((m) => ({ default: m.CryptoPayment })),
  {
    loading: () => (
      <div className="animate-pulse rounded-2xl border border-black/8 p-6 h-64 bg-black/3" />
    ),
    ssr: false, // countdown timers and QR generation — client only
  }
);

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const LazyWalletContent = dynamic(
  () => import("@/components/dashboard/wallet-content").then((m) => ({ default: m.WalletContent })),
  { loading: () => <SectionSkeleton rows={4} />, ssr: true }
);

export const LazyReferralsContent = dynamic(
  () => import("@/components/dashboard/referrals-content").then((m) => ({ default: m.ReferralsContent })),
  { loading: () => <SectionSkeleton rows={4} />, ssr: true }
);

export const LazyProfileContent = dynamic(
  () => import("@/components/dashboard/profile-content").then((m) => ({ default: m.ProfileContent })),
  { loading: () => <SectionSkeleton rows={5} />, ssr: true }
);

// ── Admin ─────────────────────────────────────────────────────────────────────

export const LazyAdminAnalytics = dynamic(
  () => import("@/components/admin/admin-analytics").then((m) => ({ default: m.AdminAnalyticsContent })),
  {
    loading: () => <SectionSkeleton rows={4} />,
    ssr: false, // SVG donut chart calculations — avoid SSR mismatch
  }
);

export const LazyAdminFraud = dynamic(
  () => import("@/components/admin/admin-fraud").then((m) => ({ default: m.AdminFraudContent })),
  { loading: () => <SectionSkeleton rows={4} />, ssr: true }
);
