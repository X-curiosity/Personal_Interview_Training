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
    platform: "LeetCPU style",
    home: "https://www.leetcpu.com/",
    blurb: "Microarchitecture performance: branch prediction, caches, prefetching, ILP.",
    branches: ["Branch Prediction", "Cache Optimization", "Memory Hierarchy", "ILP & Pipelining", "Prefetching"]
  },
  "silicon": {
    name: "Silicon & RTL",
    short: "RTL",
    glyph: "⚡",
    platform: "LeetSilicon style",
    home: "https://leetsilicon.com/problems",
    blurb: "Hardware interview prep: RTL design, verification, architecture.",
    branches: ["RTL Design", "Verification", "Computer Architecture", "CDC & Timing", "Build: Vision Pipeline"]
  },
  "fpga": {
    name: "FPGA Implementation",
    short: "FPGA",
    glyph: "▦",
    platform: "Build: FPGA Bring-up",
    home: "builds.html#fpga-bringup",
    blurb: "Board-level Verilog that actually runs on a part: clocks, synchronizers, debouncing, serial framing.",
    branches: ["Build: FPGA Bring-up", "Clocking & Reset", "Interfaces"]
  },
  "systems": {
    name: "Systems C/C++",
    short: "Systems",
    glyph: "⚙",
    platform: "PIT Judge",
    home: "problems.html#systems",
    blurb: "Low-level C and C++: bit manipulation, pointers, memory, data structures.",
    branches: ["Bit Manipulation", "Pointers & Memory", "Data Structures", "Concurrency & OS", "Build: CPU Simulator"]
  },
  "math": {
    name: "Mathematics",
    short: "Math",
    glyph: "∑",
    platform: "Project Euler style",
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
  "ml": {
    name: "Machine Learning",
    short: "ML",
    glyph: "✦",
    platform: "Interview Red",
    home: "problems.html#ml",
    blurb: "Classic model math: optimization, preprocessing, metrics, classification, clustering.",
    branches: ["Regression & Optimization", "Preprocessing", "Evaluation", "Classification", "Clustering"]
  },
  "python": {
    name: "Python Algorithms",
    short: "Python",
    glyph: "◆",
    platform: "Interview Red",
    home: "problems.html#python",
    blurb: "Classic coding interview patterns with executable Python tests.",
    branches: ["Arrays & Hashing", "Sliding Window", "Stack", "Intervals", "Graph Traversal", "Build: Stack VM"]
  },
  "hpc": {
    name: "High Performance Computing",
    short: "HPC",
    glyph: "⬢",
    platform: "Build a kernel suite",
    home: "builds.html#hpc-kernels",
    blurb: "Blocking, tiling, halo exchange, scaling and roofline reasoning, written as one kernel suite.",
    branches: ["Build: HPC Kernels"]
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

const TRACK_ORDER = ["cpu", "silicon", "fpga", "systems", "ml", "python", "hpc", "math", "quant", "interview"];

/* Build arcs: ordered problem series that assemble into one working system.
   Each problem carries arc: { id, name, step, total }; this registry holds the
   presentation data so the Builds page can render before problems load. */
const ARCS = {
  "cpu-sim": {
    name: "Build a CPU simulator in C",
    language: "C",
    track: "systems",
    blurb: "An RV32I subset that actually runs programs: decode, ALU and registers, byte-addressed memory, the instruction step with branches and jumps, then a direct-mapped cache that turns instructions into cycles.",
    outcome: "A simulator that executes a small assembly program and reports its cycle count.",
    steps: 5
  },
  "vision-pipe": {
    name: "Build an edge detector in Verilog",
    language: "Verilog",
    track: "silicon",
    blurb: "A streaming image pipeline like the front end of an FPGA ISP: RGB to luma, a 3x3 line buffer, Sobel gradients, magnitude and threshold, then the integrated block with a real handshake and an end-to-end testbench.",
    outcome: "Hardware that turns a pixel stream into an edge map at one pixel per clock.",
    steps: 5
  },
  "fpga-bringup": {
    name: "Build an FPGA bring-up design",
    language: "Verilog",
    track: "fpga",
    blurb: "The ladder every board bring-up follows: make a heartbeat with a real clock, get async signals safely into your domain, clean up a bouncing button, speak UART out, receive and detect framing errors, then echo bytes back end to end.",
    outcome: "A synthesizable design that echoes serial input, verified stage by stage in simulation.",
    steps: 5
  },
  "stack-vm": {
    name: "Build a stack VM in Python",
    language: "Python",
    track: "python",
    blurb: "A complete little language: tokenizer, Pratt parser, bytecode compiler, the VM loop with jumps, then functions, recursion and the assembled run_source pipeline.",
    outcome: "A working interpreter that evaluates factorial and fibonacci from source.",
    steps: 5
  },
  "hpc-kernels": {
    name: "Build an HPC kernel suite",
    language: "Python",
    track: "hpc",
    blurb: "Performance thinking with deterministic, countable work: blocked matrix multiply, tiled transpose and memory traffic, halo exchange for a stencil, a parallel reduction with a scaling model, and a roofline report that classifies every kernel.",
    outcome: "A suite plus a performance model that says whether a kernel is compute or bandwidth bound.",
    steps: 5
  }
};

/* Mock-interview roles: which tracks feed them, how many questions, how long. */
const ROLES = {
  "ml-engineer": {
    name: "ML Engineer", icon: "🧠",
    tracks: ["ml", "python", "hpc", "systems", "math", "quant"],
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
      hints: Array.isArray(p.hints) ? p.hints.map(String) : [],  // free progressive hints
      arc: p.arc && p.arc.id
        ? {
            id: String(p.arc.id),
            name: String(p.arc.name || (ARCS[p.arc.id] && ARCS[p.arc.id].name) || p.arc.id),
            step: Number(p.arc.step) || 0,
            total: Number(p.arc.total) || 0
          }
        : null,
      image: p.image || null,             // optional { url, alt } illustration
      references: Array.isArray(p.references)   // optional [{ label, url }]
        ? p.references.map(function (r) {
            return { label: String(r.label || r.url), url: String(r.url) };
          })
        : [],
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
Object.freeze(ARCS);
Object.freeze(TRACK_ORDER);
Object.freeze(ROLES);
Object.values(TRACKS).forEach(function (t) { Object.freeze(t.branches); Object.freeze(t); });
Object.values(ROLES).forEach(function (r) { Object.freeze(r.tracks); Object.freeze(r.difficulties); Object.freeze(r); });
