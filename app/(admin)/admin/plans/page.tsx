import type { Metadata } from "next";
import { AdminPlansContent } from "@/components/admin/admin-plans";

export const metadata: Metadata = { title: "Plans & Pricing — Admin", robots: { index: false, follow: false } };

export default function AdminPlansPage() {
  return <AdminPlansContent />;
}
