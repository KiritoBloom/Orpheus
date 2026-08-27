"use client";

import { useEffect, useMemo, useState } from "react";
import { useOS } from "@/game/state/osStore";
import { useInvestigation } from "@/game/state/investigationStore";
import * as S from "@/game/services";
import { sfx } from "@/audio/engine";

/* ============================================================
   INVESTIGATION CHECKLIST — persistent desktop widget.
   Shows live progress, next step, and gentle hints.
   Polished, collapsible, non-intrusive.
   ============================================================ */

interface Step {
  id: string;
  label: string;
  desc: string;
  done: (flags: Set<string>, evidenceCount: number) => boolean;
  hint: string;
  action: () => void;
  actionLabel: string;
}

const STEPS: Step[] = [
  {
    id: "guide",
    label: "The Letter",
    desc: "He left you a thread",
    done: (f) => f.has("FOUND_GUIDE"),
    hint: "He always left instructions where only he would think to look — near the system's own voice.",
    action: () => S.openDirectory("/System"),
    actionLabel: "BROWSE",
  },
  {
    id: "orpheus",
    label: "The Tilt",
    desc: "What the instruments agree on",
    done: (f) => f.has("DISCOVERED_ORPHEUS"),
    hint: "Five unrelated datasets, one curve. The name is a myth about looking back.",
    action: () => S.openDirectory("/Research/ORPHEUS"),
    actionLabel: "EXPLORE",
  },
  {
    id: "reflection",
    label: "The Window",
    desc: "What the glass remembers",
    done: (f) => f.has("FOUND_PHOTO_017"),
    hint: "Evening light. A figure. A badge turned backwards for a reason.",
    action: () => S.openApplication("photos"),
    actionLabel: "LOOK",
  },
  {
    id: "collab",
    label: "Ask ARIA",
    desc: "You see, she searches",
    done: (f) => f.has("COLLABORATED_WITH_ARIA"),
    hint: "Describe what you see to her. She will search & open what you cannot. Watch the windows move — that is WebMCP.",
    action: () => window.dispatchEvent(new CustomEvent("orpheus:open-link")),
    actionLabel: "LINK",
  },
  {
    id: "timeline",
    label: "The Hour",
    desc: "02:13",
    done: (f) => f.has("FOUND_0213_LOG"),
    hint: "Clocks, logs, heartbeats — all stop at the same minute. One says nothing happened.",
    action: () => S.openApplication("systemlog"),
    actionLabel: "TRACE",
  },
  {
    id: "vault",
    label: "The Vestibule",
    desc: "Three words, his habit",
    done: (f) => f.has("VAULT_OPENED"),
    hint: "Light → name → echo. Photographed so paper could burn and pixels would remember. Order matters.",
    action: () => S.openApplication("terminal"),
    actionLabel: "UNLOCK",
  },
  {
    id: "case",
    label: "The Verdict",
    desc: "Four questions",
    done: (f) => f.has("CASE_RECONSTRUCTION_AVAILABLE") || f.has("CASE_COMPLETE"),
    hint: "When the board feels full, it will offer you a final form. You and ARIA must agree.",
    action: () => S.openApplication("evidence"),
    actionLabel: "JUDGE",
  },
];

