"use client";

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/types/game";
import { flagLogDiscovery, getSystemLogs } from "@/game/services";
import { sfx } from "@/audio/engine";

/* ============================================================
   SYSTEM LOG — the machine's testimony. Scrolling to the
   final night's 02:13 block sets a story flag.
   ============================================================ */

const SEV_COLOR: Record<LogEntry["severity"], string> = {
  info: "text-dim",
  warn: "text-amber",
  alert: "text-alert",
};

export default function SystemLogApp() {
  const logs = getSystemLogs();
  const scroller = useRef<HTMLDivElement>(null);
  const flaggedRef = useRef(false);

  // focusFinalNight() is called by services / local assist
  useEffect(() => {
    (window as unknown as { __focusFinalNight?: () => void }).__focusFinalNight = () => {
      const el = document.getElementById("log-final-night");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    return () => { delete (window as unknown as { __focusFinalNight?: () => void }).__focusFinalNight; };
  }, []);

  function onScroll() {
    if (flaggedRef.current) return;
    const el = document.getElementById("log-final-night");
    if (!el || !scroller.current) return;
    const r = el.getBoundingClientRect();
    const sr = scroller.current.getBoundingClientRect();
    if (r.top < sr.bottom && r.bottom > sr.top) {
      flaggedRef.current = true;
      flagLogDiscovery();
    }
  }

  return (
    <div className="flex flex-col h-full text-[11.5px]">
      <div className="shrink-0 h-[28px] px-2 flex items-center justify-between border-b border-line bg-surface text-[10px] tracking-[0.12em] text-faint">
        <span>SYSTEM EVENT LOG — APPEND-ONLY</span>
        <span>scroll to FINAL NIGHT for 2026-03-09/10</span>
      </div>
      <div ref={scroller} className="flex-1 min-h-0 overflow-y-auto" onScroll={onScroll}>
        {/* jump chip */}
        <button
          className="sticky top-0 z-10 float-right m-2 btn-bevel text-[9px]"
          onClick={() => { document.getElementById("log-final-night")?.scrollIntoView({ behavior: "smooth" }); sfx.click(); }}
        >
          ▼ FINAL NIGHT
        </button>

        {logs.map((l, index) => {
          const showDate = index === 0 || l.date !== logs[index - 1].date;
          const isFinalNightStart = l.id === "log_023";
          return (
            <div key={l.id}>
              {showDate && (
                <div id={isFinalNightStart ? "log-final-night" : undefined}
                  className="sticky top-[26px] bg-surface2 border-y border-line px-2 py-[3px] mono-xs text-accentdim">
                  ── {l.date} ──
                </div>
              )}
              <div className={`grid grid-cols-[64px_74px_86px_1fr] gap-2 px-2 py-[3px] border-b border-line hover:bg-surface`}>
                <span className="text-faint">{l.time}</span>
                <span className={`text-[9.5px] tracking-wide ${SEV_COLOR[l.severity]}`}>{l.category}</span>
                <span className={`text-[9.5px] ${l.severity === "alert" ? "text-alert" : "text-faint"}`}>{l.severity.toUpperCase()}</span>
                <span className={`${SEV_COLOR[l.severity]} leading-snug`}>{l.detail}</span>
              </div>
            </div>
          );
        })}
        <div className="p-3 text-faint text-[10px]">— end of retained log (older entries rotated) —</div>
      </div>
    </div>
  );
}

/** helper used by services + local assist */
export function focusFinalNight() {
  (window as unknown as { __focusFinalNight?: () => void }).__focusFinalNight?.();
}
