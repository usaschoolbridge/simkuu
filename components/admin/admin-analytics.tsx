"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2 } from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  monthly: { month: string; revenue: number; orders: number }[];
  topPlans: { name: string; revenue: string; orders: number }[];
}

export function AdminAnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-black/30">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading analytics…
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-32 text-black/30 text-sm">Failed to load analytics</div>;
  }

  const maxRevenue = data.monthly.length > 0 ? Math.max(...data.monthly.map(m => m.revenue)) : 1;

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
          { icon: DollarSign, label: "Total revenue (6m)", value: `$${data.totalRevenue.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: ShoppingBag, label: "Total orders (6m)", value: data.totalOrders.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Users, label: "New customers (6m)", value: data.totalCustomers.toLocaleString(), color: "text-purple-600", bg: "bg-purple-50" },
          { icon: TrendingUp, label: "Avg order value", value: `$${data.avgOrderValue.toFixed(2)}`, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
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
          {data.monthly.length === 0 ? (
            <div className="text-center py-16 text-black/30 text-sm">No data yet</div>
          ) : (
            <div className="flex items-end gap-3 h-44">
              {data.monthly.map((m, i) => {
                const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
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
          )}
        </motion.div>

        {/* Top plans */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <h3 className="font-display font-bold text-base text-black mb-5">Top plans by revenue</h3>
          {data.topPlans.length === 0 ? (
            <div className="text-center py-16 text-black/30 text-sm">No data yet</div>
          ) : (
            <div className="space-y-3">
              {data.topPlans.map((plan, i) => (
                <div key={plan.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-black/20 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">{plan.name}</div>
                    <div className="text-xs text-black/30">{plan.orders} orders</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-black">{plan.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
