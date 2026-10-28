"use client";

import { m } from "framer-motion";

export default function SectionDivider() {
  return (
    <m.div
      aria-hidden="true"
      className="bg-gray-200 md:my-28 h-16 w-1 rounded-full hidden sm:block dark:bg-opacity-20 "
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    ></m.div>
  );
}
