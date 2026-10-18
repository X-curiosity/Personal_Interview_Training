/* ==========================================================================
   main.js — shared behaviours on every page:
   random puzzle machine, footer year, "your stats" widgets.
   Requires data.js (PROBLEMS, TRACKS) and store.js (PIT_STORE).
   ========================================================================== */

(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pickRandom(pool, avoidId) {
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    var pick;
    do {
      pick = pool[Math.floor(Math.random() * pool.length)];
    } while (pick.id === avoidId);
    return pick;
  }

  function trackMeta(key) {
    return TRACKS[key] || { name: key, short: key, home: "#", platform: "the source platform" };
  }

  /* Render a problem card inside a random-machine result panel. */
  function renderProblem(container, p) {
    var t = trackMeta(p.track);
    container.innerHTML =
      '<div class="meta">' +
        '<span class="badge track-' + esc(p.track) + '">' + esc(t.name) + "</span>" +
        '<span class="badge">' + esc(p.branch) + "</span>" +
        '<span class="diff diff-' + esc(p.difficulty) + '">' +
          esc(p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)) + "</span>" +
      "</div>" +
      "<h3>" + esc(p.title) + "</h3>" +
      '<p class="summary">' + esc(p.summary) + "</p>" +
      '<a class="go" href="problem.html?id=' + encodeURIComponent(p.id) + '">' +
        "Solve it here →</a>";
  }

  function initRandomMachines() {
    document.querySelectorAll("[data-random-machine]").forEach(function (machine) {
      var button = machine.querySelector("[data-roll]");
      var result = machine.querySelector("[data-result]");
      if (!button || !result || typeof PROBLEMS === "undefined") return;

      var pool = PROBLEMS;
      var trackFilter = machine.getAttribute("data-track");
      if (trackFilter) {
        pool = PROBLEMS.filter(function (p) { return p.track === trackFilter; });
      }

      var lastId = null;
      button.addEventListener("click", function () {
        var p = pickRandom(pool, lastId);
        if (!p) return;
        lastId = p.id;
        result.classList.add("dealing");
        window.setTimeout(function () {
          renderProblem(result, p);
          result.classList.remove("dealing");
        }, 160);
      });
    });
  }

  /* Fill [data-your-stats] widgets: solved count, points, per-difficulty. */
  function initYourStats() {
    var widgets = document.querySelectorAll("[data-your-stats]");
    if (!widgets.length || typeof PROBLEMS === "undefined") return;
    var stats = PIT_STORE.statsFor(PROBLEMS, PIT_STORE.getSolved());
    widgets.forEach(function (w) {
      w.querySelectorAll("[data-stat]").forEach(function (el) {
        var key = el.getAttribute("data-stat");
        if (key === "pct") {
          el.textContent = stats.total
            ? Math.round((stats.solved / stats.total) * 100) + "%"
            : "0%";
        } else if (key in stats) {
          el.textContent = stats[key];
        }
      });
    });
  }

  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* Dynamic per-track problem counts: [data-track-count="cpu"] etc. */
  function initTrackCounts() {
    if (typeof PROBLEMS === "undefined") return;
    document.querySelectorAll("[data-track-count]").forEach(function (el) {
      var track = el.getAttribute("data-track-count");
      var n = PROBLEMS.filter(function (p) { return p.track === track; }).length;
      el.textContent = n + (el.getAttribute("data-suffix") || " problems");
    });
    document.querySelectorAll("[data-total-count]").forEach(function (el) {
      el.textContent = String(PROBLEMS.length);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRandomMachines();
    initYourStats();
    initTrackCounts();
    initYear();
  });

  window.PIT = {
    pickRandom: pickRandom,
    renderProblem: renderProblem,
    trackMeta: trackMeta,
    refreshStats: initYourStats
  };
})();
