import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "USA eSIM Provider";
  const sub = searchParams.get("sub") ?? "T-Mobile · Verizon · AT&T · MVNO";
  const tag = searchParams.get("tag") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#000000",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Background gradient blobs */}
        <div style={{
          position: "absolute", top: "-200px", left: "-200px",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-200px", right: "-200px",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "50%", right: "100px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Content */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", padding: "60px" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "auto" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(59,130,246,0.4)",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M1 6s2.5-3 11-3 11 3 11 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M3.5 10s2-2 8.5-2 8.5 2 8.5 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M6 14s1.5-1.5 6-1.5 6 1.5 6 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="18" r="2" fill="white" />
              </svg>
            </div>
            <span style={{ color: "white", fontSize: "24px", fontWeight: "900", letterSpacing: "-0.5px" }}>Simkuu</span>
          </div>

          {/* Tag */}
          {tag && (
            <div style={{
              display: "flex", alignItems: "center",
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "100px",
              padding: "8px 18px",
              marginBottom: "24px",
              width: "fit-content",
            }}>
              <span style={{ color: "#60a5fa", fontSize: "15px", fontWeight: "600" }}>{tag}</span>
            </div>
          )}

          {/* Title */}
          <div style={{
            fontSize: title.length > 40 ? "52px" : "64px",
            fontWeight: "900",
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: "24px",
            maxWidth: "900px",
          }}>
            {title}
          </div>

          {/* Subtitle */}
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "22px", fontWeight: "500", marginBottom: "48px" }}>
            {sub}
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {["T-Mobile", "Verizon", "AT&T", "MVNO"].map((c) => (
              <div key={c} style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}>{c}</div>
            ))}
            <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>
              simkuu.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
