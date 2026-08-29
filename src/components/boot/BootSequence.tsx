"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/audio/engine";
import { useOS } from "@/game/state/osStore";
import { Aperture, usePhaseExit } from "@/components/Aperture";

/* ============================================================
   POST — the workstation testing itself.

   A two-column diagnostic console: the check register on the
   left, live hardware telemetry on the right. Checks resolve one
   at a time with a result, not a typewriter crawl — the machine
   is working, not talking. The memory map and bus trace fill the
   tube so the screen never looks like text in a void.
   ============================================================ */

type Check = {
  label: string;
  value: string;
  detail?: string;
  tone?: "amber" | "accent";
  /** Longer dwell — this one is actually doing something. */
  work?: number;
};

const CHECKS: Check[] = [
  { label: "PROCESSOR", value: "R4400 / 200MHz", detail: "1 CPU", work: 220 },
  { label: "MEMORY", value: "65536K", detail: "PARITY OK", work: 1500 },
  { label: "STORAGE", value: "1 VOLUME", detail: "1 DAMAGED SECTOR", tone: "amber", work: 420 },
  { label: "SYSTEM CLOCK", value: "OK", detail: "DRIFT CORRECTED", work: 300 },
  { label: "SECURITY", value: "OK", detail: "SEALED DIRECTIVE STORE PRESENT", work: 360 },
  { label: "NETWORK", value: "DISABLED", detail: "PHYSICAL — NO INTERFACE", tone: "amber", work: 260 },
  { label: "USER PROFILE", value: "DANIEL MCDUFF", detail: "LAST LOGIN 2026-03-07", work: 340 },
  { label: "ARIA SERVICE", value: "RESUMED", detail: "ASSIST MODE — WAKE ON EVENT", tone: "accent", work: 520 },
];

