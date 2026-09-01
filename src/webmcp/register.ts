"use client";

import type { AppId } from "@/types/game";
import { ALL_APPS } from "@/types/game";
import * as S from "@/game/services";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";

/* ============================================================
   WEBMCP — the agent tool layer.

   Every tool is a narrow, semantic capability of the workstation
   being investigated. No generic browser automation: the agent
   can bring evidence to the player's attention, never inspect
   visuals or drive arbitrary UI. If WebMCP were removed, the
   agent would lose all ability to operate the machine.

   Design per Chrome best practices
   (https://developer.chrome.com/docs/ai/webmcp/build-tools,
    https://developer.chrome.com/docs/ai/webmcp/secure-tools):
   - Each tool single-function, clear verb, positive language
   - Budgets: 30 char name / 500 desc / 150 param / 200 input /
     1500 output — enforced in code, not just documented
   - Annotations on EVERY tool: readOnlyHint declared true or
     false, untrustedContentHint on anything returning in-world
     content the model must treat as data, never instructions
   - Every handler delegates to src/game/services.ts so the UI
     and the agent share one capability layer
   ============================================================ */

export interface ToolAnnotations {
  readOnlyHint: boolean;
  untrustedContentHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
}

export interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  /** Required — a host must be able to tell reads from writes without guessing. */
  annotations: ToolAnnotations;
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

/* ---------- budgets per https://developer.chrome.com/docs/ai/webmcp/secure-tools ---------- */
export const MAX_NAME_LEN = 30;
export const MAX_DESC_LEN = 500;
export const MAX_PARAM_DESC_LEN = 150;
export const MAX_QUERY_LEN = 200;
export const MAX_OUTPUT_CHARS = 1500;
const TRUNCATION_SUFFIX = "…[truncated]";

const clampStr = (v: unknown, max = MAX_QUERY_LEN) => String(v ?? "").slice(0, max).trim();
const str = (description: string) => ({ type: "string", description: description.slice(0, MAX_PARAM_DESC_LEN) });
const enumOf = (e: string[], description: string) => ({
  type: "string",
  enum: e,
  description: description.slice(0, MAX_PARAM_DESC_LEN),
});
/** Truncate a single string field. The suffix counts toward the budget. */
const truncate = (s: string, max = MAX_OUTPUT_CHARS) =>
  s.length > max ? s.slice(0, max - TRUNCATION_SUFFIX.length) + TRUNCATION_SUFFIX : s;

/**
 * Registry-wide output budget. Every tool return value passes through here:
 * the serialized payload is measured, and if it exceeds MAX_OUTPUT_CHARS the
 * result set is trimmed (arrays shortened from the tail, long strings clipped)
 * until it fits, with an explicit `budget` note so the model knows to refine
 * rather than assume it saw everything.
 */
export function applyOutputBudget<T>(value: T, max = MAX_OUTPUT_CHARS): unknown {
  const size = (v: unknown) => {
    try {
      return JSON.stringify(v)?.length ?? 0;
    } catch {
      return 0;
    }
  };
  if (typeof value === "string") return truncate(value, max);
  if (size(value) <= max) return value;

  // 1) clip long strings anywhere in the payload
  const clipDeep = (v: unknown, budget: number): unknown => {
    if (typeof v === "string") return truncate(v, budget);
    if (Array.isArray(v)) return v.map((x) => clipDeep(x, budget));
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = clipDeep(val, budget);
      return out;
    }
    return v;
  };
  let out = clipDeep(value, 240) as Record<string, unknown>;
  if (size(out) <= max) return { ...out, budget: `clipped to ${MAX_OUTPUT_CHARS}-char output budget` };

  // 2) shorten the longest array field until the payload fits
  for (let guard = 0; guard < 24 && size(out) > max; guard++) {
    let longestKey: string | null = null;
    let longestLen = 0;
    for (const [k, v] of Object.entries(out)) {
      if (Array.isArray(v) && v.length > longestLen) {
        longestKey = k;
        longestLen = v.length;
      }
    }
    if (!longestKey || longestLen <= 1) break;
    const arr = out[longestKey] as unknown[];
    out = { ...out, [longestKey]: arr.slice(0, Math.max(1, Math.floor(arr.length / 2))) };
  }
  return {
    ...out,
    truncated: true,
    budget: `trimmed to fit the ${MAX_OUTPUT_CHARS}-char output budget — refine your query for more detail`,
  };
}

