"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppId } from "@/types/game";
import { APP_LABELS, ALL_APPS } from "@/types/game";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { sfx } from "@/audio/engine";
import AgentLinkPanel from "@/components/AgentLinkPanel";
import { TOOL_DEFS } from "@/webmcp/register";
import { activeCorpus } from "@/game/data/corpus";
import { APP_ICONS, IconCrt, IconLink, IconSoundOff, IconSoundOn } from "@/components/icons/WorkstationIcons";

/* short taskbar labels — full names stay in APP_LABELS (tooltips + aria) */
const TASK_LABELS: Record<AppId, string> = {
  files: "FILES",
  mail: "MAIL",
  messages: "MSGS",
  photos: "PHOTOS",
  browser: "WEB",
  terminal: "TERM",
  systemlog: "LOGS",
  evidence: "EVIDENCE",
};


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

  // unread badges — reactive via osStore so marking read clears the dot
  const chrome = activeCorpus().chrome;
  const readMailIds = useOS((s) => s.readMailIds);
  const readThreadIds = useOS((s) => s.readThreadIds);
  const unreadMail = useMemo(() => activeCorpus().emails.filter((e) => e.unread && !readMailIds.has(e.id)).length, [readMailIds]);
  // count only threads currently visible — the hidden unexplained thread is not unread until it arrives
  const unreadThreads = useMemo(
    () =>
      activeCorpus().threads.filter(
        (t) => !(t.hiddenUntilFlag && !os.flags.has(t.hiddenUntilFlag)) && !readThreadIds.has(t.id)
      ).length,
    [readThreadIds, os.flags]
  );

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
          className="task-start-90s flex items-center gap-1.5 px-2.5 h-[26px] shrink-0 select-none"
          title={chrome.watermark}
        >
          <span className="w-[8px] h-[8px] bg-accent border border-black/40" style={{ boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.3)" }} />
          <span className="text-[11px] tracking-[0.18em] font-bold text-txt">ORPHEUS</span>
          <span className="hidden sm:inline text-[9px] tracking-[0.14em] text-dim ml-0.5">4.2</span>
          <span
            className={`hidden md:inline w-2 h-2 ml-1 border border-black/50 ${agentStatus !== "idle" ? "bg-accent animate-pulse" : "bg-[#131c19]"}`}
            style={agentStatus !== "idle" ? { boxShadow: "0 0 6px rgba(143,202,160,0.9)" } : undefined}
          />
        </button>

        <div className="w-px h-[22px] bg-[#0a0f0e] mx-1 shrink-0" />
        <div className="w-px h-[22px] bg-[#46554e] -ml-1 mr-1 shrink-0" />

        {/* center: app cluster — 90s task buttons with 2px bevel */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {ALL_APPS.map((app) => {
            const w = os.windows[app];
            const running = w.open;
            const isFocused = os.focused === app && running;
            const Icon = APP_ICONS[app];
            const badge =
              app === "mail" && unreadMail > 0 ? unreadMail :
              app === "messages" && unreadThreads > 0 ? unreadThreads :
              0;
            const showBadge = badge > 0 && !running;
            return (
              <button
                key={app}
                onClick={() => launch(app)}
                title={`${APP_LABELS[app]} — ${running ? "running" : "launch"}`}
                aria-label={`open ${APP_LABELS[app]}`}
                className={`task-btn-90s relative flex items-center justify-center gap-1.5 px-2 h-[26px] cursor-pointer ${isFocused ? "is-active" : ""}`}
              >
                <Icon size={15} className={isFocused ? "text-accent" : running ? "text-txt" : "text-dim"} />
                <span className={`hidden xl:inline text-[10px] tracking-[0.12em] whitespace-nowrap ${isFocused ? "text-accent" : running ? "text-txt" : "text-dim"}`}>
                  {TASK_LABELS[app]}
                </span>
                {running && !isFocused && <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-[55%] h-[2px] bg-accent/60" />}
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-0.5 grid place-items-center bg-amber text-black text-[9px] font-bold leading-none border border-black"
                    style={{ boxShadow: "0 0 6px rgba(214,176,122,0.45)" }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* right: tray — 90s inset + chunky buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {os.obsWindow.open && (
            <span
              className="hidden lg:inline text-[9px] tracking-[0.14em] text-amber mr-1 border border-amber/40 px-1.5 bg-amber/10"
              style={{ animation: "evHighlight 1.6s ease-in-out infinite" }}
            >
              {chrome.watermarkBadge} WINDOW
            </span>
          )}
          {os.flags.has("CASE_RECONSTRUCTION_AVAILABLE") && !os.flags.has("CASE_COMPLETE") && (
            <span className="hidden lg:inline text-[9px] tracking-[0.14em] text-amber mr-1 border border-amber/40 px-1.5 bg-amber/10">READY</span>
          )}

          <button
            onClick={() => {
              os.setSettings({ crt: !os.settings.crt });
              sfx.click();
            }}
            title={os.settings.crt ? "CRT ON" : "CRT OFF"}
            className={`w-[26px] h-[26px] grid place-items-center task-btn-90s ${os.settings.crt ? "" : "opacity-60"}`}
          >
            <IconCrt size={13} />
          </button>

          <button
            onClick={() => {
              const next = !os.settings.sound;
              os.setSettings({ sound: next });
              sfx.setEnabled(next);
              if (next) sfx.click();
            }}
            title={os.settings.sound ? "Sound on" : "Sound off"}
            className="w-[26px] h-[26px] grid place-items-center task-btn-90s"
          >
            {os.settings.sound ? <IconSoundOn size={13} /> : <IconSoundOff size={13} />}
          </button>

          <button
            onClick={() => setLinkOpen(true)}
            title={`Agent Link — WebMCP (Ctrl+\`) — ${TOOL_DEFS.length} tools`}
            className={`h-[26px] px-2.5 flex items-center gap-1.5 task-btn-90s text-[10px] tracking-[0.14em] cursor-pointer ${hasLinkHint ? "!border-amber/50 !text-amber bg-amber/10 ev-highlight" : ""}`}
            style={hasLinkHint ? { animation: "evHighlight 2.2s ease-in-out infinite" } : undefined}
          >
            <IconLink size={12} />
            LINK
          </button>

          <div className="taskbar-inset hidden sm:grid place-items-center h-[26px] px-2.5 text-[11px] tracking-[0.12em] text-dim font-mono ml-1">
            {now}
          </div>
        </div>
      </div>

      {linkOpen && <AgentLinkPanel onClose={() => setLinkOpen(false)} />}
    </>
  );
}
