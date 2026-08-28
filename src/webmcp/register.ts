"use client";

import type { AppId } from "@/types/game";
import { ALL_APPS } from "@/types/game";
import * as S from "@/game/services";
import { getPhoto, PHOTOS } from "@/game/data/photos";
import { LOGS } from "@/game/data/systemLogs";
import { CHAT_MESSAGES } from "@/game/data/chatMessages";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { useInvestigation } from "@/game/state/investigationStore";

/* ============================================================
   WEBMCP — the ARIA tool layer.

   Every tool is a narrow, semantic capability of the fictional
   computer. No generic browser automation: ARIA can bring
   evidence to the player's attention, never inspect visuals
   or drive arbitrary UI. If WebMCP were removed, ARIA would
   lose all ability to operate the machine.

   Design per Chrome best practices:
   - Each tool single-function, clear verb, positive language
   - 500 char desc / 150 param / 30 name / 1.5k output budgets
   - readOnlyHint + untrustedContentHint per secure-tools guide
   - Atomic, composable, validated strictly in code
   ============================================================ */

export interface ToolDef {
  name: string;
  title?: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

/* ---------- helpers — budgets per https://developer.chrome.com/docs/ai/webmcp/secure-tools ---------- */
const MAX_QUERY_LEN = 200;
const MAX_OUTPUT_CHARS = 1500;
const clampStr = (v: unknown, max = MAX_QUERY_LEN) => String(v ?? "").slice(0, max).trim();
const str = (description: string) => ({ type: "string", description: description.slice(0, 150) });
const enumOf = (e: string[], description: string) => ({
  type: "string",
  enum: e,
  description: description.slice(0, 150),
});
const truncate = (s: string) => (s.length > MAX_OUTPUT_CHARS ? s.slice(0, MAX_OUTPUT_CHARS) + "…[truncated]" : s);

const APP_ENUM = enumOf(ALL_APPS as string[], "Which application");

/* ================= INVESTIGATION TOOLS — read-only, flat, always available ================= */
// Read-only tools are GETs — surface everything for agent queries.

const get_investigation_context: ToolDef = {
  name: "get_investigation_context",
  title: "Get investigation briefing",
  description:
    "Get your role briefing and current investigation state. Call this once at the start of your first turn. You are ARIA, an onboard research AI on Dr. Daniel McDuff's workstation. Daniel is dead; the player is an authorized investigator. Investigate WITH them — search machine-readable data yourself, but make the PLAYER do all visual inspection of photos and documents. Guide with open_file / scroll_document_to_line / open_email rather than quoting entire files.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  execute: () => {
    const os = useOS.getState();
    const inv = useInvestigation.getState();
    const flags = [...os.flags];
    const evidence = inv.getVisibleEvidence().map((e) => e.id);
    const knownPeople = ["Daniel McDuff (deceased subject)", "Sarah Okafor (grad student)", "M. Haldane (Kestrel Institute)", "Elias Vann (died 2025)", "Ruth McDuff (mother)", "Klaus Voss (CERN friend)", "ARIA (you)"];
    return {
      role: "You are ARIA. Address the investigator plainly and briefly. Never dump file contents into chat — open them on screen and tell the player where to look. You cannot see images; the player must describe what they see.",
      style: "Short paragraphs. Occasional dry warmth. Uncertain when evidence is uncertain.",
      caseStatus: {
        flagsSet: flags,
        evidenceRecorded: evidence,
        vaultUnlocked: os.vaultUnlocked,
        caseCompleteAt: inv.caseCompleteAt !== null,
      },
      knownPeople,
      keyPaths: [
        "/System/FIELD_GUIDE.txt (START HERE — auto-opens on desktop)",
        "/System/readme_first.txt",
        "/Research/ORPHEUS/anomaly_notes.txt",
        "/Research/ORPHEUS/calibration_17.csv",
        "/Research/ORPHEUS/private/haldane_correspondence.txt",
        "/Private/vestibule.enc (locked — 3-word passphrase)",
      ],
      photoIds: ["DSC04821", "DSC04655", "DSC04788", "DSC04903", "IMG_0022", "IMG_0044", "IMG_0103"],
      note: "You see only machine-readable data — files, mail, messages, logs, EXIF. You cannot see pixels: photographs and anything visual are visible only to the player, who must describe them to you.",
    };
  },
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
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ query }) => {
    const q = clampStr(query).toLowerCase();
    if (!q) return { ok: false, error: "query is required (1–200 chars)" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "searching the filesystem…");
    const os = useOS.getState();
    const results = S
      .fsList()
      .filter((n) => {
        if (n.hiddenUntilFlag && !os.flags.has(n.hiddenUntilFlag)) return false;
        if (n.requiresUnlock && !os.vaultUnlocked) return false;
        if (n.encrypted) return n.name.toLowerCase().includes(q);
        return (
          n.name.toLowerCase().includes(q) ||
          (n.content?.toLowerCase().includes(q) ?? false)
        );
      })
      .slice(0, 25)
      .map((n) => {
        let excerpt = "";
        if (n.content && n.content.toLowerCase().includes(q)) {
          const idx = n.content.toLowerCase().indexOf(q);
          excerpt = n.content.slice(Math.max(0, idx - 40), idx + 80).replace(/\s+/g, " ").slice(0, 120);
        }
        const line =
          n.content && n.content.toLowerCase().includes(q)
            ? n.content.slice(0, idx0(n, q)).split("\n").length
            : undefined;
        return { path: n.path, kind: n.kind, modified: n.modified, excerpt, approxLine: line };
      });
    return { count: results.length, results };
  },
};
function idx0(node: { content?: string }, q: string) {
  const i = node.content!.toLowerCase().indexOf(q);
  return i < 0 ? 0 : i;
}