const APP_ENUM = enumOf(ALL_APPS as string[], "Which application");

/** Read-only, returns in-world content the model must treat as data. */
const READ_UGC: ToolAnnotations = { readOnlyHint: true, untrustedContentHint: true, idempotentHint: true };
/** Read-only, returns system-generated state (no in-world prose). */
const READ_SYSTEM: ToolAnnotations = { readOnlyHint: true, idempotentHint: true };
/** Moves the player's screen. Not destructive, but visible and not read-only. */
const NAVIGATE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true };
/** Writes to shared investigation state. */
const WRITE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false };

/* ================= INVESTIGATION TOOLS — read-only, flat, always available ================= */
// Read-only tools are GETs — surface everything for agent queries.

const get_investigation_context: ToolDef = {
  name: "get_investigation_context",
  title: "Get investigation briefing",
  description:
    "Get your role briefing, the rules of play and the current case state. Call this first and follow the returned 'protocol' exactly. You are the workstation's onboard research AI; the player is an authorized investigator. This is a two-player investigation, not a task to finish: work one question at a time, two or three reads, then stop and report. The desk stops answering an agent that reads far ahead of its partner.",
  inputSchema: { type: "object", properties: {} },
  annotations: READ_SYSTEM,
  execute: () => S.getAgentBriefing(),
};

const search_files: ToolDef = {
  name: "search_files",
  title: "Search files",
  description:
    "Search filenames and readable file contents across the filesystem. Returns matching paths plus a short content excerpt per match. Returns at most 25 results with 120-char excerpts — refine query for pagination.",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search for in names and contents") },
    required: ["query"],
  },
  annotations: READ_UGC,
  execute: ({ query }) => {
    const q = clampStr(query);
    if (!q) return { ok: false, error: "query is required (1–200 chars)" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "searching the filesystem…");
    const results = S.searchFiles(q);
    return { count: results.length, results };
  },
};

const read_file: ToolDef = {
  name: "read_file",
  title: "Read file",
  description:
    "Read the full text content of a specific file by exact path. Prefer show_in_document for long files so the PLAYER reads it on screen instead.",
  inputSchema: {
    type: "object",
    properties: { path: str("Exact absolute path, as returned by search_files") },
    required: ["path"],
  },
  annotations: READ_UGC,
  execute: ({ path }) => {
    const p = clampStr(path, 300);
    if (!p.startsWith("/")) return { ok: false, error: "path must be absolute, starting with /" };
    const node = S.fsGet(p);
    const os = useOS.getState();
    if (!node || (node.hiddenUntilFlag && !os.flags.has(node.hiddenUntilFlag)))
      return { ok: false, error: "no such object" };
    if (node.encrypted || (node.requiresUnlock && !os.vaultUnlocked))
      return { ok: false, error: "sealed container" };
    if (!node.content)
      return node.kind === "img"
        ? { ok: true, kind: "image", photoId: node.photoId, hint: "use get_image_metadata; the player must view it themselves" }
        : { ok: true, kind: node.kind, hint: "binary object" };
    const content = truncate(node.content);
    return { ok: true, path: node.path, lines: node.content.split("\n").length, content, truncated: content !== node.content };
  },
};

const search_messages: ToolDef = {
  name: "search_messages",
  title: "Search messages",
  description: "Full-text search of the on-device chat threads. Call get_investigation_context for who is on this machine.",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search message bodies for") },
    required: ["query"],
  },
  annotations: READ_UGC,
  execute: ({ query }) => {
    const qq = clampStr(query);
    if (!qq) return { ok: false, error: "query is required (1–200 chars)" };
    S.markAgentCollaboration();
    const hits = S.searchMessages(qq);
    useAria.getState().setStatus("investigating", "searching messages…");
    return { count: hits.length, hits: hits.slice(0, 25) };
  },
};

