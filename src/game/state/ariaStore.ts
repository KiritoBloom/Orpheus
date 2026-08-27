"use client";

import { create } from "zustand";
import type { AriaStatusState } from "@/types/game";

/* ============================================================
   AGENT STATUS STORE — lightweight WebMCP activity indicator.
   Chat/queue removed with Messages app; status remains for
   Taskbar + AgentLinkPanel + tool feedback.
   ============================================================ */

interface AriaState {
  status: AriaStatusState;
  statusDetail: string;
  setStatus: (s: AriaStatusState, detail?: string) => void;
}

export const useAria = create<AriaState>((set) => ({
  status: "idle",
  statusDetail: "",
  setStatus: (status, detail = "") => set({ status, statusDetail: detail }),
}));
