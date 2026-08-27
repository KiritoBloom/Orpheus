import type { ChatMsg } from "@/types/game";

/* ============================================================
   DANIEL'S ON-DEVICE CHAT EXPORT — 6 threads, ~40 messages
   Machine-readable for ARIA via search_messages / get_message_thread.
   ============================================================ */

export const THREADS: { id: string; name: string; handle: string }[] = [
  { id: "t_sarah", name: "Sarah Okafor", handle: "s.okafor" },
  { id: "t_mom", name: "Ruth McDuff", handle: "mom" },
  { id: "t_voss", name: "Klaus Voss", handle: "k.voss" },
  { id: "t_W", name: "W —", handle: "unknown_W" },
  { id: "t_lab", name: "Bench B — lab group", handle: "bench-b" },
  { id: "t_it", name: "Penn IT — Help Desk", handle: "penn-it" },
];

export const CHAT_MESSAGES: ChatMsg[] = [
  // ---------- SARAH OKAFOR (main thread) ----------
  { id: "cm_001", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-02-28 23:41", body: `professor the stack reproduces. all five datasets.` },
  { id: "cm_002", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-02-28 23:44", body: `e-fold 9.1. it's real. i've rerun it sober this time` },
  { id: "cm_003", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: true, time: "2026-02-28 23:47", body: `I never doubted sober-you. Keep the raw frames somewhere that isn't this machine.` },
  { id: "cm_004", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-02-28 23:52", body: `already done. two cold copies. one reads like a genealogy file, one reads like tax receipts :)` },
  { id: "cm_005", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: true, time: "2026-03-02 08:15", body: `Sarah — if anything odd happens — lost keys, strange visitors, my behaving strangely — check TIMESTAMPS against the building access log before you check your memory.` },
  { id: "cm_006", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-03-02 08:19", body: `that's an alarming sentence for a tuesday morning` },
  { id: "cm_007", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-03-06 16:02", body: `a man was asking the dept admin for your home address today. said he was from your insurance.` },
  { id: "cm_008", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-03-06 16:02", body: `i gave him the dept fax number and watched him walk` },
  { id: "cm_009", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: true, time: "2026-03-06 16:09", body: `Description?` },
  { id: "cm_010", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-03-06 16:11", body: `tall. grey coat. visitor badge on a lanyard but the badge was turned backwards. calm as sunday.` },
  { id: "cm_011", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-03-08 11:14", body: `professor are you ok? you missed seminar` },
  { id: "cm_012", threadId: "t_sarah", threadName: "Sarah Okafor", outgoing: false, time: "2026-03-09 00:05", body: `i'm coming by tomorrow 9am whether you want me to or not. bring the residuals. bring yourself.` },

  // ---------- MOM ----------
  { id: "cm_013", threadId: "t_mom", threadName: "Ruth McDuff", outgoing: false, time: "2026-02-15 19:20", body: `Danny, honey, call your mother. the porch light has been on for two days, should I turn it off?` },
  { id: "cm_014", threadId: "t_mom", threadName: "Ruth McDuff", outgoing: true, time: "2026-02-15 19:55", body: `Leave the lantern on, Mom. I mean the porch light. Leave it on. And thanks.` },
  { id: "cm_015", threadId: "t_mom", threadName: "Ruth McDuff", outgoing: false, time: "2026-03-07 18:02", body: `you didn't call again. i made the chili. the GOOD one. it's in your freezer, not the church book one, so eat it.` },
  { id: "cm_016", threadId: "t_mom", threadName: "Ruth McDuff", outgoing: true, time: "2026-03-08 08:20", body: `Mom, thank you. I love you. If anyone asks you anything odd — what I kept in the second drawer — that is the lantern question. You'll know if you hear it.` },

  // ---------- KLAUS VOSS (old CERN friend, skeptic, lovable) ----------
  { id: "cm_017", threadId: "t_voss", threadName: "Klaus Voss", outgoing: true, time: "2026-02-18 20:12", body: `Klaus — question hypothetically. Five unrelated precision programs share a slow monotonic residual term. Growth ~10 yr e-fold. Common-mode instrumental?` },
  { id: "cm_018", threadId: "t_voss", threadName: "Klaus Voss", outgoing: false, time: "2026-02-18 22:44", body: `hypothetically — bullshit. hypothetically you have a reference material no one told you about. hypothetically i will come to philly and break your beamline for science.` },
  { id: "cm_019", threadId: "t_voss", threadName: "Klaus Voss", outgoing: true, time: "2026-02-19 09:11", body: `No shared material, no shared pipeline. Torsion balance from 1988 agrees with rubin from last week.` },
  { id: "cm_020", threadId: "t_voss", threadName: "Klaus Voss", outgoing: false, time: "2026-02-19 10:00", body: `then hypothetically — publish or call a priest. i will read it before anyone else. — K` },

  // ---------- UNKNOWN "W" (Kestrel operative — polite menace) ----------
  { id: "cm_021", threadId: "t_W", threadName: "W —", outgoing: false, time: "2026-02-26 16:40", body: `Prof. McDuff — we understand your presentation touched matters of measurement standards. An archivist of your standing knows the difference between contribution and disturbance. — W` },
  { id: "cm_022", threadId: "t_W", threadName: "W —", outgoing: true, time: "2026-02-26 16:52", body: `Who is this, and how did you get this number?` },
  { id: "cm_023", threadId: "t_W", threadName: "W —", outgoing: false, time: "2026-02-26 16:58", body: `A colleague of your former colleague, E.V. Your colleague worried too. We worried with him, until he didn't.` },
  { id: "cm_024", threadId: "t_W", threadName: "W —", outgoing: false, time: "2026-03-03 11:05", body: `Thursday, Professor. Bring nothing. The Institute discusses weather at scale. You may want to discuss yours.` },

  // ---------- LAB GROUP ----------
  { id: "cm_025", threadId: "t_lab", threadName: "Bench B — lab group", outgoing: false, time: "2026-02-11 14:31", body: `[LIN Z.] bench B: 교수님, the counts jumped by 2^7 at 02:13 again. firmware bug or you moved the lab? :p` },
  { id: "cm_026", threadId: "t_lab", threadName: "Bench B — lab group", outgoing: true, time: "2026-02-11 14:44", body: `[D.M.] Not the firmware. Log the environment that minute anyway. Especially that minute.` },
  { id: "cm_027", threadId: "t_lab", threadName: "Bench B — lab group", outgoing: false, time: "2026-03-07 10:12", body: `[MIRA S.] bench B: prof, door event 02:07 last night? the lab access log shows your card at 02:07 but you weren't here yesterday…` },
  { id: "cm_028", threadId: "t_lab", threadName: "Bench B — lab group", outgoing: true, time: "2026-03-07 10:18", body: `[D.M.] wasn't me. pull the video?` },
  { id: "cm_029", threadId: "t_lab", threadName: "Bench B — lab group", outgoing: false, time: "2026-03-07 10:22", body: `[MIRA S.] video retention is 72h. it's gone. IT says 48h this week because of the storage migration. convenient.` },

  // ---------- IT HELP DESK ----------
  { id: "cm_030", threadId: "t_it", threadName: "Penn IT — Help Desk", outgoing: false, time: "2026-01-14 09:05", body: `This is an automated acknowledgment of your phishing report (ticket ISC-88219). Thank you.` },
  { id: "cm_031", threadId: "t_it", threadName: "Penn IT — Help Desk", outgoing: false, time: "2026-03-09 14:30", body: `Ticket ISC-88219 — FOLLOW-UP: the reported phishing domain "example-idp.com" was registered 11/01/2025 via registrar that also hosts "kestrel-institute.org". Shared ASN. Noted for the record.` },
];
