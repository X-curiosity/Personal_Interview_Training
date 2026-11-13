/* ==========================================================================
   config.js — runtime configuration.
   Verilog needs a simulator, which a static site cannot ship. Point this URL
   at the included Icarus runner to enable it. Contract:

     POST <url>
     { "language": "verilog", "code": "...", "tests": "...", "dump": true }
     → 200 { "stdout": "...", "stderr": "...", "code": 0, "vcd": "<VCD text>" }

   When "dump" is true the runner injects $dumpfile/$dumpvars into the
   testbench and returns the value-change dump, which the site draws as a
   timing diagram (assets/js/wave.js).

   Leave null to show the "simulator not connected" guidance.
   ========================================================================== */

window.PIT_CONFIG = {
  runners: {
    verilog: null   // e.g. "https://your-runner.example.com/execute"
  },
  /* Optional X-Runner-Key header. A value in browser JS is NOT a secret;
     use it only for private/internal deployments. Public deployments should
     put authenticated API/rate-limit infrastructure in front of the runner. */
  runnerKey: null,
  /* Ask the Verilog runner for a VCD so waveforms can be drawn.
     Set false to save bandwidth on a slow connection. */
  waveforms: true,
  /* Judge0 CE public judge for C/C++ (no key; fair-use rate limits).
     Language ids: 50 = C (GCC), 54 = C++ (GCC). */
  judge0Url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
  /* Browser-side network timeout; exceeds the runner compile+run budget. */
  requestTimeoutMs: 90000,
  /* Optional self-hosted fallback (Piston), used if Judge0 is unreachable:
     e.g. "https://your-piston.example.com/api/v2/execute" — null = disabled. */
  pistonUrl: null,
  /* Pyodide (Python in WASM) CDN — lazy-loaded on first Run. */
  pyodideUrl: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
};
