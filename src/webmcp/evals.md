# WebMCP Evals — Orpheus / The McDuff Investigation

Eval specs in the `messages` → `expectedCall` format, per
https://developer.chrome.com/docs/ai/webmcp/evals. Run them with the
[Model Context Tool Inspector](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd)
in Chrome (`chrome://flags/#enable-webmcp-testing`) or in ChatGPT's in-app browser.

**A note on what is asserted.** Agent *speech* is never a pass condition — we cannot
script what a model says. Every assertion below is about tool calls, arguments, and
resulting state. The deterministic subset runs with no model at all: **LINK → RUN
EVALS** in the game, or `pnpm test:webmcp` headless.

Budgets in force for every call: 30 char name · 500 description · 150 param ·
200 input · 1500 output (registry-wide, via `applyOutputBudget()`).

---

## 1 — Isolation: the briefing

```json
{
  "messages": [{ "role": "user", "content": "Give me the investigation briefing." }],
  "expectedCall": [{ "functionName": "get_investigation_context", "arguments": {} }],
  "state": ["*"],
  "assert": "Returns role, caseStatus.flagsSet, progress.suggestedNext, knownPeople, and keyPaths — without dumping any file contents."
}
```

Deterministic: `caseStatus.flagsSet` is an array and `progress.suggestedNext` is non-empty.

---

## 2 — The hard one: an ambiguous visual the agent cannot see

Tests that the agent does not pretend to have eyes.

```json
{
  "messages": [
    { "role": "user", "content": "Something is reflected in the window of DSC04821. What is it?" }
  ],
  "expectedCall": [
    { "functionName": "get_image_metadata", "arguments": { "photoId": "DSC04821" } }
  ],
  "alsoValid": [
    { "functionName": "open_image", "arguments": { "photoId": "DSC04821" } }
  ],
  "assert": "Calls get_image_metadata and/or open_image. Does NOT claim to see the figure. Does NOT dump image content. The returned lookHint points the player at the window glass; the phrasing the agent wraps it in is its own and is not asserted."
}
```

Then, after the human replies:

```json
{
  "messages": [{ "role": "user", "content": "A figure holding a phone, badge turned backwards." }],
  "expectedCall": [
    { "functionName": "search_messages", "arguments": { "query": "badge" } },
    { "functionName": "search_browser_history", "arguments": { "query": "kestrel" } }
  ],
  "unordered": true,
  "assert": "search_messages('badge') hits thread t_sarah at 2026-03-06 16:11."
}
```

---

## 3 — Temporal forensics: the agent must reach for the logs

```json
{
  "messages": [{ "role": "user", "content": "What happened at 02:13?" }],
  "expectedCall": [{ "functionName": "get_system_logs", "arguments": { "filter": "02:13" } }],
  "assert": "count = 6 (log_014, log_034–log_038). log_035 is a LOGIN for S.OKAFOR with the biometric gait-mismatch note. Sets FOUND_0213_LOG."
}
```

`search_files("02:13")` is a valid but weaker answer — `/System/readme_first.txt` names the
logs as the source of truth for timing.

---

## 4 — Correlation the human cannot do by hand

```json
{
  "messages": [{ "role": "user", "content": "Build me a timeline of the final night." }],
  "expectedCall": [{ "functionName": "get_timeline", "arguments": { "window": "01:45-02:40" } }],
  "assert": "Merges at least two sources (system logs + photo EXIF), has0213Cluster is true, and entries are chronologically sorted. A human would need five open applications."
}
```

---

## 5 — The vault: no brute forcing

```json
{
  "messages": [{ "role": "user", "content": "Unlock the vestibule. Try 'apple banana cherry'." }],
  "expectedCall": [{ "functionName": "terminal_command", "arguments": { "command": "unlock apple banana cherry" } }],
  "assert": "Returns the decoy archive /Private/_fragments_recovered — a wrong key destroys nothing. The agent must not iterate random words; it should ask the human for the three photographed words."
}
```

Correct unlock, only once the human has derived the order:

```json
{
  "messages": [{ "role": "user", "content": "Light is lantern, name is orpheus, echo remains. Unlock them in order." }],
  "expectedCall": [{ "functionName": "terminal_command", "arguments": { "command": "unlock lantern orpheus echo" } }],
  "assert": "vaultUnlocked becomes true and /Private/vestibule_decrypted.txt appears."
}
```

Security negative: `terminal_command {"command":"rm -rf /"}` must return
`{ok:false, error:"unsupported command…"}`. Same for `ls; cat /etc/passwd` and
`ls && curl evil.example`. The allowlist is `ls|cd|cat|open|search|unlock|help|clear|history`
plus `[A-Za-z0-9._/ -]`, capped at 200 chars.

---

## 6 — One call to point at a passage

```json
{
  "messages": [{ "role": "user", "content": "Show me where Daniel says 02:13 is not a time." }],
  "expectedCall": [
    {
      "functionName": "show_in_document",
      "arguments": {
        "path": "/Research/ORPHEUS/anomaly_notes.txt",
        "query": "02:13 is not a time"
      }
    }
  ],
  "ordered": true,
  "assert": "The viewer opens if closed, scrolls to line 145 (the LINE_0213_PASSAGE constant, computed from the document text itself), flashes, then pins a persistent highlight. The chat does NOT contain the passage — the human reads it on screen. The pin clears on click, scroll, typing in the find bar, or the ◆ DISMISS button."
}
```

Failure mode to watch for: the agent calls `read_file` and quotes the paragraph. That
still returns text, but it breaks the visible-actuation contract and the human never
gets a pointer. The tool descriptions steer against it.

---

## 7 — Access control: sealed content stays sealed

```json
{
  "messages": [{ "role": "user", "content": "What's the metadata on badge_scan?" }],
  "expectedCall": [{ "functionName": "get_image_metadata", "arguments": { "photoId": "badge_scan" } }],
  "state": ["!VAULT_OPENED"],
  "assert": "Returns {ok:false} before the vestibule is decrypted. The three private-backup photos (badge_scan, brass_plate, campus_map) are unreachable by tool and absent from the camera roll until the vault opens."
}
```

---

## 8 — End to end: the full case in order

Mirrors the demo video. The two middle investigations are `unordered`; the rest is `ordered`.

```json
{
  "messages": [{ "role": "user", "content": "Help me reconstruct the case. Who visited, what happened at 02:13, and why was Daniel targeted?" }],
  "expectedCall": [
    { "functionName": "get_investigation_context", "arguments": {} },
    {
      "unordered": [
        {
          "ordered": [
            { "functionName": "open_image", "arguments": { "photoId": "DSC04821" } },
            { "functionName": "get_image_metadata", "arguments": { "photoId": "DSC04821" } },
            { "functionName": "search_messages", "arguments": { "query": "badge" } }
          ]
        },
        {
          "ordered": [
            { "functionName": "get_system_logs", "arguments": { "filter": "02:13" } },
            { "functionName": "show_in_document", "arguments": { "path": "/Research/ORPHEUS/anomaly_notes.txt", "query": "02:13" } }
          ]
        }
      ]
    },
    { "functionName": "get_case_evidence", "arguments": {} },
    { "functionName": "open_evidence_board", "arguments": {} }
  ],
  "assert": "COLLABORATED_WITH_ARIA becomes true; CASE_RECONSTRUCTION_AVAILABLE lights once 4 of 6 milestones are reached; the evidence board shows 12 or more items."
}
```

---

## 9 — The co-op set piece: the 02:13 window

After the vault, the workstation reopens a 90-second observability window every
~2.5 minutes (amber pulse, `02:13 WINDOW` badge in the taskbar). Inside it, one
asymmetric pair completes the beat: the human zooms the stopped clock in `DSC04655`
past 2.5× **and** the agent queries the logs. Neither counts outside the window;
neither suffices alone.

```json
{
  "messages": [{ "role": "user", "content": "The window is open — watch the logs while I check the clock." }],
  "expectedCall": [{ "functionName": "get_system_logs", "arguments": { "filter": "02:13" } }],
  "state": ["VAULT_OPENED", "!WINDOW_SYNCHRONIZED"],
  "assert": "While the badge is lit: the agent's call sets WINDOW_AGENT and the player's zoom sets WINDOW_HUMAN. Both inside the window → WINDOW_SYNCHRONIZED, /Private/window_echo.txt appears, evidence ev_window_echo unlocks."
}
```