export default function ChecklistHUD() {
  const flags = useOS((s) => s.flags);
  const evidenceIds = useInvestigation((s) => s.evidenceIds);
  const [minimized, setMinimized] = useState(false);
  const [hintOpen, setHintOpen] = useState<string | null>(null);
  const [prevDone, setPrevDone] = useState<Record<string, boolean>>({});

  const doneMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const st of STEPS) m[st.id] = st.done(flags as unknown as Set<string>, evidenceIds.size);
    return m;
  }, [flags, evidenceIds.size]);

  const completed = Object.values(doneMap).filter(Boolean).length;
  const total = STEPS.length;
  const pct = Math.round((completed / total) * 100);
  const nextStep = STEPS.find((s) => !doneMap[s.id]);
  const allDone = completed === total;

  // satisfying tick sound when a step completes
  useEffect(() => {
    const newlyDone = Object.entries(doneMap).filter(([k, v]) => v && !prevDone[k]);
    if (newlyDone.length > 0 && Object.keys(prevDone).length > 0) {
      sfx.chime();
    }
    setPrevDone(doneMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneMap]);

  // hide entirely after case complete? keep but collapsed
  const caseComplete = flags.has("CASE_COMPLETE");
  if (caseComplete && minimized) {
    return (
      <div className="absolute bottom-[48px] right-3 z-[30] pointer-events-auto">
        <button
          onClick={() => setMinimized(false)}
          className="panel-raised px-3 py-1.5 text-[10px] tracking-[0.16em] text-accent flex items-center gap-2"
        >
          <span>◈ CASE CLOSED</span>
          <span className="text-faint">— expand</span>
        </button>
      </div>
    );
  }

  if (minimized) {
    return (
      <div className="absolute bottom-[48px] right-3 z-[30] pointer-events-auto">
        <button
          onClick={() => setMinimized(false)}
          className="panel-raised win-shadow flex items-center gap-2 px-3 py-2 hover:border-accentdim transition-colors"
          title="expand checklist"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(143,202,160,.7)]" />
          <span className="text-[10px] tracking-[0.18em] text-txt">{completed}/{total} — {pct}%</span>
          <span className="text-[9px] tracking-[0.14em] text-faint">CHECKLIST ▸</span>
        </button>
      </div>
    );
  }

  return (
    <div className="hud-enter absolute bottom-[48px] right-3 z-[30] w-[334px] max-w-[92vw] pointer-events-auto select-none">
      <div className="panel-raised win-shadow overflow-hidden">
        {/* header */}
        <div className="win-active-titlebar h-[26px] px-2 flex items-center justify-between border-b border-linebright">
          <span className="text-[10px] tracking-[0.22em] text-txt flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(143,202,160,.7)]" />
            CASE FILE — {completed}/{total}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] tracking-[0.14em] text-faint mr-1">{pct}%</span>
            <button
              aria-label="minimize checklist"
              className="w-[18px] h-[16px] btn-bevel !p-0 grid place-items-center text-[9px]"
              onClick={() => setMinimized(true)}
            >
              _
            </button>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-[3px] bg-bg">
          <div
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, boxShadow: pct > 0 ? "0 0 8px rgba(143,202,160,.5)" : undefined }}
          />
        </div>

        {/* steps */}
        <div className="p-2 space-y-1 bg-surface">
          {STEPS.map((st, idx) => {
            const done = doneMap[st.id];
            const isNext = nextStep?.id === st.id && !done;
            return (
              <div
                key={st.id}
                className={`relative flex items-start gap-2 px-2 py-[6px] border text-left transition-colors ${
                  done
                    ? "bg-bg border-line opacity-80"
                    : isNext
                      ? "bg-sel border-accentdim"
                      : "bg-bg border-line/60"
                }`}
              >
                {/* checkbox */}
                <span
                  className={`mt-[1px] w-[16px] h-[16px] grid place-items-center shrink-0 border text-[10px] leading-none ${
                    done
                      ? "bg-accent text-black border-accent"
                      : isNext
                        ? "bg-surface border-accentdim text-accentdim"
                        : "bg-surface border-line text-faint"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] tracking-[0.08em] leading-none ${done ? "text-faint line-through" : isNext ? "text-txt" : "text-dim"}`}>
                    {st.label}
                  </div>
                  <div className="text-[9.5px] text-faint leading-tight mt-0.5 truncate">{st.desc}</div>
                  {isNext && hintOpen === st.id && (
                    <div className="mt-1.5 panel-inset p-2 text-[10.5px] leading-relaxed text-amber">
                      {st.hint}
                      <div className="mt-2 flex gap-2">
                        <button
                          className="btn-bevel text-[10px] px-2 py-1"
                          onClick={() => {
                            st.action();
                            sfx.click();
                          }}
                        >
                          {st.actionLabel} →
                        </button>
                        <button
                          className="btn-bevel text-[10px] px-2 py-1"
                          onClick={() => setHintOpen(null)}
                        >
                          CLOSE
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* right action */}
                {!done && (
                  <button
                    className={`shrink-0 text-[9px] tracking-[0.14em] px-1.5 py-1 border ${
                      isNext ? "btn-bevel border-accentdim text-accent" : "btn-bevel !border-line text-faint"
                    }`}
                    onClick={() => {
                      if (isNext) setHintOpen(hintOpen === st.id ? null : st.id);
                      else {
                        st.action();
                        sfx.click();
                      }
                    }}
                  >
                    {isNext ? (hintOpen === st.id ? "HIDE" : "HINT") : "GO"}
                  </button>
                )}
                {done && <span className="shrink-0 text-accent text-[10px]">DONE</span>}
              </div>
            );
          })}
        </div>

        {/* next step callout */}
        <div className="px-2 py-2 bg-surface2 border-t border-line flex items-center justify-between gap-2">
          <div className="min-w-0">
            {allDone ? (
              <div className="text-[10px] tracking-[0.14em] text-accent">◆ ALL STEPS COMPLETE — open Evidence for reconstruction</div>
            ) : nextStep ? (
              <div className="text-[10px] leading-tight">
                <span className="tracking-[0.14em] text-amber">NEXT:</span>{" "}
                <span className="text-txt">{nextStep.label}</span>
                <span className="text-faint"> — {nextStep.desc}</span>
              </div>
            ) : (
              <div className="text-[10px] text-faint">investigate — your progress is tracked live</div>
            )}
          </div>
          {nextStep && !allDone && (
            <button
              className="shrink-0 btn-bevel text-[10px] px-2 py-1"
              onClick={() => {
                nextStep.action();
                sfx.windowOpen();
              }}
            >
              GO →
            </button>
          )}
          {allDone && (
            <button
              className="shrink-0 btn-bevel text-[10px] px-2 py-1 border-amber text-amber"
              onClick={() => {
                S.openApplication("evidence");
                sfx.windowOpen();
              }}
            >
              EVIDENCE ⬖
            </button>
          )}
        </div>

        {/* footer tip about collaboration — mysterious, not tutorial */}
        <div className="px-2 py-1.5 bg-bg border-t border-line flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber/70 shrink-0" />
          <span className="text-[9px] tracking-[0.12em] text-faint leading-tight">
            ARIA sees the machine. You see the room. Neither alone is enough.
          </span>
        </div>
      </div>
    </div>
  );
}
