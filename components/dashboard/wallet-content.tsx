"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, DollarSign,
  Zap, Loader2, AlertCircle, Copy, Check, X, RefreshCw, Bitcoin, CheckCircle2,
} from "lucide-react";
import QRCode from "qrcode";

const TOP_UP_AMOUNTS = [10, 25, 50, 100];

const CRYPTO_OPTIONS = [
  { code: "btc",        symbol: "BTC",       name: "Bitcoin" },
  { code: "eth",        symbol: "ETH",       name: "Ethereum" },
  { code: "usdttrc20",  symbol: "USDT TRC20",name: "USDT (TRC20)" },
  { code: "usdterc20",  symbol: "USDT ERC20",name: "USDT (ERC20)" },
  { code: "usdc",       symbol: "USDC",      name: "USD Coin" },
  { code: "ltc",        symbol: "LTC",       name: "Litecoin" },
  { code: "sol",        symbol: "SOL",       name: "Solana" },
  { code: "trx",        symbol: "TRX",       name: "TRON" },
];

interface WalletTx {
  id: string; type: string; amount: number; balanceAfter: number;
  description: string; status: string; createdAt: string;
}

interface WalletData {
  balance: number;
  stats: { totalTopup: number; totalSpent: number; totalReferral: number };
  transactions: WalletTx[];
}

interface TopupPayment {
  txId: string;
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  coinName: string;
  network: string;
  qrData: string;
  payinExtraId: string | null;
  expiresAt: string | null;
}

