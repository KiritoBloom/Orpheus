# ORPHEUS — The McDuff Investigation

**Live:** https://orpheus-mcduff.vercel.app/ — open it in ChatGPT's in-app browser, or in Chrome with `chrome://flags/#enable-webmcp-testing` enabled.

**A co-op mystery for the nights nobody else is online.** One desk, two investigators: you see what the agent cannot, the agent remembers what you cannot.

**Judges, skip ahead:** [`?demo=verify`](https://orpheus-mcduff.vercel.app/?demo=verify) lands on the desktop with the tool console open · [`?demo=window`](https://orpheus-mcduff.vercel.app/?demo=window) preloads the vault so the 02:13 set piece arms in ~20 seconds. Preloaded flags only — every gate is the real gate.

**Second instance — the same 25 tools over real NASA documents:** [`/apollo13`](https://orpheus-mcduff.vercel.app/apollo13). Every file, voice loop, photograph and timestamp there is public-domain primary material (Apollo 13 Review Board report, MSC-02680 Mission Report, NASA Image Library), including three places where the record contradicts itself — preserved, not corrected. Same engine, same tool layer, different corpus: see [`src/game/data/corpus.ts`](src/game/data/corpus.ts).

```js
// src/webmcp/register.ts — 25 narrow tools registered this way
document.modelContext.registerTool({
  name: "show_in_document",
  title: "Show line in document",
  description: "Open a document, scroll to a line, and pin a persistent highlight on it…",
  inputSchema: { type: "object", properties: { path: { type: "string" }, query: { type: "string" } }, required: ["path"] },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  execute: async ({ path, query }, { signal }) => { /* delegates to src/game/services.ts */ },
});
```

> "I'm using the computer of someone who died."
> "The agent can actually operate parts of the computer."
> "We genuinely need each other to solve this."

You have been authorized to inspect the workstation of **Dr. Daniel McDuff** — professor of physics and astronomy, formerly CERN. Daniel is dead. His research was called **ORPHEUS**.

---

## What this is

A fully playable investigative narrative set inside a dead scientist's computer — files, mail, messages, photographs, browser history, system logs, and a sealed encrypted archive — where an AI agent sits beside you at the same machine.

It feels like a game. It is also a working argument about what the web becomes when a page can hand an agent real, narrow capabilities while a human watches.

- Built for the [WebMCP Challenge](https://webmcp.devpost.com/)
- Single-page Next.js app, **no backend, no database, no API keys**. Intelligence comes from your WebMCP host (ChatGPT, Chrome's origin trial, any browser exposing `document.modelContext`)
- The McDuff case is instance one. The pattern — narrow semantic tools over a corpus, visible actuation, asymmetric perception — ports to newsrooms, SOCs, classrooms, and e-discovery by replacing `src/game/data/*`

---

## Why WebMCP, specifically

Before WebMCP, "playing with an AI" meant a chatbot beside your game, guessing at your screen from screenshots, while you drowned in data alone. The agent either had too little access to help or too much access to trust.

WebMCP changes the shape of the problem. The page declares exactly what an agent may do — and just as importantly, what it may not.

```
You:    (in ChatGPT) "Check the photo for anything strange in the window."
Agent:  open_image("DSC04821")
        · the photo viewer opens on your screen
Agent:  get_image_metadata("DSC04821")   — reads EXIF, cannot read pixels
        → "Zoom into the window glass, lower half. I can't see it. You can."
You:    zoom manually, spot the reflection, describe it
Agent:  search_messages("badge") · search_browser_history("kestrel")
Agent:  show_in_document("/Research/ORPHEUS/anomaly_notes.txt", "02:13 is not a time")
        · the document opens, scrolls to line 145, and pins a highlight
```

The machine visibly moves — windows open, documents scroll, lines highlight — and the agent never gets generic screen control. Remove WebMCP and the co-op collapses back into solo play, because there is no other channel: the agent has no REST API, no DOM scraping, no screenshots. Just 25 declared capabilities.

---

## Deliberately asymmetric

**A design decision, stated plainly:** ChatGPT can see images. I could have handed the agent pixels and it would have solved this case alone while you watched. Withholding vision is the point — it makes the second seat a player instead of an autocomplete. The tools do not exist, so the temptation does not exist, and neither seat can finish the case without the other.

**You are the eyes.**
Open applications, browse files, read documents, inspect photographs, zoom manually. Notice the reflection, the handwriting, the stopped clock hands, the timestamp in a corner. Form theories. Decide what matters. Write the final reconstruction.

**The agent is the memory.**
Search messages, mail, files, and history at scale. Read EXIF and system logs. Merge a chronology across five sources. Find the one line in 51 log entries that changes the case. Open the evidence on your screen and point at it.

There is no `zoom`, no `click(x,y)`, no `type`, no screenshot, no `read_screen`. The asymmetry is enforced by absence.

There is also a moment where it becomes a mechanic. After the vault opens, the workstation reopens a 90-second window every ~2.5 minutes. Inside it, **you** must zoom the stopped clock while **the agent** queries the logs from the same minute. Neither action counts alone. Neither counts outside the window.

---

## The tools

25 imperative tools plus 4 declarative HTML forms. Full table, schemas, and security audit in [`WEBMCP.md`](WEBMCP.md).

| | Tools |
|---|---|
| **Read** (12, `readOnlyHint`) | `get_investigation_context` · `search_files` · `read_file` · `search_messages` · `get_message_thread` · `search_emails` · `get_email` · `get_image_metadata` · `search_browser_history` · `get_system_logs` · `get_timeline` · `get_case_evidence` |
| **Navigate** (12, visible) | `open_application` · `focus_application` · `open_file` · **`show_in_document`** · `open_directory` · `open_email` · `open_browser_entry` · `open_messages_thread` · `open_image` · `highlight_evidence` · `open_evidence_board` · `terminal_command` |
| **Write** (1, guarded) | `record_evidence` |
| **Declarative forms** (4) | `request_correlation` · `record_evidence_form` · `unlock_vault` · `inspect_photo` |

Every navigation tool has a visible effect, and every tool routes through one shared capability layer (`src/game/services.ts`) that the UI also uses. Nothing is implemented twice.

---

## Verify it in 30 seconds — no agent required

The tool console is exposed to you, so WebMCP is verifiable without any host.

1. Open [`?demo=verify`](https://orpheus-mcduff.vercel.app/?demo=verify) — desktop, tool console already open. (Or the plain URL → **NEW INVESTIGATION** → click to skip the boot → tray **LINK** / `Ctrl+``.)
2. Press **⚡ QUICK VERIFY**.

Twelve deterministic checks plus three tool calls that visibly move the desk, then `✅ WEBMCP VERIFIED`. The document viewer opens, scrolls, and pins a highlight during the run.

Prefer a terminal?

```bash
pnpm install
pnpm test:webmcp     # 16/16 static checks — budgets, schemas, annotations,
                     # allowlist, declarative contract, lifecycle, architecture
pnpm dev             # http://localhost:3000
pnpm build && pnpm start

# end-to-end, in headless Chrome against the running build:
pnpm smoke           # boots the game, presses QUICK VERIFY, asserts 15/15
pnpm smoke:apps      # opens all 8 apps via open_application, walks the vault path — 27/27
```

Full walkthrough, including the 60-second agent path: [`JUDGE_QUICKSTART.md`](JUDGE_QUICKSTART.md).

---

## How the integration is built

- **Budgets enforced in code, not just documented.** 30 char names, 500 char descriptions, 150 char parameter descriptions, 200 char inputs, and a **registry-wide 1500 char output budget** applied to every tool result by `applyOutputBudget()` — long strings clipped, result arrays halved until the payload fits, with a `budget` note telling the model to refine rather than assume it saw everything.
- **Annotations on all 25 tools.** Every tool declares `readOnlyHint` explicitly; the nine returning in-world prose add `untrustedContentHint`, so a host treats Daniel's files and messages as data and never as instructions.
- **Allowlist, not blocklist.** `terminal_command` accepts nine verbs and `[A-Za-z0-9._/ -]`, capped at 200 chars. `;`, `&&`, `|`, backticks, and `$()` cannot appear. Ten injection cases are asserted.
- **A lifecycle that survives real hosts.** Registration is idempotent per context and reports success only when every tool registered; `toolchange` genuinely re-registers; the `AbortController` is stored so `abort()` can actually unregister; `execute` honours `signal.aborted` before and after the handler.
- **Both APIs.** Imperative tools plus four declarative forms with `toolautosubmit`, `agentInvoked` + `respondWith` after `preventDefault()` on every path, and `toolName` read off the lifecycle events as the spec defines.

Stack: Next.js 16.3, React 19, TypeScript, Tailwind 4, Turbopack, Zustand, `idb-keyval`, Web Audio. Motion is CSS-only, stepped at 80 ms for 90s snap. Headers: `Origin-Agent-Cluster: ?1`, `Permissions-Policy: tools=self`, `Cross-Origin-Opener-Policy: same-origin`.

---

## Repository layout

```
src/
  app/               layout (+ declarative focus styles), globals.css, page
  types/game.ts      every domain and state shape
  game/
    data/            filesystem · emails · chatMessages · browserHistory ·
                     systemLogs · evidence · photos
    state/           osStore · ariaStore · investigationStore · persistence
    services.ts      the shared capability layer — every capability exactly once
  webmcp/
    register.ts      25 tools, budgets, annotations, registration lifecycle
    static-checks.ts the 9 registry checks (browser and CI share this)
    selftest.ts      12 live deterministic evals
    evals.md         model-facing eval specs
  components/
    DeclarativeForm.tsx   the Declarative API contract, reusable
    AgentLinkPanel.tsx    the judge console
    GameRoot.tsx          lifecycle, hydration, WebMCP registration
    applications/         Files · Mail · Messages · Photos · Browser ·
                          Terminal · SystemLog · Evidence · TextViewer
    demo.ts            the ?demo= / ?skip= judge entry points
scripts/run-webmcp-tests.mjs   pnpm test:webmcp
scripts/smoke.mjs              pnpm smoke — headless boot + QUICK VERIFY
scripts/smoke-apps.mjs         pnpm smoke:apps — every app, every form, the vault

docs: README · WEBMCP.md (integration, security, architecture) ·
      JUDGE_QUICKSTART.md · GAME_DESIGN.md (puzzle design)
```

---

## The iris title

The opening is a diegetic circular mechanism — camera aperture, optical sensor, biometric scanner — that the menu orbits. It wakes with the machine, responds to hover, and contracts to black as the workstation boots, in one continuous motion. No logo, no hero image, no conventional menu.

---

## Beyond the case

Every corpus with the same shape — filesystem plus messages plus logs plus images, where some evidence is visual and some is machine-readable — has the same problem, and generic automation that can click anything is the wrong answer to it.

- **Co-op games and puzzle hunts** — this instance: a mystery where a solo player has a partner who remembers everything while they look closer
- **Newsroom leak review** — where one photograph matters and 50,000 documents also matter
- **SOC and air-gapped host forensics** — an analyst alone on a night shift is not alone at the desk
- **Research integrity, e-discovery, classroom archive digs** — describe what you see, get context back

Replace `src/game/data/*`, keep the `services.ts` + `register.ts` split, deploy one static site. No backend, no environment variables, IndexedDB persistence.

---

## Credits and fiction notice

Daniel McDuff is fictional. The Kestrel Institute is fictional. The tilt described in the game has no real-world referent outside the narrative. Interface audio uses curated local samples and restrained Web Audio synthesis.

MIT licensed. Built for the WebMCP Challenge — not AI to replace people, but presence for when people aren't there.
