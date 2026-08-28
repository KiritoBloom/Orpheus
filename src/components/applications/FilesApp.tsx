"use client";
/* eslint-disable react-hooks/purity -- seek animation jitter uses Math.random intentionally */

import { useEffect, useState } from "react";
import type { FsNode } from "@/types/game";
import * as S from "@/game/services";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   FILE MANAGER — dense two-pane browser with STATUS column
   ============================================================ */

const QUICK: { label: string; path: string }[] = [
  { label: "ROOT", path: "/" },
  { label: "RESEARCH", path: "/Research" },
  { label: "PERSONAL", path: "/Personal" },
  { label: "PROJECTS", path: "/Projects" },
  { label: "PHOTOS", path: "/Photos" },
  { label: "SYSTEM", path: "/System" },
];

export default function FilesApp() {
  const [cwd, setCwd] = useState("/");
  const [sel, setSel] = useState<string | null>(null);
  const [seeking, setSeeking] = useState(false);
  const os = useOS();
  const items = S.fsChildren(cwd).sort((a, b) => {
    if (a.kind === "dir" && b.kind !== "dir") return -1;
    if (b.kind === "dir" && a.kind !== "dir") return 1;
    return a.name.localeCompare(b.name);
  });
  const selectedNode = items.find((item) => item.path === sel);

  // subtle seek delay — sells that this is a real volume, not instant web nav
  function seekTo(path: string) {
    if (path === cwd) return;
    setSeeking(true);
    setTimeout(() => {
      setCwd(path);
      setSel(null);
      setSeeking(false);
    }, 90 + Math.random() * 40);
  }

  // service-driven navigation (open_directory)
  useEffect(() => {
    return S.filesNavigateBus.on((p) => {
      const path = String(p);
      if (S.fsGet(path)) {
        setSeeking(true);
        setTimeout(() => {
          setCwd(path);
          setSeeking(false);
          sfx.click();
        }, 90 + Math.random() * 40);
      }
    });
  }, []);

  function open(node: FsNode) {
    S.noteHumanAction(); // human-driven navigation — synchrony rhythm
    sfx.click();
    if (node.encrypted) {
      os.pushToast({ app: "FILES", title: node.name, body: "ACCESS DENIED — encrypted container (3-word passphrase)" });
      sfx.error();
      return;
    }
    if (node.kind === "dir") { seekTo(node.path); return; }
    if (node.kind === "img" && node.photoId) { S.openPhoto(node.photoId); return; }
    S.openFile(node.path);
  }

  function up() {
    if (cwd === "/") return;
    const parent = cwd.slice(0, cwd.lastIndexOf("/")) || "/";
    seekTo(parent);
    sfx.click();
  }

  const KIND_LABEL: Record<string, string> = { txt: "TEXT", csv: "DATA", pdf: "PDF", enc: "SEALED", sys: "SYS", img: "IMAGE", dir: "DIR" };

  return (
    <div className="flex h-full text-[13px]">
      {/* sidebar */}
      <div className="w-[130px] shrink-0 border-r border-line py-2">
        <div className="mono-xs text-faint px-2 pb-1">LOCATIONS</div>
        {QUICK.map((q) => (
          <button
            key={q.path}
            className={`block w-full text-left px-2.5 py-[3px] text-[11px] cursor-pointer ${cwd === q.path ? "bg-sel text-accent" : "text-dim hover:text-txt"}`}
            onClick={() => { seekTo(q.path); sfx.click(); }}
          >
            ▤ {q.label}
          </button>
        ))}
        {os.flags.has("FOUND_PRIVATE_HINT") && (
          <>
            <div className="mono-xs text-faint px-2 pt-2 pb-1">DISCOVERED</div>
            <button
              className={`block w-full text-left px-2.5 py-[3px] text-[11px] cursor-pointer ${cwd.startsWith("/Private") ? "bg-sel text-accent" : "text-amber hover:text-txt"}`}
              onClick={() => { seekTo("/Private"); sfx.click(); }}
            >
              ▨ PRIVATE
            </button>
            {os.flags.has("VAULT_DECOY") && (
              <button className="block w-full text-left px-2.5 py-[3px] text-[10px] text-dim hover:text-txt cursor-pointer"
                onClick={() => { seekTo("/Private/_fragments_recovered"); sfx.click(); }}>
                └ _fragments…
              </button>
            )}
          </>
        )}
      </div>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* toolbar — breadcrumb that sells a real FS */}
        <div className="shrink-0 h-[30px] flex items-center gap-2 px-2 border-b border-line bg-surface">
          <button className="btn-bevel text-[10px] cursor-pointer" onClick={up} disabled={cwd === "/"}>▲ UP</button>
          <button className="btn-bevel text-[10px] cursor-pointer" onClick={() => selectedNode && open(selectedNode)} disabled={!selectedNode}>OPEN</button>
          <span className="text-[11px] tracking-wide text-txt truncate flex-1">{cwd}</span>
          {seeking && <span className="text-[9px] tracking-[0.14em] text-amber animate-pulse shrink-0">SEEK…</span>}
        </div>

        {/* column header */}
        <div className="grid grid-cols-[minmax(0,2.4fr)_70px_120px_60px_86px] shrink-0 px-2 h-[26px] items-center mono-xs text-faint border-b border-line bg-surface2">
          <span>NAME</span><span>TYPE</span><span>MODIFIED</span><span>SIZE</span><span>STATUS</span>
        </div>

        {/* listing */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {cwd === "/" && !os.flags.has("FOUND_GUIDE") && (
            <div className="mx-2 mt-2 mb-1 px-2 py-1.5 text-[10px] leading-relaxed text-amber border border-amber/30 bg-amber/10">
              ★ START HERE: open <span className="text-txt">SYSTEM / FIELD_GUIDE.txt</span> — how to play &amp; how to work with ARIA. Then read <span className="text-txt">readme_first.txt</span>.
            </div>
          )}
          {cwd === "/" && os.flags.has("FOUND_GUIDE") && (
            <div className="mx-2 mt-2 mb-1 px-2 py-1.5 text-[10px] leading-relaxed text-accentdim border border-line bg-surface2">
              TIP: Files → System → FIELD_GUIDE.txt is your handbook. Select an item, then press OPEN; double-click also works.
            </div>
          )}
          {items.map((n) => (
            <button
              key={n.path}
              onDoubleClick={() => open(n)}
              onClick={() => { setSel(n.path); sfx.click(); }}
              onKeyDown={(e) => { if (e.key === "Enter") open(n); }}
              className={`file-row w-full grid grid-cols-[minmax(0,2.4fr)_70px_120px_60px_86px] px-2 h-[29px] items-center text-left border-b border-line/40 ${
                sel === n.path ? "bg-sel text-txt border-l-2 !border-l-accent" : "text-txt hover:bg-surface2"
              }`}
              tabIndex={0}
            >
              <span className={`truncate ${n.kind === "dir" ? "text-accentdim" : ""} ${n.encrypted ? "text-amber" : ""}`}>
                {n.kind === "dir" ? "▸ " : n.encrypted ? "▣ " : n.kind === "img" ? "▦ " : "· "}
                {n.name}
              </span>
              <span className="text-faint text-[10px]">{KIND_LABEL[n.kind]}</span>
              <span className="text-faint text-[10px]">{n.modified}</span>
              <span className="text-faint text-[10px]">{n.kind === "dir" ? "—" : `${n.sizeKb} KB`}</span>
              <span className={`text-[9px] tracking-[0.1em] ${n.encrypted ? "text-alert" : n.hiddenUntilFlag || n.requiresUnlock ? "text-amber" : "text-faint"}`}>
                {n.encrypted ? "LOCKED" : n.requiresUnlock ? "UNLOCKED" : "OK"}
              </span>
            </button>
          ))}
          {items.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-[11px] tracking-[0.22em] text-faint">THIS FOLDER IS EMPTY</div>
              <div className="text-[10px] tracking-[0.14em] text-dim mt-1">no objects — try another location or check Private after vault</div>
            </div>
          )}
        </div>

        {/* status bar */}
        <div className="shrink-0 h-[20px] px-2 flex items-center justify-between border-t border-line bg-surface text-[9.5px] text-faint">
          <span>{items.length} OBJECT(S)</span>
          <span>MCDUFF-WKS01 · VOLUME 0 · NTFS-LIKE · AIR-GAPPED</span>
        </div>
      </div>
    </div>
  );
}
