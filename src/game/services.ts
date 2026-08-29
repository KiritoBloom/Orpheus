"use client";

import type { AppId, ChatMsg, Email, FsNode, LogEntry, PhotoMeta } from "@/types/game";
import { buildFilesystem } from "@/game/data/filesystem";
import { EMAILS } from "@/game/data/emails";
import { CHAT_MESSAGES, THREADS } from "@/game/data/chatMessages";
import { HISTORY } from "@/game/data/browserHistory";
import { LOGS } from "@/game/data/systemLogs";
import { getPhoto, PHOTOS } from "@/game/data/photos";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   GAME SERVICES — every capability exists exactly once.
   Both the UI and the WebMCP tools call these functions.

   Rule of the codebase: if the UI can do it and the agent can
   do it, the logic lives here and both call it. No tool in
   src/webmcp/register.ts reimplements game logic; no app
   component reimplements a tool. That is what makes WebMCP
   fundamental here rather than bolted on.
   ============================================================ */

const FS: FsNode[] = buildFilesystem();

export function fsList(): FsNode[] {
  return FS;
}
export function fsGet(path: string): FsNode | undefined {
  return FS.find((n) => n.path === path);
}

/** Single visibility predicate for filesystem objects — story flags + vault state. */
export function fsVisible(n: FsNode): boolean {
  const os = useOS.getState();
  if (n.hiddenUntilFlag && !os.flags.has(n.hiddenUntilFlag)) return false;
  if (n.requiresUnlock && !os.vaultUnlocked) return false;
  return true;
}

export function fsChildren(dirPath: string): FsNode[] {
  return FS.filter((n) => n.parent === dirPath && fsVisible(n));
}

/* ---------------- filesystem search — one implementation ---------------- */

export interface FileHit {
  path: string;
  kind: FsNode["kind"];
  modified: string;
  excerpt: string;
  approxLine?: number;
}

/**
 * Search names + readable contents. Used by the WebMCP `search_files` tool,
 * the Terminal `search` verb, and the Evidence board's `request_correlation`
 * declarative form — one predicate, three callers.
 */
export function searchFiles(query: string, opts: { limit?: number; excerptChars?: number } = {}): FileHit[] {
  const limit = opts.limit ?? 25;
  const excerptChars = opts.excerptChars ?? 120;
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FS.filter((n) => {
    if (!fsVisible(n)) return false;
    // sealed containers match on name only — contents must stay opaque
    if (n.encrypted) return n.name.toLowerCase().includes(q);
    return n.name.toLowerCase().includes(q) || (n.content?.toLowerCase().includes(q) ?? false);
  })
    .slice(0, limit)
    .map((n) => {
      const idx = n.content ? n.content.toLowerCase().indexOf(q) : -1;
      const excerpt =
        idx >= 0
          ? n.content!.slice(Math.max(0, idx - 40), idx + 80).replace(/\s+/g, " ").slice(0, excerptChars)
          : "";
      const approxLine = idx >= 0 ? n.content!.slice(0, idx).split("\n").length : undefined;
      return { path: n.path, kind: n.kind, modified: n.modified, excerpt, approxLine };
    });
}

/* ---------------- application navigation ---------------- */

export function openApplication(app: AppId): void {
  const os = useOS.getState();
  if (os.phase !== "desktop") return;
  os.openApp(app);
  sfx.windowOpen();
}

export function focusApplication(app: AppId): void {
  const os = useOS.getState();
  if (!os.windows[app].open) {
    openApplication(app);
    return;
  }
  os.focusWindow(app);
  sfx.click();
}

/* ---------------- document viewer ---------------- */

export function openFile(path: string): { ok: boolean; error?: string } {
  const node = fsGet(path);
  const os = useOS.getState();
  if (!node) return { ok: false, error: `no such file: ${path}` };
  if (node.hiddenUntilFlag && !os.flags.has(node.hiddenUntilFlag))
    return { ok: false, error: "access denied — object not present" };
  if (node.requiresUnlock && !os.vaultUnlocked)
    return { ok: false, error: "file is sealed (vestibule encryption)" };
  if (node.encrypted)
    return {
      ok: false,
      error:
        "AES-256 container — locked. passphrase is three words in a specific order.",
    };

  if (node.kind === "dir") return openDirectory(path);
  if (node.kind === "img" && node.photoId) {
    openPhoto(node.photoId);
    return { ok: true };
  }
  // text-like
  setCurrentDoc(path);
  os.openWindow("textviewer");
  // The viewer may mount after this call; its initial state also reads currentDocPath.
  setTimeout(() => emitDoc({ path }), 0);
  onFileOpened(path);
  return { ok: true };
}

