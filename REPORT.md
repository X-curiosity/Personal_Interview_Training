# Implementation Report

## 1. Result

The repository began with a one-paragraph README. It now contains a complete multi-page interview-training website with a hard-capped **400-problem database**, on-platform problem statements, code/answer execution flows, timed role preparation, weighted progress, community review, and a deployable CUDA/Verilog runner.

The frontend remains a build-free static website. The optional execution service is isolated in `runner-service/`.

---

## 2. Requirements implemented

| Requirement | Implementation |
|---|---|
| Full website, not a single dashboard | Seven HTML pages with shared navigation, footer, responsive design, and direct URLs |
| LeetSilicon-style selection UI | Track/sub-branch sidebar, searchable problem table, difficulty filters, solved state, random filtered problem |
| Problems must appear on this platform | Every row opens `problem.html?id=<id>` with the complete local statement and interaction |
| Python support | Pyodide/WASM, lazily loaded and executed in-browser |
| C and C++ support | Judge0 CE adapter with compile/run output and tests; optional self-hosted Piston fallback |
| CUDA support | Editor plus configurable remote runner; deployable NVIDIA CUDA FastAPI service included |
| Verilog support | Editor plus the same runner service using Icarus Verilog |
| Non-coding questions | Numeric/text answer box with grading, or model-answer reveal for open-ended questions |
| Prepare for a role | Timed randomized sessions for five roles using medium/hard role-relevant questions |
| Large database | Exactly 400 validated problems, enforced by the validator |
| Weighted leaderboard | Easy 1, Medium 3, Hard 5; ties break on hard solves then total solves |
| Company interview questions | 60 company-style questions with model answers and community-accuracy seeds |
| Community/admin review | Voting widgets, pending queue, GitHub-issue submission workflow |
| Internet scouting | Weekly scout agent for candidate discovery; candidates replace entries because the cap is fixed |
| Internal documentation | `README.md`, this `REPORT.md`, code comments, runner-service README |

---

## 3. Final database

| Track | Count | Main content |
|---|---:|---|
| CPU Programming | 85 | Branch prediction, caches, memory hierarchy, ILP/pipelines, prefetching |
| GPU Programming | 75 | CUDA basics, memory optimization, parallel algorithms, ML kernels |
| Silicon & RTL | 75 | RTL design, verification, architecture, CDC/timing |
| Systems C/C++ | 32 | Bit manipulation, pointers/memory, data structures, concurrency/OS |
| Mathematics | 36 | Number theory, combinatorics/DP, sequences |
| Probability & Quant | 37 | EV, dice/coins, games, Markov/stopping, brainteasers |
| Interview Questions | 60 | Hardware, CPU, GPU/CUDA, quant/trading |
| **Total** | **400** | **136 code tasks (9 Python) + 264 answer/reveal tasks** |

The total is enforced in `tools/validate_data.js`; a full validation fails unless it is exactly 400. Future additions must replace or consolidate an existing entry.

### Data schema

`assets/js/data.js` defines `registerProblems()` and normalizes each pack entry to:

```js
{
  id, track, branch, title, difficulty, tags,
  summary, statement,
  kind: "answer" | "code",
  languages: ["python" | "c" | "cpp" | "cuda" | "verilog"],
  starter: {}, tests: {},
  answer, tolerance, solution, source, votes
}
```

Data is split across `assets/js/data/pack_*.js`. Every pack is a single `registerProblems([...])` call.

The 32 Systems C/C++ tasks were generated with a reference implementation and compiled under `-Wall -Wextra -Werror`; all reference test harnesses passed before the pack was written.

---

## 4. Frontend architecture

### Selection and progress

- `problems.html` + `assets/js/problems.js`
- Track/sub-branch sidebar generated from the registry
- Combined track, branch, difficulty, and text search filters
- Solved checkboxes persisted to `pit.solved.v1`
- Random selection respects current filters
- Deep links such as `problems.html#gpu`
- Internal problem links; external URLs are attribution only

### Problem page

