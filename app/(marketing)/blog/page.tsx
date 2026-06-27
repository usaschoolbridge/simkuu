import type { Metadata } from "next";
import { LazyBlogContent as BlogContent } from "@/components/lazy";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog — eSIM Tips, News & Activation Guides",
  description: "Stay informed with the latest eSIM tips, carrier news, activation guides, and telecom insights from Simkuu.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Simkuu Blog — eSIM Tips, News & Guides",
    description: "Stay informed with the latest eSIM tips, carrier news, activation guides, and telecom insights from Simkuu.",
    url: `${siteConfig.url}/blog`,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}/og?title=Simkuu+Blog&sub=Tips+%C2%B7+News+%C2%B7+Activation+Guides&tag=eSIM+Insights`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Simkuu Blog", images: [`${siteConfig.url}/og?title=Simkuu+Blog&sub=eSIM+Tips+%26+Guides`], site: "@simkuu" },
};

export default function BlogPage() {
  return <BlogContent />;
}
