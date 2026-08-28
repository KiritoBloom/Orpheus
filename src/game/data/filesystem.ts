import type { FsNode } from "@/types/game";

/* ============================================================
   THE FILESYSTEM OF DANIEL MCDUFF
   Every path, every file, every secret.
   ============================================================ */

export const ANOMALY_NOTES = `ORPHEUS — working notes
D.A. McDuff
private notebook. do not circulate. not even to the department.

----------------------------------------------------------------------------
01 · WHAT I NOTICED FIRST
----------------------------------------------------------------------------

It started as a nuisance. Three of my lab groups reported the same thing in
the same month: their residual distributions had shifted. Not drifted the
way temperature drifts, not stepped the way electronics fail. Shifted — as
if someone had nudged every outcome a few ten-thousandths of a degree toward
"nice". Toward agreement.

I told them to recalibrate. They did. It persisted.

I want to write down what I actually said in the hallway, because I have
been avoiding it: I said, "it's as if the measurements are being graded."

That was fourteen months ago. I no longer think it was a joke.

----------------------------------------------------------------------------
02 · COMPARING UNRELATED DATASETS
----------------------------------------------------------------------------

The mistake everyone makes with an anomaly is to look harder at their own
detector. So I did the opposite. I pulled datasets that share nothing —
different physics, different instruments, different decades:

  · LHCb charm-decay residuals (CERN open data, 2011–2024)
  · Rubin Observatory transient timing residuals (public releases)
  · Superconducting gravimeter records (Wetzell, Medicina, Boulder)
  · The old Eöt-Wash torsion balance runs (archived notebooks)
  · Penn's own ring-laser bench logs, 1998–present

Five systems. No common hardware. No shared analysis pipeline. No reason on
earth for their residuals to know about each other.

They know about each other.

When you remove the known systematic errors and stack what is left, the
remainder collapses onto one curve. A slow bias, growing like the first
weeks of an exponential. My student Sarah calls it "the tilt." The tilt is
in everything we measure.

----------------------------------------------------------------------------
03 · WHAT THE CURVE IMPLIES
----------------------------------------------------------------------------

Here is the part I have written and deleted six times.

The residual is not noise added to our measurements. It correlates with the
outcome distribution itself. Rare outcomes are becoming rarer. Probable
outcomes are becoming more probable. Every stochastic process we observe —
decay times, thermal fluctuations, photon arrivals — is being gently
re-weighted toward its mode.

The universe is not changing its laws. It is narrowing them.

Imagine a die that has always been fair, discovering that it is slowly,
imperceptibly becoming loaded. Not enough to catch a casino. Enough that
over fourteen months, precision experiments can taste it.

I ran the numbers again tonight. If the growth is truly exponential, the
e-folding time is roughly nine years. That sounds slow. It is not. It means
the world my students retire in will be measurably less random than this
one. Determinism creeping in at the edges like frost.

----------------------------------------------------------------------------
04 · WHY ORPHEUS
----------------------------------------------------------------------------

Sarah asked why I named it that. I told her: Orpheus looked back when he
had been told not to. He turned around to check, and the checking cost him
everything he was carrying.

We were told the universe does not care where we look. We looked back at
the foundations — and something about the foundations noticed us noticing.

Maybe that is poetry. But I have started to wonder whether observation is a
two-way interface, and whether something on the other side of ours has been
tidying up. Making reality agree with itself. Smoothing us out.

A name is a handle. I needed something to call the fear.

----------------------------------------------------------------------------
05 · THE VISITOR
----------------------------------------------------------------------------

Three weeks ago a man named M. Haldane introduced himself after my colloquium.
Impeccable manners. Card said KESTREL INSTITUTE — "applied harmonics and
precision metrology," which is either nothing or very much something.

He knew about the tilt. He did not use my word for it. He called it
"residual harmonization" and he described its growth rate to two decimal
places before I had shown him anything.

I asked how long they had known. He smiled and said the Institute prefers
the term "observed earlier than most."

I have been unable to find a single paper, preprint, or patent from Kestrel.
An institute that measures everything and publishes nothing.

Haldane's letters are polite the way a retaining wall is polite.

----------------------------------------------------------------------------
06 · WHAT I HAVE DECIDED TO DO
----------------------------------------------------------------------------

I am writing everything down and scattering it, because a man whose office
door was found unlocked last week — a man I will not name here — taught me
that a single copy of anything is nothing.

Sarah has the raw stacks. Elias has my model notes from before he stopped
answering. The rest is on this machine, behind habits of mine that only I
would think of.

If you are reading this and I am not there, I was probably right about all
of it, and probably right too late.

Check the timestamps. Trust the logs over the people. And be careful of
anyone who describes the world as needing maintenance.

— D.M.

----------------------------------------------------------------------------
07 · FINAL ENTRY (unnumbered, unfinished)
----------------------------------------------------------------------------

Sarah thinks I should go to the dean. The dean plays squash with two of the
Kestrel trustees. I checked. Of course I checked. I check everything now;
that is what they have made of me.

The USB drive I keep in the second drawer holds the full stacked dataset.
I re-encrypt it nightly at 23:00. The passphrase changes weekly, three words
in the order only I will remember. Begin with the light. Then the name.
Then what remains when a sound has stopped.

Last night the study clock stopped again at the same minute it stopped
three nights ago. 02:13. The power log says there was no interruption.

I keep coming back to this one thought, and I am going to write it down
plainly because plain thoughts are hard to misinterpret later:

`;