- `problem.html` + `assets/js/problem.js`
- Full local statement, metadata, tags, difficulty, and language badges
- Previous/next navigation within the same track
- Code tasks receive language tabs, starter code, Run/Reset controls, status, and output console
- Answer tasks receive an input, Enter/check support, live feedback, and optional solution reveal
- Integer answers are exact even when decimal questions in the same pack use relative tolerance
- A successful answer/test run marks the problem solved

### Timed role preparation

- `interview.html` + `assets/js/interview.js`
- Roles: ML Engineer, CPU Architecture Engineer, GPU Engineer, RTL/Silicon Engineer, Quant Researcher
- Random medium/hard questions selected from matching tracks
- Unsolved questions preferred
- Countdown timer and low-time state
- Skip/next/end controls
- Debrief with solved count, weighted points, time used, and per-question review links

### Leaderboard and voting

`assets/js/store.js` is the only persistence boundary. It stores:

- `pit.solved.v1`
- `pit.rivals.v1`
- `pit.votes.v1.interview`
- `pit.votes.v1.pending`

Rival names are HTML-escaped before insertion. Rival counts are normalized and clamped. Community counts in static data are seed/demo values; a shared voting backend is not included.

---

## 5. Execution architecture

### Python

`assets/js/runner.js` lazily loads pinned Pyodide from jsDelivr. Code and tests run inside the browser. Standard output/error are captured and shown in the console.

### C / C++

The default adapter submits combined source + tests to Judge0 CE:

- C language id 50
- C++ language id 54
- `wait=true` synchronous response
- Compile output, stderr, runtime output, and status are normalized for the UI

A configurable self-hosted Piston URL can act as fallback. During implementation the former public Piston endpoint returned a whitelist-only notice, so Judge0 became the verified default.

### CUDA / Verilog

`assets/js/config.js` accepts runner URLs. `assets/js/runner.js` posts:

```json
{ "language": "cuda", "code": "...", "tests": "..." }
```

and expects:

```json
{ "stdout": "...", "stderr": "...", "code": 0 }
```

If no URL is configured, the UI clearly explains that a cloud GPU or HDL simulator must be connected; it does not pretend execution occurred.

The current 50 CUDA and 45 Verilog tasks do not ship per-problem automated testbenches. A successful remote compile/run is therefore reported as compile-only feedback and does **not** auto-mark the problem solved. Users can mark completion manually after reviewing output. This preserves grading integrity until isolated test harnesses are added.

### Runner service

`runner-service/` provides the contract:

- FastAPI `GET /health`, `POST /execute`
- CUDA: `nvcc -O2 -std=c++17`, then execute
- Verilog: `iverilog -g2012`, then `vvp`
- Optional `X-Runner-Key`
- CORS allow-list
- 128 KiB request limit
- Compile/run timeouts with safe upper bounds
- 64 KiB output limits
- Concurrency semaphore
- Per-request temporary directories
- Argument-array subprocess calls only; no `shell=True`
- Non-root CUDA Docker image and hardened Compose defaults

A single shared runner container is not strong public multi-tenant isolation. The included README recommends one per-submission Kubernetes Job with gVisor/Kata, network isolation, quotas, and external rate limiting.

A browser-embedded runner key is not secret; it is only suitable for private/internal deployment.

---

## 6. Content pipeline

### Manual submissions

`submit.html` turns a proposal into a pre-filled GitHub issue and can copy a normalized JS object. Pending entries live in `assets/js/pending.js`, display source/status metadata, and support local community voting.

### Scout agent

`agent/scrape_agent.py` uses only Python standard-library networking/parsing. It checks Jane Street, Project Euler, LeetGPU, LeetSilicon, and LeetCPU, deduplicates against current/pending content, and emits candidates. `.github/workflows/scout.yml` runs weekly and files an issue.

The 400 cap changes the policy: the agent proposes replacements; it must not append beyond 400.

---

## 7. Design and accessibility

`assets/css/style.css` provides:

