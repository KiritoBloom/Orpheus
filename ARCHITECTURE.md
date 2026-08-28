# ARCHITECTURE — Orpheus / The McDuff Investigation

## Stack

- **Next.js 16.3 (App Router, Turbopack, TypeScript)** — one static route (`/`); SSR-safe design (no `window` in render, guards at every edge).
- **React 19** — almost everything is `"use client"`. One server component (`src/app/layout.tsx` + `src/app/page.tsx`) wraps a single client shell (`GameRoot`).
- **Tailwind CSS 4** (`@import "tailwindcss"`) — the visual language is encoded in CSS variables at `src/app/globals.css` (CRT, workstation palette, animations, window states).
- **Zustand 5** — live state (three stores) + persisted to **IndexedDB** via `idb-keyval` (key `orpheus-save-v1`).
- **CSS only motion** — authentic 90s snap via stepped 80ms transitions; no `framer-motion` runtime (removed for bundle hygiene).
- **Web Audio API** — all sound is synthesized (`src/audio/engine.ts`); keyboard clicks use `public/sound-effects/unicae_games_keyboard_soundpack_1/Single Keys`.
- **next/image + next/font** — `next/image` serves `/Images` as AVIF/WebP via `/_next/image` (deviceSizes 640-2048, 1yr immutable, `fetchPriority: high` for viewer, `lazy` for grid); `next/font/google` IBM Plex Mono `display:swap` via `src/app/layout.tsx` (no external @import, optimal CLS).

No server database, no auth, no external REST calls, no env keys.

---

## App structure

```
src/
  app/
    globals.css          design system + CRT + window states
    layout.tsx           metadata / viewport / html shell
    page.tsx             ← GameRoot
  types/game.ts          every domain + state shape
  game/
    data/
      filesystem.ts      FsNode[] + all text/csv bodies (+ computed key lines)
      emails.ts          Email[] (17: inbox 8 / sent 4 / drafts 2 / archive 2 / trash 1)
      chatMessages.ts    THREADS (6) + CHAT_MESSAGES (31) — Daniel's historic threads, readable via tools
      browserHistory.ts  HISTORY (18) + CACHED_PAGES (17) — every history entry has a cached page
      systemLogs.ts      LOGS (51: log_001–051, final night 02:13 fully logged)
      evidence.ts        EVIDENCE[] (20: people 5 / events 5 / locations 2 / documents 5 / hypotheses 3)
      photos.ts          PhotoMeta[] (12: 9 main + 3 private backup) + registry
    state/
      persistence.ts     idb-keyval single-record SaveData (version 1, debounced writes)
      osStore.ts         phase/windows/focus/z/toasts/flags/vault/clock/settings
      ariaStore.ts       agent status (idle/reading/investigating/responding) for WebMCP feedback
      investigationStore.ts  evidence set + highlight + four-question evaluation
    services.ts          THE capability layer — every UI and tool goes through here
  webmcp/
    register.ts          26 TOOL_DEFS + registration + host detection + TermBus
  components/
    title/IrisTitle.tsx  diegetic aperture mechanism + orbiting menu + pre-menu calibration
    boot/{BootSequence,MissionBriefing}.tsx  full-screen POST + briefing with Cherry MX soundpack
    windows/WindowFrame.tsx  drag/min/max/close/focus/z
    desktop/{Desktop,DesktopIcons}.tsx
    taskbar/Taskbar.tsx  app buttons + agent status + LINK console
    notifications/Toasts.tsx
    applications/{ Files, Mail, Messages, Photos+ImageViewer, Browser, Terminal,
                    SystemLog, Evidence, TextViewer}.tsx
    art/photos.tsx       procedural SVG photographs (every clue is vector & zoomable)
    AgentLinkPanel.tsx   judge console for all 26 tools (LINK)
    GameRoot.tsx         lifecycle: title→boot→briefing→desktop→ending + hydration +
                         WebMCP polling + hum/focus wiring
    EndingSequence.tsx   staggered closes → iris → black
  audio/engine.ts        hum, drone, Cherry clicks, ding, servo, chime, thud
```

---

## Stores

### osStore — the machine (`src/game/state/osStore.ts`)
- `phase: "title"|"boot"|"briefing"|"desktop"|"ending"`, `hydrated`, `hasSaveProgress`
- `windows: Record<WinId, WinState>` (singleton per app + `textviewer`/`imageviewer`), `focused`, `zTop`
- `flags: Set<StoryFlag>`, `vaultUnlocked/vaultAttempts`, `clockStart`, `toasts[]`, `settings { crt,sound,reducedMotion,textScale }`
- All mutations are store methods (`openApp`, `focusWindow`, `setGeom`, `addFlag`, ...). Fictional clock = March 10 09:12 + real elapsed.

### ariaStore — agent status (`src/game/state/ariaStore.ts`)
- `status: idle|reading|investigating|responding` + `statusDetail` — surfaced in Taskbar + AgentLinkPanel while WebMCP tools run.
- No chat/queue; WebMCP is the channel (ChatGPT).

### investigationStore — the case (`src/game/state/investigationStore.ts`)
- `evidenceIds: Set<string>`, `highlightId`, `caseReport/ caseVerdicts`
- `syncFlags(flags)` auto-unlocks `EvidenceItem`s whose `autoUnlockFlag` is set.
- `submitCaseReport({q1..q4})` keywords → per-question `SUPPORTED|PARTIALLY|INSUFFICIENT` → global COMPLETE.

