# Personal Interview Training

A multi-page interview-training website combining CPU architecture, GPU programming, RTL design, systems C/C++, mathematics, probability/quant, and company-style interview questions in one place.

The problems live **on this website**. Coding problems open in an editor with test execution; non-coding problems use an answer box or model-answer reveal. A timed **Prepare for the Role** mode builds randomized medium/hard mock interviews.

## Database

The database is intentionally capped at **400 problems**.

| Track | Problems |
|---|---:|
| CPU Programming | 85 |
| GPU Programming | 75 |
| Silicon & RTL | 75 |
| Systems C/C++ | 32 |
| Mathematics | 36 |
| Probability & Quant | 37 |
| Interview Questions | 60 |
| **Total** | **400** |

Of these, **136 are code tasks** (including 9 Python tasks) and **264 use answer checking or solution reveal**.

## Main features

- LeetSilicon/LeetCode-style selection page with tracks, sub-branches, search, difficulty filters, solve status, and random selection.
- Individual `problem.html?id=...` pages with the full problem statement on-platform.
- Editors and execution support for Python, C, C++, CUDA, and Verilog.
- Numeric/text answer checking with exact integer grading and configurable decimal tolerance.
- Model-answer reveal for open-ended interview questions.
- Timed role preparation for:
  - ML Engineer
  - CPU Architecture Engineer
  - GPU Engineer
  - RTL / Silicon Engineer
  - Quant Researcher
- Weighted leaderboard: Easy = 1 point, Medium = 3, Hard = 5.
- Community accuracy voting for company-style questions and pending submissions.
- Manual puzzle submission and admin/community review queue.
- Weekly scout agent for finding new candidates. Because the database is capped at 400, candidates must replace weaker entries rather than increase the total.

## Code execution

| Language | Execution path |
|---|---|
| Python | Pyodide/WASM, loaded lazily and run in the browser |
| C / C++ | Judge0 CE by default; optional self-hosted Piston fallback |
| CUDA | The included `runner-service`, deployed on an NVIDIA GPU host; current tasks are compile/run practice without automatic testbenches |
| Verilog | The included `runner-service`, using Icarus Verilog; current tasks are compile/run practice without automatic testbenches |

Configure external runners in `assets/js/config.js`:

```js
window.PIT_CONFIG = {
  runners: {
    cuda: "https://runner.example.com/execute",
    verilog: "https://runner.example.com/execute"
  },
  runnerKey: null,
  judge0Url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
  pistonUrl: null,
  pyodideUrl: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
};
```

A browser-side runner key is not secret. Public deployments should put proper authentication, rate limiting, and isolation in front of the execution service.

CUDA/Verilog tasks currently do not include per-problem automated testbenches. Successful compilation is shown as feedback but **does not automatically mark a problem solved**; users may mark it manually after reviewing their output. This prevents compile-only submissions from receiving false credit.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home, progress, seven tracks, random problem |
| `problems.html` | Track/sub-branch selection and searchable problem table |
| `problem.html?id=...` | Full statement, editor or answer box, previous/next navigation |
| `interview.html` | Timed role-based mock interviews |
| `leaderboard.html` | Weighted local leaderboard and rivals |
| `submit.html` | Manual submissions and community review queue |
| `about.html` | Product explanation, execution/privacy notes |

## Run locally

No build step is required for the website:

```bash
make serve
# http://localhost:8000
```

Or:

```bash
python3 -m http.server 8000
```

## Validate and test

The website remains build-free; npm is used only for the test dependency (`jsdom`).

```bash
npm install
npm test
```

This runs:

- `tools/validate_data.js` — schema, unique IDs, valid tracks/branches, code starters/tests, role references, and the exact 400-problem cap.
- `tools/test_runtime.js` — answer grading, editor/answer rendering, local scoring, role pool sizes, script references, and registry integrity.

## CUDA / Verilog runner

See [`runner-service/README.md`](runner-service/README.md).

Quick development setup:

```bash
cd runner-service
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=. pytest -q
```

Deployment uses the provided NVIDIA CUDA Dockerfile and Compose configuration. The reference runner is appropriate for private/internal use. A public multi-tenant deployment should use one isolated job/container per submission with gVisor or Kata Containers.

## Repository layout

```text
├── index.html / problems.html / problem.html / interview.html
├── leaderboard.html / submit.html / about.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── data.js                 # schema, tracks, roles, registry
│       ├── data/pack_*.js          # 400-problem database
│       ├── problem.js              # answer/editor renderer
│       ├── runner.js               # execution adapters
│       ├── interview.js            # timed role sessions
│       ├── problems.js             # selection page
│       ├── store.js                # local progress/votes/leaderboard
│       └── config.js               # judge/runner configuration
├── runner-service/                 # FastAPI CUDA + Verilog runner
├── agent/scrape_agent.py           # candidate discovery agent
├── tools/validate_data.js
├── tools/test_runtime.js
└── REPORT.md                       # full implementation report
```

## Privacy

Progress, votes, and leaderboard data use browser `localStorage`. Python runs locally in the browser. C/C++ source is sent to Judge0 when Run is pressed. CUDA and Verilog source is sent only to the runner URLs you configure.