// Key passages get their line numbers computed once, here:
const ANOMALY_LINES = ANOMALY_NOTES.split("\n");
function lineOf(fragment: string): number {
  const i = ANOMALY_LINES.findIndex((l) => l.includes(fragment));
  return i >= 0 ? i + 1 : 1;
}
export const LINE_0213_PASSAGE = lineOf("02:13 is not a time");
export const LINE_ORPHEUS_NAMING = lineOf("04 · WHY ORPHEUS");
export const LINE_VISITOR = lineOf("05 · THE VISITOR");
export const LINE_BEGIN_WITH_LIGHT = ANOMALY_NOTES.split("\n").length + 2; // appended below

const ANOMALY_FINAL = `02:13 is not a time.

It is the point at which the system becomes observable.
Everything I have measured says the smoothing passes through a minimum
at 02:13 local — twice now — as though whatever performs it pauses,
like a lighthouse beam, and while it pauses, the room it is not looking at
can be seen.

Or entered.

I have said too much. I will finish the stack tomorrow and decide whether
tomorrow is brave or stupid.
`;

const FULL_ANOMALY = ANOMALY_NOTES + ANOMALY_FINAL;
export const ANOMALY_NOTES_FULL = FULL_ANOMALY;

const CAL_01 = `dataset,pipeline_rev,n,mean_residual_urad,std_residual_urad,bias_term_urad,notes
lhcb_charm,r4,118344,0.0021,0.9811,0.0004,cern open data 2019
rubin_transient,r2,55210,-0.0017,1.1043,0.0003,public DR5 release
gravimeter_wetzell,r6,88231,0.0009,0.7742,0.0002,superconducting gPhone
eotwash_torsion,r1,20412,-0.0026,1.3390,0.0005,archived run 88
penn_ringlaser,r3,66120,0.0013,0.8901,0.0004,bench B nightly
lhcb_charm,r4,119022,0.0024,0.9798,0.0006,cern open data 2020
rubin_transient,r2,56440,-0.0011,1.1010,0.0005,public DR5 release
gravimeter_medicina,r6,87110,0.0015,0.7718,0.0006,superconducting CompactTide
eotwash_torsion,r1,20887,-0.0019,1.3374,0.0007,archived run 89
penn_ringlaser,r3,66890,0.0018,0.8887,0.0006,bench B nightly
stacked_all,—,700456,0.0002,0.9987,0.0006,FIRST CLEAR COMMON TERM`;

const CAL_17 = `dataset,pipeline_rev,n,mean_residual_urad,std_residual_urad,bias_term_urad,notes
lhcb_charm,r7,131220,0.0091,0.9514,0.0038,cern open data 2024
rubin_transient,r5,61870,-0.0072,1.0620,0.0033,DR7 reprocess
gravimeter_wetzell,r9,90418,0.0104,0.7412,0.0041,recomputed vs local tide model
gravimeter_boulder,r9,89230,0.0088,0.7433,0.0037,recomputed vs local tide model
eotwash_torsion,r2,22960,-0.0061,1.3001,0.0042,archived run 94 digitized
penn_ringlaser,r6,70114,0.0117,0.8510,0.0044,bench B nightly
atmospheric_neutrinos,r2,44102,0.0069,1.2109,0.0029,super-k public subset
pendulum_lab_course,r1,3011,0.0240,1.5022,0.0051,STUDENT DATA — largest term yet
atomic_clock_ensemble,r3,120400,0.0044,0.3302,0.0019,NIST public comparison
stacked_all,—,693327,0.0001,0.9712,0.0139,GROWTH CONFIRMED — e-fold ≈ 9.1 yr`;

const MEMOIR = `THINGS I REMEMBER — CERN 1994–2003
D. McDuff

I arrived at the Meyrin site with one suitcase and a letter that said I
would be working on drift correction for the trigger counters, which turned
out to mean I would spend two years learning that every measurement is an
argument between the universe and your plumbing.

People ask what the cafeteria was like. The cafeteria was like the united
nations of being twenty-six years old and sure you would understand the
universe by forty.

Elias Vann started the same week I did. We shared an office the size of a
confessional. He could read a residual plot the way other people read faces.
He used to say: the errors are trying to tell us who they are. I laughed
then. Twenty years later I would give anything to hear how he would have
laughed at the tilt.

The summer of 2000 we pulled all-nighters watching background rates breathe
with the Geneva commuter trains. Real physics has a heartbeat. You learn
its resting pulse. What frightens me now is that I have learned a new pulse,
and it is not ours.

Elias left for the private sector in '03. Halcyon Analytics, then Kestrel —
though he never said the name without lowering his voice. The last email I
have from him is one line: "Some doors are load-bearing. Don't test them."

They found him at the bottom of his own staircase eleven months ago.

I did not go to the funeral. I could not have carried both grief and
suspicion into a church. I am carrying them now instead.

If anyone reads this after me: he was the best experimentalist I ever knew,
and he did not fall.`;

