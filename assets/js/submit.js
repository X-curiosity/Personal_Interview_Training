/* ==========================================================================
   submit.js — Contribute page:
   1) Manual submission form → opens a pre-filled GitHub issue (admin review
      happens on the repo), plus a "copy JSON" fallback.
   2) Review queue → renders PENDING_PROBLEMS with community voting
      (namespace "pending", same mechanism as interview questions).
   ========================================================================== */

(function () {
  "use strict";

  var REPO_ISSUE_URL =
    "https://github.com/X-curiosity/Personal_Interview_Training/issues/new";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("[data-submit-form]");
    var queue = document.querySelector("[data-review-queue]");

    /* ---------- submission form ---------- */

    function formData() {
      return {
        title: form.elements.title.value.trim(),
        track: form.elements.track.value,
        branch: form.elements.branch.value.trim(),
        difficulty: form.elements.difficulty.value,
        url: form.elements.url.value.trim(),
        summary: form.elements.summary.value.trim()
      };
    }

    function jsEsc(s) {
      return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ");
    }

    function toJsonSnippet(d) {
      return (
        '{ id: "new-XX", track: "' + d.track + '", branch: "' + jsEsc(d.branch) + '",\n' +
        '  title: "' + jsEsc(d.title) + '", difficulty: "' + d.difficulty + '",\n' +
        '  tags: ["manual-submission"],\n' +
        '  summary: "' + jsEsc(d.summary) + '",\n' +
        '  url: "' + d.url + '" },'
      );
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var d = formData();
        if (!d.title || !d.url) {
          (!d.title ? form.elements.title : form.elements.url).focus();
          return;
        }
        var body =
          "**Track:** " + d.track + "\n" +
          "**Branch:** " + d.branch + "\n" +
          "**Difficulty:** " + d.difficulty + "\n" +
          "**Source URL:** " + d.url + "\n\n" +
          "**Summary:**\n" + d.summary + "\n\n" +
          "```js\n" + toJsonSnippet(d) + "\n```\n\n" +
          "---\n_Submitted via the Contribute page. Admin review: move into " +
          "`assets/js/pending.js` (queue) or straight into `assets/js/data.js`._";
        var url = REPO_ISSUE_URL +
          "?title=" + encodeURIComponent("[Puzzle] " + d.title) +
          "&labels=" + encodeURIComponent("puzzle-submission") +
          "&body=" + encodeURIComponent(body);
        window.open(url, "_blank", "noopener");
      });

      var copyBtn = form.querySelector("[data-copy-json]");
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          var snippet = toJsonSnippet(formData());
          function done() {
            copyBtn.textContent = "Copied ✓";
            window.setTimeout(function () { copyBtn.textContent = "Copy as JSON"; }, 1600);
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(snippet).then(done, function () {
              window.prompt("Copy the JSON manually:", snippet);
            });
          } else {
            window.prompt("Copy the JSON manually:", snippet);
          }
        });
      }
    }

    /* ---------- review queue ---------- */

    function voteWidget(p) {
      var t = PIT_STORE.tally("pending", p.id, p.votes);
      return (
        '<button type="button" class="vote-btn up' + (t.mine === "up" ? " on" : "") + '"' +
          ' data-vote="up" data-id="' + p.id + '" aria-pressed="' + (t.mine === "up") + '">' +
          "▲ " + t.up + "</button>" +
        '<span class="vote-bar"><span style="width:' + (t.pct || 0) + '%"></span></span>' +
        '<span class="vote-pct">' + (t.pct === null ? "no votes yet" : t.pct + "% say add it") + "</span>" +
        '<button type="button" class="vote-btn down' + (t.mine === "down" ? " on" : "") + '"' +
          ' data-vote="down" data-id="' + p.id + '" aria-pressed="' + (t.mine === "down") + '">' +
          "▼ " + t.down + "</button>"
      );
    }

    function itemHtml(p) {
      var t = TRACKS[p.track] || { name: p.track };
      var isAgent = p.submittedBy === "scout-agent";
      return (
        '<div class="card review-item">' +
          '<div class="meta" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">' +
            '<span class="badge track-' + p.track + '">' + t.name + "</span>" +
            '<span class="badge">' + p.branch + "</span>" +
            '<span class="diff diff-' + p.difficulty + '">' +
              p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1) + "</span>" +
            '<span class="status-pill' + (isAgent ? " agent" : "") + '">' +
              (isAgent ? "🤖 scout agent" : "✍ manual") + "</span>" +
          "</div>" +
          "<h3>" + p.title + "</h3>" +
          "<p>" + p.summary + "</p>" +
          '<span class="vote" data-vote-widget="' + p.id + '">' + voteWidget(p) + "</span>" +
          '<div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:0.7rem;">' +
            '<span class="submitted-by">submitted ' + p.submittedAt +
              " · awaiting admin merge</span>" +
            '<a class="card-link" style="position:static;" href="' + p.url +
              '" target="_blank" rel="noopener">Source →</a>' +
          "</div>" +
        "</div>"
      );
    }

    function renderQueue() {
      if (!queue || typeof PENDING_PROBLEMS === "undefined") return;
      queue.innerHTML = PENDING_PROBLEMS.map(itemHtml).join("");
    }

    if (queue) {
      queue.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-vote]");
        if (!btn) return;
        var id = btn.getAttribute("data-id");
        var choice = btn.getAttribute("data-vote");
        var current = PIT_STORE.getVotes("pending")[id] || null;
        PIT_STORE.setVote("pending", id, current === choice ? null : choice);
        var p = PENDING_PROBLEMS.find(function (x) { return x.id === id; });
        var widget = queue.querySelector('[data-vote-widget="' + id + '"]');
        if (p && widget) widget.innerHTML = voteWidget(p);
      });
    }

    renderQueue();
  });
})();
