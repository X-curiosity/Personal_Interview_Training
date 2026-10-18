/* ==========================================================================
   pending.js — puzzles awaiting review (the review queue).
   Two sources:
     • submittedBy: "scout-agent"  → found by agent/scrape_agent.py
     • submittedBy: a name/handle  → manual submission via submit.html
   Admin review = moving an approved entry from here into data.js (PROBLEMS).
   Community review = the accurate / not-accurate votes shown on submit.html.
   ========================================================================== */

const PENDING_PROBLEMS = [
  {
    id: "pend-01",
    track: "quant",
    branch: "Brainteasers",
    title: "Jane Street's Puzzle of the Month (latest)",
    difficulty: "hard",
    tags: ["monthly", "agent-found"],
    summary: "Flagged by the scout agent: Jane Street published a new monthly puzzle. Review and slot it into the right branch.",
    url: "https://www.janestreet.com/puzzles/archive/",
    votes: { up: 6, down: 1 },
    submittedBy: "scout-agent",
    submittedAt: "2025-10-12"
  },
  {
    id: "pend-03",
    track: "interview",
    branch: "Quant & Trading",
    title: "Estimating Pi with Options ( rumored SIG question )",
    difficulty: "medium",
    tags: ["estimation", "manual-submission", "needs-source"],
    summary: "Manual submission, source unverified: price an option whose payoff encodes a Monte-Carlo pi estimate. Community vote decides if it's real.",
    url: "https://www.quantguide.io/",
    votes: { up: 2, down: 4 },
    submittedBy: "community",
    submittedAt: "2025-10-17"
  }
];

Object.freeze(PENDING_PROBLEMS);
PENDING_PROBLEMS.forEach(Object.freeze);
