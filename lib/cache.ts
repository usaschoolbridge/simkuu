import { cache } from "react";

/**
 * Caching utilities for server components.
 *
 * Uses React's `cache()` for request-level deduplication (same render pass),
 * combined with Next.js `fetch` cache semantics for cross-request caching.
 *
 * Usage pattern:
 *   export const getPlans = cachedFetch("plans", fetchPlans, 3600);
 *   const plans = await getPlans(); // deduped + cached
 */

// ── Request-level deduplication ───────────────────────────────────────────────

/**
 * Wrap any async function with React cache() for request-level deduplication.
 * All calls to the returned function within the same server render pass
 * will share a single execution.
 */
export function dedupe<T extends (...args: never[]) => Promise<unknown>>(fn: T): T {
  return cache(fn) as T;
}

// ── Revalidation constants ────────────────────────────────────────────────────

export const CACHE_TTL = {
  /** Static content — 1 week */
  STATIC: 60 * 60 * 24 * 7,
  /** Plans / pricing — 1 hour */
  PLANS: 60 * 60,
  /** Exchange rates / crypto prices — 60 seconds */
  CRYPTO: 60,
  /** User-specific data — no cache */
  PRIVATE: 0,
  /** Blog posts — 10 minutes */
  BLOG: 60 * 10,
  /** CMS / marketing content — 30 minutes */
  CONTENT: 60 * 30,
} as const;

// ── Cached data fetchers (mock → production ready) ───────────────────────────

/**
 * Fetch all plans with 1-hour revalidation.
 * Replace the mock return with a real DB/API call in production.
 */
export const getPlans = dedupe(async () => {
  // Production: fetch from your DB or external API
  // const res = await fetch(`${process.env.API_URL}/plans`, {
  //   next: { revalidate: CACHE_TTL.PLANS, tags: ["plans"] },
  // });
  // return res.json();

  // Mock data — same shape your UI expects
  return [
    { slug: "tmobile-starter", carrier: "T-Mobile", name: "Starter", price: 1500, data: "5GB" },
    { slug: "tmobile-unlimited", carrier: "T-Mobile", name: "Unlimited", price: 2500, data: "Unlimited" },
    { slug: "verizon-starter", carrier: "Verizon", name: "Starter", price: 1800, data: "5GB" },
    { slug: "verizon-unlimited", carrier: "Verizon", name: "Unlimited", price: 3500, data: "Unlimited" },
    { slug: "att-starter", carrier: "AT&T", name: "Starter", price: 1600, data: "5GB" },
    { slug: "att-unlimited", carrier: "AT&T", name: "Unlimited", price: 3000, data: "Unlimited" },
    { slug: "mvno-starter", carrier: "T-Mobile MVNO", name: "Starter", price: 1000, data: "5GB" },
    { slug: "mvno-unlimited", carrier: "T-Mobile MVNO", name: "Unlimited", price: 1800, data: "15GB" },
  ];
});

/**
 * Fetch blog posts list.
 * Replace with your CMS query (Contentful, Sanity, MDX, etc.) in production.
 */
export const getBlogPosts = dedupe(async () => {
  // Production: await contentfulClient.getEntries({ content_type: "blogPost" })
  return [] as Array<{
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    publishedAt: string;
    category: string;
    readTime: number;
  }>;
});

/**
 * Fetch a single plan by slug.
 */
export const getPlanBySlug = dedupe(async (slug: string) => {
  const plans = await getPlans();
  return plans.find((p) => p.slug === slug) ?? null;
});

// ── Cache tag invalidation helpers ───────────────────────────────────────────

/**
 * Call these from API route handlers after mutations to bust ISR cache.
 * Requires `next: { tags: [...] }` on the original fetch.
 *
 * Example usage in an API route:
 *   import { revalidateTag } from "next/cache";
 *   revalidateTag("plans");
 */
export const CACHE_TAGS = {
  PLANS: "plans",
  BLOG: "blog",
  USERS: "users",
  ORDERS: "orders",
} as const;
