import type { CachedPage, HistoryEntry } from "@/types/game";

/* ============================================================
   DANIEL'S BROWSER HISTORY — offline, fictional, cached pages
   ============================================================ */

export const HISTORY: HistoryEntry[] = [
  { id: "hist_001", title: "Kestrel Institute — Home", url: "https://kestrel-institute.org/", visitedAt: "2026-02-27 22:10", pageId: "kestrel_home" },
  { id: "hist_002", title: "Physics Forum — thread: correlated residuals across labs", url: "https://physics-forum.example.org/t/correlated-residuals-4120", visitedAt: "2026-02-28 00:41", pageId: "forum_thread" },
  { id: "hist_003", title: "arXiv: withdrawal notice — arXiv:1604.01221v4 [physics.ins-det]", url: "https://arxiv.org/abs/1604.01221v4", visitedAt: "2026-02-28 11:10", pageId: "arxiv_withdrawn" },
  { id: "hist_004", title: "Penn Observatory — public open nights, booking portal", url: "https://pennobservatory.example.org/open-nights", visitedAt: "2026-03-03 14:55" },
  { id: "hist_005", title: "Kestrel Institute — Program: Precision Harmonics", url: "https://kestrel-institute.org/program/precision-harmonics", visitedAt: "2026-02-27 22:19", pageId: "kestrel_program" },
  { id: "hist_006", title: "Kestrel Institute — Leadership", url: "https://kestrel-institute.org/leadership", visitedAt: "2026-02-27 22:24", pageId: "kestrel_people" },
  { id: "hist_007", title: "Obituary — Dr. Elias Vann (1971–2025)", url: "https://example-obit.local/vann-e-2025", visitedAt: "2026-03-01 16:44", pageId: "obituary_vann" },
  { id: "hist_008", title: "NIST — atomic clock ensemble, public comparison data", url: "https://www.nist.gov/atomic-clock-ensemble", visitedAt: "2026-02-15 11:02" },
  { id: "hist_009", title: "HomeLock support: local API documentation", url: "https://docs.homelock-vendor.example.com/local-api", visitedAt: "2026-01-27 10:18" },
  { id: "hist_010", title: "Linux man pages — openssl enc", url: "https://manpages.example.org/openssl-enc.html", visitedAt: "2026-03-08 22:15" },
  { id: "hist_011", title: "Recipe search — Mom's chili (the good one)", url: "https://search.example.org/q/moms-chili-the-good-one", visitedAt: "2026-02-15 19:58" },
  { id: "hist_012", title: "Penn cardiology — Preparing for your appointment", url: "https://www.pennmedicine.org/prepare", visitedAt: "2026-02-20 09:44" },
  { id: "hist_013", title: "Penn parking — Flower & Walk garage", url: "https://parking.upenn.edu/flower", visitedAt: "2026-03-04 12:40" },
  { id: "hist_014", title: "Search: how long to archive external drive (offline, air-gapped)", url: "https://search.example.org/q/air-gapped-cold-copy-tax-receipts", visitedAt: "2026-03-08 11:55" },
  { id: "hist_015", title: "Forum — private message: re: residual harmonization", url: "https://physics-forum.example.org/pm/8821", visitedAt: "2026-03-01 01:12", pageId: "forum_thread" },
  { id: "hist_016", title: "Weather — Philadelphia, PA (extended)", url: "https://weather.example.org/phl", visitedAt: "2026-03-05 08:05" },
  { id: "hist_017", title: "Kestrel Institute — Contact the Directorate", url: "https://kestrel-institute.org/contact", visitedAt: "2026-03-07 23:10" },
  { id: "hist_018", title: "Local file: file:///Research/ORPHEUS/anomaly_notes.txt", url: "file:///Research/ORPHEUS/anomaly_notes.txt", visitedAt: "2026-03-09 23:47" },
];

