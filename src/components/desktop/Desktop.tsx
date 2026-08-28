"use client";

import { useEffect, useState } from "react";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";
import WindowFrame from "@/components/windows/WindowFrame";
import Taskbar from "@/components/taskbar/Taskbar";
import DesktopIcons from "@/components/desktop/DesktopIcons";
import ChecklistHUD from "@/components/desktop/ChecklistHUD";
import FilesApp from "@/components/applications/FilesApp";
import MailApp from "@/components/applications/MailApp";
import MessagesApp from "@/components/applications/MessagesApp";
import BrowserApp from "@/components/applications/BrowserApp";
import TerminalApp from "@/components/applications/TerminalApp";
import SystemLogApp from "@/components/applications/SystemLogApp";
import EvidenceApp from "@/components/applications/EvidenceApp";
import TextViewerApp from "@/components/applications/TextViewerApp";
import { PhotosApp, ImageViewerApp } from "@/components/applications/PhotosApp";

/* ============================================================
   DESKTOP — the fictional workstation surface.
   Windows compose on top; wallpaper underneath; taskbar below.
   ============================================================ */

export default function Desktop() {
  const crt = useOS((s) => s.settings.crt);
  const textScale = useOS((s) => s.settings.textScale);
  const [flicker, setFlicker] = useState(false);

  // subtle 02:13 intrigue pulse — brief horizontal scan, every ~38s, only when no window has focus (not distracting)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const schedule = () => {
      const delay = 28000 + Math.random() * 22000;
      const id = setTimeout(() => {
        if (document.visibilityState !== "visible") { schedule(); return; }
        setFlicker(true);
        setTimeout(() => setFlicker(false), 260);
        schedule();
      }, delay);
      return id;
    };
    const id = schedule();
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${textScale === "lg" ? "data-textscale-lg" : ""}`}
      style={{
        background:
          "radial-gradient(ellipse at 30% 18%, #1a2420 0%, transparent 55%), radial-gradient(ellipse at 85% 82%, #121a16 0%, transparent 55%), linear-gradient(180deg,#0d1210,#080a09)",
      }}
      data-textscale={textScale}
    >
      {/* faint grid — subtle 90s plotter paper */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg,#ffffff05 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.22,
        }}
      />
      {/* diegetic sticky — human trace that makes ORPHEUS personal, not just numbers */}
      <div
        className="absolute left-[108px] bottom-[64px] w-[148px] select-none hidden lg:block rotate-[-1.2deg] hover:rotate-[0.2deg] transition-transform duration-150 cursor-pointer"
        onMouseEnter={() => sfx.typeTick()}
        onClick={() => sfx.click()}
      >
        <div className="bg-[#f4edd6] text-[#2b241e] p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.12)] relative">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber/80 shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
          <div className="text-[9px] tracking-[0.14em] text-[#8a7a5a]">MAYA — RECITAL</div>
          <div className="text-[11px] font-medium leading-none mt-0.5 line-through decoration-[#b48a5a] decoration-1">19:00 — DON&apos;T BE LATE</div>
          <div className="text-[10px] text-[#6b5a3a] mt-1">run 150? @02:13??</div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#e8dcc0] shadow-[-1px_-1px_2px_rgba(0,0,0,0.08)]" style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
        </div>
        <div className="text-[8px] tracking-[0.16em] text-amber/50 mt-1 text-center">FOUND TAPED TO MONITOR — PHOTOGRAPHED</div>
      </div>

      {/* watermark — 90s inventory tag, muted */}
      <div className="absolute top-2 right-3 mono-xs text-faint select-none pointer-events-none flex items-center gap-2">
        <span className="text-faint">MCDUFF WORKSTATION v4.2 · AIR-GAPPED</span>
        <span className="hidden md:inline text-[9px] tracking-[0.16em] text-faint/70 border border-faint/20 px-1">02:13</span>
      </div>

      {/* desktop icons */}
      <DesktopIcons />

      {/* investigation checklist HUD — persistent, lives on wallpaper */}
      <ChecklistHUD />

      {/* windows */}
      <WindowFrame id="files" title="FILE MANAGER"><FilesApp /></WindowFrame>
      <WindowFrame id="mail" title="MAIL"><MailApp /></WindowFrame>
      <WindowFrame id="messages" title="MESSAGES — ON-DEVICE"><MessagesApp /></WindowFrame>
      <WindowFrame id="photos" title="PHOTOS"><PhotosApp /></WindowFrame>
      <WindowFrame id="browser" title="BROWSER (OFFLINE)"><BrowserApp /></WindowFrame>
      <WindowFrame id="terminal" title="TERMINAL"><TerminalApp /></WindowFrame>
      <WindowFrame id="systemlog" title="SYSTEM LOG"><SystemLogApp /></WindowFrame>
      <WindowFrame id="evidence" title="EVIDENCE BOARD"><EvidenceApp /></WindowFrame>
      <WindowFrame id="textviewer" title="DOCUMENT VIEWER"><TextViewerApp /></WindowFrame>
      <WindowFrame id="imageviewer" title="PHOTO VIEWER"><ImageViewerApp /></WindowFrame>

      {/* subtle 90s CRT retrace — gray, not green */}
      {flicker && <div className="absolute inset-0 pointer-events-none z-[5] bg-white/[0.03]" style={{ height: "2px", top: "34%", boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }} />}

      <Taskbar />

      {/* overlays */}
      {!crt && <style>{`.crt-overlay,.crt-vignette{display:none !important;}`}</style>}
    </div>
  );
}
