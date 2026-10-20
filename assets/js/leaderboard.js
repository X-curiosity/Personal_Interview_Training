/* ==========================================================================
   leaderboard.js — weighted leaderboard.
   "You" row is computed live from solved problems (Easy 1 / Medium 3 /
   Hard 5 points). Friends can be added manually with their per-difficulty
   solve counts; everything persists in localStorage.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var tbody = document.querySelector("[data-board-rows]");
    if (!tbody) return;

    var form = document.querySelector("[data-rival-form]");
    var emptyNote = document.querySelector("[data-board-note]");

    function youEntry() {
      var stats = PIT_STORE.statsFor(PROBLEMS, PIT_STORE.getSolved());
      return {
        you: true,
        name: "You",
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
        points: stats.points
      };
    }

    function entries() {
      var list = [youEntry()].concat(
        PIT_STORE.getRivals().map(function (r, i) {
          return {
            you: false,
            index: i,
            name: r.name,
            easy: r.easy | 0,
            medium: r.medium | 0,
            hard: r.hard | 0,
            points: PIT_STORE.pointsFor({
              easy: r.easy | 0, medium: r.medium | 0, hard: r.hard | 0
            })
          };
        })
      );
      /* Sort: points desc, then hard solved desc, then total solved desc. */
      list.sort(function (a, b) {
        if (b.points !== a.points) return b.points - a.points;
        if (b.hard !== a.hard) return b.hard - a.hard;
        return (b.easy + b.medium + b.hard) - (a.easy + a.medium + a.hard);
      });
      return list;
    }

    function medal(rank) {
      return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);
    }

    /* Rival names are user input — escape before injecting into innerHTML. */
    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function render() {
      var list = entries();
      tbody.innerHTML = list.map(function (e, i) {
        var total = e.easy + e.medium + e.hard;
        return (
          "<tr" + (e.you ? ' class="row-you"' : "") + ">" +
            '<td class="col-rank">' + medal(i + 1) + "</td>" +
            '<td class="col-name">' + esc(e.name) + (e.you ? ' <span class="you-pill">you</span>' : "") + "</td>" +
            '<td class="col-num">' + total + "</td>" +
            '<td class="col-num diff-easy">' + e.easy + "</td>" +
            '<td class="col-num diff-medium">' + e.medium + "</td>" +
            '<td class="col-num diff-hard">' + e.hard + "</td>" +
            '<td class="col-num col-pts">' + e.points + "</td>" +
            "<td class=\"col-del\">" +
              (e.you
                ? ""
                : '<button type="button" class="del" data-del="' + e.index + '"' +
                  ' aria-label="Remove ' + esc(e.name) + '">✕</button>') +
            "</td>" +
          "</tr>"
        );
      }).join("");

      if (emptyNote) {
        emptyNote.hidden = list.length > 1;
      }
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = form.elements.name.value.trim();
        var easy = Math.min(999, Math.max(0, parseInt(form.elements.easy.value, 10) || 0));
        var medium = Math.min(999, Math.max(0, parseInt(form.elements.medium.value, 10) || 0));
        var hard = Math.min(999, Math.max(0, parseInt(form.elements.hard.value, 10) || 0));
        var nameError = form.querySelector("[data-name-error]");
        if (!name) {
          if (nameError) nameError.hidden = false;
          form.elements.name.focus();
          return;
        }
        if (nameError) nameError.hidden = true;
        var rivals = PIT_STORE.getRivals();
        rivals.push({ name: name.slice(0, 24), easy: easy, medium: medium, hard: hard });
        PIT_STORE.saveRivals(rivals);
        form.reset();
        render();
      });
    }

    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-del]");
      if (!btn) return;
      var rivals = PIT_STORE.getRivals();
      rivals.splice(parseInt(btn.getAttribute("data-del"), 10), 1);
      PIT_STORE.saveRivals(rivals);
      render();
    });

    render();

    /* ---------- global board (registered players) ---------- */

    var globalSection = document.querySelector("[data-global-section]");
    var globalRows = document.querySelector("[data-global-rows]");
    var globalNote = document.querySelector("[data-global-note]");

    var API_BASE = /github\.io$/.test(location.hostname)
      ? "https://personal-interview-training.vercel.app/api/"
      : "/api/";

    fetch(API_BASE + "leaderboard")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.board) || !data.board.length) return;
        globalSection.hidden = false;
        var me = window.PIT_AUTH && window.PIT_AUTH.user && window.PIT_AUTH.user();
        globalRows.innerHTML = data.board.map(function (e) {
          var mine = me && me.name === e.name;
          var total = e.easy + e.medium + e.hard;
          return (
            "<tr" + (mine ? ' class="row-you"' : "") + ">" +
              '<td class="col-rank">' + medal(e.rank) + "</td>" +
              '<td class="col-name">' + esc(e.name) + (mine ? ' <span class="you-pill">you</span>' : "") + "</td>" +
              '<td class="col-num">' + total + "</td>" +
              '<td class="col-num diff-easy">' + e.easy + "</td>" +
              '<td class="col-num diff-medium">' + e.medium + "</td>" +
              '<td class="col-num diff-hard">' + e.hard + "</td>" +
              '<td class="col-num col-pts">' + e.points + "</td>" +
            "</tr>"
          );
        }).join("");
        if (globalNote && !me) {
          globalNote.innerHTML =
            'Registered players, scored on the server. <a href="profile.html">Create a profile</a> to join the board.';
        }
      })
      .catch(function () { /* API not deployed yet: local board only */ });
  });
})();