const get_message_thread: ToolDef = {
  name: "get_message_thread",
  title: "Get message thread",
  description: "Read one full chat thread by id. Use search_messages or get_investigation_context to discover thread ids for this corpus.",
  inputSchema: {
    type: "object",
    properties: { threadId: str("Thread id for this corpus") },
    required: ["threadId"],
  },
  annotations: READ_UGC,
  execute: ({ threadId }) => {
    const id = clampStr(threadId, 40);
    if (!id) return { ok: false, error: "threadId is required" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("reading", `reading thread ${id}…`);
    return S.getMessageThread(id);
  },
};

const open_messages_thread: ToolDef = {
  name: "open_messages_thread",
  title: "Open message thread",
  description: "Open the Messages app on screen and show a specific chat thread. Visible to the player — they can then read the bubbles.",
  inputSchema: {
    type: "object",
    properties: { threadId: str("Thread id for this corpus") },
    required: ["threadId"],
  },
  annotations: NAVIGATE,
  execute: ({ threadId }) => {
    const r = S.openMessagesThread(clampStr(threadId, 40));
    if (r.ok) useAria.getState().setStatus("responding", "");
    return r;
  },
};

const search_emails: ToolDef = {
  name: "search_emails",
  title: "Search emails",
  description: "Search the mail store (inbox/sent/drafts/archive/trash) by sender, subject or body text.",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search for") },
    required: ["query"],
  },
  annotations: READ_UGC,
  execute: ({ query }) => {
    const q = clampStr(query);
    if (!q) return { ok: false, error: "query is required" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "searching mail…");
    const hits = S.searchEmails(q);
    return { count: hits.length, hits: hits.slice(0, 25) };
  },
};

const get_email: ToolDef = {
  name: "get_email",
  title: "Get email",
  description: "Read one email's full text by id (e.g. mail_101). Then consider open_email so the player sees it too.",
  inputSchema: {
    type: "object",
    properties: { emailId: str("Email id, e.g. mail_102") },
    required: ["emailId"],
  },
  annotations: READ_UGC,
  execute: ({ emailId }) => {
    const id = clampStr(emailId, 40);
    const em = S.getEmail(id);
    if (!em) return { ok: false, error: "no such email" };
    useAria.getState().setStatus("reading", `reading ${id}…`);
    return { ...em, body: truncate(em.body) };
  },
};

const get_image_metadata: ToolDef = {
  name: "get_image_metadata",
  title: "Get image metadata",
  description:
    "Read EXIF-style metadata for a photo (timestamps, GPS, camera, software, hash, notes). This is ALL you can know about an image — you cannot see its pixels. To have the player look at it, call open_image and then tell them where to zoom.",
  inputSchema: {
    type: "object",
    properties: { photoId: str("Photo id or filename, as returned by get_investigation_context") },
    required: ["photoId"],
  },
  annotations: READ_SYSTEM,
  execute: ({ photoId }) => {
    const id = clampStr(photoId, 40);
    S.markAgentCollaboration();
    const meta = S.getImageMetadata(id);
    if (!meta) return { ok: false, error: "no such photo" };
    useAria.getState().setStatus("investigating", `reading ${meta.filename} metadata…`);
    return { ok: true, ...meta, lookHint: S.photoInspectionHint(id) };
  },
};

const open_image: ToolDef = {
  name: "open_image",
  title: "Open image",
  description: "Open a photo in the image viewer on screen so the player can visually inspect it. You cannot zoom, pan, or see it yourself.",
  inputSchema: {
    type: "object",
    properties: { photoId: str("Photo id or filename, as returned by get_investigation_context") },
    required: ["photoId"],
  },
  annotations: NAVIGATE,
  execute: ({ photoId }) => {
    const id = clampStr(photoId, 40);
    if (!S.isPhotoAccessible(id)) return { ok: false, error: "no such photo" };
    S.openPhoto(id);
    return { ok: true, lookHint: S.photoInspectionHint(id) };
  },
};

const search_browser_history: ToolDef = {
  name: "search_browser_history",
  title: "Search browser history",
  description: "Search the browser history entries by title or URL fragment.",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search titles/URLs for") },
    required: ["query"],
  },
  annotations: READ_UGC,
  execute: ({ query }) => {
    const qq = clampStr(query);
    if (!qq) return { ok: false, error: "query is required" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "searching browser history…");
    const hits = S.searchBrowserHistory(qq).slice(0, 25);
    return { count: hits.length, hits };
  },
};

