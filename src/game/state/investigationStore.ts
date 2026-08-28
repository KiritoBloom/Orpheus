"use client";

import { create } from "zustand";
import type { EvidenceItem, EvidenceSection } from "@/types/game";
import { EVIDENCE } from "@/game/data/evidence";

/* ============================================================
   INVESTIGATION STORE — flags-driven evidence + vault + report
   ============================================================ */

interface InvestState {
  evidenceIds: Set<string>;
  highlightId: string | null;
  caseReport: Record<string, string>;
  caseVerdicts: Record<string, "SUPPORTED" | "PARTIALLY SUPPORTED" | "INSUFFICIENT EVIDENCE">;
  caseCompleteAt: number | null;

  syncFlags: (flags: Set<import("@/types/game").StoryFlag>) => void;
  recordEvidence: (id: string) => boolean;
  highlightEvidence: (id: string) => boolean;
  getVisibleEvidence: () => EvidenceItem[];
  submitCaseReport: (
    answers: Record<string, string>
  ) => { verdicts: InvestState["caseVerdicts"]; complete: boolean };
  loadFromSave: (data: {
    evidenceIds: string[];
    caseReport: Record<string, string>;
    caseVerdicts: Record<string, string>;
    caseCompleteAt: number | null;
  }) => void;
}

export const useInvestigation = create<InvestState>((set, get) => ({
  evidenceIds: new Set(["ev_daniel"]),
  highlightId: null,
  caseReport: {},
  caseVerdicts: {},
  caseCompleteAt: null,

  syncFlags: (flags) => {
    const cur = get().evidenceIds;
    let changed = false;
    for (const item of EVIDENCE) {
      if (item.autoUnlockFlag && flags.has(item.autoUnlockFlag) && !cur.has(item.id)) {
        cur.add(item.id);
        changed = true;
      }
    }
    if (changed) set({ evidenceIds: new Set(cur) });
  },

  recordEvidence: (id) => {
    if (get().evidenceIds.has(id)) return false;
    if (!EVIDENCE.some((e2) => e2.id === id)) return false;
    set((s) => ({ evidenceIds: new Set(s.evidenceIds).add(id) }));
    return true;
  },

  highlightEvidence: (id) => {
    if (!get().evidenceIds.has(id)) return false;
    set({ highlightId: id });
    setTimeout(() => {
      if (get().highlightId === id) set({ highlightId: null });
    }, 3600);
    return true;
  },

  getVisibleEvidence: () =>
    EVIDENCE.filter((e2) => get().evidenceIds.has(e2.id)),

  submitCaseReport: (answers) => {
    const verdicts: InvestState["caseVerdicts"] = {};

    // Q1 what happened
    const q1 = answers.q1 ?? "";
    const q1Hits = [q1].filter(
      (a) =>
        /(staged|faked|murder|killed|not an accident|didn't fall|did not fall)/.test(a.toLowerCase()) &&
        /(02:13|watch|band|door|usb|login|heart|mid-beat)/.test(a.toLowerCase())
    ).length;
    verdicts.q1 = q1Hits > 0 ? "SUPPORTED" : /accident|died|fall/.test(q1.toLowerCase()) && q1.length > 60 ? "PARTIALLY SUPPORTED" : "INSUFFICIENT EVIDENCE";

    // Q2 who
    const q2 = (answers.q2 ?? "").toLowerCase();
    verdicts.q2 =
      /(kestrel|haldane)/.test(q2) && /(w|operative|agent|institute)/.test(q2)
        ? "SUPPORTED"
        : /(kestrel|haldane|institute)/.test(q2)
          ? "PARTIALLY SUPPORTED"
          : "INSUFFICIENT EVIDENCE";

    // Q3 what ORPHEUS revealed
    const q3 = (answers.q3 ?? "").toLowerCase();
    verdicts.q3 =
      /(residual|bias term|drift|smoothing|probab|outcome|loaded|narrowing|agreeable)/.test(q3) &&
      /(grow|exponential|e-fold|increas)/.test(q3)
        ? "SUPPORTED"
        : /(measurement|anomal|residual)/.test(q3)
          ? "PARTIALLY SUPPORTED"
          : "INSUFFICIENT EVIDENCE";

    // Q4 why targeted
    const q4 = (answers.q4 ?? "").toLowerCase();
    verdicts.q4 =
      /(publish|go public|refus|threat|maintenance|suppress|silenc|knew too much)/.test(q4)
        ? "SUPPORTED"
        : /(research|found out|discover)/.test(q4)
          ? "PARTIALLY SUPPORTED"
          : "INSUFFICIENT EVIDENCE";

    const supportedCount = Object.values(verdicts).filter((v) => v === "SUPPORTED").length;
    const insufficient = Object.values(verdicts).filter((v) => v === "INSUFFICIENT EVIDENCE").length;
    const complete = supportedCount >= 3 && insufficient <= 1;

    updatePersist(answers, verdicts, complete);
    if (complete) {
      import("@/game/state/osStore").then(({ useOS }) => useOS.getState().addFlag("CASE_COMPLETE")).catch(() => {});
    }
    set({
      caseReport: answers,
      caseVerdicts: verdicts,
      ...(complete ? { caseCompleteAt: Date.now() } : {}),
    });
    return { verdicts, complete };
  },

  loadFromSave: ({ evidenceIds, caseReport, caseVerdicts, caseCompleteAt }) =>
    set({
      evidenceIds: new Set(evidenceIds),
      caseReport,
      caseVerdicts: caseVerdicts as InvestState["caseVerdicts"],
      caseCompleteAt,
    }),
}));

function updatePersist(
  answers: Record<string, string>,
  verdicts: Record<string, string>,
  complete: boolean
) {
  import("./persistence").then(({ updateSave }) => {
    updateSave({
      caseReport: answers,
      caseVerdicts: verdicts,
      ...(complete ? { caseCompleteAt: Date.now() } : {}),
    });
  });
}

export function countEvidenceBySection(ids: Set<string>, section: EvidenceSection) {
  return EVIDENCE.filter((e2) => ids.has(e2.id) && e2.section === section).length;
}
