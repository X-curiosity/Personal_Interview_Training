/* Very hard tier: exact derivations in mathematics and probability. */
registerProblems([
 {
  "id": "math-901",
  "track": "math",
  "branch": "Number Theory",
  "title": "Order-Constrained Discrete Log",
  "difficulty": "expert",
  "tags": [
   "modular arithmetic",
   "baby-step giant-step",
   "multiplicative order"
  ],
  "summary": "Find a discrete logarithm in a promised subgroup and certify the least exponent.",
  "statement": "Let p be prime, g and h nonzero residues, and r a supplied positive integer such that g^r=1 (mod p). Implement solve(p,g,h,r), returning the least x in [0,r) with g^x=h, or -1. The promise does not say r is the exact order, so duplicate baby steps and false candidates matter. Inputs have p <= 2,000,000,000 and r <= 10^7. A linear scan is too slow. You must verify any candidate and prove minimality even when ord(g) properly divides r.\n\nWorked example.  solve(101,2,55,100) returns 37, since 2^37 = 55 mod 101.\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(p,g,h,r):\n    return -1"
  },
  "tests": {
   "python": "# EXAMPLE: solve(101,2,55,100) returns 37, since 2^37 = 55 mod 101.\nassert solve(101,2,55,100)==37\nassert solve(17,4,13,16)==3\nassert solve(17,4,3,16)==-1\nassert solve(1000000007,5,pow(5,123456,1000000007),1000000006)==123456\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Store the first baby-step index for each residue.",
   "Multiply giant steps by (g^m)^(-1).",
   "Search every giant block and verify candidates."
  ],
  "solution": "Write x=im+j with 0<=j<m. Then h(g^-m)^i=g^j. A hash table finds matching j values in O(sqrt(r)) time and space. Keeping the first j and taking the minimum verified x handles a non-exact supplied multiple r; verification rejects subgroup mismatches.\n\nReference implementation:\n```python\ndef solve(p,g,h,r):\n import math\n m=math.isqrt(r)+1; baby={}; e=1\n for j in range(m): baby.setdefault(e,j); e=e*g%p\n inv=pow(pow(g,m,p),p-2,p); cur=h%p; best=None\n for i in range(m+1):\n  if cur in baby:\n   x=i*m+baby[cur]\n   if x<r and pow(g,x,p)==h%p and (best is None or x<best): best=x\n  cur=cur*inv%p\n return -1 if best is None else best\n```"
 },
 {
  "id": "math-902",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Binary Matrices with Exact Margins",
  "difficulty": "expert",
  "tags": [
   "transfer DP",
   "contingency tables",
   "counting"
  ],
  "summary": "Count binary matrices with prescribed row and column sums.",
  "statement": "Implement count_matrices(rows, cols). rows and cols are integer lists of lengths R,C <= 10; every entry is between 0 and the opposite dimension, totals agree, and the answer fits in 64-bit signed range. Count labeled R by C zero-one matrices whose i-th row sum and j-th column sum equal the supplied margins. Repeated margins do not make rows or columns interchangeable. Enumerating 2^(RC) matrices is forbidden. Design a row transfer dynamic program over remaining column capacities, and explain how pruning preserves exactness.\n\nWorked example.  solve([2,2],[1,1,1,1]) returns 6.\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(rows,cols):\n    return 0"
  },
  "tests": {
   "python": "# EXAMPLE: solve([2,2],[1,1,1,1]) returns 6.\nassert solve([2,2],[1,1,1,1])==6\nassert solve([1,1,1],[1,1,1])==6\nassert solve([2,1],[1,1,1])==3\nassert solve([0,0],[0,0,0])==1\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Process one labeled row at a time.",
   "A state is the tuple of residual column capacities.",
   "Choose exactly rows[i] positive-capacity columns."
  ],
  "solution": "At row i, every legal matrix has a unique subset of columns receiving that row's ones. Subtracting that subset gives the residual-margin state, so summing child counts is a disjoint exhaustive partition. Memoization merges identical residual states. The worst bound is O(R prod_j(cols[j]+1) binom(C,floor(C/2))).\n\nReference implementation:\n```python\ndef solve(rows,cols):\n from functools import lru_cache\n from itertools import combinations\n C=len(cols)\n @lru_cache(None)\n def f(i,rem):\n  if i==len(rows): return int(not any(rem))\n  k=rows[i]; out=0\n  for pick in combinations(range(C),k):\n   if all(rem[j] for j in pick):\n    nr=list(rem)\n    for j in pick:nr[j]-=1\n    if sum(nr)==sum(rows[i+1:]): out+=f(i+1,tuple(nr))\n  return out\n return f(0,tuple(cols))\n```"
 },
 {
  "id": "math-903",
  "track": "math",
  "branch": "Sequences",
  "title": "Rational Linear Recurrence at Huge Index",
  "difficulty": "expert",
  "tags": [
   "Kitamasa",
   "polynomials",
   "exact arithmetic"
  ],
  "summary": "Evaluate a rational recurrence by polynomial reduction.",
  "statement": "Given coefficients c and initial values a as integer pairs (numerator,denominator), implement solve(c,a,n), returning the reduced pair for a_n. The order k is 1..35, n may be 10^18, and a_t=sum_{j=1}^k c[j-1] a_{t-j}. All intermediate exact numerators in judge cases remain under 20000 bits. Use exponentiation of x modulo x^k-c0*x^(k-1)-...-c[k-1], then dot the resulting coefficients with a_0..a_{k-1}. Matrix exponentiation cubic in k is not the intended bound.\n\nWorked example.  Fibonacci data returns solve([(1,1),(1,1)],[(0,1),(1,1)],10) == (55,1).\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(c,a,n):\n    return (0,1)"
  },
  "tests": {
   "python": "# EXAMPLE: Fibonacci data returns solve([(1,1),(1,1)],[(0,1),(1,1)],10) == (55,1).\nassert solve([(1,1),(1,1)],[(0,1),(1,1)],10)==(55,1)\nassert solve([(1,2)],[(3,1)],5)==(3,32)\nassert solve([(2,1),(3,1)],[(1,1),(2,1)],8)==(4921,1)\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Represent a_n as x^n applied to initial data.",
   "Reduce each degree d term using the characteristic relation.",
   "Binary exponentiation needs O(log n) polynomial products."
  ],
  "solution": "The quotient-ring identity x^k=c0 x^(k-1)+...+c[k-1] makes x^n a degree below k polynomial. Induction on the recurrence shows its coefficients combine the initial vector into a_n. Exact Fraction arithmetic and binary powering give O(k^2 log n) operations.\n\nReference implementation:\n```python\ndef solve(c,a,n):\n from fractions import Fraction as F\n c=list(map(lambda z:F(*z),c)); a=list(map(lambda z:F(*z),a)); k=len(c)\n def mul(u,v):\n  w=[F(0) for _ in range(2*k-1)]\n  for i,x in enumerate(u):\n   for j,y in enumerate(v): w[i+j]+=x*y\n  for d in range(2*k-2,k-1,-1):\n   for j in range(1,k+1): w[d-j]+=w[d]*c[j-1]\n  return w[:k]\n r=[F(1)]+[F(0)]*(k-1); x=[F(0)]*k\n if k==1:x[0]=c[0]\n else:x[1]=F(1)\n while n:\n  if n&1:r=mul(r,x)\n  x=mul(x,x); n//=2\n z=sum((r[i]*a[i] for i in range(k)),F(0)); return z.numerator,z.denominator\n```"
 },
 {
  "id": "math-904",
  "track": "math",
  "branch": "AI Traps",
  "title": "Canonical Necklace Count with Forbidden Runs",
  "difficulty": "expert",
  "tags": [
   "Burnside",
   "automata",
   "M\u00f6bius inversion"
  ],
  "summary": "Count primitive binary necklaces obeying a cyclic run constraint.",
  "statement": "Implement solve(n,L): the number of rotation classes of binary strings of length n (2<=n<=60) having no cyclic run of L consecutive ones and having minimal rotational period exactly n. Here 2<=L<=8. Reflections are distinct: these are necklaces, not bracelets. Runs may cross the final/first boundary. Compute exactly. A correct route counts all valid cyclic words of each divisor length using the trace of a finite automaton adjacency matrix, then applies M\u00f6bius inversion before dividing by n.\n\nWorked example.  solve(4,2) returns 1: only the rotation class of 0001 is both primitive and free of cyclic 11.\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(n,L):\n    return 0"
  },
  "tests": {
   "python": "# EXAMPLE: solve(4,2) returns 1: only the rotation class of 0001 is both primitive and free of cyclic 11.\nassert solve(4,2)==1\nassert solve(5,2)==2\nassert solve(3,3)==2\nassert solve(6,2)==2\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Automaton state is the current trailing run length.",
   "Closed walks are counted by trace(A^d).",
   "Subtract words of proper minimal periods dividing d."
  ],
  "solution": "The L-state automaton appends zero to state 0 and one from r to r+1 only for r<L-1. Closed length-d walks encode cyclic words without a forbidden crossing run, hence C_d=tr(A^d). Every such word has unique minimal period e|d, so P_d=C_d-sum_{e|d,e<d}P_e. Primitive rotation orbits have size n, yielding P_n/n.\n\nReference implementation:\n```python\ndef solve(n,L):\n def matmul(A,B):\n  m=len(A); return [[sum(A[i][k]*B[k][j] for k in range(m)) for j in range(m)] for i in range(m)]\n def trpow(d):\n  A=[[0]*L for _ in range(L)]\n  for r in range(L): A[r][0]+=1\n  for r in range(L-1): A[r][r+1]+=1\n  R=[[int(i==j) for j in range(L)] for i in range(L)]\n  while d:\n   if d&1:R=matmul(R,A)\n   A=matmul(A,A);d//=2\n  return sum(R[i][i] for i in range(L))\n div=[d for d in range(1,n+1) if n%d==0]; prim={}\n for d in div: prim[d]=trpow(d)-sum(prim[e] for e in div if e<d and d%e==0)\n return prim[n]//n\n```"
 },
 {
  "id": "math-905",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Exact Circular Autocorrelation Reconstruction",
  "difficulty": "expert",
  "tags": [
   "DFT-free",
   "convolution",
   "number theory"
  ],
  "summary": "Recover sparse integer signals from exact circular autocorrelation candidates.",
  "statement": "Implement solve(a): return all lexicographically sorted integer vectors x of length N<=12 with x[0]=0, entries in range [-3,3], and circular autocorrelation sum_i x[i]x[(i+k) mod N]=a[k] for every k. Inputs are guaranteed to have at most 200 solutions. Use branch-and-bound or meet-in-the-middle; a blind 7^(N-1) loop will time out at the maximum. Exploit symmetry a[k]=a[N-k], energy at k=0, and incremental bounds. The output contains tuples and must have no duplicates.\n\nWorked example.  for x=(0,1,-1), autocorrelation is (2,-1,-1), and both x and -x satisfy it.\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(a):\n    return []"
  },
  "tests": {
   "python": "# EXAMPLE: for x=(0,1,-1), autocorrelation is (2,-1,-1), and both x and -x satisfy it.\nassert solve([2,-1,-1])==[(0,-1,1),(0,1,-1)]\nassert solve([0,0,0])==[(0,0,0)]\nassert solve([1,0,0,0])==[(0,-1,0,0),(0,0,-1,0),(0,0,0,-1),(0,0,0,1),(0,0,1,0),(0,1,0,0)]\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Use a[0] as an exact sum-of-squares budget.",
   "Prune if remaining coordinates cannot fill the energy.",
   "At leaves check only independent lags, though all are acceptable."
  ],
  "solution": "Autocorrelation lag zero is the energy sum x_i^2. During DFS, excess energy is impossible and an energy deficit exceeding 9 times remaining positions is also impossible. Thus the search is exact and substantially pruned on promised tests; leaf verification enforces every lag. Sign ambiguity is retained as required.\n\nReference implementation:\n```python\ndef solve(a):\n N=len(a); out=[]; x=[0]*N\n def rec(i,energy):\n  if energy>a[0]:return\n  left=N-i\n  if energy+9*left<a[0]:return\n  if i==N:\n   if all(sum(x[j]*x[(j+k)%N] for j in range(N))==a[k] for k in range(N)):out.append(tuple(x))\n   return\n  for v in range(-3,4):x[i]=v;rec(i+1,energy+v*v)\n rec(1,0);return sorted(out)\n```"
 },
 {
  "id": "quant-901",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Unequal Coupon Collection by Subset Transform",
  "difficulty": "expert",
  "tags": [
   "inclusion-exclusion",
   "fractions",
   "expectation"
  ],
  "summary": "Compute the exact mean time to collect all unequal coupons.",
  "statement": "Implement solve(weights), where positive integer weights define independent draw probabilities p_i=w_i/sum(w). For 1<=m<=20, return the exact reduced numerator-denominator pair for the number of draws until every coupon has appeared. Use tail-sum inclusion-exclusion: E[T]=sum over nonempty subsets S of (-1)^(|S|+1)/(sum_{i in S}p_i). The 2^m method is intended; state why zero weights would invalidate it and control all arithmetic exactly.\n\nWorked example.  solve([1,1]) returns (3,1): one initial draw plus mean two to see the other.\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(weights):\n    return (0,1)"
  },
  "tests": {
   "python": "# EXAMPLE: solve([1,1]) returns (3,1): one initial draw plus mean two to see the other.\nassert solve([1,1])==(3,1)\nassert solve([1,2])==(7,2)\nassert solve([1,1,1])==(11,2)\nassert solve([2,3,5])==(559,84)\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Write E[T] as a sum of tail probabilities.",
   "The event some coupon is missing is a union.",
   "Sum the resulting geometric series subset by subset."
  ],
  "solution": "For t draws, inclusion-exclusion gives P(T>t)=sum_{S nonempty}(-1)^(|S|+1)(1-p(S))^t. Summing t>=0 converts each geometric series to 1/p(S). Substituting integer weights gives W/sum_S w exactly. Complexity O(m2^m), reducible to O(2^m) subset-sum updates.\n\nReference implementation:\n```python\ndef solve(weights):\n from fractions import Fraction as F\n W=sum(weights); z=F(0); n=len(weights)\n for mask in range(1,1<<n):\n  s=sum(weights[i] for i in range(n) if mask>>i&1)\n  z += F(W,s) if mask.bit_count()&1 else -F(W,s)\n return z.numerator,z.denominator\n```"
 },
 {
  "id": "quant-902",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Pattern Race with Biased Coin",
  "difficulty": "expert",
  "tags": [
   "automata",
   "linear systems",
   "fractions"
  ],
  "summary": "Find exact winning probability for competing overlapping patterns.",
  "statement": "Implement solve(p_num,p_den,A,B), returning the reduced probability that binary pattern A appears before B in iid Bernoulli trials with P(1)=p_num/p_den. Patterns are distinct, nonempty, lengths <=10; 0<p_num<p_den. Overlaps with themselves and each other must be retained. Build prefix-suffix automaton states from proper prefixes of A and B and solve the exact absorbing linear equations, rather than assuming independent waiting times.\n\nWorked example.  fair coin, A=01, B=10 gives probability 1/2.\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(p_num,p_den,A,B):\n    return (0,1)"
  },
  "tests": {
   "python": "# EXAMPLE: fair coin, A=01, B=10 gives probability 1/2.\nassert solve(1,2,'01','10')==(1,2)\nassert solve(1,2,'1','00')==(3,4)\nassert solve(1,3,'11','0')==(1,9)\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "States are longest suffixes that are proper prefixes.",
   "Transitions into A or B are absorbing.",
   "Solve (I-Q)u=b by Fraction Gaussian elimination."
  ],
  "solution": "The retained suffix is sufficient for all future matching, giving a finite Markov chain. If u_s is A's win probability, u_s=p u_next1+(1-p)u_next0 with boundary values one at A and zero at B. Exact Gaussian elimination uniquely solves the absorbing system in O(K^3).\n\nReference implementation:\n```python\ndef solve(p_num,p_den,A,B):\n from fractions import Fraction as F\n pref={''}\n for s in (A,B):\n  for i in range(1,len(s)):pref.add(s[:i])\n st=sorted(pref); idx={s:i for i,s in enumerate(st)}; n=len(st); M=[[F(0) for _ in range(n+1)] for _ in range(n)]\n p=F(p_num,p_den)\n for s in st:\n  i=idx[s];M[i][i]=1\n  for ch,q in [('1',p),('0',1-p)]:\n   t=s+ch\n   if t.endswith(A):M[i][n]+=q\n   elif not t.endswith(B):\n    u=max((v for v in st if t.endswith(v)),key=len);M[i][idx[u]]-=q\n for c in range(n):\n  r=next(r for r in range(c,n) if M[r][c]);M[c],M[r]=M[r],M[c]; z=M[c][c];M[c]=[v/z for v in M[c]]\n  for r in range(n):\n   if r!=c:\n    z=M[r][c];M[r]=[M[r][j]-z*M[c][j] for j in range(n+1)]\n z=M[idx['']][n];return z.numerator,z.denominator\n```"
 },
 {
  "id": "quant-903",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Finite Secretary with Ties",
  "difficulty": "expert",
  "tags": [
   "optimal stopping",
   "dynamic programming",
   "fractions"
  ],
  "summary": "Optimize stopping when observed values have ties and only relative counts are known.",
  "statement": "A sequence of n<=30 iid values is uniform on {1,...,m}, m<=12. At time t you observe the actual value and may accept it; payoff is 1 iff it equals the maximum of all n values (ties count as success), otherwise 0. Implement solve(n,m), returning the optimal success probability as a reduced pair. No recall. Derive a backward DP whose state is (remaining draws,current observed maximum); after seeing v compare the exact conditional success probability of stopping with continuation.\n\nWorked example.  solve(1,5) returns certainty (1,1).\n\nConstraints and contract. Use Python's standard library only. Inputs obey the stated ranges; return the exact requested object, with reduced rational numbers represented as a pair (numerator, denominator) when specified. The judge is deterministic and includes boundary cases, randomized-looking fixed cases, and small instances checked against exhaustive enumeration. Floating point shortcuts are not acceptable unless the contract explicitly gives a tolerance.\n\nA strong answer must identify the mathematical state or invariant, derive the recurrence or transformation rather than merely coding it, justify termination and correctness, discuss arithmetic exactness, and give tight asymptotic time and space bounds. The intended solution is multi-step: first reduce the mathematical object to finite states, then exploit structure to avoid naive enumeration. Do not mutate arguments or depend on hash iteration order.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def solve(n,m):\n    return (0,1)"
  },
  "tests": {
   "python": "# EXAMPLE: solve(1,5) returns certainty (1,1).\nassert solve(1,5)==(1,1)\nassert solve(2,2)==(1,1)\nassert solve(3,2)==(1,1)\nassert solve(2,3)==(8,9)\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Condition on the newly observed value.",
   "Stopping can win only if v is at least the past maximum.",
   "Future values all must be <=v, giving (v/m)^(r-1)."
  ],
  "solution": "Before a draw with r remaining and past maximum b, condition uniformly on v. Stopping is worth zero if v<b, otherwise (v/m)^(r-1). Continuation is the already computed value with r-1 remaining and maximum max(b,v). Taking the larger after observing v and averaging proves Bellman optimality. Complexity O(nm^2).\n\nReference implementation:\n```python\ndef solve(n,m):\n from fractions import Fraction as F\n V={(0,b):F(0) for b in range(m+1)}\n for r in range(1,n+1):\n  for b in range(m+1):\n   z=F(0)\n   for v in range(1,m+1):\n    nb=max(b,v); stop=F(v,m)**(r-1) if v>=b else F(0); cont=V[(r-1,nb)];z+=max(stop,cont)/m\n   V[(r,b)]=z\n return V[(n,0)].numerator,V[(n,0)].denominator\n```"
 },
 {
  "id": "quant-904",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Exact Duration of a Ruin Walk",
  "difficulty": "expert",
  "tags": [
   "martingales",
   "difference equations",
   "fractions"
  ],
  "summary": "Compute a conditional absorption time exactly.",
  "statement": "A gambler starts with 7 units and repeatedly wins one unit with probability 2/5 and loses one with probability 3/5, independently, stopping on first hitting 0 or 15. Determine the exact expected number of bets conditional on eventual ruin at 0. Your derivation must not divide an unconditional expected duration by a ruin probability. Instead define h_i=P_i(hit 0 first) and g_i=E_i[T * 1_{hit 0 first}], derive the inhomogeneous recurrence for g, solve both finite boundary systems exactly, and return g_7/h_7. As a small check, for boundaries 0 and 2 starting at 1, conditioning on ruin forces the first step down, so the conditional duration is 1.\n\nWorked example (smaller analogue). For the same process with the smaller parameters explicitly discussed above, direct enumeration gives the displayed value; this is a consistency check, not a substitute for deriving the requested instance.\n\nGive the exact reduced rational or integer requested. A strong answer must define every state or event, derive the governing identities, account for boundary and overlap cases, and independently sanity-check the result. Decimal simulation earns no credit. The setup is finite, but naive path enumeration is intentionally infeasible; the challenge is selecting and proving an exact reduction.\n\nVerification obligations. Explicitly discuss the smallest legal instance, the main boundary condition, and why apparent symmetries do or do not identify outcomes. Show at least one intermediate exact value from the worked example. The derivation must be shown, not only the final number. Analyze the largest stated input and explain why the chosen representation remains feasible.",
  "kind": "answer",
  "answer": "579401956621/18052651279",
  "hints": [
   "First solve the harmonic equation for ruin probabilities.",
   "First-step analysis for g includes child h terms.",
   "Solve the two tridiagonal systems with Fractions."
  ],
  "solution": "Let q=3/5,p=2/5. The equations are h_0=1,h_15=0 and h_i=q h_{i-1}+p h_{i+1}. For g, expanding (1+T')1_R gives g_i=q(g_{i-1}+h_{i-1})+p(g_{i+1}+h_{i+1}), with g_0=g_15=0. Fraction Gaussian elimination (or the closed form h_i=(rho^i-rho^15)/(1-rho^15), rho=q/p) and reducing the resulting quotient g_7/h_7 gives 579401956621/18052651279."
 },
 {
  "id": "quant-905",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Variance of a Random Family Tree",
  "difficulty": "expert",
  "tags": [
   "branching process",
   "variance decomposition",
   "exact arithmetic"
  ],
  "summary": "Derive an exact generation-size variance in a non-Poisson branching process.",
  "statement": "A Galton-Watson process begins with Z_0=1. Each individual independently has 0, 1, or 3 children with probabilities 1/6, 1/2, and 1/3 respectively. Find Var(Z_12) exactly. You must derive the mean and variance recursion from conditional expectation and conditional variance, handle the noncritical case, and evaluate it without rounding. For orientation, E[X]=3/2 and E[X^2]=7/2, hence Var(X)=5/4. A small analogue is Var(Z_1)=5/4 directly from the offspring law.\n\nWorked example (smaller analogue). For the same process with the smaller parameters explicitly discussed above, direct enumeration gives the displayed value; this is a consistency check, not a substitute for deriving the requested instance.\n\nGive the exact reduced rational or integer requested. A strong answer must define every state or event, derive the governing identities, account for boundary and overlap cases, and independently sanity-check the result. Decimal simulation earns no credit. The setup is finite, but naive path enumeration is intentionally infeasible; the challenge is selecting and proving an exact reduction.\n\nVerification obligations. Explicitly discuss the smallest legal instance, the main boundary condition, and why apparent symmetries do or do not identify outcomes. Show at least one intermediate exact value from the worked example. The derivation must be shown, not only the final number. Analyze the largest stated input and explain why the chosen representation remains feasible.",
  "kind": "answer",
  "answer": "467087923575/16777216",
  "hints": [
   "Use E[Z_{t+1}|Z_t]=mu Z_t.",
   "Use Var(Z_{t+1}|Z_t)=sigma^2 Z_t.",
   "Solve v_{t+1}=mu^2 v_t+sigma^2 mu^t."
  ],
  "solution": "With mu=3/2 and sigma^2=5/4, total variance yields v_{t+1}=E[sigma^2 Z_t]+Var(mu Z_t)=sigma^2 mu^t+mu^2 v_t, v_0=0. For mu !=1 this sums to v_t=sigma^2 mu^{t-1}(mu^t-1)/(mu-1). At t=12, exact substitution gives (5/4)(3/2)^11(((3/2)^12)-1)/(1/2)=467087923575/16777216."
 }
]);
