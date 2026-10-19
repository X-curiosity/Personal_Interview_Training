# Personal Interview Training

**Live site: <https://personal-interview-training.vercel.app>**

A multi-page interview-training website focused on CPU architecture, systems C/C++, silicon/RTL, mathematics, probability/quant, and company-style interview questions.

Every problem has a local statement and is solved on-platform. External links are attribution only.

## Problem database

The database is capped at exactly **502 problems**.

| Track | Problems |
|---|---:|
| CPU Programming | 143 |
| Silicon & RTL | 132 |
| Systems C/C++ | 50 |
| Mathematics (incl. Signal Processing) | 54 |
| Probability & Quant | 53 |
| Interview Questions | 70 |
| **Total** | **502** |

There are **159 coding tasks** across Python, C, C++, and Verilog, and **343 answer/model-solution tasks**. The math track includes a **Signal Processing** branch (Nyquist, aliasing, DFT, quantization, decimation) and an **AI Traps** branch. The platform intentionally contains no GPU track or GPU programming problems.

## Features

- Multi-page LeetCode-style interface rather than a single-page app.
- Searchable/filterable 400-problem table with persisted solve status.
- Local problem pages with full statements, previous/next navigation, and source attribution.
- Editors for Python, C, C++, and Verilog.
- Exact/tolerant answer checking and model-solution reveal.
- Timed role preparation for:
  - ML Engineer
  - CPU Architecture Engineer
  - RTL / Silicon Engineer
  - Quant Researcher
- **AI-trap problems** — 12 adversarial math problems (ambiguity, false premises, negation, Unicode impostors, prompt injection, counting traps) that punish careless AI-assisted solving.
- **Screenshot deterrence** — blackout on PrintScreen/screenshot shortcuts and an automatic veil when the window loses focus (best-effort; see Known Limits in `REPORT.md`).
- Weighted scoring: easy 1, medium 3, hard 5.
- Local rival leaderboard, community voting, submission review queue, and weekly scout workflow.
- Browser-local progress using `localStorage`.

## Code execution

| Language | Execution path |
|---|---|
| Python | Pyodide/WASM in the browser |
| C / C++ | Judge0 CE; optional Piston fallback |
| Verilog | Included FastAPI/Icarus service configured in `assets/js/config.js` |

Configure the Verilog endpoint:

```js
window.PIT_CONFIG = {
  runners: {
    verilog: "https://runner.example.com/execute"
  },
  runnerKey: null,
  judge0Url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
  requestTimeoutMs: 90000,
  pistonUrl: null,
  pyodideUrl: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
};
```

A browser-side runner key is not a secret. Public deployments need real authentication, rate limiting, and per-submission isolation in front of the runner.

Verilog problems with a self-checking testbench can earn automatic credit. Compile-only success is feedback—not proof—and never marks a problem solved automatically.

## Hosting

The static frontend is deployed on Vercel (`vercel deploy --prod` from the repo root, or the GitHub Pages workflow in `.github/workflows/pages.yml`). The optional Verilog runner deploys on Render via `runner-service/render.yaml`; point `PIT_CONFIG.runners.verilog` in `assets/js/config.js` at it.

## Run locally

No frontend build step is required:

```bash
cd Personal_Interview_Training
python3 -m http.server 8000
```

Open <http://localhost:8000>.

Do not open the HTML through `file://`; Pyodide, module assets, and browser security policies expect HTTP.

## Verification

Install the test dependency and run frontend/data checks:

```bash
npm install
npm test
```

Run all root checks:

```bash
make test
```

The validator checks schema, unique IDs, track/branch consistency, starter code, test harnesses, role references, forbidden removed-track content, and the exact 400-problem cap.

Runner-service tests:

```bash
cd runner-service
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt -r requirements-dev.txt
.venv/bin/python -m pytest -q
```

## Verilog runner

The optional service exposes:

```json
POST /execute
{"language":"verilog","code":"...","tests":"..."}
```

and returns:

```json
{"stdout":"...","stderr":"...","code":0}
```

Deploy it on an ordinary CPU host:

```bash
cd runner-service
cp .env.example .env
# Edit origin/key settings.
docker compose up --build -d
```

See [`runner-service/README.md`](runner-service/README.md) for the execution contract and security boundary.

## Repository map

```text
.
├── index.html, problems.html, problem.html
├── interview.html, leaderboard.html, submit.html, about.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── data.js                 # track/role registry and normalization
│       ├── data/pack_*.js          # exactly 400 problems
│       ├── problem.js, runner.js   # solving UI and execution adapters
│       ├── interview.js            # timed role sessions
│       └── store.js                # local progress/votes/rivals
├── runner-service/                 # FastAPI + Icarus Verilog
├── tools/                          # data and runtime validators
├── agent/scrape_agent.py           # source discovery
└── REPORT.md                       # implementation and QA report
```

## Privacy and persistence

Progress, votes, and rivals remain in browser `localStorage`. Python executes locally. C/C++ is sent to the configured judge only when Run is pressed. Verilog is sent only when a simulator endpoint is configured. No account, analytics, or tracking cookie is required.

## License and attribution

This repository is licensed under the [MIT License](LICENSE). External source links identify inspiration/reference platforms; linked third-party content remains subject to its respective terms.
