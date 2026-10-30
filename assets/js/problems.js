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
    var langChips = Array.prototype.slice.call(
      document.querySelectorAll("[data-lang-filter]")
    );
    var clearButton = document.querySelector("[data-clear-filters]");
    var rollButton = document.querySelector("[data-roll-selection]");
    var headingEl = document.querySelector("[data-selection-heading]");
    var countEl = document.querySelector("[data-selection-count]");
    var progressEl = document.querySelector("[data-selection-progress]");
    var emptyRow = document.querySelector("[data-empty-row]");

    var state = { track: "all", branch: null, difficulty: "all", query: "", langs: [] };
    var lastRollId = null;

    var LANG_LABELS = {
      python: "Python", c: "C", cpp: "C++", verilog: "Verilog", answer: "Answer"
    };
    var LANG_ORDER = ["python", "c", "cpp", "verilog", "answer"];

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

    /* Remaining problem count per language for the current selection, ignoring
       the language filter itself so the numbers guide the next click. */
    function langCounts() {
      var counts = {};
      PROBLEMS.forEach(function (p) {
        if (state.track !== "all" && p.track !== state.track) return;
        if (state.branch && p.branch !== state.branch) return;
        if (state.difficulty !== "all" && p.difficulty !== state.difficulty) return;
        if (state.query) {
          var q = state.query.toLowerCase();
          var hay = (p.title + " " + p.summary + " " + p.branch + " " +
                     p.tags.join(" ") + " " + langKeys(p).join(" ")).toLowerCase();
          if (hay.indexOf(q) === -1) return;
        }
        langKeys(p).forEach(function (l) {
          counts[l] = (counts[l] || 0) + 1;
        });
      });
      return counts;
    }

    function paintLangChips() {
      var counts = langCounts();
      langChips.forEach(function (chip) {
        var value = chip.getAttribute("data-lang-filter");
        var on = value === "all" ? !state.langs.length : state.langs.indexOf(value) !== -1;
        chip.setAttribute("aria-pressed", on ? "true" : "false");
        var badge = chip.querySelector(".chip-count");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "chip-count";
          chip.appendChild(badge);
        }
        var n = value === "all"
          ? LANG_ORDER.reduce(function (sum, key) { return sum + (counts[key] || 0); }, 0)
          : (counts[value] || 0);
        /* Answer questions and code tasks both appear under All, so count the
           pool directly instead of summing language buckets. */
        if (value === "all") n = currentPoolWithoutLang().length;
        badge.textContent = String(n);
      });
    }

    function currentPoolWithoutLang() {
      var saved = state.langs;
      state.langs = [];
      var pool = currentPool();
      state.langs = saved;
      return pool;
    }

    /* ---------- filtering ---------- */

    /* Language keys for a problem: its code languages, or "answer" for
       concept questions that are solved in a text box. */
    function langKeys(p) {
      return p.kind === "code" && p.languages.length ? p.languages : ["answer"];
    }

    function matchesLang(p) {
      if (!state.langs.length) return true;
      return langKeys(p).some(function (l) { return state.langs.indexOf(l) !== -1; });
    }

    function hasFilters() {
      return state.track !== "all" || !!state.branch || state.difficulty !== "all" ||
        !!state.query || state.langs.length > 0;
    }

    function currentPool() {
      return PROBLEMS.filter(function (p) {
        if (state.track !== "all" && p.track !== state.track) return false;
        if (state.branch && p.branch !== state.branch) return false;
        if (state.difficulty !== "all" && p.difficulty !== state.difficulty) return false;
        if (!matchesLang(p)) return false;
        if (state.query) {
          var q = state.query.toLowerCase();
          var hay = (p.title + " " + p.summary + " " + p.branch + " " +
                     p.tags.join(" ") + " " + langKeys(p).join(" ")).toLowerCase();
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
          ' title="Accurate: really asked in interviews">▲ ' + t.up + "</button>" +
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
            (PIT_STORE.isForfeited(p.id)
              ? '<span class="check forfeit" role="img" aria-label="Credit forfeited, solution viewed"' +
                ' title="Solution viewed, no credit">✗</span>'
              : '<span class="check' + (solved ? " on" : "") + '" role="img"' +
                ' aria-label="' + (solved ? "Solved" : "Not solved yet") + '"' +
                ' title="Solved only by a correct submission">' +
                (solved ? "✓" : "") +
              "</span>") +
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
          '<td class="col-lang">' +
            langKeys(p).map(function (l) {
              return '<span class="badge lang">' + LANG_LABELS[l] + "</span>";
            }).join(" ") +
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
      var base = state.branch
        ? state.branch
        : (state.track === "all" ? "All tracks" : TRACKS[state.track].name);
      if (state.langs.length) {
        base += " · " + state.langs.map(function (l) { return LANG_LABELS[l]; }).join(" + ");
      }
      return base;
    }

    /* Reflect the current selection in the URL so a filtered view can be
       bookmarked or shared. The track stays in the hash for old deep links. */
    function syncUrl() {
      if (!window.history || !window.history.replaceState) return;
      var params = new URLSearchParams();
      if (state.difficulty !== "all") params.set("diff", state.difficulty);
      if (state.langs.length) params.set("lang", state.langs.join(","));
      if (state.query) params.set("q", state.query);
      var qs = params.toString();
      var next = window.location.pathname + (qs ? "?" + qs : "") + window.location.hash;
      if (next !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, "", next);
      }
    }

    function render() {
      var pool = currentPool();
      var solvedSet = PIT_STORE.getSolved();

      tbody.innerHTML = pool.map(function (p, i) { return rowHtml(p, i, solvedSet); }).join("");
      if (emptyRow) emptyRow.hidden = pool.length !== 0;

      paintSidebar();
      syncExpanded();
      paintLangChips();
      if (clearButton) clearButton.hidden = !hasFilters();
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

      syncUrl();
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

    /* ---------- search, language & difficulty ---------- */

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

    langChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-lang-filter");
        if (value === "all") {
          state.langs = [];
        } else {
          var at = state.langs.indexOf(value);
          if (at === -1) state.langs = state.langs.concat([value]);
          else state.langs = state.langs.filter(function (l) { return l !== value; });
        }
        render();
      });
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        state.track = "all";
        state.branch = null;
        state.difficulty = "all";
        state.query = "";
        state.langs = [];
        if (searchInput) searchInput.value = "";
        diffChips.forEach(function (c) {
          c.setAttribute("aria-pressed", c.getAttribute("data-diff-filter") === "all" ? "true" : "false");
        });
        render();
        if (searchInput) searchInput.focus();
      });
    }

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

    /* Read shareable filters from the query string (language, difficulty,
       search). Invalid values are ignored rather than trusted. */
    (function initFromQuery() {
      var params = new URLSearchParams(window.location.search);
      var diff = params.get("diff");
      if (["easy", "medium", "hard"].indexOf(diff) !== -1) state.difficulty = diff;
      var lang = params.get("lang");
      if (lang) {
        state.langs = lang.split(",").filter(function (l) {
          return LANG_ORDER.indexOf(l) !== -1;
        });
      }
      var q = params.get("q");
      if (q) {
        state.query = q;
        if (searchInput) searchInput.value = q;
      }
      diffChips.forEach(function (c) {
        c.setAttribute("aria-pressed",
          c.getAttribute("data-diff-filter") === state.difficulty ? "true" : "false");
      });
    })();

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
