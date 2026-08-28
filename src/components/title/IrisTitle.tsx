"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/audio/engine";
import { useOS } from "@/game/state/osStore";
import { getSave, wipeSave } from "@/game/state/persistence";

/* ============================================================
   THE IRIS — wake sequence.

   A sealed optical instrument powers on: the housing warms
   up, blades assemble over the closed aperture, then the
   iris opens in one smooth mechanical sweep and the photonic
   core ignites. Calibration pulses, then the operation
   callouts fan around the rim and the optic watches
   whichever one you aim at.
   ============================================================ */

type MenuKey = "new" | "continue" | "archives" | "settings" | "credits";

// operation callouts — order top → bottom around the rim
const MENU: { key: MenuKey; label: string }[] = [
  { key: "new",      label: "NEW INVESTIGATION" },
  { key: "continue", label: "CONTINUE" },
  { key: "archives", label: "ARCHIVES" },
  { key: "settings", label: "SETTINGS" },
  { key: "credits",  label: "CREDITS" },
];

// callouts arced around the iris rim (screen coords: 0° = 3 o'clock, +down)
const ARC_STEP = 21;    // degrees between callouts
const ARC_RADIUS = 380; // viewBox units from iris center (outer bezel is 336)

const MENU_ARC = MENU.map((m, i) => {
  const mid = (MENU.length - 1) / 2;
  return { ...m, angle: (i - mid) * ARC_STEP };
});

// viewBox unit → screen offset (iris renders at min(64vmin, 560px) for a 700-unit viewBox)
function arcOffset(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const ox = Math.round(Math.cos(rad) * ARC_RADIUS * 0.8);
  const oy = Math.round(Math.sin(rad) * ARC_RADIUS * 0.8);
  const mag = ((ARC_RADIUS * 64) / 700).toFixed(1); // vmin magnitude of the same radius
  const at = (base: string, n: number) =>
    `calc(${base} ${n >= 0 ? "+" : "-"} min(${Math.abs(n)}px, ${mag}vmin))`;
  return { x: at("50%", ox), y: at("46%", oy) };
}

// gaze direction toward a highlighted callout (normalized -1..1, eye coords)
function gazeForRow(index: number) {
  const a = ((MENU_ARC[index]?.angle ?? 0) * Math.PI) / 180;
  return { x: Math.cos(a) * 0.55, y: Math.sin(a) * 0.55 };
}

// 90s checkbox row used inside the settings group boxes
function CheckRow({ label, sub, on, onToggle }: { label: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} className="iris-check-row" onClick={onToggle}>
      <span className={`iris-check ${on ? "is-on" : ""}`} aria-hidden>{on ? "✓" : ""}</span>
      <span className="iris-check-label">
        {label}
        <span className="iris-check-sub">{sub}</span>
      </span>
    </button>
  );
}

