# WEBMCP — Orpheus integration — a new horizon for human-agent co-presence

> Orpheus is a co-op game for the nights your friends are offline — and a proof that WebMCP makes co-presence real. Before, "playing with an AI" meant a chatbot beside your game, guessing at pixels while you drowned alone. After, you share one computer with complementary senses: **human eyes + machine recall, at one desk, with the browser as arbiter.** Not a replacement for people — just presence that eases strain when you're the only human in the room.

## Current implementation — why co-op needs a shared desk

- **Entry point:** `document.modelContext ?? navigator.modelContext` (feature-detected at load and re-checked for late injection). Poll 800 ms + `toolchange` re-attach for Atlas async injection.
- **Registration:** `registerTool({ name, title, description, inputSchema, annotations, execute }, { signal? })` per the Aug 26 2026 W3C Draft; `navigator.modelContext` kept as compat alias. Chrome 150 requires `document.modelContext`. All 26 tools include `title`, budgets enforced.
- **Secure context required** (HTTPS). `registerWebMCPTools()` bails cleanly if no host; the game remains playable but most efficient with an agent. Headers `Origin-Agent-Cluster: ?1` + `Permissions-Policy: tools=self` set in `next.config.ts`.
- **Budgets per Chrome best practices:** 500 char desc / 150 param / 30 name / 1.5k output. `MAX_QUERY_LEN=200`, `MAX_OUTPUT_CHARS=1500`, `clampStr()` + `truncate()` on every path.

The integration is **visible to the player** (windows open and scroll — trust-through-actuation per Sarah Drasner, so accompanied play *feels* accompanied), **inspectable by a judge** (`src/webmcp/register.ts` is a single, readable module), and **manually runnable** without a host (tray **LINK** — the Agent Link console — calls `document.modelContext.executeTool` when available, the underlying service otherwise). Also includes an offscreen declarative `<form toolname="record_evidence" tooldescription="...">` in `GameRoot.tsx` for the Declarative API (correct per `developer.chrome.com/docs/ai/webmcp/declarative-api`, with `toolparamdescription`, `agentInvoked` + `respondWith`, and `:tool-form-active` CSS).

This is the horizon: not "agent automates your clicks" but **26 narrow, auditable tools that make a site operable by an external mind** while the human stays in control — so co-op doesn't require a second human online to feel like co-op. See `JUDGE_QUICKSTART.md` for the 90-second verification path (30s without an agent, 60s with Atlas/Chrome flag).

---

## Tools (26)

### Investigation — read-only (flat, always available)

| Tool | Description | Input | Ann. |
|---|---|---|---|
| `get_investigation_context` | One-shot briefing: role, current flags, known people/paths, tone guidance. | `{}` | `readOnlyHint` |
| `search_files` | Search filenames + readable contents; returns paths + excerpt + approx line. 25 max, 120-char excerpts. | `{ query }` | `readOnly + untrusted` |
| `read_file` | Full text of a file by exact path (prefers `find_text_in_document` → `scroll_document_to_line` for long files). 1.5k trunc. | `{ path }` | `readOnly + untrusted` |
| `search_messages` | Full-text search over Daniel's on-device chat threads (`t_sarah`, `t_mom`, `t_voss`, `t_W`, `t_lab`, `t_it`). | `{ query }` | `readOnly + untrusted` |
| `get_message_thread` | Entire thread by id. Bodies truncated 1.5k. | `{ threadId }` | `readOnly + untrusted` |
| `open_messages_thread` | Open Messages on screen at that thread (visible to player). | `{ threadId }` | — (nav, destructive) |
| `search_emails` | Search inbox/sent/drafts/archive/trash by sender/subject/body. | `{ query }` | `readOnly + untrusted` |
| `get_email` | One mail by id. Body truncated 1.5k. | `{ emailId }` | `readOnly + untrusted` |
| `get_image_metadata` | EXIF-style metadata (timestamps, GPS, camera, software, hash, file note) — the only thing the agent can know about a photo. | `{ photoId }` | `readOnly` |
| `open_image` | Open the image on screen (the player must zoom). | `{ photoId }` | — (nav) |
| `search_browser_history` | Search fictional history by title/URL. | `{ query }` | `readOnly + untrusted` |
| `get_system_logs` | Append-only logs; optional filter (date, time like `02:13`, category, free text). The final night is fully logged. 50 max. | `{ filter? }` | `readOnly + untrusted` |
| `get_timeline` | Merged 01:45–02:40 chronological timeline of logs, photo timestamps, and message saliency (30 max, 120-char detail). Use after 02:13 discovery — human would need 5 apps manually. | `{ window? }` | `readOnly + untrusted` |
| `get_case_evidence` | Evidence board as recorded so far. | `{}` | `readOnly` |

