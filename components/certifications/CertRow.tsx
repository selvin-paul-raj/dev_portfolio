"use client";

import { MdArrowOutward } from "react-icons/md";
import { fmtDate, initials, issuerColor, type Cert } from "./data";

const LINK = "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent";

/** One credential: issuer mark, title, skills, and a one-click verify link. */
export default function CertRow({ cert, onDetails, compact = false }: { cert: Cert; onDetails: () => void; compact?: boolean }) {
  const color = issuerColor(cert.issuer);
  return (
    <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-4 border-b border-black/[0.08] dark:border-white/[0.07]">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold text-gray-900 dark:text-white"
        style={{ background: `color-mix(in oklab, ${color} 22%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 40%, transparent)` }}
      >
        {initials(cert.issuer)}
      </span>
      <div className="min-w-0">
        <h4 className="text-[0.95rem] font-medium leading-snug text-gray-900 dark:text-white">{cert.title}</h4>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-white/55">
          {cert.issuer}, <span className="font-mono text-xs tabular-nums">{fmtDate(cert.date)}</span>
        </p>
        {!compact && cert.skills.length > 0 && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-white/45 truncate">{cert.skills.slice(0, 4).join(", ")}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {cert.verifyUrl && (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Verify ${cert.title} (opens in new tab)`}
              className={`inline-flex items-center gap-1 font-medium text-amber-700 dark:text-accent hover:underline underline-offset-4 ${LINK}`}
            >
              Verify <MdArrowOutward size={13} aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={onDetails}
            aria-haspopup="dialog"
            aria-label={`Details for ${cert.title}`}
            className={`text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white ${LINK}`}
          >
            Details
          </button>
        </div>
      </div>
    </li>
  );
}
