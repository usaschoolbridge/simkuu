import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout — Simkuu",
  description: "Complete your USA eSIM purchase securely.",
  robots: { index: false, follow: false },
};

// Fallback plan if no planId in URL
const FALLBACK_PLAN_SLUG = "seed_t-mobile_unlimited";

export default async function Checkout({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId } = await searchParams;

  let plan = null;

  if (planId) {
    plan = await db.plan.findUnique({
      where: { id: planId },
      include: { carrier: true },
    });
  }

  // Fallback to T-Mobile Unlimited if no planId or not found
  if (!plan) {
    plan = await db.plan.findFirst({
      where: { stripePriceId: FALLBACK_PLAN_SLUG },
      include: { carrier: true },
    });
  }

  // Last resort fallback
  if (!plan) {
    plan = await db.plan.findFirst({
      include: { carrier: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black/50">No plans available. Please contact support.</p>
      </div>
    );
  }

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
