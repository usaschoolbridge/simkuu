import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wifi, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled — Simkuu",
  robots: { index: false, follow: false },
};

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wifi className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-black text-base text-black">Simkuu</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
            <ArrowLeft className="w-8 h-8 text-black/30" />
          </div>
          <h1 className="font-display text-3xl font-black text-black mb-3">Payment cancelled</h1>
          <p className="text-black/50 mb-8">No worries — your order was not placed and no charge was made.</p>

          <div className="flex flex-col gap-3">
            <Link href="/checkout"
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all shadow-md shadow-black/10">
              Try again
            </Link>
            <Link href="/plans"
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">
              Browse plans
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700">
            <HelpCircle className="w-4 h-4 inline mr-1.5" />
            Having trouble? <Link href="/contact" className="font-semibold underline">Contact support</Link> — we respond in under 2 hours.
          </div>
        </div>
      </div>
    </div>
  );
}
