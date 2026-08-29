"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sfx } from "@/audio/engine";
import { useOS } from "@/game/state/osStore";
import { Aperture, usePhaseExit } from "@/components/Aperture";

/* ============================================================
   CASE FILE 001 — the authorization.

   A case jacket, at desk scale: the spine on the left carries the
   case number, the classification stamp, the subject card and the
   02:13 dial the whole case turns on; the file on the right lands
   section by section. Sections use the desk's own idioms — record
   fields, a conflict table, a capability pair — not paragraphs of
   teletype.
   ============================================================ */

type Field = { label: string; value: string; sub?: string; tone?: "alert" };
type Conflict = { src: string; time: string; text: string; tone?: "amber" | "alert" };
type Column = { head: string; dim?: boolean; items: string[] };

type Section =
  | { no: string; legend: string; kind: "fields"; fields: Field[] }
  | { no: string; legend: string; kind: "conflict"; rows: Conflict[]; verdict: string }
  | { no: string; legend: string; kind: "objectives"; items: string[] }
  | { no: string; legend: string; kind: "partner"; intro: string; columns: Column[]; note: string }
  | { no: string; legend: string; kind: "notes"; notes: string[] };

const SECTIONS: Section[] = [
  {
    no: "I",
    legend: "SUBJECT",
    kind: "fields",
    fields: [
      { label: "NAME", value: "Dr. Daniel McDuff" },
      {
        label: "POSITION",
        value: "Professor of Physics and Astronomy — University of Pennsylvania",
        sub: "PREVIOUS POST: CERN — PRECISION MEASUREMENT",
      },
      { label: "STATUS", value: "Deceased — 2026-03-10, at home", tone: "alert" },
      { label: "RULING", value: "Accidental fall.", sub: "FILED WITHOUT AN EXAMINATION OF THIS MACHINE" },
      { label: "THIS UNIT", value: "His personal workstation. Air-gapped. Seized intact." },
    ],
  },
  {
    no: "II",
    legend: "ONE MINUTE, THREE RECORDS",
    kind: "conflict",
    rows: [
      {
        src: "ACCESS LOG",
        time: "02:13:07",
        text: "A login under Sarah Okafor's credentials. The gait signature on file is not hers.",
        tone: "amber",
      },
      {
        src: "WALL CLOCK",
        time: "02:13",
        text: "Stopped. Two photographs taken hours apart both show that same minute.",
        tone: "amber",
      },
      {
        src: "POWER LOG",
        time: "02:00–03:00",
        text: "Nothing. No interruption, no restart, no gap that would explain a stopped clock.",
      },
    ],
    verdict: "At most one of these describes what actually happened that minute.",
  },
  {
    no: "III",
    legend: "OBJECTIVE",
    kind: "objectives",
    items: [
      "Establish what happened to Dr. McDuff on the night of 2026-03-10.",
      "Recover his research. He scattered it across this disk under one name: ORPHEUS.",
      "File every source you rely on to the evidence board. A conclusion without a source will not hold.",
    ],
  },
  {
    no: "IV",
    legend: "YOUR PARTNER",
    kind: "partner",
    intro:
      "Daniel built an assistant into this workstation. ARIA resumed 74 hours after his last login and is still running. She can read every byte on this disk. She cannot see your screen.",
    columns: [
      {
        head: "ARIA READS",
        items: [
          "searches thousands of lines across files, mail, logs and messages",
          "cross-references names, dates and figures in seconds",
          "opens a document on your screen at the exact line",
        ],
      },
      {
        head: "YOU SEE",
        dim: true,
        items: [
          "reflections, handwriting, clock faces, a figure in a window",
          "photographs at 1× to 9× — zoom and pan",
          "tone, intent, and what is missing from a record",
        ],
      },
    ],
    note: "Work in that order. You describe what you see, ARIA finds what matches it, you decide what it means. Neither half closes this case alone.",
  },
  {
    no: "V",
    legend: "ON ARRIVAL",
    kind: "notes",
    notes: [
      "A field guide opens on the desktop. It explains the machine, not the answer.",
      "Daniel left three requests in /System/readme_first.txt. Start there — it takes a minute.",
      "Nothing here is timed and nothing advances on its own. The session is archived as you work.",
    ],
  },
];

const REVEAL_MS = 430;

export default function MissionBriefing({ onDone }: { onDone: () => void }) {
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
    <div className="brief-shell" onClick={advance} role="document" aria-label="case file 001 — authorization">
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
            <div className="brief-caseno-v">001</div>
          </div>

          <div className="brief-stampmark">RESTRICTED</div>

          <div className="brief-dial">
            <div className="brief-dial-face" aria-hidden>
              <span className="brief-dial-hand is-hour" />
              <span className="brief-dial-hand is-min" />
              <span className="brief-dial-pin" />
            </div>
            <div>
              <div className="brief-dial-t">02:13</div>
              <div className="brief-dial-s">
                THE MINUTE
                <br />
                EVERYTHING TOUCHES
              </div>
            </div>
          </div>

          <div className="brief-card">
            <div className="brief-card-k">SUBJECT OF RECORD</div>
            <div className="brief-card-name">D. MCDUFF</div>
            <dl>
              <div className="brief-card-row">
                <dt>STATUS</dt>
                <dd className="is-alert">DECEASED</dd>
              </div>
              <div className="brief-card-row">
                <dt>FOUND</dt>
                <dd>2026-03-10</dd>
              </div>
              <div className="brief-card-row">
                <dt>RULING</dt>
                <dd>ACCIDENTAL</dd>
              </div>
              <div className="brief-card-row">
                <dt>REOPENED</dt>
                <dd>BY YOU</dd>
              </div>
            </dl>
          </div>

          <div className="brief-spine-foot">
            OPENED 2026-03-10 09:12
            <br />
            ASSIGNED — YOU + ARIA
            <br />
            EVIDENCE ARCHIVED CONTINUOUSLY
          </div>
        </aside>

        {/* ---------- the file ---------- */}
        <div className="brief-file" ref={fileRef} onClick={advance}>
          <div className="brief-file-head">
            <span className="brief-file-title">INVESTIGATION AUTHORIZATION</span>
            <span className="brief-file-meta">MCDUFF WORKSTATION · AIR-GAPPED</span>
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
            {done ? "AUTHORIZATION GRANTED — CASE 001 IS YOURS" : "ASSEMBLING CASE FILE…"}
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
