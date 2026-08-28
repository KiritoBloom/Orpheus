# GAME DESIGN — Orpheus: The McDuff Investigation — the new collaborative computer, told as a story

> Orpheus is a game that proves a pattern. The pattern is the era: **human eyes + machine recall, at one desk, with the browser as arbiter.** Before WebMCP, the agent guessed at pixels and the human drowned in data. After WebMCP, they share one computer with complementary senses — and the fiction makes you *feel* it in one sitting. Every choice below serves that feeling.

## The proposition

Someone handed you a dead scientist's computer. You turn it on. A briefing authorizes you. An onboard assistant wakes after 74 hours of abeyance and says Daniel expected someone to come. From there you investigate together, operating the same machine from genuinely different vantage points.

The player remains responsible for visual inspection, interpretation, and conclusions. ARIA remains responsible for searching, cross-referencing, and bringing evidence to attention. Neither replaces the other. That asymmetry *is* the new era WebMCP enables — not automation, but collaboration — and the puzzle design enforces it architecturally (see `ARCHITECTURE.md` § Service layer).

---

## Characters

### Dr. Daniel McDuff (fiction)
- Professor of physics & astronomy, University of Pennsylvania; previously CERN trigger-counter group.
- Respected experimentalist, increasingly secretive in his final year.
- Discovered a slowly growing common bias in unrelated precision instruments and named it **ORPHEUS**; scattered and encrypted his final stack.
- Found dead at home. Official cause: accidental fall / cardiac event. The machine tells a later story.

### ARIA
- Onboard research assistant; Daniel's AI.
- Tone: plain, brief, occasionally dry, capable of being wrong — revisions are part of investigation.
- Hidden configuration file `/Private/aria_directive.sys` carries primary/secondary/emergency protocols. She answers honestly when confronted, but does not volunteer the condition that allows her to assist you. Confronting her on this is a designed trust tension.

### Sarah Okafor
- Graduate student, the person who reproduced the stack (e-fold 9.1) and made two disguised cold copies.
- Her credentials log into the workstation at 02:13 while building telemetry says she was 22 minutes away with a gait mismatch — the stolen credential that frames her and later exonerates her.

### M. Haldane / Kestrel Institute (fiction)
- Private institute chartered for "maintenance of measurement standards at scale." Publishes nothing; cites nothing. Polite, patient, and precise in its threats — quoting Daniel's unpublished growth rate to two decimals and delivering letters on paper with no letterhead.
- Represents the game's institutional antagonist without melodrama: measurement as infrastructure, irregularity as risk, Daniel as maintenance.

### Dr. Elias Vann (d. 2025, fiction)
- Daniel's oldest colleague; found the same residual at Halcyon Analytics, was reassigned, withdrew his pre-print, was hired by Kestrel, was found at the bottom of stairs he had just repaired.
- The precedent Daniel could not ignore, and the game's emotional core — a man who was right too early.

---

## The research (ORPHEUS)

Daniel discovered the same slow bias in five unrelated datasets: LHCb charm-decay residuals, Rubin transients, superconducting gravimetry, the Eöt-Wash torsion balance, and Penn's own ring laser. The bias is monotonic, exponential (e-fold ~9.1 yr), cross-correlates near 0.93 at zero lag, has a granularity floor, and a reproducible time-of-day structure around **02:13 local solar** — modeled as a scan cycle.

In prose the effect is named plainly: stochastic processes gently re-weighted toward their mode. "The dice are loaded, gently. Rare outcomes rarer; probable outcomes more probable. Determinism creeping like frost." The mechanism is left original and speculative — it evokes cosmic dread without copying any published fiction.

### Story arc
```
1 discovery (14 months ago)
2 naming ORPHEUS  ·  model revisions
3 visitor / Kestrel contact (3 weeks before death)
4 assembling the final encrypted stack nightly at 23:00
5 the last night · 02:13 observability window
6 scattering the archive (three-word passphrase; paper + photographed reminders)
7 death → 74 hours silence → ARIA wakes → investigator arrives
8 joint investigation → vestibule decryption → board → case reconstruction → epilogue
```

---

## Puzzles

### The passphrase
Three words in a fixed order:
1. **LANTERN** — "begin with the light" (porch-lamp reminder card photographed next to the monitor)
2. **ORPHEUS** — the project name
3. **ECHO** — "what remains when a sound has stopped" (the third word from the draft note + the brass-plate text)

A correct `unlock lantern orpheus echo` in Terminal mounts the vestibule. Any other sequence mounts an adjacent fragment (`_fragments_recovered`) containing a warm archival note — reward for curiosity rather than punishment. Repeated wrong attempts escalate gentle recovery hints in the terminal output (4+: a fragment about the first word; 7+: the first word confirmed; 10+: the second) so a stuck investigator is guided, never stalled.

### The 02:13 window — the Keep-Talking set piece

