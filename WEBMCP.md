# WEBMCP — Orpheus integration

## Current implementation

- **Entry point:** `document.modelContext ?? navigator.modelContext` (feature-detected at load and re-checked for late injection). Poll 800 ms + `toolchange` re-attach for Atlas async injection.
- **Registration:** `registerTool({ name, title, description, inputSchema, annotations, execute }, { signal? })` per the Aug 26 2026 W3C Draft; `navigator.modelContext` kept as compat alias. Chrome 150 requires `document.modelContext`. All 25 tools include `title`, budgets enforced.
- **Secure context required** (HTTPS). `registerWebMCPTools()` bails cleanly if no host; the game remains playable but most efficient with an agent. Headers `Origin-Agent-Cluster: ?1` + `Permissions-Policy: tools=self` set in `next.config.ts`.
- **Budgets per Chrome best practices:** 500 char desc / 150 param / 30 name / 1.5k output. `MAX_QUERY_LEN=200`, `MAX_OUTPUT_CHARS=1500`, `clampStr()` + `truncate()` on every path.

The integration is **visible to the player** (windows open and scroll), **inspectable by a judge** (`src/webmcp/register.ts` is a single, readable module), and **manually runnable** without a host (tray **LINK** — the Agent Link console — calls `document.modelContext.executeTool` when available, the underlying service otherwise). Also includes a hidden declarative `<form data-webmcp-tool="record_evidence">` in `GameRoot.tsx` for the Declarative API.

---

## Tools (25)

### Investigation — read-only (flat, always available — Alex Nahas)

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

Security: `read_file`/`get_email`/`get_message_thread` etc. return `untrustedContentHint: true` so agents treat file bodies as data not instructions (lethal trifecta mitigation — Alex Nahas). `terminal_command` allowlists `ls|cd|cat|open|search|unlock|help|clear|history` and caps at 200 chars.

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

- `registerWebMCPTools()` feature-detects; retries on 800 ms poll + 1.2 s re-attach; observes `ModelContext`'s `toolchange` on live context (stale-capture bug fixed for Atlas late injection). Supports `AbortSignal`.
- Duplicate-name registration rejection is caught; `unregister` via signal ready.
- The Agent Link panel (`LINK` in tray / Ctrl+`) exercises every tool without a host by calling the execute handler directly when no WebMCP `executeTool` is available — valuable for judge testing and CI. Filter ◇ readOnly / ◆ nav / ⚑ untrusted. Declarative form fallback for `record_evidence` in `GameRoot.tsx`.

---

## Browser assumptions

- Secure context (`https://` or `http://localhost` per browser).
- Permissions Policy `allow="tools"` inherited as `self` for same-origin; cross-origin exposure uses `exposedTo`/`fromOrigins` per the April 2026 draft (not needed here — single-origin app).
- A future spec may rename the entry point or swap `signal`-based unregistration for `unregisterTool` — the guard `document.modelContext ?? navigator.modelContext` and try/catch over `registerTool` are built for that.

---

## Files that matter to a judge

- `src/webmcp/register.ts` — registry, lifecycle, tool list, schemas
- `src/game/services.ts` — capability layer that makes WebMCP fundamental rather than decorative
- `src/components/GameRoot.tsx` — hydration and the 25-tool audit surface (`LINK` console)
