/**
 * Simkuu — DESIGN SYSTEM
 * Single source of truth for all design tokens
 */

export const colors = {
  background: "#FFFFFF",
  foreground: "#000000",
  muted: "#F7F7F7",
  mutedForeground: "#6B7280",
  border: "#E5E7EB",
  borderLight: "rgba(0,0,0,0.06)",

  // Accent palette
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    glow: "rgba(59,130,246,0.15)",
  },
  purple: {
    400: "#A78BFA",
    500: "#8B5CF6",
    600: "#7C3AED",
    glow: "rgba(139,92,246,0.15)",
  },
  cyan: {
    400: "#22D3EE",
    500: "#06B6D4",
    glow: "rgba(6,182,212,0.15)",
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    aurora: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)",
    radial: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 70%)",
    hero: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15) 0%, transparent 100%)",
    glow: "conic-gradient(from 0deg, #3B82F6, #8B5CF6, #06B6D4, #3B82F6)",
    mesh: `
      radial-gradient(at 40% 20%, rgba(59,130,246,0.08) 0px, transparent 50%),
      radial-gradient(at 80% 0%, rgba(139,92,246,0.08) 0px, transparent 50%),
      radial-gradient(at 0% 50%, rgba(6,182,212,0.05) 0px, transparent 50%)
    `,
  },

  // Carrier brand colors
  carriers: {
    tmobile: { primary: "#E20074", light: "rgba(226,0,116,0.1)" },
    verizon: { primary: "#CD040B", light: "rgba(205,4,11,0.1)" },
    att: { primary: "#00A8E0", light: "rgba(0,168,224,0.1)" },
    mvno: { primary: "#8B5CF6", light: "rgba(139,92,246,0.1)" },
  },
} as const;

export const typography = {
  fonts: {
    sans: "var(--font-inter)",
    display: "var(--font-space-grotesk)",
    body: "var(--font-plus-jakarta)",
  },
  scale: {
    "2xs": "0.625rem",
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  },
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

export const spacing = {
  section: {
    y: "py-24 md:py-32 lg:py-40",
    x: "px-4 sm:px-6 lg:px-8",
  },
  container: "max-w-7xl mx-auto",
} as const;

export const radius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  "3xl": "1.5rem",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 16px rgba(0,0,0,0.06)",
  lg: "0 8px 40px rgba(0,0,0,0.08)",
  xl: "0 20px 80px rgba(0,0,0,0.1)",
  glow: {
    blue: "0 0 40px rgba(59,130,246,0.25), 0 0 80px rgba(59,130,246,0.1)",
    purple: "0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(139,92,246,0.1)",
    cyan: "0 0 40px rgba(6,182,212,0.25), 0 0 80px rgba(6,182,212,0.1)",
    white: "0 0 40px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.1)",
  },
  glass: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
} as const;

export const animation = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    slow: 0.5,
    slower: 0.8,
    slowest: 1.2,
  },
  ease: {
    // Premium Apple-like easing
    out: [0.16, 1, 0.3, 1],
    outBack: [0.34, 1.56, 0.64, 1],
    inOut: [0.65, 0, 0.35, 1],
    spring: { type: "spring", stiffness: 400, damping: 30 },
    springGentle: { type: "spring", stiffness: 200, damping: 25 },
    springBouncy: { type: "spring", stiffness: 500, damping: 20 },
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
