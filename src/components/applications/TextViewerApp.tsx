"use client";

import { useEffect, useRef, useState } from "react";
import * as S from "@/game/services";

/* ============================================================
   TEXT DOCUMENT VIEWER — line numbers, search, ARIA scroll.
   The viewer obeys services; it never reveals content on its own.
   ============================================================ */

export default function TextViewerApp() {
  const [path, setPath] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [flashLine, setFlashLine] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [sweep, setSweep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const loadDocument = (state: { path: string; scrollLine?: number; flashLine?: number }) => {
      const node = S.fsGet(state.path);
      setPath(state.path);
      setContent(node?.content ?? "");
      S.setCurrentDoc(state.path);
      if (state.scrollLine) {
        setFlashLine(null);
        setTimeout(() => {
          const el = lineRefs.current.get(state.scrollLine!);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          setFlashLine(state.scrollLine!);
          setSweep((s) => s + 1);
          setTimeout(() => setFlashLine(null), 2500);
        }, 80);
      }
    };
    const off = S.setDocListener(loadDocument);
    if (S.currentDocPath) loadDocument({ path: S.currentDocPath });
    return off;
  }, []);

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
          onChange={(e) => setQuery(e.target.value)}
          aria-label="find in document"
        />
        <span className="text-faint text-[10px]">{query ? `${matches.length} match(es)` : `${lines.length} lines`}</span>
      </div>

      {/* nav sweep effect when ARIA scrolls */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {sweep > 0 && <div key={sweep} className="nav-sweep" style={{ top: 0 }} />}
        <div ref={containerRef} className="absolute inset-0 overflow-auto">
          <div className="min-h-full py-1">
            {lines.map((l, i) => {
              const n = i + 1;
              const isMatch = query && l.toLowerCase().includes(query.toLowerCase());
              return (
                <div
                  key={n}
                  ref={(el) => { if (el) lineRefs.current.set(n, el); else lineRefs.current.delete(n); }}
                  className={`flex ${flashLine === n ? "line-flash" : ""}`}
                >
                  <div className="w-[46px] shrink-0 text-right pr-2 select-none text-[10.5px] text-faint pt-[1px]"
                    style={{ userSelect: "none" }}>
                    {n}
                  </div>
                  <div
                    className={`flex-1 pr-3 whitespace-pre-wrap leading-[1.5] ${isMatch ? "text-accent" : "text-txt"}`}
                    style={isMatch ? { background: "rgba(127,174,139,.08)" } : undefined}
                  >
                    {l || "\u00A0"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
