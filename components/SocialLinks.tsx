import { FaHackerrank, FaLinkedin } from "react-icons/fa";
import { SiLeetcode, SiGeeksforgeeks, SiGithub, SiCodechef } from "react-icons/si";

const LINKS = [
  { href: "https://www.linkedin.com/in/selvinpaulraj", icon: <FaLinkedin size={18} />, label: "LinkedIn" },
  { href: "https://github.com/selvin-paul-raj", icon: <SiGithub size={18} />, label: "GitHub" },
  { href: "https://www.hackerrank.com/profile/selvinpaulraj", icon: <FaHackerrank size={18} />, label: "HackerRank" },
  { href: "https://leetcode.com/u/selvinpaulraj/", icon: <SiLeetcode size={18} />, label: "LeetCode" },
  { href: "https://www.geeksforgeeks.org/user/selvinpaulrajk/", icon: <SiGeeksforgeeks size={18} />, label: "GeeksForGeeks" },
  { href: "https://www.codechef.com/users/selvinpaulraj", icon: <SiCodechef size={18} />, label: "CodeChef" },
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
            active:scale-[0.97]"
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
