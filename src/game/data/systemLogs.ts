import type { LogEntry } from "@/types/game";

/* ============================================================
   SYSTEM LOG — the machine's testimony.
   The final night is recorded minute by minute.
   ============================================================ */

function e(
  id: string,
  date: string,
  time: string,
  category: LogEntry["category"],
  severity: LogEntry["severity"],
  detail: string
): LogEntry {
  return { id, date, time, category, severity, detail };
}

export const LOGS: LogEntry[] = [
  // ---------- routine (older) ----------
  e("log_001", "2026-01-14", "09:03:11", "SECURITY", "info", "Phishing report forwarded to abuse@ by user DANIEL (ticket ISC-88219 opened)"),
  e("log_002", "2026-01-27", "10:18:44", "APP", "info", "BROWSER visited docs.homelock-vendor.example.com/local-api (bookmark)"),
  e("log_003", "2026-01-29", "09:41:02", "SYSTEM", "warn", "Vendor ticket #40118 status change: RESOLVED-WONTFIX (local API maintenance endpoint)"),
  e("log_004", "2026-02-11", "14:31:20", "FILE", "info", "READ /Research/ORPHEUS/calibration_17.csv by user DANIEL"),
  e("log_005", "2026-02-15", "11:02:33", "NETWORK", "warn", "Outbound blocked: NIST atomic clock ensemble (network disabled at wall plate)"),
  e("log_006", "2026-02-26", "16:40:51", "SYSTEM", "info", "MESSAGES inbound thread 'unknown_W' created (no contact record)"),
  e("log_007", "2026-02-28", "23:52:07", "FILE", "info", "WRITE /Research/ORPHEUS/final_results.enc (nightly re-encrypt, task nycrypt)"),
  e("log_008", "2026-03-02", "08:15:39", "APP", "info", "MESSAGES outbound to t_sarah"),
  e("log_009", "2026-03-05", "09:12:04", "APP", "info", "MAIL received: haldane@kestrel-institute.org 'Courtesy visit — Thursday'"),
  e("log_010", "2026-03-06", "07:58:22", "APP", "info", "MAIL sent: reply to haldane@kestrel-institute.org"),
  e("log_011", "2026-03-06", "20:04:55", "DEVICE", "info", "OBSERVATORY open night — no local activity (machine idle)"),

  // ---------- the week before ----------
  e("log_012", "2026-03-07", "02:06:58", "SECURITY", "alert", "SMART LOCK: LOCAL EVENT WINDOW opened — front door (no cloud record; line cut)"),
  e("log_013", "2026-03-07", "02:07:31", "SECURITY", "alert", "BUILDING ACCESS (lab): card #A-4417 accepted — LAB WEST — cardholder: MCDUFF, D. [NOTE: home is 22 min away; watch shows no travel]"),
  e("log_014", "2026-03-07", "02:13:02", "POWER", "warn", "Power quality event: 40ms brown-out, study circuit (clock reset observed)"),
  e("log_015", "2026-03-07", "10:12:18", "APP", "info", "MESSAGES inbound t_lab: door event query from MIRA S."),
  e("log_016", "2026-03-07", "22:41:33", "DELETE", "warn", "Trash purged automatically: 1 item (mail 'Re: Re: Courtesy visit' retained in TRASH folder instead — user override)"),
  e("log_017", "2026-03-08", "09:26:41", "FILE", "info", "WRITE /Research/ORPHEUS/calibration_17.csv (append: stacked row)"),
  e("log_018", "2026-03-08", "11:55:12", "APP", "info", "BROWSER search: air-gapped cold copy strategy (tax receipts / genealogy naming)"),
  e("log_019", "2026-03-08", "12:00:45", "FILE", "info", "WRITE /Messages/exported_transcript.txt (partial export by user DANIEL)"),
  e("log_020", "2026-03-08", "20:15:29", "APP", "info", "EDITOR opened mom_email_draft.txt (unsent)"),
  e("log_021", "2026-03-08", "22:15:50", "APP", "info", "BROWSER visited manpages: openssl enc (bookmark)"),
  e("log_022", "2026-03-08", "22:41:19", "FILE", "info", "MOVE /Private/vestibule.enc → re-encrypted with 3-word rotating passphrase (order: light/name/echo)"),

  // ---------- THE FINAL NIGHT — 2026-03-09/10 ----------
  e("log_023", "2026-03-09", "21:58:01", "LOGIN", "info", "LOGIN user DANIEL — session interactive (workstation console)"),
  e("log_024", "2026-03-09", "21:59:12", "FILE", "info", "WRITE /System/readme_first.txt"),
  e("log_025", "2026-03-09", "22:10:33", "APP", "info", "EDITOR opened /Research/ORPHEUS/anomaly_notes.txt"),
  e("log_026", "2026-03-09", "22:44:08", "FILE", "info", "WRITE /Photos/photo_index.txt"),
  e("log_027", "2026-03-09", "23:00:00", "FILE", "info", "TASK nightly_encrypt: /Research/ORPHEUS/final_results.enc rotated (passphrase cycle 47)"),
  e("log_028", "2026-03-09", "23:47:56", "FILE", "info", "WRITE /Personal/journal/journal_march_final.txt"),
  e("log_029", "2026-03-09", "23:57:30", "FILE", "info", "APPEND /Research/ORPHEUS/anomaly_notes.txt (final entry, unfinished)"),
  e("log_030", "2026-03-09", "23:59:59", "LOGIN", "info", "LOGOUT user DANIEL (console lock engaged)"),
  e("log_031", "2026-03-10", "01:52:18", "DEVICE", "warn", "HEALTH BAND sync agent: last successful poll. Optical cache continues locally."),
  e("log_032", "2026-03-10", "02:06:57", "SECURITY", "alert", "SMART LOCK: LOCAL EVENT WINDOW opened — front door (maintenance API, ticket #40118 endpoint)"),
  e("log_033", "2026-03-10", "02:07:04", "DEVICE", "alert", "USB DEVICE MOUNT: vid_0000&pid_0003 'UNKNOWN-USB' — serial not in known devices"),
  e("log_034", "2026-03-10", "02:11:40", "POWER", "warn", "Power quality event: 40ms brown-out, study circuit (wall clock stopped 02:13 display lag)"),
  e("log_035", "2026-03-10", "02:13:07", "LOGIN", "alert", "LOGIN user S.OKAFOR — credentials VALID — origin: console (physical) — [NOTE: S.OKAFOR badged into PENN LAB WEST 02:07, 22 min away; biometric gait mismatch flagged by door telemetry]"),
  e("log_036", "2026-03-10", "02:13:14", "FILE", "alert", "READ /Research/ORPHEUS/final_results.enc by session S.OKAFOR"),
  e("log_037", "2026-03-10", "02:13:21", "NETWORK", "alert", "CONNECTION ATTEMPT BLOCKED — destination unresolved (.onion resolver) — network disabled at wall plate"),
  e("log_038", "2026-03-10", "02:13:44", "NETWORK", "alert", "CONNECTION ATTEMPT BLOCKED — kestrel-institute.org:8443 — network disabled"),
  e("log_039", "2026-03-10", "02:14:02", "NETWORK", "alert", "CONNECTION ATTEMPT BLOCKED — satellite uplink daemon (not installed on this machine)"),
  e("log_040", "2026-03-10", "02:19:55", "FILE", "alert", "COPY ATTEMPT: final_results.enc → UNKNOWN-USB (FAILED — encrypted volume refused mount-by-copy)"),
  e("log_041", "2026-03-10", "02:24:31", "FILE", "alert", "READ /Research/ORPHEUS/anomaly_notes.txt by session S.OKAFOR"),
  e("log_042", "2026-03-10", "02:26:12", "DELETE", "alert", "SECURE WIPE INITIATED by session S.OKAFOR — target: /Research/ORPHEUS/* — ABORTED at 3% (task nycrypt held file locks)"),
  e("log_043", "2026-03-10", "02:26:40", "FILE", "alert", "ATTRIB CHANGE: /Private/* visibility flags cleared (folder hidden)"),
  e("log_044", "2026-03-10", "02:31:08", "DEVICE", "alert", "USB DEVICE UNMOUNT: UNKNOWN-USB"),
  e("log_045", "2026-03-10", "02:31:09", "LOGIN", "alert", "LOGOUT user S.OKAFOR (session duration 18m02s)"),
  e("log_046", "2026-03-10", "02:31:44", "SECURITY", "alert", "SMART LOCK: front door closed — LOCAL EVENT WINDOW ended"),

  // ---------- after ----------
  e("log_047", "2026-03-10", "06:41:00", "SYSTEM", "warn", "Health band sync agent: retry loop began (device unreachable). Cache gap 01:52–∞."),
  e("log_048", "2026-03-10", "08:02:19", "SYSTEM", "info", "ARIA service wake-on-event: authorized-user-absent timer exceeded threshold — ARIA placed in assist mode per directive store"),
  e("log_049", "2026-03-10", "08:02:20", "SECURITY", "warn", "Remote access attempts begin from external relay (via ISP-side management VLAN — line physically cut; attempts arrive anyway)"),
  e("log_050", "2026-03-10", "08:15:00", "SECURITY", "alert", "Remote access attempt #2 blocked — signature matches vendor maintenance tooling (HomeLock SDK)"),
  e("log_051", "2026-03-10", "09:12:36", "SYSTEM", "info", "Sarah Okafor arrives at residence (doorbell cam event) — welfare check — investigation begins"),
];
