"use client";

import { create } from "zustand";
import type { EvidenceItem, EvidenceSection } from "@/types/game";
import { activeCorpus } from "@/game/data/corpus";

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
  evidenceIds: new Set(activeCorpus().seedEvidenceIds),
  highlightId: null,
  caseReport: {},
  caseVerdicts: {},
  caseCompleteAt: null,

  syncFlags: (flags) => {
    const cur = get().evidenceIds;
    let changed = false;
    for (const item of activeCorpus().evidence) {
      if (item.autoUnlockFlag && flags.has(item.autoUnlockFlag) && !cur.has(item.id)) {
        cur.add(item.id);
        changed = true;
      }
    }
    if (changed) set({ evidenceIds: new Set(cur) });
  },

  recordEvidence: (id) => {
    if (get().evidenceIds.has(id)) return false;
    if (!activeCorpus().evidence.some((e2) => e2.id === id)) return false;
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
    activeCorpus().evidence.filter((e2) => get().evidenceIds.has(e2.id)),

  submitCaseReport: (answers) => {
    const verdicts: InvestState["caseVerdicts"] = {};
    const isApollo = activeCorpus().id === "apollo13";

    if (isApollo) {
      // Q1 heater/thermostat/arc — spec mismatch + 65V vs 28V
      const q1 = (answers.q1 ?? "").toLowerCase();
      verdicts.q1 =
        /(heater|thermostat|switch)/.test(q1) && /(arc|weld|28.*65|65.*28|volt)/.test(q1)
          ? "SUPPORTED"
          : /(heater|thermostat|oxygen tank|switch|28v|65v)/.test(q1) && q1.length > 40
            ? "PARTIALLY SUPPORTED"
            : "INSUFFICIENT EVIDENCE";
      // Q2 venting / 03:07 / 14 minutes
      const q2 = (answers.q2 ?? "").toLowerCase();
      verdicts.q2 =
        /(vent|03:07|03 07|055:54|lovell).*?(hatch|gas|14 min|fourteen)/.test(q2) || /(venting).*?(lovell|hatch)/.test(q2)
          ? "SUPPORTED"
          : /(vent|hatch|gas|03:07)/.test(q2) && q2.length > 30
            ? "PARTIALLY SUPPORTED"
            : "INSUFFICIENT EVIDENCE";
      // Q3 free-return vs PC+2 / Indian Ocean vs South Pacific
      const q3 = (answers.q3 ?? "").toLowerCase();
      verdicts.q3 =
        /(free.return|152\s*h|indian).*?(pc\+2|79:27|861|pacific|south)/.test(q3) || /(pc\+2|transearth).*?(pacific|indian)/.test(q3)
          ? "SUPPORTED"
          : /(free.return|pc\+2|indian|pacific|transearth)/.test(q3)
            ? "PARTIALLY SUPPORTED"
            : "INSUFFICIENT EVIDENCE";
      // Q4 CO2 / mailbox / 32 hours
      const q4 = (answers.q4 ?? "").toLowerCase();
      verdicts.q4 =
        /(co2|carbon|lithium|hydroxide|canister).*?(mailbox|32|adapter|tape)/.test(q4) || /(mailbox|adapter).*?(co2|canister)/.test(q4)
          ? "SUPPORTED"
          : /(co2|lithium|canister|mailbox|adapter)/.test(q4)
            ? "PARTIALLY SUPPORTED"
            : "INSUFFICIENT EVIDENCE";
    } else {
      // Q1 what happened — McDuff
      const q1 = answers.q1 ?? "";
      const q1Hits = [q1].filter(
        (a) =>
          /(staged|faked|murder|killed|not an accident|didn'?t fall|did not fall|pushed|arranged|cover.?up|homicide|made it look)/.test(a.toLowerCase()) &&
          /(02:13|watch|band|door|usb|login|heart|mid-beat|clock|log)/.test(a.toLowerCase())
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
        /(residual|bias|drift|smoothing|probab|outcome|loaded|narrowing|agree|weight|converg)/.test(q3) &&
        /(grow|exponential|e-?fold|increas|worsen|amplif|compound|acceler|over time)/.test(q3)
          ? "SUPPORTED"
          : /(measurement|anomal|residual)/.test(q3)
            ? "PARTIALLY SUPPORTED"
            : "INSUFFICIENT EVIDENCE";

      // Q4 why targeted
      const q4 = (answers.q4 ?? "").toLowerCase();
      verdicts.q4 =
        /(publish|go public|refus|threat|maintenance|suppress|silenc|knew too much|arrang|erase|eliminat|remove|disappear|stop[^\n]{0,24}(publish|talk|tell))/.test(q4)
          ? "SUPPORTED"
          : /(research|found out|discover)/.test(q4)
            ? "PARTIALLY SUPPORTED"
            : "INSUFFICIENT EVIDENCE";
    }

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
  return activeCorpus().evidence.filter((e2) => ids.has(e2.id) && e2.section === section).length;
}
