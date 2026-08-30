"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/audio/engine";
import { useOS } from "@/game/state/osStore";
import { activeCorpus, type BriefingSection } from "@/game/data/corpus";
import { Aperture, usePhaseExit } from "@/components/Aperture";

/* ============================================================
   THE AUTHORIZATION — the case jacket.

   A case jacket, at desk scale: the spine on the left carries the
   case number, the classification stamp, the subject card and the
   one dial time the whole case turns on; the file on the right lands
   section by section. Sections use the desk's own idioms — record
   fields, a conflict table, a capability pair — not paragraphs of
   teletype.

   Every string is the corpus's. This component knows the shape of a
   case jacket and nothing about which case it is holding.
   ============================================================ */

type Section = BriefingSection;

const REVEAL_MS = 430;

export default function MissionBriefing({ onDone }: { onDone: () => void }) {
  const corpus = activeCorpus();
  const spine = corpus.briefingSpine;
  const SECTIONS: Section[] = corpus.briefing;
  const [shown, setShown] = useState(0);
  const fileRef = useRef<HTMLDivElement>(null);
  const os = useOS();
  const done = shown >= SECTIONS.length;
  const [leaving, leave] = usePhaseExit(onDone);

  const reduced = os.settings.reducedMotion;
  const sound = os.settings.sound;

  useEffect(() => {
    if (sound) sfx.ensure();
  }, [sound]);

  // sections land one at a time — a file being assembled, not characters crawling
  useEffect(() => {
    if (done) return;
    const delay = reduced ? 80 : shown === 0 ? 240 : REVEAL_MS;
    const t = setTimeout(() => {
      setShown((s) => s + 1);
      if (sound) sfx.bootKeyEnter();
    }, delay);
    return () => clearTimeout(t);
  }, [shown, done, reduced, sound]);

  // keep the newest section in view as the file grows
  useEffect(() => {
    const el = fileRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [shown, reduced]);

  useEffect(() => {
    if (done && sound) sfx.bootBeep();
  }, [done, sound]);

  const advance = useCallback(() => {
    if (!done) {
      setShown(SECTIONS.length);
      return;
    }
    if (sound) sfx.menuClick();
    os.addFlag("INTRO_COMPLETE");
    leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, leave, sound]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [advance]);

  return (
    <div className="brief-shell" onClick={advance} role="document" aria-label="case file — authorization">
      {leaving && <Aperture dir="out" />}

      <div className="boot-titlebar">
        <span className="boot-titlebar-label">
          <span className="boot-titlebar-glyph" aria-hidden>▣</span>
          CASE FILE — AUTHORIZATION
        </span>
        <span className="boot-titlebar-status">
          {done ? "COMPLETE" : `ASSEMBLING ${shown}/${SECTIONS.length}`}
        </span>
      </div>

      <div className="brief-body">
        {/* ---------- spine ---------- */}
        <aside className="brief-spine">
          <div className="brief-caseno">
            <div className="brief-caseno-k">CASE</div>
            <div className="brief-caseno-v">{spine.caseNo}</div>
          </div>

          <div className="brief-stampmark">{spine.stamp}</div>

          <div className="brief-dial">
            <div className="brief-dial-face" aria-hidden>
              <span className="brief-dial-hand is-hour" />
              <span className="brief-dial-hand is-min" />
              <span className="brief-dial-pin" />
            </div>
            <div>
              <div className="brief-dial-t">{spine.dialTime}</div>
              <div className="brief-dial-s">
                {spine.dialCaption.map((line, i) => (
                  <span key={line}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="brief-card">
            <div className="brief-card-k">{spine.cardKicker}</div>
            <div className="brief-card-name">{spine.cardName}</div>
            <dl>
              {spine.cardRows.map((r) => (
                <div className="brief-card-row" key={r.k}>
                  <dt>{r.k}</dt>
                  <dd className={r.alert ? "is-alert" : undefined}>{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="brief-spine-foot">
            {spine.footLines.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </div>
        </aside>

        {/* ---------- the file ---------- */}
        <div className="brief-file" ref={fileRef} onClick={advance}>
          <div className="brief-file-head">
            <span className="brief-file-title">{spine.fileTitle}</span>
            <span className="brief-file-meta">{spine.fileMeta}</span>
          </div>

          {SECTIONS.slice(0, shown).map((s) => (
            <section key={s.no} className={`brief-section ${reduced ? "" : "brief-in"}`}>
              <div className="brief-section-head">
                <span className="brief-section-no">{s.no}</span>
                <span className="brief-section-legend">{s.legend}</span>
                <span className="brief-section-rule" aria-hidden />
              </div>

              {s.kind === "fields" && (
                <div className="brief-fields">
                  {s.fields.map((f) => (
                    <div key={f.label} className="contents">
                      <div className="brief-flabel">{f.label}</div>
                      <div className={`brief-fvalue ${f.tone === "alert" ? "is-alert" : ""}`}>
                        {f.value}
                        {f.sub && <small>{f.sub}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {s.kind === "conflict" && (
                <>
                  <div className="brief-conflict">
                    {s.rows.map((r) => (
                      <div
                        key={r.src}
                        className={`brief-conflict-row ${r.tone === "amber" ? "is-amber" : r.tone === "alert" ? "is-alert" : ""}`}
                      >
                        <div className="brief-conflict-src">
                          {r.src}
                          <b>{r.time}</b>
                        </div>
                        <div className="brief-conflict-txt">{r.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="brief-verdict">{s.verdict}</div>
                </>
              )}

              {s.kind === "objectives" && (
                <div className="brief-obj">
                  {s.items.map((t, i) => (
                    <div key={t} className="contents">
                      <div className="brief-obj-n">{String(i + 1).padStart(2, "0")}</div>
                      <div className="brief-obj-t">{t}</div>
                    </div>
                  ))}
                </div>
              )}

              {s.kind === "partner" && (
                <>
                  <div className="brief-note">{s.intro}</div>
                  <div className="brief-split">
                    {s.columns.map((c) => (
                      <div key={c.head} className="brief-col">
                        <div className={`brief-col-head ${c.dim ? "is-dim" : ""}`}>{c.head}</div>
                        <ul>
                          {c.items.map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="brief-note mt-3">{s.note}</div>
                </>
              )}

              {s.kind === "notes" && (
                <div className="brief-notes">
                  {s.notes.map((n) => (
                    <div key={n} className="brief-note">
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="brief-rail">
        <span className="brief-rail-left">
          <span className="boot-status-dot" aria-hidden />
          <span className="truncate">
            {done ? spine.railDone : spine.railOpen}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span className="brief-rail-hint">{done ? "ENTER" : "CLICK TO SKIP"}</span>
          <button
            className="btn-bevel brief-go"
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
          >
            {done ? "OPEN WORKSTATION ▸" : "SHOW ALL"}
          </button>
        </span>
      </div>
    </div>
  );
}
