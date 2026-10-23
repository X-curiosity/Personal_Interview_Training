#!/usr/bin/env node
/* Runtime smoke tests for the static site (uses jsdom installed in the repo's
   parent workspace). Run: node tools/test_runtime.js */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
/* Support both modern jsdom (JSDOM) and the older jsdom.jsdom API installed
   in this workspace. */
const window = jsdom.JSDOM
  ? new jsdom.JSDOM("<!doctype html><html><head></head><body></body></html>", {
      url: "http://localhost:8931/problem.html?id=cpu-110",
      runScripts: "outside-only"
    }).window
  : jsdom.jsdom("<!doctype html><html><head></head><body></body></html>", {
      url: "http://localhost:8931/problem.html?id=cpu-110"
    }).defaultView;

if (window.NodeList && !window.NodeList.prototype.forEach) {
  window.NodeList.prototype.forEach = Array.prototype.forEach;
}

if (!window.localStorage) {
  const memory = new Map();
  Object.defineProperty(window, "localStorage", { value: {
    getItem: k => memory.has(k) ? memory.get(k) : null,
    setItem: (k, v) => memory.set(k, String(v)),
    removeItem: k => memory.delete(k),
    clear: () => memory.clear()
  }});
}

function load(rel) { window.eval(read(rel)); }

load("assets/js/config.js");
/* Older jsdom does not preserve top-level lexical bindings across eval calls.
   Concatenate classic data scripts exactly as the browser sees them, then
   export the lexical constants for the test harness. */
let dataSource = read("assets/js/data.js");
for (const file of fs.readdirSync(path.join(ROOT, "assets/js/data")).filter(f => f.endsWith(".js")).sort()) {
  dataSource += "\n" + read("assets/js/data/" + file);
}
dataSource += "\n" + read("assets/js/store.js");
dataSource += "\n" + read("assets/js/problem.js");
dataSource += "\nwindow.__TEST_EXPORTS = { PROBLEMS, TRACKS, ROLES };";
window.eval(dataSource);
window.PIT_RUNNER = { run: () => Promise.resolve({ ok: true, stdout: "ALL TESTS PASSED", stderr: "", code: 0 }) };

const { PROBLEMS, TRACKS, ROLES } = window.__TEST_EXPORTS;
const { PIT_STORE, PIT_PROBLEM } = window;
assert.strictEqual(PROBLEMS.length, 532, `database cap requires exactly 532 problems; got ${PROBLEMS.length}`);
for (const key of ["ml", "python"]) {
  assert(TRACKS[key], `${key} track missing`);
  const problems = PROBLEMS.filter(p => p.track === key);
  assert.strictEqual(problems.length, 6, `${key} must contain exactly six new problems`);
  assert(problems.every(p => p.kind === "code" && p.languages.includes("python") && p.tests.python && p.statement.length > 200),
    `${key} problems must have detailed statements and runnable Python tests`);
}
assert.strictEqual(new Set(PROBLEMS.map(p => p.id)).size, PROBLEMS.length, "problem ids must be unique");
assert(!TRACKS.gpu, "GPU track must remain removed");
assert(PROBLEMS.every(p => !p.languages.includes("cuda")), "CUDA tasks must remain removed");
assert(!/gpu|cuda|nvidia/i.test(JSON.stringify(PROBLEMS)), "GPU/CUDA content must remain removed");

// Exact integer answers: no relative tolerance for count answers.
const exact = PROBLEMS.find(p => p.id === "cpu-110");
assert(exact && exact.answer === "3000000", "cpu-110 fixture missing");
assert.strictEqual(PIT_PROBLEM.checkAnswer(exact, "3000000"), true);
assert.strictEqual(PIT_PROBLEM.checkAnswer(exact, "2970000"), false);

// Decimal answers respect pack-supplied relative tolerance.
const decimal = PROBLEMS.find(p => p.id === "cpu-103");
assert(decimal && decimal.answer === "1.45", "cpu-103 fixture missing");
assert.strictEqual(PIT_PROBLEM.checkAnswer(decimal, "1.44"), true);
assert.strictEqual(PIT_PROBLEM.checkAnswer(decimal, "1.40"), false);

// Render both interaction types.
let host = window.document.createElement("div");
PIT_PROBLEM.render(host, exact, {});
assert(host.querySelector(".answer-box input"), "answer problem should render an input");
assert(host.querySelector("[data-check]"), "answer problem should render Check");

