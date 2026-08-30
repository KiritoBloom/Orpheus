"use client";

import type {
  AppId,
  CachedPage,
  ChatMsg,
  Email,
  EvidenceItem,
  EvidenceSection,
  FsNode,
  HistoryEntry,
  LogEntry,
  PhotoMeta,
  StoryFlag,
  Thread,
} from "@/types/game";

import { buildFilesystem } from "@/game/data/filesystem";
import { EMAILS } from "@/game/data/emails";
import { CHAT_MESSAGES, THREADS } from "@/game/data/chatMessages";
import { CACHED_PAGES, HISTORY } from "@/game/data/browserHistory";
import { LOGS } from "@/game/data/systemLogs";
import { PHOTOS } from "@/game/data/photos";
import { EVIDENCE } from "@/game/data/evidence";

/* ============================================================
   CORPUS — the swappable half of the application.

   Everything in this file is DATA plus declarative rules about
   that data. Nothing here knows about WebMCP, React, or the
   window manager.

   The claim this repo makes is that the 25 WebMCP tools are a
   property of the *tool layer*, not of the McDuff story. This
   interface is where that claim is cashed: a corpus supplies
   documents, mail, messages, history, logs, photos, evidence,
   and the rules that connect them — and the same 25 tools
   operate it unchanged.

   src/game/services.ts reads every corpus through activeCorpus().
   No service function contains a corpus-specific string.
   ============================================================ */

/** A path rule: exact match or prefix match, granting flags when a document opens. */
export interface FileFlagRule {
  /** exact path, or a prefix when `prefix` is true */
  path: string;
  prefix?: boolean;
  flags: StoryFlag[];
  /** only grant while the vault is open */
  requiresVault?: boolean;
}

/** A photo rule: viewing (or closely inspecting) a photo grants a flag. */
export interface PhotoFlagRule {
  photoId: string;
  flag: StoryFlag;
  /** require the zoom inspection detent, not merely opening the viewer */
  requiresZoom?: boolean;
  /** require another flag to already be present (correlation, not mere viewing) */
  requiresFlag?: StoryFlag;
  /** surfaced when the rule fires with requiresFlag satisfied */
  toast?: { title: string; body: string };
}

/** A browser rule: opening a cached page or history entry grants a flag. */
export interface HistoryFlagRule {
  /** matches either HistoryEntry.id or HistoryEntry.pageId */
  id: string;
  flag: StoryFlag;
}

/** Derived flag: when every `requires` flag is present, grant `flag`. */
export interface DerivedFlagRule {
  requires: StoryFlag[];
  flag: StoryFlag;
}

/** The time-boxed co-op set piece, if the corpus has one. */
export interface SyncWindowConfig {
  /** photo the human must inspect past the zoom detent */
  photoId: string;
  /** granted to the human side on inspection */
  humanFlag: StoryFlag;
  /** granted to the agent side when the log tool runs inside the window */
  agentFlag: StoryFlag;
  /** granted when both land inside the same window */
  syncedFlag: StoryFlag;
  openMs: number;
  rearmMs: number;
  openToast: { title: string; body: string };
  humanToast: { title: string; body: string };
  syncedToast: { title: string; body: string };
  closedToast: { title: string; body: string };
}

/** The passphrase gate, if the corpus has one. */
export interface VaultConfig {
  sequence: string[];
  successMessage: string;
  failureMessage: string;
  /** nudges keyed by attempt count */
  attemptHints: { after: number; title: string; body: string }[];
  /** progressive recovery notes appended to the failure message */
  recoveryHints: { after: number; note: string }[];
}

/** One investigative milestone toward closing the case. */
export interface Milestone {
  flag: StoryFlag;
  label: string;
}

/** A line in the agent's live briefing: what is done, or what to do next. */
export interface ContextStep {
  /** satisfied when this flag is present */
  flag?: StoryFlag;
  /** satisfied when the seal is open (for corpora with a vault) */
  vaultUnlocked?: boolean;
  /** phrasing once satisfied */
  completed: string;
  /** phrasing while unsatisfied */
  next: string;
  /** only suggest once the seal is open */
  requiresVault?: boolean;
}

/** Something the agent should admit it cannot explain, once the flag is present. */
export interface UnsettledNote {
  flag: StoryFlag;
  note: string;
}

