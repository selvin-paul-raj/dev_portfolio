"use client";

import { MdArrowOutward } from "react-icons/md";
import { useSectionInView } from "@/lib/hooks";
import { recognitionData } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import Podium, { type Placing } from "./recognition/Podium";
import Publication, { fmtMonth } from "./recognition/Publication";

type Achievement = Placing & { description?: string; links?: { linkedin?: string } };

const pubs = recognitionData.publications;
const achievements = recognitionData.achievements as Achievement[];
// Awards without a rank are recognition at work; ranked ones are competition placings.
const atWork = achievements.filter((a) => a.rank === undefined);
const placings = achievements.filter((a) => a.rank !== undefined);
const wins = placings.filter((a) => a.rank === 1).length;

const LABEL = "text-sm font-medium text-gray-600 dark:text-white/55";

function WorkAward({ award }: { award: Achievement }) {
  return (
    <article className="flex flex-col gap-3">
      <p className="text-sm text-gray-600 dark:text-white/55">
        <span className="font-medium text-amber-700 dark:text-accent">{award.issuer}</span>, {award.associated_with},{" "}
        <span className="font-mono text-xs tabular-nums">{fmtMonth(award.date)}</span>
      </p>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{award.title}</h3>
      {award.description && <p className="max-w-[60ch] text-[15px] leading-relaxed text-gray-700 dark:text-[#c9c9cf]">{award.description}</p>}
      {award.links?.linkedin && (
        <a
          href={award.links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-accent hover:underline underline-offset-4 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          See it on LinkedIn <MdArrowOutward size={14} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export default function Recognition() {
  const { ref } = useSectionInView("Recognition", 0.3);

  return (
    <section ref={ref} id="recognition" className="mb-28 w-full max-w-[1240px] mx-auto px-4 sm:px-10 scroll-mt-28">
      <SectionHeading
        kicker={`${pubs.length} published ${pubs.length === 1 ? "paper" : "papers"}, recognition at work, and ${placings.length} competition placings including ${wins} wins.`}
      >
        Recognition
      </SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 lg:gap-16 items-start">
        <div className="flex flex-col gap-4">
          <h3 className={LABEL}>Research</h3>
          {pubs.map((p) => (
            <Publication key={p.paperId} paper={p} />
          ))}
        </div>

        <div className="flex flex-col gap-12">
          {atWork.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className={LABEL}>Recognised at work</h3>
              <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#101015] p-6">
                {atWork.map((a) => (
                  <WorkAward key={a.title} award={a} />
                ))}
              </div>
            </div>
          )}
          {placings.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className={LABEL}>Competitions</h3>
              <Podium placings={placings} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