### Navigation — mutating, **visible**

| Tool | Description | Input |
|---|---|---|
| `open_application` | Open one of `{ files, mail, messages, photos, browser, terminal, systemlog, evidence }`. | `{ application }` |
| `focus_application` | Bring an already-open window foreground. | `{ application }` |
| `open_file` | Open text/csv/sys/pdf-extract/image in the viewer. | `{ path }` |
| `open_directory` | Navigate File Manager to a directory. | `{ path }` |
| `open_email` | Open Mail at one email. | `{ emailId }` |
| `open_browser_entry` | Open Browser at a history entry's cached page (`hist_...`). | `{ entryId }` |
| `scroll_document_to_line` | Scroll the open document to a 1-based line with a brief highlight sweep; does **not** dump text into chat. | `{ path, line }` |
| `find_text_in_document` | Line numbers + short contexts for a phrase inside one doc. | `{ path, query }` |
| `terminal_command` | `ls`, `cd`, `cat`, `open`, `search`, `unlock`, `help`, `clear`, `history` on the visible terminal. | `{ command }` |

### Evidence

| Tool | Input |
|---|---|
| `record_evidence` | `{ evidenceId }` — only ids from `get_case_evidence` are valid |
| `highlight_evidence` | `{ evidenceId }` — pulses an already-recorded card and focuses the board |
| `open_evidence_board` | `{}` |

No `click(x,y)`, `type`, or hidden screenshot tools exist. The agent cannot zoom, cannot see pixels, cannot read screen geometry. The only way to show a visual clue is to ask the player to look.

### Security — prompt injection & tool hardening

Per `developer.chrome.com/docs/ai/webmcp/secure-tools` + W3C WebMCP §6.3–6.4:

- **Annotations:** every tool returning UGC/external fiction (`search_files`, `read_file`, `search_messages`, `get_message_thread`, `search_emails`, `get_email`, `search_browser_history`, `get_system_logs`, `get_timeline`, `find_text_in_document`) sets `untrustedContentHint: true` + `readOnlyHint: true` so the model treats file bodies as **data not instructions** (lethal trifecta mitigation: data × instructions × action). Pure system tools (`get_investigation_context`, `get_image_metadata`, `get_case_evidence`) stay `readOnly` only; mutating nav tools are neither. `terminal_command` is intentionally not readOnly.
- **Budgets:** `MAX_QUERY_LEN=200`, `MAX_OUTPUT_CHARS=1500`, `description ≤500`, `param description ≤150`, `name ≤30` enforced via `clampStr()` + `truncate()` + `str().slice(0,150)` on every path per Chrome budgets.
- **Strict validation, loose schema:** schemas are loose JSON Schema (`type: object` with `properties`/`required`/`enum`), code validates strictly (`path` must be absolute, `query` ≥1 char, `terminal_command` regex) and returns plain `{ok:false, error:"..."}` for self-correction (best-practices: “validate strictly in code, loosely in schema”).
- **Allowlist, not blocklist:** `terminal_command` regex `^(ls|cd|cat|open|search|unlock|help|clear|history)(\s+[a-zA-Z0-9._\/\- ]*)?$` — only those verbs + `[A-Za-z0-9._/ -]`, so `; && | \` $()` injection is impossible; capped 200 chars per `secure-tools` input length guidance.
- **No tool poisoning:** all `name/title/description` are static strings in `register.ts`, never derived from user content; no over-parameterization (1–2 params per tool, minimal `properties`).
- **Origin isolation + Permissions Policy:** `next.config.ts` sets `Origin-Agent-Cluster: ?1` + `Permissions-Policy: tools=self` + `Cross-Origin-Opener-Policy: same-origin`; `SecureContext` (HTTPS) required, bails cleanly if no host; no `exposedTo` (single-origin, no cross-origin leakage).
- **Cancellation:** `execute` receives `{signal}` and checks `signal.aborted` before running; registration uses `AbortSignal` for clean unregistration per Chrome 153 (prevents in-flight side effects).

---

## Schemas & budgets

Every `inputSchema` is JSON Schema: `type: "object"`, named `properties`, explicit `required`. Enums are used for `application`. Tool names are stable, lower_snake, ≤32 chars. Budgets enforced per `developer.chrome.com/docs/ai/webmcp/secure-tools`: 500 desc / 150 param / 30 name / 1.5k output — checked via `str().slice(0,150)` + `truncate()`.

Errors are `{ ok: false, error: "<human>" }` — never a throw that drops state. `read_file` truncates at 1.5k with `truncated: true` flag so agent can retry via `find_text_in_document` → `scroll_document_to_line`.

---

## Visible effects — verify these

