import React from "react";
type SectionHeadingProps = {
  children: React.ReactNode;
};

export default function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="text-2xl lg:text-3xl font-semibold uppercase mb-8 text-center tracking-[0.15em] text-gray-900 dark:text-gray-50">
      {children}
    </h2>
  );
}
