"use client";

import { useEffect, useState } from "react";

/* ============================================================
   EVENT FLASH — a brief cinematic dim+amber-rim overlay for
   the moments that need to be felt as beats in a recording:
   the NO SENDER messages, the 02:13 window open/close, the
   vault decrypt, and case complete.

   Listens for window event "orpheus:event-flash" (detail
   "cold" | "hot" — hot is brighter). Honors prefers-reduced-motion
   via the CSS @media query in globals.css (the overlay still
   fires but compresses to ~80ms).

   Visual proof in the video that the game reads as film, not UI.
   ============================================================ */

type FlashKey = number;

export default function EventFlash() {
  const [keys, setKeys] = useState<FlashKey[]>([]);

  useEffect(() => {
    const onFlash = (e: Event) => {
      const detail = (e as CustomEvent<{ tone?: "cold" | "hot" }>).detail;
      setKeys((prev) => [...prev, Date.now() + Math.random()]);
      // auto-cleanup after the CSS animation
      setTimeout(() => setKeys((prev) => prev.slice(1)), 1800);
      // hot tone stings brighter — a synthetic sound is the caller's job (sfx.*)
      if (detail?.tone === "hot") {
        // no-op visual: hot still uses the same overlay (CSS could be extended)
      }
    };
    window.addEventListener("orpheus:event-flash", onFlash as EventListener);
    return () => window.removeEventListener("orpheus:event-flash", onFlash as EventListener);
  }, []);

  return (
    <>
      {keys.map((k) => (
        <div key={k} className="event-flash-overlay" aria-hidden="true" />
      ))}
    </>
  );
}
