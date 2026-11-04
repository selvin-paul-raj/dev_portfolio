// Client-side model for /ask: turn state, kind labels, follow-up questions, and markdown export.
import type { IconType } from "react-icons";
import { LuAward, LuBadgeCheck, LuBriefcase, LuFileText, LuFolderGit2, LuGraduationCap, LuLayers, LuUser } from "react-icons/lu";
import type { AskMeta, AskResult } from "@/lib/ask/answer";
import type { Doc } from "@/lib/ask/retrieve";
import { FOCUS } from "@/components/tools/styles";

export type Kind = Doc["kind"];
export type Citation = AskResult["citations"][number];

export interface Turn {
  id: string;
  question: string;
  status: "pending" | "streaming" | "done" | "error";
  meta?: AskMeta;
  /** Text streamed so far; replaced by result.answer once validated. */
  draft?: string;
  result?: AskResult;
  error?: string;
}

export const MAX_CHARS = 500;
export const COUNTER_FROM = 400;

export const SUGGESTIONS = [
  "What did Selvin build at Zinnov (Draup)?",
  "Has he built MCP servers?",
  "How does he evaluate LLM systems?",
  "What retrieval experience does he have?",
];

export const CHIP = `rounded-full border border-line px-3.5 py-2 text-left text-sm text-fg-2 transition-colors duration-150
 hover:border-line-strong hover:bg-surface-3 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`;

export const KINDS: Record<Kind, { label: string; Icon: IconType }> = {
  profile: { label: "Profile", Icon: LuUser },
  work: { label: "Work", Icon: LuBriefcase },
  education: { label: "Education", Icon: LuGraduationCap },
  project: { label: "Project", Icon: LuFolderGit2 },
  certification: { label: "Certification", Icon: LuBadgeCheck },
  award: { label: "Award", Icon: LuAward },
  publication: { label: "Publication", Icon: LuFileText },
  skills: { label: "Skills", Icon: LuLayers },
};

export const isExternal = (url: string) => /^https?:\/\//.test(url);

/** "ChunkLab (work project, private)" or "ChunkLab: Step" becomes "ChunkLab". */
function projectName(title: string): string {
  return title
    .replace(/ \((?:work|personal) project, private\)$/, "")
    .replace(/ — case study$/, "")
    .split(": ")[0];
}

/** Experience titles read "Role · Company (start – end)". */
function companyOf(title: string): string | undefined {
  return title.match(/ · (.+?) \(/)?.[1];
}

function candidatesFor(c: Citation): string[] {
  switch (c.kind) {
    case "project": {
      const name = projectName(c.title);
      return [`What stack did ${name} use?`, `What problem did ${name} solve?`];
    }
    case "work": {
      const company = companyOf(c.title);
      return company ? [`What did Selvin do at ${company}?`] : [];
    }
    case "education":
      return ["Where did Selvin study?"];
    case "certification":
      return ["Which certifications does Selvin hold?"];
    case "award":
      return ["What awards has Selvin won?"];
    case "publication":
      return ["What research has Selvin published?"];
    case "skills":
      return [`Which projects use ${c.title.replace(/^Skills — /, "")}?`];
    case "profile":
      return ["What roles is Selvin open to?"];
  }
}

/** Two or three follow-ups from what the answer cited, skipping anything already asked. */
export function followUps(result: AskResult, asked: string[]): string[] {
  const seen = new Set(asked.map((q) => q.toLowerCase()));
  const lists = result.citations.map(candidatesFor);
  const out: string[] = [];
  for (let round = 0; round < 2; round++) {
    for (const q of lists.map((l) => l[round]).filter(Boolean)) {
      if (out.length < 3 && !seen.has(q.toLowerCase())) {
        seen.add(q.toLowerCase());
        out.push(q);
      }
    }
  }
  return out;
}

/** The answer plus its sources as markdown, with on-site links made absolute. */
export function toMarkdown(result: AskResult): string {
  const abs = (url: string) => (isExternal(url) ? url : `${window.location.origin}${url}`);
  const sources = result.citations.map((c) => `[${c.n}] [${c.title}](${abs(c.url)})`);
  return sources.length ? `${result.answer}\n\nSources:\n${sources.join("\n")}` : result.answer;
}

export const sourceId = (turnId: string, n: number) => `ask-${turnId}-source-${n}`;
