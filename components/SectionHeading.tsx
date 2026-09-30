import React from "react";

type SectionHeadingProps = {
  children: React.ReactNode;
  /** One short line under the title: what this section proves. */
  kicker?: React.ReactNode;
  className?: string;
};

/**
 * The single section header used by every section: hairline, tracked uppercase title,
 * optional kicker. Keep all sections on this so the page reads as one system.
 */
export default function SectionHeading({ children, kicker, className = "" }: SectionHeadingProps) {
  return (
    <header className={`mb-12 flex flex-col items-center gap-4 text-center ${className}`}>
      <span
        aria-hidden="true"
        className="h-12 w-px bg-gradient-to-b from-transparent via-black/15 to-transparent dark:via-white/[0.16]"
      />
      <h2 className="m-0 text-[clamp(1.75rem,1.2rem+1.6vw,2.25rem)] font-semibold uppercase leading-none tracking-[0.18em] text-gray-900 dark:text-[#ededee]">
        {children}
      </h2>
      {kicker && (
        <p className="max-w-[60ch] text-[0.95rem] leading-relaxed text-gray-600 dark:text-[#a1a1aa]">{kicker}</p>
      )}
    </header>
  );
}
