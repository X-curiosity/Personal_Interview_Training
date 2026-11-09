#!/usr/bin/env node
/* tools/verify_arcs.js — every build-arc step and every very hard code problem
   must behave as advertised: the starter compiles but fails, and the published
   reference passes the same tests. This keeps the "assemble a whole system"
   promise honest as the database changes.
   Run: node tools/verify_arcs.js
   Requires cc, iverilog/vvp and python3; a missing toolchain is reported as a
   skip rather than a silent pass. */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const TIMEOUT = 30000;

function loadProblems() {
  const context = vm.createContext({});
  let source = fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8");
  for (const file of fs.readdirSync(path.join(ROOT, "assets/js/data")).sort()) {
    if (file.endsWith(".js")) source += "\n" + fs.readFileSync(path.join(ROOT, "assets/js/data", file), "utf8");
  }
  source += "\n;globalThis.__P = PROBLEMS;";
  vm.runInContext(source, context);
  return context.__P;
}

function has(cmd, args) {
  const r = spawnSync(cmd, args || ["--version"], { encoding: "utf8" });
  return !r.error && r.status === 0;
}

const TOOLS = {
  c: has("cc", ["--version"]),
  python: has("python3", ["--version"]),
  verilog: has("iverilog", ["-V"]) && has("vvp", ["-V"])
};

function runOne(lang, code, tests) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pit-arc-"));
  try {
    if (lang === "python") {
      const file = path.join(dir, "m.py");
      fs.writeFileSync(file, code + "\n" + tests);
      const r = spawnSync("python3", [file], { encoding: "utf8", timeout: TIMEOUT });
      return { ok: r.status === 0 && /ALL TESTS PASSED/.test(r.stdout || ""), out: (r.stdout || "") + (r.stderr || "") };
    }
    if (lang === "c") {
      const file = path.join(dir, "m.c");
      fs.writeFileSync(file, code + "\n" + tests);
      const build = spawnSync("cc", ["-std=c11", "-O1", "-o", path.join(dir, "m"), file], { encoding: "utf8", timeout: TIMEOUT });
      if (build.status !== 0) return { ok: false, compile: true, out: build.stderr || "compile failed" };
      const r = spawnSync(path.join(dir, "m"), [], { encoding: "utf8", timeout: TIMEOUT });
      return { ok: r.status === 0 && /ALL TESTS PASSED/.test(r.stdout || ""), out: (r.stdout || "") + (r.stderr || "") };
    }
    if (lang === "verilog") {
      const file = path.join(dir, "m.sv");
      const exe = path.join(dir, "sim");
      fs.writeFileSync(file, code + "\n" + tests);
      const build = spawnSync("iverilog", ["-g2012", "-o", exe, file], { encoding: "utf8", timeout: TIMEOUT });
      if (build.status !== 0) return { ok: false, compile: true, out: build.stderr || "compile failed" };
      const r = spawnSync("vvp", [exe], { encoding: "utf8", timeout: TIMEOUT });
      return { ok: r.status === 0 && /ALL TESTS PASSED/.test(r.stdout || ""), out: (r.stdout || "") + (r.stderr || "") };
    }
    return { ok: false, out: "unknown language " + lang };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function main() {
  const problems = loadProblems();
  /* Arc steps carry their reference implementation in `solution`. Very hard
     problems ship a derivation instead, so they are checked structurally by
     tools/validate_data.js rather than compiled here. */
  const targets = problems.filter((p) => p.kind === "code" && p.arc);
  if (!targets.length) {
    console.error("no build-arc code problems found");
    process.exit(1);
  }

  const skipped = {};
  const failures = [];
  let checked = 0;

  for (const p of targets) {
    const lang = (p.languages || [])[0];
    if (!TOOLS[lang]) {
      skipped[lang] = (skipped[lang] || 0) + 1;
      continue;
    }
    const starter = p.starter[lang];
    const tests = p.tests[lang];
    const reference = p.solution;
    if (!starter || !tests || !reference) {
      failures.push(`${p.id}: missing starter, tests or reference`);
      continue;
    }

    const built = runOne(lang, starter, tests);
    if (built.compile) {
      failures.push(`${p.id}: starter does not compile\n${built.out.slice(0, 400)}`);
      continue;
    }
    if (built.ok) {
      failures.push(`${p.id}: starter already passes the tests`);
      continue;
    }

    const ref = runOne(lang, reference, tests);
    if (!ref.ok) {
      failures.push(`${p.id}: reference does not pass its own tests\n${ref.out.slice(0, 600)}`);
      continue;
    }
    checked += 1;
    console.log(`ok ${p.id} (${lang})`);
  }

  const skippedText = Object.keys(skipped).length
    ? " | skipped (toolchain missing): " + Object.entries(skipped).map(([k, n]) => `${k} ${n}`).join(", ")
    : "";

  if (failures.length) {
    console.error(`\n${failures.length} FAILURE(S):`);
    for (const f of failures) console.error(" - " + f);
    process.exit(1);
  }
  console.log(`arcs OK — ${checked} steps verified, starters fail and references pass${skippedText}`);
}

main();