/** extra transient state kept outside zustand typing via module singleton */
let docListener: ((state: { path: string; scrollLine?: number; flashLine?: number; pinnedLine?: number }) => void) | null = null;
export function setDocListener(fn: typeof docListener) {
  docListener = fn;
  return () => {
    if (docListener === fn) docListener = null;
  };
}
function emitDoc(state: { path: string; scrollLine?: number; flashLine?: number; pinnedLine?: number }) {
  docListener?.(state);
}

/**
 * showInDocument — the agent's "look at THIS" primitive.
 * Opens the document (if not already open), scrolls to a line, and *pins*
 * a persistent highlight on that line that stays until the player takes
 * an explicit action (click/scroll/type/close).
 *
 * Accepts either an explicit `line` OR a `query` (resolved to the first
 * match via findTextInDocument). When `query` is used, the tool's return
 * value includes the resolved line so the agent can chain further work.
 */
export function showInDocument(
  path: string,
  opts: { line?: number; query?: string }
): { ok: boolean; error?: string; line?: number; query?: string; resolvedFrom?: "line" | "query"; matches?: number } {
  const node = fsGet(path);
  const os = useOS.getState();
  if (!node || !node.content) return { ok: false, error: `not a readable document: ${path}` };
  const lines = node.content.split("\n");

  // resolve target line
  let line: number;
  let resolvedFrom: "line" | "query";
  let matchCount: number | undefined;
  if (typeof opts.line === "number" && Number.isFinite(opts.line)) {
    line = Math.trunc(opts.line);
    resolvedFrom = "line";
    if (line < 1 || line > lines.length)
      return { ok: false, error: `line ${line} out of range (document has ${lines.length} lines)` };
  } else if (typeof opts.query === "string" && opts.query.trim().length > 0) {
    const found = findTextInDocument(path, opts.query);
    if (!found.matches.length) {
      return { ok: false, error: `no match for "${opts.query}" in ${path}`, query: opts.query };
    }
    line = found.matches[0].line;
    matchCount = found.matches.length;
    resolvedFrom = "query";
  } else {
    return { ok: false, error: "provide either `line` (1-based) or `query` (text to find)" };
  }

  // open or focus the viewer
  if (!os.windows.textviewer.open) {
    const opened = openFile(path);
    if (!opened.ok) return { ok: false, error: opened.error ?? "could not open document" };
  } else {
    os.focusWindow("textviewer");
  }

  // emit with a pinnedLine so the highlight persists
  setTimeout(
    () => emitDoc({ path, scrollLine: line, flashLine: line, pinnedLine: line }),
    60,
  );
  return { ok: true, line, query: opts.query, resolvedFrom, matches: matchCount };
}

/** Called by the viewer when the player takes an action that should
 *  clear the pinned highlight (click, scroll, type, close). */
let docDismissListener: ((p: { path: string; reason: "user-action" | "new-pin" | "close" }) => void) | null = null;
export function setDocDismissListener(fn: typeof docDismissListener) {
  docDismissListener = fn;
  return () => {
    if (docDismissListener === fn) docDismissListener = null;
  };
}
export function dismissPinnedHighlight(reason: "user-action" | "new-pin" | "close"): void {
  docDismissListener?.({ path: currentDocPath, reason });
}

export function findTextInDocument(path: string, query: string): { matches: { line: number; context: string }[]; error?: string } {
  const node = fsGet(path);
  if (!node?.content) return { matches: [], error: `not a readable document: ${path}` };
  const lines = node.content.split("\n");
  const q = query.toLowerCase();
  const matches: { line: number; context: string }[] = [];
  lines.forEach((l, i) => {
    if (l.toLowerCase().includes(q)) {
      matches.push({ line: i + 1, context: l.trim().slice(0, 90) });
    }
  });
  return { matches: matches.slice(0, 20) };
}

export function openDirectory(path: string): { ok: boolean; error?: string } {
  const node = fsGet(path);
  const os = useOS.getState();
  if (!node || node.kind !== "dir") return { ok: false, error: `not a directory: ${path}` };
  if (node.hiddenUntilFlag && !os.flags.has(node.hiddenUntilFlag))
    return { ok: false, error: "object not present" };
  openApplication("files");
  // navigate file manager
  setTimeout(() => filesNavigateBus.emit(path), 50);
  return { ok: true };
}

/* tiny single-channel bus so services can drive React without prop drilling */
class SimpleBus {
  private subs = new Set<(payload: unknown) => void>();
  on(fn: (payload: unknown) => void): () => void {
    this.subs.add(fn);
    return () => { this.subs.delete(fn); };
  }
  emit(payload?: unknown) {
    this.subs.forEach((fn) => fn(payload));
  }
}
export const filesNavigateBus = new SimpleBus();
export const photoFocusBus = new SimpleBus();

