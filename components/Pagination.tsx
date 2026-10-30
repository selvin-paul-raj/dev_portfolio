"use client";

import { MdChevronLeft, MdChevronRight } from "react-icons/md";

type Variant = "pill" | "square";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (p: number) => void;
  variant?: Variant;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
  variant = "square",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const raw: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      raw.push(i);
    }
  }

  const withEllipsis: (number | "…")[] = [];
  let prev = 0;
  for (const p of raw) {
    if (prev && p - prev > 1) withEllipsis.push("…");
    withEllipsis.push(p);
    prev = p;
  }

  const isPill = variant === "pill";
  const r = isPill ? "rounded-full" : "rounded-lg";
  const activeBtn = isPill
    ? "bg-accent text-[#1a1500] border-accent font-semibold"
    : "bg-gray-900 dark:bg-accent text-white dark:text-black shadow-sm";
  const inactiveBtn = isPill
    ? "border border-line text-fg-2 hover:border-line-strong hover:text-fg"
    : "bg-white dark:bg-white/5 border border-line text-fg-2 hover:bg-gray-50 dark:hover:bg-white/10";
  const navBtn = isPill
    ? "border border-line text-muted disabled:opacity-30 hover:not-disabled:border-line-strong"
    : "bg-white dark:bg-white/5 border border-line text-muted disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-gray-50 dark:hover:not-disabled:bg-white/10";

  return (
    <nav
      aria-label="Pagination"
      className={`flex justify-center items-center gap-1.5 mt-8 ${className}`}
    >
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`w-11 h-11 ${r} flex items-center justify-center active:scale-95 ${navBtn}`}
        style={{ transition: "transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        {isPill ? "←" : <MdChevronLeft size={20} />}
      </button>

      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-11 h-11 flex items-center justify-center text-sm text-muted select-none"
          >
            {isPill ? "···" : "…"}
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-11 h-11 ${r} flex items-center justify-center text-[12px] border active:scale-95 ${
              p === currentPage ? activeBtn : inactiveBtn
            }`}
            style={{ transition: "transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`w-11 h-11 ${r} flex items-center justify-center active:scale-95 ${navBtn}`}
        style={{ transition: "transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        {isPill ? "→" : <MdChevronRight size={20} />}
      </button>
    </nav>
  );
}
