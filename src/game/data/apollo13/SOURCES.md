# APOLLO 13 CORPUS — SOURCES AND PROVENANCE

Instance two of the Orpheus workstation runs on real, public-domain NASA material.
This file is the provenance record: every document, transcript line, photograph and
timestamp in `src/game/data/apollo13/` traces to a source below.

Nothing here is invented. Where a fact could not be verified from a primary source it
is marked UNVERIFIED and is either omitted from the corpus or carried with its caveat.

## Primary sources

| Ref | Document | URL |
|---|---|---|
| MSC-02680 | Apollo 13 Mission Report, MSC, Sept 1970 | https://sma.nasa.gov/SignificantIncidents/assets/apollo-13-mission-report.pdf |
| CORTRIGHT | Report of Apollo 13 Review Board (NASA-TM-X-65270), June 15 1970 | https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf |
| CORTRIGHT-OCR | Same report, full OCR text | https://archive.org/stream/NASA_NTRS_Archive_19700076776/NASA_NTRS_Archive_19700076776_djvu.txt |
| CHRONOLOGY | NASA History: Detailed Chronology of Events Surrounding the Apollo 13 Accident | https://www.nasa.gov/history/detailed-chronology-of-events-surrounding-the-apollo-13-accident/ |
| KRANZ | NASA History: "Houston, We've Had a Problem" | https://www.nasa.gov/history/houston-weve-had-a-problem/ |
| AFJ | Apollo 13 Flight Journal (corrected transcript) | https://www.apollojournals.org/afj/ap13fj/ |
| OPS-REPORT | Apollo 13 Mission Operations Report, Apr 28 1970 | https://www.nasa.gov/wp-content/uploads/static/history/afj/ap13fj/pdf/a13-mission-ops-report-19700428.pdf |
| SENATE | Senate hearing, "Apollo 13 Mission Review" | https://www.govinfo.gov/content/pkg/GPO-CHRG-91shrg4746/pdf/GPO-CHRG-91shrg4746.pdf |
| CASE-STUDY | Anderson, "A Case Study of the Failure on Apollo 13" (NTRS 20110015690) | https://ntrs.nasa.gov/api/citations/20110015690/downloads/20110015690.pdf |

## Time base

MSC-02680 §2.0: *"all actual times prior to earth landing are elapsed time from range
zero, established as the integral second before lift-off. Range zero for this mission
was 19:13:00 G.m.t., April 11, 1970."* Lift-off was 19:13:00.65 G.m.t.

**UTC = 1970-04-11 19:13:00 + GET.** Verified against splashdown: GET 142:54:41 →
1970-04-17 18:07:41 UTC, matching the independently reported splashdown time.

The corpus stores GET as the primary clock (`HH:MM:SS`) because that is what the
logs, transcript and report all use. Derived UTC is exact only insofar as the GET is.

## Licensing note on transcript lines

The official *Apollo 13 Technical Air-to-Ground Voice Transcription* (MSC, April 1970)
is public domain, but its NASA-hosted PDF extracts as garbled OCR and could not be
used as a machine-readable source. Transcript lines in this corpus come from:

- CHRONOLOGY and KRANZ — NASA History Office, public domain. **Preferred.** Marked ★.
- AFJ — corrected transcript, copyrighted by Woods/Kemppanen/Turhanov/Waugh even
  though the underlying government audio is not.

No exchange is paraphrased or invented. Where no verbatim line could be obtained for
an event, the event carries no quote rather than a reconstruction.

## Mission event log (GET → UTC, category)

Sources: MSC-02680 Table 3-1; CHRONOLOGY; CORTRIGHT Ch. 4; AFJ.

| GET | UTC | Event | Category |
|---|---|---|---|
| 00:00:00 | Apr 11 19:13:00 | Lift-off of AS-508 from KSC LC-39A (2:13 p.m. EST). | LAUNCH |
| 00:02:44 | Apr 11 19:15:44 | S-IC outboard engine cutoff. | PROPULSION |
| ~00:07:41 | Apr 11 19:20:41 | S-II center (inboard) J-2 cuts off ~132 s early; four outboard engines burn ~34 s longer than predicted. GET DERIVED — report states the 132 s figure, not the absolute time. | PROPULSION |
| 00:09:53 | Apr 11 19:22:53 | S-II engine cutoff. | PROPULSION |
| 00:12:30 | Apr 11 19:25:30 | S-IVB cutoff; earth parking orbit achieved. | PROPULSION |
| 02:35:46 | Apr 11 21:48:46 | Translunar injection (S-IVB restart). | PROPULSION |
| 03:19:09 | Apr 11 22:32:09 | CSM *Odyssey* docks with LM *Aquarius*. | PROCEDURE |
| 04:01:01 | Apr 11 23:14:01 | Spacecraft ejection from the S-IVB/SLA. | PROCEDURE |
| 30:40:50 | Apr 13 01:53:50 | First midcourse correction, service propulsion system. | PROPULSION |
| 55:52:31 | Apr 14 03:05:31 | Master caution and warning on low hydrogen pressure, tank 1. This alarm masked the cryogenic portion of the C&W system, so the crew got no warning of the O2 tank 2 pressure excursion that followed. (CORTRIGHT Ch.4 Pt.5) | LIFE_SUPPORT |
| 55:52:58 | Apr 14 03:05:58 | CAPCOM Lousma requests the cryo stir. | COMMS |
| 55:53:20 | Apr 14 03:06:20 | O2 tank 2 fans turned on; stabilization control system registers an electrical disturbance indicating a power transient. | CRYOGENIC |
| 55:53:26 | Apr 14 03:06:26 | O2 tank 2 pressure rises for 24 s, ending at 953.8 psia. | CRYOGENIC |
| 55:54:45 | Apr 14 03:07:45 | O2 tank 2 pressure reaches maximum telemetered value, 1008.3 psia. | CRYOGENIC |
| 55:54:52.763 | Apr 14 03:07:52 | Last telemetered O2 tank 2 pressure before loss of signal: 995.7 psia. | CRYOGENIC |
| **55:54:53.182** | **Apr 14 03:07:53** | **Oxygen tank no. 2 fails.** Accelerometer activity on X, Y, Z; bay 4 (Sector 4) outer panel separates. Force estimated at ~7 lb TNT equivalent. | ANOMALY |
| 55:54:53.555 | Apr 14 03:07:53 | Master caution and warning on DC main bus B undervoltage — the bang and alarm the crew reported. Silenced in 6 s. | ELECTRICAL |
| 55:54:55.350 | Apr 14 03:07:55 | Telemetry recovered after a 1.8-second dropout; high-gain antenna has switched from narrow to wide beam width. | COMMS |
| 55:55:20 | Apr 14 03:08:20 | Swigert: "Okay, Houston, we've had a problem here." | COMMS |
| 55:55:35 | Apr 14 03:08:35 | Lovell: "Houston, we've had a problem. We've had a main B bus undervolt." | COMMS |
| 55:57:45 | Apr 14 03:10:45 | Fuel cell 3 fails; AC bus 2 goes to zero. | ELECTRICAL |
| 55:58:07 | Apr 14 03:11:07 | DC main bus A drops below 26.25 V, levels off at 25.5 V. | ELECTRICAL |
| 56:09:07 | Apr 14 03:22:07 | Lovell sees the leak — venting into space. | ANOMALY |
| 57:24:12 | Apr 14 04:37:12 | Lousma: the LM lifeboat is being considered. | PROCEDURE |
| 58:40:00 | Apr 14 05:53:00 | Command module completely powered down, 99 ampere-hours remaining in the three entry batteries. (MSC-02680 §7.1.6) | ELECTRICAL |
| 61:29:43 | Apr 14 08:42:43 | **Free-return burn** — second midcourse correction, LM descent propulsion, docked. PAD 061:29:42.84, ΔV 38.0 ft/s. Lovell reported "Auto shutdown" at 061:30:25. | GUIDANCE |
| ~64:47 | Apr 14 ~12:00 | **LM lifeboat powerdown** in earnest; Kerwin reads up S-band power amplifier shutdown (2.57 A saving), low bit rate, down-voice backup. Load later held at ~12–14 A. | ELECTRICAL |
| ~77:09 | Apr 15 ~00:22 | Closest approach to the Moon, tracked at 137 nautical miles altitude. GET APPROXIMATE — CORTRIGHT fig. 4-19 label reads "Behind moon (77:09)"; no to-the-second time verified. | GUIDANCE |
| 77:56:40 | Apr 15 01:09:40 | S-IVB lunar impact (planned seismic target). | PROCEDURE |
| 79:27:39 | Apr 15 02:40:39 | **PC+2 burn** — transearth injection, LM descent propulsion, 4 min 24 s, ΔV 861.5 ft/s. Moved the landing point from the Indian Ocean (~152 h) to the South Pacific (~143 h). | PROPULSION |
| 79:32:05 | Apr 15 02:45:05 | Lovell: "Shutdown." Residuals +1.0, +0.3, 0 ft/s — no trim required. | PROPULSION |
| 90:22:50 | Apr 15 13:35:50 | **"Mailbox" CO2 adapter construction**, read up by CAPCOM Kerwin, built by Swigert and Haise from two CM lithium hydroxide canisters, gray tape, LCG bags, a LM cue card and a suit hose. | LIFE_SUPPORT |
| 93:23:29 | Apr 15 16:36:29 | CO2 partial pressure: Kerwin reads 6.6 mm Hg on the ground, Haise ~12.5 onboard after a master alarm; second pair of canisters ordered onto the loop. | LIFE_SUPPORT |
| 105:18:28 | Apr 16 04:31:28 | Third midcourse correction, descent propulsion, to bring entry flight-path angle back inside limits. | GUIDANCE |
| 137:39:52 | Apr 17 12:52:52 | Fourth midcourse correction, LM reaction control under abort guidance. | GUIDANCE |
| 138:01:48 | Apr 17 13:14:48 | Command module / service module separation. (Lovell called "SM Sep" at 138:02:06.) | PROCEDURE |
| 138:04:46 | Apr 17 13:17:46 | Lovell: "And there's one whole side of that spacecraft missing." First direct human observation of the damage. | ANOMALY |
| 141:30:00 | Apr 17 16:43:00 | Undocking — *Aquarius* jettisoned. | PROCEDURE |
| 142:40:46 | Apr 17 17:53:46 | Entry interface (400,000 ft). Predicted 5.2 g peak, 36,211 ft/s. | RECOVERY |
| **142:54:41** | **Apr 17 18:07:41** | **Splashdown**, 21°38'24"S 165°21'42"W, South Pacific, ~1 mile from target and 4 miles from USS *Iwo Jima*. Crew aboard within 45 minutes — fastest recovery of any Apollo manned flight. | RECOVERY |

