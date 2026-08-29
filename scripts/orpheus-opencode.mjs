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
     4. Starts @mcp-b/native-server in the foreground
     5. Forwards Ctrl-C to the child for a clean shutdown

   Usage:
     pnpm opencode               # from the repo root
     node scripts/orpheus-opencode.mjs
     node scripts/orpheus-opencode.mjs --no-server  # print config only

   The judges will use ChatGPT Atlas / Chrome 149 flag — see
   JUDGE_QUICKSTART.md for the actual submission path. This is
   for your own local testing of WebMCP from an external agent.
   ============================================================ */

import { spawn, spawnSync } from "node:child_process";
import { platform } from "node:os";

const LIVE_URL = "https://orpheus-mcduff.vercel.app/";
const NATIVE_SERVER_PORT = 12306;
const EXTENSION_STORE_URL =
  "https://chromewebstore.google.com/search/mcp-b";

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

/* ---------- 4. open the extension store page ---------- */
step(3, "Installing the MCP-B Chrome extension…");
info("Opening the Chrome Web Store search for the MCP-B extension.");
info("Search for " + bold("`WebMCP`") + " or " + bold("`@mcp-b`") + " — install the one by `mcp-b`.");
info(dim("(The official extension is published by anomalyco / mcp-b; if you don't see it, the README at https://github.com/miguelspizza/webmcp has the latest link.)"));
if (!PRINT_ONLY) {
  try {
    const opener =
      platform() === "darwin" ? "open" :
      platform() === "win32" ? "start" :
      "xdg-open";
    spawnSync(opener, [EXTENSION_STORE_URL], { stdio: "ignore", shell: true });
    info(green("✓ Opened in your default browser."));
  } catch {
    info(dim(`Could not auto-open. Visit: ${EXTENSION_STORE_URL}`));
  }
} else {
  info(dim(`(skipped — --print-only)  ${EXTENSION_STORE_URL}`));
}

/* ---------- 5. install + start the native server ---------- */
step(4, "Starting the MCP-B native server…");
if (NO_SERVER || PRINT_ONLY) {
  info(dim("(skipped — --no-server / --print-only)"));
  info(dim("When ready, run:  npx -y @mcp-b/native-server"));
  console.log();
  info(green("Done. After the extension is installed and the site is open in Chrome, start an OpenCode session."));
  process.exit(0);
}

info(dim("Spawning: npx -y @mcp-b/native-server"));
info(dim(`(will listen on http://127.0.0.1:${NATIVE_SERVER_PORT}/mcp — Ctrl-C to stop)`));
console.log();

const child = spawn("npx", ["-y", "@mcp-b/native-server"], {
  stdio: "inherit",
  env: process.env,
});

let shuttingDown = false;
const shutdown = (sig) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log();
  info(yellow(`Received ${sig}, stopping native server…`));
  try {
    if (process.platform === "win32") {
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
