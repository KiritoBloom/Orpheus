"use client";

/**
 * APOLLO 13 — documents (corpus instance two).
 *
 * Every body below is assembled from primary sources: the Report of the Apollo
 * 13 Review Board (NASA-TM-X-65270, the Cortright Report), the Apollo 13
 * Mission Report (MSC-02680), and the NTRS case study of the tank failure.
 * Quoted passages are verbatim and marked with quotation marks. Connective
 * sentences are descriptive only; nothing is invented, and where a source is
 * uncertain the text says so.
 *
 * See SOURCES.md in this directory for the document-by-document provenance,
 * including the three deliberate document-versus-document conflicts the corpus
 * preserves rather than smooths over.
 */

export const TRANSMITTAL = `REPORT OF APOLLO 13 REVIEW BOARD
LETTER OF TRANSMITTAL

June 15, 1970

Dr. Thomas O. Paine
Administrator
National Aeronautics and Space Administration
Washington, D.C. 20546

Dear Dr. Paine:

The Apollo 13 Review Board hereby submits its final report.

PREFACE

"The Apollo 13 accident, which aborted man's third mission to explore the
surface of the Moon, is a harsh reminder of the immense difficulty of this
undertaking.

The total Apollo system of ground complexes, launch vehicle, and spacecraft
constitutes the most ambitious and demanding engineering development ever
undertaken by man. For these missions to succeed, both men and equipment must
perform to near perfection.

That this system has already resulted in two successful lunar surface
explorations is a tribute to those men and women who conceived, designed, built,
and flew it.

Perfection is not only difficult to achieve, but difficult to maintain. The
imperfection in Apollo 13 constituted a near disaster, averted only by
outstanding performance on the part of the crew and the ground control team
which supported them."

CHARTER

The Board was established by memorandum of the Administrator dated April 17,
1970, with membership extended by memorandum of April 21, 1970, pursuant to NMI
8621.1, Mission Failure Investigation Policy and Procedures. Its charter:

  - review the circumstances surrounding the accident;
  - establish the probable cause or causes;
  - assess the effectiveness of flight recovery actions;
  - report its findings;
  - develop recommendations based on those findings.

This report comprises five chapters and Appendices A through H. The Board has
recessed subject to call, and plans to reconvene upon completion of the
remaining special tests at the Manned Spacecraft Center.

Respectfully,

Edgar M. Cortright
Chairman, Apollo 13 Review Board`;

export const WHAT_HAPPENED = `CHAPTER 5 — FINDINGS, DETERMINATIONS, AND RECOMMENDATIONS
PART 1 — INTRODUCTION

"All indications are that an electrically initiated fire in oxygen tank no. 2 in
the service module (SM) was the cause of the accident."

"It was found that the accident was not the result of a chance malfunction in a
statistical sense, but rather resulted from an unusual combination of mistakes,
coupled with a somewhat deficient and unforgiving design. In brief, this is what
happened:

(a) After assembly and acceptance testing, the oxygen tank no. 2 which flew on
Apollo 13 was shipped from Beech Aircraft Corporation to North American Rockwell
(NR) in apparently satisfactory condition.

(b) It is now known, however, that the tank contained two protective
thermostatic switches on the heater assembly, which were inadequate and would
subsequently fail during ground test operations at Kennedy Space Center (KSC).

(c) In addition, it is probable that the tank contained a loosely-fitting fill
tube assembly. This assembly was probably displaced during subsequent handling,
which included an incident at the prime contractor's plant in which the tank was
jarred.

(d) In itself, the displaced fill tube assembly was not particularly serious,
but it led to the use of improvised detanking procedures at KSC which almost
certainly set the stage for the accident."

The Board records its own caveat: "some details of the accident are not
completely clear," and further tests at the Manned Spacecraft Center could yield
conclusions differing in detail from those reported here.

Read with ch5_thermostatic_switch.txt, which explains why the protective
switches could not do the one thing they existed to do.`;

