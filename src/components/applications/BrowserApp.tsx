"use client";

import { useEffect, useState } from "react";
import { browserNavBus } from "@/game/services";
import { CACHED_PAGES, HISTORY } from "@/game/data/browserHistory";
import { sfx } from "@/audio/engine";

/* ============================================================
   BROWSER — history + dramatically richer cached pages.
   Every page now has imagery, avatars, and editorial hierarchy.
   ============================================================ */

export default function BrowserApp() {
  const [pageId, setPageId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"history" | "page">("history");

  useEffect(() => {
    return browserNavBus.on((payload) => {
      const id = String(payload);
      const entry = HISTORY.find((h) => h.id === id);
      setPageId(entry?.pageId ?? (CACHED_PAGES[id] ? id : null));
      setView(entry?.pageId || CACHED_PAGES[id] ? "page" : "history");
    });
  }, []);

  const filtered = HISTORY.filter(
    (h) =>
      !query ||
      h.title.toLowerCase().includes(query.toLowerCase()) ||
      h.url.toLowerCase().includes(query.toLowerCase())
  );
  const page = pageId ? CACHED_PAGES[pageId] : undefined;

  return (
    <div className="flex flex-col h-full text-[13px]">
      {/* chrome */}
      <div className="shrink-0 border-b border-line bg-surface">
        <div className="flex items-center gap-2 px-2.5 h-[36px]">
          <button className="btn-bevel text-[11px] px-3" onClick={() => { setView("history"); sfx.click(); }}>☰ HISTORY</button>
          <div className="field-dark flex-1 px-3 py-1.5 text-[11.5px] truncate font-mono">
            {page ? `cached://${page.url}` : "about:history"}
          </div>
          <span className="text-[10px] text-alert tracking-[0.16em] font-bold">OFFLINE · NO NETWORK</span>
        </div>
        {view === "page" && page && (
          <div className="px-3 pb-1.5 pt-1 text-[10px] text-faint truncate border-t border-line">
            {page.siteTitle}
          </div>
        )}
      </div>

      {view === "history" ? (
        <>
          <div className="shrink-0 p-2.5 border-b border-line flex gap-2 items-center bg-surface2">
            <input
              className="field-dark flex-1 px-3 py-1.5 text-[12px]"
              placeholder="search history…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-faint text-[10px] tracking-wide">{filtered.length} entries</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {filtered.map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  if (h.pageId && CACHED_PAGES[h.pageId]) {
                    setPageId(h.pageId);
                    setView("page");
                    sfx.click();
                  }
                }}
                className={`block w-full text-left px-4 py-2.5 border-b border-line hover:bg-surface2 transition-colors ${!h.pageId || !CACHED_PAGES[h.pageId] ? "opacity-55" : ""}`}
              >
                <div className="flex justify-between gap-3">
                  <span className="text-txt truncate font-medium">◉ {h.title}</span>
                  <span className="text-faint text-[10px] shrink-0 font-mono">{h.visitedAt}</span>
                </div>
                <div className="text-[11px] text-accentdim truncate font-mono mt-0.5">{h.url}</div>
              </button>
            ))}
          </div>
        </>
      ) : page ? (
        <div className="flex-1 min-h-0 overflow-y-auto bg-surface">
          <CachedPageView kind={page.renderKind} title={page.siteTitle} url={page.url} paragraphs={page.body} />
        </div>
      ) : (
        <div className="grid place-items-center h-full text-faint">no cached page for this entry</div>
      )}

      <div className="shrink-0 h-[20px] px-3 flex items-center justify-between border-t border-line bg-surface text-[10px] text-faint tracking-wide">
        <span>KESTREL PAGES RENDER FROM LOCAL CACHE — air-gapped 2025-11-30</span>
        <span>cached renderer v1</span>
      </div>
    </div>
  );
}

