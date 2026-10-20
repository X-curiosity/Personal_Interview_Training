/* Project-scale problems: hours-long subsystem builds with edge-case test suites. 2 per track. */
registerProblems([
 {
  "id": "cpu-701",
  "track": "cpu",
  "branch": "Cache Optimization",
  "title": "Project: Set-Associative Cache Simulator",
  "difficulty": "hard",
  "tags": [
   "project",
   "cache simulator",
   "LRU"
  ],
  "summary": "Build a full set-associative cache model with LRU replacement and hit/miss/eviction stats.",
  "statement": "Implement a complete set-associative cache simulator. `cache_sim(lines_total, ways, addresses, n)` receives total line capacity (power of two, 1..4096), associativity (power of two dividing lines_total), and an array of n block addresses (each identifies one cache block). The cache starts cold and uses LRU replacement within each set. Return a stats struct with hits, misses, and evictions (a line leaving the cache for any reason counts as an eviction; the initial fill of a set does not).",
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\ntypedef struct { long long hits, misses, evictions; } CacheStats;\n\nCacheStats cache_sim(int lines_total, int ways, const long long *addresses, int n) {\n    CacheStats s = {0, 0, 0};\n    /* TODO: implement the simulator */\n    return s;\n}\n"
  },
  "tests": {
   "c": "static void eq(CacheStats s, long long h, long long m, long long e) {\n    assert(s.hits == h && s.misses == m && s.evictions == e);\n}\nint main(void) {\n    { long long a[] = {1,2,3}; eq(cache_sim(4, 2, a, 3), 0, 3, 0); }\n    { long long a[] = {5,5,5,5}; eq(cache_sim(4, 2, a, 4), 3, 1, 0); }\n    { long long a[] = {0,4,0,4,0}; eq(cache_sim(4, 1, a, 5), 0, 5, 4); }\n    { long long a[] = {0,4,0,4,0}; eq(cache_sim(2, 2, a, 5), 3, 2, 0); }\n    { long long a[] = {0,1,2,0,3}; eq(cache_sim(2, 2, a, 5), 0, 5, 3); }\n    { long long a[] = {7,8,7,9,7}; eq(cache_sim(1, 1, a, 5), 0, 5, 4); }\n    { long long a[] = {0,1,2,3,4}; eq(cache_sim(4, 4, a, 5), 0, 5, 1); }\n    eq(cache_sim(8, 2, NULL, 0), 0, 0, 0);\n    { long long a[] = {0,2,4,6}; eq(cache_sim(4, 2, a, 4), 0, 4, 2); }\n    { long long a[] = {0,2,0,4,0}; eq(cache_sim(4, 2, a, 5), 2, 3, 1); }\n    puts(\"ALL TESTS PASSED\");\n    return 0;\n}"
  },
  "hints": [
   "Model each set as ways slots with a valid bit, a tag, and an age counter; a global tick makes the oldest slot easy to find.",
   "Eviction happens only when a miss replaces a valid line, never on the first fill of a slot.",
   "The set index is address modulo set count; check the direct mapped thrash case by hand first."
  ],
  "solution": "Keep per-slot valid/tag/age arrays. On each access compute set = a % (lines/ways), scan the set for a hit (refresh its age), otherwise miss into the invalid or least recently used slot, counting an eviction when the victim was valid.",
  "references": [],
  "kind": "code",
  "languages": [
   "c"
  ]
 },
 {
  "id": "cpu-702",
  "track": "cpu",
  "branch": "Branch Prediction",
  "title": "Project: Tournament Predictor Simulator",
  "difficulty": "hard",
  "tags": [
   "project",
   "tournament predictor",
   "simulation"
  ],
  "summary": "Simulate a local-history + bimodal tournament predictor with a selector table.",
  "statement": "Implement `int tournament_misses(const int *outcomes, int n)`. The machine has: a 2-bit saturating bimodal predictor (starts state 1), a local predictor indexed by a 4-bit global history register (16 two-bit counters, all start state 1), and a 2-bit selector (starts state 1). On each branch: the local entry for the current history predicts, the bimodal predicts, and the selector picks local when its state is 2..3, bimodal when 0..1. The selector moves toward whichever predictor was right (saturating, only when they disagree), both predictors update with the outcome, and the history shifts in the outcome. States 2..3 predict taken. Return total mispredictions.",
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\nint tournament_misses(const int *outcomes, int n) {\n    /* TODO: implement the tournament predictor */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "int main(void) {\n    { int a[] = {1,1,1,1,1,1}; assert(tournament_misses(a, 6) == 1); }\n    { int a[] = {0,0,0,0,0,0}; assert(tournament_misses(a, 6) == 0); }\n    { int a[] = {1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0}; assert(tournament_misses(a, 16) == 4); }\n    { int a[] = {0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1}; assert(tournament_misses(a, 16) == 4); }\n    { int a[] = {1,1,1,1,1,1,0,1,1,1,1}; assert(tournament_misses(a, 11) == 2); }\n    assert(tournament_misses(NULL, 0) == 0);\n    { int a[] = {1,1,0,1,1,0,1,1,0,1,1,0,1,1,0}; assert(tournament_misses(a, 15) == 4); }\n    puts(\"ALL TESTS PASSED\");\n    return 0;\n}"
  },
  "hints": [
   "All three structures are 2-bit saturating counters; the selector moves only when the two predictors disagree.",
   "The global history is shared across the whole trace, shifted left with the new outcome and masked to 4 bits.",
   "Alternating traces should end with the local table winning the selector."
  ],
  "solution": "Order matters: read both predictions, pick via the selector, count the miss, move the selector only when lp != bp, then update both counters and shift the history.",
  "references": [],
  "kind": "code",
  "languages": [
   "c"
  ]
 },
 {
  "id": "sys-701",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Project: Arena Allocator with Coalescing",
  "difficulty": "hard",
  "tags": [
   "project",
   "allocator",
   "free list"
  ],
  "summary": "Implement arena_alloc/arena_free over a static arena with a coalescing free list.",
  "statement": "Implement a fixed arena allocator. `void arena_init(void)` resets a 4096-byte arena. `void *arena_alloc(size_t size)` returns 16-byte-aligned storage or NULL when nothing fits. `void arena_free(void *ptr)` returns a block and coalesces adjacent free blocks. Freed space must be reusable for later allocations of equal or larger size, and freeing two adjacent blocks must allow one allocation spanning both. Layout is up to you, but every allocation must be preceded by a header you control. Tests only exercise legal frees.",
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\nvoid arena_init(void);\nvoid *arena_alloc(size_t size);\nvoid arena_free(void *ptr);\n\n/* TODO: implement the arena. These stubs exist only so the file links. */\nvoid arena_init(void) {}\nvoid *arena_alloc(size_t size) { (void)size; return NULL; }\nvoid arena_free(void *ptr) { (void)ptr; }\n"
  },
  "tests": {
   "c": "int main(void) {\n    arena_init();\n    void *a = arena_alloc(100);\n    assert(a != NULL);\n    assert(((size_t)a % 16) == 0);\n    memset(a, 0xAB, 100);\n    arena_init();\n    size_t total = 0; void *last = NULL;\n    while ((last = arena_alloc(512)) != NULL) total += 512;\n    assert(total > 0 && total <= 4096);\n    arena_init();\n    void *b = arena_alloc(200);\n    arena_free(b);\n    void *c = arena_alloc(200);\n    assert(c == b);\n    arena_init();\n    void *d = arena_alloc(1000);\n    void *e = arena_alloc(1000);\n    arena_free(d);\n    arena_free(e);\n    void *big = arena_alloc(1800);\n    assert(big != NULL && big == d);\n    arena_init();\n    unsigned char *keep = arena_alloc(64);\n    for (int i = 0; i < 64; ++i) keep[i] = (unsigned char)i;\n    for (int k = 0; k < 50; ++k) { void *t = arena_alloc(48); if (t) arena_free(t); }\n    for (int i = 0; i < 64; ++i) assert(keep[i] == (unsigned char)i);\n    arena_init();\n    void *z = arena_alloc(0);\n    if (z) arena_free(z);\n    arena_init();\n    void *ptrs[64]; int got = 0;\n    for (int i = 0; i < 64; ++i) { ptrs[i] = arena_alloc(32); if (ptrs[i]) got++; }\n    for (int i = 0; i < 64; ++i) if (ptrs[i]) arena_free(ptrs[i]);\n    assert(got > 8);\n    assert(arena_alloc(3000) != NULL);\n    puts(\"ALL TESTS PASSED\");\n    return 0;\n}"
  },
  "hints": [
   "One header per block right before the payload: size, a free flag, and a next pointer turn the arena into a linked list.",
   "Splitting needs room for the request AND another header plus a minimum sliver; otherwise hand over the whole block.",
   "Coalescing is easiest as a sweep merging any free block with its physically adjacent free successor. Watch header alignment: the payload must stay 16 byte aligned."
  ],
  "solution": "First-fit over a singly linked block list with a 32-byte aligned header, block splitting, and a coalescing pass on free. Tests cover alignment, exhaustion, same-size reuse, adjacency merge, data integrity under churn, and full-arena recovery.",
  "references": [],
  "kind": "code",
  "languages": [
   "c"
  ]
 },
 {
  "id": "sys-702",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Project: SPSC Lock-Free Ring Buffer",
  "difficulty": "hard",
  "tags": [
   "project",
   "ring buffer",
   "lock-free",
   "SPSC"
  ],
  "summary": "Implement a wait-free single-producer single-consumer ring with wrap and integrity guarantees.",
  "statement": "Implement a single-producer single-consumer ring buffer of capacity 1024 bytes. `void ring_init(void)` empties it. `int ring_push(const void *data, size_t len)` writes one message (1..256 bytes, length-prefixed internally) and fails without blocking when space is short. `int ring_pop(void *out, size_t *len)` reads the oldest message or returns 0 when empty. Messages come out in FIFO order, never truncated, never corrupted, and the ring must survive continuous wrap. Tests drive it hard: alternating pushes and pops, bursts to full, drains to empty, and a 10000-message stress with per-message content checks.",
  "starter": {
   "c": "#include <assert.h>\n#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\nvoid ring_init(void);\nint ring_push(const void *data, size_t len);\nint ring_pop(void *out, size_t *len);\n\n/* TODO: implement the ring. These stubs exist only so the file links. */\nvoid ring_init(void) {}\nint ring_push(const void *data, size_t len) { (void)data; (void)len; return 0; }\nint ring_pop(void *out, size_t *len) { (void)out; (void)len; return 0; }\n"
  },
  "tests": {
   "c": "int main(void) {\n    unsigned char buf[300]; size_t len = 0;\n    ring_init();\n    const char *m = \"hello\";\n    assert(ring_push(m, 5) == 1);\n    assert(ring_pop(buf, &len) == 1 && len == 5 && memcmp(buf, m, 5) == 0);\n    assert(ring_pop(buf, &len) == 0);\n    ring_init();\n    for (int i = 0; i < 200; ++i) { unsigned char v = (unsigned char)i; assert(ring_push(&v, 1) == 1); }\n    for (int i = 0; i < 200; ++i) { assert(ring_pop(buf, &len) == 1 && len == 1 && buf[0] == (unsigned char)i); }\n    assert(ring_pop(buf, &len) == 0);\n    ring_init();\n    size_t stored = 0; unsigned char v = 0x5A;\n    while (ring_push(&v, 1)) stored++;\n    assert(stored > 0 && stored <= 1024);\n    size_t drained = 0;\n    while (ring_pop(buf, &len)) drained++;\n    assert(drained == stored);\n    ring_init();\n    for (int round = 0; round < 5; ++round) {\n        for (int i = 1; i <= 16; ++i) {\n            unsigned char tmp[64]; memset(tmp, i, (size_t)i);\n            if (ring_push(tmp, (size_t)i)) {\n                assert(ring_pop(buf, &len) == 1 && len == (size_t)i);\n                for (size_t j = 0; j < len; ++j) assert(buf[j] == i);\n            }\n        }\n    }\n    ring_init();\n    unsigned long long sum_in = 0, sum_out = 0;\n    unsigned char in[8], outb[8]; size_t mlen = 0;\n    for (int i = 0; i < 10000; ++i) {\n        memcpy(in, &i, sizeof(int));\n        while (!ring_push(in, sizeof(int))) {\n            assert(ring_pop(outb, &mlen) == 1);\n            int val; memcpy(&val, outb, sizeof(int)); sum_out += (unsigned)val;\n        }\n        sum_in += (unsigned)i;\n    }\n    int val2;\n    while (ring_pop(outb, &mlen)) { memcpy(&val2, outb, sizeof(int)); sum_out += (unsigned)val2; }\n    assert(sum_in == sum_out);\n    ring_init();\n    unsigned char huge[300]; memset(huge, 7, sizeof(huge));\n    assert(ring_push(huge, sizeof(huge)) == 0);\n    assert(ring_push(&v, 1) == 1);\n    puts(\"ALL TESTS PASSED\");\n    return 0;\n}"
  },
  "hints": [
   "Track head, tail, and a used byte count; the count makes full versus empty trivial and avoids the one slot sacrifice trick.",
   "Prefix each message with a single length byte (messages cap at 256) and do byte-level modular copies for wrap.",
   "The stress sum only matches when no message is duplicated, dropped, or reordered."
  ],
  "solution": "A byte ring with head/tail/used and one length byte per message. Push rejects when used + len + 1 exceeds capacity; pop drains the oldest frame. Modular byte copies let messages straddle the end safely.",
  "references": [],
  "kind": "code",
  "languages": [
   "c"
  ]
 },
 {
  "id": "rtl-701",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Project: Synchronous FIFO with Flags and Count",
  "difficulty": "hard",
  "tags": [
   "project",
   "FIFO",
   "pointers",
   "count"
  ],
  "summary": "Build a depth-8 synchronous FIFO with full, empty, and an exact occupancy count.",
  "statement": "Implement `fifo8` with clk, synchronous active-low rst_n, wr_en, rd_en, 8-bit wdata, 8-bit rdata, full, empty, and a 4-bit count. Depth is 8. rdata presents the oldest word combinationally while the FIFO is non-empty (fall-through read): when rd_en is high at a rising edge and the FIFO is non-empty, the oldest word is consumed. Writes while full and reads while empty are ignored and must not corrupt state. count always reports the exact occupancy. On reset everything clears. This is a subsystem project: get pointers, flags, count, and the simultaneous read/write cases all correct.",
  "starter": {
   "verilog": "module fifo8(input wire clk,input wire rst_n,input wire wr_en,input wire rd_en,input wire [7:0] wdata,output wire [7:0] rdata,output wire full,output wire empty,output reg [3:0] count);\n  // TODO: implement the FIFO\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;\n  reg clk=0, rst_n=0, wr_en=0, rd_en=0;\n  reg [7:0] wdata=0;\n  wire [7:0] rdata; wire full, empty; wire [3:0] count;\n  fifo8 dut(clk, rst_n, wr_en, rd_en, wdata, rdata, full, empty, count);\n  always #5 clk = ~clk;\n  task push(input [7:0] d); begin wr_en<=1; wdata<=d; @(posedge clk); wr_en<=0; wdata<=0; end endtask\n  task pop_expect(input [7:0] d); begin rd_en<=1; #1; if(rdata!==d) $fatal(1,\"rdata %h != %h\", rdata, d); @(posedge clk); rd_en<=0; end endtask\n  integer i;\n  initial begin\n    /* let the synchronous reset act, then check reset state */\n    repeat(2) @(posedge clk); #1;\n    if(empty!==1'b1||full!==1'b0||count!==0) $fatal(1,\"reset flags\");\n    rst_n<=1; @(posedge clk);\n    /* read while empty ignored */\n    rd_en<=1; @(posedge clk); rd_en<=0; #1;\n    if(count!==0||empty!==1'b1) $fatal(1,\"read empty changed state\");\n    /* single element: fall-through read */\n    push(8'hA5); #1;\n    if(empty!==1'b0||count!==1||rdata!==8'hA5) $fatal(1,\"single element\");\n    pop_expect(8'hA5); #1;\n    if(empty!==1'b1||count!==0) $fatal(1,\"drained\");\n    /* fill to full */\n    for(i=0;i<8;i=i+1) push(i);\n    #1; if(full!==1'b1||count!==8) $fatal(1,\"full state\");\n    /* write while full ignored */\n    wr_en<=1; wdata<=8'hFF; @(posedge clk); wr_en<=0; #1;\n    if(count!==8||rdata!==8'h00) $fatal(1,\"overflow wrote\");\n    /* drain in order */\n    for(i=0;i<8;i=i+1) pop_expect(i);\n    #1; if(empty!==1'b1||count!==0) $fatal(1,\"drain order/count\");\n    /* simultaneous read+write holds count */\n    push(8'h11); push(8'h22); #1;\n    wr_en<=1; wdata<=8'h33; rd_en<=1; @(posedge clk); wr_en<=0; rd_en<=0; #1;\n    if(count!==2) $fatal(1,\"simultaneous rw count\");\n    pop_expect(8'h22); pop_expect(8'h33);\n    /* wrap around: interleave to 40 ops, order preserved */\n    for(i=0;i<20;i=i+1) begin push(i); pop_expect(i); end\n    #1; if(count!==0||empty!==1'b1) $fatal(1,\"wrap state\");\n    $display(\"ALL TESTS PASSED\"); $finish;\n  end\nendmodule"
  },
  "hints": [
   "Keep write and read pointers one level below the count: flags and fall-through rdata are pure functions of count and rd_ptr.",
   "Gate each side separately (do_wr = wr_en && !full, do_rd = rd_en && !empty) so overflow and underflow become harmless no-ops.",
   "Simultaneous do_wr and do_rd moves both pointers but leaves count unchanged; test that case explicitly."
  ],
  "solution": "8-word memory, 3-bit wrap pointers, gated write/read strobes, exact count with a three-way case, and combinational fall-through rdata = mem[rd_ptr]. The testbench checks reset, empty read, fall-through data, fill to full, overflow protection, drain order, simultaneous read/write, and wrap-around.",
  "references": [],
  "kind": "code",
  "languages": [
   "verilog"
  ]
 },
 {
  "id": "rtl-702",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Project: Four-Way Round-Robin Arbiter",
  "difficulty": "hard",
  "tags": [
   "project",
   "arbiter",
   "round-robin",
   "fairness"
  ],
  "summary": "Build a 4-way round-robin arbiter with one-hot grants and provable fairness.",
  "statement": "Implement `rr_arb4` with clk, synchronous active-low rst_n, a 4-bit req, and a 4-bit one-hot gnt output. Grants are combinational: with no requests grant nothing; with one request grant it immediately. When several request, grant the highest-priority requester starting from the position after the last grant winner (true round-robin). After reset, requester 0 has initial priority. The priority pointer updates only on a clock edge where a grant is made. Starvation is forbidden: every requester must win within 4 contended cycles. Grant must be withdrawn combinationally when a request drops.",
  "starter": {
   "verilog": "module rr_arb4(input wire clk,input wire rst_n,input wire [3:0] req,output reg [3:0] gnt);\n  // TODO: implement the arbiter\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;\n  reg clk=0, rst_n=0; reg [3:0] req=0; wire [3:0] gnt;\n  rr_arb4 dut(clk, rst_n, req, gnt);\n  always #5 clk=~clk;\n  integer wins0=0, wins1=0, wins2=0, wins3=0, i;\n  initial begin\n    /* let the synchronous reset act, then check idle */\n    repeat(2) @(posedge clk); #1;\n    if(gnt!==4'b0000) $fatal(1,\"idle grant\");\n    rst_n<=1;\n    /* single requester granted combinationally, no pointer move without clock */\n    req<=4'b0100; #1; if(gnt!==4'b0100) $fatal(1,\"single grant\");\n    @(posedge clk); #1; if(gnt!==4'b0100) $fatal(1,\"grant held while req held\");\n    /* request drops: grant withdrawn combinationally */\n    req<=4'b0000; #1; if(gnt!==4'b0000) $fatal(1,\"grant not withdrawn\");\n    /* re-reset: the single-requester grants above moved the base pointer */\n    rst_n<=0; repeat(2) @(posedge clk); rst_n<=1;\n    /* full contention cycles 0,1,2,3 in order from reset */\n    req<=4'b1111; #1; if(gnt!==4'b0001) $fatal(1,\"first tie\");\n    @(posedge clk); #1; if(gnt!==4'b0010) $fatal(1,\"second tie\");\n    @(posedge clk); #1; if(gnt!==4'b0100) $fatal(1,\"third tie\");\n    @(posedge clk); #1; if(gnt!==4'b1000) $fatal(1,\"fourth tie\");\n    @(posedge clk); #1; if(gnt!==4'b0001) $fatal(1,\"wrap tie\");\n    /* priority resumes after last winner, not from zero */\n    req<=4'b0010; #1;\n    if(gnt!==4'b0010) $fatal(1,\"resume\");\n    @(posedge clk); req<=4'b1100; #1; if(gnt!==4'b0100) $fatal(1,\"resume order\");\n    /* fairness over 16 contended cycles: everyone wins exactly 4 */\n    req<=4'b1111;\n    @(posedge clk); #1; /* resume contention */\n    for(i=0;i<16;i=i+1) begin\n      case (gnt)\n        4'b0001: wins0=wins0+1; 4'b0010: wins1=wins1+1;\n        4'b0100: wins2=wins2+1; 4'b1000: wins3=wins3+1;\n        default: $fatal(1,\"bad grant\");\n      endcase\n      @(posedge clk); #1;\n    end\n    if(wins0!==4||wins1!==4||wins2!==4||wins3!==4)\n      $fatal(1,\"unfair %0d %0d %0d %0d\", wins0, wins1, wins2, wins3);\n    /* sparse masks respect rotation */\n    req<=4'b1010; #1;\n    if(gnt!==4'b0010 && gnt!==4'b1000) $fatal(1,\"mask grant\");\n    req<=4'b0000; repeat(2) @(posedge clk);\n    if(gnt!==4'b0000) $fatal(1,\"idle at end\");\n    $display(\"ALL TESTS PASSED\"); $finish;\n  end\nendmodule"
  },
  "hints": [
   "Rotate the request vector by the base pointer, find the lowest set bit in rotated space, then rotate the grant back; a one-hot case table keeps it fully combinational.",
   "Update the base pointer only on edges where gnt is non-zero, setting it to winner + 1 mod 4.",
   "Fairness follows from always resuming after the last winner; the 16-cycle contention loop must give each requester exactly 4 grants."
  ],
  "solution": "Combinational rotate-priority-rotate grant network plus a 2-bit base register advanced only on granted edges. The testbench checks idle, single requester, combinational withdrawal, tie order from reset, priority resume, exact 4-way fairness over 16 cycles, and sparse request masks.",
  "references": [],
  "kind": "code",
  "languages": [
   "verilog"
  ]
 },
 {
  "id": "math-701",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Project: Exact Linear Solver with Fractions",
  "difficulty": "hard",
  "tags": [
   "project",
   "linear algebra",
   "exact arithmetic",
   "python"
  ],
  "summary": "Solve Ax=b with exact rational arithmetic via Gaussian elimination.",
  "statement": "Implement `solve_exact(A, b)` in Python using only the `fractions.Fraction` type for arithmetic. A is an n×n list of integer rows, b a length-n integer list. Return the solution as a list of Fractions satisfying A@x == b exactly. Raise ValueError(\"singular\") when the matrix is singular. Use Gaussian elimination with partial pivoting (swap to a nonzero pivot). Do not use floats, numpy, or sympy anywhere — every operation must be exact.",
  "starter": {
   "python": "from fractions import Fraction\n\ndef solve_exact(A, b):\n    \"\"\"Solve Ax=b exactly. Raise ValueError(\"singular\") if no unique solution.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "from fractions import Fraction\n\ndef matvec(A, x):\n    return [sum(A[i][j] * x[j] for j in range(len(x))) for i in range(len(A))]\n\nx = solve_exact([[2, 1], [1, 3]], [5, 10])\nassert matvec([[2, 1], [1, 3]], x) == [Fraction(5), Fraction(10)]\nassert x[0] == Fraction(1) and x[1] == Fraction(3)\n\nx = solve_exact([[1, 1, 1], [0, 2, 5], [2, 5, -1]], [6, -4, 27])\nassert x == [Fraction(5), Fraction(3), Fraction(-2)]\n\ntry:\n    solve_exact([[1, 2], [2, 4]], [3, 6])\n    assert False, \"expected singular\"\nexcept ValueError as e:\n    assert str(e) == \"singular\"\n\ntry:\n    solve_exact([[0, 0], [0, 0]], [1, 2])\n    assert False\nexcept ValueError:\n    pass\n\nx = solve_exact([[0, 1], [1, 0]], [7, 9])\nassert x == [Fraction(9), Fraction(7)]\n\nbig = [[10**12 + 3, 7], [5, 10**12 - 2]]\nxb = [10**12 + 10, 10**12 - 10]\nx = solve_exact(big, xb)\nassert matvec(big, x) == [Fraction(v) for v in xb]\n\nx = solve_exact([[3]], [12])\nassert x == [Fraction(4)]\n\nimport random\nrandom.seed(42)\nfor _ in range(5):\n    n = 4\n    while True:\n        A = [[random.randint(-9, 9) for _ in range(n)] for _ in range(n)]\n        xt = [Fraction(random.randint(-9, 9)) for _ in range(n)]\n        b = [sum(A[i][j] * xt[j] for j in range(n)) for i in range(n)]\n        try:\n            got = solve_exact(A, b)\n            break\n        except ValueError:\n            continue\n    assert got == xt\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Work on an augmented matrix of Fractions and eliminate column by column; normalizing each pivot row to 1 keeps the back substitution trivial.",
   "Partial pivoting here only needs a nonzero pivot (exact arithmetic has no rounding to fight), and a missing pivot means singular.",
   "Verify by construction: build random A and x, compute b = A@x, then check the solver returns exactly x."
  ],
  "solution": "Gauss-Jordan elimination over Fractions: augment, pivot on the first nonzero entry in each column, normalize, eliminate everywhere, and read off the last column. Singularity is a column with no nonzero pivot.",
  "references": [],
  "kind": "code",
  "languages": [
   "python"
  ]
 },
 {
  "id": "math-702",
  "track": "math",
  "branch": "Number Theory",
  "title": "Project: Karatsuba Multiplication",
  "difficulty": "hard",
  "tags": [
   "project",
   "karatsuba",
   "divide and conquer",
   "python"
  ],
  "summary": "Multiply 100-digit integers with the recursive Karatsuba algorithm, no * operator.",
  "statement": "Implement `karatsuba(x, y)` in Python that multiplies two nonnegative integers without using the * operator on integers (addition, subtraction, bit-shifting by powers of ten via string or digit-list manipulation, and // and % by powers of 10 are allowed; using * only for single-digit products up to 9x9 is permitted as the base case). The recursive step: for n-digit numbers split at m = n//2, x = a*10^m + b, y = c*10^m + d, compute ac, bd, and (a+b)(c+d), then combine ac*10^(2m) + ((a+b)(c+d) - ac - bd)*10^m + bd. Tests include 100-digit operands compared against Python's built-in multiplication.",
  "starter": {
   "python": "def karatsuba(x, y):\n    \"\"\"Multiply nonnegative integers x and y without the * operator.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert karatsuba(0, 0) == 0\nassert karatsuba(0, 12345) == 0\nassert karatsuba(7, 8) == 56\nassert karatsuba(12, 13) == 156\nassert karatsuba(99, 99) == 9801\nassert karatsuba(1234, 5678) == 1234 * 5678\nassert karatsuba(10**20, 10**20) == 10**40\nassert karatsuba(10**20 + 1, 10**20 + 1) == (10**20 + 1) * (10**20 + 1)\nbig1 = int(\"9\" * 100)\nbig2 = int(\"8\" * 100)\nassert karatsuba(big1, big2) == big1 * big2\nassert karatsuba(123456789, 987654321) == 123456789 * 987654321\nimport random\nrandom.seed(7)\nfor _ in range(10):\n    a = random.randrange(10**30, 10**50)\n    b = random.randrange(10**30, 10**50)\n    assert karatsuba(a, b) == a * b\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Split both operands at m = half the digit count with divmod by 10^m, and recurse three times: ac, bd, and (a+b)(c+d).",
   "The middle term is (a+b)(c+d) minus ac minus bd, so three multiplications replace four.",
   "Multiplying by a power of ten is an append-zeros operation, not a real multiplication."
  ],
  "solution": "Recursive three-multiplication decomposition with a single-digit base case; recombination uses only addition, subtraction, and decimal shifting.",
  "references": [],
  "kind": "code",
  "languages": [
   "python"
  ]
 },
 {
  "id": "quant-701",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Project: Seeded Monte Carlo Asian Option Pricer",
  "difficulty": "hard",
  "tags": [
   "project",
   "monte carlo",
   "options",
   "python"
  ],
  "summary": "Price an Asian call with your own seeded RNG: deterministic, convergent, edge-case safe.",
  "statement": "Implement `asian_call_price(S0, K, r, sigma, T, steps, paths, seed)` in Python WITHOUT importing random/numpy. First implement a linear congruential generator `lcg_uniform(seed)` producing U(0,1) values, then Box-Muller for normals. Simulate `paths` geometric Brownian motion paths with `steps` time steps each: S(t+dt) = S(t) * exp((r - sigma^2/2)dt + sigma*sqrt(dt)*Z). The payoff of one path is max(mean(S path) - K, 0); return the discounted mean payoff exp(-r*T) * mean(payoffs). The same seed must reproduce the same price exactly. When sigma == 0 the result must equal the deterministic closed form: exp(-rT) * max(S0 * (exp(rT) - 1) / (rT) - K, 0) for r != 0 (and max(S0 - K, 0) when r == 0).",
  "starter": {
   "python": "def asian_call_price(S0, K, r, sigma, T, steps, paths, seed):\n    \"\"\"Monte Carlo price of an arithmetic Asian call. Deterministic in seed.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "import math\n\np1 = asian_call_price(100, 100, 0.05, 0.2, 1.0, 100, 4000, 42)\np2 = asian_call_price(100, 100, 0.05, 0.2, 1.0, 100, 4000, 42)\nassert p1 == p2\n\np3 = asian_call_price(100, 100, 0.05, 0.2, 1.0, 100, 4000, 43)\nassert p3 != p1\n\nassert 4.0 < p1 < 9.0\n\ndet = asian_call_price(100, 90, 0.05, 0.0, 1.0, 100, 100, 1)\nexpect = math.exp(-0.05) * max(100 * (math.exp(0.05) - 1) / 0.05 - 90, 0)\nassert abs(det - expect) < 1e-12\n\ndet0 = asian_call_price(100, 95, 0.0, 0.0, 1.0, 100, 100, 1)\nassert det0 == 5.0\n\notm = asian_call_price(100, 10000, 0.05, 0.2, 1.0, 100, 1000, 7)\nassert otm == 0.0\n\ndeep_itm = asian_call_price(100, 1, 0.05, 0.0, 1.0, 100, 100, 1)\nexp2 = math.exp(-0.05) * max(100 * (math.exp(0.05) - 1) / 0.05 - 1, 0)\nassert abs(deep_itm - exp2) < 1e-12\n\nvol_up = asian_call_price(100, 100, 0.05, 0.4, 1.0, 100, 4000, 42)\nassert vol_up > p1\n\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "The LCG x_{n+1} = 48271 * x_n mod 2^31 - 1 with a protected seed gives portable, reproducible uniforms.",
   "Box-Muller needs u1 strictly positive; guard the log. Precompute drift and diffusion factors once per call.",
   "Zero volatility is not a simulation at all: the path mean of exp(rt) is (exp(rT) - 1) / (rT), so return the closed form."
  ],
  "solution": "Own LCG plus Box-Muller normals, GBM stepping with precomputed drift/diffusion, arithmetic mean payoff, discounting, and exact deterministic branches for sigma == 0. Tests lock reproducibility, seed sensitivity, a sane price band, deterministic limits, deep out-of-the-money zero, and volatility monotonicity.",
  "references": [],
  "kind": "code",
  "languages": [
   "python"
  ]
 },
 {
  "id": "quant-702",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Project: Stationary Distribution by Power Iteration",
  "difficulty": "hard",
  "tags": [
   "project",
   "markov chains",
   "power iteration",
   "python"
  ],
  "summary": "Compute the stationary distribution of any ergodic Markov chain to 1e-12 tolerance.",
  "statement": "Implement `stationary(P, tol=1e-12, max_iter=100000)` in Python. P is an n×n row-stochastic transition matrix (rows sum to 1). Compute the stationary distribution pi (pi = pi @ P, sums to 1) by power iteration from the uniform start: repeatedly apply v = v @ P until the L1 change is below tol. Return the distribution as a list of floats. Raise ValueError(\"not row-stochastic\") if any row's probabilities are negative or does not sum to 1 within 1e-9. Raise ValueError(\"no convergence\") if the iteration does not converge (absorbing or periodic chains may fail this, and that is acceptable). Do not use numpy.",
  "starter": {
   "python": "def stationary(P, tol=1e-12, max_iter=100000):\n    \"\"\"Stationary distribution of a row-stochastic matrix via power iteration.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "pi = stationary([[0.8, 0.2], [0.5, 0.5]])\nassert abs(pi[0] - 5/7) < 1e-9 and abs(pi[1] - 2/7) < 1e-9\n\npi = stationary([[0.25] * 4 for _ in range(4)])\nassert all(abs(x - 0.25) < 1e-12 for x in pi)\n\nP = [[0.5, 0.5, 0.0], [0.25, 0.5, 0.25], [0.0, 0.5, 0.5]]\npi = stationary(P, tol=1e-9)\nassert abs(pi[0] - 0.25) < 1e-6 and abs(pi[1] - 0.5) < 1e-6 and abs(pi[2] - 0.25) < 1e-6\n\nP_periodic = [[0.0, 0.5, 0.5], [1.0, 0.0, 0.0], [1.0, 0.0, 0.0]]\ntry:\n    stationary(P_periodic, tol=1e-14, max_iter=200)\n    assert False, \"expected no convergence\"\nexcept ValueError as e:\n    assert str(e) == \"no convergence\"\n\nI = [[1.0, 0.0], [0.0, 1.0]]\npi = stationary(I)\nassert pi == [0.5, 0.5]\n\nP_abs = [[0.9, 0.1, 0.0], [0.0, 0.9, 0.1], [0.0, 0.0, 1.0]]\npi = stationary(P_abs)\nassert abs(pi[2] - 1.0) < 1e-6\n\ntry:\n    stationary([[0.5, 0.4], [0.2, 0.8]])\n    assert False\nexcept ValueError as e:\n    assert str(e) == \"not row-stochastic\"\n\ntry:\n    stationary([[1.2, -0.2], [0.5, 0.5]])\n    assert False\nexcept ValueError as e:\n    assert str(e) == \"not row-stochastic\"\n\nP = [[0.99, 0.01], [0.01, 0.99]]\npi = stationary(P)\nassert abs(pi[0] - 0.5) < 1e-9 and abs(pi[1] - 0.5) < 1e-9\n\nP = [[0.5, 0.5, 0.0], [0.25, 0.5, 0.25], [0.0, 0.5, 0.5]]\npi = stationary(P)\nassert all(x > 0 for x in pi) and abs(sum(pi) - 1) < 1e-12\nleft = [sum(pi[i] * P[i][j] for i in range(3)) for j in range(3)]\nassert all(abs(left[j] - pi[j]) < 1e-9 for j in range(3))\n\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Validate first: reject negative entries and rows not summing to 1, before iterating anything.",
   "One iteration is a vector-matrix product: new_v[j] = sum over i of v[i] * P[i][j]. Track the L1 distance between successive vectors.",
   "Absorbing chains still converge (to the sink); only periodic dynamics fail, and that is what the max_iter guard is for."
  ],
  "solution": "Row-stochastic validation, uniform start, iterate v = v @ P until the L1 delta drops below tolerance, normalize, and raise on non-convergence. Tests cover the 5/7 two-state chain, uniform fixed points, identity, an absorbing chain converging to the sink, a genuinely periodic chain that cannot converge, validation failures, slow mixing, and a three-state consistency check pi == pi @ P.",
  "references": [],
  "kind": "code",
  "languages": [
   "python"
  ]
 },
 {
  "id": "iq-701",
  "track": "interview",
  "branch": "Quant & Trading",
  "title": "Project Design: Build a Limit Order Book",
  "difficulty": "hard",
  "tags": [
   "project",
   "order book",
   "market microstructure",
   "design"
  ],
  "summary": "A complete subsystem design: price-time priority matching, cancels, self-trade prevention, and the data structures that make each O(1).",
  "statement": "Design a limit order book for one instrument supporting add, cancel, and match at microsecond latency. Specify: the exact data structures per side, how price-time priority is enforced, what happens on a marketable limit order sweeping three price levels, how cancels stay O(1), how trades are reported, and how you prevent a firm from trading with itself. Follow-ups: how do you recover the book after a gateway drops messages mid-day, and what invariants would you assert in a deterministic replay test?",
  "kind": "answer",
  "answer": null,
  "hints": [
   "Two structures per side, not one: a price-ordered map from price to a FIFO queue of orders, plus an id-indexed map for O(1) cancel lookup.",
   "Matching is a loop, not a lookup: while the incoming order has quantity and crosses the best opposite price, pop from the head of that queue.",
   "Self-trade prevention needs the firm id checked before every head-of-queue match, with a documented policy for what happens to the skipped order."
  ],
  "solution": "Per side keep a sorted price map (std::map or a price-indexed array for bounded tick ranges) from price level to an intrusive FIFO queue of order nodes, plus an unordered_map from order id to node pointer. Add is O(log levels) for the map insert and O(1) queue push; cancel is O(1) via the id map plus queue unlink, marking the level empty so the price map entry can be erased lazily. A marketable limit order loops: compare its limit against the best opposite price, pop from the head queue, emit a trade report (price is the RESTING order's price, price-time priority means the book always executes against the oldest order at the best price first), decrement quantities, and advance to the next level when the head empties, until the incoming order is filled or no longer crosses; any remainder rests in the book at its limit. Self-trade prevention: before matching the head order, compare firm ids; on a match, apply the venue policy (cancel the resting, cancel the incoming, or cancel the older) and log it, never silently skip. Recovery: sequence every message; on a gap, stop, request a snapshot-plus-incremental feed, rebuild from the snapshot, and replay incrementals from the snapshot sequence number. Replay-test invariants: book quantities are never negative, best bid is strictly below best ask after every applied message, the sum of queue sizes per level equals the level's aggregate quantity, and re-simulating the full day reproduces the exact final book hash.",
  "votes": {
   "up": 52,
   "down": 1
  },
  "references": [
   {
    "label": "Order book",
    "url": "https://en.wikipedia.org/wiki/Order_book"
   },
   {
    "label": "Order (exchange)",
    "url": "https://en.wikipedia.org/wiki/Order_(exchange)"
   },
   {
    "label": "Market microstructure",
    "url": "https://en.wikipedia.org/wiki/Market_microstructure"
   }
  ]
 },
 {
  "id": "iq-702",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Project Design: Verify a Cache-Coherent Multicore",
  "difficulty": "hard",
  "tags": [
   "project",
   "verification",
   "cache coherence",
   "testplan"
  ],
  "summary": "A weeks-long verification architecture: scoreboards, formal properties, stimulus, and coverage for a MESI fabric.",
  "statement": "You own verification for a 4-core chip with MESI-coherent L1s, a shared L2, and a directory. Lay out the complete verification project: the testbench architecture, how you model coherence goldenly, the stimulus plan from directed to constrained-random, the formal and simulation assertions that catch real coherence bugs, the coverage that tells you when you are done, and how you debug a failure that appears once per billion cycles. Follow-ups: how do you verify fence ordering, and what changes when the design adds a non-blocking cache with 8 MSHRs?",
  "kind": "answer",
  "answer": null,
  "hints": [
   "Two checkers beat one: a per-observer data-value scoreboard plus protocol-level assertions on the directory transitions.",
   "The golden model does not need to be fast: a serialized memory model that defines one legal outcome for every read is enough.",
   "A once-per-billion-cycle failure is a coverage problem first; reproduce it by biasing stimulus toward the hole it reveals, then shrink the trace."
  ],
  "solution": "Architecture: a UVM-style environment per core plus a fabric monitor. Each core agent drives loads, stores, and fences with programmable address pools engineered for sharing (same-line, same-set, and false-sharing pools). The golden reference is a serialized memory model: every read snooped by the checker must return the value of the most recent globally observed write to that address in the monitor's total order, which is exactly the coherence definition (single-writer-multiple-reader). A second checker tracks per-line MESI states across agents and flags illegal combinations (two Modified copies, Modified while another core reads stale Shared data, a write completing without a visible invalidate). Simulation assertions: no data return without the line in a valid state, no write-back of a line the core no longer owns, fence drain before subsequent loads retire. Formal: prove directory state-machine deadlock freedom and the single-owner invariant on the directory alone, which is tractable even when full-chip formal is not. Stimulus: directed tests for every MESI transition and every race window (upgrade vs write-back, snoop during eviction), then constrained-random with weighted address reuse, random delays in the interconnect model, and random MSHR pressure. Coverage: transition coverage on every agent's state machine, cross coverage of simultaneous transitions on two cores, and scenario coverage for each named race. Rare-failure methodology: log the monitor's total order continuously; on failure, bisect the log to the first invariant violation (not the first symptom), then re-run with seeds biased toward that window, and add the new scenario to coverage. Fences: inject address-disjoint traffic around fences and assert no load after the fence observes data older than any write before it. With 8 MSHRs per core, the monitor must track up to 8 outstanding misses per core, assertions become per-MSHR state machines, and the golden model must allow reordering within the memory model's rules rather than a single global completion order.",
  "votes": {
   "up": 47,
   "down": 2
  },
  "references": [
   {
    "label": "MESI protocol",
    "url": "https://en.wikipedia.org/wiki/MESI_protocol"
   },
   {
    "label": "Cache coherence",
    "url": "https://en.wikipedia.org/wiki/Cache_coherence"
   },
   {
    "label": "Functional verification",
    "url": "https://en.wikipedia.org/wiki/Functional_verification"
   }
  ]
 }
]);
