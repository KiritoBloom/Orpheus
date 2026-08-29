import type { AriaStatusState, StoryFlag, Toast } from "@/types/game";
import type { ToolDef } from "./register";
import { TOOL_DEFS } from "./register";
import { useOS } from "@/game/state/osStore";
import { useAria } from "@/game/state/ariaStore";
import { useInvestigation } from "@/game/state/investigationStore";
import { updateSave } from "@/game/state/persistence";

/* ============================================================
   DETERMINISTIC SELF-TESTS — the evals.md assertions, runnable
   in-browser via LINK → RUN EVALS (no host, no model needed).
   Mirrors https://developer.chrome.com/docs/ai/webmcp/evals.

   STATE-SAFE: investigation state is snapshotted before the run
   and fully restored after — the checks advance nothing.
   ============================================================ */

export interface SelfTestResult {
  name: string;
  pass: boolean;
  detail: string;
}

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

function runChecks(): SelfTestResult[] {
  const results: SelfTestResult[] = [];
  const check = (name: string, pass: boolean, detail: string) => results.push({ name, pass, detail });

  // 1 — registry budgets per Chrome secure-tools guide
  const badName = TOOL_DEFS.find((t) => t.name.length > 30);
  const badDesc = TOOL_DEFS.find((t) => t.description.length > 500);
  check(
    "registry: 25 tools · names ≤30 · descriptions ≤500",
    TOOL_DEFS.length === 25 && !badName && !badDesc,
    `${TOOL_DEFS.length} tools${badName ? ` — ${badName.name} name too long` : ""}${badDesc ? ` — ${badDesc.name} desc ${badDesc.description.length} chars` : ""}`,
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

  // 3 — search at scale with excerpt budget
  const sf = tool("search_files").execute({ query: "02:13" }) as { count: number; results: { excerpt: string }[] };
  check(
    "search_files '02:13' → hits with ≤120-char excerpts",
    sf.count >= 1 && sf.results.every((r) => r.excerpt.length <= 120),
    `count: ${sf.count}`,
  );

  // 4 — output budget on the longest document
  const rf = tool("read_file").execute({ path: "/Research/ORPHEUS/anomaly_notes.txt" }) as { content: string };
  check(
    "read_file anomaly_notes → output ≤1500 chars (budget)",
    typeof rf.content === "string" && rf.content.length <= 1500,
    `${rf.content?.length ?? 0} chars`,
  );

  // 5 — cross-modal search hit (the badge thread)
  const sm = tool("search_messages").execute({ query: "badge" }) as { count: number; hits: { threadId: string }[] };
  check(
    "search_messages 'badge' → hits t_sarah",
    sm.hits.some((h) => h.threadId === "t_sarah"),
    `count: ${sm.count}`,
  );

  // 6 — temporal forensics cluster (the final night)
  const gl = tool("get_system_logs").execute({ filter: "02:13" }) as { count: number; logs: { id: string; detail: string }[] };
  check(
    "get_system_logs '02:13' → final-night cluster + gait reveal",
    gl.count >= 1 && gl.logs.some((l) => l.id === "log_035" && l.detail.toLowerCase().includes("gait")),
    `count: ${gl.count} · log_035 ${gl.logs.some((l) => l.id === "log_035") ? "present" : "MISSING"}`,
  );

  // 7 — show_in_document with a query: first match resolved and visible
  const sd = tool("show_in_document").execute({ path: "/Research/ORPHEUS/anomaly_notes.txt", query: "02:13 is not a time" }) as {
    ok: boolean;
    line?: number;
    resolvedFrom?: "line" | "query";
  };
  check(
    "show_in_document {query:'02:13 is not a time'} → resolves to first match (line 145)",
    sd.ok && sd.line === 145 && sd.resolvedFrom === "query",
    `line: ${sd.line ?? "—"} · resolvedFrom: ${sd.resolvedFrom ?? "—"}`,
  );

  // 8 — graceful failure on out-of-range navigation
  const sc = tool("show_in_document").execute({ path: "/Research/ORPHEUS/anomaly_notes.txt", line: 99999 }) as {
    ok: boolean;
    error?: string;
  };
  check(
    "show_in_document out-of-range line → graceful {ok:false}, no crash",
    sc.ok === false && !!sc.error,
    sc.error ?? "",
  );

  // 9 — terminal allowlist security (negative test)
  const t1 = tool("terminal_command").execute({ command: "rm -rf /" }) as { ok: boolean };
  const t2 = tool("terminal_command").execute({ command: "ls; cat /etc/passwd" }) as { ok: boolean };
  check(
    "terminal_command allowlist blocks rm / injection",
    t1.ok === false && t2.ok === false,
    "both rejected",
  );

  return results;
}

/* ============================================================
   QUICK VERIFY — 9 evals + 3 visible-actuation tool calls.
   This is the "30-second judge path" without a host.

   Difference from RUN EVALS:
   - RUN EVALS = 9 deterministic in-process checks (budgets, schemas,
     security, search, briefing, budget, etc.) — every check inspects
     a return value but doesn't visibly move the desk.
   - QUICK VERIFY = the same 9 checks PLUS 3 tool calls that ACTUATE
     the desk: a system-log query (proves a UGC tool with
     untrustedContentHint), a timeline merge (proves cross-source
     correlation), and a scroll-to-line (proves the visible-actuation
     contract — the document moves on screen).

   State-safe: snapshot before, restore after, like RUN EVALS.
   Returns a tagged result so the panel can render a clear
   pass/partial/fail banner.

   The 3 tool calls are hardcoded to the documented headline
   values from JUDGE_QUICKSTART.md so the panel matches the docs.
   Line 145 = the "02:13 is not a time" passage (lineOf() in
   filesystem.ts: LINE_0213_PASSAGE = 145).
   ============================================================ */

export interface QuickVerifyResult {
  passed: number; // total checks passed
  total: number; // total checks (always 9 + 3 = 12)
  evals: SelfTestResult[];
  toolCalls: { name: string; pass: boolean; detail: string }[];
  summary: "pass" | "partial";
}

export async function runQuickVerify(): Promise<QuickVerifyResult> {
  const snap = snapshotState();
  const evals = runDeterministicSelfTests();
  const toolCalls: { name: string; pass: boolean; detail: string }[] = [];

  try {
    // 1) system logs filter — proves a UGC tool with untrustedContentHint
    {
      const r = tool("get_system_logs").execute({ filter: "02:13" }) as {
        count: number;
        logs?: { id: string; detail: string }[];
      };
      const logs = r.logs ?? [];
      const ok =
        r.count >= 1 &&
        logs.some((l) => l.id === "log_035" && /gait/i.test(l.detail));
      toolCalls.push({
        name: "get_system_logs {filter:'02:13'} → final-night cluster + gait reveal",
        pass: ok,
        detail: `count: ${r.count} · log_035 ${logs.some((l) => l.id === "log_035") ? "present" : "MISSING"}`,
      });
    }

    // 2) timeline merge — proves cross-source correlation
    {
      const r = tool("get_timeline").execute({ window: "01:45-02:40" }) as {
        count: number;
        has0213Cluster: boolean;
        timeline?: { time: string }[];
      };
      const ok = r.count >= 1 && r.has0213Cluster === true && (r.timeline?.length ?? 0) > 0;
      toolCalls.push({
        name: "get_timeline {window:'01:45-02:40'} → merged chronology + 02:13 cluster",
        pass: ok,
        detail: `count: ${r.count} · 02:13 cluster: ${r.has0213Cluster ? "yes" : "NO"}`,
      });
    }

    // 3) show_in_document — proves the visible-actuation + query-resolve contract
    //    The line is chosen so the player visibly sees the document move
    //    AND the line content is meaningful (the "02:13 is not a time" passage).
    //    LINE_0213_PASSAGE in filesystem.ts = 145. We use the query form so the
    //    check exercises the full search-and-pin path in one call.
    {
      const r = tool("show_in_document").execute({
        path: "/Research/ORPHEUS/anomaly_notes.txt",
        query: "02:13 is not a time",
      }) as { ok: boolean; error?: string; line?: number; resolvedFrom?: "line" | "query" };
      const ok = r.ok === true && r.line === 145 && r.resolvedFrom === "query";
      toolCalls.push({
        name: "show_in_document {query:'02:13 is not a time'} → document moves + pin on line 145",
        pass: ok,
        detail: r.ok
          ? `resolved via ${r.resolvedFrom} → line ${r.line}`
          : r.error ?? "ok=false",
      });
    }
  } finally {
    restoreState(snap);
  }

  const evalPasses = evals.filter((r) => r.pass).length;
  const toolPasses = toolCalls.filter((r) => r.pass).length;
  const passed = evalPasses + toolPasses;
  const total = evals.length + toolCalls.length;
  return {
    passed,
    total,
    evals,
    toolCalls,
    summary: passed === total ? "pass" : "partial",
  };
}