export let currentDocPath = "";
export function setCurrentDoc(p: string) {
  currentDocPath = p;
}

/* ---------------- photos ---------------- */

let currentPhotoId = "DSC04821";
export function getCurrentPhotoId() {
  return currentPhotoId;
}

export function openPhoto(photoId: string): void {
  const os = useOS.getState();
  currentPhotoId = photoId;
  os.openWindow("imageviewer");
  // Viewer now syncs via getCurrentPhotoId() in useLayoutEffect — emit synchronously for already-open case
  photoFocusBus.emit(photoId);
  sfx.windowOpen();
  onPhotoViewed(photoId);
}

/** Is this photo reachable right now? (private-backup gating + filesystem flags) */
export function isPhotoAccessible(photoId: string): boolean {
  const meta = getPhoto(photoId);
  if (!meta) return false;
  const os = useOS.getState();
  if (meta.inPrivateBackup && !os.vaultUnlocked) return false;
  const node = FS.find((n) => n.photoId === photoId);
  if (node && node.hiddenUntilFlag && !os.flags.has(node.hiddenUntilFlag)) return false;
  return true;
}

/** Resolve a photo by exact id or partial filename (used by the inspect_photo form). */
export function resolvePhoto(raw: string): PhotoMeta | undefined {
  const q = raw.trim().toLowerCase().replace(/\.(png|jpe?g)$/, "");
  if (!q) return undefined;
  return PHOTOS.find((p) => p.id.toLowerCase() === q) ?? PHOTOS.find((p) => p.filename.toLowerCase().includes(q));
}

/** Where the player should look in a given photo — the agent cannot see pixels, so it points. */
export function photoInspectionHint(photoId: string): string {
  switch (photoId) {
    case "DSC04821":
      return "Hint: window glass, lower half — a figure holds a phone with a reversed badge glint.";
    case "DSC04655":
      return "Hint: a stopped wall clock. Note the minute hand.";
    case "IMG_0022":
      return "Hint: a reminder card photographed through glass.";
    case "IMG_0044":
      return "Hint: a door camera timestamp — bottom-right corner.";
    case "IMG_0103":
      return "Hint: a health-band trace — the line ends mid-beat.";
    default:
      return `Caption: ${getPhoto(photoId)?.caption ?? "no caption"}.`;
  }
}

// cooldown for ARIA's reactive zoom toast — presence, not nagging
let lastAriaZoomToastAt = 0;
/** Zoom detent threshold at which manual inspection counts as "looking closely". */
export const ZOOM_INSPECTION_THRESHOLD = 2.5;

/**
 * Human side of the asymmetry: the player crossed the inspection detent on a
 * photo. Called by the image viewer only — no WebMCP tool can reach this,
 * because the agent cannot zoom. Owns every flag, toast, and co-op beat that
 * manual inspection triggers.
 */
export function notePhotoInspection(photoId: string, zoom: number): void {
  if (zoom < ZOOM_INSPECTION_THRESHOLD) return;
  noteHumanAction(); // the human is inspecting — synchrony rhythm
  onPhotoViewed(photoId, zoom);
  const os = useOS.getState();
  if (photoId === "DSC04821") {
    os.pushToast({ app: "PHOTOS", title: "DSC04821.JPG", body: "Something is reflected in the glass." });
    return;
  }
  if (photoId === "DSC04655") {
    noteWindowHuman(); // 02:13 window — human side (the stopped clock)
    return;
  }
  if (Date.now() - lastAriaZoomToastAt > 180_000) {
    // ARIA reacts when the human goes quiet over a photo — presence, not automation
    lastAriaZoomToastAt = Date.now();
    os.pushToast({
      app: "ARIA",
      title: "ZOOM NOTED",
      body: "You've gone quiet. Describe what you see — I'll find what it connects to.",
    });
  }
}

/**
 * Backs the Photos app's `inspect_photo` declarative form: resolve a photo by
 * id or filename, return machine-readable metadata plus a directional hint.
 * Never returns pixels — the player still has to look.
 */
export function inspectPhoto(raw: string): { ok: boolean; message: string; photoId?: string } {
  const photo = resolvePhoto(raw);
  if (!photo) return { ok: false, message: `no photo matches "${raw}"` };
  if (!isPhotoAccessible(photo.id))
    return { ok: false, message: `${photo.filename} is sealed in /Private/photo_backup — unlock the vestibule first.`, photoId: photo.id };
  const meta = getImageMetadata(photo.id);
  const hint = photoInspectionHint(photo.id);
  return {
    ok: true,
    photoId: photo.id,
    message: `${photo.filename} — ${meta?.exif.dateOriginal ?? "unknown date"} · ${meta?.exif.camera ?? "?"} · ${meta?.exif.gpsLabel ?? "?"}. ${hint}`,
  };
}