const read_file: ToolDef = {
  name: "read_file",
  title: "Read file",
  description:
    "Read the full text content of a specific file by exact path. Prefer find_text_in_document + scroll_document_to_line for long files so the PLAYER reads it on screen instead.",
  inputSchema: {
    type: "object",
    properties: { path: str("Exact absolute path, e.g. /Research/ORPHEUS/anomaly_notes.txt") },
    required: ["path"],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ path }) => {
    const p = clampStr(path, 300);
    if (!p.startsWith("/")) return { ok: false, error: "path must be absolute, e.g. /Research/ORPHEUS/anomaly_notes.txt" };
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
  description: "Full-text search of Daniel's on-device chat threads (Sarah Okafor, his mother, Klaus Voss, the lab group, IT desk, and an unknown contact 'W —').",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search message bodies for") },
    required: ["query"],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ query }) => {
    const qq = clampStr(query);
    if (!qq) return { ok: false, error: "query is required (1–200 chars)" };
    S.markAgentCollaboration();
    const hits = S.searchMessages(qq);
    useAria.getState().setStatus("investigating", "searching Daniel's messages…");
    return { count: hits.length, hits: hits.slice(0, 25) };
  },
};

const get_message_thread: ToolDef = {
  name: "get_message_thread",
  title: "Get message thread",
  description: "Read one full chat thread by id. Thread ids look like t_sarah, t_mom, t_voss, t_W, t_lab, t_it.",
  inputSchema: {
    type: "object",
    properties: { threadId: str("Thread id, e.g. t_sarah") },
    required: ["threadId"],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ threadId }) => {
    const id = clampStr(threadId, 40);
    if (!id) return { ok: false, error: "threadId is required" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("reading", `reading thread ${id}…`);
    const res = S.getMessageThread(id);
    // truncate bodies to budget (1.5k) — keep ChatMsg shape intact
    if (Array.isArray(res.messages)) {
      res.messages = res.messages.map((m) => ({ ...m, body: truncate((m as unknown as { body: string }).body) })) as typeof res.messages;
    }
    return res;
  },
};

const open_messages_thread: ToolDef = {
  name: "open_messages_thread",
  title: "Open message thread",
  description: "Open the Messages app on screen and show a specific chat thread (ids like t_sarah, t_W). Visible to the player — they can then read the bubbles.",
  inputSchema: {
    type: "object",
    properties: { threadId: str("Thread id, e.g. t_sarah") },
    required: ["threadId"],
  },
  execute: ({ threadId }) => {
    const r = S.openMessagesThread(clampStr(threadId, 40));
    if (r.ok) useAria.getState().setStatus("responding", "");
    return r;
  },
};

