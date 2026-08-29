#!/usr/bin/env node
/* ============================================================
   scripts/orpheus-opencode.mjs
   LOCAL TESTING ONLY — not for judges.

   Sets up the path to drive the live Orpheus site from OpenCode
   (or any MCP client) through the mcp-b native server + Chrome
   extension bridge. Does NOT touch the submission: this lives
   next to the CI test runner and runs ad-hoc.

   What it does:
     1. Verifies the live URL is reachable
     2. Prints the opencode.json MCP block to paste
     3. Opens the Chrome Web Store page for the MCP-B extension
        (one-time — tracked via a marker file)
     4. If DEV_EXTENSION_ID is set:
        a. Runs `register` to install the native-messaging manifest
        b. Runs `update-port 12306`
        c. Spawns the native server in the foreground (Ctrl-C to stop)
     4b. If DEV_EXTENSION_ID is NOT set:
        Tells you exactly how to get it (open chrome://extensions,
        enable Developer mode, copy the ID under MCP-B) and exits.

   Usage:
     pnpm opencode               # from the repo root
     node scripts/orpheus-opencode.mjs
     node scripts/orpheus-opencode.mjs --no-server  # print config only
     RESET=1 pnpm opencode       # force-reopen the extension store

   The judges will use ChatGPT Atlas / Chrome 149 flag — see
   JUDGE_QUICKSTART.md for the actual submission path. This is
   for your own local testing of WebMCP from an external agent.
   ============================================================ */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

const LIVE_URL = "https://orpheus-mcduff.vercel.app/";
const NATIVE_SERVER_PORT = 12306;
const EXTENSION_STORE_URL =
  "https://chromewebstore.google.com/search/mcp-b";
const REMINDER_PATH = join(homedir(), ".cache", "orheus-opencode-reminder.json");

const argv = process.argv.slice(2);
const NO_SERVER = argv.includes("--no-server");
const PRINT_ONLY = argv.includes("--print-only");

const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function header(s) {
  console.log("\n" + cyan("━".repeat(60)));
  console.log(cyan("  " + s));
  console.log(cyan("━".repeat(60)));
}

function info(s) {
  console.log("  " + s);
}

function step(n, s) {
  console.log("\n" + bold(green(`  [${n}]`) + "  " + bold(s)));
}

function warn(s) {
  console.log("  " + yellow("⚠  " + s));
}

/* ---------- 1. environment check ---------- */
header("Orpheus ↔ OpenCode — local WebMCP bridge setup");

const nodeMajor = Number(process.versions.node.split(".")[0]);
if (nodeMajor < 20) {
  warn(`Node ${process.versions.node} detected. Need >= 20 for mcp-remote.`);
  process.exit(1);
}
info(dim(`Node ${process.versions.node} · ${platform()}`));

/* ---------- 2. verify live URL is reachable ---------- */
step(1, "Reaching the live site…");
try {
  const r = await fetch(LIVE_URL, { method: "HEAD", redirect: "follow" });
  info(green(`✓ ${LIVE_URL} → ${r.status}`));
  if (r.status >= 400) {
    warn(`Site returned ${r.status}. The bridge will still start, but tool calls will fail until the URL is live.`);
  }
} catch (e) {
  warn(`Could not reach ${LIVE_URL}: ${e.message}`);
  warn("The bridge will still start. Continue if the URL is intentional / private.");
}

/* ---------- 3. print the opencode.json snippet ---------- */
step(2, "Paste this into your opencode.json (under the top-level `mcp` key)…");
console.log();
const snippet = `  "mcp": {
    "webmcp": {
      "type": "local",
      "command": ["npx", "-y", "mcp-remote", "http://127.0.0.1:${NATIVE_SERVER_PORT}/mcp"],
      "enabled": true
    }
  }`;
console.log(dim("  {"));
console.log(dim('    "$schema": "https://opencode.ai/config.json",'));
console.log(snippet.split("\n").map((l) => "  " + l).join("\n"));
console.log(dim("  }"));
console.log();
info(dim("OpenCode's MCP is stdio; the native host speaks Streamable HTTP."));
info(dim("`mcp-remote` is the bridge. After the first run it'll cache."));

/* ---------- 3. open the extension store page (idempotent) ---------- */
step(3, "MCP-B Chrome extension…");
const reminder = existsSync(REMINDER_PATH)
  ? (() => { try { return JSON.parse(readFileSync(REMINDER_PATH, "utf8")); } catch { return {}; } })()
  : {};
const alreadyOpened = !!reminder.openedAt;
const forceReopen = process.env.RESET === "1" || argv.includes("--reopen");

