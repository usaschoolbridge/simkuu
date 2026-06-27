"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, DollarSign, Zap } from "lucide-react";

const TRANSACTIONS = [
  { id: "tx-1", type: "credit", label: "Referral bonus — John D.", amount: "+$12.00", date: "Jun 22, 2026", balance: "$34.00" },
  { id: "tx-2", type: "debit", label: "Purchase: T-Mobile Unlimited", amount: "-$29.99", date: "Jun 20, 2026", balance: "$22.00" },
  { id: "tx-3", type: "credit", label: "Referral bonus — Sarah M.", amount: "+$12.00", date: "Jun 15, 2026", balance: "$51.99" },
  { id: "tx-4", type: "credit", label: "Wallet top-up", amount: "+$50.00", date: "Jun 10, 2026", balance: "$39.99" },
  { id: "tx-5", type: "debit", label: "Purchase: Verizon 50GB", amount: "-$39.99", date: "Jun 10, 2026", balance: "-$10.01" },
  { id: "tx-6", type: "credit", label: "Referral bonus — Mike K.", amount: "+$10.00", date: "Jun 5, 2026", balance: "$29.98" },
];

const TOP_UP_AMOUNTS = [10, 25, 50, 100];

export function WalletContent() {
  const [topUpAmount, setTopUpAmount] = useState(25);
  const [custom, setCustom] = useState("");

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 text-white shadow-xl shadow-blue-500/20"
      >
        {/* BG decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5 text-white/70" />
            <span className="text-white/70 text-sm font-medium">Wallet Balance</span>
          </div>
          <div className="font-display text-5xl font-black mb-1">$34.00</div>
          <p className="text-white/50 text-sm">Available credits · No expiry</p>

          <div className="mt-6 flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-white/90 transition-colors shadow-md">
              <Plus className="w-4 h-4" /> Add funds
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/10">
              <Zap className="w-4 h-4" /> Apply to order
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top up */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <h3 className="font-display font-bold text-base text-black mb-4">Add funds</h3>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {TOP_UP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setTopUpAmount(amt); setCustom(""); }}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  topUpAmount === amt && !custom
                    ? "bg-black text-white border-black shadow-md"
                    : "border-black/10 text-black/60 hover:border-black/30 hover:text-black"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30 text-sm font-medium">$</span>
            <input
              type="number"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setTopUpAmount(0); }}
              placeholder="Custom amount"
              min="5" max="500"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors shadow-md shadow-black/10">
              <CreditCard className="w-4 h-4" /> Pay with Card
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">PayPal</button>
              <button className="py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">Crypto</button>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="space-y-3">
          {[
            { icon: DollarSign, label: "Total topped up", value: "$50.00", color: "text-blue-600", bg: "bg-blue-50" },
            { icon: ArrowDownLeft, label: "Total spent from wallet", value: "$69.98", color: "text-purple-600", bg: "bg-purple-50" },
            { icon: ArrowUpRight, label: "Total referral credits", value: "$34.00", color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((s, i) => (
            <div key={s.label} className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-xs text-black/40 mb-0.5">{s.label}</div>
                <div className="font-display font-bold text-lg text-black">{s.value}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Transaction history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="font-display font-bold text-base text-black">Transaction history</h3>
        </div>
        {TRANSACTIONS.map((tx, i) => (
          <div key={tx.id} className={`flex items-center gap-4 px-5 py-4 ${i < TRANSACTIONS.length - 1 ? "border-b border-black/5" : ""} hover:bg-black/[0.01] transition-colors`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-50" : "bg-red-50"}`}>
              {tx.type === "credit"
                ? <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                : <ArrowUpRight className="w-4 h-4 text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black">{tx.label}</div>
              <div className="text-xs text-black/30">{tx.date}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${tx.type === "credit" ? "text-emerald-600" : "text-black"}`}>{tx.amount}</div>
              <div className="text-xs text-black/30">Bal: {tx.balance}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
