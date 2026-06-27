import type { Metadata } from "next";
import { AdminAnalyticsContent } from "@/components/admin/admin-analytics";

export const metadata: Metadata = { title: "Analytics — Admin", robots: { index: false, follow: false } };

export default function AdminAnalyticsPage() {
  return <AdminAnalyticsContent />;
}
