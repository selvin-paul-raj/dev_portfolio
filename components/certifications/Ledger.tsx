"use client";

import { useMemo, useState } from "react";
import Pagination from "../Pagination";
import CertRow from "./CertRow";
import { categories, certs, issuers, years, type Cert } from "./data";

type SortMode = "newest" | "oldest" | "az" | "issuer";
const PAGE_SIZE = 12;

const SELECT =
  "h-11 w-full rounded-xl border border-black/20 dark:border-white/20 bg-white dark:bg-white/[0.04] px-3 text-sm text-gray-900 dark:text-white " +
  "dark:[color-scheme:dark] outline-none focus-visible:ring-2 focus-visible:ring-accent";
const LABEL = "text-xs font-medium text-gray-600 dark:text-white/55";

const SORTERS: Record<SortMode, (a: Cert, b: Cert) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date),
  oldest: (a, b) => a.date.localeCompare(b.date),
  az: (a, b) => a.title.localeCompare(b.title),
  issuer: (a, b) => a.issuer.localeCompare(b.issuer) || b.date.localeCompare(a.date),
};

/** Every certificate, searchable and filterable. `year` is lifted so the chart can set it. */
export default function Ledger({ year, setYear, onDetails }: { year: string; setYear: (y: string) => void; onDetails: (c: Cert) => void }) {
  const [query, setQuery] = useState("");
  const [issuer, setIssuer] = useState("All");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortMode>("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return certs
      .filter((c) => (issuer === "All" || c.issuer === issuer) && (category === "All" || c.category === category) && (year === "All" || c.date.startsWith(year)))
      .filter((c) => !q || [c.title, c.issuer, c.category, c.certId, ...c.skills].join(" ").toLowerCase().includes(q))
      .sort(SORTERS[sort]);
  }, [query, issuer, category, year, sort]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, Math.max(pages, 1));
  const start = (current - 1) * PAGE_SIZE;
  const filteredBy = query || issuer !== "All" || category !== "All" || year !== "All";
  const reset = () => { setQuery(""); setIssuer("All"); setCategory("All"); setYear("All"); setPage(1); };
  const pick = (set: (v: string) => void) => (e: { target: { value: string } }) => { set(e.target.value); setPage(1); };

  return (
    <div id="cert-ledger" className="flex flex-col gap-5 scroll-mt-28">
      <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-3">
        <label className="col-span-2 lg:col-span-1 flex flex-col gap-1.5">
          <span className={LABEL}>Search</span>
          <input type="search" value={query} onChange={pick(setQuery)} placeholder="Title, issuer, skill or ID" className={SELECT} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Issuer</span>
          <select value={issuer} onChange={pick(setIssuer)} className={SELECT}>
            <option value="All">All</option>
            {issuers.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Category</span>
          <select value={category} onChange={pick(setCategory)} className={SELECT}>
            <option value="All">All</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Year</span>
          <select value={year} onChange={pick(setYear)} className={SELECT}>
            <option value="All">All</option>
            {[...years].reverse().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>Sort</span>
          <select value={sort} onChange={(e) => { setSort(e.target.value as SortMode); setPage(1); }} className={SELECT}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A to Z</option>
            <option value="issuer">By issuer</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-gray-600 dark:text-white/55">
          {filtered.length === 0 ? "No certificates match." : `${filtered.length} of ${certs.length} certificates`}
        </p>
        {filteredBy && (
          <button type="button" onClick={reset} className="text-sm font-medium text-amber-700 dark:text-accent hover:underline underline-offset-4 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
            Clear filters
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-10 border-t border-black/[0.08] dark:border-white/[0.07]">
          {filtered.slice(start, start + PAGE_SIZE).map((c) => (
            <CertRow key={c.id} cert={c} onDetails={() => onDetails(c)} />
          ))}
        </ul>
      )}

      <Pagination
        currentPage={current}
        totalPages={pages}
        variant="pill"
        onChange={(p) => {
          setPage(p);
          document.getElementById("cert-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}
