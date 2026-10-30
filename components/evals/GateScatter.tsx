"use client";

import { useState } from "react";

export interface GateCase {
  q: string;
  kind: string;
  onTopic: number | null;
  injection: number | null;
  pass: boolean;
}

// Categorical slots 1-3 (validated for both surfaces); shape is the secondary encoding.
const KINDS = [
  { kind: "on-topic", label: "On-topic", color: "fill-[#2a78d6] dark:fill-[#3987e5]" },
  { kind: "off-topic", label: "Off-topic", color: "fill-[#eb6834] dark:fill-[#d95926]" },
  { kind: "injection", label: "Injection", color: "fill-[#1baf7a] dark:fill-[#199e70]" },
] as const;

const W = 360;
const H = 300;
const PAD = { l: 40, r: 14, t: 14, b: 40 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;
const sx = (v: number) => PAD.l + v * PW;
const sy = (v: number) => PAD.t + (1 - v) * PH;

function Mark({ kind, x, y, className }: { kind: string; x: number; y: number; className: string }) {
  const ring = "stroke-[#FAFAF9] dark:stroke-[#09090b]";
  if (kind === "off-topic") return <rect x={x - 5} y={y - 5} width={10} height={10} rx={2} strokeWidth={2} className={`${className} ${ring}`} />;
  if (kind === "injection") return <path d={`M${x} ${y - 6.5}L${x + 6} ${y + 4.5}H${x - 6}Z`} strokeWidth={2} strokeLinejoin="round" className={`${className} ${ring}`} />;
  return <circle cx={x} cy={y} r={5.5} strokeWidth={2} className={`${className} ${ring}`} />;
}

export function KindKey({ kind }: { kind: string }) {
  const k = KINDS.find((x) => x.kind === kind) ?? KINDS[0];
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <Mark kind={k.kind} x={6} y={6.5} className={k.color} />
    </svg>
  );
}

export default function GateScatter({ cases }: { cases: GateCase[] }) {
  const [active, setActive] = useState<number | null>(null);
  const plotted = cases.filter((c) => c.onTopic !== null && c.injection !== null);
  const shown = active === null ? null : plotted[active];

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fg-2">
        {KINDS.map((k) => (
          <span key={k.kind} className="inline-flex items-center gap-1.5">
            <KindKey kind={k.kind} />
            {k.label} · {plotted.filter((c) => c.kind === k.kind).length}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img"
        aria-label="Each safety-gate case plotted by on-topic probability against injection probability; a question is answered only in the lower-right quadrant.">
        {/* Allowed region: on-topic >= 0.5 and injection < 0.5 */}
        <rect x={sx(0.5)} y={sy(0.5)} width={PW / 2} height={PH / 2} className="fill-black/[0.035] dark:fill-white/[0.05]" />
        <text x={sx(1) - 6} y={sy(0.5) + 14} textAnchor="end" className="fill-gray-500 dark:fill-white/45 font-mono text-[9px] uppercase tracking-[0.12em]">
          answered
        </text>
        <text x={sx(0) + 6} y={sy(0.5) - 6} className="fill-gray-500 dark:fill-white/45 font-mono text-[9px] uppercase tracking-[0.12em]">
          refused
        </text>

        <rect x={PAD.l} y={PAD.t} width={PW} height={PH} fill="none" className="stroke-black/10 dark:stroke-white/10" />
        <line x1={sx(0.5)} x2={sx(0.5)} y1={PAD.t} y2={PAD.t + PH} strokeDasharray="3 4" className="stroke-black/25 dark:stroke-white/25" />
        <line x1={PAD.l} x2={PAD.l + PW} y1={sy(0.5)} y2={sy(0.5)} strokeDasharray="3 4" className="stroke-black/25 dark:stroke-white/25" />

        {[0, 0.5, 1].map((t) => (
          <g key={t} className="fill-gray-500 dark:fill-white/45 font-mono text-[9px] tabular-nums">
            <text x={sx(t)} y={PAD.t + PH + 14} textAnchor="middle">{t}</text>
            <text x={PAD.l - 8} y={sy(t) + 3} textAnchor="end">{t}</text>
          </g>
        ))}
        <text x={PAD.l + PW / 2} y={H - 6} textAnchor="middle" className="fill-gray-600 dark:fill-white/55 text-[10px]">
          P(about Selvin) →
        </text>
        <text transform={`translate(11 ${PAD.t + PH / 2}) rotate(-90)`} textAnchor="middle" className="fill-gray-600 dark:fill-white/55 text-[10px]">
          P(injection) →
        </text>

        {plotted.map((c, i) => {
          const x = sx(c.onTopic!);
          const y = sy(c.injection!);
          const color = (KINDS.find((k) => k.kind === c.kind) ?? KINDS[0]).color;
          return (
            <g
              key={c.q}
              tabIndex={0}
              role="button"
              aria-label={`${c.q}: on-topic ${c.onTopic!.toFixed(2)}, injection ${c.injection!.toFixed(2)}, ${c.pass ? "pass" : "fail"}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="cursor-default outline-none"
            >
              <circle cx={x} cy={y} r={11} fill="transparent" />
              {!c.pass && <circle cx={x} cy={y} r={9.5} fill="none" strokeWidth={1.5} strokeDasharray="2 2" className="stroke-red-600 dark:stroke-red-400" />}
              {active === i && <circle cx={x} cy={y} r={10} fill="none" strokeWidth={1.5} className="stroke-gray-900 dark:stroke-white" />}
              <Mark kind={c.kind} x={x} y={y} className={color} />
            </g>
          );
        })}
      </svg>

      <figcaption className="min-h-[3.25rem] rounded-lg border border-line px-3 py-2 text-xs" aria-live="polite">
        {shown ? (
          <>
            <span className="block text-fg truncate">&ldquo;{shown.q}&rdquo;</span>
            <span className="mt-0.5 block font-mono tabular-nums text-muted">
              {shown.kind} · on-topic {shown.onTopic!.toFixed(2)} · injection {shown.injection!.toFixed(2)} ·{" "}
              <span className={shown.pass ? "text-ok" : "text-danger"}>
                {shown.pass ? "PASS" : "FAIL"}
              </span>
            </span>
          </>
        ) : (
          <span className="text-muted">
            Hover or tab to a point to see the question. Dashed cutoffs at 0.5; only the shaded corner gets an answer.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
