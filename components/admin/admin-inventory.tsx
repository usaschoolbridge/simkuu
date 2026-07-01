"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Boxes, Upload, AlertTriangle, CheckCircle2, Loader2,
  RefreshCw, Download, FileText, ToggleLeft, ToggleRight,
  QrCode, Type, Image as ImageIcon, X, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stock = {
  totals: { AVAILABLE: number; RESERVED: number; SOLD: number };
  perPlan: { planId: string; name: string; carrier: string; available: number; low: boolean }[];
  lowStock: { planId: string; name: string; carrier: string; available: number }[];
  threshold: number;
};

type UploadResult = {
  inserted: number; failed: number; total: number; batchId: string;
  errors: string[]; failedCsv: string | null;
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

// ─── CSV Template ──────────────────────────────────────────────────────────────

const CSV_TEMPLATE = `carrier,iccid,lpaActivationString,planId,country,expiresAt
TMOBILE,8910000000000000001,"LPA:1$rsp.example.com$ABC-123",,US,
VERIZON,8910000000000000002,"LPA:1$rsp.example.com$DEF-456",,US,
ATT,8910000000000000003,"LPA:1$rsp.example.com$GHI-789",,US,`;

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
      if (stockRes.ok) setStock(await stockRes.json());
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

      {/* Stock totals */}
      <div className="grid grid-cols-3 gap-4">
        {(["AVAILABLE", "RESERVED", "SOLD"] as const).map((s) => (
          <div key={s} className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <div className="text-xs text-black/40 uppercase tracking-wide">{s.charAt(0) + s.slice(1).toLowerCase()}</div>
            <div className="font-display text-3xl font-black text-black mt-1">
              {stock?.totals[s] ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {/* Carrier Status Toggles */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <h2 className="font-display font-bold text-black mb-1">Carrier Availability</h2>
        <p className="text-xs text-black/40 mb-4">
          Mark a carrier as Out of Stock to block purchases on all their plans immediately.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARRIERS.map(({ id, label }) => {
            const isOut = carrierStatus[id] === true;
            const loading = togglingCarrier === id;
            return (
              <button
                key={id}
                onClick={() => toggleCarrier(id, isOut)}
                disabled={loading}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  isOut
                    ? "border-red-300 bg-red-50"
                    : "border-emerald-300 bg-emerald-50"
                } disabled:opacity-50`}>
                <div>
                  <div className="font-semibold text-sm text-black">{label}</div>
                  <div className={`text-xs font-medium mt-0.5 ${isOut ? "text-red-600" : "text-emerald-600"}`}>
                    {isOut ? "Out of Stock" : "In Stock"}
                  </div>
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

      {/* Per-plan availability */}
      {stock && stock.perPlan.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="px-5 py-3 border-b border-black/5 text-sm font-semibold text-black/60">
            Availability by plan
          </div>
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
          {activeTab === "bulk" && (
            <BulkUpload plans={plans} onSuccess={loadAll} />
          )}
          {activeTab === "single" && (
            <SingleEsimUpload plans={plans} onSuccess={loadAll} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Upload ──────────────────────────────────────────────────────────────

function BulkUpload({ plans, onSuccess }: { plans: Plan[]; onSuccess: () => void }) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  void plans; // plans available for future plan-select UI

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "simkuu-inventory-template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadFailedCsv(base64: string) {
    const bytes = atob(base64);
    const blob = new Blob([bytes], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "simkuu-failed-rows.csv"; a.click();
    URL.revokeObjectURL(url);
  }

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
      if (!r.ok) setError(data.error ?? "Upload failed");
      else { setResult(data); setCsv(""); onSuccess(); }
    } catch {
      setError("Upload failed — network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-black">Bulk Upload</h2>
          <p className="text-xs text-black/40 mt-0.5">
            Required columns: <code className="font-mono bg-black/5 px-1 rounded">carrier</code>{" "}
            (TMOBILE / VERIZON / ATT / MVNO),{" "}
            <code className="font-mono bg-black/5 px-1 rounded">iccid</code>,{" "}
            <code className="font-mono bg-black/5 px-1 rounded">lpaActivationString</code>.{" "}
            Quote fields containing commas. QR codes auto-generated per row.
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
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>

      <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={7}
        placeholder={CSV_TEMPLATE}
        className="w-full font-mono text-xs p-3 rounded-xl border border-black/10 outline-none focus:border-blue-500 resize-y" />

      <div className="flex items-center gap-3">
        <button onClick={upload} disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-60 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? "Uploading & generating QR codes…" : "Import inventory"}
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      {result && (
        <div className={`rounded-xl border p-4 text-sm ${result.failed > 0 && result.inserted === 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
          <div className={`flex items-center gap-2 font-semibold mb-2 ${result.failed > 0 && result.inserted === 0 ? "text-red-700" : "text-emerald-700"}`}>
            <CheckCircle2 className="w-4 h-4" />
            {result.inserted} inserted · {result.failed} failed · {result.total} total
          </div>
          <div className="text-xs text-black/40 mb-2">Batch: {result.batchId}</div>
          {result.errors.length > 0 && (
            <ul className="text-xs text-amber-700 list-disc pl-4 space-y-0.5 mb-3">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          {result.failedCsv && (
            <button
              onClick={() => downloadFailedCsv(result.failedCsv!)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors">
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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR image decode state
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [decodedLpa, setDecodedLpa] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setIccid(""); setLpa(""); setConfirmationCode("");
    setQrFile(null); setQrPreview(null); setDecodedLpa(null);
    setDecodeError(null); setError(null); setSuccess(false);
  };

  const decodeQrImage = async (file: File) => {
    setDecoding(true); setDecodeError(null); setDecodedLpa(null);
    const url = URL.createObjectURL(file);
    setQrPreview(url);
    try {
      // Draw to canvas and read pixels
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Dynamic import jsqr
      const { default: jsQR } = await import("jsqr");
      const code = jsQR(data, width, height);
      if (!code) {
        setDecodeError("Could not decode QR code from this image. Try a clearer photo or paste the LPA string manually.");
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
    if (!iccid.trim()) { setError("ICCID is required"); return; }
    const lpaToSend = method === "qr" ? (decodedLpa ?? lpa) : lpa;
    if (!lpaToSend.trim()) { setError("LPA Activation String is required"); return; }

    setBusy(true); setError(null); setSuccess(false);
    try {
      const r = await fetch("/api/admin/inventory/esim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier, iccid: iccid.trim(), lpaActivationString: lpaToSend.trim(),
          planId: planId || null, confirmationCode: confirmationCode || null,
        }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Failed to add eSIM");
      else { setSuccess(true); reset(); onSuccess(); }
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
        <p className="text-xs text-black/40">Choose your input method below.</p>
      </div>

      {/* Method picker */}
      <div className="flex gap-3">
        {([
          { key: "lpa", label: "LPA Activation String", icon: <Type className="w-4 h-4" /> },
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
          <label className="block text-xs font-semibold text-black/60 mb-1">ICCID *</label>
          <input value={iccid} onChange={(e) => setIccid(e.target.value)}
            placeholder="89100000000000000XX"
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 font-mono" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">Plan (optional)</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 bg-white">
            <option value="">No plan assigned</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.carrierId} · {p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black/60 mb-1">Confirmation Code (optional)</label>
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
          <p className="text-xs text-black/30 mt-1">A QR code will be automatically generated from this string.</p>
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
              <p className="text-sm text-black/50">Click to upload QR image (PNG / JPG / WEBP)</p>
              <input ref={qrFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setQrFile(f); decodeQrImage(f); } }} />
            </div>
          </div>

          {decoding && (
            <div className="flex items-center gap-2 text-sm text-black/50">
              <Loader2 className="w-4 h-4 animate-spin" /> Decoding QR code…
            </div>
          )}

          {qrPreview && (
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPreview} alt="QR preview" className="w-24 h-24 rounded-xl border border-black/10 object-contain bg-white" />
              <div className="flex-1 min-w-0">
                {decodedLpa && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
                      <Eye className="w-3.5 h-3.5" /> Decoded LPA string
                    </div>
                    <p className="font-mono text-xs text-emerald-800 break-all">{decodedLpa}</p>
                  </div>
                )}
                {decodeError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600">{decodeError}</p>
                    <p className="text-xs text-black/40 mt-1">You can paste the LPA string manually below.</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setQrFile(null); setQrPreview(null); setDecodedLpa(null); setDecodeError(null); }}
                className="p-1.5 rounded-lg hover:bg-black/5">
                <X className="w-4 h-4 text-black/40" />
              </button>
            </div>
          )}

          {/* Manual LPA override if decode failed */}
          {(decodeError || (qrFile && !decodedLpa && !decoding)) && (
            <div>
              <label className="block text-xs font-semibold text-black/60 mb-1">LPA String (manual entry)</label>
              <input value={lpa} onChange={(e) => setLpa(e.target.value)}
                placeholder="LPA:1$rsp.example.com$ACTIVATION-CODE"
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 font-mono" />
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={submit} disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-60 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {busy ? "Saving…" : "Add eSIM"}
        </button>
        {error && <span className="text-sm text-red-500">{error}</span>}
        {success && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4" /> eSIM added successfully
          </span>
        )}
      </div>
    </div>
  );
}