After the vault, the machine re-opens its observability window roughly every 2.5 minutes: 90 seconds of amber pulse, a taskbar badge, a deadline that is felt rather than shown. Inside it, exactly one co-op action pair completes the beat — the **human** zooms the stopped clock (`DSC04655`) past 2.5× while **ARIA** queries the logs from the same minute (`get_system_logs`). Neither action counts outside the window; neither side suffices alone. Synchronized, the machine writes `/Private/window_echo.txt` and unlocks evidence `ev_window_echo`. Miss it and 02:13 comes again — thematically inevitable, mechanically forgiving. (Design per *Keep Talking and Nobody Explodes*: asymmetric roles + shared time pressure = the loop both players must run together.)

### SYNCHRONY — scoring the handoff rhythm

The game's central loop — human looks → agent searches → human decides — is itself scored. Alternating clean handoffs inside 45 seconds build a SYNCHRONY streak, surfaced live in the checklist footer and celebrated by ARIA at ×4/×6/×8. The collaboration is not a premise the player is told about; it is a rhythm the game notices, rewards, and tempo-sets. The desk feels alive exactly when the partnership is real.

### The reflection
`DSC04821.JPG` — the office window glass, lower half, contains a dim figure holding a phone with a reversed visitor-badge glint. Visible at normal scale only to the attentive; sharp under manual zoom. The player tells ARIA; ARIA pulls message `t_sarah` line 16:11 ("badge was turned backwards") and browser history (Kestrel visitor badge program page) to identify the org. No tool performs that identification for the player.

### The stopped clock
`DSC04655.JPG` — the study wall clock stopped at 02:13, redolent of the power-log brown-outs that precede the final-night login.

### Other visual-only details
- Whiteboard ghost text: circled 0.0031°?, glyph row ⊙ ⊙ ⊙, faint "begin with the light — D" margin; sticky-note reminder photographed through glass; door-camera timestamp 02:07:33; heart-rate "ends mid-beat" notation on `IMG_0103`; campus map circle labeled "KESTREL — leased suite — WHO PAYS??"; brass plate middle-slot worn smooth.

---

## Human-only / AI-only / combined clues

| Class | Examples | Who finds |
|---|---|---|
| Human-only | Reflections, handwriting, clock readings, glyph rows, composition differences, arrangement of objects on desk/photo | Player |
| AI-only | Exact EXIF timestamps and GPS, file-mod times and relations, masked message references, recurrence counts of names/numbers, browser history, detailed system logs, the 02:13 LOGIN row | ARIA (via tools) |
| Combined | Reflection person + message about reversed badge → org; stopped clock + brown-out rows → suspicion; watch gap + door event + 02:13 login → staged-timeline hypothesis; sticky card wording + draft note + brass plate → passphrase order; Kestrel visitor badge scan connecting photo, browser cache, and mail | Both, in the intended loop |

```
HUMAN EXPLORES → FINDS SOMETHING → TELLS ARIA
→ ARIA SEARCHES MACHINE-READABLE DATA → FINDS A CONNECTION
→ ARIA OPENS / NAVIGATES TO EVIDENCE → HUMAN READS / INSPECTS
→ HUMAN DISCOVERS NEXT CLUE → TELLS ARIA → REPEAT
```

---

## Progression (flags)

```
INTRO_COMPLETE · MET_ARIA
FOUND_PRIVATE_HINT            unlocks /Private in File Manager
FOUND_PHOTO_017               zoomed into DSC04821 reflection (≥2.5×)
DISCOVERED_METADATA           ARIA called get_image_metadata
DISCOVERED_ORPHEUS            opened any file under /Research/ORPHEUS
FOUND_0213_LOG                scrolled system logs into the final-night 02:13 block
SEEN_WATCH_GAP · SEEN_DOORCAM viewed the respective photos
FOUND_CERN_CONNECTION         read the old-CERN memoir or Vann's withdrawn pre-print cache
IDENTIFIED_CONTACT            read Haldane correspondence
DISCOVERED_SURVEILLANCE       found combined photo+badge evidence triggering the location boards
VAULT_OPENED / VAULT_DECOY
FOUND_HIDDEN_ARCHIVE          vestibule decrypted
WINDOW_HUMAN / WINDOW_AGENT / WINDOW_SYNCHRONIZED   02:13 window co-op set piece (clock zoom + log query, inside 90s)
DISCOVERED_ARIA_DIRECTIVE     read /Private/aria_directive.sys
RECONSTRUCTED_FINAL_HOURS     conditional on 02:13 log + watch gap + door cam
CASE_RECONSTRUCTION_AVAILABLE 4 of 5 major milestones, gated board button
CASE_COMPLETE                 reconstruction verdicts ≥3 SUPPORTED and ≤1 INSUFFICIENT
```

Evidence board entries auto-unlock on flags; `record_evidence`/`highlight_evidence` are AI-driveable but only for ids already eligible.

---

## Endings

