import Link from "next/link";
import { FaLinkedin, FaGithub, FaInstagram, FaHackerrank } from "react-icons/fa";
import { HiDownload } from "react-icons/hi";
import { LuArrowUp } from "react-icons/lu";
import { SiLeetcode } from "react-icons/si";
import { links } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import MachineAccess from "./footer/MachineAccess";

const EMAIL = "selvinpaulgomathi@gmail.com";
const HOST = SITE_URL.replace(/^https?:\/\//, "");

const PAGES = [
  { href: "/work", name: "Case studies" },
  { href: "/fit", name: "Fit check" },
  { href: "/ask", name: "Ask" },
  { href: "/evals", name: "Evals" },
  { href: "/challenge", name: "Challenge" },
];

const SOCIAL_LINKS = [
  { href: "https://www.linkedin.com/in/selvinpaulraj", Icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://github.com/selvin-paul-raj", Icon: FaGithub, label: "GitHub" },
  { href: "https://www.hackerrank.com/profile/selvinpaulraj", Icon: FaHackerrank, label: "HackerRank" },
  { href: "https://leetcode.com/u/selvinpaulraj/", Icon: SiLeetcode, label: "LeetCode" },
  { href: "https://www.instagram.com/selvin_paul_raj", Icon: FaInstagram, label: "Instagram" },
];

// Every endpoint here is served by this site (next.config.js rewrites, public/, app/api).
const MACHINE_ENTRIES = [
  { label: "Terminal", command: `curl -sL ${HOST}`, note: "The whole portfolio as coloured text." },
  { label: "LLMs", command: `${SITE_URL}/llms-full.txt`, note: "Every page as plain markdown." },
  { label: "MCP server", command: `${SITE_URL}/api/mcp`, note: "Search projects, match a job, or contact me from your agent." },
  { label: "A2A agent card", command: `${SITE_URL}/.well-known/agent-card.json`, note: "For agent-to-agent discovery." },
];

// Server component: computed once per server instance rather than during render
// (keeps render pure); the page is revalidated daily, so the year stays current.
const CURRENT_YEAR = new Date().getFullYear();

const LINK =
  "inline-flex items-center gap-2 min-h-11 min-w-11 [@media(pointer:fine)]:min-h-0 [@media(pointer:fine)]:min-w-0 rounded-sm text-sm text-fg-2" +
  "hover:text-fg transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent";
const COL_HEAD = "mb-3 text-sm font-semibold text-fg";

function LinkColumns() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-7">
      <nav aria-labelledby="footer-sections">
        <h2 id="footer-sections" className={COL_HEAD}>On this page</h2>
        <ul className="flex flex-wrap gap-x-5 sm:flex-col sm:flex-nowrap sm:gap-x-0 sm:gap-y-1.5 [@media(pointer:fine)]:sm:gap-y-2.5">
          {links.map(({ name, hash }) => (
            <li key={name}>
              <Link href={`/${hash}`} className={LINK}>{name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-labelledby="footer-pages">
        <h2 id="footer-pages" className={COL_HEAD}>Check my work</h2>
        <ul className="flex flex-wrap gap-x-5 sm:flex-col sm:flex-nowrap sm:gap-x-0 sm:gap-y-1.5 [@media(pointer:fine)]:sm:gap-y-2.5">
          {PAGES.map(({ href, name }) => (
            <li key={href}>
              <Link href={href} className={LINK}>{name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-labelledby="footer-elsewhere">
        <h2 id="footer-elsewhere" className={COL_HEAD}>Elsewhere</h2>
        <ul className="flex flex-wrap gap-x-5 sm:flex-col sm:flex-nowrap sm:gap-x-0 sm:gap-y-1.5 [@media(pointer:fine)]:sm:gap-y-2.5">
          {SOCIAL_LINKS.map(({ href, Icon, label }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
                <Icon size={14} aria-hidden="true" className="shrink-0 text-muted" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="border-t border-line">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-12 lg:gap-16">
          {/* Sign-off: who, what, and the two ways to act on it */}
          <div className="flex flex-col gap-10">
            <div>
              <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-fg">Selvin PaulRaj K</p>
              <p className="mt-3 max-w-[42ch] text-base leading-relaxed text-fg-2">
                AI engineer in Chennai, building agents, MCP servers and RAG pipelines that run in production.
              </p>
              <p className="mt-2 text-sm font-medium text-ok">Open to AI Engineer roles.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex h-11 items-center rounded-full bg-gray-900 dark:bg-accent px-5 text-sm font-semibold text-white dark:text-[#1a1500]
                    outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#09090b]"
                >
                  Email me
                </a>
                <a
                  href="/view/Selvin_Resume.pdf"
                  download
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 dark:border-white/15 px-5 text-sm font-semibold
                    text-gray-800 dark:text-white/85 hover:border-black/30 dark:hover:border-white/35 transition-colors duration-150
                    outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <HiDownload size={15} aria-hidden="true" /> Download CV
                </a>
              </div>
            </div>
            <LinkColumns />
          </div>

          <MachineAccess entries={MACHINE_ENTRIES} />
        </div>

        {/* Colophon */}
        <div className="mt-14 pt-6 border-t border-line flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            &copy; {CURRENT_YEAR} Selvin PaulRaj K. Built with Next.js 16, React 19, Tailwind CSS and Resend, on Vercel.
          </p>
          <a href="#" className={`${LINK} self-start sm:self-auto`}>
            <LuArrowUp size={14} aria-hidden="true" /> Back to top
          </a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
