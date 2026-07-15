"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import { recognitionData } from "@/lib/data";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const MONO = "var(--font-geist-mono)";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

type Tab = "pubs" | "ach";

type Achievement = {
  title: string;
  issuer: string;
  date: string;
  category: string;
  associated_with: string;
  certificate_available: boolean;
  rank?: number;
  roman?: string;
  ordinal?: string;
  description?: string;
  links?: { linkedin?: string };
};

const RANK_COLORS: Record<number, string> = {
  1: "#f5c518",
  2: "#c5c8cf",
  3: "#d99565",
};

function formatDate(dateStr: string) {
  const [y, m] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export default function Recognition() {
  const { ref } = useSectionInView("Recognition", 0.3);
  const [tab, setTab] = useState<Tab>("pubs");

  const pubs = recognitionData.publications;
  const achs = recognitionData.achievements as Achievement[];
  const featuredAchs = achs.filter((a) => a.rank === undefined);
  const rankedAchs = achs.filter((a) => a.rank !== undefined);

  return (
    <motion.section
      ref={ref}
      id="recognition"
      className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {/* Section header */}
      <div className="flex flex-col items-center gap-[18px] mb-6">
        <span className="w-px h-12 bg-gradient-to-b from-transparent via-black/10 to-transparent dark:via-white/[0.14]" />
        <h2 className="text-[34px] font-semibold tracking-[0.18em] text-gray-900 dark:text-[#ededee] m-0">
          RECOGNITION
        </h2>
        <p className="font-mono text-[11px] tracking-[0.32em] text-gray-500 dark:text-[#8a8a93] uppercase mb-2" style={{ fontFamily: MONO }}>
          <span className="text-amber-700 dark:text-[#f5c518] font-medium">0{pubs.length}</span> publication
          {" · "}
          <span className="text-amber-700 dark:text-[#f5c518] font-medium">0{achs.length}</span> awards
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-10">
        <div
          className="inline-flex gap-1 p-1 border border-black/[0.08] dark:border-white/[0.07] rounded-full bg-black/[0.02] dark:bg-white/[0.03] backdrop-blur-sm"
        >
          {(["pubs", "ach"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-selected={tab === t}
              className={`
                flex items-center gap-2 px-[18px] py-[9px] rounded-full transition-all duration-200
                font-mono text-[11px] tracking-[0.22em] uppercase outline-none
                focus-visible:ring-2 focus-visible:ring-[#f5c518]
                ${tab === t
                  ? "bg-[#f5c518] text-[#1a1500] font-medium"
                  : "text-gray-500 dark:text-[#8a8a93] hover:text-gray-900 dark:hover:text-white"
                }
              `}
              style={{ fontFamily: MONO }}
            >
              {t === "pubs" ? "Publications" : "Achievements"}
              <span
                className={`text-[10px] px-[7px] py-[1px] rounded-full
                  ${tab === t ? "bg-black/[0.18] text-[#1a1500]" : "bg-black/[0.05] dark:bg-white/[0.05] text-gray-500 dark:text-[#8a8a93]"}
                `}
              >
                0{t === "pubs" ? pubs.length : achs.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      <AnimatePresence mode="wait">
        {tab === "pubs" && (
          <motion.div
            key="pubs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            {pubs.map((pub) => (
              <article
                key={pub.paperId}
                className="relative overflow-hidden rounded-[20px] border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] p-7 sm:p-8"
                style={{
                  background: undefined,
                }}
              >
                {/* Corner L-accent — top bar */}
                <span className="absolute top-0 left-0 w-[120px] h-[2px] bg-[#f5c518]" />
                {/* Corner L-accent — left bar */}
                <span className="absolute top-0 left-0 w-[2px] h-[120px] bg-[#f5c518]" />

                {/* Meta row */}
                <div
                  className="flex items-center flex-wrap gap-[10px] text-[10px] tracking-[0.22em] uppercase text-gray-500 dark:text-[#8a8a93] mb-[18px]"
                  style={{ fontFamily: MONO }}
                >
                  <span className="inline-flex items-center gap-[7px] px-[10px] py-1 rounded-full bg-green-50 dark:bg-[#6fcf97]/10 text-green-700 dark:text-[#6fcf97] border border-green-200 dark:border-[#6fcf97]/25">
                    <span className="w-[6px] h-[6px] rounded-full bg-green-600 dark:bg-[#6fcf97] shadow-[0_0_8px_#6fcf97]" />
                    {pub.status}
                  </span>
                  <span className="text-gray-500 dark:text-[#54545c]">/</span>
                  <span>{formatDate(pub.publication_date)}</span>
                  <span className="text-gray-500 dark:text-[#54545c]">/</span>
                  <span className="px-[10px] py-1 rounded-full border border-black/[0.08] dark:border-white/[0.07]">{pub.type}</span>
                </div>

                {/* Title */}
                <h3
                  className="text-[clamp(18px,2.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.015em] text-gray-900 dark:text-white mb-[14px] max-w-[920px]"
                >
                  {pub.title}
                </h3>

                {/* Publisher */}
                <div className="flex items-center flex-wrap gap-[10px] text-[14px] text-gray-600 dark:text-[#c9c9cf] mb-[18px]">
                  <span className="text-amber-700 dark:text-[#f5c518] font-medium">{pub.publisher}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#54545c]" />
                  <span>{pub.publisherFull}</span>
                </div>

                {/* Description */}
                <p className="text-[15px] leading-[1.7] text-gray-600 dark:text-[#c9c9cf] mb-4 max-w-[920px]">
                  {pub.description}
                </p>

                {/* Abstract */}
                <div
                  className="relative pl-4 py-1 mb-[22px] border-l-2 border-amber-500 dark:border-[#f5c518] max-w-[880px]"
                  style={{ fontFamily: SERIF, fontStyle: "italic" }}
                >
                  <span
                    className="block not-italic text-[10px] tracking-[0.24em] text-amber-700 dark:text-[#f5c518] uppercase mb-[6px]"
                    style={{ fontFamily: MONO, fontStyle: "normal" }}
                  >
                    Abstract
                  </span>
                  <p className="text-[17px] leading-[1.55] text-gray-700 dark:text-[#e0e0e6] m-0">
                    {pub.abstract}
                  </p>
                </div>

                {/* 2-col: Features + Stack */}
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 mt-[6px]">
                  {/* Features */}
                  <div>
                    <div
                      className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-gray-500 dark:text-[#8a8a93] uppercase mb-3"
                      style={{ fontFamily: MONO }}
                    >
                      <span className="text-amber-700 dark:text-[#f5c518]">01</span> · Key Features
                    </div>
                    <ul className="list-none p-0 m-0 grid gap-2">
                      {pub.features.map((f) => (
                        <li key={f} className="flex items-start gap-[10px] text-[13.5px] text-gray-600 dark:text-[#d5d5db] leading-[1.5]">
                          <span
                            className="flex-none w-[18px] h-[18px] mt-[1px] flex items-center justify-center rounded-[4px] bg-amber-50 dark:bg-[#f5c518]/[0.08] border border-amber-300 dark:border-[#f5c518]/30 text-amber-700 dark:text-[#f5c518]"
                            style={{ fontFamily: MONO, fontSize: "9px", lineHeight: 1 }}
                          >
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stack */}
                  <div>
                    <div
                      className="flex items-center gap-2 text-[10px] tracking-[0.24em] text-gray-500 dark:text-[#8a8a93] uppercase mb-3"
                      style={{ fontFamily: MONO }}
                    >
                      <span className="text-amber-700 dark:text-[#f5c518]">02</span> · Stack
                    </div>
                    <div className="flex flex-wrap gap-[6px]">
                      {pub.technologies.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] text-gray-600 dark:text-[#dcdce2] tracking-[0.04em] px-[10px] py-[6px] border border-black/[0.10] dark:border-white/[0.07] rounded-full bg-white dark:bg-white/[0.015] hover:border-[#f5c518]/40 hover:text-[#f5c518] hover:bg-[#f5c518]/[0.05] transition-all duration-150 cursor-default"
                          style={{ fontFamily: MONO }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between flex-wrap gap-[14px] mt-[26px] pt-[22px] border-t border-dashed border-black/[0.10] dark:border-white/[0.14]">
                  <div className="text-[11px] text-gray-500 dark:text-[#8a8a93] tracking-[0.06em]" style={{ fontFamily: MONO }}>
                    Paper ID · <span className="text-gray-900 dark:text-white font-medium">{pub.paperId}</span>
                  </div>
                  <a
                    href={pub.research_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[10px] px-4 py-[10px] rounded-full bg-[#f5c518] text-[#1a1500] font-semibold text-[13px] hover:bg-[#ffd93a] hover:-translate-y-[1px] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2"
                  >
                    Read Paper
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a1500] text-[#f5c518] text-[11px]">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </motion.div>
        )}

        {tab === "ach" && (
          <motion.div
            key="ach"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="flex flex-col gap-4"
          >
            {/* Featured awards (no rank) — full-width cards */}
            {featuredAchs.map((ach, i) => (
              <motion.article
                key={ach.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: EASE_OUT }}
                className="relative overflow-hidden rounded-[20px] border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] p-7 sm:p-8"
              >
                {/* Corner L-accent */}
                <span className="absolute top-0 left-0 w-[80px] h-[2px] bg-[#f5c518]" />
                <span className="absolute top-0 left-0 w-[2px] h-[80px] bg-[#f5c518]" />

                {/* Meta row */}
                <div
                  className="flex items-center flex-wrap gap-[10px] text-[10px] tracking-[0.22em] uppercase text-gray-500 dark:text-[#8a8a93] mb-[16px]"
                  style={{ fontFamily: MONO }}
                >
                  <span className="inline-flex items-center gap-[7px] px-[10px] py-1 rounded-full bg-amber-50 dark:bg-[#f5c518]/[0.1] text-amber-700 dark:text-[#f5c518] border border-amber-200 dark:border-[#f5c518]/25">
                    <span
                      className="w-[6px] h-[6px] rounded-full bg-amber-500 dark:bg-[#f5c518] shrink-0"
                      style={{ boxShadow: "0 0 7px #f5c51880" }}
                    />
                    {ach.category}
                  </span>
                  <span className="text-gray-500 dark:text-[#54545c]">/</span>
                  <span>{formatDate(ach.date)}</span>
                  <span className="text-gray-500 dark:text-[#54545c]">/</span>
                  <span className="px-[10px] py-1 rounded-full border border-black/[0.08] dark:border-white/[0.07]">{ach.issuer}</span>
                  {ach.associated_with && (
                    <>
                      <span className="text-gray-500 dark:text-[#54545c]">/</span>
                      <span>{ach.associated_with}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-[clamp(20px,2.4vw,26px)] font-semibold leading-[1.2] tracking-[-0.015em] text-gray-900 dark:text-white mb-[14px]">
                  {ach.title}
                </h3>

                {/* Description */}
                {ach.description && (
                  <p className="text-[15px] leading-[1.7] text-gray-600 dark:text-[#c9c9cf] mb-[22px] max-w-[920px]">
                    {ach.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between flex-wrap gap-[14px] pt-[18px] border-t border-dashed border-black/[0.10] dark:border-white/[0.14]">
                  {ach.certificate_available && (
                    <div
                      className="flex items-center gap-[6px] text-[11px] tracking-[0.16em] uppercase text-green-700 dark:text-[#6fcf97]"
                      style={{ fontFamily: MONO }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full bg-green-600 dark:bg-[#6fcf97] shrink-0"
                        style={{ boxShadow: "0 0 6px #6fcf97" }}
                      />
                      Certificate Available
                    </div>
                  )}
                  {ach.links?.linkedin && (
                    <a
                      href={ach.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-[10px] px-4 py-[10px] rounded-full bg-[#f5c518] text-[#1a1500] font-semibold text-[13px] hover:bg-[#ffd93a] hover:-translate-y-[1px] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518] focus-visible:ring-offset-2"
                    >
                      View on LinkedIn
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a1500] text-[#f5c518] text-[11px]">↗</span>
                    </a>
                  )}
                </div>
              </motion.article>
            ))}

            {/* Competition wins — 4-col grid */}
            {rankedAchs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {rankedAchs.map((ach, i) => {
                  const rankColor = RANK_COLORS[ach.rank!] ?? "#8a8a93";
                  return (
                    <motion.article
                      key={ach.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (featuredAchs.length + i) * 0.07, ease: EASE_OUT }}
                      className="relative overflow-hidden rounded-[16px] border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] p-[22px_20px_20px] flex flex-col gap-[14px] hover:-translate-y-[2px] hover:border-black/[0.14] dark:hover:border-white/[0.14] transition-all duration-200"
                    >
                      {/* Rank glow */}
                      <span
                        className="absolute pointer-events-none"
                        style={{
                          top: "-50%", right: "-10%",
                          width: 180, height: 180,
                          borderRadius: "50%",
                          background: `radial-gradient(closest-side, ${rankColor}, transparent 70%)`,
                          opacity: 0.12,
                        }}
                      />

                      {/* Top row: medal + category */}
                      <div className="flex items-start justify-between gap-[10px]">
                        <div
                          className="w-14 h-14 rounded-[16px] flex items-center justify-center text-[28px] leading-none shrink-0"
                          style={{
                            background: `linear-gradient(160deg, ${rankColor}30, ${rankColor}0d)`,
                            border: `1px solid ${rankColor}66`,
                            color: rankColor,
                            fontFamily: SERIF,
                            fontStyle: "italic",
                          }}
                        >
                          {ach.roman}
                          <span
                            className="text-[12px] self-start mt-[4px] not-italic"
                            style={{ fontFamily: MONO, fontStyle: "normal", letterSpacing: "0.04em", opacity: 0.85 }}
                          >
                            {ach.ordinal}
                          </span>
                        </div>
                        <span
                          className="text-[9.5px] tracking-[0.22em] uppercase text-gray-500 dark:text-[#8a8a93] px-[9px] py-[5px] rounded-full border border-black/[0.08] dark:border-white/[0.07] whitespace-nowrap mt-1"
                          style={{ fontFamily: MONO }}
                        >
                          {ach.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-[16px] font-semibold leading-[1.35] text-gray-900 dark:text-white mt-1">
                        {ach.title}
                      </h4>

                      {/* Meta */}
                      <div
                        className="mt-auto flex flex-col gap-[6px] pt-2 border-t border-dashed border-black/[0.08] dark:border-white/[0.07]"
                        style={{ fontFamily: MONO }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] tracking-[0.22em] uppercase text-gray-500 dark:text-[#8a8a93] min-w-[58px]">Issuer</span>
                          <span className="text-gray-800 dark:text-[#e0e0e6] font-medium text-[12px]">{ach.issuer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] tracking-[0.22em] uppercase text-gray-500 dark:text-[#8a8a93] min-w-[58px]">Date</span>
                          <span className="text-gray-800 dark:text-[#e0e0e6] font-medium text-[12px]">{formatDate(ach.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] tracking-[0.22em] uppercase text-gray-500 dark:text-[#8a8a93] min-w-[58px]">Repping</span>
                          <span className="text-gray-800 dark:text-[#e0e0e6] font-medium text-[12px] leading-[1.3]">{ach.associated_with}</span>
                        </div>
                        {ach.certificate_available && (
                          <div className="flex items-center gap-[6px] text-[10px] tracking-[0.16em] uppercase text-green-700 dark:text-[#6fcf97] mt-[4px]">
                            <span
                              className="w-[5px] h-[5px] rounded-full bg-green-600 dark:bg-[#6fcf97] shrink-0"
                              style={{ boxShadow: "0 0 6px #6fcf97" }}
                            />
                            Certificate Available
                          </div>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
