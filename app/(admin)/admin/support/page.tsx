import type { Metadata } from "next";
import { AdminSupportContent } from "@/components/admin/admin-support";

export const metadata: Metadata = { title: "Support — Admin", robots: { index: false, follow: false } };

export default function AdminSupportPage() {
  return <AdminSupportContent />;
}