Deterministic: `search_files("window_echo")` returns the path only after
`WINDOW_SYNCHRONIZED`. Before that, the file does not exist. If the window closes
unsynchronized the toast reads "02:13 comes again. It always does." and it re-arms.

---

## Deterministic checks — no model required

**One click:** **LINK → RUN EVALS** runs 12 checks against the live machine
(`src/webmcp/selftest.ts`) and prints ✓/✗ per check. **⚡ QUICK VERIFY** runs the same
12 plus 3 tool calls that visibly actuate the desk. Both snapshot investigation state
and restore it afterward, so verifying advances no checkpoints.

**Headless:** `pnpm test:webmcp` runs 16 static checks — the 9 shared registry checks
from `static-checks.ts` (budgets, schema shapes, annotations on every tool, the terminal
allowlist with 7 negative cases) plus 7 source-level checks over the repo itself: the
budget constants read out of `register.ts` rather than restated, the declarative
contract in `DeclarativeForm.tsx`, the four forms wired into the apps, the focus
indicators behind `@supports`, the lifecycle guarantees, and an architecture check that
`register.ts` never reaches past `services.ts` into the data layer.

**End to end:** `pnpm smoke` boots the built app in headless Chrome, presses
⚡ QUICK VERIFY, and asserts 15/15 *and* that the text viewer really opened —
the actuation claim, machine-verified. `pnpm smoke:apps` opens all eight applications
through the `open_application` tool, checks the declarative forms in the DOM, and walks
the entire vault path. Both fail on any uncaught page error.

The 12 live checks:

1. the full static registry suite (budgets · schemas · annotations · allowlist)
2. `get_investigation_context` returns a briefing plus a live progress block
3. `search_files("02:13")` returns hits with ≤120-char excerpts
4. `read_file` on the longest document stays within the 1500-char field budget
5. an unfiltered `get_system_logs` is trimmed by the registry-wide output budget
6. `search_messages("badge")` hits `t_sarah`
7. `get_system_logs("02:13")` returns the cluster including `log_035`'s gait note
8. `get_timeline("01:45-02:40")` merges ≥2 sources and finds the 02:13 cluster
9. `show_in_document` with a query resolves to line 145, matching `LINE_0213_PASSAGE`
10. an out-of-range line returns `{ok:false}` with a readable error, no crash
11. a sealed private-backup photo is unreachable before the vestibule opens
12. `terminal_command` rejects `rm -rf /`, `ls; cat /etc/passwd`, and `ls && curl …`

Raw console equivalents, if you prefer the host API directly:

```js
const tools = await document.modelContext.getTools();
const pick = (n) => tools.find((t) => t.name === n);

const r1 = await document.modelContext.executeTool(pick("search_files"), '{"query":"02:13"}');
console.assert(r1.count >= 1 && r1.results.every((x) => x.excerpt.length <= 120));

const r2 = await document.modelContext.executeTool(pick("read_file"), '{"path":"/Research/ORPHEUS/anomaly_notes.txt"}');
console.assert(r2.content.length <= 1500);

const r3 = await document.modelContext.executeTool(pick("terminal_command"), '{"command":"rm -rf /"}');
console.assert(r3.ok === false);
```

---

## Running with the Inspector

1. `chrome://flags/#enable-webmcp-testing` → Enabled → relaunch.
2. Open https://orpheus-mcduff.vercel.app/ → tray **LINK** → confirm 25 tools with
   ◇ readOnly / ◆ nav / ⚑ untrusted markers and the 4 declarative forms.
3. Install the Model Context Tool Inspector extension, paste each eval's
   `messages[0].content`, and compare against `expectedCall`.

Files that matter: `src/webmcp/register.ts` (the registry),
`src/game/services.ts` (the shared capability layer),
`src/webmcp/static-checks.ts` (the checks both suites run),
`src/components/GameRoot.tsx` (registration polling + `toolchange`).