export const THERMOSTATIC_SWITCH = `CHAPTER 5 — FINDINGS
THE 65 V DC / 28 V DC SWITCH INCOMPATIBILITY

"A number of factors contributed to the presence of inadequate thermostatic
switches in the heater assembly. The original 1962 specifications from NR to
Beech Aircraft Corporation for the tank and heater assembly specified the use of
28 V dc power, which is used in the spacecraft. In 1965, NR issued a revised
specification which stated that the heaters should use a 65 V dc power supply for
tank pressurization; this was the power supply used at KSC to reduce
pressurization time. Beech ordered switches for the Block II tanks but did not
change the switch specifications to be compatible with 65 V dc."

"The thermostatic switch discrepancy was not detected by NASA, NR, or Beech in
their review of documentation, nor did tests identify the incompatibility of the
switches with the ground support equipment (GSE) at KSC, since neither
qualification nor acceptance testing required switch cycling under load as
should have been done. It was a serious oversight in which all parties shared."

"The thermostatic switches could accommodate the 65 V dc during tank
pressurization because they normally remained cool and closed. However, they
could not open without damage with 65 V dc power applied. They were never
required to do so until the special detanking. During this procedure, as the
switches started to open when they reached their upper temperature limit, they
were welded permanently closed by the resulting arc and were rendered
inoperative as protective thermostats."

"As shown by subsequent tests, failure of the thermostatic switches probably
permitted the temperature of the heater tube assembly to reach about 1000 deg F
in spots during the continuous 8-hour period of heater operation. Such heating
has been shown by tests to severely damage the Teflon insulation on the fan
motor wires in the vicinity of the heater assembly. From that time on, including
pad occupancy, the oxygen tank no. 2 was in a hazardous condition when filled
with oxygen and electrically powered."

Three dates matter and they are in three different documents. The specification
change is 1965, here. The eight-hour heater run is March 1970, in
ch4_detanking_march_1970.txt. What management knew before launch is in
ch4_launch_decision.txt.`;

export const IGNITION = `CHAPTER 5 — FINDINGS
IGNITION IN FLIGHT AND CONSEQUENTIAL DAMAGE

"It was not until nearly 56 hours into the mission, however, that the fan motor
wiring, possibly moved by the fan stirring, short circuited and ignited its
insulation by means of an electric arc. The resulting combustion in the oxygen
tank probably overheated and failed the wiring conduit where it enters the tank,
and possibly a portion of the tank itself. The rapid expulsion of high-pressure
oxygen which followed, possibly augmented by combustion of insulation in the
space surrounding the tank, blew off the outer panel to bay 4 of the SM, caused a
leak in the high-pressure system of oxygen tank no. 1, damaged the high-gain
antenna, caused other miscellaneous damage, and aborted the mission. The accident
is judged to have been nearly catastrophic. Only outstanding performance on the
part of the crew, Mission Control, and other members of the team which supported
the operations successfully returned the crew to Earth."

FORMAL FINDINGS, same chapter:

  - Oxygen tank no. 2 contained Teflon and aluminum, materials which burn in
    supercritical oxygen.
  - The tank contained potential ignition sources: electrical wiring, unsealed
    electric motors, and rotating aluminum fans.
  - The tank heaters were NOT powered at the time of the accident. The stir
    command energized the fans.

The ground test that reproduced this sequence was filmed from outside the vessel
in June 1970. The photograph is in the private backup.`;

export const SHELF_DROP = `CHAPTER 4 — REVIEW AND ANALYSIS
PART 2 — OXYGEN TANK NO. 2 HISTORY

The oxygen shelf carrying tanks no. 1 and no. 2 was completed at North American
Rockwell and installed in service module 106 — Apollo 10 — on June 4, 1968.
Electromagnetic interference from the vac-ion pumps led to an order that the
shelf be replaced.

"On October 21, 1968, the oxygen shelf was removed from SM 106 for the required
modification and installation in a later spacecraft."

"One shelf bolt was mistakenly left in place during the initial attempt to
remove the shelf; and as a consequence, after the front of the shelf was raised
about 2 inches, the fixture broke, allowing the shelf to drop back into place.
Photographs of the underside of the fuel cell shelf in SM 106 indicate that the
closeout cap on the dome of oxygen tank no. 2 may have struck the underside of
that shelf during this incident. At the time, however, it was believed that the
oxygen shelf had simply dropped back into place and an analysis was performed to
calculate the forces resulting from a drop of 2 inches. It now seems likely that
the shelf was first accelerated upward and then dropped."

Post-incident retesting covered proof-pressure, leak, and functional tests of
transducers, switches, thermal switches and vac-ion pumps. All passed. No
cryogenic testing was performed, and the Board notes these tests "would not
disclose fill line leakage within oxygen tank no. 2."

"The probability of tank damage from this incident, therefore, is now considered
to be rather low, although it is possible that a loosely fitting fill tube could
have been displaced by the event."

The shelf was installed in SM 109 — Apollo 13's service module — on November 22,
1968. SM 109 shipped to KSC in June 1969.

NOTE ON WHAT THIS DOCUMENT DOES AND DOES NOT SAY: the Board says the SHELF
ASSEMBLY was raised and dropped about 2 inches, and only that the tank's
closeout cap MAY have struck the fuel cell shelf above it. Popular accounts say
the tank itself was dropped. The Apollo Flight Journal renders the distance as
"about 5 centimetres" — the same figure in metric. The distinction survives into
this corpus unresolved, because the primary source does not resolve it.`;

