import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BsArrowRight, BsArrowUpRight } from "react-icons/bs";
import CaseStudyScrolly from "@/components/work/CaseStudyScrolly";
import { caseStudies, getCaseStudy } from "@/lib/work";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

// Only the case studies in lib/data/caseStudies.json exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  if (!study) return {};
  return {
    title: `${study.title}: case study`,
    description: study.subtitle,
    keywords: [...(study.keywords ?? []), ...study.stack],
    openGraph: { title: `${study.title}: how it works`, description: study.subtitle, type: "article", url: `/work/${study.slug}` },
    alternates: { canonical: `/work/${study.slug}` },
  };
}

const ASSURANCE_ROWS = [
  ["harness", "Harness"],
  ["evals", "Evals"],
  ["guardrails", "Guardrails"],
  ["testing", "Testing"],
] as const;

const label = "font-mono text-[0.7rem] uppercase tracking-[0.14em] text-gray-500 dark:text-white/50";

export default async function CaseStudyPage({ params }: Params) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();

  const index = caseStudies.findIndex((c) => c.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];

  return (
    <main id="content" className="w-full max-w-6xl mx-auto px-4 pt-14 pb-28 md:pl-24 md:pr-8">
      <script
        type="application/ld+json"
        // Static, server-built JSON from our own data file; no user input.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: `${study.title}: how it works`,
            description: study.subtitle,
            url: `${SITE_URL}/work/${study.slug}`,
            keywords: [...(study.keywords ?? []), ...study.stack].join(", "),
            author: { "@id": `${SITE_URL}/#person` },
            about: study.stack.map((name) => ({ "@type": "Thing", name })),
            ...(study.links.find((l) => l.label === "Source") && {
              isBasedOn: study.links.find((l) => l.label === "Source")!.href,
            }),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-10">
        <Link href="/work" className={`${label} hover:text-gray-900 dark:hover:text-white/85 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded`}>
          Work / {String(index + 1).padStart(2, "0")}
        </Link>
      </nav>

      <header className="max-w-3xl mb-12">
        <h1 className="text-[clamp(2.25rem,1.6rem+3vw,4rem)] font-semibold tracking-[-0.03em] leading-[1.02] text-gray-950 dark:text-white mb-5">
          {study.title}
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-white/65 max-w-[60ch]">{study.subtitle}</p>
      </header>

      {/* Spec strip: the facts a reviewer scans first */}
      <dl className="grid grid-cols-2 md:grid-cols-4 border-y border-black/10 dark:border-white/10 mb-16">
        {[
          ["Role", study.role],
          ["Where", study.org],
          ["When", study.period],
          ["Access", study.visibility],
        ].map(([k, v], i) => (
          <div key={k} className={`py-4 pr-4 ${i % 2 ? "pl-4 border-l" : ""} md:pl-4 md:first:pl-0 md:border-l md:first:border-l-0 border-black/10 dark:border-white/10 ${i < 2 ? "border-b md:border-b-0" : ""}`}>
            <dt className={label}>{k}</dt>
            <dd className="mt-1.5 text-sm font-medium text-gray-900 dark:text-white/85">{v}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="problem" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-x-10 gap-y-3 mb-8">
        <h2 id="problem" className={label}>Problem</h2>
        <p className="text-lg leading-[1.7] text-gray-800 dark:text-white/80 max-w-[62ch]">{study.problem}</p>
      </section>

      <section aria-label="How it works">
        <CaseStudyScrolly study={study} />
      </section>

      <section aria-labelledby="results" className="mt-8 mb-20">
        <h2 id="results" className={`${label} mb-6`}>Measured</h2>
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10">
          {study.results.map((r) => (
            <div key={r.label} className="flex flex-col-reverse justify-end bg-[#FAFAF9] dark:bg-[#09090b] p-5">
              <dt className="mt-2.5 text-sm leading-snug text-gray-600 dark:text-white/60">{r.label}</dt>
              <dd className="text-[1.9rem] font-semibold tabular-nums tracking-tight text-gray-950 dark:text-white leading-none">{r.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {study.assurance && (
        <section aria-labelledby="verified" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-x-10 gap-y-4 mb-20">
          <h2 id="verified" className={label}>How it&apos;s verified</h2>
          <dl className="max-w-4xl divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10">
            {ASSURANCE_ROWS.filter(([key]) => study.assurance?.[key]).map(([key, name]) => (
              <div key={key} className="grid sm:grid-cols-[8rem_minmax(0,1fr)] gap-x-6 gap-y-1 py-4">
                <dt className="font-mono text-xs uppercase tracking-[0.12em] text-accent-ink dark:text-accent pt-0.5">{name}</dt>
                <dd className="text-[0.95rem] leading-[1.7] text-gray-700 dark:text-white/75">{study.assurance?.[key]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {study.deepDive && study.deepDive.length > 0 && (
        <section aria-labelledby="deep-dive" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-x-10 gap-y-4 mb-20">
          <h2 id="deep-dive" className={label}>In depth</h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-10 max-w-4xl">
            {study.deepDive.map((s) => (
              <article key={s.heading}>
                <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-2">{s.heading}</h3>
                <p className="text-[0.95rem] leading-[1.7] text-gray-700 dark:text-white/70">{s.body}</p>
                {s.points && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {s.points.map((pt) => (
                      <li key={pt} className="grid grid-cols-[1rem_minmax(0,1fr)] text-sm leading-relaxed text-gray-600 dark:text-white/60">
                        <span aria-hidden="true" className="text-accent-ink dark:text-accent">·</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="decisions" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-x-10 gap-y-4 mb-20">
        <h2 id="decisions" className={label}>Decisions</h2>
        <ol className="flex flex-col gap-5 max-w-[62ch]">
          {study.decisions.map((d, i) => (
            <li key={d} className="grid grid-cols-[2rem_minmax(0,1fr)] text-base leading-[1.7] text-gray-800 dark:text-white/80">
              <span className="font-mono text-xs text-accent-ink dark:text-accent pt-1.5">{String(i + 1).padStart(2, "0")}</span>
              {d}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stack" className="grid md:grid-cols-[10rem_minmax(0,1fr)] gap-x-10 gap-y-3 mb-20">
        <h2 id="stack" className={label}>Stack</h2>
        <p className="font-mono text-sm leading-relaxed text-gray-700 dark:text-white/70">{study.stack.join("  ·  ")}</p>
      </section>

      <footer className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-10 border-t border-black/10 dark:border-white/10">
        <div className="flex flex-wrap gap-2.5">
          {study.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/15 text-sm font-medium text-gray-800 dark:text-white/80
                hover:bg-black/[0.04] dark:hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {l.label} <BsArrowUpRight size={11} />
            </a>
          ))}
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 dark:bg-accent text-white dark:text-black text-sm font-semibold
              outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Talk about this work <BsArrowRight size={12} />
          </Link>
        </div>
        <Link href={`/work/${next.slug}`} className="group text-right outline-none focus-visible:ring-2 focus-visible:ring-accent rounded">
          <span className={label}>Next case study</span>
          <span className="mt-1 flex items-center justify-end gap-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {next.title}
            <BsArrowRight size={16} className="group-hover:translate-x-1 motion-reduce:transform-none" style={{ transition: "transform 200ms cubic-bezier(0.25,1,0.5,1)" }} />
          </span>
        </Link>
      </footer>
    </main>
  );
}
