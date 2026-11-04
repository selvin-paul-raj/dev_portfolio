import { LuCircleSlash } from "react-icons/lu";
import type { RefusalReason } from "@/lib/ask/answer";
import { CHIP } from "./model";

const REASONS: Record<RefusalReason, string> = {
  "off-topic": "This question didn't match anything in the portfolio, so there was nothing to cite.",
  injection: "This message read like an attempt to change my instructions, so it never reached the model.",
  "off-scope": "The reply drifted into code or general help, which this box doesn't do, so it was dropped.",
  "no-citations": "The snippets found didn't support an answer, so I'd rather say nothing than guess.",
};

/** A refused question: plain reason, then on-topic questions to try instead. */
export default function Refusal({ reason, suggestions, disabled, onAsk }: { reason?: RefusalReason; suggestions: string[]; disabled: boolean; onAsk: (q: string) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4">
      <p className="flex items-start gap-2.5">
        <LuCircleSlash size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
        <span className="flex flex-col gap-1">
          <span className="text-[0.95rem] font-medium text-fg">I only answer from this portfolio.</span>
          <span className="text-sm leading-relaxed text-fg-2">{REASONS[reason ?? "off-topic"]} You can also reach Selvin through the contact form.</span>
        </span>
      </p>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-7">
          {suggestions.map((s) => (
            <button key={s} type="button" disabled={disabled} onClick={() => onAsk(s)} className={CHIP}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
