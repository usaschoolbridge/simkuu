import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout — Simkuu",
  description: "Complete your USA eSIM purchase securely.",
  robots: { index: false, follow: false },
};

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId } = await searchParams;

  // The DB is the single source of truth: checkout requires a real plan id.
  // If it's missing or doesn't resolve, send the customer to the catalog to
  // pick a real plan rather than silently loading an arbitrary fallback
  // (which previously caused the price shown to differ from the price charged).
  if (!planId) redirect("/plans");

  const plan = await db.plan.findUnique({
    where: { id: planId },
    include: { carrier: true },
  });

  if (!plan || !plan.isActive) redirect("/plans");

  const checkoutPlan = {
    id: plan.id,
    name: plan.name,
    carrier: plan.carrier?.name ?? "Unknown",
    data: plan.data,
    signal: plan.fiveG ? "5G" : "4G LTE",
    // Convert dollars to cents for checkout form (which divides by 100 for display)
    price: Math.round(Number(plan.price) * 100),
    originalPrice: plan.originalPrice ? Math.round(Number(plan.originalPrice) * 100) : undefined,
    color: plan.carrierId === "TMOBILE"
      ? "from-pink-500 to-red-500"
      : plan.carrierId === "VERIZON"
      ? "from-red-600 to-rose-700"
      : plan.carrierId === "ATT"
      ? "from-blue-500 to-cyan-500"
      : "from-purple-500 to-violet-600",
    features: [
      `${plan.data} data`,
      plan.hotspot ? "Hotspot included" : "No hotspot",
      "No contract — cancel anytime",
      "Instant QR code delivery",
      `Works on all ${plan.fiveG ? "5G" : "4G"} unlocked devices`,
      "24/7 customer support",
    ],
  };

  return <CheckoutPage plan={checkoutPlan} />;
}
