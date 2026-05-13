import { FaHackerrank, FaLinkedin } from "react-icons/fa";
import { SiLeetcode, SiGeeksforgeeks, SiGithub, SiCodechef, SiKaggle } from "react-icons/si";

const DeepMlIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
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
const LINKS = [
  { href: "https://www.linkedin.com/in/selvinpaulraj", icon: <FaLinkedin size={18} />, label: "LinkedIn" },
  { href: "https://github.com/selvin-paul-raj", icon: <SiGithub size={18} />, label: "GitHub" },
  { href: "https://www.hackerrank.com/profile/selvinpaulraj", icon: <FaHackerrank size={18} />, label: "HackerRank" },
  { href: "https://leetcode.com/u/selvinpaulraj/", icon: <SiLeetcode size={18} />, label: "LeetCode" },
  { href: "https://www.geeksforgeeks.org/user/selvinpaulrajk/", icon: <SiGeeksforgeeks size={18} />, label: "GeeksForGeeks" },
  { href: "https://www.codechef.com/users/selvinpaulraj", icon: <SiCodechef size={18} />, label: "CodeChef" },
  { href: "https://www.kaggle.com/selvinpaulrajk", icon: <SiKaggle size={18} />, label: "Kaggle" },
  { href: "https://www.deep-ml.com/profile/fdmYEE5bBFgqLwHxlBFW1lgLUR22", icon: <DeepMlIcon />, label: "deep-ml" },
];

const SocialLinks = () => {
  return (
    <div className="fixed top-1/2 right-5 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 z-40">
      {LINKS.map(({ href, icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer
            bg-white/70 dark:bg-white/[0.05]
            border border-black/10 dark:border-white/10
            text-gray-500 dark:text-white/45
            hover:text-gray-900 dark:hover:text-white/85
            hover:border-black/20 dark:hover:border-white/20
            active:scale-[0.97]
            outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-1"
          style={{
            transition:
              "color 130ms ease, transform 150ms cubic-bezier(0.23,1,0.32,1), border-color 130ms ease, background-color 130ms ease",
          }}
        >
          {icon}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
