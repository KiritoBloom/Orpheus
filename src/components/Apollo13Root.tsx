"use client";

/**
 * INSTANCE TWO ROOT — /apollo13
 *
 * The only code the second corpus instance needs. It registers the Apollo 13
 * corpus and selects it, then renders the same GameRoot instance one renders.
 *
 * Selection happens at module scope, which runs after this file's imports are
 * evaluated and before any component renders — so every service call, every
 * WebMCP tool and the save key all resolve to `apollo13` from the first frame.
 */

import GameRoot from "@/components/GameRoot";
import { registerCorpus, setActiveCorpus } from "@/game/data/corpus";
import { APOLLO13_CORPUS } from "@/game/data/apollo13/corpus";

registerCorpus("apollo13", () => APOLLO13_CORPUS);
setActiveCorpus("apollo13");

export default function Apollo13Root() {
  return <GameRoot />;
}
