/* ==========================================================================
   store.js — local progress (localStorage) + weighted scoring.
   Weights: easy = 1 pt, medium = 3 pts, hard = 5 pts.
   Everything is client-side; nothing leaves the browser.
   ========================================================================== */

(function () {
  "use strict";

  var SOLVED_KEY = "pit.solved.v1";
  var RIVALS_KEY = "pit.rivals.v1";

  var POINTS = { easy: 1, medium: 3, hard: 5 };

  /* ---------- solved set ---------- */

  function getSolved() {
    try {
      var raw = localStorage.getItem(SOLVED_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) {
      return new Set();
    }
  }

  function saveSolved(set) {
    try {
      localStorage.setItem(SOLVED_KEY, JSON.stringify(Array.from(set)));
    } catch (e) { /* private mode etc. — progress just won't persist */ }
  }

  function isSolved(id) {
    return getSolved().has(id);
  }

  /* Returns the new state (true = now solved). */
  function toggleSolved(id) {
    var set = getSolved();
    if (set.has(id)) set.delete(id); else set.add(id);
    saveSolved(set);
    return set.has(id);
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

  function getVotes(ns) {
    try {
      var raw = localStorage.getItem(VOTES_PREFIX + ns);
      var obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch (e) {
      return {};
    }
  }

  /* choice: "up" | "down" | null (retract). */
  function setVote(ns, id, choice) {
    var map = getVotes(ns);
    if (choice === "up" || choice === "down") map[id] = choice;
    else delete map[id];
    try {
      localStorage.setItem(VOTES_PREFIX + ns, JSON.stringify(map));
    } catch (e) { /* ignore */ }
  }

  /* Displayed tally = seeded community counts + your local vote. */
  function tally(ns, id, seed) {
    var mine = getVotes(ns)[id] || null;
    var up = (seed && seed.up ? seed.up : 0) + (mine === "up" ? 1 : 0);
    var down = (seed && seed.down ? seed.down : 0) + (mine === "down" ? 1 : 0);
    var total = up + down;
    return {
      up: up, down: down, mine: mine, total: total,
      pct: total ? Math.round((100 * up) / total) : null
    };
  }

  window.PIT_STORE = {
    POINTS: POINTS,
    getSolved: getSolved,
    isSolved: isSolved,
    toggleSolved: toggleSolved,
    statsFor: statsFor,
    pointsFor: pointsFor,
    getRivals: getRivals,
    saveRivals: saveRivals,
    getVotes: getVotes,
    setVote: setVote,
    tally: tally
  };
})();
