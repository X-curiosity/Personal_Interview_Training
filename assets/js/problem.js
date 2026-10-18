/* ==========================================================================
   problem.js — renders a single problem (statement + answer box OR code
   editor + run). Exported as window.PIT_PROBLEM so interview.js can embed
   the exact same view inside a mock-interview session.
   Requires: data.js, store.js, runner.js.
   ========================================================================== */

(function () {
  "use strict";

  var LANG_LABELS = {
    python: "Python", c: "C", cpp: "C++", verilog: "Verilog", cuda: "CUDA"
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function metaHtml(p) {
    var t = TRACKS[p.track];
    return (
      '<span class="badge track-' + p.track + '">' + t.name + "</span>" +
      '<span class="badge">' + p.branch + "</span>" +
      '<span class="diff diff-' + p.difficulty + '">' +
        p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1) + "</span>" +
      (p.kind === "code"
        ? p.languages.map(function (l) {
            return '<span class="badge lang">' + LANG_LABELS[l] + "</span>";
          }).join("")
        : '<span class="badge">answer box</span>')
    );
  }

  /* ---------- answer checking ---------- */

  function checkAnswer(p, input) {
    if (p.answer === null) return null; // reveal-only
    var expected = p.answer.trim();
    var given = String(input).trim();
    if (!given) return false;
    var numericGiven = given.replace(/[%$]/g, "");
    /* Accept decimal comma (0,125 / 1,5) while preserving conventional
       thousands separators such as 1,500 or 12,345. */
    if (/^[+-]?0,\d+$/.test(numericGiven) || /^[+-]?\d+,\d{1,2}$/.test(numericGiven)) {
      numericGiven = numericGiven.replace(",", ".");
    } else {
      numericGiven = numericGiven.replace(/,/g, "");
    }
    var eNum = Number(expected), gNum = Number(numericGiven);
    if (!isNaN(eNum) && !isNaN(gNum) && expected !== "") {
      var tol = p.tolerance != null ? p.tolerance : 0;
      /* Counts and other integer answers are exact even when a pack uses a
         tolerance for its decimal-valued questions. This prevents an answer
         such as 2,970,000 passing when the exact count is 3,000,000. */
      if (Number.isInteger(eNum)) return gNum === eNum;
      var denom = Math.max(Math.abs(eNum), 1e-12);
      return Math.abs(gNum - eNum) / denom <= tol;
    }
    return given.toLowerCase() === expected.toLowerCase();
  }

  /* Renders the answer box / solution reveal into container. */
  function attachAnswerBox(container, p, hooks) {
    hooks = hooks || {};
    var html = '<div class="answer-box">';
    if (p.answer !== null) {
      html +=
        '<label class="answer-label" for="ans-' + p.id + '">Your answer</label>' +
        '<div class="answer-row">' +
          '<input id="ans-' + p.id + '" type="text" autocomplete="off" spellcheck="false" placeholder="type your answer…">' +
          '<button type="button" class="btn small" data-check>Check</button>' +
        "</div>" +
        '<p class="answer-feedback" data-feedback aria-live="polite"></p>';
    }
    if (p.solution) {
      html +=
        '<button type="button" class="btn ghost small" data-reveal>' +
          (p.answer !== null ? "Show solution" : "Show expected answer") + "</button>" +
        '<div class="solution" data-solution hidden>' +
          "<h3>Solution</h3><p>" + esc(p.solution).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>" +
        "</div>";
    }
    html += "</div>";
    container.innerHTML = html;

    var feedback = container.querySelector("[data-feedback]");
    var input = container.querySelector("input");
    var solved = false;

    function markSolved() {
      if (solved) return;
      solved = true;
      if (!PIT_STORE.isSolved(p.id)) PIT_STORE.toggleSolved(p.id);
      if (hooks.onSolved) hooks.onSolved();
    }

    if (input) {
      function doCheck() {
        var ok = checkAnswer(p, input.value);
        feedback.className = "answer-feedback " + (ok ? "ok" : "ko");
        feedback.textContent = ok
          ? "✓ Correct — marked as solved."
          : "✗ Not quite. Check the magnitudes, then try again.";
        if (ok) markSolved();
      }
      container.querySelector("[data-check]").addEventListener("click", doCheck);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") doCheck();
      });
    }
    var revealBtn = container.querySelector("[data-reveal]");
    if (revealBtn) {
      revealBtn.addEventListener("click", function () {
        var sol = container.querySelector("[data-solution]");
        sol.hidden = !sol.hidden;
        revealBtn.textContent = sol.hidden ? "Show solution" : "Hide solution";
      });
    }
  }

  /* Renders the code editor + run console into container. */
  function attachEditor(container, p, hooks) {
    hooks = hooks || {};
    var langs = p.languages.length ? p.languages : ["python"];
    var active = langs[0];

    var html =
      '<div class="editor-box">' +
        '<div class="editor-tabs" role="tablist">' +
          langs.map(function (l, i) {
            return '<button type="button" role="tab" class="editor-tab' + (i === 0 ? " active" : "") + '"' +
              ' data-lang="' + l + '" aria-selected="' + (i === 0) + '">' + LANG_LABELS[l] + "</button>";
          }).join("") +
        "</div>" +
        '<textarea class="editor" data-editor spellcheck="false" aria-label="Code editor"></textarea>' +
        '<div class="editor-actions">' +
          '<button type="button" class="btn small" data-run>▶ Run tests</button>' +
          '<button type="button" class="btn ghost small" data-reset>Reset</button>' +
          '<span class="run-status" data-status aria-live="polite"></span>' +
        "</div>" +
        '<pre class="run-output" data-output hidden></pre>' +
      "</div>";
    container.innerHTML = html;

    var editor = container.querySelector("[data-editor]");
    var output = container.querySelector("[data-output]");
    var status = container.querySelector("[data-status]");
    var runBtn = container.querySelector("[data-run]");
    var resetBtn = container.querySelector("[data-reset]");
    var tabs = container.querySelectorAll(".editor-tab");

    function starterFor(lang) {
      return p.starter[lang] || "// no starter for " + lang + " — write from scratch\n";
    }
    editor.value = starterFor(active);

    container.querySelectorAll(".editor-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        container.querySelectorAll(".editor-tab").forEach(function (t) {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        active = tab.getAttribute("data-lang");
        editor.value = starterFor(active);
        output.hidden = true;
        status.textContent = "";
      });
    });

    resetBtn.addEventListener("click", function () {
      editor.value = starterFor(active);
      output.hidden = true;
      status.textContent = "";
    });

    runBtn.addEventListener("click", function () {
      runBtn.disabled = true;
      resetBtn.disabled = true;
      tabs.forEach(function (tab) { tab.disabled = true; });
      output.hidden = false;
      output.className = "run-output";
      output.textContent = "";
      PIT_RUNNER.run(active, editor.value, p.tests[active] || "", function (msg) {
        status.textContent = msg;
      }).then(function (res) {
        status.textContent = "";
        runBtn.disabled = false;
        resetBtn.disabled = false;
        tabs.forEach(function (tab) { tab.disabled = false; });
        var text = res.stdout + (res.stderr ? "\n" + res.stderr : "");
        output.textContent = text.trim() || "(no output)";
        output.classList.add(res.ok ? "ok" : (res.compileOnly ? "neutral" : "ko"));
        if (res.ok) {
          if (!PIT_STORE.isSolved(p.id)) PIT_STORE.toggleSolved(p.id);
          if (hooks.onSolved) hooks.onSolved();
        }
      });
    });
  }

  /* Full problem view: meta, statement, then answer box or editor. */
  function render(container, p, hooks) {
    var html =
      '<div class="problem-view">' +
        '<div class="meta problem-meta">' + metaHtml(p) + "</div>" +
        "<h1 class=\"problem-title\">" + esc(p.title) + "</h1>" +
        '<div class="statement"><p>' +
          esc(p.statement).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") +
        "</p></div>" +
        '<div data-interactive></div>' +
        (p.source
          ? '<p class="source-link">Source: <a href="' + p.source + '" target="_blank" rel="noopener">' +
            esc(p.source.replace(/^https?:\/\//, "").replace(/\/$/, "")) + " ↗</a></p>"
          : "") +
      "</div>";
    container.innerHTML = html;
    var slot = container.querySelector("[data-interactive]");
    if (p.kind === "code") attachEditor(slot, p, hooks);
    else attachAnswerBox(slot, p, hooks);
  }

  window.PIT_PROBLEM = { render: render, checkAnswer: checkAnswer };
})();
