"use client";

import { useState, type KeyboardEvent } from "react";
import type { GateCase } from "@/evals/report";
import { KINDS, KindKey, Mark, kindOf } from "./gateKinds";

const W = 360;
const H = 300;
const PAD = { l: 44, r: 14, t: 14, b: 44 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;
const sx = (v: number) => PAD.l + v * PW;
const sy = (v: number) => PAD.t + (1 - v) * PH;
const AXIS_TEXT = "fill-muted text-[11px]";

type Plotted = GateCase & { onTopic: number; injection: number };

export default function GateScatter({ cases }: { cases: GateCase[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const plotted = cases.filter((c): c is Plotted => c.onTopic !== null && c.injection !== null);
  const activeIndex = hover ?? pinned;
  const shown = activeIndex === null ? null : plotted[activeIndex];

  const onKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    setPinned(i);
  };

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fg-2">
        {KINDS.map((k) => (
          <span key={k.kind} className="inline-flex items-center gap-1.5">
            <KindKey kind={k.kind} />
            {k.label}, {plotted.filter((c) => c.kind === k.kind).length}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
            <circle cx="7" cy="7" r="5.5" fill="none" strokeWidth={1.5} strokeDasharray="2 2" className="stroke-fg" />
          </svg>
          Failed case
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full select-none"
        role="group"
        aria-label="Each safety gate case plotted by on-topic probability against injection probability; a question is answered only in the shaded lower right corner."
      >
        {/* Allowed region: on-topic at least 0.5 and injection below 0.5 */}
        <rect x={sx(0.5)} y={sy(0.5)} width={PW / 2} height={PH / 2} className="fill-fg/[0.05]" />
        <text x={sx(1) - 6} y={sy(0.5) + 16} textAnchor="end" className={AXIS_TEXT}>
          answered
        </text>
        <text x={sx(0) + 6} y={sy(0.5) - 8} className={AXIS_TEXT}>
          refused
        </text>

        <rect x={PAD.l} y={PAD.t} width={PW} height={PH} fill="none" className="stroke-line-strong" />
        <line x1={sx(0.5)} x2={sx(0.5)} y1={PAD.t} y2={PAD.t + PH} strokeDasharray="3 4" className="stroke-fg/30" />
        <line x1={PAD.l} x2={PAD.l + PW} y1={sy(0.5)} y2={sy(0.5)} strokeDasharray="3 4" className="stroke-fg/30" />

        {[0, 0.5, 1].map((t) => (
          <g key={t} className={`${AXIS_TEXT} tabular-nums`}>
            <text x={sx(t)} y={PAD.t + PH + 16} textAnchor="middle">{t}</text>
            <text x={PAD.l - 8} y={sy(t) + 4} textAnchor="end">{t}</text>
          </g>
        ))}
        <text x={PAD.l + PW / 2} y={H - 6} textAnchor="middle" className="fill-fg-2 text-[12px]">
          P(about Selvin)
        </text>
        <text transform={`translate(13 ${PAD.t + PH / 2}) rotate(-90)`} textAnchor="middle" className="fill-fg-2 text-[12px]">
          P(injection)
        </text>

        {plotted.map((c, i) => {
          const x = sx(c.onTopic);
          const y = sy(c.injection);
          return (
            <g
              key={c.q}
              tabIndex={0}
              role="button"
              aria-pressed={pinned === i}
              aria-label={`${c.q}: on-topic ${c.onTopic.toFixed(2)}, injection ${c.injection.toFixed(2)}, ${c.pass ? "pass" : "fail"}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setPinned(i)}
              onClick={() => setPinned(i)}
              onKeyDown={onKey(i)}
              className="group cursor-pointer outline-none"
            >
              {/* Generous hit area: about 24px across even when the chart is phone width. */}
              <circle cx={x} cy={y} r={16} fill="transparent" />
              {!c.pass && <circle cx={x} cy={y} r={9.5} fill="none" strokeWidth={1.5} strokeDasharray="2 2" className="stroke-fg" />}
              <circle
                cx={x}
                cy={y}
                r={11}
                fill="none"
                strokeWidth={2}
                className={`stroke-accent ${activeIndex === i ? "opacity-100" : "opacity-0 group-focus-visible:opacity-100"}`}
              />
              <Mark kind={c.kind} x={x} y={y} />
            </g>
          );
        })}
      </svg>

      <figcaption className="min-h-[3.75rem] rounded-lg border border-line px-3 py-2 text-sm" aria-live="polite">
        {shown ? (
          <>
            <span className="block break-words text-fg">&ldquo;{shown.q}&rdquo;</span>
            <span className="mt-1 block text-xs tabular-nums text-muted">
              {kindOf(shown.kind).label}, on-topic {shown.onTopic.toFixed(2)}, injection {shown.injection.toFixed(2)},{" "}
              <span className={shown.pass ? "text-ok" : "text-danger"}>{shown.pass ? "pass" : "fail"}</span>
            </span>
          </>
        ) : (
          <span className="text-muted">
            Tap, hover or tab to a point to read the question. Cutoffs at 0.5; only the shaded corner gets an answer.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
