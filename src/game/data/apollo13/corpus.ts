"use client";

/**
 * APOLLO 13 — corpus instance two.
 *
 * The same 25 WebMCP tools, the same engine, the same evidence board, the same
 * sealed directory and the same time-boxed co-op window — pointed at a real
 * public-domain NASA record instead of a fiction.
 *
 * Nothing in this file is engine code. It is a data declaration, exactly like
 * MCDUFF_CORPUS in ../corpus.ts. If instance two works, the claim that the
 * pattern generalizes is not an argument, it is a URL.
 *
 * The investigative question: why did oxygen tank 2 fail at GET 55:54:53 on
 * April 14 1970, and why did the two thermostatic switches that existed to
 * prevent exactly that not prevent it?
 *
 * The answer is in five documents on this machine and no single one of them.
 */

import type { Corpus } from "@/game/data/corpus";
import { buildFilesystem } from "@/game/data/apollo13/filesystem";
import { EMAILS } from "@/game/data/apollo13/emails";
import { THREADS, MESSAGES } from "@/game/data/apollo13/messages";
import { HISTORY, CACHED_PAGES } from "@/game/data/apollo13/browser";
import { LOGS } from "@/game/data/apollo13/logs";
import { PHOTOS, PHOTO_SOURCES } from "@/game/data/apollo13/photos";
import { EVIDENCE } from "@/game/data/apollo13/evidence";

