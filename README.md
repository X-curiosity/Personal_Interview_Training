# Personal Interview Training

**Live sites**

- Vercel (production): <https://personal-interview-training.vercel.app>
- GitHub Pages (mirror): <https://x-curiosity.github.io/Personal_Interview_Training/>

Both deploy automatically on every push to `main` (Vercel git integration + the Pages workflow in `.github/workflows/pages.yml`, which validates the database before publishing).

A multi page interview training website with a pixel art retro game UI, focused on CPU architecture, systems C/C++, silicon/RTL, mathematics (including signal processing), probability/quant, and company style interview questions.

Every problem has a local statement and is solved on platform. External links are attribution or further reading only.

## Problem database

The database is capped at exactly **502 problems** (enforced by `tools/validate_data.js`).

| Track | Problems |
|---|---:|
| CPU Programming | 143 |
| Silicon & RTL | 132 |
| Systems C/C++ | 50 |
| Mathematics (incl. Signal Processing) | 54 |
| Probability & Quant | 53 |
| Interview Questions | 70 |
| **Total** | **502** |

There are **159 coding tasks** across Python, C, C++, and Verilog, and **343 answer/model solution tasks**. The math track includes a **Signal Processing** branch (Nyquist, aliasing, DFT, quantization, decimation) and an **AI Traps** branch. The platform intentionally contains no GPU track or GPU programming problems.

## Features

- Pixel art / 8 bit retro game interface: chunky pixel outlines, hard shadows, NES palette, Press Start 2P and Silkscreen fonts, game style mock interview HUD.
- Searchable/filterable 502 problem table with persisted solve status and collapsible track branches.
- Local problem pages with full statements, previous/next navigation, source attribution, Wikipedia **further reading** links on 96 problems, and illustrations on selected problems.
- **Solved status is earned, never ticked**: only a verified correct submission (answer check or passing tests) marks a problem solved.
- Editors for Python, C, C++, and Verilog.
- Exact/tolerant answer checking and model solution reveal.
- Timed role preparation for ML Engineer, CPU Architecture Engineer, RTL / Silicon Engineer, and Quant Researcher.
- **AI trap problems**: 12 adversarial math problems (ambiguity, false premises, negation, Unicode impostors, prompt injection, counting traps) that punish careless AI assisted solving.
- **Screenshot deterrence**: blackout on PrintScreen/screenshot shortcuts and an automatic veil when the window loses focus (best effort; see Known limitations in `REPORT.md`).
- Weighted scoring: easy 1, medium 3, hard 5.
- Local rival leaderboard, community voting, submission review queue, and weekly scout workflow.
- Browser local progress using `localStorage`.

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

A browser side runner key is not a secret. Public deployments need real authentication, rate limiting, and per submission isolation in front of the runner.

Verilog problems with a self checking testbench earn automatic credit when the bench passes. Compile only success is feedback, not proof, and never marks a problem solved.

## Hosting

- **Vercel**: the repo is linked to the `personal-interview-training` project; every push to `main` auto deploys to production. `vercel.json` provides zero config static hosting.
- **GitHub Pages**: `.github/workflows/pages.yml` runs `tools/validate_data.js` on every push, then publishes via `actions/deploy-pages`. Enable under repo Settings → Pages → Source: GitHub Actions.
- **Verilog runner** (optional): deploy `runner-service/` on Render via `runner-service/render.yaml` or anywhere with Docker, then point `PIT_CONFIG.runners.verilog` at it.

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

The validator checks schema, unique IDs, track/branch consistency, starter code, test harnesses, role references, image/reference shapes, forbidden removed track content, and the exact 502 problem cap. Every C/C++/Python coding task is shipped with tests verified against a reference implementation; every Verilog testbench is X strict (an empty starter provably fails, a correct module provably passes).

Runner service tests:

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
├── vercel.json                     # static hosting config
├── assets/
│   ├── css/style.css               # pixel art theme
│   └── js/
│       ├── data.js                 # track/role registry and normalization
│       ├── data/pack_*.js          # exactly 502 problems
│       ├── problem.js, runner.js   # solving UI and execution adapters
│       ├── interview.js            # timed role sessions
│       ├── shield.js               # screenshot deterrence
│       └── store.js                # local progress/votes/rivals
├── runner-service/                 # FastAPI + Icarus Verilog
├── tools/                          # data and runtime validators
├── agent/scrape_agent.py           # source discovery
└── REPORT.md                       # implementation and QA report
```

## Privacy and persistence

Progress, votes, and rivals remain in browser `localStorage`. Python executes locally. C/C++ is sent to the configured judge only when Run is pressed. Verilog is sent only when a simulator endpoint is configured. No account, analytics, or tracking cookie is required.

## License and attribution

This repository is licensed under the [MIT License](LICENSE). External source links identify inspiration/reference platforms; linked third party content remains subject to its respective terms. Wikipedia further reading links and Wikimedia illustrations belong to their respective authors and licenses.
