"use client";

import { useEffect } from "react";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   TOASTS — notifications + the ARIA ding.
   Shows when a toast is pushed; fades after 4.5s.
   ============================================================ */

export default function Toasts() {
  const toasts = useOS((s) => s.toasts);
  const dismissToast = useOS((s) => s.dismissToast);
  const sound = useOS((s) => s.settings.sound);

  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    if (sound) sfx.ding();
    const timer = setTimeout(() => dismissToast(latest.id), 4800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts.length]);

  return (
    <div className="fixed top-3 right-3 z-[700] flex flex-col gap-2 pointer-events-none max-w-[360px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in panel-raised border-l-2 !border-l-amber px-3 py-2 pr-7 pointer-events-auto win-shadow relative"
        >
          <button
            aria-label="dismiss"
            onClick={() => dismissToast(t.id)}
            className="absolute top-1 right-1 w-4 h-4 grid place-items-center text-faint hover:text-txt text-[10px] leading-none cursor-pointer"
          >
            ×
          </button>
          <div className="text-[10px] tracking-[0.18em] text-faint pr-3">{t.app}</div>
          <div className="text-[11px] text-txt pr-3">{t.title}</div>
          {t.body && <div className="text-[10.5px] text-dim mt-0.5 pr-3 leading-snug">{t.body}</div>}
          <div className="mt-1.5 h-px bg-amber/30 w-full" />
          <div className="text-[9px] tracking-[0.12em] text-faint mt-1">DISMISS · AUTO 5S</div>
        </div>
      ))}
    </div>
  );
}