Discrepancy to preserve, not smooth over: MSC-02680 Table 3-1 gives CM/SM separation at
138:01:48, while Lovell's voice call is at 138:02:06. Both are real. Use the table for the
event, the transcript for the callout.

## Air-to-ground transcript threads

★ = also published on the NASA History Office chronology page (public domain).

### Thread A — "Houston, we've had a problem"
CAPCOM Jack Lousma · CDR Lovell · CMP Swigert · LMP Haise

- ★ 055:52:58 Lousma: "13, we've got one more item for you, when you get a chance. We'd like you to stir up your cryo tanks. In addition, I have shaft and trunnion…"
- ★ 055:53:06 Swigert: "Okay."
- ★ 055:53:07 Lousma: "…for looking at Comet Bennett, if you need it."
- ★ 055:53:12 Swigert: "Okay. Stand by."
- ★ 055:55:20 Swigert: "Okay, Houston, we've had a problem here."
- ★ 055:55:28 Lousma: "This is Houston. Say again please."
- ★ 055:55:35 Lovell: "Houston, we've had a problem. We've had a main B bus undervolt."
- ★ 055:55:42 Lousma: "Roger. Main B undervolt."
- ★ 055:56:10 Haise: "Okay. Right now, Houston, the voltage is—is looking good. And we had a pretty large bang associated with the caution and warning there. And as I recall, main B was the one that had an amp spike on it once before."
- ★ 055:57:04 Haise: "That jolt must have rocked the sensor on — see now — oxygen quantity 2. It was oscillating down around 20 to 60 percent. Now it's full-scale high."

### Thread B — The venting observation
Lovell · Lousma · Mission Control loop (FLIGHT Kranz, EECOM Liebergot)

- 056:09:07 Lovell: "That's AC, okay. Yeah, that's — that's a — good with AC and it looks to me, looking out the hatch, that we are venting something. We are — We are venting something out into the — into space."
- 056:09:22 Lousma: "Roger. We copy your venting."
- 056:09:29 Lovell: "It's a gas of some sort."
- 056:09:16 Kranz (FLIGHT, internal loop): "Crew thinks they are venting something!"
- 056:10:46 Kranz (FLIGHT, internal loop): "Okay now, let's everybody keep cool, we got the LM still attached, the LM spacecraft's good so if we need, uh, to get back home we've got a LM to do a good portion of it with. Okay, let's make sure that we don't do anything that's going to blow our CSM electrical power with the batteries or that will cause us to lose the main or the fuel cell number 2. Okay, we want to keep the O2 and that kind of stuff working. We'd like to have RCS, but we got the Command Module system, so we're in good shape if we need to get home. Let's solve the problem but let's not make it any worse by guessing."

Kranz's line is reproduced verbatim on NASA's own KRANZ page — safe to use.

### Thread C — The lifeboat decision
Lousma · Swigert · Lovell. Loop: FLIGHT Lunney, EECOM Burton, TELMU Merritt.

- 057:23:54 Swigert: "Okay, Jack. It looks like O2 tank 1 pressure is just a hair over 200."
- 057:24:09 Swigert: "Okay. Does it look like it's still going down?"
- 057:24:12 Lousma: "It's slowly going to zero, and we're starting to think about the LM lifeboat."
- 057:24:20 Swigert: "Yes. That's what we're thinking about, too. You want me to do a quick P52? … it kind of looks like we'd probably align our plats — LM platform with our platform and then power down the CM, and keep the LM powered up doing a DPS — whatever DPS burns you give us?"
- 057:24:54 Lousma: "13, we're not going to concern ourselves at the moment with a DPS burn. It's going to be some time before we'd get to that; but we're working on other procedures to give you, which will allow us to use the LM systems. Over."
- 057:28:59 Burton (EECOM, internal loop): "Okay, we've got an update on the time. Looks like we've got about 18 minutes until we get down to 100 psi, and that's the cutoff point."
- 057:29:07 Burton (EECOM): "Well, that doesn't mean much in 18 minutes, though. But we're doing all we can do."
- 057:34:47 Lousma: "13, Houston. It won't do any good to try to power the propellant valves on A and C, so we want you to disable the Auto on RCS Charlie. And we have a procedure for getting power from the LM we'd like you to copy down."

### Thread D — The mailbox
CAPCOM Joe Kerwin · Swigert · Lovell · Haise