let photoListener: ((photoId: string, zoom: number) => void) | null = null;
export function setPhotoListener(fn: typeof photoListener) {
  photoListener = fn;
}
function checkReconstructed() {
  const f = useOS.getState().flags;
  if (f.has("FOUND_0213_LOG") && f.has("SEEN_WATCH_GAP") && f.has("SEEN_DOORCAM")) useOS.getState().addFlag("RECONSTRUCTED_FINAL_HOURS");
}

function onPhotoViewed(photoId: string, zoom = 1) {
  photoListener?.(photoId, zoom);
  // story hooks
  const os = useOS.getState();
  if (photoId === "DSC04821" && zoom >= ZOOM_INSPECTION_THRESHOLD) {
    os.addFlag("FOUND_PHOTO_017");
  }
  if (photoId === "IMG_0022") os.addFlag("FOUND_PRIVATE_HINT");
  if (photoId === "IMG_0044") os.addFlag("SEEN_DOORCAM");
  if (photoId === "IMG_0103") os.addFlag("SEEN_WATCH_GAP");
  if (photoId === "badge_scan" && os.flags.has("FOUND_PHOTO_017")) {
    os.addFlag("DISCOVERED_SURVEILLANCE");
    os.pushToast({
      app: "PHOTOS",
      title: "CORRELATED DETAIL",
      body: "The badge clip matches the reflection and observatory attendee.",
    });
  }
  checkReconstructed();
  checkReconstructionAvailable();
}

export function getImageMetadata(photoId: string): PhotoMeta | undefined {
  const photo = getPhoto(photoId);
  if (!photo) return undefined;
  if (!isPhotoAccessible(photoId)) return undefined;
  useOS.getState().addFlag("DISCOVERED_METADATA");
  return photo;
}

/* ---------------- mail ---------------- */

export type MailIndexItem = Email;

export function listEmails(): Email[] {
  const os = useOS.getState();
  return EMAILS.filter((e) => !(e.hiddenUntilFlag && !os.flags.has(e.hiddenUntilFlag)));
}

/** Search mail across every visible folder by sender, subject, or body. */
export function searchEmails(query: string): { id: string; folder: string; from: string; subject: string; date: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listEmails()
    .filter((e) => [e.from, e.fromEmail, e.subject, e.body].some((f) => f.toLowerCase().includes(q)))
    .map((e) => ({ id: e.id, folder: e.folder, from: e.from, subject: e.subject, date: e.date }));
}
export function getEmail(id: string): Email | undefined {
  return listEmails().find((e) => e.id === id);
}
export function openEmail(id: string): { ok: boolean; error?: string } {
  const em = getEmail(id);
  if (!em) return { ok: false, error: `no such email: ${id}` };
  openApplication("mail");
  setTimeout(() => mailSelectBus.emit(id), 60);
  markEmailRead(id);
  return { ok: true };
}
export const mailSelectBus = new SimpleBus();
export function markEmailRead(id: string) {
  const em = EMAILS.find((e) => e.id === id);
  if (em) em.unread = false;
  useOS.getState().markMailRead(id);
}
export function isMailUnread(id: string): boolean {
  const os = useOS.getState();
  if (os.readMailIds.has(id)) return false;
  const em = EMAILS.find((e) => e.id === id);
  return !!em?.unread;
}

/* ---------------- messages / chat search ---------------- */

/** Story-flag visibility for a chat message or thread (t_observer stays hidden until it arrives). */
export function msgVisible(m: { hiddenUntilFlag?: import("@/types/game").StoryFlag }): boolean {
  return !(m.hiddenUntilFlag && !useOS.getState().flags.has(m.hiddenUntilFlag));
}

/** Every currently visible chat message. */
export function listMessages(): ChatMsg[] {
  return CHAT_MESSAGES.filter(msgVisible);
}

/** Every currently visible thread. */
export function listThreads() {
  return THREADS.filter(msgVisible);
}

export function searchMessages(query: string): { threadId: string; threadName: string; time: string; body: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return listMessages()
    .filter((m) => m.body.toLowerCase().includes(q))
    .map((m) => ({
      threadId: m.threadId,
      threadName: m.threadName,
      time: m.time,
      body: m.body,
    }));
}
export function getMessageThread(threadId: string): { name: string; messages: ChatMsg[] } {
  const t = THREADS.find((x) => x.id === threadId);
  return {
    name: t?.name ?? threadId,
    messages: listMessages().filter((m) => m.threadId === threadId),
  };
}
export function openMessagesThread(threadId: string): { ok: boolean; error?: string } {
  const t = THREADS.find((x) => x.id === threadId);
  if (!t) return { ok: false, error: `no thread: ${threadId}` };
  if (t.hiddenUntilFlag && !useOS.getState().flags.has(t.hiddenUntilFlag)) return { ok: false, error: `no thread: ${threadId}` };
  openApplication("messages");
  setTimeout(() => messagesThreadBus.emit(threadId), 60);
  useOS.getState().markThreadRead(threadId);
  return { ok: true };
}
export const messagesThreadBus = new SimpleBus();
export function markThreadRead(id: string) {
  useOS.getState().markThreadRead(id);
}
export function isThreadUnread(id: string): boolean {
  return !useOS.getState().readThreadIds.has(id);
}

