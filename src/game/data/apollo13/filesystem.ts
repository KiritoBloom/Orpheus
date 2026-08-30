"use client";

/**
 * APOLLO 13 — filesystem (corpus instance two).
 *
 * The same `FsNode[]` shape instance one uses. Directory layout follows the real
 * provenance of the material rather than a fictional user's habits:
 *
 *   /Board      the Apollo 13 Review Board (Cortright Report, NASA-TM-X-65270)
 *   /Mission    the Apollo 13 Mission Report (MSC-02680)
 *   /Voice      air-to-ground transcript extracts
 *   /Photos     frame index for the nine photographs
 *   /Sources    provenance, verbatim from SOURCES.md
 *   /Restricted the post-flight test material, sealed behind decryption
 *
 * The sealed directory is not a fiction about classification. It is the corpus's
 * equivalent of instance one's vault: material that only opens once the human
 * has done the reading. The gate is a game mechanic; the documents inside are as
 * public as the ones outside, and the corpus says so in the file itself.
 */

import type { FsNode } from "@/types/game";
import {
  CASE_STUDY,
  CO2_TABLE,
  CONSUMABLES,
  DETANKING,
  IGNITION,
  LAUNCH_DECISION,
  MASKED_ALARMS,
  RECOMMENDATIONS,
  SEQUENCE_OF_EVENTS,
  SHELF_DROP,
  SUMMARY_LANDING,
  THERMOSTATIC_SWITCH,
  TRANSMITTAL,
  WHAT_HAPPENED,
} from "./documents";

/** The guide the workstation opens first — the corpus explaining itself. */
const FIELD_GUIDE = `APOLLO 13 EVIDENCE WORKSTATION
ORIENTATION

WHAT THIS IS

A real document corpus. Every file on this machine is drawn from a primary NASA
source: the Report of the Apollo 13 Review Board (NASA-TM-X-65270, June 15 1970),
the Apollo 13 Mission Report (MSC-02680, September 1970), the air-to-ground
transcript, the NTRS case study of the tank failure, and nine NASA photographs.
Quoted text is verbatim. Nothing is invented. /Sources/provenance.txt lists every
document and where it came from.

WHAT YOU ARE DOING

Answering one question the sources answer only jointly: why did oxygen tank 2 fail
at GET 55:54:53, and why did the two switches that existed to prevent it not
prevent it?

No single document answers that. The specification mismatch is in one file, dated
1965. The eight-hour heater run that exploited it is in another, dated March 30
1970. What the people clearing the vehicle for flight knew about the second thing
is in a third. The failure itself is a timestamped row in the event log.

TWO CLOCKS

GET (ground elapsed time) is the clock the crew and Mission Control used, and the
clock every document is indexed by. UTC is what the event log sorts by, because
the timeline needs a real calendar. The conversion is fixed:

    UTC = 1970-04-11 19:13:00 + GET

The accident is GET 55:54:53 = 03:07:53 UTC on April 14. If you remember one
number on this machine, remember 03:07.

WHO IS HERE WITH YOU

The workstation's research assistant, which can search and read every document,
correlate the log against the photograph timestamps, and put any line of any file
on this screen. It cannot see. Not the photographs, not this screen, not the
damage. Nine frames on this machine reward being looked at closely, and it can
tell you which ones and where — but you are the only one here with eyes.

Ask it to search. Look at what it finds. Tell it what you see.

THREE CONFLICTS, LEFT IN ON PURPOSE

The corpus does not smooth over its own disagreements:

  1. The Mission Report and the voice transcript disagree about when the service
     module was jettisoned, by eighteen seconds.
  2. The Mission Report and the press caption on the splashdown photograph
     disagree about the landing time, by three seconds.
  3. A 1970 NASA press caption states the carbon dioxide adapter was built for
     the command module. Every other source, the transcript included, makes clear
     it let command module canisters run in the lunar module.

If you find yourself certain, check which document you are certain from.`;

