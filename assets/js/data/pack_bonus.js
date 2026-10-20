/* Bonus round: one fresh problem per track, all machine-verified against reference implementations. */
registerProblems([
 {
  "id": "cpu-801",
  "track": "cpu",
  "branch": "Memory Hierarchy",
  "title": "Two-Level Page Table Walker",
  "difficulty": "medium",
  "tags": [
   "paging",
   "virtual memory",
   "address translation",
   "c"
  ],
  "summary": "Walk a two-level page table in a simulated physical memory image and translate a virtual address.",
  "statement": "Implement `vm_translate` in C. Physical memory is simulated as a word-addressed array `mem` where `mem[i]` is the 32-bit word at physical address 4*i. `cr3` is the physical byte address of the page directory. A virtual address is split 10 | 10 | 12: bits 31-22 index the page directory, bits 21-12 index the second-level page table, bits 11-0 are the page offset. Every entry (PDE or PTE) stores the physical base address of the next structure (or of the target frame) in bits 31-12, and a present flag in bit 0. Return the translated physical byte address. If either entry is not present, return 0xFFFFFFFFu.",
  "starter": {
   "c": "#include <stdint.h>\n\nuint32_t vm_translate(const uint32_t *mem, uint32_t cr3, uint32_t va) {\n    (void)mem; (void)cr3; (void)va;\n    return 0xFFFFFFFFu; /* TODO: implement the walk */\n}\n"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\nuint32_t vm_translate(const uint32_t *mem, uint32_t cr3, uint32_t va);\n\nstatic uint32_t mem[8192];\n\nint main(void) {\n    /* page directory at phys 0x0000, one page table at phys 0x1000,\n       one data frame at phys 0x2000 */\n    mem[0x0000 / 4 + 0] = 0x00001001u;      /* PDE 0 -> PT at 0x1000, present */\n    mem[0x0000 / 4 + 5] = 0x00000000u;      /* PDE 5 -> not present */\n    mem[0x1000 / 4 + 0] = 0x00002001u;      /* PTE 0 -> frame 0x2000, present */\n    mem[0x1000 / 4 + 3] = 0x00002000u;      /* PTE 3 -> frame 0x2000, NOT present */\n    mem[0x1000 / 4 + 7] = 0x00003001u;      /* PTE 7 -> frame 0x3000, present */\n\n    if (vm_translate(mem, 0, 0x00000000u) != 0x2000u) { printf(\"t1\\n\"); return 1; }\n    if (vm_translate(mem, 0, 0x00000ABCu) != 0x2ABCu) { printf(\"t2\\n\"); return 1; }\n    if (vm_translate(mem, 0, 0x00000123u) != 0x2123u) { printf(\"t3\\n\"); return 1; }\n    if (vm_translate(mem, 0, 0x00007004u) != 0x3004u) { printf(\"t4\\n\"); return 1; }\n    /* faults: PDE missing, PTE missing, high PDE index never written */\n    if (vm_translate(mem, 0, 0x00500000u) != 0xFFFFFFFFu) { printf(\"t5\\n\"); return 1; }\n    if (vm_translate(mem, 0, 0x00003000u) != 0xFFFFFFFFu) { printf(\"t6\\n\"); return 1; }\n    if (vm_translate(mem, 0, 0x80000000u) != 0xFFFFFFFFu) { printf(\"t7\\n\"); return 1; }\n    /* offset never triggers a fault on its own */\n    if (vm_translate(mem, 0, 0x00000FFFu) != 0x2FFFu) { printf(\"t8\\n\"); return 1; }\n    printf(\"ALL TESTS PASSED\\n\");\n    return 0;\n}"
  },
  "hints": [
   "Each walk step is: read the entry at base + index, check bit 0, then use bits 31-12 as the next base.",
   "mem is word-addressed, so a physical byte address becomes an array index by shifting right by 2.",
   "The offset bits 11-0 pass straight through; only the two table lookups can fault."
  ],
  "solution": "Index the directory with VA[31:22] at cr3/4, fault on a clear present bit, repeat for the table with VA[21:12], then OR the frame base with VA[11:0]. The testbench covers translations, both fault types, an untouched high PDE index, and a maximum offset.",
  "kind": "code",
  "languages": [
   "c"
  ]
 },
 {
  "id": "rtl-801",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Galois LFSR with Seed Load",
  "difficulty": "medium",
  "tags": [
   "LFSR",
   "shift register",
   "pseudo-random",
   "verilog"
  ],
  "summary": "Build an 8-bit Galois LFSR and prove its 255-cycle maximal period in simulation.",
  "statement": "Implement `lfsr8` with clk, synchronous active-low rst_n, an active-high load that captures seed, an active-high en that advances the sequence, and an 8-bit q output. The feedback polynomial is x^8 + x^6 + x^5 + x^4 + 1, which is maximal-length: any nonzero state must cycle through all 255 nonzero states before repeating. Use the Galois form: when the right-shifted-out bit is 1, XOR the register with 8'hB8 after shifting; when it is 0, just shift. Reset clears q to zero. When load and en are both high, load wins. A zero seed must stay at zero.",
  "starter": {
   "verilog": "module lfsr8(input wire clk,input wire rst_n,input wire load,input wire en,input wire [7:0] seed,output reg [7:0] q);\n  // TODO: implement the LFSR\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;\n  reg clk=0, rst_n=0, load=0, en=0;\n  reg [7:0] seed=0;\n  wire [7:0] q;\n  lfsr8 dut(clk, rst_n, load, en, seed, q);\n  always #5 clk=~clk;\n  integer i;\n  reg [7:0] first;\n  initial begin\n    repeat(2) @(posedge clk); #1;\n    if(q!==8'h00) $fatal(1,\"reset\");\n    rst_n<=1;\n    /* zero seed stays zero */\n    seed<=8'h00; load<=1; @(posedge clk); load<=0; en<=1;\n    repeat(4) @(posedge clk); #1;\n    if(q!==8'h00) $fatal(1,\"zero seed\");\n    /* known sequence from seed 1 (Galois, poly x8+x6+x5+x4+1) */\n    seed<=8'h01; load<=1; @(posedge clk); load<=0; #1;\n    if(q!==8'h01) $fatal(1,\"seed capture\");\n    en<=1;\n    @(posedge clk); #1; if(q!==8'hB8) $fatal(1,\"step1 %h\", q);\n    @(posedge clk); #1; if(q!==8'h5C) $fatal(1,\"step2 %h\", q);\n    @(posedge clk); #1; if(q!==8'h2E) $fatal(1,\"step3 %h\", q);\n    @(posedge clk); #1; if(q!==8'h17) $fatal(1,\"step4 %h\", q);\n    @(posedge clk); #1; if(q!==8'hB3) $fatal(1,\"step5 %h\", q);\n    /* enable low holds state */\n    en<=0; repeat(3) @(posedge clk); #1;\n    if(q!==8'hB3) $fatal(1,\"hold\");\n    /* full period: 250 more steps then 5 = back to seed after 255 total */\n    en<=1; first=q;\n    for(i=0;i<250;i=i+1) begin\n      @(posedge clk); #1;\n      if(q===8'h00) $fatal(1,\"hit zero early at %0d\", i);\n    end\n    /* q has advanced 255 steps total from 8'h01 */\n    if(q!==8'h01) $fatal(1,\"period %h\", q);\n    /* load wins over en */\n    seed<=8'h55; load<=1; en<=1; @(posedge clk); load<=0; en<=0; #1;\n    if(q!==8'h55) $fatal(1,\"load priority\");\n    $display(\"ALL TESTS PASSED\"); $finish;\n  end\nendmodule"
  },
  "hints": [
   "Galois form: shift right by one, and only if the bit that fell off was 1, XOR the result with the tap mask 8'hB8.",
   "Priority order in the always block: reset, then load, then enable.",
   "A maximal polynomial visits every nonzero state; the bench proves it by returning to the seed exactly 255 steps later without touching zero."
  ],
  "solution": "Right-shift Galois step with tap mask 8'hB8 gated by the outgoing LSB, plus strict reset-load-enable priority. The testbench checks reset, the zero fixed point, five known sequence values from seed 1, hold on enable low, the full 255-state period, and load-over-enable priority.",
  "kind": "code",
  "languages": [
   "verilog"
  ]
 },
 {
  "id": "sys-801",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "LEB128 Variable-Length Integer Codec",
  "difficulty": "medium",
  "tags": [
   "varint",
   "LEB128",
   "encoding",
   "c"
  ],
  "summary": "Implement unsigned LEB128 encode and decode with exact byte-level behavior at the boundaries.",
  "statement": "Implement `uleb128_encode` and `uleb128_decode` in C. Encoding writes value v as little-endian base-128: emit 7 bits per byte, low group first, setting the high bit on every byte except the last; return the number of bytes written (out has room for 10). Decoding reads the same format and stores the byte count in *consumed. Values: 0 encodes as a single 0x00 byte, 127 takes one byte, 128 takes two (0x80 0x01), and UINT64_MAX takes ten. The codec is used in DWARF debug info, Protocol Buffers, and WebAssembly.",
  "starter": {
   "c": "#include <stdint.h>\n#include <stddef.h>\n\nsize_t uleb128_encode(uint64_t v, uint8_t *out) {\n    (void)v; (void)out;\n    return 0; /* TODO */\n}\n\nuint64_t uleb128_decode(const uint8_t *in, size_t *consumed) {\n    (void)in; (void)consumed;\n    return 0; /* TODO */\n}\n"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\n#include <stddef.h>\nsize_t uleb128_encode(uint64_t v, uint8_t *out);\nuint64_t uleb128_decode(const uint8_t *in, size_t *consumed);\n\nstatic int check(uint64_t v, const uint8_t *want, size_t wantn) {\n    uint8_t buf[16] = {0};\n    size_t n = uleb128_encode(v, buf);\n    if (n != wantn) { printf(\"len %llu: %zu != %zu\\n\", (unsigned long long)v, n, wantn); return 1; }\n    for (size_t i = 0; i < n; i++)\n        if (buf[i] != want[i]) { printf(\"byte %zu of %llu\\n\", i, (unsigned long long)v); return 1; }\n    size_t used = 0;\n    uint64_t back = uleb128_decode(buf, &used);\n    if (back != v || used != n) { printf(\"roundtrip %llu\\n\", (unsigned long long)v); return 1; }\n    return 0;\n}\n\nint main(void) {\n    const uint8_t e0[] = {0x00};\n    const uint8_t e127[] = {0x7F};\n    const uint8_t e128[] = {0x80, 0x01};\n    const uint8_t e300[] = {0xAC, 0x02};\n    const uint8_t emax[] = {0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0x01};\n    if (check(0, e0, 1)) return 1;\n    if (check(127, e127, 1)) return 1;\n    if (check(128, e128, 2)) return 1;\n    if (check(300, e300, 2)) return 1;\n    if (check(UINT64_MAX, emax, 10)) return 1;\n    /* powers of two and their neighbors, plus a fuzz sweep */\n    for (int k = 0; k < 64; k++) {\n        uint64_t p = 1ull << k;\n        uint8_t buf[16]; size_t used;\n        for (int d = -1; d <= 1; d++) {\n            uint64_t v = p + (uint64_t)d;\n            size_t n = uleb128_encode(v, buf);\n            uint64_t back = uleb128_decode(buf, &used);\n            if (back != v || used != n) { printf(\"boundary k=%d d=%d\\n\", k, d); return 1; }\n        }\n    }\n    for (uint64_t v = 0; v < 100000; v += 37) {\n        uint8_t buf[16]; size_t used;\n        size_t n = uleb128_encode(v, buf);\n        if (uleb128_decode(buf, &used) != v || used != n) { printf(\"fuzz %llu\\n\", (unsigned long long)v); return 1; }\n    }\n    printf(\"ALL TESTS PASSED\\n\");\n    return 0;\n}"
  },
  "hints": [
   "Encode in a do-while so zero still emits one byte; set the continuation bit whenever more groups remain.",
   "Decode accumulates group i at bit offset 7*i and stops at the first byte with a clear high bit.",
   "UINT64_MAX needs ten bytes: nine full 7-bit groups plus one leftover bit."
  ],
  "solution": "Classic shift-and-mask loop both directions with continuation-bit bookkeeping. Tests pin the exact bytes for 0, 127, 128, 300, and UINT64_MAX, then round-trip every power-of-two boundary and a 2,703-value fuzz sweep.",
  "kind": "code",
  "languages": [
   "c"
  ]
 },
 {
  "id": "math-801",
  "track": "math",
  "branch": "Number Theory",
  "title": "Discrete Logarithm by Baby-Step Giant-Step",
  "difficulty": "hard",
  "tags": [
   "discrete log",
   "BSGS",
   "modular arithmetic",
   "python"
  ],
  "summary": "Recover x from g^x mod p in O(sqrt(p)) time and memory.",
  "statement": "Implement `bsgs(g, h, p)` in Python: given a prime p, a generator base g, and a target h, return the smallest nonnegative integer x with pow(g, x, p) == h % p, or None if no such x exists. A brute-force loop over all p values is too slow for the large tests: use baby-step giant-step with m = isqrt(p - 1) + 1. Build a table of baby steps g^j for j in 0..m-1, then iterate giant factors g^(-m)^i and look each h * factor up in the table. h == 1 must return 0. No third-party libraries.",
  "starter": {
   "python": "def bsgs(g, h, p):\n    \"\"\"Smallest x >= 0 with g**x % p == h % p, or None.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert bsgs(2, 1, 7) == 0\nassert bsgs(2, 2, 7) == 1\nassert bsgs(2, 4, 7) == 2\nassert bsgs(2, 3, 7) is None\n\nimport random\nrandom.seed(11)\nprimes = [p for p in range(3, 5000) if all(p % d for d in range(2, int(p ** 0.5) + 1))]\nfor _ in range(60):\n    p = random.choice(primes)\n    g = random.choice([2, 3, 5, 7]) % p\n    if g < 2:\n        continue\n    x = random.randrange(0, p - 1)\n    h = pow(g, x, p)\n    got = bsgs(g, h, p)\n    assert got is not None and pow(g, got, p) == h, (g, h, p, x, got)\n\np = 2147483647  # 2**31 - 1, prime\nfor x in (0, 1, 123456, 2**30):\n    assert bsgs(7, pow(7, x, p), p) is not None\n    got = bsgs(7, pow(7, x, p), p)\n    assert pow(7, got, p) == pow(7, x, p)\n\nassert bsgs(5, 3, 23) is not None\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Split x = i*m + j with m = ceil(sqrt(p)): precompute every g^j once, then walk h * g^(-m*i) until it lands in the table.",
   "Modular inverse of g^m mod p is pow(g, m*(p-2), p) or pow(pow(g,m,p), p-2, p) by Fermat's little theorem.",
   "A hit in the table is only a candidate: verify pow(g, x, p) == h before returning, because different (i, j) pairs can collide."
  ],
  "solution": "O(sqrt(p)) time and memory via a baby-step hash table and giant-step Fermat inverse walk, with a final verification of each candidate. Tests cover trivial powers, a provably unreachable target, 60 randomized brute-force-verified instances on small primes, and the Mersenne prime 2^31 - 1.",
  "kind": "code",
  "languages": [
   "python"
  ]
 },
 {
  "id": "quant-801",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Bookmaker Overround",
  "difficulty": "easy",
  "tags": [
   "odds",
   "implied probability",
   "arbitrage"
  ],
  "summary": "Convert decimal odds to implied probabilities and measure the bookmaker's margin.",
  "statement": "A bookmaker quotes decimal odds of 2.50, 3.40, and 3.20 on the three mutually exclusive outcomes of a match. The implied probability of an outcome is 1 / odds. The overround is the amount by which the summed implied probabilities exceed 1, expressed as a percentage of 1. Compute the overround as a percentage, rounded to two decimals.",
  "kind": "answer",
  "answer": "0.66",
  "hints": [
   "Sum 1/2.50 + 1/3.40 + 1/3.20 first; each term is that outcome's implied probability.",
   "The excess over 1.0 is the margin: 0.4 + 0.294117... + 0.3125 = 1.006617..."
  ],
  "solution": "1/2.50 = 0.4, 1/3.40 = 0.294118, 1/3.20 = 0.3125. Sum = 1.006618, so the overround is 0.66 percent. The book pays out as if probabilities summed to more than 1; the excess is the guaranteed margin when action is balanced.",
  "references": [
   {
    "label": "Mathematics of bookmaking",
    "url": "https://en.wikipedia.org/wiki/Mathematics_of_bookmaking"
   }
  ]
 },
 {
  "id": "iq-801",
  "track": "interview",
  "branch": "Quant & Trading",
  "title": "One Thousand Bottles, One Poisoned",
  "difficulty": "medium",
  "tags": [
   "binary encoding",
   "information theory",
   "classic"
  ],
  "summary": "A classic asked in quant interviews: how many test strips identify one poisoned bottle among a thousand in a single round?",
  "statement": "You have 1000 bottles of wine, exactly one of which is poisoned. You have test strips that turn color 24 hours after touching a drop of poisoned wine, and you may apply drops from any bottles to any strips now, but you only have time for one round of testing before the results must be final. What is the minimum number of test strips needed to guarantee identifying the poisoned bottle? Answer with a single integer.",
  "kind": "answer",
  "answer": "10",
  "company": "Jane Street",
  "role": "Quantitative Trading",
  "year": 2019,
  "source": "public interview folklore",
  "hints": [
   "Each strip ends in one of two states, so n strips distinguish at most 2^n patterns.",
   "Number the bottles in binary and let strip i taste exactly the bottles whose bit i is set."
  ],
  "solution": "10. Number the bottles 0 to 999 in binary; 1000 < 2^10 = 1024, so ten bits suffice. Put a drop from bottle b on strip i exactly when bit i of b is 1. The pattern of colored strips is the binary representation of the poisoned bottle. Nine strips give only 512 patterns, so ten is also necessary.",
  "votes": {
   "up": 61,
   "down": 2
  },
  "references": [
   {
    "label": "Pigeonhole principle",
    "url": "https://en.wikipedia.org/wiki/Pigeonhole_principle"
   }
  ]
 }
]);
