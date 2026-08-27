"use client";

import { useEffect, useRef, useState } from "react";
import { CHAT_MESSAGES, THREADS } from "@/game/data/chatMessages";
import { markThreadRead, messagesThreadBus } from "@/game/services";
import { useOS } from "@/game/state/osStore";
import { sfx } from "@/audio/engine";

/* ============================================================
   MESSAGES — on-device chat threads (Daniel's historic threads).
   Feels like a 90s IRC/ICQ hybrid: thread list + bubble pane,
   distinct from Mail's paper metaphor.
   ============================================================ */

const THREAD_META: Record<string, { status: string; color: string }> = {
  t_sarah: { status: "● grad student — active", color: "text-accent" },
  t_mom: { status: "○ family", color: "text-faint" },
  t_voss: { status: "○ CERN — Geneva", color: "text-faint" },
  t_W: { status: "◆ unknown — no contact", color: "text-amber" },
  t_lab: { status: "○ Bench B · 4 members", color: "text-faint" },
  t_it: { status: "○ automated", color: "text-faint" },
};

export default function MessagesApp() {
  const [active, setActive] = useState<string>("t_sarah");
  const [filter, setFilter] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const readThreadIds = useOS((s) => s.readThreadIds);

  const threads = THREADS.filter(
    (t) =>
      !filter ||
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      CHAT_MESSAGES.some((m) => m.threadId === t.id && m.body.toLowerCase().includes(filter.toLowerCase()))
  );

  const activeMessages = CHAT_MESSAGES.filter((m) => m.threadId === active);
  const activeThread = THREADS.find((t) => t.id === active);

  function openThread(id: string) {
    setActive(id);
    markThreadRead(id);
    sfx.click();
  }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [active]);

  // mark the initially visible thread as seen after a breath
  useEffect(() => {
    const t = setTimeout(() => markThreadRead(active), 800);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    return messagesThreadBus.on((id) => {
      const tid = String(id);
      if (THREADS.some((t) => t.id === tid)) {
        setActive(tid);
        markThreadRead(tid);
      }
    });
  }, []);

  return (
    <div className="flex h-full text-[12px]">
      {/* thread list — left, like ICQ: instant, not formal */}
      <div className="w-[200px] shrink-0 border-r border-line flex flex-col bg-surface">
        <div className="shrink-0 h-[30px] px-2 flex items-center gap-2 border-b border-line bg-surface2">
          <input
            className="field-dark flex-1 px-2 py-1 text-[11px]"
            placeholder="search threads…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="search messages"
          />
        </div>
        <div className="mono-xs text-faint px-2 pt-1.5">MESSAGES — INSTANT</div>
        <div className="text-[8.5px] tracking-[0.12em] text-faint px-2 pb-1.5 border-b border-line">bursts, not letters · {threads.length} threads</div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {threads.map((t) => {
            const isActive = t.id === active;
            const isUnread = !readThreadIds.has(t.id);
            const count = CHAT_MESSAGES.filter((m) => m.threadId === t.id).length;
            const last = CHAT_MESSAGES.filter((m) => m.threadId === t.id).slice(-1)[0];
            const meta = THREAD_META[t.id];
            return (
              <button
                key={t.id}
                onClick={() => openThread(t.id)}
                className={`w-full text-left px-2.5 py-2 border-b border-line/40 flex flex-col gap-0.5 relative ${
                  isActive ? "bg-sel border-l-2 !border-l-accent" : isUnread ? "bg-amber/[0.04] hover:bg-amber/[0.08]" : "hover:bg-surface2"
                }`}
              >
                {isUnread && !isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber" aria-hidden />}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11.5px] truncate ${isActive ? "text-txt font-bold" : isUnread ? "text-txt font-semibold" : "text-dim"}`}>{t.name}</span>
                  <span className="flex items-center gap-1">
                    {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" aria-hidden />}
                    <span className="text-[9px] text-faint shrink-0">{count}</span>
                  </span>
                </div>
                <span className={`text-[9px] tracking-wide ${meta?.color ?? "text-faint"}`}>{meta?.status ?? t.handle}</span>
                {last && (
                  <span className={`text-[10px] truncate mt-0.5 ${isUnread ? "text-dim" : "text-faint opacity-70"}`}>{last.body.slice(0, 44)}</span>
                )}
                {t.id === "t_W" && <span className="text-[8px] tracking-[0.12em] text-amber mt-0.5">UNVERIFIED CONTACT</span>}
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-line bg-surface2 px-2 py-1.5 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-faint">DEVICE · {CHAT_MESSAGES.length} MSGS · OFFLINE</span>
            {(() => { const u = THREADS.length - readThreadIds.size; return u > 0 ? <span className="text-[8px] bg-amber text-black px-1 font-bold">{u} NEW</span> : <span className="text-[8px] text-faint">ALL READ</span>; })()}
          </div>
          {THREADS.length - readThreadIds.size > 0 && (
            <button onClick={() => THREADS.forEach((t) => markThreadRead(t.id))} className="btn-bevel text-[9px] py-0.5 text-faint hover:text-txt w-full">
              MARK ALL READ
            </button>
          )}
        </div>
      </div>

      {/* message pane — right, bubbles distinct from Mail */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#0f1a17]">
        {/* header */}
        <div className="shrink-0 h-[36px] px-3 flex items-center gap-3 border-b border-line bg-surface">
          <div className="w-7 h-7 rounded-full bg-surface2 border border-line grid place-items-center text-[10px] text-dim">
            {activeThread?.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-txt leading-none">{activeThread?.name ?? active}</div>
            <div className="text-[10px] text-faint">{activeThread?.handle} · {activeMessages.length} messages</div>
          </div>
          <span className="text-[9px] tracking-[0.14em] text-faint border border-line px-1.5 py-0.5 hidden sm:block">
            {active === "t_W" ? "UNTRUSTED · NO CONTACT CARD" : "ON-DEVICE HISTORY"}
          </span>
        </div>

        {/* bubbles */}
        <div ref={scroller} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
          {active === "t_lab" && (
            <div className="text-[10px] tracking-[0.12em] text-faint text-center py-1 border-y border-line/40 bg-surface/50">
              ── Bench B — shared lab channel · messages are signed [NAME] ──
            </div>
          )}
          {activeMessages.map((m) => (
            <div key={m.id} className={`flex ${m.outgoing ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-3 py-2 text-[12px] leading-relaxed ${
                  m.outgoing
                    ? "bg-[#1e3a2a] border border-[#2a4a36] text-[#c8ddd2] rounded-[10px] rounded-br-[2px]"
                    : m.threadId === "t_W"
                      ? "bg-[#2a1e16] border border-[#4a3520] text-[#d6c9a8] rounded-[10px] rounded-bl-[2px]"
                      : "bg-surface border border-line text-txt rounded-[10px] rounded-bl-[2px]"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`text-[9px] mt-1 flex items-center gap-1.5 ${m.outgoing ? "text-[#7fae8b] justify-end" : "text-faint"}`}>
                  <span>{m.time}</span>
                  {m.outgoing && <span>✓✓</span>}
                  {!m.outgoing && m.threadId === "t_W" && <span className="text-amber">◆</span>}
                </div>
              </div>
            </div>
          ))}
          {activeMessages.length === 0 && (
            <div className="grid place-items-center h-full text-faint text-[11px]">no messages in this thread</div>
          )}
        </div>

        {/* composer — disabled, history only */}
        <div className="shrink-0 border-t border-line bg-surface p-2 flex items-center gap-2">
          <div className="field-dark flex-1 px-3 py-1.5 text-[11px] text-faint">— history only · device is air-gapped · no sending —</div>
          <span className="text-[9px] tracking-[0.12em] text-faint hidden sm:block">READ-ONLY</span>
        </div>
      </div>
    </div>
  );
}