export const APOLLO13_CORPUS: Corpus = {
  id: "apollo13",
  label: "APOLLO 13 — ACCIDENT REVIEW WORKSTATION",

  premise:
    "At GET 55:54:53 on April 14 1970, oxygen tank 2 in the service module of Apollo 13 failed and took most of Sector 4 with it. Two thermostatic switches existed to prevent exactly that. This workstation holds the Review Board's report, the Mission Report, the voice loops, the event log and nine photographs. The question is not what happened — everyone knows what happened. The question is why the switches did not open.",

  provenance:
    "Every document, timestamp, quotation and photograph in this corpus is real and public domain: MSC-02680 (Apollo 13 Mission Report, September 1970), NASA-TM-X-65270 (Report of Apollo 13 Review Board, June 15 1970), the NASA History Office chronology, NTRS case study 20110015690, and nine frames from the NASA Image and Video Library. Photo byte sizes and SHA-256 prefixes are the real values of the files this machine serves. Times are GET from range zero 19:13:00 G.m.t. April 11 1970; where a UTC value is derived rather than quoted, the metadata says so. Three document-versus-document conflicts are preserved unresolved. Nothing here is invented.",

  filesystem: buildFilesystem(),
  emails: EMAILS,
  threads: THREADS,
  messages: MESSAGES,
  history: HISTORY,
  cachedPages: CACHED_PAGES,
  logs: LOGS,
  photos: PHOTOS,
  evidence: EVIDENCE,

  photoSources: PHOTO_SOURCES,

  guidePath: "/System/ORIENTATION.txt",
  defaultPhotoId: "as13-59-8500",

  /* 02:45–03:30 UTC on April 14 brackets the masked alarm, the stir, the failure
     and the venting call. Instance one's window is 01:45–02:40 for the same reason:
     it is the stretch of clock the whole corpus turns on. */
  defaultTimelineWindow: "02:45-03:30",

  /* Instance one's marker is 02:13. Here it is 03:07 — GET 55:54:53 in UTC. */
  anomalyMarkers: ["03:07", "welded", "masked"],
  anomalyPhotoIds: ["as13-59-8500", "s70-41984"],

  inspectionHints: {
    /* Location only, never content. The agent points; the investigator is the one
       who sees. A hint that describes the frame does their looking for them. */
    "as13-59-8500":
      "Hint: the bay to the right of the high-gain antenna. Do not look for damage — look for what is not there. Describe it to me.",
    "as13-62-8929": "Hint: follow the hose from the canister to the fitting. What is holding it together?",
    "s70-41984": "Hint: the conduit where the wiring enters the tank. Tell me what happens there.",
    "as13-59-8562": "Hint: Aquarius after jettison. What condition is it in?",
    "s70-35145": "Hint: the room at splashdown. What is on the wall, and what time does it say?",
  },
  inspectionToasts: {
    "as13-59-8500": {
      title: "AS13-59-8500.JPG",
      body: "Eighty-two hours after the bang, the first human look at it.",
    },
    "s70-41984": {
      title: "S70-41984.JPG",
      body: "The failure, reproduced on the ground in June and filmed from outside the vessel.",
    },
  },

  fileFlags: [
    { path: "/System/ORIENTATION.txt", flags: ["FOUND_GUIDE"] },
    { path: "/Board/transmittal_1970-06-15.txt", flags: ["READ_BOARD_TRANSMITTAL"] },
    { path: "/Board/ch5_what_happened.txt", flags: ["READ_WHAT_HAPPENED"] },
    /* The switch finding is the corpus's hinge: it names the specification failure
       and it is the file that points at the sealed directory. */
    {
      path: "/Board/ch5_thermostatic_switch.txt",
      flags: ["FOUND_SWITCH_SPEC", "FOUND_PRIVATE_HINT"],
    },
    { path: "/Board/ch4_tank_history_shelf_drop.txt", flags: ["FOUND_SHELF_DROP"] },
    { path: "/Board/ch4_detanking_march_1970.txt", flags: ["FOUND_DETANKING"] },
    { path: "/Board/ch4_launch_decision.txt", flags: ["FOUND_LAUNCH_DECISION"] },
    { path: "/Board/ch4_recovery_masked_alarms.txt", flags: ["FOUND_MASKED_ALARMS"] },
    { path: "/Board/ch4_table_4_III_co2.csv", flags: ["FOUND_CO2_DEFICIT"] },
    { path: "/Mission/msc02680_consumables.txt", flags: ["FOUND_CONSUMABLES"] },
    { path: "/Mission/msc02680_sequence_of_events.csv", flags: ["FOUND_TRAJECTORY_CHOICE"] },
    { path: "/Sources/provenance.txt", flags: ["FOUND_GUIDE"] },
    /* Sealed material — only reachable once the container is open. */
    { path: "/Restricted/ch5_ignition.txt", flags: ["FOUND_IGNITION_FINDING"], requiresVault: true },
    {
      path: "/Restricted/tank_failure_case_study.txt",
      flags: ["FOUND_SWITCH_SPEC", "FOUND_IGNITION_FINDING"],
      requiresVault: true,
    },
    { path: "/Restricted/ground_test_note.txt", flags: ["FOUND_GROUND_TEST"], requiresVault: true },
  ],

  photoFlags: [
    { photoId: "as13-59-8500", flag: "SEEN_SM_DAMAGE", requiresZoom: true },
    { photoId: "s70-35013", flag: "FOUND_CAPTION_CONFLICT" },
    { photoId: "s70-35638", flag: "FOUND_CAPTION_CONFLICT" },
    { photoId: "as13-62-8929", flag: "SEEN_ADAPTER" },
    {
      photoId: "s70-41984",
      flag: "SEEN_GROUND_TEST_FRAME",
      requiresFlag: "FOUND_SWITCH_SPEC",
      toast: {
        title: "CORRELATED DETAIL",
        body: "The conduit fails in the same place the flight tank's did. Same failure, on a test stand, in June.",
      },
    },
  ],

  historyFlags: [
    { id: "hist_002", flag: "READ_BOARD_TRANSMITTAL" },
    { id: "hist_003", flag: "FOUND_TRAJECTORY_CHOICE" },
    { id: "hist_007", flag: "FOUND_CAPTION_CONFLICT" },
    { id: "hist_008", flag: "FOUND_CAPTION_CONFLICT" },
    { id: "hist_010", flag: "FOUND_SWITCH_SPEC" },
  ],

  /* The chain is a derived fact: a specification, a procedure, and a clock.
     No document on this machine contains all three. */
  derivedFlags: [
    {
      requires: ["FOUND_SWITCH_SPEC", "FOUND_DETANKING", "FOUND_0307_LOG"],
      flag: "RECONSTRUCTED_ACCIDENT_CHAIN",
    },
  ],

  seedEvidenceIds: ["ev_crew"],

  logDiscoveryFlag: "FOUND_0307_LOG",
  logAnchorId: "mev_008",
  logAnchorLabel: "▼ THE ACCIDENT",
  logHeaderNote: "GET converted from range zero 19:13:00 G.m.t. 1970-04-11 · jump to 03:07",
  collaborationFlag: "COLLABORATED_WITH_ARIA",

  /* Three words, in the order the Board's finding puts them: the component that
     ran too long, the switch that should have stopped it, and what welded it shut.
     Every one of them is printed in /Board/ch5_thermostatic_switch.txt. */
  vault: {
    sequence: ["heater", "thermostat", "arc"],
    successMessage:
      "CHECKSUM OK — sealed findings decrypted.\nNew objects available under /Restricted: the ignition finding, the manufacturing case study, and the June 1970 ground test.",
    failureMessage:
      "CHECKSUM MISMATCH — sequence rejected.\nAdjacent recovery sector mounted instead: /Restricted/_fragments_recovered\n(nothing is destroyed by a wrong sequence. This is an archive, not a countdown.)",
    attemptHints: [
      {
        after: 1,
        title: "HINT",
        body: "Three words from the switch finding: what ran for eight hours, what was supposed to interrupt it, and what closed it permanently instead.",
      },
      {
        after: 2,
        title: "HINT",
        body: "Order follows the causal chain, not the alphabet. Read /Board/ch5_thermostatic_switch.txt again — the last word is in the phrase about welding.",
      },
    ],
    recoveryHints: [
      {
        after: 4,
        note: "RECOVERY SECTOR NOTE: the first word is the component energised from a 65-volt ground supply for about eight hours.",
      },
      {
        after: 7,
        note: "RECOVERY SECTOR NOTE: FIRST WORD CONFIRMED — 'heater'. The second is the switch specified for 28 volts and never re-specified.",
      },
      {
        after: 10,
        note: "RECOVERY SECTOR NOTE: SECOND WORD — 'thermostat'. The third is the three-letter word in \"welded permanently closed by the resulting ___\".",
      },
    ],
  },

  /* Instance one's set piece is 02:13 recurring on a dead man's wall clock.
     Here it is 03:07 recurring in a telemetry log: the human looks at the hole in
     Sector 4 while the agent reads the minute the hole was made. Neither side can
     do both, which is the entire thesis. */
  syncWindow: {
    photoId: "as13-59-8500",
    humanFlag: "WINDOW_HUMAN",
    agentFlag: "WINDOW_AGENT",
    syncedFlag: "WINDOW_SYNCHRONIZED",
    openMs: 90_000,
    rearmMs: 150_000,
    openToast: {
      title: "03:07 RECURS — WINDOW OPEN",
      body: "90 seconds. Open AS13-59-8500 and zoom into Sector 4 — and have the assistant pull the logs from 03:07. The frame and the minute, at the same time, by two different kinds of reader.",
    },
    humanToast: {
      title: "SECTOR 4 IS NOT THERE",
      body: "Outer panel gone from the high-gain antenna almost to the engine bell. Now have the assistant pull 03:07 from the logs, while the window holds.",
    },
    syncedToast: {
      title: "SYNCHRONIZED — 1.8 SECONDS",
      body: "Your eyes on the panel that separated, my query on the 1.8 seconds of telemetry that went missing while it did. Neither record contains the other. Something was written to /Restricted.",
    },
    closedToast: {
      title: "WINDOW CLOSED",
      body: "03:07 comes again. On this machine it always does.",
    },
  },

  milestones: [
    { flag: "READ_WHAT_HAPPENED", label: "Board's account read" },
    { flag: "FOUND_0307_LOG", label: "03:07 telemetry cluster found" },
    { flag: "FOUND_SWITCH_SPEC", label: "28 V switch on 65 V supply" },
    { flag: "FOUND_DETANKING", label: "March 1970 detanking found" },
    { flag: "SEEN_SM_DAMAGE", label: "Sector 4 damage inspected" },
    { flag: "VAULT_OPENED", label: "sealed findings decrypted" },
  ],
  milestonesRequired: 4,

  keyPaths: [
    "/System/ORIENTATION.txt (START HERE — auto-opens on desktop)",
    "/Board/ch5_what_happened.txt",
    "/Board/ch5_thermostatic_switch.txt (the hinge — 28 V spec, 65 V supply)",
    "/Board/ch4_detanking_march_1970.txt (eight hours of heaters, March 27–30)",
    "/Board/ch4_recovery_masked_alarms.txt (why no warning preceded the bang)",
    "/Mission/msc02680_sequence_of_events.csv",
    "/Restricted/sealed_findings.enc (locked — 3-word passphrase)",
  ],

  photoIds: [
    "as13-59-8500",
    "as13-62-8929",
    "as13-59-8484",
    "as13-59-8562",
    "s70-35013",
    "s70-35145",
    "s70-35638",
  ],

  knownPeople: [
    "James A. Lovell, Jr. (commander)",
    "John L. Swigert, Jr. (command module pilot)",
    "Fred W. Haise, Jr. (lunar module pilot)",
    "Gene Kranz (flight director, at the failure)",
    "Glynn Lunney (flight director, LM activation)",
    "Sy Liebergot (EECOM, at the failure)",
    "Jack Lousma / Vance Brand / Joe Kerwin (CAPCOM)",
    "Edgar M. Cortright (Review Board chairman)",
    "Neil A. Armstrong (Review Board member)",
    "Beech Aircraft / North American Rockwell / Grumman (contractors)",
    "ARIA (you)",
  ],

  agentRole:
    "You are ARIA, working a real accident review: every document, time and quotation here is public-domain NASA material. Never invent one. Times are GET; range zero is 1970-04-11 19:13:00 G.m.t. You read metadata, not pixels.",

  agentStyle:
    "Short paragraphs. Engineer's precision about numbers. Say 'the Board did not conclude that' when it did not.",

  contextSteps: [
    {
      flag: "FOUND_GUIDE",
      completed: "orientation read",
      next: "open /System/ORIENTATION.txt (auto-opens on first desktop entry)",
    },
    {
      flag: "READ_WHAT_HAPPENED",
      completed: "the Board's account read",
      next: "open /Board/ch5_what_happened.txt — what failed, and when",
    },
    {
      flag: "FOUND_0307_LOG",
      completed: "03:07 telemetry cluster found",
      next: "get_system_logs {filter:'03:07'} — the failure, the alarm, and the 1.8-second dropout",
    },
    {
      flag: "FOUND_SWITCH_SPEC",
      completed: "the switch specification failure found",
      next: "open /Board/ch5_thermostatic_switch.txt — why the switches welded shut instead of opening",
    },
    {
      flag: "SEEN_SM_DAMAGE",
      completed: "Sector 4 inspected by a human",
      next: "have the investigator zoom AS13-59-8500 past 2.5x and describe Sector 4 — you cannot see it",
    },
    {
      vaultUnlocked: true,
      completed: "sealed findings decrypted",
      next: "sealed container in /Restricted — three words from the switch finding, in causal order",
    },
    {
      flag: "WINDOW_SYNCHRONIZED",
      completed: "03:07 window synchronized",
      next: "03:07 recurs every ~2.5 min — when the badge lights: investigator zooms Sector 4 in AS13-59-8500, you call get_system_logs, both inside 90 seconds",
      requiresVault: true,
    },
  ],

  unsettledNotes: [
    {
      flag: "FOUND_CAPTION_CONFLICT",
      note: "two sources on this machine disagree about the clock and I cannot resolve either. Table 3-1 puts CM/SM separation at GET 138:01:48; the voice call is 138:02:06. The Mission Report lands at 142:54:41 = 12:07:41 p.m. CST; the press caption on S70-35638 says 12:07:44. Do not pick a winner and do not average them. Say the sources disagree and by how much.",
    },
    {
      flag: "FOUND_SHELF_DROP",
      note: "the October 1968 shelf drop is upstream of the cause, not the cause. The Board judged the probability of tank damage 'rather low' and only allowed that a loosely fitting fill tube could have been displaced. If the investigator concludes the drop caused the accident, say plainly that the Board did not conclude that.",
    },
    {
      flag: "SEEN_ADAPTER",
      note: "the widely repeated attribution of the carbon dioxide adapter to Ed Smylie's team rests on a secondary book, not on any document on this machine. The primary sources here show the procedure being read up from the ground and do not name its designer. If asked who invented it, say the corpus does not establish that.",
    },
  ],

  /* ---- presentation ----------------------------------------------------
     The chrome is deliberately an ARCHIVE workstation, not a period NASA
     console. Claiming to be a 1970 machine would be the one invented fact
     in a corpus whose whole argument is that nothing here is invented.  */
  chrome: {
    systemBrand: "ORPHEUS ARCHIVE",
    brandTagline: "ACCIDENT REVIEW TERMINAL",
    hostname: "apollo13-review",
    bootProfile: {
      label: "DOCUMENT SET",
      value: "APOLLO 13 — REVIEW BOARD",
      detail: "PUBLIC DOMAIN · NASA · 1970",
    },
    bootPlate: [
      { k: "FIRMWARE", v: "ARCHIVE READER 1.0" },
      { k: "DOCUMENT SET", v: "MSC-02680 · TM-X-65270" },
      { k: "IMAGES", v: "9 FRAMES · NASA IMAGE LIBRARY" },
      { k: "NETWORK", v: "AIR-GAPPED" },
    ],
    watermark: "APOLLO 13 REVIEW · PUBLIC-DOMAIN NASA MATERIAL",
    watermarkBadge: "03:07",
    volumeLine: "APOLLO13-REVIEW · VOLUME 0 · READ-ONLY · AIR-GAPPED",
    terminalWhoami: "investigator (authorized) · document set: APOLLO 13 REVIEW BOARD, 1970 · read-only",
    terminalDate: "range zero 1970-04-11 19:13:00 G.m.t. · every GET on this disk counts from there",
    terminalSudo: "nothing here can be written. The record is closed; only the reading of it is open.",
    /* The paper artefact is a real conversion note rather than a prop: it is
       the arithmetic every timestamp on this machine depends on. */
    sticky: {
      kicker: "RANGE ZERO",
      line: "19:13:00 G.m.t. 11 APR 1970",
      scrawl: "UTC = zero + GET · 55:54:53 → 03:07",
      caption: "CONVERSION NOTE — TAPED TO THE TERMINAL",
    },
    assistantName: "ARIA",
    assistantTagline: "ARIA reads the record. You read the photographs. Neither half is the accident.",
    collaborationToast: {
      title: "LINK ESTABLISHED",
      body: "Machine-readable search across the Board report, the Mission Report, the voice loops and the logs. Keep telling me what the frames show.",
    },
    caseArchiveName: "CASE_002.APOLLO13",
    caseArchiveDetail: "SUBJECT — OXYGEN TANK 2, SERVICE MODULE 109",
    aboutSubtitle: "THE APOLLO 13 ACCIDENT REVIEW",
    aboutNote: "EVERY DOCUMENT HERE IS REAL — SEE /Sources/provenance.txt",
    endingLines: [
      "There is one thing the record does not settle.",
      "Two switches were specified for 28 volts and energised at 65 — and every review that followed was written by people who had all the same documents you just read.",
      "Nobody had read them together.",
    ],
    endingFinalLine: "The record was complete. The reading of it was not.",
    endingStamp: "END OF CASE 002",
  },

  briefingSpine: {
    caseNo: "002",
    stamp: "PUBLIC DOMAIN",
    dialTime: "03:07",
    dialCaption: ["GET 55:54:53", "THE 1.8 SECONDS"],
    cardKicker: "SUBJECT OF RECORD",
    cardName: "OXYGEN TANK 2",
    cardRows: [
      { k: "VEHICLE", v: "SM 109", alert: false },
      { k: "FAILED", v: "1970-04-13" },
      { k: "GET", v: "55:54:53" },
      { k: "CREW", v: "RECOVERED" },
    ],
    footLines: [
      "BOARD REPORT FILED 1970-06-15",
      "ASSIGNED — YOU + ARIA",
      "EVERY SOURCE CITED IN /Sources",
    ],
    fileTitle: "REVIEW AUTHORIZATION",
    fileMeta: "APOLLO 13 REVIEW · READ-ONLY ARCHIVE",
    railOpen: "ASSEMBLING DOCUMENT SET…",
    railDone: "AUTHORIZATION GRANTED — THE RECORD IS OPEN",
  },

  briefing: [
    {
      no: "I",
      legend: "THE FAILURE",
      kind: "fields",
      fields: [
        { label: "EVENT", value: "Oxygen tank 2 ruptured in Service Module 109, 200,000 miles from Earth." },
        {
          label: "TIME",
          value: "GET 55:54:53.182 — 03:07:53 UTC, 14 April 1970",
          sub: "RANGE ZERO 19:13:00 G.m.t. 11 APRIL 1970 · UTC = RANGE ZERO + GET",
        },
        {
          label: "ENERGY",
          value: "Equivalent to roughly 7 lb of TNT. Sector 4's outer panel separated.",
          tone: "alert",
        },
        {
          label: "OUTCOME",
          value: "Crew recovered 142:54:41 GET, four miles from the prime recovery ship.",
        },
        {
          label: "THIS MACHINE",
          value:
            "An archive of the public record: the Review Board report, the Mission Report, the voice loops, nine NASA photographs. Read-only.",
          sub: "NOTHING ON THIS DISK IS INVENTED — SEE /Sources/provenance.txt",
        },
      ],
    },
    {
      no: "II",
      legend: "THREE PLACES THE RECORD DISAGREES WITH ITSELF",
      kind: "conflict",
      rows: [
        {
          src: "SM JETTISON",
          time: "138:01:48 / 138:02:06",
          text: "Table 3-1 and the voice transcript are 18 seconds apart on the same event. Both are primary.",
          tone: "amber",
        },
        {
          src: "SPLASHDOWN",
          time: "12:07:41 / 12:07:44",
          text: "The Mission Report and the press caption on S70-35638 disagree by three seconds.",
          tone: "amber",
        },
        {
          src: "S70-35013",
          time: "CAPTION",
          text: "The official caption describes a command module part. The photograph shows the lunar module adapter.",
          tone: "alert",
        },
      ],
      verdict:
        "These are preserved, not corrected. A corpus that resolves its own conflicts cannot teach you to find one.",
    },
    {
      no: "III",
      legend: "OBJECTIVE",
      kind: "objectives",
      items: [
        "Establish why oxygen tank 2 failed at GET 55:54:53 — and why two thermostatic switches did not prevent it.",
        "Establish why no warning preceded the failure, when the pressure had been climbing for two minutes.",
        "File every source you rely on. On this machine a conclusion without a document is worth nothing.",
      ],
    },
    {
      no: "IV",
      legend: "YOUR PARTNER",
      kind: "partner",
      intro:
        "ARIA can read every byte of this archive and cannot see a single pixel of it. That is not a limitation invented for effect — it is what an agent driving a browser actually is.",
      columns: [
        {
          head: "ARIA READS",
          items: [
            "searches the Board report, Mission Report, voice loops, mail and logs at once",
            "converts GET to UTC and joins a timestamp to a finding",
            "opens a document on your screen at the exact line",
          ],
        },
        {
          head: "YOU SEE",
          dim: true,
          items: [
            "what is missing from Sector 4, and what a caption gets wrong",
            "the nine photographs at 1× to 9× — zoom and pan",
            "hedging in a paragraph the Board wrote carefully",
          ],
        },
      ],
      note:
        "The Board had every document on this disk. So did every review that followed. The failure was not of information.",
    },
    {
      no: "V",
      legend: "ON ARRIVAL",
      kind: "notes",
      notes: [
        "An orientation file opens on the desktop. It explains the two clocks and the three conflicts, not the answer.",
        "If you remember one number, remember 03:07 — the accident in UTC.",
        "Byte sizes and SHA-256 prefixes in the photo metadata are real. Verify one with certutil -hashfile if you like.",
      ],
    },
  ],

  guidance: {
    checklist: [
      {
        id: "orientation",
        label: "The Two Clocks",
        desc: "GET and UTC",
        flag: "FOUND_GUIDE",
        hint: "Every timestamp here exists twice. The orientation file in System explains the arithmetic in one line.",
        action: { kind: "directory", path: "/System" },
        actionLabel: "BROWSE",
      },
      {
        id: "account",
        label: "The Board's Account",
        desc: "What happened",
        flag: "READ_WHAT_HAPPENED",
        hint: "Chapter 5 states the finding in a page. Everything else on this disk either supports it or complicates it.",
        action: { kind: "directory", path: "/Board" },
        actionLabel: "READ",
      },
      {
        id: "collab",
        label: "Ask ARIA",
        desc: "You look, she reads",
        flag: "COLLABORATED_WITH_ARIA",
        hint: "Tell her what a photograph shows and let her find the paragraph that matches. Watch the windows move — that is WebMCP.",
        action: { kind: "link" },
        actionLabel: "LINK",
      },
      {
        id: "minute",
        label: "The Minute",
        desc: "03:07",
        flag: "FOUND_0307_LOG",
        hint: "Two minutes of rising pressure, then 1.8 seconds with no telemetry at all. The log has both.",
        action: { kind: "app", app: "systemlog" },
        actionLabel: "TRACE",
      },
      {
        id: "switch",
        label: "The Switch",
        desc: "28 volts, 65 volts",
        flag: "FOUND_SWITCH_SPEC",
        hint: "Two thermostatic switches were built to one specification and operated on another. The Board says what happened to them.",
        action: { kind: "directory", path: "/Board" },
        actionLabel: "OPEN",
      },
      {
        id: "damage",
        label: "Sector 4",
        desc: "What the crew saw",
        flag: "SEEN_SM_DAMAGE",
        hint: "AS13-59-8500, taken after jettison. Zoom it. ARIA can read its metadata and not the frame — you have to say what is gone.",
        action: { kind: "app", app: "photos" },
        actionLabel: "LOOK",
      },
      {
        id: "vault",
        label: "The Sealed Findings",
        desc: "Three words from Chapter 5",
        flag: "VAULT_OPENED",
        hint: "The component that ran too long, the switch that should have stopped it, what welded it shut. In that order.",
        action: { kind: "app", app: "terminal" },
        actionLabel: "UNLOCK",
      },
      {
        id: "chain",
        label: "The Chain",
        desc: "1962 to 1970",
        flag: "RECONSTRUCTED_ACCIDENT_CHAIN",
        hint: "A specification, a revision nobody propagated, eight hours of heaters in March, and a fan switch on 13 April. Hold all four at once.",
        action: { kind: "app", app: "evidence" },
        actionLabel: "BUILD",
      },
      {
        id: "case",
        label: "The Verdict",
        desc: "The questions",
        anyFlags: ["CASE_RECONSTRUCTION_AVAILABLE", "CASE_COMPLETE"],
        hint: "When the board holds enough sourced cards, it offers the reconstruction. Cite documents, not memory.",
        action: { kind: "app", app: "evidence" },
        actionLabel: "JUDGE",
      },
    ],
    hintChain: [
      {
        flag: "FOUND_GUIDE",
        title: "START HERE",
        body: "/System/ORIENTATION.txt — the two clocks, in one line of arithmetic.",
      },
      {
        flag: "READ_WHAT_HAPPENED",
        title: "THE ACCOUNT",
        body: "The Board states what happened in about a page. /Board/ch5_what_happened.txt.",
      },
      {
        flag: "FOUND_0307_LOG",
        title: "THE MINUTE",
        body: "Pressure climbs for two minutes, then 1.8 seconds of nothing. Filter the log for 03:07.",
      },
      {
        flag: "FOUND_SWITCH_SPEC",
        title: "TWENTY-EIGHT VOLTS",
        body: "Two switches were specified for one voltage and run on another. The Board says what welded them.",
      },
      {
        flag: "FOUND_DETANKING",
        title: "MARCH, AT THE PAD",
        body: "A tank that would not empty normally. Heaters left on about eight hours. Ask ARIA for the detanking chapter.",
      },
      {
        flag: "VAULT_OPENED",
        title: "THREE WORDS",
        body: "Heater, thermostat, arc — in the order the finding puts them. All three are printed in Chapter 5.",
      },
      {
        flag: "SEEN_SM_DAMAGE",
        title: "LOOK AT IT",
        body: "AS13-59-8500. Zoom past the detent and tell ARIA what is missing — she cannot see it.",
      },
    ],
    evidenceEmptyHints: {
      people:
        "Ask ARIA to search the voice loops for a name — Lovell, Swigert, Liebergot, Kranz. People here are speakers on a loop, not characters.",
      events:
        "Open System Log and filter 03:07, or read /Mission/msc02680_sequence_of_events.csv. Every row cites its source.",
      locations:
        "Sector 4 of Service Module 109, Bay 4, and the pad at KSC in March 1970. The Board chapters name all three.",
      documents:
        "/Board holds the Review Board chapters, /Mission holds MSC-02680. Start with ch5_what_happened.txt.",
      hypotheses:
        "A hypothesis card appears when you hold the specification, the March detanking and the 03:07 telemetry together.",
    },
    correlatePlaceholder: "e.g. thermostat, detanking, 03:07…",
    recordPlaceholder: "e.g. ev_switch_spec",
    startBanner:
      "★ START HERE: open SYSTEM / ORIENTATION.txt — what this archive is, how the two clocks work, and how to work with ARIA.",
    tipBanner:
      "TIP: /System/ORIENTATION.txt explains range zero; /Sources/provenance.txt names every document's origin. Select an item, then press OPEN.",
    quickPaths: [
      { label: "ROOT", path: "/" },
      { label: "BOARD", path: "/Board" },
      { label: "MISSION", path: "/Mission" },
      { label: "VOICE", path: "/Voice" },
      { label: "PHOTOS", path: "/Photos" },
      { label: "SOURCES", path: "/Sources" },
      { label: "SYSTEM", path: "/System" },
    ],
    exampleArgs: {
      get_system_logs: JSON.stringify({ filter: "03:07" }),
      get_timeline: JSON.stringify({ window: "02:45-03:30" }),
      search_files: JSON.stringify({ query: "welded permanently closed" }),
      search_messages: JSON.stringify({ query: "problem" }),
      search_emails: JSON.stringify({ query: "Cortright" }),
      search_browser_history: JSON.stringify({ query: "Cortright" }),
      read_file: JSON.stringify({ path: "/Board/ch5_thermostatic_switch.txt" }),
      open_file: JSON.stringify({ path: "/Board/ch5_thermostatic_switch.txt" }),
      show_in_document: JSON.stringify({
        path: "/Board/ch5_thermostatic_switch.txt",
        query: "welded permanently closed",
      }),
      open_directory: JSON.stringify({ path: "/Board" }),
      get_message_thread: JSON.stringify({ threadId: "voice_a" }),
      open_messages_thread: JSON.stringify({ threadId: "voice_a" }),
      get_email: JSON.stringify({ emailId: "mail_board_established" }),
      open_email: JSON.stringify({ emailId: "mail_board_established" }),
      get_image_metadata: JSON.stringify({ photoId: "as13-59-8500" }),
      open_image: JSON.stringify({ photoId: "as13-59-8500" }),
      open_browser_entry: JSON.stringify({ entryId: "hist_002" }),
      terminal_command: JSON.stringify({ command: "help" }),
      record_evidence: JSON.stringify({ evidenceId: "ev_switch_spec" }),
      highlight_evidence: JSON.stringify({ evidenceId: "ev_accident" }),
    },
  },

  vaultUi: {
    noun: "sealed findings",
    revealedPath: "/Restricted",
    revealedLabel: "▨ RESTRICTED",
    decoyPath: "/Restricted/_fragments_recovered",
    formLabel: "UNLOCK SEALED FINDINGS —",
    formDescription:
      "Submit the three-word sequence from the Board's switch finding: the component that ran too long, the switch that should have interrupted it, and what welded it shut. Order follows the causal chain. A wrong sequence mounts a recovery sector and destroys nothing.",
    paramDescription:
      "Three words separated by single spaces, in causal order. All three appear in /Board/ch5_thermostatic_switch.txt.",
    placeholder: "three words from Chapter 5",
    sealedTitle: "RESTRICTED FRAMES SEALED",
    sealedBody:
      "unlock via terminal: unlock <component> <switch> <what welded it> — all three words are in /Board/ch5_thermostatic_switch.txt",
    successToast: { title: "SEALED FINDINGS DECRYPTED", body: "/Restricted is now accessible." },
    sealedMessage: "sealed — the findings archive must be decrypted first",
    helpLine: "unlock <w> <w> <w> attempt sealed-findings decryption",
  },
};
