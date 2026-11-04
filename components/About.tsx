import { projectsData, certificationsData, experienceMetrics } from "@/lib/data";
import { getCaseStudy } from "@/lib/work";
import AboutSection from "./about/AboutSection";
import AboutStats, { type Stat } from "./about/AboutStats";
import AgentTrace, { type TraceLine } from "./about/AgentTrace";
import SectionHeading from "./SectionHeading";

const SERIF = "var(--font-instrument-serif), ui-serif, Georgia, serif";
const STACK_NOW = ["LangGraph", "MCP", "RAG", "Next.js", "Python", "FastAPI"];

// Every figure is computed from lib/data; internships are counted apart from full-time work.
const STATS: Stat[] = [
  { value: projectsData.length, label: "Projects shipped", format: "plus" },
  { value: experienceMetrics.workRoleMonths, label: "Full-time", format: "months" },
  { value: experienceMetrics.internMonths, label: "Internships", format: "months" },
  { value: certificationsData.length, label: "Certificates", format: "plain" },
];

// The case study is resolved here on the server so caseStudies.json stays out of the client bundle.
const study = getCaseStudy("dri-mas");

// Each pipeline stage from the case study: its title, the agents and nodes that run it, and
// whether a person can be pulled in there. Stores (checkpointer, memory) are left out of the line.
const TRACE: TraceLine[] = (study?.steps ?? []).map((s) => {
  const nodes = s.nodes.map((id) => study?.diagram.nodes.find((n) => n.id === id)).filter((n) => n !== undefined);
  return {
    title: s.title,
    actors: nodes.filter((n) => n.kind !== "hitl" && n.kind !== "store").slice(0, 2).map((n) => n.label),
    human: nodes.some((n) => n.kind === "hitl"),
  };
});
const TRACE_RESULT = study?.results[0];

const STRONG = "font-semibold text-fg";
const BODY = "text-base leading-[1.7] text-fg-2 max-w-[65ch]";

export default function About() {
  return (
    <AboutSection>
      <SectionHeading>About</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-14 items-start">
        {/* Left: the claim, then the story behind it */}
        <div>
          <blockquote
            className="mb-8 text-[clamp(1.5rem,1.2rem+1vw,1.875rem)] leading-[1.3] text-fg"
            style={{ fontFamily: SERIF, fontStyle: "italic" }}
          >
            &ldquo;My agent pipeline took analyst turnaround from hours to minutes.&rdquo;
          </blockquote>

          <div className="space-y-5">
            <p className={BODY}>
              I&apos;m an <strong className={STRONG}>AI engineer</strong> in Chennai, doing a Master&apos;s in Computer
              Science (AI specialisation) at Kings Engineering College after a{" "}
              <strong className={STRONG}>B.Tech in Information Technology</strong>.
            </p>
            <p className={BODY}>
              I specialise in <span className="font-semibold text-accent-fg">agentic AI</span>: LangGraph
              multi&#8209;agent pipelines, MCP servers, RAG systems and LLM&#8209;powered automation. I test them like
              production code, with test suites, retrieval metrics and red&#8209;team cases, and the full&#8209;stack side
              (Next.js, React, Node.js, Python) lets me ship the API and interface around the agent too.
            </p>
            <p className={BODY}>
              At <strong className={STRONG}>Zinnov (Draup)</strong> I build AI automation for workforce intelligence: a
              LangGraph multi&#8209;agent system that turns plain&#8209;English requests into validated SQL reports, hybrid
              FAISS&nbsp;+&nbsp;BM25 search over 2.6M company records, and LLM&#8209;driven role&#8209;mapping pipelines.
              Outside work I ship open&#8209;source MCP servers, CLI agents and full&#8209;stack apps.
            </p>
          </div>

          <p className="mt-8 text-sm text-fg-2">
            <span className="font-medium text-ok">Open to AI Engineer roles.</span>{" "}
            Chennai, India (GMT+5:30).
          </p>

          <div className="mt-8 flex flex-col gap-5">
          <AboutStats stats={STATS} />

            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-fg-2">Working with now</span>
              <ul className="flex flex-wrap gap-2">
                {STACK_NOW.map((tech) => (
                  <li
                    key={tech}
                    className="font-mono text-xs text-fg-2 px-2.5 py-1 border border-line rounded-full bg-surface-2"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: a replay of the system behind the quote, then the numbers */}
        <div className="flex flex-col gap-5">
          <figure>
            {study && TRACE_RESULT && (
              <AgentTrace slug={study.slug} lines={TRACE} result={{ value: TRACE_RESULT.value, label: TRACE_RESULT.label }} />
            )}
            <figcaption className="sr-only">A replay of one DRI-MAS run, stage by stage, from the case study.</figcaption>
          </figure>

        </div>
      </div>
    </AboutSection>
  );
}