/* ---------------- browser history ---------------- */

export function searchBrowserHistory(query: string) {
  const q = query.toLowerCase();
  return HISTORY.filter(
    (h) => h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q)
  ).map((h) => ({ id: h.id, title: h.title, url: h.url, visitedAt: h.visitedAt }));
}
export function openBrowserEntry(entryId: string): { ok: boolean; error?: string } {
  const entry = HISTORY.find((h) => h.id === entryId);
  if (!entry) return { ok: false, error: `no history entry: ${entryId}` };
  openApplication("browser");
  setTimeout(() => browserNavBus.emit(entry.pageId ?? entry.id), 60);
  if (entry.pageId === "arxiv_withdrawn" || entry.pageId === "obituary_vann" || entryId === "hist_003" || entryId === "hist_007") useOS.getState().addFlag("FOUND_CERN_CONNECTION");
  return { ok: true };
}
export const browserNavBus = new SimpleBus();

/* ---------------- system logs ---------------- */

export function getSystemLogs(filter?: string): LogEntry[] {
  if (!filter) return LOGS;
  const q = filter.toLowerCase();
  return LOGS.filter(
    (l) =>
      l.date.includes(q) ||
      l.time.includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.detail.toLowerCase().includes(q)
  );
}
export function flagLogDiscovery() {
  useOS.getState().addFlag("FOUND_0213_LOG");
  checkReconstructed();
  checkReconstructionAvailable();
}

/* ---------------- correlated timeline ---------------- */

export const DEFAULT_TIMELINE_WINDOW = "01:45-02:40";

export interface TimelineItem {
  time: string;
  source: "log" | "photo" | "message";
  detail: string;
  anomaly: boolean;
}

export interface TimelineResult {
  window: string;
  count: number;
  totalInWindow: number;
  has0213Cluster: boolean;
  timeline: TimelineItem[];
}

/**
 * Merge system logs, photo EXIF timestamps, and message traffic into one
 * chronology for a `HH:MM-HH:MM` window. This is the correlation a human
 * would need five open applications to assemble by hand — which is exactly
 * why it belongs to the agent side of the desk.
 */
export function getTimeline(window = DEFAULT_TIMELINE_WINDOW, opts: { limit?: number; detailChars?: number } = {}): TimelineResult {
  const limit = opts.limit ?? 30;
  const detailChars = opts.detailChars ?? 120;
  const w = window.trim() || DEFAULT_TIMELINE_WINDOW;

  let startMin = 105; // 01:45
  let endMin = 160; // 02:40
  const parsed = w.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (parsed) {
    startMin = parseInt(parsed[1], 10) * 60 + parseInt(parsed[2], 10);
    endMin = parseInt(parsed[3], 10) * 60 + parseInt(parsed[4], 10);
    if (endMin < startMin) endMin += 24 * 60; // window crosses midnight
  }
  const toMin = (t: string) => {
    const p = t.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  };
  const inWindow = (t: string) => {
    const mm = toMin(t.slice(0, 5));
    if (Number.isNaN(mm)) return false;
    if (endMin >= 24 * 60) return mm >= startMin || mm <= endMin - 24 * 60;
    return mm >= startMin && mm <= endMin;
  };
  const clip = (s: string) => s.replace(/\s+/g, " ").slice(0, detailChars);

  const items: TimelineItem[] = [];
  for (const l of LOGS) {
    if (!inWindow(l.time)) continue;
    items.push({
      time: `${l.date} ${l.time}`,
      source: "log",
      detail: clip(l.detail),
      anomaly: l.time.startsWith("02:13") || l.severity === "alert" || l.detail.toLowerCase().includes("gait mismatch"),
    });
  }
  for (const p of PHOTOS) {
    const t = p.exif.dateOriginal.slice(11, 19); // HH:MM:SS
    if (!t || !inWindow(t)) continue;
    items.push({
      time: p.exif.dateOriginal.replace("T", " "),
      source: "photo",
      detail: clip(`${p.id} ${p.filename} — ${p.caption}`),
      anomaly: p.id === "IMG_0044" || p.id === "IMG_0103",
    });
  }
  for (const m of listMessages()) {
    const timePart = m.time.includes(" ") ? m.time.split(" ")[1] : m.time;
    if (!inWindow(timePart)) continue;
    items.push({ time: m.time, source: "message", detail: clip(`${m.threadName}: ${m.body}`), anomaly: false });
  }
  items.sort((a, b) => a.time.localeCompare(b.time));

  const timeline = items.slice(0, limit);
  return {
    window: w,
    count: timeline.length,
    totalInWindow: items.length,
    has0213Cluster: timeline.some((x) => x.time.includes("02:13")),
    timeline,
  };
}

