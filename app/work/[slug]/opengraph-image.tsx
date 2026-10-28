import { ImageResponse } from "next/og";
import { caseStudies, getCaseStudy } from "@/lib/work";

export const alt = "Case study by Selvin PaulRaj K";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function CaseStudyOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const study = getCaseStudy((await params).slug);
  const title = study?.title ?? "Case study";
  const subtitle = study?.subtitle ?? "";
  const metrics = (study?.results ?? []).slice(0, 3);

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
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a1a1aa" }}>
          <span>Case study · Selvin PaulRaj K</span>
          <span style={{ color: "#f5c518" }}>{study?.visibility ?? ""}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#a1a1aa", lineHeight: 1.35, maxWidth: 1000 }}>
            {subtitle.length > 150 ? `${subtitle.slice(0, 147)}…` : subtitle}
          </div>
        </div>

        <div style={{ display: "flex", gap: 56 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 320 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: "#f5c518" }}>{m.value}</span>
              <span style={{ fontSize: 20, color: "#a1a1aa" }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
