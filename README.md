# ORPHEUS — The McDuff Investigation

**Live:** https://orpheus-mcduff.vercel.app/ — test in ChatGPT Atlas in-app browser or Chrome Canary `chrome://flags/#enable-webmcp-testing`

**A new horizon for human-agent co-presence.** Co-op is wonderful with another person — and quietly lonely without one. Orpheus is a WebMCP game you can play at 10pm when your friends are offline and still feel *accompanied*: one desk, two investigators — you see what the agent cannot, the agent remembers what you cannot. Not a replacement for human-to-human play, just presence that eases the strain of a solitary session.

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

## What this is — co-op for the nights your friends are offline

Everyone who loves co-op knows the feeling — you boot something wanting to investigate *with* someone, and everyone's offline. You play alone, or you don't play. Orpheus was built for that gap: a fully playable investigative narrative set inside a dead scientist's computer, where you are not alone at the desk.

It *feels* like a game. It *is* a working prototype for a more human web: a shared desk where human and agent collaborate with opposite senses. You do the visual work no machine can; ARIA does the recall no human can at scale. Together, you feel accompanied — not automated.

Explore files, mail, messages, photos, browser history, system logs, and a hidden encrypted archive — with a partner that can search the machine and operate it while you watch it move. This isn't about making friends with agents. It's about easing the mental strain of solitary play for social creatures who just wanted to play *with* someone — without pretending agents replace people. Honestly built presence still makes a hard day lighter.

- Built for the **WebMCP Challenge** — the new horizon where browsers are shared desks, not solo canvases
- Single-page Next.js app, no backend — intelligence comes from your **WebMCP host** (ChatGPT/Atlas, Chrome origin trial, or any browser exposing `document.modelContext`) — **no external REST APIs, no env keys**
- The McDuff case is Instance 1. The pattern (26 narrow tools + visible actuation) ports to any co-op investigation — newsroom, classroom archive, SOC — fork `src/game/data/*` and your community has its own accompanied desk

---

## Why WebMCP — why co-op needs a shared desk

Co-op is social. Loneliness is the bug. Before WebMCP, "playing with an AI" meant a chatbot talking *beside* your game, guessing at pixels, while you drowned in data alone. After WebMCP, you share one computer with complementary senses, and the interface visibly mediates between you — presence you can see.

Orpheus proves it with a mystery, but the horizon is wider: every co-op investigation — a game night without a second player, a classroom archive dig, a newsroom leak review, a SOC night shift, e-discovery — has the same shape: filesystem + messages + logs + images, where some evidence is visual and some is machine-readable, and where generic automation that can click anything is untrustworthy. WebMCP fixes it with narrow, auditable tools. That is Potential Impact: a real, human problem (solitary play and solitary work both strain us) for a real audience (anyone who ever wanted to play *with* someone), solved by a browser that is finally a shared desk — not a replacement for human company, just presence when human company isn't there.

Without WebMCP, the player browses alone.

With WebMCP, the co-op partner **operates the fictional computer** while you watch it move — and you feel accompanied:

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

The machine visibly moves — windows open, files appear, documents scroll to a line — without ever giving the agent generic screen control. Remove WebMCP and the co-op collapses back to solo play. That is the bar for fundamental integration, and the feeling of "two people at one desk" is the new horizon — not louder tech, just less lonely play.

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

## How the agent operates the computer — 26 narrow, auditable tools

Semantic, restricted WebMCP tools (not generic automation) — the vocabulary of a shared desk, so co-op feels like co-presence, not autopilot:

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

Tech stack: Next.js 16.3 + React 19 + TypeScript + Tailwind + Turbopack + Zustand + `idb-keyval` for persistence + Web Audio API for sound + `next/image` (AVIF/WebP, 1yr immutable) + `next/font` (IBM Plex Mono, display:swap). Zero `framer-motion` runtime — all motion is CSS stepped 80ms for authentic 90s snap.

No backend, no database, no authentication. Persistence is IndexedDB (`orpheus-save-v1`) via Zustand + custom `src/game/state/persistence.ts`. Secure headers: `Origin-Agent-Cluster: ?1`, `Permissions-Policy: tools=self`, `Cross-Origin-Opener-Policy: same-origin`, `Cache-Control: immutable` for `_next/static` + `/Images` + `/_next/image` + `CDN-Cache-Control` (Cloudflare/Netlify) — see `next.config.ts`.

---

## Test WebMCP — 90-second judge path

> New to WebMCP? You don't need an agent to judge this. The desk proves itself either way.

1. Enable the host: in Chrome Canary, `chrome://flags/#enable-webmcp-testing → Enabled`; or use ChatGPT's Atlas browser / any W3C WebMCP origin trial build. Open https://orpheus-mcduff.vercel.app/ in ChatGPT's in-app browser for the native experience (verified on Vercel + HSTS).

