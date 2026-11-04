// Share links, sample loading and the Markdown export for the /fit report.
// The JD travels in the URL hash (never sent to a server), deflated with the
// browser's CompressionStream and base64url-encoded.

import type { FitReport } from "@/lib/fit/matchJob";
import { PRIORITY_LABEL, STRENGTH_LABEL, scoringExplainer } from "./labels";

const HASH_KEY = "jd=";

async function streamBytes(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodeJd(jd: string): Promise<string> {
  const bytes = await streamBytes(new Blob([jd]).stream().pipeThrough(new CompressionStream("deflate-raw")));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function decodeJd(encoded: string): Promise<string> {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0));
  return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
}

export async function shareUrl(jd: string): Promise<string> {
  return `${window.location.origin}/fit#${HASH_KEY}${await encodeJd(jd)}`;
}

export type InitialJd = { jd: string } | { error: string } | null;

/** Reads `#jd=` (a shared report) or `?sample=` (a golden eval case, looked up in `samples`) from the current URL. */
export async function readInitialJd(location: Location, samples: Record<string, string>): Promise<InitialJd> {
  const hash = location.hash.slice(1);
  if (hash.startsWith(HASH_KEY)) {
    try {
      return { jd: await decodeJd(hash.slice(HASH_KEY.length)) };
    } catch (err) {
      console.warn("fit: could not decode shared JD", err);
      return { error: "That share link could not be read. It may have been cut off when it was copied." };
    }
  }
  const sample = new URLSearchParams(location.search).get("sample");
  if (!sample) return null;
  const name = Object.keys(samples).find((n) => n.toLowerCase() === sample.toLowerCase());
  return name ? { jd: samples[name] } : { error: `There is no sample called "${sample}".` };
}

const pts = (n: number) => (Math.round(n * 10) / 10).toString();

/** A plain Markdown version of the report for pasting into notes or an ATS. */
export function reportMarkdown(report: FitReport, origin: string): string {
  const lines = [
    "# Role fit report: Selvin PaulRaj K",
    "",
    `**Score ${report.score}/100.** ${report.verdict}`,
    "",
    "## Backed by evidence",
  ];
  if (report.matched.length === 0) lines.push("", "None.");
  for (const m of report.matched) {
    lines.push("", `- **${m.requirement}** (${PRIORITY_LABEL[m.priority]}, ${STRENGTH_LABEL[m.strength]}, ${pts(m.points)} of ${pts(m.maxPoints)} points)`);
    for (const ev of m.evidence) lines.push(`  - ${ev.source}: ${ev.text}${ev.url ? ` (${ev.url})` : ""}`);
  }
  lines.push("", "## No evidence yet");
  if (report.gapDetails.length === 0) lines.push("", "None.");
  for (const g of report.gapDetails) lines.push(`- ${g.requirement} (${PRIORITY_LABEL[g.priority]})`);
  lines.push("", "## How it is scored", "", scoringExplainer(), "", report.method, "", `Run it yourself: ${origin}/fit`);
  return lines.join("\n");
}
