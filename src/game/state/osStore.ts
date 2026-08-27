"use client";

import { create } from "zustand";
import type {
  AppId,
  Settings,
  StoryFlag,
  Toast,
  WinId,
  WinState,
} from "@/types/game";
import { getSave, updateSave } from "./persistence";

/* ============================================================
   OS STORE — phase, windows, focus, toasts, settings, flags.
   The machine itself.
   ============================================================ */

export type Phase = "title" | "boot" | "briefing" | "desktop" | "ending";

const DEFAULT_GEOMS: Record<WinId, WinState> = {
  files: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 60, y: 48, w: 720, h: 470 } },
  mail: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 90, y: 40, w: 820, h: 520 } },
  photos: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 80, y: 44, w: 640, h: 480 } },
  browser: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 110, y: 36, w: 780, h: 540 } },
  terminal: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 140, y: 90, w: 640, h: 400 } },
  systemlog: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 100, y: 52, w: 760, h: 500 } },
  evidence: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 130, y: 46, w: 700, h: 520 } },
  textviewer: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 220, y: 80, w: 600, h: 480 } },
  imageviewer: { open: false, minimized: false, maximized: false, z: 1, geom: { x: 240, y: 70, w: 660, h: 520 } },
};

interface OSState {
  phase: Phase;
  hydrated: boolean;
  hasSaveProgress: boolean;
  windows: Record<WinId, WinState>;
  focused: WinId | null;
  zTop: number;
  toasts: Toast[];
  settings: Settings;
  flags: Set<StoryFlag>;
  vaultUnlocked: boolean;
  vaultAttempts: number;
  clockStart: number;
  overlayPanel: "settings" | "archives" | "credits" | null;
  endingStep: number;

  hydrate: (opts: { hasProgress: boolean }) => void;
  setPhase: (p: Phase) => void;
  openApp: (id: AppId) => void;
  openWindow: (id: WinId) => void;
  closeWindow: (id: WinId) => void;
  focusWindow: (id: WinId) => void;
  minimizeWindow: (id: WinId) => void;
  toggleMaximize: (id: WinId) => void;
  setGeom: (id: WinId, g: Partial<WinState["geom"]>) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  setSettings: (s: Partial<Settings>) => void;
  addFlag: (f: StoryFlag) => boolean;
  hasFlag: (f: StoryFlag) => boolean;
  setVaultUnlocked: () => void;
  countVaultAttempt: () => number;
  setOverlayPanel: (p: OSState["overlayPanel"]) => void;
  setEndingStep: (n: number) => void;
}

let toastSeq = 1;

export const useOS = create<OSState>((set, get) => ({
  phase: "title",
  hydrated: false,
  hasSaveProgress: false,
  windows: structuredClone(DEFAULT_GEOMS),
  focused: null,
  zTop: 10,
  toasts: [],
  settings:
    typeof window !== "undefined" && getSave().settings
      ? { ...getSave().settings }
      : { crt: true, sound: true, reducedMotion: false, textScale: "md" },
  flags: new Set(getSave().flags ?? []),
  vaultUnlocked: false,
  vaultAttempts: 0,
  clockStart: Date.now(),
  overlayPanel: null,
  endingStep: 0,

  hydrate: ({ hasProgress }) =>
    set({ hydrated: true, hasSaveProgress: hasProgress }),

  setPhase: (p) => set({ phase: p }),

  openApp: (id) => get().openWindow(id),

  openWindow: (id) => {
    const z = get().zTop + 1;
    set((s) => ({
      windows: {
        ...s.windows,
        [id]: { ...s.windows[id], open: true, minimized: false, z },
      },
      focused: id,
      zTop: z,
    }));
  },

  closeWindow: (id) =>
    set((s) => ({
      windows: { ...s.windows, [id]: { ...s.windows[id], open: false } },
      focused: s.focused === id ? null : s.focused,
    })),

  focusWindow: (id) => {
    const s = get();
    if (!s.windows[id].open || s.focused === id) {
      if (s.windows[id].minimized) {
        set((st) => ({
          windows: { ...st.windows, [id]: { ...st.windows[id], minimized: false } },
        }));
      }
      return;
    }
    const z = s.zTop + 1;
    set({
      windows: { ...s.windows, [id]: { ...s.windows[id], z, minimized: false } },
      focused: id,
      zTop: z,
    });
  },

  minimizeWindow: (id) =>
    set((s) => ({
      windows: { ...s.windows, [id]: { ...s.windows[id], minimized: true } },
      focused: s.focused === id ? null : s.focused,
    })),

  toggleMaximize: (id) =>
    set((s) => ({
      windows: {
        ...s.windows,
        [id]: { ...s.windows[id], maximized: !s.windows[id].maximized },
      },
    })),

  setGeom: (id, g) =>
    set((s) => ({
      windows: {
        ...s.windows,
        [id]: { ...s.windows[id], geom: { ...s.windows[id].geom, ...g } },
      },
    })),

  pushToast: (t) =>
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id: toastSeq++ }] })),

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),

  setSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    updateSave({ settings: next });
    set({ settings: next });
  },

  addFlag: (f) => {
    if (get().flags.has(f)) return false;
    const next = new Set(get().flags);
    next.add(f);
    updateSave({ flags: [...next] });
    set({ flags: next });
    return true;
  },

  hasFlag: (f) => get().flags.has(f),

  setVaultUnlocked: () => {
    updateSave({ unlockedVault: true });
    set({ vaultUnlocked: true });
  },

  countVaultAttempt: () => {
    const n = get().vaultAttempts + 1;
    updateSave({ vaultAttempts: n });
    set({ vaultAttempts: n });
    return n;
  },

  setOverlayPanel: (p) => set({ overlayPanel: p }),

  setEndingStep: (n) => set({ endingStep: n }),
}));

/* convenience selectors used across the app */
export const useFocused = () => useOS((s) => s.focused);
