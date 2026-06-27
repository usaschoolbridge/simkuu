import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const BASE = siteConfig.url;

// Static marketing pages
const STATIC_PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/plans", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/coverage", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/carriers/t-mobile", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/carriers/verizon", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/carriers/att", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/carriers/mvno", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/refund", priority: 0.4, changeFrequency: "yearly" as const },
];

// Blog post slugs
const BLOG_POSTS = [
  "what-is-esim",
  "t-mobile-vs-verizon",
  "esim-activation-guide",
  "best-esim-plans-2026",
  "mvno-explained",
  "5g-esim-guide",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
