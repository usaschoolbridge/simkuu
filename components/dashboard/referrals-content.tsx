"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Users, DollarSign, TrendingUp, Share2, Mail, MessageCircle } from "lucide-react";

const REFERRAL_CODE = "ALEX-K7X9";
const REFERRAL_LINK = "https://simkuu.com/ref/ALEX-K7X9";

const REFERRALS = [
  { name: "John D.", email: "j***@gmail.com", joined: "Jun 15, 2026", status: "converted", earned: "$12.00" },
  { name: "Sarah M.", email: "s***@icloud.com", joined: "Jun 5, 2026", status: "converted", earned: "$12.00" },
  { name: "Mike K.", email: "m***@yahoo.com", joined: "May 28, 2026", status: "converted", earned: "$10.00" },
  { name: "Emma L.", email: "e***@gmail.com", joined: "May 15, 2026", status: "pending", earned: "$0.00" },
];

export function ReferralsContent() {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const copy = (type: "code" | "link") => {
    navigator.clipboard.writeText(type === "code" ? REFERRAL_CODE : REFERRAL_LINK);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const total = REFERRALS.filter(r => r.status === "converted").reduce((s, r) => s + parseFloat(r.earned.slice(1)), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total referrals", value: REFERRALS.length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: DollarSign, label: "Total earned", value: `$${total.toFixed(2)}`, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: TrendingUp, label: "Converted", value: `${REFERRALS.filter(r => r.status === "converted").length}`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div className="font-display text-2xl font-black text-black mb-1">{s.value}</div>
            <div className="text-xs text-black/40">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-sm text-blue-800">How referrals work</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { step: "1", label: "Share your link", desc: "Send your unique referral link to friends" },
            { step: "2", label: "They sign up & buy", desc: "Your friend creates an account and purchases a plan" },
            { step: "3", label: "You earn $12", desc: "Get $12 wallet credit for each qualified referral" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-2">{s.step}</div>
              <div className="text-sm font-semibold text-blue-900 mb-1">{s.label}</div>
              <div className="text-xs text-blue-700/60">{s.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Share section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
        <h3 className="font-display font-bold text-base text-black mb-4">Your referral link</h3>

        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs text-black/40 font-medium mb-1.5 block">Referral code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl border border-black/10 bg-black/[0.02]">
                <span className="font-mono text-sm font-bold text-black tracking-widest">{REFERRAL_CODE}</span>
              </div>
              <button onClick={() => copy("code")}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors">
                {copied === "code" ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-black/40 font-medium mb-1.5 block">Referral link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl border border-black/10 bg-black/[0.02] overflow-hidden">
                <span className="text-sm text-black/50 truncate">{REFERRAL_LINK}</span>
              </div>
              <button onClick={() => copy("link")}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">
                {copied === "link" ? <><Check className="w-4 h-4 text-emerald-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">
            <Mail className="w-4 h-4" /> Email
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">
            <MessageCircle className="w-4 h-4" /> SMS
          </button>
        </div>
      </motion.div>

      {/* Referral list */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="font-display font-bold text-base text-black">Your referrals</h3>
        </div>
        {REFERRALS.map((r, i) => (
          <div key={r.email} className={`flex items-center gap-4 px-5 py-4 ${i < REFERRALS.length - 1 ? "border-b border-black/5" : ""}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {r.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black">{r.name}</div>
              <div className="text-xs text-black/30">{r.email} · {r.joined}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                r.status === "converted"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}>
                {r.status === "converted" ? "Converted" : "Pending"}
              </span>
              <span className={`text-sm font-bold ${r.status === "converted" ? "text-emerald-600" : "text-black/30"}`}>
                {r.earned}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
