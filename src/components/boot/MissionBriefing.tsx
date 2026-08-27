"use client";

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/audio/engine";
import { useOS } from "@/game/state/osStore";

/* ============================================================
   MISSION BRIEFING — same 90s terminal chrome as POST.
   Character typing, silent, same cadence and panel language.
   ============================================================ */

const LINES: { text: string; cls: string }[] = [
  { text: "AUTHORIZED INVESTIGATION PROTOCOL — CASE 001", cls: "text-accent" },
  { text: "", cls: "" },
  { text: "SUBJECT:", cls: "text-dim" },
  { text: "DR. DANIEL MCDUFF", cls: "text-txt" },
  { text: "", cls: "" },
  { text: "POSITION:", cls: "text-dim" },
  { text: "PROFESSOR OF PHYSICS AND ASTRONOMY — UNIVERSITY OF PENNSYLVANIA", cls: "text-txt" },
  { text: "PREVIOUS EMPLOYMENT: CERN", cls: "text-txt" },
  { text: "", cls: "" },
  { text: "STATUS:", cls: "text-dim" },
  { text: "DECEASED  —  official: accidental fall", cls: "text-alert" },
  { text: "         —  unofficial: read the timestamps", cls: "text-amber" },
  { text: "", cls: "" },
  { text: "LAST RECORD:", cls: "text-dim" },
  { text: "2026-03-10  02:13:07  LOGIN  S.OKAFOR  —  gait mismatch", cls: "text-amber" },
  { text: "02:13:07  —  same minute his clock stopped. Twice.", cls: "text-faint" },
  { text: "", cls: "" },
  { text: "OBJECTIVE:", cls: "text-dim" },
  { text: "Determine what happened to Dr. McDuff.", cls: "text-txt" },
  { text: "Recover his scattered research (project: ORPHEUS).", cls: "text-txt" },
  { text: "Preserve evidence.", cls: "text-txt" },
  { text: "", cls: "" },
  { text: "YOUR PARTNER:", cls: "text-dim" },
  { text: "An onboard AI (ARIA) remains active.", cls: "text-txt" },
  { text: "She can SEARCH the machine in seconds; she cannot SEE it.", cls: "text-txt" },
  { text: "You are the eyes. She is the hands. Move together.", cls: "text-accent" },
  { text: "", cls: "" },
  { text: "A FIELD GUIDE will open on your desktop.", cls: "text-dim" },
  { text: "Read it. Then follow what intrigues you.", cls: "text-amber" },
];

const TYPE_MS = 11;
const LINE_PAUSE = 140;
const BLANK_PAUSE = 90;

export default function MissionBriefing({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [chars, setChars] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const os = useOS();

  useEffect(() => {
    if (os.settings.sound) sfx.ensure();
  }, [os.settings.sound]);

  // Cherry KC 1000 — same humanized key pack as POST
  useEffect(() => {
    if (done) return;
    if (shown >= LINES.length) {
      setDone(true);
      return;
    }
    const line = LINES[shown];
    const reduced = os.settings.reducedMotion;

    if (reduced || line.text === "") {
      const d = line.text === "" ? BLANK_PAUSE : LINE_PAUSE;
      const t = setTimeout(() => setShown((s) => s + 1), d);
      timer.current = t;
      return () => clearTimeout(t);
    }

    if (chars < line.text.length) {
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

    if (os.settings.sound && line.text.trim().length > 0) sfx.bootKeyEnter();
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      setChars(0);
    }, LINE_PAUSE);
    timer.current = t;
    return () => clearTimeout(t);
  }, [shown, chars, done, os.settings.reducedMotion, os.settings.sound]);

  function finish() {
    if (!done) {
      setShown(LINES.length);
      setChars(0);
      setDone(true);
      return;
    }
    os.addFlag("INTRO_COMPLETE");
    onDone();
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, done]);

  const current = LINES[shown];
  const progress = `${Math.min(shown + (done ? 0 : 1), LINES.length)}/${LINES.length}`;

  return (
    <div className="boot-shell" onClick={finish} role="status" aria-label="mission briefing">
      <div className="boot-frame" onClick={(e) => e.stopPropagation()}>
        <div className="boot-titlebar">
          <span className="boot-titlebar-label">
            <span className="boot-titlebar-glyph">▣</span>
            INVESTIGATION PROTOCOL — AUTHORIZED
          </span>
          <span className="boot-titlebar-status">{done ? "READY" : `BRIEFING ${progress}`}</span>
        </div>

        <div className="boot-crt" onClick={finish}>
          <div className="boot-crt-scan" aria-hidden />
          <div className="boot-crt-inner text-[13px] leading-[1.7] boot-phosphor">
            {LINES.slice(0, shown).map((l, i) => (
              <div key={`m-${i}`} className={`boot-line ${l.cls} ${l.cls === "text-txt" ? "font-medium" : ""}`}>
                {l.text || "\u00A0"}
              </div>
            ))}
            {!done && current && (
              <div className={`boot-line ${current.cls} ${current.cls === "text-txt" ? "font-medium" : ""}`}>
                {current.text === "" ? "\u00A0" : current.text.slice(0, chars)}
                {current.text !== "" && <span className="boot-cursor" aria-hidden />}
              </div>
            )}
            {done && (
              <div className="mt-8 space-y-3">
                <div className="h-px bg-linebright opacity-30 w-[360px] max-w-[72%]" />
                <div className="mono-xs tracking-[0.16em] text-dim">EVIDENCE PRESERVATION MODE ENGAGED · SESSION WILL BE ARCHIVED</div>
                <div className="mono-xs tracking-[0.12em] text-faint opacity-70">read as long as you need — nothing advances on its own</div>
              </div>
            )}
          </div>
        </div>

        <div className="boot-status">
          <span className="boot-status-left">
            <span className="boot-status-dot" aria-hidden />
            <span className="truncate">{done ? "BRIEFING COMPLETE — AWAITING CONFIRMATION" : "RECEIVING AUTHORIZATION PACKET…"}</span>
          </span>
          <span className={`boot-status-right ${done ? "boot-prompt" : "tracking-[0.14em] text-faint"}`}>
            {done ? "▸ PRESS ENTER TO CONTINUE" : "PLEASE WAIT"}
          </span>
        </div>
      </div>
    </div>
  );
}
