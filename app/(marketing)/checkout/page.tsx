import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout — Simkuu",
  description: "Complete your USA eSIM purchase securely.",
  robots: { index: false, follow: false },
};

export default function Checkout() {
  return <CheckoutPage />;
}
