import type { CachedPage, HistoryEntry } from "@/types/game";

/* ============================================================
   DANIEL'S BROWSER HISTORY — offline, fictional, cached pages
   ============================================================ */

export const HISTORY: HistoryEntry[] = [
  { id: "hist_001", title: "Kestrel Institute — Home", url: "https://kestrel-institute.org/", visitedAt: "2026-02-27 22:10", pageId: "kestrel_home" },
  { id: "hist_002", title: "Physics Forum — thread: correlated residuals across labs", url: "https://physics-forum.example.org/t/correlated-residuals-4120", visitedAt: "2026-02-28 00:41", pageId: "forum_thread" },
  { id: "hist_003", title: "arXiv: withdrawal notice — arXiv:1604.01221v4 [physics.ins-det]", url: "https://arxiv.org/abs/1604.01221v4", visitedAt: "2026-02-28 11:10", pageId: "arxiv_withdrawn" },
  { id: "hist_004", title: "Penn Observatory — public open nights, booking portal", url: "https://pennobservatory.example.org/open-nights", visitedAt: "2026-03-03 14:55", pageId: "observatory_portal" },
  { id: "hist_005", title: "Kestrel Institute — Program: Precision Harmonics", url: "https://kestrel-institute.org/program/precision-harmonics", visitedAt: "2026-02-27 22:19", pageId: "kestrel_program" },
  { id: "hist_006", title: "Kestrel Institute — Leadership", url: "https://kestrel-institute.org/leadership", visitedAt: "2026-02-27 22:24", pageId: "kestrel_people" },
  { id: "hist_007", title: "Obituary — Dr. Elias Vann (1971–2025)", url: "https://example-obit.local/vann-e-2025", visitedAt: "2026-03-01 16:44", pageId: "obituary_vann" },
  { id: "hist_008", title: "NIST — atomic clock ensemble, public comparison data", url: "https://www.nist.gov/atomic-clock-ensemble", visitedAt: "2026-02-15 11:02", pageId: "nist_ensemble" },
  { id: "hist_009", title: "HomeLock support: local API documentation", url: "https://docs.homelock-vendor.example.com/local-api", visitedAt: "2026-01-27 10:18", pageId: "homelock_api" },
  { id: "hist_010", title: "Linux man pages — openssl enc", url: "https://manpages.example.org/openssl-enc.html", visitedAt: "2026-03-08 22:15", pageId: "openssl_man" },
  { id: "hist_011", title: "Recipe search — Mom's chili (the good one)", url: "https://search.example.org/q/moms-chili-the-good-one", visitedAt: "2026-02-15 19:58", pageId: "recipe_chili" },
  { id: "hist_012", title: "Penn cardiology — Preparing for your appointment", url: "https://www.pennmedicine.org/prepare", visitedAt: "2026-02-20 09:44", pageId: "penn_cardiology" },
  { id: "hist_013", title: "Penn parking — Flower & Walk garage", url: "https://parking.upenn.edu/flower", visitedAt: "2026-03-04 12:40", pageId: "penn_parking" },
  { id: "hist_014", title: "Search: how long to archive external drive (offline, air-gapped)", url: "https://search.example.org/q/air-gapped-cold-copy-tax-receipts", visitedAt: "2026-03-08 11:55", pageId: "search_coldcopy" },
  { id: "hist_015", title: "Forum — private message: re: residual harmonization", url: "https://physics-forum.example.org/pm/8821", visitedAt: "2026-03-01 01:12", pageId: "forum_thread" },
  { id: "hist_016", title: "Weather — Philadelphia, PA (extended)", url: "https://weather.example.org/phl", visitedAt: "2026-03-05 08:05", pageId: "weather_phl" },
  { id: "hist_017", title: "Kestrel Institute — Contact the Directorate", url: "https://kestrel-institute.org/contact", visitedAt: "2026-03-07 23:10", pageId: "kestrel_contact" },
  { id: "hist_018", title: "Local file: file:///Research/ORPHEUS/anomaly_notes.txt", url: "file:///Research/ORPHEUS/anomaly_notes.txt", visitedAt: "2026-03-09 23:47", pageId: "local_orpheus" },
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
  observatory_portal: {
    id: "observatory_portal",
    siteTitle: "Penn Observatory — Public Open Nights & Dome Booking",
    url: "https://pennobservatory.example.org/open-nights",
    renderKind: "observatory",
    body: [
      "Spring 2026 public nights: every Friday 20:00–midnight, weather permitting. Dome humidity lock at 92% — check the all-sky cam before you drive.",
      "Your reservation — McDuff group, Fri Mar 6, 20:00, party of 6 — is confirmed. Check-in at the east stair. Bring layers; the dome is cold when the shutter opens.",
      "Notice: One additional check-in was recorded under your party that evening (initials M.H., no prior booking). Per policy this notice is informational only — no action required.",
      "If you observed the same bias in unrelated precision instruments, please contact the time lab. Not every drift is temperature.",
    ],
  },
  nist_ensemble: {
    id: "nist_ensemble",
    siteTitle: "NIST — Atomic Clock Ensemble, Public Comparison Data",
    url: "https://www.nist.gov/atomic-clock-ensemble",
    renderKind: "nist",
    body: [
      "Ensemble: 12 Cs/Rb/Sr devices, weighted mean, steered to UTC(NIST). Public 7-day comparison file (CSV) updated daily 11:02 UTC. Network disabled on this host — local CSV is stale as of 2026-02-15.",
      "The stacked residual vs. local realization shows 0.0019 µrad mean at 2026-02-15 — consistent with Daniel's calibration_01.csv the same week. No common hardware, yet the means agree.",
      "Download: nist-ensemble-2026-02-15.csv (120.4k rows) · DOI:10.18434/T4/1508001 · Questions: time-service@nist.gov",
    ],
  },
  homelock_api: {
    id: "homelock_api",
    siteTitle: "HomeLock — Local API Documentation",
    url: "https://docs.homelock-vendor.example.com/local-api",
    renderKind: "homelock-docs",
    body: [
      "Local API — maintenance endpoint (undocumented, physical-proximity only). GET /local/maint/event-window — opens a 6 min LOCAL EVENT WINDOW without cloud audit. Auth: none if on LAN.",
      "Vendor response to ticket #40118 (2026-01-29): RESOLVED — WONTFIX. 'This endpoint requires physical proximity and is considered an accepted trade-off.'",
      "Firmware modification voids warranty. Log: D.M. filed on 2026-01-27, bookmarked this page 10:18 same day — then queried it again at 02:07 on Mar 7 and Mar 10 (see System Log).",
    ],
  },
  openssl_man: {
    id: "openssl_man",
    siteTitle: "man openssl-enc(1) — OpenSSL Documentation",
    url: "https://manpages.example.org/openssl-enc.html",
    renderKind: "manpage",
    body: [
      "NAME: openssl enc — symmetric cipher routine. SYNOPSIS: openssl enc -aes-256-cbc -salt -in file -out file.enc [-k password | -pass pass:password]",
      "Daniel bookmarked this at 22:15 on Mar 8 — 26 min before re-encrypting /Private/vestibule.enc with the 3-word rotating passphrase at 22:41. The nightly_encrypt task at 23:00 uses the same primitive.",
      "EXAMPLE: openssl enc -aes-256-cbc -salt -in final_results.csv -out final_results.enc -pass pass:'lantern orpheus echo' — order matters. Daniel was precise about order.",
    ],
  },
  recipe_chili: {
    id: "recipe_chili",
    siteTitle: "Search — Mom's chili (the good one)",
    url: "https://search.example.org/q/moms-chili-the-good-one",
    renderKind: "recipe",
    body: [
      "About 42,300 results — you clicked none. Daniel searched this at 19:58 on Feb 15, the same night Ruth asked him to leave the porch light on.",
      "The actual recipe is not on the web — it's in /Personal/chili_recipe.txt, typed from Ruth's card. 2 lb coarse chuck, hand-cut. 3 dried ancho + 2 chipotle in adobo. Masa toasted first. Cumin bloomed like a campfire.",
      "This search is the red-herring twin of the inbox chili. You came for warmth on a cold case. Keep it that way — but notice he searched for chili while calibrating the end of the world.",
    ],
  },
  penn_cardiology: {
    id: "penn_cardiology",
    siteTitle: "Penn Medicine — Preparing for Your Appointment: Cardiology",
    url: "https://www.pennmedicine.org/prepare",
    renderKind: "medical",
    body: [
      "Your follow-up with Dr. Imara regarding bradycardia noted during your February physical is scheduled March 14. Bring your health band export if available.",
      "The scheduling email (2026-02-21) deliberately echoes daniel's anxiety: 'If you experience … unusual calm, or a sensation that your heart rate is being managed, call immediately.' The health band gap at 01:52 makes this line retroactively sharp.",
      "This page is the plausible alternative — the 'natural causes' the report will claim. The watch trace ending mid-beat is the rebuttal.",
    ],
  },
  penn_parking: {
    id: "penn_parking",
    siteTitle: "Penn Parking — Flower & Walk Garage",
    url: "https://parking.upenn.edu/flower",
    renderKind: "parking",
    body: [
      "Flower & Walk garage — $18 daily, gates after 22:00 require PennCard. Daniel last parked here Mar 4 12:40 while annotating the campus map that marks KESTREL two blocks from Rittenhouse Lab.",
      "No incident log. This entry is ambient — the campus you fund to study the universe also rents you a rectangle of concrete. Keep it ambient, unless you think Kestrel's leased suite 4F validates on this garage's ledger.",
      "Rate change effective 2026-03-10: +$2. The day Daniel died, parking got more expensive.",
    ],
  },
  search_coldcopy: {
    id: "search_coldcopy",
    siteTitle: "Search — how long to archive external drive (offline, air-gapped)",
    url: "https://search.example.org/q/air-gapped-cold-copy-tax-receipts",
    renderKind: "search-results",
    body: [
      "You searched 'air-gapped cold copy strategy (tax receipts / genealogy naming)' at 11:55 on Mar 8 — the same day Sarah wrote 'already done. two cold copies. one reads like a genealogy file, one reads like tax receipts :)'",
      "Results: 9 hits, mostly sysadmin blogs. Top answer: 'If you must disguise an archive, name it something boring and back it up somewhere boring — hidden things are found. Close things are kept. — D.M. to Sarah, 2026-02-28'",
      "This search closes the loop: Sarah's disguise was Daniel's doctrine, not improvisation.",
    ],
  },
  weather_phl: {
    id: "weather_phl",
    siteTitle: "Weather — Philadelphia, PA (Extended)",
    url: "https://weather.example.org/phl",
    renderKind: "weather",
    body: [
      "Week of 2026-03-03: high 14°C, low 2°C. Patchy cloud. No power-grid alerts issued — the System Log brown-outs at 02:11 and 02:13 on Mar 7 and Mar 10 were both local to the study circuit only.",
      "Daniel checked weather at 08:05 Mar 5 — the morning Haldane's 'Courtesy visit — Thursday' arrived. He was not checking the forecast. He was establishing a timestamp for the file he knew someone would subpoena.",
      "Extended: Mar 10 overcast, 11°C at 09:12. The day you arrived to investigate, the weather did not matter.",
    ],
  },
  kestrel_contact: {
    id: "kestrel_contact",
    siteTitle: "Kestrel Institute — Contact the Directorate",
    url: "https://kestrel-institute.org/contact",
    renderKind: "kestrel-contact",
    body: [
      "Contact the Directorate by letter. Phone inquiries are noted but not returned. Visitor program by invitation only. Attendees describe our facility as 'quiet' and 'precisely furnished.'",
      "This page is a wall of form fields that submit nowhere — network disabled 2025-11-30, and the Institute never wanted a paper trail that a browser could autocomplete. You visited it at 23:10 on Mar 7, the night before you finished the journal entry that says 'Tomorrow it is real.'",
      "If you still think Kestrel is reachable by web form, read the mail from Dec and Feb instead. They were always a letter-on-paper institute.",
    ],
  },
  local_orpheus: {
    id: "local_orpheus",
    siteTitle: "File — /Research/ORPHEUS/anomaly_notes.txt (local)",
    url: "file:///Research/ORPHEUS/anomaly_notes.txt",
    renderKind: "local-file",
    body: [
      "You opened anomaly_notes.txt as a local file in the Browser at 23:47 on Mar 9 — the last night. The preview below is the File Manager's view of the same bytes; the truth hasn't changed between viewers.",
      "The working notes are not a web page. They are a notebook. Read them in the Document Viewer (double-click the file) where line numbers and 'begin with the light — D' in the margin become findable by ARIA.",
      "Local file render is intentionally thinner than other sites — it sells that Daniel browsed his own filesystem as if it were the web, the night he prepared the machine for you.",
    ],
  },
};
