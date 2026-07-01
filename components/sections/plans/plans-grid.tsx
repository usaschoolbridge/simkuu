"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/currency";
import { CompatibilityModal } from "@/components/compat/compatibility-modal";

type CarrierFilter = "all" | string;
type DataFilter = "all" | "small" | "medium" | "unlimited";
type SortBy = "price-asc" | "price-desc" | "popular";

type DbPlan = {
  id: string;
  name: string;
  carrierId: string;
  carrier: { id: string; name: string; color: string };
  data: string;
  price: number;
  originalPrice: number | null;
  fiveG: boolean;
  hotspot: boolean;
  badge: string | null;
  isActive: boolean;
  sortOrder: number;
  inventoryCount?: number;
  inStock?: boolean;
};

const DATA_LABELS: Record<DataFilter, string> = {
  all: "All Data",
  small: "Under 15 GB",
  medium: "15–50 GB",
  unlimited: "Unlimited",
};

function getCarrierColor(carrier: DbPlan["carrier"]): string {
  const colors: Record<string, string> = {
    TMOBILE: "#E20074",
    VERIZON: "#CD040B",
    ATT: "#00A8E0",
    MVNO: "#9B59B6",
  };
  return colors[carrier?.id] ?? carrier?.color ?? "#6B7280";
}

function matchesDataFilter(data: string, filter: DataFilter): boolean {
  if (filter === "all") return true;
  const lower = data.toLowerCase();
  if (filter === "unlimited") return lower.includes("unlimited");
  const gb = parseFloat(data);
  if (filter === "small") return !isNaN(gb) && gb < 15;
  if (filter === "medium") return !isNaN(gb) && gb >= 15 && gb <= 50;
  return true;
}

function PlanCard({ plan, format }: { plan: DbPlan; format: (p: number) => string }) {
  const color = getCarrierColor(plan.carrier);
  const [compatOpen, setCompatOpen] = useState(false);
  const features = [
    `${plan.carrier?.name} network`,
    plan.fiveG ? "5G enabled" : "4G LTE",
    plan.hotspot ? "Mobile hotspot" : null,
    "Unlimited calls & SMS",
    "Wi-Fi calling",
    "Instant QR delivery",
  ].filter(Boolean) as string[];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl bg-white border border-black/[0.06] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Top accent */}
      <div className="h-0.5 w-full" style={{ background: color }} />

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow"
          style={{ background: color }}>
          {plan.badge}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Carrier + name */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
            style={{ background: color }}>
            {plan.carrier?.name?.charAt(0) ?? "?"}
          </div>
          <div>
            <div className="text-[11px] text-black/30 leading-none">{plan.carrier?.name}</div>
            <div className="font-display font-bold text-black text-sm">{plan.name}</div>
          </div>
        </div>

        {/* Data */}
        <div className="rounded-xl px-3 py-2.5 mb-4 bg-gray-50 border border-black/[0.04]">
          <div className="text-[10px] text-black/30 uppercase tracking-wider">Data</div>
          <div className="font-display text-xl font-black text-black">{plan.data}</div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="font-display text-3xl font-black text-black">{format(Number(plan.price))}</span>
          <span className="text-black/40 text-sm">/mo</span>
          {plan.originalPrice && (
            <span className="text-black/25 text-sm line-through ml-1">{format(Number(plan.originalPrice))}</span>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-5 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-black/55">
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color }} />
              {f}
            </li>
          ))}
        </ul>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {plan.fiveG && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">5G</span>}
          {plan.hotspot && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Hotspot</span>}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Unlimited Calls</span>
        </div>

        {plan.inStock === false ? (
          <div className="w-full text-center py-2 rounded-xl border border-black/10 bg-black/5 text-sm font-semibold text-black/30 cursor-not-allowed">
            Out of Stock
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full hover:text-white transition-all duration-300"
            onClick={() => setCompatOpen(true)}
            onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = color; b.style.borderColor = color; b.style.color = "white"; }}
            onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = ""; b.style.borderColor = ""; b.style.color = ""; }}>
            Get This Plan
          </Button>
        )}
      </div>

      <CompatibilityModal open={compatOpen} onClose={() => setCompatOpen(false)} planId={plan.id} />
    </motion.div>
  );
}

