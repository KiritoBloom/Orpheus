# ORPHEUS — The McDuff Investigation

**Live:** https://orpheus-mcduff.vercel.app/ — test in ChatGPT Atlas in-app browser or Chrome Canary `chrome://flags/#enable-webmcp-testing`

**A WebMCP experiment: a human and an external agent, investigating the same dead scientist's computer from two different perspectives.**

```js
// WebMCP — how tools are exposed (src/webmcp/register.ts)
document.modelContext.registerTool({
  name: "search_products",
  description: "Search the product catalog",
  inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  execute: async (input) => { /* ... */ }
});
// Real tools: 26 narrow tools (get_investigation_context, search_files, open_file, scroll_document_to_line, get_timeline, …)
// See src/webmcp/register.ts for full registration with title, description, inputSchema, annotations, execute + AbortSignal
```

> "I'm using the computer of someone who died."
> "The agent can actually operate parts of the computer."
> "We genuinely need each other to solve this."

You have been authorized to inspect the workstation of **Dr. Daniel McDuff** — professor of physics and astronomy at the University of Pennsylvania, formerly CERN. Daniel is dead. His research was called **ORPHEUS**.

---

## What this is

A fully playable investigative narrative set entirely inside a fictional workstation. Explore files, mail, messages, photos, browser history, system logs, and a hidden encrypted archive — with an AI partner that can search the machine and operate it while you do the visual work no machine can.

- Built for the **WebMCP hackathon**
- Single-page Next.js app, no backend
- Runs in a normal browser; intelligence comes from your **WebMCP host** (ChatGPT/Atlas, Chrome origin trial, or any browser exposing `document.modelContext`) — **no external REST APIs, no env keys**

---

## Why WebMCP — and why it matters beyond this case

Orpheus validates a reusable pattern: **any air-gapped investigative workstation** — newsroom, SOC, research-integrity office, e-discovery — where an agent can search & operate at scale but never see pixels. The McDuff case is one instance; the pattern is the product. That is the bar for Potential Impact: a real problem (secure, high-stakes review) for a real audience (journalists, forensics, oversight).

Without WebMCP, the player browses manually.

With WebMCP, the external agent **operates the fictional computer** while the player watches it move:

```
Player:  (via ChatGPT) "Check the photo for anything strange in the window."
Agent:   calls open_image("DSC04821")
         · Photos opens on screen
Agent:   calls get_image_metadata("DSC04821") — can read EXIF but not pixels
         → "Zoom into the window glass — lower half."
Player:  zooms manually, spots the reflection, tells the agent
Agent:   calls search_messages, open_file, scroll_document_to_line...
         · the relevant document opens and scrolls into view
```

The machine visibly moves — windows open, files appear, documents scroll to a line — without ever giving the agent generic screen control. Remove WebMCP and the investigation becomes materially less capable. That is the bar for fundamental integration.

---

## Human vs. agent capabilities (deliberately asymmetric)

**The player** is the eyes:
- Opens applications and browses files
- Reads documents, inspects photographs, zooms manually
- Notices reflections, tiny handwriting, clock readings, spatial relationships, glyph rows — every visual detail
- Forms theories, decides what matters, writes the final case reconstruction

**The agent** is the cross-referencer (via WebMCP in ChatGPT):
- Searches messages, mail, files, and browser history at scale
- Inspects image metadata and system logs
- Finds textual connections across thousands of lines
- Opens relevant evidence on screen (`open_file`, `scroll_document_to_line`, `open_email`, etc.) and updates the shared Evidence board

The agent **cannot** zoom images, pan, rotate, click arbitrary coordinates, type into arbitrary apps, or take screenshots. The interface asymmetry keeps both sides essential.

---

## How the agent operates the computer

Semantic, restricted WebMCP tools (not generic automation):

| Category | Tools |
|---|---|
| Investigation | `get_investigation_context`, `search_files`, `read_file`, `search_messages`, `get_message_thread`, `open_messages_thread`, `search_emails`, `get_email`, `get_image_metadata`, `open_image`, `search_browser_history`, `get_system_logs`, `get_timeline`, `get_case_evidence` |
| Navigation | `open_application`, `focus_application`, `open_file`, `open_directory`, `open_email`, `open_browser_entry`, `scroll_document_to_line`, `find_text_in_document`, `terminal_command` |
| Evidence | `record_evidence`, `highlight_evidence`, `open_evidence_board` |

Every navigation tool has a visible effect — the desktop opens the window, loads the document, or scrolls the line — using a single source-of-truth service layer (`src/game/services.ts`) that both the UI and the tools call.

---

