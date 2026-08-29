/* ============================================================
   scripts/smoke.mjs — end-to-end smoke test.

   Boots the built app in headless Chrome, walks title → desktop,
   opens the LINK console, presses ⚡ QUICK VERIFY, and asserts the
   panel reports every check passing. This is the browser-side
   companion to `pnpm test:webmcp`: that one checks the tool
   surface statically, this one proves the tools actually run
   against the live machine and actuate the UI.

   Usage:
     pnpm build && pnpm start        (in another shell)
     pnpm smoke                      (SMOKE_URL to override)

   Requires a local Chrome. Set CHROME_PATH if it is not in the
   default Windows location.
   ============================================================ */

import puppeteer from "puppeteer-core";

const CHROME =
  process.env.CHROME_PATH ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/usr/bin/google-chrome");
const URL = process.env.SMOKE_URL || "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--disable-features=Translate", "--mute-audio"],
  defaultViewport: { width: 1600, height: 900 },
});

const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") pageErrors.push(`console: ${m.text()}`);
});

const finish = async (ok, message) => {
  console.log(`\n${ok ? "PASS" : "FAIL"} — ${message}\n`);
  await browser.close();
  process.exit(ok ? 0 : 1);
};

await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });

/** Click the first visible element whose text contains `t`. */
const clickText = (t) =>
  page.evaluate((needle) => {
    const els = [...document.querySelectorAll("button, [role=button], .iris-item, span, div")];
    const el = els.reverse().find(
      (e) => e.textContent && e.textContent.toUpperCase().includes(needle) && e.offsetParent !== null,
    );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }, t);

/* ---------- 1) reach the desktop ---------- */

const deadline = Date.now() + 60_000;
while (Date.now() < deadline) {
  if (await page.$(".taskbar-90s")) break;
  await clickText("NEW INVESTIGATION");
  await sleep(800);
  if (await page.$(".taskbar-90s")) break;
  await page.mouse.click(30, 860).catch(() => {});
  await page.keyboard.press("Enter").catch(() => {});
  await clickText("BEGIN");
  await clickText("SKIP");
  await sleep(1000);
}
if (!(await page.$(".taskbar-90s"))) await finish(false, "never reached the desktop");
console.log("✓ desktop reached");

await sleep(1500);

/* ---------- 2) open the LINK console ---------- */

await page.evaluate(() => window.dispatchEvent(new CustomEvent("orpheus:open-link")));
await page.waitForFunction(
  () => document.body.innerText.includes("AGENT LINK"),
  { timeout: 15_000 },
).catch(() => {});
if (!(await page.evaluate(() => document.body.innerText.includes("AGENT LINK"))))
  await finish(false, "LINK console did not open");
console.log("✓ LINK console open");

/* ---------- 3) run QUICK VERIFY ---------- */

const pressed = await clickText("QUICK VERIFY");
if (!pressed) await finish(false, "QUICK VERIFY button not found");

await page
  .waitForFunction(() => /WEBMCP (VERIFIED|PARTIAL)/.test(document.body.innerText), { timeout: 30_000 })
  .catch(() => {});

const report = await page.evaluate(() => {
  const pre = [...document.querySelectorAll("pre")].map((p) => p.innerText).find((t) => /WEBMCP/.test(t));
  return pre ?? "";
});

if (!report) await finish(false, "QUICK VERIFY produced no report");

console.log("\n--- QUICK VERIFY ---\n" + report + "\n--------------------");

const tally = /(\d+)\/(\d+) checks passed/.exec(report);
const verified = report.includes("WEBMCP VERIFIED");
const failedLines = report.split("\n").filter((l) => l.trim().startsWith("✗"));

/* ---------- 4) the desk actually moved ---------- */

// The report renders from the resolved promise; the text viewer mounts on the
// next React commit, so wait for it rather than sampling the same tick.
const documentOpened = await page
  .waitForFunction(() => document.body.innerText.includes("anomaly_notes.txt"), { timeout: 10_000 })
  .then(() => true)
  .catch(() => false);

await page.screenshot({ path: ".next/smoke-quick-verify.png" }).catch(() => {});

const problems = [];
if (!verified) problems.push(`report is not VERIFIED${tally ? ` (${tally[1]}/${tally[2]})` : ""}`);
if (failedLines.length) problems.push(`failed checks: ${failedLines.join(" | ")}`);
if (!documentOpened) problems.push("show_in_document did not open the text viewer");
if (pageErrors.length) problems.push(`page errors: ${pageErrors.slice(0, 3).join(" | ")}`);

await finish(
  problems.length === 0,
  problems.length === 0
    ? `QUICK VERIFY ${tally ? `${tally[1]}/${tally[2]}` : ""} passed, the document viewer opened, no page errors`
    : problems.join("; "),
);