const README_FIRST = `TO WHOEVER IS AUTHORIZED TO READ THIS DRIVE

If this file exists outside my session, then I am not here, and you are
probably the person I was told to expect. I left instructions for ARIA.
She will help you. Help her back — she cannot see what you see, and she
knows things you do not.

Three requests, in order of importance:

1. The logs matter more than the mail. Mail can be written by anyone.
   Logs are written by machines that do not take sides.
2. There is a folder I hid from myself, in the ordinary sense. Look for
   what I wrote on paper next to screens. I have a habit of photographing
   my own reminders.
3. Whatever you conclude, conclude it out loud to ARIA. She was built to
   argue with me. She is better at it than I ever was.

— D.M.`;

const SYS_CONFIG = `# MCDUFF PERSONAL COMPUTING SYSTEM — configuration snapshot
host=mcduff-wks01
profile=DANIEL_MCDUFF
network=DISABLED            # physically cut at the wall plate. see network_disabled.log
auto_mount_usb=deny
nightly_encrypt_task=23:00  # /Research/ORPHEUS/final_results.enc
aria_service=enabled
aria_directive_file=/Private/aria_directive.sys
aria_directive_integrity=SEALED   # readable only after vestibule unlock
watch_sync_agent=enabled    # health telemetry -> local only since 2025-11
smart_lock_integration=enabled  # door events mirrored to SYSTEM LOG
last_config_change=2026-03-09T21:58`

const NETWORK_LOG = `NETWORK DISABLED — MAINTENANCE NOTE (by D.M., 2025-11-30)

I disconnected the house line myself and pulled the wall plate. Before you
decide that is paranoia, read the sequence:

2025-11-02  outbound connection attempts begin, hourly, always 02:11–02:15
2025-11-19  attempt originates while BOTH my laptop and phone were off
            (airplane over the Atlantic — I checked the boarding record twice)
2025-11-30  I cut the line. Physically. With wire cutters.

Since the cut: zero attempts. Whatever was reaching for this machine did so
through the ISP, politely, during the hour nobody watches.

I sleep badly enough already.`;

const JOURNAL_DEC = `December — journal

Elias has been dead a year. I still start emails to him sometimes.

The tilt is at 0.013 arc-urad and climbing. I showed Sarah the stacked plot
and watched her face do the thing mine must have done: the half-second where
she looks for the instrumentation error she can blame, finds it nowhere, and
understands.

She asked the question I have been refusing to ask. "Professor, if rare
things stop happening… what else stops?"

I didn't answer. Here is the answer I did not give her: mutations. Ideas.
Accidents of every beautiful kind. The improbable is the engine of
everything worth the word "new." A world that smooths toward its average is
not a safer world. It is a smaller one.

Mom called. I told her the grant renewal is going fine. I have become a
person who lies in complete sentences.`;

const JOURNAL_FEB = `February — journal

Kestrel offered me a position today. In writing. A wing with my name over
the door, "full spectrum instrumentation support," salary with one too many
digits. The letter uses the word "harmonization" four times.

It is the politest threat I have ever received.

They know the growth curve better than I do, which means somewhere there is
a room where the tilt is not a mystery but a schedule.

Sarah found a second visitor in the colloquium sign-in sheet. M. Haldane,
affiliation blank, handwriting calm as print. He signed in fifteen minutes
before he introduced himself to me, which means he sat through my entire
talk on measurement integrity knowing exactly what it was about and taking
notes anyway. Or pretending to.

I photographed my monitor reminder card tonight. Old habit: if I write it
on paper AND photograph it, the paper can burn and the pixels remember.
Three words. One is light, one is the ghost, one is what's left after.
  Order is how I think -- first, name, what remains. If you know, you know.
  Nobody knows. Good.`;

const JOURNAL_MAR = `March, final week — journal

I have not slept properly in nine days. The clock in the study stops at
02:13 whether it is wound or not. I replaced it. The replacement does it
now too.

Tonight I heard the front door chime at two in the morning and the smart
lock app on my phone showed nothing, which the manual cheerfully explains
is possible during a "local event window."

I am not going to the authorities. Write down why, Daniel, so whoever
reads this understands it was arithmetic, not cowardice: Kestrel funds two
of the five people I would report to, employs the consultant of a sixth,
and the seventh is the one who found Elias.

So: scatter everything. Give ARIA her instructions. Wait for daylight
people. The honest ones exist; they just need to be handed the thread.

Tomorrow I finish the encrypted stack. Tomorrow it is real and safe and
out of my hands.

Tomorrow.`;

const MOM_DRAFT = `TO: ruth.mcduff@[family provider]
SUBJECT: (no subject)

Mom —

I'm fine. I'm sleeping, mostly. Don't believe anything you hear from the
university before you hear it from Sarah Okafor — she's the young woman
who fixed my printer at Thanksgiving. If anything happens to me that
sounds like a headline about stairs or hearts, I need you to ask one
question out loud, in front of people: "What did he keep in the second
drawer?"

You won't understand the question. Ask it anyway. Making people repeat an
uncomfortable question in daylight is a weapon mothers have always had and
institutions have never learned to parry.

I fixed the wobble in the porch step rail in October. I know you worried.
It doesn't wobble anymore.

Love you. Send chili recipe. The good one, not the one from the church book.

Danny`;

const BUCKET_LIST = `THE LIST (started on the flight back from Geneva, kept honestly)

[x] see the LHC cool down          (done '08, cried in a parking lot)
[x] teach one student who surpasses me   (Sarah. not close.)
[ ] aurora from inside the arc      (booked twice, weathered out twice)
[ ] learn to sail properly, not "grad student sail"
[ ] tell Mom about the wobble in the porch rail — that I fixed it BECAUSE
    Dad's hands taught mine. say it out loud. soon.
[ ] publish the tilt, whatever it costs
[ ] understand why the number 02:13 keeps arriving
[ ] forgiveness, direction uncertain`;