A single ending with two evaluations:

- **Insufficient case** — the board returns PARTIALLY SUPPORTED / INSUFFICIENT verdicts per question, and ARIA invites further work. The archive stays open.
- **Supported case** — ≥3 SUPPORTED, ≤1 INSUFFICIENT → `CASE_COMPLETE` triggers staggered window closes, screen fade, ARIA's last three messages ("There is one thing I still cannot explain. The first anomaly was recorded before Daniel began the research. He didn't discover it."), black, then: **"It may have been looking for him."** Title reappears with Archives showing `CASE 001 — CLOSED`.

The case reconstruction UI (`Evidence → CASE RECONSTRUCTION`) asks four questions and evaluates by keyword density plus prerequisite evidence — wording need not be exact.

---

## Tone and obligations

- Not a Three-Bodies pastiche: scientific dread without aliens, sophons, or copied mechanisms.
- Humane: the chili recipe, the porch-rail wobble, Sarah's farewell cake, the field-trip fragment — the machine also preserves love with a timestamp.
- Quiet in sound and color (charcoal, grey-green, phosphor green, trace amber, rust) — horror is proportionate, not loud.

---

## Design audit — how the brief is satisfied

### Every clue has a purpose; clues connect rather than sit isolated

All 20 evidence items derive from at least two independent sources. No entry exists for flavor alone.

| Example | Connects |
|---|---|
| Reflection in `DSC04821` | `t_sarah` line 16:11 (badge turned backwards) + browser history Kestrel badge program + `/Private/photo_backup/badge_scan.png` |
| Stopped clock `DSC04655` 02:13 | `log_014` + `log_034` 40 ms brown-outs + `threshold_analysis.txt` 02:13 scan cycle |
| Watch gap `IMG_0103` 01:52 | `log_031` health band last poll + `vestibule_decrypted.txt` §2 + `IMG_0103` optical trace ends mid-beat |
| Door at 02:07 | `IMG_0044` 02:07:33 + `log_032` LOCAL EVENT WINDOW + `mail_108` WONTFIX ticket |
| Passphrase `lantern → orpheus → echo` | `IMG_0022` sticky card + `journal_february` photo habit + `brass_plate.jpg` `LANTERN · [worn] · ECHO` + draft note |

### Several possible investigation paths

The evidence board has no required order. The seven checklist steps are a HUD suggestion, not a gate. Valid alternative sequences include `Browser → ORPHEUS docs → System Log`, or `Photos zoom first → tell ARIA → let ARIA surface logs`. The only hard gate is the vestibule passphrase; every other thread is reachable in multiple orders. The 90-second idle hint is non-blocking.

### Red herrings (falsifiable, not frustrating)

These exist to be eliminated by cross-reference, not to gate progress:

- Cardiology follow-up `mail_106` (bradycardia note) — suggests natural death, falsified by watch `ends mid-beat` + door exploit.
- `phys512_problem_set.txt` — teaches error-character reasoning but is not a clue.
- Penn parking `hist_013`, recipe search `hist_011`, `spectrometer_driver/bench_notes.txt` firmware bug — ambient life that rewards dismissal.
- The WONTFIX door vendor resolution — reads as IT trivia until the 02:07 exploit.

All are logically excludable by orthogonal evidence (time, mechanism, source).

### Player before ARIA / ARIA before player

- *Player first*: the reflection, the stopped clock, handwriting on the whiteboard margin, the glyph row, the brass-plate wear — all require human eyes. ARIA has no zoom tool by absence; she can only react after the player describes.
- *ARIA first*: exact EXIF timestamps, GPS, hash, building-access gait mismatch, `.onion` resolver attempt, satellite uplink daemon entry, recurrence counts of `02:13`. The player would not think to search 51 log lines for a brown-out pattern; ARIA surfaces it via `get_system_logs` with filter.

### The final explanation feels earned; there is a proper ending

The four-question `CASE RECONSTRUCTION` is evaluated by keyword density plus prerequisite flags (≥3 `SUPPORTED`, ≤1 `INSUFFICIENT`). Wording need not be exact; evidence linkage matters. A partial file returns per-question verdicts with no penalty — keep investigating. A supported case triggers staggered window closes, screen fade, ARIA's last three messages ("The first anomaly was recorded before Daniel began the research. He didn't discover it."), black, then **"It may have been looking for him."** Title returns with `CASE 001 — CLOSED` archived. No "congratulations, you solved it."

### The human and AI genuinely need each other

This is architectural, not rhetorical. See `ARCHITECTURE.md` § Service layer: both UI and WebMCP call `services.ts`. Remove WebMCP and the agent loses every capability; remove the player's eyes and ARIA is blind to pixels. `COLLABORATED_WITH_ARIA` is required before `CASE_RECONSTRUCTION_AVAILABLE` — the case cannot close without the loop `human sees → tells ARIA → ARIA searches → opens → human inspects → repeat`.