- 089:07:54 Lousma: "Okay. Your choice on that. As soon as Jack gets up, I'd suggest we go ahead and break up these lithium hydroxide canisters and make a couple of them. Jack could work on that. It's going to take four sets of hands, I think."
- 089:08:15 Lovell: "Okay. We'll make that the project, getting the lithium hydroxide canister squared away."
- 090:09:17 Kerwin (equipment list): "two Command Module lithium hydroxide canisters, a roll of the gray tape, the two LCGs, because we're going to use the bags from the LCGs, and one — one LM cue card — one of those cardboard cue cards which you will cut off about an inch and a half out from the rings."
- 090:10:53 Kerwin: "…about an inch and a half from the rings… you'll have a card about 11 inches long and probably 6 inches wide."
- 090:22:33 Kerwin: "Okay, Jack. Did anybody ever tell you that you got a 60-day extension on your income tax. Over."
- 090:22:42 Swigert: "Yes. I think — I think somebody said that when you are out of your country, you get a 60-day extension."
- 090:22:50 Kerwin: "…take one of the LCGs and cut off the outer bag. By cutting along one the heat seals; do it carefully and close to the heat seal, because we may have to use the outer bag if we damage the inner bag."
- 090:23:37 Swigert (readback): "Okay. Take an LCG, cut the outer bag by the heat seal. Be careful not to damage the inner bag. Right?"
- 090:23:46 Kerwin: "Right. Just cut along one side."
- 090:24:50 Swigert: "Hey, Houston, Odyssey — or Aquarius. We've done that."
- 091:01:00 Kerwin: "Okay. Real fine. Now the next step is to cut a diagonal hole in one ear of the — of the plastic bag near the arch. You can pick either one and cut about, a 1½- or 2-inch diagonal hole, big enough to slip the red hose through… and then tape the bag to the hose where it goes in so that it's nice and snug. Over."
- 091:01:40 Swigert (readback): "Okay. Copy that. We want a 1½-inch hole right here at this ear, and put the hose in here, end down and toward the canister and then we tape the seal around here."
- 093:23:24 Haise: "What do you read down there for partial pressure CO2?"
- 093:23:29 Kerwin: "Oh, let's see. We're reading 6.6 right now, Fred. What do you read?"
- 093:23:38 Haise: "I'm reading about 12.5. I guess we've got a gage problem… I did just get a Master Alarm and no caution light; we kind of figured that's what it was, with CO2 approaching its limit."

### Thread E — Separation, inspection, splashdown
Kerwin · Lovell · Haise · Swigert · recovery forces

- 138:04:46 Lovell: "And there's one whole side of that spacecraft missing."
- 138:04:50 Kerwin: "Is that right?"
- 138:04:57 Lovell: "Right by the — Look out there, will you? Right by the high gain antenna, the whole panel is blown out, almost from the base to the engine."
- 138:05:22 Haise: "Yes, it looks like it got to the SPS bell, too, Houston."
- 138:05:31 Haise: "That's the way it looks; unless that's just a dark brown streak. It's really a mess."
- 141:48:23 Kerwin (final entry PAD, excerpt): "Mid-PAC, 000,152, 000; 142:38:19, 178; … Noun 61, minus 21.66, minus 165.37; 05.2; 36211, 6.20; 11197, 36291; 142:40:46; 00:30; … You are lift vector up at the very bottom."
- 142:18:40 Swigert: "Its been initialized and setting on Entry."
- 142:22:28 Swigert: "I know all of us here want to thank all you guys down there for the very fine job you did."
- 142:51:55 Swigert (to Recovery): "…see you loud and clear going through 5,000."
- 142:51:59 Recovery helicopters: "Roger, Apollo 13. This is Recovery and your chutes look good."
- 142:54:44 Photographic helicopters: "Photo 1's on station. Photo 1 observes splashdown at this time."
- 142:54:56 Photographic helicopters: "Photo-1. Splashdown at this time. The three chutes are displaced. They're in the water."

## Documents

Each entry below becomes one `FsNode` in the corpus filesystem. Verbatim excerpts are
quoted from the source named; nothing is reworded.

### D1 — `/Board/transmittal_1970-06-15.txt`
*Letter of Transmittal, Report of Apollo 13 Review Board* — Board to Dr. Thomas O. Paine,
Administrator, NASA — June 15, 1970. Signed Edgar M. Cortright, Chairman. Transmits the
final report per the establishing memoranda of April 17 and April 21, 1970; the Board has
recessed subject to call, planning to reconvene after remaining special tests.

Preface, verbatim: *"The Apollo 13 accident, which aborted man's third mission to explore
the surface of the Moon, is a harsh reminder of the immense difficulty of this undertaking.
The total Apollo system of ground complexes, launch vehicle, and spacecraft constitutes the
most ambitious and demanding engineering development ever undertaken by man. For these
missions to succeed, both men and equipment must perform to near perfection."* And:
*"Perfection is not only difficult to achieve, but difficult to maintain. The imperfection
in Apollo 13 constituted a near disaster, averted only by outstanding performance on the
part of the crew and the ground control team which supported them."*

Charter: review the circumstances, establish probable causes, assess the effectiveness of
flight recovery actions, report findings, develop recommendations. Five chapters plus
Appendices A–H. Cites NMI 8621.1 (Mission Failure Investigation Policy and Procedures) and
NMI 1156.14 (Aerospace Safety Advisory Panel). Source: CORTRIGHT.

### D2 — `/Board/ch5_what_happened.txt`
*Findings, Determinations, and Recommendations — Part 1, Introduction* — June 15, 1970.

Verbatim: *"All indications are that an electrically initiated fire in oxygen tank no. 2 in
the service module (SM) was the cause of the accident."* … *"It was found that the accident
was not the result of a chance malfunction in a statistical sense, but rather resulted from
an unusual combination of mistakes, coupled with a somewhat deficient and unforgiving
design. In brief, this is what happened: (a) After assembly and acceptance testing, the
oxygen tank no. 2 which flew on Apollo 13 was shipped from Beech Aircraft Corporation to
North American Rockwell (NR) in apparently satisfactory condition. (b) It is now known,
however, that the tank contained two protective thermostatic switches on the heater
assembly, which were inadequate and would subsequently fail during ground test operations
at Kennedy Space Center (KSC). (c) In addition, it is probable that the tank contained a
loosely-fitting fill tube assembly. This assembly was probably displaced during subsequent
handling, which included an incident at the prime contractor's plant in which the tank was
jarred. (d) In itself, the displaced fill tube assembly was not particularly serious, but
it led to the use of improvised detanking procedures at KSC which almost certainly set the
stage for the accident."*

The Introduction closes with the Board's own caveat that *"some details of the accident are
not completely clear"* and that further MSC tests could yield conclusions differing in
detail. Source: CORTRIGHT Ch. 5.

### D3 — `/Board/ch5_thermostatic_switch.txt`
*Findings — the 65 V dc / 28 V dc switch incompatibility* — June 15, 1970.

Verbatim: *"A number of factors contributed to the presence of inadequate thermostatic
switches in the heater assembly. The original 1962 specifications from NR to Beech Aircraft
Corporation for the tank and heater assembly specified the use of 28 V dc power, which is
used in the spacecraft. In 1965, NR issued a revised specification which stated that the
heaters should use a 65 V dc power supply for tank pressurization; this was the power supply
used at KSC to reduce pressurization time. Beech ordered switches for the Block II tanks but
did not change the switch specifications to be compatible with 65 V dc."*

*"The thermostatic switch discrepancy was not detected by NASA, NR, or Beech in their review
of documentation, nor did tests identify the incompatibility of the switches with the ground
support equipment (GSE) at KSC, since neither qualification nor acceptance testing required
switch cycling under load as should have been done. It was a serious oversight in which all
parties shared."*

*"The thermostatic switches could accommodate the 65 V dc during tank pressurization because
they normally remained cool and closed. However, they could not open without damage with
65 V dc power applied. They were never required to do so until the special detanking. During
this procedure, as the switches started to open when they reached their upper temperature
limit, they were welded permanently closed by the resulting arc and were rendered
inoperative as protective thermostats."*

*"As shown by subsequent tests, failure of the thermostatic switches probably permitted the
temperature of the heater tube assembly to reach about 1000° F in spots during the continuous
8-hour period of heater operation. Such heating has been shown by tests to severely damage
the Teflon insulation on the fan motor wires in the vicinity of the heater assembly. From
that time on, including pad occupancy, the oxygen tank no. 2 was in a hazardous condition
when filled with oxygen and electrically powered."* Source: CORTRIGHT Ch. 5.

