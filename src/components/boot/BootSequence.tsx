"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/audio/engine";
import { useOS } from "@/game/state/osStore";

/* ============================================================
   BOOT SEQUENCE — 90s POST, visually consistent with briefing.
   Single clean cadence, no typing loop, no per-line chatter.
   One soft swell on power, one beep when ready.
   ============================================================ */

const BOOT_LINES: { text: string; cls?: string }[] = [
  { text: "MCDUFF PERSONAL COMPUTING SYSTEM" },
  { text: "BIOS 4.72 — UNREGISTERED TO: D. MCDUFF" },
  { text: "" },
  { text: "POST INITIALIZATION CHECK" },
  { text: "@MEMTEST" },
  { text: "STORAGE ................... OK   (1 volume, 1 damaged sector)" },
  { text: "SYSTEM CLOCK .............. OK   (drift corrected)" },
  { text: "SECURITY .................. OK   (sealed directive store present)" },
  { text: "NETWORK ................... DISABLED  [PHYSICAL]", cls: "text-amber" },
  { text: "USER PROFILE .............. DANIEL MCDUFF" },
  { text: "" },
  { text: "ARIA SERVICE .............. WAKE ON EVENT — ASSIST MODE", cls: "text-accent" },
  { text: "" },
  { text: "LOADING PERSONAL PROFILE..." },
];

