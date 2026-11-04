"use client";

import NumberTicker from "@/components/ui/NumberTicker";

export type StatFormat = "plus" | "months" | "plain";
export type Stat = { value: number; label: string; format: StatFormat };

const fmtMonths = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};

// Formatters live client-side: functions can't cross the server/client prop boundary.
const FORMATS: Record<StatFormat, (n: number) => string> = {
  plus: (n) => `${n}+`,
  months: fmtMonths,
  plain: String,
};

export default function AboutStats({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 border border-line rounded-[14px] overflow-hidden bg-surface-2">
      {stats.map(({ value, label, format }, i) => (
        <div
          key={label}
          className={`min-w-0 px-4 sm:px-5 py-4 flex flex-col-reverse gap-1.5
 ${i % 2 === 1 ? "border-l border-line " : ""}
 ${i >= 2 ? "border-t border-line " : ""}`}
        >
          <dt className="text-sm text-fg-2">{label}</dt>
          <dd className="m-0 whitespace-nowrap text-2xl sm:text-[28px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">
            <NumberTicker value={value} format={FORMATS[format]} duration={1.6} className="!text-left" />
          </dd>
        </div>
      ))}
    </dl>
  );
}
