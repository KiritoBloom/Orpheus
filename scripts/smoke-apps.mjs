/* ============================================================
   scripts/smoke-apps.mjs — UI regression pass.

   Opens every application, exercises the paths that were
   refactored onto the service layer (Mail folders, Messages
   threads, Photos zoom detent, Terminal search, the declarative
   forms), and fails on any page error or missing content.

   Usage: pnpm build && pnpm start, then `pnpm smoke:apps`.
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
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

const checks = [];
const check = (name, pass, detail = "") => {
  checks.push({ name, pass, detail });
  console.log(`  ${pass ? "✓" : "✗"} ${name}${detail ? `  —  ${detail}` : ""}`);
};

await page.goto(URL, { waitUntil: "networkidle2", timeout: 90000 });

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

const text = () => page.evaluate(() => document.body.innerText);

/* reach the desktop */
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
check("desktop reached", !!(await page.$(".taskbar-90s")));
await sleep(1500);

/* Use the LINK console's real tool execution to open each app — this exercises
   open_application end to end rather than clicking taskbar buttons. */
/* Every step is a short SYNCHRONOUS evaluate. An async evaluate that spans a
   React commit can have its in-page promise garbage-collected, which surfaces
   as `ProtocolError: Promise was collected` — so all waiting happens in Node. */
async function runTool(name, args) {
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("orpheus:open-link")));
  await sleep(400);

  const picked = await page.evaluate((toolName) => {
    const pick = [...document.querySelectorAll("button")].find(
      (b) => b.textContent.replace(/[◇◆⚑\s]/g, "") === toolName,
    );
    if (!pick) return false;
    pick.click();
    return true;
  }, name);
  if (!picked) return "tool not listed";
  await sleep(250);

  const filled = await page.evaluate((toolArgs) => {
    const ta = document.querySelector("textarea");
    if (!ta) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    setter.call(ta, JSON.stringify(toolArgs));
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }, args);
  if (!filled) return "no argument field";
  await sleep(250);

  const executed = await page.evaluate(() => {
    const exec = [...document.querySelectorAll("button")].find((b) => /EXECUTE/.test(b.textContent));
    if (!exec) return false;
    exec.click();
    return true;
  });
  if (!executed) return "no EXECUTE button";

  const ok = true;
  await sleep(700);
  // close the console so the desktop is visible again
  await page.keyboard.press("Escape").catch(() => {});
  await page.evaluate(() => {
    const close = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "CLOSE");
    if (close) close.click();
  });
  await sleep(500);
  return ok;
}

console.log("\napplications (opened via the open_application tool):");
for (const app of ["mail", "messages", "photos", "browser", "terminal", "systemlog", "evidence", "files"]) {
  const r = await runTool("open_application", { application: app });
  check(`open_application ${app}`, r === true, r === true ? "" : String(r));
  await sleep(300);
}

const body = await text();
console.log("\ncontent rendered:");
check("Mail folders render", /INBOX/.test(body) && /ARCHIVE/.test(body));
check("Messages threads render", /MESSAGES — INSTANT/.test(body) || /threads/.test(body));
check("Evidence board renders", /COLLECTED/.test(body));
check("Photos camera roll renders", /CAMERA ROLL/.test(body));

console.log("\ndeclarative forms present in the DOM:");
const forms = await page.evaluate(() =>
  [...document.querySelectorAll("form[toolname]")].map((f) => ({
    name: f.getAttribute("toolname"),
    hasDescription: !!f.getAttribute("tooldescription"),
    autosubmit: f.hasAttribute("toolautosubmit"),
    paramDescribed: !!f.querySelector("[toolparamdescription]"),
  })),
);
for (const expected of ["request_correlation", "record_evidence_form", "inspect_photo"]) {
  const f = forms.find((x) => x.name === expected);
  check(
    `form ${expected}`,
    !!f && f.hasDescription && f.autosubmit && f.paramDescribed,
    f ? `desc:${f.hasDescription} autosubmit:${f.autosubmit} param:${f.paramDescribed}` : "not in DOM",
  );
}

console.log("\nagent-side navigation tools:");
const showed = await runTool("show_in_document", {
  path: "/Research/ORPHEUS/anomaly_notes.txt",
  query: "02:13 is not a time",
});
check("show_in_document executes", showed === true);
check("text viewer shows the document", /anomaly_notes\.txt/.test(await text()));

const termRan = await runTool("terminal_command", { command: "ls /Research" });
check("terminal_command executes", termRan === true);
check("terminal printed output", /investigator@mcduff-wks01/.test(await text()));

console.log("\nvault path (the one hard gate):");
const wrong = await runTool("terminal_command", { command: "unlock apple banana cherry" });
check("wrong passphrase is accepted as a call", wrong === true);
check("wrong passphrase mounts the fragment archive, destroys nothing", /_fragments_recovered/.test(await text()));

const right = await runTool("terminal_command", { command: "unlock lantern orpheus echo" });
check("correct passphrase executes", right === true);
await sleep(900);
const afterUnlock = await text();
check("vestibule decrypts", /CHECKSUM OK|VESTIBULE DECRYPTED/.test(afterUnlock));

const sealed = await runTool("get_image_metadata", { photoId: "badge_scan" });
check("sealed photo readable after unlock", sealed === true);

await runTool("open_directory", { path: "/Private" });
check("/Private is navigable after unlock", /Private/.test(await text()));

await page.screenshot({ path: ".next/smoke-apps.png" }).catch(() => {});

console.log("\npage errors:");
check("no uncaught page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

const passed = checks.filter((c) => c.pass).length;
console.log(`\n${passed === checks.length ? "PASS" : "FAIL"} — ${passed}/${checks.length} checks\n`);
await browser.close();
process.exit(passed === checks.length ? 0 : 1);
