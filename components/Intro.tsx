"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NumberTicker from "./ui/NumberTicker";
import PokeFace from "./PokeFace";
import { BsArrowRight } from "react-icons/bs";
import { FaLinkedin, FaGithub, FaHackerrank } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { LuGauge, LuMessageCircle, LuShieldAlert, LuTarget, LuWorkflow } from "react-icons/lu";
import { SiLeetcode, SiKaggle } from "react-icons/si";

import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import { projectsData, experienceMetrics } from "@/lib/data";

const DeepMlIcon = ({ size = 17 }: { size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <circle cx="2.5"  cy="6.5"  r="1.7" fill="currentColor" opacity="0.75"/>
    <circle cx="2.5"  cy="13.5" r="1.7" fill="currentColor" opacity="0.75"/>
    <circle cx="10"   cy="3.5"  r="1.7" fill="currentColor"/>
    <circle cx="10"   cy="10"   r="1.7" fill="currentColor"/>
    <circle cx="10"   cy="16.5" r="1.7" fill="currentColor"/>
    <circle cx="17.5" cy="10"   r="1.7" fill="currentColor" opacity="0.9"/>
    <line x1="4.2"  y1="6.5"  x2="8.3"  y2="3.5"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="6.5"  x2="8.3"  y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="6.5"  x2="8.3"  y2="16.5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3"  y2="3.5"  stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3"  y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="4.2"  y1="13.5" x2="8.3"  y2="16.5" stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="3.5"  x2="15.8" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="10"   x2="15.8" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
    <line x1="11.7" y1="16.5" x2="15.8" y2="10"   stroke="currentColor" strokeWidth="0.75" opacity="0.4"/>
  </svg>
);

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/selvinpaulraj", icon: <FaLinkedin size={17} />, label: "LinkedIn" },
  { href: "https://github.com/selvin-paul-raj", icon: <FaGithub size={17} />, label: "GitHub" },
  { href: "https://www.hackerrank.com/profile/selvinpaulraj", icon: <FaHackerrank size={17} />, label: "HackerRank" },
  { href: "https://leetcode.com/u/selvinpaulraj/", icon: <SiLeetcode size={17} />, label: "LeetCode" },
  { href: "https://www.kaggle.com/selvinpaulrajk", icon: <SiKaggle size={17} />, label: "Kaggle" },
  { href: "https://www.deep-ml.com/profile/fdmYEE5bBFgqLwHxlBFW1lgLUR22", icon: <DeepMlIcon size={17} />, label: "deep-ml" },
];

// Each shortcut lets a recruiter check a claim on this page for themselves.
const RECRUITER_LINKS = [
  { href: "/work", label: "How it works", title: "How my systems work, step by step", Icon: LuWorkflow },
  { href: "/fit", label: "Fit check", title: "Check my fit for your role", Icon: LuTarget },
  { href: "/ask", label: "Ask me", title: "Ask me anything, with cited answers", Icon: LuMessageCircle },
  { href: "/evals", label: "Evals", title: "See the evals that grade those answers", Icon: LuGauge },
  { href: "/challenge", label: "Break my guardrails", title: "A five-level prompt-injection game", Icon: LuShieldAlert },
];

const SHORTCUT_PILL =
  "group inline-flex h-11 [@media(pointer:fine)]:h-9 items-center gap-2 rounded-full border px-3.5 text-sm " +
  "border-black/10 bg-black/[0.03] text-gray-700 hover:border-amber-600/50 hover:text-gray-950 " +
  "dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-accent/45 dark:hover:text-white " +
  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b] " +
  "transition-[color,border-color,background-color] duration-150";
const SHORTCUT_ICON =
  "shrink-0 text-gray-500 group-hover:text-amber-700 dark:text-white/45 dark:group-hover:text-accent transition-colors duration-150";

const TECH_BADGES = [
  "LangGraph", "MCP", "RAG", "LangChain", "Python",
  "CrewAI", "FastAPI", "Next.js", "FAISS", "OpenAI",
];

const _projectCount = projectsData.length;

