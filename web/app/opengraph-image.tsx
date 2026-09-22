import { ImageResponse } from "next/og";

export const alt = "Todu - Help is one tap away";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#07090c",
          color: "#f2f5f8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <path
              d="M32 9 13 17.4v14.3c0 11.8 7.9 21.3 19 25.8 11.1-4.5 19-14 19-25.8V17.4Z"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            <path d="M32 23v11.5" stroke="#2dd4bf" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="32" cy="42.5" r="2.8" fill="#2dd4bf" />
          </svg>
          <div style={{ fontSize: 44, fontWeight: 700 }}>Todu</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            One tap. Your people know where you are.
          </div>
          <div style={{ fontSize: 32, color: "#9aa7b6" }}>
            Live location, a direct line to 112, and a fallback ladder for when the network fails.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#2dd4bf" }}>
          <span>English</span>
          <span>తెలుగు</span>
          {/* Anusvara spelling: the OG renderer cannot shape the न्द conjunct. */}
          <span>हिंदी</span>
        </div>
      </div>
    ),
    size,
  );
}