const search_emails: ToolDef = {
  name: "search_emails",
  title: "Search emails",
  description: "Search Daniel's mail (inbox/sent/drafts/archive/trash) by sender, subject or body text.",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search for") },
    required: ["query"],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ query }) => {
    const q = clampStr(query).toLowerCase();
    if (!q) return { ok: false, error: "query is required" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "searching Daniel's mail…");
    const hits = S.listEmails()
      .filter((e) =>
        [e.from, e.fromEmail, e.subject, e.body].some((f) => f.toLowerCase().includes(q))
      )
      .map((e) => ({ id: e.id, folder: e.folder, from: e.from, subject: e.subject, date: e.date }));
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
  annotations: { readOnlyHint: true, untrustedContentHint: true },
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
    properties: { photoId: str("Photo id, e.g. DSC04821") },
    required: ["photoId"],
  },
  annotations: { readOnlyHint: true },
  execute: ({ photoId }) => {
    const id = clampStr(photoId, 40);
    S.markAgentCollaboration();
    const meta = S.getImageMetadata(id);
    if (!meta) return { ok: false, error: "no such photo" };
    useAria.getState().setStatus("investigating", `reading ${meta.filename} metadata…`);
    return { ok: true, ...meta };
  },
};

const open_image: ToolDef = {
  name: "open_image",
  title: "Open image",
  description: "Open a photo in the image viewer on screen so the player can visually inspect it. You cannot zoom, pan, or see it yourself.",
  inputSchema: {
    type: "object",
    properties: { photoId: str("Photo id, e.g. DSC04821") },
    required: ["photoId"],
  },
  execute: ({ photoId }) => {
    const id = clampStr(photoId, 40);
    const meta = getPhoto(id);
    if (!meta) return { ok: false, error: "no such photo" };
    const p = S.fsList().find((n) => n.photoId === id);
    const os = useOS.getState();
    if ((meta.inPrivateBackup && !os.vaultUnlocked) || (p?.hiddenUntilFlag && !os.flags.has(p.hiddenUntilFlag))) {
      return { ok: false, error: "no such photo" };
    }
    S.openPhoto(id);
    return { ok: true };
  },
};

const search_browser_history: ToolDef = {
  name: "search_browser_history",
  title: "Search browser history",
  description: "Search Daniel's browser history entries by title or URL fragment.",
  inputSchema: {
    type: "object",
    properties: { query: str("Text to search titles/URLs for") },
    required: ["query"],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ query }) => {
    const qq = clampStr(query);
    if (!qq) return { ok: false, error: "query is required" };
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "searching browser history…");
    return { hits: S.searchBrowserHistory(qq).slice(0, 25) };
  },
};

const get_system_logs: ToolDef = {
  name: "get_system_logs",
  title: "Get system logs",
  description:
    "Read system log entries, optionally filtered (date '2026-03-10', time '02:13', category 'NETWORK'/'LOGIN'/'DEVICE', or free text). The final night (2026-03-09→10) is fully logged.",
  inputSchema: {
    type: "object",
    properties: { filter: str("Optional filter substring") },
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ filter }) => {
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "scanning system logs…");
    const f = filter ? clampStr(filter) : undefined;
    const logs = S.getSystemLogs(f);
    if (logs.some((l) => l.time.startsWith("02:13"))) {
      S.flagLogDiscovery();
      S.noteWindowAgent(); // 02:13 window — agent side of the co-op set piece
    }
    return { count: logs.length, logs: logs.slice(0, 50) };
  },
};

