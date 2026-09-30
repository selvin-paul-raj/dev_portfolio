"use client";
import { useTheme } from "@/context/theme-context";
import { BsMoon, BsSun } from "react-icons/bs";

const ThemeSwitch = () => {
  const { toggleTheme } = useTheme();

  // Icons are driven by the `dark` class (set before paint by the inline script in
  // layout.tsx), so the correct icon renders on first paint without a flash.
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="z-[999] fixed top-8 right-4 bg-transparent w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-center active:scale-105 transition-all opacity-80 hover:opacity-100 duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
    >
      <BsSun size={22} aria-hidden="true" className="dark:hidden" />
      <BsMoon size={22} aria-hidden="true" className="hidden dark:block" />
    </button>
  );
};
export default ThemeSwitch;
