#!/usr/bin/env node
/* tools/test_browse_filters.js — exercises the Problems page language and
   difficulty filters in a real DOM, served over HTTP like the browser sees it.
   Run: node tools/test_browse_filters.js */
"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");
const { VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");

/* ---------- expected counts straight from the packs ---------- */
function loadProblems() {
  /* data.js declares PROBLEMS and registerProblems inside the sandbox, so the
     packs must run in that same context and the registry read back from it. */
  const context = vm.createContext({});
  let source = fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8");
  for (const file of fs.readdirSync(path.join(ROOT, "assets/js/data")).sort()) {
    if (!file.endsWith(".js")) continue;
    source += "\n" + fs.readFileSync(path.join(ROOT, "assets/js/data", file), "utf8");
  }
  /* Lexical declarations are not context properties; export them explicitly. */
  source += "\n;globalThis.__PROBLEMS = PROBLEMS;";
  vm.runInContext(source, context);
  return context.__PROBLEMS;
}

const PROBLEMS = loadProblems();
const langKeys = (p) => (p.kind === "code" && p.languages.length ? p.languages : ["answer"]);
const countWhere = (fn) => PROBLEMS.filter(fn).length;

/* ---------- tiny static server ---------- */
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json"
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
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function waitFor(check, label, timeout = 15000) {
  const started = Date.now();
  for (;;) {
    if (check()) return;
    if (Date.now() - started > timeout) throw new Error("timed out waiting for " + label);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function openPage(port, pathname) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}${pathname}`, {
    resources: "usable",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("page load timed out: " + pathname)), 15000);
    dom.window.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
  });
  /* The table is rendered at the end of the page's DOMContentLoaded handler,
     after the filter listeners are registered, so a populated table means the
     page is ready to accept clicks. Poll instead of guessing a delay. */
  await waitFor(
    () => dom.window.document.querySelectorAll("tbody[data-problem-rows] tr").length > 0,
    pathname + " problem table"
  );
  assert.deepStrictEqual(errors, [], `${pathname} loaded without script errors`);
  return dom;
}

const rows = (doc) => Array.from(doc.querySelectorAll("tbody[data-problem-rows] tr"));
const rowLangs = (row) =>
  Array.from(row.querySelectorAll(".col-lang .badge.lang")).map((b) => b.textContent.trim());
const rowDiff = (row) => row.querySelector(".diff").textContent.trim().toLowerCase();
const chip = (doc, selector, value) =>
  doc.querySelector(`[data-${selector}="${value}"]`);
const click = (el) => el.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent("click", { bubbles: true }));

async function main() {
  const { server, port } = await startServer();
  try {
    const dom = await openPage(port, "/problems.html");
    const { document: doc, window } = dom.window;

    assert.strictEqual(rows(doc).length, PROBLEMS.length, "initial view lists every problem");
    assert.strictEqual(rows(doc).length, 520, "database cap is 520");
    assert.strictEqual(rows(doc).length, new Set(rows(doc).map((r) => r.dataset.id)).size,
      "row ids are unique");
    assert.strictEqual(doc.querySelector("[data-clear-filters]").hidden, true,
      "clear button starts hidden");
    assert.strictEqual(chip(doc, "lang-filter", "all").getAttribute("aria-pressed"), "true");

    /* ---- single language ---- */
    click(chip(doc, "lang-filter", "python"));
    let list = rows(doc);
    const expectedPython = countWhere((p) => langKeys(p).includes("python"));
    assert.strictEqual(list.length, expectedPython, "python filter count");
    assert(list.every((r) => rowLangs(r).includes("Python")), "every row offers Python");
    assert.strictEqual(chip(doc, "lang-filter", "python").getAttribute("aria-pressed"), "true");
    assert.strictEqual(chip(doc, "lang-filter", "all").getAttribute("aria-pressed"), "false");
    assert.strictEqual(doc.querySelector("[data-clear-filters]").hidden, false,
      "clear button appears once filtered");
    assert(window.location.search.includes("lang=python"), "URL records the language filter");

    /* ---- multi-select languages ---- */
    click(chip(doc, "lang-filter", "c"));
    list = rows(doc);
    const expectedC = countWhere((p) => langKeys(p).some((l) => l === "python" || l === "c"));
    assert.strictEqual(list.length, expectedC, "python + c union count");
    assert(list.every((r) => {
      const langs = rowLangs(r);
      return langs.includes("Python") || langs.includes("C");
    }), "rows match at least one selected language");
    assert(window.location.search.includes("lang=python%2Cc") ||
      window.location.search.includes("lang=python,c"), "URL records both languages");

    /* ---- toggling a chip off ---- */
    click(chip(doc, "lang-filter", "c"));
    assert.strictEqual(rows(doc).length, expectedPython, "deselect returns to Python only");

    /* ---- difficulty combined with language ---- */
    click(chip(doc, "diff-filter", "hard"));
    list = rows(doc);
    const expectedCombo = countWhere((p) => langKeys(p).includes("python") && p.difficulty === "hard");
    assert.strictEqual(list.length, expectedCombo, "python + hard intersection count");
    assert(list.every((r) => rowDiff(r) === "hard"), "all rows are hard");
    assert(list.every((r) => rowLangs(r).includes("Python")), "all rows offer Python");
    assert(window.location.search.includes("diff=hard"), "URL records difficulty");

    /* ---- answer-only filter ---- */
    click(chip(doc, "lang-filter", "python"));
    click(chip(doc, "lang-filter", "answer"));
    list = rows(doc);
    const expectedAnswer = countWhere((p) => p.kind !== "code" && p.difficulty === "hard");
    assert.strictEqual(list.length, expectedAnswer, "answer + hard count");
    assert(list.every((r) => rowLangs(r).join() === "Answer"), "answer rows carry the Answer badge");

    /* ---- clear filters restores everything ---- */
    click(doc.querySelector("[data-clear-filters]"));
    assert.strictEqual(rows(doc).length, PROBLEMS.length, "clear filters restores the full list");
    assert.strictEqual(window.location.search, "", "clear filters clears the query string");
    assert.strictEqual(doc.querySelector("[data-clear-filters]").hidden, true);
    dom.window.close();

    /* ---- deep link applies filters on load ---- */
    const linked = await openPage(port, "/problems.html?lang=verilog&diff=hard");
    const ldoc = linked.window.document;
    assert.strictEqual(chip(ldoc, "lang-filter", "verilog").getAttribute("aria-pressed"), "true");
    assert.strictEqual(chip(ldoc, "diff-filter", "hard").getAttribute("aria-pressed"), "true");
    const linkedRows = rows(ldoc);
    const expectedVerilog = countWhere((p) => langKeys(p).includes("verilog") && p.difficulty === "hard");
    assert.strictEqual(linkedRows.length, expectedVerilog, "deep-linked filter count");
    assert(linkedRows.length > 0, "deep link yields at least one problem");
    assert(linkedRows.every((r) => rowLangs(r).includes("Verilog")), "deep link rows are Verilog");

    /* ---- invalid query values are ignored ---- */
    const bad = await openPage(port, "/problems.html?lang=cobol&diff=impossible&q=");
    const bdoc = bad.window.document;
    assert.strictEqual(bdoc.querySelector("[data-lang-filter='all']").getAttribute("aria-pressed"), "true",
      "unknown language ignored");
    assert.strictEqual(bdoc.querySelector("[data-diff-filter='all']").getAttribute("aria-pressed"), "true",
      "unknown difficulty ignored");
    assert.strictEqual(rows(bdoc).length, PROBLEMS.length, "invalid filters keep the full list");

    /* ---- search accepts a language word ---- */
    const search = bdoc.querySelector("[data-search]");
    search.value = "verilog";
    search.dispatchEvent(new bad.window.Event("input", { bubbles: true }));
    /* search is debounced so typing stays responsive; wait for the rebuild */
    await waitFor(() => rows(bdoc).length < PROBLEMS.length, "debounced search");
    const found = rows(bdoc);
    assert(found.length > 0 && found.length < PROBLEMS.length, "search narrows the list");
    assert(found.every((r) => rowLangs(r).includes("Verilog") || r.textContent.toLowerCase().includes("verilog")),
      "search matches the language column");

    linked.window.close();
    bad.window.close();
    console.log("browse filters OK — language, multi-select, difficulty, clear, deep links, search");
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
