import type { Metadata } from "next";
import { AdminCouponsContent } from "@/components/admin/admin-coupons";

export const metadata: Metadata = { title: "Coupons — Admin", robots: { index: false, follow: false } };

export default function AdminCouponsPage() {
  return <AdminCouponsContent />;
}
