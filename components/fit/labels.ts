import { PRIORITY_WEIGHT, STRENGTH_WEIGHT, VERDICT_THRESHOLDS } from "@/lib/fit/matchJob";
import type { Priority, Strength } from "@/lib/fit/matchJob";

export const STRENGTH_LABEL: Record<Strength, string> = {
  production: "Production work",
  project: "Shipped project",
  certified: "Certified",
};

export const PRIORITY_LABEL: Record<Priority, string> = { must: "Must have", nice: "Nice to have" };

/** Pill colours per strength, all through tokens. */
export const STRENGTH_PILL: Record<Strength, string> = {
  production: "border-ok/30 bg-ok/10 text-ok",
  project: "border-accent/40 bg-accent/10 text-accent-fg",
  certified: "border-line-strong bg-fg/5 text-fg-2",
};

/** Fill colour per strength in the score bar. */
export const STRENGTH_FILL: Record<Strength, string> = {
  production: "bg-ok",
  project: "bg-accent",
  certified: "bg-info",
};

/** DOM id of a requirement's card, shared by the highlighted JD and the report. */
export const reqId = (requirement: string) =>
  `fit-req-${requirement.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export const askHref = (requirement: string) =>
  `/ask?q=${encodeURIComponent(`Does Selvin have experience with ${requirement}?`)}`;

export function scoringExplainer(): string {
  const { strong, good, partial } = VERDICT_THRESHOLDS;
  return (
    `Each requirement found in the JD gets an equal share of 100 points, and a nice-to-have gets ${PRIORITY_WEIGHT.nice} of a share. ` +
    `Production work earns the full share, a shipped project ${STRENGTH_WEIGHT.project}, a certification ${STRENGTH_WEIGHT.certified}, and a gap nothing. ` +
    `${strong} and up reads as a strong fit, ${good} good, ${partial} partial.`
  );
}
