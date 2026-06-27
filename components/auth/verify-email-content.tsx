"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";

const OTP_LENGTH = 6;

export function VerifyEmailContent() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (newOtp.every((d) => d !== "") && digit) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      verifyOtp(pasted);
    }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      if (code === "123456") { // Demo: any real code would be validated server-side
        setVerified(true);
      } else {
        setError("Incorrect code. Please check your email and try again.");
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendCooldown(60);
    setError(null);
    // In production: call resend email API
  };

  if (verified) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-black text-black mb-2">Email verified!</h2>
        <p className="text-black/50 text-sm mb-6">Your account is now active. Welcome to Simkuu!</p>
        <Link href="/dashboard"
          className="w-full block py-3.5 rounded-xl bg-black text-white font-semibold text-sm text-center hover:bg-black/80 transition-all shadow-md shadow-black/10">
          Go to dashboard
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/register" className="inline-flex items-center gap-1.5 text-sm text-black/40 hover:text-black transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
          <Mail className="w-7 h-7 text-blue-500" />
        </div>
        <h1 className="font-display text-3xl font-black text-black tracking-tight mb-2">Check your email</h1>
        <p className="text-black/50 text-sm">
          We sent a 6-digit verification code to your email address. Enter it below to verify your account.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2.5 justify-between" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-full aspect-square text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                ${error
                  ? "border-red-300 bg-red-50/30 text-red-600"
                  : digit
                    ? "border-blue-500 bg-blue-50/30 text-blue-700"
                    : "border-black/10 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                } disabled:opacity-50`}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 text-xs text-red-500 text-center">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        disabled={loading || otp.some((d) => !d)}
        onClick={() => verifyOtp(otp.join(""))}
        className="w-full py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-black/10 mb-4"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify email"}
      </motion.button>

      <div className="text-center">
        <span className="text-sm text-black/40">Didn&apos;t receive the code?{" "}</span>
        {resendCooldown > 0 ? (
          <span className="text-sm text-black/30">Resend in {resendCooldown}s</span>
        ) : (
          <button onClick={handleResend}
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            <RefreshCw className="w-3 h-3" /> Resend
          </button>
        )}
      </div>
    </div>
  );
}