const PROVENANCE = `PROVENANCE
Every source behind this corpus, with the reason it is trusted.

PRIMARY SOURCES

  MSC-02680      Apollo 13 Mission Report, NASA Manned Spacecraft Center,
                 September 1970. Approved by James A. McDivitt, Manager, Apollo
                 Spacecraft Program. Section 7 as revised by Change 1, May 1970.
                 sma.nasa.gov

  CORTRIGHT      Report of Apollo 13 Review Board, NASA-TM-X-65270, June 15 1970.
                 Edgar M. Cortright, chairman.
                 ntrs.nasa.gov/api/citations/19700076776

  CHRONOLOGY     Detailed Chronology of Events Surrounding the Apollo 13
                 Accident, NASA History Office. Public domain, and the source
                 preferred for quoted voice loop lines.
                 nasa.gov/history

  CASE-STUDY     A Case Study of the Failure on Apollo 13 Based on TMX-65270,
                 Brenda Lindley Anderson, QD34, NASA. NTRS 20110015690.

  IMAGE LIBRARY  NASA Image and Video Library (images-api.nasa.gov) for photograph
                 captions and dates. Files served from this machine were
                 downloaded from images-assets.nasa.gov; two frames without an
                 Image Library record came from the Apollo Lunar Surface Journal
                 mirror and are marked unverified in their metadata.

TIME BASE

  Range zero is 19:13:00.00 G.m.t., April 11 1970 (MSC-02680 section 2.0).
  UTC = 1970-04-11 19:13:00 + GET. Verified against splashdown: GET 142:54:41
  resolves to 1970-04-17 18:07:41 UTC, which the Mission Report confirms.

ON THE TRANSCRIPT

The official MSC air-to-ground transcript PDF extracts as unusable OCR. Quoted
exchanges therefore come from the NASA History chronology (public domain) or the
Apollo Flight Journal's corrected transcript over public-domain audio. No line in
/Voice is paraphrased. Lines marked with a star also appear on NASA's own
chronology page.

WHAT IS NOT ASSERTED

Film emulsion and lens focal length per photographic frame could not be verified
from a primary source and are not claimed. Individual frame times are not
recorded in any source; where a photograph carries a timestamp, it is derived
from the mission event the frame depicts, and its metadata note says so. Two
event-log rows carry GET APPROXIMATE for the same reason.

WHAT IS DELIBERATELY LEFT BROKEN

Three document-versus-document conflicts survive into this corpus intact. They
are listed in the orientation file. They are not defects. They are what makes
answering the question a matter of reading across sources rather than looking one
up.`;

const RESTRICTED_NOTE = `POST-FLIGHT TEST MATERIAL

This directory is gated by the workstation, not by NASA. Everything in it is
public domain and always was. The gate exists because this material answers the
question, and answering it before reading the flight documents means answering it
without understanding it.

Inside:

  ch5_ignition.txt          the Board's finding on what ignited, and what the
                            expulsion of oxygen destroyed on its way out
  tank_failure_case_study   the manufacturing chain, the waivers accepted, and
                            the eight-hour detanking step by step
  ground_test_note.txt      the June 1970 propagation test that reproduced it

Two photographs also unseal with this directory. One is the test firing. One is
the lunar module interior during the return, and its caption is the least
reliable thing on this machine.`;

const GROUND_TEST_NOTE = `GROUND TEST — FULL-SCALE PROPAGATION TEST
Manned Spacecraft Center, June 1970. Photograph S70-41984.

NASA caption, verbatim:

"Full-scale propagation test at the NASA Manned Spacecraft Center (MSC) of fire
inside an Apollo Service Module (SM) oxygen tank. The photograph from a motion
picture sequence taken from outside the vessel shows failure of tank conduit with
abrupt loss of oxygen pressure. The test was part of the Apollo 13 post flight
investigation of the Service Module explosion incident."

This is the physical evidence behind the ignition finding in ch5_ignition.txt.
The sequence the test reproduces is the one the Board describes: wiring insulation
ignites, combustion overheats the conduit where it enters the tank, the conduit
fails, and high-pressure oxygen leaves faster than the structure around it can
survive.

The test was filmed from outside the vessel. Look at where the failure occurs in
the frame, and compare it with what is missing from the service module in
AS13-59-8500.`;

