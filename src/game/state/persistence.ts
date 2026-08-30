"use client";

import { get, set } from "idb-keyval";
import type { Settings, StoryFlag } from "@/types/game";
import { activeCorpusId } from "@/game/data/corpus";

/* ============================================================
   PERSISTENCE — single IndexedDB record, versioned.
   Chat/queue removed with Messages app; only flags/evidence/vault remain.
   ============================================================ */

/**
 * Saves are scoped per corpus. Instance one keeps the original key so existing
 * progress survives; every other corpus gets its own record, so playing the
 * Apollo 13 workstation cannot overwrite a McDuff investigation in progress.
 */
function saveKey(): string {
  const id = activeCorpusId();
  return id === "mcduff" ? "orpheus-save-v1" : `orpheus-save-v1:${id}`;
}

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
  evidenceIds: [],
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
    void set(saveKey(), currentSave).catch(() => undefined);
  }, 400);
}

export async function loadSave(): Promise<SaveData> {
  try {
    const raw = await get<SaveData>(saveKey());
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
  await set(saveKey(), currentSave).catch(() => undefined);
}
