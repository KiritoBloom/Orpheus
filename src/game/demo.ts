"use client";

import type { StoryFlag } from "@/types/game";
import { useOS } from "@/game/state/osStore";

/* ============================================================
   DEMO ENTRY POINTS — deep links into the investigation.

   The desk normally opens cold: iris → boot → briefing → desktop,
   and the 02:13 set piece only exists after the vestibule is
   decrypted. That is the right shape for a player and the wrong
   shape for someone with ninety seconds who wants to see whether
   the agent can actually move the screen.

   These links preload state and nothing else. No tool behaves
   differently, no gate is removed, no check is softened — the
   flags they set are the flags real play sets. A banner says the
   state was preloaded so nobody mistakes a shortcut for a claim.

     ?skip=intro     straight to the desktop, cold
     ?demo=verify    desktop + the LINK tool console open
     ?demo=window    desktop + vestibule open, 02:13 window arming
     ?demo=full      the above + the reconstruction gate satisfied

   Preloaded flags are written with `setState`, never `addFlag`, so
   they are not persisted: a judge's shortcut cannot overwrite a
   player's save.
   ============================================================ */

export type DemoMode = "none" | "verify" | "window" | "full";

export interface DemoConfig {
  mode: DemoMode;
  /** Land on the desktop, skipping iris → boot → briefing. */
  skipIntro: boolean;
}

/** Seconds after arrival before the 02:13 window opens — time to start recording. */
export const DEMO_WINDOW_DELAY_S = 20;

const MODES: DemoMode[] = ["verify", "window", "full"];
const TRUTHY = new Set(["1", "true", "yes", "intro", "boot", "briefing"]);

/** Flags a real player would hold at each entry point. */
const BASE: StoryFlag[] = ["INTRO_COMPLETE", "MET_ARIA", "FOUND_GUIDE"];
const VAULT: StoryFlag[] = ["FOUND_PRIVATE_HINT", "VAULT_OPENED", "FOUND_HIDDEN_ARCHIVE"];
const MILESTONES: StoryFlag[] = [
  "DISCOVERED_ORPHEUS",
  "FOUND_0213_LOG",
  "IDENTIFIED_CONTACT",
  "DISCOVERED_SURVEILLANCE",
  "DISCOVERED_METADATA",
  "FOUND_PHOTO_017",
  "COLLABORATED_WITH_ARIA",
];

function flagsFor(mode: DemoMode): StoryFlag[] {
  switch (mode) {
    case "verify":
      return BASE;
    case "window":
      return [...BASE, ...VAULT];
    case "full":
      return [...BASE, ...VAULT, ...MILESTONES];
    default:
      return [];
  }
}

export function readDemoConfig(search?: string): DemoConfig {
  const raw = search ?? (typeof window === "undefined" ? "" : window.location.search);
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return { mode: "none", skipIntro: false };
  }
  const asked = (params.get("demo") ?? "").trim().toLowerCase();
  const mode = (MODES as string[]).includes(asked) ? (asked as DemoMode) : "none";
  const skip = (params.get("skip") ?? "").trim().toLowerCase();
  return { mode, skipIntro: mode !== "none" || TRUTHY.has(skip) };
}

export function isDemoEntry(cfg: DemoConfig): boolean {
  return cfg.mode !== "none" || cfg.skipIntro;
}

/** Human-readable banner text, so a preloaded desk never looks like a fresh one. */
export function demoBanner(cfg: DemoConfig): { title: string; body: string } | null {
  switch (cfg.mode) {
    case "verify":
      return {
        title: "DEMO ENTRY — LINK OPEN",
        body: "State preloaded, tools untouched. ⚡ QUICK VERIFY runs 12 evals plus 3 calls that move this screen.",
      };
    case "window":
      return {
        title: "DEMO ENTRY — VESTIBULE OPEN",
        body: `02:13 arms in ~${DEMO_WINDOW_DELAY_S}s. Then: you zoom the clock in DSC04655, ARIA calls get_system_logs — both inside 90 seconds.`,
      };
    case "full":
      return {
        title: "DEMO ENTRY — CASE ADVANCED",
        body: "Vestibule open, reconstruction unlocked, 02:13 arming. Every gate is the real gate; only the flags were preloaded.",
      };
    default:
      return cfg.skipIntro
        ? { title: "DEMO ENTRY — INTRO SKIPPED", body: "Cold desk, nothing else preloaded." }
        : null;
  }
}

/**
 * Apply a demo entry point to the live stores. Resolves once the state is in
 * place; the caller sets the phase.
 */
export async function applyDemoConfig(cfg: DemoConfig): Promise<void> {
  if (!isDemoEntry(cfg)) return;

  const flags = flagsFor(cfg.mode);
  if (flags.length) {
    const next = new Set(useOS.getState().flags);
    for (const f of flags) next.add(f);
    useOS.setState({ flags: next });
  }
  if (cfg.mode === "window" || cfg.mode === "full") {
    useOS.setState({ vaultUnlocked: true });
  }

  const S = await import("@/game/services");
  if (cfg.mode === "window" || cfg.mode === "full") {
    S.armObservabilityWindow(DEMO_WINDOW_DELAY_S);
  }
  if (cfg.mode === "full") {
    S.checkReconstructionAvailable();
  }
}
