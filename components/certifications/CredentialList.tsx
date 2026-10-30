"use client";

import { useState } from "react";
import { LuSearch, LuShieldCheck, LuX } from "react-icons/lu";
import { MdArrowOutward } from "react-icons/md";
import { certs, featured, isAI, monthKey, monthLabel, yearOf, type Cert } from "./model";
import type { Selection } from "./LearningHeatmap";

const PAGE = 12;
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b]";

function pick(selection: Selection): { list: Cert[]; title: string } {
  switch (selection.kind) {
    case "featured":
      return { list: featured, title: "Featured" };
    case "all":
      return { list: certs, title: "All certificates" };
    case "year":
      return { list: certs.filter((c) => yearOf(c) === selection.year), title: selection.year };
    case "month":
      return { list: certs.filter((c) => monthKey(c) === selection.key), title: monthLabel(selection.key) };
  }
}

function CredentialRow({ cert }: { cert: Cert }) {
  return (
    <li className="grid grid-cols-1 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] items-start gap-x-5 gap-y-2 py-4 border-t border-line first:border-t-0">
      <span className="font-mono text-xs text-muted sm:pt-0.5">{monthLabel(cert.date)}</span>
      <div className="min-w-0">
        <h4 className="text-[15px] font-semibold leading-snug text-fg">{cert.title}</h4>
        <p className="mt-0.5 text-sm">
          <span className={isAI(cert) ? "text-accent-fg font-medium" : "text-fg-2 font-medium"}>{cert.issuer}</span>
          <span className="text-muted">, {cert.category}</span>
        </p>
        {cert.skills.length > 0 && <p className="mt-1 text-xs text-muted">{cert.skills.slice(0, 4).join(", ")}</p>}
        {cert.certId && (
          <p className="mt-1 truncate font-mono text-[11px] text-muted" title={cert.certId}>
            ID {cert.certId}
          </p>
        )}
      </div>
      {cert.verifyUrl ? (
        <a
          href={cert.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Verify ${cert.title} with ${cert.issuer} (opens in new tab)`}
          className={`justify-self-start inline-flex h-11 [@media(pointer:fine)]:h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-sm font-medium
 text-fg hover:border-emerald-500/60 hover:text-ok dark:hover:border-emerald-400/50 transition-colors duration-150 ${FOCUS}`}
        >
          <LuShieldCheck size={15} aria-hidden="true" /> Verify <MdArrowOutward size={13} aria-hidden="true" />
        </a>
      ) : (
        <span className="text-sm text-muted">No public link</span>
      )}
    </li>
  );
}

export default function CredentialList({ selection, onSelect }: { selection: Selection; onSelect: (s: Selection) => void }) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const q = query.trim().toLowerCase();

  const { list, title } = q ? { list: certs, title: "Search" } : pick(selection);
  const matches = q ? list.filter((c) => [c.title, c.issuer, c.category, c.certId, ...c.skills].join(" ").toLowerCase().includes(q)) : list;
  const shown = matches.slice(0, limit);

  const choose = (s: Selection) => {
    setQuery("");
    setLimit(PAGE);
    onSelect(s);
  };
  const chip = (on: boolean) =>
    `inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${FOCUS} ${
 on
 ? "border-gray-900 bg-gray-900 text-white dark:border-accent dark:bg-accent dark:text-[#1a1500]"
 : "border-line text-fg-2 hover:border-line-strong "
 }`;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!q && selection.kind === "featured"} onClick={() => choose({ kind: "featured" })} className={chip(!q && selection.kind === "featured")}>
            Featured {featured.length}
          </button>
          <button type="button" aria-pressed={!q && selection.kind === "all"} onClick={() => choose({ kind: "all" })} className={chip(!q && selection.kind === "all")}>
            All {certs.length}
          </button>
        </div>
        <div className="relative sm:w-72">
          <label htmlFor="cert-search" className="sr-only">Search certificates</label>
          <LuSearch size={15} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="cert-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Title, issuer, skill or ID"
            className="h-10 w-full rounded-full border border-black/15 dark:border-white/15 bg-white dark:bg-white/[0.04] pl-9 pr-9 text-base sm:text-sm
              text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <LuX size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold text-fg">
        {title} <span className="font-normal text-muted">({matches.length})</span>
      </h3>
      <p role="status" className="sr-only">{matches.length} certificates shown</p>

      {shown.length > 0 ? (
        <ul key={`${title}-${q}`} className="anim-detail-in mt-2">
          {shown.map((c) => (
            <CredentialRow key={c.id} cert={c} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-fg-2">No certificates match &ldquo;{query.trim()}&rdquo;.</p>
      )}

      {matches.length > limit && (
        <button type="button" onClick={() => setLimit((n) => n + PAGE)} className={`mt-4 ${chip(false)}`}>
          Show {Math.min(PAGE, matches.length - limit)} more of {matches.length - limit}
        </button>
      )}
    </div>
  );
}
