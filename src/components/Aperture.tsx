"use client";

import { useCallback, useEffect, useState } from "react";
import { useOS } from "@/game/state/osStore";

/* ============================================================
   APERTURE — the one transition this machine owns.

   ORPHEUS is an optic. So phases do not cut, fade, or wipe:
   the shutter shuts on the phase you are leaving and opens on
   the one you are entering, through the same pinhole, blades
   sweeping, rim lit. The whole OS behaves like one lens.

   <Aperture dir="in" />   plays on arrival, self-unmounts
   usePhaseExit(fn)        shuts, then runs fn
   ============================================================ */

const IN_MS = 900;
const OUT_MS = 460;

export function Aperture({ dir }: { dir: "in" | "out" }) {
  const reduced = useOS((s) => s.settings.reducedMotion);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (dir === "out") return; // the exit is unmounted by the phase swap itself
    const t = setTimeout(() => setGone(true), IN_MS + 60);
    return () => clearTimeout(t);
  }, [dir]);

  if (gone || reduced) return null;

  return (
    <div className={`aperture aperture-${dir}`} aria-hidden>
      <div className="aperture-iris" />
      <div className="aperture-blades" />
      <div className="aperture-rim" />
      <div className="aperture-glint" />
    </div>
  );
}

/**
 * Shuts the aperture on the current phase, then hands over.
 * Returns `[leaving, leave]` — render `<Aperture dir="out" />` while `leaving`.
 */
export function usePhaseExit(onDone: () => void) {
  const reduced = useOS((s) => s.settings.reducedMotion);
  const [leaving, setLeaving] = useState(false);

  const leave = useCallback(() => {
    setLeaving((already) => {
      if (already) return already;
      setTimeout(onDone, reduced ? 60 : OUT_MS);
      return true;
    });
  }, [onDone, reduced]);

  return [leaving && !reduced, leave] as const;
}

export const APERTURE_OUT_MS = OUT_MS;