const VOICE_INDEX = `AIR-TO-GROUND VOICE — INDEX

Five extracts are loaded into the messages application on this workstation, each
as a thread, each with GET-stamped lines:

  A   THE FAILURE            GET 055:52:58 - 055:57:04
      The stir request, the bang, both "problem" calls, and the oxygen quantity 2
      sensor reading full-scale high.

  B   VENTING                 GET 056:09:07 - 056:10:46
      Lovell sees gas leaving the spacecraft. This is the moment the failure stops
      being an instrumentation question. Includes Kranz on the internal loop.

  C   THE LIFEBOAT            GET 057:23:54 - 057:34:47
      Oxygen tank 1 a little over 200 psi and falling. EECOM's estimate of
      eighteen minutes. The decision to power up the lunar module.

  D   THE ADAPTER             GET 089:07:54 - 093:23:38
      The procedure read up from the ground, built in the spacecraft, and the
      carbon dioxide reading afterwards.

  E   SEPARATION AND HOME     GET 138:04:46 - 142:54:56
      First sight of the damage, the entry pad, and splashdown.

Every line is verbatim. Lines marked with a star also appear on NASA's public
chronology page. Nothing here is paraphrased; where the Flight Journal and the
chronology differ in punctuation, the chronology is preferred.

Thread B is the one to read against the event log. The venting call is at GET
056:09:07, fourteen minutes after the failure — and the caution and warning
system had been blocked for several minutes before the failure ever happened.
That finding is in /Board/ch4_recovery_masked_alarms.txt.`;

const PHOTO_INDEX = `PHOTOGRAPH INDEX
Nine frames. All NASA public domain. Byte sizes and SHA-256 prefixes in each
frame's metadata are the real values for the files on this machine — verify them
if you like.

VISIBLE NOW

  AS13-59-8500   the damaged service module after jettison, April 17
                 The frame that shows what the failure did. Zoom it.
  AS13-62-8929   the carbon dioxide adapter installed in the lunar module
                 Zoom it: bag, cardboard, tape, and the LM's own unused
                 cylindrical receptacles at lower left.
  AS13-59-8484   Lovell in the lunar module before jettison
  AS13-59-8562   Aquarius after jettison
  S70-35013      the adapter prototype in Mission Control — caption is wrong
  S70-35145      Mission Operations Control Room at splashdown
  S70-35638      splashdown — caption disagrees with the Mission Report by 3 s

SEALED, IN THE RESTRICTED DIRECTORY

  S70-41984      the June 1970 ground test: fire inside an oxygen tank
  AS13-62-9004   lunar module interior during the return, caption unverified

WHAT THE ASSISTANT CAN AND CANNOT DO WITH THESE

It can read every frame's metadata: dimensions, byte size, hash, the recorded
date, the caption source, and the notes on what is derived rather than recorded.
It can tell you which frame to open and what part of it is worth magnifying.

It cannot see any of them. If something in a frame matters, you are the one who
has to say so.`;

/* ---------------- builder ---------------- */

function dir(path: string, name: string, parent: string, extra: Partial<FsNode> = {}): FsNode {
  return { path, name, kind: "dir", parent, sizeKb: 0, modified: "1970-06-15", ...extra };
}

function file(
  parentDir: string,
  name: string,
  kind: FsNode["kind"],
  sizeKb: number,
  modified: string,
  extra: Partial<FsNode> = {}
): FsNode {
  return {
    path: parentDir === "/" ? `/${name}` : `${parentDir}/${name}`,
    name,
    kind,
    parent: parentDir,
    sizeKb,
    modified,
    ...extra,
  };
}

