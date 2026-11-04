import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { evalTotals, report } from "@/lib/evalsSummary";

export const alt = "AI feature evals: retrieval, refusal and fit accuracy, failures included";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const { passed, total } = evalTotals();
  return ogCard({
    eyebrow: "Evals | measured case by case",
    title: "AI Feature Evals",
    kicker: `Retrieval MRR ${report.retrieval.mrr} | refusal, safety gate, fit accuracy`,
    figure: { value: `${passed}/${total}`, label: "eval cases passing, failures published" },
  });
}