### D4 — `/Board/ch5_ignition_and_panel_loss.txt`
*Findings — ignition in flight and consequential damage* — June 15, 1970.

Verbatim: *"It was not until nearly 56 hours into the mission, however, that the fan motor
wiring, possibly moved by the fan stirring, short circuited and ignited its insulation by
means of an electric arc. The resulting combustion in the oxygen tank probably overheated
and failed the wiring conduit where it enters the tank, and possibly a portion of the tank
itself. The rapid expulsion of high-pressure oxygen which followed, possibly augmented by
combustion of insulation in the space surrounding the tank, blew off the outer panel to
bay 4 of the SM, caused a leak in the high-pressure system of oxygen tank no. 1, damaged the
high-gain antenna, caused other miscellaneous damage, and aborted the mission. The accident
is judged to have been nearly catastrophic. Only outstanding performance on the part of the
crew, Mission Control, and other members of the team which supported the operations
successfully returned the crew to Earth."*

Formal findings in the same chapter record that oxygen tank no. 2 contained Teflon and
aluminum, which burn in supercritical oxygen; contained potential ignition sources —
electrical wiring, unsealed electric motors, and rotating aluminum fans; and that the tank
heaters were *not* powered at the moment of the accident. Source: CORTRIGHT Ch. 5.

### D5 — `/Board/ch4_tank_history_shelf_drop.txt`
*Review and Analysis — Part 2, Oxygen Tank No. 2 History* — June 15, 1970.

The shelf carrying oxygen tanks 1 and 2 was completed at North American Rockwell and
installed in SM 106 (Apollo 10) on June 4, 1968. Because of electromagnetic interference
from vac-ion pumps, the shelf was ordered replaced.

Verbatim: *"On October 21, 1968, the oxygen shelf was removed from SM 106 for the required
modification and installation in a later spacecraft."* … *"One shelf bolt was mistakenly
left in place during the initial attempt to remove the shelf; and as a consequence, after
the front of the shelf was raised about 2 inches, the fixture broke, allowing the shelf to
drop back into place. Photographs of the underside of the fuel cell shelf in SM 106 indicate
that the closeout cap on the dome of oxygen tank no. 2 may have struck the underside of that
shelf during this incident. At the time, however, it was believed that the oxygen shelf had
simply dropped back into place and an analysis was performed to calculate the forces
resulting from a drop of 2 inches. It now seems likely that the shelf was first accelerated
upward and then dropped."*

Post-drop retests — proof-pressure, leak, and functional tests of transducers, switches,
thermal switches and vac-ion pumps — were passed, but no cryogenic testing was done, and the
Board notes these tests *"would not disclose fill line leakage within oxygen tank no. 2."*
Conclusion: *"The probability of tank damage from this incident, therefore, is now considered
to be rather low, although it is possible that a loosely fitting fill tube could have been
displaced by the event."* The shelf was installed in SM 109 — Apollo 13's service module —
on November 22, 1968; SM 109 shipped to KSC in June 1969.

Discrepancy worth surfacing in the case: the Board says the *shelf assembly* was raised and
dropped about 2 inches and only that the tank's closeout cap *may* have struck the fuel cell
shelf. Popular accounts say the tank itself was dropped. AFJ renders the distance as "about
5 centimetres" — the same figure. Source: CORTRIGHT Ch. 4; CASE-STUDY.

### D6 — `/Board/ch4_detanking_march_1970.txt`
*Review and Analysis — Testing at KSC* — June 15, 1970.

Verbatim: *"The countdown demonstration test (CDDT) began on March 16, 1970. Up to this
point, nothing unusual about oxygen tank no. 2 had been noted during the extensive testing at
KSC."* Tanks were evacuated, loaded and pressurized to 331 psi without abnormality. *"At the
time during CDDT when the oxygen tanks are normally partially emptied to about 50 percent of
capacity, oxygen tank no. 1 behaved normally, but oxygen tank no. 2 only went down to 92
percent of its capacity."*

An Interim Discrepancy Report was written and transferred to a Ground Support Equipment
Discrepancy Report because a GSE filter was suspected. *"On Friday, March 27, 1970, detanking
operations were resumed… As a first step, oxygen tank no. 2, which had self-pressurized to
178 psi and was about 83 percent full, was vented through its fill line. The quantity
decreased to 65 percent."*

KSC, MSC, NR and Beech personnel then hypothesized a leak between the fill line and the
quantity probe caused by a loose fit in the sleeves and tube. Because *"replacement of the
oxygen shelf… would have been difficult and would have taken at least 45 hours"* and carried
risk of damaging other SM elements, the decision was made instead to test whether the tank
could be filled — on March 30, 1970, twelve days before the April 11 launch. *"On the filling
test, oxygen tanks no. 1 and no. 2 were filled with LOX to about 20 percent of capacity on
March 30 with no difficulty. Tank no. 1 emptied in the normal manner, but emptying oxygen
tank no. 2 again required pressure cycling with the heaters turned on."* Source: CORTRIGHT Ch. 4.

### D7 — `/Board/ch4_launch_decision.txt`
*Review and Analysis — the flight-readiness deliberations* — June 15, 1970.

Verbatim: *"As the launch date approached, the oxygen tank no. 2 detanking problem was
considered by the Apollo organization. At this point, the 'shelf drop' incident on October 21,
1968, at NR was not considered and it was felt that the apparently normal detanking which had
occurred in 1967 at Beech was not pertinent because it was believed that a different procedure
was used by Beech. In fact, however, the last portion of the procedure was quite similar,
although a slightly lower GOX pressure was utilized. Throughout these considerations, which
involved technical and management personnel of KSC, MSC, NR, Beech, and NASA Headquarters,
emphasis was directed toward the possibility and consequences of a loose fill tube; very
little attention was paid to the extended operation of heaters and fans except to note that
they apparently operated during and after the detanking sequences. Many of the principals in
the discussions were not aware of the extended heater operations. Those that did know the
details of the procedure did not consider the possibility of damage due to excessive heat
within the tank, and therefore did not advise management officials of any possible
consequences of the unusually long heater operations."*

The chapter adds that in post-accident MSC tests the switches *"failed to open when the
heaters were powered from a 65 V dc supply similar to the power used at KSC during the
detanking sequence,"* and that *"Qualification and test procedures for the heater assemblies
and switches do not at any time test the capability of the switches to open while under full
current conditions."* Source: CORTRIGHT Ch. 4.

### D8 — `/Board/ch5_recommendations.txt`
*Findings, Determinations, and Recommendations — Part 4, Recommendations* — June 15, 1970.

Nine recommendations. Verbatim, the first four: *"1. The cryogenic oxygen storage system in
the service module should be modified to: a. Remove from contact with the oxygen all wiring,
and the unsealed motors, which can potentially short circuit and ignite adjacent materials;
or otherwise insure against a catastrophic electrically induced fire in the tank. b. Minimize
the use of Teflon, aluminum, and other relatively combustible materials in the presence of
the oxygen and potential ignition sources. 2. The modified cryogenic oxygen storage system
should be subjected to a rigorous requalification program, including careful attention to
potential operational problems. 3. The warning systems on board the Apollo spacecraft and in
the Mission Control Center should be carefully reviewed and modified where appropriate with
specific attention to the following: a. Increasing the differential between master alarm trip
levels and expected normal operating ranges to avoid unnecessary alarms. b. Changing the
caution and warning system logic to prevent an out-of-limits alarm from blocking another
alarm when a second quantity in the same subsystem goes out of limits. c. Establishing a
second level of limit sensing in Mission Control on critical quantities with a visual or
audible alarm which cannot be easily overlooked. d. Providing independent talkback indicators
for each of the six fuel cell reactant valves plus a master alarm when any valve closes.
4. Consumables and emergency equipment in the LM and the CM should be reviewed to determine
whether steps should be taken to enhance their potential for use in a 'lifeboat' mode."*

