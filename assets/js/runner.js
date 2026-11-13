/* ==========================================================================
   runner.js — code execution engine.
   python → Pyodide (WASM, in-browser) · c/cpp → Judge0 (optional Piston fallback) ·
   verilog → user-configured Icarus runner (see config.js).
   ========================================================================== */

(function () {
  "use strict";

  var pyodidePromise = null;

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = url;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("failed to load " + url)); };
      document.head.appendChild(s);
    });
  }

  function getPyodide() {
    if (!pyodidePromise) {
      pyodidePromise = loadScript(PIT_CONFIG.pyodideUrl).then(function () {
        return loadPyodide({
          indexURL: PIT_CONFIG.pyodideUrl.replace(/pyodide\.js$/, "")
        });
      });
    }
    return pyodidePromise;
  }

  /* A Python harness that runs the solution and the hidden tests separately so
     failures can be reported precisely: which check, its source line, and what
     actually went wrong. It also returns a real boolean instead of relying on
     a printed marker, so printing "ALL TESTS PASSED" in a solution no longer
     counts as a pass. */
  var PYTHON_HARNESS = [
    "import base64 as _pit_b64",
    "",
    "_pit_user = _pit_b64.b64decode(__PIT_USER_CODE__).decode('utf-8')",
    "_pit_tests = _pit_b64.b64decode(__PIT_TESTS__).decode('utf-8')",
    "_pit_ns = {'__name__': '__main__'}",
    "",
    "def _pit_frame(exc, filename):",
    "    tb = exc.__traceback__",
    "    found = None",
    "    while tb is not None:",
    "        if tb.tb_frame.f_code.co_filename == filename:",
    "            found = tb",
    "        tb = tb.tb_next",
    "    return found",
    "",
    "_pit_error = None",
    "try:",
    "    exec(compile(_pit_user, 'your_solution.py', 'exec'), _pit_ns)",
    "except BaseException as _pit_exc:",
    "    _pit_error = _pit_exc",
    "else:",
    "    try:",
    "        exec(compile(_pit_tests, 'hidden_tests.py', 'exec'), _pit_ns)",
    "    except BaseException as _pit_exc:",
    "        _pit_error = _pit_exc",
    "",
    "_pit_ok = _pit_error is None",
    "if _pit_ok:",
    "    print('ALL TESTS PASSED')",
    "else:",
    "    _pit_kind = type(_pit_error).__name__",
    "    _pit_lines = _pit_tests.splitlines()",
    "    if _pit_kind == 'SyntaxError':",
    "        _pit_where = getattr(_pit_error, 'lineno', None)",
    "        print('Your code does not compile, a syntax error on line %s:' % (_pit_where or '?'))",
    "        _pit_text = (getattr(_pit_error, 'text', '') or '').strip()",
    "        if _pit_text:",
    "            print('    ' + _pit_text)",
    "        print('  %s: %s' % (_pit_kind, getattr(_pit_error, 'msg', str(_pit_error))))",
    "    else:",
    "        _pit_test_frame = _pit_frame(_pit_error, 'hidden_tests.py')",
    "        _pit_user_frame = _pit_frame(_pit_error, 'your_solution.py')",
    "        if _pit_test_frame is not None:",
    "            _pit_n = _pit_test_frame.tb_lineno",
    "            _pit_src = _pit_lines[_pit_n - 1].strip() if 0 < _pit_n <= len(_pit_lines) else ''",
    "            if _pit_user_frame is not None:",
    "                print('A check failed, your code raised %s on line %d:' % (_pit_kind, _pit_user_frame.tb_lineno))",
    "            else:",
    "                print('A check failed. Your code ran, but this test got the wrong result:')",
    "            if _pit_src:",
    "                print('    ' + _pit_src)",
    "            print('  (line %d of the hidden test suite)' % _pit_n)",
    "        elif _pit_user_frame is not None:",
    "            print('Your code raised %s on line %d:' % (_pit_kind, _pit_user_frame.tb_lineno))",
    "        else:",
    "            print('Your code raised %s:' % _pit_kind)",
    "        _pit_msg = str(_pit_error).strip()",
    "        if _pit_msg:",
    "            print('  %s: %s' % (_pit_kind, _pit_msg))",
    "        elif _pit_kind == 'AssertionError':",
    "            print('  AssertionError: the value returned above does not match the expected one.')",
    "    print('')",
    "    print('No credit was earned. Fix the logic and run the tests again.')",
    "",
    "_pit_ok"
  ].join("\n");

  /* Sources travel as base64 so no quoting, newline or Unicode character in a
     solution can break the harness source that carries it. */
  function base64Utf8(text) {
    var bytes = new TextEncoder().encode(String(text));
    var binary = "";
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  /* Single pass, so text inside a solution is never mistaken for a placeholder. */
  function buildPythonHarness(code, tests) {
    return PYTHON_HARNESS.replace(/__PIT_(USER_CODE|TESTS)__/g, function (token) {
      return "'" + base64Utf8(token === "__PIT_USER_CODE__" ? code : tests) + "'";
    });
  }

  function toBool(value) {
    if (value === true) return true;
    if (value && typeof value.valueOf === "function") {
      try { return value.valueOf() === true; } catch (e) { return false; }
    }
    return false;
  }

  function runPython(code, tests, onStatus) {
    onStatus("Loading Python runtime (first run downloads ~10 MB)…");
    return getPyodide().then(function (py) {
      onStatus("Running…");
      var out = [];
      py.setStdout({ batched: function (l) { out.push(l); } });
      py.setStderr({ batched: function (l) { out.push(l); } });
      var failed = null;
      var ok = false;
      try {
        ok = toBool(py.runPython(buildPythonHarness(code, tests || "")));
      } catch (e) {
        failed = "Runner error: " + String(e.message || e);
        out.push(failed);
      }
      return {
        ok: ok && !failed,
        stdout: out.join("\n"),
        stderr: failed || "",
        code: ok && !failed ? 0 : 1
      };
    }).catch(function (e) {
      return { ok: false, stdout: "", stderr: String(e), code: -1 };
    });
  }

  var JUDGE0_LANG = { c: 50, cpp: 54 };

  function fetchJson(url, options) {
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeout = Math.max(1000, Number(PIT_CONFIG.requestTimeoutMs) || 90000);
    var timer = null;
    if (controller) {
      options.signal = controller.signal;
      timer = window.setTimeout(function () { controller.abort(); }, timeout);
    }
    var request = fetch(url, options).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        return { ok: r.ok, status: r.status, body: body };
      });
    });
    return request.then(function (reply) {
      if (timer) window.clearTimeout(timer);
      return reply;
    }, function (err) {
      if (timer) window.clearTimeout(timer);
      if (err && err.name === "AbortError") throw new Error("request timed out after " + timeout + " ms");
      throw err;
    });
  }

  function judge0Once(lang, source) {
    return fetchJson(PIT_CONFIG.judge0Url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language_id: JUDGE0_LANG[lang], source_code: source })
    }).then(function (reply) {
      var res = reply.body || {};
      if (!reply.ok) {
        throw new Error(res.message || res.detail || ("Judge0 returned HTTP " + reply.status));
      }
      var stdout = res.stdout || "";
      var stderr = [res.compile_output, res.stderr, res.message]
        .filter(Boolean).join("\n");
      var accepted = res.status && res.status.id === 3;
      return {
        ok: accepted && /ALL TESTS PASSED/.test(stdout),
        stdout: stdout, stderr: stderr,
        code: accepted ? 0 : 1
      };
    });
  }

  function runCCpp(lang, code, tests, onStatus) {
    onStatus("Compiling on the judge…");
    var source = code + "\n" + (tests || "");
    return judge0Once(lang, source).catch(function (e) {
      if (!PIT_CONFIG.pistonUrl) {
        return {
          ok: false, stdout: "", code: -1,
          stderr: "Judge unreachable (" + e + "). The public judge is rate limited. Wait a moment and retry."
        };
      }
      /* optional Piston fallback */
      return fetchJson(PIT_CONFIG.pistonUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang === "cpp" ? "c++" : "c", version: "*",
          files: [{ name: lang === "cpp" ? "main.cpp" : "main.c", content: source }]
        })
      }).then(function (reply) {
        var res = reply.body || {};
        if (!reply.ok) throw new Error(res.message || ("Piston returned HTTP " + reply.status));
        var run = res.run || {}, compile = res.compile || {};
        return {
          ok: (run.code || 0) === 0 && /ALL TESTS PASSED/.test(run.stdout || ""),
          stdout: run.stdout || "",
          stderr: (compile.stderr || "") + (run.stderr || ""),
          code: run.code != null ? run.code : 1
        };
      });
    }).catch(function (e) {
      return { ok: false, stdout: "", stderr: "Judge error: " + e, code: -1 };
    });
  }

  function runRemote(lang, code, tests, onStatus) {
    var url = PIT_CONFIG.runners[lang];
    if (!url) {
      return Promise.resolve({
        ok: false, stdout: "", code: -1,
        stderr: "No HDL runner connected. Verilog needs a simulator backend (Icarus or Verilator). " +
          "Set PIT_CONFIG.runners.verilog in assets/js/config.js. A connected runner also returns a " +
          "value-change dump, so the site draws the waveform of your clock and signals after each run. " +
          "Until then, paste the module into your local simulator."
      });
    }
    onStatus("Sending to " + lang + " runner…");
    var headers = { "Content-Type": "application/json" };
    if (PIT_CONFIG.runnerKey) headers["X-Runner-Key"] = PIT_CONFIG.runnerKey;
    var wantWaves = PIT_CONFIG.waveforms !== false;
    return fetchJson(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        language: lang, code: code, tests: tests || "",
        dump: wantWaves
      })
    }).then(function (reply) {
      var res = reply.body || {};
      if (!reply.ok) {
        return {
          ok: false, stdout: "",
          stderr: res.detail || ("Runner returned HTTP " + reply.status),
          code: typeof res.code === "number" ? res.code : reply.status
        };
      }
      var hasTests = String(tests || "").trim().length > 0;
      var compileOnly = res.code === 0 && !hasTests;
      return {
        /* Never award a solve for compile-only Verilog. Without a testbench,
           successful compilation is useful feedback—not proof. */
        ok: res.code === 0 && hasTests,
        compileOnly: compileOnly,
        vcd: res.vcd || null,
        stdout: res.stdout || "",
        stderr: (res.stderr || "") + (compileOnly
          ? "\nCompiled successfully, but this problem has no automated testbench. Review the output and mark it solved manually when verified."
          : ""),
        code: res.code
      };
    }).catch(function (e) {
      return { ok: false, stdout: "", stderr: "Runner error: " + e, code: -1 };
    });
  }

  /* Unified entry: run(lang, code, tests, onStatus) → Promise<result>. */
  function run(lang, code, tests, onStatus) {
    onStatus = onStatus || function () {};
    if (lang === "python") return runPython(code, tests, onStatus);
    if (lang === "c" || lang === "cpp") return runCCpp(lang, code, tests, onStatus);
    return runRemote(lang, code, tests, onStatus);
  }

  window.PIT_RUNNER = { run: run, buildPythonHarness: buildPythonHarness };
})();