function CachedPageView({
  kind,
  title,
  url,
  paragraphs,
}: {
  kind: string;
  title: string;
  url: string;
  paragraphs: string[];
}) {
  if (kind === "kestrel-home") {
    return (
      <div className="min-h-full bg-[#0e1418] text-[#d6e4e0] flex flex-col">
        {/* header */}
        <div className="border-b border-[#1e2e36] bg-[#0a1216] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[2px] bg-[#0f1e22] border border-[#1e3a2e] grid place-items-center">
              <svg width="22" height="16" viewBox="0 0 40 30"><path d="M2 24 L14 4 L20 16 L27 6 L38 24 Z" fill="#7fae8b" opacity="0.9"/></svg>
            </div>
            <div>
              <div className="tracking-[0.32em] text-[14px] font-bold text-[#e0ece8]">KESTREL INSTITUTE</div>
              <div className="text-[10px] text-[#5f7a7a] tracking-[0.22em]">APPLIED HARMONICS · PRECISION METROLOGY</div>
            </div>
          </div>
          <div className="hidden md:block text-[10px] text-[#4a6060] text-right leading-tight">
            EST. 1998 · PRIVATE<br/>NOT FOR PROFIT · NOT FOR PUBLICATION
          </div>
        </div>
        {/* cached abstract rather than a network-only stock photograph */}
        <div className="relative h-[220px] overflow-hidden border-b border-[#1e2e36] bg-[radial-gradient(ellipse_at_72%_35%,rgba(127,174,139,.18),transparent_24%),linear-gradient(135deg,#071116,#172824_46%,#0a1115)]">
          <div className="absolute inset-x-[8%] bottom-0 h-[72%] border-x border-t border-[#365049]/60 bg-[repeating-linear-gradient(90deg,transparent_0_52px,rgba(127,174,139,.11)_53px_54px),repeating-linear-gradient(0deg,transparent_0_26px,rgba(127,174,139,.08)_27px_28px)]" />
          <div className="absolute left-[18%] top-[27%] h-px w-[58%] bg-[#8fcaa0]/40 shadow-[0_0_22px_rgba(143,202,160,.65)]" />
          <div className="absolute bottom-3 left-6 right-6 flex justify-between items-end">
            <span className="text-[11px] tracking-[0.24em] text-[#c8ddd6] bg-black/50 px-2 py-1 backdrop-blur">FACILITY — UNDISCLOSED · VISITOR PROGRAM BY INVITATION</span>
            <span className="text-[9px] text-[#6a8a86] hidden sm:block">retrieved 2026-02-27 · cached · air-gapped</span>
          </div>
        </div>
        <div className="px-6 py-6 max-w-[720px] mx-auto space-y-4 leading-[1.7] flex-1">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "text-[15px] text-[#e6f0ec] font-medium leading-[1.6]" : "text-[13px] text-[#b8c9c2]"}>{p}</p>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="panel-inset !bg-[#0a1216] p-3">
              <div className="text-[10px] tracking-[0.2em] text-accentdim mb-1">CHARTER</div>
              <div className="text-[12px] text-[#a8beb6] leading-relaxed">The world measures well because someone keeps the rulers still.</div>
            </div>
            <div className="panel-inset !bg-[#0a1216] p-3">
              <div className="text-[10px] tracking-[0.2em] text-accentdim mb-1">VISITOR NOTE</div>
              <div className="text-[12px] text-[#a8beb6] leading-relaxed">Attendees describe our facility as ‘quiet’ and ‘precisely furnished.’</div>
            </div>
          </div>
          <div className="pt-4 text-[10px] text-[#3d524e] border-t border-[#142024] mt-6 font-mono">
            cached render of {url} · retrieved by D.McDuff · content preserved verbatim
          </div>
        </div>
      </div>
    );
  }

  if (kind === "kestrel-program") {
    return (
      <div className="min-h-full bg-[#0e1418] text-[#d6e4e0] flex flex-col">
        <div className="border-b border-[#1e2e36] bg-[#0a1216] px-6 py-3 flex items-center gap-3">
          <svg width="20" height="14" viewBox="0 0 40 30"><path d="M2 24 L14 4 L20 16 L27 6 L38 24 Z" fill="#7fae8b" opacity="0.85"/></svg>
          <span className="tracking-[0.28em] text-[12px] font-bold">PRECISION HARMONICS — PROGRAM</span>
          <span className="ml-auto text-[10px] text-[#4a6060] px-2 py-0.5 border border-[#1e2e36]">ONGOING · NOT PUBLISHED</span>
        </div>
        <div className="px-6 py-6 max-w-[720px] mx-auto space-y-4 leading-[1.7] flex-1">
          <div className="relative h-[180px] rounded-[2px] overflow-hidden border border-[#1e2e36] bg-[radial-gradient(circle_at_75%_45%,rgba(127,174,139,.2),transparent_11%),repeating-linear-gradient(90deg,#0a1216_0_45px,#0f1d20_46px_47px),repeating-linear-gradient(0deg,transparent_0_25px,rgba(127,174,139,.07)_26px_27px)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e1418]/90 via-transparent to-transparent" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 max-w-[360px]">
              <div className="text-[11px] tracking-[0.28em] text-[#7fbe9a]">INFRASTRUCTURE DRIFTS</div>
              <div className="text-[13px] text-[#e0ece8] leading-snug mt-1">Measurement is infrastructure. Drift must be harmonized before it becomes disagreement.</div>
            </div>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] text-[#b8c9c2] leading-[1.7]">{p}</p>
          ))}
          <div className="panel-inset !bg-[#0f1e18] border-l-2 !border-l-amber p-4 mt-2">
            <div className="text-[11px] tracking-[0.16em] text-amber mb-1">⚠ INSTITUTE NOTE</div>
            <div className="text-[12.5px] text-[#d6c9a8] leading-relaxed">Effectiveness is assessed by the absence of complaint. Thirteen volumes. Zero citations — by design.</div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "kestrel-people") {
    return (
      <div className="min-h-full bg-[#0e1418] text-[#d6e4e0]">
        <div className="border-b border-[#1e2e36] bg-[#0a1216] px-6 py-3 flex items-center gap-3">
          <svg width="20" height="14" viewBox="0 0 40 30"><path d="M2 24 L14 4 L20 16 L27 6 L38 24 Z" fill="#7fae8b" opacity="0.85"/></svg>
          <span className="tracking-[0.28em] text-[12px] font-bold">LEADERSHIP</span>
        </div>
        <div className="px-6 py-6 max-w-[720px] mx-auto space-y-6">
          {/* Haldane */}
          <div className="flex gap-4 panel-inset !bg-[#0f1e1c] p-4 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Images/PhotoBadgeScan.png" alt="M. Haldane's Kestrel visitor badge" className="w-[72px] h-[72px] object-cover object-center rounded-[2px] border border-[#1e2e36] shrink-0 grayscale contrast-125" loading="lazy" />
            <div>
              <div className="text-[13px] font-bold tracking-wide text-[#e0ece8]">M. HALDANE — Directorate Liaison</div>
              <div className="text-[11px] text-[#7f9a8e] tracking-wide">Applied programs · office hours by correspondence only</div>
              <p className="text-[12.5px] text-[#b8c9c2] leading-relaxed mt-2">{paragraphs[0]}</p>
            </div>
          </div>
          {/* Vann */}
          <div className="flex gap-4 panel-inset !bg-[#11181c] p-4 items-start border-l-2 !border-l-[#3a4a4a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Images/PhotoEliasVann.png" alt="Dr. Elias Vann at CERN in 2003" className="w-[72px] h-[72px] object-cover object-top rounded-[2px] border border-[#1e2e36] shrink-0 grayscale" loading="lazy" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold tracking-wide text-[#d8c8b8]">DR. ELIAS VANN</span>
                <span className="text-[9px] tracking-[0.14em] bg-[#2a1a14] text-[#c9a58a] px-1.5 py-0.5 border border-[#3d2a1e]">1971 — 2025 · IN MEMORIAM</span>
              </div>
              <p className="text-[12.5px] text-[#b8c9c2] leading-relaxed mt-2">{paragraphs[1]}</p>
            </div>
          </div>
          <p className="text-[12.5px] text-[#8aa09a] leading-relaxed italic border-t border-[#142024] pt-4">{paragraphs[2]}</p>
          <div className="text-[10px] text-[#3d524e] font-mono pt-2">cached render · people page · retrieved by D.McDuff</div>
        </div>
      </div>
    );
  }

  if (kind === "forum-thread") {
    return (
      <div className="min-h-full bg-[#121110] text-[#d6cfc0] flex flex-col">
        <div className="bg-[#1e1a16] border-b border-[#2f2822] px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#2a241e] border border-[#3d352a] grid place-items-center text-[10px] tracking-wide text-[#8a7f6a]">P·F</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] tracking-[0.18em] text-[#8a7f6a]">PHYSICS FORUM · EXPERIMENTAL · ARCHIVED</div>
            <div className="text-[13px] font-bold text-[#e8ddd0] truncate">{title.replace("Physics Forum — ", "")}</div>
          </div>
          <span className="text-[10px] text-[#6a6255] border border-[#2f2822] px-2 py-1 hidden sm:block">278 REPLIES · LOCKED</span>
        </div>
        {/* thread meta */}
        <div className="px-4 py-2 bg-[#181410] border-b border-[#25201c] flex gap-4 text-[10px] text-[#6a6255] font-mono">
          <span>OP · deleted · 2025-11</span><span>·</span><span>moderator W — Kestrel visitor account</span><span className="text-alert">· locked within 6 hours</span>
        </div>
        <div className="max-w-[760px] mx-auto px-4 py-4 space-y-4 flex-1 w-full">
          {paragraphs.map((p, i) => {
            const authors = ["deleted", "@k_voss", "tilt_watcher (D.M.)", "N. Aramesh · Boulder"];
            return (
              <div key={i} className="flex gap-3 panel-inset !bg-[#181410] !border-[#25201c] p-3">
                <div className="w-9 h-9 rounded-full border border-[#2f2822] shrink-0 mt-0.5 grid place-items-center text-[9px] text-[#8a7f6a] bg-[#211c17]" aria-hidden>
                  {authors[i].replace(/[^A-Z]/gi, "").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-[#d8c8a8]">{authors[i]}</span>
                    <span className="text-[#6a6255] font-mono">· reply #{[1,41,87,8821][i] ?? i*40+1}</span>
                    {i===1 && <span className="text-accent text-[10px]">★ 12</span>}
                  </div>
                  <div className="text-[13px] leading-[1.65] text-[#c9beb0] mt-1 whitespace-pre-wrap">{p}</div>
                </div>
              </div>
            );
          })}
          <div className="text-[10px] text-[#5a5348] font-mono pt-2 border-t border-[#25201c] flex justify-between">
            <span>cached thread · some replies removed by moderators · view source disabled</span>
            <span>retrieved 2026-02-28 00:41</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "obituary") {
    return (
      <div className="min-h-full bg-[#f7f5f0] text-[#2b241e] flex flex-col">
        <div className="bg-[#1a1a1a] text-[#e8ddd0] px-6 py-4 text-center border-b-4 border-[#c9a35c]">
          <div className="text-[11px] tracking-[0.32em] text-[#8a7f6a]">IN MEMORIAM</div>
          <div className="text-[22px] font-serif tracking-wide mt-1">Dr. Elias Vann</div>
          <div className="text-[12px] text-[#a89a8a] font-mono">1971 — 2025 · Geneva · Philadelphia</div>
        </div>
        <div className="max-w-[680px] mx-auto px-6 py-6 flex gap-6 flex-col sm:flex-row flex-1 w-full">
          <div className="shrink-0">
            <div className="w-[200px] h-[240px] bg-[#e8ddd0] border border-[#d6cfc0] overflow-hidden p-1.5 mx-auto sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Images/PhotoEliasVann.png"
                alt="Dr. Elias Vann at CERN in 2003"
                className="w-full h-full object-cover grayscale contrast-110"
                loading="lazy"
              />
            </div>
            <div className="text-[10px] text-[#7a7060] text-center mt-2 font-mono">CERN 2003 · trigger-counter group<br/>photo: Meyrin site · August</div>
            <div className="mt-3 panel-inset !bg-[#efe9df] p-3 text-[11px] leading-relaxed text-[#5a4a3a] border-l-2 !border-l-amber">
              “He saw the door and knew to test its hinges.”<br/>
              <span className="text-[#8a7f6a]">— M.H., memorial remarks</span>
            </div>
          </div>
          <div className="flex-1 space-y-4 leading-[1.7]">
            {paragraphs.map((p, i) => (
              <p key={i} className={i===0 ? "text-[15px] font-serif text-[#1a1611] font-medium" : "text-[13px] text-[#3d352a]"}>{p}</p>
            ))}
            <div className="text-[11px] text-[#7a7060] italic border-t border-[#e8ddd0] pt-3 mt-4">
              Flowers are discouraged; precision is requested.
            </div>
          </div>
        </div>
        <div className="bg-[#efe9df] border-t border-[#d6cfc0] px-6 py-2 text-[10px] text-[#8a7f6a] font-mono flex justify-between">
          <span>example-obit.local · cached 2026-03-01</span>
          <span>archived</span>
        </div>
      </div>
    );
  }

  if (kind === "arxiv") {
    return (
      <div className="min-h-full bg-[#f2f2ef] text-[#1e1e1e] flex flex-col">
        <div className="bg-[#8b1f1f] text-white px-4 py-2.5 flex items-center gap-3">
          <span className="text-[11px] tracking-[0.22em] font-bold border border-white/30 px-2 py-0.5">WITHDRAWN</span>
          <span className="text-[12px] font-mono">arXiv:1604.01221v4 [physics.ins-det]</span>
          <span className="ml-auto text-[10px] opacity-70 hidden sm:block">retrieved 2026-02-28 · v3 diff preserved</span>
        </div>
        <div className="max-w-[760px] mx-auto px-6 py-6 space-y-5 flex-1 w-full">
          <div>
            <div className="text-[18px] font-bold leading-tight text-[#1a1a1a]">{title.replace("arXiv: withdrawal notice — ","")}</div>
            <div className="text-[11px] text-[#6a6a6a] font-mono mt-1">E. Vann et al. · Halcyon Analytics · 9 pages · 4 figures · adapted report</div>
          </div>
          {/* figure placeholder — the growth curve */}
          <div className="border border-[#c9c2b8] bg-white p-3">
            <div className="text-[10px] tracking-[0.16em] text-[#8a7f6a] mb-2">FIGURE 3 — STACKED RESIDUAL BIAS TERM (v3 original, redacted in v4)</div>
            <div className="h-[140px] bg-[#faf8f4] border border-[#e8e0d0] relative overflow-hidden">
              <svg viewBox="0 0 400 120" className="w-full h-full">
                <line x1="40" y1="100" x2="380" y2="100" stroke="#b8a898" strokeWidth="1"/>
                <line x1="40" y1="10" x2="40" y2="100" stroke="#b8a898" strokeWidth="1"/>
                <text x="42" y="20" fontSize="8" fill="#8a7f6a">μrad</text>
                <text x="360" y="112" fontSize="7" fill="#8a7f6a">months →</text>
                <path d="M40 98 C120 94 200 88 280 68 C320 58 360 38 376 22" stroke="#8b1f1f" strokeWidth="2" fill="none"/>
                {[...Array(9)].map((_,i)=>{const x=40+i*38, y=98-Math.pow(i/8,1.8)*76; return <g key={i}><circle cx={x} cy={y} r="2" fill="#1a1a1a"/><line x1={x} y1={y-5} x2={x} y2={y+5} stroke="#8a7f6a" strokeWidth="0.8"/></g>})}
                <rect x="160" y="8" width="108" height="14" fill="#8b1f1f" opacity="0.12"/><text x="166" y="18" fontSize="7" fill="#8b1f1f">REDACTED IN v4</text>
              </svg>
            </div>
            <div className="text-[10px] text-[#8a7f6a] mt-1.5 italic">“The errors are trying to tell us who they are.” — quoted second-hand, E.V. colloquium</div>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-[1.65] text-[#2b2b2b]">{p}</p>
          ))}
          <div className="text-[10px] text-[#8a8a8a] font-mono pt-3 border-t border-[#e0ddd6] flex justify-between">
            <span>cached copy · v3 vs v4 diff shows manual redaction in figs 3,6,7</span>
            <span>withdrawn 2017-11</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6 space-y-3 bg-[#0e1418]">
      <div className="text-[14px] text-txt font-bold">{title}</div>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[13px] text-dim leading-relaxed">{p}</p>
      ))}
      <div className="text-[10px] text-faint font-mono pt-3">cached renderer</div>
    </div>
  );
}