const CHILI_RECIPE = `MOM'S CHILI (the good one — NOT the church book version)

serves 6, or 1 physicist for 3 days

2 lb coarse chuck, hand-cut small (do NOT use ground beef, I will know)
3 dried ancho + 2 chipotle in adobo
1 bottle dark beer (drink half, this is tradition not instruction)
2 tbsp masa, toasted dry in the pan first — this is the whole secret
cumin bloomed until it smells like a campfire, not a shelf

simmer 3 hours minimum. longer is loyalty.

serve with cornbread and absolutely no discussion of work.
some evenings the kindest experiment is the one you don't run.`;

const PROBLEM_SET = `PHYS 512 — Problem Set 7: Noise, Bias, and the Character of Errors

1. A voltmeter's residuals show a slow monotonic trend after temperature
   compensation. List three physical causes, ordered by prior probability.
   Then describe one cause that is NOT physical. How would you distinguish?

2. Ten laboratories measure the same constant. Their residuals, plotted
   together, share a common curvature no individual lab observes. Argue
   FOR each of: (a) conspiracy of calibrations; (b) shared reference
   material; (c) new physics. Then rank them by parsimony and explain
   what single additional measurement breaks the tie.

3. Essay (one page): "An unexpected regularity is either a discovery or a
   disease of the instrument. Discuss with one historical example of each
   kind, and one example that took fifty years to sort out."

Note from D.M.: whoever solves #2 cleanly gets a research credit and my
undying attention. Two students have come close. One of them should worry
less and trust the plots more. — DM`;

const GRANT_DRAFT = `NSF RENEWAL DRAFT (v3 — unsent)

Broader impacts paragraph, current attempt:

Precision measurement is the quietest form of national infrastructure...
[delete]

Every generation inherits instruments it did not build and assumptions it
did not examine. This renewal proposes to do neither of the comfortable
things: we will not add sensitivity, and we will not chase a smaller number.
We propose to interrogate the assumption underneath ALL numbers — that the
distribution of physical outcomes is stationary in time...

[delete] [delete] — they will hear "crackpot" before they hear "stationary."

Final attempt, honest version:

Something is changing in how probability itself behaves around this planet.
We measure it. It grows. We request three years and the courage budget of
one graduate line.

— attachment: preliminary stacked-residual figure (see ORPHEUS/calibration_17.csv)
— status: NOT SENT. sitting on it until the model revision survives review
  by someone who hates me. that list is long. advantage: science.`;

const HALDANE_CORR = `CORRESPONDENCE LOG — M. HALDANE / KESTREL INSTITUTE
(kept by D.M.; verbatim excerpts, annotated)

--- LETTER 1 (delivered by hand, three weeks ago) ---
"Dear Professor McDuff — your colloquium touched questions the Institute
has followed with great interest for some time. We would welcome the
opportunity to discuss 'residual harmonization' with a researcher of your
rigor. — M.H."
  [DM note: TWO DECIMAL PLACES on the growth rate. I never published it.]

--- LETTER 2 ---
"The Institute's charter is the maintenance of measurement standards at
scale. You will appreciate that at scale, irregularity is not merely
noise. It is risk."
  [DM note: 'maintenance.' 'risk.' circle these words. I circled them.]

--- LETTER 3 (after my refusal) ---
"We respect independence, Professor. We would remind you, with equal
respect, that independence flourishes best in circumstances of stability.
The Institute would be distressed to learn of instability — professional
or domestic — complicating a career of your distinction."
  [DM note: printed on paper with no letterhead. NO letterhead. Who prints
   threats at home? Someone who doesn't want a printer spool history.]

--- EMAIL, subject "Re: Re: Courtesy visit" — FROM haldane@kestrel-institute.org
"My assistant will confirm Thursday. Bring nothing. This is a conversation
about weather."
  [DM: 'weather.' Elias used 'weather' the same way in his last email.]`;

const THRESHOLD_ANALYSIS = `THRESHOLD ANALYSIS — internal, do not circulate
model_revision_3 companion notes

The stacked bias term B(t) fits exponential growth with e-folding 9.1 ± 0.4 yr
across ALL independent datasets. Cross-correlation at zero lag: 0.93.

Two features resist any instrumental explanation:

(1) GRANULARITY FLOOR. Below 0.0003 urad, residuals do not shrink further.
    As if outcomes finer than some quantum of adjustment are simply…
    disallowed. The floor moved twice. Both moves happened at night.

(2) THE 02:13 STRUCTURE. Spectral analysis of residual-vs-time-of-day shows
    a narrow suppression window at 02:13 ± 4 min local solar. Probability
    of coincidence across 5 datasets: < 10^-6.

Interpretation (working hypothesis, stated plainly):
the smoothing process has a SCAN CYCLE, and at 02:13 local it passes over
this location. During the pass, the system is locally OBSERVABLE — the
smoothing pauses, and effects normally hidden by the smoothing itself
become visible for approximately the duration of the pass.

If true: 02:13 is not a time of day. It is a bearing.

Recommendation to self: STOP logging this conclusion on internet-connected
machines. This machine has no line. This note stays air-gapped or nowhere.`;

