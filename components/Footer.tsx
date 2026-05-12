import Link from "next/link";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaHackerrank } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import { links } from "@/lib/data";

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/selvinpaulraj",
    icon: <FaLinkedin size={13} />,
    label: "LinkedIn",
  },
  {
    href: "https://github.com/selvin-paul-raj",
    icon: <FaGithub size={13} />,
    label: "GitHub",
  },
  {
    href: "https://www.hackerrank.com/profile/selvinpaulraj",
    icon: <FaHackerrank size={13} />,
    label: "HackerRank",
  },
  {
    href: "https://leetcode.com/u/selvinpaulraj/",
    icon: <SiLeetcode size={13} />,
    label: "LeetCode",
  },
];

const TECH_STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Resend",
  "Vercel",
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/6 dark:border-white/8">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">

          {/* Name + tagline */}
          <div className="shrink-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90">
              Selvin PaulRaj K
            </p>
            <p className="font-mono text-xs text-[#9a7d2a] dark:text-[#FFD700]/50 mt-0.5 tracking-wide">
              AI Engineer · MCP · Agentic Systems
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map(({ name, hash }) => (
              <a
                key={name}
                href={hash}
                className="text-sm text-gray-500 dark:text-white/35 hover:text-gray-900 dark:hover:text-white/80"
                style={{ transition: "color 150ms ease" }}
              >
                {name}
              </a>
            ))}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-2 shrink-0">
            {SOCIAL_LINKS.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-10 h-10 rounded-full
                  bg-black/[0.04] dark:bg-white/[0.05] border border-black/6 dark:border-white/8
                  text-gray-500 dark:text-white/35
                  hover:text-gray-900 dark:hover:text-white/80 hover:scale-110 active:scale-[0.93]"
                style={{
                  transition: "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Tech stack row */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-black/5 dark:border-white/6">
          <span className="font-mono text-[0.6rem] text-gray-400 dark:text-white/20 uppercase tracking-widest mr-1">
            Built with
          </span>
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[0.65rem] px-2.5 py-0.5 rounded-full
                bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/7
                text-gray-500 dark:text-white/35"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Bottom: copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-mono text-xs text-gray-400 dark:text-white/25">
            &copy; {currentYear} Selvin PaulRaj K. All rights reserved.
          </p>
          <p className="font-mono text-xs text-gray-400 dark:text-white/25">
            Crafted with care in{" "}
            <span className="text-gray-500 dark:text-white/35">Chennai, India</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
