"use client";

import { useEffect, useRef, useState } from "react";
import * as S from "@/game/services";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";
import { termRunBus } from "@/webmcp/register";

/* ============================================================
   TERMINAL — simulated shell with real commands.
   `unlock` is the vault.
   ============================================================ */

interface Line {
  text: string;
  cls?: string;
}

const HELP = `available commands:
  ls [path]          list directory
  cd <path>          change directory (.. supported)
  cat <file>         print file contents
  open <path>        open in the graphical viewer
  search <text>      search filenames + contents
  unlock <w> <w> <w> attempt vestibule decryption
  history            command history
  clear              clear screen
  help               this text`;

export default function TerminalApp() {
  const [cwd, setCwd] = useState("/");
  const [lines, setLines] = useState<Line[]>([
    { text: "MCDUFF PERSONAL COMPUTING SYSTEM — terminal", cls: "text-faint" },
    { text: "session: INVESTIGATOR (restricted)", cls: "text-faint" },
    { text: "type 'help' for commands", cls: "text-dim" },
    { text: "" },
  ]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const os = useOS();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  // service-driven runs (WebMCP terminal_command) — fromAgent: don't count as human action
  useEffect(() => {
    return termRunBus.on((cmd) => runLine(String(cmd), true, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function push(...ls: Line[]) {
    setLines((prev) => [...prev.slice(-400), ...ls]);
  }

  function resolve(pathArg: string): string {
    if (!pathArg) return cwd;
    let p = pathArg;
    if (!p.startsWith("/")) p = (cwd === "/" ? "" : cwd) + "/" + p;
    // resolve ..
    const parts: string[] = [];
    for (const seg of p.split("/")) {
      if (seg === "" || seg === ".") continue;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    }
    return "/" + parts.join("/");
  }

  function visibleChildren(path: string) {
    return S.fsChildren(path);
  }

  function cat(pathArg: string) {
    const p = resolve(pathArg);
    const node = S.fsGet(p);
    if (!node) { push({ text: `cat: ${p}: no such object`, cls: "text-alert" }); sfx.error(); return; }
    if (node.kind === "dir") { push({ text: `cat: ${p}: is a directory`, cls: "text-amber" }); return; }
    if (node.encrypted) {
      push({ text: `${node.name}: AES-256 sealed container`, cls: "text-amber" });
      push({ text: "hint found in system notes: 'three words, in order. begin with the light.'", cls: "text-dim" });
      push({ text: "usage: unlock <word1> <word2> <word3>", cls: "text-dim" });
      sfx.error();
      return;
    }
    if (node.requiresUnlock && !os.vaultUnlocked) { push({ text: "sealed — vestibule archive must be decrypted first", cls: "text-amber" }); return; }
    if (!node.content) { push({ text: `(binary object: ${node.name})`, cls: "text-dim" }); return; }
    push({ text: node.content });
    S.openFile(p); // also open graphically so the player can read comfortably
  }

  function runUnlock(words: string[]) {
    const r = S.attemptVault(words.slice(0, 3));
    if (r.result === "success") {
      push({ text: r.message, cls: "text-accent" });
      sfx.chime();
      os.pushToast({ app: "SYSTEM", title: "VESTIBULE DECRYPTED", body: "/Private contents unlocked" });
    } else if (r.result === "decoy") {
      push({ text: r.message, cls: "text-amber" });
      sfx.click();
    } else {
      push({ text: r.message, cls: "text-alert" });
      sfx.error();
    }
  }

  function runLine(raw: string, echo = true, fromAgent = false) {
    const cmd = raw.trim();
    if (!cmd) { if (echo) push({ text: "" }); return; }
    if (!fromAgent) S.noteHumanAction(); // human-typed commands feed the synchrony rhythm
    if (echo) {
      push({ text: `investigator@mcduff-wks01:${cwd}$ ${cmd}`, cls: "text-accentdim" });
      setHist((h) => [...h, cmd]);
      sfx.keyClick();
    }
    const [verb, ...rest] = cmd.split(/\s+/);
    switch (verb.toLowerCase()) {
      case "help": push({ text: HELP, cls: "text-dim" }); break;
      case "clear": setLines([]); break;
      case "pwd": push({ text: cwd }); break;
      case "whoami": push({ text: "investigator (authorized) · previous user DANIEL_MCDUFF [deceased]", cls: "text-dim" }); break;
      case "date": push({ text: "2026-03-10 · local time drifting since last sync", cls: "text-dim" }); break;
      case "sudo": push({ text: "daniel was the only administrator.", cls: "text-amber" }); break;
      case "history": hist.forEach((h, i) => push({ text: ` ${String(i + 1).padStart(3)}  ${h}`, cls: "text-dim" })); break;
      case "ls": {
        const p = resolve(rest[0]);
        const kids = visibleChildren(p);
        if (!S.fsGet(p)) { push({ text: `ls: ${p}: not found`, cls: "text-alert" }); break; }
        if (kids.length === 0) { push({ text: "(empty)", cls: "text-faint" }); break; }
        push({ text: kids.map((k) => (k.kind === "dir" ? k.name + "/" : k.name)).join("   ") });
        break;
      }
      case "cd": {
        const p = resolve(rest[0] ?? "/");
        const node = S.fsGet(p);
        if (!node || node.kind !== "dir") { push({ text: `cd: ${p}: not a directory`, cls: "text-alert" }); sfx.error(); }
        else setCwd(p);
        break;
      }
      case "cat": cat(rest[0] ?? ""); break;
      case "open": {
        const p = resolve(rest[0] ?? "");
        const r = S.openFile(p);
        if (!r.ok && r.error) { push({ text: `open: ${r.error}`, cls: "text-amber" }); }
        else push({ text: `opening ${p} …`, cls: "text-dim" });
        break;
      }
      case "search": {
        const q = rest.join(" ").toLowerCase();
        if (!q) { push({ text: "usage: search <text>", cls: "text-dim" }); break; }
        const hits = S.fsList().filter(
          (n) =>
            !(n.hiddenUntilFlag && !os.flags.has(n.hiddenUntilFlag)) &&
            !(n.requiresUnlock && !os.vaultUnlocked) &&
            (n.name.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q))
        );
        if (hits.length === 0) push({ text: `no matches for '${q}'`, cls: "text-dim" });
        else hits.slice(0, 12).forEach((h) => push({ text: `${h.kind === "dir" ? "/" : ""}${h.path}` }));
        break;
      }
      case "unlock": runUnlock(rest); break;
      default:
        push({ text: `${verb}: command not found (try 'help')`, cls: "text-alert" });
        sfx.error();
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { runLine(input); setInput(""); setHistIdx(-1); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = histIdx < 0 ? hist.length - 1 : Math.max(0, histIdx - 1);
      if (hist[i]) { setInput(hist[i]); setHistIdx(i); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = histIdx + 1;
      if (i < hist.length) { setInput(hist[i]); setHistIdx(i); } else { setInput(""); setHistIdx(-1); }
    } else sfx.typeTick();
  }

  return (
    <div className="flex flex-col h-full text-[12px]" onClick={() => (document.getElementById("term-input") as HTMLInputElement)?.focus()}>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 leading-[1.5]">
        {lines.map((l, i) => (
          <div key={i} className={`boot-line whitespace-pre-wrap ${l.cls ?? "text-txt"}`}>{l.text || "\u00A0"}</div>
        ))}
      </div>
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-line bg-surface">
        <span className="text-accentdim shrink-0">investigator@mcduff-wks01:{cwd}$</span>
        <input
          id="term-input"
          className="flex-1 bg-transparent outline-none text-txt font-[inherit]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          aria-label="terminal input"
          autoFocus
        />
      </div>
    </div>
  );
}
