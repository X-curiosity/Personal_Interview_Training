#!/usr/bin/env python3
"""Scout agent for Personal Interview Training.

Scrapes the source platforms (Jane Street puzzles, Project Euler archives,
LeetGPU challenges, LeetSilicon problems, LeetCPU) for published problems,
deduplicates them against the site's dataset (assets/js/data.js +
assets/js/pending.js), and writes new candidates to agent/candidates.json.

Stdlib only — no dependencies. Network failures on one source never kill
the run; each source degrades independently.

Usage:
    python3 agent/scrape_agent.py            # writes agent/candidates.json
    python3 agent/scrape_agent.py --stdout   # prints candidates instead

Review flow: the admin reads candidates.json (or the GitHub issue filed by
the weekly Actions workflow), then moves approved entries into
assets/js/pending.js (community vote) or directly into assets/js/data.js.

Extension point: `enrich()` is where an LLM step (e.g. via the pi SDK)
could summarize/tag each candidate automatically.
"""

import argparse
import html
import json
import os
import re
import sys
import urllib.request
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
USER_AGENT = "pit-scout-agent/1.0 (+https://github.com/X-curiosity/Personal_Interview_Training)"
TIMEOUT = 20


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read().decode("utf-8", errors="replace")


def known_index():
    """Titles and URLs already in the dataset, for deduplication."""
    idx = {"titles": set(), "urls": set()}
    for rel in ("assets/js/data.js", "assets/js/pending.js"):
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            continue
        src = open(path, encoding="utf-8").read()
        idx["titles"].update(t.lower() for t in re.findall(r'title:\s*"([^"]+)"', src))
        idx["urls"].update(re.findall(r'url:\s*"([^"]+)"', src))
    return idx


def clean(text):
    return html.unescape(re.sub(r"\s+", " ", text)).strip()


# ---------------------------------------------------------------- sources

def scout_jane_street():
    """Latest puzzles from Jane Street's puzzle archive."""
    src = fetch("https://www.janestreet.com/puzzles/archive/")
    items = []
    for m in re.finditer(r'href="(/puzzles/[^"]+/index\.html)"[^>]*>([^<]{4,120})<', src):
        slug, title = m.group(1), clean(m.group(2))
        items.append({
            "track": "quant", "branch": "Brainteasers",
            "title": title,
            "url": "https://www.janestreet.com" + slug,
        })
    # Deduplicate within source while preserving order
    seen, out = set(), []
    for it in items:
        if it["url"] not in seen:
            seen.add(it["url"])
            out.append(it)
    return out


def scout_project_euler():
    """Most recent problems from the Project Euler archives page."""
    src = fetch("https://projecteuler.net/archives")
    items = []
    for m in re.finditer(r'href="problem=(\d+)"[^>]*>([^<]{4,120})<', src):
        num, title = m.group(1), clean(m.group(2))
        items.append({
            "track": "math", "branch": "Number Theory",
            "title": "Euler #%s: %s" % (num, title),
            "url": "https://projecteuler.net/problem=" + num,
        })
    return items[-10:]  # the tail of the list = newest problems


def scout_leetgpu():
    """Challenge links exposed by leetgpu.com (JS-rendered; best effort)."""
    src = fetch("https://leetgpu.com/challenges")
    items = []
    for m in re.finditer(r'href="(/challenges/[a-z0-9-]+)"', src):
        slug = m.group(1).rsplit("/", 1)[-1]
        title = clean(slug.replace("-", " ")).title()
        items.append({
            "track": "gpu", "branch": "CUDA Basics",
            "title": title,
            "url": "https://leetgpu.com/challenges/" + slug,
        })
    seen, out = set(), []
    for it in items:
        if it["url"] not in seen:
            seen.add(it["url"])
            out.append(it)
    return out


def scout_leetsilicon():
    """Problem links exposed by leetsilicon.com (JS-rendered; best effort)."""
    src = fetch("https://leetsilicon.com/problems")
    items = []
    for m in re.finditer(r'href="(/problems/[a-z0-9-]+)"', src):
        slug = m.group(1).rsplit("/", 1)[-1]
        title = clean(slug.replace("-", " ")).title()
        items.append({
            "track": "silicon", "branch": "RTL Design",
            "title": title,
            "url": "https://leetsilicon.com/problems/" + slug,
        })
    seen, out = set(), []
    for it in items:
        if it["url"] not in seen:
            seen.add(it["url"])
            out.append(it)
    return out


def scout_leetcpu():
    """Problem links exposed by leetcpu.com (best effort)."""
    src = fetch("https://www.leetcpu.com/")
    items = []
    for m in re.finditer(r'href="(/(?:problems|challenges)/[a-z0-9-]+)"', src):
        slug = m.group(1).rsplit("/", 1)[-1]
        title = clean(slug.replace("-", " ")).title()
        items.append({
            "track": "cpu", "branch": "Cache Optimization",
            "title": title,
            "url": "https://www.leetcpu.com" + m.group(1),
        })
    return items


SOURCES = [
    ("janestreet", scout_jane_street),
    ("projecteuler", scout_project_euler),
    ("leetgpu", scout_leetgpu),
    ("leetsilicon", scout_leetsilicon),
    ("leetcpu", scout_leetcpu),
]


def enrich(candidate):
    """Extension point: plug an LLM here to write summaries, pick the right
    branch, and estimate difficulty. Until then, mark as needing review."""
    candidate["difficulty"] = "medium"
    candidate["summary"] = ""
    candidate["needs_review"] = True
    candidate["found_at"] = date.today().isoformat()
    candidate["submittedBy"] = "scout-agent"
    return candidate


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stdout", action="store_true", help="print instead of writing candidates.json")
    args = parser.parse_args()

    idx = known_index()
    candidates, errors = [], {}

    for name, scout in SOURCES:
        try:
            for item in scout():
                if item["url"] in idx["urls"] or item["title"].lower() in idx["titles"]:
                    continue
                candidates.append(enrich(item))
        except Exception as exc:  # network down, markup changed, etc.
            errors[name] = "%s: %s" % (type(exc).__name__, exc)

    report = {
        "generated": date.today().isoformat(),
        "new_candidates": len(candidates),
        "source_errors": errors,
        "candidates": candidates,
    }

    out = json.dumps(report, indent=2, ensure_ascii=False)
    if args.stdout:
        print(out)
    else:
        path = os.path.join(HERE, "candidates.json")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(out + "\n")
        print("wrote %s (%d new candidates, %d source errors)"
              % (path, len(candidates), len(errors)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
