"use client";

import Image from "next/image";
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
      {/* chrome — sells that this was a real browser, now air-gapped */}
      <div className="shrink-0 border-b border-line bg-surface">
        <div className="flex items-center gap-1.5 px-2 h-[36px]">
          <button
            className="btn-bevel text-[11px] px-2 disabled:opacity-40"
            disabled={view === "history"}
            onClick={() => { setView("history"); setPageId(null); sfx.click(); }}
            title="Back to history"
          >
            ← BACK
          </button>
          <button className="btn-bevel text-[11px] px-2" onClick={() => { setView("history"); sfx.click(); }}>☰ HISTORY</button>
          <div className="field-dark flex-1 px-3 py-1.5 text-[11.5px] truncate font-mono flex items-center gap-2">
            <span className="text-faint text-[10px] hidden sm:inline">{page ? "cached://" : "about://"}</span>
            <span className="truncate">{page ? page.url : "history"}</span>
            {page && <span className="text-[9px] bg-amber/15 text-amber border border-amber/30 px-1.5 py-0.5 leading-none hidden md:inline">CACHED</span>}
          </div>
          <span className="text-[10px] text-alert tracking-[0.16em] font-bold hidden sm:inline">OFFLINE</span>
          <span className="text-[9px] text-faint border border-line px-1.5 py-0.5 hidden lg:inline">AIR-GAPPED 2025-11-30</span>
        </div>
        {view === "page" && page && (
          <div className="px-3 pb-1.5 pt-1 text-[10px] text-faint truncate border-t border-line flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="truncate">{page.siteTitle}</span>
            <span className="text-faint/60 hidden sm:inline ml-auto">retrieved {HISTORY.find((h) => h.pageId === page.id)?.visitedAt ?? ""}</span>
          </div>
        )}
      </div>

      {view === "history" ? (
        <>
          <div className="shrink-0 p-2.5 border-b border-line flex gap-2 items-center bg-surface2">
            <input
              className="field-dark flex-1 px-3 py-1.5 text-[12px]"
              placeholder="search history — title, URL, or date…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-faint text-[10px] tracking-wide">{filtered.length} / {HISTORY.length} entries</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {filtered.map((h) => {
              const hasPage = !!(h.pageId && CACHED_PAGES[h.pageId]);
              const domain = (() => {
                try { return new URL(h.url).hostname; } catch { return h.url.slice(0, 32); }
              })();
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    if (hasPage) {
                      setPageId(h.pageId!);
                      setView("page");
                      sfx.click();
                    }
                  }}
                  disabled={!hasPage}
                  className={`block w-full text-left px-4 py-2.5 border-b border-line transition-colors flex gap-3 ${hasPage ? "hover:bg-surface2 cursor-pointer" : "opacity-55 cursor-default"}`}
                >
                  <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full border ${hasPage ? "bg-accent border-accent" : "bg-transparent border-faint"}`} aria-hidden />
                  <span className="flex-1 min-w-0">
                    <span className="flex justify-between gap-3">
                      <span className="text-txt truncate font-medium text-[12.5px]">{h.title}</span>
                      <span className="text-faint text-[10px] shrink-0 font-mono">{h.visitedAt}</span>
                    </span>
                    <span className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] tracking-[0.12em] text-faint border border-line px-1 py-0.5 leading-none">{domain}</span>
                      <span className="text-[11px] text-accentdim truncate font-mono">{h.url}</span>
                    </span>
                    {hasPage && <span className="text-[9px] tracking-[0.12em] text-accentdim mt-1 inline-block">CACHED · CLICK TO OPEN</span>}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && <div className="p-4 text-center text-faint text-[11px]">no matches — try a different term or clear search</div>}
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
            <Image src="/Images/PhotoBadgeScan.png" alt="M. Haldane's Kestrel visitor badge" width={72} height={72} className="w-[72px] h-[72px] object-cover object-center rounded-[2px] border border-[#1e2e36] shrink-0 grayscale contrast-125" loading="lazy" decoding="async" sizes="72px" />
            <div>
              <div className="text-[13px] font-bold tracking-wide text-[#e0ece8]">M. HALDANE — Directorate Liaison</div>
              <div className="text-[11px] text-[#7f9a8e] tracking-wide">Applied programs · office hours by correspondence only</div>
              <p className="text-[12.5px] text-[#b8c9c2] leading-relaxed mt-2">{paragraphs[0]}</p>
            </div>
          </div>
          {/* Vann */}
          <div className="flex gap-4 panel-inset !bg-[#11181c] p-4 items-start border-l-2 !border-l-[#3a4a4a]">
            <Image src="/Images/PhotoEliasVann.png" alt="Dr. Elias Vann at CERN in 2003" width={72} height={72} className="w-[72px] h-[72px] object-cover object-top rounded-[2px] border border-[#1e2e36] shrink-0 grayscale" loading="lazy" decoding="async" sizes="72px" />
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
              <Image
                src="/Images/PhotoEliasVann.png"
                alt="Dr. Elias Vann at CERN in 2003"
                width={200}
                height={240}
                className="w-full h-full object-cover grayscale contrast-110"
                loading="lazy"
                decoding="async"
                sizes="200px"
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

  // Penn Observatory — night portal, booking-first
  if (kind === "observatory") {
    return (
      <div className="min-h-full bg-[#0a0e1a] text-[#c8d4e8] flex flex-col">
        <div className="bg-[#141e33] text-[#e8eef8] px-4 py-3 flex items-center gap-3 border-b border-[#24365e]">
          <span className="text-[10px] tracking-[0.22em] font-bold bg-[#1e3a5f] px-2 py-0.5 border border-[#2e4a6f]">PENN OBSERVATORY</span>
          <span className="text-[11px] tracking-wide text-[#8aa0c8]">Public Open Nights</span>
          <span className="ml-auto text-[9px] text-[#5a6f9a] hidden sm:block">EAST STAIR · DOME · 20:00–00:00</span>
        </div>
        <div className="relative h-[160px] overflow-hidden bg-[#050814] border-b border-[#1e2e4a]">
          <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(ellipse 40% 60% at 72% 30%, #1a2a5a 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 70%, #0f1a33 0%, transparent 60%)" }} />
          {[...Array(28)].map((_, i) => (
            <span key={i} className="absolute w-px h-px bg-white rounded-full" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: 0.35 + (i % 3) * 0.18 }} />
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[90px] rounded-[80px] border border-[#2a3f66]/50 bg-[#0f1f3f]/40 backdrop-blur-sm grid place-items-center">
            <div className="text-center">
              <div className="text-[11px] tracking-[0.28em] text-[#7a9ad8]">DOME OPEN</div>
              <div className="text-[12px] text-[#e0e8f8]">Mar 6 · McDuff group · 6 confirmed</div>
            </div>
          </div>
        </div>
        <div className="max-w-[700px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "text-[13px] leading-[1.7] text-[#d0dcec] bg-[#111d33] border border-[#1e2e4a] p-3" : i === 2 ? "text-[12.5px] leading-[1.6] text-[#d6a58a] bg-amber/5 border border-amber/20 p-3" : "text-[13px] leading-[1.7] text-[#a0b2d0]"}>{p}</p>
          ))}
          <div className="text-[10px] text-[#5a6f9a] font-mono pt-3 border-t border-[#1a2744] flex justify-between"><span>pennobservatory.example.org · cached 2026-03-03 14:55</span><span>BOOKING PORTAL</span></div>
        </div>
      </div>
    );
  }

  if (kind === "nist") {
    return (
      <div className="min-h-full bg-[#f5f7f5] text-[#1e2a22] flex flex-col">
        <div className="bg-[#0b2e1f] text-[#c8e6d0] px-4 py-2.5 flex items-center gap-3">
          <span className="text-[11px] font-bold tracking-wide">NIST</span>
          <span className="text-[11px] text-[#8abda0]">National Institute of Standards and Technology</span>
          <span className="ml-auto text-[9px] bg-white/10 px-2 py-0.5 border border-white/20">U.S. DEPARTMENT OF COMMERCE</span>
        </div>
        <div className="max-w-[760px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          <div className="text-[17px] font-bold text-[#0b2e1f]">{title}</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: "Ensemble", v: "12 devices" },
              { k: "Updated", v: "2026-02-15 11:02" },
              { k: "Mean", v: "0.0019 µrad" },
            ].map((s) => (
              <div key={s.k} className="bg-white border border-[#c8d8cc] p-2.5">
                <div className="text-[9px] tracking-[0.16em] text-[#6a8a7a]">{s.k.toUpperCase()}</div>
                <div className="text-[13px] font-mono font-bold text-[#0b2e1f]">{s.v}</div>
              </div>
            ))}
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-[1.65] text-[#2a3a32] bg-white border border-[#dde6de] p-3">{p}</p>
          ))}
          <div className="text-[10px] text-[#6a8a7a] font-mono pt-2 border-t border-[#dde6de] flex justify-between"><span>DOI:10.18434/T4/1508001 · nist-ensemble-2026-02-15.csv</span><span>STALE — OFFLINE</span></div>
        </div>
      </div>
    );
  }

  if (kind === "homelock-docs") {
    return (
      <div className="min-h-full bg-[#0f1412] text-[#c8d4cc] flex flex-col">
        <div className="bg-[#1a2620] border-b border-[#2a3d32] px-4 py-2.5 flex items-center gap-3">
          <span className="text-[11px] font-mono tracking-wide text-[#7fbea0]">docs.homelock-vendor.example.com</span>
          <span className="text-[10px] text-[#5a7f6a]">/ local-api</span>
          <span className="ml-auto text-[9px] bg-amber/15 text-amber border border-amber/30 px-2 py-0.5">WONTFIX</span>
        </div>
        <div className="max-w-[760px] mx-auto px-5 py-5 space-y-4 flex-1 w-full font-mono text-[12.5px]">
          <div className="bg-[#1a2620] border border-[#2a3d32] p-3">
            <div className="text-[10px] tracking-[0.16em] text-[#5a7f6a] mb-2">GET /local/maint/event-window</div>
            <pre className="text-[11.5px] leading-[1.6] text-[#9ec8b0] whitespace-pre-wrap">{paragraphs[0]}</pre>
          </div>
          <div className="bg-amber/[0.06] border border-amber/20 p-3">
            <div className="text-[10px] tracking-[0.16em] text-amber mb-1">VENDOR RESPONSE — TICKET #40118</div>
            <p className="text-[13px] leading-[1.6] text-[#d6c9a8] font-sans">{paragraphs[1]}</p>
          </div>
          <p className="text-[12.5px] leading-[1.65] text-[#8aa898] font-sans">{paragraphs[2]}</p>
          <div className="text-[10px] text-[#4a5f52] font-mono pt-3 border-t border-[#1a2620] flex justify-between"><span>HomeLock Local API · bookmarked 2026-01-27 10:18</span><span>MAINT ENDPOINT</span></div>
        </div>
      </div>
    );
  }

  if (kind === "manpage") {
    return (
      <div className="min-h-full bg-[#0a0e0a] text-[#8fcaa0] flex flex-col font-mono">
        <div className="bg-[#0f1a14] border-b border-[#1d2e24] px-4 py-2 flex items-center gap-2 text-[10px] tracking-[0.14em] text-[#5a7f6a]"><span>MAN</span><span className="text-[#8fcaa0]">OPENSSL-ENC(1)</span><span>·</span><span>OpenSSL 3.0</span><span className="ml-auto">2026-03-08 22:15</span></div>
        <div className="max-w-[760px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          <div className="border border-[#1d2e24] bg-[#0f1a14] p-4">
            <div className="text-[11px] tracking-[0.16em] text-[#5a7f6a] mb-2">SYNOPSIS</div>
            <pre className="text-[11.5px] leading-[1.7] text-[#b8e0c8] whitespace-pre-wrap">{paragraphs[0]}</pre>
          </div>
          <p className="text-[13px] leading-[1.7] text-[#8fcaa0] bg-[#0f1a14] border border-[#1d2e24] p-3">{paragraphs[1]}</p>
          <div className="bg-[#1a1f0a] border border-[#2a3020] p-3">
            <div className="text-[10px] tracking-[0.16em] text-[#8aaa60] mb-1">$ EXAMPLE</div>
            <pre className="text-[11.5px] leading-[1.6] text-[#c8e0a0] whitespace-pre-wrap">{paragraphs[2]}</pre>
          </div>
          <div className="text-[10px] text-[#3a5a44] pt-2 flex justify-between"><span>manpages.example.org · openssl-enc.html</span><span>SECTION 1</span></div>
        </div>
      </div>
    );
  }

  if (kind === "recipe") {
    return (
      <div className="min-h-full bg-[#fdf6ec] text-[#3a2a14] flex flex-col">
        <div className="bg-[#8b3a1a] text-[#fff7e6] px-5 py-4">
          <div className="text-[10px] tracking-[0.2em] text-[#e8c9a8]">SEARCH · NO CLICK</div>
          <div className="text-[16px] font-serif leading-tight mt-1">Mom&apos;s chili (the good one) — search</div>
          <div className="text-[11px] text-[#e8c9a8] mt-1">Daniel searched this at 19:58 on Feb 15 · clicked nothing · 42,300 results</div>
        </div>
        <div className="max-w-[680px] mx-auto px-5 py-6 space-y-4 flex-1 w-full">
          <div className="bg-white border border-[#e8ddd0] p-4 rounded-sm shadow-sm">
            <div className="text-[11px] tracking-[0.16em] text-[#c9a35c] mb-2">ACTUAL RECIPE — /Personal/chili_recipe.txt</div>
            <div className="text-[13px] leading-[1.7] text-[#5a3a1a] italic">&quot;2 lb coarse chuck, hand-cut. 3 dried ancho + 2 chipotle in adobo. Masa toasted first. Cumin bloomed like a campfire.&quot;</div>
            <div className="text-[10px] text-[#8a7a5a] mt-2">The web doesn&apos;t have this one. Ruth&apos;s card does.</div>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 1 ? "text-[13px] leading-[1.7] text-[#6a5a3a] bg-[#fff7e6] border border-[#e8ddd0] p-3" : "text-[13px] leading-[1.7] text-[#4a3a2a]"}>{p}</p>
          ))}
          <div className="text-[10px] text-[#8a7a5a] font-mono pt-3 border-t border-[#e8ddd0] flex justify-between"><span>search.example.org · cached 2026-02-15 19:58</span><span>NOT CLICKED</span></div>
        </div>
      </div>
    );
  }

  if (kind === "medical") {
    return (
      <div className="min-h-full bg-[#f7f9fb] text-[#1a2633] flex flex-col">
        <div className="bg-[#0e2a4a] text-white px-5 py-3.5 flex items-center gap-3">
          <span className="text-[13px] font-bold tracking-wide">Penn Medicine</span>
          <span className="text-[10px] bg-white/15 border border-white/20 px-2 py-0.5">MY PENN MEDICINE</span>
          <span className="ml-auto text-[10px] opacity-70 hidden sm:block">2026-02-20 · cardiology</span>
        </div>
        <div className="max-w-[700px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          <div className="bg-white border border-[#d0dcea] p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0e2a4a] grid place-items-center text-white text-[11px]">♥</div>
            <div>
              <div className="text-[15px] font-semibold text-[#0e2a4a]">Preparing for your appointment</div>
              <div className="text-[11px] text-[#5a7a9a]">Cardiology · Dr. Imara · March 14 · bring health band export</div>
            </div>
            <span className="ml-auto text-[10px] bg-amber/15 text-[#7a5a00] border border-amber/30 px-2 py-1 h-fit">UPCOMING</span>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 1 ? "text-[12.5px] leading-[1.65] text-[#4a2a2a] bg-[#fff3e0] border border-[#f0d9b0] p-3" : "text-[13px] leading-[1.7] text-[#334a5e]"}>{p}</p>
          ))}
          <div className="text-[10px] text-[#6a8aaa] font-mono pt-3 border-t border-[#d0dcea] flex justify-between"><span>pennmedicine.org · cached 2026-02-20 09:44</span><span>APPOINTMENT · NAT. CAUSES</span></div>
        </div>
      </div>
    );
  }

  if (kind === "parking") {
    return (
      <div className="min-h-full bg-[#f2f4f6] text-[#24303a] flex flex-col">
        <div className="bg-[#1a3a5a] text-white px-4 py-2.5 flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.16em]">PENN PARKING</span>
          <span className="text-[10px] text-[#8fb0d0]">Transportation &amp; Parking</span>
          <span className="ml-auto text-[10px] bg-white/10 px-2 py-0.5">Flower &amp; Walk</span>
        </div>
        <div className="max-w-[700px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          <div className="bg-white border border-[#d0d8e0] p-3 flex items-center gap-4">
            <div className="w-[96px] h-[64px] bg-[#e8eef4] border border-[#c0cddc] grid place-items-center text-[10px] text-[#5a6f8a]">MAP<br/>FLOWER &amp; WALK</div>
            <div>
              <div className="text-[13px] font-semibold text-[#1a3a5a]">Flower &amp; Walk Garage</div>
              <div className="text-[11px] text-[#5a6f8a]">$18 daily · Gates after 22:00 require PennCard · You parked Mar 4 12:40</div>
            </div>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-[1.65] text-[#344a5e]">{p}</p>
          ))}
          <div className="text-[10px] text-[#6a8aaa] font-mono pt-3 border-t border-[#d0d8e0] flex justify-between"><span>parking.upenn.edu · cached 2026-03-04 12:40</span><span>GARAGE</span></div>
        </div>
      </div>
    );
  }

  if (kind === "search-results") {
    return (
      <div className="min-h-full bg-white text-[#1a1a1e] flex flex-col">
        <div className="border-b border-[#e0e6ea] px-4 py-3 flex items-center gap-3">
          <span className="text-[13px] font-bold tracking-tight text-[#1a5c9e]">SEARCH</span>
          <div className="flex-1 max-w-[420px] bg-[#f2f4f6] border border-[#d0d8e0] px-3 py-1.5 text-[12.5px] text-[#334] truncate">air-gapped cold copy strategy (tax receipts / genealogy naming)</div>
          <span className="text-[10px] text-[#6a7a8a] hidden sm:block">9 hits · 11:55 Mar 8</span>
        </div>
        <div className="max-w-[700px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          <div className="border border-[#c8d8c0] bg-[#f0f6ec] p-3">
            <div className="text-[10px] tracking-[0.16em] text-[#4a7a3a]">TOP ANSWER — sysadmin blog</div>
            <div className="text-[13px] leading-[1.6] text-[#1e2e1a] mt-1">&quot;If you must disguise an archive, name it something boring and back it up somewhere boring — hidden things are found. Close things are kept. — D.M. to Sarah, 2026-02-28&quot;</div>
            <div className="text-[10px] text-[#5a7a5a] mt-2">You searched this at 11:55 Mar 8. Sarah had already done it by 23:52 Feb 28.</div>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-[1.65] text-[#2a2a2e]">{p}</p>
          ))}
          <div className="text-[10px] text-[#8a9aaa] font-mono pt-3 border-t border-[#e0e6ea] flex justify-between"><span>search.example.org · air-gapped cold copy</span><span>9 HITS</span></div>
        </div>
      </div>
    );
  }

  if (kind === "weather") {
    return (
      <div className="min-h-full bg-[#0e1520] text-[#c0d0e8] flex flex-col">
        <div className="bg-[#162a4a] border-b border-[#24365e] px-4 py-2.5 flex items-center gap-3">
          <span className="text-[12px] font-bold tracking-wide">Weather</span>
          <span className="text-[11px] text-[#7a9ad0]">Philadelphia, PA · Extended</span>
          <span className="ml-auto text-[10px] bg-[#1e3a5f] border border-[#2e4a6f] px-2 py-0.5">08:05 Mar 5</span>
        </div>
        <div className="max-w-[700px] mx-auto px-5 py-5 space-y-4 flex-1 w-full">
          <div className="grid grid-cols-7 gap-1 text-center">
            {[
              { d: "Mar 3", h: "14°", l: "2°", c: "☁" },
              { d: "Mar 4", h: "12°", l: "1°", c: "☁" },
              { d: "Mar 5", h: "13°", l: "3°", c: "⛅" },
              { d: "Mar 6", h: "11°", l: "2°", c: "☁" },
              { d: "Mar 7", h: "10°", l: "4°", c: "🌧" },
              { d: "Mar 9", h: "9°", l: "2°", c: "☁" },
              { d: "Mar 10", h: "11°", l: "5°", c: "☁" },
            ].map((w) => (
              <div key={w.d} className="bg-[#162a4a] border border-[#24365e] py-2">
                <div className="text-[9px] tracking-wide text-[#5a7aaa]">{w.d}</div>
                <div className="text-[14px] mt-1">{w.c}</div>
                <div className="text-[11px] font-bold text-[#e0e8f8]">{w.h}</div>
                <div className="text-[10px] text-[#5a7aaa]">{w.l}</div>
              </div>
            ))}
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "text-[12.5px] leading-[1.65] text-[#8aabdc] bg-[#162a4a] border border-[#24365e] p-3" : "text-[13px] leading-[1.7] text-[#a0b2d0]"}>{p}</p>
          ))}
          <div className="text-[10px] text-[#4a5f8a] font-mono pt-3 border-t border-[#1e2e4a] flex justify-between"><span>weather.example.org · extended · no alerts</span><span>LOCAL GRID ONLY</span></div>
        </div>
      </div>
    );
  }

  if (kind === "kestrel-contact") {
    return (
      <div className="min-h-full bg-[#0e1418] text-[#d6e4e0] flex flex-col">
        <div className="border-b border-[#1e2e36] bg-[#0a1216] px-6 py-3 flex items-center gap-3">
          <svg width="20" height="14" viewBox="0 0 40 30"><path d="M2 24 L14 4 L20 16 L27 6 L38 24 Z" fill="#7fae8b" opacity="0.85" /></svg>
          <span className="tracking-[0.28em] text-[12px] font-bold">CONTACT — THE DIRECTORATE</span>
          <span className="ml-auto text-[9px] tracking-[0.16em] text-[#4a6060] border border-[#1e2e36] px-2 py-0.5">BY LETTER ONLY</span>
        </div>
        <div className="max-w-[600px] mx-auto px-6 py-8 flex-1 w-full">
          <div className="border border-[#1e2e36] bg-[#0a1216] p-5">
            <div className="text-[11px] tracking-[0.24em] text-[#5f7a7a] mb-4">CONTACT FORM — SUBMIT NOWHERE</div>
            <div className="space-y-3">
              {[
                { label: "Name", val: "— — — — — —" },
                { label: "Affiliation", val: "— — — — — —" },
                { label: "Message", val: "— — — — — — — — — — —" },
              ].map((f) => (
                <div key={f.label} className="border border-[#1e2e36] bg-[#0e1418] px-3 py-2.5">
                  <div className="text-[9px] tracking-[0.16em] text-[#4a6060]">{f.label.toUpperCase()}</div>
                  <div className="text-[12px] text-[#5a6f6a]">{f.val}</div>
                </div>
              ))}
            </div>
            <button disabled className="mt-4 w-full bg-[#1a2a24] border border-[#2a3d32] text-[#4a6060] py-2.5 text-[11px] tracking-[0.18em] cursor-not-allowed">SUBMIT — NO NETWORK</button>
            <div className="text-[10px] text-[#4a6060] text-center mt-2">Network disabled 2025-11-30. This form has never submitted.</div>
          </div>
          <div className="mt-6 space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[13px] leading-[1.7] text-[#b8c9c2]">{p}</p>
            ))}
          </div>
          <div className="text-[10px] text-[#3d524e] font-mono pt-4 border-t border-[#142024] mt-6 flex justify-between"><span>kestrel-institute.org/contact · cached 2026-03-07 23:10</span><span>FORM · DEAD</span></div>
        </div>
      </div>
    );
  }

  if (kind === "local-file") {
    return (
      <div className="min-h-full bg-[#1a1f1a] text-[#c8d4c8] flex flex-col font-mono">
        <div className="bg-[#0f1a14] border-b border-[#1d2e24] px-4 py-2 flex items-center gap-2">
          <span className="text-[10px] tracking-wide text-[#5a7f6a]">file://</span>
          <span className="text-[11px] text-[#8fcaa0]">/Research/ORPHEUS/anomaly_notes.txt</span>
          <span className="ml-auto text-[9px] bg-[#1a2620] border border-[#2a3d32] px-2 py-0.5 text-[#5a7f6a]">LOCAL FILE</span>
        </div>
        <div className="max-w-[700px] mx-auto px-5 py-5 space-y-3 flex-1 w-full font-sans">
          <div className="bg-[#0f1a14] border border-[#1d2e24] p-3 font-mono">
            <div className="text-[10px] tracking-[0.16em] text-[#5a7f6a] mb-2">PREVIEW — local file opened in Browser (not Viewer)</div>
            <pre className="text-[11.5px] leading-[1.6] text-[#9ec8b0] whitespace-pre-wrap">ORPHEUS — working notes · D.A. McDuff · 14 months · e-fold ~9.1 yr · cross-corr 0.93 · &quot;The dice are loaded, gently.&quot; — full text is in the Document Viewer (double-click the file in Files).</pre>
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-[13px] leading-[1.7] text-[#a0b8a8]">{p}</p>
          ))}
          <div className="text-[10px] text-[#4a5f52] font-mono pt-3 border-t border-[#1d2e24] flex justify-between"><span>file:///Research/ORPHEUS/anomaly_notes.txt · 23:47 Mar 9</span><span>LOCAL</span></div>
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
