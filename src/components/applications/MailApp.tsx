"use client";

import { useEffect, useState } from "react";
import type { Email, MailFolder } from "@/types/game";
import { mailSelectBus, markEmailRead } from "@/game/services";
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
  const [, force] = useState(0);

  function setFolderByEmail(id: string) {
    const em = EMAILS_CACHE.find((e) => e.id === id);
    if (em) setFolder(em.folder);
  }

  useEffect(() => {
    import("@/game/data/emails").then((m) => {
      EMAILS_CACHE = m.EMAILS;
      setEmails(m.EMAILS);
    });
    return mailSelectBus.on((id) => {
      setFolderByEmail(String(id));
      setSelectedId(String(id));
      markEmailRead(String(id));
      force((n) => n + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = emails.filter((e) => e.folder === folder);
  const selected = emails.find((e) => e.id === selectedId);

  return (
    <div className="flex h-full text-[12px]">
      {/* folders */}
      <div className="w-[110px] shrink-0 border-r border-line py-2">
        <div className="mono-xs text-faint px-2 pb-1">FOLDERS</div>
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFolder(f.id); sfx.click(); }}
            className={`block w-full text-left px-2.5 py-[3px] ${folder === f.id ? "bg-sel text-accent" : "text-dim hover:text-txt"}`}
          >
            ▤ {f.label}
            <span className="text-faint"> ({emails.filter((e) => e.folder === f.id).length})</span>
          </button>
        ))}
      </div>

      {/* list */}
      <div className="w-[280px] shrink-0 border-r border-line overflow-y-auto">
        {list.map((em) => (
          <button
            key={em.id}
            onClick={() => { setSelectedId(em.id); markEmailRead(em.id); force((n) => n + 1); sfx.click(); }}
            className={`block w-full text-left px-2.5 py-1.5 border-b border-line ${
              selectedId === em.id ? "bg-sel" : "hover:bg-surface"
            }`}
          >
            <div className="flex justify-between gap-2">
              <span className={`truncate ${em.unread ? "text-txt font-bold" : "text-dim"}`}>{em.from}</span>
              <span className="text-[9.5px] text-faint shrink-0">{em.date.slice(5)}</span>
            </div>
            <div className={`truncate text-[11px] ${em.unread ? "text-accent" : "text-dim"}`}>{em.subject}</div>
          </button>
        ))}
        {list.length === 0 && <div className="p-3 text-faint text-[11px]">empty</div>}
      </div>

      {/* reading pane */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {selected ? (
          <div className="p-4">
            <div className="border-b border-line pb-2 mb-3">
              <div className="text-[14px] text-txt">{selected.subject}</div>
              <div className="text-[11px] text-dim mt-1">
                FROM {selected.from} &lt;{selected.fromEmail}&gt;
              </div>
              <div className="text-[11px] text-faint">
                TO {selected.to} · {selected.date}
              </div>
              {selected.attachments?.length ? (
                <div className="mt-1.5 flex gap-2">
                  {selected.attachments.map((a) => (
                    <span key={a.name} className="panel-inset px-2 py-0.5 text-[10px] text-amber">▣ {a.name}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <pre className="whitespace-pre-wrap font-[inherit] leading-relaxed text-txt">{selected.body}</pre>
          </div>
        ) : (
          <div className="grid place-items-center h-full text-faint text-[11px]">select a message</div>
        )}
      </div>
    </div>
  );
}
