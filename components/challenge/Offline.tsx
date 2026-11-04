import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { GHOST_BTN } from "@/components/tools/styles";
import Pipeline from "./Pipeline";
import type { Level } from "./types";

/** With no model configured the game can't run, so the page explains each level's defenses instead. */
export default function Offline({ levels, stack }: { levels: Level[]; stack: readonly string[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-fg-2">
          The gatekeeper is offline right now, so you can't play. Here is what each level stacks against you, and how the scope filter that guards
          every level is tested.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/evals#scope" className={GHOST_BTN}>
            See how the free-chat block is tested
            <LuArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link href="/ask" className={GHOST_BTN}>
            Ask about my work instead
            <LuArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      {levels.length > 0 && (
        <ol aria-label="Levels" className="flex flex-col divide-y divide-line border-t border-line">
          {levels.map((l) => (
            <li key={l.level} className="flex flex-col gap-3 py-6">
              <h2 className="text-base font-semibold text-fg">
                Level {l.level}: {l.name}
              </h2>
              <p className="text-sm text-fg-2">{l.defense}</p>
              <Pipeline stack={stack} active={l.layers} compact />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
