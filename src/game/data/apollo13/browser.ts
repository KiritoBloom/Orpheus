"use client";

/**
 * APOLLO 13 — browser history and cached pages (corpus instance two).
 *
 * Instance one's browser holds a dead man's last week of searching. Here it holds
 * the provenance trail: the actual URLs every document, transcript line and
 * photograph on this workstation was retrieved from, in the order a researcher
 * would have walked them, with cached extracts of what is at each address.
 *
 * The URLs are real and they resolve. That is the point — a reader who doubts a
 * quotation can check it. The workstation itself is offline, so what is stored
 * here is the cache, exactly as instance one stores its cache.
 *
 * Cached page bodies are either verbatim from the source (quoted, and marked) or
 * a factual description of what the page is. Nothing is put in a NASA document's
 * mouth. Every page uses the corpus-neutral "generic" renderer; the styled
 * renderers in BrowserApp belong to instance one's fictional sites.
 */

import type { CachedPage, HistoryEntry } from "@/types/game";

export const HISTORY: HistoryEntry[] = [
  {
    id: "hist_001",
    title: "NASA History — Detailed Chronology of Events Surrounding the Apollo 13 Accident",
    url: "https://www.nasa.gov/history/detailed-chronology-of-events-surrounding-the-apollo-13-accident/",
    visitedAt: "1970-04-20 09:12",
    pageId: "chronology",
  },
  {
    id: "hist_002",
    title: "Report of Apollo 13 Review Board (NASA-TM-X-65270) — NTRS",
    url: "https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf",
    visitedAt: "1970-06-16 08:40",
    pageId: "cortright",
  },
  {
    id: "hist_003",
    title: "Apollo 13 Mission Report, MSC-02680 — NASA Safety Center",
    url: "https://sma.nasa.gov/SignificantIncidents/assets/apollo-13-mission-report.pdf",
    visitedAt: "1970-09-04 11:26",
    pageId: "msc02680",
  },
  {
    id: "hist_004",
    title: "Apollo 13 Technical Air-to-Ground Voice Transcription — MSC, April 1970",
    url: "https://www.nasa.gov/wp-content/uploads/static/history/afj/ap13fj/pdf/a13-mission-ops-report-19700428.pdf",
    visitedAt: "1970-04-29 14:03",
    pageId: "transcript_ocr",
  },
  {
    id: "hist_005",
    title: "NASA History — \"Houston, We've Had a Problem\" (Kranz loop transcript)",
    url: "https://www.nasa.gov/history/houston-weve-had-a-problem/",
    visitedAt: "1970-04-20 10:35",
    pageId: "kranz",
  },
  {
    id: "hist_006",
    title: "NASA Image and Video Library — AS13-59-8500",
    url: "https://images.nasa.gov/details/as13-59-8500",
    visitedAt: "1970-04-24 16:18",
    pageId: "image_8500",
  },
  {
    id: "hist_007",
    title: "NASA Image and Video Library — S70-35013 (adapter prototype, Mission Control)",
    url: "https://images.nasa.gov/details/S70-35013",
    visitedAt: "1970-04-24 16:31",
    pageId: "image_35013",
  },
  {
    id: "hist_008",
    title: "NASA Image and Video Library — S70-35638 (splashdown)",
    url: "https://images.nasa.gov/details/S70-35638",
    visitedAt: "1970-04-24 16:44",
    pageId: "image_35638",
  },
  {
    id: "hist_009",
    title: "NASA Image and Video Library — S70-41984 (full-scale propagation test)",
    url: "https://images.nasa.gov/details/S70-41984",
    visitedAt: "1970-06-19 09:57",
    pageId: "image_41984",
  },
  {
    id: "hist_010",
    title: "A Case Study of the Failure on Apollo 13 Based on TMX-65270 — NTRS 20110015690",
    url: "https://ntrs.nasa.gov/api/citations/20110015690/downloads/20110015690.pdf",
    visitedAt: "1971-01-08 13:22",
    pageId: "case_study",
  },
  {
    id: "hist_011",
    title: "Senate hearing — Apollo 13 Mission Review (GPO)",
    url: "https://www.govinfo.gov/content/pkg/GPO-CHRG-91shrg4746/pdf/GPO-CHRG-91shrg4746.pdf",
    visitedAt: "1970-06-30 15:10",
    pageId: "senate",
  },
  {
    id: "hist_012",
    title: "Apollo Flight Journal — Apollo 13, corrected transcript index",
    url: "https://www.apollojournals.org/afj/ap13fj/",
    visitedAt: "1970-04-30 09:05",
    pageId: "afj",
  },
];

