"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FlaskConical, Loader2, RefreshCw, Trash2, Send, Repeat, Search,
  ShieldAlert, CheckCircle2, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";

interface WebhookEvt {
  id: string;
  paymentId: string;
  orderId: string | null;
  mode: string;
  status: string | null;
  payload: unknown;
  sigValid: boolean;
  isDuplicate: boolean;
  replayOf: string | null;
  processedAt: string | null;
  createdAt: string;
}

interface PaymentLog {
  id: string;
  paymentId: string | null;
  orderId: string | null;
  mode: string;
  event: string;
  status: string | null;
  payload: unknown;
  error: string | null;
  createdAt: string;
}

interface ListData {
  mode: string;
  sandboxEnabled: boolean;
  statuses: string[];
  events: WebhookEvt[];
  logs: PaymentLog[];
}

const STATUS_COLOR: Record<string, string> = {
  finished: "text-emerald-700 bg-emerald-50 border-emerald-200",
  confirmed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  sending: "text-emerald-700 bg-emerald-50 border-emerald-200",
  confirming: "text-amber-700 bg-amber-50 border-amber-200",
  waiting: "text-blue-700 bg-blue-50 border-blue-200",
  partially_paid: "text-amber-700 bg-amber-50 border-amber-200",
  failed: "text-red-700 bg-red-50 border-red-200",
  expired: "text-red-700 bg-red-50 border-red-200",
  refunded: "text-red-700 bg-red-50 border-red-200",
};

