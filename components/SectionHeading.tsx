import React from "react";

type SectionHeadingProps = {
  children: React.ReactNode;
  /** One short line under the title: what this section proves. */
  kicker?: React.ReactNode;
  className?: string;
  /** Page-level uses (/fit, /ask, /evals, /challenge) render the title as the page's h1. */
  as?: "h1" | "h2";
};

/**
 * The single section header used by every section: hairline, tracked uppercase title,
 * optional kicker. Keep all sections on this so the page reads as one system.
 */
export default function SectionHeading({ children, kicker, className = "", as: Title = "h2" }: SectionHeadingProps) {
  return (
    <header className={`mb-12 flex flex-col items-center gap-4 text-center ${className}`}>
      <span
        aria-hidden="true"
        className="h-12 w-px bg-gradient-to-b from-transparent via-fg/15 to-transparent"
      />
      <Title className="m-0 text-[clamp(1.75rem,1.2rem+1.6vw,2.25rem)] font-semibold uppercase leading-none tracking-[0.18em] text-fg">
        {children}
      </Title>
      {kicker && (
        <p className="max-w-[60ch] text-[0.95rem] leading-relaxed text-fg-2">{kicker}</p>
      )}
    </header>
  );
}
