"use client";

import { m } from "framer-motion";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { links } from "@/lib/data";
import { useActiveSectionContext } from "@/context/active-section-context";

const Header = () => {
  const { activeSection, setActiveSection, setTimeOfLastClick } =
    useActiveSectionContext();
  // Section highlighting only means something on the one-page home route.
  const onHome = usePathname() === "/";

  return (
    <header className="z-[999] md:border-r border-line-strong fixed bottom-0 border-t left-0 right-0 w-full h-16 md:w-16 md:h-dvh ">
      <nav aria-label="Primary" className="bg-white/60 md:bg-transparent bg-opacity-80 shadow-lg shadow-black/[0.03] backdrop-blur-[0.5rem] text-gray-800 h-full w-full px-4 md:px-1.5 py-2 flex items-center justify-center dark:bg-black/50">
        <ul className="w-full flex justify-between md:justify-center flex-row md:flex-col gap-1 md:gap-4 font-bold text-gray-500 h-full">
          {links.map((link) => (
            <m.li
              className="flex items-center justify-center relative md:h-10 w-full"
              key={link.hash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <Link
                className={clsx(
                  "group flex w-full h-11 [@media(pointer:fine)]:h-auto items-center justify-center p-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  {
                    "text-fg":
                      onHome && activeSection === link.name,
                  }
                )}
                href={`/${link.hash}`}
                aria-label={link.name}
                aria-current={onHome && activeSection === link.name ? "location" : undefined}
                style={{
                  transition: "color 150ms ease, opacity 150ms ease",
                }}
                onClick={() => {
                  setActiveSection(link.name);
                  setTimeOfLastClick(Date.now());
                }}
              >
                <span
                  aria-hidden="true"
                  className="text-xl sm:text-2xl font-bold"
                  style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
                >
                  {link.icon}
                </span>
                <span aria-hidden="true" className="absolute -top-4 left-14 hidden md:group-hover:block md:group-focus-visible:block bg-gray-900 py-1 px-2 text-white rounded-md text-sm font-normal dark:bg-gray-50 dark:text-gray-900 whitespace-nowrap">
                  {link.name}
                </span>
              </Link>
            </m.li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
