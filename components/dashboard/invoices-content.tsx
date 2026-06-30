"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNo: string;
  orderNo: number;
  orderDisplayId: string;
  plan: string;
  amount: number;
  currency: string;
  issuedAt: string;
  paidAt: string | null;
}

export function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/invoices")
      .then(r => r.ok ? r.json() : [])
      .then(setInvoices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-black/30">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading invoices…
      </div>
    );
  }

  const totalPaid = invoices.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Invoices", value: invoices.length.toString() },
          { label: "Total Paid", value: `$${totalPaid.toFixed(2)}` },
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
          <div className="col-span-4">Invoice</div>
          <div className="col-span-3">Order</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Amount</div>
        </div>

        {invoices.length === 0 ? (
          <div className="py-16 text-center text-black/30 text-sm">No invoices yet.</div>
        ) : invoices.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`grid grid-cols-12 gap-4 items-center px-5 py-4 ${i < invoices.length - 1 ? "border-b border-black/5" : ""} hover:bg-black/[0.01] transition-colors`}
          >
            <div className="col-span-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="font-mono text-sm font-medium text-black">{inv.invoiceNo}</span>
            </div>
            <div className="col-span-3 text-sm text-black/50 font-mono">{inv.orderDisplayId}</div>
            <div className="col-span-2 text-sm text-black/50 truncate">{inv.plan}</div>
            <div className="col-span-2 text-sm text-black/50">{inv.issuedAt}</div>
            <div className="col-span-1 text-sm font-bold text-black">${inv.amount.toFixed(2)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
