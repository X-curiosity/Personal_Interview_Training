# Implementation Report — Personal Interview Training

This document explains exactly what was built, how each piece works, and the
reasoning behind the design decisions. Written by the coding assistant that
implemented the site.

---

## 1. What was asked vs. what was built

The original repo contained only a README describing *"a small project that
combines multiple tools (LeetCPU, LeetGPU, LeetSilicon, Project Euler) to
create a global platform that helps me navigate through my interest and do
some random puzzles when I'm bored."*

Through iterative requirements, the spec grew to:

| Requirement | Implementation |
|---|---|
| A real multi-page **website**, not a webapp | Static HTML/CSS/JS, 5 pages, no framework, no build step, GitHub-Pages-ready |
| UI **like LeetSilicon** | Dark LeetCode-style design: sidebar with categories, problem table (status / # / title / tags / difficulty / link), color-coded difficulties |
| **Selection page** to switch between challenges | `problems.html`: sidebar with 6 tracks and their sub-branches; table re-renders per selection |
| CPU programming **with sub-branches** | Track `cpu` with 5 branches: Branch Prediction, Cache Optimization, Memory Hierarchy, ILP & Pipelining, Prefetching |
| GPU programming | Track `gpu`: CUDA Basics, Memory Optimization, Parallel Algorithms, ML Kernels |
| Maths: Project Euler **and** Probability + quant-firm puzzles | Track `math` (11 real Project Euler problems with exact `problem=N` links) and track `quant` (15 firm-style puzzles tagged Jane Street / SIG / Optiver / Citadel) |
| **Leaderboard** weighted by difficulty | `leaderboard.html`: Easy = 1 pt, Medium = 3 pts, Hard = 5 pts; ties break on hards; live "You" row + manually added rivals |
| Frequent **interview questions** by company | Track `interview`: 15 classic questions tagged by company style (NVIDIA, AMD, Intel, Apple, Qualcomm, Jane Street, Citadel…) |
| **Community voting** on question accuracy | Accurate / Not-accurate vote buttons with percentage bar on every interview question and every pending submission |
| **AI agent** scraping the internet for new puzzles | `agent/scrape_agent.py` + weekly GitHub Action that files candidates as a GitHub issue |
| **Manual puzzle submission**, reviewed by admin + community | `submit.html`: form → pre-filled GitHub issue (admin review); review queue with community votes; admin merges into the dataset |
| This report | `REPORT.md` |

---

## 2. Architecture

### Why static (no backend)

The explicit ask was "a website, not a webapp". A static site means: zero
infrastructure, free hosting on GitHub Pages, and works offline. The
consequences:

- **State lives in `localStorage`** (`assets/js/store.js`), namespaced by key:
  - `pit.solved.v1` — array of solved problem ids
  - `pit.rivals.v1` — manually added leaderboard rivals
  - `pit.votes.v1.<namespace>` — votes per namespace (`interview`, `pending`)
- **"Community" features are local-first.** Displayed vote tallies =
  *seeded sample counts* (in the data files) + *your local vote*. This is
  disclosed on the About page. Swapping in a real backend later (Supabase /
  Firebase / a tiny API) only requires replacing the read/write functions in
  `store.js` — the UI already goes through that single abstraction.
- **"Admin review" = GitHub workflow.** Manual submissions open a pre-filled
  GitHub issue (`issues/new?title=…&body=…` with a ready-to-paste JS snippet);
  the admin merges by moving an entry from `assets/js/pending.js` into
  `assets/js/data.js`. The scout agent files its findings the same way.

### Data model

`assets/js/data.js` is the single source of truth:

```js
TRACKS = { cpu: { name, glyph, platform, home, blurb, branches: [...] }, ... }
TRACK_ORDER = ["cpu", "gpu", "silicon", "math", "quant", "interview"]
PROBLEMS = [ { id, track, branch, title, difficulty, tags[], summary, url, votes? } ]
```

Everything (sidebar, tables, cards, stats, random machine, leaderboard) is
derived from this at runtime — adding a problem is one object literal.
Counts shown on the home page cards are static text and must be updated with
the data (currently: 10 CPU, 12 GPU, 10 Silicon, 11 Math, 15 Quant, 15
Interview = **73 total**).

`assets/js/pending.js` mirrors the problem shape plus
`votes`, `submittedBy` (`"scout-agent"` or `"community"`), and `submittedAt`.

### Scoring

`POINTS = { easy: 1, medium: 3, hard: 5 }` in `store.js`.
`statsFor(problems, solvedSet)` computes solved counts per difficulty and
points; the leaderboard sorts by points → hards → total solved.

### The scout agent

`agent/scrape_agent.py` (stdlib only, no dependencies):

1. `fetch()` each source with a descriptive User-Agent and a timeout.
2. Per-source extractor functions parse links/titles with regexes
   (Jane Street archive, Project Euler archives, LeetGPU/LeetSilicon/LeetCPU —
   the latter three are JS-rendered, so extraction is best-effort and each
   source fails independently without killing the run).
3. `known_index()` reads `data.js` + `pending.js` and dedupes by URL and title.
4. Survivors are written to `agent/candidates.json` with
   `needs_review: true`, `submittedBy: "scout-agent"`.
5. `.github/workflows/scout.yml` runs it weekly (Mondays 08:00 UTC) and files
   the candidates as a GitHub issue via `gh issue create`.

`enrich()` is the marked extension point where an LLM step (e.g. via the pi
SDK) can later auto-write summaries, pick branches, and estimate difficulty.

**Verified live:** the agent ran against the real platforms during
implementation and found 9 genuinely new Project Euler candidates, correctly
skipping the ones already in the dataset.

---

## 3. Page-by-page

### `index.html`
Hero, "Your progress" stats strip (filled from `localStorage` via
`data-your-stats` widgets), six track cards, and the **random puzzle machine**
(`data-random-machine`): picks uniformly at random from all problems, avoids
immediate repeats, brief "dealing" flicker, links out to the source platform.

### `problems.html` — the selection page
- **Sidebar** (`data-track-list`) is generated from `TRACKS`: one entry per
  track with problem counts, expandable sub-branch links with counts.
- **Table**: status checkbox (round, LeetCode-style; persists via
  `toggleSolved`), row number, title (with one-line summary as tooltip),
  track·branch label, tag chips, color-coded difficulty, outbound link.
- **Interview rows** additionally render the vote widget
  (`▲ n | bar | % accurate | ▼ n`) under the title; voting toggles your vote,
  updates instantly, persists.
- **Toolbar**: live search (title/summary/branch/tags), difficulty chips
  (radio semantics via `aria-pressed`), and **"🎲 Roll one"** which picks a
  random problem *from the current filtered selection*, scrolls to it and
  flashes the row.
- Selection progress line: `n/m solved · X pts` for the current selection.

### `leaderboard.html`
Table: rank (🥇🥈🥉), name, total solved, per-difficulty counts, points.
"You" row highlighted and computed live from solves. Rivals are added via a
validated form (name required, counts clamped ≥ 0) and can be removed.
Scoring rules panel explains the weights and tie-breaking.

### `submit.html` — Contribute
Four-step pipeline explainer, submission form (title/URL required; builds a
pre-filled GitHub issue body including a ready-to-merge JS snippet; fallback
"Copy as JSON" button with clipboard + `prompt()` fallback), and the **review
queue** rendering `PENDING_PROBLEMS` with status pills (`🤖 scout agent` /
`✍ manual`) and community votes (namespace `pending`).

### `about.html`
Motivation, track descriptions, content pipeline, scoring, and privacy
statement (incl. disclosure that seeded vote counts are sample data).

---

## 4. Design system

`assets/css/style.css` — LeetCode/LeetSilicon-inspired dark theme:

- Palette: near-black background, orange accent (`#ffa116`), difficulty
  colors teal/yellow/red (`#00b8a3` / `#ffc01e` / `#ff375f`), one accent per
  track.
- Sticky blurred header, `aria-current` nav state, skip-link, visible
  `:focus-visible` outlines, `prefers-reduced-motion` support.
- Responsive: sidebar stacks above the table < 900 px; tag column hides
  < 640 px; buttons go full-width on mobile.
- All interactive widget markup is built with string templates in JS;
  problem content is author-controlled (static data files), so no user
  injection surface beyond the local forms.

## 5. Accessibility & robustness notes

- Semantic landmarks (`header/main/footer/nav`), labeled form fields,
  `aria-live` on the random-puzzle result, `aria-pressed` on toggles/chips.
- Every dynamic render guards against missing data; `localStorage` access is
  wrapped in try/catch (private mode degrades gracefully — progress just
  doesn't persist).
- External links use `rel="noopener"` and open in a new tab.

## 6. What was verified

- `node --check` passes on all 7 JS files.
- Dataset integrity script: 73 problems, no duplicate ids, every track/branch
  valid, every interview question has vote seeds.
- All 5 pages + CSS serve HTTP 200 from a local `http.server`.
- Scout agent executed for real against all 5 platforms (0 source errors,
  9 new candidates found, existing entries correctly deduped).
- A QA subagent team (UI / UX-flows / frontend) reviewed the running site.
  Findings and outcomes:
  - **P0 leaderboard crash** (`esc()` used but not defined) — **fixed**, then
    runtime-verified with a DOM/localStorage stub: renders, escapes a hostile
    rival name, scores and sorts correctly.
  - **P1 missing `.sr-only` utility** (visible "Remove" header text) — **fixed**.
  - **P1 mobile table header misalignment** (Tags `<th>` not hidden with its
    column) — **fixed** (`class="col-tags"` on the `<th>`).
  - **P1 track cards didn't preselect a track** (hash ignored) — **fixed**
    (`initFromHash` + `hashchange` listener).
  - P2 hardening also applied: rival counts clamped to 999, normalized counts
    used for points, name-required inline error, sidebar `aria-pressed`,
    roll-one `aria-live` announcement, "Five tracks"→"Six tracks" copy,
    JSON-snippet escaping, input focus outlines, `.form-row` mobile collapse,
    leaderboard column pruning on mobile, `.card-link` rule restored.
  - Deferred P2s (polish, documented): sidebar accordion on mobile, inline
    styles in a few templates.

## 7. Known limitations (honest list)

- **Community votes are per-browser** until a shared backend is connected;
  seeded counts are sample data (disclosed on the About page).
- **Rival leaderboard entries are manual** — there is no cross-device sync.
- LeetGPU/LeetSilicon/LeetCPU are JS-rendered; the scout agent's extraction
  there is best-effort (Jane Street and Project Euler parse fully).
- Deep links to specific LeetGPU challenges are only used where the slug is
  certain (vector-addition, matrix-multiplication, reduction); others link to
  the challenges index.
- Home-page problem counts on the track cards are static text — update them
  when `data.js` grows.