Recommendations 6–9 add that *"Whenever significant anomalies occur in critical subsystems
during final preparation for launch, standard procedures should require a presentation of all
prior anomalies on that particular piece of equipment, including those which have previously
been corrected or explained"*; that NASA should reexamine all systems containing high-density
oxygen or other strong oxidizers; that it should conduct further research on materials
compatibility, ignition and combustion in strong oxidizers at various g levels; and that MSC
should reassess subsystem engineering control down to the subcontractor and vendor level.
Source: CORTRIGHT Ch. 5.

### D9 — `/Board/ch4_recovery_masked_alarms.txt`
*Review and Analysis — Part 5, Apollo 13 Recovery* — June 15, 1970.

Verbatim: *"The 1.8-second loss of telemetered data was accompanied by the switching of the
CSM high-gain antenna mounted on the SM adjacent to bay 4 from narrow beam width to wide beam
width. The high-gain antenna does this automatically 200 milliseconds after its directional
lock on the ground signal has been lost."*

*"The failure of oxygen tank no. 2 and consequent removal of the bay 4 panel produced a shock
which closed valves in the oxygen supply lines to fuel cells 1 and 3. These fuel cells ceased
to provide power in about 3 minutes, when the supply of oxygen between the closed valves and
the cells was depleted."*

*"The crew was not alerted to closure of the oxygen feed valves to fuel cells 1 and 3 because
the valve position indicators in the CM were arranged to give warning only if both the oxygen
and hydrogen valves closed. The hydrogen valves remained open. The crew had not been alerted
to the oxygen tank no. 2 pressure rise or to its subsequent drop because a hydrogen tank low
pressure warning had blocked the cryogenic subsystem portion of the caution and warning
system several minutes before the accident."*

Crew positions at the moment of the bang: the Commander in the lower equipment bay stowing
the television camera, the Lunar Module Pilot in the tunnel returning to the CSM, the Command
Module Pilot in the left-hand couch. Source: CORTRIGHT Ch. 4 Pt. 5.

### D10 — `/Board/ch4_table_4_III_co2.csv`
*Table 4-III, Cabin Atmosphere Carbon Dioxide Removal by Lithium Hydroxide, and figure 4-16*
— June 15, 1970.

Verbatim values: *Required, 85 hours; Available in LM, 53 hours; Available in CM, 182 hours.*
Accompanying text: *"…allowing use of the CM LiOH cannisters in the LM cabin atmosphere
cleaning system (see fig. 4-16). At splashdown, many hours of each consumable remained
available."* Figure 4-16 caption: *"Lithium hydroxide canister modification."*

The trajectory figure in the same chapter labels the decision points: *"Start of problem
(55:55) — MCC to free-return (61:30) — PC + 2 hr for Pacific landing (79:28) — MCC-5 for
entry corridor (105:18) — LM jettison (141:30)."*

This table is the arithmetic core of the mailbox story: the LM's own canisters covered 53 of
the 85 hours needed, and the 32-hour shortfall could only be closed by adapting the CM's
square canisters. Source: CORTRIGHT Ch. 4.

### D11 — `/Mission/msc02680_consumables.txt`
*Apollo 13 Mission Report, MSC-02680, Section 7.0 Mission Consumables* — Mission Evaluation
Team, NASA MSC; approved by James A. McDivitt, Colonel USAF, Manager, Apollo Spacecraft
Program — September 1970 (Section 7 as revised by Change 1, May 1970).

§7.1.3 verbatim: *"Cryogenic oxygen and hydrogen usages were nominal until the time of the
incident. The pressure decay in oxygen tank 2 was essentially instantaneous, while oxygen
tank 1 was not depleted until approximately 2 hours following the incident."*

Table values, pounds. Available at lift-off: hydrogen tank 1, 29.0; tank 2, 29.2; total 58.2;
oxygen tank 1, 326.8; tank 2, 327.2; total 654.0. Consumed: hydrogen 7.1 and 6.9, total 14.0;
oxygen 71.8 and 85.2, total 157.0. Remaining at the incident: hydrogen 21.9 and 22.3, total
44.2; oxygen 255.0 and 242.0, total 497.0.

§7.1.4: *"Following the incident and loss of pressure in tank 1, the total oxygen supply
consisted of 3.77 pounds in the surge tank and 1 pound in each of the three repressurization
bottles."* §7.1.5: *"At the time of the incident, about 38 pounds of water was available in
the potable water tank. During the abort phase, the crew used juice bags to transfer
approximately 14 pounds of water from the command module to the lunar module for drinking and
food preparation."* §7.1.6: *"The command module was completely powered down at 58 hours 40
minutes, at which time 99 ampere-hours remained in the three entry batteries. By charging the
batteries with lunar module power, available battery capacity was increased to 118
ampere-hours… At landing, 29 ampere-hours of energy remained."* §7.2: *"The estimated total
energy transferred to the command module was approximately 129 ampere hours. A total of 410
ampere hours remained in the lunar module batteries at the time of undocking."*
Source: MSC-02680.

### D12 — `/Mission/msc02680_sequence_of_events.csv`
*MSC-02680, Table 3-1 Sequence of Events and Section 3.0 Mission Description* — September 1970.

Range zero 19:13:00.00 G.m.t., April 11, 1970; lift-off 19:13:00.65 G.m.t. Table 3-1, GET:
S-IC outboard cutoff 00:02:44; S-II ignition 00:02:45; launch escape tower jettison 00:03:21;
S-II cutoff 00:09:53; S-IVB ignition 00:09:54; S-IVB cutoff 00:12:30; translunar injection
02:35:46; S-IVB/CSM separation 03:06:39; docking 03:19:09; spacecraft ejection 04:01:01;
S-IVB separation maneuver 04:18:01; first midcourse correction (service propulsion) 30:40:50;
**cryogenic oxygen tank incident 55:54:53**; second midcourse correction (descent propulsion)
61:29:43; S-IVB lunar impact 77:56:40; transearth injection (descent propulsion) 79:27:39;
third midcourse correction (descent propulsion) 105:18:28; fourth midcourse correction (LM
reaction control) 137:39:52; CM/SM separation 138:01:48; undocking 141:30:00; entry interface
142:40:46; landing 142:54:41.

The narrative adds that had the free-return trajectory been flown without the PC+2 burn,
*"the resultant landing at earth would have been at 152 hours in the Indian Ocean, with lunar
module systems intended to support the crew for the remaining 90 hours,"* and that this was
rejected *"because consumables were extremely marginal in this emergency mode and because
only minimal recovery support existed at this earth landing location."* Source: MSC-02680.

### D13 — `/Mission/msc02680_summary_landing.txt`
*MSC-02680, Section 1.0 Summary and Section 10.3 Recovery Operations* — September 1970.

The mission was aborted *"because of an abrupt loss of service module cryogenic oxygen
associated with a fire in one of the two tanks at approximately 56 hours."* Tank 2 pressure
*"began to rise at an abnormally high rate and, within about 100 seconds, the tank abruptly
lost pressure. The pressure in tank 1 also dropped but at a rate sufficient to maintain fuel
cell 2 in operation for approximately 2 more hours."*

*"The crew powered up the lunar module, and the first maneuver following the incident was made
with the descent propulsion system to place the spacecraft once again on a free-return
trajectory. A second maneuver performed with the descent engine 2 hours after passing
pericynthion reduced the transearth transit time and moved the earth landing point from the
Indian Ocean to the South Pacific."*

*"Landing occurred at 142:54:41 within sight of the recovery ship. The landing point was
reported as 21 degrees 38 minutes 24 seconds south latitude and 165 degrees 21 minutes 42
seconds west longitude. The crew were retrieved and aboard the recovery ship within 45
minutes after landing."*

The Summary records the crew change: John L. Swigert, Jr. replaced the prime crew command
module pilot two days before launch after exposure to rubella. Section 3.0 notes the LM,
including its radioisotope thermoelectric fuel capsule, *"entered the atmosphere and impacted
in the open sea between Samoa and New Zealand at 25.5 degrees south latitude and 176 degrees
west longitude, with surveillance aircraft in the area."* Source: MSC-02680.

