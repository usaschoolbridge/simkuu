"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Loader2, CheckCircle, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verifyOtp = useCallback(async (code: string) => {
    if (!email) { setError("Email address is missing. Please sign up again."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), otp: code }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Verification failed. Please try again.");
        setOtp(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const next = Array(OTP_LENGTH).fill("");
      digits.forEach((d, i) => { next[i] = d; });
      setOtp(next);
      setError(null);
      const lastIdx = Math.min(digits.length - 1, OTP_LENGTH - 1);
      inputRefs.current[lastIdx]?.focus();
      if (digits.length === OTP_LENGTH) verifyOtp(digits.join(""));
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError(null);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    // Auto-submit when all filled
    if (next.every((d) => d !== "") && digit) verifyOtp(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      verifyOtp(pasted);
    }
  };

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Failed to resend. Please try again.");
        return;
      }
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-black text-black mb-2">Email verified!</h2>
        <p className="text-black/50 text-sm mb-2">Your account is now active. Welcome to Simkuu!</p>
        <p className="text-black/30 text-xs">Taking you to your dashboard…</p>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/signup" className="inline-flex items-center gap-1.5 text-sm text-black/40 hover:text-black transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign up
        </Link>
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
          <Mail className="w-7 h-7 text-blue-500" />
        </div>
        <h1 className="font-display text-3xl font-black text-black tracking-tight mb-2">Check your email</h1>
        <p className="text-black/50 text-sm leading-relaxed">
          We sent a 6-digit code to{" "}
          {email
            ? <span className="font-semibold text-black">{email}</span>
            : "your email address"
          }. Enter it below. Code expires in 10 minutes.
        </p>
      </div>

      {/* Email input if not in URL */}
      {!emailParam && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-black/70 mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      )}

      {/* OTP boxes */}
      <div className="mb-5">
        <div className="flex gap-2.5 justify-between" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
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
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
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
        {resending ? (
          <span className="inline-flex items-center gap-1 text-sm text-black/40">
            <Loader2 className="w-3 h-3 animate-spin" /> Sending…
          </span>
        ) : cooldown > 0 ? (
          <span className="text-sm text-black/30">Resend in {cooldown}s</span>
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
