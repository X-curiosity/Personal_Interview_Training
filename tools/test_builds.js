#!/usr/bin/env node
/* tools/test_builds.js — verifies the Build pages and the arc banner on a
   problem: every arc lists its steps in order, links resolve, and progress is
   reported honestly. Run: node tools/test_builds.js */
"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");
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
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function open(port, pathname) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}${pathname}`, {
    resources: "usable", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("load timed out: " + pathname)), 20000);
    dom.window.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
  });
  assert.deepStrictEqual(errors, [], pathname + " loaded without script errors");
  return dom;
}

function loadData() {
  const context = vm.createContext({});
  let source = fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8");
  for (const file of fs.readdirSync(path.join(ROOT, "assets/js/data")).sort()) {
    if (file.endsWith(".js")) source += "\n" + fs.readFileSync(path.join(ROOT, "assets/js/data", file), "utf8");
  }
  source += "\n;globalThis.__X = { ARCS, PROBLEMS, TRACKS };";
  vm.runInContext(source, context);
  return context.__X;
}

async function main() {
  const { ARCS, PROBLEMS } = loadData();
  const arcIds = Object.keys(ARCS);
  assert(arcIds.length >= 5, "at least five build arcs registered");

  const { server, port } = await startServer();
  try {
    const dom = await open(port, "/builds.html");
    const doc = dom.window.document;
    await waitFor(() => doc.querySelectorAll("[data-arc]").length === arcIds.length, "arc cards");

    /* every arc renders, with its declared number of steps in order */
    for (const id of arcIds) {
      const card = doc.querySelector(`[data-arc="${id}"]`);
      assert(card, `missing card for arc ${id}`);
      const steps = Array.from(card.querySelectorAll(".build-steps li"));
      assert.strictEqual(steps.length, ARCS[id].steps, `${id}: wrong number of steps rendered`);
      const numbers = steps.map((li) => li.querySelector(".step-num").textContent.trim());
      assert.deepStrictEqual(numbers, steps.map((_, i) => String(i + 1)), `${id}: steps out of order`);
      const hrefs = steps.map((li) => li.querySelector("a.step-title").getAttribute("href"));
      for (const href of hrefs) {
        const probId = decodeURIComponent(href.replace("problem.html?id=", ""));
        assert(PROBLEMS.some((p) => p.id === probId), `${id}: broken step link ${href}`);
      }
      assert(card.textContent.includes(ARCS[id].name), `${id}: name not shown`);
      assert(/You end up with/.test(card.textContent), `${id}: outcome missing`);
    }

    /* progress is honest: nothing solved in a fresh profile */
    assert(/0\/\d+ done/.test(doc.querySelector("[data-arc-progress]").textContent),
      "fresh profile should show zero progress");
    dom.window.close();

    /* arc banner on a step links the system and its neighbours */
    const first = PROBLEMS.filter((p) => p.arc && p.arc.id === arcIds[0])
      .sort((a, b) => a.arc.step - b.arc.step);
    const middle = first[Math.floor(first.length / 2)];
    const pdom = await open(port, "/problem.html?id=" + encodeURIComponent(middle.id));
    const pd = pdom.window.document;
    const banner = pd.querySelector(".arc-banner");
    assert(banner, "problem page must show the build banner");
    assert(banner.textContent.includes(ARCS[arcIds[0]].name), "banner names the system");
    assert(banner.textContent.includes("step " + middle.arc.step + " of " + middle.arc.total),
      "banner names the step");
    assert(banner.querySelector(`a[href="builds.html#${arcIds[0]}"]`), "banner links the arc");
    const navLinks = Array.from(banner.querySelectorAll(".arc-nav a")).map((a) => a.getAttribute("href"));
    assert.strictEqual(navLinks.length, 2, "middle step has prev and next");
    pdom.window.close();

    console.log(`builds OK — ${arcIds.length} arcs, ${PROBLEMS.filter((p) => p.arc).length} steps, banner verified`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