const codeProblem = PROBLEMS.find(p => p.kind === "code");
assert(codeProblem, "at least one code problem must exist");
assert(PROBLEMS.some(p => p.languages.includes("python") && p.tests.python),
  "at least one tested Python problem must exercise the Pyodide adapter");
host = window.document.createElement("div");
PIT_PROBLEM.render(host, codeProblem, {});
assert(host.querySelector("textarea[data-editor]"), "code problem should render editor");
assert(host.querySelector("[data-run]"), "code problem should render Run tests");
assert(host.querySelector("textarea").value.length > 10, "starter code should populate editor");
for (const id of ["ml-901", "py-901"]) {
  const p = PROBLEMS.find(entry => entry.id === id);
  assert(p, `${id} missing`);
  host = window.document.createElement("div");
  PIT_PROBLEM.render(host, p, {});
  assert(host.querySelector("textarea[data-editor]"), `${id} must have an editor`);
  assert(host.querySelector("[data-run]"), `${id} must have Run tests`);
  assert(host.querySelector("[data-hint]"), `${id} must offer hints`);
}
const formatted = Object.assign({}, PROBLEMS.find(p => p.id === "py-901"), {
  statement: '<img src=x onerror=alert(1)>\n\nConstraints:\n- `example` is safe'
});
host = window.document.createElement("div");
PIT_PROBLEM.render(host, formatted, {});
assert(!host.querySelector(".statement img"), "statement HTML must stay escaped");
assert.strictEqual(host.querySelector(".statement li code").textContent, "example", "inline code/list formatting failed");

// Every role has enough medium/hard questions for a full session.
for (const [key, role] of Object.entries(ROLES)) {
  const pool = PROBLEMS.filter(p => role.tracks.includes(p.track) && role.difficulties.includes(p.difficulty));
  assert(pool.length >= role.count, `${key} has only ${pool.length}/${role.count} questions`);
}

// The server scoring registry must stay in exact sync with client packs.
const { DIFF: SERVER_DIFFICULTIES, pointsFor } = require(path.join(ROOT, "api/_points.js"));
assert.strictEqual(Object.keys(SERVER_DIFFICULTIES).length, PROBLEMS.length, "server difficulty registry is stale");
for (const p of PROBLEMS) {
  assert.strictEqual(SERVER_DIFFICULTIES[p.id], p.difficulty, `${p.id}: server scoring difficulty mismatch`);
}
assert.strictEqual(pointsFor(["ml-901", "py-901"]).points, 4, "new track points must be counted");

// Scoring contract.
window.localStorage.clear();
PIT_STORE.toggleSolved("cpu-101"); // easy = 1 point
PIT_STORE.toggleSolved("cpu-103"); // medium = 3 points
const stats = PIT_STORE.statsFor(PROBLEMS, PIT_STORE.getSolved());
assert.strictEqual(stats.solved, 2);
assert.strictEqual(stats.points, 4);

// Every local script referenced by an HTML page exists.
for (const html of fs.readdirSync(ROOT).filter(f => f.endsWith(".html"))) {
  const body = read(html);
  assert(body.includes("Interview Red</title>") || body.includes("Interview Red ·"), `${html}: old page title`);
  assert(body.includes('href="assets/img/logo.svg"'), `${html}: logo missing`);
  if (body.includes('src="assets/js/data.js"')) {
    for (const pack of ["pack_ml.js", "pack_python.js"]) {
      assert(body.includes(`src="assets/js/data/${pack}"`), `${html}: ${pack} missing`);
    }
  }
  for (const match of body.matchAll(/<script\s+src="([^"]+)"/g)) {
    const src = match[1];
    if (/^https?:/.test(src)) continue;
    assert(fs.existsSync(path.join(ROOT, src)), `${html} references missing ${src}`);
  }
}

// Track/branch registry sanity.
for (const p of PROBLEMS) {
  assert(Array.isArray(p.tags), `${p.id}: tags must be an array`);
  assert(TRACKS[p.track], `${p.id}: missing track`);
  assert(TRACKS[p.track].branches.includes(p.branch), `${p.id}: invalid branch ${p.branch}`);
}

console.log(`runtime OK — ${PROBLEMS.length} problems, ${PROBLEMS.filter(p => p.kind === "code").length} code tasks, ${Object.keys(ROLES).length} role pools`);
