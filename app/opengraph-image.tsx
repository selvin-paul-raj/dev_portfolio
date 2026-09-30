import { ImageResponse } from "next/og";

export const alt = "Selvin PaulRaj K — AI Engineer building AI agents, MCP servers, and RAG systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGS = ["LangGraph", "MCP", "RAG", "Multi-Agent Systems", "FastAPI"];

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
          padding: "72px 80px",
          background: "#09090b",
          color: "#ededee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a1a1aa" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#22c55e" }} />
          Chennai, India · selvinpaulraj.vercel.app
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>
            Selvin&nbsp;<span style={{ color: "#71717a" }}>PaulRaj K</span>
          </div>
          <div style={{ display: "flex", fontSize: 40, color: "#FFD700" }}>
            AI Engineer — Agentic Systems &amp; MCP
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", maxWidth: 960, lineHeight: 1.4 }}>
            Built a LangGraph multi-agent system that turns plain-English requests into validated SQL
            reports — hours to under a minute.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {TAGS.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.05)",
                color: "#d4d4d8",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
