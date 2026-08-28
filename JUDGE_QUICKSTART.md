# JUDGE QUICKSTART — 90 seconds to verify the new era

**Live URL:** https://orpheus-mcduff.vercel.app/
**Repo:** see Devpost submission (public, MIT, `document.modelContext.registerTool` at top)

> Orpheus is a game that proves a pattern. The pattern is: **human eyes + agent recall, at one desk, with the browser as arbiter.** 90 seconds below is enough to feel it.

---

## 0) No agent? No problem — 30 second local proof

Orpheus is verifiable without any AI host. The `LINK` console *is* the agent interface, exposed to you.

1. Open live URL → wait for iris → **NEW INVESTIGATION** → skip boot (click) → desktop
2. Tray → **LINK** (or `Ctrl+``) — judge console for all 26 tools; headline tools come with ready-made example inputs prefilled
3. Pick `get_system_logs` — input prefilled `{"filter":"02:13"}` → **EXECUTE** → see `log_035 LOGIN user S.OKAFOR ... gait mismatch` returned (1.5k cap, `untrustedContentHint`)
4. Pick `get_timeline` — prefilled window `01:45-02:40` → **EXECUTE** → see merged `01:45–02:40` chronology (logs + photos + messages) that would take a human 5 apps
5. Pick `open_file` — prefilled with `/Research/ORPHEUS/anomaly_notes.txt` → **EXECUTE** → watch document open on YOUR screen
6. Pick `scroll_document_to_line` — prefilled `{"path":"...anomaly_notes.txt","line":184}` → **EXECUTE** → watch line 184 scroll into view with `line-flash` + `nav-sweep` — the visible actuation proof
7. Or press **RUN EVALS** — 9 deterministic checks (budgets, security, search, briefing) pass/fail in one click, per `src/webmcp/evals.md` — state-safe: investigation state is snapshotted and restored, no checkpoints advanced

You just verified: read-only search at scale + visible navigation that moves the human's screen + budgets + security — all without a host.

## 1) With an agent (Atlas or Chrome 149 flag) — the full loop, 60 seconds

1. Open live URL in **ChatGPT Atlas in-app browser** (native WebMCP) or Chrome Canary `chrome://flags/#enable-webmcp-testing → Enabled` + restart
2. In ChatGPT, say: *“Give me the investigation briefing.”* → agent must call `get_investigation_context`
3. Then say: *“Something is reflected in the window of DSC04821. What is it?”* → agent must call `get_image_metadata` + `open_image`. What the agent *says* is ChatGPT's own — it cannot be scripted and is not a pass condition. What matters: it does NOT claim to see pixels and does not dump the photo into chat. The zoom guidance comes from the game itself (viewer shows "SCROLL TO ZOOM · inspect closely; ARIA cannot see this").
4. Reply: *“A figure holding a phone, badge turned backwards.”* → agent must call `search_messages({"query":"badge"})` (hits `t_sarah` 16:11) + `search_browser_history({"query":"kestrel"})`
5. Say: *“What happened at 02:13?”* → agent must call `get_system_logs({"filter":"02:13"})` → count = 6, includes `log_035` gait-mismatch reveal
6. Say: *“Show me where Daniel says 02:13 is not a time.”* → agent must call `find_text_in_document` → `open_file` → `scroll_document_to_line({"line":184})` → document scrolls *on your screen*, not dumped in chat

**Bonus set piece — the 02:13 Window (the Keep-Talking moment):** after the vault, the machine opens a 90-second observability window every ~2.5 min (amber pulse + `02:13 WINDOW` taskbar badge). Inside it, zoom `DSC04655` past 2.5× **while** the agent calls `get_system_logs` — synchronized, `/Private/window_echo.txt` appears. Neither side counts alone; the clock is real.

This is the new era loop: `human sees → describes → agent searches & opens → human inspects → repeat`. Neither side can do it alone. `COLLABORATED_WITH_ARIA` flag and Evidence Board progress prove the collaboration was required.

## 2) What to open in code (60 seconds)

- `src/webmcp/register.ts` — 26 `TOOL_DEFS`, single registry, budgets `MAX_QUERY_LEN=200` / `MAX_OUTPUT_CHARS=1500`, `readOnlyHint` + `untrustedContentHint` per secure-tools guide, `AbortSignal`, `toolchange` lifecycle
- `src/game/services.ts` —single source-of-truth capability layer both UI and tools call (remove WebMCP and agent loses every capability)
- `src/components/GameRoot.tsx` — hydration + `registerWebMCPTools()` poll 800ms + 1.2s re-attach for Atlas + declarative `<form toolname="record_evidence">` (Declarative API)
- `src/webmcp/evals.md` — 7 evals per https://developer.chrome.com/docs/ai/webmcp/evals

## 3) Why this is the new era (not just a game)

The McDuff case is Instance 1. The pattern — 20–30 semantic tools exposing filesystem + messages + logs + images with visible actuation and asymmetric perception — is reusable for:

- Newsroom leak review (50k docs, some visual)
- SOC / air-gapped log host forensics
- Research-integrity or e-discovery review
- Classroom archival investigation

Self-hosted, no backend, no env keys, `idb-keyval` persistence, headers `Origin-Agent-Cluster: ?1` + `Permissions-Policy: tools=self`. Fork it, replace `src/game/data/` with your corpus, and your team has an accompanied desk in an afternoon.

## 4) Expected results checklist

- [ ] `LINK` lists 26 tools with ◇ readOnly / ◆ nav / ⚑ untrusted, `title`/`description`/`inputSchema` visible, budgets enforced
- [ ] `get_system_logs filter 02:13` returns `log_035` with `gait mismatch` note
- [ ] `scroll_document_to_line` visibly moves document, does NOT dump paragraph in chat
- [ ] Evidence Board `CASE RECONSTRUCTION` lights only after collaboration (≥4 milestones + `COLLABORATED_WITH_ARIA`)
- [ ] `terminal_command "rm -rf /"` returns `{ok:false, error:"unsupported command"}` (allowlist check)
- [ ] Live URL is `https://orpheus-mcduff.vercel.app/` on Vercel + HSTS, 7117 bytes static shell, headers verified in `next.config.ts`
- [ ] (Set piece) After `terminal_command "unlock lantern orpheus echo"`: within ~2.5 min the `02:13 WINDOW` badge appears; zoom `DSC04655` ≥2.5× + `get_system_logs` inside 90 s → `WINDOW_SYNCHRONIZED`, `/Private/window_echo.txt` + evidence `ev_window_echo`

Video (public YouTube, <3 min, audio) covers this loop. If you are short on time, the `LINK` 30-sec path is sufficient for a Pass on WebMCP Leverage + Execution.

Questions? See `WEBMCP.md` for full tool table + security audit, `ARCHITECTURE.md` for stack, `GAME_DESIGN.md` for puzzle design.
