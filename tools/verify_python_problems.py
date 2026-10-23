#!/usr/bin/env python3
"""Verify the Python problem pack's embedded tests and unfinished starters."""

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "assets/js/data/pack_python.js"
EXPECTED_IDS = [f"py-90{i}" for i in range(1, 7)]


def load_pack():
    script = (
        "globalThis.registerProblems = p => process.stdout.write(JSON.stringify(p));"
        f"require({json.dumps(str(PACK))});"
    )
    result = subprocess.run(
        ["node", "-e", script], check=True, capture_output=True, text=True
    )
    return json.loads(result.stdout)


def find_pair(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        complement = target - value
        if complement in seen:
            return [seen[complement], index]
        seen[value] = index


def collect_anagrams(words):
    groups = {}
    for word in words:
        signature = tuple(sorted(word))
        groups.setdefault(signature, []).append(word)
    return list(groups.values())


def longest_distinct_span(text):
    left = 0
    best = 0
    last = {}
    for right, character in enumerate(text):
        left = max(left, last.get(character, -1) + 1)
        last[character] = right
        best = max(best, right - left + 1)
    return best


def delimiters_are_balanced(sequence):
    matching = {")": "(", "]": "[", "}": "{"}
    stack = []
    for delimiter in sequence:
        if delimiter in "([{":
            stack.append(delimiter)
        elif not stack or stack.pop() != matching[delimiter]:
            return False
    return not stack


def consolidate_windows(intervals):
    merged = []
    for start, end in sorted((start, end) for start, end in intervals):
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged


def count_land_regions(grid):
    if not grid or not grid[0]:
        return 0
    rows, columns = len(grid), len(grid[0])
    visited = set()
    regions = 0
    for row in range(rows):
        for column in range(columns):
            if grid[row][column] != "L" or (row, column) in visited:
                continue
            regions += 1
            visited.add((row, column))
            stack = [(row, column)]
            while stack:
                current_row, current_column = stack.pop()
                for next_row, next_column in (
                    (current_row - 1, current_column),
                    (current_row + 1, current_column),
                    (current_row, current_column - 1),
                    (current_row, current_column + 1),
                ):
                    coordinate = (next_row, next_column)
                    if (
                        0 <= next_row < rows
                        and 0 <= next_column < columns
                        and grid[next_row][next_column] == "L"
                        and coordinate not in visited
                    ):
                        visited.add(coordinate)
                        stack.append(coordinate)
    return regions


REFERENCES = {
    "py-901": {"find_pair": find_pair},
    "py-902": {"collect_anagrams": collect_anagrams},
    "py-903": {"longest_distinct_span": longest_distinct_span},
    "py-904": {"delimiters_are_balanced": delimiters_are_balanced},
    "py-905": {"consolidate_windows": consolidate_windows},
    "py-906": {"count_land_regions": count_land_regions},
}


def main():
    problems = load_pack()
    ids = [problem["id"] for problem in problems]
    assert ids == EXPECTED_IDS, f"unexpected ids/order: {ids}"

    for problem in problems:
        problem_id = problem["id"]
        tests = problem["tests"]["python"]

        reference_namespace = dict(REFERENCES[problem_id])
        exec(tests, reference_namespace)

        starter_namespace = {}
        exec(problem["starter"]["python"], starter_namespace)
        try:
            exec(tests, starter_namespace)
        except (AssertionError, NotImplementedError):
            pass
        else:
            raise AssertionError(f"{problem_id}: starter unexpectedly passed its tests")

        print(f"PASS {problem_id}: reference passes; starter fails")

    print(f"Verified {len(problems)} Python problems from {PACK.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