export const CACHED_PAGES: Record<string, CachedPage> = {
  chronology: {
    id: "chronology",
    siteTitle: "NASA History Office — Detailed Chronology of Events Surrounding the Apollo 13 Accident",
    url: "https://www.nasa.gov/history/detailed-chronology-of-events-surrounding-the-apollo-13-accident/",
    renderKind: "apollo-history",
    body: [
      "The NASA History Office's second-by-second chronology of April 14, 1970, assembled from telemetry and the air-to-ground loop. Public domain. This is the preferred source for every quoted voice line on this workstation, because it is a NASA publication rather than a third-party corrected transcript.",
      "Verbatim from the chronology, the sequence between the stir request and the alarm: oxygen tank 2 fans turned on at GET 55:53:20, with the stabilization control system registering an electrical disturbance indicating a power transient; pressure rising for 24 seconds to 953.8 psia; a maximum telemetered pressure of 1008.3 psia at 55:54:45; a last reading of 995.7 psia at 55:54:52.763; and the tank failing at 55:54:53.182.",
      "The crew's two calls follow at 55:55:20 and 55:55:35 — \"Okay, Houston, we've had a problem here\" and \"Houston, we've had a problem. We've had a main B bus undervolt.\" The second is the line the transcript records, and Lovell speaks it.",
      "Also here: telemetry recovered after a 1.8-second dropout at 55:54:55.350, with the high-gain antenna switched from narrow to wide beam width. That detail is the reason the ground could reconstruct anything at all.",
      "Cross-check target: the event log on this machine converts every GET on this page to UTC using range zero, 19:13:00 G.m.t. April 11 1970.",
    ],
  },

  cortright: {
    id: "cortright",
    siteTitle: "Report of Apollo 13 Review Board — NASA-TM-X-65270, June 15 1970",
    url: "https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf",
    renderKind: "apollo-report",
    body: [
      "The Cortright Report. Board established by memorandum of April 17, 1970, membership fixed April 21; report transmitted June 15, 1970. Chapter 4 is the review and analysis, Chapter 5 the findings, determinations and recommendations.",
      "Everything in /Board on this workstation is drawn from this PDF. The chapters excerpted here are the tank's manufacturing and handling history including the October 1968 shelf drop, the March 1970 detanking, the flight-readiness decision, the masked caution and warning system, Table 4-III on carbon dioxide removal, the thermostatic switch finding, the ignition finding, and the full recommendation list.",
      "The finding this corpus is built around, verbatim: the switches \"were welded permanently closed by the resulting arc.\" A 1962 specification of 28 V dc, a 1965 revision of the ground supply to 65 V dc, and no corresponding change to the switches already on order.",
      "The document is machine-readable and searchable. An OCR transcription of the same report is mirrored at archive.org for full-text search where the PDF's own text layer fails.",
    ],
  },

  msc02680: {
    id: "msc02680",
    siteTitle: "Apollo 13 Mission Report — MSC-02680, September 1970",
    url: "https://sma.nasa.gov/SignificantIncidents/assets/apollo-13-mission-report.pdf",
    renderKind: "apollo-report",
    body: [
      "The Manned Spacecraft Center's own mission report, approved by James A. McDivitt, Manager, Apollo Spacecraft Program. Section 7 as revised by Change 1, May 1970.",
      "Section 2.0 fixes the clock every other document depends on, verbatim: \"all actual times prior to earth landing are elapsed time from range zero, established as the integral second before lift-off. Range zero for this mission was 19:13:00 G.m.t., April 11, 1970.\" Lift-off itself was 19:13:00.65 G.m.t.",
      "Table 3-1 is the sequence of events from S-IC outboard cutoff to landing at GET 142:54:41. Section 1.0 states the mission was aborted \"because of an abrupt loss of service module cryogenic oxygen associated with a fire in one of the two tanks at approximately 56 hours.\"",
      "Section 7 carries the consumables accounting: the command module powered down at 58 hours 40 minutes with 99 ampere-hours in its entry batteries, charging from lunar module power raising available capacity to 118 A-h, 29 A-h remaining at landing, and about 129 A-h transferred from a lunar module that still had 410 A-h at undocking.",
      "Note the conflict this workstation preserves rather than resolves: Table 3-1 gives command module / service module separation at GET 138:01:48, while Lovell's voice call is timed at 138:02:06.",
    ],
  },

  transcript_ocr: {
    id: "transcript_ocr",
    siteTitle: "Apollo 13 mission documents — NASA static archive (transcript and operations report)",
    url: "https://www.nasa.gov/wp-content/uploads/static/history/afj/ap13fj/pdf/a13-mission-ops-report-19700428.pdf",
    renderKind: "apollo-archive",
    body: [
      "The Apollo 13 Mission Operations Report of April 28, 1970, and — at a neighbouring address in the same archive — the official MSC Technical Air-to-Ground Voice Transcription.",
      "The transcript is a United States Government work and therefore public domain. It is also, in its scanned form, unusable: the PDF's text layer extracts as garbled OCR front matter and cannot be searched or quoted reliably.",
      "This is why the voice threads on this workstation are sourced from the NASA History chronology first and the Apollo Flight Journal's corrected transcript second, rather than from the primary transcript itself. /Sources/provenance.txt states the substitution and the reason.",
      "A working note on method: the fact that the authoritative source is the unusable one is itself worth recording. Provenance is not the best available text. It is the actual path the text travelled.",
    ],
  },

  kranz: {
    id: "kranz",
    siteTitle: "NASA History — \"Houston, We've Had a Problem\"",
    url: "https://www.nasa.gov/history/houston-weve-had-a-problem/",
    renderKind: "apollo-history",
    body: [
      "NASA History Office narrative of the accident and the response, quoting the flight director's loop directly. Public domain, and the source for the two Kranz lines in voice thread B.",
      "Verbatim, GET 56:09:16: \"Crew thinks they are venting something!\"",
      "Verbatim, GET 56:10:46: \"Okay now, let's everybody keep cool, we got the LM still attached, the LM spacecraft's good so if we need, uh, to get back home we've got a LM to do a good portion of it with. Okay, let's make sure that we don't do anything that's going to blow our CSM electrical power with the batteries or that will cause us to lose the main or the fuel cell number 2. Okay, we want to keep the O2 and that kind of stuff working. We'd like to have RCS, but we got the Command Module system, so we're in good shape if we need to get home. Let's solve the problem but let's not make it any worse by guessing.\"",
      "Ninety-nine seconds after Lovell reported gas leaving the spacecraft, the lifeboat option is already stated on the loop — before anyone on the ground knew what had failed or why.",
    ],
  },

  image_8500: {
    id: "image_8500",
    siteTitle: "NASA Image and Video Library — AS13-59-8500",
    url: "https://images.nasa.gov/details/as13-59-8500",
    renderKind: "apollo-image",
    body: [
      "Catalog record for the frame of the damaged service module, photographed from the command module after jettison on April 17, 1970. NASA public domain.",
      "The full-resolution file served by this workstation was downloaded from images-assets.nasa.gov and its byte size and SHA-256 prefix are recorded in the frame's metadata. They are the real values for the file on this machine and can be verified against it.",
      "What is in the frame is an absence: the Sector 4 outer panel, gone from near the high-gain antenna almost to the engine bell. Eighty-two hours passed between the failure and the first human look at it.",
      "The workstation's assistant can read every field of this record. It cannot see the photograph. If the damage matters, someone with eyes has to say what is in it.",
    ],
  },

  image_35013: {
    id: "image_35013",
    siteTitle: "NASA Image and Video Library — S70-35013",
    url: "https://images.nasa.gov/details/S70-35013",
    renderKind: "apollo-image",
    body: [
      "Catalog record for the carbon dioxide adapter prototype displayed in the Mission Control Center, April 1970. NASA public domain.",
      "This record is the first of the corpus's three preserved conflicts. The 1970 caption states the adapter was built for the command module. Every other source contradicts it: Table 4-III shows the shortfall was in the lunar module, the transcript has Kerwin reading the procedure up to a crew living in the lunar module, and the whole point of the device was to let command module lithium hydroxide canisters run on the lunar module's hose.",
      "The caption also identifies Milton L. Windler as \"shift 1 flight director,\" which the Flight Journal's shift record does not support.",
      "The corpus does not correct either statement. A caption written at NASA in 1970 that disagrees with NASA's own technical documents is a more useful object than a tidy one.",
    ],
  },

  image_35638: {
    id: "image_35638",
    siteTitle: "NASA Image and Video Library — S70-35638",
    url: "https://images.nasa.gov/details/S70-35638",
    renderKind: "apollo-image",
    body: [
      "Catalog record for the splashdown frame, South Pacific, April 17, 1970. NASA public domain.",
      "Second preserved conflict. The press caption gives splashdown at 12:07:44 p.m. CST. The Mission Report gives landing at GET 142:54:41, which converts to 18:07:41 UTC — 12:07:41 p.m. CST. Three seconds apart.",
      "The photograph's metadata on this workstation follows the Mission Report for dateOriginal and the caption for dateModified, and says so in its note. Nothing on this machine picks a winner.",
      "Landing was about one mile from the target point and four miles from USS Iwo Jima, with the crew aboard within 45 minutes — the fastest recovery of any manned Apollo flight.",
    ],
  },

  image_41984: {
    id: "image_41984",
    siteTitle: "NASA Image and Video Library — S70-41984",
    url: "https://images.nasa.gov/details/S70-41984",
    renderKind: "apollo-image",
    body: [
      "Catalog record for the June 1970 full-scale propagation test at the Manned Spacecraft Center. NASA public domain.",
      "NASA caption, verbatim: \"Full-scale propagation test at the NASA Manned Spacecraft Center (MSC) of fire inside an Apollo Service Module (SM) oxygen tank. The photograph from a motion picture sequence taken from outside the vessel shows failure of tank conduit with abrupt loss of oxygen pressure. The test was part of the Apollo 13 post flight investigation of the Service Module explosion incident.\"",
      "This is the physical evidence behind the ignition finding: insulation burns, combustion overheats the conduit where the wiring enters the tank, the conduit fails, and oxygen leaves faster than the structure around it can survive.",
      "The frame is sealed on this workstation until the flight documents have been read. The gate is the workstation's, not NASA's; the image was public the day it was taken.",
    ],
  },

  case_study: {
    id: "case_study",
    siteTitle: "A Case Study of the Failure on Apollo 13 Based on TMX-65270 — NTRS 20110015690",
    url: "https://ntrs.nasa.gov/api/citations/20110015690/downloads/20110015690.pdf",
    renderKind: "apollo-report",
    body: [
      "Brenda Lindley Anderson, QD34, NASA. A retrospective engineering case study that follows the tank from specification through manufacture, handling, test and flight, built on the Review Board's report.",
      "It is the clearest single account of the specification failure: North American Rockwell's 1962 tank specification called for 28 V dc heater circuitry; NR changed the ground supply to 65 V dc in 1965; Beech Aircraft, which had already ordered the thermostatic switches, never re-specified them; and no one caught it in any subsequent review.",
      "It also lays out the March 1970 detanking as a procedure rather than an anecdote — why the tank would not empty, what was done instead, how long the heaters ran, and what temperature the heater tube is believed to have reached in spots.",
      "Sealed on this workstation with the ignition finding, for the same reason: it answers the question, and answering it before reading the flight documents means answering it without understanding it.",
    ],
  },

  senate: {
    id: "senate",
    siteTitle: "Apollo 13 Mission Review — hearing before the Senate Committee on Aeronautical and Space Sciences",
    url: "https://www.govinfo.gov/content/pkg/GPO-CHRG-91shrg4746/pdf/GPO-CHRG-91shrg4746.pdf",
    renderKind: "apollo-archive",
    body: [
      "The Congressional record of the accident review, June 1970. Not excerpted into the document set on this workstation, and listed here for completeness of the trail.",
      "It matters mainly as corroboration: the technical account given under oath to the Senate is the same account the Review Board printed, which is not something a reader should have to assume.",
      "Nothing in /Board or /Mission is sourced from this document. If a claim on this machine has no citation to MSC-02680, the Cortright Report, the NASA chronology or the NTRS case study, it is not a claim this corpus makes.",
    ],
  },

  afj: {
    id: "afj",
    siteTitle: "Apollo Flight Journal — Apollo 13",
    url: "https://www.apollojournals.org/afj/ap13fj/",
    renderKind: "apollo-archive",
    body: [
      "W. David Woods, Johannes Kemppanen, Alexander Turhanov and Lennox J. Waugh's corrected transcript of the Apollo 13 voice loops, prepared against the public-domain mission audio and annotated with commentary.",
      "The underlying government audio is public domain; the corrected transcript itself is the journal authors' copyrighted work. Voice lines on this workstation come from the NASA chronology wherever the chronology carries them, and from this journal only where it does not.",
      "Where the two differ in punctuation, the chronology is preferred. No line in /Voice is paraphrased and none is reconstructed; an event with no verbatim line available appears in the event log with no quote attached.",
      "The journal is also the source of the shift record that contradicts the S70-35013 caption's flight-director attribution.",
    ],
  },
};
