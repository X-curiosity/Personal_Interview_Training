# Personal Interview Training

![Personal Interview Training](docs/screenshot.png)

**Play with it live**

- <https://personal-interview-training.vercel.app>
- <https://x-curiosity.github.io/Personal_Interview_Training/>

A pixel art training platform with **514 interview problems**: CPU architecture, systems C/C++, silicon/RTL, mathematics, signal processing, quant puzzles, and real company interview questions. Solve everything directly on the site with Python, C, C++, or Verilog.

Create a free profile to sync progress across devices and join the global leaderboard. Solving is earned by correct submissions only; hard problems offer free hints, but viewing a solution forfeits credit for that problem. Twelve **project problems** (cache simulator, FIFO, arena allocator, arbiter, Karatsuba, Monte Carlo pricer and more) are multi-hour builds with full edge-case test suites.

## Run locally

```bash
cd Personal_Interview_Training
python3 -m http.server 8000
```

Open <http://localhost:8000>. Done. No build step, no dependencies.

## How to contribute

1. **Propose a problem** — use the [Contribute page](submit.html) on the site. It fills a pre formatted GitHub issue for review.
2. **Vote** — interview questions and pending submissions have accuracy votes; your votes decide what gets merged.
3. **Open a pull request** — problems live in `assets/js/data/pack_*.js`. Add yours to the right pack, then run:

```bash
npm install
npm test
```

A few ground rules keep the database clean:

- The total is capped at **exactly 514 problems** — a new one must replace a weaker entry, never inflate the count.
- Coding tasks need starter code and deterministic tests that print `ALL TESTS PASSED`.
- Answer tasks need a verified answer plus an explanatory solution.
- No GPU/CUDA content; the platform deliberately dropped that track.
- The test suite must pass before any merge.

## License

[MIT](LICENSE). Wikipedia links and Wikimedia images belong to their respective authors.