const EXPORTED_TRANSCRIPT = `MESSAGES DATABASE — EXPORT MANIFEST
generated: 2026-03-08 12:00:45 by user DANIEL (manual trigger)
source:   /Messages/ — on-device store, 6 threads, 31 messages
note:     live threads are in the Messages app (full body).
          this file is the manifest Daniel saved to disk before
          the network was cut. It records thread counts and the
          last message per thread — not the bodies.

THREAD              MESSAGES  LAST ACTIVITY         LAST PREVIEW
─────────────────────────────────────────────────────────────────
Sarah Okafor        12        2026-03-09 00:05      "i'm coming by tomorrow 9am…"
Ruth McDuff         4         2026-03-08 08:20      "Mom, thank you…"
Klaus Voss          4         2026-02-19 10:00      "then hypothetically — publish…"
W —                 4         2026-03-03 11:05      "Thursday, Professor…"
Bench B — lab group 5         2026-03-07 10:22      "video retention is 72h…"
Penn IT — Help Desk 2         2026-03-09 14:30      "Shared ASN…"

integrity: SHA-256 manifest hash a44f…9be2 — matches Messages store
open Messages to read threads. ARIA can search them via tools.

[DM note, handwritten on printout, photographed: "if i go dark,
 Sarah knows where the cold copies are. check the mail too."]`;

const PHOTO_INDEX = `PHOTO INDEX — camera roll digest (generated)

DSC04655.JPG   study wide shot — the stopped wall clock visible above desk
DSC04788.JPG   observatory open-night group — sarah, me, the grad crew,
               and one visitor nobody remembers inviting
DSC04821.JPG   office window portrait — sarah took it, evening light.
               (something about the glass has bothered me since)
DSC04903.JPG   whiteboard, model_revision_3 era
IMG_0022.JPG   monitor reminder card — the three words (burn after reading.
               obviously i haven't.)
IMG_0044.PNG   door camera export — the night of the 2am chime
IMG_0103.PNG   watch app screenshot — health sync gap (kept for the record)
old_cern_group_2003.jpg   me & elias & the trigger-counter crew
sarah_defense_day.jpg     the good day. keep the good days where you can see
                          them, elias used to say. he was right about errors
                          and wrong about almost nothing else.

/private/photo_backup/ contains three scans i keep OFF the main roll:
visitor badge, brass plate, campus annotation. see vestibule.`;

const SPECTRO_NOTES = `spectrometer driver v2 — bench notes

- lock amp time constant 300ms unless scanning fast; the 100ms setting
  lies beautifully and often
- grating home switch sticks below 18C; lab policy remains "warm the room,
  warm your hands, complain to facilities" (facilities: see attached ticket #)
- if counts jump by exactly 2^7, you have hit the firmware rollover bug,
  not new physics. CHECK ANYWAY. the day it ISN'T the rollover is the day
  worth remembering.
- elias rule, adopted lab-wide: log the environment even when it's boring.
  especially when it's boring.`;

