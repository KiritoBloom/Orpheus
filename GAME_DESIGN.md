# GAME DESIGN — Orpheus: The McDuff Investigation

## The proposition

Someone handed you a dead scientist's computer. You turn it on. A briefing authorizes you. An onboard assistant wakes after 74 hours of abeyance and says Daniel expected someone to come. From there you investigate together, operating the same machine from genuinely different vantage points.

The player remains responsible for visual inspection, interpretation, and conclusions. ARIA remains responsible for searching, cross-referencing, and bringing evidence to attention. Neither replaces the other.

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

A correct `unlock lantern orpheus echo` in Terminal mounts the vestibule. Any other sequence mounts an adjacent fragment (`_fragments_recovered`) containing a warm archival note — reward for curiosity rather than punishment.

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
