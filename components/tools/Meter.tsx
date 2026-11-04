// A labelled 0..1 bar with an optional threshold tick, used for scores and probabilities.
// The fill eases to each new value and grows from 0 on first paint (.meter-fill in app/globals.css).

import type { CSSProperties } from "react";

const TONES = {
  accent: "bg-accent",
  ok: "bg-ok",
  danger: "bg-danger",
  info: "bg-info",
  muted: "bg-fg/40",
} as const;

export type MeterTone = keyof typeof TONES;

export default function Meter({
  label,
  value,
  display,
  tone = "accent",
  threshold,
}: {
  label: string;
  value: number;
  display?: string;
  tone?: MeterTone;
  threshold?: number;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
        <span className="truncate text-fg-2">{label}</span>
        <span className="font-mono tabular-nums text-fg">{display ?? v.toFixed(2)}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={Number(v.toFixed(2))}
        className="relative h-1.5 overflow-hidden rounded-full bg-fg/10"
      >
        <span
          className={`meter-fill absolute inset-y-0 left-0 w-full origin-left rounded-full ${TONES[tone]}`}
          style={{ "--v": v } as CSSProperties}
        />
        {threshold !== undefined && (
          <span aria-hidden="true" className="absolute inset-y-[-2px] w-px bg-fg/60" style={{ left: `${threshold * 100}%` }} />
        )}
      </div>
    </div>
  );
}
