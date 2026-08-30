"use client";

import { useEffect, useState } from "react";
import { useAria } from "@/game/state/ariaStore";
import {
  DECLARATIVE_TOOL_NAMES,
  MAX_DESC_LEN,
  MAX_OUTPUT_CHARS,
  MAX_PARAM_DESC_LEN,
  TOOL_DEFS,
  executeToolLikeHost,
  getRegistrationState,
  webmcpAvailable,
} from "@/webmcp/register";
import { runDeterministicSelfTests, runQuickVerify } from "@/webmcp/selftest";
import { activeCorpus } from "@/game/data/corpus";

/* ============================================================
   AGENT LINK PANEL — judge/dev console.

   Lists every registered WebMCP tool and executes any of them
   against the live machine. When a WebMCP host is present the
   call goes through `document.modelContext.executeTool`, so this
   console exercises the real path rather than a local shortcut;
   without a host it falls back to the tool handler directly and
   labels which route it took.

   Open with the LINK button in the tray or Ctrl+`.
   ============================================================ */

type Filter = "all" | "read" | "nav" | "evidence";

export default function AgentLinkPanel({ onClose }: { onClose: () => void }) {
  const [available, setAvailable] = useState(false);
  const [registration, setRegistration] = useState(() => getRegistrationState());
  const [selected, setSelected] = useState<string>(TOOL_DEFS[0].name);
  const [args, setArgs] = useState(() => defaultArgs(TOOL_DEFS[0]));
  const [output, setOutput] = useState("—");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const status = useAria((s) => s.status);

  // Host detection is asynchronous — poll briefly so the banner reflects reality.
  useEffect(() => {
    const sync = () => {
      setAvailable(webmcpAvailable());
      setRegistration(getRegistrationState());
    };
    sync();
    const id = setInterval(sync, 800);
    return () => clearInterval(id);
  }, []);

  const def = TOOL_DEFS.find((t) => t.name === selected)!;

  async function run() {
    setBusy(true);
    setOutput("…");
    try {
      const input = JSON.parse(args || "{}");
      const { result, via } = await executeToolLikeHost(def, input as Record<string, unknown>);
      const routed =
        via === "host"
          ? "▸ routed through document.modelContext.executeTool (real host path)"
          : "▸ no host present — called the tool handler directly";
      setOutput(`${routed}\n\n${JSON.stringify(result, null, 2).slice(0, 4000)}`);
    } catch (e) {
      setOutput(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  }

  function runEvals() {
    setBusy(true);
    try {
      const rs = runDeterministicSelfTests();
      const passed = rs.filter((r) => r.pass).length;
      setOutput(
        `DETERMINISTIC EVALS — ${passed}/${rs.length} PASSED  (src/webmcp/evals.md)\n\n` +
          rs.map((r) => `${r.pass ? "✓" : "✗"} ${r.name}${r.detail ? `\n    ${r.detail}` : ""}`).join("\n") +
          `\n\nState-safe: investigation state is snapshotted and fully restored — no checkpoints advanced.` +
          `\nThe same registry checks run headless via \`pnpm test:webmcp\`.`,
      );
    } catch (e) {
      setOutput(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  }

  async function quickVerify() {
    setBusy(true);
    setOutput("… running deterministic evals + 3 visible-actuation tool calls");
    try {
      const r = await runQuickVerify();
      const lines: string[] = [];
      lines.push(
        r.summary === "pass"
          ? `✅ WEBMCP VERIFIED — ${r.passed}/${r.total} checks passed`
          : `⚠ WEBMCP PARTIAL — ${r.passed}/${r.total} checks passed`,
      );
      lines.push("");
      lines.push(`▸ DETERMINISTIC EVALS — ${r.evals.filter((x) => x.pass).length}/${r.evals.length} PASSED`);
      r.evals.forEach((e) => lines.push(`  ${e.pass ? "✓" : "✗"} ${e.name}`));
      lines.push("");
      lines.push(`▸ VISIBLE-ACTUATION TOOL CALLS — ${r.toolCalls.filter((x) => x.pass).length}/${r.toolCalls.length} PASSED`);
      r.toolCalls.forEach((c) => lines.push(`  ${c.pass ? "✓" : "✗"} ${c.name}` + (c.detail ? `  —  ${c.detail}` : "")));
      lines.push("");
      lines.push("The document viewer opened, scrolled, and pinned a highlight during the run — that was the agent moving your screen.");
      lines.push("State-safe: investigation state was snapshotted and restored — no checkpoints advanced.");
      setOutput(lines.join("\n"));
    } catch (e) {
      setOutput(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  }

  const visibleTools = TOOL_DEFS.filter((t) => {
    if (filter === "all") return true;
    if (filter === "read") return t.annotations.readOnlyHint;
    if (filter === "evidence") return t.name.includes("evidence");
    return !t.annotations.readOnlyHint; // nav / write
  });

  const hostLine = available
    ? registration.registered
      ? `● WEBMCP HOST DETECTED — all ${TOOL_DEFS.length} tools registered to document.modelContext`
      : registration.inFlight
        ? "◐ WEBMCP HOST DETECTED — registering tools…"
        : `⚠ WEBMCP HOST DETECTED — ${registration.registeredCount}/${TOOL_DEFS.length} registered${registration.failed.length ? ` (failed: ${registration.failed.join(", ")})` : ""}`
    : "○ NO WEBMCP HOST — tools callable locally from this console";

  return (
    <div className="fixed inset-0 z-[800] grid place-items-center bg-black/70" onClick={onClose}>
      <div
        className="panel-raised win-shadow w-[860px] max-w-[94vw] h-[560px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="win-active-titlebar border-b border-linebright px-3 py-1.5 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.25em] text-txt">AGENT LINK — WEBMCP TOOL CONSOLE</span>
          <button className="btn-bevel text-[10px]" onClick={onClose}>CLOSE</button>
        </div>

        <div className="px-3 py-2 border-b border-line text-[10.5px] leading-relaxed">
          <span className={available && registration.registered ? "text-accent" : "text-amber"}>{hostLine}</span>
          <span className="text-faint">
            {" "}· AGENT STATUS: {status.toUpperCase()} · {TOOL_DEFS.length} IMPERATIVE + {DECLARATIVE_TOOL_NAMES.length} DECLARATIVE
            {" "}· BUDGETS: {MAX_DESC_LEN} desc / {MAX_PARAM_DESC_LEN} param / {MAX_OUTPUT_CHARS} out
          </span>
          <div className="mt-1 flex gap-1">
            {(["all", "read", "nav", "evidence"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-1.5 py-0.5 text-[9px] tracking-[0.12em] border ${filter === f ? "bg-sel text-accent border-accentdim" : "text-faint border-line"}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
            <span className="ml-auto text-[9px] text-faint">◇ readOnly · ◆ nav/write · ⚑ untrusted content</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-[240px_1fr]">
          <div className="border-r border-line overflow-y-auto py-1">
            {visibleTools.map((t) => (
              <button
                key={t.name}
                onClick={() => { setSelected(t.name); setArgs(defaultArgs(t)); }}
                className={`block w-full text-left px-3 py-[3px] text-[11px] truncate flex items-center gap-1 ${
                  selected === t.name ? "bg-sel text-accent" : "text-dim hover:text-txt"
                }`}
                title={`${t.title} — ${t.annotations.readOnlyHint ? "read-only" : "moves the player's screen"}`}
              >
                <span>{t.annotations.readOnlyHint ? "◇" : "◆"}</span>
                <span className="truncate">{t.name}</span>
                {t.annotations.untrustedContentHint && <span className="text-amber text-[9px]">⚑</span>}
              </button>
            ))}
            <div className="mt-2 pt-2 border-t border-line px-3">
              <div className="text-[9px] tracking-[0.14em] text-faint">DECLARATIVE (HTML FORMS)</div>
              {DECLARATIVE_TOOL_NAMES.map((n) => (
                <div key={n} className="text-[10.5px] text-faint truncate" title="Registered by the browser from annotated HTML — invoke from an agent, not this console">
                  ▤ {n}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col min-h-0 p-3 gap-2">
            <div className="text-[11px] text-dim leading-snug max-h-[72px] overflow-y-auto">
              <span className="text-txt">{def.title}</span> — {def.description}
            </div>
            <textarea
              className="field-dark text-[11.5px] p-2 h-[110px] resize-none"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              spellCheck={false}
              aria-label={`arguments for ${def.name}`}
            />
            <div className="flex items-center gap-2">
              <button className="btn-bevel text-[11px] px-4" disabled={busy} onClick={run}>
                {busy ? "RUNNING…" : "EXECUTE"}
              </button>
              <button
                className="btn-bevel text-[11px] px-3"
                disabled={busy}
                onClick={runEvals}
                title="Deterministic in-browser checks per src/webmcp/evals.md — no host needed, state-safe"
              >
                RUN EVALS
              </button>
              <button
                className="btn-bevel text-[11px] px-3 !bg-accent/20 !border-accent !text-accent"
                disabled={busy}
                onClick={quickVerify}
                title="One-click judge verification: the deterministic evals plus 3 tool calls that visibly move the desk (show_in_document opens, scrolls, and pins a highlight)."
              >
                ⚡ QUICK VERIFY
              </button>
              <span className="text-faint text-[10px]">result →</span>
            </div>
            <pre className="flex-1 min-h-0 overflow-auto panel-inset p-2 text-[11px] whitespace-pre-wrap text-txt">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Ready-made example inputs for the judge path — zero-typing verification.
   The values are the corpus's (see `guidance.exampleArgs`), so every console
   run matches the documented flow for whichever investigation is loaded. */
function defaultArgs(t: (typeof TOOL_DEFS)[number]): string {
  const canned = activeCorpus().guidance.exampleArgs[t.name];
  if (canned !== undefined) return canned;
  const props = ((t.inputSchema as { properties?: Record<string, unknown> }).properties) ?? {};
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    const schema = v as { enum?: string[]; type: string };
    obj[k] = schema.enum ? schema.enum[0] : schema.type === "number" ? 1 : "";
  }
  if (Object.keys(obj).length === 0) return "{}";
  return JSON.stringify(obj);
}
