import type { Metadata } from "next";
import { SuccessPage } from "@/components/checkout/success-page";

export const metadata: Metadata = {
  title: "Order Confirmed — Simkuu",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccess() {
  return <SuccessPage />;
}
