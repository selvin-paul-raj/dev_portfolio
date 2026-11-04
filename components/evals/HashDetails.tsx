import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { FOCUS } from "@/components/tools/styles";

/**
 * A server-rendered disclosure for a long case table. HashOpen (mounted once on the page)
 * opens it when the URL hash points at a row inside, so case-strip cells can link to rows.
 */
export default function HashDetails({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group mt-6 rounded-xl border border-line [&_summary::-webkit-details-marker]:hidden">
      <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm font-medium text-fg-2 transition-colors duration-150 hover:text-fg ${FOCUS}`}>
        {summary}
        <LuChevronDown
          size={16}
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
