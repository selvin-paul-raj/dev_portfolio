import { projectsData } from "@/lib/data";

export type Project = (typeof projectsData)[number];

export const isPrivate = (p: Project) => "private" in p && p.private === true;
// Private repos are either work at Draup or personal projects kept private.
export const isPersonal = (p: Project) => "personal" in p && p.personal === true;
export const isWork = (p: Project) => isPrivate(p) && !isPersonal(p);
export const yearOf = (p: Project) => p.date.slice(0, 4);
export const isNpm = (url: string) => url.includes("npmjs.com");
export const primaryUrl = (p: Project) => p.code ?? p.live ?? undefined;

export function kindOf(p: Project): string {
  if (isWork(p)) return "Work at Draup";
  if (isPersonal(p)) return "Personal, private repo";
  return "Open source";
}
