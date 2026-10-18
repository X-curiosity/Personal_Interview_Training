# Implementation Report

## 1. Result

The repository contains a complete multi-page interview-training platform with exactly **400 on-platform problems**, role-based mock interviews, weighted progress, community review, and code execution for Python, C, C++, and Verilog.

The former GPU/CUDA track and its interview material were removed at the user's request. They were replaced one-for-one by **38 CPU problems, 37 LeetSilicon-style problems, and 16 CPU/RTL interview questions**, preserving the 400 cap while focusing the platform on the remaining domains.

## 2. Database

| Track | Count | Main coverage |
|---|---:|---|
| CPU Programming | 123 | branch prediction, caches, hierarchy, ILP/pipelining, prefetching |
| Silicon & RTL | 112 | RTL design, verification, architecture, CDC/timing |
| Systems C/C++ | 32 | bits, memory, data structures, concurrency/OS |
| Mathematics | 36 | number theory, combinatorics/DP, sequences |
| Probability & Quant | 37 | expected value, games, stopping, brainteasers |
| Interview Questions | 60 | hardware/RTL, CPU architecture, quant/trading |
| **Total** | **400** | **121 code + 279 answer/model-solution tasks** |

The registry in `assets/js/data.js` normalizes every item. `tools/validate_data.js` rejects duplicate IDs, unknown tracks/branches/languages, malformed tags, missing statements, incomplete coding metadata, invalid answer tasks, and any total other than 400. Runtime tests also assert that the removed track and language cannot return.

## 3. Website architecture

The product is intentionally multi-page:

- `index.html` — overview, progress, tracks, random problem
- `problems.html` — searchable/filterable table and community voting
- `problem.html?id=...` — statement, answer/editor interface, navigation
- `interview.html` — timed role sessions and scored review
- `leaderboard.html` — weighted local rivals
- `submit.html` — contribution workflow and review queue
- `about.html` — product, execution, privacy, and sourcing explanation

All pages load the same normalized registry and use plain HTML, CSS, and classic JavaScript. There is no frontend build requirement.

## 4. Solving and grading

### Answer tasks

- Exact integers require exact equality.
- Decimal problems use the tolerance configured by the problem.
- Decimal commas are accepted without breaking standard thousands separators.
- Conceptual questions reveal a model solution rather than pretending to have a unique short answer.

### Coding tasks

- **Python:** lazy-loaded Pyodide/WASM in the browser.
- **C/C++:** Judge0 CE, with optional configured Piston fallback.
- **Verilog:** the included FastAPI/Icarus service.

Network calls have abort timeouts. HTTP-level Judge0 failures enter fallback/error handling rather than being treated as judge responses. Language tabs and reset controls are disabled while an execution is active, preventing stale runs from repainting another editor state.

A code problem earns completion only when its tests pass. For Verilog entries without a testbench, successful compilation is neutral feedback and never automatic credit. The new RTL replacement set includes 15 deterministic self-checking testbenches.

## 5. Role preparation

Timed medium/hard sessions are available for four roles:

| Role | Source tracks |
|---|---|
| ML Engineer | systems, mathematics, quant |
| CPU Architecture Engineer | CPU, systems, mathematics |
| RTL / Silicon Engineer | silicon, interview |
| Quant Researcher | quant, mathematics |

Sessions prefer unsolved questions, show timer and position, support skip/next/end-early actions, and finish with weighted points and separate solved/skipped/incorrect review states.

## 6. Progress, leaderboard, and review

`assets/js/store.js` persists solved IDs, votes, and rivals in browser `localStorage`.

- easy = 1 point
- medium = 3 points
- hard = 5 points
- ties break on hard-problem count, then medium count

Interview-question and pending-submission votes can be cast and retracted. Seeded vote totals are demonstration data until a shared backend is added. Manual submissions generate a copyable registry snippet and pre-filled GitHub issue URL. The weekly scout checks Jane Street, Project Euler, LeetSilicon, and LeetCPU sources.

## 7. Verilog service

`runner-service/` implements:

```json
POST /execute
{"language":"verilog","code":"...","tests":"..."}
```

Execution flow:

```text
write main.v in a fresh temporary directory
  → iverilog -g2012 -o sim main.v
  → vvp sim
  → return stdout/stderr/code
  → delete temporary directory
```

Safety measures include:

- optional constant-time API-key checking;
- CORS allow-list;
- bounded body and output sizes;
- compile/run timeouts;
- safe argument-array subprocess calls without a shell;
- bounded concurrency;
- non-root container;
- read-only root filesystem, `noexec` temporary storage, dropped capabilities, `no-new-privileges`, and PID limits.

This is appropriate for private/internal use. A public untrusted service still requires authentication, rate limiting, and a separate sandbox/job or microVM for every submission.

The service now uses a standard Python slim image and needs no specialized hardware.

## 8. Accessibility and responsive behavior

Implemented details include semantic landmarks, skip links, labeled controls, table headers, visible `:focus-visible` states, `aria-live` status regions, `aria-pressed` state, reduced-motion handling, responsive grids, mobile column pruning, and horizontally contained tables/editors.

Dynamic dataset fields rendered through HTML templates are escaped. User-provided contribution values are escaped in generated JavaScript snippets.

## 9. Verification

Expected frontend/data result:

```text
total problems: 400
per track: {"cpu":123,"interview":60,"math":36,"quant":37,"silicon":112,"systems":32}
dataset OK
runtime OK — 400 problems, 121 code tasks, 4 role pools
```

The release gate includes:

- `npm test`
- JavaScript syntax checks
- schema/ID/title/statement validation
- role-pool sufficiency
- exact/tolerant grading smoke tests
- referenced-script existence checks
- C/C++ replacement starter/test compilation
- Verilog testbench compilation/execution checks where supported
- runner-service pytest suite
- Docker Compose configuration validation
- representative HTTP page/problem checks
- stale-reference and secret-pattern scans

## 10. Deployment

Frontend:

```bash
python3 -m http.server 8000
```

Runner:

```bash
cd runner-service
cp .env.example .env
# Configure ALLOWED_ORIGINS and RUNNER_API_KEY.
docker compose up --build -d
```

Then set `PIT_CONFIG.runners.verilog` in `assets/js/config.js` to the deployed `/execute` URL.

## 11. Known limitations

- Judge0 is a third-party service with fair-use/rate limits unless self-hosted.
- The Pyodide runtime is loaded from a CDN on first Python execution.
- Votes, progress, and rivals are local to one browser.
- Seeded community counts are sample data.
- The included execution service is not, by itself, sufficient isolation for a hostile public multi-tenant judge.
- Some legacy RTL tasks provide compile/manual-review practice rather than a self-checking testbench; those tasks cannot auto-award completion.
