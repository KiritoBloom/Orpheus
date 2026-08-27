"use client";

import { useEffect, useState } from "react";
import type { AppId } from "@/types/game";
import { APP_LABELS, ALL_APPS } from "@/types/game";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { sfx } from "@/audio/engine";
import AgentLinkPanel from "@/components/AgentLinkPanel";
import { APP_ICONS, IconCrt, IconLink, IconSoundOff, IconSoundOn } from "@/components/icons/WorkstationIcons";

/* ============================================================
   TASKBAR — app buttons, fictional clock, tray (CRT / sound / LINK).
   Agent status reflects WebMCP tool activity.
   ============================================================ */

export default function Taskbar() {
  const os = useOS();
  const agentStatus = useAria((s) => s.status);
  const [now, setNow] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const hasLinkHint = !os.flags.has("COLLABORATED_WITH_ARIA") && !os.flags.has("DISCOVERED_ORPHEUS") && !linkOpen;

  // listen for LINK hotkey dispatch from GameRoot
  useEffect(() => {
    const open = () => setLinkOpen(true);
    window.addEventListener("orpheus:open-link" as never, open as never);
    return () => window.removeEventListener("orpheus:open-link" as never, open as never);
  }, []);

  // fictional clock: starts at the final morning, advances in real time
  useEffect(() => {
    const tick = () => {
      const base = new Date("2026-03-10T09:12:00").getTime();
      const elapsed = Date.now() - os.clockStart;
      const d = new Date(base + elapsed);
      setNow(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} · MAR 10`
      );
    };
    tick();
    const i = setInterval(tick, 5000);
    return () => clearInterval(i);
  }, [os.clockStart]);

  function launch(app: AppId) {
    if (os.windows[app].open && !os.windows[app].minimized) {
      if (os.focused === app) os.minimizeWindow(app);
      else os.focusWindow(app);
    } else {
      os.openApp(app);
    }
    sfx.click();
  }

  return (
    <>
      <div className="taskbar-90s absolute bottom-0 left-0 right-0 flex items-center z-[600] px-1 gap-1">
        {/* left: 90s Start-style — outset, hard bevel */}
        <button
          onClick={() => { os.openApp("files"); sfx.click(); }}
          className="task-start-90s flex items-center gap-1.5 px-2 h-[22px] shrink-0 select-none"
          title="MCDUFF WORKSTATION"
        >
          <span className="w-[7px] h-[7px] bg-accent border border-black/30" style={{ boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.25)" }} />
          <span className="text-[10px] tracking-[0.18em] font-bold text-txt">ORPHEUS</span>
          <span className="hidden sm:inline text-[8px] tracking-[0.14em] text-faint ml-1">4.2</span>
          <span className={`hidden md:inline w-1.5 h-1.5 ml-1 border border-black/40 ${agentStatus !== "idle" ? "bg-accent" : "bg-[#1a1a1a]"}`} />
        </button>

        <div className="w-px h-[18px] bg-[#0a0f0e] mx-1 shrink-0" />
        <div className="w-px h-[18px] bg-[#3d4a45] -ml-1 mr-1 shrink-0" />

        {/* center: app cluster — 90s task buttons with 2px bevel */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {ALL_APPS.map((app) => {
            const w = os.windows[app];
            const running = w.open;
            const isFocused = os.focused === app && running;
            const Icon = APP_ICONS[app];
            return (
              <button
                key={app}
                onClick={() => launch(app)}
                title={`${APP_LABELS[app]} — ${running ? "running" : "launch"}`}
                aria-label={`open ${APP_LABELS[app]}`}
                className={`task-btn-90s relative w-[32px] h-[22px] grid place-items-center ${isFocused ? "is-active" : ""}`}
              >
                <Icon size={14} className={isFocused ? "text-accent" : running ? "text-txt" : "text-faint"} />
                {running && !isFocused && <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-[14px] h-[2px] bg-faint/60" />}
              </button>
            );
          })}
        </div>

        {/* right: tray — 90s inset + chunky buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {os.flags.has("CASE_RECONSTRUCTION_AVAILABLE") && !os.flags.has("CASE_COMPLETE") && (
            <span className="hidden lg:inline text-[8px] tracking-[0.14em] text-amber mr-1 border border-amber/40 px-1 bg-amber/10">READY</span>
          )}

          <button
            onClick={() => {
              os.setSettings({ crt: !os.settings.crt });
              sfx.click();
            }}
            title={os.settings.crt ? "CRT ON" : "CRT OFF"}
            className={`w-[22px] h-[22px] grid place-items-center task-btn-90s ${os.settings.crt ? "" : "opacity-60"}`}
          >
            <IconCrt size={12} />
          </button>

          <button
            onClick={() => {
              const next = !os.settings.sound;
              os.setSettings({ sound: next });
              sfx.setEnabled(next);
              if (next) sfx.click();
            }}
            title={os.settings.sound ? "Sound on" : "Sound off"}
            className="w-[22px] h-[22px] grid place-items-center task-btn-90s"
          >
            {os.settings.sound ? <IconSoundOn size={12} /> : <IconSoundOff size={12} />}
          </button>

          <button
            onClick={() => setLinkOpen(true)}
            title="Agent Link — WebMCP (Ctrl+`) — 23 tools"
            className={`h-[22px] px-2 flex items-center gap-1 task-btn-90s text-[9px] tracking-[0.14em] ${hasLinkHint ? "!border-amber/50 !text-amber bg-amber/10" : ""}`}
          >
            <IconLink size={11} />
            LINK
          </button>

          <div className="taskbar-inset hidden sm:grid place-items-center h-[22px] px-2 text-[10px] tracking-[0.12em] text-faint font-mono ml-1">
            {now}
          </div>
        </div>
      </div>

      {linkOpen && <AgentLinkPanel onClose={() => setLinkOpen(false)} />}
    </>
  );
}
