"use client";

/* ============================================================
   ENDING SEQUENCE — staggered window closes, fade to black,
   ARIA's last three messages, the final line.
   ============================================================ */

import { useEffect, useState } from "react";
import { useOS } from "@/game/state/osStore";
import { activeCorpus } from "@/game/data/corpus";
import { sfx } from "@/audio/engine";

export default function EndingSequence({ onDone }: { onDone: () => void }) {
  const chrome = activeCorpus().chrome;
  const FINAL_MESSAGES = chrome.endingLines;
  const [step, setStep] = useState(0);
  const windows = useOS((s) => s.windows);
  const os = useOS();

  // 0: closing windows  1–3: timed ARIA messages  4: iris closes  5: black + final line

  useEffect(() => {
    if (step === 0) {
      // stagger-close all open windows
      const openIds = (Object.keys(windows) as (keyof typeof windows)[])
        .filter((k) => windows[k].open);
      openIds.forEach((id, i) =>
        setTimeout(() => { os.closeWindow(id); sfx.windowClose(); }, i * 170)
      );
      const t = setTimeout(() => setStep(1), openIds.length * 170 + 800);
      return () => clearTimeout(t);
    }
    if (step >= 1 && step <= 3) {
      const t = setTimeout(() => setStep((s) => s + 1), step === 1 ? 1600 : step === 2 ? 2200 : 2600);
      return () => clearTimeout(t);
    }
    if (step === 4) {
      sfx.deepThud();
      const t = setTimeout(() => setStep(5), 2000);
      return () => clearTimeout(t);
    }
    if (step === 5) {
      const t = setTimeout(onDone, 5200);
      return () => clearTimeout(t);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black z-[900] grid place-items-center p-6">
      {/* scanline residue at the start, fades after step 0 */}
      {step === 0 && <div className="crt-overlay" />}

      {/* closing iris mini — steps 4–5 */}
      {step >= 4 && (
        <svg viewBox="0 0 200 200" className="w-[72px] h-[72px] opacity-70">
          <circle cx="100" cy="100" r={step === 5 ? 2 : 44} fill="none" stroke="#7fae8b" strokeWidth="2"
            style={{ transition: "r 2s ease-in", transformOrigin: "100px 100px" }} />
          <circle cx="100" cy="100" r={step === 5 ? 0 : 7} fill="#b9d8bd"
            style={{ transition: "r 2s ease-in" }} />
        </svg>
      )}

      {/* ARIA's final messages — steps 1–3 */}
      {step >= 1 && step <= 3 && (
        <div className="text-center max-w-[520px] space-y-2">
          {FINAL_MESSAGES.slice(0, step).map((m, i) => (
            <div
              key={i}
              className={`text-[13px] tracking-[0.08em] ${i === step - 1 ? "text-accent" : "text-dim"}`}
              style={{ opacity: i < step - 1 ? 0.45 : 1 }}
            >
              {m}
            </div>
          ))}
        </div>
      )}

      {/* the final line — step 5 */}
      {step === 5 && (
        <div className="text-center">
          <div className="text-[18px] tracking-[0.28em] text-txt">{chrome.endingFinalLine}</div>
          <div className="mt-8 text-[9px] tracking-[0.4em] text-faint">{chrome.endingStamp}</div>
        </div>
      )}
    </div>
  );
}
