"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Boxes, Upload, AlertTriangle, CheckCircle2, Loader2,
  RefreshCw, Download, FileText, ToggleLeft, ToggleRight,
  QrCode, Type, Image as ImageIcon, X, Eye, Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stock = {
  totals: { AVAILABLE: number; RESERVED: number; SOLD: number };
  perPlan: { planId: string; name: string; carrier: string; available: number; low: boolean }[];
  lowStock: { planId: string; name: string; carrier: string; available: number }[];
  threshold: number;
  autoCarrierStatus?: Record<string, boolean>;
};

type ChunkResult = {
  inserted: number; failed: number; total: number; batchId: string;
  errors: string[]; failedCsv: string | null; chunk: number; totalChunks: number;
};

type Plan = { id: string; name: string; carrierId: string };
type CarrierStatusMap = Record<string, boolean>;

type Carrier = "TMOBILE" | "VERIZON" | "ATT" | "MVNO";
const CARRIERS: { id: Carrier; label: string }[] = [
  { id: "TMOBILE", label: "T-Mobile" },
  { id: "VERIZON", label: "Verizon" },
  { id: "ATT", label: "AT&T" },
  { id: "MVNO", label: "MVNO" },
];

const CHUNK_SIZE = 50; // rows per request — keeps each request under 10s

