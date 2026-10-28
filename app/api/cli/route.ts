// app/api/cli/route.ts
// What `curl selvinpaulraj.vercel.app` returns (next.config.js rewrites "/" here
// for curl/wget/HTTPie user agents): an ANSI-coloured resume card built from
// lib/data, so the terminal view never drifts from the site.
import projectsData from "@/lib/data/projects.json";
import experiencesData from "@/lib/data/experiences.json";
import { PROFILE } from "@/lib/mcp/definitions";

export const dynamic = "force-static";
export const revalidate = 86400;

const ESC = "\x1b[";
const gold = (s: string) => `${ESC}38;5;220m${s}${ESC}0m`;
const bold = (s: string) => `${ESC}1m${s}${ESC}0m`;
const dim = (s: string) => `${ESC}2m${s}${ESC}0m`;

const WIDTH = 76;

function wrap(text: string, indent: string): string {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if ((line + " " + word).trim().length > WIDTH - indent.length) {
      out.push(indent + line.trim());
      line = word;
    } else {
      line += " " + word;
    }
  }
  if (line.trim()) out.push(indent + line.trim());
  return out.join("\n");
}

export function GET() {
  const current = [...experiencesData].sort((a, b) => a.order - b.order).find((e) => e.icon === "work");
  const highlights = (current?.description ?? "")
    .split(/\n+/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter((l) => l && !/^stack:/i.test(l))
    .slice(0, 3);
  const featured = projectsData
    .filter((p) => p.show && p.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);

  const rule = dim("─".repeat(WIDTH));
  const lines = [
    "",
    `  ${bold(PROFILE.name)}  ${dim("·")}  ${gold("AI Engineer")}  ${dim("·")}  ${PROFILE.location}`,
    `  ${dim(`${PROFILE.currentRole}, ${PROFILE.currentCompany}`)}`,
    `  ${gold("●")} Open to: ${PROFILE.openTo.join(", ")}`,
    "",
    rule,
    `  ${bold("Now")}`,
    ...highlights.map((h) => wrap(h, "    ").replace(/^ {4}/, "  - ")),
    "",
    `  ${bold("Selected work")}`,
    ...featured.map((p) => `  ${gold("▸")} ${p.title}${p.private ? dim("  (work, private)") : ""}`),
    "",
    rule,
    `  ${bold("Links")}`,
    `  web      ${PROFILE.portfolio}`,
    `  github   ${PROFILE.github}`,
    `  linkedin ${PROFILE.linkedin}`,
    `  email    ${PROFILE.email}`,
    `  resume   ${PROFILE.resumeUrl}`,
    "",
    `  ${bold("For agents")}`,
    `  ${dim("$")} curl -s ${PROFILE.portfolio}/resume.json`,
    `  ${dim("$")} curl -s -H 'Accept: text/markdown' ${PROFILE.portfolio}`,
    `  ${dim("mcp")}  ${PROFILE.mcpEndpoint}`,
    `  ${dim("a2a")}  ${PROFILE.a2aAgentCard}`,
    "",
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
