/* CPU replacement expansion: code exercises and numeric architecture problems. */
registerProblems([
  {
    "id": "cpu-501",
    "track": "cpu",
    "branch": "Branch Prediction",
    "title": "Simulate a Two-Bit Predictor",
    "difficulty": "easy",
    "tags": [
      "predictor",
      "simulation"
    ],
    "summary": "Implement `count_mispredictions(const int *outcomes, int n, int initial_state)`.",
    "statement": "Implement `count_mispredictions(const int *outcomes, int n, int initial_state)`. Each outcome is 0 (not taken) or 1 (taken). The predictor is a 2-bit saturating counter in states 0 through 3, predicts taken in states 2 and 3, increments after taken, and decrements after not taken. Return the number of wrong predictions; `initial_state` is guaranteed to be in range.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nint count_mispredictions(const int *outcomes, int n, int initial_state) {\n    /* TODO */\n    return -1;\n}\n"
    },
    "tests": {
      "c": "int main(void) { int a[]={1,1,0,1,0}; assert(count_mispredictions(a,5,1)==3); int b[]={0,0,1,1}; assert(count_mispredictions(b,4,0)==2); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Compare before updating the counter, then clamp the increment or decrement to [0,3]."
  },
  {
    "id": "cpu-502",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Count Direct-Mapped Cache Misses",
    "difficulty": "medium",
    "tags": [
      "cache",
      "mapping"
    ],
    "summary": "Implement `cache_misses(addresses, line_bytes, set_count)` for a cold direct-mapped cache.",
    "statement": "Implement `cache_misses(addresses, line_bytes, set_count)` for a cold direct-mapped cache. Addresses are byte addresses, all parameters are positive, and `line_bytes` and `set_count` are powers of two. Return the number of misses. A line address is `address / line_bytes`; its set is line address modulo set count; its tag is line address divided by set count.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nlong long cache_misses(const std::vector<unsigned long long>& addresses, unsigned line_bytes, unsigned set_count) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(cache_misses({0,4,0,16,0},4,4)==4); assert(cache_misses({0,1,2,3,4,5},4,2)==2); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Maintain one valid bit and tag per set and count each invalid or unequal-tag lookup."
  },
  {
    "id": "cpu-503",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Compute Reuse Distances",
    "difficulty": "hard",
    "tags": [
      "cache",
      "reuse distance"
    ],
    "summary": "Implement `reuse_distances(lines)`.",
    "statement": "Implement `reuse_distances(lines)`. For each cache-line identifier, return -1 on its first appearance; otherwise return the number of distinct line identifiers accessed strictly between its previous appearance and the current one. Input length is at most 2000.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nstd::vector<int> reuse_distances(const std::vector<int>& lines) {\n    // TODO\n    return {};\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert((reuse_distances({1,2,1,3,2,1})==std::vector<int>{-1,-1,1,-1,2,2})); assert((reuse_distances({7,7,7})==std::vector<int>{-1,0,0})); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "For every repeated line, scan from its previous position and insert intervening identifiers into a set."
  },
  {
    "id": "cpu-504",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Model an LRU Set",
    "difficulty": "medium",
    "tags": [
      "LRU",
      "replacement"
    ],
    "summary": "Implement `lru_misses(const int *blocks, int n, int ways)` for one initially empty fully associative cache set with `ways` lines.",
    "statement": "Implement `lru_misses(const int *blocks, int n, int ways)` for one initially empty fully associative cache set with `ways` lines. On a hit, the block becomes most recently used. On a miss, insert it and evict the least recently used block if full. Return misses. Inputs satisfy 1 <= ways <= 16.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nint lru_misses(const int *blocks, int n, int ways) {\n    /* TODO */\n    return -1;\n}\n"
    },
    "tests": {
      "c": "int main(void) { int a[]={1,2,1,3,2,1}; assert(lru_misses(a,6,2)==4); int b[]={1,2,3,1,2,3}; assert(lru_misses(b,6,3)==3); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Keep an MRU-to-LRU array; move hits to the front and insert misses at the front."
  },
  {
    "id": "cpu-505",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Translate Through a Tiny TLB",
    "difficulty": "easy",
    "tags": [
      "TLB",
      "LRU"
    ],
    "summary": "Implement `tlb_hits(const unsigned *pages, int n, int entries)` for a fully associative TLB using LRU replacement.",
    "statement": "Implement `tlb_hits(const unsigned *pages, int n, int entries)` for a fully associative TLB using LRU replacement. It starts empty; each page number identifies one translation. Return the number of hits. Inputs satisfy 1 <= entries <= 16.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nint tlb_hits(const unsigned *pages, int n, int entries) {\n    /* TODO */\n    return -1;\n}\n"
    },
    "tests": {
      "c": "int main(void) { unsigned a[]={1,2,1,3,1,2}; assert(tlb_hits(a,6,2)==2); unsigned b[]={4,4,4}; assert(tlb_hits(b,3,1)==2); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Use the same move-to-front LRU policy as a fully associative cache and increment only on lookup hits."
  },
  {
    "id": "cpu-506",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Schedule Pipeline Dependencies",
    "difficulty": "hard",
    "tags": [
      "pipeline",
      "dependencies"
    ],
    "summary": "Implement `in_order_cycles(latency, dependency)`.",
    "statement": "Implement `in_order_cycles(latency, dependency)`. Instruction i issues in program order, at most one per cycle. `latency[i]` is the positive result latency. `dependency[i]` is -1 or an earlier instruction whose result i needs. An instruction may issue no earlier than one cycle after the previous issue and no earlier than issue[dependency]+latency[dependency]. The first instruction may issue at cycle 0. Return the cycle when the final result becomes ready; return 0 for empty input.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nint in_order_cycles(const std::vector<int>& latency, const std::vector<int>& dependency) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(in_order_cycles({2,1,3},{-1,0,1})==6); assert(in_order_cycles({3,1,1},{-1,-1,0})==4); assert(in_order_cycles({}, {})==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Track issue cycles using the maximum of the next sequential issue cycle and the producer-ready cycle."
  },
  {
    "id": "cpu-507",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Find Maximum Independent Issue Width",
    "difficulty": "medium",
    "tags": [
      "ILP",
      "dependencies"
    ],
    "summary": "Implement `max_issue_width(dependencies)`.",
    "statement": "Implement `max_issue_width(dependencies)`. Each pair `(producer, consumer)` is a dependency between instruction indices in one cycle-sized group. Return the maximum number of instructions that can be selected when no selected pair has a dependency in either direction. `instruction_count` is supplied and is at most 20.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nint max_issue_width(int instruction_count, const std::vector<std::pair<int,int>>& dependencies) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(max_issue_width(4,{{0,1},{1,2}})==3); assert(max_issue_width(3,{{0,1},{0,2},{1,2}})==1); assert(max_issue_width(0,{})==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Enumerate subsets and reject any subset containing both endpoints of a dependency; retain the largest valid popcount."
  },
  {
    "id": "cpu-508",
    "track": "cpu",
    "branch": "Branch Prediction",
    "title": "Advance a Gshare History Register",
    "difficulty": "easy",
    "tags": [
      "gshare",
      "history"
    ],
    "summary": "Implement `gshare_indices(pcs, outcomes, n, history_bits, out)`.",
    "statement": "Implement `gshare_indices(pcs, outcomes, n, history_bits, out)`. Before each update, write the table index `(pc >> 2) XOR history`, masked to `history_bits`. Then shift the 0/1 outcome into the low bit of history, keeping the same mask. Initial history is zero; history_bits is 1 through 16.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nvoid gshare_indices(const unsigned *pcs, const int *outcomes, int n, int history_bits, unsigned *out) {\n    /* TODO */\n}\n"
    },
    "tests": {
      "c": "int main(void) { unsigned p[]={0x10,0x14,0x18}; int o[]={1,0,1}; unsigned z[3]; gshare_indices(p,o,3,2,z); assert(z[0]==0 && z[1]==0 && z[2]==0); unsigned q[]={0,0}; int r[]={1,1}; gshare_indices(q,r,2,3,z); assert(z[0]==0 && z[1]==1); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Compute the masked XOR from the old history, then update history with a masked left shift and outcome."
  },
  {
    "id": "cpu-509",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Measure Prefetch Accuracy",
    "difficulty": "easy",
    "tags": [
      "prefetch",
      "accuracy"
    ],
    "summary": "Implement `prefetch_accuracy(issued, used, n)`.",
    "statement": "Implement `prefetch_accuracy(issued, used, n)`. Each array contains request identifiers; identifiers may repeat. Match each issued prefetch to at most one later use with the same identifier, and each use to at most one issue. Return useful issued prefetches divided by n, or 0.0 when n is zero. `used_count` is supplied separately.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\ndouble prefetch_accuracy(const int *issued, int n, const int *used, int used_count) {\n    /* TODO */\n    return 0.0;\n}\n"
    },
    "tests": {
      "c": "int main(void) { int a[]={1,2,2,3}; int u[]={2,3,2,9}; assert(fabs(prefetch_accuracy(a,4,u,4)-0.75)<1e-12); assert(prefetch_accuracy(a,0,u,4)==0.0); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Track unmatched uses or sort copies and perform a multiset intersection; divide matches by issued count."
  },
  {
    "id": "cpu-510",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Generate Next-Line Prefetches",
    "difficulty": "easy",
    "tags": [
      "prefetch",
      "next-line"
    ],
    "summary": "Implement `next_line_requests(lines)`.",
    "statement": "Implement `next_line_requests(lines)`. For each demand line, propose line+1, but include a proposal only once in the returned vector, preserving first-proposal order. Line identifiers are nonnegative.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nstd::vector<unsigned> next_line_requests(const std::vector<unsigned>& lines) {\n    // TODO\n    return {};\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert((next_line_requests({4,4,5,8})==std::vector<unsigned>{5,6,9})); assert(next_line_requests({}).empty()); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Insert each successor into a set and append it only when insertion reports that it was new."
  },
  {
    "id": "cpu-511",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Detect a Stable Stride",
    "difficulty": "medium",
    "tags": [
      "prefetch",
      "stride"
    ],
    "summary": "Implement `stable_stride(const long long *addresses, int n, int required, long long *stride)`.",
    "statement": "Implement `stable_stride(const long long *addresses, int n, int required, long long *stride)`. Examine the most recent differences. Return 1 and store the difference if at least `required` consecutive trailing differences are equal; otherwise return 0. `required` is positive.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nint stable_stride(const long long *addresses, int n, int required, long long *stride) {\n    /* TODO */\n    return 0;\n}\n"
    },
    "tests": {
      "c": "int main(void) { long long a[]={0,8,16,24}; long long s=0; assert(stable_stride(a,4,3,&s)==1 && s==8); long long b[]={0,8,20,32}; assert(stable_stride(b,4,3,&s)==0); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "There must be at least required+1 addresses; compare each of the required trailing differences with the last one."
  },
  {
    "id": "cpu-512",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Simulate a Stream Buffer",
    "difficulty": "hard",
    "tags": [
      "prefetch",
      "stream buffer"
    ],
    "summary": "Implement `stream_hits(demands, depth)`.",
    "statement": "Implement `stream_hits(demands, depth)`. A stream buffer starts empty. On a demand miss, replace its contents with the next `depth` consecutive lines. On a hit to a buffered line, count a hit, remove that line and all earlier buffered lines, then refill after the current farthest line until the buffer again has `depth` entries. Return hit count; depth is positive.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nint stream_hits(const std::vector<int>& demands, int depth) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(stream_hits({10,11,12,20,21},2)==3); assert(stream_hits({5,9,13},3)==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Represent the ordered buffer explicitly; misses restart at demand+1, while hits discard through the match and extend from the previous tail."
  },
  {
    "id": "cpu-513",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Count Bank Conflicts",
    "difficulty": "medium",
    "tags": [
      "memory banks",
      "conflicts"
    ],
    "summary": "Implement `bank_conflicts(const unsigned *addresses, int n, unsigned word_bytes, int banks)`.",
    "statement": "Implement `bank_conflicts(const unsigned *addresses, int n, unsigned word_bytes, int banks)`. Requests arrive in groups of exactly `banks`; bank number is `(address / word_bytes) % banks`. For each group, count requests beyond the first to every bank. The final partial group, if any, is also processed.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nint bank_conflicts(const unsigned *addresses, int n, unsigned word_bytes, int banks) {\n    /* TODO */\n    return -1;\n}\n"
    },
    "tests": {
      "c": "int main(void) { unsigned a[]={0,16,4,8,0,4}; assert(bank_conflicts(a,6,4,4)==1); unsigned b[]={0,16,32,48}; assert(bank_conflicts(b,4,4,4)==3); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Clear per-bank occupancy for each group and count every request whose bank was already occupied."
  },
  {
    "id": "cpu-514",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Reorder for Row Locality",
    "difficulty": "hard",
    "tags": [
      "memory scheduling",
      "row locality"
    ],
    "summary": "Implement `row_switches(requests)`.",
    "statement": "Implement `row_switches(requests)`. Requests may be reordered freely within each contiguous run having the same bank, but runs cannot cross bank boundaries. Within each run, serve equal rows together in any order. Return the minimum number of row activations, assuming all banks begin closed. Each request is `(bank,row)`.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nint row_switches(const std::vector<std::pair<int,int>>& requests) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(row_switches({{0,1},{0,2},{0,1},{1,3},{1,3}})==3); assert(row_switches({})==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "For each maximal same-bank run, the minimum activations equal its number of distinct rows."
  },
  {
    "id": "cpu-515",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Calculate Set Occupancy Peaks",
    "difficulty": "hard",
    "tags": [
      "cache",
      "working set"
    ],
    "summary": "Implement `peak_set_occupancy(blocks, sets, window)`.",
    "statement": "Implement `peak_set_occupancy(blocks, sets, window)`. For every contiguous window of exactly `window` references, count distinct block identifiers mapped to each set by nonnegative `block % sets`; return the largest such per-set distinct count. Return 0 if the input is shorter than the window.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nint peak_set_occupancy(const std::vector<int>& blocks, int sets, int window) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(peak_set_occupancy({0,4,1,5,8},4,4)==2); assert(peak_set_occupancy({0,4,8},4,3)==3); assert(peak_set_occupancy({1},2,2)==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Scan each window, using one set of block identifiers per cache set, and retain the largest size."
  },
  {
    "id": "cpu-516",
    "track": "cpu",
    "branch": "Branch Prediction",
    "title": "Compute a Branch Confusion Matrix",
    "difficulty": "medium",
    "tags": [
      "branch prediction",
      "metrics"
    ],
    "summary": "Implement `branch_confusion(predicted, actual, n, counts)`.",
    "statement": "Implement `branch_confusion(predicted, actual, n, counts)`. Values are 0 or 1. Store counts in this order: correctly predicted not-taken, predicted taken when not-taken, predicted not-taken when taken, correctly predicted taken.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nvoid branch_confusion(const int *predicted, const int *actual, int n, int counts[4]) {\n    /* TODO */\n}\n"
    },
    "tests": {
      "c": "int main(void) { int p[]={0,1,0,1,1}; int a[]={0,0,1,1,1}; int c[4]; branch_confusion(p,a,5,c); assert(c[0]==1&&c[1]==1&&c[2]==1&&c[3]==2); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Zero the four bins and index them from actual and predicted, or use four explicit cases."
  },
  {
    "id": "cpu-517",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Estimate Memory-Level Parallel Time",
    "difficulty": "medium",
    "tags": [
      "memory-level parallelism",
      "latency"
    ],
    "summary": "Implement `miss_completion_time(latencies, max_outstanding)`.",
    "statement": "Implement `miss_completion_time(latencies, max_outstanding)`. Misses are issued in input order, one per cycle starting at cycle 0, but at most `max_outstanding` may be active. A miss completing at issue+latency frees its slot immediately. If full, the next miss issues at the earliest completion cycle (or later to preserve one-per-cycle issue). Return the final completion cycle; inputs have positive latencies and positive capacity.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nlong long miss_completion_time(const std::vector<int>& latencies, int max_outstanding) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(miss_completion_time({5,5,5},2)==10); assert(miss_completion_time({3,2,1},3)==3); assert(miss_completion_time({},2)==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Maintain active completion times in a min-heap; retire completed misses before issuing and wait for the minimum when capacity is full."
  },
  {
    "id": "cpu-518",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Pack Instructions into Issue Cycles",
    "difficulty": "easy",
    "tags": [
      "superscalar",
      "issue"
    ],
    "summary": "Implement `issue_cycles(const int *classes, int n, int width)`.",
    "statement": "Implement `issue_cycles(const int *classes, int n, int width)`. Instructions issue in order. At most `width` issue per cycle, and at most one instruction of each nonnegative class may issue in the same cycle. If the next instruction conflicts, begin a new cycle rather than skipping it. Return cycles, or 0 when n is zero.",
    "kind": "code",
    "languages": [
      "c"
    ],
    "starter": {
      "c": "#include <assert.h>\n#include <stdio.h>\n#include <math.h>\nint issue_cycles(const int *classes, int n, int width) {\n    /* TODO */\n    return -1;\n}\n"
    },
    "tests": {
      "c": "int main(void) { int a[]={0,1,0,2}; assert(issue_cycles(a,4,3)==2); int b[]={1,2,3,4}; assert(issue_cycles(b,4,2)==2); assert(issue_cycles(b,0,2)==0); puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Build each cycle greedily from the next instruction until width is reached or its class repeats."
  },
  {
    "id": "cpu-519",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Score Prefetch Timeliness",
    "difficulty": "medium",
    "tags": [
      "prefetch",
      "timeliness"
    ],
    "summary": "Implement `timely_prefetches(prefetch_cycle, demand_cycle)`.",
    "statement": "Implement `timely_prefetches(prefetch_cycle, demand_cycle)`. Entry i describes one prefetched line and its corresponding demand. Count it as timely exactly when prefetch_cycle[i] is nonnegative and strictly less than demand_cycle[i]. The vectors have equal length.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nint timely_prefetches(const std::vector<int>& prefetch_cycle, const std::vector<int>& demand_cycle) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(timely_prefetches({2,5,-1,9},{4,5,8,12})==2); assert(timely_prefetches({}, {})==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Count entries with an issued prefetch timestamp earlier than the corresponding demand timestamp."
  },
  {
    "id": "cpu-520",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Find Pipeline Critical Path",
    "difficulty": "hard",
    "tags": [
      "ILP",
      "critical path"
    ],
    "summary": "Implement `critical_path(latency, predecessors)`.",
    "statement": "Implement `critical_path(latency, predecessors)`. Instructions form a directed acyclic graph in topological index order: every predecessor of i is less than i. Completion time is latency[i] plus the maximum completion time among its predecessors, or just latency[i] if none. Return the maximum completion time, or 0 for an empty graph.",
    "kind": "code",
    "languages": [
      "cpp"
    ],
    "starter": {
      "cpp": "#include <cassert>\n#include <cstdio>\n#include <vector>\n#include <set>\n#include <unordered_set>\n#include <queue>\n#include <utility>\n#include <algorithm>\nlong long critical_path(const std::vector<int>& latency, const std::vector<std::vector<int>>& predecessors) {\n    // TODO\n    return -1;\n}\n"
    },
    "tests": {
      "cpp": "int main() { assert(critical_path({2,3,4,1},{{},{0},{0},{1,2}})==7); assert(critical_path({5},{{}})==5); assert(critical_path({}, {})==0); std::puts(\"ALL TESTS PASSED\"); return 0; }\n"
    },
    "solution": "Dynamic programming in topological order computes each node completion from the maximum predecessor completion."
  },
  {
    "id": "cpu-521",
    "track": "cpu",
    "branch": "Branch Prediction",
    "title": "Alias Rate in a Small Predictor",
    "difficulty": "medium",
    "tags": [
      "aliasing",
      "predictor table"
    ],
    "summary": "A predictor indexes 1024 counters uniformly with 4096 distinct static branches.",
    "statement": "A predictor indexes 1024 counters uniformly with 4096 distinct static branches. Assuming every counter receives exactly four branches, how many other branches alias with any chosen branch?",
    "kind": "answer",
    "answer": "3",
    "tolerance": 0,
    "solution": "Each counter is shared by four branches, so a chosen branch has three other branches competing for its counter."
  },
  {
    "id": "cpu-522",
    "track": "cpu",
    "branch": "Branch Prediction",
    "title": "Branch Recovery Throughput",
    "difficulty": "hard",
    "tags": [
      "IPC",
      "misprediction"
    ],
    "summary": "A core retires 2.",
    "statement": "A core retires 2.5 instructions per cycle when speculation is correct. Branches are 20% of instructions, 4% of branches mispredict, and recovery costs 12 cycles. Using CPI = ideal CPI + branch frequency times mispredict rate times penalty, what is effective IPC?",
    "kind": "answer",
    "answer": "2.016129",
    "tolerance": 0,
    "solution": "Ideal CPI is 1/2.5 = 0.4. Recovery adds 0.20×0.04×12 = 0.096, giving CPI 0.496 and IPC 1/0.496 = 2.016129."
  },
  {
    "id": "cpu-523",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Victim Cache Rescue Rate",
    "difficulty": "medium",
    "tags": [
      "victim cache",
      "misses"
    ],
    "summary": "A workload has 2400 L1 misses.",
    "statement": "A workload has 2400 L1 misses. A victim cache catches 720 of them; every other access proceeds unchanged. What percentage of the original L1 misses does the victim cache rescue?",
    "kind": "answer",
    "answer": "30",
    "tolerance": 0,
    "solution": "The rescue rate is 720/2400×100 = 30%."
  },
  {
    "id": "cpu-524",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Cache Coloring Capacity",
    "difficulty": "hard",
    "tags": [
      "cache coloring",
      "sets"
    ],
    "summary": "Physical pages are 4 KB and an indexed cache has 256 sets with 64-byte lines.",
    "statement": "Physical pages are 4 KB and an indexed cache has 256 sets with 64-byte lines. The page offset selects 64 sets. How many distinct page colors are required to span all cache sets?",
    "kind": "answer",
    "answer": "4",
    "tolerance": 0,
    "solution": "A page contains 4096/64 = 64 line offsets, so it directly selects 64 sets. The remaining set selection yields 256/64 = 4 page colors."
  },
  {
    "id": "cpu-525",
    "track": "cpu",
    "branch": "Cache Optimization",
    "title": "Dirty Eviction Traffic",
    "difficulty": "easy",
    "tags": [
      "write-back",
      "traffic"
    ],
    "summary": "During an interval a write-back cache evicts 1500 lines of 64 bytes each.",
    "statement": "During an interval a write-back cache evicts 1500 lines of 64 bytes each. Forty percent are dirty and therefore written to memory. How many bytes of write-back traffic occur?",
    "kind": "answer",
    "answer": "38400",
    "tolerance": 0,
    "solution": "Dirty lines = 1500×0.40 = 600. Traffic is 600×64 = 38,400 bytes."
  },
  {
    "id": "cpu-526",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Parallel Miss Service",
    "difficulty": "medium",
    "tags": [
      "nonblocking cache",
      "parallelism"
    ],
    "summary": "Eight independent cache misses each take 80 cycles.",
    "statement": "Eight independent cache misses each take 80 cycles. A nonblocking cache can service four misses concurrently in perfectly overlapping batches, with no issue overhead. How many cycles are needed to complete all eight?",
    "kind": "answer",
    "answer": "160",
    "tolerance": 0,
    "solution": "Four misses complete in each 80-cycle batch. Eight misses require two batches, totaling 160 cycles."
  },
  {
    "id": "cpu-527",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Page Walk Cache Benefit",
    "difficulty": "hard",
    "tags": [
      "page walk",
      "walk cache"
    ],
    "summary": "A four-level page walk normally performs four 50-cycle memory reads.",
    "statement": "A four-level page walk normally performs four 50-cycle memory reads. A walk cache eliminates the first three reads on 75% of TLB misses. What is the average page-walk latency in cycles?",
    "kind": "answer",
    "answer": "87.5",
    "tolerance": 0,
    "solution": "A cached walk costs 50 cycles and an uncached walk costs 200. Weighted latency = 0.75×50 + 0.25×200 = 87.5 cycles."
  },
  {
    "id": "cpu-528",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Interleaved Bank Bandwidth",
    "difficulty": "easy",
    "tags": [
      "banking",
      "bandwidth"
    ],
    "summary": "A memory system has 8 independent banks.",
    "statement": "A memory system has 8 independent banks. Each bank can begin one 64-byte transfer every 4 cycles. With perfectly balanced requests, how many bytes per cycle can the banks begin in aggregate?",
    "kind": "answer",
    "answer": "128",
    "tolerance": 0,
    "solution": "Each bank supplies 64/4 = 16 bytes per cycle. Eight banks supply 8×16 = 128 bytes per cycle."
  },
  {
    "id": "cpu-529",
    "track": "cpu",
    "branch": "Memory Hierarchy",
    "title": "Read Queue Waiting Time",
    "difficulty": "medium",
    "tags": [
      "queueing",
      "latency"
    ],
    "summary": "A memory controller completes one request every 12 ns.",
    "statement": "A memory controller completes one request every 12 ns. A new request arrives behind exactly five queued requests, and the server is ready to start the first queued request immediately. After how many ns will the new request complete?",
    "kind": "answer",
    "answer": "72",
    "tolerance": 0,
    "solution": "The five earlier requests and the new request require six service intervals: 6×12 = 72 ns."
  },
  {
    "id": "cpu-530",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Rename Register Headroom",
    "difficulty": "easy",
    "tags": [
      "register renaming",
      "physical registers"
    ],
    "summary": "An architecture exposes 32 integer registers and a core has 96 integer physical registers.",
    "statement": "An architecture exposes 32 integer registers and a core has 96 integer physical registers. Ignoring reserved entries, how many physical registers are available for renamed in-flight destinations beyond the architectural state?",
    "kind": "answer",
    "answer": "64",
    "tolerance": 0,
    "solution": "The committed architectural mappings occupy 32 registers, leaving 96−32 = 64 for newer destinations."
  },
  {
    "id": "cpu-531",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Reorder Buffer Residence",
    "difficulty": "medium",
    "tags": [
      "reorder buffer",
      "throughput"
    ],
    "summary": "A 192-entry reorder buffer sustains retirement at 3 instructions per cycle.",
    "statement": "A 192-entry reorder buffer sustains retirement at 3 instructions per cycle. Under steady full occupancy and uniform flow, what average residence time in cycles follows from occupancy divided by throughput?",
    "kind": "answer",
    "answer": "64",
    "tolerance": 0,
    "solution": "By the occupancy/throughput relation, residence time = 192/3 = 64 cycles."
  },
  {
    "id": "cpu-532",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Functional Unit Bottleneck IPC",
    "difficulty": "hard",
    "tags": [
      "functional units",
      "IPC"
    ],
    "summary": "A workload consists of 40% multiply instructions.",
    "statement": "A workload consists of 40% multiply instructions. The core has one pipelined multiplier that accepts one multiply every 2 cycles. Assume all other resources and dependencies are unlimited. What maximum overall IPC is imposed by multiply throughput?",
    "kind": "answer",
    "answer": "1.25",
    "tolerance": 0,
    "solution": "The multiplier sustains 0.5 multiplies/cycle. Since multiplies are 0.40 of instructions, total IPC cannot exceed 0.5/0.40 = 1.25."
  },
  {
    "id": "cpu-533",
    "track": "cpu",
    "branch": "ILP & Pipelining",
    "title": "Pipeline Flush Work Lost",
    "difficulty": "easy",
    "tags": [
      "pipeline flush",
      "width"
    ],
    "summary": "A 6-wide pipeline discovers a bad speculation after 7 full younger pipeline stages have each accepted 6 instructions.",
    "statement": "A 6-wide pipeline discovers a bad speculation after 7 full younger pipeline stages have each accepted 6 instructions. Assuming all those slots are occupied, how many younger instructions are discarded?",
    "kind": "answer",
    "answer": "42",
    "tolerance": 0,
    "solution": "Seven stages times six occupied instruction slots per stage gives 7×6 = 42 discarded instructions."
  },
  {
    "id": "cpu-534",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Prefetch Coverage and Residual MPKI",
    "difficulty": "medium",
    "tags": [
      "prefetch",
      "coverage"
    ],
    "summary": "A workload begins at 20 demand misses per thousand instructions.",
    "statement": "A workload begins at 20 demand misses per thousand instructions. A prefetcher has 65% coverage, meaning it eliminates that fraction of original demand misses. What residual demand MPKI remains?",
    "kind": "answer",
    "answer": "7",
    "tolerance": 0,
    "solution": "Residual fraction is 35%, so residual MPKI = 20×0.35 = 7."
  },
  {
    "id": "cpu-535",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Prefetch Bandwidth Inflation",
    "difficulty": "hard",
    "tags": [
      "prefetch",
      "bandwidth"
    ],
    "summary": "A baseline transfers 1000 cache lines.",
    "statement": "A baseline transfers 1000 cache lines. A prefetcher issues 500 additional line fetches, of which 300 are useful. Assume useful prefetches replace later demand fetches rather than adding another transfer, while all 200 useless fetches are extra. By what percentage does total line traffic increase over baseline?",
    "kind": "answer",
    "answer": "20",
    "tolerance": 0,
    "solution": "The useful transfers merely occur earlier. Only 500−300 = 200 useless lines add traffic, so increase = 200/1000×100 = 20%."
  },
  {
    "id": "cpu-536",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Lookahead Distance from Latency",
    "difficulty": "medium",
    "tags": [
      "prefetch distance",
      "latency"
    ],
    "summary": "A loop consumes one cache line every 5 cycles and memory latency is 70 cycles.",
    "statement": "A loop consumes one cache line every 5 cycles and memory latency is 70 cycles. Ignoring variability, what minimum integer prefetch distance in cache lines is needed to cover the latency?",
    "kind": "answer",
    "answer": "14",
    "tolerance": 0,
    "solution": "The prefetch must lead by 70/5 = 14 line-consumption intervals, so the minimum distance is 14 lines."
  },
  {
    "id": "cpu-537",
    "track": "cpu",
    "branch": "Prefetching",
    "title": "Prefetch Queue Occupancy",
    "difficulty": "easy",
    "tags": [
      "prefetch queue",
      "occupancy"
    ],
    "summary": "A prefetch engine issues 2 requests per cycle and each request remains outstanding for 18 cycles.",
    "statement": "A prefetch engine issues 2 requests per cycle and each request remains outstanding for 18 cycles. In steady state with no throttling, how many requests are outstanding?",
    "kind": "answer",
    "answer": "36",
    "tolerance": 0,
    "solution": "Steady occupancy equals issue rate times residence time: 2×18 = 36 requests."
  },
  {
    "id": "cpu-538",
    "track": "cpu",
    "branch": "Branch Prediction",
    "title": "Confidence Filter Savings",
    "difficulty": "hard",
    "tags": [
      "confidence",
      "mispredictions"
    ],
    "summary": "A predictor makes 10000 predictions.",
    "statement": "A predictor makes 10000 predictions. A confidence filter marks 15% as low confidence. The ordinary predictor would miss 40% of low-confidence cases and 5% of all remaining cases. If a fallback resolves every low-confidence case correctly with no penalty, how many mispredictions remain?",
    "kind": "answer",
    "answer": "425",
    "tolerance": 0,
    "solution": "Only the 85% high-confidence predictions can now miss: 10000×0.85×0.05 = 425."
  }
]);