const MEM_TOTAL = 65536;
const MEM_CELLS = 96;
const SPLASH_MS = 1250;

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"splash" | "post">("splash");
  const [passed, setPassed] = useState(0); // checks resolved
  const [memK, setMemK] = useState(0);
  const [trace, setTrace] = useState<number[]>(() => Array.from({ length: 28 }, () => 0.2));
  const [done, setDone] = useState(false);
  const skipped = useRef(false);
  const os = useOS();
  const [leaving, leave] = usePhaseExit(onDone);

  const reduced = os.settings.reducedMotion;
  const sound = os.settings.sound;

  /* ---------- splash ---------- */
  useEffect(() => {
    if (phase !== "splash") return;
    if (sound) {
      sfx.ensure();
      sfx.bootSwell();
    }
    const t = setTimeout(() => setPhase("post"), reduced ? 380 : SPLASH_MS);
    return () => clearTimeout(t);
  }, [phase, sound, reduced]);

  /* ---------- check register — one resolves at a time ---------- */
  useEffect(() => {
    if (phase !== "post" || done) return;
    if (passed >= CHECKS.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- register complete
      setDone(true);
      if (sound) sfx.bootBeep();
      return;
    }
    const c = CHECKS[passed];
    const dwell = reduced ? 40 : c.work ?? 240;
    const t = setTimeout(() => {
      setPassed((p) => p + 1);
      if (sound) sfx.bootKeyEnter();
    }, dwell);
    return () => clearTimeout(t);
  }, [phase, passed, done, reduced, sound]);

  /* ---------- memory walk — drives both the counter and the map ---------- */
  const memIndex = CHECKS.findIndex((c) => c.label === "MEMORY");
  const memRunning = phase === "post" && !done && passed === memIndex;
  useEffect(() => {
    if (!memRunning || reduced) return;
    const id = setInterval(() => {
      setMemK((k) => Math.min(MEM_TOTAL, k + 1800 + Math.floor(Math.random() * 1400)));
    }, 34);
    return () => clearInterval(id);
  }, [memRunning, reduced]);

  // once the check resolves the map is full, whatever the interval got to
  const memShown = passed > memIndex ? MEM_TOTAL : memK;

  /* ---------- bus trace — a small live waveform ---------- */
  useEffect(() => {
    if (phase !== "post" || reduced) return;
    const id = setInterval(() => {
      setTrace((t) => [...t.slice(1), 0.15 + Math.random() * (done ? 0.35 : 0.85)]);
    }, 90);
    return () => clearInterval(id);
  }, [phase, reduced, done]);

  function handleSkip() {
    if (phase === "splash") {
      setPhase("post");
      return;
    }
    if (!done) {
      skipped.current = true;
      setMemK(MEM_TOTAL);
      setPassed(CHECKS.length);
      return;
    }
    if (sound) sfx.menuClick();
    leave();
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
  }, [done, phase]);

  const litCells = Math.round((memShown / MEM_TOTAL) * MEM_CELLS);
  const cells = useMemo(() => Array.from({ length: MEM_CELLS }, (_, i) => i), []);
  const running = phase === "post" && !done ? CHECKS[passed] : null;

  return (
    <div className="boot-shell" onClick={handleSkip} role="status" aria-label="power-on self test">
      {leaving && <Aperture dir="out" />}
      <div className="boot-frame">
        <div className="boot-titlebar">
          <span className="boot-titlebar-label">
            <span className="boot-titlebar-glyph" aria-hidden>▣</span>
            MCDUFF SYSTEMS — BIOS 4.72
          </span>
          <span className="boot-titlebar-status">
            {phase === "splash" ? "POWER ON" : done ? "READY" : `POST ${passed}/${CHECKS.length}`}
          </span>
        </div>

        <div className="boot-crt">
          <div className="boot-crt-scan" aria-hidden />

          {phase === "splash" ? (
            <div className="boot-splash">
              <div className="boot-splash-main">
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
                </div>
              </div>
              <div className="boot-plate">
                <div className="boot-plate-cell">
                  <div className="boot-plate-k">FIRMWARE</div>
                  <div className="boot-plate-v">BIOS 4.72 · UNREGISTERED</div>
                </div>
                <div className="boot-plate-cell">
                  <div className="boot-plate-k">LICENSED TO</div>
                  <div className="boot-plate-v">D. MCDUFF</div>
                </div>
                <div className="boot-plate-cell">
                  <div className="boot-plate-k">CHASSIS</div>
                  <div className="boot-plate-v">MS-4200 · DESKSIDE</div>
                </div>
                <div className="boot-plate-cell">
                  <div className="boot-plate-k">NETWORK</div>
                  <div className="boot-plate-v">AIR-GAPPED</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="post-grid">
              <div className="post-main">
                <div className="post-head">
                  <span className="post-head-name">
                    MCDUFF <b>PERSONAL COMPUTING SYSTEM</b>
                  </span>
                  <span className="post-head-meta">POWER-ON SELF TEST · BIOS 4.72</span>
                </div>

                <div className="post-check">
                  {CHECKS.slice(0, passed).map((c) => (
                    <div key={c.label} className={`post-check-row ${reduced ? "" : "post-in"}`}>
                      <span className="post-check-label">{c.label}</span>
                      <span className="post-check-lead" aria-hidden />
                      <span
                        className={`post-check-val ${c.tone === "amber" ? "is-amber" : c.tone === "accent" ? "is-accent" : ""}`}
                      >
                        {c.label === "MEMORY" ? `${MEM_TOTAL}K` : c.value}
                        {c.detail && <small>{c.detail}</small>}
                      </span>
                    </div>
                  ))}
                  {running && (
                    <div className="post-check-row">
                      <span className="post-check-label">{running.label}</span>
                      <span className="post-check-lead" aria-hidden />
                      <span className="post-check-val">
                        {running.label === "MEMORY" ? `${memShown}K` : "TESTING"}
                        <span className="boot-cursor" aria-hidden />
                      </span>
                    </div>
                  )}
                </div>

                <div className="post-tail">
                  {done && (
                    <div className={`post-tail-line ${reduced ? "" : "post-in"}`}>
                      LOADING PERSONAL PROFILE…
                      <span className="boot-cursor" aria-hidden />
                    </div>
                  )}
                </div>
              </div>

              <div className="post-rail" aria-hidden>
                <div className="post-rail-head">HARDWARE</div>

                <div>
                  <div className="post-stat-k">MEMORY MAP</div>
                  <div className="post-stat-v">
                    {memShown.toLocaleString()}K / {MEM_TOTAL.toLocaleString()}K
                  </div>
                  <div className="post-map">
                    {cells.map((i) => (
                      <span
                        key={i}
                        className={`post-map-cell ${i < litCells ? (i === litCells - 1 && memShown < MEM_TOTAL ? "is-hot" : "is-on") : ""}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="post-stat-k">BUS ACTIVITY</div>
                  <div className="post-trace">
                    <div className="post-trace-bars">
                      {trace.map((v, i) => (
                        <span key={i} className="post-trace-bar" style={{ height: `${v * 100}%` }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="post-stat-k">NETWORK</div>
                  <div className="post-stat-v is-amber">NO INTERFACE</div>
                </div>

                <div>
                  <div className="post-stat-k">ASSISTANT</div>
                  <div className={`post-stat-v ${done ? "is-accent" : ""}`}>
                    {done ? "ARIA — RESUMED" : "PENDING"}
                  </div>
                </div>

                <div className="post-rail-foot">
                  CHASSIS MS-4200
                  <br />
                  BIOS 4.72 · UNREGISTERED
                  <br />
                  AIR-GAPPED SINCE 2026-01-04
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="boot-status">
          <span className="boot-status-left">
            <span className="boot-status-dot" aria-hidden />
            <span className="truncate">
              {phase === "splash"
                ? "INITIALIZING HARDWARE…"
                : done
                  ? "ALL CHECKS PASSED — SYSTEM READY"
                  : `TESTING ${running?.label ?? ""}…`}
            </span>
          </span>
          <span className={`boot-status-right ${done ? "boot-prompt" : "tracking-[0.14em] text-faint"}`}>
            {done ? "▸ PRESS ENTER TO CONTINUE" : phase === "splash" ? "· · ·" : "PLEASE WAIT"}
          </span>
        </div>
      </div>
    </div>
  );
}