/* ---------------- cross-source correlation (declarative request_correlation) ---------------- */

/**
 * One term, every corpus the agent can read. Backs the Evidence board's
 * `request_correlation` declarative form; the imperative equivalents are
 * `search_files` + `search_messages`.
 */
export function correlateTerm(query: string): { query: string; files: number; messages: number; emails: number; summary: string } {
  const q = query.trim();
  const files = searchFiles(q).length;
  const messages = searchMessages(q).length;
  const emails = searchEmails(q).length;
  return {
    query: q,
    files,
    messages,
    emails,
    summary: `${files} file hit(s) · ${messages} message hit(s) · ${emails} mail hit(s)`,
  };
}

/* ---------------- vault ---------------- */

export const VAULT_SEQUENCE = ["lantern", "orpheus", "echo"];

export function attemptVault(words: string[]): { result: "success" | "decoy" | "fail"; message: string } {
  const os = useOS.getState();
  const norm = words.map((w) => w.toLowerCase().trim());
  const attempts = os.countVaultAttempt();
  if (
    norm.length >= 3 &&
    norm.slice(0, 3).every((w, i) => w === VAULT_SEQUENCE[i])
  ) {
    os.setVaultUnlocked();
    os.addFlag("VAULT_OPENED");
    os.addFlag("FOUND_HIDDEN_ARCHIVE");
    checkReconstructionAvailable();
    return { result: "success", message: "CHECKSUM OK — vestibule archive decrypted.\nNew objects available under /Private." };
  }
  // wrong sequence → decoy archive reveals itself
  os.addFlag("VAULT_DECOY");
  if (attempts === 1) {
    os.pushToast({ app: "TERMINAL", title: "HINT", body: "Light → name → echo. One was photographed on his desk." });
  } else if (attempts === 2) {
    os.pushToast({ app: "TERMINAL", title: "HINT", body: "Order matters. He also wore one on a brass plate — middle slot is worn smooth." });
  }
  // progressive recovery hints — a stuck investigator is guided, never stalled
  const hints: string[] = [];
  if (attempts >= 4) hints.push("RECOVERY SECTOR NOTE: the first word is what you light a dark room with.");
  if (attempts >= 7) hints.push("RECOVERY SECTOR NOTE: FIRST WORD CONFIRMED — 'lantern'. Two remain.");
  if (attempts >= 10) hints.push("RECOVERY SECTOR NOTE: SECOND WORD — the name he gave the research itself. The third is what remains when a voice is gone.");
  sfx.error();
  return {
    result: "decoy",
    message:
      "CHECKSUM MISMATCH — sequence rejected.\nAdjacent recovery sector mounted instead: /Private/_fragments_recovered\n(one wrong key does not destroy anything here. Daniel was gentle with strangers.)" +
      (hints.length ? "\n\n" + hints.join("\n") : ""),
  };
}

/* ---------------- the 02:13 window — time-boxed co-op set piece ---------------- */
// After the vault, the machine keeps Daniel's habits: 02:13 recurs. For 90 seconds the
// workstation becomes observable (Keep-Talking-style: BOTH sides must act inside the
// window — human eyes on the stopped clock, ARIA in the logs — to synchronize).

const OBS_WINDOW_MS = 90_000;
const OBS_REARM_MS = 150_000;

export function isObsWindowOpen(): boolean {
  return useOS.getState().obsWindow.open;
}

/** Called on a short interval (GameRoot) — opens, closes, and re-arms the window. */
export function tickObservabilityWindow(): void {
  const os = useOS.getState();
  if (os.phase !== "desktop") return;
  if (!os.vaultUnlocked || os.flags.has("WINDOW_SYNCHRONIZED")) return;
  const now = Date.now();
  if (os.obsWindow.open) {
    if (now >= os.obsWindow.endsAt) closeObsWindow(false);
    return;
  }
  if (os.obsWindow.lastClosedAt === 0 || now - os.obsWindow.lastClosedAt >= OBS_REARM_MS) openObsWindow();
}

