"use client";

import { useEffect, useState } from "react";
import { useAria } from "@/game/state/ariaStore";
import { TOOL_DEFS, webmcpAvailable } from "@/webmcp/register";

/* ============================================================
   AGENT LINK PANEL — judge/dev console.
   Lists every registered WebMCP tool and lets you execute any
   of them manually against the live machine. Open with the
   LINK button in the tray or Ctrl+`.
   ============================================================ */

export default function AgentLinkPanel({ onClose }: { onClose: () => void }) {
  const [available, setAvailable] = useState(false);
  const [selected, setSelected] = useState<string>(TOOL_DEFS[0].name);
  const [args, setArgs] = useState("{}");
  const [output, setOutput] = useState("—");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "read" | "nav" | "evidence">("all");
  const status = useAria((s) => s.status);

  useEffect(() => { setAvailable(webmcpAvailable()); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  const def = TOOL_DEFS.find((t) => t.name === selected)!;

  async function run() {
    setBusy(true);
    setOutput("…");
    try {
      const input = JSON.parse(args || "{}");
      const result = await def.execute(input as Record<string, unknown>);
      setOutput(JSON.stringify(result, null, 2).slice(0, 4000));
    } catch (e) {
      setOutput(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(false);
  }

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
          <span className={available ? "text-accent" : "text-amber"}>
            {available ? "● WEBMCP HOST DETECTED — tools are registered to document.modelContext" : "○ NO WEBMCP HOST — tools callable locally (LINK console)"}
          </span>
          <span className="text-faint"> · AGENT STATUS: {status.toUpperCase()} · {TOOL_DEFS.length} TOOLS · BUDGETS: 500 desc / 150 param / 1.5k out</span>
          <div className="mt-1 flex gap-1">
            {(["all", "read", "nav", "evidence"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-1.5 py-0.5 text-[9px] tracking-[0.12em] border ${filter === f ? "bg-sel text-accent border-accentdim" : "text-faint border-line"}`}>{f.toUpperCase()}</button>
            ))}
            <span className="ml-auto text-[9px] text-faint">◇ readOnly · ◆ nav/write · ⚑ untrusted</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-[240px_1fr]">
          <div className="border-r border-line overflow-y-auto py-1">
            {TOOL_DEFS.filter((t) => {
              if (filter === "all") return true;
              if (filter === "read") return !!t.annotations?.readOnlyHint;
              if (filter === "nav") return !t.annotations?.readOnlyHint && !t.name.startsWith("record") && !t.name.startsWith("highlight");
              if (filter === "evidence") return t.name.includes("evidence");
              return true;
            }).map((t) => (
              <button
                key={t.name}
                onClick={() => { setSelected(t.name); setArgs(defaultArgs(t)); }}
                className={`block w-full text-left px-3 py-[3px] text-[11px] truncate flex items-center gap-1 ${
                  selected === t.name ? "bg-sel text-accent" : "text-dim hover:text-txt"
                }`}
                title={t.title ?? t.name}
              >
                <span>{t.annotations?.readOnlyHint ? "◇" : "◆"}</span><span className="truncate">{t.name}</span>{t.annotations?.untrustedContentHint && <span className="text-amber text-[9px]">⚑</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-col min-h-0 p-3 gap-2">
            <div className="text-[11px] text-dim leading-snug max-h-[72px] overflow-y-auto">{def.description}</div>
            <textarea
              className="field-dark text-[11.5px] p-2 h-[110px] resize-none"
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              spellCheck={false}
            />
            <div className="flex items-center gap-2">
              <button className="btn-bevel text-[11px] px-4" disabled={busy} onClick={run}>
                {busy ? "RUNNING…" : "EXECUTE"}
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

function defaultArgs(t: (typeof TOOL_DEFS)[number]): string {
  const props = ((t.inputSchema as { properties?: Record<string, unknown> }).properties) ?? {};
  const obj: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    const schema = v as { enum?: string[]; type: string };
    obj[k] = schema.enum ? schema.enum[0] : schema.type === "number" ? 1 : schema.type === "array" ? ["msg_0001"] : "";
  }
  if (t.name === "scroll_document_to_line") return JSON.stringify({ path: "/Research/ORPHEUS/anomaly_notes.txt", line: 184 });
  if (t.name === "find_text_in_document") return JSON.stringify({ path: "/Research/ORPHEUS/anomaly_notes.txt", query: "02:13" });
  if (t.name === "get_image_metadata") return JSON.stringify({ photoId: "DSC04821" });
  if (Object.keys(obj).length === 0) return "{}";
  return JSON.stringify(obj);
}
