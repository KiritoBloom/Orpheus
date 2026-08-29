# ARCHITECTURE — Orpheus / The McDuff Investigation

> One rule runs through this codebase: **if the human can do it and the agent can do it, the logic exists exactly once.** `src/game/services.ts` is that once. The React apps call it; the WebMCP tools call it. Nothing is implemented twice, which is why removing WebMCP does not degrade the agent — it removes it entirely.

## Stack

- **Next.js 16.3** (App Router, Turbopack, TypeScript) — one static route (`/`), SSR-safe throughout (no `window` in render).
- **React 19** — one server component (`layout.tsx` + `page.tsx`) wrapping a single client shell, `GameRoot`.
- **Tailwind CSS 4** — the visual language lives in CSS variables in `src/app/globals.css` (CRT, palette, window states, animations).
- **Zustand 5** — three live stores, persisted to **IndexedDB** via `idb-keyval` (key `orpheus-save-v1`).
- **CSS-only motion** — stepped 80 ms transitions for authentic 90s snap. No animation runtime.
- **Web Audio** — sampled-first (`src/audio/engine.ts`), procedural synthesis as fallback.
- **next/image + next/font** — AVIF/WebP with a one-year immutable cache; IBM Plex Mono, `display: swap`.

No server, no database, no authentication, no external API calls, no environment variables.

---

## Layout

```
src/
  app/
    globals.css            design system, CRT, window states
    layout.tsx             metadata, viewport, WebMCP declarative focus styles
    page.tsx               → GameRoot
  types/game.ts            every domain and state shape
  game/
    data/
      filesystem.ts        FsNode[] + all document bodies + computed key lines
      emails.ts            17 emails across 5 folders
      chatMessages.ts      7 threads (6 historic + the unsourced t_observer), 35 messages
      browserHistory.ts    18 entries + 17 cached pages
      systemLogs.ts        51 entries; the final night fully logged
      evidence.ts          21 items across 5 sections
      photos.ts            12 photos with full EXIF (3 sealed in the private backup)
    state/
      osStore.ts           phase, windows, focus, z-order, toasts, flags, vault,
                           the 02:13 window, the synchrony counter, settings
      ariaStore.ts         agent status (idle / reading / investigating / responding)
      investigationStore.ts  evidence set, highlight, four-question evaluation
      persistence.ts       one debounced idb-keyval record
    services.ts            THE capability layer — 700 lines, every capability once
  webmcp/
    register.ts            25 tools, budgets, annotations, registration lifecycle
    static-checks.ts       the 9 registry checks (browser + CI share this)
    selftest.ts            12 live deterministic evals (RUN EVALS / QUICK VERIFY)
    evals.md               model-facing eval specs
  components/
    DeclarativeForm.tsx    the full Declarative API contract, reusable
    AgentLinkPanel.tsx     the judge console (LINK / Ctrl+`)
    GameRoot.tsx           lifecycle, hydration, WebMCP registration, global FX
    title/ boot/ desktop/ taskbar/ windows/ notifications/ applications/ icons/ art/
  audio/engine.ts          hum, drone, key clicks, chimes, ambience
scripts/
  run-webmcp-tests.mjs     `pnpm test:webmcp` — parses register.ts, runs static-checks
  smoke.mjs                `pnpm smoke` — headless Chrome, boots the game, QUICK VERIFY
  smoke-apps.mjs           `pnpm smoke:apps` — every app via open_application, vault path
