import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { report } from "@/lib/evalsSummary";

export const alt = "Ask Selvin: grounded Q&A over the portfolio with cited answers";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Tool | Ask Selvin",
    title: "Ask Selvin",
    kicker: "Questions answered only from this portfolio, every claim cited.",
    figure: { value: String(report.corpusDocs), label: "portfolio snippets indexed for BM25 retrieval" },
  });
}