function typeIcon(type: string) {
  switch (type) {
    case "TOPUP":           return { Icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-50" };
    case "PURCHASE":        return { Icon: ArrowUpRight,  color: "text-red-400",     bg: "bg-red-50" };
    case "REFERRAL_REWARD": return { Icon: Zap,           color: "text-purple-500",  bg: "bg-purple-50" };
    case "REFUND":          return { Icon: ArrowDownLeft, color: "text-blue-500",    bg: "bg-blue-50" };
    default:                return { Icon: DollarSign,    color: "text-black/40",    bg: "bg-black/5" };
  }
}

function isCredit(type: string) {
  return ["TOPUP", "REFERRAL_REWARD", "REFUND", "MANUAL_ADJUSTMENT"].includes(type);
}

export function WalletContent() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("usdttrc20");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [payment, setPayment] = useState<TopupPayment | null>(null);
  const [copied, setCopied] = useState<"address" | "amount" | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const finalAmount = custom ? parseFloat(custom) || 0 : topUpAmount;
  const coinMeta = CRYPTO_OPTIONS.find((c) => c.code === selectedCoin) ?? CRYPTO_OPTIONS[2];

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/dashboard/wallet");
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-clean expired PENDING transactions on mount (older than 2h)
  useEffect(() => {
    fetch("/api/dashboard/wallet/cleanup", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  // Generate QR code whenever payment changes
  useEffect(() => {
    if (!payment?.qrData) { setQrDataUrl(null); return; }
    QRCode.toDataURL(payment.qrData, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl).catch((e) => {
      console.error("[wallet] QR generation failed:", e);
      setQrDataUrl(null);
    });
  }, [payment]);

  // Poll every 12s while a payment is pending to auto-refresh balance
  useEffect(() => {
    if (!payment) return;
    const t = setInterval(async () => {
      const r = await fetch("/api/dashboard/wallet");
      if (!r.ok) return;
      const d: WalletData = await r.json();
      setData(d);
      const tx = d.transactions.find((item) => item.id === payment.txId);
      if (tx?.status === "COMPLETED") { setPayment(null); }
    }, 12000);
    return () => clearInterval(t);
  }, [payment]);

  async function handleTopup() {
    if (finalAmount < 5)    { setPayError("Minimum top-up is $5"); return; }
    if (finalAmount > 1000) { setPayError("Maximum top-up is $1,000"); return; }
    setPaying(true); setPayError("");
    try {
      const r = await fetch("/api/dashboard/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, payCurrency: selectedCoin }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Payment creation failed");
      setPayment(d as TopupPayment);
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : "Failed — please try again");
    } finally {
      setPaying(false);
    }
  }

  function copy(type: "address" | "amount") {
    if (!payment) return;
    const text = type === "address" ? payment.payAddress : String(payment.payAmount);
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-2 text-black/30">
      <Loader2 className="w-6 h-6 animate-spin" /> Loading wallet…
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 text-white shadow-xl shadow-blue-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5 text-white/70" />
            <span className="text-white/70 text-sm font-medium">Wallet Balance</span>
          </div>
          <div className="font-display text-5xl font-black mb-1">${(data?.balance ?? 0).toFixed(2)}</div>
          <p className="text-white/50 text-sm">Available credits · No expiry</p>
          <div className="mt-6">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-white/90 transition-colors shadow-md">
              <Plus className="w-4 h-4" /> Add funds below
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-up panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <h3 className="font-display font-bold text-base text-black mb-4">Add funds via Crypto</h3>

          <AnimatePresence mode="wait">
            {payment ? (
              <motion.div key="pay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-black">Send {payment.coinName} · ${finalAmount.toFixed(2)}</span>
                  <button onClick={() => setPayment(null)} className="p-1 rounded-lg hover:bg-black/5 text-black/30">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  {qrDataUrl ? (
                    <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="Payment QR Code" width={160} height={160} className="rounded-lg" />
                    </div>
                  ) : (
                    <div className="w-[186px] h-[186px] rounded-2xl border border-black/10 flex items-center justify-center bg-black/[0.02]">
                      <Loader2 className="w-6 h-6 text-black/20 animate-spin" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-black/40 text-center">
                  Scan QR or copy the address below. Send exactly the amount shown.
                </p>

                {/* Network */}
                <div className="text-xs text-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium w-fit mx-auto">
                  Network: {payment.network}
                </div>

                {/* Memo/Tag if needed */}
                {payment.payinExtraId && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-xs font-bold text-amber-700 mb-1">⚠ MEMO / TAG REQUIRED</p>
                    <code className="text-xs text-amber-800 font-mono">{payment.payinExtraId}</code>
                    <p className="text-xs text-amber-600 mt-1">You MUST include this memo/tag or your payment will be lost.</p>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label className="text-xs text-black/40 font-medium mb-1 block">Payment address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5 font-mono break-all">
                      {payment.payAddress}
                    </code>
                    <button onClick={() => copy("address")} className="p-2.5 rounded-xl bg-black text-white hover:bg-black/80 transition-colors flex-shrink-0">
                      {copied === "address" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs text-black/40 font-medium mb-1 block">Exact amount to send</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/[0.03] border border-black/10 rounded-xl px-3 py-2.5">
                      <span className="text-sm font-bold font-mono">{payment.payAmount} {payment.payCurrency.toUpperCase()}</span>
                    </div>
                    <button onClick={() => copy("amount")} className="p-2.5 rounded-xl border border-black/10 hover:bg-black/5 transition-colors flex-shrink-0">
                      {copied === "amount" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-black/40" />}
                    </button>
                  </div>
                </div>

                {/* Waiting status */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
                  <span className="text-xs text-amber-700">Waiting for blockchain confirmation — page auto-updates every 12 seconds.</span>
                </div>

                {payment.expiresAt && (
                  <p className="text-xs text-black/30 text-center">
                    Payment window expires: {new Date(payment.expiresAt).toLocaleTimeString()}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Amount presets */}
                <div className="grid grid-cols-4 gap-2">
                  {TOP_UP_AMOUNTS.map((amt) => (
                    <button key={amt} onClick={() => { setTopUpAmount(amt); setCustom(""); }}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        topUpAmount === amt && !custom ? "bg-black text-white border-black" : "border-black/10 text-black/60 hover:border-black/30"
                      }`}>
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30 text-sm">$</span>
                  <input type="number" value={custom}
                    onChange={(e) => { setCustom(e.target.value); setTopUpAmount(0); }}
                    placeholder="Custom amount (min $5)" min="5" max="1000"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>

                {/* Coin selector */}
                <div>
                  <label className="text-xs text-black/40 font-medium mb-1.5 block">Pay with cryptocurrency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CRYPTO_OPTIONS.map((coin) => (
                      <button key={coin.code} onClick={() => setSelectedCoin(coin.code)}
                        className={`px-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          selectedCoin === coin.code ? "border-blue-500 bg-blue-50 text-blue-700" : "border-black/10 text-black/60 hover:border-black/30"
                        }`}>
                        {coin.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {payError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{payError}
                  </div>
                )}

                <button onClick={handleTopup} disabled={paying || finalAmount < 5}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  {paying
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating payment…</>
                    : <><Bitcoin className="w-4 h-4" /> Pay ${finalAmount > 0 ? finalAmount.toFixed(2) : "—"} with {coinMeta.symbol}</>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
          {[
            { Icon: DollarSign,    label: "Total topped up",         value: `$${(data?.stats.totalTopup ?? 0).toFixed(2)}`,   color: "text-blue-600",   bg: "bg-blue-50" },
            { Icon: ArrowDownLeft, label: "Total spent from wallet",  value: `$${(data?.stats.totalSpent ?? 0).toFixed(2)}`,   color: "text-purple-600", bg: "bg-purple-50" },
            { Icon: Zap,           label: "Referral credits earned",  value: `$${(data?.stats.totalReferral ?? 0).toFixed(2)}`, color: "text-emerald-600",bg: "bg-emerald-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.Icon className={`w-5 h-5 ${s.color}`} />
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
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-black">Transaction history</h3>
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        {!data?.transactions.length ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Wallet className="w-8 h-8 text-black/10" />
            <p className="text-sm text-black/30">No transactions yet.</p>
            <p className="text-xs text-black/20">Top up your wallet to get started.</p>
          </div>
        ) : (
          data.transactions.map((tx, i) => {
            const { Icon, color, bg } = typeIcon(tx.type);
            const credit = isCredit(tx.type);
            return (
              <div key={tx.id}
                className={`flex items-center gap-4 px-5 py-4 ${i < data.transactions.length - 1 ? "border-b border-black/5" : ""} hover:bg-black/[0.01] transition-colors`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{tx.description}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-black/30">{tx.createdAt}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      tx.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" :
                      tx.status === "PENDING"   ? "bg-amber-50 text-amber-600"   : "bg-red-50 text-red-500"
                    }`}>{tx.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${credit ? "text-emerald-600" : "text-black"}`}>
                    {credit ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-black/30">Bal: ${tx.balanceAfter.toFixed(2)}</div>
                </div>
                {tx.status === "PENDING"   && <Loader2      className="w-4 h-4 text-amber-400 animate-spin ml-1 flex-shrink-0" />}
                {tx.status === "COMPLETED" && credit && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1 flex-shrink-0" />}
              </div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
