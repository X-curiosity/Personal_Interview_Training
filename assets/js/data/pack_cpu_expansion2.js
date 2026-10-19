/* CPU expansion pack 2: cpu-601..cpu-620 (10 code + 10 numeric), hand-verified. */
registerProblems([
 {
  "id": "cpu-601",
  "track": "cpu",
  "branch": "Branch Prediction",
  "title": "Static Predictor Hit Counter",
  "difficulty": "easy",
  "tags": [
   "predictor",
   "static"
  ],
  "summary": "Count hits of an always-taken / always-not-taken policy.",
  "statement": "Implement `int static_hits(const int *outcomes, int n, int predict_taken)`. Each outcome is 0 (not taken) or 1 (taken). A static predictor always predicts `predict_taken`. Return the number of correct predictions.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint static_hits(const int *outcomes, int n, int predict_taken) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){int a[]={1,1,0,1,0,0};assert(static_hits(a,6,1)==3);assert(static_hits(a,6,0)==3);int b[]={1,1,1,1};assert(static_hits(b,4,1)==4);assert(static_hits(b,4,0)==0);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "Count positions where outcome == predict_taken."
 },
 {
  "id": "cpu-602",
  "track": "cpu",
  "branch": "Branch Prediction",
  "title": "One-Bit Predictor Accuracy",
  "difficulty": "medium",
  "tags": [
   "predictor",
   "1-bit"
  ],
  "summary": "A 1-bit predictor repeats the last outcome; count its hits.",
  "statement": "Implement `int one_bit_hits(const int *outcomes, int n)`. A 1-bit predictor predicts the previous outcome; before the first branch it predicts not-taken (0). Outcomes are 0/1. Return the number of correct predictions.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint one_bit_hits(const int *outcomes, int n) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){int a[]={1,1,0,0,1,1};assert(one_bit_hits(a,6)==3);int b[]={1,0,1,0};assert(one_bit_hits(b,4)==0);int c[]={1,1,1};assert(one_bit_hits(c,3)==2);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "Keep last=0 initially; for each outcome compare then update last."
 },
 {
  "id": "cpu-603",
  "track": "cpu",
  "branch": "Cache Optimization",
  "title": "FIFO Replacement Misses",
  "difficulty": "medium",
  "tags": [
   "cache",
   "FIFO"
  ],
  "summary": "Simulate one fully-associative FIFO set and count misses.",
  "statement": "Implement `int fifo_misses(const int *blocks, int n, int ways)` for one initially empty fully-associative cache set with `ways` lines (1 <= ways <= 16) using FIFO replacement — hits do not change eviction order. Return the number of misses.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint fifo_misses(const int *blocks, int n, int ways) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){int a[]={1,2,1,3,2,1};assert(fifo_misses(a,6,2)==4);int b[]={1,2,3,1,2,3};assert(fifo_misses(b,6,3)==3);int c[]={1,2,3,4,1,2};assert(fifo_misses(c,6,2)==6);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "Keep a circular buffer; on miss insert at tail and advance; on hit leave order unchanged."
 },
 {
  "id": "cpu-604",
  "track": "cpu",
  "branch": "Cache Optimization",
  "title": "Count Line-Splitting Accesses",
  "difficulty": "easy",
  "tags": [
   "cache",
   "alignment"
  ],
  "summary": "Count accesses that straddle a cache-line boundary.",
  "statement": "Implement `int line_splits(const unsigned long long *addrs, const int *sizes, int n, unsigned line_bytes)`. Access i reads `sizes[i]` bytes starting at `addrs[i]`. An access splits a line when its first and last byte lie in different `line_bytes`-sized lines. Return the count of splitting accesses.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint line_splits(const unsigned long long *addrs, const int *sizes, int n, unsigned line_bytes) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){unsigned long long a[]={60,64,124};int s[]={8,4,8};assert(line_splits(a,s,3,64)==2);unsigned long long b[]={0,32};int t[]={16,16};assert(line_splits(b,t,2,64)==0);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "An access splits when addr/line != (addr+size-1)/line."
 },
 {
  "id": "cpu-605",
  "track": "cpu",
  "branch": "Memory Hierarchy",
  "title": "TLB Final Occupancy",
  "difficulty": "medium",
  "tags": [
   "TLB",
   "occupancy"
  ],
  "summary": "Final number of valid entries in a small fully-associative TLB.",
  "statement": "Implement `int tlb_final_entries(const unsigned *pages, int n, int entries)`. A fully-associative TLB with `entries` slots (1..16) starts empty and uses LRU replacement. After processing all page references, return how many slots hold a valid translation.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint tlb_final_entries(const unsigned *pages, int n, int entries) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){unsigned a[]={1,2,3,1,2,3};assert(tlb_final_entries(a,6,4)==3);unsigned b[]={5,5,5,5};assert(tlb_final_entries(b,4,2)==1);unsigned c[]={1,2,3,4,5};assert(tlb_final_entries(c,5,3)==3);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "Occupancy grows to min(distinct pages, entries)."
 },
 {
  "id": "cpu-606",
  "track": "cpu",
  "branch": "ILP & Pipelining",
  "title": "Dependency Stall Accounting",
  "difficulty": "hard",
  "tags": [
   "stalls",
   "dependencies"
  ],
  "summary": "Sum max(0, latency - distance) over producer/consumer pairs.",
  "statement": "Implement `long long total_stalls(const int *latencies, const int *distances, int n)`. Pair i has a producer with result latency `latencies[i]` cycles and a consumer issued `distances[i]` instructions later in an in-order pipeline. The consumer stalls max(0, latency - distance) cycles. Return the total stall cycles.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nlong long total_stalls(const int *latencies, const int *distances, int n) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){int l[]={3,2,4};int d[]={1,2,5};assert(total_stalls(l,d,3)==2);int l2[]={5};int d2[]={2};assert(total_stalls(l2,d2,1)==3);int l3[]={1,1};int d3[]={4,4};assert(total_stalls(l3,d3,2)==0);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "Accumulate max(0, latencies[i] - distances[i])."
 },
 {
  "id": "cpu-607",
  "track": "cpu",
  "branch": "Prefetching",
  "title": "Constant-Stride Next Address",
  "difficulty": "easy",
  "tags": [
   "stride",
   "prefetch"
  ],
  "summary": "Detect a constant stride and return the next prefetch address.",
  "statement": "Implement `long long stride_next(const long long *addrs, int n)`. The array holds the last n >= 2 demand-access addresses ending in a constant stride. Return the address a stride prefetcher would request next: last + (last - previous).",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nlong long stride_next(const long long *addrs, int n) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){long long a[]={100,164,228};assert(stride_next(a,3)==292);long long b[]={500,400,300};assert(stride_next(b,3)==200);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "return addrs[n-1] + (addrs[n-1] - addrs[n-2]);"
 },
 {
  "id": "cpu-608",
  "track": "cpu",
  "branch": "Prefetching",
  "title": "Prefetch Coverage Counter",
  "difficulty": "medium",
  "tags": [
   "coverage",
   "prefetch"
  ],
  "summary": "Count how many eventual misses were prefetched earlier.",
  "statement": "Implement `int covered_misses(const int *misses, int m, const int *prefetches, int p)`. An original miss is covered if its block address appears anywhere in the prefetch list. Lists are small (<= 64 entries) and may contain duplicates. Return the number of covered misses.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint covered_misses(const int *misses, int m, const int *prefetches, int p) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){int ms[]={10,20,30,40};int pf[]={20,40,99};assert(covered_misses(ms,4,pf,3)==2);int m2[]={1,2};int p2[]={3,4};assert(covered_misses(m2,2,p2,2)==0);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "For each miss, scan the prefetch list for a match."
 },
 {
  "id": "cpu-609",
  "track": "cpu",
  "branch": "Memory Hierarchy",
  "title": "Peak Outstanding Misses",
  "difficulty": "hard",
  "tags": [
   "MSHR",
   "overlap"
  ],
  "summary": "Maximum simultaneously outstanding misses — sizes the MSHR file.",
  "statement": "Implement `int peak_outstanding(const int *miss_cycle, const int *service_time, int n)`. Miss i starts at cycle `miss_cycle[i]` (non-decreasing) and occupies an MSHR for `service_time[i]` cycles (freed at start + service; a miss freed at cycle c no longer occupies cycle c). Return the maximum number outstanding at any single cycle.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint peak_outstanding(const int *miss_cycle, const int *service_time, int n) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){int mc[]={0,2,4,6};int st[]={5,5,5,5};assert(peak_outstanding(mc,st,4)==3);int a[]={0,10,20};int b[]={5,5,5};assert(peak_outstanding(a,b,3)==1);int c[]={0,1};int d[]={10,10};assert(peak_outstanding(c,d,2)==2);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "For each miss start, count intervals covering that cycle; take the max (including itself)."
 },
 {
  "id": "cpu-610",
  "track": "cpu",
  "branch": "ILP & Pipelining",
  "title": "Weighted CPI in Fixed Point",
  "difficulty": "medium",
  "tags": [
   "CPI",
   "fixed-point"
  ],
  "summary": "Compute overall CPI x 100 from per-class instruction mixes.",
  "statement": "Implement `long long cpi_x100(const long long *counts, const int *cpi, int classes)`. Class i contributes `counts[i]` instructions at `cpi[i]` cycles each. Return total_cycles * 100 / total_instructions (integer truncation).",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\nlong long cpi_x100(const long long *counts, const int *cpi, int classes) {\n    /* TODO */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void){long long c[]={60,25,15};int p[]={1,2,4};assert(cpi_x100(c,p,3)==170);long long c2[]={1,1};int p2[]={1,3};assert(cpi_x100(c2,p2,2)==200);puts(\"ALL TESTS PASSED\");return 0;}\n"
  },
  "solution": "Sum counts[i]*cpi[i], scale by 100, integer-divide by total instructions."
 },
 {
  "id": "cpu-611",
  "track": "cpu",
  "branch": "Branch Prediction",
  "title": "Two-Bit Predictor on a Trace",
  "difficulty": "easy",
  "tags": [
   "predictor",
   "trace"
  ],
  "summary": "Step a 2-bit saturating counter through a 7-branch trace.",
  "statement": "A 2-bit saturating-counter predictor starts in state 1 (weakly not-taken; states 0..3, predicts taken in states 2 and 3, increments on taken saturating at 3, decrements on not-taken saturating at 0). The outcome sequence is T, T, N, T, N, N, T. How many of the 7 predictions are correct?",
  "kind": "answer",
  "answer": "3",
  "tolerance": 0,
  "solution": "Trace: predict N(T miss,->2), T(T hit,->3), T(N miss,->2), T(T hit,->3), T(N miss,->2), N(N hit,->1), N(T miss,->2) = 3 correct."
 },
 {
  "id": "cpu-612",
  "track": "cpu",
  "branch": "Cache Optimization",
  "title": "Sets in a 32 KB 4-Way Cache",
  "difficulty": "easy",
  "tags": [
   "cache",
   "geometry"
  ],
  "summary": "Cache geometry: sets from capacity, associativity and line size.",
  "statement": "A 32 KB cache is 4-way set-associative with 64-byte lines. How many sets does it have?",
  "kind": "answer",
  "answer": "128",
  "tolerance": 0,
  "solution": "Sets = 32768 / (4 x 64) = 128."
 },
 {
  "id": "cpu-613",
  "track": "cpu",
  "branch": "Cache Optimization",
  "title": "Tag Bits of a Direct-Mapped Cache",
  "difficulty": "medium",
  "tags": [
   "cache",
   "addressing"
  ],
  "summary": "Split a 32-bit address into offset, index and tag.",
  "statement": "A machine uses 32-bit byte addresses. Its direct-mapped cache is 16 KB with 64-byte lines. How many tag bits does each line's tag field hold?",
  "kind": "answer",
  "answer": "18",
  "tolerance": 0,
  "solution": "Offset = log2(64) = 6; lines = 16384/64 = 256 so index = 8; tag = 32 - 6 - 8 = 18."
 },
 {
  "id": "cpu-614",
  "track": "cpu",
  "branch": "Memory Hierarchy",
  "title": "Three-Level AMAT",
  "difficulty": "medium",
  "tags": [
   "AMAT",
   "hierarchy"
  ],
  "summary": "Average memory access time across L1/L2/DRAM.",
  "statement": "An L1 hits in 1 cycle with a 95% hit rate. Misses go to L2 (10 cycles, 80% hit rate of those misses). Remaining misses go to DRAM (200 cycles). What is the average memory access time in cycles?",
  "kind": "answer",
  "answer": "3.5",
  "tolerance": 0.01,
  "solution": "AMAT = 1 + 0.05 x (10 + 0.2 x 200) = 1 + 2.5 = 3.5 cycles."
 },
 {
  "id": "cpu-615",
  "track": "cpu",
  "branch": "Memory Hierarchy",
  "title": "Flat Page Table Footprint",
  "difficulty": "hard",
  "tags": [
   "paging",
   "page table"
  ],
  "summary": "Flat page-table memory footprint for a 32-bit address space.",
  "statement": "A system uses 32-bit virtual addresses, 4 KB pages and 4-byte page-table entries in a single flat page table covering the whole address space. How many bytes does one process's page table occupy?",
  "kind": "answer",
  "answer": "4194304",
  "tolerance": 0,
  "solution": "2^32 / 2^12 = 2^20 pages; 2^20 x 4 B = 4,194,304 bytes (4 MiB)."
 },
 {
  "id": "cpu-616",
  "track": "cpu",
  "branch": "ILP & Pipelining",
  "title": "Ideal Pipeline Speedup",
  "difficulty": "easy",
  "tags": [
   "pipeline",
   "speedup"
  ],
  "summary": "Ideal speedup of a balanced k-stage pipeline.",
  "statement": "An ideal, perfectly balanced 5-stage pipeline executes a very long instruction stream with no hazards. Compared with the equivalent single-cycle implementation, what speedup does it approach?",
  "kind": "answer",
  "answer": "5",
  "tolerance": 0,
  "solution": "One instruction completes per cycle versus one per 5 cycles: 5x throughput."
 },
 {
  "id": "cpu-617",
  "track": "cpu",
  "branch": "ILP & Pipelining",
  "title": "CPI With Branch Penalties",
  "difficulty": "medium",
  "tags": [
   "CPI",
   "branches"
  ],
  "summary": "Effective CPI once misprediction penalties are included.",
  "statement": "A pipelined CPU has a base CPI of 1.0. Branches are 20% of instructions, 30% of branches are mispredicted, and each misprediction costs 3 extra cycles. What is the effective CPI?",
  "kind": "answer",
  "answer": "1.18",
  "tolerance": 0.01,
  "solution": "CPI = 1 + 0.2 x 0.3 x 3 = 1.18."
 },
 {
  "id": "cpu-618",
  "track": "cpu",
  "branch": "Prefetching",
  "title": "Coverage From Counts",
  "difficulty": "medium",
  "tags": [
   "coverage",
   "prefetcher"
  ],
  "summary": "Coverage from useful prefetches and original miss count.",
  "statement": "Without prefetching a workload has 900 last-level misses. With a prefetcher, 600 requests are issued and 450 prove useful. What is the prefetcher's coverage, in percent?",
  "kind": "answer",
  "answer": "50",
  "tolerance": 0,
  "solution": "Coverage = 450 / 900 = 50%."
 },
 {
  "id": "cpu-619",
  "track": "cpu",
  "branch": "Branch Prediction",
  "title": "Alias Pressure in a 256-Entry Table",
  "difficulty": "hard",
  "tags": [
   "aliasing",
   "predictor"
  ],
  "summary": "How many competitors share one counter.",
  "statement": "A direction predictor has 256 counters indexed uniformly from 2048 distinct static branches, so every counter serves exactly 8 branches. For any chosen branch, how many other branches alias into the same counter?",
  "kind": "answer",
  "answer": "7",
  "tolerance": 0,
  "solution": "2048 / 256 = 8 per counter; 8 - 1 = 7 competitors."
 },
 {
  "id": "cpu-620",
  "track": "cpu",
  "branch": "Cache Optimization",
  "title": "Three C's With New Numbers",
  "difficulty": "hard",
  "tags": [
   "3C model",
   "conflict misses"
  ],
  "summary": "Split 4000 misses into compulsory, capacity and conflict.",
  "statement": "A workload suffers 4000 misses on an 8-way 16 KB cache. Cold-start analysis attributes 500 as compulsory. A fully-associative 16 KB LRU cache records 1500 misses on the same trace. How many of the original 4000 misses were conflict misses?",
  "kind": "answer",
  "answer": "2500",
  "tolerance": 0,
  "solution": "Conflict = original - FA = 4000 - 1500 = 2500."
 }
]);
