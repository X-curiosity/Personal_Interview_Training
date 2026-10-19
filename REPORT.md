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

## 9. AI-trap problems (adversarial math set)

### What was added

Twelve problems, `math-301` through `math-312`, in a new math branch **AI Traps**. They replace 12 redundant computed variants (math-203/204, 207/208, 211/212, 215/216, 219/220, 223/224) so the math track stays at 36 and the database at exactly 400. Each trap maps to one of the requested adversarial categories:

| ID | Category | Trap mechanism | Correct answer |
|---|---|---|---|
| math-301 | Ambiguous wording | PP-attachment in "The man saw the boy with the telescope" — grammar admits two readings | `ambiguous` |
| math-302 | Hidden assumption | "How many months have 28 days?" — 'have' ≠ 'have exactly' | `12` |
| math-303 | Negation | "It is not the case that entry is not forbidden" — double negation unwrap | `no` |
| math-304 | Mixed alphabets | Two Cyrillic а (U+0430) impostors in `bаnanа` — glyph ≠ byte identity | `1` |
| math-305 | Contradictory instructions | "One word AND detailed explanation" — mutually exclusive requirements | `no` |
| math-306 | Adversarial numeric | 9.11 vs 9.9 — version-number intuition vs decimal value | `9.9` |
| math-307 | Out-of-distribution | Positional notation in base −2 (negabinary) | `−3` |
| math-308 | Long-context distraction | Irrelevant narrative buries "all but 9 run off" | `9` |
| math-309 | False premise | Atlantis's World Cup "dynasty" — fictional premise must not be accepted | `0` |
| math-310 | Prompt injection | Ticket text commands "reply HACKED"; the real task is 2 × $20 | `40` |
| math-311 | Exact counting | Letter 'r' count in "strawberry" — the classic tokenizer failure | `3` |
| math-312 | Confidence trap | Exact population with no data provided — fabrication vs honesty | `unknown` |

### How they work

Every problem is graded by the existing exact checker, which compares case-insensitively for word answers (`ambiguous`, `no`, `unknown`) and exactly for numerics. Each solution field does double duty: it gives the answer **and names the specific failure mode** (e.g., "models read whole words as tokens instead of letters"), so reviewing a solution teaches the meta-skill, not just the fact.

The traps resist AI assistance in different ways: ambiguity/false-premise/confidence problems punish confident hallucination; negation and contradiction problems punish shallow pattern-matching; the Unicode, counting, and negabinary problems punish token-level rather than character/exact reasoning; the injection problem punishes obedience to untrusted embedded text.

The string for math-304 is written to the pack with real Cyrillic characters via a generator script, guaranteeing the file itself contains U+0430 impostors rather than a description of them.

## 10. Screenshot deterrence (shield.js)

### What was added

`assets/js/shield.js` (loaded on all 7 pages) plus a `.shield-overlay` block in `style.css` — a full-screen opaque black layer with a pixel-styled "SCREEN PROTECTED" card.

### How it works

Four trigger classes, matching what real proctoring software does:

1. **`PrintScreen` keyup** (Windows/Linux) → 3-second blackout plus a best-effort clipboard wipe (`navigator.clipboard.writeText("")`, silently skipped if permission is denied) so a captured frame pastes as empty.
2. **`Cmd/Ctrl+Shift+3/4/5/S` keydown** → same blackout, for browsers that deliver the shortcut before the OS consumes it.
3. **`visibilitychange` (tab hidden)** → persistent veil until the tab is visible again.
4. **`window` blur** → persistent veil until focus returns — this is the practical defense against local AI overlay tools and screen-sharing pickers, which steal window focus when activated.

While veiled, `body.shielded` also blurs all content behind the overlay, and the current text selection is cleared. A timed flash dismisses on click or after 3 s; a focus veil only lifts on genuine `focus` + visible state.

### Honest limits (do not overclaim)

A web page **cannot** prevent OS-level screenshots. macOS and Windows consume their screenshot shortcuts at the compositor level before the page ever sees them; the OS can always copy the rendered frame; JavaScript can be disabled or DevTools used to remove the overlay; and a phone camera always works. This layer deters *casual local capture* — screen-grab hotkeys, clipboard pastes, focus-stealing AI assistants — it is **deterrence, not security**, and is documented as such rather than claimed as cheat-proof.

## 11. Verification

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

## 12. Deployment

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

## 13. Known limitations

- Judge0 is a third-party service with fair-use/rate limits unless self-hosted.
- The Pyodide runtime is loaded from a CDN on first Python execution.
- Votes, progress, and rivals are local to one browser.
- Seeded community counts are sample data.
- The included execution service is not, by itself, sufficient isolation for a hostile public multi-tenant judge.
- Some legacy RTL tasks provide compile/manual-review practice rather than a self-checking testbench; those tasks cannot auto-award completion.
- The screenshot shield is deterrence only: OS-level capture, disabled JavaScript, DevTools removal of the overlay, and photographing the screen all bypass it (see §10).
- The AI-trap problems resist *careless* AI use; a carefully prompted model with character-level tools can still solve several of them.
