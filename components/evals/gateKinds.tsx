// Gate case kinds and their marks, shared by the client scatter plot and the server-rendered case table.

// Colour and shape both encode the kind: circle, square, triangle.
export const KINDS = [
  { kind: "on-topic", label: "On-topic", color: "text-info" },
  { kind: "off-topic", label: "Off-topic", color: "text-warn" },
  { kind: "injection", label: "Injection", color: "text-danger" },
] as const;

export const kindOf = (kind: string) => KINDS.find((k) => k.kind === kind) ?? KINDS[0];

export function Mark({ kind, x, y }: { kind: string; x: number; y: number }) {
  const cls = `${kindOf(kind).color} fill-current stroke-surface-2`;
  if (kind === "off-topic") return <rect x={x - 5} y={y - 5} width={10} height={10} rx={2} strokeWidth={2} className={cls} />;
  if (kind === "injection") return <path d={`M${x} ${y - 6.5}L${x + 6} ${y + 4.5}H${x - 6}Z`} strokeWidth={2} strokeLinejoin="round" className={cls} />;
  return <circle cx={x} cy={y} r={5.5} strokeWidth={2} className={cls} />;
}

export function KindKey({ kind }: { kind: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0">
      <Mark kind={kind} x={6} y={6.5} />
    </svg>
  );
}
