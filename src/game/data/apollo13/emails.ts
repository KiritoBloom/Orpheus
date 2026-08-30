"use client";

/**
 * APOLLO 13 — administrative correspondence (corpus instance two).
 *
 * Instance one's mail application holds a physicist's inbox. Here it holds the
 * administrative record: the April 1970 memoranda that created the Review Board
 * and set its terms, plus the archivist's notes that explain how this workstation
 * was assembled.
 *
 * HONESTY RULE FOR THIS FILE. These are memoranda, not emails. They are shown in
 * a mail client because that is the application this workstation has for
 * correspondence, and each one says on its first line what it actually is and
 * where it came from. Passages in quotation marks are verbatim from the source
 * document. Everything outside quotation marks is either an administrative fact
 * recorded in the Review Board report or an archivist's note about this corpus,
 * and the archivist's notes are signed as such. No memorandum text is invented,
 * and no 1970 official is given words they did not write.
 *
 * `from`/`fromEmail` are the originating office and a routing string for the
 * archive; NASA had no email in 1970 and the addresses are archive identifiers,
 * not historical claims.
 */

import type { Email } from "@/types/game";

export const EMAILS: Email[] = [
  {
    id: "mail_board_established",
    folder: "inbox",
    from: "Office of the Administrator, NASA Headquarters",
    fromEmail: "hq-admin@archive.transcribed",
    to: "Apollo 13 Review Board",
    date: "1970-04-17",
    subject: "MEMORANDUM — Establishment of the Apollo 13 Review Board",
    body: `TRANSCRIBED MEMORANDUM — source: Report of Apollo 13 Review Board (NASA-TM-X-65270), Appendix A, memorandum of April 17, 1970. Public domain.

The Apollo 13 Review Board was established by memorandum of the Administrator dated April 17, 1970 — three days after the accident and the day the crew was recovered. Edgar M. Cortright, Director of the Langley Research Center, was designated chairman.

The Board was directed to review the circumstances surrounding the accident to the spacecraft which occurred during the flight of Apollo 13, to establish the probable cause or causes, and to develop recommendations for corrective or other actions.

A second memorandum of April 21, 1970, fixed the membership and the panel structure.

ARCHIVIST'S NOTE: the full transmittal letter of June 15, 1970, is on this workstation at /Board/transmittal_1970-06-15.txt. The list of members and panel chairmen is there. One name is missing from it — the chairman of Panel 4 — because the scanned text of the report does not yield it legibly. It is left blank rather than guessed.`,
    attachments: [
      { name: "transmittal_1970-06-15.txt", path: "/Board/transmittal_1970-06-15.txt" },
    ],
    unread: true,
  },

  {
    id: "mail_membership",
    folder: "inbox",
    from: "Office of the Administrator, NASA Headquarters",
    fromEmail: "hq-admin@archive.transcribed",
    to: "Apollo 13 Review Board",
    date: "1970-04-21",
    subject: "MEMORANDUM — Board membership and panel structure",
    body: `TRANSCRIBED MEMORANDUM — source: NASA-TM-X-65270, Appendix A, memorandum of April 21, 1970. Public domain.

Membership as recorded in the report:

  Edgar M. Cortright, Langley Research Center — Chairman
  Robert F. Allnutt, Assistant to the Administrator
  Neil A. Armstrong, Astronaut, Manned Spacecraft Center
  Dr. John F. Clark, Goddard Space Flight Center
  Brig. Gen. Walter R. Hedrick, Jr., USAF
  Vincent L. Johnson, Office of Space Science and Applications
  Milton Klein, Space Nuclear Systems
  Dr. Hans M. Mark, Ames Research Center

  George Malley, Langley — Counsel to the Board
  Charles W. Mathews, Office of Manned Space Flight — support
  William A. Anders, National Aeronautics and Space Council — observer

Four panels were established to conduct the technical review, chaired by
Smith, Schurmeier and Himmel; the fourth panel's chairman is not legible in
the source scan.

ARCHIVIST'S NOTE: Armstrong's presence on this Board is the detail most people
find surprising nine months later. He had walked on the Moon nine months before
and was asked to determine why a tank failed.`,
    unread: true,
  },

  {
    id: "mail_myers_ten_days",
    folder: "inbox",
    from: "Office of Manned Space Flight",
    fromEmail: "omsf@archive.transcribed",
    to: "Apollo Program Office",
    date: "1970-06-15",
    subject: "MEMORANDUM — corrective action for Apollo 14, ten-day tasking",
    body: `TRANSCRIBED ADMINISTRATIVE ACTION — source: NASA-TM-X-65270, transmittal and covering actions of June 15, 1970. Public domain.

On transmittal of the Board's report, Dale D. Myers, Associate Administrator for
Manned Space Flight, was directed to develop the corrective actions required for
Apollo 14 within ten days.

The Board's recommendations, in the report's own numbering, are at
/Board/ch5_recommendations.txt on this workstation. Recommendation 1 concerns the
cryogenic oxygen storage system and the removal of all combustible materials from
contact with the oxygen. Recommendation 6 concerns the review process itself: the
requirement that the potential consequences of a deviation from an approved
procedure be understood before flight, not after.

ARCHIVIST'S NOTE: ten days is the part of this record that reads strangely now.
The Board took two months to establish the cause. The program was given ten days
to fix it, and Apollo 14 flew nine months later with a redesigned tank, a third
oxygen tank in a different bay, and no fans in the cryogenic tanks at all.`,
  },

  {
    id: "mail_harrington",
    folder: "inbox",
    from: "Office of the Administrator, NASA Headquarters",
    fromEmail: "hq-admin@archive.transcribed",
    to: "Aerospace Safety Advisory Panel",
    date: "1970-06-15",
    subject: "MEMORANDUM — review of Board procedures",
    body: `TRANSCRIBED ADMINISTRATIVE ACTION — source: NASA-TM-X-65270, covering actions of June 15, 1970. Public domain.

Alongside the technical tasking, a panel under Harrington was asked to review the
procedures the Review Board had followed — that is, to audit the audit.

ARCHIVIST'S NOTE: this is included in the corpus for one reason. The Board's
central finding is not that a tank failed. It is that a deviation from an
approved procedure was carried out without anyone assessing what it could do, and
that the people who cleared the vehicle for flight did not know it had happened.
An organisation that responds to that finding by also examining how it examines
itself is behaving consistently with the finding.`,
  },

  {
    id: "mail_photo_provenance",
    folder: "archive",
    from: "Archivist, this workstation",
    fromEmail: "archivist@this.workstation",
    to: "Reader",
    date: "1970-06-20",
    subject: "ARCHIVIST'S NOTE — how the photographs on this machine were verified",
    body: `Not a memorandum. This is a note from whoever assembled this workstation.

Nine photographs are loaded. All nine are NASA public domain, retrieved from the
NASA Image and Video Library; the catalog URL for each is in the browser history
on this machine.

The byte size and SHA-256 prefix recorded in each photograph's metadata are the
real values of the real file this workstation serves. They are not decoration and
they are not placeholders. Hash any served image and the prefix will match the
metadata the assistant reads out.

That property is the point. The assistant on this machine can read every metadata
field and cannot see a single pixel. If it tells you a frame is 1.69 MB with a
hash beginning 12b7b5fd, you can check it. If it tells you what the frame shows,
it is reading a caption a human wrote — and on S70-35013, the caption is wrong.

— Archivist`,
  },

  {
    id: "mail_conflicts",
    folder: "archive",
    from: "Archivist, this workstation",
    fromEmail: "archivist@this.workstation",
    to: "Reader",
    date: "1970-06-20",
    subject: "ARCHIVIST'S NOTE — three conflicts left in on purpose",
    body: `Not a memorandum.

Three places on this workstation contain sources that disagree. None is resolved,
and none is a mistake:

1. Service module jettison. Table 3-1 of MSC-02680 gives GET 138:01:48. Lovell's
   voice call is timed 138:02:06. Eighteen seconds.

2. Splashdown. MSC-02680 gives GET 142:54:41, which is 12:07:41 p.m. CST. The
   1970 press caption on S70-35638 says 12:07:44 p.m. Three seconds.

3. The carbon dioxide adapter. The 1970 caption on S70-35013 says it was built
   for the command module. Table 4-III, the transcript and the entire logic of
   the device say the shortfall was in the lunar module.

A corpus that quietly picked a winner in each case would be easier to read and
worth less. Two NASA documents disagreeing about when a spacecraft split in half
is the ordinary texture of a real record, and an investigator who cannot sit with
it will invent certainty somewhere it does not belong.

— Archivist`,
  },
];
