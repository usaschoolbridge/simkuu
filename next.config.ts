import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Compiler optimizations ──────────────────────────────────────────────────
  compiler: {
    // Remove console.log in production (keep warn/error)
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["warn", "error"] } : false,
  },

  // ── Image optimization ──────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Add approved image domains here, e.g.:
      // { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // ── Headers for security + caching ─────────────────────────────────────────
  async headers() {
    return [
      {
        // Static assets — long cache
        source: "/(fonts|icons|images)/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // OG image — cache 1 hour, stale-while-revalidate
        source: "/og",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        // Security headers on all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // ── Experimental features ───────────────────────────────────────────────────
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },

  // ── Redirects ───────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Legacy carrier slug aliases
      { source: "/tmobile", destination: "/t-mobile", permanent: true },
      { source: "/mvno", destination: "/t-mobile-mvno", permanent: true },
      // Old buy flow → checkout
      { source: "/plans/:slug/buy", destination: "/checkout?plan=:slug", permanent: false },
    ];
  },
};

export default nextConfig;