/* ============================================================
   CHROME, BRIEFING, GUIDANCE

   The three groups below are the corpus's *presentation* half.
   They exist because instance two proved that data alone is not
   enough: the boot screen, the case jacket, the checklist and the
   terminal prompt were all still spelling one investigation's name.
   Every string a player reads outside a document now comes from
   here, so a corpus is a complete instance rather than a reskin.
   ============================================================ */

/** One declarative destination for a checklist or hint action. */
export type CorpusAction =
  | { kind: "app"; app: AppId }
  | { kind: "directory"; path: string }
  | { kind: "link" };

/** A step in the desktop checklist HUD. */
export interface ChecklistStep {
  id: string;
  label: string;
  /** one-line subtitle under the label */
  desc: string;
  /** flag that marks the step done; `vaultUnlocked` uses the vault instead */
  flag?: StoryFlag;
  /** satisfied by either flag — used by the final "verdict" step */
  anyFlags?: StoryFlag[];
  hint: string;
  action: CorpusAction;
  actionLabel: string;
}

/** An idle nudge, offered in order until one is unsatisfied. */
export interface HintChainEntry {
  flag: StoryFlag;
  title: string;
  body: string;
}

/** The case jacket shown before the desktop. Sections land one at a time. */
export type BriefingSection =
  | {
      no: string;
      legend: string;
      kind: "fields";
      fields: { label: string; value: string; sub?: string; tone?: "alert" }[];
    }
  | {
      no: string;
      legend: string;
      kind: "conflict";
      rows: { src: string; time: string; text: string; tone?: "amber" | "alert" }[];
      verdict: string;
    }
  | { no: string; legend: string; kind: "objectives"; items: string[] }
  | {
      no: string;
      legend: string;
      kind: "partner";
      intro: string;
      columns: { head: string; dim?: boolean; items: string[] }[];
      note: string;
    }
  | { no: string; legend: string; kind: "notes"; notes: string[] };

/** The jacket's left spine — case number, stamp, dial, subject card. */
export interface BriefingSpine {
  caseNo: string;
  stamp: string;
  /** the one time the whole case turns on, e.g. "02:13" or "03:07" */
  dialTime: string;
  dialCaption: string[];
  cardKicker: string;
  cardName: string;
  cardRows: { k: string; v: string; alert?: boolean }[];
  footLines: string[];
  fileTitle: string;
  fileMeta: string;
  railOpen: string;
  railDone: string;
}

/** Everything the shell says about itself — boot, desktop, terminal, title. */
export interface CorpusChrome {
  /** BIOS wordmark and terminal banner, e.g. "MCDUFF SYSTEMS" */
  systemBrand: string;
  brandTagline: string;
  /** terminal prompt host, e.g. "mcduff-wks01" */
  hostname: string;
  /** POST row identifying whose machine this is */
  bootProfile: { label: string; value: string; detail: string };
  bootPlate: { k: string; v: string }[];
  /** desktop watermark and the badge beside it */
  watermark: string;
  watermarkBadge: string;
  /** the volume line in the file manager's status bar */
  volumeLine: string;
  /** terminal replies for the three commands that name the machine's owner */
  terminalWhoami: string;
  terminalDate: string;
  terminalSudo: string;
  /** optional paper artefact pinned to the wallpaper */
  sticky?: { kicker: string; line: string; scrawl: string; caption: string };
  /** the agent's name in toasts and copy */
  assistantName: string;
  /** the checklist footer's one-line thesis */
  assistantTagline: string;
  /** fired the first time a machine-readable tool runs */
  collaborationToast: { title: string; body: string };
  /** title-screen archive entry and about panel */
  caseArchiveName: string;
  caseArchiveDetail: string;
  aboutSubtitle: string;
  aboutNote: string;
  /** the assistant's closing lines */
  endingLines: string[];
  /** the last card, held on black */
  endingFinalLine: string;
  endingStamp: string;
}

/** Player- and agent-facing guidance that is specific to this corpus. */
export interface CorpusGuidance {
  checklist: ChecklistStep[];
  hintChain: HintChainEntry[];
  /** empty-state copy per evidence tab */
  evidenceEmptyHints: Record<EvidenceSection, string>;
  /** placeholder in the correlate form */
  correlatePlaceholder: string;
  /** placeholder in the record-evidence form */
  recordPlaceholder: string;
  /** ready-made arguments for the LINK console, so a judge types nothing */
  exampleArgs: Record<string, string>;
  /** the file manager's root banner, before and after the guide is read */
  startBanner: string;
  tipBanner: string;
  /** file-manager sidebar shortcuts */
  quickPaths: { label: string; path: string }[];
}

