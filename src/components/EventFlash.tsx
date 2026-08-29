"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   EVENT FLASH — a brief cinematic dim+amber-rim overlay for
   the moments that need to be felt as beats in a recording:
   the NO SENDER messages and the 02:13 window open.

   Listens for window event "orpheus:event-flash" (detail
   "cold" | "hot"). Honors prefers-reduced-motion via the
   @media query in globals.css (the overlay still fires but
   compresses to ~80ms).

   Visual proof in the video that the game reads as film, not UI.
   ============================================================ */

type Tone = "cold" | "hot";
type Flash = { id: number; tone: Tone; createdAt: number };

/** ms the overlay stays in the DOM (matches the CSS animation duration). */
const OVERLAY_LIFETIME_MS = 1800;

export default function EventFlash() {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  // each scheduled cleanup is tracked so we can cancel on unmount and
  // remove the *correct* flash by id when the timer fires.
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const nextIdRef = useRef(0);

  const removeFlash = useCallback((id: number) => {
    setFlashes((prev) => prev.filter((f) => f.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    // local copy of the Map so the cleanup uses the same instance the
    // effect populated, not whatever the ref points to by unmount time
    const timers = timersRef.current;
    const onFlash = (e: Event) => {
      const detail = (e as CustomEvent<{ tone?: Tone }>).detail;
      const tone: Tone = detail?.tone === "hot" ? "hot" : "cold";
      const id = ++nextIdRef.current;
      setFlashes((prev) => [...prev, { id, tone, createdAt: Date.now() }]);
      const t = setTimeout(() => removeFlash(id), OVERLAY_LIFETIME_MS);
      timers.set(id, t);
    };
    window.addEventListener("orpheus:event-flash", onFlash as EventListener);
    return () => {
      window.removeEventListener("orpheus:event-flash", onFlash as EventListener);
      // cancel any pending cleanups on unmount
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, [removeFlash]);

  return (
    <>
      {flashes.map((f) => (
        <div
          key={f.id}
          className={`event-flash-overlay${f.tone === "hot" ? " event-flash-hot" : ""}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