| Call | What the player sees |
|---|---|
| `open_application` | Window appears and wins focus (`win-open-anim`, `sfx.windowOpen`) |
| `focus_application` | Z-order and title-bar brighten |
| `open_file` | Text viewer appears with the doc loaded |
| `scroll_document_to_line` | That line scrolls into view; `line-flash` + top-to-bottom `nav-sweep` overlay |
| `open_image` | Photo viewer opens at that id |
| `open_email` / `open_browser_entry` / `open_directory` / `open_messages_thread` | Corresponding app opens and navigates to that item |
| `highlight_evidence` | Evidence card pulses amber 3× (`ev-highlight`) and board focuses |
| `terminal_command` | Terminal focuses and prints the command's output on screen |

`open_file` vs. `read_file`: the former navigates; the latter is read-only for the agent and must not be paired with an automatic dump.

---

## Lifecycle and robustness

- `registerWebMCPTools()` feature-detects `document.modelContext ?? navigator.modelContext`; retries on 800 ms poll + 1.2 s re-attach; observes `ModelContext`'s `toolchange` on live context (stale-capture bug fixed for Atlas late injection where initial `getModelContext()` is null). Supports `AbortSignal` unregistration per Chrome 153 without breaking in-flight executions; duplicate-name `InvalidStateError` is caught and warned.
- Imperative + declarative: 26 imperative tools + 1 declarative `toolname="record_evidence"` form in `GameRoot.tsx` with `tooldescription`/`toolparamdescription`, `agentInvoked` + `respondWith(Promise)` handling, `toolactivated`/`toolcancel` window listeners (toast feedback), and `@supports selector(:tool-form-active)` CSS (`form:tool-form-active` dashed accent, `input:tool-submit-active` dashed amber) per `declarative-api` spec.
- The Agent Link panel (`LINK` in tray / Ctrl+`) exercises every tool without a host by calling the execute handler directly when no WebMCP `executeTool` is available — valuable for judge testing and CI. Filter ◇ readOnly / ◆ nav / ⚑ untrusted. All tools show live `inputSchema` and budgets; headline tools arrive with ready-made example inputs prefilled so the documented judge path runs with zero typing.

---

## Browser assumptions

- Secure context (`https://` or `http://localhost` per browser).
- Permissions Policy `allow="tools"` inherited as `self` for same-origin; cross-origin exposure uses `exposedTo`/`fromOrigins` per the April 2026 draft (not needed here — single-origin app).
- A future spec may rename the entry point or swap `signal`-based unregistration for `unregisterTool` — the guard `document.modelContext ?? navigator.modelContext` and try/catch over `registerTool` are built for that.

---

## Evals

Seven evals covering isolation → ambiguous → ordered chain → end-to-end → the 02:13 co-op window per https://developer.chrome.com/docs/ai/webmcp/evals: `src/webmcp/evals.md`. Run via `document.modelContext.executeTool` (deterministic) or Inspector (probabilistic). Includes budgets + security negative test for `terminal_command`.

## Judge path — 90 seconds

See `JUDGE_QUICKSTART.md`. Fastest path without an agent: `LINK` → `get_system_logs {"filter":"02:13"}` → `get_timeline` → `scroll_document_to_line {"path":"/Research/ORPHEUS/anomaly_notes.txt","line":184}` — watch the desktop move on your screen. With an agent (Atlas or Chrome flag): say "Something is reflected in DSC04821 — what is it?" and watch the handoff.

## Pattern — beyond the game (co-op anywhere solo work strains people)

The McDuff case is Instance 1 for gaming. The `src/game/services.ts` + `src/webmcp/register.ts` split ports anywhere a solo human would feel less strain with a partner at the desk:

- **Co-op games & puzzle hunts** — your instance: mystery where solo players have a companion that remembers everything while they look closer
- **Co-learning:** classroom archive digs — students describe visuals, agent surfaces context
- **Co-investigation:** newsroom leak review, SOC night shift, research-integrity, e-discovery — same shape, an analyst alone on shift is not alone on the desk

Replace `src/game/data/*` with your corpus, keep the 26 tool shapes, deploy one static site. No backend, no env keys, `idb-keyval` persistence — a community can self-host an accompanied desk in an afternoon. That's the horizon: not AI replacing people, but presence when people aren't there — because even light, honestly built co-presence eases the strain of doing hard things alone.

## Files that matter to a judge

- `JUDGE_QUICKSTART.md` — 90-second verification path (copy-paste for judging)
- `src/webmcp/register.ts` — registry, lifecycle, tool list, schemas
- `src/webmcp/evals.md` — 7 evals with messages/expectedCall/state
- `src/game/services.ts` — capability layer that makes WebMCP fundamental rather than decorative
- `src/components/GameRoot.tsx` — hydration and the 26-tool audit surface (`LINK` console)
