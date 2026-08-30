# WEBMCP — how Orpheus uses the standard

> The agent gets 25 narrow, auditable tools that operate the workstation. The human keeps the one capability no tool exposes — looking.

Everything below is verifiable in this repo. `pnpm test:webmcp` checks the registry headless; **LINK → ⚡ QUICK VERIFY** checks it live in the browser with no agent required.

---

## The shape of the integration

| | |
|---|---|
| Entry point | `document.modelContext ?? navigator.modelContext`, feature-detected, re-checked for late injection |
| Imperative tools | **25**, all in `src/webmcp/register.ts` |
| Declarative forms | **4**, from annotated HTML (`request_correlation`, `record_evidence_form`, `unlock_vault`, `inspect_photo`) |
| Capability layer | `src/game/services.ts` — every tool and every UI component calls the same functions |
| Budgets | 30 name · 500 description · 150 param · 200 input · 1500 output, enforced in code |
| Annotations | every tool declares `readOnlyHint` explicitly; content-returning tools add `untrustedContentHint` |
| Secure context | HTTPS required; registration bails cleanly with no host, and the game stays playable |
| Headers | `Origin-Agent-Cluster: ?1`, `Permissions-Policy: tools=self`, `Cross-Origin-Opener-Policy: same-origin` (`next.config.ts`) |

Three properties matter more than the counts:

1. **Visible.** Every mutating tool changes what is on the player's screen. Windows open, documents scroll, a highlight pins, the terminal prints. You watch the agent work.
2. **Asymmetric.** There is no `zoom`, no `click(x,y)`, no `type`, no screenshot. This is a decision, not a constraint: ChatGPT is multimodal, and an agent with pixels solves this case alone while the human watches. Removing the capability is the only version that holds under a host that wants to be helpful — a prompt asking a model not to look is not a mechanic.
3. **Shared.** `services.ts` is the only module that knows how to open a file, scroll a document, unlock the vault, or search the corpus. Remove WebMCP and the agent loses every one of those abilities at once.

---

## Tools

25 imperative tools, grouped by what they do to the machine.

### Read — machine-readable data the human cannot skim

`readOnlyHint: true`. The nine tools returning in-world prose also set `untrustedContentHint: true`, so a host treats file bodies, messages, and logs as **data, never instructions**.

| Tool | What it returns | Input | Annotations |
|---|---|---|---|
| `get_investigation_context` | Role briefing, live flags, progress, suggested next steps, known people and paths | `{}` | readOnly |
| `search_files` | Paths + 120-char excerpts + approximate line, 25 max | `{ query }` | readOnly · untrusted |
| `read_file` | Full text by exact path, truncated at 1500 chars with a `truncated` flag | `{ path }` | readOnly · untrusted |
| `search_messages` | Full-text search across Daniel's on-device threads | `{ query }` | readOnly · untrusted |
| `get_message_thread` | One entire thread by id | `{ threadId }` | readOnly · untrusted |
| `search_emails` | Mail search by sender, subject, or body across five folders | `{ query }` | readOnly · untrusted |
| `get_email` | One email's full text | `{ emailId }` | readOnly · untrusted |
| `get_image_metadata` | EXIF: timestamps, GPS, camera, software, hash, note — plus a `lookHint` telling the player where to look | `{ photoId }` | readOnly |
| `search_browser_history` | History by title or URL fragment | `{ query }` | readOnly · untrusted |
| `get_system_logs` | Append-only logs, optional filter (date, `02:13`, category, free text), 50 max | `{ filter? }` | readOnly · untrusted |
| `get_timeline` | Logs + photo EXIF + message traffic merged into one chronology for a `HH:MM-HH:MM` window | `{ window? }` | readOnly · untrusted |
| `get_case_evidence` | The evidence board as recorded so far | `{}` | readOnly |

### Navigate — the agent moving the player's screen

`readOnlyHint: false`, `destructiveHint: false`. Each one has a visible effect the judge can watch.

