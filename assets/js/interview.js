/* ==========================================================================
   interview.js — "Prepare for the role": timed mock-interview sessions.
   Pick a role → N random medium/hard problems from its tracks → countdown
   timer → per-question solving (same view as problem.html) → scored debrief.
   Requires: data.js (ROLES, PROBLEMS), store.js, problem.js (PIT_PROBLEM).
   ========================================================================== */

(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stages = {
      pick: document.querySelector('[data-stage="pick"]'),
      run: document.querySelector('[data-stage="run"]'),
      done: document.querySelector('[data-stage="done"]')
    };
    if (!stages.pick) return;

    var session = null;
    var timerId = null;

    function show(stage) {
      Object.keys(stages).forEach(function (k) { stages[k].hidden = k !== stage; });
    }

    function fmt(sec) {
      sec = Math.max(0, Math.round(sec));
      var m = Math.floor(sec / 60), s = sec % 60;
      return m + ":" + (s < 10 ? "0" : "") + s;
    }

    function shuffle(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    /* ---------- stage: pick ---------- */

    function renderRoles() {
      var grid = document.querySelector("[data-role-grid]");
      grid.innerHTML = Object.keys(ROLES).map(function (key) {
        var r = ROLES[key];
        var pool = poolFor(r);
        return (
          '<div class="card role-card hoverable" role="button" tabindex="0" data-role="' + key + '">' +
            '<div class="glyph" aria-hidden="true">' + esc(r.icon) + "</div>" +
            "<h3>" + esc(r.name) + "</h3>" +
            "<p>" + esc(r.blurb) + "</p>" +
            '<span class="card-meta">' + r.count + " questions · " + r.minutes +
              " min · medium/hard · " + pool.length + " in pool</span>" +
          "</div>"
        );
      }).join("");

      grid.querySelectorAll("[data-role]").forEach(function (card) {
        function start() { startSession(card.getAttribute("data-role")); }
        card.addEventListener("click", start);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); start(); }
        });
      });
    }

    function poolFor(role) {
      var pool = PROBLEMS.filter(function (p) {
        return role.tracks.indexOf(p.track) !== -1 &&
               role.difficulties.indexOf(p.difficulty) !== -1;
      });
      if (pool.length < role.count) {
        /* fallback: include easies if the pool is too small */
        pool = PROBLEMS.filter(function (p) {
          return role.tracks.indexOf(p.track) !== -1;
        });
      }
      return pool;
    }

    /* ---------- stage: run ---------- */

    function startSession(roleKey) {
      var role = ROLES[roleKey];
      var solvedSet = PIT_STORE.getSolved();
      /* Prefer unsolved questions for better training value. */
      var pool = poolFor(role);
      var unsolved = pool.filter(function (p) { return !solvedSet.has(p.id); });
      var source = unsolved.length >= role.count ? unsolved : pool;

      session = {
        role: role,
        questions: shuffle(source.slice()).slice(0, role.count),
        pos: 0,
        endsAt: Date.now() + role.minutes * 60 * 1000,
        solvedIds: {},
        skippedIds: {}
      };

      document.querySelector("[data-hud-role]").textContent = role.icon + " " + role.name;
      show("run");
      renderQuestion();
      tick();
      timerId = window.setInterval(tick, 1000);
    }

    function renderQuestion() {
      var q = session.questions[session.pos];
      document.querySelector("[data-hud-pos]").textContent =
        (session.pos + 1) + " / " + session.questions.length;
      PIT_PROBLEM.render(document.querySelector("[data-mock-problem]"), q, {
        onSolved: function () { session.solvedIds[q.id] = true; }
      });
      /* Pre-mark if already solved earlier in this session */
      if (session.solvedIds[q.id]) { /* visual only */ }
    }

    function tick() {
      var left = (session.endsAt - Date.now()) / 1000;
      var el = document.querySelector("[data-hud-timer]");
      el.textContent = fmt(left);
      el.classList.toggle("hud-timer-low", left < 300);
      if (left <= 0) endSession();
    }

    function nextQuestion(markSkipped) {
      var q = session.questions[session.pos];
      if (markSkipped && !session.solvedIds[q.id]) session.skippedIds[q.id] = true;
      if (PIT_STORE.isSolved(q.id)) session.solvedIds[q.id] = true;
      session.pos++;
      if (session.pos >= session.questions.length) endSession();
      else renderQuestion();
    }

    function endSession() {
      window.clearInterval(timerId);
      /* final tally — a question solved any time during the session counts */
      session.questions.forEach(function (q) {
        if (PIT_STORE.isSolved(q.id)) session.solvedIds[q.id] = true;
      });
      renderResults();
      show("done");
    }

    /* ---------- stage: done ---------- */

    function renderResults() {
      var qs = session.questions;
      var solved = qs.filter(function (q) { return session.solvedIds[q.id]; });
      var pts = solved.reduce(function (acc, q) {
        return acc + (PIT_STORE.POINTS[q.difficulty] || 0);
      }, 0);
      var usedSec = session.role.minutes * 60 - Math.max(0, (session.endsAt - Date.now()) / 1000);

      document.querySelector("[data-res-solved]").textContent = solved.length;
      document.querySelector("[data-res-total]").textContent = qs.length;
      document.querySelector("[data-res-points]").textContent = pts;
      document.querySelector("[data-res-time]").textContent = fmt(usedSec);

      document.querySelector("[data-res-review]").innerHTML = qs.map(function (q, i) {
        var ok = !!session.solvedIds[q.id];
        var skipped = !ok && !!session.skippedIds[q.id];
        var stateClass = ok ? "ok" : (skipped ? "skipped" : "ko");
        var stateMark = ok ? "✓" : (skipped ? "↷ skipped" : "✗");
        return (
          '<li class="' + stateClass + '">' +
            "<span>" + stateMark + " · Q" + (i + 1) + " — " +
            '<a href="problem.html?id=' + encodeURIComponent(q.id) + '">' + esc(q.title) + "</a></span>" +
            '<span class="diff diff-' + q.difficulty + '">' + q.difficulty + "</span>" +
          "</li>"
        );
      }).join("");
    }

    /* ---------- wiring ---------- */

    document.querySelector("[data-skip]").addEventListener("click", function () { nextQuestion(true); });
    document.querySelector("[data-next-q]").addEventListener("click", function () { nextQuestion(false); });
    document.querySelector("[data-end-early]").addEventListener("click", endSession);
    document.querySelector("[data-again]").addEventListener("click", function () {
      session = null;
      show("pick");
    });

    renderRoles();
    show("pick");
  });
})();
