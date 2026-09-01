"use client";

import type { AppId, ChatMsg, Email, FsNode, LogEntry, PhotoMeta, StoryFlag } from "@/types/game";
import { activeCorpus } from "@/game/data/corpus";
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

   Second rule: no function in this file contains a string that
   belongs to one investigation. Documents, photos, flags, and
   the rules connecting them are read from activeCorpus()
   (src/game/data/corpus.ts). Swapping the corpus swaps the
   case; the 25 tools do not change.
   ============================================================ */

function fs(): FsNode[] {
  return activeCorpus().filesystem;
}

export function fsList(): FsNode[] {
  return fs();
}
export function fsGet(path: string): FsNode | undefined {
  return fs().find((n) => n.path === path);
}

/** Single visibility predicate for filesystem objects — story flags + vault state. */
export function fsVisible(n: FsNode): boolean {
  const os = useOS.getState();
  if (n.hiddenUntilFlag && !os.flags.has(n.hiddenUntilFlag)) return false;
  if (n.requiresUnlock && !os.vaultUnlocked) return false;
  return true;
}

export function fsChildren(dirPath: string): FsNode[] {
  return fs().filter((n) => n.parent === dirPath && fsVisible(n));
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
  return fs().filter((n) => {
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
    return { ok: false, error: activeCorpus().vaultUi.sealedMessage };
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

function getPhoto(id: string): PhotoMeta | undefined {
  return activeCorpus().photos.find((p) => p.id === id);
}

let currentPhotoId: string | null = null;
export function getCurrentPhotoId() {
  if (!currentPhotoId) currentPhotoId = activeCorpus().defaultPhotoId;
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
  const node = fs().find((n) => n.photoId === photoId);
  if (node && node.hiddenUntilFlag && !os.flags.has(node.hiddenUntilFlag)) return false;
  return true;
}

/** Resolve a photo by exact id or partial filename (used by the inspect_photo form). */
export function resolvePhoto(raw: string): PhotoMeta | undefined {
  const q = raw.trim().toLowerCase().replace(/\.(png|jpe?g)$/, "");
  if (!q) return undefined;
  const photos = activeCorpus().photos;
  return photos.find((p) => p.id.toLowerCase() === q) ?? photos.find((p) => p.filename.toLowerCase().includes(q));
}

/** Where the player should look in a given photo — the agent cannot see pixels, so it points. */
export function photoInspectionHint(photoId: string): string {
  const hint = activeCorpus().inspectionHints[photoId];
  if (hint) return hint;
  return `Caption: ${getPhoto(photoId)?.caption ?? "no caption"}.`;
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
  const corpus = activeCorpus();

  const toast = corpus.inspectionToasts[photoId];
  if (toast) {
    os.pushToast({ app: "PHOTOS", title: toast.title, body: toast.body });
    return;
  }
  if (corpus.syncWindow?.photoId === photoId) {
    noteWindowHuman(); // time-boxed set piece — human side
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
  if (!isPhotoAccessible(photo.id)) {
    const vault = activeCorpus().vaultUi;
    return { ok: false, message: `${photo.filename} is sealed in ${vault.revealedPath} — ${vault.sealedMessage}.`, photoId: photo.id };
  }
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
  const os = useOS.getState();
  for (const rule of activeCorpus().derivedFlags) {
    if (rule.requires.every((f) => os.flags.has(f))) os.addFlag(rule.flag);
  }
}

function onPhotoViewed(photoId: string, zoom = 1) {
  photoListener?.(photoId, zoom);
  // story hooks — declared by the corpus, applied here
  const os = useOS.getState();
  for (const rule of activeCorpus().photoFlags) {
    if (rule.photoId !== photoId) continue;
    if (rule.requiresZoom && zoom < ZOOM_INSPECTION_THRESHOLD) continue;
    if (rule.requiresFlag && !os.flags.has(rule.requiresFlag)) continue;
    const already = os.flags.has(rule.flag);
    os.addFlag(rule.flag);
    if (rule.toast && !already) {
      os.pushToast({ app: "PHOTOS", title: rule.toast.title, body: rule.toast.body });
    }
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
  return activeCorpus().emails.filter((e) => !(e.hiddenUntilFlag && !os.flags.has(e.hiddenUntilFlag)));
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
  const em = activeCorpus().emails.find((e) => e.id === id);
  if (em) em.unread = false;
  useOS.getState().markMailRead(id);
}
export function isMailUnread(id: string): boolean {
  const os = useOS.getState();
  if (os.readMailIds.has(id)) return false;
  const em = activeCorpus().emails.find((e) => e.id === id);
  return !!em?.unread;
}

/* ---------------- messages / chat search ---------------- */

/** Story-flag visibility for a chat message or thread (t_observer stays hidden until it arrives). */
export function msgVisible(m: { hiddenUntilFlag?: StoryFlag }): boolean {
  return !(m.hiddenUntilFlag && !useOS.getState().flags.has(m.hiddenUntilFlag));
}

/** Every currently visible chat message. */
export function listMessages(): ChatMsg[] {
  return activeCorpus().messages.filter(msgVisible);
}

/** Every currently visible thread. */
export function listThreads() {
  return activeCorpus().threads.filter(msgVisible);
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
  const t = activeCorpus().threads.find((x) => x.id === threadId);
  return {
    name: t?.name ?? threadId,
    messages: listMessages().filter((m) => m.threadId === threadId),
  };
}
export function openMessagesThread(threadId: string): { ok: boolean; error?: string } {
  const t = activeCorpus().threads.find((x) => x.id === threadId);
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
  return activeCorpus()
    .history.filter((h) => h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q))
    .map((h) => ({ id: h.id, title: h.title, url: h.url, visitedAt: h.visitedAt }));
}
export function openBrowserEntry(entryId: string): { ok: boolean; error?: string } {
  const corpus = activeCorpus();
  const entry = corpus.history.find((h) => h.id === entryId);
  if (!entry) return { ok: false, error: `no history entry: ${entryId}` };
  openApplication("browser");
  setTimeout(() => browserNavBus.emit(entry.pageId ?? entry.id), 60);
  const os = useOS.getState();
  for (const rule of corpus.historyFlags) {
    if (rule.id === entry.id || rule.id === entry.pageId) os.addFlag(rule.flag);
  }
  return { ok: true };
}
export const browserNavBus = new SimpleBus();

/* ---------------- system logs ---------------- */

export function getSystemLogs(filter?: string): LogEntry[] {
  const logs = activeCorpus().logs;
  if (!filter) return logs;
  const q = filter.toLowerCase();
  return logs.filter(
    (l) =>
      l.date.includes(q) ||
      l.time.includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.detail.toLowerCase().includes(q)
  );
}
export function flagLogDiscovery() {
  useOS.getState().addFlag(activeCorpus().logDiscoveryFlag);
  checkReconstructed();
  checkReconstructionAvailable();
}

/**
 * The agent side of a log scan. Called with whatever `getSystemLogs` returned:
 * if the result reached the corpus's anomaly cluster, the milestone is granted
 * and the agent's half of the synchrony window is registered.
 *
 * Lives here so the tool layer does not need to know which timestamp matters.
 */
export function noteAgentLogScan(logs: LogEntry[]): boolean {
  const markers = activeCorpus().anomalyMarkers;
  const reached = logs.some((l) =>
    markers.some((m) => l.time.startsWith(m) || l.detail.toLowerCase().includes(m.toLowerCase()))
  );
  if (!reached) return false;
  flagLogDiscovery();
  noteWindowAgent();
  return true;
}

/* ---------------- correlated timeline ---------------- */

/** Kept as a named export for callers that want the corpus default. */
export function defaultTimelineWindow(): string {
  return activeCorpus().defaultTimelineWindow;
}

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
export function getTimeline(window?: string, opts: { limit?: number; detailChars?: number } = {}): TimelineResult {
  const corpus = activeCorpus();
  const limit = opts.limit ?? 30;
  const detailChars = opts.detailChars ?? 120;
  const fallback = corpus.defaultTimelineWindow;
  const w = (window ?? fallback).trim() || fallback;

  const parseWindow = (s: string) => {
    const m = s.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const a = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    let b = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
    if (b < a) b += 24 * 60;
    return { startMin: a, endMin: b };
  };
  const parsed = parseWindow(w) ?? parseWindow(fallback) ?? { startMin: 105, endMin: 160 } as const;
  const { startMin, endMin } = parsed;
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
  for (const l of corpus.logs) {
    if (!inWindow(l.time)) continue;
    const detail = l.detail.toLowerCase();
    items.push({
      time: `${l.date} ${l.time}`,
      source: "log",
      detail: clip(l.detail),
      anomaly:
        l.severity === "alert" ||
        corpus.anomalyMarkers.some((m) => l.time.startsWith(m) || detail.includes(m.toLowerCase())),
    });
  }
  for (const p of corpus.photos) {
    const t = p.exif.dateOriginal.slice(11, 19); // HH:MM:SS
    if (!t || !inWindow(t)) continue;
    items.push({
      time: p.exif.dateOriginal.replace("T", " "),
      source: "photo",
      detail: clip(`${p.id} ${p.filename} — ${p.caption}`),
      anomaly: corpus.anomalyPhotoIds.includes(p.id),
    });
  }
  for (const m of listMessages()) {
    let timePart = m.time.includes(" ") ? m.time.split(" ")[1] : m.time;
    // Apollo messages use GET HH:MM:SS (e.g. "055:52:58") — convert to UTC HH:MM via range zero 19:13
    if (/^\d{3}:\d{2}:\d{2}/.test(timePart)) {
      const [gh, gm] = timePart.split(":").map(Number);
      const baseMin = 19 * 60 + 13;
      const utcMin = (baseMin + gh * 60 + gm) % (24 * 60);
      timePart = `${String(Math.floor(utcMin / 60)).padStart(2, "0")}:${String(utcMin % 60).padStart(2, "0")}:00`;
    }
    if (!inWindow(timePart)) continue;
    items.push({ time: m.time, source: "message", detail: clip(`${m.threadName}: ${m.body}`), anomaly: false });
  }
  items.sort((a, b) => a.time.localeCompare(b.time));

  const timeline = items.slice(0, limit);
  return {
    window: w,
    count: timeline.length,
    totalInWindow: items.length,
    has0213Cluster: timeline.some((x) => corpus.anomalyMarkers.some((m) => x.time.includes(m) || x.detail.toLowerCase().includes(m.toLowerCase()))),
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

export function attemptVault(words: string[]): { result: "success" | "decoy" | "fail"; message: string } {
  const os = useOS.getState();
  const vault = activeCorpus().vault;
  if (!vault) return { result: "fail", message: "no sealed container on this workstation." };
  const seq = vault.sequence;
  const norm = words.map((w) => w.toLowerCase().trim());
  const attempts = os.countVaultAttempt();
  if (norm.length >= seq.length && seq.every((w, i) => norm[i] === w)) {
    os.setVaultUnlocked();
    os.addFlag("VAULT_OPENED");
    os.addFlag("FOUND_HIDDEN_ARCHIVE");
    checkReconstructionAvailable();
    return { result: "success", message: vault.successMessage };
  }
  // wrong sequence → decoy archive reveals itself
  os.addFlag("VAULT_DECOY");
  for (const hint of vault.attemptHints) {
    if (attempts === hint.after) os.pushToast({ app: "TERMINAL", title: hint.title, body: hint.body });
  }
  // progressive recovery hints — a stuck investigator is guided, never stalled
  const hints = vault.recoveryHints.filter((h) => attempts >= h.after).map((h) => h.note);
  sfx.error();
  return {
    result: "decoy",
    message: vault.failureMessage + (hints.length ? "\n\n" + hints.join("\n") : ""),
  };
}

/* ---------------- the synchrony window — time-boxed co-op set piece ---------------- */
// After the seal opens, the workstation becomes briefly observable (Keep-Talking-style:
// BOTH sides must act inside the window — human eyes on the visual anomaly, the agent in
// the logs — to synchronize). Timings, target photo and copy come from the corpus.

function syncWindowCfg() {
  return activeCorpus().syncWindow;
}

export function isObsWindowOpen(): boolean {
  return useOS.getState().obsWindow.open;
}

/**
 * Arm the window to open `inSeconds` from now instead of waiting a full re-arm
 * period. Used only by the `?demo=` entry points (src/game/demo.ts) so the set
 * piece can be reached — and recorded — without playing to the seal first.
 */
export function armObservabilityWindow(inSeconds = 20): void {
  const cfg = syncWindowCfg();
  if (!cfg) return;
  const wait = Math.max(0, cfg.rearmMs - Math.max(0, inSeconds) * 1000);
  useOS.setState({ obsWindow: { open: false, endsAt: 0, lastClosedAt: Date.now() - wait } });
}

/** Called on a short interval (GameRoot) — opens, closes, and re-arms the window. */
export function tickObservabilityWindow(): void {
  const cfg = syncWindowCfg();
  if (!cfg) return;
  const os = useOS.getState();
  if (os.phase !== "desktop") return;
  if (!os.vaultUnlocked || os.flags.has(cfg.syncedFlag)) return;
  const now = Date.now();
  if (os.obsWindow.open) {
    if (now >= os.obsWindow.endsAt) closeObsWindow(false);
    return;
  }
  if (os.obsWindow.lastClosedAt === 0 || now - os.obsWindow.lastClosedAt >= cfg.rearmMs) openObsWindow();
}

function openObsWindow() {
  const cfg = syncWindowCfg();
  if (!cfg) return;
  useOS.setState((s) => ({ obsWindow: { open: true, endsAt: Date.now() + cfg.openMs, lastClosedAt: s.obsWindow.lastClosedAt } }));
  useOS.getState().pushToast({ app: "SYSTEM", ...cfg.openToast });
  sfx.deepThud();
  window.dispatchEvent(new CustomEvent("orpheus:event-flash", { detail: { tone: "hot" } }));
  checkWindowSync(); // both sides may have acted before this window opened
}

function closeObsWindow(synced: boolean) {
  const cfg = syncWindowCfg();
  useOS.setState({ obsWindow: { open: false, endsAt: 0, lastClosedAt: Date.now() } });
  if (!synced && cfg) {
    useOS.getState().pushToast({ app: "SYSTEM", ...cfg.closedToast });
  }
}

/** Human side — the player zooms the corpus's anomaly photo while the window holds. */
export function noteWindowHuman(): void {
  const cfg = syncWindowCfg();
  if (!cfg) return;
  const os = useOS.getState();
  if (!os.obsWindow.open || os.flags.has(cfg.humanFlag)) return;
  os.addFlag(cfg.humanFlag);
  os.pushToast({ app: "PHOTOS", ...cfg.humanToast });
  checkWindowSync();
}

/** Agent side — the agent reads the logs during the window (get_system_logs). */
export function noteWindowAgent(): void {
  const cfg = syncWindowCfg();
  if (!cfg) return;
  const os = useOS.getState();
  if (!os.obsWindow.open || os.flags.has(cfg.agentFlag)) return;
  os.addFlag(cfg.agentFlag);
  checkWindowSync();
}

function checkWindowSync() {
  const cfg = syncWindowCfg();
  if (!cfg) return;
  const os = useOS.getState();
  if (!os.obsWindow.open) return;
  if (os.flags.has(cfg.humanFlag) && os.flags.has(cfg.agentFlag)) {
    os.addFlag(cfg.syncedFlag);
    closeObsWindow(true);
    os.pushToast({ app: "ARIA", ...cfg.syncedToast });
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

/* ---------------- pacing — the desk answers one thread at a time ---------------- */
/**
 * The co-op premise dies if the agent can empty the corpus in one turn. A capable
 * model, asked to "gather context", will happily fire forty reads and hand back a
 * solved case — leaving the human nothing to find and no reason to be at the desk.
 *
 * Asking it not to is not a mechanic; a prompt is advice. So the desk withholds.
 * After AGENT_READ_BUDGET consecutive machine reads with no human action in
 * between, the read tools stop answering until the investigator does something.
 * Actuation (open_*, highlight_*) is never gated — putting a document on the
 * player's screen is the behaviour we want, and the human is watching it happen.
 *
 * The run decays after IDLE_RESET_MS so a later question starts fresh: the gate
 * paces a single burst, it does not punish a conversation.
 */
const AGENT_READ_BUDGET = 5;
const IDLE_RESET_MS = 30_000;

let agentRun = 0;
let agentRunAt = 0;

/** Read tools yield to the human; actuation and the briefing never do. */
const UNGATED_TOOLS = new Set([
  "get_investigation_context",
  "open_application",
  "focus_application",
  "open_file",
  "open_directory",
  "open_image",
  "open_email",
  "open_messages_thread",
  "open_browser_entry",
  "open_evidence_board",
  "show_in_document",
  "highlight_evidence",
  "record_evidence",
  "terminal_command",
]);

/**
 * Called by the tool layer before every agent invocation. Returns an error
 * envelope when the agent has read too far ahead of its partner, else null.
 */
export function pacingGate(toolName: string): { ok: false; error: string } | null {
  const now = Date.now();
  if (now - agentRunAt > IDLE_RESET_MS) agentRun = 0;
  agentRunAt = now;

  if (UNGATED_TOOLS.has(toolName)) return null;

  agentRun += 1;
  if (agentRun <= AGENT_READ_BUDGET) return null;

  return {
    ok: false,
    error:
      "the desk has stopped answering: you have read " +
      agentRun +
      " times without your partner moving. This is deliberate — you are one of two " +
      "investigators, not an autosolver. Report what you already found, then ask the " +
      "investigator to look at something and wait for their answer. Opening a document, " +
      "photo or thread on their screen still works, and their next action reopens the record.",
  };
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
  // A human action clears the agent's read run — the handoff is what reopens the desk.
  if (actor === "human") agentRun = 0;
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

import { useInvestigation } from "@/game/state/investigationStore";

export function recordEvidenceById(id: string): { ok: boolean; error?: string } {
  const inv = useInvestigation.getState();
  const item = activeCorpus().evidence.find((e) => e.id === id);
  if (!item) return { ok: false, error: `unknown evidence id: ${id}` };
  // Guessing ids is not investigating. An item whose discovery is flag-gated cannot
  // be filed until that flag is set, so the board can never be brute-forced.
  if (item.autoUnlockFlag && !useOS.getState().flags.has(item.autoUnlockFlag)) {
    return { ok: false, error: `not yet discovered: ${id} — find it on the desk first` };
  }
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
  for (const rule of activeCorpus().fileFlags) {
    const hit = rule.prefix ? path.startsWith(rule.path) : path === rule.path;
    if (!hit) continue;
    if (rule.requiresVault && !os.vaultUnlocked) continue;
    for (const flag of rule.flags) os.addFlag(flag);
  }
  checkReconstructed();
  checkReconstructionAvailable();
}

export function markAgentCollaboration() {
  const os = useOS.getState();
  const corpus = activeCorpus();
  const flag = corpus.collaborationFlag;
  const first = !os.flags.has(flag);
  os.addFlag(flag);
  if (first) {
    const t = corpus.chrome.collaborationToast;
    os.pushToast({ app: "ARIA", title: t.title, body: t.body });
    sfx.chime();
  }
  checkReconstructionAvailable();
}

/* ---------------- case reconstruction gate ---------------- */

export interface ReconstructionProgress {
  /** milestones reached, out of the corpus's milestone list */
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
  const corpus = activeCorpus();
  const required = corpus.milestonesRequired;
  const reachedItems = corpus.milestones.filter((m) => os.flags.has(m.flag));
  const reached = reachedItems.length;
  const collaborated = os.flags.has(corpus.collaborationFlag);
  return {
    reached,
    required,
    remaining: Math.max(0, required - reached),
    collaborated,
    available: os.flags.has("CASE_RECONSTRUCTION_AVAILABLE"),
    missing: corpus.milestones.filter((m) => !os.flags.has(m.flag)).map((m) => m.label),
  };
}

export function checkReconstructionAvailable() {
  const p = reconstructionProgress();
  // Without the agent the case cannot be closed — this is the WebMCP demonstration
  // gate: at least one machine-readable correlation must have run through a tool.
  if (!p.collaborated) return;
  if (p.reached >= p.required) useOS.getState().addFlag("CASE_RECONSTRUCTION_AVAILABLE");
}

/* ---------------- the agent's briefing ---------------- */

export interface AgentBriefing {
  corpus: string;
  /** Role and voice, joined — one field so the whole briefing fits the output budget. */
  role: string;
  /** The rules of play. First field a model reads, and the one it must obey. */
  protocol: string[];
  unsettledNotes?: string[];
  caseStatus: {
    sealOpen: boolean;
    caseCompleteAt: boolean;
  };
  progress: {
    evidenceRecorded: number;
    evidenceTotal: number;
    completed: string[];
    suggestedNext: string[];
  };
  knownPeople: string[];
  keyPaths: string[];
  photoIds: string[];
}

/**
 * Everything `get_investigation_context` returns, assembled from the active corpus.
 * Lives here rather than in the tool layer so a second corpus needs no tool changes.
 *
 * Every field is load-bearing and the whole payload must arrive intact: the
 * output budget trims the longest array first, which would silently eat the
 * protocol and leave a model half-briefed. So the briefing carries only what an
 * agent cannot get from another tool — the premise lives in the case jacket, the
 * board lives in get_case_evidence — and it is measured, not hoped, to fit.
 */
export function getAgentBriefing(): AgentBriefing {
  const os = useOS.getState();
  const inv = useInvestigation.getState();
  const corpus = activeCorpus();
  const evidence = inv.getVisibleEvidence().map((e) => e.id);

  // live co-pilot — what's done and what to do next (keeps the agent useful to a stuck player)
  const completed: string[] = [];
  const next: string[] = [];
  for (const step of corpus.contextSteps) {
    const done = step.vaultUnlocked ? os.vaultUnlocked : step.flag ? os.flags.has(step.flag) : false;
    if (done) completed.push(step.completed);
    else if (!step.requiresVault || os.vaultUnlocked) next.push(step.next);
  }

  const unsettled = corpus.unsettledNotes.filter((u) => os.flags.has(u.flag)).map((u) => u.note);

  return {
    corpus: corpus.label,
    role: `${corpus.agentRole} ${corpus.agentStyle}`,
    // The standing instructions. A prompt alone would be advice, so pacingGate()
    // enforces the second rule — but stating it here means a cooperative model
    // never has to be refused in the first place. Kept terse so the whole
    // briefing survives the 1500-char output budget intact.
    protocol: [
      "Two-player case: you read the machine, the investigator reads the room. Neither closes it alone.",
      "Two or three reads, then STOP and report. After five reads without your partner acting the desk goes quiet until they act.",
      "End every turn with something for them to do, then wait.",
      "You have metadata, not pixels. Open a picture on their screen and ask what is in it.",
      "Point, don't paste. Never invent or guess ids. If you do not know, say so.",
    ],
    unsettledNotes: unsettled.length ? unsettled : undefined,
    caseStatus: {
      /* Counts and gates only — get_case_evidence lists the board, and the
         briefing has to fit the 1500-char budget whole. */
      sealOpen: os.vaultUnlocked,
      caseCompleteAt: inv.caseCompleteAt !== null,
    },
    progress: {
      evidenceRecorded: evidence.length,
      evidenceTotal: corpus.evidence.length,
      /* Last few only. This grows as the case advances, and if the briefing
         outgrows the budget the trimmer eats the protocol first. */
      completed: completed.slice(-3),
      suggestedNext: next.slice(0, 1),
    },
    /* Capped: the rest is discoverable with search_files and search_messages.
       An over-long briefing gets trimmed by the output budget, and the budget
       eats the longest array — which is the protocol. */
    knownPeople: corpus.knownPeople.slice(0, 4),
    keyPaths: corpus.keyPaths.slice(0, 3),
    photoIds: corpus.photoIds.slice(0, 3),
  };
}
