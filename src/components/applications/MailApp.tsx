"use client";

import { useEffect, useState } from "react";
import type { Email, MailFolder } from "@/types/game";
import { isMailUnread, mailSelectBus, markEmailRead } from "@/game/services";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   MAIL — folders / list / reading pane
   ============================================================ */

const FOLDERS: { id: MailFolder; label: string }[] = [
  { id: "inbox", label: "INBOX" },
  { id: "sent", label: "SENT" },
  { id: "drafts", label: "DRAFTS" },
  { id: "archive", label: "ARCHIVE" },
  { id: "trash", label: "TRASH" },
];

let EMAILS_CACHE: Email[] = [];

export function primeMailCache(emails: Email[]) {
  EMAILS_CACHE = emails;
}

export default function MailApp() {
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const readMailIds = useOS((s) => s.readMailIds);

  function setFolderByEmail(id: string) {
    const em = EMAILS_CACHE.find((e) => e.id === id);
    if (em) setFolder(em.folder);
  }

  function isUnread(em: Email): boolean {
    if (readMailIds.has(em.id)) return false;
    return !!em.unread;
  }

  useEffect(() => {
    import("@/game/data/emails").then((m) => {
      EMAILS_CACHE = m.EMAILS;
      setEmails([...m.EMAILS]);
    });
    return mailSelectBus.on((id) => {
      setFolderByEmail(String(id));
      setSelectedId(String(id));
      markEmailRead(String(id));
    });
  }, []);

  const list = emails.filter((e) => e.folder === folder);
  const selected = emails.find((e) => e.id === selectedId);
  const unreadCounts: Record<string, number> = {};
  for (const e of emails) if (isUnread(e)) unreadCounts[e.folder] = (unreadCounts[e.folder] ?? 0) + 1;

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-full text-[12px]">
      {/* folders — Mail is formal, like Eudora: folders + counts */}
      <div className="w-[118px] shrink-0 border-r border-line py-2 flex flex-col">
        <div className="mono-xs text-faint px-2 pb-1 tracking-[0.16em]">MAIL — FORMAL</div>
        <div className="text-[8.5px] tracking-[0.12em] text-faint px-2 pb-2">headers matter</div>
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFolder(f.id); sfx.click(); }}
            className={`block w-full text-left px-2.5 py-[3px] flex items-center justify-between cursor-pointer ${folder === f.id ? "bg-sel text-accent" : "text-dim hover:text-txt"}`}
          >
            <span>▤ {f.label} <span className="text-faint">({emails.filter((e) => e.folder === f.id).length})</span></span>
            {unreadCounts[f.id] ? <span className="text-[9px] bg-amber text-black px-1 leading-none py-0.5 font-bold">{unreadCounts[f.id]}</span> : null}
          </button>
        ))}
        <div className="mt-auto border-t border-line mx-2 pt-2">
          {totalUnread > 0 ? (
            <button
              onClick={() => { emails.forEach((e) => markEmailRead(e.id)); sfx.click(); }}
              className="w-full btn-bevel text-[9px] py-1 text-faint hover:text-txt"
            >
              MARK ALL READ
            </button>
          ) : (
            <div className="text-[9px] tracking-[0.12em] text-faint text-center py-1">ALL CAUGHT UP</div>
          )}
          <div className="text-[8.5px] text-faint text-center mt-1">{totalUnread} unread · local delivery</div>
        </div>
      </div>

      {/* list — Mail is formal, paper-routed; show date, excerpt, and a blue dot for unread */}
      <div className="w-[280px] shrink-0 border-r border-line overflow-y-auto">
        {list.length === 0 && <div className="p-3 text-faint text-[11px]">empty</div>}
        {list.map((em) => {
          const unread = isUnread(em);
          const isSel = selectedId === em.id;
          return (
            <button
              key={em.id}
              onClick={() => { setSelectedId(em.id); markEmailRead(em.id); sfx.click(); }}
              className={`block w-full text-left px-2.5 py-2 border-b border-line text-left relative ${
                isSel ? "bg-sel" : unread ? "bg-surface hover:bg-surface2" : "hover:bg-surface"
              }`}
            >
              {unread && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber" aria-hidden />}
              <div className="flex justify-between gap-2 items-start">
                <span className={`truncate text-[11px] ${unread ? "text-txt font-bold" : "text-dim"} ${isSel ? "!text-txt" : ""}`}>{em.from}</span>
                <span className="text-[9.5px] text-faint shrink-0 font-mono">{em.date.slice(5)}</span>
              </div>
              <div className={`truncate text-[11.5px] leading-tight mt-0.5 ${unread ? "text-txt" : "text-dim"} ${isSel ? "!text-accent" : ""}`}>{em.subject}</div>
              <div className="truncate text-[10.5px] text-faint mt-1 leading-snug opacity-80">
                {em.body.split("\n").find((l) => l.trim().length > 12)?.slice(0, 62).trim() ?? ""}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {em.attachments?.length ? <span className="text-[8.5px] text-amber tracking-wide">▣ {em.attachments.length} ATTACHMENT</span> : null}
                {unread && <span className="text-[8px] tracking-[0.14em] text-amber font-bold ml-auto">● NEW</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* reading pane — paper, distinct from Files' dense listing */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-[#f0ebe0]/[0.025]">
        {selected ? (
          <div className="p-4">
            <div className="border-b border-line pb-2 mb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[14px] text-txt leading-tight">{selected.subject}</div>
                <span className="text-[9px] tracking-[0.14em] text-faint border border-line px-1.5 py-0.5 shrink-0 hidden sm:block">
                  {selected.folder.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-dim mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <span>FROM <span className="text-txt">{selected.from}</span> &lt;{selected.fromEmail}&gt;</span>
              </div>
              <div className="text-[11px] text-faint flex flex-wrap gap-x-3">
                <span>TO {selected.to}</span>
                <span>·</span>
                <span className="font-mono text-[10.5px]">{selected.date}</span>
                {isUnread(selected) && <span className="text-amber font-bold">● UNREAD</span>}
              </div>
              {selected.attachments?.length ? (
                <div className="mt-2 flex gap-2">
                  {selected.attachments.map((a) => (
                    <span key={a.name} className="panel-inset px-2 py-0.5 text-[10px] text-amber">▣ {a.name}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <pre className="whitespace-pre-wrap font-[inherit] leading-[1.7] text-txt selection:bg-amber/20">{selected.body}</pre>
            <div className="mt-4 pt-3 border-t border-line/40 text-[9px] tracking-[0.12em] text-faint flex justify-between">
              <span>MESSAGE ID {selected.id} · {selected.date}</span>
              <span className="hidden sm:inline">LOCAL DELIVERY · NO NETWORK</span>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center h-full text-faint text-[11px] gap-2 p-4">
            <div className="text-center">
              <div className="text-[11px] tracking-[0.16em] text-faint">NO MESSAGE SELECTED</div>
              <div className="text-[10px] text-dim mt-1">select a message from the list — timestamps are evidence</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
