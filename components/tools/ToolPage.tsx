/// <reference types="react/canary" />
import { ViewTransition, type ReactNode } from "react";
import SectionHeading from "@/components/SectionHeading";
import ToolNav, { TOOL_TAB, type ToolId } from "./ToolNav";

// Only tab clicks in ToolNav crossfade the body; other navigations (and Back) swap it as before.
const BODY_FADE = { [TOOL_TAB]: "tool-body", default: "none" };

/** Shell for the four tool pages: one h1, one kicker, the tool strip, then the tool. */
export default function ToolPage({ tool, title, kicker, children }: { tool: ToolId; title: ReactNode; kicker: ReactNode; children: ReactNode }) {
  return (
    <main id="content" className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-16 pb-28 md:pl-24 md:pr-8">
      <SectionHeading as="h1" kicker={kicker} className="mb-8">
        {title}
      </SectionHeading>
      <ToolNav current={tool} />
      <ViewTransition enter={BODY_FADE} exit={BODY_FADE} default="none">
        <div className="flex w-full flex-col items-center">{children}</div>
      </ViewTransition>
    </main>
  );
}
