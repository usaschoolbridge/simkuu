import type { Metadata } from "next";
import { AdminInventoryContent } from "@/components/admin/admin-inventory";

export const metadata: Metadata = { title: "eSIM Inventory — Admin", robots: { index: false, follow: false } };

export default function AdminInventoryPage() {
  return <AdminInventoryContent />;
}
