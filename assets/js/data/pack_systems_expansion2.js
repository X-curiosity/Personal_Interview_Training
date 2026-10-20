/* systems expansion2 — references/images enriched. */
registerProblems([
 {
  "id": "sys-601",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Extract Inclusive Bit Field",
  "difficulty": "medium",
  "tags": [
   "bit-field",
   "masking"
  ],
  "summary": "Extract a bounded field from a 32-bit word.",
  "statement": "Implement `uint32_t extract_field(uint32_t value, unsigned low, unsigned width)`. Return the field beginning at bit low with the requested width. Return zero if low is at least 32 or width is zero; if the field reaches past bit 31, extract only the remaining bits. Avoid shifting by 32.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t extract_field(uint32_t value, unsigned low, unsigned width) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(extract_field(0xdeadbeefu,8,8)==0xbeu); assert(extract_field(0xffffffffu,28,8)==15u); assert(extract_field(7,0,0)==0); assert(extract_field(7,32,1)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Reject empty or out-of-range fields. Right-shift to bit zero, then mask unless all remaining bits were requested."
 },
 {
  "id": "sys-602",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Next Power of Two with Saturation",
  "difficulty": "hard",
  "tags": [
   "bit-smearing",
   "overflow"
  ],
  "summary": "Round upward to a representable power of two.",
  "statement": "Implement `uint32_t ceil_power2(uint32_t x)`. Return the least power of two greater than or equal to x, treating zero as one. Return zero when that power is not representable in 32 bits.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t ceil_power2(uint32_t x) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(ceil_power2(0)==1); assert(ceil_power2(5)==8); assert(ceil_power2(0x80000000u)==0x80000000u); assert(ceil_power2(0x80000001u)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "After handling overflow, decrement x and propagate its highest set bit downward; adding one produces the next power."
 },
 {
  "id": "sys-603",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Gray Code Decoder",
  "difficulty": "medium",
  "tags": [
   "gray-code",
   "xor"
  ],
  "summary": "Decode a binary-reflected Gray word.",
  "statement": "Implement `uint32_t gray_decode(uint32_t gray)` that converts a 32-bit binary-reflected Gray code to its unsigned binary value using integer operations.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t gray_decode(uint32_t gray) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ for(uint32_t x=0;x<1000;x++) assert(gray_decode(x^(x>>1))==x); assert(gray_decode(0)==0); assert(gray_decode(0xc0000000u)==0x80000000u); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "XOR the Gray word with each successively right-shifted copy; each binary bit is the prefix XOR of Gray bits."
 },
 {
  "id": "sys-604",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Overlap-Safe Integer Move",
  "difficulty": "medium",
  "tags": [
   "overlap",
   "pointer-arithmetic"
  ],
  "summary": "Move integer elements between overlapping ranges.",
  "statement": "Implement `void move_ints(int *dst, const int *src, size_t count)` with memmove semantics for count integers. Copy correctly in either overlap direction. Do not call a library memory-copy routine.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\n#include <stdint.h>\nvoid move_ints(int *dst, const int *src, size_t count) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ int a[]={1,2,3,4,5}; move_ints(a+1,a,4); int e[]={1,1,2,3,4}; for(int i=0;i<5;i++) assert(a[i]==e[i]); move_ints(a,a+2,3); assert(a[0]==2&&a[1]==3&&a[2]==4); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Copy forward when the destination starts below the source and backward otherwise, preventing unread elements from being overwritten."
 },
 {
  "id": "sys-605",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Bounded C String Copy",
  "difficulty": "easy",
  "tags": [
   "c-string",
   "bounds"
  ],
  "summary": "Copy text while always terminating available storage.",
  "statement": "Implement `size_t copy_cstr(char *dst, size_t capacity, const char *src)`. Copy as much as fits, NUL-terminate when capacity is nonzero, and return the full source length even when truncated. Source and destination do not overlap.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nsize_t copy_cstr(char *dst, size_t capacity, const char *src) {\n    /* TODO: implement */\n    return nullptr;\n}\n"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\n#include <string.h>\nint main(void){ char a[4]; assert(copy_cstr(a,sizeof a,\"hello\")==5); assert(strcmp(a,\"hel\")==0); char x='X'; assert(copy_cstr(&x,0,\"ab\")==2&&x=='X'); char b[8]; assert(copy_cstr(b,8,\"ok\")==2&&strcmp(b,\"ok\")==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Measure the entire source, copy at most capacity minus one bytes, and append a terminator whenever storage exists."
 },
 {
  "id": "sys-606",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Aligned Address Advance",
  "difficulty": "hard",
  "tags": [
   "alignment",
   "uintptr"
  ],
  "summary": "Round a pointer-sized address upward.",
  "statement": "Implement `uintptr_t align_address(uintptr_t address, uintptr_t alignment)`. Alignment is a nonzero power of two. Return the smallest aligned address not below address, or zero if rounding would overflow `uintptr_t`.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\n#include <limits.h>\nuintptr_t align_address(uintptr_t address, uintptr_t alignment) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(align_address(0,8)==0); assert(align_address(17,16)==32); assert(align_address(32,16)==32); assert(align_address(UINTPTR_MAX,8)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Add alignment minus one after an overflow check, then clear the low alignment bits."
 },
 {
  "id": "sys-607",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Stable Unique Sorted Values",
  "difficulty": "easy",
  "tags": [
   "vector",
   "deduplication"
  ],
  "summary": "Compact an ordered vector in place.",
  "statement": "Implement `size_t unique_sorted(std::vector<int>& values)`. The input is sorted ascending. Remove adjacent duplicates in place, resize the vector, and return its new size while preserving order.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <cstddef>\nstd::size_t unique_sorted(std::vector<int>& v) {\n    /* TODO: implement */\n    return {};\n}\n"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ std::vector<int> v{1,1,2,2,2,5}; assert(unique_sorted(v)==3); assert((v==std::vector<int>{1,2,5})); std::vector<int> e; assert(unique_sorted(e)==0); std::cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Maintain a write index for the next distinct value and compare each input against the last retained element."
 },
 {
  "id": "sys-608",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Validate Min Heap",
  "difficulty": "medium",
  "tags": [
   "heap",
   "array"
  ],
  "summary": "Check the ordering invariant of an array heap.",
  "statement": "Implement `bool is_min_heap(const std::vector<int>& values)`. Return true exactly when every existing child in the zero-based array representation is at least its parent.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\nbool is_min_heap(const std::vector<int>& v) {\n    /* TODO: implement */\n    return {};\n}\n"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(is_min_heap({1,3,2,7,4})); assert(!is_min_heap({1,2,0})); assert(is_min_heap({})); assert(is_min_heap({5})); std::cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "For every non-root index i, compare it with parent (i-1)/2; one smaller child invalidates the heap."
 },
 {
  "id": "sys-609",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Iterative Tree Height",
  "difficulty": "hard",
  "tags": [
   "binary-tree",
   "breadth-first-search"
  ],
  "summary": "Measure tree height without recursion.",
  "statement": "Given `struct Node { int value; Node *left; Node *right; };`, implement `size_t tree_height(const Node *root)` iteratively. An empty tree has height zero and a leaf has height one. Do not modify the tree.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <queue>\n#include <cstddef>\nstruct Node {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ Node d{4,nullptr,nullptr},c{3,&d,nullptr},b{2,nullptr,nullptr},a{1,&b,&c}; assert(tree_height(nullptr)==0); assert(tree_height(&b)==1); assert(tree_height(&a)==3); std::cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Perform breadth-first traversal one queue layer at a time and increment the height after consuming each layer."
 },
 {
  "id": "sys-610",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Atomic Ticket Distributor",
  "difficulty": "easy",
  "tags": [
   "atomic",
   "tickets"
  ],
  "summary": "Issue unique monotonically increasing tickets.",
  "statement": "Implement `unsigned take_ticket(std::atomic<unsigned>& next)` so concurrent calls each return a distinct ticket and advance next by one. Sequential consistency is not required, but the increment must be atomic.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <atomic>\nunsigned take_ticket(std::atomic<unsigned>& next) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\n#include <thread>\n#include <vector>\n#include <algorithm>\nint main(){ std::atomic<unsigned> n{0}; std::vector<unsigned> out(64); std::vector<std::thread> ts; for(unsigned i=0;i<64;i++) ts.emplace_back([&,i]{out[i]=take_ticket(n);}); for(auto& t:ts)t.join(); std::sort(out.begin(),out.end()); for(unsigned i=0;i<64;i++)assert(out[i]==i); assert(n==64); std::cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "A relaxed fetch-add provides indivisible modification and a unique old value without imposing unnecessary cross-object ordering."
 },
 {
  "id": "sys-611",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Thread Safe Peak Tracker",
  "difficulty": "hard",
  "tags": [
   "compare-exchange",
   "atomic"
  ],
  "summary": "Raise a shared peak without locks.",
  "statement": "Implement `void record_peak(std::atomic<int>& peak, int sample)`. After all concurrent calls complete, peak must equal the maximum of its initial value and every sample. Use compare-exchange rather than a mutex.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <atomic>\nvoid record_peak(std::atomic<int>& peak, int sample) {\n    /* TODO: implement */\n    return -1;\n}\n"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\n#include <thread>\n#include <vector>\nint main(){ std::atomic<int> p{-5}; std::vector<std::thread> ts; for(int i=-20;i<=50;i++)ts.emplace_back(record_peak,std::ref(p),i); for(auto& t:ts)t.join(); assert(p==50); record_peak(p,4); assert(p==50); std::cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Load the observed peak and attempt replacement only while it is below the sample; failed comparison updates the observation."
 },
 {
  "id": "sys-612",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Parallel Sum by Fixed Shards",
  "difficulty": "medium",
  "tags": [
   "threads",
   "partitioning"
  ],
  "summary": "Sum values using a bounded set of workers.",
  "statement": "Implement `long long parallel_sum(const std::vector<int>& values, unsigned workers)`. Use up to workers C++ threads over disjoint contiguous ranges. Treat zero workers as one and return zero for an empty input. Combine per-thread totals after joining.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <thread>\n#include <algorithm>\nlong long parallel_sum(const std::vector<int>& v, unsigned workers) {\n    /* TODO: implement */\n    return {};\n}\n"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(parallel_sum({},4)==0); assert(parallel_sum({1,2,3,4,5},3)==15); assert(parallel_sum({-5,8,-2},0)==1); std::vector<int> v(1000,7); assert(parallel_sum(v,16)==7000); std::cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Cap the worker count, partition by proportional endpoints, store each shard sum separately, join, then reduce the partial sums."
 },
 {
  "id": "sys-613",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Bitmap Storage Budget",
  "difficulty": "easy",
  "tags": [
   "bitmap",
   "capacity"
  ],
  "summary": "Calculate storage for a fixed bitmap.",
  "statement": "A bitmap contains exactly 100000 flags and is packed without metadata into 64-bit words. How many bytes of storage are allocated? Enter an integer.",
  "kind": "answer",
  "answer": "12504",
  "tolerance": 0,
  "solution": "ceil(100000/64)=1563 words, and 1563*8=12504 bytes.",
  "references": [
   {
    "label": "Bit array",
    "url": "https://en.wikipedia.org/wiki/Bit_array"
   }
  ]
 },
 {
  "id": "sys-614",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Two-Level Page Offset Bits",
  "difficulty": "medium",
  "tags": [
   "addressing",
   "page-size"
  ],
  "summary": "Derive an offset width from page size.",
  "statement": "A byte-addressed machine uses 16 KiB pages. How many low address bits form the byte offset within a page? Enter an integer.",
  "kind": "answer",
  "answer": "14",
  "tolerance": 0,
  "solution": "16 KiB = 16384 = 2^14 bytes, so the low 14 bits select a byte in the page.",
  "references": [
   {
    "label": "Page table",
    "url": "https://en.wikipedia.org/wiki/Page_table"
   }
  ]
 },
 {
  "id": "sys-615",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Struct Array Footprint",
  "difficulty": "medium",
  "tags": [
   "alignment",
   "struct-layout"
  ],
  "summary": "Compute an aligned array size.",
  "statement": "On an ABI where `char` has size/alignment 1, `int` size/alignment 4, and `double` size/alignment 8, consider `struct R { char c; double d; int i; };`. Assuming ordinary alignment and tail padding, how many bytes occupy an array of 10 `R` objects? Enter an integer.",
  "kind": "answer",
  "answer": "240",
  "tolerance": 0,
  "solution": "c is at 0, d at 8, i at 16, and tail padding rounds the struct from 20 to 24 bytes. Ten occupy 240 bytes.",
  "references": [
   {
    "label": "Data structure alignment",
    "url": "https://en.wikipedia.org/wiki/Data_structure_alignment"
   }
  ]
 },
 {
  "id": "sys-616",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Arena Alignment Waste",
  "difficulty": "hard",
  "tags": [
   "allocator",
   "alignment"
  ],
  "summary": "Total padding in a simple arena.",
  "statement": "An empty byte arena starts at an address divisible by 16. It allocates blocks of 5, 9, and 17 bytes in that order. Every block start is rounded up to a 16-byte boundary, with no padding after the final block. How many padding bytes are inserted in total? Enter an integer.",
  "kind": "answer",
  "answer": "18",
  "tolerance": 0,
  "solution": "The first block needs 0 padding. Offset 5 rounds to 16 (11 bytes), then offset 25 rounds to 32 (7 bytes), totaling 18.",
  "references": [
   {
    "label": "Page replacement algorithm",
    "url": "https://en.wikipedia.org/wiki/Page_replacement_algorithm"
   }
  ]
 },
 {
  "id": "sys-617",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Complete Tree Internal Nodes",
  "difficulty": "easy",
  "tags": [
   "tree",
   "counting"
  ],
  "summary": "Count non-leaf nodes in a perfect tree.",
  "statement": "A perfect binary tree has 1023 total nodes. How many of its nodes are internal (non-leaf) nodes? Enter an integer.",
  "kind": "answer",
  "answer": "511",
  "tolerance": 0,
  "solution": "A perfect tree with 1023=2^10-1 nodes has 2^9=512 leaves, leaving 1023-512=511 internal nodes.",
  "references": [
   {
    "label": "Virtual memory",
    "url": "https://en.wikipedia.org/wiki/Virtual_memory"
   }
  ]
 },
 {
  "id": "sys-618",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Round Robin Waiting Time",
  "difficulty": "hard",
  "tags": [
   "scheduling",
   "round-robin"
  ],
  "summary": "Calculate waiting time under time slicing.",
  "statement": "Three processes arrive at time 0 in order A, B, C with CPU bursts 5, 3, and 1 milliseconds. Round-robin scheduling uses a 2 ms quantum and has zero context-switch cost. What is the average waiting time in milliseconds? Enter a decimal number.",
  "kind": "answer",
  "answer": "4.6666666667",
  "tolerance": 0.0001,
  "solution": "Execution is A(0-2), B(2-4), C(4-5), A(5-7), B(7-8), A(8-9). Completion times are 9, 8, 5; waits are 4, 5, 4, averaging 13/3 = 4.6667 ms.",
  "references": [
   {
    "label": "Round-robin scheduling",
    "url": "https://en.wikipedia.org/wiki/Round-robin_scheduling"
   }
  ]
 }
]);
