/** Vertical rule between home sections. Static, so it is visible before hydration and without JS. */
export default function SectionDivider() {
  return <div aria-hidden="true" className="bg-line md:my-28 h-16 w-1 rounded-full hidden sm:block" />;
}