## Run it

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build && pnpm start
```

Tech stack: Next.js 16.3 + React 19 + TypeScript + Tailwind + Turbopack + Zustand + `idb-keyval` for persistence + Web Audio API for sound. Zero `framer-motion` runtime — all motion is CSS stepped 80ms for authentic 90s snap.

No backend, no database, no authentication. Persistence is IndexedDB (`orpheus-save-v1`) via Zustand + custom `src/game/state/persistence.ts`. Secure headers: `Origin-Agent-Cluster: ?1`, `Permissions-Policy: tools=self` (see `next.config.ts`).

---

## Test WebMCP

1. Enable the host: in Chrome Canary, `chrome://flags/#enable-webmcp-testing → Enabled`; or use ChatGPT's Atlas browser / any W3C WebMCP origin trial build. Open https://orpheus-mcduff.vercel.app/ in ChatGPT's in-app browser for the native experience (verified on Vercel + HSTS).

2. On the desktop, click the tray **LINK** button (also Ctrl+\`) to open the **Agent Link** panel — a judge/dev console listing all 26 registered tools with live execute. Filter by ◇ readOnly / ◆ nav / ⚑ untrusted. Pick any tool, edit its JSON input, press EXECUTE, and watch the computer respond.

   - `get_investigation_context` — briefing + current flags, people, key paths
   - `open_file` + `scroll_document_to_line` — visible document navigation (1.5k output budget, line-flash + nav-sweep)
   - `get_image_metadata` — machine-readable EXIF the player can't see in the viewer (agent cannot zoom — enforced by absence)
   - `get_system_logs` with filter `02:13` — the final-night reveal (50-log cap, untrustedContentHint)
   - `get_timeline` — merged 01:45–02:40 timeline (logs + photos + messages) that humans would need 5 apps to build manually

3. For a full loop: open **Photos** → double-click `DSC04821.JPG` → tell the agent (ChatGPT) "something is reflected in the window" → watch it pull metadata, search messages, open the notebook, and scroll to line ≈184 (`"02:13 is not a time..."`) for you to read.

The registration code lives in `src/webmcp/register.ts` and feature-detects `document.modelContext ?? navigator.modelContext` defensively. Rejection on duplicate name or bad schema is handled; `toolchange` events are observed with re-attach for late Atlas injection. Budgets enforced: 500 char desc / 150 param / 30 name / 1.5k output. `terminal_command` allowlists `ls|cd|cat|unlock|help|clear` and caps at 200 chars per secure-tools guide. Declarative fallback form for `record_evidence` lives hidden in `GameRoot.tsx`.

---

## Deploy

```bash
vercel --prod       # https://orpheus-mcduff.vercel.app/ — auto-deploys on push to main
pnpm build          # verifies Next 16.3 + Turbopack, headers, and static shell (7117 bytes HTML)
```

No environment variables required. Live URL is frozen at submission deadline per rules — do not edit repo/site during judging Sep 4–21.

**Headers verified** `next.config.ts`: `Origin-Agent-Cluster: ?1`, `Permissions-Policy: tools=self`, `Cache-Control: immutable` for `_next/static` + `/Images`.

---

## Repository layout

```
src/
  app/                          # Next.js App Router (layout + single route)
  types/game.ts
  game/
    data/  filesystem, emails, chatMessages, browserHistory, systemLogs, evidence, photos
    state/ osStore, ariaStore (agent status), investigationStore, persistence
    services.ts                 # single source-of-truth capability layer
  webmcp/
    register.ts                 # 26 tools, registration, host detection
  components/
    title/IrisTitle             # diegetic circular opening (not an eyeball; see below)
    boot/                       # POST + mission briefing
    desktop/Desktop, WindowFrame, Taskbar, Toasts, AgentLinkPanel
    applications/ Files, Mail, Messages, Photos+ImageViewer, Browser, Terminal, SystemLogs, Evidence, TextViewer
    audio/engine.ts             # Web Audio mixer — Cherry MX clicks + synthesis
docs:  README · GAME_DESIGN.md · WEBMCP.md · ARCHITECTURE.md
```

---

## The iris title

The opening is a diegetic circular mechanism (camera-aperture / optical sensor / biometric scanner) that the menu orbits. It wakes with the machine: black → point of light → segments assemble → aperture calibrates → menu labels emerge. Hovering a label makes the mechanism respond. The title *is* the machine dormant — **New Investigation** contracts the iris to black and boots Daniel's workstation in one continuous wake-up. No logo, no hero image, no conventional menu — curiosity first, then faint unease, then "what am I looking at?".

An original implementation; inspiration only.

---

## Credits & fiction notice

Daniel McDuff is entirely fictional. The Kestrel Institute is entirely fictional. The tilt described in the game has no real-world referent outside narrative.

Interface audio uses curated local samples and restrained Web Audio synthesis.

Built for the WebMCP Challenge.
