import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center px-4">
      <span className="font-mono text-[5rem] font-bold leading-none text-gray-200 dark:text-white/10">
        404
      </span>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90 mb-1">
          Page not found
        </h2>
        <p className="text-sm text-gray-500 dark:text-white/40">
          This page doesn&apos;t exist or was moved.
        </p>
      </div>
      <Link
        href="/"
        className="group flex items-center justify-between gap-3 pl-5 pr-1.5 py-1.5 rounded-full
          bg-gray-900 dark:bg-[#FFD700] text-white dark:text-black text-sm font-semibold
          active:scale-[0.97]"
        style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        <span>Go home</span>
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 dark:bg-black/15
            group-hover:scale-110"
          style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          <BsArrowRight size={13} />
        </span>
      </Link>
    </div>
  );
}
