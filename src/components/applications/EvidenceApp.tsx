"use client";

import { useState } from "react";
import type { EvidenceSection } from "@/types/game";
import { useInvestigation } from "@/game/state/investigationStore";
import { useOS } from "@/game/state/osStore";
import { EVIDENCE } from "@/game/data/evidence";
import { sfx } from "@/audio/engine";
import DeclarativeForm from "@/components/DeclarativeForm";

/* ============================================================
   EVIDENCE BOARD — investigation workspace.
   Includes CASE RECONSTRUCTION when unlocked.
   ============================================================ */

const SECTIONS: { id: EvidenceSection; label: string }[] = [
  { id: "people", label: "PEOPLE" },
  { id: "events", label: "EVENTS" },
  { id: "locations", label: "LOCATIONS" },
  { id: "documents", label: "DOCUMENTS" },
  { id: "hypotheses", label: "HYPOTHESES" },
];

export default function EvidenceApp() {
  const inv = useInvestigation();
  const os = useOS();
  const [tab, setTab] = useState<EvidenceSection>("people");
  const [recon, setRecon] = useState(false);
  const items = inv.getVisibleEvidence().filter((e) => e.section === tab);
  const totalEvidence = EVIDENCE.length; // dynamic 20 -> 100% now reachable
  const collected = inv.getVisibleEvidence().length;
  const progress = Math.round((collected / totalEvidence) * 100);
  const collaborated = os.flags.has("COLLABORATED_WITH_ARIA");

  return (
    <div className="flex flex-col h-full text-[12px]">
      {/* progress bar */}
      <div className="shrink-0 h-[22px] flex items-center gap-2 px-3 bg-surface2 border-b border-line">
        <span className="text-[9.5px] tracking-[0.16em] text-accent">◆ {collected}/{totalEvidence} COLLECTED</span>
        <div className="flex-1 h-[4px] bg-bg border border-line overflow-hidden mx-2">
          <div className="h-full bg-accent" style={{ width: `${progress}%`, transition: "width 240ms steps(3)", background: "repeating-linear-gradient(90deg, var(--accent) 0 6px, #b6e0bf 6px 7px)" }} />
        </div>
        <span className="text-[9px] tracking-[0.12em] text-faint">{progress}%</span>
        <span className="hidden sm:inline text-[9px] tracking-[0.12em] text-faint">· {collaborated ? "WebMCP + eyes" : "ask ARIA to correlate"}</span>
      </div>
      {/* Declarative tool: the agent can request a correlation search natively */}
      <div className="shrink-0 px-3 py-1.5 border-b border-line bg-surface">
        <DeclarativeForm
          toolname="request_correlation"
          tooldescription="Ask ARIA to search the machine for a term the player noticed. Returns file + message hits."
          paramName="query"
          paramDescription="A term the player saw — a name, place, object, or number to search across files and messages."
          placeholder="e.g. badge, kestrel, 02:13…"
          submitLabel="CORRELATE"
          onExecute={async (query) => {
            const S = await import("@/game/services");
            // file search (inline — mirrors the WebMCP search_files tool)
            const os = useOS.getState();
            const q = query.toLowerCase();
            const fileHits = S.fsList().filter((n) => {
              if (n.hiddenUntilFlag && !os.flags.has(n.hiddenUntilFlag)) return false;
              if (n.requiresUnlock && !os.vaultUnlocked) return false;
              return (
                n.name.toLowerCase().includes(q) ||
                (n.content?.toLowerCase().includes(q) ?? false)
              );
            });
            const msgs = S.searchMessages(query);
            const f = fileHits.length;
            const m = msgs.length;
            useOS.getState().pushToast({
              app: "ARIA",
              title: `CORRELATE "${query}"`,
              body: `${f} file hit(s) · ${m} message hit(s). Open Files or Messages to inspect.`,
            });
            sfx.chime();
            return `Searched "${query}": ${f} file hit(s), ${m} message hit(s).`;
          }}
        />
      </div>
      {!collaborated && (
        <div className="shrink-0 px-3 py-1.5 bg-amber/10 border-b border-amber/20 text-[10px] tracking-[0.12em] text-amber flex items-center gap-2">
          <span>◆ COLLABORATION REQUIRED</span>
          <span className="text-faint normal-case tracking-normal">Tell ARIA what you see — she must search at least once to reconstruct.</span>
          <button className="ml-auto btn-bevel text-[9px] px-2 py-0.5" onClick={() => window.dispatchEvent(new CustomEvent("orpheus:open-link"))}>LINK</button>
        </div>
      )}
      {/* tabs */}
      <div className="shrink-0 flex border-b border-line bg-surface">
        {SECTIONS.map((s) => {
          const count = inv.getVisibleEvidence().filter((e) => e.section === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => { setTab(s.id); sfx.click(); }}
              className={`px-3 py-1.5 text-[10.5px] tracking-[0.16em] border-r border-line ${
                tab === s.id ? "bg-sel text-accent" : "text-dim hover:text-txt"
              }`}
            >
              {s.label} <span className="text-faint">{count}</span>
            </button>
          );
        })}
        <div className="flex-1" />
        {os.flags.has("CASE_RECONSTRUCTION_AVAILABLE") ? (
          <button className="btn-bevel m-1 text-[10px] bg-amber/15 border-amber text-amber animate-pulse" style={{ borderColor: "var(--amber)" }} onClick={() => { setRecon(true); sfx.windowOpen(); }}>
            ⬖ CASE RECONSTRUCTION — READY
          </button>
        ) : (
          <span className="hidden md:inline-flex items-center m-1 px-2 text-[9px] tracking-[0.14em] text-faint">
            {collected >= 6 ? `${6 - collected % 6} more for reconstruction` : "keep investigating"}
          </span>
        )}
      </div>

      {/* cards */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 content-start">
        {items.map((e) => {
          const highlighted = inv.highlightId === e.id;
          return (
            <div
              key={e.id}
              className={`ev-card panel-inset p-3 ${highlighted ? "ev-highlight" : ""}`}
              style={{ borderColor: highlighted ? "var(--amber)" : undefined }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] tracking-[0.14em] text-txt">{e.title}</span>
                <span
                  className={`text-[8.5px] tracking-[0.14em] shrink-0 mt-1 ${
                    e.confidence === "high" ? "text-accent" : e.confidence === "medium" ? "text-amber" : "text-alert"
                  }`}
                >
                  {e.confidence?.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-dim">{e.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {e.sources.map((s) => (
                  <span key={s} className="mono-xs panel-inset px-1.5 py-0.5 text-faint">{s}</span>
                ))}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="col-span-full panel-inset p-4 text-center">
            <div className="text-[11px] tracking-[0.14em] text-faint">NOTHING RECORDED HERE YET</div>
            <div className="text-[10.5px] text-dim mt-1 leading-relaxed">
              {tab === "people" && "Talk to ARIA: “search messages for Haldane” — people emerge when you connect logs + messages."}
              {tab === "events" && "Open System Log → FINAL NIGHT. Scroll. Watch the 02:13 block appear."}
              {tab === "locations" && "Visit Private/photo_backup after the vault — maps and badges live there."}
              {tab === "documents" && "Research → ORPHEUS holds every stack. Open anomaly_notes.txt."}
              {tab === "hypotheses" && "Hypotheses unlock when you link visuals + logs. Try the checklist HUD → HINT."}
            </div>
          </div>
        )}
      </div>

      {recon && <CaseReconstruction onClose={() => setRecon(false)} />}
    </div>
  );
}

