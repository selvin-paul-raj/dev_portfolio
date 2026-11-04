import { Icon } from "./parts";

export interface StripCase {
  label: string;
  pass: boolean;
  /** id of the case's row or card; each cell links there, so the strip works by tap and keyboard. */
  anchor: string;
}

/** One cell per case: a solid square for a pass, a red cross for a fail. */
export default function CaseStrip({ cases, label }: { cases: StripCase[]; label: string }) {
  const passed = cases.filter((c) => c.pass).length;
  return (
    <ol className="flex flex-wrap" aria-label={`${label}: ${passed} of ${cases.length} cases pass`}>
      {cases.map((c) => (
        <li key={c.anchor}>
          <a
            href={`#${c.anchor}`}
            title={c.label}
            aria-label={`${c.pass ? "Pass" : "Fail"}: ${c.label}`}
            className="ev-cell-link group"
          >
            {c.pass ? (
              <span className="ev-mark h-3 w-3 rounded-[3px] bg-fg/70" />
            ) : (
              <span className="ev-mark ev-mark-fail grid text-danger">
                <Icon name="x" size={14} />
              </span>
            )}
          </a>
        </li>
      ))}
    </ol>
  );
}