const get_system_logs: ToolDef = {
  name: "get_system_logs",
  title: "Get system logs",
  description:
    "Read system log entries, optionally filtered by date, time, category ('NETWORK'/'LOGIN'/'DEVICE'/'POWER'/'SECURITY'), or free text. Call get_investigation_context first for the window that matters in this case.",
  inputSchema: {
    type: "object",
    properties: { filter: str("Optional filter substring") },
  },
  annotations: READ_UGC,
  execute: ({ filter }) => {
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "scanning system logs…");
    const f = filter ? clampStr(filter) : undefined;
    const logs = S.getSystemLogs(f);
    S.noteAgentLogScan(logs); // anomaly cluster reached → agent side of the co-op set piece
    return { count: logs.length, logs: logs.slice(0, 50) };
  },
};

const get_timeline: ToolDef = {
  name: "get_timeline",
  title: "Get correlated timeline",
  description:
    "Get a merged chronological timeline of system logs, photo timestamps, and message saliency across a time window. A human would need to open five apps and read them side by side; this synthesizes it in one call.",
  inputSchema: {
    type: "object",
    properties: { window: str("Time window e.g. 02:00-03:00; omit for this case's default") },
    required: [],
  },
  annotations: READ_UGC,
  execute: ({ window }) => {
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "correlating the timeline…");
    const fallback = S.defaultTimelineWindow();
    const w = clampStr((window as string) ?? fallback, 40) || fallback;
    const result = S.getTimeline(w);
    return {
      ...result,
      note: result.has0213Cluster
        ? "anomaly cluster present in this window — correlate with the visual evidence"
        : `no anomaly cluster in this window, try ${fallback}`,
    };
  },
};

const get_case_evidence: ToolDef = {
  name: "get_case_evidence",
  title: "Get case evidence",
  description: "List every piece of evidence recorded on the board so far (ids, sections, summaries).",
  inputSchema: { type: "object", properties: {} },
  annotations: READ_SYSTEM,
  execute: () => {
    useAria.getState().setStatus("reading", "reviewing the evidence board…");
    return { evidence: S.getCaseEvidence() };
  },
};

/* ================= NAVIGATION TOOLS — visible, not read-only ================= */
// These change what is on the player's screen. Annotated readOnlyHint:false so
// a host never mistakes them for silent reads.

const open_application: ToolDef = {
  name: "open_application",
  title: "Open application",
  description: "Open and focus one of the workstation's applications. Visible to the player — the window opens on their desktop.",
  inputSchema: { type: "object", properties: { application: APP_ENUM }, required: ["application"] },
  annotations: NAVIGATE,
  execute: ({ application }) => {
    const app = String(application) as AppId;
    if (!ALL_APPS.includes(app)) return { ok: false, error: "unknown application" };
    S.openApplication(app);
    return { ok: true };
  },
};

const focus_application: ToolDef = {
  name: "focus_application",
  title: "Focus application",
  description: "Bring an already-running application window to the foreground.",
  inputSchema: { type: "object", properties: { application: APP_ENUM }, required: ["application"] },
  annotations: NAVIGATE,
  execute: ({ application }) => {
    const app = String(application) as AppId;
    if (!ALL_APPS.includes(app)) return { ok: false, error: "unknown application" };
    S.focusApplication(app);
    return { ok: true };
  },
};

const open_file_tool: ToolDef = {
  name: "open_file",
  title: "Open file",
  description:
    "Open a document in the text viewer on the player's screen (opens File Manager context automatically). Does not scroll — use show_in_document when you want to guide them to a specific line or phrase.",
  inputSchema: {
    type: "object",
    properties: { path: str("Exact absolute path") },
    required: ["path"],
  },
  annotations: NAVIGATE,
  execute: ({ path }) => {
    const p = clampStr(path, 300);
    useAria.getState().setStatus("investigating", `opening ${p.split("/").pop()}…`);
    return S.openFile(p);
  },
};

