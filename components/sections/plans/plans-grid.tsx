"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Check, Zap, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/currency";

type CarrierFilter = "all" | "tmobile" | "verizon" | "att" | "mvno";
type DataFilter = "all" | "5gb" | "15gb" | "unlimited";
type SortBy = "price-asc" | "price-desc" | "popular";

const ALL_PLANS = [
  // T-Mobile
  { id: "tm-starter", name: "Starter", carrier: "tmobile", carrierName: "T-Mobile", color: "#E20074", data: "5GB", price: 15, badge: null, hotspot: false, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["T-Mobile network", "5G ready", "Wi-Fi calling"], popular: false },
  { id: "tm-standard", name: "Standard", carrier: "tmobile", carrierName: "T-Mobile", color: "#E20074", data: "Unlimited", price: 25, badge: "Most Popular", hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["T-Mobile 5G", "30GB hotspot", "HD streaming", "Mobile hotspot"], popular: true },
  { id: "tm-premium", name: "Premium", carrier: "tmobile", carrierName: "T-Mobile", color: "#E20074", data: "Unlimited+", price: 40, badge: null, hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["Priority data", "Unlimited hotspot", "4K streaming", "International SMS"], popular: false },
  // Verizon
  { id: "vz-starter", name: "Starter", carrier: "verizon", carrierName: "Verizon", color: "#CD040B", data: "5GB", price: 18, badge: null, hotspot: false, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["Verizon network", "5G Nationwide", "Wi-Fi calling"], popular: false },
  { id: "vz-standard", name: "Standard", carrier: "verizon", carrierName: "Verizon", color: "#CD040B", data: "Unlimited", price: 35, badge: "Best Network", hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["5G Ultra Wideband", "25GB hotspot", "Premium data", "HD streaming"], popular: false },
  { id: "vz-premium", name: "Premium", carrier: "verizon", carrierName: "Verizon", color: "#CD040B", data: "Unlimited+", price: 55, badge: null, hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["Unlimited UWB 5G", "Unlimited hotspot", "Priority always", "4K streaming", "Apple One trial"], popular: false },
  // AT&T
  { id: "att-starter", name: "Starter", carrier: "att", carrierName: "AT&T", color: "#00A8E0", data: "5GB", price: 16, badge: null, hotspot: false, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["AT&T network", "5G access", "Wi-Fi calling"], popular: false },
  { id: "att-standard", name: "Standard", carrier: "att", carrierName: "AT&T", color: "#00A8E0", data: "Unlimited", price: 30, badge: null, hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["AT&T 5G+", "15GB hotspot", "HD streaming", "Mobile share"], popular: false },
  { id: "att-premium", name: "Premium", carrier: "att", carrierName: "AT&T", color: "#00A8E0", data: "Unlimited+", price: 50, badge: null, hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["AT&T 5G+ priority", "Unlimited hotspot", "4K streaming", "International calls"], popular: false },
  // MVNO
  { id: "mvno-starter", name: "Starter", carrier: "mvno", carrierName: "T-Mobile MVNO", color: "#8B5CF6", data: "5GB", price: 10, badge: "Best Value", hotspot: false, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["T-Mobile backbone", "5G access", "Wi-Fi calling"], popular: false },
  { id: "mvno-standard", name: "Standard", carrier: "mvno", carrierName: "T-Mobile MVNO", color: "#8B5CF6", data: "15GB", price: 18, badge: null, hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["T-Mobile 5G", "10GB hotspot", "HD streaming"], popular: false },
  { id: "mvno-unlimited", name: "Unlimited", carrier: "mvno", carrierName: "T-Mobile MVNO", color: "#8B5CF6", data: "Unlimited", price: 25, badge: null, hotspot: true, fiveG: true, calls: "Unlimited", sms: "Unlimited", features: ["T-Mobile 5G priority", "25GB hotspot", "HD streaming", "Mobile hotspot"], popular: false },
];

const DATA_LABELS: Record<string, string> = {
  all: "All Data", "5gb": "5 GB", "15gb": "15 GB", unlimited: "Unlimited",
};

function PlanCard({ plan, format }: { plan: typeof ALL_PLANS[0]; format: (p: number) => string }) {
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
      <div className="h-0.5 w-full" style={{ background: plan.color }} />

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow"
          style={{ background: plan.color }}>
          {plan.badge}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Carrier + name */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
            style={{ background: plan.color }}>
            {plan.carrierName.charAt(0)}
          </div>
          <div>
            <div className="text-[11px] text-black/30 leading-none">{plan.carrierName}</div>
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
          <span className="font-display text-3xl font-black text-black">{format(plan.price)}</span>
          <span className="text-black/40 text-sm">/mo</span>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-black/55">
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />
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

        <Link href="/checkout">
          <Button variant="outline" size="sm" className="w-full hover:text-white transition-all duration-300"
            onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = plan.color; b.style.borderColor = plan.color; b.style.color = "white"; }}
            onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = ""; b.style.borderColor = ""; b.style.color = ""; }}>
            Get This Plan
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export function PlansGrid() {
  const [carrier, setCarrier] = useState<CarrierFilter>("all");
  const [data, setData] = useState<DataFilter>("all");
  const [sort, setSort] = useState<SortBy>("popular");
  const { format, currency } = useCurrency();

  const filtered = ALL_PLANS
    .filter((p) => carrier === "all" || p.carrier === carrier)
    .filter((p) => {
      if (data === "all") return true;
      if (data === "5gb") return p.data === "5GB";
      if (data === "15gb") return p.data === "15GB";
      if (data === "unlimited") return p.data.toLowerCase().includes("unlimited");
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    });

  const carriers: { id: CarrierFilter; label: string; color?: string }[] = [
    { id: "all", label: "All Carriers" },
    { id: "tmobile", label: "T-Mobile", color: "#E20074" },
    { id: "verizon", label: "Verizon", color: "#CD040B" },
    { id: "att", label: "AT&T", color: "#00A8E0" },
    { id: "mvno", label: "MVNO", color: "#8B5CF6" },
  ];

  return (
    <section className="pb-24 md:pb-32">
      <div className="container-xl">
        {/* Filters */}
        <Reveal variant="fadeUp" className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Carrier filter */}
          <div className="flex flex-wrap gap-2">
            {carriers.map((c) => (
              <button key={c.id} onClick={() => setCarrier(c.id)}
                className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  carrier === c.id ? "bg-black text-white border-black" : "bg-white text-black/50 border-black/10 hover:border-black/20")}>
                {c.color && <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />}
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort & data filter */}
          <div className="flex gap-2 sm:ml-auto">
            <select value={data} onChange={(e) => setData(e.target.value as DataFilter)}
              className="px-3 py-2 rounded-full text-sm font-medium border border-black/10 bg-white text-black/70 focus:outline-none focus:border-blue-400">
              {(["all", "5gb", "15gb", "unlimited"] as DataFilter[]).map((d) => (
                <option key={d} value={d}>{DATA_LABELS[d]}</option>
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