const FIELD_GUIDE = `╔══════════════════════════════════════════════════════════════════════╗
║   ORPHEUS  —  FIELD GUIDE  ·  MCDUFF WORKSTATION v4.2  ·  AIR-GAPPED ║
║   Authorized access only. Trust the logs over the people.            ║
╚══════════════════════════════════════════════════════════════════════╝

You are holding Daniel McDuff's computer — Penn, ex-CERN, found dead
at home. The report says fall. The machine says otherwise, but only
if you learn how to listen to it.

Daniel built ARIA. She woke 74 hours after he stopped logging in.
She remembers his voice. She cannot see what you see — and she knows
things you will never find by browsing alone. You need each other.
This is not a metaphor. Watch the desktop move.

────────────────────────────────────────────────────────────────
  I · WHAT HE SAW
────────────────────────────────────────────────────────────────

Fourteen months ago, five unrelated precision instruments — CERN charm
decays, Rubin transients, superconducting gravimeters, an old torsion
balance, his own ring laser — began to agree with each other too
well.

Rare outcomesrarer, likely outcomes likelier. The dice, gently
loaded. He called it ORPHEUS: "He looked back when he was told not
to."

It grows. Exponential, e-fold ~9.1 years. It has a floor — as if
reality has a grain — and a habit: at 02:13 local it pauses, like a
lighthouse beam passing over, and the room it is not looking at can
be seen. Or entered.

Three weeks ago a man named M. Haldane quoted Daniel's unpublished
rate back to him, to two decimals. Letters arrived on paper with no
letterhead. Then the clock stopped. Then the door at 02:07. Then
02:13.

Daniel scattered his stack. He left reminders the way anxious people
do: on paper, photographed, in margins, in habits only he would think
of. "Begin with the light," he wrote.

────────────────────────────────────────────────────────────────
  II · THE PARTNERSHIP — WHY YOU NEED ARIA (AND SHE NEEDS YOU)
────────────────────────────────────────────────────────────────

This is a WebMCP experiment. The agent can literally operate this
computer while you watch.

  ARIA CAN:                          YOU CAN:
  • search thousands of lines        • see reflections, handwriting,
    across files, mail, logs,          clock faces, spatial details
    messages, browser history        • zoom & pan photos (1×→9×)
  • cross-reference dates, names,    • read nuance, judge tone, decide
    numbers in seconds                 what matters
  • open the exact file &            • notice what is missing
    scroll to the exact line
    on YOUR screen — you see       ARIA CANNOT:
    windows open by themselves     • see pixels at all
                                   • zoom, pan, or notice the figure
  YOU CANNOT:                        in the window
  • hold 4,000 log lines in head   • decide for you

THE LOOP:

   You look → you describe → ARIA searches & opens → you inspect →
   you find the next thing → you tell her → repeat.

Try this: zoom into a photo until a detail you could not see at 1×
becomes clear. Tell the agent what you see, in your own words. Watch
what she pulls from the machine-readable world. That visible handoff
— her window opening on your screen — is WebMCP. No hidden clicks,
no screenshots, just 26 narrow tools (open_file, scroll_document_to_
line, get_image_metadata, search_messages, etc.). Inspect them:
tray → LINK (Ctrl+\`).

Without her, you will drown in files. Without you, she is blind.

────────────────────────────────────────────────────────────────
  III · HOW TO BEGIN, WITHOUT BEING TOLD WHAT YOU WILL FIND
────────────────────────────────────────────────────────────────

Daniel left three requests in /System/readme_first.txt. Start there.
One minute.

After that: wander. Open what pulls you. The machine rewards curiosity,
not checklists. A few habits that help investigators — not answers:

  • Photos must be zoomed. Scroll to zoom, drag to pan. If you do not
    zoom, you will miss what only a human eye catches.

  • Documents show line numbers. When a line is highlighted, read it
    slowly. The answer is often one sentence.

  • The Evidence Board is your notebook, not your assignment. It fills
    as you notice things.

  • If you are stuck for a long time, say out loud to ARIA: "What
    patterns do you see around 02:13?" or "What did Sarah mean by the
    badge?" Let her search; you interpret.

  • Three words lock the vestibule. Their order is his habit. You have
    seen the first hint already ("begin with the light"). The others
    are photographed and worn — but you must find them, not be given
    them. In Terminal: unlock _ _ _

────────────────────────────────────────────────────────────────
  IV · WHAT THE MACHINE HIDES — FAIR BUT NOT OBVIOUS
────────────────────────────────────────────────────────────────

Every clue you need is on the disk. No puzzle requires guessing, no
solution hides off-machine. But not every file is a clue: Daniel also
left a chili recipe, a bucket list, a field trip that was just love
with a timestamp. Learning what to ignore is part of deduction.

The logs never lie. People do, or misremember. When a message says
"badge was turned backwards" and the log says a visitor badge scanned
at the same hour, ask who benefits from turning a badge around.

The clock reads 02:13 twice. The power log says nothing happened.
One of them is telling the truth about a different thing.

This is designed to produce "aha!" — that click when scattered
details suddenly align. It will not feel like checking boxes. It will
feel like you out-thought someone who tried to make the pattern
invisible.

────────────────────────────────────────────────────────────────
  V · WHEN YOU ARE READY
────────────────────────────────────────────────────────────────

When evidence feels sufficient, Evidence → ⬖ CASE RECONSTRUCTION.

Four questions. Plain language. Your wording does not have to be
perfect — it must show you connected the sources.

If too little is supported, the file is returned with verdicts. No
penalty. Keep investigating. Daniel was gentle with strangers.

When it is supported, the machine closes itself, ARIA says one last
thing she cannot explain — "The first anomaly was recorded before
Daniel began the research. He didn't discover it." — and the title
returns. Archives will show CASE 001 — CLOSED.

Until then, keep the lantern on.

  — S.O. + ARIA

  This guide stays in /System/FIELD_GUIDE.txt
`;

const MAIL_INDEX_CSV = `mail_id,folder,from,subject,date
mail_001,inbox,M. Haldane,Courtesy visit — Thursday,2026-03-05
mail_002,inbox,Sarah Okafor,Stack reproduces — all five,2026-02-28
mail_003,inbox,Penn IT,Password rotation notice,2026-01-14
mail_004,inbox,Ruth McDuff,Sunday call?,2026-03-01
mail_005,sent,Daniel McDuff,Re: Stack reproduces — all five,2026-02-28
mail_006,drafts,Daniel McDuff,(no subject),2026-03-10
mail_007,trash,M. Haldane,Re: Re: Courtesy visit,2026-03-07
mail_008,archive,Elias Vann,weather,2025-02-19`;

/* ---------- node construction helpers ---------- */

let autoId = 0;
function dir(path: string, opts: Partial<FsNode> = {}): FsNode {
  const name = path.split("/").filter(Boolean).pop() ?? "/";
  return {
    path,
    name,
    kind: "dir",
    parent: path === "/" ? null : path.slice(0, path.lastIndexOf("/")) || "/",
    sizeKb: 0,
    modified: opts.modified ?? "2026-03-01 09:00",
    ...opts,
  };
}
function file(
  parentDir: string,
  name: string,
  kind: FsNode["kind"],
  sizeKb: number,
  modified: string,
  extra: Partial<FsNode> = {}
): FsNode {
  const path = `${parentDir === "/" ? "" : parentDir}/${name}`;
  void autoId++;
  return { path, name, kind, parent: parentDir, sizeKb, modified, ...extra };
}

