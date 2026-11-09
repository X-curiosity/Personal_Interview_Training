#!/usr/bin/env node
/* tools/test_perf_budget.js — guards the two things that made the problem list
   feel unresponsive: per-row localStorage parsing and a table rebuild on every
   keystroke. Also checks the screenshot shield no longer blurs the whole page.
   Run: node tools/test_perf_budget.js */
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

async function waitFor(check, label, timeout = 20000) {
  const started = Date.now();
  for (;;) {
    if (check()) return;
    if (Date.now() - started > timeout) throw new Error("timed out waiting for " + label);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

async function main() {
  const { server, port } = await startServer();
  try {
    const reads = { count: 0 };
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", (e) => errors.push(e.message));

    const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/problems.html`, {
      resources: "usable",
      runScripts: "dangerously",
      pretendToBeVisual: true,
      virtualConsole,
      beforeParse(window) {
        /* Count storage reads exactly as the browser would perform them. */
        const original = window.Storage.prototype.getItem;
        window.Storage.prototype.getItem = function () {
          reads.count += 1;
          return original.apply(this, arguments);
        };
      }
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("load timed out")), 20000);
      dom.window.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
    });
    const { window } = dom;
    const doc = window.document;
    await waitFor(() => doc.querySelectorAll("tbody[data-problem-rows] tr").length > 200,
      "problem rows");
    assert.deepStrictEqual(errors, [], "page loaded without script errors");
    assert.strictEqual(doc.querySelectorAll("tbody[data-problem-rows] tr").length, 532);

    /* ---------- no localStorage work per row ---------- */
    reads.count = 0;
    doc.querySelector('[data-lang-filter="python"]').click();
    await waitFor(() => doc.querySelectorAll("tbody tr").length === 32, "python filter");
    assert(reads.count < 40,
      `a full render must not read localStorage per row (read ${reads.count} times for 32 rows)`);

    reads.count = 0;
    doc.querySelector('[data-diff-filter="all"]').click();
    doc.querySelector('[data-lang-filter="all"]').click();
    await waitFor(() => doc.querySelectorAll("tbody tr").length === 532, "full list");
    assert(reads.count < 40,
      `the 532-row render must not read storage per row (read ${reads.count} times)`);

    /* ---------- typing stays responsive and coalesces renders ---------- */
    const tbody = doc.querySelector("tbody[data-problem-rows]");
    const search = doc.querySelector("[data-search]");
    let mutations = 0;
    const observer = new window.MutationObserver((records) => { mutations += records.length; });
    observer.observe(tbody, { childList: true });

    const started = Date.now();
    ["s", "si", "sig", "sigm", "sigmo", "sigmoid"].forEach((value) => {
      search.value = value;
      search.dispatchEvent(new window.Event("input", { bubbles: true }));
    });
    /* The keystrokes themselves must not rebuild the table synchronously. */
    assert.strictEqual(mutations, 0, "typing must not rebuild the table mid-keystroke");

    await waitFor(() => mutations > 0, "debounced render", 4000);
    const elapsed = Date.now() - started;
    await new Promise((resolve) => setTimeout(resolve, 250));

    assert.strictEqual(mutations, 1,
      `six keystrokes should coalesce into one table rebuild, saw ${mutations}`);
    assert.strictEqual(doc.querySelectorAll("tbody tr").length, 1, "search narrowed to the match");
    assert.strictEqual(doc.querySelector("tbody tr").dataset.id, "ml-901", "expected match");
    assert(elapsed < 2000, `debounced search render should be quick, took ${elapsed} ms`);
    console.log(`  search debounce: ${elapsed} ms for 6 keystrokes, 1 rebuild`);
    observer.disconnect();

    /* ---------- shield must not blur a huge layer ---------- */
    const css = fs.readFileSync(path.join(ROOT, "assets/css/style.css"), "utf8");
    assert(!/body\.shielded[^}]*filter:\s*blur/.test(css),
      "shield must not blur the whole page (expensive on long tables)");
    assert(/body\.shielded[^}]*visibility:\s*hidden/.test(css),
      "shield hides content with a cheap visibility rule");
    dom.window.close();

    console.log("performance budget OK — cached progress, debounced search, cheap shield");
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