export function buildFilesystem(): FsNode[] {
  return [
    dir("/", "/", ""),
    dir("/Board", "Board", "/"),
    dir("/Mission", "Mission", "/"),
    dir("/Voice", "Voice", "/"),
    dir("/Photos", "Photos", "/"),
    dir("/Sources", "Sources", "/"),
    dir("/System", "System", "/"),
    dir("/Restricted", "Restricted", "/", { hiddenUntilFlag: "FOUND_PRIVATE_HINT" }),

    /* ---- orientation ---- */
    file("/System", "ORIENTATION.txt", "txt", 4, "1970-06-15", { content: FIELD_GUIDE }),

    /* ---- the Board ---- */
    file("/Board", "transmittal_1970-06-15.txt", "txt", 3, "1970-06-15", { content: TRANSMITTAL }),
    file("/Board", "ch5_what_happened.txt", "txt", 4, "1970-06-15", { content: WHAT_HAPPENED }),
    file("/Board", "ch5_thermostatic_switch.txt", "txt", 4, "1970-06-15", {
      content: THERMOSTATIC_SWITCH,
    }),
    file("/Board", "ch4_tank_history_shelf_drop.txt", "txt", 4, "1970-06-15", {
      content: SHELF_DROP,
    }),
    file("/Board", "ch4_detanking_march_1970.txt", "txt", 4, "1970-06-15", { content: DETANKING }),
    file("/Board", "ch4_launch_decision.txt", "txt", 3, "1970-06-15", { content: LAUNCH_DECISION }),
    file("/Board", "ch4_recovery_masked_alarms.txt", "txt", 3, "1970-06-15", {
      content: MASKED_ALARMS,
    }),
    file("/Board", "ch4_table_4_III_co2.csv", "csv", 2, "1970-06-15", { content: CO2_TABLE }),
    file("/Board", "ch5_recommendations.txt", "txt", 4, "1970-06-15", { content: RECOMMENDATIONS }),

    /* ---- the Mission Report ---- */
    file("/Mission", "msc02680_consumables.txt", "txt", 4, "1970-09-01", { content: CONSUMABLES }),
    file("/Mission", "msc02680_sequence_of_events.csv", "csv", 3, "1970-09-01", {
      content: SEQUENCE_OF_EVENTS,
    }),
    file("/Mission", "msc02680_summary_landing.txt", "txt", 3, "1970-09-01", {
      content: SUMMARY_LANDING,
    }),

    /* ---- voice ---- */
    file("/Voice", "INDEX.txt", "txt", 2, "1970-04-17", { content: VOICE_INDEX }),

    /* ---- photos ---- */
    file("/Photos", "INDEX.txt", "txt", 2, "1970-04-17", { content: PHOTO_INDEX }),
    file("/Photos", "AS13-59-8500.jpg", "img", 767, "1970-04-17", { photoId: "as13-59-8500" }),
    file("/Photos", "AS13-62-8929.jpg", "img", 4961, "1970-04-15", { photoId: "as13-62-8929" }),
    file("/Photos", "AS13-59-8484.jpg", "img", 2328, "1970-04-17", { photoId: "as13-59-8484" }),
    file("/Photos", "AS13-59-8562.jpg", "img", 897, "1970-04-17", { photoId: "as13-59-8562" }),
    file("/Photos", "S70-35013.jpg", "img", 1606, "1970-04-15", { photoId: "s70-35013" }),
    file("/Photos", "S70-35145.jpg", "img", 1908, "1970-04-17", { photoId: "s70-35145" }),
    file("/Photos", "S70-35638.jpg", "img", 1727, "1970-04-17", { photoId: "s70-35638" }),

    /* ---- provenance ---- */
    file("/Sources", "provenance.txt", "txt", 4, "1970-06-15", { content: PROVENANCE }),

    /* ---- sealed ---- */
    file("/Restricted", "README.txt", "txt", 2, "1970-06-15", { content: RESTRICTED_NOTE }),
    file("/Restricted", "sealed_findings.enc", "enc", 12, "1970-06-15", { encrypted: true }),
    file("/Restricted", "ch5_ignition.txt", "txt", 3, "1970-06-15", {
      content: IGNITION,
      requiresUnlock: true,
    }),
    file("/Restricted", "tank_failure_case_study.txt", "txt", 4, "1971-01-01", {
      content: CASE_STUDY,
      requiresUnlock: true,
    }),
    file("/Restricted", "ground_test_note.txt", "txt", 2, "1970-06-10", {
      content: GROUND_TEST_NOTE,
      requiresUnlock: true,
    }),
    file("/Restricted", "S70-41984.jpg", "img", 2002, "1970-06-10", {
      photoId: "s70-41984",
      requiresUnlock: true,
    }),
    file("/Restricted", "AS13-62-9004.jpg", "img", 666, "1970-04-15", {
      photoId: "as13-62-9004",
      requiresUnlock: true,
    }),
  ];
}

/** The passage `show_in_document` resolves in the orientation file. */
export const GUIDE_PATH = "/System/ORIENTATION.txt";
/** The line the switch document is built around — used by the self-test. */
export const SWITCH_PATH = "/Board/ch5_thermostatic_switch.txt";
export const SWITCH_PASSAGE = "they were welded permanently closed by the resulting arc";