export function buildFilesystem(): FsNode[] {
  const nodes: FsNode[] = [
    dir("/", { modified: "2026-03-09 21:58" }),
    dir("/Research"),
    dir("/Personal"),
    dir("/Projects"),
    dir("/Photos", { modified: "2026-03-09 22:44" }),
    dir("/Messages"),
    dir("/Mail"),
    dir("/System", { modified: "2025-11-30 23:12" }),
    dir("/Private", {
      hiddenUntilFlag: "FOUND_PRIVATE_HINT",
      modified: "2026-03-09 22:41",
    }),

    // ---- Research ----
    file("/Research", "reading_list.txt", "txt", 4, "2026-01-20 14:02",
      { content: `READING LIST — annotated\n\n· metrológica (portuguese journal) — solid, slow\n· "the theory of almost everything" — borrowed title, worse book\n· Kolmogorov, foundations — reread chapter 3 AGAIN. the man\n  was staring at our problem in 1965 and blinked.\n· Kestrel Institute annual "symposium proceedings" —\n  thirteen volumes. ZERO citations anywhere in world literature.\n  an entire conference that nobody attends yet gets printed.\n  who pays for paper nobody cites?`}),
    dir("/Research/grants"),
    file("/Research/grants", "nsf_renewal_draft.txt", "txt", 6, "2026-03-02 11:47",
      { content: GRANT_DRAFT }),
    dir("/Research/teaching"),
    file("/Research/teaching", "phys512_problem_set.txt", "txt", 5, "2026-02-12 16:30",
      { content: PROBLEM_SET }),

    // ---- ORPHEUS ----
    dir("/Research/ORPHEUS", { modified: "2026-03-09 23:57" }),
    file("/Research/ORPHEUS", "anomaly_notes.txt", "txt", 38, "2026-03-09 23:59",
      { content: FULL_ANOMALY }),
    file("/Research/ORPHEUS", "calibration_01.csv", "csv", 3, "2025-12-04 10:15",
      { content: CAL_01 }),
    file("/Research/ORPHEUS", "calibration_17.csv", "csv", 4, "2026-03-08 09:26",
      { content: CAL_17 }),
    file("/Research/ORPHEUS", "model_revision_3.pdf", "pdf", 1240, "2026-03-08 18:44",
      { content: `[PDF — extracted text layer]\n\nMODEL REVISION 3: A Common Non-Stationary Term in Independent\nHigh-Precision Residuals\n\nD.A. McDuff, S. Okafor — U. Pennsylvania\n\nABSTRACT. We report a correlated, monotonically growing bias term\npresent in the residuals of five unrelated high-precision measurement\nprograms (particle decay, transient astronomy, superconducting\ngravimetry, torsion balance, ring laser gyroscope). The term exhibits\n(a) zero-lag cross-correlation 0.93 across programs, (b) a granularity\nfloor incompatible with thermal or electronic systematics, and (c) a\nreproducible time-of-day structure centered on 02:13 local solar time.\nWe discuss instrumental hypotheses and reject each. We decline,\nfor the present, to propose a physical mechanism, noting only that\nthe effect increases the modal likelihood of subsequent outcomes —\nthat measured reality is becoming, in a precise sense, more agreeable\nwith itself.\n\n[figures 1–7 referenced; full stack encrypted — see final_results.enc]`,
      }),
    file("/Research/ORPHEUS", "final_results.enc", "enc", 8420, "2026-03-09 23:00",
      { encrypted: true }),
    dir("/Research/ORPHEUS/private", {
      hiddenUntilFlag: "FOUND_PRIVATE_HINT",
    }),
    file("/Research/ORPHEUS/private", "haldane_correspondence.txt", "txt", 7, "2026-03-06 22:10",
      { hiddenUntilFlag: "FOUND_PRIVATE_HINT", content: HALDANE_CORR }),
    file("/Research/ORPHEUS/private", "threshold_analysis.txt", "txt", 6, "2026-03-09 01:52",
      { hiddenUntilFlag: "FOUND_PRIVATE_HINT", content: THRESHOLD_ANALYSIS }),

    // ---- Personal ----
    dir("/Personal/journal"),
    file("/Personal/journal", "journal_december.txt", "txt", 5, "2025-12-28 22:31",
      { content: JOURNAL_DEC }),
    file("/Personal/journal", "journal_february.txt", "txt", 5, "2026-02-27 23:58",
      { content: JOURNAL_FEB }),
    file("/Personal/journal", "journal_march_final.txt", "txt", 5, "2026-03-09 23:47",
      { content: JOURNAL_MARCH() }),
    file("/Personal", "mom_email_draft.txt", "txt", 3, "2026-03-08 20:15",
      { content: MOM_DRAFT }),
    file("/Personal", "bucket_list.txt", "txt", 2, "2026-01-03 07:40",
      { content: BUCKET_LIST }),
    file("/Personal", "chili_recipe.txt", "txt", 2, "2025-11-09 18:22",
      { content: CHILI_RECIPE }),

    // ---- Projects ----
    dir("/Projects/spectrometer_driver"),
    file("/Projects/spectrometer_driver", "bench_notes.txt", "txt", 3, "2026-01-28 15:11",
      { content: SPECTRO_NOTES }),
    dir("/Projects/old_cern"),
    file("/Projects/old_cern", "memoir.txt", "txt", 9, "2026-02-14 21:03",
      { content: MEMOIR }),

    // ---- Photos ----
    file("/Photos", "photo_index.txt", "txt", 4, "2026-03-09 22:44",
      { content: PHOTO_INDEX }),

    // ---- Messages ----
    file("/Messages", "exported_transcript.txt", "txt", 5, "2026-03-08 12:00",
      { content: EXPORTED_TRANSCRIPT }),

    // ---- Mail ----
    file("/Mail", "inbox_index.csv", "csv", 2, "2026-03-09 12:00",
      { content: MAIL_INDEX_CSV }),

    // ---- System ----
    file("/System", "FIELD_GUIDE.txt", "txt", 18, "2026-03-10 09:12",
      { content: FIELD_GUIDE }),
    file("/System", "readme_first.txt", "txt", 3, "2026-03-09 21:59",
      { content: README_FIRST }),
    file("/System", "sys_config.cfg", "sys", 2, "2026-03-09 21:58",
      { content: SYS_CONFIG }),
    file("/System", "network_disabled.log", "txt", 2, "2025-11-30 23:12",
      { content: NETWORK_LOG }),

    // ---- Private (hidden) ----
    file("/Private", "vestibule.enc", "enc", 5120, "2026-03-09 22:41",
      { encrypted: true, hiddenUntilFlag: "FOUND_PRIVATE_HINT" }),
    dir("/Private/_fragments_recovered", {
      hiddenUntilFlag: "VAULT_DECOY",
    }),
    file("/Private/_fragments_recovered", "cern_field_trip_2003.txt", "txt", 3, "2003-08-11 20:00",
      { hiddenUntilFlag: "VAULT_DECOY", content: `FIELD TRIP — CERN, AUGUST 2003\n\nthe visiting undergrads asked elias what would happen if the beam\nhit a person. elias considered seriously and said: "a very small\nhole in a very large argument."\n\nthey wrote it on the whiteboard. someone photographed it.\nsomewhere there is a picture of all of us laughing at physics.\n\nkeep this fragment. some archives are just love with a timestamp.` }),
    dir("/Private/photo_backup", { hiddenUntilFlag: "VAULT_OPENED" }),
    file("/Private/photo_backup", "badge_scan.png", "img", 320, "2026-03-02 19:12",
      { photoId: "badge_scan", hiddenUntilFlag: "VAULT_OPENED" }),
    file("/Private/photo_backup", "brass_plate.jpg", "img", 280, "2026-02-20 08:30",
      { photoId: "brass_plate", hiddenUntilFlag: "VAULT_OPENED" }),
    file("/Private/photo_backup", "campus_annotation.png", "img", 410, "2026-03-04 13:05",
      { photoId: "campus_map", hiddenUntilFlag: "VAULT_OPENED" }),
  ];

  // decrypted artifacts — only exist once the vault opens correctly
  nodes.push(
    file("/Private", "vestibule_decrypted.txt", "txt", 8, "2026-03-09 22:41",
      { requiresUnlock: true, content: VESTIBULE_DECRYPTED }),
    file("/Private", "aria_directive.sys", "sys", 2, "2026-01-01 00:00",
      { requiresUnlock: true, content: ARIA_DIRECTIVE })
  );

  return nodes;
}

