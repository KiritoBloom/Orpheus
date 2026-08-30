"use client";

import { useRef, useState } from "react";
import type { AppId } from "@/types/game";
import { APP_LABELS } from "@/types/game";
import { useOS } from "@/game/state/osStore";
import { activeCorpus } from "@/game/data/corpus";
import { sfx } from "@/audio/engine";
import { APP_ICONS, IconFieldGuide, IconPrivate } from "@/components/icons/WorkstationIcons";

/* ============================================================
   DESKTOP ICONS — IRIX IconView style, clean, no emoji.
   48px tiles, 11px mono labels, phosphor selection.
   ============================================================ */

export default function DesktopIcons() {
  const os = useOS();
  const [selected, setSelected] = useState<AppId | null>(null);
  const lastTap = useRef<{ app: AppId; t: number } | null>(null);

  function activate(app: AppId) {
    setSelected(app);
    // eslint-disable-next-line react-hooks/purity -- event handler, not render
    const now = Date.now();
    if (lastTap.current?.app === app && now - lastTap.current.t < 450) {
      os.openApp(app);
      sfx.windowOpen();
      lastTap.current = null;
    } else {
      lastTap.current = { app, t: now };
      sfx.click();
    }
  }

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1 z-[10]" onPointerDown={(e) => e.stopPropagation()}>
      {(Object.keys(APP_ICONS) as AppId[]).map((app) => {
        const Icon = APP_ICONS[app];
        const isSel = selected === app;
        return (
          <button
            key={app}
            onClick={() => activate(app)}
            className="w-[76px] py-1.5 flex flex-col items-center gap-1 no-select"
            aria-label={`launch ${APP_LABELS[app]}`}
          >
            <span
              className={`w-[34px] h-[34px] grid place-items-center ${isSel ? "border border-dotted border-white/70 bg-white/5" : "border border-transparent"}`}
            >
              <Icon size={20} className={isSel ? "text-white" : "text-dim"} />
            </span>
            <span className={`text-[10px] tracking-[0.1em] px-1 text-center leading-tight ${isSel ? "bg-[#000080] text-white" : "text-dim bg-black/25 border border-transparent"}`} style={{ fontFamily: "var(--font-mono)" }}>
              {APP_LABELS[app]}
            </span>
          </button>
        );
      })}

      {/* field guide — 90s: dotted when selected, amber dot when unread */}
      <button
        onClick={() => {
          import("@/game/services").then((m) => m.openFile(activeCorpus().guidePath));
          sfx.windowOpen();
        }}
        className="w-[76px] py-1.5 flex flex-col items-center gap-1 no-select relative"
        title="Open the Field Guide"
      >
        <span className={`w-[34px] h-[34px] grid place-items-center relative ${selected === null ? "border border-transparent" : "border border-transparent"}`}>
          <IconFieldGuide size={20} className={!os.flags.has("FOUND_GUIDE") ? "text-amber" : "text-dim"} />
          {!os.flags.has("FOUND_GUIDE") && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber border border-black" />}
        </span>
        <span className={`text-[10px] tracking-[0.1em] px-1 text-center leading-tight ${!os.flags.has("FOUND_GUIDE") ? "bg-amber text-black" : "text-dim bg-black/25"}`}>FIELD GUIDE</span>
        {!os.flags.has("FOUND_GUIDE") && <span className="text-[8px] tracking-[0.12em] text-amber -mt-1">START HERE</span>}
      </button>

      {/* private — appears once discovered */}
      {os.flags.has("FOUND_PRIVATE_HINT") && (
        <button
          onClick={() => {
            os.openApp("files");
            import("@/game/services").then((m) => m.openDirectory("/Private"));
          }}
          className="w-[76px] py-1.5 flex flex-col items-center gap-1 no-select"
        >
          <span className="w-[34px] h-[34px] grid place-items-center border border-transparent">
            <IconPrivate size={20} className="text-amber" />
          </span>
          <span className="text-[10px] tracking-[0.1em] px-1 text-center leading-tight text-dim bg-black/25">PRIVATE</span>
        </button>
      )}
    </div>
  );
}
