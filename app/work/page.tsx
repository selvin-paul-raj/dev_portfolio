import type { Metadata } from "next";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { caseStudies } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Case studies: how Selvin PaulRaj K built multi-agent systems, entity resolution, guarded LLM workflows, and RAG tooling, step by step with measured results.",
  alternates: { canonical: "/work" },
};

const workCount = caseStudies.filter((c) => c.org.includes("Draup")).length;
const personalCount = caseStudies.filter((c) => !c.org.includes("Draup") && c.visibility.startsWith("Private")).length;

export default function WorkIndex() {
  return (
    <main id="content" className="w-full max-w-5xl mx-auto px-4 pt-14 pb-28 md:pl-24 md:pr-8">
      <header className="mb-14 max-w-2xl">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-gray-500 dark:text-white/50 mb-4">Work</p>
        <h1 className="text-[clamp(2.25rem,1.6rem+3vw,3.75rem)] font-semibold tracking-[-0.03em] leading-[1.02] text-gray-950 dark:text-white mb-5">
          How the systems work
        </h1>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-white/65">
          {caseStudies.length} builds, each walked through stage by stage with the numbers that came out of it. {workCount} are
          private work at Zinnov (Draup) and {personalCount} are personal projects in private repos, both shown without code;
          the other {caseStudies.length - workCount - personalCount} are public with source.
        </p>
      </header>

      <ol className="border-t border-black/10 dark:border-white/10">
        {caseStudies.map((c, i) => (
          <li key={c.slug} className="border-b border-black/10 dark:border-white/10">
            <Link
              href={`/work/${c.slug}`}
              className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:grid-cols-[3.5rem_minmax(0,1fr)_12rem_auto] items-baseline gap-x-4 py-7
                outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
            >
              <span className="font-mono text-xs tabular-nums text-accent-ink dark:text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-accent-ink dark:group-hover:text-accent"
                  style={{ transition: "color 200ms ease" }}>
                  {c.title}
                </span>
                <span className="block mt-1.5 text-sm sm:text-base leading-relaxed text-gray-600 dark:text-white/60 max-w-[58ch]">{c.subtitle}</span>
              </span>
              <span className="hidden sm:block">
                <span className="block font-mono text-sm tabular-nums text-gray-900 dark:text-white/85">{c.results[0].value}</span>
                <span className="block mt-1 text-xs leading-snug text-gray-500 dark:text-white/50">{c.results[0].label}</span>
              </span>
              <BsArrowRight
                size={16}
                aria-hidden="true"
                className="self-center text-gray-400 dark:text-white/40 group-hover:translate-x-1 group-hover:text-gray-900 dark:group-hover:text-white motion-reduce:transform-none"
                style={{ transition: "transform 200ms cubic-bezier(0.25,1,0.5,1), color 200ms ease" }}
              />
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
