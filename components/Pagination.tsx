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
    ? "bg-[#f5c518] text-[#1a1500] border-[#f5c518] font-semibold"
    : "bg-gray-900 dark:bg-[#FFD700] text-white dark:text-black shadow-sm";
  const inactiveBtn = isPill
    ? "border border-black/[0.08] dark:border-white/[0.07] text-gray-600 dark:text-[#c9c9cf] hover:border-black/[0.18] dark:hover:border-white/[0.14] hover:text-gray-900 dark:hover:text-white"
    : "bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/10";
  const navBtn = isPill
    ? "border border-black/[0.08] dark:border-white/[0.07] text-gray-500 dark:text-[#8a8a93] disabled:opacity-30 hover:not-disabled:border-black/[0.18] dark:hover:not-disabled:border-white/[0.14]"
    : "bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 text-gray-500 dark:text-white/40 disabled:opacity-30 disabled:cursor-not-allowed hover:not-disabled:bg-gray-50 dark:hover:not-disabled:bg-white/10";

  return (
    <nav
      aria-label="Pagination"
      className={`flex justify-center items-center gap-1.5 mt-8 ${className}`}
    >
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`w-9 h-9 ${r} flex items-center justify-center transition-all active:scale-95 ${navBtn}`}
        style={{ transition: "transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        {isPill ? "←" : <MdChevronLeft size={20} />}
      </button>

      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm text-gray-400 dark:text-[#54545c] select-none"
          >
            {isPill ? "···" : "…"}
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-9 h-9 ${r} flex items-center justify-center text-[12px] transition-all border active:scale-95 ${
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
        className={`w-9 h-9 ${r} flex items-center justify-center transition-all active:scale-95 ${navBtn}`}
        style={{ transition: "transform 120ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        {isPill ? "→" : <MdChevronRight size={20} />}
      </button>
    </nav>
  );
}