if (alreadyOpened && !forceReopen) {
  info(dim(`(extension store already opened ${reminder.openedAt} — set RESET=1 or pass --reopen to show again)`));
} else if (PRINT_ONLY) {
  info(dim(`(skipped — --print-only)  ${EXTENSION_STORE_URL}`));
} else {
  info("If you haven't already, install the MCP-B extension.");
  info("Search for " + bold("`WebMCP`") + " or " + bold("`@mcp-b`") + " in the Chrome Web Store — install the one by `mcp-b`.");
  info(dim("(Extension is published by anomalyco / mcp-b. README: https://github.com/miguelspizza/webmcp)"));
  try {
    const opener =
      platform() === "darwin" ? "open" :
      platform() === "win32" ? "start" :
      "xdg-open";
    spawnSync(opener, [EXTENSION_STORE_URL], { stdio: "ignore", shell: true });
    info(green("✓ Opened in your default browser."));
    try {
      writeFileSync(REMINDER_PATH, JSON.stringify({ openedAt: new Date().toISOString() }, null, 2));
    } catch {}
  } catch {
    info(dim(`Could not auto-open. Visit: ${EXTENSION_STORE_URL}`));
  }
}

/* ---------- 4. install + start the native server ---------- */
step(4, "Starting the MCP-B native server…");
if (NO_SERVER || PRINT_ONLY) {
  info(dim("(skipped — --no-server / --print-only)"));
  info(dim("When ready, run:  npx -y @mcp-b/native-server"));
  info(dim("(you'll also need DEV_EXTENSION_ID set — see the README for how to get it from chrome://extensions)"));
  console.log();
  info(green("Done. After the extension is installed and the site is open in Chrome, start an OpenCode session."));
  process.exit(0);
}

const isWin = process.platform === "win32";
const cmd = isWin ? "npx.cmd" : "npx";

/* The native server uses Chrome's Native Messaging protocol. To bootstrap:
     1. Install extension (done in step 3)
     2. Copy the extension's ID from chrome://extensions
     3. Set DEV_EXTENSION_ID=<id> in the env
     4. Run `register` to install the native-messaging manifest
     5. Run `update-port <port>` so the manifest points at the right port
     6. Start the server (which now has the env + config it needs)
   We do steps 4–6 here. Step 2 is a one-time user action.
*/
let extId = process.env.DEV_EXTENSION_ID?.trim();
if (!extId) {
  warn("DEV_EXTENSION_ID is not set.");
  warn("Get the extension ID from chrome://extensions (enable Developer mode, then copy the ID under MCP-B).");
  warn("Then re-run:  $env:DEV_EXTENSION_ID='<paste-id>'; pnpm opencode");
  console.log();
  // Open chrome://extensions to make it a one-click follow-up
  try {
    const opener = isWin ? "start" : platform() === "darwin" ? "open" : "xdg-open";
    spawnSync(opener, ["chrome://extensions"], { stdio: "ignore", shell: true });
  } catch {}
  process.exit(1);
}
info(dim(`DEV_EXTENSION_ID=${extId.slice(0, 12)}…`));

/* 4. register the native-messaging manifest (writes to OS-specific location) */
info(dim("Registering native-messaging host (one-time)…"));
const reg = spawnSync(cmd, ["-y", "@mcp-b/native-server", "register"], {
  stdio: "inherit",
  env: { ...process.env, DEV_EXTENSION_ID: extId },
  shell: isWin,
});
if (reg.status !== 0) {
  warn(`register exited with code ${reg.status}. Continuing — manifest may already be installed.`);
}

/* 5. point the manifest at our port */
info(dim(`Setting port to ${NATIVE_SERVER_PORT}…`));
const port = spawnSync(cmd, ["-y", "@mcp-b/native-server", "update-port", String(NATIVE_SERVER_PORT)], {
  stdio: "inherit",
  env: { ...process.env, DEV_EXTENSION_ID: extId },
  shell: isWin,
});
if (port.status !== 0) {
  warn(`update-port exited with code ${port.status}. Continuing anyway.`);
}

/* 6. finally start the actual server */
info(dim("Starting the MCP HTTP endpoint…"));
info(dim(`(will listen on http://127.0.0.1:${NATIVE_SERVER_PORT}/mcp — Ctrl-C to stop)`));
console.log();

const child = spawn(cmd, ["-y", "@mcp-b/native-server"], {
  stdio: "inherit",
  env: { ...process.env, DEV_EXTENSION_ID: extId },
  shell: isWin,
});

let shuttingDown = false;
const shutdown = (sig) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log();
  info(yellow(`Received ${sig}, stopping native server…`));
  try {
    if (isWin) {
      // npx is a .cmd shim — taskkill the whole tree so the child node dies too
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      child.kill("SIGTERM");
    }
  } catch {}
  setTimeout(() => process.exit(0), 250);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, sig) => {
  if (!shuttingDown) {
    info(dim(`native server exited (code=${code}, sig=${sig})`));
    process.exit(code ?? 0);
  }
});