- Dark LeetCode/LeetSilicon-inspired interface
- Track-specific accents and standard easy/medium/hard colors
- Responsive grids, stacked mobile layouts, horizontal table containment
- Mobile pruning for dense leaderboard/table columns
- Visible keyboard focus
- Screen-reader-only utility
- Skip links, semantic landmarks, labels, `aria-live`, and `aria-pressed`
- Reduced-motion support
- Editor, output, answer, solution, timer, and results states

---

## 8. Verification evidence

### Frontend/data

```text
npm test
packs: pack_cpu.js, pack_gpu.js, pack_interview.js,
       pack_math_quant_cap.js, pack_silicon.js, pack_systems_cap.js
total problems: 400
per track: {"cpu":85,"gpu":75,"interview":60,"math":36,
            "quant":37,"silicon":75,"systems":32}
dataset OK
runtime OK — 400 problems, 136 code tasks, 5 role pools
```

Runtime smoke tests cover:

- exact integer grading
- decimal tolerance
- answer/editor rendering
- starter code population
- role pool sufficiency
- weighted scoring
- every referenced local script existing
- valid track/branch registry

All seven pages and representative assets returned HTTP 200 from the local server.

### Runner service

Independent test run in a temporary Python environment:

```text
18 passed, 1 warning in 0.16s
```

Tests cover auth, CORS-related configuration, language validation, body limits, compile failure, compile/run timeouts, success, output truncation, safe argument arrays, compile commands, and test-source append behavior.

Judge0 C execution was tested against the live public endpoint and returned `ALL TESTS PASSED`.

Verilog was exercised with real local Icarus Verilog by the backend agent; the unit suite was independently rerun. CUDA was not hardware-tested because this machine has no NVIDIA GPU/nvcc.

### Final review team

Four read-only reviewers covered UI/UX, frontend runtime, data integrity, and backend security. Confirmed findings and outcomes:

- **P0:** systems-pack tags were strings and crashed the Problems table — fixed in source, normalized defensively in `data.js`, and asserted by validation/runtime tests.
- **P1:** CUDA/Verilog compile-only success could award a solve — fixed; no testbench means feedback only, never automatic credit.
- **P1:** Compose mounted `/tmp` as `noexec`, blocking CUDA binaries — fixed while retaining `nosuid,nodev`, read-only rootfs, dropped capabilities, and the documented public-isolation warning.
- Backend key comparison now uses constant-time `hmac.compare_digest`; runner HTTP error details are shown in the UI.
- Judge/runner network requests now have abort timeouts; Judge0 HTTP errors can trigger configured Piston fallback.
- Rendered dataset text is escaped; decimal-comma answers, skipped-session labels, and editor in-flight controls were improved.
- Nine tested Python problems were added without changing the 400 cap.
- The final data reviewer found 400 unique ids, titles, and statements; all numeric-answer tasks matched their solution text. Nine were subsequently converted into tested Python tasks, leaving 204 numeric-answer and 60 solution-only tasks. No final P0/P1 remained.
- UI/UX re-verification rendered all 400 table rows and exercised problem, interview, leaderboard, submission, voting, responsive, and accessibility flows. Its two final copy/navigation P2s were fixed.

---

## 9. Deployment

### Static website

```bash
python3 -m http.server 8000
```

It can be hosted on GitHub Pages, Netlify, Cloudflare Pages, or any static host.

### Runner

Follow `runner-service/README.md`. On a Linux GPU host with NVIDIA Container Toolkit:

```bash
cd runner-service
cp .env.example .env
# configure origin/key
docker compose up --build -d
```

Set both `cuda` and `verilog` URLs in `assets/js/config.js` to the deployed `/execute` endpoint.

---

## 10. Known limitations

- CUDA execution needs a deployed NVIDIA GPU runner; it cannot run on static hosting alone.
- CUDA/Verilog tasks currently provide compile/run feedback rather than automated correctness grading because per-problem testbenches are not yet included.
- Judge0 is a third-party service with fair-use/rate limits unless self-hosted.
- Community votes and the rival leaderboard are local per browser until a shared backend is added.
- The reference runner is not sufficient isolation for an untrusted public multi-tenant service without per-submission sandboxing.
- Seeded community vote counts are demonstration data.