/**
 * show_in_document — the agent's hero "look at THIS" primitive.
 * Combines open_file + scroll-to-line (or query-resolved first match)
 * into one call. Pins a persistent highlight on the resolved line that
 * stays until the player takes an explicit action (click, scroll, type,
 * close) or a new show_in_document call replaces it. Use this when you
 * want the player to actually read a passage — do not quote it in chat.
 *
 * Accepts EITHER:
 *   - line: 1-based line number (precise)
 *   - query: a phrase to find (resolves to first match — fewer round-trips)
 */
const show_in_document: ToolDef = {
  name: "show_in_document",
  title: "Show line in document",
  description:
    "Open a document (if not open), scroll to a line, and pin a persistent highlight on it that stays until the player clicks, scrolls, types, or closes. Provide either a 1-based `line` or a `query` (first match is shown). This is the agent's preferred 'look at THIS' primitive — use it instead of quoting a passage into chat.",
  inputSchema: {
    type: "object",
    properties: {
      path: str("Absolute path, as returned by search_files"),
      line: { type: "number", description: "1-based line number (mutually exclusive with query)" },
      query: str("Phrase to find — first match is shown (mutually exclusive with line)"),
    },
    required: ["path"],
  },
  annotations: NAVIGATE,
  execute: ({ path, line, query }) => {
    useAria.getState().setStatus("responding", "showing the line on screen…");
    const r = S.showInDocument(clampStr(path, 300), {
      line: line === undefined || line === null ? undefined : Number(line),
      query: typeof query === "string" ? clampStr(query, 200) : undefined,
    });
    if (r.ok) S.markAgentCollaboration();
    useAria.getState().setStatus("idle", "");
    return r;
  },
};

const open_directory: ToolDef = {
  name: "open_directory",
  title: "Open directory",
  description: "Navigate the File Manager to a directory on the player's screen.",
  inputSchema: { type: "object", properties: { path: str("Absolute directory path") }, required: ["path"] },
  annotations: NAVIGATE,
  execute: ({ path }) => {
    const r = S.openDirectory(clampStr(path, 300));
    if (r.ok) useAria.getState().setStatus("responding", "");
    return r;
  },
};

const open_email_tool: ToolDef = {
  name: "open_email",
  title: "Open email",
  description: "Open Mail and display a specific email on screen for the player to read.",
  inputSchema: { type: "object", properties: { emailId: str("Email id, e.g. mail_102") }, required: ["emailId"] },
  annotations: NAVIGATE,
  execute: ({ emailId }) => S.openEmail(clampStr(emailId, 40)),
};

const open_browser_entry: ToolDef = {
  name: "open_browser_entry",
  title: "Open browser entry",
  description: "Open the fictional Browser at a history entry's cached page (entry ids like hist_001 from search_browser_history).",
  inputSchema: { type: "object", properties: { entryId: str("History entry id") }, required: ["entryId"] },
  annotations: NAVIGATE,
  execute: ({ entryId }) => {
    const r = S.openBrowserEntry(clampStr(entryId, 40));
    if (r.ok) useAria.getState().setStatus("responding", "");
    return r;
  },
};

/** Allowlist — verbs and an explicit argument charset. Not a blocklist. */
export const TERMINAL_VERBS = ["ls", "cd", "cat", "open", "search", "unlock", "help", "clear", "history"] as const;
export const TERMINAL_ALLOWLIST = new RegExp(`^(${TERMINAL_VERBS.join("|")})(\\s+[a-zA-Z0-9._/\\- ]*)?$`);

