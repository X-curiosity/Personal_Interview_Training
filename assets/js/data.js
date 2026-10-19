/* ==========================================================================
   data.js — tracks, roles, and the problem registry (loader).
   Problems live in assets/js/data/pack_*.js files; each pack calls
   registerProblems([...]). This file must load FIRST, packs load after it.
   ========================================================================== */

const TRACKS = {
  "cpu": {
    name: "CPU Programming",
    short: "CPU",
    glyph: "⌘",
    platform: "LeetCPU-style",
    home: "https://www.leetcpu.com/",
    blurb: "Microarchitecture performance: branch prediction, caches, prefetching, ILP.",
    branches: ["Branch Prediction", "Cache Optimization", "Memory Hierarchy", "ILP & Pipelining", "Prefetching"]
  },
  "silicon": {
    name: "Silicon & RTL",
    short: "RTL",
    glyph: "⚡",
    platform: "LeetSilicon-style",
    home: "https://leetsilicon.com/problems",
    blurb: "Hardware interview prep: RTL design, verification, architecture.",
    branches: ["RTL Design", "Verification", "Computer Architecture", "CDC & Timing"]
  },
  "systems": {
    name: "Systems C/C++",
    short: "Systems",
    glyph: "⚙",
    platform: "PIT Judge",
    home: "problems.html#systems",
    blurb: "Low-level C and C++: bit manipulation, pointers, memory, data structures.",
    branches: ["Bit Manipulation", "Pointers & Memory", "Data Structures", "Concurrency & OS"]
  },
  "math": {
    name: "Mathematics",
    short: "Math",
    glyph: "∑",
    platform: "Project Euler-style",
    home: "https://projecteuler.net/archives",
    blurb: "Mathematical and computational puzzles, Euler-style.",
    branches: ["Number Theory", "Combinatorics & DP", "Sequences", "AI Traps", "Signal Processing"]
  },
  "quant": {
    name: "Probability & Quant",
    short: "Quant",
    glyph: "🎲",
    platform: "Quant Interviews",
    home: "https://janestreet.com/puzzles/archive/",
    blurb: "Probability, expected value and brainteasers, firm-interview style.",
    branches: ["Expected Value", "Dice & Coins", "Games & Strategy", "Markov & Stopping", "Brainteasers"]
  },
  "interview": {
    name: "Interview Questions",
    short: "Interview",
    glyph: "💼",
    platform: "Company Interviews",
    home: "https://leetsilicon.com/problems",
    blurb: "Frequently asked questions from real company interviews, community-voted.",
    branches: ["Hardware & RTL", "CPU & Architecture", "Quant & Trading"]
  }
};

const TRACK_ORDER = ["cpu", "silicon", "systems", "math", "quant", "interview"];

/* Mock-interview roles: which tracks feed them, how many questions, how long. */
const ROLES = {
  "ml-engineer": {
    name: "ML Engineer", icon: "🧠",
    tracks: ["systems", "math", "quant"],
    difficulties: ["medium", "hard"],
    count: 6, minutes: 45,
    blurb: "Numerical reasoning, production systems and the probability questions ML interviews love."
  },
  "cpu-architect": {
    name: "CPU Architecture Engineer", icon: "⌘",
    tracks: ["cpu", "systems", "math"],
    difficulties: ["medium", "hard"],
    count: 6, minutes: 60,
    blurb: "Caches, pipelines, branch prediction and the C/C++ to back it up."
  },
  "rtl-engineer": {
    name: "RTL / Silicon Engineer", icon: "⚡",
    tracks: ["silicon", "interview"],
    difficulties: ["medium", "hard"],
    count: 6, minutes: 60,
    blurb: "RTL design, verification, CDC and classic hardware interview questions."
  },
  "quant-researcher": {
    name: "Quant Researcher", icon: "🎲",
    tracks: ["quant", "math"],
    difficulties: ["medium", "hard"],
    count: 7, minutes: 40,
    blurb: "Expected value, games, optimal stopping and mental math under time pressure."
  }
};

/* --------------------------------------------------------------------------
   Problem registry. Normalizes every entry so the rest of the site can rely
   on a single shape regardless of which pack it came from.

   Full schema (packs may omit fields — defaults shown):
   {
     id: "euler-001",            // required, unique
     track: "math",              // required, key of TRACKS
     branch: "Number Theory",    // required, listed in TRACKS[track].branches
     title: "...",               // required
     difficulty: "medium",       // easy | medium | hard
     tags: [],                   // strings
     summary: "...",             // 1-line; derived from statement if missing
     statement: "...",           // full on-platform problem text
     kind: "answer",             // "answer" (box) | "code" (editor + run)
     languages: [],              // code kind: subset of python|c|cpp|verilog
     starter: {},                // code kind: { python: "def solve():\n    ..." }
     tests: {},                  // code kind: { python: "assert solve() == 42" }
     answer: null,               // answer kind: expected answer (string/number)
     tolerance: 0,               // answer kind: 0 exact; positive = relative tolerance
     solution: null,             // revealed on demand
     source: null,               // external attribution link (optional)
     votes: null                 // { up, down } seed for community voting
   }
   -------------------------------------------------------------------------- */

const PROBLEMS = [];

function registerProblems(arr) {
  if (!Array.isArray(arr)) throw new Error("registerProblems expects an array");
  arr.forEach(function (p) {
    if (!p || !p.id || !p.track || !p.title) {
      throw new Error("invalid problem entry: " + JSON.stringify(p && p.id));
    }
    PROBLEMS.push({
      id: String(p.id),
      track: p.track,
      branch: p.branch || (TRACKS[p.track] ? TRACKS[p.track].branches[0] : ""),
      title: p.title,
      difficulty: p.difficulty || "medium",
      tags: Array.isArray(p.tags)
        ? p.tags.map(String)
        : String(p.tags || "").split(/\s+/).filter(Boolean),
      summary: p.summary || String(p.statement || "").slice(0, 160),
      statement: p.statement || p.summary || "",
      kind: p.kind === "code" ? "code" : "answer",
      languages: p.languages || [],
      starter: p.starter || {},
      tests: p.tests || {},
      answer: p.answer != null ? String(p.answer) : null,
      tolerance: typeof p.tolerance === "number" ? p.tolerance : 0,
      solution: p.solution || null,
      source: p.source || p.url || null,
      votes: p.votes || null
    });
  });
}

function findProblem(id) {
  for (var i = 0; i < PROBLEMS.length; i++) {
    if (PROBLEMS[i].id === id) return PROBLEMS[i];
  }
  return null;
}

Object.freeze(TRACKS);
Object.freeze(TRACK_ORDER);
Object.freeze(ROLES);
Object.values(TRACKS).forEach(function (t) { Object.freeze(t.branches); Object.freeze(t); });
Object.values(ROLES).forEach(function (r) { Object.freeze(r.tracks); Object.freeze(r.difficulties); Object.freeze(r); });
