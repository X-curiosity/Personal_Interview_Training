/* Systems C/C++ cap pack: 32 reference-compiled judged tasks. */
registerProblems([
 {
  "id": "sys-401",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Count Set Bits",
  "difficulty": "easy",
  "tags": [
   "popcount",
   "bitwise"
  ],
  "summary": "Implement `unsigned popcount32(uint32_t x)` to return the number of one bits in x.",
  "statement": "Implement `unsigned popcount32(uint32_t x)` to return the number of one bits in x. Use only integer and bitwise operations. It must work for every 32-bit value.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nunsigned popcount32(uint32_t x) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(popcount32(0)==0); assert(popcount32(7)==3); assert(popcount32(0xffffffffu)==32); assert(popcount32(0x80000001u)==2); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Clear the lowest set bit repeatedly with x &= x-1. The number of iterations is exactly the population count."
 },
 {
  "id": "sys-402",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Parity of a Word",
  "difficulty": "easy",
  "tags": [
   "parity",
   "bitwise"
  ],
  "summary": "Implement `unsigned parity32(uint32_t x)`.",
  "statement": "Implement `unsigned parity32(uint32_t x)`. Return 1 when x contains an odd number of set bits and 0 otherwise. Avoid converting the value to text.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nunsigned parity32(uint32_t x) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(parity32(0)==0); assert(parity32(1)==1); assert(parity32(3)==0); assert(parity32(0xffffffffu)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Toggle one parity bit each time a set bit is removed. Even counts return 0 and odd counts return 1."
 },
 {
  "id": "sys-403",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Reverse 32 Bits",
  "difficulty": "medium",
  "tags": [
   "bits",
   "reversal"
  ],
  "summary": "Implement `uint32_t reverse_bits32(uint32_t x)` so bit i of the result equals bit 31-i of x.",
  "statement": "Implement `uint32_t reverse_bits32(uint32_t x)` so bit i of the result equals bit 31-i of x. Leading zeroes are significant because the width is exactly 32 bits.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t reverse_bits32(uint32_t x) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(reverse_bits32(0)==0); assert(reverse_bits32(1)==0x80000000u); assert(reverse_bits32(0x0000000fu)==0xf0000000u); assert(reverse_bits32(0x12345678u)==0x1e6a2c48u); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Shift one low bit from x into the high-to-low construction of the result for exactly 32 iterations."
 },
 {
  "id": "sys-404",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Rotate Left 32",
  "difficulty": "medium",
  "tags": [
   "rotation",
   "shifts"
  ],
  "summary": "Implement `uint32_t rotl32(uint32_t x, unsigned k)` to rotate x left by k positions.",
  "statement": "Implement `uint32_t rotl32(uint32_t x, unsigned k)` to rotate x left by k positions. k may be any unsigned value, including zero or values greater than 32. Do not invoke a shift by 32.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t rotl32(uint32_t x, unsigned k) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(rotl32(1,1)==2); assert(rotl32(0x80000000u,1)==1); assert(rotl32(0x12345678u,0)==0x12345678u); assert(rotl32(1,33)==2); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Reduce k modulo 32 and special-case zero. Combine the left-shifted and wrapped high bits with OR."
 },
 {
  "id": "sys-405",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Power of Two Test",
  "difficulty": "easy",
  "tags": [
   "power-of-two",
   "bitwise"
  ],
  "summary": "Implement `int is_power_of_two(uint32_t x)`.",
  "statement": "Implement `int is_power_of_two(uint32_t x)`. Return 1 only for positive powers of two and return 0 for zero and all other values.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nint is_power_of_two(uint32_t x) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(!is_power_of_two(0)); assert(is_power_of_two(1)); assert(is_power_of_two(1024)); assert(!is_power_of_two(1023)); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "A nonzero power of two has exactly one set bit, so clearing its lowest set bit produces zero."
 },
 {
  "id": "sys-406",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Next Power of Two",
  "difficulty": "hard",
  "tags": [
   "rounding",
   "bit-hack"
  ],
  "summary": "Implement `uint32_t next_power_of_two(uint32_t x)` to return the smallest power of two greater than or equal to x.",
  "statement": "Implement `uint32_t next_power_of_two(uint32_t x)` to return the smallest power of two greater than or equal to x. Return 1 for x equal to zero. Inputs are at most 0x80000000 so the result fits.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t next_power_of_two(uint32_t x) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(next_power_of_two(0)==1); assert(next_power_of_two(1)==1); assert(next_power_of_two(5)==8); assert(next_power_of_two(1024)==1024); assert(next_power_of_two(1025)==2048); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Decrement, spread the highest set bit through every lower position, then add one. Handle zero and one before decrementing."
 },
 {
  "id": "sys-407",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Byte Swap 32",
  "difficulty": "medium",
  "tags": [
   "endianness",
   "masks"
  ],
  "summary": "Implement `uint32_t bswap32_manual(uint32_t x)` to reverse the order of the four bytes without compiler-specific builtins.",
  "statement": "Implement `uint32_t bswap32_manual(uint32_t x)` to reverse the order of the four bytes without compiler-specific builtins. For example, 0x11223344 becomes 0x44332211.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t bswap32_manual(uint32_t x) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(bswap32_manual(0x11223344u)==0x44332211u); assert(bswap32_manual(0)==0); assert(bswap32_manual(0xaabbccddu)==0xddccbbaau); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Mask each source byte, shift it to the mirrored byte position, and combine the four disjoint fields."
 },
 {
  "id": "sys-408",
  "track": "systems",
  "branch": "Bit Manipulation",
  "title": "Extract a Bit Field",
  "difficulty": "hard",
  "tags": [
   "bitfield",
   "mask"
  ],
  "summary": "Implement `uint32_t extract_field(uint32_t x, unsigned offset, unsigned width)`.",
  "statement": "Implement `uint32_t extract_field(uint32_t x, unsigned offset, unsigned width)`. Return the width-bit field beginning at offset zero-based from the least significant bit. width is 1 through 32 and offset+width is at most 32.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\nuint32_t extract_field(uint32_t x, unsigned offset, unsigned width) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(extract_field(0xf0u,4,4)==15); assert(extract_field(0xabcdef01u,8,8)==0xef); assert(extract_field(0xffffffffu,0,32)==0xffffffffu); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Shift the requested field down to bit zero, then mask its width. Special-case width 32 to avoid shifting 1 by 32."
 },
 {
  "id": "sys-409",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Sum an Integer Array",
  "difficulty": "easy",
  "tags": [
   "arrays",
   "pointers"
  ],
  "summary": "Implement `long long array_sum(const int *a, size_t n)`.",
  "statement": "Implement `long long array_sum(const int *a, size_t n)`. Sum exactly n integers without reading past the array and return zero for an empty array. Accumulate in long long.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nlong long array_sum(const int *a, size_t n) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ int a[]={3,-2,9,4}; assert(array_sum(a,4)==14); assert(array_sum(a,0)==0); int b[]={1000000000,1000000000,1000000000}; assert(array_sum(b,3)==3000000000LL); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Walk from index zero to n-1 and use a wide accumulator so the sum does not overflow int."
 },
 {
  "id": "sys-410",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Maximum Array Element",
  "difficulty": "easy",
  "tags": [
   "arrays",
   "out-parameter"
  ],
  "summary": "Implement `int array_max(const int *a, size_t n, int *out)`.",
  "statement": "Implement `int array_max(const int *a, size_t n, int *out)`. Return 0 when n is zero; otherwise write the maximum through out and return 1. The pointers are valid for the specified size.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nint array_max(const int *a, size_t n, int *out) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ int o=0,a[]={-8,-2,-10}; assert(array_max(a,3,&o)==1&&o==-2); assert(array_max(a,0,&o)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Handle the empty contract first. Initialize the maximum from the first element and scan the remainder."
 },
 {
  "id": "sys-411",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Reverse an Array In Place",
  "difficulty": "medium",
  "tags": [
   "in-place",
   "arrays"
  ],
  "summary": "Implement `void reverse_ints(int *a, size_t n)` to reverse n integers in place.",
  "statement": "Implement `void reverse_ints(int *a, size_t n)` to reverse n integers in place. It must handle empty and one-element arrays without underflowing a size_t index.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nvoid reverse_ints(int *a, size_t n) {\n    /* TODO */\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ int a[]={1,2,3,4,5}; reverse_ints(a,5); int e[]={5,4,3,2,1}; for(int i=0;i<5;i++)assert(a[i]==e[i]); reverse_ints(a,0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Swap mirrored elements for the first half of the array. Using n/2 avoids special cases for odd lengths."
 },
 {
  "id": "sys-412",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Bounded String Length",
  "difficulty": "medium",
  "tags": [
   "strings",
   "bounds"
  ],
  "summary": "Implement `size_t safe_strnlen(const char *s, size_t maxlen)`.",
  "statement": "Implement `size_t safe_strnlen(const char *s, size_t maxlen)`. Return the first NUL position when it occurs before maxlen, otherwise return maxlen. Never inspect s[maxlen].",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nsize_t safe_strnlen(const char *s, size_t maxlen) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ assert(safe_strnlen(\"hello\",10)==5); assert(safe_strnlen(\"hello\",3)==3); assert(safe_strnlen(\"\",5)==0); assert(safe_strnlen(\"x\",0)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Advance while both bounds are satisfied and the current byte is nonzero. Test the bound before dereferencing."
 },
 {
  "id": "sys-413",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Overlap-Safe Move",
  "difficulty": "hard",
  "tags": [
   "memmove",
   "overlap"
  ],
  "summary": "Implement `void *memmove_lite(void *dst, const void *src, size_t n)` with memmove semantics.",
  "statement": "Implement `void *memmove_lite(void *dst, const void *src, size_t n)` with memmove semantics. Copy correctly when ranges overlap in either direction and return dst. Work byte by byte without calling memmove.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nvoid *memmove_lite(void *dst, const void *src, size_t n) {\n    /* TODO */\n    return dst;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\n#include <string.h>\nint main(void){ char a[16]=\"abcdef\"; memmove_lite(a+2,a,4); assert(strcmp(a,\"ababcd\")==0); char b[16]=\"abcdef\"; memmove_lite(b,b+2,4); b[4]=0; assert(strcmp(b,\"cdef\")==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Copy forward when destination starts below source and backward when it starts above source. Direction preserves bytes not yet read."
 },
 {
  "id": "sys-414",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Find a Byte",
  "difficulty": "easy",
  "tags": [
   "bytes",
   "linear-search"
  ],
  "summary": "Implement `long find_byte(const unsigned char *p, size_t n, unsigned char needle)`.",
  "statement": "Implement `long find_byte(const unsigned char *p, size_t n, unsigned char needle)`. Return the zero-based index of the first matching byte, or -1 when absent. Binary zero bytes are ordinary data.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nlong find_byte(const unsigned char *p, size_t n, unsigned char needle) {\n    /* TODO */\n    return -1;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ unsigned char a[]={9,0,4,0}; assert(find_byte(a,4,0)==1); assert(find_byte(a,4,4)==2); assert(find_byte(a,4,7)==-1); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Scan the explicit byte count rather than relying on terminators. Return immediately on the first match."
 },
 {
  "id": "sys-415",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Count Matching Values",
  "difficulty": "medium",
  "tags": [
   "arrays",
   "counting"
  ],
  "summary": "Implement `size_t count_value(const int *a, size_t n, int value)`.",
  "statement": "Implement `size_t count_value(const int *a, size_t n, int value)`. Count every array element equal to value and return zero for an empty range.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nsize_t count_value(const int *a, size_t n, int value) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ int a[]={2,1,2,2,3}; assert(count_value(a,5,2)==3); assert(count_value(a,5,9)==0); assert(count_value(a,0,2)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Perform one bounded pass and increment a size_t count whenever the element equals the target."
 },
 {
  "id": "sys-416",
  "track": "systems",
  "branch": "Pointers & Memory",
  "title": "Flat Matrix Row Sum",
  "difficulty": "hard",
  "tags": [
   "matrix",
   "pointer-arithmetic"
  ],
  "summary": "Implement `long long row_sum(const int *matrix, size_t rows, size_t cols, size_t row)` for a row-major flat matrix.",
  "statement": "Implement `long long row_sum(const int *matrix, size_t rows, size_t cols, size_t row)` for a row-major flat matrix. Return zero when row is outside rows. Otherwise sum exactly the selected row using a wide accumulator.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stddef.h>\nlong long row_sum(const int *matrix, size_t rows, size_t cols, size_t row) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "c": "#include <assert.h>\n#include <stdio.h>\nint main(void){ int m[]={1,2,3,4,5,6}; assert(row_sum(m,2,3,0)==6); assert(row_sum(m,2,3,1)==15); assert(row_sum(m,2,3,2)==0); puts(\"ALL TESTS PASSED\"); return 0; }"
  },
  "solution": "Validate the row index, compute its base offset as row*cols, and sum cols contiguous values."
 },
 {
  "id": "sys-417",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Lower-Bound Index",
  "difficulty": "easy",
  "tags": [
   "binary-search",
   "lower-bound"
  ],
  "summary": "Implement `size_t lower_bound_index(const vector<int>& a, int target)` for a sorted ascending vector.",
  "statement": "Implement `size_t lower_bound_index(const vector<int>& a, int target)` for a sorted ascending vector. Return the first index whose value is at least target, or a.size() if none qualifies. Use logarithmic time.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nsize_t lower_bound_index(const vector<int>& a, int target) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ vector<int>a{1,3,3,8}; assert(lower_bound_index(a,3)==1); assert(lower_bound_index(a,4)==3); assert(lower_bound_index(a,9)==4); assert(lower_bound_index({},1)==0); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Maintain the half-open candidate range [left,right). Discard mid when its value is too small; otherwise keep it as a possible answer."
 },
 {
  "id": "sys-418",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Merge Sorted Vectors",
  "difficulty": "medium",
  "tags": [
   "merge",
   "two-pointer"
  ],
  "summary": "Implement `vector<int> merge_sorted(const vector<int>& a, const vector<int>& b)`.",
  "statement": "Implement `vector<int> merge_sorted(const vector<int>& a, const vector<int>& b)`. Both inputs are sorted ascending and may contain duplicates. Return one sorted vector containing every input element in O(a.size()+b.size()).",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nvector<int> merge_sorted(const vector<int>& a, const vector<int>& b) {\n    /* TODO */\n    return {};\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(merge_sorted({1,3,5},{2,3,6})==vector<int>({1,2,3,3,5,6})); assert(merge_sorted({}, {1})==vector<int>({1})); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Advance two indices, appending the smaller current value, then append whichever suffix remains."
 },
 {
  "id": "sys-419",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Deduplicate a Sorted Vector",
  "difficulty": "medium",
  "tags": [
   "two-pointer",
   "in-place"
  ],
  "summary": "Implement `size_t dedupe_sorted(vector<int>& a)`.",
  "statement": "Implement `size_t dedupe_sorted(vector<int>& a)`. Remove adjacent duplicates in place from a sorted vector, resize it, and return the new size. Preserve the first occurrence order and use O(1) extra space.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nsize_t dedupe_sorted(vector<int>& a) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ vector<int>a{1,1,2,2,2,5}; assert(dedupe_sorted(a)==3); assert(a==vector<int>({1,2,5})); vector<int>b; assert(dedupe_sorted(b)==0); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Use separate read and write indices. Copy only values different from the last retained value, then resize."
 },
 {
  "id": "sys-420",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Prefix Sums",
  "difficulty": "easy",
  "tags": [
   "prefix-sum",
   "arrays"
  ],
  "summary": "Implement `vector<long long> prefix_sums(const vector<int>& a)`.",
  "statement": "Implement `vector<long long> prefix_sums(const vector<int>& a)`. Return a vector of size a.size()+1 where result[0] is zero and result[i+1] is the sum of a[0] through a[i]. Use long long accumulation.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nvector<long long> prefix_sums(const vector<int>& a) {\n    /* TODO */\n    return {};\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(prefix_sums({2,-1,4})==vector<long long>({0,2,1,5})); assert(prefix_sums({})==vector<long long>({0})); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Allocate one extra leading zero. Each next prefix equals the previous prefix plus the next input element."
 },
 {
  "id": "sys-421",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Rotate a Vector Left",
  "difficulty": "medium",
  "tags": [
   "rotation",
   "vector"
  ],
  "summary": "Implement `void rotate_left(vector<int>& a, size_t k)`.",
  "statement": "Implement `void rotate_left(vector<int>& a, size_t k)`. Move the first k elements to the end while preserving relative order. k may exceed the vector size; an empty vector must be handled safely.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nvoid rotate_left(vector<int>& a, size_t k) {\n    /* TODO */\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ vector<int>a{1,2,3,4,5}; rotate_left(a,2); assert(a==vector<int>({3,4,5,1,2})); rotate_left(a,5); assert(a==vector<int>({3,4,5,1,2})); vector<int>b; rotate_left(b,9); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Reduce k modulo n and use three reversals: reverse each partition, then reverse the whole vector."
 },
 {
  "id": "sys-422",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Two Sum in Sorted Data",
  "difficulty": "medium",
  "tags": [
   "two-pointer",
   "search"
  ],
  "summary": "Implement `pair<int,int> two_sum_sorted(const vector<int>& a, int target)`.",
  "statement": "Implement `pair<int,int> two_sum_sorted(const vector<int>& a, int target)`. The vector is sorted ascending. Return zero-based indices of two distinct values summing to target, or {-1,-1}; use O(n) time and O(1) extra space.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\npair<int,int> two_sum_sorted(const vector<int>& a, int target) {\n    /* TODO */\n    return {-1,-1};\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(two_sum_sorted({1,2,4,7,11},9)==make_pair(1,3)); assert(two_sum_sorted({1,2},8)==make_pair(-1,-1)); assert(two_sum_sorted({},0)==make_pair(-1,-1)); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Place pointers at both ends. Increase the lower pointer when the sum is small and decrease the upper one when it is large."
 },
 {
  "id": "sys-423",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Maximum Subarray Sum",
  "difficulty": "hard",
  "tags": [
   "dynamic-programming",
   "kadane"
  ],
  "summary": "Implement `long long max_subarray_sum(const vector<int>& a)`.",
  "statement": "Implement `long long max_subarray_sum(const vector<int>& a)`. Return the largest sum of a nonempty contiguous subarray, or zero for an empty vector. Inputs may all be negative.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nlong long max_subarray_sum(const vector<int>& a) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(max_subarray_sum({-2,1,-3,4,-1,2,1,-5,4})==6); assert(max_subarray_sum({-8,-2,-5})==-2); assert(max_subarray_sum({})==0); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Kadane’s algorithm tracks the best subarray ending at each position and the best seen globally. Initialize from the first element for all-negative input."
 },
 {
  "id": "sys-424",
  "track": "systems",
  "branch": "Data Structures",
  "title": "Validate a Min Heap",
  "difficulty": "hard",
  "tags": [
   "heap",
   "validation"
  ],
  "summary": "Implement `bool is_min_heap_array(const vector<int>& a)` for the array representation of a binary heap.",
  "statement": "Implement `bool is_min_heap_array(const vector<int>& a)` for the array representation of a binary heap. Every parent must be less than or equal to each existing child. Empty and one-element vectors are valid heaps.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <vector>\n#include <utility>\n#include <cstddef>\n#include <algorithm>\n#include <climits>\nusing namespace std;\nbool is_min_heap_array(const vector<int>& a) {\n    /* TODO */\n    return false;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(is_min_heap_array({1,3,2,7,8,4})); assert(!is_min_heap_array({1,2,3,0})); assert(is_min_heap_array({})); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Only internal nodes need checks. For each, compare against children at 2i+1 and 2i+2 when those indices exist."
 },
 {
  "id": "sys-425",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Virtual Page Number",
  "difficulty": "easy",
  "tags": [
   "virtual-memory",
   "pages"
  ],
  "summary": "Implement `uint64_t page_number(uint64_t address, uint64_t page_size)`.",
  "statement": "Implement `uint64_t page_number(uint64_t address, uint64_t page_size)`. Return the zero-based virtual page number for address. page_size is nonzero and is a power of two.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nuint64_t page_number(uint64_t address, uint64_t page_size) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(page_number(0x12345,4096)==0x12); assert(page_number(4095,4096)==0); assert(page_number(4096,4096)==1); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Integer division by the page size discards the page offset and yields the page number."
 },
 {
  "id": "sys-426",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Page Offset",
  "difficulty": "easy",
  "tags": [
   "virtual-memory",
   "mask"
  ],
  "summary": "Implement `uint64_t page_offset(uint64_t address, uint64_t page_size)`.",
  "statement": "Implement `uint64_t page_offset(uint64_t address, uint64_t page_size)`. Return the offset of address within its page. page_size is a nonzero power of two.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nuint64_t page_offset(uint64_t address, uint64_t page_size) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(page_offset(0x12345,4096)==0x345); assert(page_offset(4096,4096)==0); assert(page_offset(4095,4096)==4095); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "For a power-of-two page size, page_size-1 is an offset mask. AND extracts the low offset bits."
 },
 {
  "id": "sys-427",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Pages Spanned by a Buffer",
  "difficulty": "hard",
  "tags": [
   "virtual-memory",
   "ranges"
  ],
  "summary": "Implement `uint64_t pages_spanned(uint64_t start, uint64_t length, uint64_t page_size)`.",
  "statement": "Implement `uint64_t pages_spanned(uint64_t start, uint64_t length, uint64_t page_size)`. Return how many virtual pages intersect the half-open byte range [start,start+length). Return zero for length zero; inputs do not overflow uint64_t.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nuint64_t pages_spanned(uint64_t start, uint64_t length, uint64_t page_size) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(pages_spanned(0,0,4096)==0); assert(pages_spanned(0,4096,4096)==1); assert(pages_spanned(4090,20,4096)==2); assert(pages_spanned(1,8192,4096)==3); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "For nonempty ranges, the first page is start/page_size and the last is (start+length-1)/page_size. Count inclusively."
 },
 {
  "id": "sys-428",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Align an Address Up",
  "difficulty": "medium",
  "tags": [
   "alignment",
   "memory"
  ],
  "summary": "Implement `uint64_t align_up_address(uint64_t address, uint64_t alignment)`.",
  "statement": "Implement `uint64_t align_up_address(uint64_t address, uint64_t alignment)`. Return the smallest aligned address not below address. alignment is a nonzero power of two and the rounded result fits.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nuint64_t align_up_address(uint64_t address, uint64_t alignment) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(align_up_address(0,64)==0); assert(align_up_address(1,64)==64); assert(align_up_address(128,64)==128); assert(align_up_address(129,64)==192); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Add alignment-1, then clear the low alignment bits with the complemented mask."
 },
 {
  "id": "sys-429",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Ring Buffer Next Index",
  "difficulty": "easy",
  "tags": [
   "ring-buffer",
   "indexing"
  ],
  "summary": "Implement `size_t ring_next(size_t index, size_t capacity)`.",
  "statement": "Implement `size_t ring_next(size_t index, size_t capacity)`. Return the next circular index, wrapping capacity-1 to zero. capacity is positive and index is below capacity.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nsize_t ring_next(size_t index, size_t capacity) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(ring_next(0,4)==1); assert(ring_next(3,4)==0); assert(ring_next(7,8)==0); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Increment normally except at the final slot, where the next index is zero. This avoids modulo in the hot path."
 },
 {
  "id": "sys-430",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Ring Buffer Used Slots",
  "difficulty": "medium",
  "tags": [
   "ring-buffer",
   "queue"
  ],
  "summary": "Implement `size_t ring_used(size_t head, size_t tail, size_t capacity)` for a circular queue where head is the next write position and tail is the next read position.",
  "statement": "Implement `size_t ring_used(size_t head, size_t tail, size_t capacity)` for a circular queue where head is the next write position and tail is the next read position. Return the occupied slots; both indices are below positive capacity.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nsize_t ring_used(size_t head, size_t tail, size_t capacity) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(ring_used(0,0,8)==0); assert(ring_used(5,2,8)==3); assert(ring_used(2,6,8)==4); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Without wrap, subtract tail from head. With wrap, count tail-to-end plus start-to-head."
 },
 {
  "id": "sys-431",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Bounded Queue Free Slots",
  "difficulty": "medium",
  "tags": [
   "ring-buffer",
   "capacity"
  ],
  "summary": "Implement `size_t ring_free(size_t head, size_t tail, size_t capacity)` for a circular queue that deliberately leaves one slot empty to distinguish full from empty.",
  "statement": "Implement `size_t ring_free(size_t head, size_t tail, size_t capacity)` for a circular queue that deliberately leaves one slot empty to distinguish full from empty. Return the number of additional items that fit. capacity is at least two.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nsize_t ring_free(size_t head, size_t tail, size_t capacity) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\nint main(){ assert(ring_free(0,0,8)==7); assert(ring_free(5,2,8)==4); assert(ring_free(7,0,8)==0); assert(ring_free(2,6,8)==3); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Compute occupied slots by circular distance. Since one slot is reserved, free capacity is capacity-1-used."
 },
 {
  "id": "sys-432",
  "track": "systems",
  "branch": "Concurrency & OS",
  "title": "Atomic Fetch Maximum",
  "difficulty": "hard",
  "tags": [
   "atomics",
   "compare-exchange"
  ],
  "summary": "Implement `int atomic_fetch_max_value(std::atomic<int>& target, int value)`.",
  "statement": "Implement `int atomic_fetch_max_value(std::atomic<int>& target, int value)`. Atomically set target to max(target,value) and return the value that target held before this call. Use compare_exchange_weak; sequentially consistent ordering is acceptable.",
  "kind": "code",
  "languages": [
   "cpp"
  ],
  "starter": {
   "cpp": "#include <cstdint>\n#include <cstddef>\n#include <atomic>\n#include <algorithm>\nusing namespace std;\nint atomic_fetch_max_value(std::atomic<int>& target, int value) {\n    /* TODO */\n    return 0;\n}"
  },
  "tests": {
   "cpp": "#include <cassert>\n#include <iostream>\n#include <thread>\n#include <vector>\nint main(){ atomic<int>x{5}; assert(atomic_fetch_max_value(x,3)==5&&x.load()==5); assert(atomic_fetch_max_value(x,9)==5&&x.load()==9); vector<thread>ts; for(int i=0;i<20;i++)ts.emplace_back([&x,i]{atomic_fetch_max_value(x,i);}); for(auto&t:ts)t.join(); assert(x.load()==19); cout<<\"ALL TESTS PASSED\\n\"; }"
  },
  "solution": "Load the observed value and attempt compare-exchange only while it is below the candidate. A failed weak CAS refreshes old for the next loop."
 }
]);