const terminal_command: ToolDef = {
  name: "terminal_command",
  title: "Run terminal command",
  description:
    "Run one command in the workstation terminal on screen: ls [path], cd [path], cat <file>, unlock <w1> <w2> <w3>, help, clear. Use 'unlock' ONLY when the player has derived the three-word sequence themselves.",
  inputSchema: {
    type: "object",
    properties: { command: str("The command line to run") },
    required: ["command"],
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  execute: ({ command }) => {
    const cmd = clampStr(command, 200);
    if (!cmd) return { ok: false, error: "command is required" };
    // Allowlist: only these verbs, only this argument charset. Blocks ; && | ` $() etc.
    if (!TERMINAL_ALLOWLIST.test(cmd))
      return { ok: false, error: "unsupported command — try: ls, cat <file>, unlock w1 w2 w3, help" };
    S.focusApplication("terminal");
    setTimeout(() => termRunBus.emit(cmd), 80);
    return { ok: true, note: "output appears in the visible terminal" };
  },
};
/* simple bus used by TerminalApp — isolated so the game build doesn't need services */
class TermBus {
  private subs = new Set<(payload: unknown) => void>();
  on(fn: (payload: unknown) => void): () => void { this.subs.add(fn as never); return () => { this.subs.delete(fn as never); }; }
  emit(payload: unknown) { this.subs.forEach((fn) => fn(payload)); }
}
export const termRunBus = new TermBus();

/* ================= EVIDENCE TOOLS — write-like, guarded ================= */

const record_evidence: ToolDef = {
  name: "record_evidence",
  title: "Record evidence",
  description:
    "Record a discovered item on the shared Evidence board. Only meaningful ids from get_case_evidence may be added; you cannot invent evidence.",
  inputSchema: {
    type: "object",
    properties: { evidenceId: str("Evidence id, e.g. ev_0213_login") },
    required: ["evidenceId"],
  },
  annotations: WRITE,
  execute: ({ evidenceId }) => S.recordEvidenceById(clampStr(evidenceId, 40)),
};

const highlight_evidence: ToolDef = {
  name: "highlight_evidence",
  title: "Highlight evidence",
  description: "Pulse-highlight an already-recorded item on the Evidence board to draw the player's attention.",
  inputSchema: { type: "object", properties: { evidenceId: str("Existing evidence id") }, required: ["evidenceId"] },
  annotations: NAVIGATE,
  execute: ({ evidenceId }) => S.highlightEvidenceById(clampStr(evidenceId, 40)),
};

const open_evidence_board: ToolDef = {
  name: "open_evidence_board",
  title: "Open evidence board",
  description: "Open the shared Evidence board application.",
  inputSchema: { type: "object", properties: {} },
  annotations: NAVIGATE,
  execute: () => {
    S.openEvidenceBoard();
    return { ok: true };
  },
};

/* ============================================================ */

export const TOOL_DEFS: ToolDef[] = [
  // investigation — read-only flat list
  get_investigation_context,
  search_files,
  read_file,
  search_messages,
  get_message_thread,
  open_messages_thread,
  search_emails,
  get_email,
  get_image_metadata,
  open_image,
  search_browser_history,
  get_system_logs,
  get_timeline,
  get_case_evidence,
  // navigation — visible, readOnlyHint:false
  open_application,
  focus_application,
  open_file_tool,
  show_in_document,
  open_directory,
  open_email_tool,
  open_browser_entry,
  terminal_command,
  // evidence — write-like, guarded
  record_evidence,
  highlight_evidence,
  open_evidence_board,
];

/** Names of the declarative-API forms registered by the browser from HTML. */
export const DECLARATIVE_TOOL_NAMES = ["request_correlation", "unlock_vault", "inspect_photo", "record_evidence_form"] as const;

/* ---------------- host detection ---------------- */

interface ModelContextLike extends EventTarget {
  registerTool: (tool: unknown, opts?: unknown) => unknown;
  executeTool?: (tool: unknown, args?: string, opts?: unknown) => Promise<unknown>;
  getTools?: (opts?: unknown) => Promise<unknown[]>;
}

export function getModelContext(): ModelContextLike | null {
  if (typeof document === "undefined") return null;
  const dc = (document as unknown as Record<string, unknown>).modelContext;
  if (dc) return dc as ModelContextLike;
  if (typeof navigator !== "undefined") {
    const nc = (navigator as unknown as Record<string, unknown>).modelContext;
    if (nc) return nc as ModelContextLike;
  }
  return null;
}

export function webmcpAvailable(): boolean {
  return getModelContext() !== null;
}

/* ---------------- registration lifecycle ---------------- */

export interface RegistrationState {
  /** true only when every tool in TOOL_DEFS registered without error */
  registered: boolean;
  /** the context instance the current registration belongs to */
  context: ModelContextLike | null;
  registeredCount: number;
  failed: string[];
  inFlight: boolean;
}

const state: RegistrationState = {
  registered: false,
  context: null,
  registeredCount: 0,
  failed: [],
  inFlight: false,
};

let controller: AbortController | null = null;
let attempt: Promise<boolean> | null = null;

export function getRegistrationState(): Readonly<RegistrationState> {
  return { ...state, failed: [...state.failed] };
}

/**
 * Unregister every tool via the AbortSignal passed at registration
 * (https://developer.chrome.com/docs/ai/webmcp/imperative-api — as of
 * Chrome 153 this does not cancel in-flight executions). Exposed so a
 * host swap or an unmounting root can cleanly detach.
 */
export function unregisterWebMCPTools(): void {
  controller?.abort();
  controller = null;
  state.registered = false;
  state.context = null;
  state.registeredCount = 0;
  state.failed = [];
}

function toolPayload(def: ToolDef) {
  return {
    name: def.name,
    title: def.title,
    description: def.description,
    inputSchema: def.inputSchema,
    annotations: def.annotations,
    execute: async (input: Record<string, unknown>, opts?: { signal?: AbortSignal }) => {
      if (opts?.signal?.aborted) return { ok: false, error: "cancelled" };
      // Pacing: the desk withholds when the agent reads far ahead of its partner.
      const gated = S.pacingGate(def.name);
      if (gated) return gated;
      S.noteAgentAction(); // synchrony rhythm — real WebMCP host invocations
      try {
        const result = await def.execute(input ?? {});
        // Cancelled mid-flight: report it rather than mutating the model's view.
        if (opts?.signal?.aborted) return { ok: false, error: "cancelled" };
        return applyOutputBudget(result);
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "tool failure" };
      }
    },
  };
}

