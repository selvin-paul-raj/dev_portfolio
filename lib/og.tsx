// Shared 1200x630 social card for the tool and work pages, in the site's look:
// dark ground, gold accent. ImageResponse renders with its bundled Geist by default.
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const GOLD = "#f5c518";
const MUTED = "#a1a1aa";

interface OgCardInput {
  /** Small label above the title, e.g. "Tool". */
  eyebrow: string;
  title: string;
  /** One line under the title. */
  kicker: string;
  /** A real headline figure taken from the site's data. */
  figure: { value: string; label: string };
}

export function ogCard({ eyebrow, title, kicker, figure }: OgCardInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "#09090b",
          color: "#ededee",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <span>{eyebrow}</span>
          <span>selvinpaulraj.vercel.app</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 32, color: MUTED, lineHeight: 1.35, maxWidth: 1000 }}>{kicker}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 64, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{figure.value}</span>
            <span style={{ fontSize: 24, color: MUTED }}>{figure.label}</span>
          </div>
          <span style={{ fontSize: 26, color: "#d4d4d8" }}>Selvin PaulRaj K</span>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
