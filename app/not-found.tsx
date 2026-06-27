import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you were looking for doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      {/* Glowing 404 */}
      <div className="relative mb-8 select-none">
        <span
          className="text-[160px] font-black leading-none tracking-tighter"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </span>
        {/* Glow */}
        <div
          className="absolute inset-0 blur-3xl opacity-20 -z-10"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        />
      </div>

      <h1 className="text-2xl font-bold text-black mb-2 text-center">
        Page not found
      </h1>
      <p className="text-black/50 text-center max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-black/80 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-black/10 font-semibold text-black hover:bg-black/5 transition-colors"
        >
          View plans
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-12 text-center">
        <p className="text-sm text-black/30 mb-4">Popular pages</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { label: "T-Mobile eSIM", href: "/t-mobile" },
            { label: "Verizon eSIM", href: "/verizon" },
            { label: "AT&T eSIM", href: "/att" },
            { label: "MVNO eSIM", href: "/t-mobile-mvno" },
            { label: "FAQ", href: "/faq" },
            { label: "Contact", href: "/contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg bg-black/5 text-black/60 text-sm hover:bg-black/8 hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
