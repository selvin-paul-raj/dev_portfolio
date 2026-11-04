"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { FOCUS } from "@/components/tools/styles";
import { KINDS } from "./model";
import type { Citation } from "./model";

const POPOVER_MAX = 320;
const GUTTER = 16;

/** `originX` is the chip's centre within the popover, so it scales out of the chip. */
type Pos = { left: number; top: number; width: number; above: boolean; originX: number };

/** Places the popover under (or above, near the bottom edge) the chip, inside the viewport. */
function place(el: HTMLElement): Pos {
  const r = el.getBoundingClientRect();
  const width = Math.min(POPOVER_MAX, window.innerWidth - GUTTER * 2);
  const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, GUTTER), window.innerWidth - width - GUTTER);
  const above = window.innerHeight - r.bottom < 220 && r.top > 220;
  return { left, top: above ? r.top - 8 : r.bottom + 8, width, above, originX: r.left + r.width / 2 - left };
}

function CitationChip({ citation, onJump }: { citation: Citation; onJump: (n: number) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const pointer = useRef<string>("mouse");
  const [pos, setPos] = useState<Pos | null>(null);
  const id = useId();
  const { label, Icon } = KINDS[citation.kind];

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  const show = () => ref.current && setPos(place(ref.current));
  const hide = () => setPos(null);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label={`Source ${citation.n}: ${citation.title}`}
        aria-describedby={pos ? id : undefined}
        onPointerDown={(e: ReactPointerEvent) => (pointer.current = e.pointerType)}
        onPointerEnter={(e: ReactPointerEvent) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e: ReactPointerEvent) => e.pointerType === "mouse" && hide()}
        onFocus={() => pointer.current !== "touch" && show()}
        onBlur={hide}
        onKeyDown={(e) => {
          pointer.current = "keyboard";
          if (e.key === "Escape") hide();
        }}
        onClick={() => {
          // On touch the first tap previews the snippet; the next one jumps to the source.
          if (pointer.current === "touch" && !pos) return show();
          hide();
          onJump(citation.n);
        }}
        className={`mx-0.5 inline-flex h-5 min-w-5 -translate-y-px items-center justify-center rounded-md border border-accent/50 bg-accent/10 px-1
          align-middle font-mono text-[0.7rem] font-semibold leading-none text-accent-fg transition-colors duration-150 hover:bg-accent/20 ${FOCUS}`}
      >
        {citation.n}
      </button>
      {pos && (
        <span
          id={id}
          role="tooltip"
          data-side={pos.above ? "top" : "bottom"}
          style={{ left: pos.left, top: pos.top, width: pos.width, transformOrigin: `${pos.originX}px ${pos.above ? "100%" : "0"}` }}
          className="cite-pop fixed z-50 flex flex-col gap-1.5 rounded-xl border border-line-strong bg-surface-2 p-3 text-left shadow-lg"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <Icon size={13} aria-hidden="true" />
            {label}
          </span>
          <span className="text-sm font-medium leading-snug text-fg">{citation.title}</span>
          <span className="line-clamp-5 text-xs leading-relaxed text-fg-2">{citation.text}</span>
        </span>
      )}
    </>
  );
}

/** Answer text with each [n] as a focusable chip; markers with no known source stay plain. */
export default function CitedText({ text, citations, onJump }: { text: string; citations: Citation[]; onJump: (n: number) => void }) {
  const byN = new Map(citations.map((c) => [c.n, c]));
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-fg">
      {parts.map((part, i) => {
        const n = Number(part.match(/^\[(\d+)\]$/)?.[1]);
        const citation = byN.get(n);
        if (citation) return <CitationChip key={i} citation={citation} onJump={onJump} />;
        if (n) return <span key={i} className="font-mono text-xs text-muted">{part}</span>;
        return part;
      })}
    </p>
  );
}
