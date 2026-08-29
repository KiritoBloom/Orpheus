"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as S from "@/game/services";

/* ============================================================
   TEXT DOCUMENT VIEWER — line numbers, search, ARIA scroll.

   Two highlight modes:
   - flash (transient, ~2.4s): a brief amber pulse that fades — the
     "navigated here" indicator, paired with the top-to-bottom nav sweep.
   - pinned (persistent, dismissable): a steady accent background that
     stays until the player clicks, scrolls, types, closes, or a new
     show_in_document call replaces it. This is the "look at this
     specific line and remember" indicator — the agent's durable
     attention pointer.
   ============================================================ */

export default function TextViewerApp() {
  const [path, setPath] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [flashLine, setFlashLine] = useState<number | null>(null);
  const [pinnedLine, setPinnedLine] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [sweep, setSweep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // ignore the synthetic scroll fired by our own scrollIntoView
  const programmaticScrollRef = useRef(false);

  const dismissPinned = useCallback((reason: "user-action" | "new-pin" | "close" = "user-action") => {
    setPinnedLine((cur) => {
      if (cur !== null) S.dismissPinnedHighlight(reason);
      return null;
    });
  }, []);

  useEffect(() => {
    const loadDocument = (state: { path: string; scrollLine?: number; flashLine?: number; pinnedLine?: number }) => {
      const node = S.fsGet(state.path);
      // any new doc → drop the old pin
      setPinnedLine((prev) => {
        if (prev !== null && state.path !== path) S.dismissPinnedHighlight("new-pin");
        return null;
      });
      setPath(state.path);
      setContent(node?.content ?? "");
      S.setCurrentDoc(state.path);
      if (state.scrollLine) {
        setFlashLine(null);
        const target = state.scrollLine;
        programmaticScrollRef.current = true;
        setTimeout(() => {
          const el = lineRefs.current.get(target);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          setFlashLine(target);
          setSweep((s) => s + 1);
          setTimeout(() => setFlashLine((cur) => (cur === target ? null : cur)), 2500);
        }, 80);
      }
      if (typeof state.pinnedLine === "number") {
        // new pin replaces the old one (also dismisses if a viewer-mount happens)
        setPinnedLine(state.pinnedLine);
      }
    };
    const off = S.setDocListener(loadDocument);
    if (S.currentDocPath) loadDocument({ path: S.currentDocPath });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `path` is captured to detect doc changes only
  }, []);

  // when the user takes a manual action inside the viewer, dismiss the pin
  useEffect(() => {
    const onUserScroll = () => {
      if (programmaticScrollRef.current) {
        // the scrollIntoView we just did — ignore
        setTimeout(() => (programmaticScrollRef.current = false), 100);
        return;
      }
      dismissPinned("user-action");
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", onUserScroll, { passive: true });
      container.addEventListener("wheel", () => dismissPinned("user-action"), { passive: true });
      container.addEventListener("mousedown", () => dismissPinned("user-action"));
    }
    return () => {
      container?.removeEventListener("scroll", onUserScroll);
      container?.removeEventListener("wheel", () => dismissPinned("user-action"));
      container?.removeEventListener("mousedown", () => dismissPinned("user-action"));
    };
  }, [dismissPinned]);

  const onFind = (v: string) => {
    setQuery(v);
    dismissPinned("user-action"); // typing in find bar counts as "I'm looking at something else now"
  };

  const lines = content ? content.split("\n") : [];
  const matches = query
    ? lines.map((l, i) => (l.toLowerCase().includes(query.toLowerCase()) ? i + 1 : 0)).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col h-full text-[12px]">
      {/* toolbar */}
      <div className="shrink-0 h-[30px] flex items-center gap-2 px-2 border-b border-line bg-surface">
        <span className="text-[11px] text-txt truncate flex-1">{path || "no document"}</span>
        <input
          className="field-dark w-[150px] px-2 py-0.5 text-[11px]"
          placeholder="find…"
          value={query}
          onChange={(e) => onFind(e.target.value)}
          aria-label="find in document"
        />
        <span className="text-faint text-[10px]">
          {query ? `${matches.length} match(es)` : `${lines.length} lines`}
        </span>
        {pinnedLine !== null && (
          <button
            onClick={() => dismissPinned("user-action")}
            title="Dismiss the line ARIA is pointing at"
            className="btn-bevel text-[9px] px-1.5 py-0.5 !border-accent !text-accent"
          >
            ◆ DISMISS
          </button>
        )}
      </div>

      {/* nav sweep effect when ARIA scrolls */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {sweep > 0 && <div key={sweep} className="nav-sweep" style={{ top: 0 }} />}
        {!path ? (
          <div className="absolute inset-0 grid place-items-center p-8 text-center pointer-events-none">
            <div>
              <div className="text-[11px] tracking-[0.22em] text-faint">OPEN A DOCUMENT FROM FILES</div>
              <div className="text-[10px] tracking-[0.14em] text-dim mt-1">double-click a file or ask ARIA to open one</div>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="absolute inset-0 overflow-auto">
            <div className="min-h-full py-1">
              {lines.map((l, i) => {
                const n = i + 1;
                const isMatch = query && l.toLowerCase().includes(query.toLowerCase());
                const isFlashing = flashLine === n;
                const isPinned = pinnedLine === n;
                return (
                  <div
                    key={n}
                    ref={(el) => { if (el) lineRefs.current.set(n, el); else lineRefs.current.delete(n); }}
                    data-line={n}
                    data-pinned={isPinned ? "true" : undefined}
                    className={`flex ${isFlashing ? "line-flash" : ""} ${isPinned ? "line-pinned" : ""}`}
                  >
                    <div
                      className={`w-[46px] shrink-0 text-right pr-2 select-none text-[10.5px] pt-[1px] ${
                        isPinned ? "text-accent" : "text-faint"
                      }`}
                      style={{ userSelect: "none" }}
                    >
                      {isPinned ? "◆" : "·"} {n}
                    </div>
                    <div
                      className={`flex-1 pr-3 whitespace-pre-wrap leading-[1.5] ${
                        isMatch ? "text-accent" : isPinned ? "text-txt" : "text-txt"
                      }`}
                      style={isMatch && !isPinned ? { background: "rgba(127,174,139,.08)" } : undefined}
                    >
                      {l || "\u00A0"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
