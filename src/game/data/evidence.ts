import type { EvidenceItem } from "@/types/game";

/* ============================================================
   EVIDENCE BOARD — items unlock as story flags are set.
   ============================================================ */

export const EVIDENCE: EvidenceItem[] = [
  // ---------------- PEOPLE ----------------
  {
    id: "ev_daniel",
    section: "people",
    title: "DR. DANIEL MCDUFF",
    summary:
      "Professor of Physics & Astronomy (UPenn), formerly CERN trigger-counter group. Found dead at home; ruled accidental. Kept his real findings scattered and encrypted. Predicted someone would come looking.",
    sources: ["/System/readme_first.txt", "boot record", "mail archive"],
    confidence: "high",
  },
  {
    id: "ev_sarah",
    section: "people",
    title: "SARAH OKAFOR",
    summary:
      "Daniel's graduate student. Reproduced the ORPHEUS stack across five datasets. Her credentials were used at the workstation at 02:13 while building telemetry places her badge 22 minutes away with a gait mismatch. Either compromised, cloned — or present in ways no log shows.",
    sources: ["messages t_sarah", "log_035"],
    confidence: "medium",
    autoUnlockFlag: "FOUND_0213_LOG",
  },
  {
    id: "ev_haldane",
    section: "people",
    title: "\"M. HALDANE\"",
    summary:
      "Directorate Liaison, Kestrel Institute. Introduced himself after a colloquium quoting Daniel's unpublished growth rate to two decimals. Escalated from courtesy to threat on printed paper with no letterhead.",
    sources: ["/Research/ORPHEUS/private/haldane_correspondence.txt", "mail_101", "mail_501"],
    confidence: "high",
    autoUnlockFlag: "IDENTIFIED_CONTACT",
  },
  {
    id: "ev_vann",
    section: "people",
    title: "DR. ELIAS VANN (d. 2025)",
    summary:
      "Daniel's oldest colleague. Audited precision programs at Halcyon, found the same term, was reassigned, published-then-withdrawn, hired by Kestrel. Died falling down stairs he had just repaired. The precedent Daniel could not ignore.",
    sources: ["arxiv_withdrawn page", "obituary page", "/Projects/old_cern/memoir.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_CERN_CONNECTION",
  },
  {
    id: "ev_w",
    section: "people",
    title: "\"W —\" (unknown contact)",
    summary:
      "Messaging handle that knew about Elias Vann and used the phrase 'discusses weather.' Locked the original forum thread within six hours using a moderator account tied to Kestrel visitor access.",
    sources: ["messages t_W", "forum thread cache"],
    confidence: "medium",
    autoUnlockFlag: "IDENTIFIED_CONTACT",
  },

  // ---------------- EVENTS ----------------
  {
    id: "ev_watch_gap",
    section: "events",
    title: "HEALTH BAND GAP — 01:52",
    summary:
      "Daniel's band synced normally until 01:52 on the final night, then its local optical trace ends mid-beat. Devices do not end mid-beat. Records do.",
    sources: ["IMG_0103 watch export", "log_031", "vestibule_decrypted §2"],
    confidence: "high",
    autoUnlockFlag: "SEEN_WATCH_GAP",
  },
  {
    id: "ev_door_0207",
    section: "events",
    title: "DOOR EVENT — 02:07",
    summary:
      "Smart lock entered via the vendor's undocumented maintenance endpoint — the one Daniel reported in January and the vendor marked WONTFIX. Door camera captured a figure with a hard case at 02:07:33.",
    sources: ["IMG_0044 door camera", "log_032", "mail_108"],
    confidence: "high",
    autoUnlockFlag: "SEEN_DOORCAM",
  },
  {
    id: "ev_0213_login",
    section: "events",
    title: "THE 02:13 LOGIN",
    summary:
      "Login as S.OKAFOR at 02:13:07 from the physical console while Sarah's badge was logged 22 minutes away — with gait telemetry mismatching. Three network exfiltration attempts fired and were blocked by the cut line. Secure wipe aborted at 3% because Daniel's nightly encrypt task held locks.",
    sources: ["log_035–045", "system logs final night"],
    confidence: "high",
    autoUnlockFlag: "FOUND_0213_LOG",
  },
  {
    id: "ev_power_flicker",
    section: "events",
    title: "POWER EVENT — 02:11",
    summary:
      "A 40ms brown-out on the study circuit preceded the 02:13 login both nights Daniel noted. His wall clock stopped at 02:13 twice; the log says power never fully interrupted. Something synchronized to the minute keeps visiting the circuit.",
    sources: ["DSC04655 stopped clock", "log_014/log_034"],
    confidence: "medium",
    autoUnlockFlag: "FOUND_0213_LOG",
  },
  {
    id: "ev_forum_lock",
    section: "events",
    title: "FORUM THREAD LOCKED IN 6 HOURS",
    summary:
      "The first public inquiry into correlated residuals was locked by moderator 'W — Kestrel visitor account.' Suppression operates in public too, quickly, politely, and always within hours of the word 'reproduce.'",
    sources: ["forum cached thread", "hist_002"],
    confidence: "medium",
    autoUnlockFlag: "DISCOVERED_SURVEILLANCE",
  },

  // ---------------- LOCATIONS ----------------
  {
    id: "ev_kestrel_hq",
    section: "locations",
    title: "KESTREL INSTITUTE",
    summary:
      "Private institute, founded 1998, charter: 'maintenance of measurement standards at scale.' Publishes nothing, cites nothing, employs the consultant of the man who died falling. Campus map annotation marks their leased suite two blocks from Penn's physics wing.",
    sources: ["kestrel-institute.org caches", "campus_annotation.png"],
    confidence: "high",
    autoUnlockFlag: "IDENTIFIED_CONTACT",
  },
  {
    id: "ev_observatory",
    section: "locations",
    title: "OBSERVATORY OPEN NIGHT — MAR 6",
    summary:
      "Group photo shows an uninvited sixth attendee ('M.H.' per ops email) photographing Daniel instead of the sky. Same grey coat. Same turned lanyard.",
    sources: ["DSC04788", "mail_107"],
    confidence: "high",
    autoUnlockFlag: "DISCOVERED_SURVEILLANCE",
  },

  // ---------------- DOCUMENTS ----------------
  {
    id: "ev_anomaly_notes",
    section: "documents",
    title: "ORPHEUS WORKING NOTES",
    summary:
      "Daniel's private notebook. Names the phenomenon, the e-fold (~9.1 yr), the granularity floor, and the 02:13 structure. Final entry unfinished: '02:13 is not a time. It is the point at which the system becomes observable.'",
    sources: ["/Research/ORPHEUS/anomaly_notes.txt"],
    confidence: "high",
    autoUnlockFlag: "DISCOVERED_ORPHEUS",
  },
  {
    id: "ev_calibrations",
    section: "documents",
    title: "CALIBRATION STACKS 01→17",
    summary:
      "Seventeen stacked residual tables across unrelated instruments. Bias term grows monotonically from 0.0006 → 0.0139 urad. Cross-program correlation 0.93. Not instruments. Never instruments.",
    sources: ["/Research/ORPHEUS/calibration_01.csv", "calibration_17.csv"],
    confidence: "high",
    autoUnlockFlag: "DISCOVERED_ORPHEUS",
  },
  {
    id: "ev_final_results",
    section: "documents",
    title: "FINAL_RESULTS.ENC",
    summary:
      "The full encrypted stack, rotated nightly at 23:00. Survived the intruder's failed copy and aborted wipe because Daniel's own task held the locks. The dead man's routine saved the evidence.",
    sources: ["log_027", "log_040", "log_042"],
    confidence: "high",
    autoUnlockFlag: "VAULT_OPENED",
  },
  {
    id: "ev_vestibule",
    section: "documents",
    title: "THE VESTIBULE ARCHIVE",
    summary:
      "Decrypted with light → name → echo. Contains the mirror list, the watch record meaning, the door exploit confirmation, and instructions for ARIA. 'Finish it in daylight.'",
    sources: ["/Private/vestibule_decrypted.txt"],
    confidence: "high",
    autoUnlockFlag: "VAULT_OPENED",
  },
  {
    id: "ev_badge_scan",
    section: "documents",
    title: "VISITOR BADGE SCAN",
    summary:
      "Badge photographed through glass: M. HALDANE — KESTREL INSTITUTE — VISITOR. Lanyard clip matches the reversed badge seen in DSC04821's window reflection and the observatory sixth attendee.",
    sources: ["/Private/photo_backup/badge_scan.png"],
    confidence: "high",
    autoUnlockFlag: "VAULT_OPENED",
  },

  // ---------------- HYPOTHESES ----------------
  {
    id: "hyp_staged",
    section: "hypotheses",
    title: "HYPOTHESIS: STAGED ACCIDENT",
    summary:
      "Watch trace ends mid-beat at 01:52 before any fall could occur; door opened by exploit at 02:07; workstation accessed under stolen credentials at 02:13. A staged cardiac event followed by evidence retrieval would explain all three without contradiction.",
    sources: ["synthesis"],
    confidence: "medium",
    autoUnlockFlag: "RECONSTRUCTED_FINAL_HOURS",
  },
  {
    id: "hyp_motive",
    section: "hypotheses",
    title: "HYPOTHESIS: SUPPRESSION MOTIVE",
    summary:
      "Kestrel's charter is harmonization — reduction of irregularity. ORPHEUS proves irregularity is being reduced at planetary scale, growing exponentially, with a scan cycle. To Kestrel this is not a crime scene. It is a performance review. Daniel was not silenced despite the Institute. He was silenced as maintenance.",
    sources: ["synthesis", "kestrel program page"],
    confidence: "medium",
    autoUnlockFlag: "IDENTIFIED_CONTACT",
  },
  {
    id: "hyp_looking",
    section: "hypotheses",
    title: "HYPOTHESIS: IT WAS LOOKING FOR HIM",
    summary:
      "The earliest anomaly predates Daniel's research by months. Hourly connection attempts began while he was mid-Atlantic. The clock stops at 02:13 whether wound or replaced. The smoothing pauses over his address at 02:13 local. He did not discover the pattern. The pattern completed him.",
    sources: ["network_disabled.log", "journal_march_final", "threshold_analysis"],
    confidence: "low",
    autoUnlockFlag: "RECONSTRUCTED_FINAL_HOURS",
  },
];