function fmtTime(s: string) {
  return new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AdminPaymentTesting() {
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"events" | "logs">("events");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  // Simulate form
  const [simOrderId, setSimOrderId] = useState("");
  const [simStatus, setSimStatus] = useState("finished");
  const [simFactor, setSimFactor] = useState("1");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const r = await fetch(`/api/admin/payment-testing?${params}`, { cache: "no-store" });
      if (r.ok) setData(await r.json());
      else setFlash({ kind: "err", msg: (await r.json()).error ?? "Failed to load" });
    } catch { setFlash({ kind: "err", msg: "Network error" }); }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 5000);
    return () => clearTimeout(t);
  }, [flash]);

  async function simulate() {
    if (!simOrderId.trim()) { setFlash({ kind: "err", msg: "Enter an Order ID or Wallet Tx ID" }); return; }
    setBusy("simulate");
    try {
      const r = await fetch("/api/admin/payment-testing/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: simOrderId.trim(),
          status: simStatus,
          paidFactor: parseFloat(simFactor) || undefined,
        }),
      });
      const j = await r.json();
      if (r.ok) {
        setFlash({ kind: "ok", msg: `Simulated "${simStatus}" → webhook ${j.webhookHttpStatus}` });
        load();
      } else setFlash({ kind: "err", msg: j.error ?? "Simulation failed" });
    } catch { setFlash({ kind: "err", msg: "Network error" }); }
    finally { setBusy(null); }
  }

  async function replay(eventId: string) {
    setBusy(eventId);
    try {
      const r = await fetch("/api/admin/payment-testing/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const j = await r.json();
      if (r.ok) { setFlash({ kind: "ok", msg: `Replayed → webhook ${j.webhookHttpStatus}` }); load(); }
      else setFlash({ kind: "err", msg: j.error ?? "Replay failed" });
    } catch { setFlash({ kind: "err", msg: "Network error" }); }
    finally { setBusy(null); }
  }

  async function wipeSandbox() {
    if (!confirm("Delete ALL sandbox webhook events and payment logs? Production data is not affected.")) return;
    setBusy("wipe");
    try {
      const r = await fetch("/api/admin/payment-testing", { method: "DELETE" });
      const j = await r.json();
      if (r.ok) { setFlash({ kind: "ok", msg: `Deleted ${j.deletedEvents} events, ${j.deletedLogs} logs` }); load(); }
      else setFlash({ kind: "err", msg: j.error ?? "Cleanup failed" });
    } catch { setFlash({ kind: "err", msg: "Network error" }); }
    finally { setBusy(null); }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-black/30">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading payment testing data…
      </div>
    );
  }

  const sandbox = data?.sandboxEnabled ?? false;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Payment testing</h1>
            <p className="text-sm text-black/50">NOWPayments sandbox — simulate, inspect, and replay webhooks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${sandbox ? "text-violet-700 bg-violet-50 border-violet-200" : "text-red-700 bg-red-50 border-red-200"}`}>
            {sandbox ? "SANDBOX MODE" : "PRODUCTION MODE"}
          </span>
          <button onClick={load} className="p-2 rounded-lg border border-black/10 hover:bg-black/5" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {flash && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${flash.kind === "ok" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-700 bg-red-50 border-red-200"}`}>
          {flash.kind === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {flash.msg}
        </div>
      )}

      {!sandbox && (
        <div className="flex items-start gap-3 px-4 py-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Production mode active — testing tools are disabled</p>
            <p className="mt-1 text-amber-700">Set <code className="font-mono bg-amber-100 px-1 rounded">NOWPAYMENTS_MODE=sandbox</code> in your environment and restart to enable payment simulation, replay, and cleanup. Logs below are read-only.</p>
          </div>
        </div>
      )}

      {/* Simulate panel */}
      {sandbox && (
        <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Send className="w-4 h-4 text-violet-600" /> Simulate a payment status</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_120px_auto]">
            <input
              value={simOrderId}
              onChange={(e) => setSimOrderId(e.target.value)}
              placeholder="Order ID or Wallet Tx ID"
              className="h-10 px-3 rounded-lg border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <select value={simStatus} onChange={(e) => setSimStatus(e.target.value)} className="h-10 px-3 rounded-lg border border-black/15 text-sm bg-white">
              {(data?.statuses ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              value={simFactor}
              onChange={(e) => setSimFactor(e.target.value)}
              placeholder="Paid ×"
              title="Paid factor: 1 = exact, 0.5 = underpay, 1.2 = overpay"
              className="h-10 px-3 rounded-lg border border-black/15 text-sm"
            />
            <button
              onClick={simulate}
              disabled={busy === "simulate"}
              className="h-10 px-5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
            >
              {busy === "simulate" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send webhook
            </button>
          </div>
          <p className="text-xs text-black/40">
            Paid factor scales <code className="font-mono">actually_paid</code>: 1 = exact, 0.5 = underpayment, 1.2 = overpayment. Statuses finished/confirmed/sending trigger fulfillment; failed/expired/refunded cancel the order.
          </p>
        </div>
      )}

      {/* Filters + tabs */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-black/10 overflow-hidden">
          <button onClick={() => setTab("events")} className={`px-4 py-2 text-sm ${tab === "events" ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}>
            Webhook events ({data?.events.length ?? 0})
          </button>
          <button onClick={() => setTab("logs")} className={`px-4 py-2 text-sm ${tab === "logs" ? "bg-black text-white" : "bg-white hover:bg-black/5"}`}>
            Payment logs ({data?.logs.length ?? 0})
          </button>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search order ID / payment ID"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-black/15 text-sm"
          />
        </div>
        {tab === "events" && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-black/15 text-sm bg-white">
            <option value="all">All statuses</option>
            {(data?.statuses ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {sandbox && (
          <button
            onClick={wipeSandbox}
            disabled={busy === "wipe"}
            className="h-9 px-4 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 flex items-center gap-2 ml-auto"
          >
            {busy === "wipe" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete sandbox data
          </button>
        )}
      </div>

      {/* Events list */}
      {tab === "events" && (
        <div className="rounded-2xl border border-black/10 bg-white divide-y divide-black/5">
          {(data?.events ?? []).length === 0 && (
            <p className="p-8 text-center text-sm text-black/40">No webhook events yet. Simulate one above or complete a sandbox checkout.</p>
          )}
          {(data?.events ?? []).map((e) => (
            <div key={e.id} className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLOR[e.status ?? ""] ?? "text-black/60 bg-black/5 border-black/10"}`}>
                  {e.status ?? "unknown"}
                </span>
                <span className="text-sm font-mono text-black/70">pay: {e.paymentId}</span>
                {e.orderId && <span className="text-sm font-mono text-black/50">order: {e.orderId}</span>}
                {e.isDuplicate && <span className="text-xs px-2 py-0.5 rounded bg-black/5 text-black/50">duplicate</span>}
                {e.replayOf && <span className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-200">replay</span>}
                <span className="text-xs text-black/40 ml-auto">{fmtTime(e.createdAt)}</span>
                {sandbox && (
                  <button
                    onClick={() => replay(e.id)}
                    disabled={busy === e.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 flex items-center gap-1.5"
                  >
                    {busy === e.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Repeat className="w-3 h-3" />}
                    Replay
                  </button>
                )}
                <button onClick={() => setExpanded(expanded === e.id ? null : e.id)} className="p-1.5 rounded hover:bg-black/5">
                  {expanded === e.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              {expanded === e.id && (
                <pre className="mt-3 p-3 rounded-lg bg-black/[0.03] border border-black/5 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(e.payload, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Logs list */}
      {tab === "logs" && (
        <div className="rounded-2xl border border-black/10 bg-white divide-y divide-black/5">
          {(data?.logs ?? []).length === 0 && (
            <p className="p-8 text-center text-sm text-black/40">No payment logs yet.</p>
          )}
          {(data?.logs ?? []).map((l) => (
            <div key={l.id} className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/5 text-black/70">{l.event}</span>
                {l.status && <span className="text-xs text-black/50">{l.status}</span>}
                {l.paymentId && <span className="text-sm font-mono text-black/60">pay: {l.paymentId}</span>}
                {l.orderId && <span className="text-sm font-mono text-black/40">order: {l.orderId}</span>}
                {l.error && <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">{l.error}</span>}
                <span className="text-xs text-black/40 ml-auto">{fmtTime(l.createdAt)}</span>
                {l.payload != null && (
                  <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="p-1.5 rounded hover:bg-black/5">
                    {expanded === l.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {expanded === l.id && (
                <pre className="mt-3 p-3 rounded-lg bg-black/[0.03] border border-black/5 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(l.payload, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
