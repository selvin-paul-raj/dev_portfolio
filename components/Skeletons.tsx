/* Skeleton screens for each lazy-loaded section. */
import React from "react";

const Sh = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse rounded-md bg-gray-100 dark:bg-white/[0.06] ${className}`} style={style} />
);

/* ── Projects ── */
export function ProjectsSkeleton() {
  return (
    <div className="mb-28 w-full max-w-6xl mx-auto px-4 scroll-mt-28">
      {/* Heading */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <Sh className="h-8 w-40 rounded-lg" />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {[80, 88, 96, 84, 68].map((w, i) => (
          <Sh key={i} className={`h-8 rounded-full`} style={{ width: w } as React.CSSProperties} />
        ))}
      </div>

      {/* Count */}
      <Sh className="h-3 w-36 mx-auto mb-7 rounded-full" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden border border-black/5 dark:border-white/10 flex flex-col"
          >
            <Sh className="w-full h-44 rounded-none" />
            <div className="p-5 flex flex-col gap-3">
              <Sh className="h-5 w-3/4 rounded" />
              <Sh className="h-3 w-full rounded" />
              <Sh className="h-3 w-5/6 rounded" />
              <div className="flex gap-1.5">
                {[40, 52, 44].map((w, j) => (
                  <Sh key={j} className="h-5 rounded-sm" style={{ width: w } as React.CSSProperties} />
                ))}
              </div>
              <div className="flex gap-2 pt-0.5">
                <Sh className="h-8 w-20 rounded-md" />
                <Sh className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Skills ── */
export function SkillsSkeleton() {
  return (
    <div className="mb-28 w-full max-w-6xl mx-auto px-4">
      <Sh className="h-8 w-32 mx-auto mb-10 rounded-lg" />
      <div className="flex flex-wrap justify-center gap-3">
        {[72, 88, 64, 96, 80, 72, 104, 68, 88, 76, 92, 60, 84, 72, 96].map((w, i) => (
          <Sh key={i} className="h-8 rounded-full" style={{ width: w } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

/* ── Experience ── */
export function ExperienceSkeleton() {
  return (
    <div className="mb-28 w-full max-w-6xl mx-auto px-4">
      <Sh className="h-8 w-44 mx-auto mb-10 rounded-lg" />
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <Sh className="w-10 h-10 rounded-full shrink-0" />
              {i < 3 && <Sh className="w-[2px] h-20 mt-2 rounded-full" />}
            </div>
            <div className="flex-1 pb-6 flex flex-col gap-2">
              <Sh className="h-5 w-48 rounded" />
              <Sh className="h-3 w-32 rounded" />
              <Sh className="h-3 w-full rounded mt-1" />
              <Sh className="h-3 w-4/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Recognition ── */
export function RecognitionSkeleton() {
  return (
    <div className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <Sh className="w-px h-12 rounded-full" />
        <Sh className="h-9 w-48 rounded-lg" />
        <Sh className="h-3 w-40 rounded-full" />
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-10">
        <div className="flex gap-1 p-1 border border-black/[0.08] dark:border-white/[0.07] rounded-full bg-black/[0.02] dark:bg-white/[0.03]">
          <Sh className="h-9 w-32 rounded-full" />
          <Sh className="h-9 w-36 rounded-full" />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-[20px] border border-black/[0.08] dark:border-white/[0.07] p-7 sm:p-8">
        <Sh className="h-3 w-24 mb-4 rounded-full" />
        <Sh className="h-7 w-3/4 mb-3 rounded" />
        <Sh className="h-7 w-1/2 mb-6 rounded" />
        <Sh className="h-3 w-full mb-2 rounded" />
        <Sh className="h-3 w-5/6 mb-2 rounded" />
        <Sh className="h-3 w-4/5 mb-6 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sh key={i} className="h-6 w-full rounded" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[72, 88, 64, 80, 72, 96].map((w, i) => (
              <Sh key={i} className="h-7 rounded-full" style={{ width: w } as React.CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Certifications ── */
export function CertificationsSkeleton() {
  return (
    <div className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28">
      {/* Section header */}
      <div className="flex flex-col items-center gap-[18px] mb-6">
        <Sh className="w-px h-12 rounded-full" />
        <Sh className="h-9 w-56 rounded-lg" />
        <Sh className="h-3 w-60 rounded-full" />
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-black/[0.08] dark:border-white/[0.07] rounded-[14px] overflow-hidden mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`px-5 py-4 ${i > 0 ? "border-l border-black/[0.08] dark:border-white/[0.07]" : ""}`}>
            <Sh className="h-2.5 w-16 mb-3 rounded-full" />
            <Sh className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-4">
        <Sh className="h-12 rounded-xl" />
        <div className="flex gap-2">
          <Sh className="h-12 w-28 rounded-xl" />
          <Sh className="h-12 w-20 rounded-xl" />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {[56, 80, 88, 72, 64, 80, 72, 64].map((w, i) => (
          <Sh key={i} className="h-8 rounded-full" style={{ width: w } as React.CSSProperties} />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[14px] overflow-hidden border border-black/[0.08] dark:border-white/[0.07] flex flex-col"
          >
            <Sh className="w-full aspect-[16/10] rounded-none" />
            <div className="p-3.5 flex flex-col gap-[10px]">
              <div className="flex items-center gap-2">
                <Sh className="h-5 w-24 rounded-full" />
                <Sh className="h-3 w-16 rounded-full ml-auto" />
              </div>
              <Sh className="h-4 w-full rounded" />
              <Sh className="h-4 w-3/4 rounded" />
              <div className="flex gap-1">
                {[56, 52, 48].map((w, j) => (
                  <Sh key={j} className="h-5 rounded-full" style={{ width: w } as React.CSSProperties} />
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-dashed border-black/[0.08] dark:border-white/[0.07]">
                <Sh className="h-3 w-20 rounded-full" />
                <Sh className="h-3 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Contact ── */
export function ContactSkeleton() {
  return (
    <div className="mb-28 w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center gap-3 mb-10">
        <Sh className="h-8 w-40 rounded-lg" />
        <Sh className="h-3 w-64 rounded-full" />
      </div>
      <div className="max-w-lg mx-auto flex flex-col gap-4">
        <Sh className="h-12 w-full rounded-xl" />
        <Sh className="h-40 w-full rounded-xl" />
        <Sh className="h-12 w-40 rounded-full" />
      </div>
    </div>
  );
}
