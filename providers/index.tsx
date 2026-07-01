"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { CurrencyProvider } from "@/contexts/currency";

// ---- TanStack Query ----
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ---- Lenis Smooth Scroll ----
const LenisContext = createContext<{ lenis: Lenis | null }>({ lenis: null });

export function useLenis() {
  return useContext(LenisContext);
}

function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // Disable Lenis on dashboard & admin routes — they use their own overflow-y-auto
  // inner scroll container. Lenis intercepts wheel events on window and starves the
  // inner div of scroll when it has no natural body scroll to hand back.
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  useEffect(() => {
    if (isDashboard) {
      // Destroy any existing instance when navigating into dashboard
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isDashboard]);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
}

// ---- Cursor Glow ----
function CursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      cursor.style.left = `${curX}px`;
      cursor.style.top = `${curY}px`;
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: 400,
        height: 400,
        background:
          "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        transition: "opacity 0.3s ease",
      }}
    />
  );
}

// ---- Root Provider ----
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <LenisProvider>
          <CursorGlow />
          {children}
        </LenisProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
