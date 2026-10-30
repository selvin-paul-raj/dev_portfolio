"use client";

import { LuAppWindow, LuBot, LuCpu, LuSearch, LuServer, LuShieldCheck, LuWrench } from "react-icons/lu";
import type { IconType } from "react-icons";
import SectionHeading from "./SectionHeading";
import { skillsData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";

type Layer = { name: string; job: string; keys: string[]; Icon: IconType };

// The stack of an agent system, top (where people use it) to bottom (what it runs on).
// Each layer draws its skills from lib/data/skills.json groups; the "all" list is never shown.
const LAYERS: Layer[] = [
  { name: "Interface", job: "Where people use what I build", keys: ["frontend"], Icon: LuAppWindow },
  { name: "Services and data", job: "APIs, and the data the agents query", keys: ["backend_and_data"], Icon: LuServer },
  { name: "Agents", job: "Orchestration, tools, memory and hand-offs", keys: ["agentic_ai"], Icon: LuBot },
  { name: "Retrieval", job: "Grounding answers in the right records", keys: ["retrieval"], Icon: LuSearch },
  { name: "Models", job: "The LLMs underneath, and how I prompt them", keys: ["llms"], Icon: LuCpu },
  { name: "Evaluation and safety", job: "Proving it works, and keeping it safe", keys: ["evaluation_and_reliability", "ai_security"], Icon: LuShieldCheck },
  { name: "Infra and tooling", job: "Testing, shipping and running it", keys: ["tooling"], Icon: LuWrench },
];

const skillsOf = (keys: string[]) => keys.flatMap((k) => skillsData[k] ?? []);
const layers = LAYERS.map((l) => ({ ...l, skills: skillsOf(l.keys) })).filter((l) => l.skills.length > 0);
const languages = skillsData.languages ?? [];

function LayerRow({ layer, index }: { layer: (typeof layers)[number]; index: number }) {
  const { Icon } = layer;
  return (
    <li
      className="group relative grid grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)] gap-x-6 gap-y-3 px-4 sm:px-6 py-5
        border-t border-black/[0.06] dark:border-white/[0.06] first:border-t-0
        transition-colors duration-150 hover:bg-amber-50/70 dark:hover:bg-accent/[0.04] focus-within:bg-amber-50/70 dark:focus-within:bg-accent/[0.04]"
    >
      {/* Lit edge on hover: an inset ring, not a side stripe */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-amber-500/40 dark:group-hover:ring-accent/30 transition-[box-shadow] duration-150"
      />
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 text-gray-500 dark:text-white/50
            group-hover:text-amber-700 dark:group-hover:text-accent group-hover:border-amber-500/40 dark:group-hover:border-accent/35 transition-colors duration-150"
        >
          <Icon size={16} />
        </span>
        <div>
          <h3 className="text-base font-semibold text-fg">
            <span className="sr-only">Layer {index + 1}: </span>
            {layer.name}
          </h3>
          <p className="mt-0.5 text-sm text-fg-2">{layer.job}</p>
        </div>
      </div>
      <ul aria-label={`${layer.name} skills`} className="flex flex-wrap content-start gap-2">
        {layer.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-md border border-line bg-white dark:bg-white/[0.03] px-2.5 py-1 text-sm text-fg"
          >
            {skill}
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Skills() {
  const { ref } = useSectionInView("Skills", 0.2);

  return (
    <section ref={ref} id="skills" className="mb-28 w-full max-w-5xl mx-auto scroll-mt-28 px-4">
      <SectionHeading kicker="The stack of the agent systems I ship, from the interface people use down to what it runs on.">
        Skills
      </SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_9rem] gap-4">
        <ol aria-label="Layers, top to bottom" className="rounded-2xl border border-line bg-surface-2 overflow-hidden">
          {layers.map((layer, i) => (
            <LayerRow key={layer.name} layer={layer} index={i} />
          ))}
        </ol>

        {/* Languages run through every layer, so they sit beside the whole stack */}
        {languages.length > 0 && (
          <aside
            aria-labelledby="skills-languages"
            className="order-first lg:order-none rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-gray-50/60 dark:bg-[#0c0c10] p-4 sm:p-5
              flex flex-col gap-3"
          >
            <div>
              <h3 id="skills-languages" className="text-base font-semibold text-fg">Languages</h3>
              <p className="mt-0.5 text-sm text-fg-2">Across every layer</p>
            </div>
            <ul className="flex flex-wrap lg:flex-col gap-2">
              {languages.map((lang) => (
                <li
                  key={lang}
                  className="rounded-md border border-amber-500/30 dark:border-accent/25 bg-amber-50/60 dark:bg-accent/[0.05] px-2.5 py-1 font-mono text-sm text-fg"
                >
                  {lang}
                </li>
              ))}
            </ul>
            {/* The rail itself: a line down the full height on desktop */}
            <span aria-hidden="true" className="hidden lg:block mx-auto mt-1 w-px flex-1 bg-gradient-to-b from-amber-500/50 to-transparent dark:from-accent/40" />
          </aside>
        )}
      </div>
    </section>
  );
}
