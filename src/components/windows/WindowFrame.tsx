"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WinId } from "@/types/game";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   WINDOW FRAME — drag / min / max / close / focus / z-order
   ============================================================ */

export default function WindowFrame({
  id,
  title,
  children,
}: {
  id: WinId;
  title: string;
  children: React.ReactNode;
}) {
  const win = useOS((s) => s.windows[id]);
  const focused = useOS((s) => s.focused === id);
  const reducedMotion = useOS((s) => s.settings.reducedMotion);
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, setGeom } = useOS();
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isShading, setIsShading] = useState(false);
  const [justOpened, setJustOpened] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (win.maximized) return;
      focusWindow(id);
      const startX = e.clientX;
      const startY = e.clientY;
      const { x, y } = win.geom;
      dragRef.current = { dx: startX - x, dy: startY - y };

      const move = (ev: PointerEvent) => {
        if (!dragRef.current) return;
        setGeom(id, {
          x: Math.max(-40, ev.clientX - dragRef.current.dx),
          y: Math.max(0, ev.clientY - dragRef.current.dy),
        });
      };
      const up = () => {
        dragRef.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [id, win, focusWindow, setGeom]
  );

  // app-specific subtle tint — same OS, slightly different personality
  const appTint: Record<string, string> = {
    files: "#1e2e2a",
    mail: "#1c2a28",
    messages: "#1a2622",
    photos: "#1a1e1c",
    browser: "#16201e",
    terminal: "#0a140f",
    systemlog: "#121a18",
    evidence: "#1f2a26",
    textviewer: "#141e1c",
    imageviewer: "#0f1412",
  };

  // 90s open ghost + scan when win just opened
  useEffect(() => {
    if (win.open && !win.minimized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- entrance animation trigger
      setJustOpened(true);
      const t = setTimeout(() => setJustOpened(false), 220);
      return () => clearTimeout(t);
    }
  }, [win.open, win.minimized]);

  // handle minimized shade animation
  useEffect(() => {
    if (win.minimized && !isShading) {
      // arrived minimized via external (taskbar) — no shade needed
    }
  }, [win.minimized, isShading]);

  if (!win.open) return null;
  // if minimized, we still render but shade up — parent taskbar will show button; we hide content with clip
  // For clean 90s shade, we animate then keep hidden; but for simplicity, if minimized and not shading, return null (taskbar shows)
  if (win.minimized && !isShading) return null;

  const geom = win.maximized
    ? { x: 0, y: 0, w: "100vw", h: "calc(100vh - 38px)" }
    : win.geom;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reducedMotion) {
      closeWindow(id);
      sfx.windowClose();
      return;
    }
    setIsExiting(true);
    sfx.windowClose();
    setTimeout(() => {
      setIsExiting(false);
      closeWindow(id);
    }, 160);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (reducedMotion) {
      minimizeWindow(id);
      sfx.minimize();
      return;
    }
    setIsShading(true);
    sfx.minimize();
    setTimeout(() => {
      setIsShading(false);
      minimizeWindow(id);
    }, 140);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMaximize(id);
    sfx.maximize();
  };

  const animClass = reducedMotion
    ? ""
    : isExiting
      ? "win-90s-close"
      : isShading
        ? "win-shade-up"
        : justOpened
          ? "win-90s-open"
          : "";

  return (
    <div
      className={`absolute flex flex-col ${focused ? "win-bevel" : "win-bevel-inactive"} ${animClass}`}
      style={{
        left: geom.x as number,
        top: geom.y as number,
        width: geom.w as number,
        height: geom.h as number,
        zIndex: win.z,
        background: appTint[id] ?? "#1e2e2a",
        boxShadow: focused ? "4px 4px 0 rgba(0,0,0,0.35), 0 0 0 1px #000" : "3px 3px 0 rgba(0,0,0,0.28), 0 0 0 1px #000",
        cursor: "default",
      }}
      onPointerDown={() => focusWindow(id)}
      role="dialog"
      aria-label={title}
    >
      {/* 90s ghost zoom rects behind window on open — monochrome, no green */}
      {justOpened && !reducedMotion && (
        <>
          <div className="win-ghost" />
          <div className="win-ghost" />
          <div className="win-ghost" />
        </>
      )}
      {/* title bar — solid 90s, no gradient, no scan */}
      <div
        className={`flex items-center justify-between px-1 h-[22px] shrink-0 select-none touch-none ${
          focused ? "win-active-titlebar" : "win-inactive-titlebar"
        }`}
        style={{ borderBottom: focused ? "1px solid #0a0f0e" : "1px solid #1a1a1a" }}
        onPointerDown={onPointerDown}
        onDoubleClick={handleMaximize}
      >
        <span className={`text-[10px] tracking-[0.16em] truncate px-1 ${focused ? "text-white" : "text-faint"}`} style={{ fontWeight: focused ? 700 : 400 }}>
          {title}
        </span>
        <div className="flex gap-1">
          <button
            aria-label="minimize"
            className="w-[16px] h-[14px] bg-[#2a3a35] border-t border-l border-[#4a5a53] border-r border-b border-[#0a0f0e] grid place-items-center text-[9px] leading-none text-txt hover:bg-[#32423d]"
            style={{ borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 2 }}
            onClick={handleMinimize}
          >
            _
          </button>
          <button
            aria-label="maximize"
            className="w-[16px] h-[14px] bg-[#2a3a35] border-t border-l border-[#4a5a53] border-r border-b border-[#0a0f0e] grid place-items-center text-[8px] leading-none text-txt hover:bg-[#32423d]"
            style={{ borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 2 }}
            onClick={handleMaximize}
          >
            □
          </button>
          <button
            aria-label="close"
            className="w-[16px] h-[14px] bg-[#2a3a35] border-t border-l border-[#4a5a53] border-r border-b border-[#0a0f0e] grid place-items-center text-[9px] leading-none text-txt hover:bg-[#3a2a2a] hover:text-alert"
            style={{ borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 2 }}
            onClick={handleClose}
          >
            ✕
          </button>
        </div>
      </div>

      {/* content — 90s inset, no scan */}
      <div className="flex-1 min-h-0 relative overflow-hidden" style={{ background: "#0f1a17", borderTop: "2px solid #0a0f0e", borderLeft: "2px solid #0a0f0e", borderRight: "2px solid #3d4a45", borderBottom: "2px solid #3d4a45" }}>
        {children}
      </div>
    </div>
  );
}
