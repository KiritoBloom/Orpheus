/* ============================================================
   ORPHEUS — core game types
   ============================================================ */

export type AppId =
  | "files"
  | "mail"
  | "messages"
  | "photos"
  | "browser"
  | "terminal"
  | "systemlog"
  | "evidence";

export const ALL_APPS: AppId[] = [
  "files",
  "mail",
  "messages",
  "photos",
  "browser",
  "terminal",
  "systemlog",
  "evidence",
];

export const APP_LABELS: Record<AppId, string> = {
  files: "FILES",
  mail: "MAIL",
  messages: "MESSAGES",
  photos: "PHOTOS",
  browser: "BROWSER",
  terminal: "TERMINAL",
  systemlog: "SYSTEM LOG",
  evidence: "EVIDENCE",
};

/* ---------- filesystem ---------- */

export type FileKind = "txt" | "csv" | "pdf" | "enc" | "sys" | "img" | "dir";

export interface FsNode {
  path: string; // "/Research/ORPHEUS/anomaly_notes.txt"
  name: string;
  kind: FileKind;
  parent: string | null; // parent dir path, null for root
  sizeKb: number;
  modified: string; // ISO-ish fictional timestamp
  /** text content for txt/csv/sys/pdf-extract files */
  content?: string;
  /** photo id if kind === img */
  photoId?: string;
  /** hidden until this story flag is set */
  hiddenUntilFlag?: StoryFlag;
  /** locked until vault opened */
  encrypted?: boolean;
  /** only visible after unlock (decrypted copies) */
  requiresUnlock?: boolean;
}

/* ---------- email ---------- */

export type MailFolder = "inbox" | "sent" | "drafts" | "archive" | "trash";

export interface Email {
  id: string; // "mail_001"
  folder: MailFolder;
  from: string;
  fromEmail: string;
  to: string;
  date: string; // fictional ISO
  subject: string;
  body: string;
  attachments?: { name: string; path?: string }[];
  unread?: boolean;
  hiddenUntilFlag?: StoryFlag;
}

/* ---------- daniel's chat messages ---------- */

export interface ChatMsg {
  id: string;
  threadId: string;
  threadName: string;
  outgoing: boolean; // true = sent by Daniel
  time: string;
  body: string;
  hiddenUntilFlag?: StoryFlag;
}

/* ---------- photos ---------- */

export interface PhotoMeta {
  id: string; // "DSC04821"
  filename: string; // "DSC04821.JPG"
  caption: string;
  width: number;
  height: number;
  /** fields the PLAYER can see in the viewer */
  visibleDate?: string;
  /** full EXIF-style metadata — AI-only until surfaced */
  exif: {
    dateOriginal: string;
    dateModified: string;
    camera: string;
    gps?: string;
    gpsLabel?: string;
    software?: string;
    orientation: string;
    fileSizeMb: number;
    hash: string;
    note?: string;
  };
  /** set when the player first opens it */
  inPrivateBackup?: boolean;
}

/* ---------- browser history ---------- */

export interface HistoryEntry {
  id: string; // "hist_001"
  title: string;
  url: string;
  visitedAt: string;
  pageId?: string; // cached page key
  hiddenUntilFlag?: StoryFlag;
}

export interface CachedPage {
  id: string;
  siteTitle: string;
  url: string;
  renderKind:
    | "kestrel-home"
    | "kestrel-program"
    | "kestrel-people"
    | "kestrel-contact"
    | "forum-thread"
    | "arxiv"
    | "obituary"
    | "observatory"
    | "nist"
    | "homelock-docs"
    | "manpage"
    | "recipe"
    | "medical"
    | "parking"
    | "search-results"
    | "weather"
    | "local-file"
    | "generic";
  body: string[]; // paragraphs
}

/* ---------- system logs ---------- */

export interface LogEntry {
  id: string;
  date: string; // "2026-02-11"
  time: string; // "02:13:07"
  category:
    | "LOGIN"
    | "DEVICE"
    | "FILE"
    | "NETWORK"
    | "APP"
    | "DELETE"
    | "POWER"
    | "SECURITY"
    | "SYSTEM";
  severity: "info" | "warn" | "alert";
  detail: string;
}

/* ---------- evidence board ---------- */

export type EvidenceSection = "people" | "events" | "locations" | "documents" | "hypotheses";

export interface EvidenceItem {
  id: string; // "ev_013"
  section: EvidenceSection;
  title: string;
  summary: string;
  sources: string[]; // human-readable refs
  autoUnlockFlag?: StoryFlag; // discovered automatically when flag set
  confidence?: "low" | "medium" | "high";
}

/* ---------- story flags ---------- */

export type StoryFlag =
  | "INTRO_COMPLETE"
  | "MET_ARIA"
  | "FOUND_GUIDE"
  | "FOUND_PRIVATE_HINT"
  | "FOUND_PHOTO_017"
  | "DISCOVERED_METADATA"
  | "DISCOVERED_ORPHEUS"
  | "FOUND_0213_LOG"
  | "SEEN_WATCH_GAP"
  | "SEEN_DOORCAM"
  | "FOUND_CERN_CONNECTION"
  | "IDENTIFIED_CONTACT"
  | "DISCOVERED_SURVEILLANCE"
  | "VAULT_OPENED"
  | "VAULT_DECOY"
  | "FOUND_HIDDEN_ARCHIVE"
  | "DISCOVERED_ARIA_DIRECTIVE"
  | "MYSTERY_MESSAGE"
  | "RECONSTRUCTED_FINAL_HOURS"
  | "CASE_RECONSTRUCTION_AVAILABLE"
  | "CASE_COMPLETE"
  | "COLLABORATED_WITH_ARIA"
  | "WINDOW_HUMAN"
  | "WINDOW_AGENT"
  | "WINDOW_SYNCHRONIZED";

/* ---------- agent status ---------- */

export type AriaStatusState = "idle" | "reading" | "investigating" | "responding";

/* ---------- windows ---------- */

export type WinId = AppId | "textviewer" | "imageviewer";

export interface WinGeom {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WinState {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  z: number;
  geom: WinGeom;
}

/* ---------- toasts ---------- */

export interface Toast {
  id: number;
  app: string;
  title: string;
  body?: string;
}

/* ---------- settings ---------- */

export interface Settings {
  crt: boolean;
  sound: boolean;
  reducedMotion: boolean;
  textScale: "md" | "lg";
}