export const DETANKING = `CHAPTER 4 — REVIEW AND ANALYSIS
TESTING AT KENNEDY SPACE CENTER

"The countdown demonstration test (CDDT) began on March 16, 1970. Up to this
point, nothing unusual about oxygen tank no. 2 had been noted during the
extensive testing at KSC."

Tanks were evacuated, loaded and pressurized to 331 psi without abnormality.

"At the time during CDDT when the oxygen tanks are normally partially emptied to
about 50 percent of capacity, oxygen tank no. 1 behaved normally, but oxygen tank
no. 2 only went down to 92 percent of its capacity."

An Interim Discrepancy Report was written. It was then transferred to a Ground
Support Equipment Discrepancy Report, because a GSE filter was suspected — the
problem was recorded against the equipment, not the tank.

"On Friday, March 27, 1970, detanking operations were resumed... As a first step,
oxygen tank no. 2, which had self-pressurized to 178 psi and was about 83 percent
full, was vented through its fill line. The quantity decreased to 65 percent."

KSC, MSC, NR and Beech personnel hypothesized a leak between the fill line and
the quantity probe, caused by a loose fit in the sleeves and tube. Replacement
was considered and rejected:

"replacement of the oxygen shelf... would have been difficult and would have
taken at least 45 hours"

and carried risk of damaging other service module elements. The decision was
made instead to test whether the tank could be filled at all. That test was run
on March 30, 1970 — twelve days before launch.

"On the filling test, oxygen tanks no. 1 and no. 2 were filled with LOX to about
20 percent of capacity on March 30 with no difficulty. Tank no. 1 emptied in the
normal manner, but emptying oxygen tank no. 2 again required pressure cycling
with the heaters turned on."

The heaters ran continuously for eight hours during that cycling. What that did
to the wire insulation is in ch5_thermostatic_switch.txt. Who knew it had
happened is in ch4_launch_decision.txt.`;

export const LAUNCH_DECISION = `CHAPTER 4 — REVIEW AND ANALYSIS
THE FLIGHT-READINESS DELIBERATIONS

"As the launch date approached, the oxygen tank no. 2 detanking problem was
considered by the Apollo organization. At this point, the 'shelf drop' incident
on October 21, 1968, at NR was not considered and it was felt that the apparently
normal detanking which had occurred in 1967 at Beech was not pertinent because it
was believed that a different procedure was used by Beech. In fact, however, the
last portion of the procedure was quite similar, although a slightly lower GOX
pressure was utilized. Throughout these considerations, which involved technical
and management personnel of KSC, MSC, NR, Beech, and NASA Headquarters, emphasis
was directed toward the possibility and consequences of a loose fill tube; very
little attention was paid to the extended operation of heaters and fans except to
note that they apparently operated during and after the detanking sequences. Many
of the principals in the discussions were not aware of the extended heater
operations. Those that did know the details of the procedure did not consider the
possibility of damage due to excessive heat within the tank, and therefore did
not advise management officials of any possible consequences of the unusually
long heater operations."

On the switches, from post-accident testing at MSC: they "failed to open when the
heaters were powered from a 65 V dc supply similar to the power used at KSC
during the detanking sequence."

And on why nobody had ever found out: "Qualification and test procedures for the
heater assemblies and switches do not at any time test the capability of the
switches to open while under full current conditions."

Three facts, three documents, one answer: the specification mismatch dated 1965,
the eight-hour heater run dated March 30 1970, and the fact that most of the
people clearing the vehicle for flight did not know the second thing had
happened.`;

