"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";

import { links } from "@/lib/data";
import { useActiveSectionContext } from "@/context/active-section-context";

const Header = () => {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();

  return (
    <header className="z-[999] md:border-r border-black/20 fixed bottom-0 border-t left-0 right-0 w-full h-16 md:w-16 md:h-screen dark:border-white/20">
      <nav className="bg-white/60 md:bg-transparent bg-opacity-80 shadow-lg shadow-black/[0.03] backdrop-blur-[0.5rem] text-gray-800 h-full w-full px-4 py-2 flex items-center justify-center dark:bg-black/50">
        <ul className="w-full flex justify-between md:justify-center flex-row md:flex-col gap-6 md:gap-4 font-bold text-gray-500 h-full">
          {links.map((link) => (
            <motion.li
              className="flex items-center justify-center relative md:h-10 w-full"
              key={link.hash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link
                className={clsx(
                  "group flex w-full items-center justify-center p-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]",
                  {
                    "text-gray-950 dark:text-gray-50":
                      activeSection === link.name,
                  }
                )}
                href={link.hash}
                style={{
                  transition: "color 150ms ease, opacity 150ms ease",
                }}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
                >
                  {link.icon}
                </span>
                <span className="absolute -top-4 left-14 hidden md:group-hover:block bg-gray-900 py-1 px-2 text-white rounded-md text-sm font-normal dark:bg-gray-50 dark:text-gray-900 whitespace-nowrap">
                  {link.name}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
