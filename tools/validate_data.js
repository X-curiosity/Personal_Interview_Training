#!/usr/bin/env node
/* tools/validate_data.js — validates the whole problem database.
   Usage: node tools/validate_data.js
   Exits non-zero and prints every violation if anything is wrong. */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

// Load data.js + selected packs (PACKS env, comma-separated) or all packs.
let src = read("assets/js/data.js");
const packDir = path.join(ROOT, "assets/js/data");
const only = process.env.PACKS ? process.env.PACKS.split(",") : null;
const packs = fs.readdirSync(packDir).filter((f) =>
  f.endsWith(".js") && (!only || only.includes(f))).sort();
for (const p of packs) src += "\n" + read("assets/js/data/" + p);
src += "\n;globalThis.__R = { PROBLEMS, TRACKS, TRACK_ORDER, ROLES };";
eval(src);

const { PROBLEMS, TRACKS, TRACK_ORDER, ROLES } = globalThis.__R;
const errors = [];
const MAX_PROBLEMS = 502;
const DIFFS = ["easy", "medium", "hard"];
const LANGS = ["python", "c", "cpp", "verilog"];

const ids = new Set();
for (const p of PROBLEMS) {
  const at = `problem ${p.id}`;
  if (ids.has(p.id)) errors.push(`${at}: duplicate id`);
  ids.add(p.id);
  if (!TRACKS[p.track]) errors.push(`${at}: unknown track "${p.track}"`);
  else if (!TRACKS[p.track].branches.includes(p.branch))
    errors.push(`${at}: branch "${p.branch}" not in track ${p.track}`);
  if (!DIFFS.includes(p.difficulty)) errors.push(`${at}: bad difficulty "${p.difficulty}"`);
  if (!Array.isArray(p.tags) || p.tags.some((tag) => typeof tag !== "string"))
    errors.push(`${at}: tags must be an array of strings`);
  if (!p.statement || p.statement.length < 20) errors.push(`${at}: statement missing/too short`);
  if (p.kind === "code") {
    if (!p.languages.length) errors.push(`${at}: code kind but no languages`);
    for (const lang of p.languages) {
      if (!LANGS.includes(lang)) errors.push(`${at}: unknown language "${lang}"`);
      if (!p.starter[lang]) errors.push(`${at}: missing starter for ${lang}`);
    }
    // At least one runnable-in-browser language should carry tests
    const tested = ["python", "c", "cpp"].filter((l) => p.languages.includes(l) && p.tests[l]);
    if (!tested.length && !p.languages.includes("verilog"))
      errors.push(`${at}: code kind but no tests for python/c/cpp`);
  } else {
    if (p.answer === null && !p.solution)
      errors.push(`${at}: answer kind but neither answer nor solution`);
  }
  if (p.answer !== null && isNaN(Number(p.answer)) && p.answer.length > 120)
    errors.push(`${at}: non-numeric answer too long for the answer box`);
}

for (const key of TRACK_ORDER)
  if (!TRACKS[key]) errors.push(`TRACK_ORDER: "${key}" missing from TRACKS`);
for (const [rkey, role] of Object.entries(ROLES))
  for (const t of role.tracks)
    if (!TRACKS[t]) errors.push(`role ${rkey}: unknown track "${t}"`);

const counts = {};
for (const p of PROBLEMS) counts[p.track] = (counts[p.track] || 0) + 1;

/* Full-database runs enforce the product cap. Scoped PACKS runs are used to
   validate one pack in isolation and therefore skip the total-count check. */
if (!only && PROBLEMS.length !== MAX_PROBLEMS) {
  errors.push(`database must contain exactly ${MAX_PROBLEMS} problems; found ${PROBLEMS.length}`);
}

console.log("packs:", packs.join(", "));
console.log("total problems:", PROBLEMS.length);
console.log("per track:", JSON.stringify(counts));
if (errors.length) {
  console.error("\n" + errors.length + " VIOLATION(S):");
  errors.slice(0, 60).forEach((e) => console.error(" - " + e));
  if (errors.length > 60) console.error(` ... and ${errors.length - 60} more`);
  process.exit(1);
}
console.log("dataset OK");
