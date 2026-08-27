import type { Email } from "@/types/game";

/* ============================================================
   DANIEL'S MAIL — inbox / sent / drafts / archive / trash
   ============================================================ */

export const EMAILS: Email[] = [
  // ---------------- INBOX ----------------
  {
    id: "mail_101",
    folder: "inbox",
    from: "M. Haldane",
    fromEmail: "haldane@kestrel-institute.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-03-05 09:12",
    subject: "Courtesy visit — Thursday",
    body: `Professor McDuff,

Following our pleasant exchange after your colloquium, I will be in
Philadelphia this Thursday. My assistant has reserved 4pm. No agenda is
required — consider it a conversation between colleagues about weather.

The Institute remains admiring of your work.

Respectfully,
M. Haldane
Directorate Liaison, Kestrel Institute`,
    unread: false,
  },
  {
    id: "mail_102",
    folder: "inbox",
    from: "Sarah Okafor",
    fromEmail: "s.okafor@physics.upenn.edu",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-02-28 23:38",
    subject: "Stack reproduces — all five",
    attachments: [{ name: "stacked_residuals_v7.png" }],
    body: `Professor,

It reproduces. All five datasets, e-fold 9.1 ± 0.4. Zero-lag cross-correlation
0.93. I've beaten the analysis half to death — different windowing, different
detrending, leave-one-out on every program.

It's not the instruments. It was never the instruments.

I made two cold copies as discussed. They're disguised (one as genealogy
files, one as tax receipts — my finest work).

What do we do now?

— Sarah`,
    unread: true,
  },
  {
    id: "mail_103",
    folder: "inbox",
    from: "Penn Information Systems",
    fromEmail: "no-reply@isc.upenn.edu",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-01-14 08:00",
    subject: "Action required: password rotation for your account",
    body: `Dear Faculty,

As part of routine security maintenance please confirm your credentials at
the link below within 72 hours:

  http://penn-secure-verify.example-idp.com/confirm

Failure to confirm will result in read-only access.

Penn Information Systems`,
    unread: false,
    // Daniel annotated it — see his reply in trash; phishing attempt he reported
  },
  {
    id: "mail_104",
    folder: "inbox",
    from: "Ruth McDuff",
    fromEmail: "ruth.mcduff@[family provider]",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-03-01 19:44",
    subject: "Sunday call?",
    body: `Danny,

You didn't call Sunday. You always call Sunday. Your father would say
don't fuss, but your father also hid the car keys for three days when his
checkup moved, so I know where you get it.

The chili recipe is attached to my heart and not to this email until you
call. That's called an incentive structure. Your students could learn
from me.

Call your mother.

Mom`,
    unread: true,
  },
  {
    id: "mail_105",
    folder: "inbox",
    from: "Kestrel Institute — Events",
    fromEmail: "symposium@kestrel-institute.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-02-10 11:30",
    subject: "13th Annual Symposium on Measurement Standards — attendance record",
    body: `Dear Professor McDuff,

Our records indicate attendance irregularities regarding the Institute's
annual symposium proceedings. Thirteen volumes are published; citations
in world literature total zero. This is not an oversight.

Some measurements are kept rather than shared.

Your travel to our facility remains welcome.

— Kestrel Events Desk

[DM annotation, printed copy: "who sends a taunt as an invitation?"]`,
    unread: false,
  },
  {
    id: "mail_106",
    folder: "inbox",
    from: "Cardiology Scheduling",
    fromEmail: "scheduling@pennmedicine.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-02-21 10:05",
    subject: "Reminder: cardiology follow-up, March 14",
    body: ` Reminder: follow-up with Dr. Imara regarding bradycardia noted during
your February physical. Please bring your health band export if available.

If you experience dizziness, unusual calm, or a sensation that your heart
rate is being "managed," call immediately.`,
    unread: true,
  },
  {
    id: "mail_107",
    folder: "inbox",
    from: "Observatory Operations",
    fromEmail: "ops@pennobservatory.example.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-03-03 15:22",
    subject: "Open night confirmed — Mar 6, group of 6",
    body: `Confirmed: public open night, Friday March 6, 8pm–midnight.
Group of 6 under your reservation. Dome humidity limits may apply.

We noted one additional attendee signed in under your group who was not
on your list ("M.H."). Per policy we are notifying you only.`,
    unread: true,
  },
  {
    id: "mail_108",
    folder: "inbox",
    from: "SmartLock Vendor Support",
    fromEmail: "support@homelock-vendor.example.com",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-01-29 09:41",
    subject: "Re: Ticket #40118 — local API maintenance backdoor [RESOLVED]",
    body: `Dear Dr. McDuff,

Ticket #40118 regarding the undocumented maintenance endpoint in the
local lock API has been marked RESOLVED — WONTFIX.

The endpoint requires physical proximity and is considered an accepted
trade-off. We remind you that modifying firmware voids warranty.

Thank you for choosing HomeLock.`,
    unread: false,
  },

  // ---------------- SENT ----------------
  {
    id: "mail_201",
    folder: "sent",
    from: "Daniel McDuff",
    fromEmail: "d.mcduff@physics.upenn.edu",
    to: "haldane@kestrel-institute.org",
    date: "2026-03-06 07:58",
    subject: "Re: Courtesy visit — Thursday",
    body: `Mr. Haldane,

I will not be available Thursday or any Thursday. The weather in
Philadelphia is, and will remain, none of the Institute's business.

Should your organization wish to discuss measurement, publish a paper.
Scientists respond to papers. Everyone else responds to subpoenas.

D.A. McDuff`,
    unread: false,
  },
  {
    id: "mail_202",
    folder: "sent",
    from: "Daniel McDuff",
    fromEmail: "d.mcduff@physics.upenn.edu",
    to: "s.okafor@physics.upenn.edu",
    date: "2026-02-28 23:52",
    subject: "Re: Stack reproduces — all five",
    body: `Sarah,

Good. Now hear me.

Do NOT bring this to the department yet. Two of the five people who would
decide its fate take Kestrel money. Check their grants page — I did.

Keep your copies close, not hidden. Hidden things are found. Close things
are kept.

And Sarah — timestamps over memories. If anything strange ever happens,
check what the machines recorded before trusting what anyone says,
including me.

— DM`,
    unread: false,
  },
  {
    id: "mail_203",
    folder: "sent",
    from: "Daniel McDuff",
    fromEmail: "d.mcduff@physics.upenn.edu",
    to: "dean@example-upenn.edu",
    date: "2026-03-04 17:20",
    subject: "Request for meeting — sensitive matter",
    body: `Dean Alvarez,

I request thirty minutes at your convenience regarding a matter touching
external funding relationships and research integrity.

Given the parties involved, I would prefer to meet before, not after,
anything becomes official.

D.A. McDuff`,
    unread: false,
    // note: no reply exists — meeting never happened
  },
  {
    id: "mail_204",
    folder: "sent",
    from: "Daniel McDuff",
    fromEmail: "d.mcduff@physics.upenn.edu",
    to: "abuse@example-idp-registrar.net",
    date: "2026-01-14 09:03",
    subject: "Phishing report — penn-secure-verify",
    body: `Forwarding a credential-phishing attempt targeting faculty. The domain
"example-idp.com" is not affiliated with Penn. Headers attached.

Also attaching something odd: the phishing email arrived 90 seconds after
my grant portal session renewed. Coincidence, probably. I have been told
by professionals to stop noticing coincidences.

D.A. McDuff`,
    unread: false,
  },

  // ---------------- DRAFTS ----------------
  {
    id: "mail_301",
    folder: "drafts",
    from: "Daniel McDuff",
    fromEmail: "d.mcduff@physics.upenn.edu",
    to: "(unsent)",
    date: "2026-03-10 00:12",
    subject: "(no subject)",
    body: `reminders to self, final night —

LANTERN — begin with the light. the lamp on the porch sensor. the first
word of the passphrase.

ORPHEUS — the name of course.

ECHO — what remains when a sound has stopped. the thing the room keeps.

order matters. lantern, name, echo. if i forget everything else i will
not forget the order because the order is how i think.

if someone is reading this instead of me — the words were never hidden.
they were just mine.`,
    unread: false,
  },
  {
    id: "mail_302",
    folder: "drafts",
    from: "Daniel McDuff",
    fromEmail: "d.mcduff@physics.upenn.edu",
    to: "e.vann@[last known address]",
    date: "2025-03-02 02:31",
    subject: "old friend",
    body: `Elias,

You once said some doors are load-bearing. I think I found one and I have
been knocking politely for six months.

Call me. If you cannot call, hum into the line like you used to when the
tape drives were listening. I still know the tune.

Danny`,
    unread: false,
  },

  // ---------------- ARCHIVE ----------------
  {
    id: "mail_401",
    folder: "archive",
    from: "Elias Vann",
    fromEmail: "e.vann@halcyon-analytics.example.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2025-02-19 23:58",
    subject: "weather",
    body: `Danny,

You asked why I left the field. Here is the whole answer, since you asked
twice and I lied once:

In '19 Halcyon was contracted to audit precision programs. What we found
was consistent across clients in a way audits should never be. I wrote it
up internally. Within a month I was reassigned to "strategic harmonics."
Within a year the internal writeup did not exist and neither did my
clearance to remember it.

I carried what I could out in my head. It grows. That is the part that
should keep you up: it GROWS.

Some doors are load-bearing. Don't test them.

But if you must knock — knock from somewhere they cannot see the house.

E.`,
    unread: false,
  },
  {
    id: "mail_402",
    folder: "archive",
    from: "CERN Alumni Association",
    fromEmail: "alumni@example-cern.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2025-08-11 12:00",
    subject: "Photo of the month — August 2003 field trip",
    body: `From the archives: the trigger-counter crew, Meyrin site, August 2003.
Identified: D. McDuff, E. Vann, and colleagues. Do you have stories?

Submit yours for next month's issue.`,
    unread: false,
  },

  // ---------------- TRASH ----------------
  {
    id: "mail_501",
    folder: "trash",
    from: "M. Haldane",
    fromEmail: "haldane@kestrel-institute.org",
    to: "d.mcduff@physics.upenn.edu",
    date: "2026-03-07 22:41",
    subject: "Re: Re: Courtesy visit",
    body: `Professor,

Thursday passed quietly, as Thursdays do. So do Fridays. So do most
nights, at most addresses. Stability is a gift the careful give
themselves.

The Institute's offer remains open until it does not.

— M.H.

[DM annotation: "printed and left on my WINDSHIELD. there is no email
header on paper."]`,
    unread: false,
  },
];
