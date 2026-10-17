/* ==========================================================================
   main.js — shared behaviours on every page:
   random puzzle machine, footer year, "your stats" widgets.
   Requires data.js (PROBLEMS, TRACKS) and store.js (PIT_STORE).
   ========================================================================== */

(function () {
  "use strict";

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
        '<span class="badge track-' + p.track + '">' + t.name + "</span>" +
        '<span class="badge">' + p.branch + "</span>" +
        '<span class="diff diff-' + p.difficulty + '">' +
          p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1) + "</span>" +
      "</div>" +
      "<h3>" + p.title + "</h3>" +
      '<p class="summary">' + p.summary + "</p>" +
      '<a class="go" href="' + p.url + '" target="_blank" rel="noopener">' +
        "Train on " + t.platform + " →</a>";
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

  document.addEventListener("DOMContentLoaded", function () {
    initRandomMachines();
    initYourStats();
    initYear();
  });

  window.PIT = {
    pickRandom: pickRandom,
    renderProblem: renderProblem,
    trackMeta: trackMeta,
    refreshStats: initYourStats
  };
})();
