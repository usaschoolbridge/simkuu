import type { Metadata } from "next";
import { AdminCustomersContent } from "@/components/admin/admin-customers";

export const metadata: Metadata = { title: "Customers — Admin", robots: { index: false, follow: false } };

export default function AdminCustomersPage() {
  return <AdminCustomersContent />;
}