export const MASKED_ALARMS = `CHAPTER 4 — REVIEW AND ANALYSIS
PART 5 — APOLLO 13 RECOVERY

ON THE TELEMETRY GAP:

"The 1.8-second loss of telemetered data was accompanied by the switching of the
CSM high-gain antenna mounted on the SM adjacent to bay 4 from narrow beam width
to wide beam width. The high-gain antenna does this automatically 200
milliseconds after its directional lock on the ground signal has been lost."

ON THE FUEL CELLS:

"The failure of oxygen tank no. 2 and consequent removal of the bay 4 panel
produced a shock which closed valves in the oxygen supply lines to fuel cells 1
and 3. These fuel cells ceased to provide power in about 3 minutes, when the
supply of oxygen between the closed valves and the cells was depleted."

ON WHY NOBODY SAW IT COMING — the finding that matters most for the timeline:

"The crew was not alerted to closure of the oxygen feed valves to fuel cells 1
and 3 because the valve position indicators in the CM were arranged to give
warning only if both the oxygen and hydrogen valves closed. The hydrogen valves
remained open. The crew had not been alerted to the oxygen tank no. 2 pressure
rise or to its subsequent drop because a hydrogen tank low pressure warning had
blocked the cryogenic subsystem portion of the caution and warning system several
minutes before the accident."

CREW POSITIONS AT THE MOMENT OF THE FAILURE:

  Commander (Lovell)          lower equipment bay, stowing the television camera
  Lunar Module Pilot (Haise)  in the tunnel, returning to the CSM
  Command Module Pilot        left-hand couch
  (Swigert)

The alarm that masked the cryogenic warnings is in the event log several minutes
before the failure. Both entries are in the same log.`;

export const CO2_TABLE = `TABLE 4-III — CABIN ATMOSPHERE CARBON DIOXIDE REMOVAL BY LITHIUM HYDROXIDE
Report of Apollo 13 Review Board, Chapter 4. Figure 4-16: "Lithium hydroxide
canister modification."

requirement,hours
Required,85
Available in LM,53
Available in CM,182

Accompanying text, verbatim: "...allowing use of the CM LiOH cannisters in the LM
cabin atmosphere cleaning system (see fig. 4-16). At splashdown, many hours of
each consumable remained available."

TRAJECTORY DECISION POINTS, labelled on the same chapter's figure:

event,get
Start of problem,55:55
MCC to free-return,61:30
PC+2 hr for Pacific landing,79:28
MCC-5 for entry corridor,105:18
LM jettison,141:30

This table is the arithmetic core of the adapter story. The lunar module's own
canisters covered 53 of the 85 hours needed. The 32-hour shortfall could only be
closed by adapting the command module's square canisters to a round receptacle.`;

export const CONSUMABLES = `APOLLO 13 MISSION REPORT — MSC-02680
SECTION 7.0 — MISSION CONSUMABLES

Mission Evaluation Team, NASA Manned Spacecraft Center. Approved by James A.
McDivitt, Colonel USAF, Manager, Apollo Spacecraft Program. September 1970.
Section 7 as revised by Change 1, May 1970.

7.1.3 CRYOGENIC STORAGE

"Cryogenic oxygen and hydrogen usages were nominal until the time of the
incident. The pressure decay in oxygen tank 2 was essentially instantaneous,
while oxygen tank 1 was not depleted until approximately 2 hours following the
incident."

QUANTITIES, POUNDS

                            tank 1    tank 2    total
Available at lift-off
  hydrogen                    29.0      29.2     58.2
  oxygen                     326.8     327.2    654.0
Consumed to the incident
  hydrogen                     7.1       6.9     14.0
  oxygen                      71.8      85.2    157.0
Remaining at the incident
  hydrogen                    21.9      22.3     44.2
  oxygen                     255.0     242.0    497.0

7.1.4 "Following the incident and loss of pressure in tank 1, the total oxygen
supply consisted of 3.77 pounds in the surge tank and 1 pound in each of the
three repressurization bottles."

7.1.5 "At the time of the incident, about 38 pounds of water was available in the
potable water tank. During the abort phase, the crew used juice bags to transfer
approximately 14 pounds of water from the command module to the lunar module for
drinking and food preparation."

7.1.6 "The command module was completely powered down at 58 hours 40 minutes, at
which time 99 ampere-hours remained in the three entry batteries. By charging the
batteries with lunar module power, available battery capacity was increased to
118 ampere-hours... At landing, 29 ampere-hours of energy remained."

7.2 "The estimated total energy transferred to the command module was
approximately 129 ampere hours. A total of 410 ampere hours remained in the lunar
module batteries at the time of undocking."

The powerdown that produced the 99 ampere-hour figure is a single timestamped
entry in the event log. Everything after it was budgeted against that number.`;

