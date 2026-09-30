"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import Pagination from "./Pagination";
import SectionHeading from "./SectionHeading";
import rawCertsAll from "@/lib/data/certifications.json";

const rawCerts = rawCertsAll.filter((c) => c.show);
const featuredCerts = rawCerts
  .filter((c) => c.featured)
  .sort((a, b) => b.date.localeCompare(a.date));

type Cert = (typeof rawCertsAll)[number];
type SortMode = "newest" | "oldest" | "az" | "issuer";
type ViewMode = "grid" | "list";

const PAGE_SIZE = 12;
const MONO = "var(--font-geist-mono)";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

const MONTHS_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_L = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* Deterministic date helpers: no new Date() to avoid SSR/client hydration mismatch */
function fmtDate(d: string): string {
  const [y, m] = d.split("-");
  return `${MONTHS_S[+m - 1]} ${y}`;
}
function fmtDateLong(d: string): string {
  const [y, m, day] = d.split("-");
  return `${MONTHS_L[+m - 1]} ${+day}, ${y}`;
}
function yearOf(d: string): number { return +d.split("-")[0]; }

const ISSUER_COLORS: Record<string, string> = {
  /* AI platforms */
  "Anthropic":          "#e8966e",
  "DeepLearning.AI":    "#ff6b9d",
  "Hugging Face":       "#ffb84d",
  /* Cloud / tech giants */
  "AWS":                "#ff9900",
  "IBM":                "#5fa0ff",
  "Microsoft":          "#5ec4eb",
  "Google":             "#ea7e6a",
  "Meta":               "#5d8bf0",
  /* Learning platforms */
  "Coursera":           "#4f7df0",
  "LinkedIn":           "#0a66c2",
  "LinkedIn Learning":  "#0a66c2",
  "Udemy":              "#a435f0",
  "Simplilearn":        "#f94f4f",
  "Cognitive Class":    "#be6ef5",
  /* Regional / niche */
  "HackerRank":         "#2ec866",
  "GUVI":               "#00C896",
  "HCL GUVI":           "#00b89c",
  "NPTEL":              "#f47b20",
  "Edunet Foundation":  "#34c98a",
};

function hashIssuerColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return `hsl(${(h % 300) + 30}, 62%, 60%)`;
}
function issuerColor(name: string): string {
  return ISSUER_COLORS[name] ?? hashIssuerColor(name);
}

function initials(s: string) {
  return s.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

/* ─── Placeholder band ─── */
/* Shown when a cert has no image: issuer + date only, so the title appears once (in the card body). */
function PlaceholderBand({ cert, listMode, date }: { cert: Cert; listMode: boolean; date: string }) {
  const color = issuerColor(cert.issuer);
  return (
    <div
      className={`flex shrink-0 gap-2 px-3.5 py-2.5 border-black/[0.08] dark:border-white/[0.07] ${
        listMode
          ? "w-[160px] self-stretch flex-col justify-between border-r"
          : "w-full items-center justify-between border-b"
      }`}
      style={{ background: `color-mix(in oklab, ${color} 8%, transparent)` }}
    >
      <span
        className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--band-light)] dark:text-[color:var(--band-dark)]"
        style={{
          fontFamily: MONO,
          ["--band-light" as string]: `color-mix(in oklab, ${color} 55%, #000)`,
          ["--band-dark" as string]: `color-mix(in oklab, ${color} 75%, #fff)`,
        }}
      >
        {cert.issuer}
      </span>
      <span
        className="shrink-0 text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#a1a1aa]"
        style={{ fontFamily: MONO }}
      >
        {date}
      </span>
    </div>
  );
}

/* ─── Date pill ─── */
function DatePill({ date }: { date: string }) {
  return (
    <span
      className="absolute top-[10px] right-[10px] px-[9px] py-[3px] rounded-full text-xs text-white border border-white/[0.14]"
      style={{
        fontFamily: MONO,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        background: "rgba(0,0,0,0.7)",
      }}
    >
      {date}
    </span>
  );
}

