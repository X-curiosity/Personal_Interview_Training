#!/usr/bin/env node
/* tools/test_run_submit.js — verifies the editor separates practice runs from
   graded submissions: Run never awards credit, Submit does, forfeits block it.
   Run: node tools/test_run_submit.js */
"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png"
};

function startServer() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    const file = path.join(ROOT, url === "/" ? "index.html" : url.replace(/^\/+/, ""));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })));
}

async function waitFor(check, label, timeout = 15000) {
  const started = Date.now();
  for (;;) {
    if (check()) return;
    if (Date.now() - started > timeout) throw new Error("timed out waiting for " + label);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

async function openProblem(port, id) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/problem.html?id=${id}`, {
    resources: "usable", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("load timed out: " + id)), 15000);
    dom.window.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
  });
  await waitFor(() => dom.window.document.querySelector("[data-submit]"), id + " submit button");
  assert.deepStrictEqual(errors, [], id + " loaded without script errors");
  return dom;
}

const settle = (win) => waitFor(() => !win.document.querySelector("[data-run]").disabled,
  "editor to become idle");

const PASS = { ok: true, stdout: "ALL TESTS PASSED", stderr: "", code: 0 };
const FAIL = { ok: false, stdout: "A check failed.\n  AssertionError", stderr: "", code: 1 };

async function main() {
  const { server, port } = await startServer();
  try {
    /* ---------- Run is practice only ---------- */
    let dom = await openProblem(port, "py-901");
    let { window } = dom;
    let doc = window.document;
    window.PIT_RUNNER.run = () => Promise.resolve(PASS);

    doc.querySelector("[data-run]").click();
    await settle(window);
    assert.strictEqual(window.PIT_STORE.isSolved("py-901"), false, "Run must not award credit");
    let text = doc.querySelector("[data-output]").textContent;
    assert.match(text, /ALL TESTS PASSED/, "run shows the test output");
    assert.match(text, /Press Submit to earn credit/, "run points at Submit");
    assert.strictEqual(doc.querySelector("[data-status]").textContent, "Tests passed");
    assert(doc.querySelector("[data-output]").classList.contains("ok"), "passing run is green");

    /* ---------- Submit awards credit ---------- */
    doc.querySelector("[data-submit]").click();
    await settle(window);
    assert.strictEqual(window.PIT_STORE.isSolved("py-901"), true, "Submit awards the solve");
    text = doc.querySelector("[data-output]").textContent;
    assert.match(text, /Accepted! Credit earned: 1 point/, "difficulty-weighted points reported");
    assert.strictEqual(doc.querySelector("[data-status]").textContent, "Accepted");

    /* ---------- resubmitting does not double count ---------- */
    doc.querySelector("[data-submit]").click();
    await settle(window);
    assert.match(doc.querySelector("[data-output]").textContent, /already solved/,
      "a second submission is idempotent");
    assert.strictEqual(window.PIT_STORE.getSolved().size, 1, "still one solved problem");
    dom.window.close();

    /* ---------- failed submission earns nothing ---------- */
    dom = await openProblem(port, "py-902");
    window = dom.window;
    doc = window.document;
    window.PIT_RUNNER.run = () => Promise.resolve(FAIL);
    doc.querySelector("[data-submit]").click();
    await settle(window);
    assert.strictEqual(window.PIT_STORE.isSolved("py-902"), false, "failed submit earns no credit");
    assert.match(doc.querySelector("[data-output]").textContent, /No credit was earned/);
    assert.strictEqual(doc.querySelector("[data-status]").textContent, "Submission failed");
    assert(doc.querySelector("[data-output]").classList.contains("ko"), "failure is red");
    dom.window.close();

    /* ---------- a forfeited problem cannot earn credit ---------- */
    dom = await openProblem(port, "ml-901");
    window = dom.window;
    doc = window.document;
    window.PIT_STORE.addForfeit("ml-901");
    window.PIT_RUNNER.run = () => Promise.resolve(PASS);
    doc.querySelector("[data-submit]").click();
    await settle(window);
    assert.strictEqual(window.PIT_STORE.isSolved("ml-901"), false, "forfeit blocks the solve");
    assert.match(doc.querySelector("[data-output]").textContent, /credit was forfeited/i);
    dom.window.close();

    /* ---------- both buttons lock while the judge is working ---------- */
    dom = await openProblem(port, "py-903");
    window = dom.window;
    doc = window.document;
    let release;
    window.PIT_RUNNER.run = () => new Promise((resolve) => { release = () => resolve(PASS); });
    doc.querySelector("[data-run]").click();
    assert.strictEqual(doc.querySelector("[data-run]").disabled, true, "Run locks during judging");
    assert.strictEqual(doc.querySelector("[data-submit]").disabled, true, "Submit locks during judging");
    assert.strictEqual(doc.querySelector("[data-reset]").disabled, true, "Reset locks during judging");
    release();
    await settle(window);
    assert.strictEqual(doc.querySelector("[data-submit]").disabled, false, "buttons unlock after judging");
    dom.window.close();

    /* ---------- keyboard shortcuts ---------- */
    dom = await openProblem(port, "py-904");
    window = dom.window;
    doc = window.document;
    window.PIT_RUNNER.run = () => Promise.resolve(PASS);
    const editor = doc.querySelector("textarea[data-editor]");
    const press = (opts) => editor.dispatchEvent(new window.KeyboardEvent("keydown", Object.assign({
      key: "Enter", bubbles: true, cancelable: true
    }, opts)));

    press({ ctrlKey: true });
    await settle(window);
    assert.strictEqual(window.PIT_STORE.isSolved("py-904"), false, "Ctrl+Enter only runs");

    press({ ctrlKey: true, shiftKey: true });
    await settle(window);
    assert.strictEqual(window.PIT_STORE.isSolved("py-904"), true, "Ctrl+Shift+Enter submits");
    dom.window.close();

    console.log("run/submit OK — practice never pays, submissions do, forfeits and locks hold");
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
