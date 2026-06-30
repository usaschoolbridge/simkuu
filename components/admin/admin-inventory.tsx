"use client";

import { useState, useEffect, useCallback } from "react";
import { Boxes, Upload, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

type Stock = {
  totals: { AVAILABLE: number; RESERVED: number; SOLD: number };
  perPlan: { planId: string; name: string; carrier: string; available: number; low: boolean }[];
  lowStock: { planId: string; name: string; carrier: string; available: number }[];
  threshold: number;
};

type UploadResult = { inserted: number; skippedDuplicates: number; invalidRows: number; errors: string[]; batchId: string };

const CSV_TEMPLATE = "carrier,iccid,lpaActivationString,planId,country,expiresAt\nTMOBILE,8910000000000000001,LPA:1$rsp.example.com$ABC-123,,US,";

export function AdminInventoryContent() {
  const [stock, setStock] = useState<Stock | null>(null);
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStock = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/inventory", { cache: "no-store" });
      if (r.ok) setStock(await r.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadStock(); }, [loadStock]);

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(f);
  };

  const upload = async () => {
    if (!csv.trim()) { setError("Paste CSV or choose a file first."); return; }
    setBusy(true); setError(null); setResult(null);
    try {
      const r = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Upload failed"); }
      else { setResult(data); setCsv(""); loadStock(); }
    } catch {
      setError("Upload failed — network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-black/40" />
          <h1 className="font-display text-xl font-black text-black">eSIM Inventory</h1>
        </div>
        <button onClick={loadStock} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stock totals */}
      <div className="grid grid-cols-3 gap-4">
        {([["Available", stock?.totals.AVAILABLE], ["Reserved", stock?.totals.RESERVED], ["Sold", stock?.totals.SOLD]] as const).map(([label, val]) => (
          <div key={label} className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <div className="text-xs text-black/40 uppercase tracking-wide">{label}</div>
            <div className="font-display text-3xl font-black text-black mt-1">{val ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Low stock alerts */}
      {stock && stock.lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" /> Low stock (≤ {stock.threshold} available)
          </div>
          <ul className="text-sm text-amber-700 space-y-1">
            {stock.lowStock.map((p) => (
              <li key={p.planId}>{p.carrier} · {p.name} — <strong>{p.available}</strong> left</li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-plan availability */}
      {stock && (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="px-5 py-3 border-b border-black/5 text-sm font-semibold text-black/60">Availability by plan</div>
          <table className="w-full text-sm">
            <tbody>
              {stock.perPlan.map((p) => (
                <tr key={p.planId} className="border-b border-black/[0.03] last:border-0">
                  <td className="px-5 py-2.5 text-black/40">{p.carrier}</td>
                  <td className="px-5 py-2.5 font-medium text-black">{p.name}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={p.low ? "text-amber-600 font-bold" : "text-black"}>{p.available}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk upload */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <h2 className="font-display font-bold text-black mb-1">Bulk upload</h2>
        <p className="text-xs text-black/40 mb-3">
          CSV columns: <code className="font-mono">carrier, iccid, lpaActivationString, planId, country, expiresAt</code>.
          Duplicate ICCIDs are skipped automatically.
        </p>
        <div className="flex items-center gap-3 mb-3">
          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-sm cursor-pointer hover:bg-black/5">
            <Upload className="w-4 h-4" /> Choose CSV
            <input type="file" accept=".csv,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          </label>
          <button onClick={() => setCsv(CSV_TEMPLATE)} className="text-xs text-blue-600 hover:underline">Insert template</button>
        </div>
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={6}
          placeholder={CSV_TEMPLATE}
          className="w-full font-mono text-xs p-3 rounded-xl border border-black/10 outline-none focus:border-blue-500" />
        <div className="flex items-center gap-3 mt-3">
          <button onClick={upload} disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {busy ? "Uploading…" : "Upload inventory"}
          </button>
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>

        {result && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" /> Inserted {result.inserted} · Skipped {result.skippedDuplicates} duplicates · {result.invalidRows} invalid
            </div>
            <div className="text-emerald-700/70 text-xs">Batch: {result.batchId}</div>
            {result.errors.length > 0 && (
              <ul className="mt-2 text-xs text-amber-700 list-disc pl-4">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