### persistence — `src/game/state/persistence.ts`
- One record (`orpheus-save-v1`), idb-keyval, version 1.
- Debounced writes (400 ms) on every `updateSave` — flags, evidenceIds, vault, case report, settings. `hasProgress` derived from flags or `caseCompleteAt`.
- `wipeSave()` erases both storage and the caller's live slices (GameRoot's `handleLaunch("new")` resets Zustand as well).

---

## Service layer — why WebMCP is fundamental

`src/game/services.ts` is the only place that knows how to:
open an app, focus, open a file, scroll to a line, find text, open a dir/email/history entry, manage photos and email read-state, search collections, get logs, record/highlight/open evidence, attempt the vault, and fire story hooks (`FOUND_PHOTO_017` on zoom≥2.5, `FOUND_PRIVATE_HINT` on reminder-card view, etc.).

Both the React UI and the WebMCP tools import and call this module. If you removed WebMCP, the external agent would lose every ability to operate the machine — investigation would be manual and incomplete. The audit trail of visible effects (window opens, sweeps, flashes, toasts) lives here.

Event wiring `UI ↔ services` uses five tiny single-channel buses (`SimpleBus` — `on(fn) → unsubscribe, emit(payload)`) for: File Manager navigation, photo focus, Mail selection, Messages thread selection, Browser history navigation, plus a `TermBus` for the terminal. The text viewer listens via `setDocListener` for `scroll_document_to_line`.

---

## WebMCP lifecycle

- `GameRoot` hydrates from IndexedDB, then calls `registerWebMCPTools()` once and polls every 800 ms for late `modelContext` (+ 1.2 s re-attach for late Atlas injection); it observes `toolchange`.
- On success the 26 `TOOL_DEFS` are registered; input schemas are pure JSON Schema; `execute` handlers delegate to `services.ts` and return MCP-shaped objects (`{ ok, error? }` or typed results).
- No fallback assistant — WebMCP *is* the agent interface. During development the game remains playable without a host, but investigation is intentionally slower without an agent that can bulk-search and correlate. 26 tools: 14 read-only + 9 visible nav + 3 evidence (guarded).

---

## Visual planes

| Plane | Doc | Notes |
|---|---|---|
| Iris title | `IrisTitle.tsx` | black → point of light → 11-blade aperture → slow ring spins → orbiting labels → contract-to-boot. Imperfection baked into blades; breathing core light; proximity response. |
| Boot/briefing | `BootSequence`, `MissionBriefing` | full-screen POST + `AUTHORIZED INVESTIGATION PROTOCOL`; Cherry MX clicks per glyph; both skippable. |
| Desktop | `Desktop.tsx` + `WindowFrame` + `Taskbar` + `DesktopIcons` | single-bg charcoal with faint grid + watermark; goose-eggs "satellite" icons; z-stack via `zTop`. |
| Applications | per-app files | dense, monospace, thin bevels. Evidence board + File Manager are primary surfaces. |
| Overlays | `AgentLinkPanel`, `Evidence` reconstruction modal, `EndingSequence` | `panel-raised` + `win-shadow`; ending closes windows staggered, contracts an iris, then **"It may have been looking for him."** |
| FX | `globals.css` + `AudioEngine` | CRT scanlines + vignette + phosphor;`crtFlicker`; `line-flash`/`nav-sweep` on scroll;`ev-highlight`;`toast-in`; + live synth hum/drone/ticks + Cherry pack. |

All colours derive from `--bg`/`--accent`/`--amber`/`--alert` variables; reduced-motion and CRT are CSS-class-toggled; text scale is `data-textscale`.

---

## Photos

Twelve photographs live as PNG assets under `public/Images/` (rendered via `PhotoAsset` in `PhotosApp.tsx`). An earlier SVG fallback remains in `src/components/art/photos.tsx` but is not required for play. Clues are placed at realistic sizes — dim background detail at `zoom=1` that becomes legible when manually zoomed (reflection figure, badge clip glint, whiteboard micro-handwriting, clock hands, door-case, watch mid-beat truncation, etc.) and remain crisp to 9×.

The viewer (`ImageViewerApp`) handles `wheel` zoom (1–9×) + pan drag; `PhotosApp` is a grid. The agent has no zoom tools by design — enforced by absence, not policy.

---

## Sound

Synthesized + sampled in `AudioEngine`:
- hum — 55 Hz sine + brown noise through lowpass
- drone — detuned 54 / 54.6 triangle + 108.5 sine
- Cherry KC 1000 clicks — 32 `keypress-*.wav` with random pitch 0.92–1.08, gain 0.34–0.52, lowpass 4.2–5.6k, stereo ±0.08, timing jitter ±3ms
- ticks/clicks/dings via short noise bursts, band-pass + exponential envelopes; `ding` is 880+1318 Hz decaying.

Master gain `0.78` via compressor, muteable from tray, respects `settings.sound`.

---

## Extending

- Add a document: entry in `filesystem.ts` (content as template literal) + a corresponding node in `buildFilesystem()`; long documents get key lines computed once at top. Don't forget `modified`/`sizeKb` and optional `hiddenUntilFlag`/`encrypted`/`requiresUnlock`.
- Add a photo: SVG component in `art/photos.tsx` + entry in `photos.ts` (visible `date` + machine-exif). The reflected-person clue's zoom-check lives in `PhotosApp` at `zoom ≥ 2.5`.
- Add an evidence item: row in `evidence.ts` + `autoUnlockFlag`; `services.onFileOpened` may wire its discovery.
- Add a tool: `ToolDef` in `register.ts` + delegating service fn in `services.ts`; keep it semantic (one job, one schema).