### D14 — `/Board/tank_failure_case_study.txt`
*A Case Study of the Failure on Apollo 13 Based on TMX-65270* — Brenda Lindley Anderson, QD34,
NASA (NTRS 20110015690), undated.

Manufacturing chain: inner shell by Airite Products Division of Electrada Corporation under
subcontract to Beech Aircraft Corporation; quantity probe by Simmonds Precision Products, Inc.;
fans and fan motors by Globe Industries, Inc. Manufacture of oxygen tank 2 began in 1966; it
was the eighth Block II tank built by Beech, which had previously produced 28 Block I tanks.

Minor manufacturing flaws found and reworked: weld porosity on the lower outer shell;
incorrect welding wire on a vac-ion pump weld; an upper fan motor drawing excessive current
and making unwarranted noise, replaced along with the whole heater tube assembly. Acceptance
testing established a heat-leak rate above specification even after rework; a formal waiver
was accepted to fly the tank "as is." Oversized bolt holes in the dome electrical plug support
and an oversized rivet hole above the lower fan were also accepted. The tank shipped to North
American Rockwell on May 3, 1967.

Serial numbers: 10024XTA0009 (oxygen tank 1), 10024XTA0008 (oxygen tank 2), assembled onto
oxygen shelf serial number 0632AAG3277, completed at NR on March 11, 1968.

Design parameters: 320 lb of supercritical oxygen at 865–935 psia; initial fill of liquid
oxygen at −297 °F; operating range −340 to 80 °F; burst pressure 2200 psia at −150 °F; relief
valve releases at 1000 psi; dome rupture disk at 75 psi.

March 1970 detanking: heaters connected to the 65 V dc GSE supply; fans turned on after 1½
hours; tank at 35 percent after six hours; then five pressure cycles to 300 psi emptied it;
heaters and fans powered off after eight hours of operation. Source: CASE-STUDY.

## Photographs

All URLs below were verified with HTTP HEAD requests and returned 200 with the byte sizes
shown. Captions are quoted from the NASA Image and Video Library API (images-api.nasa.gov),
the authoritative NASA caption source, except where flagged.

Camera note: the in-flight AS13-xx frames are Hasselblad 70 mm; the magazine number is the
middle field of the ID. AFJ records that Apollo 13 was the only Apollo flight on which
interior shots were taken with a Hasselblad carrying a Réseau plate — that camera would have
been used for EVA photography had they landed. Film emulsion and lens focal length per frame
could not be verified from a primary source and are **not** asserted in the corpus.

### P1 — AS13-59-8500 — *rewards close inspection*
NASA title: "View of damaged Apollo 13 Service Module from the Lunar/Command Modules."
Created 1970-04-17, JSC. Magazine 59, frame 8500.

Caption: *"This view of the damaged Apollo 13 Service Module (SM) was photographed from the
Lunar Module/Command Module following SM jettisoning. As seen here, an entire panel on the SM
was blown away by the apparent explosion of oxygen tank number two located in Sector 4 of the
SM. Two of the three fuel cells are visible just forward (above) the heavily damaged area.
Three fuel cells, two oxygen tanks, and two hydrogen tanks are located in Sector 4. The
damaged area is located above the S-band high gain antenna. Nearest the camera is the Service
Propulsion System (SPS) engine and nozzle."*

Visible on close inspection: the missing bay 4 outer panel from near the base to the engine
fairing; jagged torn skin and dangling insulation where the cryogenic shelf sat; the empty
volume where oxygen tank 2 was; two fuel cells still in position above the cavity; the released
CM/SM umbilical at the top; the high-gain antenna below the damage; the SPS nozzle in the
foreground with the dark streak the crew debated on the loop.

https://images-assets.nasa.gov/image/as13-59-8500/as13-59-8500~orig.jpg (785,310 bytes)
Mirror: https://history.nasa.gov/alsj/a13/AS13-59-8500HR.jpg

### P2 — AS13-62-8929 — *rewards close inspection*
NASA title: "Interior view of 'mail box' for purging carbon dioxide from Lunar Module."
Created 1970-04-14, JSC. Magazine 62, frame 8929.

Caption: *"AS13-62-8929 (11-17 April 1970) --- Interior view of the Apollo 13 Lunar Module (LM)
showing the 'mail box,' a jury-rigged arrangement which the Apollo 13 astronauts built to use
the Command Module (CM) lithium hydroxide canisters to purge carbon dioxide from the LM.
Lithium hydroxide is used to scrub CO2 from the spacecraft's atmosphere. Since there was a
limited amount of lithium hydroxide in the LM, this arrangement was rigged up to utilize the
canisters from the CM. The 'mail box' was designed and tested on the ground at the Manned
Spacecraft Center (MSC) before it was suggested to the problem-plagued Apollo 13 crew men."*

Visible on close inspection: the white LM environmental control system unit filling most of the
frame; the square CM canister wrapped in an LCG plastic bag; the arch of cut cue-card cardboard
holding the bag off the inlet; gray tape sealing the bag to the suit hose; the LM's own
cylindrical LiOH receptacles at lower left, unused.

https://images-assets.nasa.gov/image/as13-62-8929/as13-62-8929~orig.jpg (5,080,387 bytes)

### P3 — AS13-62-9004 — *rewards close inspection; caption source flagged*
Magazine 62, frame 9004. **No record in the NASA Image and Video Library API** (zero hits), so
no official NASA-API caption or date exists to quote. The Apollo Lunar Surface Journal image
library gives this caption, itself marked "NASA caption": *"Interior view of the Apollo 13 Lunar
Module (LM) during the trouble-plagued journey back to Earth. This photograph shows some of the
temporary hose connections and apparatus which were necessary when the three astronauts moved
from the Command Module to use the LM as a 'lifeboat'. Astronaut John L. Swigert Jr., command
module pilot, is on the right. On the left, an astronaut holds in his right hand the feed water
bag from the Portable Life Support System (PLSS). It is connected to a hose (in center) from the
Lunar Topographic (Hycon) camera. In the background is the 'mail box'…"*

UNVERIFIED: the identification of Swigert and the PLSS water bag is ALSJ-sourced, not
NASA-API-verified.

https://history.nasa.gov/alsj/a13/AS13-62-9004HR.jpg
https://apollojournals.org/alsj/a13/AS13-62-9004HR.jpg (682,227 bytes)

### P4 — S70-35013
Created 1970-04-15, JSC.

Caption: *"S70-35013 (15 April 1970) --- Prototype of the 'mail box' constructed at the Manned
Spacecraft Center (MSC) to remove carbon dioxide from the Apollo 13 Command Module (CM) is
displayed in the Mission Control Center (MCC). The 'mail box' was constructed when it became
apparent CO2 was prevalent in the CM and the spacecraft's lithium hydroxide system was not
removing it sufficiently. A space suit exhaust hose is connected to a lithium hydroxide canister
to purge the cabin air. There are 16 such canisters in the CM and each will last approximately
12 hours. Looking at the 'mail box' are (from the left): Milton L. Windler, shift 1 flight
director; Dr. Donald K. (Deke) Slayton, director of flight crew operations, MSC; Howard W.
Tindall, deputy director, flight operations, MSC; Sigurd A. Sjoberg, director, flight operations,
MSC; Dr. Christopher C. Kraft, deputy director, MSC; and Dr. Robert R. Gilruth, director, MSC."*

**Caption error to surface in the case:** this NASA caption says the device was for the *Command
Module*. Every other source, including the flight transcript, makes clear the adapter let CM
canisters be used in the *Lunar Module*. The 1970 press caption is simply wrong on that point.

https://images-assets.nasa.gov/image/S70-35013/S70-35013~orig.jpg (1,644,319 bytes)
URL is case-sensitive: lowercase `s70-35013` returns 403.

### P5 — S70-41984
NASA title: "TESTS - APOLLO 13." Created 1970-06-10, JSC.

