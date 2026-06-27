"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Check, X, ChevronDown, Shield, Zap, Wifi } from "lucide-react";

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
  onCouponApply?: (code: string, discount: number) => void;
}

export function OrderSummary({ plan, onCouponApply }: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponState, setCouponState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [discount, setDiscount] = useState(0);

  const VALID_COUPONS: Record<string, number> = {
    "WELCOME20": 20, "SUMMER10": 10, "SAVE5": 5, "BULK30": 30,
  };

  const checkCoupon = async () => {
    setCouponState("checking");
    await new Promise(r => setTimeout(r, 800));
    const pct = VALID_COUPONS[couponCode.toUpperCase()];
    if (pct) {
      const discountAmt = Math.round((plan.price * pct) / 100);
      setDiscount(discountAmt);
      setCouponState("valid");
      onCouponApply?.(couponCode, discountAmt);
    } else {
      setCouponState("invalid");
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setCouponState("idle");
    setDiscount(0);
    onCouponApply?.("", 0);
  };

  const subtotal = plan.price;
  const tax = Math.round(subtotal * 0.09);
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

      {/* Coupon */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4">
        <label className="text-xs font-semibold text-black/40 uppercase tracking-wide block mb-2">Coupon code</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
            <input
              value={couponCode}
              onChange={e => { setCouponCode(e.target.value); setCouponState("idle"); }}
              placeholder="e.g. WELCOME20"
              disabled={couponState === "valid"}
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-black/10 text-sm font-mono uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-black/[0.02] disabled:text-black/40 transition-all"
            />
          </div>
          {couponState === "valid" ? (
            <button onClick={clearCoupon} className="p-2.5 rounded-xl border border-black/10 text-black/40 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={checkCoupon} disabled={!couponCode || couponState === "checking"}
              className="px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-40 transition-all">
              {couponState === "checking" ? "…" : "Apply"}
            </button>
          )}
        </div>
        <AnimatePresence>
          {couponState === "valid" && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Coupon applied — you save ${(discount / 100).toFixed(2)}!
            </motion.p>
          )}
          {couponState === "invalid" && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-2 text-xs text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" /> Invalid coupon code
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4 space-y-2.5">
        <div className="flex justify-between text-sm text-black/50">
          <span>Subtotal</span><span>${(subtotal / 100).toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Coupon discount</span><span>-${(discount / 100).toFixed(2)}</span>
          </div>
        )}
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
