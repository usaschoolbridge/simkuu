import type { Metadata } from "next";
import { AdminOrdersContent } from "@/components/admin/admin-orders";

export const metadata: Metadata = { title: "Orders — Admin", robots: { index: false, follow: false } };

export default function AdminOrdersPage() {
  return <AdminOrdersContent />;
}