// ─── CSV Template ──────────────────────────────────────────────────────────────
// ICCID is optional — if blank, system auto-generates a unique ID.
const CSV_TEMPLATE = `carrier,iccid,lpaActivationString,planId,country,expiresAt
TMOBILE,,"LPA:1$rsp.example.com$ABC-123-DEF",,US,
VERIZON,,"LPA:1$rsp.example.com$DEF-456-GHI",,US,
ATT,,"LPA:1$rsp.example.com$GHI-789-JKL",,US,`;

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminInventoryContent() {
  const [stock, setStock] = useState<Stock | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [carrierStatus, setCarrierStatus] = useState<CarrierStatusMap>({});
  const [togglingCarrier, setTogglingCarrier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bulk" | "single">("bulk");
  const [stockBusy, setStockBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setStockBusy(true);
    try {
      const [stockRes, plansRes, statusRes] = await Promise.all([
        fetch("/api/admin/inventory", { cache: "no-store" }),
        fetch("/api/admin/plans", { cache: "no-store" }),
        fetch("/api/admin/inventory/carrier-status", { cache: "no-store" }),
      ]);
      if (stockRes.ok) {
        const d = await stockRes.json();
        setStock(d);
        // Sync auto carrier status if manual override not set
        if (d.autoCarrierStatus) {
          setCarrierStatus((prev) => {
            const merged: CarrierStatusMap = { ...d.autoCarrierStatus };
            // Keep any manually-set overrides from the persistent store
            Object.keys(prev).forEach((k) => { merged[k] = prev[k]; });
            return merged;
          });
        }
      }
      if (plansRes.ok) {
        const d = await plansRes.json();
        setPlans(Array.isArray(d) ? d : (d.plans ?? []));
      }
      if (statusRes.ok) {
        const d = await statusRes.json();
        setCarrierStatus(d.carrierStatus ?? {});
      }
    } finally {
      setStockBusy(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleCarrier = async (carrierId: string, currentlyOut: boolean) => {
    setTogglingCarrier(carrierId);
    try {
      const r = await fetch("/api/admin/inventory/carrier-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier: carrierId, outOfStock: !currentlyOut }),
      });
      if (r.ok) {
        const d = await r.json();
        setCarrierStatus(d.carrierStatus ?? {});
      }
    } finally {
      setTogglingCarrier(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-black/40" />
          <h1 className="font-display text-xl font-black text-black">eSIM Inventory</h1>
        </div>
        <button
          onClick={loadAll}
          disabled={stockBusy}
          className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${stockBusy ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stock totals — live from DB */}
      <div className="grid grid-cols-3 gap-4">
        {(["AVAILABLE", "RESERVED", "SOLD"] as const).map((s) => (
          <div key={s} className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <div className="text-xs text-black/40 uppercase tracking-wide">{s.charAt(0) + s.slice(1).toLowerCase()}</div>
            <div className="font-display text-3xl font-black text-black mt-1">
              {stock ? stock.totals[s] : "—"}
            </div>
            <div className="text-xs text-black/30 mt-1">live from database</div>
          </div>
        ))}
      </div>

      {/* Carrier Status — auto + manual override */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <h2 className="font-display font-bold text-black mb-1">Carrier Availability</h2>
        <p className="text-xs text-black/40 mb-4">
          Status is auto-detected from inventory. Toggle manually to override.
          A carrier is automatically marked Out of Stock when all its plans reach 0 available eSIMs.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARRIERS.map(({ id, label }) => {
            const isOut = carrierStatus[id] === true;
            const autoOut = stock?.autoCarrierStatus?.[id] === true;
            const loading = togglingCarrier === id;
            return (
              <button
                key={id}
                onClick={() => toggleCarrier(id, isOut)}
                disabled={loading}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  isOut ? "border-red-300 bg-red-50" : "border-emerald-300 bg-emerald-50"
                } disabled:opacity-50`}>
                <div>
                  <div className="font-semibold text-sm text-black">{label}</div>
                  <div className={`text-xs font-medium mt-0.5 ${isOut ? "text-red-600" : "text-emerald-600"}`}>
                    {isOut ? "Out of Stock" : "In Stock"}
                  </div>
                  {autoOut && !isOut && (
                    <div className="text-xs text-amber-500 mt-0.5">auto: empty</div>
                  )}
                </div>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-black/40" />
                ) : isOut ? (
                  <ToggleLeft className="w-6 h-6 text-red-500" />
                ) : (
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
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

      {/* Per-plan availability — live counts from InventoryItem table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="px-5 py-3 border-b border-black/5 flex items-center justify-between">
          <span className="text-sm font-semibold text-black/60">Availability by Plan</span>
          <span className="text-xs text-black/30 flex items-center gap-1">
            <Info className="w-3 h-3" /> Live from database · status = AVAILABLE only
          </span>
        </div>
        {stock && stock.perPlan.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {stock.perPlan.map((p) => (
                <tr key={p.planId} className="border-b border-black/[0.03] last:border-0">
                  <td className="px-5 py-2.5 text-black/40 w-24">{p.carrier}</td>
                  <td className="px-5 py-2.5 font-medium text-black">{p.name}</td>
                  <td className="px-5 py-2.5 text-right">
                    {p.available === 0 ? (
                      <span className="text-red-500 font-bold">0 — Out of Stock</span>
                    ) : p.low ? (
                      <span className="text-amber-600 font-bold">{p.available} — Low</span>
                    ) : (
                      <span className="text-emerald-600 font-semibold">{p.available}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-black/30">
            No inventory uploaded yet. Use the upload tools below to add eSIMs.
          </div>
        )}
      </div>

      {/* Upload Tabs */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="flex border-b border-black/[0.06]">
          {([
            { key: "bulk", label: "Bulk Upload (CSV)", icon: <FileText className="w-4 h-4" /> },
            { key: "single", label: "Add Single eSIM", icon: <QrCode className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-black text-black"
                  : "text-black/40 hover:text-black/70"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "bulk" && <BulkUpload plans={plans} onSuccess={loadAll} />}
          {activeTab === "single" && <SingleEsimUpload plans={plans} onSuccess={loadAll} />}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Upload ──────────────────────────────────────────────────────────────

function BulkUpload({ plans, onSuccess }: { plans: Plan[]; onSuccess: () => void }) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [aggregated, setAggregated] = useState<{
    inserted: number; failed: number; total: number;
    errors: string[]; failedCsvs: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  void plans;

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "simkuu-inventory-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadFailedCsv(base64: string) {
    const bytes = atob(base64);
    const blob = new Blob([bytes], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "simkuu-failed-rows.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(f);
  };

  /** Parse CSV header + rows in the browser (mirrors server parser for row count) */
  function splitCsvToChunks(raw: string): Record<string, string>[][] {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0];
    const dataLines = lines.slice(1);
    const chunks: Record<string, string>[][] = [];
    for (let i = 0; i < dataLines.length; i += CHUNK_SIZE) {
      const slice = dataLines.slice(i, i + CHUNK_SIZE);
      // Re-attach header so server can parse normally
      const chunkCsv = [header, ...slice].join("\n");
      chunks.push([{ __rawChunk: chunkCsv }]);
    }
    return chunks;
  }

  const upload = async () => {
    if (!csv.trim()) { setError("Paste CSV or choose a file first."); return; }
    setBusy(true); setError(null); setAggregated(null);

    // Split into header + data lines, then chunk
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) { setError("CSV must have a header row and at least one data row."); setBusy(false); return; }
    const header = lines[0];
    const dataLines = lines.slice(1);
    const totalChunks = Math.ceil(dataLines.length / CHUNK_SIZE);

    let totalInserted = 0, totalFailed = 0, totalRows = 0;
    const allErrors: string[] = [];
    const allFailedCsvs: string[] = [];

    setProgress({ done: 0, total: totalChunks });

    for (let c = 0; c < totalChunks; c++) {
      const slice = dataLines.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
      const chunkCsv = [header, ...slice].join("\n");

      try {
        const r = await fetch("/api/admin/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: chunkCsv, chunk: c + 1, totalChunks }),
        });

        let data: ChunkResult;
        try {
          data = await r.json();
        } catch {
          allErrors.push(`Chunk ${c + 1}: Server returned invalid response`);
          setProgress({ done: c + 1, total: totalChunks });
          continue;
        }

        if (!r.ok) {
          allErrors.push(`Chunk ${c + 1}: Upload failed`);
        } else {
          totalInserted += data.inserted ?? 0;
          totalFailed += data.failed ?? 0;
          totalRows += data.total ?? 0;
          if (data.errors) allErrors.push(...data.errors);
          if (data.failedCsv) allFailedCsvs.push(data.failedCsv);
        }
      } catch {
        allErrors.push(`Chunk ${c + 1}: Network error — check your connection`);
      }

      setProgress({ done: c + 1, total: totalChunks });
    }

    setAggregated({ inserted: totalInserted, failed: totalFailed, total: totalRows, errors: allErrors, failedCsvs: allFailedCsvs });
    if (totalInserted > 0) { setCsv(""); onSuccess(); }
    setBusy(false);
    setProgress(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-black">Bulk Upload via CSV</h2>
          <p className="text-xs text-black/40 mt-0.5 max-w-lg">
            Required: <code className="font-mono bg-black/5 px-1 rounded">carrier</code> (TMOBILE / VERIZON / ATT / MVNO) and{" "}
            <code className="font-mono bg-black/5 px-1 rounded">lpaActivationString</code>.{" "}
            <strong>ICCID is optional</strong> — leave blank and the system auto-generates one.
            Large files are uploaded in chunks of {CHUNK_SIZE} rows automatically.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 text-xs font-medium text-black/60 hover:bg-black/5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Template
          </button>
          <button onClick={() => setCsv(CSV_TEMPLATE)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 text-xs font-medium text-black/60 hover:bg-black/5 transition-colors">
            <FileText className="w-3.5 h-3.5" /> Sample
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging ? "border-blue-400 bg-blue-50" : "border-black/10 hover:border-blue-300 hover:bg-black/[0.01]"
        }`}>
        <Upload className="w-6 h-6 text-black/30 mx-auto mb-2" />
        <p className="text-sm text-black/50">Drag & drop a CSV file, or <span className="text-blue-600 font-medium">click to browse</span></p>
        <p className="text-xs text-black/30 mt-1">Works with 10, 100, or 1,000+ rows</p>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>

      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={7}
        placeholder={CSV_TEMPLATE}
        className="w-full font-mono text-xs p-3 rounded-xl border border-black/10 outline-none focus:border-blue-500 resize-y" />

      {/* Progress bar */}
      {progress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-black/50">
            <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading chunk {progress.done} of {progress.total}…</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-black/5 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={upload} disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-60 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? "Uploading…" : "Import inventory"}
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      {aggregated && (
        <div className={`rounded-xl border p-4 text-sm ${
          aggregated.inserted === 0 && aggregated.failed > 0
            ? "border-red-200 bg-red-50"
            : aggregated.failed > 0
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
        }`}>
          <div className="flex items-center gap-2 font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-emerald-700">{aggregated.inserted} inserted</span>
            {aggregated.failed > 0 && <span className="text-red-600">· {aggregated.failed} failed</span>}
            <span className="text-black/40 font-normal">· {aggregated.total} total rows</span>
          </div>
          {aggregated.errors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-black/50 mb-1">Failure reasons:</p>
              <ul className="text-xs text-red-700 list-disc pl-4 space-y-0.5 max-h-40 overflow-y-auto">
                {aggregated.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {aggregated.failedCsvs.length > 0 && (
            <button
              onClick={() => downloadFailedCsv(aggregated.failedCsvs[0])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-300 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download failed rows CSV
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Single eSIM Upload ───────────────────────────────────────────────────────

function SingleEsimUpload({ plans, onSuccess }: { plans: Plan[]; onSuccess: () => void }) {
  const [method, setMethod] = useState<"lpa" | "qr">("lpa");
  const [carrier, setCarrier] = useState<Carrier>("TMOBILE");
  const [iccid, setIccid] = useState("");
  const [lpa, setLpa] = useState("");
  const [planId, setPlanId] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<{ iccid: string; autoIccid: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // QR decode state
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null); // original QR image to store
  const [decodedLpa, setDecodedLpa] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setIccid(""); setLpa(""); setConfirmationCode("");
    setQrFile(null); setQrPreview(null); setQrDataUrl(null); setDecodedLpa(null);
    setDecodeError(null); setError(null); setSuccess(null);
  };

  const decodeQrImage = async (file: File) => {
    setDecoding(true); setDecodeError(null); setDecodedLpa(null);
    const url = URL.createObjectURL(file);
    setQrPreview(url);

    // Convert file to base64 data URL for storage
    const reader = new FileReader();
    reader.onload = () => setQrDataUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);

    try {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { default: jsQR } = await import("jsqr");
      const code = jsQR(data, width, height);
      if (!code) {
        setDecodeError("Could not decode QR code. Try a clearer image or paste the LPA string manually below.");
      } else {
        setDecodedLpa(code.data);
        setLpa(code.data);
      }
    } catch {
      setDecodeError("Failed to read image. Please try again.");
    } finally {
      setDecoding(false);
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new window.Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });

  const submit = async () => {
    const lpaToSend = method === "qr" ? (decodedLpa ?? lpa) : lpa;
    if (!lpaToSend.trim()) { setError("LPA Activation String is required (or upload a QR image to decode it automatically)"); return; }

    setBusy(true); setError(null); setSuccess(null);
    try {
      const r = await fetch("/api/admin/inventory/esim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier,
          iccid: iccid.trim() || null, // null = auto-generate
          lpaActivationString: lpaToSend.trim(),
          planId: planId || null,
          confirmationCode: confirmationCode || null,
          // For QR uploads: send the original image so customer receives exactly what was uploaded
          qrCodeDataUrl: method === "qr" ? qrDataUrl : null,
        }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Failed to add eSIM");
      else {
        setSuccess({ iccid: data.iccid, autoIccid: data.autoIccid });
        reset();
        onSuccess();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-black mb-1">Add Single eSIM</h2>
        <p className="text-xs text-black/40">
          ICCID is <strong>optional</strong> — leave blank and the system assigns a unique ID automatically.
        </p>
      </div>

      {/* Method picker */}
      <div className="flex gap-3 flex-wrap">
        {([
          { key: "lpa", label: "Enter LPA String", icon: <Type className="w-4 h-4" /> },
          { key: "qr", label: "Upload QR Image", icon: <ImageIcon className="w-4 h-4" /> },
        ] as const).map((m) => (
          <button key={m.key} onClick={() => { setMethod(m.key); reset(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              method === m.key ? "border-black bg-black text-white" : "border-black/10 text-black/60 hover:border-black/30"
            }`}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">Carrier *</label>
          <select value={carrier} onChange={(e) => setCarrier(e.target.value as Carrier)}
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 bg-white">
            {CARRIERS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">
            ICCID <span className="text-black/30 font-normal">(optional — auto-generated if blank)</span>
          </label>
          <input value={iccid} onChange={(e) => setIccid(e.target.value)}
            placeholder="Leave blank to auto-generate"
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 font-mono placeholder:font-sans" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">Plan <span className="text-black/30 font-normal">(optional)</span></label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 bg-white">
            <option value="">No plan assigned</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.carrierId} · {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">Confirmation Code <span className="text-black/30 font-normal">(optional)</span></label>
          <input value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder="e.g. 12345678"
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 font-mono" />
        </div>
      </div>

      {/* LPA method */}
      {method === "lpa" && (
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">LPA Activation String *</label>
          <input value={lpa} onChange={(e) => setLpa(e.target.value)}
            placeholder="LPA:1$rsp.example.com$ACTIVATION-CODE"
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 font-mono" />
          <p className="text-xs text-black/30 mt-1">A QR code is automatically generated from this string and sent to the customer.</p>
        </div>
      )}

      {/* QR image method */}
      {method === "qr" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-black/60 mb-1">QR Code Image *</label>
            <div
              onClick={() => qrFileRef.current?.click()}
              className="border-2 border-dashed border-black/10 hover:border-blue-300 rounded-xl p-6 text-center cursor-pointer transition-colors">
              <QrCode className="w-6 h-6 text-black/30 mx-auto mb-2" />
              <p className="text-sm text-black/50">Click to upload QR image <span className="text-black/30">(PNG / JPG / WEBP)</span></p>
              <p className="text-xs text-black/30 mt-1">LPA string is decoded automatically. Original image is stored and sent to customer.</p>
              <input ref={qrFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setQrFile(f); decodeQrImage(f); } }} />
            </div>
          </div>

          {decoding && (
            <div className="flex items-center gap-2 text-sm text-black/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Decoding QR code…
            </div>
          )}

          {qrPreview && !decoding && (
            <div className="flex items-start gap-4 p-3 rounded-xl bg-black/[0.02] border border-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPreview} alt="QR preview" className="w-20 h-20 rounded-lg border border-black/10 object-contain bg-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {decodedLpa && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-2">
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
                      <Eye className="w-3.5 h-3.5" /> Decoded successfully
                    </div>
                    <p className="font-mono text-xs text-emerald-800 break-all">{decodedLpa}</p>
                  </div>
                )}
                {decodeError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-2">
                    <p className="text-xs text-amber-700">{decodeError}</p>
                  </div>
                )}
                <p className="text-xs text-black/40">Original QR image will be stored and delivered to the customer exactly as uploaded.</p>
              </div>
              <button onClick={() => { setQrFile(null); setQrPreview(null); setQrDataUrl(null); setDecodedLpa(null); setDecodeError(null); }}
                className="p-1.5 rounded-lg hover:bg-black/5 flex-shrink-0">
                <X className="w-4 h-4 text-black/40" />
              </button>
            </div>
          )}

          {/* Manual LPA fallback if decode failed */}
          {(decodeError || (qrFile && !decodedLpa && !decoding)) && (
            <div>
              <label className="block text-xs font-semibold text-black/60 mb-1">LPA String <span className="text-black/30">(paste manually if decode failed)</span></label>
              <input value={lpa} onChange={(e) => setLpa(e.target.value)}
                placeholder="LPA:1$rsp.example.com$ACTIVATION-CODE"
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 font-mono" />
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1 flex-wrap">
        <button onClick={submit} disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-60 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? "Saving…" : "Add eSIM"}
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
        {success && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            eSIM added · ICCID: <code className="font-mono text-xs">{success.iccid}</code>
            {success.autoIccid && <span className="text-xs text-black/30">(auto-generated)</span>}
          </span>
        )}
      </div>
    </div>
  );
}