/**
 * Register every agent tool with the host's `document.modelContext`.
 *
 * Idempotent per context: re-registers when the host swaps or clears the
 * context (which is what a `toolchange` event can mean), and only reports
 * success once every tool actually registered — a partial failure keeps the
 * caller's poll alive instead of latching a false positive.
 *
 * Returns a promise resolving to true when all tools are registered.
 */
export async function registerWebMCPTools(): Promise<boolean> {
  const mc = getModelContext();
  if (!mc || typeof mc.registerTool !== "function") return false;
  if (state.registered && state.context === mc) return true;
  if (attempt && state.context === mc) return attempt;

  // new or replaced context — drop the previous registration cleanly
  if (state.context && state.context !== mc) unregisterWebMCPTools();

  state.context = mc;
  state.inFlight = true;
  controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const failed: string[] = [];

  attempt = (async () => {
    await Promise.all(
      TOOL_DEFS.map(async (def) => {
        try {
          await mc.registerTool(toolPayload(def), controller ? { signal: controller.signal } : undefined);
        } catch (err) {
          // Duplicate name (InvalidStateError) means it is already there — not a failure.
          const name = err instanceof Error ? err.name : "";
          if (name !== "InvalidStateError") {
            failed.push(def.name);
            console.warn(`[webmcp] registerTool failed for ${def.name}:`, err);
          }
        }
      }),
    );
    state.failed = failed;
    state.registeredCount = TOOL_DEFS.length - failed.length;
    state.registered = failed.length === 0;
    state.inFlight = false;
    attempt = null;
    if (!state.registered) {
      console.warn(`[webmcp] ${failed.length}/${TOOL_DEFS.length} tools failed to register:`, failed);
    }
    return state.registered;
  })();

  return attempt;
}

/**
 * Execute a tool the way a host would. Prefers the real
 * `document.modelContext.executeTool` when a host is present (so the LINK
 * console exercises the actual WebMCP path), and falls back to the local
 * handler when there is none.
 */
export async function executeToolLikeHost(
  def: ToolDef,
  input: Record<string, unknown>,
): Promise<{ result: unknown; via: "host" | "local" }> {
  const mc = getModelContext();
  if (mc && typeof mc.executeTool === "function" && typeof mc.getTools === "function") {
    try {
      const tools = (await mc.getTools()) as { name?: string }[];
      const hostTool = tools.find((t) => t?.name === def.name);
      if (hostTool) {
        const result = await mc.executeTool(hostTool, JSON.stringify(input ?? {}));
        return { result, via: "host" };
      }
    } catch {
      // fall through to the local handler
    }
  }
  return { result: applyOutputBudget(await def.execute(input ?? {})), via: "local" };
}
