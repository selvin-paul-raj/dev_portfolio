"use client";

import { useSectionInView } from "@/lib/hooks";
import { recognitionData } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import TrophyShelf, { type Achievement } from "./recognition/TrophyShelf";
import PaperPage, { type Publication } from "./recognition/PaperPage";

const achievements = recognitionData.achievements as Achievement[];
const publications = recognitionData.publications as Publication[];

// The workplace award first, then placings by rank, newest first within a rank.
const shelf = [...achievements].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0) || b.date.localeCompare(a.date));

const WORDS = ["", "first", "second", "third"];
function tally(): string {
  const parts: string[] = [];
  for (const rank of [1, 2, 3]) {
    const n = achievements.filter((a) => a.rank === rank).length;
    if (n) parts.push(n === 1 ? `a ${WORDS[rank]} place` : `${n} ${WORDS[rank]} places`);
  }
  const other = achievements.filter((a) => !a.rank).length;
  if (other) parts.push(other === 1 ? "a workplace award" : `${other} workplace awards`);
  if (publications.length) parts.push(publications.length === 1 ? "a published paper" : `${publications.length} published papers`);
  const text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0] ?? "";
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

export default function Recognition() {
  const { ref } = useSectionInView("Recognition", 0.3);

  return (
    <section ref={ref} id="recognition" className="mb-28 w-full max-w-5xl mx-auto px-4 scroll-mt-28">
      <SectionHeading kicker={tally()}>Recognition</SectionHeading>

      <div className="flex flex-col gap-5">
        {shelf.length > 0 && <TrophyShelf items={shelf} />}
        {publications[0] && <PaperPage pub={publications[0]} />}
      </div>
    </section>
  );
}
