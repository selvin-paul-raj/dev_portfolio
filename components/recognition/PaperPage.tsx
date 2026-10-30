import { MdArrowOutward } from "react-icons/md";

export type Publication = {
  title: string;
  publisher: string;
  publisherFull: string;
  publication_date: string;
  type: string;
  status: string;
  description: string;
  abstract: string;
  technologies: string[];
  features: string[];
  paperId: string;
  research_link?: string | null;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";

/** The paper, set like the first page of a journal article. */
export default function PaperPage({ pub }: { pub: Publication }) {
  const [y, m] = pub.publication_date.split("-");
  return (
    <article className="relative h-full rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-[#fbfaf6] dark:bg-[#121210] p-6 sm:p-8 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      {/* Running head, as on a journal page */}
      <header className="flex items-start justify-between gap-4 border-b border-black/15 dark:border-white/15 pb-3">
        <p className="text-xs leading-snug text-gray-600 dark:text-white/55">
          <span className="block font-semibold text-gray-900 dark:text-white">{pub.publisher}</span>
          {pub.publisherFull}
        </p>
        <p className="shrink-0 text-right text-xs text-gray-600 dark:text-white/55">
          {MONTHS[+m - 1]} {y}
          <span className="block font-medium text-emerald-700 dark:text-emerald-400">{pub.status}</span>
        </p>
      </header>

      <h3 className="mt-6 max-w-[34ch] text-[1.6rem] leading-[1.2] text-gray-900 dark:text-white" style={{ fontFamily: SERIF }}>
        {pub.title}
      </h3>

      <section aria-label="Abstract" className="mt-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Abstract</h4>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-700 dark:text-[#d4d4d8] max-w-[72ch] sm:[text-align:justify] [hyphens:auto]">
          {pub.description} {pub.abstract}
        </p>
      </section>

      <p className="mt-5 text-sm leading-relaxed text-gray-700 dark:text-white/75">
        <span className="font-semibold text-gray-900 dark:text-white">Keywords: </span>
        {pub.technologies.join(", ")}
      </p>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 dark:border-white/10 pt-3">
        <p className="font-mono text-[11px] text-gray-500 dark:text-white/40 break-all">Paper ID {pub.paperId}</p>
        {pub.research_link && (
          <a
            href={pub.research_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gray-900 dark:bg-accent px-4 text-sm font-semibold text-white dark:text-[#1a1500]
              outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Read the paper <MdArrowOutward size={14} aria-hidden="true" />
          </a>
        )}
      </footer>
    </article>
  );
}