export function PlansGrid() {
  const [plans, setPlans] = useState<DbPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrier, setCarrier] = useState<CarrierFilter>("all");
  const [data, setData] = useState<DataFilter>("all");
  const [sort, setSort] = useState<SortBy>("popular");
  const { format, currency } = useCurrency();

  useEffect(() => {
    fetch("/api/plans")
      .then(r => r.json())
      .then(data => { setPlans(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const uniqueCarriers = Array.from(
    new Map(plans.map(p => [p.carrierId, p.carrier])).entries()
  );

  const filtered = plans
    .filter(p => carrier === "all" || p.carrierId === carrier)
    .filter(p => matchesDataFilter(p.data, data))
    .sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      // popular: badge plans first, then by sortOrder
      const aBadge = a.badge ? 1 : 0;
      const bBadge = b.badge ? 1 : 0;
      return bBadge - aBadge || a.sortOrder - b.sortOrder;
    });

  if (loading) {
    return (
      <section className="pb-24 md:pb-32">
        <div className="container-xl flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-black/20" />
        </div>
      </section>
    );
  }

  return (
    <section className="pb-24 md:pb-32">
      <div className="container-xl">
        {/* Filters */}
        <Reveal variant="fadeUp" className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Carrier filter */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCarrier("all")}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                carrier === "all" ? "bg-black text-white border-black" : "bg-white text-black/50 border-black/10 hover:border-black/20")}>
              All Carriers
            </button>
            {uniqueCarriers.map(([id, c]) => (
              <button key={id} onClick={() => setCarrier(id)}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  carrier === id ? "bg-black text-white border-black" : "bg-white text-black/50 border-black/10 hover:border-black/20")}>
                <div className="w-2 h-2 rounded-full" style={{ background: getCarrierColor(c) }} />
                {c?.name}
              </button>
            ))}
          </div>

          {/* Sort & data filter */}
          <div className="flex gap-2 sm:ml-auto">
            <select value={data} onChange={(e) => setData(e.target.value as DataFilter)}
              className="px-3 py-2 rounded-full text-sm font-medium border border-black/10 bg-white text-black/70 focus:outline-none focus:border-blue-400">
              {(Object.entries(DATA_LABELS) as [DataFilter, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortBy)}
              className="px-3 py-2 rounded-full text-sm font-medium border border-black/10 bg-white text-black/70 focus:outline-none focus:border-blue-400">
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </Reveal>

        {/* Results count + currency badge */}
        <Reveal variant="fadeIn" className="mb-6">
          <div className="flex items-center gap-2 text-sm text-black/40 flex-wrap">
            <SlidersHorizontal className="w-4 h-4" />
            Showing <span className="font-semibold text-black">{filtered.length}</span> plans
            {carrier !== "all" && (
              <button onClick={() => setCarrier("all")} className="flex items-center gap-1 ml-2 text-blue-500 hover:text-blue-600">
                Clear <X className="w-3 h-3" />
              </button>
            )}
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
              {currency === "INR" ? "₹ Prices in Indian Rupees" : "$ Prices in US Dollars"}
            </span>
          </div>
        </Reveal>

        {/* Plans grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((plan) => (
              <PlanCard key={plan.id} plan={plan} format={format} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-display text-xl font-bold text-black mb-2">No plans match your filters</div>
            <p className="text-black/40 mb-6">Try adjusting your carrier or data selection</p>
            <Button variant="outline" onClick={() => { setCarrier("all"); setData("all"); }}>Clear Filters</Button>
          </div>
        )}
      </div>
    </section>
  );
}