Caption: *"S70-41984 (June 1970) --- Full-scale propagation test at the NASA Manned Spacecraft
Center (MSC) of fire inside an Apollo Service Module (SM) oxygen tank. The photograph from a
motion picture sequence taken from outside the vessel shows failure of tank conduit with abrupt
loss of oxygen pressure. The test was part of the Apollo 13 post flight investigation of the
Service Module explosion incident. Photo credit: NASA"*

The forensic reconstruction image — the physical evidence behind the Cortright ignition finding.

https://images-assets.nasa.gov/image/S70-41984/S70-41984~orig.jpg (2,050,385 bytes)
Note: AFJ cites a related test image as S70-41146; that ID returns zero hits and its
`~orig.jpg` URL 403s. Use S70-41984.

### P6 — AS13-59-8562
NASA library title is inherited and misleading ("View of damaged Apollo 13 Service Module…") —
the subject is the LM.

Caption: *"AS13-59-8562 (17 April 1970) --- This view of the Apollo 13 Lunar Module (LM) was
photographed from the Command Module (CM) just after the LM had been jettisoned. The jettisoning
occurred a few minutes before 11 a.m. (CST), April 17, 1970, just over an hour prior to
splashdown of the CM in the south Pacific Ocean."*

Visible: the top of *Aquarius* after separation; per the ALSJ caption the plus-Z strut with the
ladder attached is at the bottom of the frame.

https://images-assets.nasa.gov/image/AS13-59-8562/AS13-59-8562~orig.jpg (918,924 bytes)
Uppercase required.

### P7 — S70-35638
Caption: *"S70-35638 (17 April 1970) --- A perilous space mission comes to a smooth ending with
the safe splashdown of the Apollo 13 Command Module (CM) in the South Pacific, only four miles
from the prime recovery ship. The spacecraft with astronauts James A. Lovell Jr., John L.
Swigert Jr., and Fred W. Haise Jr. aboard, splashed down at 12:07:44 p.m. (CST) April 17, 1970,
to conclude safely the problem-plagued flight. The crewmen were transported by helicopter from
the immediate recovery area to the USS Iwo Jima, prime recovery vessel."*

**Three-second discrepancy to surface in the case:** this press caption says 12:07:44 p.m. CST,
whereas MSC-02680 gives landing at GET 142:54:41 = 18:07:41 UTC = 12:07:41 p.m. CST. The corpus
prefers the Mission Report.

https://images-assets.nasa.gov/image/S70-35638/S70-35638~orig.jpg (1,768,072 bytes)

### P8 — S70-35145
NASA title: "Mission Control Center (MCC) View - Apollo 13 Splashdown - MSC." Created 1970-04-17.

Caption: *"S70-35145 (17 April 1970) --- Overall view of Mission Operations Control Room in
Mission Control Center at the Manned Spacecraft Center (MSC) during the ceremonies aboard the
USS Iwo Jima… In the foreground, Glynn S. Lunney (extreme left) and Eugene F. Kranz (smoking a
cigar), two Apollo 13 flight directors, view the activity from their consoles."*

https://images-assets.nasa.gov/image/S70-35145/S70-35145~orig.jpg (1,953,949 bytes)

### P9 — AS13-59-8484
Magazine 59, frame 8484. ALSJ caption: *"Jim Lovell in the LM, preparing it for jettison."* A
Journal contributor notes the DSKY visible to the right of Lovell's elbow shows the computer in
P00, idling — a small verifiable detail for close inspection. Caption is ALSJ-sourced; no
NASA-API record checked.

https://apollojournals.org/alsj/a13/AS13-59-8484HR.jpg (1,150,458 bytes)
https://images-assets.nasa.gov/image/as13-59-8484/as13-59-8484~orig.jpg (2,383,650 bytes)

