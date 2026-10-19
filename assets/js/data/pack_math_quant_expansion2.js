/* Math + quant expansion pack 2: math-401..418 (incl. Signal Processing) and quant-401..416. */
registerProblems([
 {
  "id": "math-401",
  "track": "math",
  "branch": "Number Theory",
  "title": "Primality by Trial Division",
  "difficulty": "easy",
  "tags": [
   "primes",
   "python"
  ],
  "summary": "Decide primality testing divisors only up to the square root.",
  "statement": "Implement `is_prime(n)` in Python. Return True when the integer n >= 0 is prime, False otherwise. Use trial division up to the square root; do not import sympy or similar.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def is_prime(n):\n    \"\"\"Return True iff n is prime.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert is_prime(2) is True\nassert is_prime(97) is True\nassert is_prime(1) is False\nassert is_prime(0) is False\nassert is_prime(99991) is True\nassert is_prime(99991*2) is False\nassert is_prime(7919*13) is False\n"
  },
  "solution": "Reject n<2, handle 2, reject evens, then test odd divisors up to sqrt(n)."
 },
 {
  "id": "math-402",
  "track": "math",
  "branch": "Number Theory",
  "title": "Collatz Step Count",
  "difficulty": "easy",
  "tags": [
   "collatz",
   "python"
  ],
  "summary": "Count steps to reach 1 under the Collatz map.",
  "statement": "Implement `collatz_steps(n)` in Python for positive integers. Repeatedly apply: even -> n/2, odd -> 3n+1. Return the number of steps needed to reach 1 (collatz_steps(1) == 0).",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def collatz_steps(n):\n    \"\"\"Return the number of Collatz steps from n to 1.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert collatz_steps(1) == 0\nassert collatz_steps(6) == 8\nassert collatz_steps(27) == 111\nassert collatz_steps(97) == 118\n"
  },
  "solution": "Loop with a counter; 27 takes 111 steps, a classic stress value."
 },
 {
  "id": "math-403",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Derangements via Recurrence",
  "difficulty": "medium",
  "tags": [
   "derangements",
   "python"
  ],
  "summary": "Count permutations with no fixed point using !n = (n-1)(!(n-1)+!(n-2)).",
  "statement": "Implement `derangements(n)` in Python for n >= 0, where D(0)=1 and D(1)=0 and D(n) = (n-1)*(D(n-1)+D(n-2)). Return the number of permutations of n items with no fixed point.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def derangements(n):\n    \"\"\"Return the number of derangements of n items.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert derangements(0) == 1\nassert derangements(1) == 0\nassert derangements(4) == 9\nassert derangements(5) == 44\nassert derangements(10) == 1334961\n"
  },
  "solution": "Iterate the recurrence with two rolling values; D(4)=9 and D(5)=44."
 },
 {
  "id": "math-404",
  "track": "math",
  "branch": "Sequences",
  "title": "Tribonacci Term",
  "difficulty": "easy",
  "tags": [
   "sequences",
   "python"
  ],
  "summary": "Compute T(n) with T(0)=0, T(1)=0, T(2)=1.",
  "statement": "Implement `tribonacci(n)` in Python for nonnegative n, where T(0)=0, T(1)=0, T(2)=1 and T(n)=T(n-1)+T(n-2)+T(n-3). Use iteration and O(1) space.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def tribonacci(n):\n    \"\"\"Return the nth tribonacci number.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert tribonacci(0) == 0\nassert tribonacci(2) == 1\nassert tribonacci(4) == 2\nassert tribonacci(10) == 81\nassert tribonacci(25) == 755476\n"
  },
  "solution": "Roll three values forward; T(10)=81."
 },
 {
  "id": "math-405",
  "track": "math",
  "branch": "Number Theory",
  "title": "Trailing Zeros of 100!",
  "difficulty": "easy",
  "tags": [
   "factorial",
   "trailing zeros"
  ],
  "summary": "Count factors of 5 in 100!.",
  "statement": "How many trailing zeros does 100! have in base 10?",
  "kind": "answer",
  "answer": "24",
  "tolerance": 0,
  "solution": "floor(100/5)+floor(100/25)=20+4=24."
 },
 {
  "id": "math-406",
  "track": "math",
  "branch": "Number Theory",
  "title": "Units Digit of 7^2024",
  "difficulty": "easy",
  "tags": [
   "modular arithmetic",
   "cycles"
  ],
  "summary": "The units digits of powers of 7 cycle with period 4.",
  "statement": "What is the units (ones) digit of 7^2024?",
  "kind": "answer",
  "answer": "1",
  "tolerance": 0,
  "solution": "7^1=7, 7^2=9, 7^3=3, 7^4=1 — period 4. 2024 mod 4 = 0, so the digit is 1."
 },
 {
  "id": "math-407",
  "track": "math",
  "branch": "Number Theory",
  "title": "Sum of Squares to 100",
  "difficulty": "medium",
  "tags": [
   "sums",
   "formula"
  ],
  "summary": "Apply n(n+1)(2n+1)/6.",
  "statement": "What is the sum of the squares of the first 100 positive integers, 1^2 + 2^2 + ... + 100^2?",
  "kind": "answer",
  "answer": "338350",
  "tolerance": 0,
  "solution": "100*101*201/6 = 338350."
 },
 {
  "id": "math-408",
  "track": "math",
  "branch": "Combinatorics & DP",
  "title": "Derangements of Five",
  "difficulty": "medium",
  "tags": [
   "derangements"
  ],
  "summary": "!5 by recurrence.",
  "statement": "Five letters are placed into five addressed envelopes uniformly at random. How many placements put no letter into its correct envelope?",
  "kind": "answer",
  "answer": "44",
  "tolerance": 0,
  "solution": "!2=1, !3=2, !4=9, !5=44 by !(n) = (n-1)(!(n-1)+!(n-2))."
 },
 {
  "id": "math-409",
  "track": "math",
  "branch": "Sequences",
  "title": "Catalan Number C(7)",
  "difficulty": "medium",
  "tags": [
   "catalan"
  ],
  "summary": "C(7) = (1/8) * binom(14,7).",
  "statement": "What is the 7th Catalan number, C(7) = (1/(7+1)) * binomial(14, 7)?",
  "kind": "answer",
  "answer": "429",
  "tolerance": 0,
  "solution": "binom(14,7) = 3432; 3432/8 = 429."
 },
 {
  "id": "math-410",
  "track": "math",
  "branch": "Number Theory",
  "title": "Smallest Prime Above 10^6",
  "difficulty": "hard",
  "tags": [
   "primes"
  ],
  "summary": "Trial-divide candidates past one million.",
  "statement": "What is the smallest prime number strictly greater than 1,000,000?",
  "kind": "answer",
  "answer": "1000003",
  "tolerance": 0,
  "solution": "1000003 is prime (no divisor up to its square root); the intervening candidates fail small divisors."
 },
 {
  "id": "math-411",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Moving Average Filter",
  "difficulty": "easy",
  "tags": [
   "DSP",
   "FIR",
   "python"
  ],
  "summary": "Apply an N-tap boxcar (moving average) to a sample list.",
  "statement": "Implement `moving_average(samples, n)` in Python. Given a list of numbers and a positive window length n, return a list where output[i] is the mean of samples[i-n+1 .. i] for i >= n-1 (so the result has len(samples)-n+1 entries). The tests use values that divide evenly.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def moving_average(samples, n):\n    \"\"\"Return the n-point moving average of samples.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert moving_average([1,2,3,4,5], 3) == [2,3,4]\nassert moving_average([2,2,2,2], 2) == [2,2,2]\nassert moving_average([1,3], 2) == [2]\n"
  },
  "solution": "Slide a window of n samples; a running sum avoids re-summing."
 },
 {
  "id": "math-412",
  "track": "math",
  "branch": "Signal Processing",
  "title": "DFT Magnitude at One Bin",
  "difficulty": "hard",
  "tags": [
   "DSP",
   "DFT",
   "python"
  ],
  "summary": "Compute |X[k]| of a real sequence with the direct DFT definition.",
  "statement": "Implement `dft_magnitude(samples, k)` in Python. For the length-N real input sequence, compute the magnitude of DFT bin k: |sum_n samples[n] * exp(-2j*pi*k*n/N)|. You may use cmath. Return a float; tests compare with a tolerance.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "import cmath\n\ndef dft_magnitude(samples, k):\n    \"\"\"Return |X[k]| of the DFT of samples.\"\"\"\n    # TODO\n    raise NotImplementedError\n"
  },
  "tests": {
   "python": "assert abs(dft_magnitude([1,0,0,0], 0) - 1.0) < 1e-9\nassert abs(dft_magnitude([1,1,1,1], 0) - 4.0) < 1e-9\nassert abs(dft_magnitude([1,-1,1,-1], 2) - 4.0) < 1e-9\nassert abs(dft_magnitude([1,0,-1,0], 1) - 2.0) < 1e-9\n"
  },
  "solution": "Sum samples[n]*cmath.exp(-2j*pi*k*n/N) and take abs()."
 },
 {
  "id": "math-413",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Nyquist Rate for a Band-Limited Tone",
  "difficulty": "easy",
  "tags": [
   "DSP",
   "Nyquist",
   "sampling"
  ],
  "summary": "Sample above twice the highest frequency present.",
  "statement": "A continuous signal contains frequency components up to 3.4 kHz and nothing higher. According to the Nyquist sampling theorem, what is the minimum sampling rate in Hz that allows perfect reconstruction?",
  "kind": "answer",
  "answer": "6800",
  "tolerance": 0,
  "solution": "fs must exceed 2 x 3.4 kHz = 6.8 kHz = 6800 Hz."
 },
 {
  "id": "math-414",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Alias Frequency After Undersampling",
  "difficulty": "medium",
  "tags": [
   "DSP",
   "aliasing"
  ],
  "summary": "A 7 kHz tone sampled at 10 kHz folds back into band.",
  "statement": "A 7 kHz sinusoid is sampled at 10 kHz with no anti-aliasing filter. At what frequency in Hz does the tone appear (alias) in the sampled spectrum within [0, 5 kHz]?",
  "kind": "answer",
  "answer": "3000",
  "tolerance": 0,
  "solution": "The alias frequency is |7 - 10| = 3 kHz = 3000 Hz."
 },
 {
  "id": "math-415",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Ideal SNR of a 12-Bit ADC",
  "difficulty": "medium",
  "tags": [
   "DSP",
   "quantization",
   "SNR"
  ],
  "summary": "SNR = 6.02N + 1.76 dB for an ideal N-bit converter.",
  "statement": "Using the ideal quantization-noise model SNR = 6.02*N + 1.76 dB, what is the theoretical signal-to-quantization-noise ratio in dB of a 12-bit ADC? Round to one decimal place.",
  "kind": "answer",
  "answer": "74.0",
  "tolerance": 0.01,
  "solution": "6.02 x 12 + 1.76 = 74.0 dB."
 },
 {
  "id": "math-416",
  "track": "math",
  "branch": "Signal Processing",
  "title": "DFT Bin Spacing at 48 kHz",
  "difficulty": "easy",
  "tags": [
   "DSP",
   "DFT",
   "frequency resolution"
  ],
  "summary": "Resolution = fs / N.",
  "statement": "A 1024-point DFT is computed on a signal sampled at 48 kHz. What is the spacing between adjacent DFT bins in Hz? Give the exact decimal value.",
  "kind": "answer",
  "answer": "46.875",
  "tolerance": 0.01,
  "solution": "48000 / 1024 = 46.875 Hz per bin."
 },
 {
  "id": "math-417",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Linear Convolution Length",
  "difficulty": "easy",
  "tags": [
   "DSP",
   "convolution"
  ],
  "summary": "len(x*h) = len(x) + len(h) - 1.",
  "statement": "An FIR filter has 75 taps and processes a frame of 200 samples using linear (not circular) convolution. How many samples long is the full convolution output?",
  "kind": "answer",
  "answer": "274",
  "tolerance": 0,
  "solution": "200 + 75 - 1 = 274 samples."
 },
 {
  "id": "math-418",
  "track": "math",
  "branch": "Signal Processing",
  "title": "Decimation and the Anti-Alias Cutoff",
  "difficulty": "hard",
  "tags": [
   "DSP",
   "decimation"
  ],
  "summary": "Decimating by M folds content above fs/(2M).",
  "statement": "A 96 kHz stream must be decimated by a factor of 4 to 24 kHz. To avoid aliasing, the anti-aliasing low-pass filter must remove everything at or above what frequency in kHz?",
  "kind": "answer",
  "answer": "12",
  "tolerance": 0,
  "solution": "The new Nyquist limit is 24/2 = 12 kHz."
 },
 {
  "id": "quant-401",
  "track": "quant",
  "branch": "Expected Value",
  "title": "EV of a Loaded Die",
  "difficulty": "easy",
  "tags": [
   "expected value",
   "dice"
  ],
  "summary": "Weighted average over six faces.",
  "statement": "A die shows 1,2,3,4,5,6 with probabilities 0.1,0.1,0.2,0.2,0.2,0.2. You win the face value in dollars. What is the expected win in dollars?",
  "kind": "answer",
  "answer": "3.9",
  "tolerance": 0.005,
  "solution": "0.1+0.2+0.6+0.8+1.0+1.2 = 3.9 dollars."
 },
 {
  "id": "quant-402",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Flips to First Head",
  "difficulty": "easy",
  "tags": [
   "geometric",
   "expected value"
  ],
  "summary": "Geometric mean 1/p.",
  "statement": "A biased coin lands heads with probability 0.25. What is the expected number of flips until the first head (counting the successful flip)?",
  "kind": "answer",
  "answer": "4",
  "tolerance": 0.005,
  "solution": "Geometric expectation 1/0.25 = 4."
 },
 {
  "id": "quant-403",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Sum of Three Dice at Least 16",
  "difficulty": "medium",
  "tags": [
   "dice",
   "counting"
  ],
  "summary": "Count triples with a+b+c >= 16 over 216.",
  "statement": "Three fair six-sided dice are rolled. What is the probability that the total is 16 or more? Give the decimal value.",
  "kind": "answer",
  "answer": "0.046296296296296294",
  "tolerance": 0.005,
  "solution": "Favourable: (6,6,6), (6,6,5)x3, (6,6,4)x3, (6,5,5)x3 = 10 outcomes; 10/216 = 0.046296."
 },
 {
  "id": "quant-404",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Variance of One Die",
  "difficulty": "medium",
  "tags": [
   "variance",
   "dice"
  ],
  "summary": "E[X^2] - E[X]^2 for a fair die.",
  "statement": "What is the variance of a single fair six-sided die (faces 1..6)? Give the decimal value.",
  "kind": "answer",
  "answer": "2.9166666666666665",
  "tolerance": 0.005,
  "solution": "E[X^2] = 91/6; variance = 91/6 - 12.25 = 35/12 = 2.91667."
 },
 {
  "id": "quant-405",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Nim With One Heap",
  "difficulty": "easy",
  "tags": [
   "nim",
   "games"
  ],
  "summary": "Losing positions are multiples of 4.",
  "statement": "A game has one heap of 7 stones; players alternate taking 1, 2 or 3 stones and the taker of the last stone wins. You move first. How many stones should you take to guarantee a win?",
  "kind": "answer",
  "answer": "3",
  "tolerance": 0.005,
  "solution": "7 mod 4 = 3: take 3, leave 4; then mirror to 4-k."
 },
 {
  "id": "quant-406",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "Matching Pennies Mix",
  "difficulty": "medium",
  "tags": [
   "game theory",
   "mixed equilibrium"
  ],
  "summary": "Indifference forces a 50/50 mix.",
  "statement": "In matching pennies you win $1 on a match and lose $1 on a mismatch. In the unique mixed-strategy equilibrium, with what probability (decimal) should you play heads?",
  "kind": "answer",
  "answer": "0.5",
  "tolerance": 0.005,
  "solution": "Indifference equalizes the opponent's payoffs only at 0.5."
 },
 {
  "id": "quant-407",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Two-State Weather Chain",
  "difficulty": "medium",
  "tags": [
   "markov",
   "stationary"
  ],
  "summary": "Stationary distribution of a 2x2 chain.",
  "statement": "Weather follows a Markov chain: after a sunny day the next day is sunny with probability 0.8; after a rainy day the next day is rainy with probability 0.5. In the long run, what fraction of days are sunny? Give the decimal value.",
  "kind": "answer",
  "answer": "0.7142857142857143",
  "tolerance": 0.005,
  "solution": "pi_S = 0.5/(0.2+0.5) = 5/7 = 0.714286."
 },
 {
  "id": "quant-408",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Expected Rolls to See a Six",
  "difficulty": "easy",
  "tags": [
   "stopping time",
   "geometric"
  ],
  "summary": "Mean waiting time 1/p with p=1/6.",
  "statement": "How many rolls of a fair die are needed on average to see the first six (counting the successful roll)?",
  "kind": "answer",
  "answer": "6",
  "tolerance": 0.005,
  "solution": "Geometric with p=1/6: mean 6."
 },
 {
  "id": "quant-409",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "The Missing Dollar",
  "difficulty": "easy",
  "tags": [
   "brainteaser",
   "accounting"
  ],
  "summary": "The 27 already includes the 2 — track the money.",
  "statement": "Three guests pay $30 for a room ($10 each). The clerk refunds $5 via the bellhop, who pockets $2 and returns $1 to each guest. Each guest effectively paid $9 (total $27) and the bellhop has $2. How many dollars does the clerk's till hold?",
  "kind": "answer",
  "answer": "25",
  "tolerance": 0.005,
  "solution": "27 = 25 (till) + 2 (bellhop); adding 27+2 double-counts the 2."
 },
 {
  "id": "quant-410",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "100 Lockers",
  "difficulty": "medium",
  "tags": [
   "lockers",
   "perfect squares"
  ],
  "summary": "Only perfect squares have an odd divisor count.",
  "statement": "100 lockers start closed. Pass k toggles every kth locker for k = 1..100. How many lockers are open at the end?",
  "kind": "answer",
  "answer": "10",
  "tolerance": 0.005,
  "solution": "Open iff d(n) is odd iff n is a perfect square; 10 squares up to 100."
 },
 {
  "id": "quant-411",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Two-Envelope Expectation",
  "difficulty": "hard",
  "tags": [
   "expected value",
   "two envelopes"
  ],
  "summary": "Symmetric reading: the other is 50 or 200 with equal chance.",
  "statement": "One envelope holds $X, the other $2X. You pick one uniformly at random and peek: it holds $100. Treating both pick cases as equally likely, what is the expected value in dollars of the OTHER envelope?",
  "kind": "answer",
  "answer": "125",
  "tolerance": 0.005,
  "solution": "(50+200)/2 = 125."
 },
 {
  "id": "quant-412",
  "track": "quant",
  "branch": "Dice & Coins",
  "title": "Expected Max of Two Dice",
  "difficulty": "medium",
  "tags": [
   "order statistics",
   "dice"
  ],
  "summary": "E[max] over the 36 equiprobable pairs.",
  "statement": "Two fair dice are rolled. What is the expected value of the larger face? Give the decimal value.",
  "kind": "answer",
  "answer": "4.472222222222222",
  "tolerance": 0.005,
  "solution": "E[max] = 161/36 = 4.47222."
 },
 {
  "id": "quant-413",
  "track": "quant",
  "branch": "Markov & Stopping",
  "title": "Gambler's Ruin p=0.5",
  "difficulty": "medium",
  "tags": [
   "gambler's ruin",
   "markov"
  ],
  "summary": "Fair game: hitting probability is linear in capital.",
  "statement": "A gambler starts with $3 and bets $1 per round on a fair coin, stopping at $0 or $6. What is the probability of reaching $6 before $0? Give the decimal value.",
  "kind": "answer",
  "answer": "0.5",
  "tolerance": 0.005,
  "solution": "i/N = 3/6 = 0.5."
 },
 {
  "id": "quant-414",
  "track": "quant",
  "branch": "Expected Value",
  "title": "Expected Distinct Prizes",
  "difficulty": "hard",
  "tags": [
   "expected value",
   "coupons"
  ],
  "summary": "5(1-(4/5)^10) by symmetry.",
  "statement": "A cereal box contains one of 5 prize types uniformly at random. You open 10 independent boxes. What is the expected number of DISTINCT prize types collected? Give the decimal value.",
  "kind": "answer",
  "answer": "4.463129088",
  "tolerance": 0.005,
  "solution": "5(1-(4/5)^10) = 4.46262."
 },
 {
  "id": "quant-415",
  "track": "quant",
  "branch": "Brainteasers",
  "title": "Average Speed Round Trip",
  "difficulty": "easy",
  "tags": [
   "harmonic mean",
   "speed"
  ],
  "summary": "Harmonic, not arithmetic, mean for equal distances.",
  "statement": "You drive 60 km to work at 30 km/h and return the same 60 km at 60 km/h. What is your average speed for the round trip in km/h?",
  "kind": "answer",
  "answer": "40",
  "tolerance": 0.005,
  "solution": "120 km in 2+1 = 3 hours: 40 km/h."
 },
 {
  "id": "quant-416",
  "track": "quant",
  "branch": "Games & Strategy",
  "title": "First-Price Auction Shade",
  "difficulty": "hard",
  "tags": [
   "auction",
   "game theory"
  ],
  "summary": "Two-bidder uniform first-price equilibrium: bid v/2.",
  "statement": "In a first-price sealed-bid auction with two bidders whose private values are independent uniform[0,100], the symmetric Bayes-Nash equilibrium bid is v/2. If your value is 80, how much do you bid in equilibrium? Answer in dollars.",
  "kind": "answer",
  "answer": "40",
  "tolerance": 0.005,
  "solution": "80/2 = 40."
 }
]);