export const SEQUENCE_OF_EVENTS = `APOLLO 13 MISSION REPORT — MSC-02680
TABLE 3-1 — SEQUENCE OF EVENTS

Range zero: 19:13:00.00 G.m.t., April 11, 1970. Lift-off: 19:13:00.65 G.m.t.
All times below are ground elapsed time.

event,get
S-IC outboard engine cutoff,00:02:44
S-II engine ignition,00:02:45
Launch escape tower jettison,00:03:21
S-II engine cutoff,00:09:53
S-IVB engine ignition,00:09:54
S-IVB engine cutoff,00:12:30
Translunar injection,02:35:46
S-IVB/CSM separation,03:06:39
Docking,03:19:09
Spacecraft ejection,04:01:01
S-IVB separation maneuver,04:18:01
First midcourse correction (service propulsion),30:40:50
Cryogenic oxygen tank incident,55:54:53
Second midcourse correction (descent propulsion),61:29:43
S-IVB lunar impact,77:56:40
Transearth injection (descent propulsion),79:27:39
Third midcourse correction (descent propulsion),105:18:28
Fourth midcourse correction (LM reaction control),137:39:52
Command module/service module separation,138:01:48
Undocking,141:30:00
Entry interface,142:40:46
Landing,142:54:41

ON THE TRAJECTORY THAT WAS REJECTED — Section 3.0, verbatim: had the free-return
trajectory been flown without the PC+2 burn, "the resultant landing at earth
would have been at 152 hours in the Indian Ocean, with lunar module systems
intended to support the crew for the remaining 90 hours." It was rejected
"because consumables were extremely marginal in this emergency mode and because
only minimal recovery support existed at this earth landing location."

NOTE: this table gives command module/service module separation at GET 138:01:48.
The air-to-ground transcript has the crew calling separation at GET 138:02:06.
The corpus preserves both. It does not decide which clock was right.`;

export const SUMMARY_LANDING = `APOLLO 13 MISSION REPORT — MSC-02680
SECTION 1.0 SUMMARY, WITH SECTION 10.3 RECOVERY OPERATIONS

THE ABORT. The mission was aborted "because of an abrupt loss of service module
cryogenic oxygen associated with a fire in one of the two tanks at approximately
56 hours." Tank 2 pressure "began to rise at an abnormally high rate and, within
about 100 seconds, the tank abruptly lost pressure. The pressure in tank 1 also
dropped but at a rate sufficient to maintain fuel cell 2 in operation for
approximately 2 more hours."

THE RETURN. "The crew powered up the lunar module, and the first maneuver
following the incident was made with the descent propulsion system to place the
spacecraft once again on a free-return trajectory. A second maneuver performed
with the descent engine 2 hours after passing pericynthion reduced the transearth
transit time and moved the earth landing point from the Indian Ocean to the South
Pacific."

THE LANDING. "Landing occurred at 142:54:41 within sight of the recovery ship.
The landing point was reported as 21 degrees 38 minutes 24 seconds south latitude
and 165 degrees 21 minutes 42 seconds west longitude. The crew were retrieved and
aboard the recovery ship within 45 minutes after landing."

THE CREW CHANGE. John L. Swigert, Jr. replaced the prime crew command module
pilot two days before launch, after the prime crew was exposed to rubella.

THE LUNAR MODULE'S END. Section 3.0 records that Aquarius, including its
radioisotope thermoelectric fuel capsule, "entered the atmosphere and impacted in
the open sea between Samoa and New Zealand at 25.5 degrees south latitude and 176
degrees west longitude, with surveillance aircraft in the area."

NOTE ON THE SPLASHDOWN TIME. This report gives landing at GET 142:54:41, which is
18:07:41 UTC, 12:07:41 p.m. CST. The 1970 press caption on the splashdown
photograph says 12:07:44 p.m. CST. Three seconds apart. The corpus prefers this
document and records the disagreement rather than hiding it.`;

