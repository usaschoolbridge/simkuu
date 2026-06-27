"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Mail, Wifi, Download, ArrowRight, Copy, Check, QrCode } from "lucide-react";

const STEPS = [
  { icon: Mail, label: "Confirmation email sent", done: true },
  { icon: QrCode, label: "eSIM QR code generated", done: true },
  { icon: Wifi, label: "Network profile activated", done: true },
];

function QrDisplay() {
  const cells = Array.from({ length: 100 }, (_, i) => {
    return (Math.sin(i * 1.7 + 5) * Math.cos(i * 2.3 + 3) > 0.05) ||
      [0,1,2,3,4,5,6,7,8,9,10,17,18,25,26,33,34,41,42,43,44,45,46,47,48,49,
       90,91,92,93,94,95,96,97,98,99].includes(i);
  });
  return (
    <div className="w-48 h-48 bg-white border-2 border-black/10 rounded-2xl p-3 grid grid-cols-10 gap-0.5 mx-auto">
      {cells.map((f, i) => <div key={i} className={`rounded-[1px] ${f ? "bg-black" : "bg-transparent"}`} />)}
    </div>
  );
}

export function SuccessPage() {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const copyCode = () => {
    navigator.clipboard.writeText("LPA:1$consumer.iot-safe.com$ABCD-1234-EFGH-5678");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wifi className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-black text-base text-black">Simkuu</span>
          </Link>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Payment confirmed
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg text-center">
          {/* Success checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="font-display text-3xl font-black text-black mb-2">You&apos;re all set! 🎉</h1>
            <p className="text-black/50 mb-8">Your T-Mobile Unlimited eSIM is ready to activate. Check your email for the confirmation.</p>
          </motion.div>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 mb-5 text-left">
            <div className="space-y-3 mb-5">
              {STEPS.map((step, i) => (
                <motion.div key={step.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-black">{step.label}</span>
                </motion.div>
              ))}
            </div>

            {/* QR Code */}
            <div className="border-t border-black/5 pt-5">
              <p className="text-xs text-black/40 text-center mb-4">Scan this QR code in your phone&apos;s Settings → Mobile Data → Add eSIM</p>
              <QrDisplay />
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-black/[0.03] border border-black/5 rounded-xl px-3 py-2">
                  <code className="text-xs font-mono text-black/60 break-all">LPA:1$consumer.iot-safe.com$ABCD-1234-EFGH-5678</code>
                </div>
                <button onClick={copyCode} className="p-2.5 rounded-xl border border-black/10 hover:bg-black/5 transition-colors text-black/30">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* How to activate */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-2">How to activate (2 min)</p>
            <ol className="space-y-1.5 text-sm text-blue-700/80">
              {[
                "Open Settings → Mobile Data → Add eSIM",
                "Tap \"Use QR Code\" and scan the code above",
                "Label it \"T-Mobile\" and set as primary data line",
                "Restart your phone — you're connected on 5G!",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-blue-500 flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex gap-3">
            <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all shadow-md shadow-black/10">
              Go to dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">
              <Download className="w-4 h-4" /> Save QR
            </button>
          </motion.div>

          <p className="mt-4 text-xs text-black/30">
            Order ID: <code className="font-mono">ORD-8942</code> · Sent to alex@example.com
          </p>
        </div>
      </div>
    </div>
  );
}