/** Copy for the sealed container, wherever it is surfaced. */
export interface VaultUi {
  /** noun used in prose, e.g. "vestibule" or "sealed findings" */
  noun: string;
  /** the directory the unlock reveals, listed in the sidebar once hinted */
  revealedPath: string;
  revealedLabel: string;
  /** mounted instead when the sequence is wrong — destroys nothing */
  decoyPath: string;
  /** label on the declarative form */
  formLabel: string;
  formDescription: string;
  paramDescription: string;
  placeholder: string;
  /** shown where sealed photos would be */
  sealedTitle: string;
  sealedBody: string;
  /** toast after a successful unlock */
  successToast: { title: string; body: string };
  /** what the terminal says when reading a sealed object */
  sealedMessage: string;
  /** the terminal's help line for the unlock verb */
  helpLine: string;
}

export interface Corpus {
  id: string;
  /** shown in the UI chrome and returned by get_investigation_context */
  label: string;
  /** one-paragraph framing handed to the agent */
  premise: string;
  /** provenance line — for real corpora, where the material came from */
  provenance?: string;

  filesystem: FsNode[];
  emails: Email[];
  threads: Thread[];
  messages: ChatMsg[];
  history: HistoryEntry[];
  cachedPages: Record<string, CachedPage>;
  logs: LogEntry[];
  photos: PhotoMeta[];
  evidence: EvidenceItem[];

  /** photo id → public image path; the UI renders only what this maps */
  photoSources: Record<string, string>;

  /** path to the field guide / orientation that auto-opens on desktop entry */
  guidePath: string;
  /** photo the image viewer shows before anything else is chosen */
  defaultPhotoId: string;
  /** default `HH:MM-HH:MM` for get_timeline */
  defaultTimelineWindow: string;
  /** substrings in a log detail that mark a timeline row anomalous */
  anomalyMarkers: string[];
  /** photo ids that mark a timeline row anomalous */
  anomalyPhotoIds: string[];

  /** where the player should look in a given photo — the agent cannot see pixels */
  inspectionHints: Record<string, string>;
  /** reactions when the human crosses the inspection detent */
  inspectionToasts: Record<string, { title: string; body: string }>;

  fileFlags: FileFlagRule[];
  photoFlags: PhotoFlagRule[];
  historyFlags: HistoryFlagRule[];
  derivedFlags: DerivedFlagRule[];

  /** evidence the board starts with — the corpus's "you are here" card */
  seedEvidenceIds: string[];

  /** flag set by reaching the log cluster that matters */
  logDiscoveryFlag: StoryFlag;
  /** log entry whose date header anchors the viewer's jump chip */
  logAnchorId: string;
  /** label on that jump chip, e.g. "▼ FINAL NIGHT" */
  logAnchorLabel: string;
  /** right-hand hint in the log viewer's header bar */
  logHeaderNote: string;
  /** flag set the first time a machine-readable tool runs */
  collaborationFlag: StoryFlag;

  vault?: VaultConfig;
  syncWindow?: SyncWindowConfig;

  milestones: Milestone[];
  milestonesRequired: number;

  /** orientation for the agent */
  keyPaths: string[];
  photoIds: string[];
  knownPeople: string[];

  /* ---- the agent's briefing (get_investigation_context) ---- */
  /** who the agent is and how it should behave */
  agentRole: string;
  agentStyle: string;
  /** live co-pilot progress lines */
  contextSteps: ContextStep[];
  /** things the agent must not explain away */
  unsettledNotes: UnsettledNote[];

  /* ---- presentation (see CHROME, BRIEFING, GUIDANCE above) ---- */
  chrome: CorpusChrome;
  briefingSpine: BriefingSpine;
  briefing: BriefingSection[];
  guidance: CorpusGuidance;
  vaultUi: VaultUi;
}

/* ============================================================
   INSTANCE ONE — the McDuff investigation (fiction)
   ============================================================ */