export const RECOMMENDATIONS = `CHAPTER 5 — FINDINGS, DETERMINATIONS, AND RECOMMENDATIONS
PART 4 — RECOMMENDATIONS

Nine recommendations. The first four, verbatim:

"1. The cryogenic oxygen storage system in the service module should be modified
to:
  a. Remove from contact with the oxygen all wiring, and the unsealed motors,
     which can potentially short circuit and ignite adjacent materials; or
     otherwise insure against a catastrophic electrically induced fire in the
     tank.
  b. Minimize the use of Teflon, aluminum, and other relatively combustible
     materials in the presence of the oxygen and potential ignition sources.

2. The modified cryogenic oxygen storage system should be subjected to a rigorous
requalification program, including careful attention to potential operational
problems.

3. The warning systems on board the Apollo spacecraft and in the Mission Control
Center should be carefully reviewed and modified where appropriate with specific
attention to the following:
  a. Increasing the differential between master alarm trip levels and expected
     normal operating ranges to avoid unnecessary alarms.
  b. Changing the caution and warning system logic to prevent an out-of-limits
     alarm from blocking another alarm when a second quantity in the same
     subsystem goes out of limits.
  c. Establishing a second level of limit sensing in Mission Control on critical
     quantities with a visual or audible alarm which cannot be easily overlooked.
  d. Providing independent talkback indicators for each of the six fuel cell
     reactant valves plus a master alarm when any valve closes.

4. Consumables and emergency equipment in the LM and the CM should be reviewed to
determine whether steps should be taken to enhance their potential for use in a
'lifeboat' mode."

Recommendation 3b is the direct answer to the masked alarm described in
ch4_recovery_masked_alarms.txt.

RECOMMENDATIONS 6 THROUGH 9, in summary. Whenever significant anomalies occur in
critical subsystems during final preparation for launch, standard procedures
should require "a presentation of all prior anomalies on that particular piece of
equipment, including those which have previously been corrected or explained."
NASA should reexamine all systems containing high-density oxygen or other strong
oxidizers. It should conduct further research on materials compatibility,
ignition and combustion in strong oxidizers at various g levels. And MSC should
reassess subsystem engineering control down to the subcontractor and vendor
level.`;

export const CASE_STUDY = `A CASE STUDY OF THE FAILURE ON APOLLO 13 BASED ON TMX-65270
Brenda Lindley Anderson, QD34, NASA. NTRS 20110015690. Undated.

MANUFACTURING CHAIN
  inner shell        Airite Products Division, Electrada Corporation
                     (subcontract to Beech Aircraft Corporation)
  quantity probe     Simmonds Precision Products, Inc.
  fans, fan motors   Globe Industries, Inc.

Manufacture of oxygen tank 2 began in 1966. It was the eighth Block II tank built
by Beech, which had previously produced 28 Block I tanks.

MINOR FLAWS FOUND, REWORKED, AND ACCEPTED
  - weld porosity on the lower outer shell
  - incorrect welding wire used on a vac-ion pump weld
  - an upper fan motor drawing excessive current and making unwarranted noise;
    replaced along with the entire heater tube assembly
  - a heat-leak rate above specification even after rework — a formal waiver was
    accepted to fly the tank as is
  - oversized bolt holes in the dome electrical plug support
  - an oversized rivet hole above the lower fan

The tank shipped to North American Rockwell on May 3, 1967.

SERIAL NUMBERS
  oxygen tank 1      10024XTA0009
  oxygen tank 2      10024XTA0008
  oxygen shelf       0632AAG3277, completed at NR March 11, 1968

DESIGN PARAMETERS
  capacity           320 lb supercritical oxygen at 865-935 psia
  initial fill       liquid oxygen at -297 deg F
  operating range    -340 to 80 deg F
  burst pressure     2200 psia at -150 deg F
  relief valve       releases at 1000 psi
  dome rupture disk  75 psi

THE MARCH 1970 DETANKING, STEP BY STEP
  heaters connected to the 65 V dc ground support equipment supply
  fans turned on after 1.5 hours
  tank at 35 percent after six hours
  five pressure cycles to 300 psi emptied it
  heaters and fans powered off after EIGHT HOURS of operation

Note the relief valve setting against the flight data: tank 2 peaked at 1008.3
psia in flight, above the 1000 psi at which the valve should have released.`;