```

---

## Stores

**osStore** — the machine. `phase` (`title → boot → briefing → desktop → ending`), one window state per app plus the text and image viewers, `flags: Set<StoryFlag>`, vault state and attempt count, the recurring `obsWindow`, the synchrony counter, toasts, and settings. Every mutation is a store method. The fictional clock is March 10, 09:12 plus real elapsed time.

**ariaStore** — agent status only. Set by the tool layer as calls run, surfaced in the taskbar and the LINK console, so the whole desk reacts to the agent rather than just the window it opened. There is no chat state: WebMCP *is* the channel.

**investigationStore** — the case. Evidence set, current highlight, and the four-question reconstruction with per-question verdicts (`SUPPORTED` / `PARTIALLY SUPPORTED` / `INSUFFICIENT`). `syncFlags()` auto-unlocks evidence whose `autoUnlockFlag` is set.

**persistence** — a single record, debounced 400 ms. `wipeSave()` clears storage; `GameRoot`'s new-game path resets the live stores to match.

---

## The service layer — why WebMCP is fundamental

`src/game/services.ts` is the only module that knows how to open an application, focus a window, open a document, scroll and pin a line, find text, navigate a directory, open an email or history entry, search files, messages, mail, and history, merge a correlated timeline, read image metadata, attempt the vault, record and highlight evidence, and fire the story hooks that gate progress.

Both sides call it:

| Capability | Human path | Agent path |
|---|---|---|
| Open a document | `FilesApp` double-click → `openFile` | `open_file` → `openFile` |
| Point at a passage | text viewer find bar → `findTextInDocument` | `show_in_document` → `showInDocument` |
| Search the filesystem | Terminal `search` → `searchFiles` | `search_files` → `searchFiles` |
| Unlock the vestibule | Terminal `unlock` → `attemptVault` | `terminal_command` / `unlock_vault` form → `attemptVault` |
| Read system logs | `SystemLogApp` → `getSystemLogs` | `get_system_logs` → `getSystemLogs` |
| Correlate a term | `request_correlation` form → `correlateTerm` | `search_files` + `search_messages` |
| The 02:13 beat | zoom past the detent → `notePhotoInspection` → `noteWindowHuman` | `get_system_logs` → `noteWindowAgent` |

Two capabilities are deliberately one-sided, and that asymmetry is the design:

- **`notePhotoInspection`** is reachable only from the image viewer's zoom handler. No tool can call it, because no zoom tool exists.
- **`getTimeline`** merges logs, photo EXIF, and message traffic into one chronology. Nothing in the UI produces it, because assembling it by hand is exactly the work the human should not have to do.

`pnpm test:webmcp` enforces the rule structurally: `register.ts` may not import from `game/data/*`. If a tool starts reimplementing game logic instead of delegating, the check fails.

Event wiring uses five tiny single-channel buses (`SimpleBus`: `on(fn) → unsubscribe`, `emit(payload)`) for File Manager navigation, photo focus, Mail selection, Messages threads, and Browser history, plus a `TermBus` for the terminal. The text viewer subscribes via `setDocListener` for scroll-and-pin and `setDocDismissListener` for user-initiated dismissal.

**Reusable beyond the fiction.** Replace `src/game/data/*` with your corpus, keep the `services.ts` + `register.ts` split, and you have an accompanied desk for a newsroom, a SOC, an oversight board, or a classroom. One static site, no backend.

---

## WebMCP lifecycle

`GameRoot` hydrates from IndexedDB, then registers tools and keeps them registered:

- **Registration is idempotent per context** and resolves `true` only when every tool succeeded. A partial failure keeps the flag false, records which tools failed, and lets the poll retry — a half-registration can never look like success. Duplicate-name `InvalidStateError` counts as already-present.
- **Polling every 800 ms** handles late injection (ChatGPT's browser injects asynchronously), re-attaching the `toolchange` listener whenever the context first appears or is swapped.
- **`toolchange` re-registers.** If a host clears or replaces the tool set, the tools come back on the next event.
- **Unregistration is real.** The `AbortController` is stored, and `unregisterWebMCPTools()` calls `abort()` — the Chrome 153 path that detaches without cancelling in-flight executions.
- **Cancellation is honoured.** `execute` receives `{ signal }` and checks `aborted` before dispatch and again after the handler resolves.
- **Every result is budgeted.** `applyOutputBudget()` wraps every return value: long strings clipped, result arrays halved until the serialized payload fits 1500 chars, with a `budget` note so the model refines rather than assuming completeness.

25 tools: 12 read-only, 12 visible navigation, 1 guarded write. Plus 4 declarative forms registered by the browser from annotated HTML (`request_correlation`, `record_evidence_form`, `unlock_vault`, `inspect_photo`) via `src/components/DeclarativeForm.tsx`, which implements `toolautosubmit`, `agentInvoked` + `respondWith` after `preventDefault()` on every path, and reads `toolName` off the lifecycle events as the spec defines.

Full tool table, security audit, and verification output: `WEBMCP.md`. Ninety-second verification path: `JUDGE_QUICKSTART.md`.

---

## Visual planes

| Plane | File | Notes |
|---|---|---|
| Iris title | `title/IrisTitle.tsx` | black → a point of light → an 11-blade aperture assembles → orbiting menu labels → contracts into the boot. The title *is* the machine dormant. |
| Boot / briefing | `boot/BootSequence.tsx`, `boot/MissionBriefing.tsx` | full-screen POST and authorisation protocol, key clicks per glyph, both skippable. |
| Desktop | `desktop/Desktop.tsx`, `windows/WindowFrame.tsx`, `taskbar/Taskbar.tsx` | charcoal with a faint grid; drag, minimise, maximise, close, focus; z-stack via `zTop`. |
| Applications | `applications/*` | dense monospace with thin bevels. Each app has its own metaphor: Mail is paper, Messages is bursts, Files is a volume listing. |
| Overlays | `AgentLinkPanel`, reconstruction modal, `EndingSequence` | raised panels with hard shadows; the ending closes windows in sequence, contracts an iris, then one last line. |
| FX | `globals.css`, `audio/engine.ts` | CRT scanlines, vignette, phosphor; `line-flash` and `nav-sweep` on agent scrolls; `ev-highlight`; toast entry; live hum and drone. |

Colours derive from `--bg` / `--accent` / `--amber` / `--alert`. Reduced motion and CRT are class toggles; text scale is a data attribute.

---

## Photos

Twelve photographs as PNGs under `public/Images/`. The three private-backup photos (`badge_scan`, `brass_plate`, `campus_map`) are filesystem-only — absent from the camera roll and unreachable by tool until the vestibule is decrypted. Clues sit at realistic scale: barely-there detail at 1× that becomes legible on manual zoom (the reflected figure, a badge clip glint, whiteboard micro-handwriting, stopped clock hands, a door-camera timestamp, a health-band trace ending mid-beat) and stay crisp to 9×.

`ImageViewerApp` handles wheel zoom (1–9×) and pointer pan, with a detent at 2.5× that marks the threshold for "looking closely" and routes through `services.notePhotoInspection`. The agent has no zoom tool. Enforced by absence, not policy.

---

## Sound

`src/audio/engine.ts`, sampled-first with synthesis as fallback:

- **hum** — 55 Hz sine plus brown noise through a lowpass
- **drone** — detuned 54 / 54.6 triangles plus a 108.5 sine
- **key clicks** — 32 Cherry-style samples, pitch 0.92–1.08, gain 0.34–0.52, lowpass 4.2–5.6 k, stereo ±0.08, timing jitter ±3 ms
- **window open / close** — pitched-down key-pack chunks: a mechanical latch, not a UI blip
- **UI and window controls** — key-pack taps with distinct rate and volume per action, so the whole desk reads as one keyboard
- **ambience** — a drive churns every 40–80 s; faint distant house sounds (something falling, a door closing) drift in every 70–150 s

Master gain 0.78 through a compressor, muteable from the tray.

---

## Extending

- **A document:** content template literal plus a node in `buildFilesystem()` in `filesystem.ts`. Long documents get key line numbers computed once at the top, against the full concatenated text.
- **A photo:** a PNG in `public/Images/`, an entry in `photos.ts` with visible date and machine-only EXIF, and a source mapping in `PhotosApp`. If it needs a directional hint, add a case to `services.photoInspectionHint`.
- **An evidence item:** a row in `evidence.ts` with an `autoUnlockFlag`; `services.onFileOpened` can wire its discovery.
- **A tool:** a `ToolDef` in `register.ts` **plus** a delegating function in `services.ts`. Keep it semantic — one job, one schema, annotations declared. `pnpm test:webmcp` will reject it if it reaches past the service layer or omits `readOnlyHint`.