/* ---------------- case reconstruction form ---------------- */

const QUESTIONS: { key: string; label: string }[] = [
  { key: "q1", label: "WHAT HAPPENED TO DANIEL?" },
  { key: "q2", label: "WHO WAS RESPONSIBLE?" },
  { key: "q3", label: "WHAT DID ORPHEUS REVEAL?" },
  { key: "q4", label: "WHY WAS DANIEL TARGETED?" },
];

function CaseReconstruction({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation();
  const os = useOS();
  const [answers, setAnswers] = useState<Record<string, string>>(inv.caseReport);
  const [result, setResult] = useState<null | { complete: boolean }>(null);

  function submit() {
    const r = inv.submitCaseReport(answers);
    setResult({ complete: r.complete });
    if (r.complete) sfx.chime(); else sfx.error();
    if (r.complete) {
      try { os.addFlag("CASE_COMPLETE"); } catch {}
      setTimeout(() => {
        os.pushToast({ app: "EVIDENCE", title: "CASE ACCEPTED", body: "Reconstruction matches the evidence — archived." });
        window.dispatchEvent(new CustomEvent("orpheus:case-complete"));
      }, 600);
    } else {
      setTimeout(() => {
        os.pushToast({ app: "EVIDENCE", title: "PARTIAL FILE", body: "Some conclusions lack support — check verdicts and resubmit." });
      }, 500);
    }
  }

  const vColor = (v?: string) =>
    v === "SUPPORTED" ? "text-accent" : v === "PARTIALLY SUPPORTED" ? "text-amber" : "text-alert";

  return (
    <div className="absolute inset-0 z-20 bg-black/70 grid place-items-center p-4">
      <div className="panel-raised win-shadow w-[640px] max-w-full max-h-full flex flex-col">
        <div className="win-active-titlebar px-3 py-1.5 border-b border-linebright flex justify-between items-center">
          <span className="text-[11px] tracking-[0.25em] text-txt">CASE RECONSTRUCTION</span>
          <button className="btn-bevel text-[10px]" onClick={() => { onClose(); sfx.windowClose(); }}>CLOSE</button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="text-[11px] text-faint leading-relaxed">
            State your conclusions plainly. They will be tested against recorded evidence.
          </div>

          {QUESTIONS.map((q) => (
            <div key={q.key}>
              <div className="mono-xs text-accentdim mb-1">{q.label}</div>
              <textarea
                className="field-dark w-full h-[64px] p-2 text-[12px] resize-none"
                value={answers[q.key] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
                placeholder="…"
              />
              {inv.caseVerdicts[q.key] && (
                <div className={`mono-xs mt-1 ${vColor(inv.caseVerdicts[q.key])}`}>
                  VERDICT: {inv.caseVerdicts[q.key]}
                </div>
              )}
            </div>
          ))}

          {!result && (
            <button
              className="btn-bevel w-full py-2 text-[12px] tracking-[0.2em]"
              onClick={submit}
              disabled={Object.values(answers).filter((a) => a.trim().length > 20).length < 4}
            >
              SUBMIT FOR EVALUATION
            </button>
          )}

          {result && !result.complete && (
            <div className="text-amber text-[11.5px] leading-relaxed panel-inset p-3">
              PARTIAL FILE ACCEPTED. At least three conclusions must be SUPPORTED by evidence.
              Check verdicts above, revisit the board, and resubmit.
            </div>
          )}

          {result?.complete && (
            <div className="text-accent text-[12px] leading-relaxed panel-inset p-3">
              CASE FILE UPDATED · EVIDENCE ARCHIVED · SYSTEM DECOMMISSIONING QUEUED…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
