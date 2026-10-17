# Personal_Interview_Training

A small project that combines multiple tools ([LeetCPU](https://www.leetcpu.com/), [LeetGPU](https://leetgpu.com/challenges), [LeetSilicon](https://leetsilicon.com/), [Project Euler](https://projecteuler.net/archives)) to create a global platform that helps me navigate through my interest and do some random puzzles when I'm bored.

Now also: quant-firm puzzles (Jane Street / SIG / Optiver / Citadel style), community-voted interview questions, a weighted leaderboard, and a scout agent that finds new puzzles.

## What it is

A **static website** — plain HTML/CSS/JS, no build step, no framework, no accounts.
Open `index.html` or serve the folder; deploy by pushing to GitHub Pages.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Pages

| Page | What |
|---|---|
| `index.html` | Hero, your live stats, the six training tracks, random-puzzle machine |
| `problems.html` | **Selection page** — LeetCode/LeetSilicon-style sidebar (tracks + sub-branches), problem table, search, difficulty filters, solve tracking |
| `leaderboard.html` | Weighted leaderboard (Easy 1 / Medium 3 / Hard 5 pts) — your row is live, add rivals to compete |
| `submit.html` | Contribute: submit-a-puzzle form (opens a GitHub issue) + review queue with community voting |
| `about.html` | Why it exists, tracks, scoring, privacy |

## Features

- **73 problems / 6 tracks**: CPU (branch prediction, caches, memory hierarchy, ILP, prefetching), GPU (CUDA basics → ML kernels), Silicon/RTL, Mathematics (Project Euler), Probability & Quant, and frequently-asked **interview questions** tagged by company style.
- **Progress tracking** — check off solves; persisted in `localStorage`.
- **Community accuracy voting** — interview questions and pending submissions carry accurate / not-accurate votes (local persistence; seeded counts are sample data until a backend is added).
- **Scout agent** — `agent/scrape_agent.py` scrapes the source platforms weekly (GitHub Actions cron), dedupes against the dataset, and files new candidates as a GitHub issue. Admin reviews → community votes → merged.
- **Privacy** — everything client-side; nothing leaves the browser.

## Repo layout

```
├── index.html / problems.html / leaderboard.html / submit.html / about.html
├── assets/
│   ├── css/style.css        # design system (LeetCode-style dark UI)
│   └── js/
│       ├── data.js          # all tracks + problems (source of truth)
│       ├── pending.js       # review queue (awaiting admin merge)
│       ├── store.js         # localStorage: solves, points, votes, rivals
│       ├── main.js          # random machine, stats widgets
│       ├── problems.js      # selection page logic
│       ├── leaderboard.js   # leaderboard logic
│       └── submit.js        # contribution form + review queue
├── agent/
│   └── scrape_agent.py      # scout agent (stdlib only)
└── .github/workflows/scout.yml  # weekly agent run → files an issue
```

## Contributing a puzzle

Use the [Contribute page](submit.html) (opens a pre-filled GitHub issue), or add an
entry to `assets/js/data.js` directly and open a PR. See `REPORT.md` for the full
implementation write-up.
