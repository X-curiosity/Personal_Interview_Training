/* ==========================================================================
   builds.js — renders the Build pages: ordered problem arcs that assemble
   into one working system (CPU simulator, edge detector, stack VM, HPC suite).
   Requires data.js (ARCS, PROBLEMS) and store.js (PIT_STORE).
   ========================================================================== */

(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var DIFF_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Very hard" };

  function stepsFor(arcId) {
    return PROBLEMS.filter(function (p) { return p.arc && p.arc.id === arcId; })
      .sort(function (a, b) { return a.arc.step - b.arc.step; });
  }

  function progressFor(steps) {
    var solved = steps.filter(function (p) { return PIT_STORE.isSolved(p.id); }).length;
    var forfeited = steps.filter(function (p) { return PIT_STORE.isForfeited(p.id); }).length;
    return { solved: solved, forfeited: forfeited, total: steps.length };
  }

  function buildCard(arcId, arc) {
    var steps = stepsFor(arcId);
    var prog = progressFor(steps);
    var pct = prog.total ? Math.round((prog.solved / prog.total) * 100) : 0;
    var next = steps.filter(function (p) { return !PIT_STORE.isSolved(p.id); })[0];

    var rows = steps.map(function (p) {
      var solved = PIT_STORE.isSolved(p.id);
      var forfeited = PIT_STORE.isForfeited(p.id);
      return (
        '<li class="' + (solved ? "done" : "") + (forfeited && !solved ? " forfeit" : "") + '">' +
          '<span class="step-num" aria-hidden="true">' + p.arc.step + "</span>" +
          '<a class="step-title" href="problem.html?id=' + encodeURIComponent(p.id) + '">' +
            esc(p.title) + "</a>" +
          '<span class="step-diff diff diff-' + p.difficulty + '">' +
            esc(DIFF_LABELS[p.difficulty] || p.difficulty) + "</span>" +
          (forfeited && !solved
            ? '<span class="badge" title="Solution viewed, credit forfeited">no credit</span>'
            : "") +
          (solved ? '<span class="badge" title="Solved">✓ done</span>' : "") +
        "</li>"
      );
    }).join("");

    return (
      '<article class="build-card" id="' + esc(arcId) + '" data-arc="' + esc(arcId) + '">' +
        '<div class="build-head">' +
          "<h2>" + esc(arc.name) + "</h2>" +
          '<div class="build-meta">' +
            '<span class="badge lang">' + esc(arc.language) + "</span>" +
            '<span class="badge track-' + esc(arc.track) + '">' +
              esc(TRACKS[arc.track] ? TRACKS[arc.track].name : arc.track) + "</span>" +
            '<span class="badge" data-arc-progress="' + esc(arcId) + '">' +
              prog.solved + "/" + prog.total + " done</span>" +
          "</div>" +
        "</div>" +
        "<p>" + esc(arc.blurb) + "</p>" +
        '<p class="build-outcome"><strong>You end up with:</strong> ' + esc(arc.outcome) + "</p>" +
        '<div class="build-progress" role="img" aria-label="' + pct + ' percent complete">' +
          '<span style="width:' + pct + '%"></span></div>' +
        '<ol class="build-steps">' + rows + "</ol>" +
        (next
          ? '<p style="margin-top:1rem"><a class="btn small" href="problem.html?id=' +
            encodeURIComponent(next.id) + '">' +
            (prog.solved ? "Continue: step " + next.arc.step : "Start step 1") + "</a></p>"
          : '<p style="margin-top:1rem"><strong>Arc complete.</strong> Every step solved.</p>') +
      "</article>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.querySelector("[data-builds]");
    if (!host || typeof ARCS === "undefined") return;

    host.innerHTML = Object.keys(ARCS).map(function (id) {
      return buildCard(id, ARCS[id]);
    }).join("");

    /* Keep the summary honest: every registered arc must have its problems. */
    var missing = Object.keys(ARCS).filter(function (id) {
      return stepsFor(id).length === 0;
    });
    if (missing.length) {
      host.insertAdjacentHTML("afterbegin",
        '<p class="empty-state">// missing problems for arcs: ' + esc(missing.join(", ")) + "</p>");
    }
  });

  window.PIT_BUILDS = { stepsFor: stepsFor, progressFor: progressFor };
})();