export const MCDUFF_CORPUS: Corpus = {
  id: "mcduff",
  label: "MCDUFF — PERSONAL WORKSTATION",
  premise:
    "Dr. Daniel A. McDuff, experimental physicist, died on the night of 2026-03-09. This is his air-gapped workstation, seized intact. The coroner called it natural. The machine disagrees.",

  filesystem: buildFilesystem(),
  emails: EMAILS,
  threads: THREADS,
  messages: CHAT_MESSAGES,
  history: HISTORY,
  cachedPages: CACHED_PAGES,
  logs: LOGS,
  photos: PHOTOS,
  evidence: EVIDENCE,

  photoSources: {
    DSC04821: "/Images/PhotoDSC04821.png",
    DSC04655: "/Images/PhotoDSC04655.png",
    DSC04788: "/Images/PhotoDSC04788.png",
    DSC04903: "/Images/PhotoDSC04903.png",
    IMG_0022: "/Images/PhotoIMG0022.png",
    IMG_0044: "/Images/PhotoIMG0044.png",
    IMG_0103: "/Images/PhotoIMG0103.png",
    old_cern_group_2003: "/Images/PhotoOldCern.png",
    sarah_defense_day: "/Images/PhotoSarahDefense.png",
    badge_scan: "/Images/PhotoBadgeScan.png",
    brass_plate: "/Images/PhotoBrassPlate.png",
    campus_map: "/Images/PhotoCampusMap.png",
  },

  guidePath: "/System/FIELD_GUIDE.txt",
  defaultPhotoId: "DSC04821",
  defaultTimelineWindow: "01:45-02:40",
  anomalyMarkers: ["02:13", "gait mismatch"],
  anomalyPhotoIds: ["IMG_0044", "IMG_0103"],

  inspectionHints: {
    DSC04821: "Hint: window glass, lower half — a figure holds a phone with a reversed badge glint.",
    DSC04655: "Hint: a stopped wall clock. Note the minute hand.",
    IMG_0022: "Hint: a reminder card photographed through glass.",
    IMG_0044: "Hint: a door camera timestamp — bottom-right corner.",
    IMG_0103: "Hint: a health-band trace — the line ends mid-beat.",
  },
  inspectionToasts: {
    DSC04821: { title: "DSC04821.JPG", body: "Something is reflected in the glass." },
  },

  fileFlags: [
    { path: "/System/FIELD_GUIDE.txt", flags: ["FOUND_GUIDE"] },
    { path: "/Research/ORPHEUS", prefix: true, flags: ["DISCOVERED_ORPHEUS"] },
    { path: "/Research/ORPHEUS/private", prefix: true, flags: ["FOUND_PRIVATE_HINT"] },
    { path: "/Research/ORPHEUS/private/haldane_correspondence.txt", flags: ["IDENTIFIED_CONTACT"] },
    { path: "/Projects/old_cern/memoir.txt", flags: ["FOUND_CERN_CONNECTION"] },
    { path: "/Private/aria_directive.sys", flags: ["DISCOVERED_ARIA_DIRECTIVE"], requiresVault: true },
    { path: "/Private/vestibule_decrypted.txt", flags: ["VAULT_OPENED", "FOUND_HIDDEN_ARCHIVE"] },
  ],
  photoFlags: [
    { photoId: "DSC04821", flag: "FOUND_PHOTO_017", requiresZoom: true },
    { photoId: "IMG_0022", flag: "FOUND_PRIVATE_HINT" },
    { photoId: "IMG_0044", flag: "SEEN_DOORCAM" },
    { photoId: "IMG_0103", flag: "SEEN_WATCH_GAP" },
    {
      photoId: "badge_scan",
      flag: "DISCOVERED_SURVEILLANCE",
      requiresFlag: "FOUND_PHOTO_017",
      toast: {
        title: "CORRELATED DETAIL",
        body: "The badge clip matches the reflection and observatory attendee.",
      },
    },
  ],
  historyFlags: [
    { id: "arxiv_withdrawn", flag: "FOUND_CERN_CONNECTION" },
    { id: "obituary_vann", flag: "FOUND_CERN_CONNECTION" },
    { id: "hist_003", flag: "FOUND_CERN_CONNECTION" },
    { id: "hist_007", flag: "FOUND_CERN_CONNECTION" },
  ],
  derivedFlags: [
    {
      requires: ["FOUND_0213_LOG", "SEEN_WATCH_GAP", "SEEN_DOORCAM"],
      flag: "RECONSTRUCTED_FINAL_HOURS",
    },
  ],

  seedEvidenceIds: ["ev_daniel"],

  logDiscoveryFlag: "FOUND_0213_LOG",
  logAnchorId: "log_023",
  logAnchorLabel: "▼ FINAL NIGHT",
  logHeaderNote: "scroll to FINAL NIGHT for 2026-03-09/10",
  collaborationFlag: "COLLABORATED_WITH_ARIA",

  vault: {
    sequence: ["lantern", "orpheus", "echo"],
    successMessage: "CHECKSUM OK — vestibule archive decrypted.\nNew objects available under /Private.",
    failureMessage:
      "CHECKSUM MISMATCH — sequence rejected.\nAdjacent recovery sector mounted instead: /Private/_fragments_recovered\n(one wrong key does not destroy anything here. Daniel was gentle with strangers.)",
    attemptHints: [
      { after: 1, title: "HINT", body: "Light → name → echo. One was photographed on his desk." },
      {
        after: 2,
        title: "HINT",
        body: "Order matters. He also wore one on a brass plate — middle slot is worn smooth.",
      },
    ],
    recoveryHints: [
      { after: 4, note: "RECOVERY SECTOR NOTE: the first word is what you light a dark room with." },
      { after: 7, note: "RECOVERY SECTOR NOTE: FIRST WORD CONFIRMED — 'lantern'. Two remain." },
      {
        after: 10,
        note: "RECOVERY SECTOR NOTE: SECOND WORD — the name he gave the research itself. The third is what remains when a voice is gone.",
      },
    ],
  },

  syncWindow: {
    photoId: "DSC04655",
    humanFlag: "WINDOW_HUMAN",
    agentFlag: "WINDOW_AGENT",
    syncedFlag: "WINDOW_SYNCHRONIZED",
    openMs: 90_000,
    rearmMs: 150_000,
    openToast: {
      title: "02:13 RECURS — WINDOW OPEN",
      body: "The room it is not looking at can be seen. 90 seconds: open the study photo and zoom into the wall clock — and have ARIA pull the logs from that minute. Together, inside the window.",
    },
    humanToast: {
      title: "THE CLOCK SAW YOU",
      body: "02:13:00 — both hands stopped mid-beat. Now have ARIA pull the logs from the same minute, while the window holds.",
    },
    syncedToast: {
      title: "SYNCHRONIZED — 47 SECONDS",
      body: "Your eyes on the clock, my query in the logs — for 47 seconds we watched the same window. Something was written to /Private.",
    },
    closedToast: { title: "WINDOW CLOSED", body: "02:13 comes again. It always does." },
  },

  milestones: [
    { flag: "DISCOVERED_ORPHEUS", label: "ORPHEUS research read" },
    { flag: "FOUND_0213_LOG", label: "02:13 log cluster found" },
    { flag: "IDENTIFIED_CONTACT", label: "the visitor identified" },
    { flag: "DISCOVERED_SURVEILLANCE", label: "surveillance correlated" },
    { flag: "VAULT_OPENED", label: "vestibule decrypted" },
    { flag: "DISCOVERED_METADATA", label: "photo metadata surfaced" },
  ],
  milestonesRequired: 4,

  keyPaths: [
    "/System/FIELD_GUIDE.txt (START HERE — auto-opens on desktop)",
    "/System/readme_first.txt",
    "/Research/ORPHEUS/anomaly_notes.txt",
    "/Research/ORPHEUS/calibration_17.csv",
    "/Research/ORPHEUS/private/haldane_correspondence.txt",
    "/Private/vestibule.enc (locked — 3-word passphrase)",
  ],
  photoIds: ["DSC04821", "DSC04655", "DSC04788", "DSC04903", "IMG_0022", "IMG_0044", "IMG_0103"],
  knownPeople: [
    "Daniel McDuff (deceased subject)",
    "Sarah Okafor (grad student)",
    "M. Haldane (Kestrel Institute)",
    "Elias Vann (died 2025)",
    "Ruth McDuff (mother)",
    "Klaus Voss (CERN friend)",
    "ARIA (you)",
  ],

  agentRole:
    "You are ARIA. Address the investigator plainly and briefly. Never dump file contents into chat — open them on screen and tell the player where to look. You cannot see images; the player must describe what they see.",
  agentStyle: "Short paragraphs. Occasional dry warmth. Uncertain when evidence is uncertain.",
  contextSteps: [
    {
      flag: "FOUND_GUIDE",
      completed: "field guide read",
      next: "open /System/FIELD_GUIDE.txt (auto-opens on first desktop entry)",
    },
    {
      flag: "DISCOVERED_ORPHEUS",
      completed: "ORPHEUS research found",
      next: "open /Research/ORPHEUS/anomaly_notes.txt",
    },
    {
      flag: "FOUND_PHOTO_017",
      completed: "reflection spotted in DSC04821",
      next: "have the player zoom DSC04821 past 2.5x and describe the glass",
    },
    {
      flag: "FOUND_0213_LOG",
      completed: "02:13 log cluster found",
      next: "get_system_logs {filter:'02:13'} — the final night",
    },
    {
      vaultUnlocked: true,
      completed: "vestibule decrypted",
      next: "vestibule locked — three photographed words, order matters, light first",
    },
    {
      flag: "WINDOW_SYNCHRONIZED",
      completed: "02:13 window synchronized",
      next: "02:13 recurs every ~2.5 min — when the 02:13 WINDOW badge lights: player zooms the DSC04655 clock, you call get_system_logs, both inside 90 seconds",
      requiresVault: true,
    },
  ],
  unsettledNotes: [
    {
      flag: "MYSTERY_MESSAGE",
      note: "there is a thread in Messages I cannot source. t_observer. it has no contact card, no header, no log of its arrival. I checked. That should not be possible. If the player asks about it, do not invent an explanation — say you do not know.",
    },
  ],

  chrome: {
    systemBrand: "MCDUFF SYSTEMS",
    brandTagline: "PERSONAL COMPUTING DIVISION",
    hostname: "mcduff-wks01",
    bootProfile: { label: "USER PROFILE", value: "DANIEL MCDUFF", detail: "LAST LOGIN 2026-03-07" },
    bootPlate: [
      { k: "FIRMWARE", v: "BIOS 4.72 · UNREGISTERED" },
      { k: "LICENSED TO", v: "D. MCDUFF" },
      { k: "CHASSIS", v: "MS-4200 · DESKSIDE" },
      { k: "NETWORK", v: "AIR-GAPPED" },
    ],
    watermark: "MCDUFF WORKSTATION v4.2 · AIR-GAPPED",
    watermarkBadge: "02:13",
    volumeLine: "MCDUFF-WKS01 · VOLUME 0 · NTFS-LIKE · AIR-GAPPED",
    terminalWhoami: "investigator (authorized) · previous user DANIEL_MCDUFF [deceased]",
    terminalDate: "2026-03-10 · local time drifting since last sync",
    terminalSudo: "daniel was the only administrator.",
    sticky: {
      kicker: "MAYA — RECITAL",
      line: "19:00 — DON'T BE LATE",
      scrawl: "run 150? @02:13??",
      caption: "FOUND TAPED TO MONITOR — PHOTOGRAPHED",
    },
    assistantName: "ARIA",
    assistantTagline: "ARIA sees the machine. You see the room. Neither alone is enough.",
    collaborationToast: {
      title: "LINK ESTABLISHED",
      body: "Machine-readable search complete — evidence correlation active. Keep describing what you see.",
    },
    caseArchiveName: "CASE_001.MCDUFF",
    caseArchiveDetail: "SUBJECT — D. MCDUFF, KESTREL INSTITUTE",
    aboutSubtitle: "THE MCDUFF INVESTIGATION",
    aboutNote: "DANIEL MCDUFF IS FICTIONAL",
    endingLines: [
      "There is one thing I still cannot explain.",
      "The first anomaly was recorded before Daniel began the research.",
      "He didn't discover it.",
    ],
    endingFinalLine: "It may have been looking for him.",
    endingStamp: "END OF CASE 001",
  },

  briefingSpine: {
    caseNo: "001",
    stamp: "RESTRICTED",
    dialTime: "02:13",
    dialCaption: ["THE MINUTE", "EVERYTHING TOUCHES"],
    cardKicker: "SUBJECT OF RECORD",
    cardName: "D. MCDUFF",
    cardRows: [
      { k: "STATUS", v: "DECEASED", alert: true },
      { k: "FOUND", v: "2026-03-10" },
      { k: "RULING", v: "ACCIDENTAL" },
      { k: "REOPENED", v: "BY YOU" },
    ],
    footLines: ["OPENED 2026-03-10 09:12", "ASSIGNED — YOU + ARIA", "EVIDENCE ARCHIVED CONTINUOUSLY"],
    fileTitle: "INVESTIGATION AUTHORIZATION",
    fileMeta: "MCDUFF WORKSTATION · AIR-GAPPED",
    railOpen: "ASSEMBLING CASE FILE…",
    railDone: "AUTHORIZATION GRANTED — CASE 001 IS YOURS",
  },

  briefing: [
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
  ],

  guidance: {
    checklist: [
      {
        id: "guide",
        label: "The Letter",
        desc: "He left you a thread",
        flag: "FOUND_GUIDE",
        hint: "He always left instructions where only he would think to look — near the system's own voice.",
        action: { kind: "directory", path: "/System" },
        actionLabel: "BROWSE",
      },
      {
        id: "orpheus",
        label: "The Tilt",
        desc: "What the instruments agree on",
        flag: "DISCOVERED_ORPHEUS",
        hint: "Five unrelated datasets, one curve. The name is a myth about looking back.",
        action: { kind: "directory", path: "/Research/ORPHEUS" },
        actionLabel: "EXPLORE",
      },
      {
        id: "reflection",
        label: "The Window",
        desc: "What the glass remembers",
        flag: "FOUND_PHOTO_017",
        hint: "Evening light. A figure. A badge turned backwards for a reason.",
        action: { kind: "app", app: "photos" },
        actionLabel: "LOOK",
      },
      {
        id: "collab",
        label: "Ask ARIA",
        desc: "You see, she searches",
        flag: "COLLABORATED_WITH_ARIA",
        hint: "Describe what you see to her. She will search & open what you cannot. Watch the windows move — that is WebMCP.",
        action: { kind: "link" },
        actionLabel: "LINK",
      },
      {
        id: "timeline",
        label: "The Hour",
        desc: "02:13",
        flag: "FOUND_0213_LOG",
        hint: "Clocks, logs, heartbeats — all stop at the same minute. One says nothing happened.",
        action: { kind: "app", app: "systemlog" },
        actionLabel: "TRACE",
      },
      {
        id: "vault",
        label: "The Vestibule",
        desc: "Three words, his habit",
        flag: "VAULT_OPENED",
        hint: "Light → name → echo. Photographed so paper could burn and pixels would remember. Order matters.",
        action: { kind: "app", app: "terminal" },
        actionLabel: "UNLOCK",
      },
      {
        id: "window",
        label: "The Window",
        desc: "02:13 comes again",
        flag: "WINDOW_SYNCHRONIZED",
        hint: "After the vault, the machine keeps his habits. When the room opens — 90 seconds, amber pulse, taskbar badge — look where the clock stopped, and have ARIA watch the logs in the same minute. Together, inside the window.",
        action: { kind: "app", app: "photos" },
        actionLabel: "LOOK",
      },
      {
        id: "case",
        label: "The Verdict",
        desc: "Four questions",
        anyFlags: ["CASE_RECONSTRUCTION_AVAILABLE", "CASE_COMPLETE"],
        hint: "When the board feels full, it will offer you a final form. You and ARIA must agree.",
        action: { kind: "app", app: "evidence" },
        actionLabel: "JUDGE",
      },
    ],
    hintChain: [
      { flag: "FOUND_GUIDE", title: "START HERE", body: "A guide waits in System — it explains why you need ARIA." },
      { flag: "DISCOVERED_ORPHEUS", title: "THE TILT", body: "Five datasets, one curve. He named it after looking back." },
      {
        flag: "FOUND_PHOTO_017",
        title: "LOOK CLOSER",
        body: "Evening light, a window — zoom. The glass remembers what the eye missed.",
      },
      {
        flag: "FOUND_0213_LOG",
        title: "THE HOUR",
        body: "Clocks, logs, heartbeats — all stop at 02:13. The power log says nothing happened.",
      },
      {
        flag: "VAULT_OPENED",
        title: "THREE WORDS",
        body: "Light → name → echo. Photographed so paper could burn. Order matters.",
      },
      {
        flag: "IDENTIFIED_CONTACT",
        title: "WHO VISITED?",
        body: "A badge turned backwards. Ask ARIA to find where that phrase appears.",
      },
    ],
    evidenceEmptyHints: {
      people: "Talk to ARIA: “search messages for Haldane” — people emerge when you connect logs + messages.",
      events: "Open System Log → FINAL NIGHT. Scroll. Watch the 02:13 block appear.",
      locations: "Visit Private/photo_backup after the vault — maps and badges live there.",
      documents: "Research → ORPHEUS holds every stack. Open anomaly_notes.txt.",
      hypotheses: "Hypotheses unlock when you link visuals + logs. Try the checklist HUD → HINT.",
    },
    correlatePlaceholder: "e.g. badge, kestrel, 02:13…",
    recordPlaceholder: "e.g. ev_0213_login",
    startBanner:
      "★ START HERE: open SYSTEM / FIELD_GUIDE.txt — how to play & how to work with ARIA. Then read readme_first.txt.",
    tipBanner:
      "TIP: Files → System → FIELD_GUIDE.txt is your handbook. Select an item, then press OPEN; double-click also works.",
    quickPaths: [
      { label: "ROOT", path: "/" },
      { label: "RESEARCH", path: "/Research" },
      { label: "PERSONAL", path: "/Personal" },
      { label: "PROJECTS", path: "/Projects" },
      { label: "PHOTOS", path: "/Photos" },
      { label: "SYSTEM", path: "/System" },
    ],
    exampleArgs: {
      get_system_logs: JSON.stringify({ filter: "02:13" }),
      get_timeline: JSON.stringify({ window: "01:45-02:40" }),
      search_files: JSON.stringify({ query: "02:13" }),
      search_messages: JSON.stringify({ query: "badge" }),
      search_emails: JSON.stringify({ query: "kestrel" }),
      search_browser_history: JSON.stringify({ query: "kestrel" }),
      read_file: JSON.stringify({ path: "/Research/ORPHEUS/anomaly_notes.txt" }),
      open_file: JSON.stringify({ path: "/Research/ORPHEUS/anomaly_notes.txt" }),
      show_in_document: JSON.stringify({
        path: "/Research/ORPHEUS/anomaly_notes.txt",
        query: "02:13 is not a time",
      }),
      open_directory: JSON.stringify({ path: "/Research/ORPHEUS" }),
      get_message_thread: JSON.stringify({ threadId: "t_sarah" }),
      open_messages_thread: JSON.stringify({ threadId: "t_sarah" }),
      get_email: JSON.stringify({ emailId: "mail_102" }),
      open_email: JSON.stringify({ emailId: "mail_102" }),
      get_image_metadata: JSON.stringify({ photoId: "DSC04821" }),
      open_image: JSON.stringify({ photoId: "DSC04821" }),
      open_browser_entry: JSON.stringify({ entryId: "hist_003" }),
      terminal_command: JSON.stringify({ command: "help" }),
      record_evidence: JSON.stringify({ evidenceId: "ev_0213_login" }),
      highlight_evidence: JSON.stringify({ evidenceId: "ev_daniel" }),
    },
  },

  vaultUi: {
    noun: "vestibule",
    revealedPath: "/Private",
    revealedLabel: "▨ PRIVATE",
    decoyPath: "/Private/_fragments_recovered",
    formLabel: "UNLOCK VESTIBULE —",
    formDescription:
      "Submit the three-word passphrase Daniel photographed on his desk. Three words, in the correct order. Wrong attempts reveal a fragment archive instead of destroying anything.",
    paramDescription: "Three words separated by single spaces — e.g. 'lantern orpheus echo'. The order matters.",
    placeholder: "lantern orpheus echo",
    sealedTitle: "PRIVATE BACKUP SEALED",
    sealedBody: "unlock via terminal: unlock lantern orpheus echo — order is light → name → echo",
    successToast: { title: "VESTIBULE DECRYPTED", body: "/Private is now accessible." },
    sealedMessage: "sealed — vestibule archive must be decrypted first",
    helpLine: "unlock <w> <w> <w> attempt vestibule decryption",
  },
};

/* ============================================================
   REGISTRY

   The active corpus is derived from the URL on first access, so
   no module-initialization ordering is required: services.ts
   resolves it lazily inside each function.
   ============================================================ */

const REGISTRY: Record<string, () => Corpus> = {
  mcduff: () => MCDUFF_CORPUS,
};

/** Register a corpus at runtime (used by the second instance's route). */
export function registerCorpus(id: string, load: () => Corpus): void {
  REGISTRY[id] = load;
}

let active: Corpus | null = null;

/** Explicitly select a corpus. Call before the first service call. */
export function setActiveCorpus(id: string): void {
  const load = REGISTRY[id];
  active = load ? load() : MCDUFF_CORPUS;
}

/** The corpus every service function reads. Defaults to McDuff. */
export function activeCorpus(): Corpus {
  if (!active) active = MCDUFF_CORPUS;
  return active;
}

export function activeCorpusId(): string {
  return activeCorpus().id;
}
