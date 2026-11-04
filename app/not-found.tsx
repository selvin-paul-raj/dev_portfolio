import type { Metadata } from "next";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: true },
  // Don't inherit the root canonical: a 404 must not claim to be the home page.
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main id="content" className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center px-4">
      <span aria-hidden="true" className="font-mono text-[5rem] font-bold leading-none text-muted">
        404
      </span>
      <div>
        <h1 className="text-lg font-semibold text-fg mb-1">
          Page not found
        </h1>
        <p className="text-sm text-muted">
          This page doesn&apos;t exist or was moved.
        </p>
      </div>
      <Link
        href="/"
        className="group flex items-center justify-between gap-3 pl-5 pr-1.5 py-1.5 rounded-full
          bg-primary text-on-primary text-sm font-semibold
          outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          active:scale-[0.97]"
        style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
      >
        <span>Go home</span>
        <span
          className="flex items-center justify-center w-8 h-8 rounded-full bg-on-primary/15
            group-hover:scale-110"
          style={{ transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)" }}
        >
          <BsArrowRight size={13} />
        </span>
      </Link>
    </main>
  );
}
