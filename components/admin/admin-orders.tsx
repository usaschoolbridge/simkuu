"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle, Clock, XCircle, RefreshCw, Eye, Download,
  Loader2, Copy, Check, Bitcoin, X, ChevronDown,
} from "lucide-react";

interface EsimInfo {
  id: string; iccid: string; activationCode: string; status: string; activatedAt?: string;
}
interface Order {
  id: string;
  status: string;
  amount: string | number;
  paymentProvider: string;
  paymentId?: string | null;
  invoiceUrl?: string | null;
  metadata?: {
    coinName?: string; payCurrency?: string; network?: string;
    txHash?: string; paymentStatus?: string; phone?: string; country?: string;
    payAddress?: string; actuallyPaid?: string | number; payAmount?: string | number;
  } | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string; phone?: string | null };
  plan: { id: string; name: string; carrier: { name: string } };
  esim?: EsimInfo | null;
  inventoryItem?: { id: string; iccid: string } | null;
}

const STATUS_CFG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  ACTIVE:     { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100",  icon: CheckCircle },
  PENDING:    { color: "text-amber-600",   bg: "bg-amber-50 border-amber-100",      icon: Clock },
  PROCESSING: { color: "text-blue-600",    bg: "bg-blue-50 border-blue-100",        icon: Clock },
  REFUNDED:   { color: "text-purple-600",  bg: "bg-purple-50 border-purple-100",    icon: RefreshCw },
  EXPIRED:    { color: "text-black/30",    bg: "bg-black/5 border-black/5",         icon: XCircle },
  CANCELLED:  { color: "text-black/30",    bg: "bg-black/5 border-black/5",         icon: XCircle },
};
const STATUS_LABELS = ["all", "active", "pending", "refunded", "expired", "cancelled"];