const _fmtDur = (n: number) => {
  const y = Math.floor(n / 12);
  const m = n % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
};

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      setTime(`${h}:${m < 10 ? "0" : ""}${m} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      id="home"
      className="w-full max-w-5xl mx-auto px-0 sm:px-4 mb-16 scroll-mt-[100rem] md:pt-8"
    >
      {/* Mobile-only status pill */}
      <div className="anim-fade-up anim-d0 lg:hidden flex items-center justify-center gap-2 mb-5 font-mono text-xs text-gray-600 dark:text-white/55">
        <span className="flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8 rounded-full px-4 py-1.5">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Chennai, India &nbsp;·&nbsp; {time}
        </span>
      </div>

      {/* Main hero row */}
      <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-6 lg:gap-16 mb-14">

        {/* Left: text */}
        <div className="w-full lg:w-auto flex-1 min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left">

          {/* Desktop status pill */}
          <div className="anim-fade-up anim-d0 hidden lg:flex items-center gap-2 mb-5 font-mono text-xs text-gray-600 dark:text-white/55 bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8 rounded-full px-4 py-1.5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Chennai, India &nbsp;·&nbsp; {time} &nbsp;·&nbsp;
            <span className="text-green-700 dark:text-green-400/80">Open to AI Engineer roles</span>
          </div>

          {/* Name */}
          <h1 className="anim-fade-up anim-d1 text-4xl sm:text-5xl lg:text-[3.6rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.08] mb-3">
            Selvin{" "}
            <span className="text-gray-500 dark:text-white/35">PaulRaj K</span>
            {/* Role — kept inside the H1 so search engines see the role keyword, styled identically to the old sibling <p> */}
            <span className="anim-fade-up anim-d2 block font-mono text-sm sm:text-[0.9rem] font-normal normal-case tracking-wide text-accent-ink dark:text-accent/65 mt-3">
              AI Engineer &nbsp;·&nbsp; MCP &nbsp;·&nbsp; Agentic Systems &nbsp;·&nbsp; RAG &nbsp;·&nbsp; LangGraph
            </span>
          </h1>

          {/* Mobile inline stats */}
          <div className="anim-fade-up anim-d3 lg:hidden flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-1 mt-1 mb-5 font-mono whitespace-nowrap">
            <span className="text-lg font-bold text-gray-900 dark:text-white/90 tabular-nums">
              <NumberTicker value={_projectCount} />+
            </span>
            <span className="text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] text-gray-600 dark:text-white/50">Projects</span>
            <span className="w-px h-3.5 bg-black/10 dark:bg-white/10" />
            <span className="text-lg font-bold text-gray-900 dark:text-white/90 tabular-nums" suppressHydrationWarning>
              {_fmtDur(experienceMetrics.workRoleMonths)}
            </span>
            <span className="text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] text-gray-600 dark:text-white/50">Full-time</span>
          </div>

          {/* Bio */}
          <p className="anim-fade-up anim-d3 text-base text-gray-600 dark:text-white/50 leading-relaxed max-w-xl mb-3">
            I build{" "}
            <span className="text-gray-900 dark:text-white/80 font-medium">
              AI agents, MCP servers, and LangGraph multi-agent pipelines
            </span>{" "}
            that run in production. Before agents I shipped full-stack MERN and Next.js apps,
            and I&apos;m now doing an M.E. in Computer Science (AI).
          </p>

          {/* Secondary bio — hidden on mobile so the CTAs land above the fold */}
          <p className="anim-fade-up anim-d4 hidden sm:block text-sm text-gray-500 dark:text-white/55 leading-relaxed max-w-xl mb-7">
            At{" "}
            <span className="text-gray-700 dark:text-white/60 font-medium">Zinnov (Draup)</span>
             I built DRI-MAS (Data Request Intelligence Multi-Agent System), a LangGraph multi-agent system that turns plain-English
            requests into validated SQL reports. Analyst turnaround went from hours to under a
            minute. Outside work I publish MCP servers and CLI agents.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-d5 flex flex-row flex-wrap gap-2.5 w-full sm:w-auto mb-7">
            <a
              href="#contact"
              onClick={() => { setActiveSection("Contact"); setTimeOfLastClick(Date.now()); }}
              className="flex-1 sm:flex-none group flex items-center justify-between gap-3
                pl-4 sm:pl-5 pr-1.5 py-1.5 rounded-full
                bg-gray-900 dark:bg-accent text-white dark:text-black
                text-sm font-semibold tracking-wide active:scale-[0.97]
                outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              style={{ transition: "opacity 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
            >
              <span className="whitespace-nowrap">Get in touch</span>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full shrink-0
                  bg-white/15 dark:bg-black/15
                  group-hover:scale-110 group-hover:bg-white/25 dark:group-hover:bg-black/25"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease" }}
              >
                <BsArrowRight size={13} />
              </span>
            </a>
            <a
              href="/view/Selvin_Resume.pdf"
              download
              className="flex-1 sm:flex-none group flex items-center justify-between gap-3
                pl-4 sm:pl-5 pr-1.5 py-1.5 rounded-full
                bg-white dark:bg-white/[0.06] border border-black/10 dark:border-white/10
                text-sm font-semibold tracking-wide text-gray-800 dark:text-white/75
                hover:bg-gray-50 dark:hover:bg-white/10 active:scale-[0.97]
                outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              style={{ transition: "background-color 150ms ease, transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
            >
              <span className="whitespace-nowrap">Download CV</span>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full
                  bg-black/[0.06] dark:bg-white/10
                  group-hover:scale-110 group-hover:bg-black/10 dark:group-hover:bg-white/15"
                style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease" }}
              >
                <HiDownload size={13} />
              </span>
            </a>
          </div>

          {/* Recruiter shortcuts: every claim on this page can be checked */}
          <nav
            aria-label="For recruiters"
            className="anim-fade-up anim-d5 -mt-2 mb-7 flex flex-col items-center lg:items-start gap-3"
          >
            <span className="lg:hidden text-sm text-green-700 dark:text-green-400/80 font-medium">Open to AI Engineer roles</span>
            <ul className="flex flex-wrap justify-center lg:justify-start gap-2">
              {RECRUITER_LINKS.map(({ href, label, title, Icon }) => (
                <li key={href}>
                  <Link href={href} title={title} className={SHORTCUT_PILL}>
                    <Icon size={15} aria-hidden="true" className={SHORTCUT_ICON} />
                    {label}
                  </Link>
                </li>
              ))}
              <li className="hidden sm:block">
                <button
                  type="button"
                  title="Open the command palette"
                  onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
                  className={`${SHORTCUT_PILL} border-dashed`}
                >
                  <kbd className="font-mono text-xs leading-none px-1.5 py-1 rounded border border-black/15 dark:border-white/20 text-gray-600 dark:text-white/60">
                    ⌘K
                  </kbd>
                  Everything else
                </button>
              </li>
            </ul>
          </nav>

          {/* Socials */}
          <div className="anim-fade-up anim-d6 flex flex-wrap items-center gap-2">
            {SOCIAL_LINKS.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex items-center justify-center w-10 h-10 rounded-full
                  bg-black/[0.05] dark:bg-white/[0.05] border border-black/8 dark:border-white/10
                  text-gray-500 dark:text-white/40
                  hover:text-gray-900 dark:hover:text-white/85 hover:scale-110 active:scale-[0.93]
                  outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
                style={{ transition: "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right: interactive portrait (drag to stretch; whistles, then sleeps, when idle) */}
        <div className="anim-fade-in anim-d1 shrink-0">
          <div className="w-64 sm:w-80 lg:w-[26rem]">
            <PokeFace circleColor="#FFD700" label="Selvin PaulRaj K, AI Engineer. Grab and stretch his face." />
          </div>
        </div>
      </div>

      {/* Tech stack badges */}
      <div className="anim-fade-up anim-d8 hidden lg:flex flex-wrap justify-start gap-2 mb-4">
        <span className="font-mono text-xs text-gray-500 dark:text-white/50 self-center mr-1 tracking-widest uppercase">
          Core stack
        </span>
        {TECH_BADGES.map((tech) => (
          <span
            key={tech}
            className="font-mono text-xs px-3 py-1 rounded-full
              bg-black/[0.05] dark:bg-white/[0.06] border border-black/8 dark:border-white/8
              text-gray-600 dark:text-white/50"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
