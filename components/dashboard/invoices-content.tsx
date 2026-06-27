"use client";

import { motion } from "framer-motion";
import { Download, FileText, CheckCircle } from "lucide-react";

const INVOICES = [
  { id: "INV-2026-006", order: "ORD-8821", date: "Jun 20, 2026", amount: "$29.99", tax: "$2.70", total: "$32.69", status: "paid" },
  { id: "INV-2026-005", order: "ORD-8743", date: "Jun 10, 2026", amount: "$39.99", tax: "$3.60", total: "$43.59", status: "paid" },
  { id: "INV-2026-004", order: "ORD-8601", date: "May 28, 2026", amount: "$24.99", tax: "$2.25", total: "$27.24", status: "paid" },
  { id: "INV-2026-003", order: "ORD-8490", date: "May 15, 2026", amount: "$14.99", tax: "$1.35", total: "$16.34", status: "paid" },
  { id: "INV-2026-002", order: "ORD-8341", date: "May 1, 2026", amount: "$59.99", tax: "$5.40", total: "$65.39", status: "paid" },
  { id: "INV-2026-001", order: "ORD-8102", date: "Apr 15, 2026", amount: "$19.99", tax: "$1.80", total: "$21.79", status: "paid" },
];

export function InvoicesContent() {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Invoices", value: INVOICES.length.toString() },
          { label: "Total Paid", value: `$${INVOICES.reduce((s, i) => s + parseFloat(i.total.slice(1)), 0).toFixed(2)}` },
          { label: "This Month", value: "$76.28" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm text-center">
            <div className="font-display text-2xl font-black text-black mb-1">{s.value}</div>
            <div className="text-xs text-black/40">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-black/5 text-xs font-semibold text-black/30 uppercase tracking-wide">
          <div className="col-span-3">Invoice</div>
          <div className="col-span-3">Order</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Subtotal</div>
          <div className="col-span-1">Tax</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1 text-right">PDF</div>
        </div>

        {INVOICES.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`grid grid-cols-12 gap-4 items-center px-5 py-4 ${i < INVOICES.length - 1 ? "border-b border-black/5" : ""} hover:bg-black/[0.01] transition-colors`}
          >
            <div className="col-span-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="font-mono text-sm font-medium text-black">{inv.id}</span>
            </div>
            <div className="col-span-3 text-sm text-black/50 font-mono">{inv.order}</div>
            <div className="col-span-2 text-sm text-black/50">{inv.date}</div>
            <div className="col-span-1 text-sm text-black/60">{inv.amount}</div>
            <div className="col-span-1 text-sm text-black/40">{inv.tax}</div>
            <div className="col-span-1 text-sm font-bold text-black">{inv.total}</div>
            <div className="col-span-1 flex justify-end">
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 transition-colors text-xs font-medium text-black/60">
                <Download className="w-3 h-3" /> PDF
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