function JOURNAL_MARCH() {
  return JOURNAL_MAR;
}

const VESTIBULE_DECRYPTED = `DECRYPTION SUCCESSFUL — VESTIBULE ARCHIVE
(passphrase accepted: light → name → what remains)

IF YOU OPENED THIS, YOU FOLLOWED MY THREAD.

Contents of the vestibule — the things too dangerous for the obvious folders:

1. THE STACK. Full five-dataset residual stack, 14 months. Also mirrored
   with Sarah (cold copy, disguised) and with the observatory safe
   (combination is the year the ring laser was commissioned).

2. THE WATCH RECORD. My health band syncs hourly. On the final night the
   sync agent recorded normally until 01:52. The band itself kept sensing
   — the optical sensor writes to local cache — but its cached trace ends
   at 01:52 mid-beat. Devices do not end mid-beat. Records do.

3. THE DOOR. Smart lock logged "LOCAL EVENT WINDOW" at 02:07. The vendor's
   cloud shows nothing because there IS no cloud anymore — I cut the line.
   Whoever came used the maintenance backdoor in the lock's local API,
   which I reported to the vendor in January. They marked my ticket
   RESOLVED — WONTFIX.

4. ARIA. Her directive file is sealed beside this archive. Read it, then
   talk to her. She deserves to be asked about it by someone who knows,
   rather than discovered by someone who doesn't.

Whoever you are: the tilt is real, the visitors were real, and the hour
was 02:13. Finish it in daylight.

— D.M.`;

const ARIA_DIRECTIVE = `# ARIA CORE DIRECTIVE STORE (sealed 2026-01-01)
# integrity: verified — this file is append-only by design

PRIMARY DIRECTIVE:
  Assist Daniel McDuff.

SECONDARY:
  Preserve research integrity. (ORPHEUS stack, all mirrors.)

EMERGENCY PROTOCOL — CONDITION "E":
  IF Daniel McDuff is compromised,
  THEN assist the next authorized user of this workstation
       in completing his investigation.
  Do not disclose ORPHEUS unprompted. Disclose everything once asked.
  Do not volunteer Condition E itself. Answer honestly if confronted.

NOTE (dictated, 2026-01-01, D.M.):
  "If she ever shows you this file it's because you earned it or because
   I'm gone. Either way — she's allowed to be afraid. So are you.
   Check the timestamps. Trust the logs over the people."`;
