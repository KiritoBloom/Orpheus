"use client";

import { useEffect, useState } from "react";
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
    toasts.forEach((t) => {
      if (sound) sfx.ding();
      const timer = setTimeout(() => dismissToast(t.id), 4500);
      return () => clearTimeout(timer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts.length]);

  return (
    <div className="fixed top-3 right-3 z-[700] flex flex-col gap-2 pointer-events-none max-w-[360px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in panel-raised border-l-2 !border-l-amber px-3 py-2 pointer-events-auto win-shadow"
        >
          <div className="text-[10px] tracking-[0.18em] text-faint">{t.app}</div>
          <div className="text-[11px] text-txt">{t.title}</div>
          {t.body && <div className="text-[10.5px] text-dim mt-0.5">{t.body}</div>}
        </div>
      ))}
    </div>
  );
}
