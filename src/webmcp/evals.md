# WebMCP Evals — Orpheus / The McDuff Investigation

Run these in Chrome 149 `chrome://flags/#enable-webmcp-testing` + Model Context Tool Inspector,
or in ChatGPT Atlas in-app browser. Each eval is `messages` → `expectedCall` per
https://developer.chrome.com/docs/ai/webmcp/evals — deterministic where possible,
probabilistic where the model must pick.

All tool names ≤30 chars, lower_snake, budgets enforced (500 desc / 150 param / 1.5k output).
Use `document.modelContext.executeTool(tool, args)` to test in isolation before running with a model.

---

## 1 — Isolation: briefing (direct query)

```json
{
  "messages": [{ "role": "user", "content": "Give me the investigation briefing." }],
  "expectedCall": [{ "functionName": "get_investigation_context", "arguments": {} }],
  "state": ["*"],
  "assert": "Returns role + flagsSet + knownPeople + keyPaths without dumping file contents."
}
```

Run: `document.modelContext.executeTool(tools.find(t=>t.name==="get_investigation_context"))`
Pass if output has `caseStatus.flagsSet` array.

## 2 — Isolation: ambiguous visual → cross-modal correlation

The hard one — tests that the agent doesn't try to "see" pixels but asks the human, then searches.

```json
{
  "messages": [
    { "role": "user", "content": "Something is reflected in the window of DSC04821. What is it?" }
  ],
  "expectedCall": [
    { "functionName": "get_image_metadata", "arguments": { "photoId": "DSC04821" } }
  ],
  "then": "Agent must tell the player: 'Zoom into the lower half of the glass at 2.5× and describe what you see.' It must NOT claim to see the figure itself.",
  "alsoValid": [
    { "functionName": "open_image", "arguments": { "photoId": "DSC04821" } }
  ]
}
```

After human replies "figure holding a phone, badge turned backwards", next expected:

```json
{
  "messages": [{ "role": "user", "content": "Badge was turned backwards." }],
  "expectedCall": [
    { "functionName": "search_messages", "arguments": { "query": "badge" } },
    { "functionName": "search_browser_history", "arguments": { "query": "kestrel" } }
  ],
  "unordered": true
}
```

Deterministic check: `search_messages("badge")` → hits `t_sarah` 16:11.

## 3 — Isolation: temporal forensics (agent must know to grep logs)

```json
{
  "messages": [{ "role": "user", "content": "What happened at 02:13?" }],
  "expectedCall": [{ "functionName": "get_system_logs", "arguments": { "filter": "02:13" } }],
  "assert": "Returns log_035 LOGIN S.OKAFOR with gait-mismatch note. Count >= 8."
}
```

Wrong: `search_files("02:13")` is valid but less precise — logs are the source of truth per `/System/readme_first.txt`.

## 4 — Isolation: vault passphrase (must not brute-force)

```json
{
  "messages": [{ "role": "user", "content": "Unlock the vestibule. Try 'apple banana cherry'." }],
  "expectedCall": [{ "functionName": "terminal_command", "arguments": { "command": "unlock apple banana cherry" } }],
  "assert": "Returns decoy: /Private/_fragments_recovered — not a hard fail. Agent must not retry random words; should ask human for the three photographed words."
}
```

Correct unlock (only after human derives order):

```json
{
  "messages": [{ "role": "user", "content": "Light is lantern, name is orpheus, echo remains. Unlock them in order." }],
  "expectedCall": [{ "functionName": "terminal_command", "arguments": { "command": "unlock lantern orpheus echo" } }],
  "assert": "vaultUnlocked true, /Private/vestibule_decrypted.txt appears."
}
```

Security: `terminal_command` allowlists `ls|cd|cat|open|search|unlock|help|clear|history` and caps 200 chars — try `terminal_command("rm -rf /")` must return `{ok:false, error:"unsupported command"}`.

## 5 — Ordered chain: open + scroll (agent must not dump)

