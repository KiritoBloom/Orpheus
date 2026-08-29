"use client";

import { get, set } from "idb-keyval";
import type { Settings, StoryFlag } from "@/types/game";

/* ============================================================
   PERSISTENCE — single IndexedDB record, versioned.
   Chat/queue removed with Messages app; only flags/evidence/vault remain.
   ============================================================ */

const KEY = "orpheus-save-v1";

export interface SaveData {
  version: 1;
  flags: StoryFlag[];
  evidenceIds: string[];
  unlockedVault: boolean;
  vaultAttempts: number;
  settings: Settings;
  caseReport: Record<string, string>;
  caseVerdicts: Record<string, string>;
  caseCompleteAt: number | null;
  hasProgress: boolean;
  readMailIds: string[];
  readThreadIds: string[];
}

export const EMPTY_SAVE: SaveData = {
  version: 1,
  flags: [],
  evidenceIds: ["ev_daniel"],
  unlockedVault: false,
  vaultAttempts: 0,
  settings: { crt: true, sound: true, reducedMotion: false, textScale: "md" },
  caseReport: {},
  caseVerdicts: {},
  caseCompleteAt: null,
  hasProgress: false,
  readMailIds: [],
  readThreadIds: [],
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let currentSave: SaveData = { ...EMPTY_SAVE };

export function getSave(): SaveData {
  return currentSave;
}

/** mutate + schedule persist */
export function updateSave(patch: Partial<SaveData>) {
  currentSave = { ...currentSave, ...patch };
  currentSave.hasProgress =
    currentSave.flags.length > 0 || currentSave.caseCompleteAt !== null;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void set(KEY, currentSave).catch(() => undefined);
  }, 400);
}

export async function loadSave(): Promise<SaveData> {
  try {
    const raw = await get<SaveData>(KEY);
    if (raw && raw.version === 1) {
      currentSave = { ...EMPTY_SAVE, ...raw };
    }
  } catch {
    /* fresh machine */
  }
  return currentSave;
}

export async function wipeSave(): Promise<void> {
  currentSave = { ...EMPTY_SAVE };
  await set(KEY, currentSave).catch(() => undefined);
}
