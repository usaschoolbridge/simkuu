import type { Metadata } from "next";
import { AdminFraudContent } from "@/components/admin/admin-fraud";

export const metadata: Metadata = { title: "Fraud Detection — Admin", robots: { index: false, follow: false } };

export default function AdminFraudPage() {
  return <AdminFraudContent />;
}
