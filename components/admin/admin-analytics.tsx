"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, ShoppingBag, Globe, Smartphone } from "lucide-react";

// Monthly revenue for 6 months
const MONTHLY = [
  { month: "Jan", revenue: 6240, orders: 189, customers: 62 },
  { month: "Feb", revenue: 8120, orders: 241, customers: 84 },
  { month: "Mar", revenue: 10840, orders: 318, customers: 103 },
  { month: "Apr", revenue: 9360, orders: 287, customers: 91 },
  { month: "May", revenue: 13620, orders: 411, customers: 138 },
  { month: "Jun", revenue: 18291, orders: 542, customers: 178 },
];

const TOP_COUNTRIES = [
  { country: "United States", flag: "🇺🇸", orders: 892, pct: 48 },
  { country: "Canada", flag: "🇨🇦", orders: 241, pct: 13 },
  { country: "United Kingdom", flag: "🇬🇧", orders: 178, pct: 10 },
  { country: "Germany", flag: "🇩🇪", orders: 134, pct: 7 },
  { country: "Mexico", flag: "🇲🇽", orders: 112, pct: 6 },
  { country: "South Korea", flag: "🇰🇷", orders: 89, pct: 5 },
  { country: "Other", flag: "🌍", orders: 201, pct: 11 },
];

const DEVICES = [
  { device: "iPhone", pct: 58, color: "bg-blue-500" },
  { device: "Samsung Galaxy", pct: 24, color: "bg-amber-500" },
  { device: "Google Pixel", pct: 10, color: "bg-emerald-500" },
  { device: "Other Android", pct: 8, color: "bg-purple-500" },
];

const TOP_PLANS = [
  { name: "T-Mobile Unlimited", revenue: "$23,400", orders: 782, growth: "+22%" },
  { name: "Verizon 50GB", revenue: "$20,840", orders: 521, growth: "+15%" },
  { name: "Verizon 100GB", revenue: "$10,680", orders: 178, growth: "+8%" },
  { name: "AT&T 30GB", revenue: "$7,800", orders: 312, growth: "+31%" },
  { name: "T-Mobile 15GB", revenue: "$6,814", orders: 341, growth: "+19%" },
];

const maxRevenue = Math.max(...MONTHLY.map(m => m.revenue));

export function AdminAnalyticsContent() {
  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
          {["7d", "30d", "90d", "6m", "1y", "All"].map((p, i) => (
            <button key={p} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 3 ? "bg-white shadow-sm text-black" : "text-black/40 hover:text-black/60"}`}>{p}</button>
          ))}
        </div>
        <button className="px-3 py-2 rounded-xl border border-black/10 text-sm text-black/50 hover:bg-black/5 transition-colors">Export CSV</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total revenue (6m)", value: `$${MONTHLY.reduce((s, m) => s + m.revenue, 0).toLocaleString()}`, change: "+18.4%", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: ShoppingBag, label: "Total orders (6m)", value: MONTHLY.reduce((s, m) => s + m.orders, 0).toLocaleString(), change: "+12.1%", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Users, label: "New customers (6m)", value: MONTHLY.reduce((s, m) => s + m.customers, 0).toLocaleString(), change: "+28.3%", color: "text-purple-600", bg: "bg-purple-50" },
          { icon: TrendingUp, label: "Avg order value", value: "$33.78", change: "+5.2%", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />{s.change}
              </span>
            </div>
            <div className="font-display text-2xl font-black text-black mb-0.5">{s.value}</div>
            <div className="text-xs text-black/40">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <h3 className="font-display font-bold text-base text-black mb-5">Monthly revenue</h3>
          <div className="flex items-end gap-3 h-44">
            {MONTHLY.map((m, i) => {
              const pct = (m.revenue / maxRevenue) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold text-black/40">${(m.revenue / 1000).toFixed(1)}k</span>
                  <motion.div className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 relative group cursor-pointer"
                    initial={{ height: 0 }} animate={{ height: `${pct}%` }} transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: "easeOut" }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${m.revenue.toLocaleString()}
                    </div>
                  </motion.div>
                  <span className="text-xs text-black/30">{m.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top plans */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <h3 className="font-display font-bold text-base text-black mb-5">Top plans by revenue</h3>
          <div className="space-y-3">
            {TOP_PLANS.map((plan, i) => (
              <div key={plan.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-black/20 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{plan.name}</div>
                  <div className="text-xs text-black/30">{plan.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-black">{plan.revenue}</div>
                  <div className="text-xs text-emerald-600">{plan.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top countries */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-black/40" />
            <h3 className="font-display font-bold text-base text-black">Top countries</h3>
          </div>
          <div className="space-y-3">
            {TOP_COUNTRIES.map((c, i) => (
              <div key={c.country}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-sm font-medium text-black">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black/40">{c.orders} orders</span>
                    <span className="text-xs font-bold text-black w-8 text-right">{c.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Device breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Smartphone className="w-4 h-4 text-black/40" />
            <h3 className="font-display font-bold text-base text-black">Device breakdown</h3>
          </div>
          {/* Donut visual */}
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                {DEVICES.reduce<{ offset: number; elements: React.ReactNode[] }>((acc, d) => {
                  const circumference = 2 * Math.PI * 15.9155;
                  const dashArray = `${(d.pct / 100) * circumference} ${circumference}`;
                  const el = (
                    <circle key={d.device} cx="18" cy="18" r="15.9155" fill="transparent"
                      stroke={d.color.replace("bg-", "").replace("-500", "")}
                      strokeWidth="3.5" strokeDasharray={dashArray}
                      strokeDashoffset={-acc.offset}
                      className={d.color.replace("bg-", "stroke-")} />
                  );
                  return { offset: acc.offset + (d.pct / 100) * circumference, elements: [...acc.elements, el] };
                }, { offset: 0, elements: [] }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-display font-black text-lg text-black">1,847</div>
                  <div className="text-[10px] text-black/30">activations</div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {DEVICES.map((d, i) => (
                <div key={d.device} className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${d.color} flex-shrink-0`} />
                  <div className="flex-1 text-sm text-black/70">{d.device}</div>
                  <div className="text-sm font-bold text-black">{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
