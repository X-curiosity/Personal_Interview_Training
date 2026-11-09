/* ==========================================================================
   store.js — local progress (localStorage) + weighted scoring.
   Weights: easy = 1 pt, medium = 3 pts, hard = 5 pts.
   Everything is client-side; nothing leaves the browser.
   ========================================================================== */

(function () {
  "use strict";

  var SOLVED_KEY = "pit.solved.v1";
  var RIVALS_KEY = "pit.rivals.v1";
  var FORFEITS_KEY = "pit.forfeits.v1";

  var POINTS = { easy: 1, medium: 3, hard: 5 };

  /* ---------- solved set ---------- */

  /* localStorage is synchronous and JSON parsing 500+ ids on every row of a
     problem table makes the page janky, so each set is read once and cached.
     Every write refreshes the cache; another tab's write invalidates it. */
  var solvedCache = null;
  var forfeitCache = null;

  function readSet(key) {
    try {
      var raw = localStorage.getItem(key);
      var arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) {
      return new Set();
    }
  }

  function solvedRef() {
    if (!solvedCache) solvedCache = readSet(SOLVED_KEY);
    return solvedCache;
  }

  function forfeitRef() {
    if (!forfeitCache) forfeitCache = readSet(FORFEITS_KEY);
    return forfeitCache;
  }

  function getSolved() {
    return new Set(solvedRef());
  }

  function saveSolved(set) {
    solvedCache = new Set(set);
    try {
      localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(solvedCache)));
    } catch (e) { /* private mode etc. — progress just won't persist */ }
  }

  function isSolved(id) {
    return solvedRef().has(id);
  }

  /* Returns the new state (true = now solved). */
  function toggleSolved(id) {
    var set = getSolved();
    if (set.has(id)) set.delete(id); else set.add(id);
    saveSolved(set);
    return set.has(id);
  }

  /* ---------- forfeits (solution viewed: no credit, sticky) ---------- */

  function getForfeits() {
    return new Set(forfeitRef());
  }

  function isForfeited(id) {
    return forfeitRef().has(id);
  }

  /* Viewing the solution forfeits credit permanently. If the problem was
     already solved, it becomes unsolved (the stored rule). */
  function addForfeit(id) {
    var set = forfeitRef();
    if (set.has(id)) return;
    set.add(id);
    try {
      localStorage.setItem(FORFEITS_KEY, JSON.stringify(Array.from(set)));
    } catch (e) { /* ignore */ }
    if (isSolved(id)) toggleSolved(id); // auto un-solve
    if (window.PIT && window.PIT.refreshStats) window.PIT.refreshStats();
  }

  /* ---------- scoring ---------- */

  function statsFor(problems, solvedSet) {
    var stats = {
      solved: 0, total: problems.length,
      easy: 0, medium: 0, hard: 0,
      points: 0, maxPoints: 0
    };
    problems.forEach(function (p) {
      var pts = POINTS[p.difficulty] || 0;
      stats.maxPoints += pts;
      if (solvedSet.has(p.id)) {
        stats.solved += 1;
        stats[p.difficulty] += 1;
        stats.points += pts;
      }
    });
    return stats;
  }

  function pointsFor(counts) {
    return (counts.easy || 0) * POINTS.easy +
           (counts.medium || 0) * POINTS.medium +
           (counts.hard || 0) * POINTS.hard;
  }

  /* ---------- rivals (manual leaderboard entries) ---------- */

  function getRivals() {
    try {
      var raw = localStorage.getItem(RIVALS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveRivals(list) {
    try {
      localStorage.setItem(RIVALS_KEY, JSON.stringify(list));
    } catch (e) { /* ignore */ }
  }

  /* ---------- community votes (namespaced, local) ---------- */

  var VOTES_PREFIX = "pit.votes.v1.";

  /* Vote maps are read once per namespace: the problem table asks for a tally
     for every interview row, so parsing the same JSON per row was costly. */
  var voteCache = {};

  function voteRef(ns) {
    if (!voteCache[ns]) {
      try {
        var raw = localStorage.getItem(VOTES_PREFIX + ns);
        var obj = raw ? JSON.parse(raw) : {};
        voteCache[ns] = obj && typeof obj === "object" ? obj : {};
      } catch (e) {
        voteCache[ns] = {};
      }
    }
    return voteCache[ns];
  }

  function getVotes(ns) {
    var copy = {};
    Object.keys(voteRef(ns)).forEach(function (key) { copy[key] = voteRef(ns)[key]; });
    return copy;
  }

  /* choice: "up" | "down" | null (retract). */
  function setVote(ns, id, choice) {
    var map = voteRef(ns);
    if (choice === "up" || choice === "down") map[id] = choice;
    else delete map[id];
    try {
      localStorage.setItem(VOTES_PREFIX + ns, JSON.stringify(map));
    } catch (e) { /* ignore */ }
  }

  /* Displayed tally = seeded community counts + your local vote. */
  function tally(ns, id, seed) {
    var mine = voteRef(ns)[id] || null;
    var up = (seed && seed.up ? seed.up : 0) + (mine === "up" ? 1 : 0);
    var down = (seed && seed.down ? seed.down : 0) + (mine === "down" ? 1 : 0);
    var total = up + down;
    return {
      up: up, down: down, mine: mine, total: total,
      pct: total ? Math.round((100 * up) / total) : null
    };
  }

  try {
    window.addEventListener("storage", function (e) {
      if (e.key === SOLVED_KEY) solvedCache = null;
      if (e.key === FORFEITS_KEY) forfeitCache = null;
      if (e.key && e.key.indexOf(VOTES_PREFIX) === 0) delete voteCache[e.key.slice(VOTES_PREFIX.length)];
      if (e.key === SOLVED_KEY || e.key === FORFEITS_KEY) {
        if (window.PIT && window.PIT.refreshStats) window.PIT.refreshStats();
      }
    });
  } catch (e) { /* storage events unavailable */ }

  window.PIT_STORE = {
    POINTS: POINTS,
    getSolved: getSolved,
    isSolved: isSolved,
    toggleSolved: toggleSolved,
    getForfeits: getForfeits,
    isForfeited: isForfeited,
    addForfeit: addForfeit,
    statsFor: statsFor,
    pointsFor: pointsFor,
    getRivals: getRivals,
    saveRivals: saveRivals,
    getVotes: getVotes,
    setVote: setVote,
    tally: tally
  };
})();
