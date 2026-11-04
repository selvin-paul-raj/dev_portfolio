import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Prompt injection challenge: five stacked LLM defenses";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogCard({
    eyebrow: "Challenge | prompt injection",
    title: "Break my guardrails",
    kicker: "A model guards a password. Each level stacks one more production defense.",
    figure: { value: "5", label: "defense levels" },
  });
}