function CopyCell({ value }: { value: string }) {
  const [c, setC] = useState(false);
  const copy = () => { navigator.clipboard.writeText(value).catch(() => {}); setC(true); setTimeout(() => setC(false), 1200); };
  return (
    <button onClick={copy} type="button" className="flex items-center gap-1 font-mono text-xs text-black/60 hover:text-black transition-colors max-w-[160px] truncate">
      <span className="truncate">{value}</span>
      {c ? <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" /> : <Copy className="w-3 h-3 flex-shrink-0 opacity-40" />}
    </button>
  );
}

function DetailModal({ order, onClose, onRefresh }: { order: Order; onClose: () => void; onRefresh: () => void }) {
  const meta = order.metadata ?? {};
  const [markingPaid, setMarkingPaid] = useState(false);
  const [markPaidError, setMarkPaidError] = useState<string | null>(null);
  const [markPaidOk, setMarkPaidOk] = useState(false);

  const isPendingCrypto = order.status === "PENDING" && order.paymentProvider === "CRYPTO" && !order.esim;

  const markAsPaid = async () => {
    setMarkingPaid(true);
    setMarkPaidError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid" }),
      });
      const data = await res.json();
      if (!res.ok) { setMarkPaidError(data.error ?? "Failed"); }
      else { setMarkPaidOk(true); onRefresh(); }
    } catch {
      setMarkPaidError("Network error");
    } finally {
      setMarkingPaid(false);
    }
  };

  const Row = ({ label, value }: { label: string; value?: string | null }) => value ? (
    <div className="flex items-start gap-3 py-2 border-b border-black/[0.04] last:border-0">
      <span className="text-xs text-black/40 w-36 flex-shrink-0 pt-0.5">{label}</span>
      <CopyCell value={value} />
    </div>
  ) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-black/[0.06]">
          <div>
            <div className="font-bold text-base text-black">ORD-{order.id.slice(-6).toUpperCase()}</div>
            <div className="text-xs text-black/40 font-mono">{order.id}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Mark as Paid button for pending crypto orders */}
        {isPendingCrypto && (
          <div className="px-5 pt-4">
            {markPaidOk ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
                <Check className="w-4 h-4" /> eSIM assigned and email sent to customer!
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  <strong>Pending crypto payment.</strong> Verify you received ${Number(order.amount).toFixed(2)} in {meta.coinName ?? "crypto"} at the address below, then click Mark as Paid to deliver the eSIM.
                </div>
                <button onClick={markAsPaid} disabled={markingPaid}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                  {markingPaid ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Bitcoin className="w-4 h-4" /> Mark as Paid & Deliver eSIM</>}
                </button>
                {markPaidError && <p className="text-xs text-red-500 text-center">{markPaidError}</p>}
              </div>
            )}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Customer */}
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-2">Customer</p>
            <Row label="Name"    value={order.user.name} />
            <Row label="Email"   value={order.user.email} />
            <Row label="Phone"   value={order.user.phone ?? meta.phone} />
            <Row label="Country" value={meta.country} />
          </div>

          {/* Order */}
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-2">Order</p>
            <Row label="Plan"         value={order.plan.name} />
            <Row label="Carrier"      value={order.plan.carrier.name} />
            <Row label="Amount"       value={`$${Number(order.amount).toFixed(2)} USD`} />
            <Row label="Created"      value={new Date(order.createdAt).toLocaleString()} />
            <Row label="Updated"      value={new Date(order.updatedAt).toLocaleString()} />
            <Row label="Status"       value={order.status} />
          </div>

          {/* Payment */}
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-2">Payment</p>
            <Row label="Method"          value={order.paymentProvider} />
            <Row label="Cryptocurrency"  value={meta.coinName && meta.payCurrency ? `${meta.coinName} (${meta.payCurrency?.toUpperCase()})` : meta.coinName ?? meta.payCurrency} />
            <Row label="Network"         value={meta.network} />
            <Row label="Pay amount"      value={meta.payAmount ? `${meta.payAmount} ${meta.payCurrency?.toUpperCase()}` : undefined} />
            <Row label="Paid amount"     value={meta.actuallyPaid ? `${meta.actuallyPaid} ${meta.payCurrency?.toUpperCase()}` : undefined} />
            <Row label="Pay address"     value={meta.payAddress} />
            <Row label="Payment ID"      value={order.paymentId} />
            <Row label="TX hash"         value={meta.txHash} />
            <Row label="Payment status"  value={meta.paymentStatus} />
          </div>

          {/* eSIM */}
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-2">eSIM</p>
            <div className="flex items-center gap-2 py-2 border-b border-black/[0.04]">
              <span className="text-xs text-black/40 w-36 flex-shrink-0">LPA assigned</span>
              <span className={`text-xs font-semibold ${order.esim ? "text-emerald-600" : "text-black/30"}`}>
                {order.esim ? "✓ Yes" : "Not yet"}
              </span>
            </div>
            <div className="flex items-center gap-2 py-2 border-b border-black/[0.04]">
              <span className="text-xs text-black/40 w-36 flex-shrink-0">QR generated</span>
              <span className={`text-xs font-semibold ${order.esim ? "text-emerald-600" : "text-black/30"}`}>
                {order.esim ? "✓ Yes" : "Not yet"}
              </span>
            </div>
            {order.esim && (
              <>
                <Row label="ICCID"       value={order.esim.iccid} />
                <Row label="LPA string"  value={order.esim.activationCode} />
                <Row label="eSIM status" value={order.esim.status} />
                <Row label="Activated"   value={order.esim.activatedAt ? new Date(order.esim.activatedAt).toLocaleString() : undefined} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<Order | null>(null);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) setOrders(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchOrders(); }, [statusFilter]);
  useEffect(() => { const t = setTimeout(() => fetchOrders(), 350); return () => clearTimeout(t); }, [search]);

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
  const fmtAmt = (a: string | number) => `$${Number(a).toFixed(2)}`;

  return (
    <>
      <AnimatePresence>
        {detail && <DetailModal key="modal" order={detail} onClose={() => setDetail(null)} onRefresh={fetchOrders} />}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders, customers, emails, tx hash…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-black/5 p-1 rounded-xl flex-wrap">
              {STATUS_LABELS.map(f => (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === f ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
                  {f}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-sm text-black/50 hover:bg-black/5 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-black/5">
                  {["Order #", "Customer", "Email", "Plan", "Amount", "Method / Coin", "Status", "LPA", "Date", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-black/25 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-16">
                    <div className="flex items-center justify-center gap-2 text-black/30"><Loader2 className="w-5 h-5 animate-spin" /> Loading…</div>
                  </td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-16 text-black/30 text-sm">No orders found</td></tr>
                ) : orders.map((order, i) => {
                  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.PENDING;
                  const Icon = cfg.icon;
                  const meta = order.metadata ?? {};
                  return (
                    <motion.tr key={order.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className={`border-b border-black/[0.04] last:border-0 hover:bg-black/[0.01] transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-black">ORD-{order.id.slice(-6).toUpperCase()}</div>
                        <div className="text-[10px] text-black/30 font-mono">{order.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black truncate max-w-[120px]">{order.user.name ?? "—"}</div>
                        {(order.user.phone ?? meta.phone) && <div className="text-[10px] text-black/30">{order.user.phone ?? meta.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-black/50 truncate max-w-[160px]">{order.user.email}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-black/70 truncate max-w-[120px]">{order.plan.name}</div>
                        <div className="text-[10px] text-black/30">{order.plan.carrier.name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-black whitespace-nowrap">{fmtAmt(order.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-black/50">{order.paymentProvider.replace(/_/g, " ")}</div>
                        {order.paymentProvider === "CRYPTO" && meta.coinName && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Bitcoin className="w-2.5 h-2.5 text-amber-500" />
                            <span className="text-[10px] text-amber-600 font-medium">{meta.coinName}{meta.network ? ` · ${meta.network}` : ""}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3 h-3" />{order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                        {meta.paymentStatus && meta.paymentStatus !== order.status.toLowerCase() && (
                          <div className="text-[10px] text-black/30 mt-0.5">{meta.paymentStatus}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${order.esim ? "text-emerald-600" : "text-black/25"}`}>
                          {order.esim ? "✓" : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/40 whitespace-nowrap">{fmt(order.createdAt)}</td>
                      <td className="px-4 py-3 flex items-center gap-1">
                        <button onClick={() => setDetail(order)}
                          className="p-1.5 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <select
                          defaultValue={order.status}
                          onChange={async (e) => {
                            await fetch(`/api/admin/orders/${order.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: e.target.value }),
                            });
                            fetchOrders();
                          }}
                          className="text-xs border border-black/10 rounded-lg px-1 py-1 bg-white text-black/60 outline-none focus:border-blue-400 cursor-pointer">
                          {["PENDING","PROCESSING","ACTIVE","EXPIRED","CANCELLED","REFUNDED"].map(s => (
                            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-black/30">
          <span>Showing {orders.length} orders</span>
        </div>
      </div>
    </>
  );
}
