import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { caseStudies } from "@/lib/work";

export const alt = "AI engineering case studies by Selvin PaulRaj K";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Work | case studies",
    title: "AI Engineering Case Studies",
    kicker: "Each system walked through stage by stage, with the numbers that came out of it.",
    figure: { value: String(caseStudies.length), label: "case studies" },
  });
}