export const CACHED_PAGES: Record<string, CachedPage> = {
  kestrel_home: {
    id: "kestrel_home",
    siteTitle: "Kestrel Institute — Applied Harmonics & Precision Metrology",
    url: "https://kestrel-institute.org/",
    renderKind: "kestrel-home",
    body: [
      "A private institute for the maintenance of measurement standards at scale. Founded 1998. Not for profit. Not for publication.",
      "The world measures well because someone keeps the rulers still. The Institute keeps the rulers.",
      "Visitor program — by invitation only. Attendees describe our facility as 'quiet' and 'precisely furnished.'",
      "Contact the Directorate by letter. Phone inquiries are noted but not returned.",
    ],
  },
  kestrel_program: {
    id: "kestrel_program",
    siteTitle: "KESTREL · Program: Precision Harmonics",
    url: "https://kestrel-institute.org/program/precision-harmonics",
    renderKind: "kestrel-program",
    body: [
      "PROGRAM: Precision Harmonics — ongoing.",
      "Measurement is infrastructure. Infrastructure drifts. Drift must be harmonized before it becomes disagreement. Our charter is to reduce irregularity in global precision programs by methods proprietary and routine.",
      "Residual harmonization is not censorship. A noisy ruler is a dishonest ruler. Harmonization is courtesy to the next person who reads it.",
      "Methodology is not published. Results are not published. Effectiveness is assessed by the absence of complaint.",
      "Symposium proceedings: thirteen annual volumes held by deposit libraries. Citation count in world literature: zero, by design. 'The rulers one keeps are not the rulers one cites.' — Directorate memo 2009-03.",
    ],
  },
  kestrel_people: {
    id: "kestrel_people",
    siteTitle: "KESTREL · Leadership",
    url: "https://kestrel-institute.org/leadership",
    renderKind: "kestrel-people",
    body: [
      "Directorate liaison for applied programs: M. Haldane. Office hours by correspondence only. Visitors to Penn colloquia sign the department ledger on page 7, February 2026.",
      "Honored fellow: Dr. Elias Vann (1971–2025). Joined the Institute 2007 after distinguished service at CERN and HALCYON ANALYTICS. 'He saw the door and knew to test its hinges.' — M.H., memorial remarks.",
      "Trust: Kestrel is privately held. Trustees do not sit on public boards, except, necessarily, the advisory council of the university where its best critic taught.",
    ],
  },
  forum_thread: {
    id: "forum_thread",
    siteTitle: "Physics Forum — Anyone else seeing correlated residuals? (278 replies, archived)",
    url: "https://physics-forum.example.org/t/correlated-residuals-4120",
    renderKind: "forum-thread",
    body: [
      "OP (deleted, 2025-11): 'Three unrelated precision programs, same slow bias term. Either I'm wrong three ways at once, or — anyone else? DM for residuals.' — thread locked within 6 hours by moderator 'W — Kestrel visitor account.'",
      "Reply #41 (still up, by @k_voss, Feb 2026): 'hypothetically, check whether the shared term survived detrending. if it did — publish OR call a priest. i will read it before anyone else. — K'",
      "Reply #87 (D.M., pseudonym 'tilt_watcher'): 'E-fold ≈ 9 yr. Zero-lag cross-correlation 0.93. Time-of-day structure at 02:13 local. Please contact me privately if you reproduce it. Check timestamps before you trust people.' — upvoted 1, no replies, account deleted 3/7.",
      "Private message #8821 (2026-03-01): “Professor — this is N. Aramesh (Boulder gravimetry). I reproduced it. They closed my thread an hour later. What do we DO with something that IMPROVES with better instruments?” — Daniel never replied on-forum; possibly offline.",
    ],
  },
  arxiv_withdrawn: {
    id: "arxiv_withdrawn",
    siteTitle: "arXiv:1604.01221v4 [physics.ins-det] — WITHDRAWN",
    url: "https://arxiv.org/abs/1604.01221v4",
    renderKind: "arxiv",
    body: [
      "Title: An Audit of Correlated Systematics in Distributed Precision Programs — Halcyon Analytics Internal Technical Report, adapted.",
      "Authors: E. Vann, et al. (Halcyon Analytics).",
      "Abstract (v3, before withdrawal): 'We audit five client precision programs and find a shared, monotonic, non-instrumental residual term. The term is reprocessed as not-significant in v4. Client funding renewed.' — v4 replaces figures with 'no effect detected.'",
      "Withdrawal note, 2017-11: 'Authors withdraw pending re-review. Underlying client data are proprietary. The residual audit will not be extended.' — First author last seen employed by Kestrel Institute. Second author moved to finance.",
      "Comments: 9 pages, 4 figures. v3 → v4 diff shows manual redaction of bias term analyses in figures 3, 6, 7. Figure 2 caption in v3: 'The errors are trying to tell us who they are.' — quoted second-hand from E.V. colloquium.",
    ],
  },
  obituary_vann: {
    id: "obituary_vann",
    siteTitle: "Obituary — Dr. Elias Vann (1971–2025)",
    url: "https://example-obit.local/vann-e-2025",
    renderKind: "obituary",
    body: [
      "Dr. Elias Vann, 53, of Geneva and Philadelphia, died March 2025 in his home. He is remembered for brilliance in experimental design and for kindness to students who did not yet deserve it.",
      "Colleagues note his 2003–2007 service at CERN's trigger systems and subsequent work in private measurement research. He is survived by a sister.",
      "Cause was listed as an accidental fall on the staircase. A neighbor notes Vann had repaired the handrail the month prior. The notice requests privacy. Flowers are discouraged; precision is requested. 'Check what the house remembers before you trust what people say,' said one former colleague, who asked not to be named.",
    ],
  },
};
