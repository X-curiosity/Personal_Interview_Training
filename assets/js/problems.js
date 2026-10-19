/* ==========================================================================
   problems.js — the selection page (LeetCode/LeetSilicon style).
   Sidebar: tracks + sub-branches. Main: problem table with status
   checkboxes (persisted), search, difficulty filter, roll-from-selection.
   Requires data.js, store.js, main.js.
   ========================================================================== */

(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var trackList = document.querySelector("[data-track-list]");
    var tbody = document.querySelector("[data-problem-rows]");
    if (!trackList || !tbody) return;

    var searchInput = document.querySelector("[data-search]");
    var diffChips = Array.prototype.slice.call(
      document.querySelectorAll("[data-diff-filter]")
    );
    var rollButton = document.querySelector("[data-roll-selection]");
    var headingEl = document.querySelector("[data-selection-heading]");
    var countEl = document.querySelector("[data-selection-count]");
    var progressEl = document.querySelector("[data-selection-progress]");
    var emptyRow = document.querySelector("[data-empty-row]");

    var state = { track: "all", branch: null, difficulty: "all", query: "" };
    var lastRollId = null;

    /* ---------- sidebar ---------- */

    function buildSidebar() {
      var html =
        '<li><button type="button" class="side-link" data-track="all">' +
        '<span class="side-glyph">⌗</span> All tracks' +
        '<span class="side-count">' + PROBLEMS.length + "</span></button></li>";

      TRACK_ORDER.forEach(function (key) {
        var t = TRACKS[key];
        var count = PROBLEMS.filter(function (p) { return p.track === key; }).length;
        html +=
          '<li class="side-track">' +
            '<button type="button" class="side-link" data-track="' + key + '">' +
              '<span class="side-glyph">' + t.glyph + "</span> " + t.name +
              '<span class="side-count">' + count + "</span>" +
            "</button>" +
            '<ul class="side-branches">' +
              t.branches.map(function (b) {
                var bc = PROBLEMS.filter(function (p) {
                  return p.track === key && p.branch === b;
                }).length;
                return (
                  '<li><button type="button" class="side-branch" ' +
                  'data-track="' + key + '" data-branch="' + b + '">' +
                  b + '<span class="side-count">' + bc + "</span></button></li>"
                );
              }).join("") +
            "</ul>" +
          "</li>";
      });
      trackList.innerHTML = html;

      trackList.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        state.track = btn.getAttribute("data-track");
        state.branch = btn.getAttribute("data-branch") || null;
        render();
      });

      /* Sub-subjects stay hidden until their subject (track) is clicked. */
      syncExpanded();
    }

    function paintSidebar() {
      trackList.querySelectorAll("button").forEach(function (b) {
        var active =
          b.getAttribute("data-track") === state.track &&
          (b.getAttribute("data-branch") || null) === state.branch;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }

    /* Expand exactly the selected track's branch list; collapse the rest. */
    function syncExpanded() {
      trackList.querySelectorAll(".side-track").forEach(function (li) {
        var key = li.querySelector(".side-link").getAttribute("data-track");
        var open = state.track === key;
        li.classList.toggle("expanded", open);
        li.querySelector(".side-link").setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    /* ---------- filtering ---------- */

    function currentPool() {
      return PROBLEMS.filter(function (p) {
        if (state.track !== "all" && p.track !== state.track) return false;
        if (state.branch && p.branch !== state.branch) return false;
        if (state.difficulty !== "all" && p.difficulty !== state.difficulty) return false;
        if (state.query) {
          var q = state.query.toLowerCase();
          var hay = (p.title + " " + p.summary + " " + p.branch + " " +
                     p.tags.join(" ")).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    /* ---------- table ---------- */

    /* Community accuracy votes (interview questions). */
    function voteHtml(p) {
      var t = PIT_STORE.tally("interview", p.id, p.votes);
      return (
        '<button type="button" class="vote-btn up' + (t.mine === "up" ? " on" : "") + '"' +
          ' data-vote="up" data-id="' + p.id + '"' +
          ' aria-pressed="' + (t.mine === "up") + '"' +
          ' title="Accurate — really asked in interviews">▲ ' + t.up + "</button>" +
        '<span class="vote-bar"><span style="width:' + (t.pct || 0) + '%"></span></span>' +
        '<span class="vote-pct">' + (t.pct === null ? "no votes yet" : t.pct + "% accurate") + "</span>" +
        '<button type="button" class="vote-btn down' + (t.mine === "down" ? " on" : "") + '"' +
          ' data-vote="down" data-id="' + p.id + '"' +
          ' aria-pressed="' + (t.mine === "down") + '"' +
          ' title="Not accurate">▼ ' + t.down + "</button>"
      );
    }

    function rowHtml(p, index, solvedSet) {
      var t = window.PIT.trackMeta(p.track);
      var solved = solvedSet.has(p.id);
      return (
        "<tr" + (solved ? ' class="row-solved"' : "") + ' data-id="' + p.id + '">' +
          '<td class="col-status">' +
            '<button type="button" class="check' + (solved ? " on" : "") + '"' +
              ' data-toggle="' + p.id + '"' +
              ' aria-pressed="' + solved + '"' +
              ' aria-label="Mark ' + p.title + " as " + (solved ? "unsolved" : "solved") + '">' +
              (solved ? "✓" : "") +
            "</button>" +
          "</td>" +
          '<td class="col-num">' + (index + 1) + "</td>" +
          '<td class="col-title">' +
            '<a class="p-title" href="problem.html?id=' + encodeURIComponent(p.id) + '" title="' + esc(p.summary) + '">' + esc(p.title) + "</a>" +
            '<span class="p-branch">' + esc(t.short) + " · " + esc(p.branch) + "</span>" +
            (p.track === "interview"
              ? '<span class="vote" data-vote-widget="' + p.id + '">' + voteHtml(p) + "</span>"
              : "") +
          "</td>" +
          '<td class="col-tags">' +
            p.tags.map(function (tag) { return '<span class="tag">' + esc(tag) + "</span>"; }).join("") +
          "</td>" +
          '<td class="col-diff"><span class="diff diff-' + p.difficulty + '">' +
            p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1) + "</span></td>" +
          '<td class="col-link">' +
            (p.source
              ? '<a href="' + esc(p.source) + '" target="_blank" rel="noopener" ' +
                'class="solve-link" aria-label="Open ' + esc(p.title) + ' source on ' + esc(t.platform) + '">↗</a>'
              : "") +
          "</td>" +
        "</tr>"
      );
    }

    function heading() {
      if (state.branch) return state.branch;
      if (state.track === "all") return "All tracks";
      return TRACKS[state.track].name;
    }

    function render() {
      var pool = currentPool();
      var solvedSet = PIT_STORE.getSolved();

      tbody.innerHTML = pool.map(function (p, i) { return rowHtml(p, i, solvedSet); }).join("");
      if (emptyRow) emptyRow.hidden = pool.length !== 0;

      paintSidebar();
      syncExpanded();
      if (headingEl) headingEl.textContent = heading();
      if (countEl) countEl.textContent = pool.length + (pool.length === 1 ? " problem" : " problems");

      if (progressEl) {
        var solvedInPool = pool.filter(function (p) { return solvedSet.has(p.id); }).length;
        var pts = PIT_STORE.statsFor(pool, solvedSet);
        progressEl.textContent =
          solvedInPool + "/" + pool.length + " solved · " + pts.points + " pts";
      }
      if (rollButton) rollButton.disabled = pool.length === 0;

      /* Announce roll results to screen readers. */
      var announce = document.querySelector("[data-roll-announce]");
      if (announce) announce.textContent = "";

      window.PIT.refreshStats();
    }

    /* Vote handling — delegation, re-renders only the affected widget. */
    tbody.addEventListener("click", function (e) {
      var vbtn = e.target.closest("[data-vote]");
      if (!vbtn) return;
      var id = vbtn.getAttribute("data-id");
      var choice = vbtn.getAttribute("data-vote");
      var current = PIT_STORE.getVotes("interview")[id] || null;
      PIT_STORE.setVote("interview", id, current === choice ? null : choice);
      var p = PROBLEMS.find(function (x) { return x.id === id; });
      var widget = tbody.querySelector('[data-vote-widget="' + id + '"]');
      if (p && widget) widget.innerHTML = voteHtml(p);
    });

    /* Solve toggles — event delegation on the table. */
    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-toggle]");
      if (!btn) return;
      var id = btn.getAttribute("data-toggle");
      var nowSolved = PIT_STORE.toggleSolved(id);
      btn.classList.toggle("on", nowSolved);
      btn.setAttribute("aria-pressed", String(nowSolved));
      btn.textContent = nowSolved ? "✓" : "";
      btn.closest("tr").classList.toggle("row-solved", nowSolved);
      btn.setAttribute("aria-label",
        btn.getAttribute("aria-label").replace(/un?solved$/,
          nowSolved ? "unsolved" : "solved"));

      var pool = currentPool();
      var solvedSet = PIT_STORE.getSolved();
      if (progressEl) {
        var pts = PIT_STORE.statsFor(pool, solvedSet);
        var n = pool.filter(function (p) { return solvedSet.has(p.id); }).length;
        progressEl.textContent = n + "/" + pool.length + " solved · " + pts.points + " pts";
      }
      window.PIT.refreshStats();
    });

    /* ---------- search & difficulty ---------- */

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.query = searchInput.value.trim();
        render();
      });
    }

    diffChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.difficulty = chip.getAttribute("data-diff-filter");
        diffChips.forEach(function (c) {
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        render();
      });
    });

    /* ---------- roll from the current selection ---------- */

    if (rollButton) {
      rollButton.addEventListener("click", function () {
        var pool = currentPool();
        var p = window.PIT.pickRandom(pool, lastRollId);
        if (!p) return;
        lastRollId = p.id;
        var row = tbody.querySelector('tr[data-id="' + p.id + '"]');
        if (row) {
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          row.classList.add("row-flash");
          window.setTimeout(function () { row.classList.remove("row-flash"); }, 1800);
        }
        var announce = document.querySelector("[data-roll-announce]");
        if (announce) announce.textContent = "Rolled: " + p.title;
      });
    }

    buildSidebar();

    /* Deep links such as problems.html#cpu preselect a track (used by home cards). */
    (function initFromHash() {
      var key = window.location.hash.replace("#", "");
      if (key && TRACKS[key]) {
        state.track = key;
        state.branch = null;
      }
    })();

    /* React to manual hash edits too (deep links can also change in-page). */
    window.addEventListener("hashchange", function () {
      var key = window.location.hash.replace("#", "");
      if (TRACKS[key] && state.track !== key) {
        state.track = key;
        state.branch = null;
        render();
      }
    });

    render();
  });
})();
