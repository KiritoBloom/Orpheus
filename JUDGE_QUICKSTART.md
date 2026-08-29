# JUDGE QUICKSTART — verify Orpheus in 30 seconds, or 90 with an agent

**Live:** https://orpheus-mcduff.vercel.app/
**Repo:** MIT, `document.modelContext.registerTool` visible at the top of the README

> Orpheus is a game that proves a pattern: **human eyes plus machine recall at one desk, with the browser as arbiter.** You do not need an agent to verify it. The tool console *is* the agent interface, exposed to you.

---

## 0) No agent needed — 30 seconds

1. Open the live URL → wait for the iris → **NEW INVESTIGATION** → click to skip the boot → desktop.
2. Tray → **LINK** (or `Ctrl+``). This is the WebMCP tool console: all 25 imperative tools with live schemas, plus the 4 declarative forms listed. Headline tools arrive with example inputs prefilled, so the documented path runs with zero typing.
3. Press **⚡ QUICK VERIFY**.

That single click runs 12 deterministic checks plus 3 tool calls that visibly move the desk, and prints `✅ WEBMCP VERIFIED`. During the run the document viewer opens, scrolls, and pins a highlight — that is the agent moving your screen.

Want to drive it by hand instead? Every one of these is prefilled:

| Tool | Prefilled input | What you should see |
|---|---|---|
| `get_system_logs` | `{"filter":"02:13"}` | 6 entries including `log_035` — `S.OKAFOR` logging in at 02:13:07 with a *gait mismatch* note |
| `get_timeline` | `{"window":"01:45-02:40"}` | logs and photo EXIF merged into one chronology a human would need five apps to assemble |
| `show_in_document` | `{"path":"/Research/ORPHEUS/anomaly_notes.txt","query":"02:13 is not a time"}` | the document opens, scrolls to **line 145**, flashes, then pins a persistent highlight. Click, scroll, or press `◆ DISMISS` to clear it |
| `terminal_command` | `{"command":"rm -rf /"}` — type it | `{ok:false, error:"unsupported command…"}`. The allowlist, not a blocklist |

Filter the tool list by **◇ readOnly**, **◆ nav/write**, or **⚑ untrusted content** to see the annotation discipline directly.

**Headless, if you prefer a terminal:**

```bash
pnpm install
pnpm test:webmcp      # 16/16 — budgets, schemas, annotations, allowlist,
                      # declarative contract, lifecycle, architecture
pnpm build            # Next 16.3 + Turbopack, clean

pnpm start            # then, in a second shell:
pnpm smoke            # headless Chrome: boots the game, presses QUICK VERIFY,
                      # asserts 15/15 and that the text viewer really opened
pnpm smoke:apps       # 27/27 — all 8 apps opened via open_application, the three
                      # declarative forms verified in the DOM, full vault path
```

`pnpm smoke` is the one to run if you doubt the actuation claim: it is a machine confirming that the agent's tool call moved the screen, not prose asserting it.

---

## 1) With an agent — 60 seconds

Open the live URL in **ChatGPT's in-app browser** (native WebMCP), or in Chrome with `chrome://flags/#enable-webmcp-testing → Enabled` and a restart.

1. *"Give me the investigation briefing."* → `get_investigation_context`. The agent gets its role, live progress, and the three most useful next steps.
2. *"Something is reflected in the window of DSC04821. What is it?"* → `get_image_metadata` + `open_image`. Watch what it **does not** do: it does not claim to see the figure, and it does not dump the image into chat. It has no pixels. What it says is ChatGPT's own and is not a pass condition; the tool calls are.
3. Zoom the photo yourself past 2.5×, then tell it: *"A figure holding a phone, badge turned backwards."* → `search_messages {"query":"badge"}` hits Sarah's thread at 16:11 on 2026-03-06; `search_browser_history {"query":"kestrel"}` finds the visitor badge programme.
4. *"What happened at 02:13?"* → `get_system_logs {"filter":"02:13"}` → the six-entry cluster and the gait mismatch that first frames Sarah, then exonerates her.
5. *"Show me where Daniel says 02:13 is not a time."* → `show_in_document` → the document moves on **your** screen and pins line 145. The passage is not in the chat. You read it where he wrote it.

**The set piece.** After the vault opens (`terminal_command {"command":"unlock lantern orpheus echo"}`), the machine reopens a 90-second window every ~2.5 minutes — amber pulse, `02:13 WINDOW` badge in the taskbar. Inside it, zoom `DSC04655` past 2.5× **while** the agent calls `get_system_logs`. Neither action counts alone; neither counts outside the window. Sync both and `/Private/window_echo.txt` appears.

That is the loop: **you see → you describe → the agent searches and opens → you inspect → repeat.** The `COLLABORATED_WITH_ARIA` flag gates case reconstruction, so the case genuinely cannot be closed without it.

---

## 2) What to read in the code — 60 seconds

| File | What you are checking |
|---|---|
| `src/webmcp/register.ts` | 25 `TOOL_DEFS`, one registry. Budgets as exported constants, `annotations` on every tool, `applyOutputBudget()` wrapping every return, real `AbortController` unregistration, idempotent-per-context registration, `executeToolLikeHost()` |
| `src/game/services.ts` | The shared capability layer. Both the React apps and the tools call these functions — nothing is implemented twice |
| `src/components/DeclarativeForm.tsx` | The declarative contract: `toolautosubmit`, `agentInvoked`, `respondWith` after `preventDefault()` on every path, `toolName` read off the event |
| `src/webmcp/static-checks.ts` | The 9 shared registry checks — the same function runs in the browser panel and in `pnpm test:webmcp` |
| `src/webmcp/selftest.ts` | The 12 live evals behind RUN EVALS, snapshot-and-restore state safe |
| `src/components/GameRoot.tsx` | Registration polling and `toolchange` re-registration |

---

## 3) Beyond the case

The McDuff investigation is instance one. The pattern — 20–30 semantic tools over filesystem, messages, logs, and images, with visible actuation and asymmetric perception — transfers to any corpus where some evidence is visual and some is machine-readable:

- newsroom leak review, where a photograph matters and 50,000 documents also matter
- SOC or air-gapped host forensics on a night shift with nobody else awake
- research-integrity and e-discovery review
- classroom archive digs where students describe and the agent contextualises

Replace `src/game/data/*`, keep the `services.ts` + `register.ts` split, deploy one static site. No backend, no database, no environment variables, IndexedDB persistence.

---

## 4) Expected results checklist

- [ ] `LINK` lists 25 tools with ◇/◆/⚑ markers, live `title` / `description` / `inputSchema`, and the 4 declarative forms
- [ ] `⚡ QUICK VERIFY` prints `✅ WEBMCP VERIFIED` — 15/15 (12 evals + 3 actuations)
- [ ] `pnpm test:webmcp` passes 16/16 in a clean checkout
- [ ] `pnpm smoke` passes and `pnpm smoke:apps` passes 27/27 against a running build
- [ ] `get_system_logs {"filter":"02:13"}` returns 6 entries including `log_035` with the gait-mismatch note
- [ ] `show_in_document` visibly opens, scrolls, and pins line 145 — and the passage never appears in chat
- [ ] `terminal_command {"command":"rm -rf /"}` returns `{ok:false}`
- [ ] Evidence board `CASE RECONSTRUCTION` lights only after `COLLABORATED_WITH_ARIA` plus 4 of 6 milestones
- [ ] Sealed private-backup photos (`badge_scan`, `brass_plate`, `campus_map`) are unreachable by tool until the vestibule is decrypted
- [ ] After the vault: the `02:13 WINDOW` badge appears within ~2.5 min; human zoom + agent log query inside 90 s → `WINDOW_SYNCHRONIZED` and `/Private/window_echo.txt`

If you are short on time, the 30-second LINK path alone covers WebMCP Leverage and Execution.

More detail: `WEBMCP.md` (tool table + security audit) · `ARCHITECTURE.md` (stack) · `GAME_DESIGN.md` (puzzle design).
