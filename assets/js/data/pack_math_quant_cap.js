/* Math + quant replacement pack: 73 computed problems, including Python tasks. */
registerProblems([
 {
  "id": "math-201",
  "track": "math",
  "branch": "Number Theory",
  "title": "Implement Euclid’s GCD",
  "difficulty": "easy",
  "tags": [
   "python",
   "gcd",
   "Euclid"
  ],
  "summary": "Write an iterative Python GCD for arbitrary nonnegative integers.",
  "statement": "Implement `gcd(a, b)` in Python. Both inputs are nonnegative integers, not both zero. Return their greatest common divisor without importing math.gcd.",
  "kind": "code",
  "solution": "Repeatedly replace `(a,b)` with `(b,a % b)` until `b` is zero; the remaining `a` is the GCD.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def gcd(a, b):\n    \"\"\"Return the greatest common divisor of a and b.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert gcd(462, 1071) == 21\nassert gcd(54, 24) == 6\nassert gcd(0, 9) == 9\nassert gcd(99991, 7919) == 1\n"
  }
 },
 {
  "id": "math-202",
  "track": "math",
  "branch": "Number Theory",
  "title": "GCD of 12348 and 6780",
  "difficulty": "easy",
  "tags": [
   "gcd",
   "Euclid"
  ],
  "summary": "Compute gcd(12348, 6780) using Euclid’s algorithm.",
  "statement": "Find the greatest common divisor of 12348 and 6780. Give the exact positive integer and use Euclid’s algorithm rather than factoring both numbers completely.",
  "kind": "answer",
  "answer": "12",
  "tolerance": 0,
  "solution": "Euclid’s algorithm repeatedly replaces (a,b) by (b,a mod b). Running it on (12348,6780) terminates at 12, so the GCD is 12."
 },
 {
  "id": "math-203",
  "track": "math",
  "branch": "Number Theory",
  "title": "GCD of 6552 and 3600",
  "difficulty": "easy",
  "tags": [
   "gcd",
   "Euclid"
  ],
  "summary": "Compute gcd(6552, 3600) using Euclid’s algorithm.",
  "statement": "Find the greatest common divisor of 6552 and 3600. Give the exact positive integer and use Euclid’s algorithm rather than factoring both numbers completely.",
  "kind": "answer",
  "answer": "72",
  "tolerance": 0,
  "solution": "Euclid’s algorithm repeatedly replaces (a,b) by (b,a mod b). Running it on (6552,3600) terminates at 72, so the GCD is 72."
 },
 {
  "id": "math-204",
  "track": "math",
  "branch": "Number Theory",
  "title": "GCD of 99991 and 7919",
  "difficulty": "easy",
  "tags": [
   "gcd",
   "Euclid"
  ],
  "summary": "Compute gcd(99991, 7919) using Euclid’s algorithm.",
  "statement": "Find the greatest common divisor of 99991 and 7919. Give the exact positive integer and use Euclid’s algorithm rather than factoring both numbers completely.",
  "kind": "answer",
  "answer": "1",
  "tolerance": 0,
  "solution": "Euclid’s algorithm repeatedly replaces (a,b) by (b,a mod b). Running it on (99991,7919) terminates at 1, so the GCD is 1."
 },
 {
  "id": "math-205",
  "track": "math",
  "branch": "Number Theory",
  "title": "Implement Least Common Multiple",
  "difficulty": "easy",
  "tags": [
   "python",
   "lcm",
   "gcd"
  ],
  "summary": "Compute LCM safely from a Euclidean GCD helper.",
  "statement": "Implement `lcm(a, b)` in Python for nonnegative integers. Return zero if either input is zero; otherwise return the least common multiple. Do not enumerate multiples.",
  "kind": "code",
  "solution": "Use Euclid’s algorithm for `gcd`, then return `a // gcd(a,b) * b`; dividing before multiplying avoids unnecessary growth.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def lcm(a, b):\n    \"\"\"Return the least common multiple of nonnegative a and b.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert lcm(84, 126) == 252\nassert lcm(144, 210) == 5040\nassert lcm(0, 7) == 0\nassert lcm(13, 17) == 221\n"
  }
 },
 {
  "id": "math-206",
  "track": "math",
  "branch": "Number Theory",
  "title": "LCM of 144 and 210",
  "difficulty": "easy",
  "tags": [
   "lcm",
   "gcd"
  ],
  "summary": "Find lcm(144, 210) exactly.",
  "statement": "Compute the least common multiple of 144 and 210. Use the identity lcm(a,b)·gcd(a,b)=a·b and return the exact integer.",
  "kind": "answer",
  "answer": "5040",
  "tolerance": 0,
  "solution": "gcd(144,210)=6. Therefore lcm=144×210/6=5040."
 },
 {
  "id": "math-207",
  "track": "math",
  "branch": "Number Theory",
  "title": "LCM of 391 and 667",
  "difficulty": "easy",
  "tags": [
   "lcm",
   "gcd"
  ],
  "summary": "Find lcm(391, 667) exactly.",
  "statement": "Compute the least common multiple of 391 and 667. Use the identity lcm(a,b)·gcd(a,b)=a·b and return the exact integer.",
  "kind": "answer",
  "answer": "11339",
  "tolerance": 0,
  "solution": "gcd(391,667)=23. Therefore lcm=391×667/23=11339."
 },
 {
  "id": "math-208",
  "track": "math",
  "branch": "Number Theory",
  "title": "LCM of 1024 and 360",
  "difficulty": "easy",
  "tags": [
   "lcm",
   "gcd"
  ],
  "summary": "Find lcm(1024, 360) exactly.",
  "statement": "Compute the least common multiple of 1024 and 360. Use the identity lcm(a,b)·gcd(a,b)=a·b and return the exact integer.",
  "kind": "answer",
  "answer": "46080",
  "tolerance": 0,
  "solution": "gcd(1024,360)=8. Therefore lcm=1024×360/8=46080."
 },
 {
  "id": "math-209",
  "track": "math",
  "branch": "Number Theory",
  "title": "Implement Modular Exponentiation",
  "difficulty": "medium",
  "tags": [
   "python",
   "modular-exponentiation"
  ],
  "summary": "Write binary exponentiation without using Python’s three-argument pow.",
  "statement": "Implement `mod_pow(base, exponent, modulus)` in Python. The exponent is nonnegative and modulus is positive. Return `base**exponent mod modulus` in O(log exponent) multiplications without calling three-argument `pow`.",
  "kind": "code",
  "solution": "Maintain a result and repeatedly square the base modulo `modulus`; multiply into the result when the current exponent bit is one.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def mod_pow(base, exponent, modulus):\n    \"\"\"Return base**exponent modulo modulus.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert mod_pow(7, 123, 1000) == 343\nassert mod_pow(13, 57, 997) == 187\nassert mod_pow(2, 0, 17) == 1\nassert mod_pow(29, 73, 101) == 80\n"
  }
 },
 {
  "id": "math-210",
  "track": "math",
  "branch": "Number Theory",
  "title": "Modular Power: 13^57 mod 997",
  "difficulty": "medium",
  "tags": [
   "modular arithmetic",
   "fast power"
  ],
  "summary": "Compute 13^57 modulo 997.",
  "statement": "Compute the remainder when 13^57 is divided by 997. Use repeated squaring so that you do not construct the full power.",
  "kind": "answer",
  "answer": "187",
  "tolerance": 0,
  "solution": "Binary exponentiation squares the base modulo 997 and multiplies only for set exponent bits. Applying it to exponent 57 gives remainder 187."
 },
 {
  "id": "math-211",
  "track": "math",
  "branch": "Number Theory",
  "title": "Modular Power: 2^100 mod 1009",
  "difficulty": "medium",
  "tags": [
   "modular arithmetic",
   "fast power"
  ],
  "summary": "Compute 2^100 modulo 1009.",
  "statement": "Compute the remainder when 2^100 is divided by 1009. Use repeated squaring so that you do not construct the full power.",
  "kind": "answer",
  "answer": "164",
  "tolerance": 0,
  "solution": "Binary exponentiation squares the base modulo 1009 and multiplies only for set exponent bits. Applying it to exponent 100 gives remainder 164."
 },
 {
  "id": "math-212",
  "track": "math",
  "branch": "Number Theory",
  "title": "Modular Power: 29^73 mod 101",
  "difficulty": "medium",
  "tags": [
   "modular arithmetic",
   "fast power"
  ],
  "summary": "Compute 29^73 modulo 101.",
  "statement": "Compute the remainder when 29^73 is divided by 101. Use repeated squaring so that you do not construct the full power.",
  "kind": "answer",
  "answer": "86",
  "tolerance": 0,
  "solution": "Binary exponentiation squares the base modulo 101 and multiplies only for set exponent bits. Applying it to exponent 73 gives remainder 86."
 },
 {
  "id": "math-213",
  "track": "math",
  "branch": "Number Theory",
  "title": "Count Positive Divisors",
  "difficulty": "medium",
  "tags": [
   "python",
   "factorization",
   "divisors"
  ],
  "summary": "Factor an integer and multiply one-plus-exponent terms.",
  "statement": "Implement `divisor_count(n)` in Python for positive integers. Return the number of positive divisors of `n` using trial division up to the remaining square root.",
  "kind": "code",
  "solution": "Factor `n = product(p_i**e_i)` and multiply `(e_i+1)` across all prime factors. If a prime remains after trial division, include a factor of two.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def divisor_count(n):\n    \"\"\"Return the number of positive divisors of n.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert divisor_count(1) == 1\nassert divisor_count(360) == 24\nassert divisor_count(756) == 24\nassert divisor_count(27720) == 96\n"
  }
 },
 {
  "id": "math-214",
  "track": "math",
  "branch": "Number Theory",
  "title": "Divisor Count of 756",
  "difficulty": "medium",
  "tags": [
   "factorization",
   "divisors"
  ],
  "summary": "Count the positive divisors of 756.",
  "statement": "How many positive integer divisors does 756 have? Factor the number, then apply the divisor-count formula.",
  "kind": "answer",
  "answer": "24",
  "tolerance": 0,
  "solution": "756=2^2 × 3^3 × 7^1. Multiplying one plus each exponent gives 3×4×2=24 divisors."
 },
 {
  "id": "math-215",
  "track": "math",
  "branch": "Number Theory",
  "title": "Divisor Count of 1260",
  "difficulty": "medium",
  "tags": [
   "factorization",
   "divisors"
  ],
  "summary": "Count the positive divisors of 1260.",
  "statement": "How many positive integer divisors does 1260 have? Factor the number, then apply the divisor-count formula.",
  "kind": "answer",
  "answer": "36",
  "tolerance": 0,
  "solution": "1260=2^2 × 3^2 × 5^1 × 7^1. Multiplying one plus each exponent gives 3×3×2×2=36 divisors."
 },
 {
  "id": "math-216",
  "track": "math",
  "branch": "Number Theory",
  "title": "Divisor Count of 27720",
  "difficulty": "medium",
  "tags": [
   "factorization",
   "divisors"
  ],
  "summary": "Count the positive divisors of 27720.",
  "statement": "How many positive integer divisors does 27720 have? Factor the number, then apply the divisor-count formula.",
  "kind": "answer",
  "answer": "96",
  "tolerance": 0,
  "solution": "27720=2^3 × 3^2 × 5^1 × 7^1 × 11^1. Multiplying one plus each exponent gives 4×3×2×2×2=96 divisors."
 },
 {
  "id": "math-217",
  "track": "math",
  "branch": "Sequences",
  "title": "Arithmetic Progression Sum",
  "difficulty": "easy",
  "tags": [
   "python",
   "arithmetic-sequence"
  ],
  "summary": "Compute an arithmetic-series sum exactly.",
  "statement": "Implement `arithmetic_sum(first, difference, count)` in Python. Return the exact integer sum of `count` terms beginning at `first` with common difference `difference`. `count` is nonnegative.",
  "kind": "code",
  "solution": "Use `count * (2*first + (count-1)*difference) // 2`; the product is always even for integer progressions.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def arithmetic_sum(first, difference, count):\n    \"\"\"Return the sum of an arithmetic progression.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert arithmetic_sum(3, 5, 40) == 4020\nassert arithmetic_sum(17, 7, 25) == 2525\nassert arithmetic_sum(-4, 9, 30) == 3795\nassert arithmetic_sum(10, 3, 0) == 0\n"
  }
 },
 {
  "id": "math-218",
  "track": "math",
  "branch": "Sequences",
  "title": "Arithmetic Series with 25 Terms",
  "difficulty": "easy",
  "tags": [
   "arithmetic sequence",
   "summation"
  ],
  "summary": "Sum 25 terms starting at 17 with common difference 7.",
  "statement": "An arithmetic sequence starts at 17 and has common difference 7. What is the exact sum of its first 25 terms?",
  "kind": "answer",
  "answer": "2525",
  "tolerance": 0,
  "solution": "Use S=n(2a+(n−1)d)/2. Substitution gives 25×(2×17+(25−1)×7)/2=2525."
 },
 {
  "id": "math-219",
  "track": "math",
  "branch": "Sequences",
  "title": "Arithmetic Series with 30 Terms",
  "difficulty": "easy",
  "tags": [
   "arithmetic sequence",
   "summation"
  ],
  "summary": "Sum 30 terms starting at -4 with common difference 9.",
  "statement": "An arithmetic sequence starts at -4 and has common difference 9. What is the exact sum of its first 30 terms?",
  "kind": "answer",
  "answer": "3795",
  "tolerance": 0,
  "solution": "Use S=n(2a+(n−1)d)/2. Substitution gives 30×(2×-4+(30−1)×9)/2=3795."
 },
 {
  "id": "math-220",
  "track": "math",
  "branch": "Sequences",
  "title": "Arithmetic Series with 20 Terms",
  "difficulty": "easy",
  "tags": [
   "arithmetic sequence",
   "summation"
  ],
  "summary": "Sum 20 terms starting at 100 with common difference -3.",
  "statement": "An arithmetic sequence starts at 100 and has common difference -3. What is the exact sum of its first 20 terms?",
  "kind": "answer",
  "answer": "1430",
  "tolerance": 0,
  "solution": "Use S=n(2a+(n−1)d)/2. Substitution gives 20×(2×100+(20−1)×-3)/2=1430."
 },
 {
  "id": "math-221",
  "track": "math",
  "branch": "Sequences",
  "title": "Iterative Fibonacci",
  "difficulty": "easy",
  "tags": [
   "python",
   "Fibonacci",
   "iteration"
  ],
  "summary": "Compute Fibonacci in linear time and constant space.",
  "statement": "Implement `fibonacci(n)` in Python with `F(0)=0`, `F(1)=1`, and `F(n)=F(n-1)+F(n-2)`. `n` is nonnegative. Use iteration and O(1) auxiliary space.",
  "kind": "code",
  "solution": "Track the current and next Fibonacci values as a pair and update it `n` times. This avoids recursion and stores only two integers.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def fibonacci(n):\n    \"\"\"Return F(n) for nonnegative n.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert fibonacci(0) == 0\nassert fibonacci(1) == 1\nassert fibonacci(20) == 6765\nassert fibonacci(35) == 9227465\n"
  }
 },
 {
  "id": "math-222",
  "track": "math",
  "branch": "Sequences",
  "title": "Fibonacci Term F(25)",
  "difficulty": "easy",
  "tags": [
   "Fibonacci",
   "iteration"
  ],
  "summary": "Compute F(25) with F(0)=0 and F(1)=1.",
  "statement": "Let F(0)=0, F(1)=1, and F(k)=F(k−1)+F(k−2). Compute the exact value of F(25).",
  "kind": "answer",
  "answer": "75025",
  "tolerance": 0,
  "solution": "Iterating the recurrence while retaining only the previous two values produces F(25)=75025."
 },
 {
  "id": "math-223",
  "track": "math",
  "branch": "Sequences",
  "title": "Fibonacci Term F(30)",
  "difficulty": "medium",
  "tags": [
   "Fibonacci",
   "iteration"
  ],
  "summary": "Compute F(30) with F(0)=0 and F(1)=1.",
  "statement": "Let F(0)=0, F(1)=1, and F(k)=F(k−1)+F(k−2). Compute the exact value of F(30).",
  "kind": "answer",
  "answer": "832040",
  "tolerance": 0,
  "solution": "Iterating the recurrence while retaining only the previous two values produces F(30)=832040."
 },
 {
  "id": "math-224",
  "track": "math",
  "branch": "Sequences",
  "title": "Fibonacci Term F(35)",
  "difficulty": "medium",
  "tags": [
   "Fibonacci",
   "iteration"
  ],
  "summary": "Compute F(35) with F(0)=0 and F(1)=1.",
  "statement": "Let F(0)=0, F(1)=1, and F(k)=F(k−1)+F(k−2). Compute the exact value of F(35).",
  "kind": "answer",
  "answer": "9227465",
  "tolerance": 0,
  "solution": "Iterating the recurrence while retaining only the previous two values produces F(35)=9227465."
 },
 {
  "id": "math-225",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Compute a Binomial Coefficient",
  "difficulty": "medium",
  "tags": [
   "python",
   "combinations",
   "multiplicative"
  ],
  "summary": "Calculate n choose k without factorial-sized intermediates.",
  "statement": "Implement `choose(n, k)` in Python for `0 <= k <= n`. Return the exact binomial coefficient using an O(min(k,n-k)) multiplicative loop rather than factorials.",
  "kind": "code",
  "solution": "Replace `k` by `min(k,n-k)` and update `result = result*(n-k+i)//i` for `i=1..k`; every division is exact.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def choose(n, k):\n    \"\"\"Return the exact binomial coefficient n choose k.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert choose(12, 5) == 792\nassert choose(20, 8) == 125970\nassert choose(25, 12) == 5200300\nassert choose(10, 0) == 1\n"
  }
 },
 {
  "id": "math-226",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Choose 8 from 20",
  "difficulty": "medium",
  "tags": [
   "binomial coefficient",
   "combinations"
  ],
  "summary": "Compute the binomial coefficient C(20,8).",
  "statement": "How many unordered subsets of size 8 can be selected from 20 distinct objects? Return the exact integer.",
  "kind": "answer",
  "answer": "125970",
  "tolerance": 0,
  "solution": "The count is C(20,8)=20!/(8!(12)!)=125970."
 },
 {
  "id": "math-227",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Choose 4 from 30",
  "difficulty": "medium",
  "tags": [
   "binomial coefficient",
   "combinations"
  ],
  "summary": "Compute the binomial coefficient C(30,4).",
  "statement": "How many unordered subsets of size 4 can be selected from 30 distinct objects? Return the exact integer.",
  "kind": "answer",
  "answer": "27405",
  "tolerance": 0,
  "solution": "The count is C(30,4)=30!/(4!(26)!)=27405."
 },
 {
  "id": "math-228",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Choose 12 from 25",
  "difficulty": "medium",
  "tags": [
   "binomial coefficient",
   "combinations"
  ],
  "summary": "Compute the binomial coefficient C(25,12).",
  "statement": "How many unordered subsets of size 12 can be selected from 25 distinct objects? Return the exact integer.",
  "kind": "answer",
  "answer": "5200300",
  "tolerance": 0,
  "solution": "The count is C(25,12)=25!/(12!(13)!)=5200300."
 },
 {
  "id": "math-229",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Count Lattice Paths",
  "difficulty": "medium",
  "tags": [
   "python",
   "lattice-paths",
   "combinatorics"
  ],
  "summary": "Reduce a grid-path count to a binomial coefficient.",
  "statement": "Implement `lattice_paths(rows, cols)` in Python. Starting at one corner of a `rows` by `cols` grid and moving only right or down, return the exact number of paths to the opposite corner.",
  "kind": "code",
  "solution": "Every path is an ordering of `rows` down moves and `cols` right moves, so compute `C(rows+cols, rows)` with an exact multiplicative loop.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def lattice_paths(rows, cols):\n    \"\"\"Return the number of right/down paths through the grid.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert lattice_paths(0, 5) == 1\nassert lattice_paths(2, 2) == 6\nassert lattice_paths(6, 8) == 3003\nassert lattice_paths(10, 10) == 184756\n"
  }
 },
 {
  "id": "math-230",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Lattice Paths on a 10×10 Grid",
  "difficulty": "medium",
  "tags": [
   "lattice paths",
   "binomial coefficient"
  ],
  "summary": "Count right/down paths through a 10 by 10 grid.",
  "statement": "Start at the upper-left corner of a 10 by 10 grid and reach the lower-right corner using only right or down moves. How many distinct paths are possible?",
  "kind": "answer",
  "answer": "184756",
  "tolerance": 0,
  "solution": "Every path orders 10 down moves and 10 right moves, so the count is C(20,10)=184756."
 },
 {
  "id": "math-231",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Lattice Paths on a 12×7 Grid",
  "difficulty": "medium",
  "tags": [
   "lattice paths",
   "binomial coefficient"
  ],
  "summary": "Count right/down paths through a 12 by 7 grid.",
  "statement": "Start at the upper-left corner of a 12 by 7 grid and reach the lower-right corner using only right or down moves. How many distinct paths are possible?",
  "kind": "answer",
  "answer": "50388",
  "tolerance": 0,
  "solution": "Every path orders 12 down moves and 7 right moves, so the count is C(19,12)=50388."
 },
 {
  "id": "math-232",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Lattice Paths on a 15×9 Grid",
  "difficulty": "medium",
  "tags": [
   "lattice paths",
   "binomial coefficient"
  ],
  "summary": "Count right/down paths through a 15 by 9 grid.",
  "statement": "Start at the upper-left corner of a 15 by 9 grid and reach the lower-right corner using only right or down moves. How many distinct paths are possible?",
  "kind": "answer",
  "answer": "1307504",
  "tolerance": 0,
  "solution": "Every path orders 15 down moves and 9 right moves, so the count is C(24,15)=1307504."
 },
 {
  "id": "math-233",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Compute a Catalan Number",
  "difficulty": "hard",
  "tags": [
   "python",
   "Catalan",
   "combinatorics"
  ],
  "summary": "Calculate Catalan numbers from a central binomial coefficient.",
  "statement": "Implement `catalan(n)` in Python for nonnegative `n`. Return the exact nth Catalan number `C(2n,n)/(n+1)` without floating-point arithmetic.",
  "kind": "code",
  "solution": "Compute the central binomial coefficient exactly with a multiplicative loop, then divide by `n+1`. All arithmetic remains integral.",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def catalan(n):\n    \"\"\"Return the nth Catalan number, with catalan(0) == 1.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert catalan(0) == 1\nassert catalan(3) == 5\nassert catalan(6) == 132\nassert catalan(12) == 208012\n"
  }
 },
 {
  "id": "math-234",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Catalan Number C(8)",
  "difficulty": "hard",
  "tags": [
   "Catalan",
   "combinatorics"
  ],
  "summary": "Compute the 8th Catalan number exactly.",
  "statement": "Using C_n = (1/(n+1))·binom(2n,n) with C_0=1, compute C_8. This also counts balanced parenthesis strings containing 8 pairs.",
  "kind": "answer",
  "answer": "1430",
  "tolerance": 0,
  "solution": "C_8=binom(16,8)/(8+1)=12870/9=1430."
 },
 {
  "id": "math-235",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Catalan Number C(10)",
  "difficulty": "hard",
  "tags": [
   "Catalan",
   "combinatorics"
  ],
  "summary": "Compute the 10th Catalan number exactly.",
  "statement": "Using C_n = (1/(n+1))·binom(2n,n) with C_0=1, compute C_10. This also counts balanced parenthesis strings containing 10 pairs.",
  "kind": "answer",
  "answer": "16796",
  "tolerance": 0,
  "solution": "C_10=binom(20,10)/(10+1)=184756/11=16796."
 },
 {
  "id": "math-236",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Catalan Number C(12)",
  "difficulty": "hard",
  "tags": [
   "Catalan",
   "combinatorics"
  ],
  "summary": "Compute the 12th Catalan number exactly.",
  "statement": "Using C_n = (1/(n+1))·binom(2n,n) with C_0=1, compute C_12. This also counts balanced parenthesis strings containing 12 pairs.",
  "kind": "answer",
  "answer": "208012",
  "tolerance": 0,
  "solution": "C_12=binom(24,12)/(12+1)=2704156/13=208012."
 },
 {
  "id": "quant-201",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Sum of 2d6",
  "difficulty": "easy",
  "tags": [
   "expected value",
   "dice"
  ],
  "summary": "Find the expected total of 2 fair 6-sided dice.",
  "statement": "Roll 2 independent fair dice, each labeled 1 through 6. What is the expected value of their sum?",
  "kind": "answer",
  "answer": "7",
  "tolerance": 0.0001,
  "solution": "One die has expectation (6+1)/2=3.5. Linearity gives 2×(6+1)/2=7."
 },
 {
  "id": "quant-202",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Sum of 3d8",
  "difficulty": "easy",
  "tags": [
   "expected value",
   "dice"
  ],
  "summary": "Find the expected total of 3 fair 8-sided dice.",
  "statement": "Roll 3 independent fair dice, each labeled 1 through 8. What is the expected value of their sum?",
  "kind": "answer",
  "answer": "13.5",
  "tolerance": 0.0001,
  "solution": "One die has expectation (8+1)/2=4.5. Linearity gives 3×(8+1)/2=13.5."
 },
 {
  "id": "quant-203",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Sum of 4d10",
  "difficulty": "easy",
  "tags": [
   "expected value",
   "dice"
  ],
  "summary": "Find the expected total of 4 fair 10-sided dice.",
  "statement": "Roll 4 independent fair dice, each labeled 1 through 10. What is the expected value of their sum?",
  "kind": "answer",
  "answer": "22",
  "tolerance": 0.0001,
  "solution": "One die has expectation (10+1)/2=5.5. Linearity gives 4×(10+1)/2=22."
 },
 {
  "id": "quant-204",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Sum of 5d12",
  "difficulty": "easy",
  "tags": [
   "expected value",
   "dice"
  ],
  "summary": "Find the expected total of 5 fair 12-sided dice.",
  "statement": "Roll 5 independent fair dice, each labeled 1 through 12. What is the expected value of their sum?",
  "kind": "answer",
  "answer": "32.5",
  "tolerance": 0.0001,
  "solution": "One die has expectation (12+1)/2=6.5. Linearity gives 5×(12+1)/2=32.5."
 },
 {
  "id": "quant-205",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Sum of 7d4",
  "difficulty": "easy",
  "tags": [
   "expected value",
   "dice"
  ],
  "summary": "Find the expected total of 7 fair 4-sided dice.",
  "statement": "Roll 7 independent fair dice, each labeled 1 through 4. What is the expected value of their sum?",
  "kind": "answer",
  "answer": "17.5",
  "tolerance": 0.0001,
  "solution": "One die has expectation (4+1)/2=2.5. Linearity gives 7×(4+1)/2=17.5."
 },
 {
  "id": "quant-206",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Maximum of 2d6",
  "difficulty": "medium",
  "tags": [
   "order statistics",
   "dice"
  ],
  "summary": "Find the expected maximum of 2 fair 6-sided dice.",
  "statement": "Roll 2 independent fair 6-sided dice and keep only the largest face. What is the expected value of that maximum? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "4.472222",
  "tolerance": 0.001,
  "solution": "P(max=k)=(k/6)^2−((k−1)/6)^2. Summing k·P(max=k) from 1 to 6 gives 4.472222."
 },
 {
  "id": "quant-207",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Maximum of 3d6",
  "difficulty": "medium",
  "tags": [
   "order statistics",
   "dice"
  ],
  "summary": "Find the expected maximum of 3 fair 6-sided dice.",
  "statement": "Roll 3 independent fair 6-sided dice and keep only the largest face. What is the expected value of that maximum? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "4.958333",
  "tolerance": 0.001,
  "solution": "P(max=k)=(k/6)^3−((k−1)/6)^3. Summing k·P(max=k) from 1 to 6 gives 4.958333."
 },
 {
  "id": "quant-208",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Maximum of 2d10",
  "difficulty": "medium",
  "tags": [
   "order statistics",
   "dice"
  ],
  "summary": "Find the expected maximum of 2 fair 10-sided dice.",
  "statement": "Roll 2 independent fair 10-sided dice and keep only the largest face. What is the expected value of that maximum? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "7.15",
  "tolerance": 0.001,
  "solution": "P(max=k)=(k/10)^2−((k−1)/10)^2. Summing k·P(max=k) from 1 to 10 gives 7.15."
 },
 {
  "id": "quant-209",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Maximum of 4d4",
  "difficulty": "medium",
  "tags": [
   "order statistics",
   "dice"
  ],
  "summary": "Find the expected maximum of 4 fair 4-sided dice.",
  "statement": "Roll 4 independent fair 4-sided dice and keep only the largest face. What is the expected value of that maximum? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "3.617188",
  "tolerance": 0.001,
  "solution": "P(max=k)=(k/4)^4−((k−1)/4)^4. Summing k·P(max=k) from 1 to 4 gives 3.617188."
 },
 {
  "id": "quant-210",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Maximum of 3d8",
  "difficulty": "medium",
  "tags": [
   "order statistics",
   "dice"
  ],
  "summary": "Find the expected maximum of 3 fair 8-sided dice.",
  "statement": "Roll 3 independent fair 8-sided dice and keep only the largest face. What is the expected value of that maximum? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "6.46875",
  "tolerance": 0.001,
  "solution": "P(max=k)=(k/8)^3−((k−1)/8)^3. Summing k·P(max=k) from 1 to 8 gives 6.46875."
 },
 {
  "id": "quant-211",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Exactly 3 Heads in 8 Flips",
  "difficulty": "easy",
  "tags": [
   "binomial",
   "coins"
  ],
  "summary": "Compute P(exactly 3 heads in 8 fair flips).",
  "statement": "A fair coin is flipped independently 8 times. What is the probability of seeing exactly 3 heads? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "0.21875",
  "tolerance": 0.001,
  "solution": "There are C(8,3)=56 favorable sequences among 2^8=256 equally likely sequences, so the probability is 0.21875."
 },
 {
  "id": "quant-212",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Exactly 5 Heads in 10 Flips",
  "difficulty": "easy",
  "tags": [
   "binomial",
   "coins"
  ],
  "summary": "Compute P(exactly 5 heads in 10 fair flips).",
  "statement": "A fair coin is flipped independently 10 times. What is the probability of seeing exactly 5 heads? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "0.246094",
  "tolerance": 0.001,
  "solution": "There are C(10,5)=252 favorable sequences among 2^10=1024 equally likely sequences, so the probability is 0.246094."
 },
 {
  "id": "quant-213",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Exactly 2 Heads in 12 Flips",
  "difficulty": "medium",
  "tags": [
   "binomial",
   "coins"
  ],
  "summary": "Compute P(exactly 2 heads in 12 fair flips).",
  "statement": "A fair coin is flipped independently 12 times. What is the probability of seeing exactly 2 heads? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "0.016113",
  "tolerance": 0.001,
  "solution": "There are C(12,2)=66 favorable sequences among 2^12=4096 equally likely sequences, so the probability is 0.016113."
 },
 {
  "id": "quant-214",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Exactly 7 Heads in 15 Flips",
  "difficulty": "medium",
  "tags": [
   "binomial",
   "coins"
  ],
  "summary": "Compute P(exactly 7 heads in 15 fair flips).",
  "statement": "A fair coin is flipped independently 15 times. What is the probability of seeing exactly 7 heads? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "0.196381",
  "tolerance": 0.001,
  "solution": "There are C(15,7)=6435 favorable sequences among 2^15=32768 equally likely sequences, so the probability is 0.196381."
 },
 {
  "id": "quant-215",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Exactly 10 Heads in 20 Flips",
  "difficulty": "medium",
  "tags": [
   "binomial",
   "coins"
  ],
  "summary": "Compute P(exactly 10 heads in 20 fair flips).",
  "statement": "A fair coin is flipped independently 20 times. What is the probability of seeing exactly 10 heads? Give a decimal to at least four places.",
  "kind": "answer",
  "answer": "0.176197",
  "tolerance": 0.001,
  "solution": "There are C(20,10)=184756 favorable sequences among 2^20=1048576 equally likely sequences, so the probability is 0.176197."
 },
 {
  "id": "quant-216",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Fair Gambler’s Ruin: 3 to 10",
  "difficulty": "medium",
  "tags": [
   "random walk",
   "gambler ruin"
  ],
  "summary": "Find the chance of reaching $10 before ruin from $3.",
  "statement": "A gambler starts with $3. Each independent fair round wins or loses $1, and play stops at $0 or $10. What is the probability of reaching $10 first?",
  "kind": "answer",
  "answer": "0.3",
  "tolerance": 0.001,
  "solution": "For a fair absorbing random walk, the hitting probability is current fortune divided by the upper boundary: 3/10=0.3."
 },
 {
  "id": "quant-217",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Fair Gambler’s Ruin: 7 to 12",
  "difficulty": "medium",
  "tags": [
   "random walk",
   "gambler ruin"
  ],
  "summary": "Find the chance of reaching $12 before ruin from $7.",
  "statement": "A gambler starts with $7. Each independent fair round wins or loses $1, and play stops at $0 or $12. What is the probability of reaching $12 first?",
  "kind": "answer",
  "answer": "0.583333",
  "tolerance": 0.001,
  "solution": "For a fair absorbing random walk, the hitting probability is current fortune divided by the upper boundary: 7/12=0.583333."
 },
 {
  "id": "quant-218",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Fair Gambler’s Ruin: 5 to 20",
  "difficulty": "medium",
  "tags": [
   "random walk",
   "gambler ruin"
  ],
  "summary": "Find the chance of reaching $20 before ruin from $5.",
  "statement": "A gambler starts with $5. Each independent fair round wins or loses $1, and play stops at $0 or $20. What is the probability of reaching $20 first?",
  "kind": "answer",
  "answer": "0.25",
  "tolerance": 0.001,
  "solution": "For a fair absorbing random walk, the hitting probability is current fortune divided by the upper boundary: 5/20=0.25."
 },
 {
  "id": "quant-219",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Fair Gambler’s Ruin: 11 to 25",
  "difficulty": "medium",
  "tags": [
   "random walk",
   "gambler ruin"
  ],
  "summary": "Find the chance of reaching $25 before ruin from $11.",
  "statement": "A gambler starts with $11. Each independent fair round wins or loses $1, and play stops at $0 or $25. What is the probability of reaching $25 first?",
  "kind": "answer",
  "answer": "0.44",
  "tolerance": 0.001,
  "solution": "For a fair absorbing random walk, the hitting probability is current fortune divided by the upper boundary: 11/25=0.44."
 },
 {
  "id": "quant-220",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Fair Gambler’s Ruin: 17 to 30",
  "difficulty": "medium",
  "tags": [
   "random walk",
   "gambler ruin"
  ],
  "summary": "Find the chance of reaching $30 before ruin from $17.",
  "statement": "A gambler starts with $17. Each independent fair round wins or loses $1, and play stops at $0 or $30. What is the probability of reaching $30 first?",
  "kind": "answer",
  "answer": "0.566667",
  "tolerance": 0.001,
  "solution": "For a fair absorbing random walk, the hitting probability is current fortune divided by the upper boundary: 17/30=0.566667."
 },
 {
  "id": "quant-221",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Wait for 2 Consecutive Heads",
  "difficulty": "medium",
  "tags": [
   "waiting time",
   "coin patterns"
  ],
  "summary": "Expected fair-coin flips until 2 heads appear consecutively.",
  "statement": "Flip a fair coin until 2 consecutive heads have appeared. Starting before any flips, what is the expected number of flips required?",
  "kind": "answer",
  "answer": "6",
  "tolerance": 0,
  "solution": "For a run of r fair-coin heads, the expected waiting time is 2^(r+1)−2. With r=2, this is 8−2=6."
 },
 {
  "id": "quant-222",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Wait for 3 Consecutive Heads",
  "difficulty": "medium",
  "tags": [
   "waiting time",
   "coin patterns"
  ],
  "summary": "Expected fair-coin flips until 3 heads appear consecutively.",
  "statement": "Flip a fair coin until 3 consecutive heads have appeared. Starting before any flips, what is the expected number of flips required?",
  "kind": "answer",
  "answer": "14",
  "tolerance": 0,
  "solution": "For a run of r fair-coin heads, the expected waiting time is 2^(r+1)−2. With r=3, this is 16−2=14."
 },
 {
  "id": "quant-223",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Wait for 4 Consecutive Heads",
  "difficulty": "hard",
  "tags": [
   "waiting time",
   "coin patterns"
  ],
  "summary": "Expected fair-coin flips until 4 heads appear consecutively.",
  "statement": "Flip a fair coin until 4 consecutive heads have appeared. Starting before any flips, what is the expected number of flips required?",
  "kind": "answer",
  "answer": "30",
  "tolerance": 0,
  "solution": "For a run of r fair-coin heads, the expected waiting time is 2^(r+1)−2. With r=4, this is 32−2=30."
 },
 {
  "id": "quant-224",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Wait for 5 Consecutive Heads",
  "difficulty": "hard",
  "tags": [
   "waiting time",
   "coin patterns"
  ],
  "summary": "Expected fair-coin flips until 5 heads appear consecutively.",
  "statement": "Flip a fair coin until 5 consecutive heads have appeared. Starting before any flips, what is the expected number of flips required?",
  "kind": "answer",
  "answer": "62",
  "tolerance": 0,
  "solution": "For a run of r fair-coin heads, the expected waiting time is 2^(r+1)−2. With r=5, this is 64−2=62."
 },
 {
  "id": "quant-225",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Birthday Collision among 20 People",
  "difficulty": "medium",
  "tags": [
   "birthday paradox",
   "complements"
  ],
  "summary": "Compute the birthday-match probability for 20 people.",
  "statement": "Assume 365 equally likely birthdays, no leap day, and independent people. What is the probability that at least two among 20 people share a birthday?",
  "kind": "answer",
  "answer": "0.411438",
  "tolerance": 0.001,
  "solution": "Use the complement: P(all distinct)=∏(365−i)/365 for i=0…19. One minus that product is 0.411438."
 },
 {
  "id": "quant-226",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Birthday Collision among 23 People",
  "difficulty": "medium",
  "tags": [
   "birthday paradox",
   "complements"
  ],
  "summary": "Compute the birthday-match probability for 23 people.",
  "statement": "Assume 365 equally likely birthdays, no leap day, and independent people. What is the probability that at least two among 23 people share a birthday?",
  "kind": "answer",
  "answer": "0.507297",
  "tolerance": 0.001,
  "solution": "Use the complement: P(all distinct)=∏(365−i)/365 for i=0…22. One minus that product is 0.507297."
 },
 {
  "id": "quant-227",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Birthday Collision among 30 People",
  "difficulty": "medium",
  "tags": [
   "birthday paradox",
   "complements"
  ],
  "summary": "Compute the birthday-match probability for 30 people.",
  "statement": "Assume 365 equally likely birthdays, no leap day, and independent people. What is the probability that at least two among 30 people share a birthday?",
  "kind": "answer",
  "answer": "0.706316",
  "tolerance": 0.001,
  "solution": "Use the complement: P(all distinct)=∏(365−i)/365 for i=0…29. One minus that product is 0.706316."
 },
 {
  "id": "quant-228",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Birthday Collision among 40 People",
  "difficulty": "medium",
  "tags": [
   "birthday paradox",
   "complements"
  ],
  "summary": "Compute the birthday-match probability for 40 people.",
  "statement": "Assume 365 equally likely birthdays, no leap day, and independent people. What is the probability that at least two among 40 people share a birthday?",
  "kind": "answer",
  "answer": "0.891232",
  "tolerance": 0.001,
  "solution": "Use the complement: P(all distinct)=∏(365−i)/365 for i=0…39. One minus that product is 0.891232."
 },
 {
  "id": "quant-229",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Collect All 4 Coupon Types",
  "difficulty": "medium",
  "tags": [
   "coupon collector",
   "expectation"
  ],
  "summary": "Expected draws to observe all 4 equally likely coupon types.",
  "statement": "Each independent draw returns one of 4 coupon types uniformly, with replacement. What is the expected number of draws needed to see every type at least once?",
  "kind": "answer",
  "answer": "8.333333",
  "tolerance": 0.001,
  "solution": "After k types remain unseen, the expected wait for a new type is 4/k. Summing 4/k for k=1…4 gives 4H_4=8.333333."
 },
 {
  "id": "quant-230",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Collect All 6 Coupon Types",
  "difficulty": "medium",
  "tags": [
   "coupon collector",
   "expectation"
  ],
  "summary": "Expected draws to observe all 6 equally likely coupon types.",
  "statement": "Each independent draw returns one of 6 coupon types uniformly, with replacement. What is the expected number of draws needed to see every type at least once?",
  "kind": "answer",
  "answer": "14.7",
  "tolerance": 0.001,
  "solution": "After k types remain unseen, the expected wait for a new type is 6/k. Summing 6/k for k=1…6 gives 6H_6=14.7."
 },
 {
  "id": "quant-231",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Collect All 8 Coupon Types",
  "difficulty": "hard",
  "tags": [
   "coupon collector",
   "expectation"
  ],
  "summary": "Expected draws to observe all 8 equally likely coupon types.",
  "statement": "Each independent draw returns one of 8 coupon types uniformly, with replacement. What is the expected number of draws needed to see every type at least once?",
  "kind": "answer",
  "answer": "21.742857",
  "tolerance": 0.001,
  "solution": "After k types remain unseen, the expected wait for a new type is 8/k. Summing 8/k for k=1…8 gives 8H_8=21.742857."
 },
 {
  "id": "quant-232",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Collect All 10 Coupon Types",
  "difficulty": "hard",
  "tags": [
   "coupon collector",
   "expectation"
  ],
  "summary": "Expected draws to observe all 10 equally likely coupon types.",
  "statement": "Each independent draw returns one of 10 coupon types uniformly, with replacement. What is the expected number of draws needed to see every type at least once?",
  "kind": "answer",
  "answer": "29.289683",
  "tolerance": 0.001,
  "solution": "After k types remain unseen, the expected wait for a new type is 10/k. Summing 10/k for k=1…10 gives 10H_10=29.289683."
 },
 {
  "id": "quant-233",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Kelly Fraction: p=0.6, Odds=1:1",
  "difficulty": "medium",
  "tags": [
   "Kelly criterion",
   "bet sizing"
  ],
  "summary": "Compute the full-Kelly bankroll fraction for p=0.6 and net odds 1:1.",
  "statement": "A wager wins with probability 0.6; a win returns net profit 1 times the stake and a loss loses the stake. What bankroll fraction does the full Kelly criterion recommend? Return zero if the edge is non-positive.",
  "kind": "answer",
  "answer": "0.2",
  "tolerance": 0.001,
  "solution": "With q=1−p=0.4 and net odds b=1, Kelly gives f*=(bp−q)/b. Substitution gives f*=0.2."
 },
 {
  "id": "quant-234",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Kelly Fraction: p=0.55, Odds=2:1",
  "difficulty": "hard",
  "tags": [
   "Kelly criterion",
   "bet sizing"
  ],
  "summary": "Compute the full-Kelly bankroll fraction for p=0.55 and net odds 2:1.",
  "statement": "A wager wins with probability 0.55; a win returns net profit 2 times the stake and a loss loses the stake. What bankroll fraction does the full Kelly criterion recommend? Return zero if the edge is non-positive.",
  "kind": "answer",
  "answer": "0.325",
  "tolerance": 0.001,
  "solution": "With q=1−p=0.45 and net odds b=2, Kelly gives f*=(bp−q)/b. Substitution gives f*=0.325."
 },
 {
  "id": "quant-235",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Kelly Fraction: p=0.4, Odds=3:1",
  "difficulty": "hard",
  "tags": [
   "Kelly criterion",
   "bet sizing"
  ],
  "summary": "Compute the full-Kelly bankroll fraction for p=0.4 and net odds 3:1.",
  "statement": "A wager wins with probability 0.4; a win returns net profit 3 times the stake and a loss loses the stake. What bankroll fraction does the full Kelly criterion recommend? Return zero if the edge is non-positive.",
  "kind": "answer",
  "answer": "0.2",
  "tolerance": 0.001,
  "solution": "With q=1−p=0.6 and net odds b=3, Kelly gives f*=(bp−q)/b. Substitution gives f*=0.2."
 },
 {
  "id": "quant-236",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Kelly Fraction: p=0.7, Odds=0.75:1",
  "difficulty": "hard",
  "tags": [
   "Kelly criterion",
   "bet sizing"
  ],
  "summary": "Compute the full-Kelly bankroll fraction for p=0.7 and net odds 0.75:1.",
  "statement": "A wager wins with probability 0.7; a win returns net profit 0.75 times the stake and a loss loses the stake. What bankroll fraction does the full Kelly criterion recommend? Return zero if the edge is non-positive.",
  "kind": "answer",
  "answer": "0.3",
  "tolerance": 0.001,
  "solution": "With q=1−p=0.3 and net odds b=0.75, Kelly gives f*=(bp−q)/b. Substitution gives f*=0.3."
 },
 {
  "id": "quant-237",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Kelly Fraction: p=0.52, Odds=1.5:1",
  "difficulty": "hard",
  "tags": [
   "Kelly criterion",
   "bet sizing"
  ],
  "summary": "Compute the full-Kelly bankroll fraction for p=0.52 and net odds 1.5:1.",
  "statement": "A wager wins with probability 0.52; a win returns net profit 1.5 times the stake and a loss loses the stake. What bankroll fraction does the full Kelly criterion recommend? Return zero if the edge is non-positive.",
  "kind": "answer",
  "answer": "0.2",
  "tolerance": 0.001,
  "solution": "With q=1−p=0.48 and net odds b=1.5, Kelly gives f*=(bp−q)/b. Substitution gives f*=0.2."
 }
]);
