/* ==========================================================================
   problem.js — renders a single problem (statement + answer box OR code
   editor + run). Exported as window.PIT_PROBLEM so interview.js can embed
   the exact same view inside a mock-interview session.
   Requires: data.js, store.js, runner.js.
   ========================================================================== */

(function () {
  "use strict";

  var LANG_LABELS = {
    python: "Python", c: "C", cpp: "C++", verilog: "Verilog"
  };
  var DIFF_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Very hard" };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* Format only a tiny, safe subset of Markdown used by our original
     statements. Escape text first; never interpret arbitrary HTML. */
  function statementHtml(raw) {
    function inline(line) {
      return esc(line).replace(/`([^`\n]+)`/g, "<code>$1</code>");
    }
    return String(raw).replace(/\r\n?/g, "\n").split(/\n{2,}/).map(function (block) {
      var pieces = [];
      var prose = [];
      var items = [];
      function flushProse() {
        if (prose.length) pieces.push("<p>" + prose.map(inline).join("<br>") + "</p>");
        prose = [];
      }
      function flushItems() {
        if (items.length) pieces.push("<ul>" + items.map(function (item) {
          return "<li>" + inline(item) + "</li>";
        }).join("") + "</ul>");
        items = [];
      }
      block.split("\n").forEach(function (line) {
        if (/^[-*] /.test(line)) {
          flushProse();
          items.push(line.slice(2));
        } else {
          flushItems();
          prose.push(line);
        }
      });
      flushProse();
      flushItems();
      return pieces.join("");
    }).join("");
  }

  /* Banner that ties one step to the system it belongs to, with prev/next. */
  function arcBanner(p) {
    if (!p.arc) return "";
    var siblings = PROBLEMS.filter(function (x) {
      return x.arc && x.arc.id === p.arc.id;
    }).sort(function (a, b) { return a.arc.step - b.arc.step; });
    var index = -1;
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i].id === p.id) index = i;
    }
    var prev = index > 0 ? siblings[index - 1] : null;
    var next = index !== -1 && index < siblings.length - 1 ? siblings[index + 1] : null;
    return (
      '<div class="arc-banner">' +
        '<span class="badge">build step ' + p.arc.step + " of " + p.arc.total + "</span>" +
        '<a class="arc-name" href="builds.html#' + esc(p.arc.id) + '">' + esc(p.arc.name) + "</a>" +
        '<span class="arc-step">each step is a module of the finished system</span>' +
        '<span class="arc-nav">' +
          (prev ? '<a href="problem.html?id=' + encodeURIComponent(prev.id) + '">← step ' + prev.arc.step + "</a>" : "") +
          (next ? '<a href="problem.html?id=' + encodeURIComponent(next.id) + '">step ' + next.arc.step + " →</a>" : "") +
        "</span>" +
      "</div>"
    );
  }

  function metaHtml(p) {
    var t = TRACKS[p.track];
    return (
      '<span class="badge track-' + p.track + '">' + t.name + "</span>" +
      '<span class="badge">' + p.branch + "</span>" +
      '<span class="diff diff-' + p.difficulty + '">' +
        (DIFF_LABELS[p.difficulty] || p.difficulty) + "</span>" +
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

  /* Progressive free hints + two-step forfeit reveal, shared by both
     answer-box and editor problem types. Returns a hints/reveal fragment. */
  function hintsHtml(p) {
    if (!p.hints || !p.hints.length) return "";
    return (
      '<button type="button" class="btn ghost small" data-hint>Show hint</button>' +
      '<div class="hints" data-hints hidden></div>'
    );
  }

  function attachHints(container, p) {
    var hintBtn = container.querySelector("[data-hint]");
    if (!hintBtn) return;
    var box = container.querySelector("[data-hints]");
    var shown = 0;
    hintBtn.addEventListener("click", function () {
      if (shown >= p.hints.length) return;
      box.hidden = false;
      var div = document.createElement("div");
      div.className = "hint";
      div.innerHTML = "<strong>Hint " + (shown + 1) + "/" + p.hints.length + ":</strong> " + esc(p.hints[shown]);
      box.appendChild(div);
      shown++;
      hintBtn.textContent = shown < p.hints.length ? "Show next hint" : "No more hints";
      if (shown >= p.hints.length) hintBtn.disabled = true;
    });
  }

  /* Two-step reveal: first click arms the warning, second forfeits credit.
     Already forfeited problems show the solution freely. */
  function attachReveal(container, p, label) {
    var revealBtn = container.querySelector("[data-reveal]");
    if (!revealBtn) return;
    var armed = false;
    revealBtn.addEventListener("click", function () {
      var sol = container.querySelector("[data-solution]");
      var forfeited = PIT_STORE.isForfeited(p.id);
      if (sol.hidden && !forfeited && !armed) {
        armed = true;
        revealBtn.classList.add("armed");
        revealBtn.textContent = "Sure? Viewing it forfeits credit";
        return;
      }
      if (sol.hidden && !forfeited) {
        PIT_STORE.addForfeit(p.id);
        container.classList.add("forfeited");
      }
      armed = false;
      revealBtn.classList.remove("armed");
      sol.hidden = !sol.hidden;
      revealBtn.textContent = sol.hidden ? label : "Hide solution";
    });
  }

  /* Build-arc solutions are reference implementations, not prose. Render those
     in a monospace block so indentation survives. */
  function looksLikeCode(text) {
    return /\n/.test(text) && /(^\s*(module|def |class |#include|typedef|int |void |struct )|;\s*$)/m.test(text);
  }

  function revealHtml(p, label) {
    var body = looksLikeCode(p.solution)
      ? '<pre class="solution-code">' + esc(p.solution) + "</pre>"
      : "<p>" + esc(p.solution).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
    return (
      '<button type="button" class="btn ghost small" data-reveal>' + label + "</button>" +
      '<div class="solution" data-solution hidden><h3>Solution</h3>' + body + "</div>"
    );
  }

  /* Renders the answer box / solution reveal into container. */
  function attachAnswerBox(container, p, hooks) {
    hooks = hooks || {};
    var forfeited = PIT_STORE.isForfeited(p.id);
    var html = '<div class="answer-box' + (forfeited ? " forfeited" : "") + '">';
    if (p.answer !== null) {
      html +=
        '<label class="answer-label" for="ans-' + p.id + '">Your answer</label>' +
        '<div class="answer-row">' +
          '<input id="ans-' + p.id + '" type="text" autocomplete="off" spellcheck="false" placeholder="type your answer…">' +
          '<button type="button" class="btn small" data-check>Submit answer</button>' +
        "</div>" +
        '<p class="answer-feedback" data-feedback aria-live="polite"></p>';
    }
    html += hintsHtml(p);
    if (p.solution) html += revealHtml(p, p.answer !== null ? "Show solution" : "Show expected answer");
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
      if (forfeited && feedback) {
        feedback.className = "answer-feedback ko";
        feedback.textContent = "Solution viewed. Credit forfeited for this problem.";
      }
      function doCheck() {
        if (PIT_STORE.isForfeited(p.id)) {
          feedback.className = "answer-feedback ko";
          feedback.textContent = "Solution viewed. Credit forfeited for this problem.";
          return;
        }
        var ok = checkAnswer(p, input.value);
        feedback.className = "answer-feedback " + (ok ? "ok" : "ko");
        feedback.textContent = ok
          ? "✓ Correct. Marked as solved."
          : "✗ Not quite. Check the magnitudes, then try again.";
        if (ok) markSolved();
      }
      container.querySelector("[data-check]").addEventListener("click", doCheck);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") doCheck();
      });
    }
    attachHints(container, p);
    attachReveal(container, p, p.answer !== null ? "Show solution" : "Show expected answer");
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
        '<textarea class="editor" data-editor spellcheck="false" aria-label="Code editor"' +
          ' aria-describedby="editor-hint-' + esc(p.id) + '"></textarea>' +
        '<p class="editor-hint" id="editor-hint-' + esc(p.id) + '">' +
          "Tab indents · Shift+Tab outdents · Enter opens blocks · Ctrl/Cmd+Enter runs · Ctrl/Cmd+Shift+Enter submits" +
        "</p>" +
        '<div class="editor-actions">' +
          '<button type="button" class="btn ghost small" data-run>▶ Run tests</button>' +
          '<button type="button" class="btn small" data-submit>✔ Submit</button>' +
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
    var submitBtn = container.querySelector("[data-submit]");
    var resetBtn = container.querySelector("[data-reset]");
    var tabs = container.querySelectorAll(".editor-tab");
    var actions = container.querySelector(".editor-actions");

    /* hints and forfeit reveal for code problems too */
    if (p.hints && p.hints.length) {
      var hintFrag = document.createElement("span");
      hintFrag.innerHTML = hintsHtml(p);
      while (hintFrag.firstChild) actions.appendChild(hintFrag.firstChild);
    }
    if (p.solution) {
      var revFrag = document.createElement("span");
      revFrag.innerHTML = revealHtml(p, "Show solution");
      while (revFrag.firstChild) container.appendChild(revFrag.firstChild);
    }
    attachHints(container, p);
    attachReveal(container, p, "Show solution");
    if (PIT_STORE.isForfeited(p.id)) container.classList.add("forfeited");

    function starterFor(lang) {
      return p.starter[lang] || "// no starter for " + lang + ". Write from scratch\n";
    }
    editor.value = starterFor(active);

    /* ---------- smart indentation ----------
       A textarea has no idea about blocks, so the editor adds the behaviours
       programmers expect: Enter continues the current indentation and opens
       a new level after a Python line ending in ":" or an opening bracket,
       Tab indents instead of leaving the field, Shift+Tab outdents. */
    var INDENT = "    ";
    var escapePressed = false;

    function lineStartAt(text, pos) {
      return text.lastIndexOf("\n", pos - 1) + 1;
    }
    function lineEndAt(text, pos) {
      var i = text.indexOf("\n", pos);
      return i === -1 ? text.length : i;
    }

    /* Prefer the browser command so native undo keeps working; fall back to
       direct editing where execCommand is unavailable. */
    function insertText(text) {
      var applied = false;
      try {
        applied = document.execCommand("insertText", false, text);
      } catch (err) {
        applied = false;
      }
      if (applied) return true;
      var s = editor.selectionStart;
      var e = editor.selectionEnd;
      var value = editor.value;
      editor.value = value.slice(0, s) + text + value.slice(e);
      editor.selectionStart = editor.selectionEnd = s + text.length;
      return true;
    }

    function replaceRange(start, end, text, selStart, selEnd) {
      var value = editor.value;
      editor.value = value.slice(0, start) + text + value.slice(end);
      editor.selectionStart = selStart == null ? start + text.length : selStart;
      editor.selectionEnd = selEnd == null ? editor.selectionStart : selEnd;
    }

    /* Add one indent unit to every line touched by the selection. */
    function indentLines() {
      var value = editor.value;
      var start = lineStartAt(value, editor.selectionStart);
      var end = lineEndAt(value, editor.selectionEnd);
      var block = value.slice(start, end);
      var lines = block.split("\n").map(function (line) {
        return line.length ? INDENT + line : line;
      });
      var next = lines.join("\n");
      var delta = next.length - block.length;
      replaceRange(start, end, next, start, end + delta);
    }

    /* Remove up to one indent unit (or a leading tab) from touched lines. */
    function outdentLines() {
      var value = editor.value;
      var start = lineStartAt(value, editor.selectionStart);
      var end = lineEndAt(value, editor.selectionEnd);
      var block = value.slice(start, end);
      var removed = 0;
      var lines = block.split("\n").map(function (line, index) {
        var cut = 0;
        if (line.charAt(0) === "\t") cut = 1;
        else while (cut < INDENT.length && line.charAt(cut) === " ") cut++;
        if (index === 0) removed = cut;
        return line.slice(cut);
      });
      var next = lines.join("\n");
      var delta = block.length - next.length;
      replaceRange(start, end, next, Math.max(start, editor.selectionStart - removed),
        Math.max(start, editor.selectionEnd - delta));
    }

    editor.addEventListener("keydown", function (e) {
      if (e.isComposing || e.key === "Process") return;
      var start = editor.selectionStart;
      var end = editor.selectionEnd;

      if (e.key === "Escape") {
        /* Escape then Tab moves focus out, so keyboard users are never trapped. */
        escapePressed = true;
        return;
      }
      if (e.key === "Tab") {
        if (escapePressed) {
          escapePressed = false;
          return;
        }
        e.preventDefault();
        if (e.shiftKey) outdentLines();
        else if (start !== end) indentLines();
        else {
          var column = start - lineStartAt(editor.value, start);
          insertText(new Array(4 - (column % 4) + 1).join(" "));
        }
        return;
      }
      escapePressed = false;

      if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

      var value = editor.value;
      var lineStart = lineStartAt(value, start);
      var beforeCaret = value.slice(lineStart, start);
      var baseIndent = (beforeCaret.match(/^[ \t]*/) || [""])[0];
      var trimmed = beforeCaret.replace(/[ \t]+$/, "");
      var opener = trimmed.slice(-1);
      var closers = { "{": "}", "(": ")", "[": "]" };
      var nextChar = value.charAt(end);

      /* "{" immediately followed by "}" expands into an indented block with
         the caret on the empty line between the braces. */
      if (closers[opener] && nextChar === closers[opener] && start === end) {
        e.preventDefault();
        var inner = baseIndent + INDENT;
        insertText("\n" + inner + "\n" + baseIndent);
        editor.selectionStart = editor.selectionEnd = start + 1 + inner.length;
        return;
      }

      var extra = opener === ":" || closers[opener] ? INDENT : "";
      if (!baseIndent && !extra) return; /* plain line: let the browser do it */
      e.preventDefault();
      insertText("\n" + baseIndent + extra);
    });

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

    var POINTS = { easy: 1, medium: 3, hard: 5, expert: 8 };

    /* "Run" is a practice run: it never awards credit. "Submit" grades the
       same tests and is the only action that can mark the problem solved. */
    function execute(mode) {
      if (runBtn.disabled) return;
      runBtn.disabled = true;
      submitBtn.disabled = true;
      resetBtn.disabled = true;
      tabs.forEach(function (tab) { tab.disabled = true; });
      output.hidden = false;
      output.className = "run-output";
      output.textContent = "";
      status.textContent = mode === "submit" ? "Submitting…" : "Running tests…";
      PIT_RUNNER.run(active, editor.value, p.tests[active] || "", function (msg) {
        status.textContent = msg;
      }).then(function (res) {
        var text = res.stdout + (res.stderr ? "\n" + res.stderr : "");
        var forfeited = PIT_STORE.isForfeited(p.id);
        var notes = [];

        if (res.ok && !forfeited) {
          if (mode === "submit") {
            var already = PIT_STORE.isSolved(p.id);
            if (!already) PIT_STORE.toggleSolved(p.id);
            if (hooks.onSolved) hooks.onSolved();
            var points = POINTS[p.difficulty] || 0;
            notes.push(already
              ? "Accepted. You had already solved this problem."
              : "Accepted! Credit earned: " + points + (points === 1 ? " point." : " points."));
          } else {
            notes.push("All checks passed. Press Submit to earn credit for this problem.");
          }
        } else if (res.ok && forfeited) {
          notes.push("All checks passed, but credit was forfeited when you viewed the solution.");
        } else if (mode === "submit") {
          notes.push("Submission failed. No credit was earned.");
        }

        output.textContent = (text.trim() || "(no output)") +
          (notes.length ? "\n\n" + notes.join("\n") : "");
        output.classList.add(res.ok && !forfeited ? "ok" : (res.compileOnly ? "neutral" : "ko"));
        status.textContent = mode === "submit"
          ? (res.ok && !forfeited ? "Accepted" : (res.ok ? "Tests passed" : "Submission failed"))
          : (res.ok ? "Tests passed" : "Tests failed");
        runBtn.disabled = false;
        submitBtn.disabled = false;
        resetBtn.disabled = false;
        tabs.forEach(function (tab) { tab.disabled = false; });
      });
    }

    runBtn.addEventListener("click", function () { execute("run"); });
    submitBtn.addEventListener("click", function () { execute("submit"); });

    /* Ctrl/Cmd+Enter runs the tests, adding Shift submits. */
    editor.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      execute(e.shiftKey ? "submit" : "run");
    });
  }

  /* Full problem view: meta, statement, then answer box or editor. */
  function render(container, p, hooks) {
    var html =
      '<div class="problem-view">' +
        arcBanner(p) +
        '<div class="meta problem-meta">' + metaHtml(p) + "</div>" +
        "<h1 class=\"problem-title\">" + esc(p.title) + "</h1>" +
        '<div class="statement">' + statementHtml(p.statement) + "</div>" +
        (p.image && p.image.url
          ? '<figure class="problem-figure">' +
            '<img src="' + esc(p.image.url) + '" alt="' + esc(p.image.alt || p.title) + '" loading="lazy">' +
            (p.image.alt ? '<figcaption>' + esc(p.image.alt) + "</figcaption>" : "") +
            "</figure>"
          : "") +
        (p.references && p.references.length
          ? '<div class="problem-refs"><span class="refs-label">Further reading</span>' +
            p.references.map(function (r) {
              return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.label) + " ↗</a>";
            }).join("") +
            "</div>"
          : "") +
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