### Avoid
`S70-34747` and `s70-35652` behave inconsistently on the assets host (34747 403s at
`~orig.jpg`; 35652 works only in lowercase). For a launch frame use **S70-34852** ("LAUNCH -
APOLLO 13 - LUNAR LANDING MISSION - KSC," 1970-04-11):
https://images-assets.nasa.gov/image/S70-34852/S70-34852~orig.jpg (14,384,331 bytes)

## People and bodies

Sources: MSC-02680 §1.0; CORTRIGHT Ch. 1–2; NASA Image Library captions; AFJ.

**Flight crew**
- James A. Lovell, Jr. — Commander (CDR). In the lower equipment bay stowing the TV camera when
  the tank failed; spoke the actual line "Houston, we've had a problem."
- John L. (Jack) Swigert, Jr. — Command Module Pilot (CMP). Moved up from the backup crew two
  days before launch after prime CMP Thomas K. Mattingly II was exposed to rubella and found
  susceptible; had developed CM emergency procedures as a support astronaut; built the mailbox.
- Fred W. Haise, Jr. — Lunar Module Pilot (LMP). In the tunnel returning to the CSM at the
  moment of the accident; made the first electrical-systems reports from the main display console.
- Thomas K. Mattingly II — originally assigned CMP, removed pre-launch for rubella exposure;
  never contracted the disease.

Callsigns: CSM *Odyssey*, LM *Aquarius*.

**Flight directors**
- Eugene F. (Gene) Kranz — on console at the moment of the accident; gave the "let's not make it
  any worse by guessing" direction and the first statement of the LM-lifeboat option.
- Glynn S. Lunney — took the handover from Kranz; directed the rapid LM activation and CM
  powerdown race against the failing fuel cell.
- Gerald D. (Gerry) Griffin — flight director on shift during the return.
- Milton L. Windler — identified in NASA caption S70-35013 as "shift 1 flight director"; AFJ
  records his Maroon team handing over to Lunney's Black team on the morning of April 15.

Team colors: Lunney's Black and Windler's Maroon are confirmed in AFJ. UNVERIFIED: Kranz's White
and Griffin's Gold are widely documented but not primary-source-verified in this pass — the
corpus does not display team colors.

**CAPCOMs heard in the transcript**
Jack Lousma (on console at the accident and through the free-return burn), Vance Brand (PC+2
burn), Joe Kerwin (mailbox construction, reentry preparation, splashdown). Also on the loop:
Deke Slayton (Director of Flight Crew Operations, medical-kit advice at 137:47), Tom Stafford
(Chief of the Astronaut Office, 091:21).

**Other Mission Control positions named in the transcript**
Sy Liebergot (EECOM at the accident), Clint Burton (EECOM on Lunney's shift, gave the "18
minutes" call), Bill Merritt (TELMU), Buck Willoughby (GNC), Raymond F. Teague (GUIDO), Bill
Fenner (GUIDO), Gary Scott / Ed Glines (INCO).

UNVERIFIED: Ed Smylie of the MSC Crew Systems Division is credited with devising the CO2
adapter, but that attribution rests on Lovell and Kluger's *Lost Moon* as cited by ALSJ, not on
a NASA primary document. The corpus carries the caveat with the claim.

**Contractors**
- Beech Aircraft Corporation — built the cryogenic oxygen tank and heater assembly under
  subcontract to North American Rockwell; ordered the Block II thermostatic switches without
  updating the specification from 28 V dc to 65 V dc.
- North American Rockwell (NR) — prime contractor for the command and service module; issued the
  original 1962 tank specification and the 1965 revision to 65 V dc; site of the October 21,
  1968 oxygen shelf drop.
- Grumman Aircraft Engineering Corporation — prime contractor for the lunar module *Aquarius*,
  which sustained the crew as a lifeboat far beyond its two-man/two-day design case.
- Airite Products Division of Electrada Corporation — inner tank shell.
- Simmonds Precision Products, Inc. — quantity probe.
- Globe Industries, Inc. — fans and fan motors.

**Apollo 13 Review Board** (established by memorandum of April 17, 1970; membership per the
memorandum of April 21, 1970)
- Edgar M. Cortright, Chairman — Director, Langley Research Center.
- Robert F. Allnutt — Assistant to the Administrator, NASA Headquarters.
- Neil A. Armstrong — Astronaut, MSC; also Panel Monitor for the Mission Events Panel.
- Dr. John F. Clark — Director, Goddard Space Flight Center.
- Brig. Gen. Walter R. Hedrick, Jr. — Director of Space, DCS/R&D, Headquarters USAF.
- Vincent L. Johnson — Deputy Associate Administrator–Engineering, Office of Space Science and
  Applications.
- Milton Klein — Manager, AEC-NASA Space Nuclear Propulsion Office.
- Dr. Hans M. Mark — Director, Ames Research Center.
- George Malley — Counsel; Chief Counsel, Langley Research Center.
- Charles W. Mathews — OMSF Technical Support; Deputy Associate Administrator, Office of Manned
  Space Flight.
- William A. Anders — Observer; Executive Secretary, National Aeronautics and Space Council.

**Board panel chairmen**
- Panel 1, Mission Events: F. B. Smith, Assistant Administrator for University Affairs, NASA HQ.
  Members included Dr. Tom B. Ballard (Langley), M. P. Frank (Flight Director, Flight Control
  Division, MSC), John J. Williams (Director, Spacecraft Operations, KSC).
- Panel 2, Manufacturing and Test: Harris M. Schurmeier, Deputy Assistant Laboratory Director for
  Flight Projects, Jet Propulsion Laboratory.
- Panel 3, Design: Dr. Seymour C. Himmel, Assistant Director for Rockets and Vehicles, Lewis
  Research Center. Members included William F. Brown, Jr. (Lewis), R. N. Lindley (NASA HQ),
  Dr. William R. Lucas (Marshall), J. F. Saunders, Jr. (OMSF).
- Panel 4, Project Management: chairman could not be recovered from the OCR text. Left blank
  rather than guessed.

The establishing memoranda directed Dale D. Myers, Associate Administrator for Manned Space
Flight, to develop corrective recommendations for Apollo 14 within ten days of the Board's final
report, and asked Dr. Charles D. Harrington, Chairman of the Aerospace Safety Advisory Panel, to
review the Board's procedures and findings.

## The investigative questions

Each requires joining at least one log timestamp to at least one document finding — the human
reads the document, the agent searches the logs, or the reverse. Answers included for scoring.

**Q1. What caused the oxygen tank 2 failure at GET 55:54:53, and why did the protective
thermostats not prevent it?**
Log rows 11 and 15 (fans commanded on at 55:53:20; tank fails at 55:54:53.182) joined to D3.
Damaged Teflon insulation on the fan motor wires short-circuited and ignited in supercritical
oxygen. The insulation had been baked during the March 1970 detanking because the heater
thermostatic switches — specified in 1962 for 28 V dc and never re-specified after NR's 1965
change to a 65 V dc ground supply — welded shut instead of opening, letting the heater tube reach
about 1000 °F in spots over eight hours of continuous operation.

**Q2. When did the crew first learn the failure was physical rather than electrical, and how long
after the failure was that?**
Log rows 15 and 22. At GET 056:09:07 (Apr 14 03:22:07 UTC) Lovell reported venting out the hatch
— 14 minutes 14 seconds after the tank failed at 055:54:53. Corroborating document D9 explains
why there was no earlier cryogenic warning: a hydrogen low-pressure alarm at 55:52:31 had blocked
the cryogenic portion of the caution and warning system.

**Q3. Why was the free-return burn at GET 61:29:43 not sufficient, and what did the PC+2 burn at
GET 79:27:39 change?**
Log rows 25 and 29 joined to D12. The free-return trajectory alone would have landed at about 152
hours GET in the Indian Ocean, leaving the LM to support three men for roughly 90 more hours with
extremely marginal consumables and only minimal recovery support at that landing point. The PC+2
burn (ΔV 861.5 ft/s, 4 min 24 s) shortened transearth coast so landing occurred at 142:54:41 in
the South Pacific where the primary recovery force was stationed.

**Q4. How much carbon dioxide removal capacity was short, and when was the shortfall closed?**
D10 Table 4-III (required 85 hours; available in LM 53; available in CM 182 — a 32-hour deficit
in the LM) joined to log rows 31 and 32. Kerwin began reading up the adapter procedure at GET
090:22:50 and the first canister was on the hose by about 091:01; by GET 093:23:29 Haise was
reading ~12.5 mm Hg onboard against Houston's 6.6, and a second pair of canisters was ordered
onto the loop.

**Q5. What ground-handling event in 1968 is implicated in the accident chain, and how confident
was the Review Board about it?**
D5 joined to D6. On October 21, 1968, during removal of the oxygen shelf from SM 106 (Apollo 10)
at North American Rockwell, one shelf bolt was left in place; the lifting fixture broke after the
shelf front had been raised about 2 inches, and the shelf dropped back. The Board judged the
probability of tank damage "rather low" but allowed that a loosely fitting fill tube could have
been displaced — which would explain why the tank could not be detanked normally at KSC in March
1970, which in turn forced the improvised heater procedure. The shelf was installed in SM 109,
Apollo 13's service module, on November 22, 1968. The Board explicitly did *not* claim the drop
caused the accident; it caused the detanking problem that led to it.

**Q6. How much electrical margin remained at splashdown, and what powerdown decision at GET 58:40
made that possible?**
Log row 24 joined to D11. The command module was completely powered down at 58 hours 40 minutes
with 99 ampere-hours in its three entry batteries. Charging from LM power raised available
capacity to 118 A-h, of which 29 A-h remained at landing at GET 142:54:41. Approximately 129 A-h
was transferred from the LM, which still had 410 A-h at undocking (GET 141:30:00).

**Q7 (spans three documents). Who knew about the eight-hour heater run before launch, and what
does the report say they did with that knowledge?**
D6, D7 and D3. The detanking work took place March 27–30, 1970; the flight-readiness discussions
involved KSC, MSC, NR, Beech and NASA Headquarters personnel; emphasis went entirely to the loose
fill tube. Per D7, many principals were unaware of the extended heater operation, and those who
knew the procedure "did not consider the possibility of damage due to excessive heat within the
tank, and therefore did not advise management officials of any possible consequences." Per D3,
the failure to open could have been caught at KSC by observing heater current readings on the
oxygen tank heater control panel. Recommendation 6 in D8 is the direct corrective response.

## Consolidated gaps and cautions

1. **The official air-to-ground transcript PDF is not machine-readable.** The MSC TAG transcript
   at nasa.gov yields only garbled OCR front matter. Every verbatim line in this corpus comes from
   CHRONOLOGY/KRANZ (public domain, marked ★) or AFJ (copyrighted corrected transcript over
   public-domain audio).
2. **Pericynthion time** — no precise GET verified. The Review Board figure label reads "Behind
   moon (77:09)"; pericynthion altitude was tracked at 137 nautical miles (Kerwin, GET 064:39:56).
3. **Maximum distance from Earth** — the often-quoted 400,171 km altitude record could not be
   verified from a NASA primary source. Omitted from the corpus.
4. **S-II center engine cutoff GET** is derived by subtracting 132 s, not quoted.
5. **AS13-62-9004** has no NASA Image Library record; its caption is ALSJ-mediated.
6. **S70-35013's NASA caption misstates** that the mailbox was for the Command Module.
7. **S70-35638's caption gives splashdown as 12:07:44 p.m. CST**, three seconds later than the
   Mission Report's 142:54:41 GET. The corpus prefers the Mission Report.
8. **Ed Smylie's authorship of the mailbox** rests on *Lost Moon*, not a NASA primary document.
9. **Panel 4 (Project Management) chairman** could not be recovered from the OCR.
10. **Flight director team colors** for Kranz and Griffin are not primary-source-verified.

Items 5, 6 and 7 are not defects to be cleaned up. They are the corpus's real
document-versus-document conflicts, and they are what make cross-source evaluation a genuine
task rather than a lookup.