export default function IrisTitle({ onLaunch }: { onLaunch: (mode: "new" | "continue") => void }) {
  // 0 dark → 1 housing silhouette → 2 blades assemble + tick sweep → 3 iris OPENS → 4 core ignite → 5 calibrate → 6 menu/idle
  const [stage, setStage] = useState(0);
  const [keyNav, setKeyNav] = useState(false); // arrows active → hide the pointer
  const [sel, setSel] = useState<MenuKey>("new");
  const [hasSave, setHasSave] = useState(false);
  const [panel, setPanel] = useState<"settings" | "archives" | "credits" | null>(null);
  const [closing, setClosing] = useState(false);
  const [aperture, setAperture] = useState(0.06); // 1=open, 0.06=closed start, 0.58=calibration contract
  const [litTicks, setLitTicks] = useState(0);
  const [tickPulse, setTickPulse] = useState<number | null>(null);
  const [exitFlash, setExitFlash] = useState(false); // final flare before the cut to boot

  const os = useOS();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mouseRaf = useRef<number>(0);
  const apertureRaf = useRef<number>(0);
  const apertureRef = useRef(0.06);
  const pointerRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const renderedMouseRef = useRef({ x: 0, y: 0 });
  const lastInputRef = useRef<"mouse" | "key">("key");
  const hoverRef = useRef(false);
  const irisRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<SVGGElement>(null);
  const flareRef = useRef<SVGGElement>(null);
  const pupilRef = useRef<SVGGElement>(null);

  const setApertureValue = (value: number) => {
    apertureRef.current = value;
    setAperture(value);
  };

  // subtle overshoot-and-settle — the sound of a mechanical detent snapping home
  const easeMechanical = (p: number) => {
    const c1 = 0.9;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  };

  const animateAperture = (target: number, duration: number, easing: "out" | "mech" = "out") => {
    cancelAnimationFrame(apertureRaf.current);
    const start = apertureRef.current;
    const startedAt = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easing === "mech"
        ? easeMechanical(progress)
        : 1 - Math.pow(1 - progress, 3);
      setApertureValue(start + (target - start) * eased);
      if (progress < 1) apertureRaf.current = requestAnimationFrame(frame);
    };
    apertureRaf.current = requestAnimationFrame(frame);
  };

  /* ---------- save probe ---------- */
  useEffect(() => {
    const s = getSave();
    setHasSave(Boolean(s.hasProgress && !s.caseCompleteAt));
  }, []);

  /* ---------- cinematic boot — CLOSED → mechanical open → core ignite → calibrate ---------- */
  useEffect(() => {
    const t = timers.current;
    const schedule = (callback: () => void, delay: number) => t.push(setTimeout(callback, delay));
    // 0.5s: hiss + hum swell — housing silhouette fades in (iris sealed shut)
    schedule(() => { setStage(1); if (os.settings.sound) { sfx.ensure(); sfx.bootSwell(); } }, 480);
    // 1.55s: blades assemble over the sealed aperture + calibration ticks sweep
    schedule(() => setStage(2), 1550);
    // 2.7s: the iris OPENS — one smooth mechanical sweep
    schedule(() => {
      setStage(3);
      if (os.settings.sound) sfx.irisWhir("open");
      animateAperture(1, 1250, "mech");
    }, 2650);
    // 4.35s: photonic core ignites — the green heart wakes
    schedule(() => {
      setStage(4);
      if (os.settings.sound) sfx.servoUp();
    }, 4350);
    // 5.6s: calibration pulses
    schedule(() => {
      setStage(5);
      animateAperture(0.58, 480);
      if (os.settings.sound) sfx.servoDown();
      schedule(() => animateAperture(0.86, 620), 500);
      schedule(() => animateAperture(0.58, 620), 1180);
      if (os.settings.sound) schedule(() => sfx.servoUp(), 900);
      schedule(() => animateAperture(1, 820), 1860);
    }, 5600);
    // 8.4s: settle → menu + idle
    schedule(() => setStage(6), 8400);

    return () => {
      t.forEach(clearTimeout);
      cancelAnimationFrame(apertureRaf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drive litTicks count during tick-sweep stage
  useEffect(() => {
    if (stage !== 2) return;
    let n = 0;
    const id = setInterval(() => {
      n += 4;
      setLitTicks(n);
      if (n % 16 === 0 && os.settings.sound) sfx.irisTick();
      if (n >= 96) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [stage, os.settings.sound]);

  // idle micro-ticks — random single blade pulse + soft sound
  useEffect(() => {
    if (stage < 6 || closing || os.settings.reducedMotion) return;
    const loop = () => {
      const id = setTimeout(() => {
        if (!hoverRef.current) setTickPulse(Math.floor(Math.random() * 14));
        setTimeout(() => setTickPulse(null), 420);
        if (Math.random() < 0.45 && os.settings.sound) sfx.irisTick();
        loop();
      }, 3800 + Math.random() * 3600);
      timers.current.push(id);
    };
    loop();
    return () => {};
  }, [stage, closing, os.settings.reducedMotion, os.settings.sound]);

  // Keep the optic centered through boot, then ease it toward the current pointer.
  useEffect(() => {
    const applyMotion = (position: { x: number; y: number }) => {
      const tiltX = position.x * 18;
      const tiltY = position.y * 12;
      const pupilX = position.x * 28;
      const pupilY = position.y * 20;
      irisRef.current?.style.setProperty("transform", `translate(-50%, -50%) translate(${tiltX}px, ${tiltY}px)`);
      glowRef.current?.setAttribute("transform", `translate(${position.x * 10} ${position.y * 7})`);
      flareRef.current?.setAttribute("transform", `translate(${position.x * 5} ${position.y * 3.5})`);
      pupilRef.current?.setAttribute("transform", `translate(${pupilX} ${pupilY})`);
    };

    if (stage < 6 || closing) {
      mouseTargetRef.current = { x: 0, y: 0 };
      renderedMouseRef.current = { x: 0, y: 0 };
      applyMotion(renderedMouseRef.current);
      return;
    }

    const pointer = pointerRef.current;
    mouseTargetRef.current = {
      x: ((pointer.x / window.innerWidth) * 2 - 1) * 0.55,
      y: ((pointer.y / window.innerHeight) * 2 - 1) * 0.55,
    };

    let previousFrame = performance.now();
    const tick = (now: number) => {
      const current = renderedMouseRef.current;
      const target = mouseTargetRef.current;
      const factor = os.settings.reducedMotion ? 1 : 1 - Math.exp(-(now - previousFrame) / 78);
      previousFrame = now;
      const next = {
        x: current.x + (target.x - current.x) * factor,
        y: current.y + (target.y - current.y) * factor,
      };
      renderedMouseRef.current = next;
      applyMotion(next);
      mouseRaf.current = requestAnimationFrame(tick);
    };
    mouseRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(mouseRaf.current);
  }, [stage, closing, os.settings.reducedMotion]);

  /* ---------- gaze follows keyboard/highlight selection ---------- */
  // The menu lives to the right of the iris; when the highlight moves (arrows,
  // hover, focus), the optic eases toward it — same channel as cursor tracking.
  useEffect(() => {
    if (stage < 6 || closing) return;
    if (lastInputRef.current !== "key") return;
    const i = MENU.findIndex((m) => m.key === sel);
    if (i >= 0) mouseTargetRef.current = gazeForRow(i);
  }, [sel, stage, closing]);

  /* ---------- skip ---------- */
  const skip = useCallback(() => {
    if (stage < 6) {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(apertureRaf.current);
      setStage(6);
      setLitTicks(96);
      setApertureValue(1);
      if (os.settings.sound) sfx.ensure();
    }
  }, [stage, os.settings.sound]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel) { if (e.key === "Escape") closePanel(); return; }
      if (e.key === "Escape" && stage < 6) { skip(); return; }
      // any key before menu → skip boot
      if (stage < 6 && e.key.length === 1) { skip(); return; }
      if (stage >= 6) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") stepSel(1);
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") stepSel(-1);
        if (e.key === "Enter") void activate(sel);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, sel, panel]);

  function stepSel(d: number) {
    const i = MENU.findIndex((m) => m.key === sel);
    const next = MENU[(i + d + MENU.length) % MENU.length];
    lastInputRef.current = "key"; // arrows reclaim the optic's gaze from the mouse
    setSel(next.key);
    setKeyNav(true); // keyboard drive → hide the pointer until it moves again
    if (os.settings.sound) sfx.menuSelect();
  }

  function choose(key: MenuKey) {
    if (sel !== key) {
      setSel(key);
      if (os.settings.sound) sfx.menuSelect();
    }
  }

  async function activate(key: MenuKey) {
    if (os.settings.sound) sfx.menuClick(); // same confirm sound for mouse click and Enter
    if (key === "settings") return setPanel("settings");
    if (key === "credits") return setPanel("credits");
    if (key === "archives") return setPanel("archives");
    if (key === "continue") {
      if (!hasSave) { sfx.error(); return; }
      beginTransition("continue");
      return;
    }
    await wipeSave();
    beginTransition("new");
  }

  function closePanel() {
    setPanel(null);
    if (os.settings.sound) sfx.menuClick(); // dismiss shares the confirm sound
  }

  /* ---------- exit sequence — clean single close → flash → cut ----------
     Two-stage only: subtle tension then one decisive mechanical shut.
     No jitter, no back-and-forth — reads as a deliberate shutter. */
  function beginTransition(mode: "new" | "continue") {
    setClosing(true);
    const sound = os.settings.sound;
    mouseTargetRef.current = { x: 0, y: 0 };
    if (sound) sfx.irisWhir("close");
    // 0–0.34s: settle — the iris draws in just enough to show intent
    animateAperture(0.78, 340, "out");
    // 0.36–1.34s: commit — one smooth mechanical close to a pinhole
    timers.current.push(setTimeout(() => {
      if (sound) sfx.servoDown();
      animateAperture(0.028, 980, "mech");
    }, 360));
    // 1.38s: the flash — cold bloom from the core, then hard cut
    timers.current.push(setTimeout(() => {
      setExitFlash(true);
      if (sound) sfx.deepThud();
    }, 1380));
    timers.current.push(setTimeout(() => onLaunch(mode), 1760));
  }

  /* ---------- mouse tracking (normalized -1..1) ---------- */
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    pointerRef.current = { x: e.clientX, y: e.clientY };
    setKeyNav(false); // the pointer is back — show it, hand the gaze over
    if (stage < 6 || closing) return;
    lastInputRef.current = "mouse";
    mouseTargetRef.current = {
      x: ((e.clientX / window.innerWidth) * 2 - 1) * 0.55,
      y: ((e.clientY / window.innerHeight) * 2 - 1) * 0.55,
    };
  }, [stage, closing]);

  const menuVisible = stage >= 6 && !closing;
  const housingOpacity = stage >= 2 ? 1 : stage >= 1 ? 0.4 : 0;
  const coreOpacity = stage >= 4 ? 1 : 0;

  // aperture open radius — the exit timeline drives it down to a blinding pinhole
  const apertureR = Math.max(2.4, aperture * 86);

  // archives — read once per open (storage read is synchronous)
  const caseDone = panel === "archives" ? getSave().caseCompleteAt : null;

  // eye-tracking — orb physically looks at cursor (global, unmistakable)
  const blades = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

  return (
    <div
      className={`iris-root ${closing ? "is-closing" : ""} ${keyNav && !closing ? "iris-keynav" : ""}`}
      onMouseDown={skip}
      onMouseMove={onMouseMove}
      role="application"
      aria-label="ORPHEUS system interface"
    >
      {/* ---------- exit flash — the last thing the title screen shows ---------- */}
      <div className={`iris-exitflash ${exitFlash ? "is-on" : ""}`} aria-hidden />

      {/* ---------- background planes ---------- */}
      <div className="iris-bg-grid" aria-hidden />
      <div className="iris-bg-noise" aria-hidden />
      <div className="iris-glowfloor-v2" style={{ opacity: stage >= 2 ? 1 : 0 }} aria-hidden />
      {/* scan drift over full screen */}
      <div className="iris-screen-scan" aria-hidden />

      {/* ---------- IRIS STAGE ---------- */}
      <div
        className="iris-stage-v2"
        style={{
          opacity: stage >= 1 ? 1 : 0,
          transition: "opacity 1.2s ease",
        }}
      >
        {/* housing shadow — soft */}
        <div className="iris-shadow" aria-hidden />

        <svg
          id="iris-svg"
          ref={irisRef}
          viewBox="0 0 700 700"
          className="iris-svg"
          style={{
            width: "min(64vmin, 560px)",
            height: "min(64vmin, 560px)",
            transform: "translate(-50%, -50%)",
            willChange: stage < 6 ? "transform" : "auto",
            top: "46%",
            left: "50%",
            position: "absolute",
          }}
        >
          <defs>
            {/* housing metal */}
            <radialGradient id="housingMetal" cx="42%" cy="36%" r="92%">
              <stop offset="0%" stopColor="#2a312d" />
              <stop offset="38%" stopColor="#1d2420" />
              <stop offset="68%" stopColor="#0f1311" />
              <stop offset="100%" stopColor="#060806" />
            </radialGradient>
            <linearGradient id="bladeMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#232b26" />
              <stop offset="28%" stopColor="#1b2220" />
              <stop offset="62%" stopColor="#121815" />
              <stop offset="100%" stopColor="#0a0e0c" />
            </linearGradient>
            <linearGradient id="bladeEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2f3a34" stopOpacity="0" />
              <stop offset="22%" stopColor="#3d4a43" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#9bb6a2" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2f3a34" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="coreDark" cx="40%" cy="34%" r="88%">
              <stop offset="0%" stopColor="#26332b" />
              <stop offset="42%" stopColor="#131b16" />
              <stop offset="72%" stopColor="#070a08" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="52%">
              <stop offset="0%" stopColor="#d7ffe0" stopOpacity="0.95" />
              <stop offset="12%" stopColor="#9ff0b1" stopOpacity="0.55" />
              <stop offset="28%" stopColor="#5ea86e" stopOpacity="0.32" />
              <stop offset="52%" stopColor="#2d5a37" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0a120c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lensAR" cx="30%" cy="28%" r="88%">
              <stop offset="0%" stopColor="#7ff0b2" stopOpacity="0.2" />
              <stop offset="42%" stopColor="#6a9bff" stopOpacity="0.11" />
              <stop offset="78%" stopColor="#ff7ad6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.55" />
            </filter>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            {/* aperture clip — variable radius */}
            <clipPath id="apertureClip">
              <circle cx="350" cy="350" r={apertureR} />
            </clipPath>
            {/* subtle glass highlight */}
            <linearGradient id="glassSweep" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="42%" stopColor="#fff" stopOpacity="0.07" />
              <stop offset="48%" stopColor="#fff" stopOpacity="0.11" />
              <stop offset="54%" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ===== housing — outer bezel ===== */}
          <g opacity={housingOpacity} style={{ transition: "opacity 1.6s ease" }}>
            <circle cx="350" cy="350" r="336" fill="url(#housingMetal)" stroke="#1e2722" strokeWidth="2" />
            {/* outer edge chamfer */}
            <circle cx="350" cy="350" r="336" fill="none" stroke="#2f3a35" strokeWidth="1" opacity="0.55" />
            <circle cx="350" cy="350" r="328" fill="none" stroke="#0b0f0e" strokeWidth="6" />
            {/* screw heads — 8 around bezel */}
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const sx = 350 + Math.cos(a) * 316;
              const sy = 350 + Math.sin(a) * 316;
              return (
                <g key={i} opacity={stage >= 2 ? 0.85 : 0}>
                  <circle cx={sx} cy={sy} r="6.5" fill="#1a201d" stroke="#2d3631" strokeWidth="1" />
                  <line x1={sx - 3.5} y1={sy} x2={sx + 3.5} y2={sy} stroke="#2a332e" strokeWidth="1.2" transform={`rotate(${i * 23} ${sx} ${sy})`} />
                </g>
              );
            })}
            {/* wear — micro scratches */}
            <g opacity="0.09" stroke="#9ab0a2" strokeWidth="0.7" fill="none">
              <path d="M140 188 Q220 202 280 188" />
              <path d="M420 498 Q480 508 540 486" />
              <path d="M118 405 Q168 398 210 412" />
            </g>
          </g>

          {/* ===== calibration tick ring — 96 ticks, lit sequentially ===== */}
          <g
            style={{ transformOrigin: "350px 350px", opacity: stage >= 2 ? 1 : 0, transition: "opacity 1s ease" }}
            className={stage >= 6 && !os.settings.reducedMotion ? "iris-ticks-spin" : ""}
          >
            <circle cx="350" cy="350" r="310" fill="none" stroke="#0f1613" strokeWidth="18" />
            {Array.from({ length: 96 }).map((_, i) => {
              const a = (i * 3.75 * Math.PI) / 180;
              const lit = i < litTicks || stage >= 4;
              const major = i % 12 === 0;
              const r1 = 310;
              const r2 = major ? 322 : i % 3 === 0 ? 319 : 316;
              const x1 = 350 + Math.cos(a) * r1;
              const y1 = 350 + Math.sin(a) * r1;
              const x2 = 350 + Math.cos(a) * r2;
              const y2 = 350 + Math.sin(a) * r2;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={lit ? (major ? "#7fbea0" : "#5a8a74") : "#1e2a24"}
                  strokeWidth={major ? 1.6 : 1}
                  opacity={lit ? (major ? 0.95 : 0.62) : 0.22}
                  style={{ transition: "stroke 0.2s, opacity 0.2s" }}
                />
              );
            })}
            {/* traveling highlight sweep */}
            {stage >= 6 && !os.settings.reducedMotion && (
              <circle cx="350" cy="350" r="310" fill="none" stroke="url(#glassSweep)" strokeWidth="18" strokeDasharray="22 74" className="iris-tick-sweep" opacity="0.22" />
            )}
          </g>

          {/* ===== knurled grip ring ===== */}
          <g opacity={housingOpacity * 0.9}>
            <circle cx="350" cy="350" r="286" fill="none" stroke="#121915" strokeWidth="16" />
            <circle
              cx="350" cy="350" r="286" fill="none" stroke="#1e2a22" strokeWidth="16" strokeDasharray="2 5" opacity="0.55"
              className={stage >= 6 && !os.settings.reducedMotion ? "iris-grip-spin" : ""}
              style={{ transformOrigin: "350px 350px" }}
            />
            <circle cx="350" cy="350" r="278" fill="none" stroke="#0a0f0d" strokeWidth="1" opacity="0.6" />
            <circle cx="350" cy="350" r="294" fill="none" stroke="#0a0f0d" strokeWidth="1" opacity="0.6" />
          </g>

          {/* ===== aperture blade assembly ===== */}
          <g
            id="iris-blades"
            clipPath="url(#apertureClip)"
            style={{
              opacity: stage >= 2 ? 1 : 0,
              transition: "opacity 0.9s ease",
              transformOrigin: "350px 350px",
            }}
          >
            {/* contact shadow — soft depth just inside the blade tips (no black disc) */}
            <circle cx="350" cy="350" r={Math.max(10, apertureR - 6)} fill="none" stroke="#000" strokeWidth="5" opacity="0.22" />
            <circle cx="350" cy="350" r={Math.max(10, apertureR - 2)} fill="none" stroke="#000" strokeWidth="3" opacity="0.35" />
          </g>
          {/* blades themselves — NOT clipped, so they paint the full iris face */}
          <g
            id="iris-blades-face"
            style={{
              opacity: stage >= 2 ? 1 : 0,
              transition: "opacity 0.9s ease",
              transformOrigin: "350px 350px",
            }}
          >
            {blades.map((i) => {
              const t = i / blades.length;
              const ang = t * Math.PI * 2 - Math.PI / 2;
              // curved blade: outer arc → curving edge → inner tip → return edge.
              // Hand-tuned to look like a real iris blade (organic curve, not triangle).
              const rOut = 282;
              const rIn = Math.max(18, apertureR + 10);
              const span = 0.42; // angular width
              const tipOff = 0.62; // tip lean
              const oA0 = ang - span;
              const oA1 = ang + 0.18;
              const iA0 = ang + tipOff - 0.06;
              const iA1 = ang + tipOff + 0.06;

              const pOx0x = 350 + Math.cos(oA0) * rOut;
              const pOx0y = 350 + Math.sin(oA0) * rOut;
              const pOx1x = 350 + Math.cos(oA1) * rOut;
              const pOx1y = 350 + Math.sin(oA1) * rOut;
              const pIn0x = 350 + Math.cos(iA0) * rIn;
              const pIn0y = 350 + Math.sin(iA0) * rIn;
              const pIn1x = 350 + Math.cos(iA1) * rIn;
              const pIn1y = 350 + Math.sin(iA1) * rIn;

              // stagger entrance
              const enterDelay = stage >= 2 ? i * 38 : 0;
              const pulsed = tickPulse === i;
              const jitter = ((i * 47) % 5) - 2;

              return (
                <g
                  key={i}
                  style={{
                    opacity: stage >= 2 ? 1 : 0,
                    transition: `opacity 0.45s ease ${enterDelay}ms, transform 0.38s cubic-bezier(.2,.8,.2,1)`,
                    transform: `translate(${jitter * 0.35}px, ${(jitter % 2) * 0.4}px) ${pulsed ? "scale(1.006)" : ""}`,
                  }}
                >
                  <path
                    d={`M ${pOx0x} ${pOx0y} A ${rOut} ${rOut} 0 0 1 ${pOx1x} ${pOx1y} Q ${350 + Math.cos(ang + 0.32) * (rIn + 90)} ${350 + Math.sin(ang + 0.32) * (rIn + 90)} ${pIn0x} ${pIn0y} A ${rIn} ${rIn} 0 0 0 ${pIn1x} ${pIn1y} Q ${350 + Math.cos(ang - 0.42) * (rOut - 62)} ${350 + Math.sin(ang - 0.42) * (rOut - 62)} ${pOx0x} ${pOx0y} Z`}
                    fill="url(#bladeMetal)"
                    stroke={pulsed ? "#3d4e46" : "#243029"}
                    strokeWidth={pulsed ? 1.1 : 1}
                  />
                  {/* specular edge */}
                  <path
                    d={`M ${pOx0x} ${pOx0y} A ${rOut} ${rOut} 0 0 1 ${pOx1x} ${pOx1y}`}
                    fill="none"
                    stroke="url(#bladeEdge)"
                    strokeWidth="1.6"
                    opacity={0.52}
                  />
                  {/* cross-blade shadow line for depth */}
                  <path
                    d={`M ${pIn1x} ${pIn1y} Q ${350 + Math.cos(ang - 0.18) * (rIn + 44)} ${350 + Math.sin(ang - 0.18) * (rIn + 44)} ${pOx0x} ${pOx0y}`}
                    fill="none"
                    stroke="#000"
                    strokeWidth="1"
                    opacity="0.18"
                  />
                </g>
              );
            })}
            {/* inner retention ring — sits over blade tips */}
            <circle cx="350" cy="350" r={Math.max(20, apertureR + 6)} fill="none" stroke="#242e27" strokeWidth="4" opacity="0.9" />
            <circle cx="350" cy="350" r={Math.max(20, apertureR + 6)} fill="none" stroke="#39463e" strokeWidth="1" opacity="0.5" />
          </g>

          {/* ===== inner barrel (recessed, behind aperture) ===== */}
          <circle cx="350" cy="350" r="114" fill="#080a09" opacity={housingOpacity} />
          <circle cx="350" cy="350" r="114" fill="none" stroke="#1a211c" strokeWidth="2" opacity={housingOpacity * 0.7} />

          {/* ===== lens stack — visible through aperture (clipped) ===== */}
          <g clipPath="url(#apertureClip)">
            <circle cx="350" cy="350" r="112" fill="url(#coreDark)" />
            {/* lens elements — subtle concentric coatings */}
            <circle cx="350" cy="350" r="96" fill="none" stroke="#2c4436" strokeWidth="1" opacity="0.4" />
            <circle cx="350" cy="350" r="76" fill="none" stroke="#314c3c" strokeWidth="1" opacity="0.32" />
            <circle cx="350" cy="350" r="58" fill="url(#lensAR)" opacity={coreOpacity * 0.85} />
            {/* glass sweep highlight */}
            <ellipse cx="316" cy="316" rx="62" ry="34" fill="url(#glassSweep)" opacity={coreOpacity * 0.26} transform="rotate(-22 350 350)" />
            {/* radial lens striations */}
            <g opacity={coreOpacity * 0.14} stroke="#7fae8b" strokeWidth="0.6" fill="none">
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 * Math.PI) / 180;
                return <line key={i} x1="350" y1="350" x2={350 + Math.cos(a) * 52} y2={350 + Math.sin(a) * 52} />;
              })}
            </g>
          </g>

          {/* exit reticle — a lock-on ring that contracts onto the core as the iris closes */}
          <g
            style={{
              transformOrigin: "350px 350px",
              transformBox: "view-box",
              transform: closing ? "scale(0.03)" : "scale(1)",
              opacity: closing ? 1 : 0,
              transition: closing
                ? "opacity 0.35s ease 0.45s, transform 1.85s cubic-bezier(0.55, 0, 0.3, 1) 0.45s"
                : "opacity 0.2s ease",
            }}
          >
            <circle cx="350" cy="350" r="298" fill="none" stroke="#c9f5d3" strokeWidth="1.4" opacity="0.55" />
            <circle cx="350" cy="350" r="286" fill="none" stroke="#6fae88" strokeWidth="0.7" opacity="0.35" />
            {[0, 90, 180, 270].map((a) => (
              <line key={a} x1="350" y1="42" x2="350" y2="62" stroke="#c9f5d3" strokeWidth="1.6" opacity="0.6" transform={`rotate(${a} 350 350)`} />
            ))}
          </g>

          {/* ===== photonic core — NOT clipped, floats above aperture ===== */}
          <g
            opacity={coreOpacity}
            style={{ transition: "opacity 1.1s ease" }}
            className={!os.settings.reducedMotion && stage >= 4 ? "iris-core-ignite" : undefined}
          >
            {/* wide ambient halo — the core lights the whole chamber */}
            <g
              ref={glowRef}
              className={os.settings.reducedMotion ? "" : "iris-core-glow"}
              style={{ transition: "transform 0.08s linear" }}
            >
              <circle
                cx="350" cy="350"
                r="138"
                fill="url(#coreGlow)"
                opacity={closing ? 0.9 : 0.38}
                style={{ transition: "opacity 1.3s ease" }}
              />
              <circle
                cx="350" cy="350"
                r={closing ? 138 : 106}
                fill="url(#coreGlow)"
                style={{ transition: "r 0.95s cubic-bezier(0.5, 0, 0.3, 1), filter 0.7s ease", filter: closing ? "blur(1.4px)" : "blur(0.5px)" }}
              />
            </g>
            {/* lens flare streaks — track slightly */}
            <g ref={flareRef} opacity={closing ? 0 : 0.30} style={{ transition: "opacity 0.6s" }}>
              <ellipse cx="350" cy="350" rx="92" ry="2.4" fill="#9ff0b1" opacity="0.20" transform="rotate(-14 350 350)" />
              <ellipse cx="350" cy="350" rx="2.2" ry="58" fill="#9ff0b1" opacity="0.10" />
            </g>
            {/* hot core — swells into one blinding point as the shutter closes */}
            <g ref={pupilRef} style={{ transition: "transform 0.08s linear" }}>
              <circle cx="350" cy="350" r={closing ? 16 : 10} fill={closing ? "#f2fff4" : "#d6ffe2"} style={{ transition: "r 0.95s cubic-bezier(0.5, 0, 0.3, 1), fill 0.4s ease" }} />
              <circle cx="350" cy="350" r={closing ? 7 : 3} fill="#ffffff" style={{ transition: "r 0.95s cubic-bezier(0.5, 0, 0.3, 1)" }} />
            </g>
            {/* chromatic fringe — opposite lag for depth */}
            <circle cx="350" cy="350" r={closing ? 4 : 9} fill="none" stroke="#7ff0b2" strokeWidth="0.9" opacity={closing ? 0 : 0.20} />
            <circle cx="350" cy="350" r={closing ? 3.4 : 8.4} fill="none" stroke="#ff7ad6" strokeWidth="0.7" opacity={closing ? 0 : 0.13} />
          </g>

          {/* ===== CRT scan + vignette over the iris face only ===== */}
          <rect x="100" y="100" width="500" height="500" fill="none" stroke="#000" strokeWidth="0" />
          {/* subtle scanlines clipped to iris disc */}
          <g clipPath="url(#apertureClip)" opacity="0.045">
            {Array.from({ length: 44 }).map((_, i) => (
              <line key={i} x1="238" y1={238 + i * 5.2} x2="462" y2={238 + i * 5.2} stroke="#000" strokeWidth="1" />
            ))}
          </g>
        </svg>

        {/* faint orbit guide — ties menu to mechanism */}
        <div
          className="iris-orbit"
          style={{ opacity: menuVisible ? 0.18 : 0 }}
          aria-hidden
        />
      </div>

      {/* ===== MENU — operation callouts arced around the iris rim ===== */}
      {stage >= 6 && (
        <div className={`iris-menu ${menuVisible ? "is-in" : ""}`} aria-hidden={!menuVisible}>
          <div role="menu">
            {MENU_ARC.map((m, i) => {
              const active = sel === m.key;
              const disabled = m.key === "continue" && !hasSave;
              const off = arcOffset(m.angle);
              return (
                <button
                  key={m.key}
                  role="menuitem"
                  className={`iris-item ${active ? "is-active" : ""} ${disabled ? "is-disabled" : ""}`}
                  style={{
                    "--tx": off.x,
                    "--ty": off.y,
                    "--rot": `${m.angle * 0.45}deg`,
                    "--tickrot": `${m.angle * 0.55}deg`,
                    animationDelay: menuVisible ? `${160 + i * 70}ms` : undefined,
                  } as React.CSSProperties}
                  onMouseEnter={() => { lastInputRef.current = "mouse"; choose(m.key); }}
                  onFocus={() => { lastInputRef.current = "mouse"; choose(m.key); }}
                  onClick={(e) => { e.stopPropagation(); void activate(m.key); }}
                  tabIndex={menuVisible && !disabled ? 0 : -1}
                  aria-label={m.label}
                >
                  <span className="iris-item-tick" aria-hidden />
                  <span className="iris-item-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="iris-item-text">{m.label}</span>
                  {m.key === "continue" && (
                    <span className="iris-item-sub">{hasSave ? "▸ CASE ACTIVE" : "○ NO CASE"}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="iris-menu-hint" aria-hidden>↑↓ NAVIGATE&nbsp;&nbsp;·&nbsp;&nbsp;ENTER CONFIRM</div>
        </div>
      )}

      {/* hover sentinel — full iris hit area, tracks mouse continuously */}
      <div
        className="iris-sentinel"
        style={{ zIndex: 1 }}
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
        onMouseMove={onMouseMove}
        aria-hidden
      />

      {/* ---------- panels — 90s workstation dialogs ---------- */}
      {panel && (
        <div className="iris-modal" onClick={closePanel}>
          <div
            className="iris-dlg panel-raised win-shadow w-[460px] max-w-[92vw]"
            role="dialog"
            aria-modal="true"
            aria-label={panel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="iris-dlg-title win-active-titlebar">
              <span className="iris-dlg-title-text">
                <span className="iris-dlg-glyph" aria-hidden>▣</span>
                {panel === "settings" && "SETTINGS — SYSTEM PROPERTIES"}
                {panel === "archives" && "ARCHIVES — CASE REGISTRY"}
                {panel === "credits" && "CREDITS — ABOUT ORPHEUS"}
              </span>
              <button className="btn-bevel iris-dlg-x" onClick={closePanel} aria-label="close">✕</button>
            </div>

            <div className="iris-dlg-body">
              {panel === "settings" && (
                <div>
                  <div className="iris-group">
                    <span className="iris-group-legend">DISPLAY</span>
                    <CheckRow
                      label="CRT EFFECT"
                      sub="scanline + phosphor overlay"
                      on={os.settings.crt}
                      onToggle={() => { os.setSettings({ crt: !os.settings.crt }); if (os.settings.sound) sfx.menuClick(); }}
                    />
                  </div>
                  <div className="iris-group">
                    <span className="iris-group-legend">AUDIO</span>
                    <CheckRow
                      label="SOUND"
                      sub="hum, clicks, interface audio"
                      on={os.settings.sound}
                      onToggle={() => {
                        const next = !os.settings.sound;
                        os.setSettings({ sound: next });
                        sfx.setEnabled(next);
                        if (next && os.settings.sound) sfx.menuClick();
                      }}
                    />
                  </div>
                  <div className="iris-group">
                    <span className="iris-group-legend">ACCESSIBILITY</span>
                    <CheckRow
                      label="REDUCED MOTION"
                      sub="calm the optic's drift"
                      on={os.settings.reducedMotion}
                      onToggle={() => { os.setSettings({ reducedMotion: !os.settings.reducedMotion }); if (os.settings.sound) sfx.menuClick(); }}
                    />
                  </div>
                  <div className="iris-group">
                    <span className="iris-group-legend">TEXT SIZE</span>
                    <div className="iris-radio-row">
                      {([["NORMAL", "md"], ["LARGE", "lg"]] as const).map(([label, val]) => (
                        <button
                          key={val}
                          className={`iris-radio-opt ${os.settings.textScale === val ? "is-on" : ""}`}
                          onClick={() => { os.setSettings({ textScale: val }); if (os.settings.sound) sfx.menuClick(); }}
                        >
                          <span className={`iris-radio ${os.settings.textScale === val ? "is-on" : ""}`} aria-hidden />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {panel === "archives" && (
                <div>
                  <div className="iris-list">
                    <div className="iris-list-head">
                      <span>NAME</span><span>STATUS</span><span>ARCHIVED</span>
                    </div>
                    {caseDone !== null ? (
                      <div className="iris-list-row is-sel">
                        <span>CASE_001.MCDUFF</span>
                        <span className="is-closed">CLOSED</span>
                        <span>{typeof caseDone === "number" ? new Date(caseDone).toISOString().slice(0, 10) : "—"}</span>
                      </div>
                    ) : (
                      <div className="iris-list-empty">
                        <div className="iris-list-empty-title">NO CLOSED CASES</div>
                        <div className="iris-list-empty-sub">complete the case reconstruction<br />to archive it here</div>
                      </div>
                    )}
                  </div>
                  <div className="iris-details">
                    {caseDone !== null ? (
                      <>SUBJECT — D. MCDUFF, KESTREL INSTITUTE<br />STATUS — CLOSED · EVIDENCE ARCHIVED</>
                    ) : (
                      "SELECT AN ITEM TO VIEW DETAILS"
                    )}
                  </div>
                </div>
              )}
              {panel === "credits" && (
                <div className="iris-about">
                  <div className="iris-about-logo">ORPHEUS</div>
                  <div className="iris-about-sub">THE MCDUFF INVESTIGATION</div>
                  <div className="iris-about-ver">VERSION 1.0 · BUILD 2026.03.10 · SINGLE-USER WORKSTATION</div>
                  <div className="iris-hr" />
                  <div className="iris-about-row"><span className="iris-about-role">FORMAT</span><span className="iris-about-val">A WEBMCP EXPERIMENT</span></div>
                  <div className="iris-about-row"><span className="iris-about-role">DESIGN</span><span className="iris-about-val">built with an AI co-investigator</span></div>
                  <div className="iris-about-row"><span className="iris-about-role">SOUND</span><span className="iris-about-val">synthesized live, no samples</span></div>
                  <div className="iris-about-note">DANIEL MCDUFF IS FICTIONAL</div>
                  <div className="iris-about-challenge">BUILT FOR THE WEBMCP CHALLENGE</div>
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </div>
  );
}
