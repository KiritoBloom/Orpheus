"use client";

import type { AppId, ChatMsg, Email, FsNode, LogEntry, PhotoMeta } from "@/types/game";
import { buildFilesystem } from "@/game/data/filesystem";
import { EMAILS } from "@/game/data/emails";
import { CHAT_MESSAGES, THREADS } from "@/game/data/chatMessages";
import { HISTORY } from "@/game/data/browserHistory";
import { LOGS } from "@/game/data/systemLogs";
import { getPhoto } from "@/game/data/photos";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   GAME SERVICES — every capability exists exactly once.
   Both the UI and the WebMCP tools call these functions.
   ============================================================ */

const FS: FsNode[] = buildFilesystem();

export function fsList(): FsNode[] {
  return FS;
}
export function fsGet(path: string): FsNode | undefined {
  return FS.find((n) => n.path === path);
}
export function fsChildren(dirPath: string): FsNode[] {
  const os = useOS.getState();
  return FS.filter((n) => {
    if (n.parent !== dirPath) return false;
    if (n.hiddenUntilFlag && !os.flags.has(n.hiddenUntilFlag)) return false;
    if (n.requiresUnlock && !os.vaultUnlocked) return false;
    return true;
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
let docListener: ((state: { path: string; scrollLine?: number; flashLine?: number }) => void) | null = null;
export function setDocListener(fn: typeof docListener) {
  docListener = fn;
  return () => {
    if (docListener === fn) docListener = null;
  };
}
function emitDoc(state: { path: string; scrollLine?: number; flashLine?: number }) {
  docListener?.(state);
}

export function scrollDocumentToLine(path: string, line: number): { ok: boolean; error?: string; line?: number } {
  const node = fsGet(path);
  const os = useOS.getState();
  if (!node || !node.content) return { ok: false, error: `not a readable document: ${path}` };
  const lines = node.content.split("\n");
  if (line < 1 || line > lines.length)
    return { ok: false, error: `line ${line} out of range (document has ${lines.length} lines)` };
  if (!os.windows.textviewer.open) openFile(path);
  else os.focusWindow("textviewer");
  // give the viewer a tick to mount before scrolling
  setTimeout(() => emitDoc({ path, scrollLine: line, flashLine: line }), 60);
  return { ok: true, line };
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
  // Let a newly opened viewer subscribe before delivering the focus event.
  setTimeout(() => photoFocusBus.emit(photoId), 0);
  sfx.windowOpen();
  onPhotoViewed(photoId);
}

let photoListener: ((photoId: string, zoom: number) => void) | null = null;
export function setPhotoListener(fn: typeof photoListener) {
  photoListener = fn;
}
function onPhotoViewed(photoId: string, zoom = 1) {
  photoListener?.(photoId, zoom);
  // story hooks
  const os = useOS.getState();
  if (photoId === "DSC04821" && zoom >= 2.5) {
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
  checkReconstructionAvailable();
}

export function getImageMetadata(photoId: string): PhotoMeta | undefined {
  const photo = getPhoto(photoId);
  if (photo?.inPrivateBackup && !useOS.getState().vaultUnlocked) return undefined;
  useOS.getState().addFlag("DISCOVERED_METADATA");
  return photo;
}

/* ---------------- mail ---------------- */

export interface MailIndexItem extends Email {}

export function listEmails(): Email[] {
  const os = useOS.getState();
  return EMAILS.filter((e) => !(e.hiddenUntilFlag && !os.flags.has(e.hiddenUntilFlag)));
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
}

/* ---------------- messages / chat search ---------------- */

export function searchMessages(query: string): { threadId: string; threadName: string; time: string; body: string }[] {
  const q = query.toLowerCase();
  return CHAT_MESSAGES.filter((m) => m.body.toLowerCase().includes(q)).map((m) => ({
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
    messages: CHAT_MESSAGES.filter((m) => m.threadId === threadId),
  };
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
  checkReconstructionAvailable();
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
  sfx.error();
  return {
    result: "decoy",
    message:
      "CHECKSUM MISMATCH — sequence rejected.\nAdjacent recovery sector mounted instead: /Private/_fragments_recovered\n(one wrong key does not destroy anything here. Daniel was gentle with strangers.)",
  };
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
  // RECONSTRUCTED_FINAL_HOURS composite
  const f = os.flags;
  if (f.has("FOUND_0213_LOG") && f.has("SEEN_WATCH_GAP") && f.has("SEEN_DOORCAM"))
    os.addFlag("RECONSTRUCTED_FINAL_HOURS");
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

export function checkReconstructionAvailable() {
  const os = useOS.getState();
  // Without ARIA, the case cannot be closed — this is the WebMCP demonstration gate.
  // At least one machine-readable correlation must have been performed via tools.
  if (!os.flags.has("COLLABORATED_WITH_ARIA")) return;
  const needed: import("@/types/game").StoryFlag[] = [
    "DISCOVERED_ORPHEUS",
    "FOUND_0213_LOG",
    "IDENTIFIED_CONTACT",
    "DISCOVERED_SURVEILLANCE",
    "VAULT_OPENED",
    "DISCOVERED_METADATA",
  ];
  const count = needed.filter((f) => os.flags.has(f)).length;
  if (count >= 4) os.addFlag("CASE_RECONSTRUCTION_AVAILABLE");
}