function openObsWindow() {
  useOS.setState((s) => ({ obsWindow: { open: true, endsAt: Date.now() + OBS_WINDOW_MS, lastClosedAt: s.obsWindow.lastClosedAt } }));
  useOS.getState().pushToast({
    app: "SYSTEM",
    title: "02:13 RECURS — WINDOW OPEN",
    body: "The room it is not looking at can be seen. 90 seconds: open the study photo and zoom into the wall clock — and have ARIA pull the logs from that minute. Together, inside the window.",
  });
  sfx.deepThud();
  window.dispatchEvent(new CustomEvent("orpheus:event-flash", { detail: { tone: "hot" } }));
  checkWindowSync(); // both sides may have acted before this window opened
}

function closeObsWindow(synced: boolean) {
  useOS.setState({ obsWindow: { open: false, endsAt: 0, lastClosedAt: Date.now() } });
  if (!synced) {
    useOS.getState().pushToast({ app: "SYSTEM", title: "WINDOW CLOSED", body: "02:13 comes again. It always does." });
  }
}

/** Human side — the player zooms the stopped clock (DSC04655) while the window holds. */
export function noteWindowHuman(): void {
  const os = useOS.getState();
  if (!os.obsWindow.open || os.flags.has("WINDOW_HUMAN")) return;
  os.addFlag("WINDOW_HUMAN");
  os.pushToast({ app: "PHOTOS", title: "THE CLOCK SAW YOU", body: "02:13:00 — both hands stopped mid-beat. Now have ARIA pull the logs from the same minute, while the window holds." });
  checkWindowSync();
}

/** Agent side — ARIA reads the logs during the window (get_system_logs). */
export function noteWindowAgent(): void {
  const os = useOS.getState();
  if (!os.obsWindow.open || os.flags.has("WINDOW_AGENT")) return;
  os.addFlag("WINDOW_AGENT");
  checkWindowSync();
}

function checkWindowSync() {
  const os = useOS.getState();
  if (!os.obsWindow.open) return;
  if (os.flags.has("WINDOW_HUMAN") && os.flags.has("WINDOW_AGENT")) {
    os.addFlag("WINDOW_SYNCHRONIZED");
    closeObsWindow(true);
    os.pushToast({
      app: "ARIA",
      title: "SYNCHRONIZED — 47 SECONDS",
      body: "Your eyes on the clock, my query in the logs — for 47 seconds we watched the same window. Something was written to /Private.",
    });
    sfx.chime();
    checkReconstructionAvailable();
    // the unexplained thread pulses a second time — only if it ever arrived
    if (os.flags.has("MYSTERY_MESSAGE") && !os.flags.has("MYSTERY_MESSAGE_2")) {
      os.addFlag("MYSTERY_MESSAGE_2");
      os.pushToast({
        app: "MESSAGES",
        title: "NEW MESSAGE — NO SENDER",
        body: "A second line has arrived in the thread that has no source. It answers nothing. It was waiting for this.",
      });
      sfx.mysteryArrive();
      window.dispatchEvent(new CustomEvent("orpheus:event-flash", { detail: { tone: "hot" } }));
    }
  }
}

/* ---------------- synchrony — reward the handoff rhythm ---------------- */
// The core loop is human-looks → agent-searches. Alternating clean handoffs inside
// 45 seconds build a SYNCHRONY streak — the game quietly celebrates real collaboration.

let lastSyncToastAt = 0;

export function noteAgentAction(): void {
  noteSync("agent");
}

export function noteHumanAction(): void {
  noteSync("human");
}

function noteSync(actor: "human" | "agent") {
  const os = useOS.getState();
  const now = Date.now();
  const streak =
    os.syncLastActor && os.syncLastActor !== actor && now - os.syncLastAt < 45_000
      ? os.syncStreak + 1
      : 1;
  useOS.setState({ syncLastActor: actor, syncLastAt: now, syncStreak: streak });
  if (streak >= 4 && streak % 2 === 0 && now - lastSyncToastAt > 90_000) {
    lastSyncToastAt = now;
    os.pushToast({
      app: "ARIA",
      title: `SYNCHRONY ×${streak}`,
      body: streak >= 6
        ? "We're finishing each other's searches now. Keep the handoff going."
        : "Clean handoffs — you look, I search, you decide. This is what the desk is for.",
    });
  }
}

/* ---------------- evidence ---------------- */

import { EVIDENCE as EVIDENCE_DATA } from "@/game/data/evidence";
import { useInvestigation } from "@/game/state/investigationStore";

