import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { REQUIREMENT_COUNT } from "@/lib/fit/matchJob";

export const alt = "Role fit check: paste a job description, every match cited";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Tool | Role fit check",
    title: "Role fit check",
    kicker: "Paste a job description. Every match cites the work behind it; gaps are listed.",
    figure: { value: `~${REQUIREMENT_COUNT}`, label: "requirements checked, no LLM" },
  });
}
