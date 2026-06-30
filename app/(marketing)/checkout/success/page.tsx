import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessPage } from "@/components/checkout/success-page";

export const metadata: Metadata = {
  title: "Order Confirmed — Simkuu",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-black/40">Loading…</div>}>
      <SuccessPage />
    </Suspense>
  );
}