export function recordEvidenceById(id: string): { ok: boolean; error?: string } {
  const inv = useInvestigation.getState();
  if (!EVIDENCE_DATA.some((e) => e.id === id)) return { ok: false, error: `unknown evidence id: ${id}` };
  const added = inv.recordEvidence(id);
  return added ? { ok: true } : { ok: false, error: "already recorded" };
}
export function highlightEvidenceById(id: string): { ok: boolean; error?: string } {
  const inv = useInvestigation.getState();
  if (!inv.evidenceIds.has(id)) return { ok: false, error: `evidence not yet discovered: ${id}` };
  inv.highlightEvidence(id);
  openApplication("evidence");
  return { ok: true };
}
export function getCaseEvidence(): { id: string; section: string; title: string; summary: string; sources: string[] }[] {
  const inv = useInvestigation.getState();
  return inv
    .getVisibleEvidence()
    .map((e) => ({ id: e.id, section: e.section, title: e.title, summary: e.summary, sources: e.sources }));
}
export function openEvidenceBoard(): void {
  openApplication("evidence");
}

/* ---------------- story hooks on file reads ---------------- */

export function onFileOpened(path: string) {
  const os = useOS.getState();
  if (path === "/System/FIELD_GUIDE.txt") os.addFlag("FOUND_GUIDE");
  if (path.startsWith("/Research/ORPHEUS")) os.addFlag("DISCOVERED_ORPHEUS");
  if (path.startsWith("/Research/ORPHEUS/private")) os.addFlag("FOUND_PRIVATE_HINT");
  if (path === "/Research/ORPHEUS/private/haldane_correspondence.txt") os.addFlag("IDENTIFIED_CONTACT");
  if (path === "/Projects/old_cern/memoir.txt") os.addFlag("FOUND_CERN_CONNECTION");
  if (path === "/Private/aria_directive.sys" && os.vaultUnlocked) os.addFlag("DISCOVERED_ARIA_DIRECTIVE");
  if (path === "/Private/vestibule_decrypted.txt") {
    os.addFlag("VAULT_OPENED");
    os.addFlag("FOUND_HIDDEN_ARCHIVE");
  }
  checkReconstructed();
  checkReconstructionAvailable();
}

export function markAgentCollaboration() {
  const os = useOS.getState();
  const first = !os.flags.has("COLLABORATED_WITH_ARIA");
  os.addFlag("COLLABORATED_WITH_ARIA");
  if (first) {
    os.pushToast({ app: "ARIA", title: "LINK ESTABLISHED", body: "Machine-readable search complete — evidence correlation active. Keep describing what you see." });
    sfx.chime();
  }
  checkReconstructionAvailable();
}

/* ---------------- case reconstruction gate ---------------- */

/** The six investigative milestones; any four unlock reconstruction. */
export const RECONSTRUCTION_MILESTONES: { flag: import("@/types/game").StoryFlag; label: string }[] = [
  { flag: "DISCOVERED_ORPHEUS", label: "ORPHEUS research read" },
  { flag: "FOUND_0213_LOG", label: "02:13 log cluster found" },
  { flag: "IDENTIFIED_CONTACT", label: "the visitor identified" },
  { flag: "DISCOVERED_SURVEILLANCE", label: "surveillance correlated" },
  { flag: "VAULT_OPENED", label: "vestibule decrypted" },
  { flag: "DISCOVERED_METADATA", label: "photo metadata surfaced" },
];
export const RECONSTRUCTION_REQUIRED = 4;

export interface ReconstructionProgress {
  /** milestones reached, out of RECONSTRUCTION_MILESTONES.length */
  reached: number;
  required: number;
  remaining: number;
  /** true once the agent has performed at least one machine-readable correlation */
  collaborated: boolean;
  available: boolean;
  missing: string[];
}

/** What still stands between the player and closing the case. */
export function reconstructionProgress(): ReconstructionProgress {
  const os = useOS.getState();
  const reachedItems = RECONSTRUCTION_MILESTONES.filter((m) => os.flags.has(m.flag));
  const reached = reachedItems.length;
  const collaborated = os.flags.has("COLLABORATED_WITH_ARIA");
  return {
    reached,
    required: RECONSTRUCTION_REQUIRED,
    remaining: Math.max(0, RECONSTRUCTION_REQUIRED - reached),
    collaborated,
    available: os.flags.has("CASE_RECONSTRUCTION_AVAILABLE"),
    missing: RECONSTRUCTION_MILESTONES.filter((m) => !os.flags.has(m.flag)).map((m) => m.label),
  };
}

export function checkReconstructionAvailable() {
  const p = reconstructionProgress();
  // Without ARIA the case cannot be closed — this is the WebMCP demonstration
  // gate: at least one machine-readable correlation must have run through a tool.
  if (!p.collaborated) return;
  if (p.reached >= RECONSTRUCTION_REQUIRED) useOS.getState().addFlag("CASE_RECONSTRUCTION_AVAILABLE");
}
