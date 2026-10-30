"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { fmtDateLong, initials, issuerColor, type Cert } from "./data";

const MONO = "var(--font-geist-mono)";
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

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

/* ─── Modal ─── */
export default function CertModal({ cert, onClose }: { cert: Cert; onClose: () => void }) {
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
    <m.div
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
      <m.div
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
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center border border-white/[0.14] text-white text-[15px] hover:bg-white/[0.08] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] border text-xs active:scale-[0.97] transition-[color,border-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
                className="inline-flex items-center gap-[10px] px-4 py-[10px] rounded-full bg-accent text-[#1a1500] font-semibold text-[13px] hover:bg-[#ffd93a] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#14141b]"
              >
                Verify Certificate
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a1500] text-accent text-xs" aria-hidden="true">
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
                className="inline-flex items-center gap-2 px-4 py-[10px] rounded-full text-white border border-white/[0.14] text-[13px] font-semibold hover:bg-white/[0.04] active:scale-[0.97] transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Download ↓
              </a>
            )}
          </div>
        </div>
      </m.div>
    </m.div>
  );
}