| Tool | What the player sees | Input |
|---|---|---|
| `open_application` | Window appears and takes focus | `{ application }` |
| `focus_application` | Z-order changes, title bar brightens | `{ application }` |
| `open_file` | Text viewer opens with the document loaded | `{ path }` |
| **`show_in_document`** | Document opens if closed, scrolls to the line, flashes, then **pins a persistent highlight** until the player clicks, scrolls, types, or dismisses it | `{ path, line? }` or `{ path, query? }` |
| `open_directory` | File Manager navigates to that directory | `{ path }` |
| `open_email` | Mail opens at that message | `{ emailId }` |
| `open_browser_entry` | Browser opens the cached page | `{ entryId }` |
| `open_messages_thread` | Messages opens at that thread | `{ threadId }` |
| `open_image` | Photo viewer opens; the agent still cannot see it | `{ photoId }` |
| `highlight_evidence` | Evidence card pulses amber and the board focuses | `{ evidenceId }` |
| `open_evidence_board` | Evidence board opens | `{}` |
| `terminal_command` | Terminal focuses and prints the output | `{ command }` |

`show_in_document` replaces what used to be a three-call chain (`open_file` → `scroll_document_to_line` → `find_text_in_document`) and accepts either an explicit `line` or a `query` resolved to the first match, so the agent points at a passage in one round trip instead of quoting it into chat.

### Write — guarded

| Tool | Guard | Input |
|---|---|---|
| `record_evidence` | Only ids that exist in the evidence data are accepted; the agent cannot invent evidence | `{ evidenceId }` |

### What deliberately does not exist

No `click`, no `type`, no `zoom`, no `pan`, no `screenshot`, no `read_screen`. The only way for the agent to make the player see something visual is to open it and ask them to look.

---

## Declarative API

