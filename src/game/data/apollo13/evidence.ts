"use client";

/**
 * APOLLO 13 — evidence board (corpus instance two).
 *
 * Same `EvidenceItem[]` shape instance one uses. Cards unlock from the same
 * `autoUnlockFlag` mechanism; the flag vocabulary is this corpus's own.
 *
 * Every `sources` entry names a real file on this workstation or a real primary
 * document. Confidence is not decoration: `low` and `medium` mark claims the
 * Review Board itself hedged, and the corpus does not upgrade them.
 */

import type { EvidenceItem } from "@/types/game";

export const EVIDENCE: EvidenceItem[] = [
  /* ---------------- PEOPLE ---------------- */
  {
    id: "ev_crew",
    section: "people",
    title: "THE FLIGHT CREW",
    summary:
      "James A. Lovell, Jr. (CDR), John L. Swigert, Jr. (CMP), Fred W. Haise, Jr. (LMP). Lovell was in the lower equipment bay stowing the TV camera when the tank failed and spoke the line the transcript actually records. Swigert had moved up from the backup crew two days before launch after Thomas K. Mattingly II was exposed to rubella. Haise was in the tunnel returning to the CSM and made the first electrical-systems reports. Callsigns: Odyssey (CSM), Aquarius (LM).",
    sources: ["/Sources/provenance.txt", "MSC-02680 §1.0", "/Voice/INDEX.txt"],
    confidence: "high",
  },
  {
    id: "ev_control",
    section: "people",
    title: "MISSION CONTROL",
    summary:
      "Flight directors Gene Kranz (on console at the failure), Glynn Lunney (the LM activation and CM powerdown race), Gerry Griffin and Milton Windler on the return. CAPCOMs Jack Lousma, Vance Brand, Joe Kerwin. EECOM Sy Liebergot at the accident; EECOM Clint Burton gave the eighteen-minute estimate. Kranz's instruction on the internal loop: \"Let's solve the problem but let's not make it any worse by guessing.\"",
    sources: ["messages thread B", "messages thread C", "NASA History: KRANZ"],
    confidence: "high",
  },
  {
    id: "ev_board",
    section: "people",
    title: "APOLLO 13 REVIEW BOARD",
    summary:
      "Established by memorandum of April 17, 1970; membership fixed April 21. Chairman Edgar M. Cortright, Director of Langley. Members included Neil A. Armstrong, Dr. John F. Clark, Dr. Hans M. Mark, Vincent L. Johnson, Milton Klein, Brig. Gen. Walter R. Hedrick, Jr., Robert F. Allnutt, counsel George Malley, OMSF support Charles W. Mathews, observer William A. Anders. Four panels; the Panel 4 chairman could not be recovered from the OCR text and is left blank rather than guessed.",
    sources: ["/Board/transmittal_1970-06-15.txt", "/Sources/provenance.txt"],
    confidence: "high",
    autoUnlockFlag: "READ_BOARD_TRANSMITTAL",
  },
  {
    id: "ev_contractors",
    section: "people",
    title: "THE CONTRACTORS IN THE CHAIN",
    summary:
      "Beech Aircraft built the tank and heater assembly and ordered the thermostatic switches without updating the 28 V dc specification. North American Rockwell was CSM prime, issued the 1962 specification and the 1965 revision to a 65 V dc ground supply, and was the site of the October 1968 shelf drop. Airite made the inner shell, Simmonds the quantity probe, Globe the fans. Grumman built Aquarius, which kept three men alive far past its two-man, two-day design case.",
    sources: ["/Restricted/tank_failure_case_study.txt", "/Board/ch5_thermostatic_switch.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_SWITCH_SPEC",
  },

  /* ---------------- EVENTS ---------------- */
  {
    id: "ev_accident",
    section: "events",
    title: "OXYGEN TANK 2 FAILS — GET 55:54:53.182",
    summary:
      "03:07:53 UTC, April 14 1970. Accelerometer activity on all three axes; the bay 4 outer panel separates; force estimated at about 7 lb TNT equivalent. Telemetry drops for 1.8 seconds and returns with the high-gain antenna switched from narrow to wide beam. The master alarm the crew heard, 0.373 s later, was DC main bus B undervoltage — an electrical symptom of a physical event.",
    sources: ["event log mev_013", "event log mev_014", "MSC-02680 Table 3-1"],
    confidence: "high",
    autoUnlockFlag: "FOUND_0307_LOG",
  },
  {
    id: "ev_masked_alarm",
    section: "events",
    title: "THE ALARM THAT WAS ALREADY RINGING — GET 55:52:31",
    summary:
      "Eighty-two seconds before the fans were commanded on, a master caution and warning fired on low hydrogen pressure in tank 1. That alarm masked the cryogenic portion of the caution and warning system, so no warning accompanied the oxygen tank 2 pressure excursion that followed. The crew's first indication of anything wrong was the bang.",
    sources: ["event log mev_008", "/Board/ch4_recovery_masked_alarms.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_MASKED_ALARMS",
  },
  {
    id: "ev_venting",
    section: "events",
    title: "VENTING — GET 56:09:07",
    summary:
      "Fourteen minutes and fourteen seconds after the failure, Lovell looked out the hatch: \"we are venting something out into the — into space… It's a gas of some sort.\" This is the moment the failure stopped being an instrumentation question. Kranz on the internal loop, nine seconds earlier: \"Crew thinks they are venting something!\"",
    sources: ["messages thread B", "event log mev_020"],
    confidence: "high",
    autoUnlockFlag: "FOUND_0307_LOG",
  },
  {
    id: "ev_lifeboat",
    section: "events",
    title: "THE LIFEBOAT DECISION — GET 57:24 – 58:40",
    summary:
      "Oxygen tank 1 a hair over 200 psi and falling; EECOM Burton put eighteen minutes on the clock to the 100 psi cutoff. Aquarius was powered up as a lifeboat and the command module was completely powered down at GET 58:40 with 99 ampere-hours in its three entry batteries — the margin that made reentry possible four days later.",
    sources: ["messages thread C", "event log mev_022", "/Mission/msc02680_consumables.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_CONSUMABLES",
  },
  {
    id: "ev_pc2",
    section: "events",
    title: "PC+2 BURN — GET 79:27:39",
    summary:
      "Descent propulsion, 4 minutes 24 seconds, ΔV 861.5 ft/s. The free-return trajectory alone would have landed at about 152 hours in the Indian Ocean, with the LM asked to support three men for roughly 90 more hours; the Mission Report calls those consumables \"extremely marginal\" and notes only minimal recovery support existed there. PC+2 moved landing to 142:54:41 in the South Pacific where the recovery force was.",
    sources: ["event log mev_027", "/Mission/msc02680_sequence_of_events.csv"],
    confidence: "high",
    autoUnlockFlag: "FOUND_TRAJECTORY_CHOICE",
  },
  {
    id: "ev_co2",
    section: "events",
    title: "THE CARBON DIOXIDE DEFICIT",
    summary:
      "Table 4-III: 85 hours of lithium hydroxide removal required, 53 available in the LM, 182 sitting unusable in the CM — a 32-hour shortfall with three men aboard a two-man vehicle. Kerwin read the adapter procedure up from GET 090:22:50; the first canister was on the hose by about 091:01. At 093:23:29 Houston read 6.6 mm Hg while Haise read about 12.5 onboard after a master alarm, and a second pair went on the loop.",
    sources: ["/Board/ch4_table_4_III_co2.csv", "messages thread D", "event log mev_031"],
    confidence: "high",
    autoUnlockFlag: "FOUND_CO2_DEFICIT",
  },
  {
    id: "ev_first_sight",
    section: "events",
    title: "FIRST SIGHT OF THE DAMAGE — GET 138:04:46",
    summary:
      "\"And there's one whole side of that spacecraft missing.\" Lovell, after service module jettison: \"Right by the high gain antenna, the whole panel is blown out, almost from the base to the engine.\" Haise thought the streak reached the SPS bell. Eighty-two hours after the bang, someone finally looked at it — and the photographs taken in the next minutes are the only images of the failure that exist.",
    sources: ["messages thread E", "AS13-59-8500", "event log mev_035"],
    confidence: "high",
    autoUnlockFlag: "SEEN_SM_DAMAGE",
  },

  /* ---------------- LOCATIONS ---------------- */
  {
    id: "ev_bay4",
    section: "locations",
    title: "SECTOR 4, SERVICE MODULE 109",
    summary:
      "The bay holding the two cryogenic oxygen tanks, the shelf they sat on, and the fuel cells they fed. Its outer panel separated in the failure. Photographed only after jettison, from the command module, on April 17 — AS13-59-8500 is the frame, and what it shows is an absence.",
    sources: ["AS13-59-8500", "/Board/ch5_what_happened.txt"],
    confidence: "high",
  },
  {
    id: "ev_shelf_history",
    section: "locations",
    title: "NORTH AMERICAN ROCKWELL, OCTOBER 21 1968",
    summary:
      "During removal of the oxygen shelf from SM 106 (Apollo 10), one shelf bolt was left in place. The lifting fixture failed after the shelf front had risen about 2 inches and the shelf dropped back. The Board judged the probability of tank damage \"rather low\" but allowed a loosely fitting fill tube could have been displaced. The shelf was installed in SM 109 — Apollo 13's service module — on November 22, 1968.",
    sources: ["/Board/ch4_tank_history_shelf_drop.txt"],
    confidence: "medium",
    autoUnlockFlag: "FOUND_SHELF_DROP",
  },
  {
    id: "ev_ksc_march",
    section: "locations",
    title: "KENNEDY SPACE CENTER, MARCH 27–30 1970",
    summary:
      "Tank 2 would not detank normally during the countdown demonstration test — consistent with a displaced fill tube. The improvised remedy was to boil the oxygen off using the tank heaters, energised from a 65 V dc ground supply for about eight hours. Flight-readiness discussion among KSC, MSC, NR, Beech and Headquarters personnel focused on the fill tube. Almost nobody in that discussion was thinking about the heaters.",
    sources: ["/Board/ch4_detanking_march_1970.txt", "/Board/ch4_launch_decision.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_DETANKING",
  },

  /* ---------------- DOCUMENTS ---------------- */
  {
    id: "ev_switch_spec",
    section: "documents",
    title: "THE 28-VOLT SWITCH ON A 65-VOLT SUPPLY",
    summary:
      "The 1962 NR tank specification called for 28 V dc heater circuitry. NR revised it to a 65 V dc ground supply in 1965; Beech never re-specified the thermostatic switches it had already ordered. Under 65 V the switches welded permanently closed by the resulting arc instead of opening, so nothing interrupted the heaters during the eight-hour run. The Board notes the failure could have been caught at KSC by watching heater current on the oxygen tank heater control panel.",
    sources: ["/Board/ch5_thermostatic_switch.txt", "/Restricted/tank_failure_case_study.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_SWITCH_SPEC",
  },
  {
    id: "ev_ignition",
    section: "documents",
    title: "WHAT IGNITED, AND WHAT LEFT",
    summary:
      "Teflon insulation on the fan motor wiring, damaged by heat during detanking, short-circuited and ignited in supercritical oxygen. Combustion overheated the conduit where the wiring entered the tank; the conduit failed and oxygen left faster than the surrounding structure could survive. The June 1970 full-scale propagation test at MSC reproduced the sequence and was filmed from outside the vessel (S70-41984).",
    sources: ["/Restricted/ch5_ignition.txt", "/Restricted/ground_test_note.txt", "S70-41984"],
    confidence: "high",
    autoUnlockFlag: "VAULT_OPENED",
  },
  {
    id: "ev_provenance",
    section: "documents",
    title: "PROVENANCE OF THIS CORPUS",
    summary:
      "MSC-02680 (Mission Report, Sept 1970), NASA-TM-X-65270 (Review Board, June 15 1970), the NASA History chronology, NTRS case study 20110015690, and nine photographs from the NASA Image and Video Library. Byte sizes and SHA-256 prefixes in the photo metadata are the real values for the files served by this machine. Voice lines come from the public-domain chronology where possible; the official transcript PDF extracts as unusable OCR.",
    sources: ["/Sources/provenance.txt", "/System/ORIENTATION.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_GUIDE",
  },
  {
    id: "ev_conflicts",
    section: "documents",
    title: "THREE CONFLICTS LEFT INTACT",
    summary:
      "Table 3-1 puts CM/SM separation at GET 138:01:48; Lovell's voice call is at 138:02:06 — eighteen seconds apart. The Mission Report lands at GET 142:54:41 (12:07:41 p.m. CST); the press caption on S70-35638 says 12:07:44. And the 1970 caption on S70-35013 states the adapter was built for the command module, which every other source contradicts. None of the three is resolved here.",
    sources: ["S70-35638", "S70-35013", "/Mission/msc02680_sequence_of_events.csv"],
    confidence: "medium",
    autoUnlockFlag: "FOUND_CAPTION_CONFLICT",
  },

  /* ---------------- HYPOTHESES ---------------- */
  {
    id: "ev_chain",
    section: "hypotheses",
    title: "THE CHAIN, END TO END",
    summary:
      "A specification not carried forward in 1965 → switches that welded shut instead of opening → a detanking problem in March 1970 solved with eight hours of unmonitored heat → baked wiring insulation inside a tank of supercritical oxygen → ignition when the fans were commanded on at GET 55:53:20 → a failed conduit, a separated panel, and two dead fuel cells. Each link is in a different document. No document contains the chain.",
    sources: [
      "/Board/ch5_thermostatic_switch.txt",
      "/Board/ch4_detanking_march_1970.txt",
      "/Restricted/ch5_ignition.txt",
      "event log mev_010",
    ],
    confidence: "high",
    autoUnlockFlag: "RECONSTRUCTED_ACCIDENT_CHAIN",
  },
  {
    id: "ev_knowledge",
    section: "hypotheses",
    title: "WHO KNEW ABOUT THE EIGHT HOURS",
    summary:
      "The Board's finding is not that the heater run was hidden. It is that many of the people clearing the vehicle for flight were unaware of it, and that those who did know the procedure \"did not consider the possibility of damage due to excessive heat within the tank, and therefore did not advise management officials of any possible consequences.\" The failure of imagination is the finding; Recommendation 6 is the response.",
    sources: ["/Board/ch4_launch_decision.txt", "/Board/ch5_recommendations.txt"],
    confidence: "high",
    autoUnlockFlag: "FOUND_LAUNCH_DECISION",
  },
  {
    id: "ev_drop_caveat",
    section: "hypotheses",
    title: "THE 1968 DROP — WHAT THE BOARD DID NOT CLAIM",
    summary:
      "The Board did not conclude the shelf drop caused the accident. It allowed that the drop could have displaced a loosely fitting fill tube, which would explain why the tank could not be detanked normally in March 1970 — which is what forced the heater procedure. The drop is upstream of the cause, not the cause. Reading it as the cause is the most tempting error this corpus offers.",
    sources: ["/Board/ch4_tank_history_shelf_drop.txt", "/Board/ch4_detanking_march_1970.txt"],
    confidence: "low",
    autoUnlockFlag: "FOUND_SHELF_DROP",
  },
];
