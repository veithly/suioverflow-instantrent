import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InstantRent — rent that streams every second";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(120% 90% at 90% 10%, #082f49 0%, #0b1220 55%, #020617 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="80" height="80" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="28" r="20" fill="none" stroke="#38bdf8" strokeWidth="3.2"/>
            <line x1="32" y1="10" x2="32" y2="14" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round"/>
            <line x1="32" y1="42" x2="32" y2="46" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round"/>
            <line x1="14" y1="28" x2="18" y2="28" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round"/>
            <line x1="46" y1="28" x2="50" y2="28" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round"/>
            <line x1="32" y1="28" x2="44" y2="18.5" stroke="#f472b6" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="32" cy="28" r="3" fill="#f472b6"/>
            <path d="M 12 56 L 50 56" stroke="#f472b6" strokeWidth="2.6" strokeLinecap="round"/>
          </svg>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1.5 }}>InstantRent</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98 }}>
            Rent that streams
          </div>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -2.5, lineHeight: 0.98, color: "#38bdf8" }}>
            every second.
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", maxWidth: 920 }}>
            Landlords sell the next 12 months for cash today. Tenants pay in seconds. Both verified on Sui.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", fontSize: 22 }}>
          <div style={{ display: "flex", gap: 32 }}>
            <span>· Sui Testnet</span>
            <span>· Mysten dApp Kit</span>
            <span>· Streaming USDC</span>
          </div>
          <div style={{ fontFamily: "monospace", color: "#f472b6" }}>instantrent.app</div>
        </div>
      </div>
    ),
    size,
  );
}