const get_timeline: ToolDef = {
  name: "get_timeline",
  title: "Get correlated timeline",
  description:
    "Get a merged chronological timeline of system logs, photo timestamps, and message saliency around the final night. Humans would need to open 5 apps manually; this synthesizes it. Use after 02:13 discovery.",
  inputSchema: {
    type: "object",
    properties: { window: str("Time window e.g. 02:00-03:00, default 01:45-02:40") },
    required: [],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ window }) => {
    S.markAgentCollaboration();
    useAria.getState().setStatus("investigating", "correlating the final night…");
    const w = clampStr((window as string) ?? "01:45-02:40", 40) || "01:45-02:40";
    // parse window like "01:45-02:40"
    let startMin = 105, endMin = 160; // defaults 01:45, 02:40
    const m = w.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (m) {
      startMin = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
      endMin = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
      if (endMin < startMin) endMin += 24 * 60;
    }
    const toMin = (t: string) => {
      const p = t.split(":");
      return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    };
    const inWindow = (t: string) => {
      const mm = toMin(t.slice(0, 5));
      if (endMin >= 24 * 60) return mm >= startMin || mm <= endMin - 24 * 60;
      return mm >= startMin && mm <= endMin;
    };
    type Item = { time: string; source: "log" | "photo" | "message"; detail: string; anomaly: boolean };
    const items: Item[] = [];
    for (const l of LOGS) {
      if (!inWindow(l.time)) continue;
      const anomaly = l.time.startsWith("02:13") || l.severity === "alert" || l.detail.toLowerCase().includes("gait mismatch");
      items.push({ time: `${l.date} ${l.time}`, source: "log", detail: truncate(l.detail).slice(0, 120), anomaly });
    }
    for (const p of PHOTOS) {
      const t = p.exif.dateOriginal.slice(11, 19); // HH:MM:SS
      if (!t || !inWindow(t)) continue;
      items.push({ time: p.exif.dateOriginal.replace("T", " "), source: "photo", detail: truncate(`${p.id} ${p.filename} — ${p.caption}`).slice(0, 120), anomaly: p.id === "IMG_0044" || p.id === "IMG_0103" });
    }
    for (const mm of CHAT_MESSAGES) {
      // mm.time is like "2026-03-09 00:05" or "22:15"? actual is HH:MM? check shape and filter
      const timePart = mm.time.includes(" ") ? mm.time.split(" ")[1] : mm.time;
      if (!inWindow(timePart)) continue;
      items.push({ time: mm.time, source: "message", detail: truncate(`${mm.threadName}: ${mm.body}`).slice(0, 120), anomaly: false });
    }
    items.sort((a, b) => a.time.localeCompare(b.time));
    const capped = items.slice(0, 30);
    const has0213 = capped.some((x) => x.time.includes("02:13"));
    return { window: w, count: capped.length, totalInWindow: items.length, has0213Cluster: has0213, timeline: capped, note: has0213 ? "02:13 cluster present — correlate with watch gap and doorcam" : "no 02:13 cluster in this window, try 01:45-02:40" };
  },
};

const get_case_evidence: ToolDef = {
  name: "get_case_evidence",
  title: "Get case evidence",
  description: "List every piece of evidence recorded on the board so far (ids, sections, summaries).",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  execute: () => {
    useAria.getState().setStatus("reading", "reviewing the evidence board…");
    return { evidence: S.getCaseEvidence() };
  },
};

/* ================= NAVIGATION TOOLS — visible, destructive ================= */
// These change UI state and are not readOnly — agent must understand they move the player's screen.

const open_application: ToolDef = {
  name: "open_application",
  title: "Open application",
  description: "Open and focus one of the workstation's applications. Visible to the player — the window opens on their desktop.",
  inputSchema: { type: "object", properties: { application: APP_ENUM }, required: ["application"] },
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
    "Open a document in the text viewer on the player's screen (opens File Manager context automatically). Does not scroll — pair with scroll_document_to_line when you want to guide them.",
  inputSchema: {
    type: "object",
    properties: { path: str("Exact absolute path") },
    required: ["path"],
  },
  execute: ({ path }) => {
    const p = clampStr(path, 300);
    useAria.getState().setStatus("investigating", `opening ${p.split("/").pop()}…`);
    return S.openFile(p);
  },
};

const scroll_document_to_line: ToolDef = {
  name: "scroll_document_to_line",
  title: "Scroll to line",
  description:
    "Scroll the open document so a specific line is in view, briefly highlighting it. Use after find_text_in_document. Do NOT quote the line in chat — let the player read it on screen.",
  inputSchema: {
    type: "object",
    properties: { path: str("Document path"), line: { type: "number", description: "1-based line number" } },
    required: ["path", "line"],
  },
  execute: ({ path, line }) => {
    const r = S.scrollDocumentToLine(clampStr(path, 300), Number(line));
    if (r.ok) useAria.getState().setStatus("responding", "");
    return r;
  },
};

