#!/usr/bin/env node
/* tools/test_vcd.js — verifies the waveform feature end to end:
   1. Icarus produces a real VCD from a testbench with a clock.
   2. wave.js parses it (signals, widths, timescale, clock toggles).
   3. It renders an SVG timing diagram with one row per signal.
   4. The Verilog problem page shows the diagram after a run that returns a dump.
   Run: node tools/test_vcd.js */
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".png": "image/png"
};

function hasIverilog() {
  const c = spawnSync("iverilog", ["-V"], { encoding: "utf8" });
  const v = spawnSync("vvp", ["-V"], { encoding: "utf8" });
  return !c.error && !v.error;
}

/* ---------- a real dump from a real simulator ---------- */
const TESTBENCH = `module tb;
  reg clk = 0;
  reg rst_n = 0;
  reg [3:0] count = 0;
  reg [7:0] data = 8'h00;
  always #5 clk = ~clk;
  initial begin
    $dumpfile("pit.vcd");
    $dumpvars(0);
    repeat(2) @(posedge clk);
    rst_n <= 1;
    repeat(6) begin
      @(posedge clk);
      count <= count + 1;
      data <= data + 8'h11;
    end
    #20 $finish;
  end
endmodule
`;

function makeVcd() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pit-vcd-"));
  try {
    const tb = path.join(dir, "tb.v");
    fs.writeFileSync(tb, TESTBENCH);
    const c = spawnSync("iverilog", ["-g2012", "-o", path.join(dir, "sim"), tb], { encoding: "utf8" });
    assert.strictEqual(c.status, 0, "testbench should compile: " + (c.stderr || ""));
    const r = spawnSync("vvp", [path.join(dir, "sim")], { cwd: dir, encoding: "utf8" });
    assert.ok(r.status === 0, "simulation should run: " + (r.stderr || ""));
    const vcd = fs.readFileSync(path.join(dir, "pit.vcd"), "utf8");
    assert(/enddefinitions/.test(vcd), "dump should contain definitions");
    return vcd;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/* ---------- wave.js in a DOM ---------- */
function loadWave() {
  const dom = new JSDOM("<!doctype html><html><body><div id='host'></div></body></html>", {
    pretendToBeVisual: true,
    runScripts: "outside-only"
  });
  const context = dom.window;
  vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/wave.js"), "utf8"), dom.getInternalVMContext());
  return { window: context, document: context.document };
}

/* ---------- static server for the page test ---------- */
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
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function main() {
  if (!hasIverilog()) {
    console.log("waveforms SKIPPED — iverilog/vvp not installed (install Icarus to run this test)");
    return;
  }
  const vcd = makeVcd();

  /* ---------- parsing ---------- */
  const { window } = loadWave();
  const WAVE = window.PIT_WAVE;
  assert(WAVE && typeof WAVE.parse === "function", "PIT_WAVE must be exported");

  const model = WAVE.parse(vcd);
  const names = model.signals.map((s) => s.name);
  assert(names.some((n) => /^clk$/.test(n)), "clock signal must be parsed, got " + names.join(","));
  assert(names.some((n) => /^count\[3:0\]$/.test(n)), "vector must keep its range");
  assert(model.signals.some((s) => s.width === 8), "8-bit bus must keep its width");
  assert(model.endTime > 0, "end time must be discovered");
  assert(model.transitions > 10, "transitions must be recorded");

  const clk = model.signals.find((s) => s.name === "clk");
  assert.strictEqual(clk.width, 1, "clock is one bit");
  assert(clk.isClock, "clock must be flagged for highlighting");
  assert(clk.changes.length >= 6, "clock must toggle");
  assert.strictEqual(Array.from(clk.changes.slice(0, 4)).map((c) => c.v).join(""), "0101",
    "clock must alternate 0/1");

  const bus = model.signals.find((s) => s.name === "count[3:0]");
  assert(bus.changes.length >= 3, "counter must change");
  assert(bus.changes.every((c) => /^[01xz]+$/i.test(c.v)), "vector values stay binary");

  /* an id of "$" is legal in VCD and must not be mistaken for a directive */
  const dollar = model.signals.find((s) => s.width === 8);
  assert(dollar.changes.length > 0, "signal with the id '$' must still be recorded");

  /* truncated / empty dumps must not throw */
  assert.doesNotThrow(() => WAVE.parse(vcd.slice(0, Math.floor(vcd.length / 2))));
  assert.strictEqual(WAVE.parse("").signals.length, 0);
  assert.strictEqual(WAVE.parse("$timescale 1ns $end\n$enddefinitions $end\n").signals.length, 0);

  /* ---------- rendering ---------- */
  const host = window.document.getElementById("host");
  WAVE.render(host, vcd);
  const panel = host.querySelector(".wave-panel");
  assert(panel, "panel must render");
  const svg = panel.querySelector("svg.wave-svg");
  assert(svg, "an SVG must be rendered");
  assert(svg.getAttribute("role") === "img", "the diagram needs a role");
  assert(/Timing diagram of/.test(svg.getAttribute("aria-label")), "aria label describes the diagram");
  const labels = Array.from(panel.querySelectorAll(".wave-label")).map((n) => n.textContent);
  assert(labels.includes("clk"), "clock row label");
  assert(labels.some((l) => /count/.test(l)), "counter row label");
  assert(panel.querySelector(".wave-label.wave-clock"), "clock row must be highlighted");
  assert(panel.querySelectorAll("polygon").length >= 1, "vectors must draw as boxes");
  assert(/signals/.test(panel.querySelector(".wave-meta").textContent), "meta summarises signals");

  /* zoom keeps working and stays inside the dump */
  const before = svg.innerHTML;
  panel.querySelector("[data-wave-zoom-in]").click();
  assert.notStrictEqual(svg.innerHTML, before, "zoom must redraw the diagram");
  panel.querySelector("[data-wave-fit]").click();
  assert(svg.innerHTML.length > 100, "fit must still render");

  /* wheel zoom must not throw */
  const wheel = new window.WheelEvent("wheel", { deltaY: -120, clientX: 300, bubbles: true, cancelable: true });
  svg.dispatchEvent(wheel);

  /* ---------- the problem page wires it to a Verilog run ---------- */
  const { server, port } = await startServer();
  try {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", (e) => errors.push(e.message));
    const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/problem.html?id=rtl-901`, {
      resources: "usable", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("problem page load timed out")), 20000);
      dom.window.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
    });
    await waitFor(() => dom.window.document.querySelector("[data-run]"), "editor buttons");
    assert.deepStrictEqual(errors, [], "problem page loads without script errors");

    const page = dom.window.document;
    assert(page.querySelector("[data-wave]"), "the editor reserves a waveform host");

    /* a run that returns a dump must draw the diagram, without awarding credit */
    dom.window.PIT_RUNNER.run = () => Promise.resolve({
      ok: true, stdout: "ALL TESTS PASSED", stderr: "", code: 0, vcd: vcd
    });
    page.querySelector("[data-run]").click();
    await waitFor(() => page.querySelector("[data-wave] .wave-panel"), "waveform panel");
    assert(page.querySelector("[data-wave] svg"), "waveform svg appears after a run");
    assert.strictEqual(dom.window.PIT_STORE.isSolved("rtl-901"), false, "a run must not award credit");
    const download = page.querySelector("[data-wave] a[download]");
    assert(download, "the dump can be downloaded");
    assert(download.getAttribute("href").indexOf("data:text/plain") === 0, "download is the raw dump");
    dom.window.close();

    /* a run without a dump must leave the host hidden */
    const dom2 = await JSDOM.fromURL(`http://127.0.0.1:${port}/problem.html?id=rtl-902`, {
      resources: "usable", runScripts: "dangerously", pretendToBeVisual: true
    });
    await new Promise((resolve) => dom2.window.addEventListener("load", resolve, { once: true }));
    await waitFor(() => dom2.window.document.querySelector("[data-run]"), "second editor");
    dom2.window.PIT_RUNNER.run = () => Promise.resolve({ ok: true, stdout: "ok", stderr: "", code: 0, vcd: null });
    dom2.window.document.querySelector("[data-run]").click();
    await waitFor(() => !dom2.window.document.querySelector("[data-run]").disabled, "run to finish");
    assert.strictEqual(dom2.window.document.querySelector("[data-wave]").hidden, true,
      "no dump means no waveform panel");
    dom2.window.close();
  } finally {
    server.close();
  }

  /* jsdom keeps a rendering loop alive with pretendToBeVisual, which would
     stop the process from ever exiting and hang the test pipeline. */
  window.close();
  console.log("waveforms OK — VCD parsed, clock highlighted, SVG drawn, page wired");
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