/* ─── Issuer pill ─── */
function IssuerPill({ issuer, onDark = false }: { issuer: string; onDark?: boolean }) {
  const color = issuerColor(issuer);
  const darkText = `color-mix(in oklab, ${color} 75%, #fff)`;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-xs font-semibold uppercase tracking-[0.12em] border ${
        onDark ? "" : "text-[color:var(--pill-light)] dark:text-[color:var(--pill-dark)]"
      }`}
      style={{
        fontFamily: MONO,
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        borderColor: `color-mix(in oklab, ${color} 32%, transparent)`,
        ...(onDark
          ? { color: darkText }
          : {
              ["--pill-light" as string]: `color-mix(in oklab, ${color} 55%, #000)`,
              ["--pill-dark" as string]: darkText,
            }),
      }}
    >
      <span
        className="w-[5px] h-[5px] rounded-full shrink-0"
        style={{ background: color }}
      />
      {issuer}
    </span>
  );
}

/* ─── Cert Card ─── */
function CertCard({
  cert,
  onClick,
  listMode,
  index,
}: {
  cert: Cert;
  onClick: () => void;
  listMode: boolean;
  index: number;
}) {
  const displaySkills = cert.skills.slice(0, 3);
  const extra = cert.skills.length - displaySkills.length;
  const date = fmtDate(cert.date);
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(cert.imageUrl) && !imgError;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: EASE }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${cert.title} from ${cert.issuer}`}
      className={`group relative flex border rounded-[14px] overflow-hidden cursor-pointer
        bg-white dark:bg-[#101015]
        border-black/[0.08] dark:border-white/[0.07]
        hover:border-black/[0.18] dark:hover:border-white/[0.14]
        hover:-translate-y-[2px] active:scale-[0.97]
        transition-[transform,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]
        focus-visible:outline-2 focus-visible:outline focus-visible:outline-[#f5c518] focus-visible:outline-offset-2
        ${listMode ? "flex-row" : "flex-col"}`}
    >
      {/* Thumb */}
      {cert.imageUrl && !imgError ? (
        <div
          className={`relative overflow-hidden bg-[#0a0a0d] shrink-0 ${
            listMode ? "w-[180px] self-stretch" : "w-full aspect-[16/10]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cert.imageUrl}
            alt={cert.title}
            width={320}
            height={200}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <DatePill date={date} />
        </div>
      ) : (
        <PlaceholderBand cert={cert} listMode={listMode} date={date} />
      )}

      {/* Meta bar */}
      <div className="flex flex-col flex-1 p-3.5 gap-[10px] min-w-0">
        {/* Row 1: issuer + category. Image-less cards already show issuer and date in the band. */}
        {hasImage && (
          <div className="flex items-center gap-2 flex-wrap">
            <IssuerPill issuer={cert.issuer} />
            <span
              className="text-xs uppercase tracking-[0.18em] ml-auto text-gray-500 dark:text-[#a1a1aa]"
              style={{ fontFamily: MONO }}
            >
              {cert.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h4
          className="text-[14.5px] font-semibold leading-[1.35] text-gray-900 dark:text-white m-0 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: listMode ? undefined : "calc(1.35em * 2)",
          }}
        >
          {cert.title}
        </h4>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {displaySkills.map((s) => (
            <span
              key={s}
              className="text-xs text-gray-600 dark:text-[#c9c9cf] px-[7px] py-[3px] rounded-full border border-black/[0.08] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]"
              style={{ fontFamily: MONO }}
            >
              {s}
            </span>
          ))}
          {extra > 0 && (
            <span
              className="text-xs text-gray-500 dark:text-[#a1a1aa] px-[7px] py-[3px]"
              style={{ fontFamily: MONO }}
            >
              +{extra}
            </span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-black/[0.08] dark:border-white/[0.07]">
          <span
            className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#a1a1aa]"
            style={{ fontFamily: MONO }}
          >
            {cert.duration ? `${cert.duration} · ` : ""}
            {hasImage ? date : cert.category}
          </span>
          <span
            className="text-xs uppercase tracking-[0.14em] text-amber-700 dark:text-[#f5c518]"
            style={{ fontFamily: MONO }}
          >
            View ↗
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Modal ─── */
function CertModal({ cert, onClose }: { cert: Cert; onClose: () => void }) {
  const color = issuerColor(cert.issuer);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          '[href], button, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const copyId = async () => {
    if (!cert.certId) return;
    try {
      await navigator.clipboard.writeText(cert.certId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* silent */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-7"
      style={{ background: "rgba(2,2,5,0.86)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1080px] rounded-[18px] border border-white/[0.14] overflow-hidden flex flex-col sm:grid max-h-[92vh] sm:max-h-[90vh] shadow-[0_40px_100px_rgba(0,0,0,0.65)]"
        style={{
          background: "linear-gradient(180deg, #14141b, #0b0b10)",
          gridTemplateColumns: "1.4fr 0.9fr",
        }}
      >
        {/* Close */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          aria-label="Close certificate details"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center border border-white/[0.14] text-white text-[15px] hover:bg-white/[0.08] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
          style={{ background: "rgba(20,20,26,0.85)" }}
        >
          ✕
        </button>

        {/* Left: image/placeholder */}
        {cert.imageUrl && !imgError ? (
          <div className="flex items-center justify-center p-6 bg-[#07070a] border-b sm:border-b-0 sm:border-r border-white/[0.07] max-h-[45vh] sm:max-h-[90vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cert.imageUrl}
              alt={cert.title}
              width={640}
              height={420}
              onError={() => setImgError(true)}
              className="max-w-full max-h-full object-contain rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            />
          </div>
        ) : (
          <div
            className="relative flex flex-col p-10 sm:p-14 min-h-[200px] sm:min-h-[360px] border-b sm:border-b-0 sm:border-r border-white/[0.07] overflow-hidden"
            style={{
              background: `radial-gradient(140% 140% at 0% 0%, ${color}55 0%, transparent 50%),
                           linear-gradient(160deg, ${color}22 0%, #0a0a0d 100%)`,
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.32em] mb-4 sm:mb-6"
              style={{ fontFamily: MONO, color: `color-mix(in oklab, ${color} 90%, #fff)` }}
            >
              {cert.issuer}
            </span>
            <span className="text-[22px] sm:text-[26px] font-semibold leading-[1.2] text-white max-w-[85%]">
              {cert.title}
            </span>
            <span
              className="text-xs uppercase tracking-[0.2em] mt-3 text-[#c9c9cf]"
              style={{ fontFamily: MONO }}
            >
              Verify via link below
            </span>
            <span
              className="absolute right-[10px] bottom-[-20px] select-none pointer-events-none opacity-[0.15]"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 160,
                lineHeight: 1,
                color,
              }}
            >
              {initials(cert.issuer)}
            </span>
          </div>
        )}

        {/* Right: details */}
        <div className="flex flex-col gap-4 p-6 sm:p-7 overflow-y-auto">
          {/* Issuer row */}
          <div className="flex items-center gap-2 flex-wrap">
            <IssuerPill issuer={cert.issuer} onDark />
            <span
              className="text-xs uppercase tracking-[0.18em] text-[#a1a1aa]"
              style={{ fontFamily: MONO }}
            >
              {cert.category}
            </span>
          </div>

          {/* Title */}
          <h3 id="cert-modal-title" className="text-[20px] sm:text-[22px] font-semibold leading-[1.25] text-white m-0">
            {cert.title}
          </h3>

          {/* Meta grid */}
          <dl
            className="grid gap-x-4 gap-y-2 text-[13px]"
            style={{ gridTemplateColumns: "max-content 1fr" }}
          >
            <dt className="text-xs uppercase tracking-[0.18em] text-[#a1a1aa] pt-[3px]" style={{ fontFamily: MONO }}>
              Issued
            </dt>
            <dd className="m-0 text-[#e0e0e6]">{fmtDateLong(cert.date)}</dd>

            {cert.duration && (
              <>
                <dt className="text-xs uppercase tracking-[0.18em] text-[#a1a1aa] pt-[3px]" style={{ fontFamily: MONO }}>
                  Duration
                </dt>
                <dd className="m-0 text-[#e0e0e6]">{cert.duration}</dd>
              </>
            )}

            {cert.certId && (
              <>
                <dt className="text-xs uppercase tracking-[0.18em] text-[#a1a1aa] pt-[3px]" style={{ fontFamily: MONO }}>
                  Cert ID
                </dt>
                <dd className="m-0 flex items-start gap-2 flex-wrap">
                  <span
                    className="text-xs text-[#e0e0e6] break-all leading-snug"
                    style={{ fontFamily: MONO }}
                  >
                    {cert.certId.length > 36 ? `${cert.certId.slice(0, 16)}…` : cert.certId}
                  </span>
                  <button
                    type="button"
                    onClick={copyId}
                    aria-label="Copy certificate ID"
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] border text-xs active:scale-[0.97] transition-[color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] ${
                      copied
                        ? "text-[#6fcf97] border-[#6fcf97]/40"
                        : "text-white border-white/[0.08] hover:border-white/[0.18]"
                    }`}
                    style={{ fontFamily: MONO, background: "rgba(255,255,255,0.025)" }}
                  >
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </dd>
              </>
            )}
          </dl>

          {/* Skills */}
          <div>
            <div
              className="text-xs uppercase tracking-[0.24em] text-[#a1a1aa] mb-2"
              style={{ fontFamily: MONO }}
            >
              Skills covered
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cert.skills.length > 0 ? (
                cert.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs text-[#c9c9cf] px-[7px] py-[3px] rounded-full border border-white/[0.07] bg-white/[0.02]"
                    style={{ fontFamily: MONO }}
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#a1a1aa]" style={{ fontFamily: MONO }}>
                  No skills listed
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-[14px] border-t border-dashed border-white/[0.07] flex gap-2.5 flex-wrap">
            {cert.verifyUrl && (
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[10px] px-4 py-[10px] rounded-full bg-[#f5c518] text-[#1a1500] font-semibold text-[13px] hover:bg-[#ffd93a] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141b]"
              >
                Verify Certificate
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a1500] text-[#f5c518] text-xs" aria-hidden="true">
                  ↗
                </span>
              </a>
            )}
            {!cert.verifyUrl && (!cert.imageUrl || imgError) && (
              <span className="text-xs text-[#a1a1aa]" style={{ fontFamily: MONO }}>
                No verification link available
              </span>
            )}
            {cert.imageUrl && !imgError && (
              <a
                href={cert.imageUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-[10px] rounded-full text-white border border-white/[0.14] text-[13px] font-semibold hover:bg-white/[0.04] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
              >
                Download ↓
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Filter chip ─── */
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 px-[11px] py-[15px] sm:py-[10px] rounded-full border text-xs active:scale-[0.97] transition-[background-color,color,border-color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] ${
        active
          ? "bg-[#f5c518] text-[#1a1500] border-[#f5c518] font-semibold"
          : "bg-black/[0.02] dark:bg-white/[0.015] text-gray-600 dark:text-[#c9c9cf] border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.16] dark:hover:border-white/[0.14] hover:text-gray-900 dark:hover:text-white"
      }`}
      style={{ fontFamily: MONO, letterSpacing: "0.06em" }}
    >
      {label}
      <span className={`text-xs ${active ? "text-[#1a1500]/80" : "text-gray-500 dark:text-[#a1a1aa]"}`}>
        {count}
      </span>
    </button>
  );
}


/* ─── Main section ─── */
export default function Certifications() {
  const { ref } = useSectionInView("Certifications", 0.05);

  const [query, setQuery] = useState("");
  const [selectedIssuer, setSelectedIssuer] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [sort, setSort] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCert, setSelectedCert] = useState<Cert | null>(null);
  const [showAll, setShowAll] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const issuerSet = useMemo(
    () => [...new Set(rawCerts.map((c) => c.issuer))].sort(),
    []
  );
  const catSet = useMemo(
    () => [...new Set(rawCerts.map((c) => c.category))].sort(),
    []
  );
  const issuerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rawCerts.forEach((c) => { counts[c.issuer] = (counts[c.issuer] ?? 0) + 1; });
    return counts;
  }, []);
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rawCerts.forEach((c) => { counts[c.category] = (counts[c.category] ?? 0) + 1; });
    return counts;
  }, []);

  const total = rawCerts.length;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let arr = rawCerts.filter((c) => {
      if (selectedIssuer !== "All" && c.issuer !== selectedIssuer) return false;
      if (selectedCategory !== "All" && c.category !== selectedCategory) return false;
      if (selectedYear !== "All" && String(yearOf(c.date)) !== selectedYear) return false;
      if (!q) return true;
      return [c.title, c.issuer, c.category, c.certId, ...c.skills]
        .join(" | ")
        .toLowerCase()
        .includes(q);
    });

    arr = [...arr].sort((a, b) => {
      switch (sort) {
        case "newest": return b.date.localeCompare(a.date);
        case "oldest": return a.date.localeCompare(b.date);
        case "az": return a.title.localeCompare(b.title);
        case "issuer":
          return a.issuer.localeCompare(b.issuer) || b.date.localeCompare(a.date);
      }
    });
    return arr;
  }, [query, selectedIssuer, selectedCategory, selectedYear, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const isFiltered = query !== "" || selectedIssuer !== "All" || selectedCategory !== "All" || selectedYear !== "All";

  const clearAll = useCallback(() => {
    setQuery("");
    setSelectedIssuer("All");
    setSelectedCategory("All");
    setSelectedYear("All");
    setCurrentPage(1);
    if (searchRef.current) searchRef.current.value = "";
  }, []);

  /* Cmd/Ctrl + K → focus search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <section
      ref={ref}
      id="certifications"
      className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <SectionHeading
          className="!mb-10"
          kicker={`${total} certificates from ${issuerSet.length} issuers, focused on agentic AI and LLM engineering.`}
        >
          Certifications
        </SectionHeading>
      </motion.div>

      {!showAll && (
        <h3
          className="mb-4 text-xs uppercase tracking-[0.22em] text-gray-600 dark:text-[#a1a1aa]"
          style={{ fontFamily: MONO }}
        >
          Featured
        </h3>
      )}

      {showAll && (
      <>
      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-4">
        {/* Search */}
        <div className="relative flex items-center gap-2.5 px-4 border border-black/[0.08] dark:border-white/[0.07] rounded-xl bg-white dark:bg-[#101015] transition-colors focus-within:border-[#f5c518]/40">
          <svg className="w-4 h-4 shrink-0 text-gray-500 dark:text-[#a1a1aa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search by title, issuer, skill, or certificate ID…"
            className="flex-1 bg-transparent border-0 outline-none py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#8a8a93]"
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            aria-label="Search certifications"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setQuery(""); setCurrentPage(1); if (searchRef.current) searchRef.current.value = ""; }}
              className="rounded text-gray-500 dark:text-[#a1a1aa] hover:text-gray-900 dark:hover:text-white text-[13px] px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
            >
              ✕
            </button>
          )}
          <kbd
            className="hidden sm:inline text-xs text-gray-500 dark:text-[#a1a1aa] px-[7px] py-[3px] rounded-[5px] border border-black/[0.08] dark:border-white/[0.07]"
            style={{ fontFamily: MONO }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Sort + view */}
        <div className="flex gap-2">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortMode); setCurrentPage(1); }}
            className="flex-1 sm:flex-none appearance-none bg-white dark:bg-[#101015] dark:[color-scheme:dark] border border-black/[0.08] dark:border-white/[0.07] text-gray-700 dark:text-white px-3 py-2.5 rounded-xl text-xs outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] cursor-pointer pr-8"
            style={{ fontFamily: MONO, letterSpacing: "0.12em", textTransform: "uppercase" }}
            aria-label="Sort certifications"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A–Z</option>
            <option value="issuer">By Issuer</option>
          </select>
          <button
            type="button"
            onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
            aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] text-gray-600 dark:text-white text-xs hover:border-black/[0.16] dark:hover:border-white/[0.14] active:scale-[0.97] transition-[border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
            style={{ fontFamily: MONO, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            {viewMode === "grid" ? (
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            ) : (
              <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
            {viewMode === "grid" ? "Grid" : "List"}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-col sm:flex-row gap-4 items-start mb-4 pb-4 border-b border-dashed border-black/[0.08] dark:border-white/[0.07]">
        <div className="flex items-center flex-wrap gap-1.5">
          <span
            className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-[#a1a1aa] mr-1 whitespace-nowrap"
            style={{ fontFamily: MONO }}
          >
            Issuer
          </span>
          <FilterChip
            label="All"
            count={rawCerts.length}
            active={selectedIssuer === "All"}
            onClick={() => { setSelectedIssuer("All"); setCurrentPage(1); }}
          />
          {issuerSet.map((iss) => (
            <FilterChip
              key={iss}
              label={iss}
              count={issuerCounts[iss] ?? 0}
              active={selectedIssuer === iss}
              onClick={() => { setSelectedIssuer(iss); setCurrentPage(1); }}
            />
          ))}
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          <span
            className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-[#a1a1aa] mr-1 whitespace-nowrap"
            style={{ fontFamily: MONO }}
          >
            Category
          </span>
          <FilterChip
            label="All"
            count={rawCerts.length}
            active={selectedCategory === "All"}
            onClick={() => { setSelectedCategory("All"); setCurrentPage(1); }}
          />
          {catSet.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              count={catCounts[cat] ?? 0}
              active={selectedCategory === cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
            />
          ))}
        </div>
      </div>

      {/* Results meta */}
      <div className="flex items-center justify-between mb-4" style={{ fontFamily: MONO }}>
        <span className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#a1a1aa]">
          Showing{" "}
          <span className="text-gray-900 dark:text-white font-medium">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
          </span>
          {" "}of{" "}
          <span className="text-gray-900 dark:text-white font-medium">{filtered.length}</span>
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded text-xs uppercase tracking-[0.14em] text-amber-700 dark:text-[#f5c518] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      </>
      )}

      {/* Grid / list */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center border border-dashed border-black/[0.08] dark:border-white/[0.07] rounded-[14px]"
          >
            <p className="text-[22px] font-semibold text-gray-900 dark:text-white mb-2">No certifications match</p>
            <p className="text-gray-500 dark:text-[#a1a1aa] text-[14px] mb-4">
              Try a different search term or clear your filters.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 border border-black/[0.10] dark:border-white/[0.14] rounded-full text-xs uppercase tracking-[0.18em] text-gray-700 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
              style={{ fontFamily: MONO }}
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={showAll ? `${viewMode}-${currentPage}` : "featured"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]"
                : "flex flex-col gap-[10px]"
            }
          >
            {(showAll ? filtered : featuredCerts).map((cert, i) => (
              <div
                key={cert.id}
                className={!showAll || (i >= pageStart && i < pageEnd) ? undefined : "hidden"}
              >
                <CertCard
                  cert={cert}
                  onClick={() => setSelectedCert(cert)}
                  listMode={showAll && viewMode === "list"}
                  index={showAll ? i - pageStart : i}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showAll && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={(p) => {
            setCurrentPage(p);
            document.getElementById("certifications")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          variant="pill"
        />
      )}

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => {
            if (showAll) {
              clearAll();
              document.getElementById("certifications")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            setShowAll((v) => !v);
          }}
          aria-expanded={showAll}
          className="px-5 py-2.5 border border-black/[0.12] dark:border-white/[0.16] rounded-full text-xs uppercase tracking-[0.18em] text-gray-800 dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] active:scale-[0.97] transition-[background-color,transform] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
          style={{ fontFamily: MONO }}
        >
          {showAll ? "Show featured only" : `View all ${total} certifications`}
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCert && (
          <CertModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