Four annotated HTML forms, registered by the browser itself, per [the Declarative API guide](https://developer.chrome.com/docs/ai/webmcp/declarative-api). Three are visible surfaces in the apps; the fourth sits beside the correlation form on the Evidence board.

| Form | Where | What it does |
|---|---|---|
| `request_correlation` | Evidence board | Searches files, messages, and mail for one term the player noticed |
| `record_evidence_form` | Evidence board | Records one evidence id — the declarative twin of `record_evidence` |
| `unlock_vault` | File Manager (once the private hint is found) | Submits the three-word passphrase |
| `inspect_photo` | Photos | Returns EXIF plus a directional hint for one photo |

`src/components/DeclarativeForm.tsx` is a single reusable component implementing the full contract:

- `toolname` + `tooldescription` on the `<form>`, `toolparamdescription` on the input
- **`toolautosubmit`**, so an agent invocation actually completes and `respondWith` returns a value instead of waiting for a human click
- `SubmitEvent.agentInvoked` + `respondWith(Promise)`, with `preventDefault()` called **before** `respondWith` on every path — including validation failure, so an agent-invoked empty submit returns a structured error rather than falling through to a native navigation
- window `toolactivated` / `toolcancel` read `toolName` **off the event**, as the spec defines it (a `detail` fallback remains for older builds)
- `:tool-form-active` / `:tool-submit-active` focus indicators, shipped from `src/app/layout.tsx` behind an `@supports selector()` guard because those pseudo-classes are newer than the build's CSS parser

---

## Security

Per [WebMCP tool security](https://developer.chrome.com/docs/ai/webmcp/secure-tools) and W3C §6.3–6.4.

**Prompt injection.** Every tool returning in-world content sets `untrustedContentHint: true` alongside `readOnlyHint: true`. Daniel's files, mail, and messages are fiction written to be read — including a thread from an unknown contact — so the model must treat them as data. This closes the data × instructions × action triangle.

**Annotations on everything.** All 25 tools declare `readOnlyHint` explicitly, reads and writes alike. A host never has to infer whether a call will change the user's screen. `pnpm test:webmcp` fails if any tool omits it, or if a navigation tool ever claims to be read-only.

**Allowlist, not blocklist.** `terminal_command` accepts only `ls|cd|cat|open|search|unlock|help|clear|history` followed by `[A-Za-z0-9._/ -]`, capped at 200 chars. `;`, `&&`, `|`, backticks, and `$()` cannot appear at all. Seven negative cases are asserted headless and three more in the browser.

**Budgets, enforced not documented.** Input is clamped before use. Per-field truncation applies to long bodies. And every tool return value passes through `applyOutputBudget()` in the registration wrapper: the serialized payload is measured, long strings are clipped, result arrays are halved until it fits 1500 chars, and a `budget` note tells the model to refine rather than assume it saw everything. The registry-wide budget is a real code path, not a claim — eval 5 proves it by budgeting an unfiltered `get_system_logs`.

**No tool poisoning.** Every `name`, `title`, and `description` is a static string. Nothing is derived from user or in-world content. No tool takes more than three parameters, asserted by check 8.

**Strict in code, loose in schema.** Schemas are plain JSON Schema. Validation is strict in the handler: absolute paths, non-empty queries, allowlisted commands, ids that must exist. Failures return `{ ok: false, error: "…" }` in plain language so the model can self-correct — never a throw that drops state.

**Origin isolation.** `Origin-Agent-Cluster: ?1` and `Permissions-Policy: tools=self`. Single origin, so no `exposedTo` and no cross-origin exposure.

---

## Lifecycle

Built for hosts that inject late, swap contexts, and change their minds.

- **Detection** — `document.modelContext` first, `navigator.modelContext` as a compatibility fallback, `null` off-DOM.
- **Registration is idempotent per context.** `registerWebMCPTools()` resolves `true` only when *every* tool registered. A partial failure keeps `registered` false, logs which tools failed, and lets the caller's poll retry — a silent half-registration cannot look like success. Duplicate-name `InvalidStateError` is treated as already-present, not as failure.
- **`toolchange` actually re-registers.** `GameRoot` polls every 800 ms, re-attaches its listener when the context appears or is replaced, and calls registration again on every change. If a host clears the tool set, the tools come back.
- **Unregistration is real.** The `AbortController` is stored, and `unregisterWebMCPTools()` calls `abort()` — the Chrome 153 path that detaches tools without cancelling in-flight executions. A host swap unregisters the old context before registering the new one.
- **Cancellation is honoured.** `execute` receives `{ signal }` and checks `aborted` both before dispatch and after the handler resolves, so a cancelled call reports `{ ok: false, error: "cancelled" }` instead of silently mutating state.
- **The LINK console uses the real path.** With a host present it calls `document.modelContext.getTools()` then `executeTool()` and labels the result `routed through document.modelContext.executeTool`. Without one it calls the handler directly and says so. `src/webmcp/register.ts` → `executeToolLikeHost()`.

---

## Verification

Three suites, one source of truth. The 9 registry checks live in `src/webmcp/static-checks.ts` and run in *both* the headless runner and the in-browser panel, so the two can never disagree.

**Headless — `pnpm test:webmcp`** (16 checks, no browser, no host). The first nine are the shared registry suite; the last seven are source-level checks the runner performs on the repo itself:

```
✓ registry: 25 tools · name ≤30 · description ≤500 · param ≤150
✓ metadata: every tool declares a human-readable title
✓ schemas: type:object · properties declared · required ⊆ properties
✓ annotations: every tool declares readOnlyHint explicitly
✓ security: content-returning tools mark readOnly + untrustedContentHint
✓ annotations: mutating tools declare readOnlyHint:false
✓ security: terminal_command allowlist permits verbs, blocks injection
✓ surface: no tool takes more than 3 parameters
✓ registry: unique names + callable execute()
✓ budgets: register.ts constants match the documented limits
✓ budgets: every tool result passes through applyOutputBudget()
✓ declarative API: DeclarativeForm implements the full spec contract
✓ declarative API: 4 visible forms wired into the apps
✓ declarative API: :tool-form-active / :tool-submit-active styled behind @supports
✓ lifecycle: registration, unregistration, and cancellation are real
✓ architecture: tools delegate to services.ts, never reimplement game logic
```

The script parses `register.ts` with a brace-matching reader and **fails loudly** if it cannot read a tool, if a tool is defined but missing from `TOOL_DEFS`, or if the budget constants drift from the documented numbers. It reads those constants out of `register.ts` rather than restating them, so it cannot pass by agreeing with itself.

**In-browser — LINK → RUN EVALS / ⚡ QUICK VERIFY** (`src/webmcp/selftest.ts`): 12 deterministic checks that call the real handlers against the real fixtures — the static suite, the briefing shape, excerpt budgets, the registry-wide output budget, cross-modal search, the 02:13 cluster, timeline merging, `show_in_document` resolving to the line `LINE_0213_PASSAGE` computes from the document text, out-of-range failure, vault gating on sealed photos, and the terminal allowlist. QUICK VERIFY adds three calls that **visibly move the desk**. Both snapshot investigation state and restore it afterward, so judging advances no checkpoints.

Model-facing eval specs in the `messages` / `expectedCall` format: `src/webmcp/evals.md`.

**End to end — `pnpm smoke` and `pnpm smoke:apps`** (headless Chrome against a running build). `smoke` boots the game to the desktop, opens LINK, presses ⚡ QUICK VERIFY, and asserts 15/15 plus that the text viewer actually opened — the actuation claim, verified by a machine rather than asserted in prose. `smoke:apps` opens all eight applications *through the `open_application` tool*, confirms the three declarative forms are in the DOM with `tooldescription`, `toolautosubmit`, and `toolparamdescription` set, drives `show_in_document` and `terminal_command`, walks the whole vault path (wrong passphrase → fragment archive, correct passphrase → decrypt → sealed photo becomes readable → `/Private` navigable), and fails on any uncaught page error. 27/27 at the time of writing.

---

## The 02:13 window — why this needs both seats

After the vault opens, the workstation reopens a 90-second observability window every ~2.5 minutes. Inside it, one asymmetric pair completes the beat: **the human zooms the stopped clock in `DSC04655` past 2.5×** while **the agent calls `get_system_logs`**. `noteWindowHuman()` and `noteWindowAgent()` both live in `services.ts`; neither fires outside the window and neither counts alone. Sync both and `/Private/window_echo.txt` appears.

It is a two-player mechanic where one player is an agent, and it cannot exist without a web standard that lets a page hand an agent real, narrow capabilities while a human watches. Reachable in ~20 seconds via [`?demo=window`](https://orpheus-mcduff.vercel.app/?demo=window) (`src/game/demo.ts`).

---

## Architecture

One rule runs through the codebase: **if the human can do it and the agent can do it, the logic exists exactly once.** `src/game/services.ts` is that once. The React apps call it; the WebMCP tools call it. Removing WebMCP does not degrade the agent — it removes it entirely.

Next.js 16.3 (App Router, Turbopack, TypeScript), React 19, Tailwind 4, Zustand 5 persisted to IndexedDB via `idb-keyval`, CSS-only motion stepped at 80 ms, Web Audio (sampled first, procedural fallback). Two static routes over one engine, SSR-safe throughout. No server, database, authentication, external API calls, or environment variables.

```
src/
  app/                   layout (+ declarative focus styles), globals.css, page · apollo13/page
  types/game.ts          every domain and state shape
  game/
    data/                corpus.ts        THE instance seam — record + rules + chrome
                         mcduff:          filesystem (docs + computed key lines) · emails (17/5 folders) ·
                                          chatMessages (7 threads incl. t_observer, 35 msgs) ·
                                          browserHistory (18 + 17 cached) · systemLogs (51) ·
                                          evidence (21/5 sections) · photos (12, 3 sealed)
                         apollo13/        Review Board + Mission Report docs · 5 voice loops (53 msgs) ·
                                          42 log rows · 9 NASA photographs · 20 evidence items ·
                                          SOURCES.md (every citation, every known gap)
    state/               osStore (phase, windows, flags, vault, obsWindow, synchrony) ·
                         ariaStore (agent status only — WebMCP is the channel) ·
                         investigationStore (evidence, four-question verdicts) ·
                         persistence (one debounced idb-keyval record)
    services.ts          THE capability layer — every capability exactly once
    demo.ts              ?demo= / ?skip= judge entry points
  webmcp/                register.ts · static-checks.ts · selftest.ts · evals.md
  components/            DeclarativeForm · AgentLinkPanel · GameRoot ·
                         title/ boot/ desktop/ taskbar/ windows/ notifications/ applications/
  audio/engine.ts        hum, drone, key clicks, chimes, ambience
```

**Capability parity.** Each capability has one implementation and up to two entry points. `FilesApp` double-click and `open_file` both call `openFile()`. The text viewer's find bar and `show_in_document` both call `showInDocument()`. Two capabilities are deliberately one-sided: `notePhotoInspection` (the zoom detent — UI only, no zoom tool) and `getTimeline` (agent only, no UI equivalent). Components communicate through five `SimpleBus` channels plus `TermBus` and the document listeners.

**Adding to the world.** A document is an `FsNode` in the corpus's `filesystem.ts`; a photo is a `PhotoMeta` plus an image in `public/Images/`; an evidence item is an `EvidenceItem` with an optional `autoUnlockFlag`. A new tool is a `services.ts` function plus one entry in `TOOL_DEFS` — `register.ts` may not import from `game/data/*`, and `pnpm test:webmcp` fails if it does.

---

## Two instances, one tool layer

The claim that this generalises is not an assertion in a README; it is a second route. **[`/apollo13`](https://orpheus-mcduff.vercel.app/apollo13)** runs the same 25 tools, the same `services.ts`, the same vault and the same observability window over the primary record of the Apollo 13 accident — the Review Board report of June 1970, the MSC-02680 Mission Report, five voice-loop threads, and nine photographs from the NASA Image Library with real byte sizes and real SHA-256 prefixes.

Everything that differs between the two instances lives behind one interface, `Corpus` in `src/game/data/corpus.ts`. It has two halves:

- **the record** — `filesystem`, `emails`, `threads`, `messages`, `history`, `cachedPages`, `logs`, `photos`, `evidence`, `photoSources`
- **the rules and the chrome** — `fileFlags`, `photoFlags`, `historyFlags`, `derivedFlags`, `milestones`, `vault`, `syncWindow`, plus `chrome`, `briefing`, `briefingSpine`, `guidance` and `vaultUi`, which supply every string a player reads outside a document: BIOS wordmark, terminal prompt and `whoami`, desktop watermark, case jacket, checklist steps, idle hints, evidence empty states, the LINK console's canned arguments, and the closing card.

`services.ts` resolves the corpus lazily through `activeCorpus()` and contains no corpus-specific string. Registering an instance is two lines:

```ts
registerCorpus("apollo13", () => APOLLO13_CORPUS);
setActiveCorpus("apollo13");
```

Saves are scoped per corpus, so the two investigations cannot overwrite each other.

**The real corpus was the harder constraint.** Instance one can invent a clue when the puzzle needs one; instance two cannot. So the design rule inverted: quote verbatim or don't quote, flag every derived timestamp in the metadata `note`, and where the record contradicts itself, **preserve the contradiction**. Three are load-bearing:

| Conflict | Δ |
|---|---|
| SM jettison — Mission Report GET 138:01:48 vs voice loop 138:02:06 | 18 s |
| Splashdown — report-derived 12:07:41 p.m. CST vs press caption 12:07:44 | 3 s |
| S70-35013 captions the CO2 adapter as the command module's; the frame is the lunar module's | wrong vehicle |

A corpus that resolves its own conflicts cannot teach anyone to find one. The second clock is the other half: the disk speaks Ground Elapsed Time, UTC is range zero `1970-04-11 19:13:00` plus GET, and the accident at GET 55:54:53.182 is **03:07 UTC** — the number that plays the role 02:13 plays in instance one.

---

## Files a judge should open

| File | Why |
|---|---|
| `src/webmcp/register.ts` | The registry: 25 tools, budgets, annotations, lifecycle, host-path execution |
| `src/game/services.ts` | The shared capability layer — the reason WebMCP is fundamental here |
| `src/components/DeclarativeForm.tsx` | The full declarative contract in one reusable component |
| `src/webmcp/static-checks.ts` | The checks that run in both the browser and CI |
| `src/webmcp/selftest.ts` | The 12 live deterministic evals behind RUN EVALS |
| `src/webmcp/evals.md` | Model-facing eval specs |
| `JUDGE_QUICKSTART.md` | The 30-second no-host path and the 60-second agent path |