const MEM_INDEX = BOOT_LINES.findIndex((l) => l.text === "@MEMTEST");
const MEM_TOTAL = 65536;
const TYPE_MS = 11;
const LINE_PAUSE = 140;
const BLANK_PAUSE = 90;

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"splash" | "post">("splash");
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  const [done, setDone] = useState(false);
  const [memK, setMemK] = useState(0);
  const [memDone, setMemDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const os = useOS();

  // splash — single swell, then post (snappier)
  useEffect(() => {
    if (phase !== "splash") return;
    if (os.settings.sound) {
      sfx.ensure();
      sfx.bootSwell();
    }
    const t = setTimeout(() => setPhase("post"), 1350);
    return () => clearTimeout(t);
  }, [phase, os.settings.sound]);

  // typing driver — per-character Cherry KC 1000 key, humanized
  useEffect(() => {
    if (phase !== "post" || done) return;
    const line = BOOT_LINES[shown];
    if (!line) {
      setDone(true);
      if (os.settings.sound) sfx.bootBeep();
      return;
    }
    const reduced = os.settings.reducedMotion;

    if (line.text === "" || reduced) {
      if (reduced && line.text === "@MEMTEST") {
        setMemK(MEM_TOTAL);
        setMemDone(true);
      }
      const d = line.text === "" ? BLANK_PAUSE : LINE_PAUSE;
      const t = setTimeout(() => setShown((s) => s + 1), d);
      timer.current = t;
      return () => clearTimeout(t);
    }

    if (line.text === "@MEMTEST") {
      const t = setTimeout(() => setShown((s) => s + 1), 720);
      timer.current = t;
      return () => clearTimeout(t);
    }

    if (chars < line.text.length) {
      // one Cherry click per glyph — random sample + pitch/volume + timing jitter
      if (os.settings.sound) {
        const ch = line.text[chars];
        if (ch !== " " && ch !== "\t") sfx.bootKey();
        else if (Math.random() < 0.18) sfx.bootKey();
      }
      const jitter = Math.random() * 6 - 3;
      const t = setTimeout(() => setChars((c) => c + 1), Math.max(6, TYPE_MS + jitter));
      timer.current = t;
      return () => clearTimeout(t);
    }

    // line complete — tiny heavier return, like a carriage hit
    if (os.settings.sound && line.text.trim().length > 0) sfx.bootKeyEnter();
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      setChars(0);
    }, LINE_PAUSE);
    timer.current = t;
    return () => clearTimeout(t);
  }, [phase, shown, chars, done, os.settings.reducedMotion, os.settings.sound, memDone]);

  // live memory counter — brisk but readable, no audio
  useEffect(() => {
    if (phase !== "post" || os.settings.reducedMotion) return;
    if (shown !== MEM_INDEX || memDone) return;
    const id = setInterval(() => {
      setMemK((k) => {
        const next = Math.min(MEM_TOTAL, k + 6144 + Math.floor(Math.random() * 4096));
        if (next >= MEM_TOTAL) {
          clearInterval(id);
          setMemDone(true);
        }
        return next;
      });
    }, 26);
    return () => clearInterval(id);
  }, [phase, shown, memDone, os.settings.reducedMotion]);

  function handleSkip() {
    if (phase === "splash") {
      setPhase("post");
      return;
    }
    if (!done) {
      setMemK(MEM_TOTAL);
      setMemDone(true);
      setShown(BOOT_LINES.length);
      setChars(0);
      setDone(true);
      if (os.settings.sound) sfx.bootBeep();
      return;
    }
    onDone();
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, shown, phase]);

  const renderLine = (text: string) => {
    if (text !== "@MEMTEST") return text;
    return memDone
      ? `MEMORY TEST .............. ${MEM_TOTAL}K OK`
      : `MEMORY TEST .............. ${memK}K`;
  };

  const current = BOOT_LINES[shown];
  const postDone = done;
  const progress = `${Math.min(shown + (done ? 0 : 1), BOOT_LINES.length)}/${BOOT_LINES.length}`;

  return (
    <div className="boot-shell" onClick={handleSkip} role="status" aria-label="system boot">
      <div className="boot-frame" onClick={(e) => e.stopPropagation()}>
        <div className="boot-titlebar">
          <span className="boot-titlebar-label">
            <span className="boot-titlebar-glyph">▣</span>
            MCDUFF SYSTEMS — BIOS 4.72
          </span>
          <span className="boot-titlebar-status">{phase === "splash" ? "POWER ON" : postDone ? "READY" : `POST ${progress}`}</span>
        </div>

        <div className="boot-crt" onClick={handleSkip}>
          <div className="boot-crt-scan" aria-hidden />
          {phase === "splash" ? (
            <div className="boot-splash">
              <div>
                <div className="boot-wordmark boot-fade">
                  MCDUFF&nbsp;<span>SYSTEMS</span>
                </div>
                <div className="boot-tagline boot-fade" style={{ animationDelay: "0.14s" }}>
                  PERSONAL COMPUTING DIVISION
                </div>
                <div className="boot-rail" aria-hidden>
                  <div className="boot-rail-fill boot-bar" />
                </div>
                <div className="mt-3 mono-xs tracking-[0.22em] text-faint boot-fade" style={{ animationDelay: "0.28s" }}>
                  BIOS 4.72 · UNREGISTERED COPY
                </div>
              </div>
            </div>
          ) : (
            <div className="boot-crt-inner text-[13px] leading-[1.7] tracking-[0.01em] boot-phosphor">
              {BOOT_LINES.slice(0, shown).map((l, i) => (
                <div key={`b-${i}`} className={`boot-line ${l.cls ?? "text-txt"}`}>
                  {renderLine(l.text) || "\u00A0"}
                </div>
              ))}
              {!postDone && current && (
                <div className={`boot-line ${current.cls ?? "text-txt"}`}>
                  {current.text === "@MEMTEST"
                    ? renderLine("@MEMTEST")
                    : current.text === ""
                      ? "\u00A0"
                      : current.text.slice(0, chars)}
                  {current.text !== "" && <span className="boot-cursor" aria-hidden />}
                </div>
              )}
              {postDone && <span className="boot-cursor" aria-hidden />}
            </div>
          )}
        </div>

        <div className="boot-status">
          <span className="boot-status-left">
            <span className="boot-status-dot" aria-hidden />
            <span className="truncate">
              {phase === "splash" ? "INITIALIZING HARDWARE…" : postDone ? "POST COMPLETE — AWAITING CONFIRMATION" : "RUNNING POWER-ON SELF TEST…"}
            </span>
          </span>
          <span className={`boot-status-right ${postDone ? "boot-prompt" : "tracking-[0.14em] text-faint"}`}>
            {postDone ? "▸ PRESS ENTER TO CONTINUE" : phase === "splash" ? "· · ·" : "PLEASE WAIT"}
          </span>
        </div>
      </div>
    </div>
  );
}
