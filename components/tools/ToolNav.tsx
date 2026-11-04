/// <reference types="react/canary" />
import { ViewTransition } from "react";
import Link from "next/link";
import { LuGauge, LuMessageCircle, LuShieldAlert, LuTarget } from "react-icons/lu";
import { evalTotals } from "@/lib/evalsSummary";
import { FOCUS } from "./styles";

export type ToolId = "fit" | "ask" | "evals" | "challenge";

const { passed, total } = evalTotals();

// Each tool names what it runs on, and links to the eval suite that grades it.
const TOOLS: { id: ToolId; href: string; label: string; note: string; Icon: typeof LuTarget }[] = [
  { id: "fit", href: "/fit", label: "Fit check", note: "rules, no LLM", Icon: LuTarget },
  { id: "ask", href: "/ask", label: "Ask", note: "BM25 + cited LLM", Icon: LuMessageCircle },
  { id: "evals", href: "/evals", label: "Evals", note: `${passed}/${total} passing`, Icon: LuGauge },
  { id: "challenge", href: "/challenge", label: "Challenge", note: "5 defense levels", Icon: LuShieldAlert },
];

/** Navigation type for tab clicks; components/tools/ToolPage.tsx crossfades the tool body on it. */
export const TOOL_TAB = "tool-tab";

/**
 * The strip under each tool page's title that ties the four tools together.
 * The active highlight is one named view transition, so it morphs to the new tab on navigation.
 */
export default function ToolNav({ current }: { current: ToolId }) {
  return (
    <nav aria-label="Recruiter tools" className="mb-10 w-full">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TOOLS.map(({ id, href, label, note, Icon }) => {
          const on = id === current;
          return (
            <li key={id}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                transitionTypes={[TOOL_TAB]}
                className={`relative isolate flex h-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-150 ${FOCUS} ${
                  on ? "border-transparent" : "border-line hover:border-line-strong hover:bg-surface-3"
                }`}
              >
                {on && (
                  <ViewTransition name="tool-tab-active" share="tool-tab" default="none">
                    <span aria-hidden="true" className="absolute inset-[-1px] -z-10 rounded-xl border border-accent/60 bg-accent/10" />
                  </ViewTransition>
                )}
                <Icon size={16} aria-hidden="true" className={on ? "shrink-0 text-accent-fg" : "shrink-0 text-muted"} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{label}</span>
                  <span className="block truncate text-xs text-muted">{note}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
