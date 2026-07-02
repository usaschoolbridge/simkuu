import type { Metadata } from "next";
import { AdminPaymentTesting } from "@/components/admin/admin-payment-testing";

export const metadata: Metadata = { title: "Payment Testing — Admin", robots: { index: false, follow: false } };

export default function AdminPaymentTestingPage() {
  return <AdminPaymentTesting />;
}
