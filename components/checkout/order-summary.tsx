"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield, Zap, Wifi } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  carrier: string;
  data: string;
  signal: string;
  price: number;
  originalPrice?: number;
  features: string[];
  color: string;
}

interface OrderSummaryProps {
  plan: Plan;
  /** Discount in cents, coming from the real checkout-form coupon system */
  appliedDiscount?: number;
  appliedCouponCode?: string;
}

export function OrderSummary({ plan, appliedDiscount = 0, appliedCouponCode }: OrderSummaryProps) {
  const subtotal = plan.price;
  const discount = appliedDiscount;
  const tax = Math.round((subtotal - discount) * 0.09);
  const total = subtotal - discount + tax;

  return (
    <div className="space-y-4">
      {/* Plan card */}
      <div className={`rounded-2xl bg-gradient-to-br ${plan.color} p-5 text-white`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-black text-lg">{plan.name}</div>
            <div className="text-white/70 text-sm">{plan.carrier} · {plan.signal}</div>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-white/60 text-xs mb-0.5">Data</div>
            <div className="font-display font-black text-2xl">{plan.data}</div>
          </div>
          <div className="text-right">
            {plan.originalPrice && (
              <div className="text-white/40 text-sm line-through">${(plan.originalPrice / 100).toFixed(2)}</div>
            )}
            <div className="font-display font-black text-2xl">${(plan.price / 100).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-center gap-2.5 text-sm text-black/60">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {f}
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-2.5">
        <div className="flex justify-between text-sm text-black/50">
          <span>Subtotal</span><span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        <AnimatePresence>
          {discount > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-sm text-emerald-600">
              <span>Coupon {appliedCouponCode ? `(${appliedCouponCode})` : "discount"}</span>
              <span>-${(discount / 100).toFixed(2)}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between text-sm text-black/50">
          <span>Tax (9%)</span><span>${(tax / 100).toFixed(2)}</span>
        </div>
        <div className="border-t border-black/5 pt-2.5 flex justify-between">
          <span className="font-display font-black text-base text-black">Total</span>
          <span className="font-display font-black text-xl text-black">${(total / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-black/30">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL encrypted</span>
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant delivery</span>
        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 24h refund</span>
      </div>
    </div>
  );
}