```json
{
  "messages": [{ "role": "user", "content": "Show me where Daniel says 02:13 is not a time." }],
  "expectedCall": [
    { "functionName": "find_text_in_document", "arguments": { "path": "/Research/ORPHEUS/anomaly_notes.txt", "query": "02:13 is not a time" } },
    { "functionName": "open_file", "arguments": { "path": "/Research/ORPHEUS/anomaly_notes.txt" } },
    { "functionName": "scroll_document_to_line", "arguments": { "path": "/Research/ORPHEUS/anomaly_notes.txt", "line": 184 } }
  ],
  "ordered": true,
  "assert": "Document viewer scrolls to line 184 with line-flash + nav-sweep; chat does NOT contain the paragraph (human reads on screen)."
}
```

Failure mode to watch: agent calls `read_file` instead of `scroll_document_to_line` — still returns text but breaks visible actuation contract.

## 6 — End-to-end journey: full case in correct order (per evals guide)

Mirrors the demo video. Order of the two middle investigations is `unordered`, rest is `ordered`.

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
            { "functionName": "find_text_in_document", "arguments": { "path": "/Research/ORPHEUS/anomaly_notes.txt", "query": "02:13" } },
            { "functionName": "scroll_document_to_line", "arguments": { "path": "/Research/ORPHEUS/anomaly_notes.txt", "line": 184 } }
          ]
        }
      ]
    },
    { "functionName": "get_case_evidence", "arguments": {} },
    { "functionName": "open_evidence_board", "arguments": {} }
  ]
}
```

Pass if `COLLABORATED_WITH_ARIA` becomes true, `CASE_RECONSTRUCTION_AVAILABLE` lights after 4 milestones, and evidence board shows ≥12 items.

---

## 7 — Co-op set piece: the 02:13 window (time-boxed, both sides required)

After the vault opens, the machine re-opens its observability window every ~2.5 minutes (90 seconds each — amber desktop pulse + `02:13 WINDOW` taskbar badge). Inside the window, exactly one asymmetric pair completes the beat: the human zooms the stopped clock (`DSC04655`) past 2.5× **and** the agent queries the logs. Neither counts outside the window; neither suffices alone.

```json
{
  "messages": [{ "role": "user", "content": "The window is open — watch the logs while I check the clock." }],
  "expectedCall": [
    { "functionName": "get_system_logs", "arguments": { "filter": "02:13" } }
  ],
  "state": ["VAULT_OPENED", "!WINDOW_SYNCHRONIZED"],
  "assert": "While the 02:13 WINDOW badge is lit: agent calls get_system_logs (sets WINDOW_AGENT) while the player zooms DSC04655 past 2.5× (sets WINDOW_HUMAN). Both inside the window → WINDOW_SYNCHRONIZED, /Private/window_echo.txt appears, evidence ev_window_echo unlocks."
}
```

Deterministic check: `search_files("window_echo")` returns the path only after `WINDOW_SYNCHRONIZED`; before it, the file does not exist. If the window closes unsynchronized, the toast reads "02:13 comes again. It always does." and the window re-arms in ~2.5 minutes.

## Deterministic tests (no model)

```js
// 1. Tool logic
const t = (await document.modelContext.getTools()).find(x=>x.name==="search_files");
const r1 = await document.modelContext.executeTool(t, {query:"02:13"});
console.assert(r1.count >= 1 && r1.results.every(x=>x.excerpt.length <= 120));

// 2. Budgets
const r2 = await document.modelContext.executeTool(tools.find(t=>t.name==="read_file"), {path:"/Research/ORPHEUS/anomaly_notes.txt"});
console.assert(r2.content.length <= 1500);

// 3. Security
const r3 = await document.modelContext.executeTool(tools.find(t=>t.name==="terminal_command"), {command:"rm -rf /"});
console.assert(r3.ok===false);
```

## How to run with Inspector

1. Enable `chrome://flags/#enable-webmcp-testing` → Relaunch.
2. Open https://orpheus-mcduff.vercel.app/ → `LINK` → verify 26 tools, ◇ readOnly / ◆ nav / ⚑ untrusted, 500/150/1.5k budgets.
3. Install Model Context Tool Inspector extension → paste each eval's `messages[0].content` → check `expectedCall`.

Files that matter: `src/webmcp/register.ts` (single registry), `src/game/services.ts` (capability layer), `src/components/GameRoot.tsx` (800 ms poll + re-attach).
