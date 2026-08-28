import type { ToolDef } from "./register";
import { TOOL_DEFS } from "./register";

/* ============================================================
   DETERMINISTIC SELF-TESTS — the evals.md assertions, runnable
   in-browser via LINK → RUN EVALS (no host, no model needed).
   Mirrors https://developer.chrome.com/docs/ai/webmcp/evals.
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

export function runDeterministicSelfTests(): SelfTestResult[] {
  const results: SelfTestResult[] = [];
  const check = (name: string, pass: boolean, detail: string) => results.push({ name, pass, detail });

  // 1 — registry budgets per Chrome secure-tools guide
  const badName = TOOL_DEFS.find((t) => t.name.length > 30);
  const badDesc = TOOL_DEFS.find((t) => t.description.length > 500);
  check(
    "registry: 26 tools · names ≤30 · descriptions ≤500",
    TOOL_DEFS.length === 26 && !badName && !badDesc,
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

  // 7 — document search anchor
  const ft = tool("find_text_in_document").execute({ path: "/Research/ORPHEUS/anomaly_notes.txt", query: "02:13 is not a time" }) as {
    matches: { line: number }[];
  };
  check(
    "find_text_in_document '02:13 is not a time' → line match",
    ft.matches.length >= 1,
    `first match: line ${ft.matches[0]?.line ?? "—"}`,
  );

  // 8 — graceful failure on out-of-range navigation
  const sc = tool("scroll_document_to_line").execute({ path: "/Research/ORPHEUS/anomaly_notes.txt", line: 99999 }) as {
    ok: boolean;
    error?: string;
  };
  check(
    "scroll_document_to_line out-of-range → graceful {ok:false}, no crash",
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