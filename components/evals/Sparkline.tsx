import { pct } from "@/lib/evalsSummary";

/**
 * Pass rate across runs on a fixed 0..1 scale, so a flat line at the top means "always passing".
 * One run draws a single dot and says so; it never invents a line.
 * Rendered drawn; SparkReveal draws it in when it first scrolls into view.
 */
export default function Sparkline({ rates, width = 96, height = 28 }: { rates: number[]; width?: number; height?: number }) {
  if (!rates.length) return null;
  const pad = 3;
  const y = (r: number) => pad + (1 - r) * (height - pad * 2);

  if (rates.length === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true" className="shrink-0 text-accent-fg">
          <circle cx="4" cy="4" r="3" className="fill-current" />
        </svg>
        First run, {pct(rates[0])}
      </span>
    );
  }

  const x = (i: number) => pad + (i * (width - pad * 2)) / (rates.length - 1);
  const points = rates.map((r, i) => `${x(i).toFixed(1)},${y(r).toFixed(1)}`).join(" ");
  const last = rates.length - 1;
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`pass rate over ${rates.length} runs: from ${pct(rates[0])} to ${pct(rates[last])}`}
        className="shrink-0 overflow-visible text-accent-fg"
        data-spark=""
      >
        <line x1={pad} x2={width - pad} y1={y(1)} y2={y(1)} strokeDasharray="2 3" className="stroke-line-strong" />
        <polyline points={points} pathLength={1} fill="none" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className="spark-line stroke-current" />
        <circle cx={x(last)} cy={y(rates[last])} r={2.5} className="spark-dot fill-current" />
      </svg>
      <span aria-hidden="true">{rates.length} runs</span>
    </span>
  );
}
