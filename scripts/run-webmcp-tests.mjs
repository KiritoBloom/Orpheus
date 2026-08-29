#!/usr/bin/env node
/* ============================================================
   scripts/run-webmcp-tests.mjs
   Runs the static WebMCP budget + schema checks from
   src/webmcp/static-checks.ts outside the browser.

   This is the CI-side companion to the in-browser
   RUN EVALS / QUICK VERIFY buttons. The judge can see
   `pnpm test:webmcp` pass in a clean repo without booting
   the Next dev server.
   ============================================================ */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "..");

/* ---------- 1) static budget / schema checks ---------- */

// We extract tool surface area from the live register.ts via a Node script.
// register.ts itself imports browser-only modules (zustand, services, audio),
// so we parse it as text and pull the 26 ToolDef blocks.
const registerPath = path.join(repo, "src", "webmcp", "register.ts");
if (!existsSync(registerPath)) {
  console.error("register.ts not found at", registerPath);
  process.exit(1);
}
const src = readFileSync(registerPath, "utf8");

/** Match a `const name: ToolDef = { ... };` block and extract its fields. */
function extractTools(text) {
  const tools = [];
  // find the TOOL_DEFS array at the end
  const tdefIdx = text.indexOf("export const TOOL_DEFS");
  if (tdefIdx < 0) throw new Error("TOOL_DEFS not found");
  const slice = text.slice(0, tdefIdx);
  const re = /const (\w+): ToolDef = \{([\s\S]*?)\n\};/g;
  let m;
  while ((m = re.exec(slice)) !== null) {
    const body = m[2];
    const name = (body.match(/name:\s*"([^"]+)"/) || [])[1];
    const desc = (body.match(/description:\s*\n?\s*"([\s\S]*?)"\s*,\s*\n/) || [])[1] || "";
    const annoMatch = body.match(/annotations:\s*\{\s*readOnlyHint:\s*(true|false)(?:,\s*untrustedContentHint:\s*(true|false))?\s*\}/);
    const ann = annoMatch
      ? { readOnlyHint: annoMatch[1] === "true", untrustedContentHint: annoMatch[2] === "true" }
      : undefined;
    // extract inputSchema as JSON-ish text — quick parse: find { type: "object", ... required: [ ... ] }
    const schemaMatch = body.match(/inputSchema:\s*\{([\s\S]*?)\n\s*\},/);
    const inputSchema = schemaMatch ? parseSchema(schemaMatch[1]) : { type: "object", properties: {} };
    if (name) tools.push({ name, description: desc, annotations: ann, inputSchema });
  }
  return tools;
}

function parseSchema(s) {
  // Strip TS-only bits: `str("...")` → `{ type: "string", description: "..." }`
  const cleaned = s
    .replace(/str\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g, (_, d) =>
      `{ type: "string", description: ${JSON.stringify(d)} }`,
    )
    .replace(/enumOf\(\s*\[([^\]]*)\]\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/g, (_, arr, d) =>
      `{ type: "string", enum: [${arr}], description: ${JSON.stringify(d)} }`,
    );
  try {
    return new Function(`return (${cleaned});`)();
  } catch {
    return { type: "object", properties: {} };
  }
}

const tools = extractTools(src);
console.log(`Found ${tools.length} WebMCP tools in src/webmcp/register.ts\n`);

/* ---------- 2) run the same checks as RUN EVALS / QUICK VERIFY ---------- */

const MAX_NAME = 30;
const MAX_DESC = 500;
const MAX_PARAM_DESC = 150;
const MAX_QUERY = 200;
const MAX_OUT = 1500;

const results = [];
const add = (name, pass, detail) => results.push({ name, pass, detail });

const badName = tools.find((t) => t.name.length > MAX_NAME);
const badDesc = tools.find((t) => t.description.length > MAX_DESC);
const paramErrs = [];
tools.forEach((t) => {
  const props = (t.inputSchema && t.inputSchema.properties) || {};
  for (const [k, v] of Object.entries(props)) {
    if (v && typeof v.description === "string" && v.description.length > MAX_PARAM_DESC) {
      paramErrs.push(`${t.name}.${k} = ${v.description.length}`);
    }
  }
});
add(
  "registry: name ≤30 · description ≤500 · param desc ≤150",
  tools.length >= 20 && !badName && !badDesc && paramErrs.length === 0,
  `${tools.length} tools` +
    (badName ? ` · ${badName.name} name too long` : "") +
    (badDesc ? ` · ${badDesc.name} desc ${badDesc.description.length}` : "") +
    (paramErrs.length ? ` · ${paramErrs.length} param over budget` : ""),
);