**Fastest verification (30 sec, no agent):** tray **LINK** (or `Ctrl+``) → pick `get_system_logs` → `{"filter":"02:13"}` → **EXECUTE** → watch the 02:13 login block appear. Then `get_timeline` → `scroll_document_to_line` with line 184 → watch the document scroll and flash on screen. Or press **⚡ QUICK VERIFY** for the one-click 9 evals + 3 headline tool calls (`✅ WEBMCP VERIFIED`).

2. On the desktop, click the tray **LINK** button (also Ctrl+\`) to open the **Agent Link** panel — a judge/dev console listing all 26 registered tools with live execute. Filter by ◇ readOnly / ◆ nav / ⚑ untrusted. Pick any tool — headline tools arrive with example inputs prefilled — press EXECUTE, and watch the computer respond.

   - `get_investigation_context` — briefing + current flags, people, key paths
   - `open_file` + `scroll_document_to_line` — visible document navigation (1.5k output budget, line-flash + nav-sweep)
   - `get_image_metadata` — machine-readable EXIF the player can't see in the viewer (agent cannot zoom — enforced by absence)
   - `get_system_logs` with filter `02:13` — the final-night reveal (50-log cap, untrustedContentHint)
   - `get_timeline` — merged 01:45–02:40 timeline (logs + photos + messages) that humans would need 5 apps to build manually

3. For a full loop: open **Photos** → double-click `DSC04821.JPG` → tell the agent (ChatGPT) "something is reflected in the window" → watch it pull metadata, search messages, open the notebook, and scroll to line ≈184 (`"02:13 is not a time..."`) for you to read.

The registration code lives in `src/webmcp/register.ts` and feature-detects `document.modelContext ?? navigator.modelContext` defensively. Rejection on duplicate name or bad schema is handled; `toolchange` events are observed with 800 ms poll + 1.2 s re-attach for late Atlas injection. Budgets enforced: 500 char desc / 150 param / 30 name / 1.5k output. `terminal_command` allowlists `ls|cd|cat|open|search|unlock|help|clear|history` and caps at 200 chars per secure-tools guide. **Both APIs** per best practice: 26 imperative tools + 4 declarative forms — `request_correlation` in Evidence, `unlock_vault` in Files, `inspect_photo` in Photos (visible), and the `record_evidence` fallback (hidden in `GameRoot.tsx`). Reusable component at `src/components/DeclarativeForm.tsx`.

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
    evals.md                    # 7 model evals per Chrome guide + 9 deterministic in-browser checks (RUN EVALS / ⚡ QUICK VERIFY)
  components/
    title/IrisTitle             # diegetic circular opening (not an eyeball; see below)
    boot/                       # POST + mission briefing
    desktop/Desktop, WindowFrame, Taskbar, Toasts, AgentLinkPanel
    applications/ Files, Mail, Messages, Photos+ImageViewer, Browser, Terminal, SystemLogs, Evidence, TextViewer
    audio/engine.ts             # Web Audio mixer — Cherry MX clicks + synthesis
docs:  README · SUBMISSION_DRAFT.md · JUDGE_QUICKSTART.md · WEBMCP.md · ARCHITECTURE.md · GAME_DESIGN.md
```

---

## The iris title

The opening is a diegetic circular mechanism (camera-aperture / optical sensor / biometric scanner) that the menu orbits. It wakes with the machine: black → point of light → segments assemble → aperture calibrates → menu labels emerge. Hovering a label makes the mechanism respond. The title *is* the machine dormant — **New Investigation** contracts the iris to black and boots Daniel's workstation in one continuous wake-up. No logo, no hero image, no conventional menu — curiosity first, then faint unease, then "what am I looking at?".

An original implementation; inspiration only.

---

## Beyond the case — the pattern ships (co-op anywhere)

Orpheus is Instance 1 for gaming, but the desk ports anywhere solo work strains people:

- **Co-op games & puzzle hunts:** your instance — a mystery where solo players have a partner that remembers everything while they look closer
- **Classroom archive:** students describe visuals, agent surfaces context — collaborative learning without needing a second human every time
- **Newsroom / SOC / research-integrity / e-discovery:** same filesystem + messages + logs + images — an analyst alone on night shift is not alone on the desk

`src/game/services.ts` + `src/webmcp/register.ts` + `JUDGE_QUICKSTART.md` is the trio. Replace `src/game/data/*`, keep the 26 tool shapes, deploy one static site. No backend. No env keys. The horizon WebMCP opens isn't just better tools — it's less lonely work and play. Not a replacement for human company, just a humane default when human company isn't there.

---

## Credits & fiction notice

Daniel McDuff is entirely fictional. The Kestrel Institute is entirely fictional. The tilt described in the game has no real-world referent outside narrative.

Interface audio uses curated local samples and restrained Web Audio synthesis.

Built for the WebMCP Challenge — a new horizon for human-agent co-presence. Not AI to replace people, but presence to ease the strain when you just wanted to play with someone.