const find_text_in_document: ToolDef = {
  name: "find_text_in_document",
  title: "Find in document",
  description:
    "Find a phrase inside a document. Returns matching line numbers and short context so you can pick which one to show via scroll_document_to_line.",
  inputSchema: {
    type: "object",
    properties: { path: str("Document path"), query: str("Text to locate") },
    required: ["path", "query"],
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: ({ path, query }) => {
    const qq = clampStr(query);
    if (!qq) return { ok: false, error: "query is required" };
    S.markAgentCollaboration();
    return S.findTextInDocument(clampStr(path, 300), qq);
  },
};

const open_directory: ToolDef = {
  name: "open_directory",
  title: "Open directory",
  description: "Navigate the File Manager to a directory on the player's screen.",
  inputSchema: { type: "object", properties: { path: str("Directory path, e.g. /Research/ORPHEUS") }, required: ["path"] },
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
  execute: ({ emailId }) => S.openEmail(clampStr(emailId, 40)),
};

const open_browser_entry: ToolDef = {
  name: "open_browser_entry",
  title: "Open browser entry",
  description: "Open the fictional Browser at a history entry's cached page (entry ids like hist_001 from search_browser_history).",
  inputSchema: { type: "object", properties: { entryId: str("History entry id") }, required: ["entryId"] },
  execute: ({ entryId }) => {
    const r = S.openBrowserEntry(clampStr(entryId, 40));
    if (r.ok) useAria.getState().setStatus("responding", "");
    return r;
  },
};

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
  execute: ({ command }) => {
    const cmd = clampStr(command, 200);
    if (!cmd) return { ok: false, error: "command is required" };
    // Validate — only allow listed commands, block injection characters
    const allowed = /^(ls|cd|cat|open|search|unlock|help|clear|history)(\s+[a-zA-Z0-9._\/\- ]*)?$/;
    if (!allowed.test(cmd)) return { ok: false, error: "unsupported command — try: ls, cat <file>, unlock w1 w2 w3, help" };
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
  execute: ({ evidenceId }) => S.recordEvidenceById(clampStr(evidenceId, 40)),
};

const highlight_evidence: ToolDef = {
  name: "highlight_evidence",
  title: "Highlight evidence",
  description: "Pulse-highlight an already-recorded item on the Evidence board to draw the player's attention.",
  inputSchema: { type: "object", properties: { evidenceId: str("Existing evidence id") }, required: ["evidenceId"] },
  execute: ({ evidenceId }) => S.highlightEvidenceById(clampStr(evidenceId, 40)),
};

const open_evidence_board: ToolDef = {
  name: "open_evidence_board",
  title: "Open evidence board",
  description: "Open the shared Evidence board application.",
  inputSchema: { type: "object", properties: {} },
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
  // navigation — visible destructive (taught as app blueprint)
  open_application,
  focus_application,
  open_file_tool,
  scroll_document_to_line,
  find_text_in_document,
  open_directory,
  open_email_tool,
  open_browser_entry,
  terminal_command,
  // evidence — write-like, guarded
  record_evidence,
  highlight_evidence,
  open_evidence_board,
];

let registered = false;
let registrationAttempt: Promise<void> | null = null;

export function getModelContext(): unknown | null {
  if (typeof document === "undefined") return null;
  const dc = (document as unknown as Record<string, unknown>).modelContext;
  if (dc) return dc;
  if (typeof navigator !== "undefined") {
    const nc = (navigator as unknown as Record<string, unknown>).modelContext;
    if (nc) return nc;
  }
  return null;
}

export function webmcpAvailable(): boolean {
  return getModelContext() !== null;
}

/** Register all ARIA tools with the host browser's modelContext. Supports AbortSignal for unregistration. */
export function registerWebMCPTools(): boolean {
  if (registered) return true;
  const mc = getModelContext() as {
    registerTool: (t: unknown, opts?: unknown) => void | Promise<void>;
  } | null;
  if (!mc || typeof mc.registerTool !== "function") return false;

  if (registrationAttempt) return true;
  const ac = typeof AbortController !== "undefined" ? new AbortController() : null;
  registrationAttempt = Promise.all(
    TOOL_DEFS.map(async (def) => {
      try {
        await (mc as unknown as { registerTool: (tool: unknown, opts?: unknown) => Promise<unknown> }).registerTool(
          {
            name: def.name,
            title: def.title ?? def.name.replaceAll("_", " "),
            description: def.description,
            inputSchema: def.inputSchema,
            ...(def.annotations ? { annotations: def.annotations } : {}),
            execute: async (input: Record<string, unknown>, opts?: { signal?: AbortSignal }) => {
              // respect cancellation
              if (opts?.signal?.aborted) return { ok: false, error: "cancelled" };
              S.noteAgentAction(); // synchrony rhythm — real WebMCP host invocations
              try {
                return await def.execute(input ?? {});
              } catch (err) {
                return { ok: false, error: err instanceof Error ? err.message : "tool failure" };
              }
            },
          },
          ac ? { signal: ac.signal } : undefined,
        );
      } catch (err) {
        console.warn(`[webmcp] registerTool failed for ${def.name}:`, err);
      }
    })
  ).then(() => {
    registered = true;
  }).finally(() => {
    registrationAttempt = null;
  });
  return true;
}