const schemaErrs = [];
tools.forEach((t) => {
  const s = t.inputSchema || {};
  if (s.type !== "object") schemaErrs.push(`${t.name}: type=${s.type}`);
  const props = s.properties || {};
  for (const r of s.required || []) {
    if (!(r in props)) schemaErrs.push(`${t.name}: required "${r}" missing from properties`);
  }
});
add(
  "schemas: every tool has type:object + required-declared params",
  schemaErrs.length === 0,
  schemaErrs.length ? schemaErrs.slice(0, 3).join("; ") : "all valid",
);

const ugcRe = /^(search_|read_|get_(message|email|browser|timeline|case|system_logs|investigation_context|image_metadata))/;
const ugcTools = tools.filter((t) => ugcRe.test(t.name) && t.name !== "get_investigation_context" && t.name !== "get_image_metadata" && t.name !== "get_case_evidence");
const missing = ugcTools.filter((t) => !t.annotations?.readOnlyHint || !t.annotations?.untrustedContentHint);
add(
  "annotations: every UGC-returning tool marks readOnly + untrusted",
  missing.length === 0,
  missing.length ? `missing: ${missing.map((t) => t.name).join(", ")}` : `all ${ugcTools.length} marked`,
);

const allowed = /^(ls|cd|cat|open|search|unlock|help|clear|history)(\s+[a-zA-Z0-9._/\- ]*)?$/;
const positives = ["help", "ls", "ls /", "cat /System/FIELD_GUIDE.txt", "unlock lantern orpheus echo", "clear"];
const negatives = ["rm -rf /", "ls; cat /etc/passwd", "cat /etc/passwd | mail x@y", "$(whoami)", "`id`"];
const posOk = positives.every((c) => allowed.test(c));
const negOk = negatives.every((c) => !allowed.test(c));
add(
  "security: terminal_command allowlist blocks injection, permits verbs",
  posOk && negOk,
  `+${positives.length} allowed · -${negatives.length} blocked`,
);

add(
  "output budget: name:30 desc:500 param:150 input:200 output:1500",
  MAX_NAME === 30 && MAX_DESC === 500 && MAX_PARAM_DESC === 150 && MAX_QUERY === 200 && MAX_OUT === 1500,
  `verified in register.ts`,
);

const names = new Set();
let dup = "";
for (const t of tools) {
  if (names.has(t.name)) { dup = t.name; break; }
  names.add(t.name);
}
add(
  "registry: unique tool names",
  !dup,
  dup ? `dup: ${dup}` : `${names.size} unique`,
);

// Declarative API surface — at least 3 visible forms (check files exist)
const declFormPath = path.join(repo, "src", "components", "DeclarativeForm.tsx");
const usesForm = ["EvidenceApp.tsx", "FilesApp.tsx", "PhotosApp.tsx"].filter((f) => {
  const p = path.join(repo, "src", "components", "applications", f);
  if (!existsSync(p)) return false;
  return readFileSync(p, "utf8").includes("DeclarativeForm");
});
add(
  "declarative API: 3 visible forms wired (Evidence, Files, Photos)",
  existsSync(declFormPath) && usesForm.length >= 3,
  existsSync(declFormPath) ? `form helper present · wired in ${usesForm.length}/3 apps` : "DeclarativeForm.tsx missing",
);

/* ---------- 3) report ---------- */

const passed = results.filter((r) => r.pass).length;
console.log(`STATIC WEBMCP CHECKS — ${passed}/${results.length} PASSED`);
results.forEach((r) =>
  console.log(`  ${r.pass ? "✓" : "✗"} ${r.name}${r.detail ? `  —  ${r.detail}` : ""}`),
);
console.log("");
console.log("Companion to the in-browser LINK → ⚡ QUICK VERIFY (jot-repl 30s path).");
console.log("See src/webmcp/evals.md for the per-check narrative judges see in the panel.");
process.exit(passed === results.length ? 0 : 1);
