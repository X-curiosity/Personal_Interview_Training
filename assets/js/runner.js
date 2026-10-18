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

  function runPython(code, tests, onStatus) {
    onStatus("Loading Python runtime (first run downloads ~10 MB)…");
    return getPyodide().then(function (py) {
      onStatus("Running…");
      var out = [];
      py.setStdout({ batched: function (l) { out.push(l); } });
      py.setStderr({ batched: function (l) { out.push(l); } });
      var failed = null;
      try {
        py.runPython(code + "\n");
        if (tests) py.runPython(tests + "\n");
        out.push("ALL TESTS PASSED");
      } catch (e) {
        failed = String(e.message || e);
        out.push(failed);
      }
      return {
        ok: !failed && /ALL TESTS PASSED/.test(out.join("\n")),
        stdout: out.join("\n"), stderr: failed || "", code: failed ? 1 : 0
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
          stderr: "Judge unreachable (" + e + "). The public judge is rate-limited — wait a moment and retry."
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
        stderr: "No HDL runner connected. Verilog needs a simulator backend (Icarus/Verilator) — set PIT_CONFIG.runners.verilog in assets/js/config.js. Until then, paste the module into your local simulator or EDA Playground."
      });
    }
    onStatus("Sending to " + lang + " runner…");
    var headers = { "Content-Type": "application/json" };
    if (PIT_CONFIG.runnerKey) headers["X-Runner-Key"] = PIT_CONFIG.runnerKey;
    return fetchJson(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ language: lang, code: code, tests: tests || "" })
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

  window.PIT_RUNNER = { run: run };
})();
