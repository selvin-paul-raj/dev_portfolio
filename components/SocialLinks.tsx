import {FaHackerrank} from "react-icons/fa";
import { SiLeetcode,SiGeeksforgeeks ,SiGithub,SiLinkedin ,SiCodechef } from "react-icons/si";

type Props = {};

const SocialLinks = (props: Props) => {
  return (
    <div className="fixed top-1/2 right-5 transform -translate-y-1/2 hidden md:flex flex-col items-center gap-6  md:scale-150">
      <a
        href="https://www.linkedin.com/in/selvinpaulraj"
        target="_blank"
        title="LinkedIn"
        className="bg-transparent  w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300 "
      >
        <SiLinkedin  size={22} />
      </a>

      <a
        href="https://github.com/selvin-paul-raj"
        target="_blank"
        title="Github"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <SiGithub size={22} />
      </a>
      <a
        href="https://www.hackerrank.com/profile/selvinpaulraj"
        target="_blank"
        title="hackerrank"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <FaHackerrank size={22} />
      </a>
      <a
        href="https://leetcode.com/u/selvinpaulraj/"
        target="_blank"
        title="Leetcode"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <SiLeetcode size={22} />
      </a>
      <a
        href="https://www.geeksforgeeks.org/user/selvinpaulrajk/"
        aria-label="geeksforgeeks"
        target="_blank"
        title="GeeksforGeeks"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <SiGeeksforgeeks  size={22} />
      </a>
      <a
        href="https://www.codechef.com/users/selvinpaulraj"
        target="_blank"
        title="Codechef"
        className="bg-transparent w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all  opacity-80 hover:opacity-100 hover:scale-105 duration-300"
      >
        <SiCodechef   size={22} />
      </a>
    </div>
  );
};

export default SocialLinks;
