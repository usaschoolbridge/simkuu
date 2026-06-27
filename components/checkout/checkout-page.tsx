"use client";

import { useState } from "react";
import Link from "next/link";
import { Wifi, ArrowLeft } from "lucide-react";
import { CheckoutForm } from "./checkout-form";
import { OrderSummary } from "./order-summary";

// Demo plan — in production derive from URL params / cart state
const DEMO_PLAN = {
  id: "tmobile-unlimited",
  name: "T-Mobile Unlimited",
  carrier: "T-Mobile",
  data: "Unlimited",
  signal: "5G",
  price: 2999,
  originalPrice: 3999,
  color: "from-pink-500 to-red-500",
  features: [
    "Unlimited 5G data",
    "Hotspot included",
    "No contract — cancel anytime",
    "Instant QR code delivery",
    "Works on all 5G unlocked devices",
    "24/7 customer support",
  ],
};

export function CheckoutPage() {
  const [discount, setDiscount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/plans" className="flex items-center gap-1.5 text-sm text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to plans
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wifi className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-black text-base text-black">Simkuu</span>
          </Link>
          <div className="text-xs text-black/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-black text-black">Complete your order</h1>
          <p className="text-black/40 text-sm mt-1">Your eSIM will be delivered instantly to your email.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Form */}
          <div className="lg:col-span-3">
            <CheckoutForm plan={DEMO_PLAN} discount={discount} />
          </div>

          {/* Summary */}
          <div className="lg:col-span-2 lg:sticky lg:top-20">
            <OrderSummary
              plan={DEMO_PLAN}
              onCouponApply={(code, amt) => setDiscount(amt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
