"use client";

import SectionHeading from "./SectionHeading";
import FeaturedExplorer from "./projects/FeaturedExplorer";
import ProjectIndex from "./projects/ProjectIndex";
import { projectsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

const featured = projectsData.filter((p) => p.featured);
const archive = projectsData.filter((p) => !p.featured);

/* ─── Section ──────────────────────────────────────────────────────────── */

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.1);

  return (
    <section ref={ref} id="projects" className="mb-28 w-full max-w-6xl mx-auto scroll-mt-28 px-4">
      <SectionHeading kicker="Production agent systems from my work at Draup, plus personal projects, some open source and some kept private.">
        Projects
      </SectionHeading>

      <FeaturedExplorer projects={featured} />

      {archive.length > 0 && <ProjectIndex projects={archive} />}
    </section>
  );
}
