"use client";

/**
 * APOLLO 13 — mission event log (corpus instance two).
 *
 * Every row is sourced. See SOURCES.md in this directory for the primary
 * document behind each entry.
 *
 * Two clocks matter and the corpus keeps both:
 *   - GET (ground elapsed time) is the clock the crew and Mission Control used.
 *     It appears in `detail`, always as GET HH:MM:SS, because it is the number
 *     every document is indexed by.
 *   - UTC is the clock this log is sorted and filtered by, because the engine's
 *     timeline merge parses `time` as HH:MM:SS within a day.
 *
 * UTC = 1970-04-11 19:13:00 + GET   (MSC-02680 §2.0, range zero)
 * Verified: GET 142:54:41 → 1970-04-17 18:07:41 UTC = splashdown.
 *
 * The accident is GET 55:54:53.182 → 1970-04-14 03:07:53 UTC. "03:07" is this
 * corpus's anomaly marker, the way "02:13" is instance one's.
 */

import type { LogEntry } from "@/types/game";

export const LOGS: LogEntry[] = [
  /* ---------------- 1970-04-11 — launch ---------------- */
  {
    id: "mev_001",
    date: "1970-04-11",
    time: "19:13:00",
    category: "LAUNCH",
    severity: "info",
    detail:
      "GET 00:00:00.65 — lift-off, LC-39A. Range zero 19:13:00.00 G.m.t. Crew: Lovell (CDR), Swigert (CMP), Haise (LMP).",
  },
  {
    id: "mev_002",
    date: "1970-04-11",
    time: "19:15:44",
    category: "PROPULSION",
    severity: "info",
    detail: "GET 00:02:44 — S-IC outboard engine cutoff. S-II ignition one second later.",
  },
  {
    id: "mev_003",
    date: "1970-04-11",
    time: "19:20:41",
    category: "PROPULSION",
    severity: "warn",
    detail:
      "GET ~00:07:41 — S-II centre engine cut off early on a pogo-induced sensor trip. Outboard engines burned longer to compensate; orbit was nominal. GET APPROXIMATE (derived).",
  },
  {
    id: "mev_004",
    date: "1970-04-11",
    time: "19:22:53",
    category: "PROPULSION",
    severity: "info",
    detail: "GET 00:09:53 — S-II cutoff. S-IVB ignition GET 00:09:54, cutoff GET 00:12:30.",
  },
  {
    id: "mev_005",
    date: "1970-04-11",
    time: "21:48:46",
    category: "GUIDANCE",
    severity: "info",
    detail: "GET 02:35:46 — translunar injection. S-IVB restart, spacecraft committed to the Moon.",
  },
  {
    id: "mev_006",
    date: "1970-04-11",
    time: "22:32:09",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "GET 03:19:09 — docking with LM Aquarius. S-IVB/CSM separation GET 03:06:39; spacecraft ejection GET 04:01:01.",
  },

  /* ---------------- 1970-04-13 — first midcourse ---------------- */
  {
    id: "mev_007",
    date: "1970-04-13",
    time: "01:53:50",
    category: "PROPULSION",
    severity: "info",
    detail:
      "GET 30:40:50 — first midcourse correction, service propulsion system. Trajectory moved off free-return onto the Fra Mauro hybrid.",
  },

  /* ---------------- 1970-04-14 — the accident ---------------- */
  {
    id: "mev_008",
    date: "1970-04-14",
    time: "03:05:31",
    category: "LIFE_SUPPORT",
    severity: "warn",
    detail:
      "GET 55:52:31 — hydrogen tank low-pressure master alarm. Crew and ground worked the hydrogen indication; the alarm had already blocked the cryogenic section of the caution and warning system.",
  },
  {
    id: "mev_009",
    date: "1970-04-14",
    time: "03:05:58",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "GET 55:52:58 — CAPCOM Lousma requests cryogenic stir: 'And 13, we've got one more item for you, when you get a chance. We'd like you to stir up your cryo.'",
  },
  {
    id: "mev_010",
    date: "1970-04-14",
    time: "03:06:20",
    category: "CRYOGENIC",
    severity: "info",
    detail:
      "GET 55:53:20 — oxygen tank fans on, all four. Telemetry shows a power transient as the fan motors start.",
  },
  {
    id: "mev_011",
    date: "1970-04-14",
    time: "03:07:45",
    category: "CRYOGENIC",
    severity: "alert",
    detail:
      "GET 55:54:45 — oxygen tank 2 pressure peaks at 1008.3 psia. Relief valve should release at 1000 psi. Pressure had been rising abnormally for roughly 100 seconds.",
  },
  {
    id: "mev_012",
    date: "1970-04-14",
    time: "03:07:52",
    category: "CRYOGENIC",
    severity: "alert",
    detail:
      "GET 55:54:52.763 — last valid telemetry sample from oxygen tank 2: 995.7 psia, falling.",
  },
  {
    id: "mev_013",
    date: "1970-04-14",
    time: "03:07:53",
    category: "ANOMALY",
    severity: "alert",
    detail:
      "GET 55:54:53.182 — oxygen tank 2 fails. Energy release equivalent to roughly 7 pounds of TNT. The outer panel of bay 4 of the service module separates. Pressure decay in tank 2 is essentially instantaneous.",
  },
  {
    id: "mev_014",
    date: "1970-04-14",
    time: "03:07:53",
    category: "ELECTRICAL",
    severity: "alert",
    detail:
      "GET 55:54:53.555 — MAIN BUS B UNDERVOLT. Master alarm in all three headsets. Shock closes the oxygen reactant valves to fuel cells 1 and 3.",
  },
  {
    id: "mev_015",
    date: "1970-04-14",
    time: "03:07:55",
    category: "COMMS",
    severity: "warn",
    detail:
      "GET 55:54:55.350 — telemetry recovered after a 1.8-second dropout. High-gain antenna had switched from narrow to wide beam width; the antenna itself was damaged.",
  },
  {
    id: "mev_016",
    date: "1970-04-14",
    time: "03:08:20",
    category: "COMMS",
    severity: "alert",
    detail:
      "GET 55:55:20 — Swigert: 'Okay, Houston, we've had a problem here.' Lousma asks for a repeat.",
  },
  {
    id: "mev_017",
    date: "1970-04-14",
    time: "03:08:35",
    category: "COMMS",
    severity: "alert",
    detail:
      "GET 55:55:35 — Lovell: 'Houston, we've had a problem. We've had a MAIN B BUS UNDERVOLT.'",
  },
  {
    id: "mev_018",
    date: "1970-04-14",
    time: "03:10:04",
    category: "CRYOGENIC",
    severity: "warn",
    detail:
      "GET 55:57:04 — Haise reports the oxygen quantity 2 sensor reading full-scale high, having read 'that funny' before the bang.",
  },
  {
    id: "mev_019",
    date: "1970-04-14",
    time: "03:10:45",
    category: "ELECTRICAL",
    severity: "alert",
    detail:
      "GET 55:57:45 — fuel cell 3 fails. Fuel cell 1 follows. Only fuel cell 2 remains, fed by oxygen tank 1, which is now leaking.",
  },
  {
    id: "mev_020",
    date: "1970-04-14",
    time: "03:22:07",
    category: "ANOMALY",
    severity: "alert",
    detail:
      "GET 56:09:07 — Lovell, looking out the hatch window: 'It looks to me, looking out the hatch, that we are venting something. We are venting something out into the — into space.' The failure is physical, not instrumentation.",
  },
  {
    id: "mev_021",
    date: "1970-04-14",
    time: "04:37:12",
    category: "PROCEDURE",
    severity: "warn",
    detail:
      "GET 57:24:12 — oxygen tank 1 down to a little over 200 psi and falling. Ground begins working the lunar module as a lifeboat. EECOM estimate: about 18 minutes to 100 psi.",
  },
  {
    id: "mev_022",
    date: "1970-04-14",
    time: "05:53:00",
    category: "ELECTRICAL",
    severity: "warn",
    detail:
      "GET 58:40:00 — command module completely powered down. 99 ampere-hours remain in the three entry batteries. Everything from here is budgeted against that number.",
  },
  {
    id: "mev_023",
    date: "1970-04-14",
    time: "08:42:43",
    category: "PROPULSION",
    severity: "info",
    detail:
      "GET 61:29:43 — second midcourse correction using the LM descent propulsion system. Delta-V 38.0 ft/s, returning the spacecraft to a free-return trajectory. Landing would have been in the Indian Ocean at GET 152 hours.",
  },
  {
    id: "mev_024",
    date: "1970-04-14",
    time: "11:56:00",
    category: "ELECTRICAL",
    severity: "info",
    detail:
      "GET ~64:47 — lunar module powered down to minimum. GET APPROXIMATE. Guidance, heaters and most lighting off to protect LM battery capacity.",
  },

  /* ---------------- 1970-04-15 — around the Moon ---------------- */
  {
    id: "mev_025",
    date: "1970-04-15",
    time: "00:22:00",
    category: "GUIDANCE",
    severity: "info",
    detail:
      "GET ~77:09 — pericynthion, 137 nautical miles above the lunar far side. Highest altitude above a body ever reached by a crewed spacecraft. GET APPROXIMATE (derived).",
  },
  {
    id: "mev_026",
    date: "1970-04-15",
    time: "01:09:40",
    category: "PROPULSION",
    severity: "info",
    detail: "GET 77:56:40 — S-IVB impacts the Moon as planned, recorded by the Apollo 12 seismometer.",
  },
  {
    id: "mev_027",
    date: "1970-04-15",
    time: "02:40:39",
    category: "PROPULSION",
    severity: "alert",
    detail:
      "GET 79:27:39 — transearth injection, the PC+2 burn. Descent propulsion system, Delta-V 861.5 ft/s, duration 4 minutes 24 seconds. Moves the landing point from the Indian Ocean to the South Pacific and cuts transit time.",
  },
  {
    id: "mev_028",
    date: "1970-04-15",
    time: "12:20:54",
    category: "LIFE_SUPPORT",
    severity: "warn",
    detail:
      "GET 89:07:54 — Lousma begins reading up the carbon dioxide adapter procedure: 'we figure we've got to make a mailbox... it'll take about an hour to build it, and you're going to need about four sets of hands.'",
  },
  {
    id: "mev_029",
    date: "1970-04-15",
    time: "13:35:50",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "GET 90:22:50 — crew constructs the adapter from a command module lithium hydroxide canister, a liquid cooling garment bag, cue-card cardboard and gray tape.",
  },
  {
    id: "mev_030",
    date: "1970-04-15",
    time: "16:36:29",
    category: "LIFE_SUPPORT",
    severity: "info",
    detail:
      "GET 93:23:29 — carbon dioxide partial pressure reported at 6.6 mm Hg, down from a peak near 15. Haise had reported a master alarm at 12.5 mm Hg before the fix. The adapter works.",
  },

  /* ---------------- 1970-04-16 to 17 — home ---------------- */
  {
    id: "mev_031",
    date: "1970-04-16",
    time: "04:31:28",
    category: "PROPULSION",
    severity: "info",
    detail:
      "GET 105:18:28 — third midcourse correction, descent propulsion system, refining the entry corridor.",
  },
  {
    id: "mev_032",
    date: "1970-04-17",
    time: "12:52:52",
    category: "GUIDANCE",
    severity: "info",
    detail:
      "GET 137:39:52 — fourth midcourse correction using LM reaction control thrusters, final entry-angle trim.",
  },
  {
    id: "mev_033",
    date: "1970-04-17",
    time: "13:14:48",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "GET 138:01:48 — command module / service module separation per the Mission Report sequence of events.",
  },
  {
    id: "mev_034",
    date: "1970-04-17",
    time: "13:17:46",
    category: "ANOMALY",
    severity: "alert",
    detail:
      "GET 138:04:46 — Lovell, first sight of the service module: 'And there's one whole side of that spacecraft missing... Right by the — Look out there, will you? Right by the high gain antenna, the whole panel is blown out, almost from the base to the engine.'",
  },
  {
    id: "mev_035",
    date: "1970-04-17",
    time: "13:20:12",
    category: "ANOMALY",
    severity: "warn",
    detail:
      "GET 138:07:12 — Haise on the service propulsion system bell: a dark brown streak visible along the nozzle. Crew photographs the damage through the hatch window as the module drifts.",
  },
  {
    id: "mev_036",
    date: "1970-04-17",
    time: "16:43:00",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "GET 141:30:00 — lunar module Aquarius jettisoned. It had kept three men alive for approximately 83 hours on consumables budgeted for two men for 45.",
  },
  {
    id: "mev_037",
    date: "1970-04-17",
    time: "17:53:46",
    category: "RECOVERY",
    severity: "warn",
    detail: "GET 142:40:46 — entry interface, 400,000 feet. Communications blackout begins.",
  },
  {
    id: "mev_038",
    date: "1970-04-17",
    time: "18:07:41",
    category: "RECOVERY",
    severity: "info",
    detail:
      "GET 142:54:41 — splashdown. 21 degrees 38 minutes 24 seconds south, 165 degrees 21 minutes 42 seconds west, four miles from USS Iwo Jima. 29 ampere-hours remained in the entry batteries.",
  },
  {
    id: "mev_039",
    date: "1970-04-17",
    time: "18:52:00",
    category: "RECOVERY",
    severity: "info",
    detail:
      "GET ~143:39 — crew aboard the recovery ship, within 45 minutes of landing. GET APPROXIMATE (derived from the Mission Report's 45-minute figure).",
  },

  /* ---------------- the investigation ---------------- */
  {
    id: "mev_040",
    date: "1970-04-17",
    time: "22:00:00",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "Apollo 13 Review Board established by memorandum of the Administrator, 17 April 1970; membership extended 21 April. Edgar M. Cortright, chairman.",
  },
  {
    id: "mev_041",
    date: "1970-06-10",
    time: "12:00:00",
    category: "ANOMALY",
    severity: "alert",
    detail:
      "Full-scale propagation test at MSC: fire inside an Apollo service module oxygen tank, filmed from outside the vessel. Shows failure of the tank conduit with abrupt loss of oxygen pressure. Photograph S70-41984.",
  },
  {
    id: "mev_042",
    date: "1970-06-15",
    time: "12:00:00",
    category: "PROCEDURE",
    severity: "info",
    detail:
      "Report of the Apollo 13 Review Board transmitted to the Administrator. Probable cause: an electrically initiated fire in oxygen tank 2 of the service module. Nine recommendations.",
  },
];
