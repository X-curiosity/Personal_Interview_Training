/* math quant expansion2 — references/images enriched. */
/* Easy math and quant drills were retired: these tracks start at medium. */
registerProblems([
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
  "solution": "Iterate the recurrence with two rolling values; D(4)=9 and D(5)=44.",
  "references": [
   {
    "label": "Derangement",
    "url": "https://en.wikipedia.org/wiki/Derangement"
   }
  ]
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
  "solution": "100*101*201/6 = 338350.",
  "references": [
   {
    "label": "Square pyramidal number",
    "url": "https://en.wikipedia.org/wiki/Square_pyramidal_number"
   }
  ]
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
  "solution": "!2=1, !3=2, !4=9, !5=44 by !(n) = (n-1)(!(n-1)+!(n-2)).",
  "references": [
   {
    "label": "Derangement",
    "url": "https://en.wikipedia.org/wiki/Derangement"
   }
  ]
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
  "solution": "binom(14,7) = 3432; 3432/8 = 429.",
  "references": [
   {
    "label": "Catalan number",
    "url": "https://en.wikipedia.org/wiki/Catalan_number"
   }
  ]
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
  "solution": "1000003 is prime (no divisor up to its square root); the intervening candidates fail small divisors.",
  "references": [
   {
    "label": "Prime number",
    "url": "https://en.wikipedia.org/wiki/Prime_number"
   }
  ]
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
  "solution": "Sum samples[n]*cmath.exp(-2j*pi*k*n/N) and take abs().",
  "references": [
   {
    "label": "Discrete Fourier transform",
    "url": "https://en.wikipedia.org/wiki/Discrete_Fourier_transform"
   }
  ],
  "image": {
   "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/DFT_2sin%28t%29_%2B_cos%284t%29_25_points.svg/330px-DFT_2sin%28t%29_%2B_cos%284t%29_25_points.svg.png",
   "alt": "The DFT decomposes a sampled signal into frequency bins"
  }
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
  "solution": "The alias frequency is |7 - 10| = 3 kHz = 3000 Hz.",
  "references": [
   {
    "label": "Aliasing",
    "url": "https://en.wikipedia.org/wiki/Aliasing"
   }
  ],
  "image": {
   "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Moire_pattern_of_bricks.jpg/330px-Moire_pattern_of_bricks.jpg",
   "alt": "A moire pattern: the visual analog of frequency aliasing"
  }
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
  "solution": "6.02 x 12 + 1.76 = 74.0 dB.",
  "references": [
   {
    "label": "Analog-to-digital converter",
    "url": "https://en.wikipedia.org/wiki/Analog-to-digital_converter"
   },
   {
    "label": "Quantization (signal processing)",
    "url": "https://en.wikipedia.org/wiki/Quantization_(signal_processing)"
   }
  ]
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
  "solution": "The new Nyquist limit is 24/2 = 12 kHz.",
  "references": [
   {
    "label": "Decimation (signal processing)",
    "url": "https://en.wikipedia.org/wiki/Decimation_(signal_processing)"
   }
  ]
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
  "solution": "Favourable: (6,6,6), (6,6,5)x3, (6,6,4)x3, (6,5,5)x3 = 10 outcomes; 10/216 = 0.046296.",
  "references": [
   {
    "label": "Dice",
    "url": "https://en.wikipedia.org/wiki/Dice"
   },
   {
    "label": "Probability distribution",
    "url": "https://en.wikipedia.org/wiki/Probability_distribution"
   }
  ]
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
  "solution": "E[X^2] = 91/6; variance = 91/6 - 12.25 = 35/12 = 2.91667.",
  "references": [
   {
    "label": "Variance",
    "url": "https://en.wikipedia.org/wiki/Variance"
   }
  ]
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
  "solution": "Indifference equalizes the opponent's payoffs only at 0.5.",
  "references": [
   {
    "label": "Matching pennies",
    "url": "https://en.wikipedia.org/wiki/Matching_pennies"
   }
  ]
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
  "solution": "pi_S = 0.5/(0.2+0.5) = 5/7 = 0.714286.",
  "references": [
   {
    "label": "Markov chain",
    "url": "https://en.wikipedia.org/wiki/Markov_chain"
   }
  ]
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
  "solution": "Open iff d(n) is odd iff n is a perfect square; 10 squares up to 100.",
  "references": [
   {
    "label": "Square number",
    "url": "https://en.wikipedia.org/wiki/Square_number"
   },
   {
    "label": "Divisor function",
    "url": "https://en.wikipedia.org/wiki/Divisor_function"
   }
  ]
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
  "solution": "(50+200)/2 = 125.",
  "references": [
   {
    "label": "Two envelopes problem",
    "url": "https://en.wikipedia.org/wiki/Two_envelopes_problem"
   }
  ]
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
  "solution": "E[max] = 161/36 = 4.47222.",
  "references": [
   {
    "label": "Order statistic",
    "url": "https://en.wikipedia.org/wiki/Order_statistic"
   }
  ]
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
  "solution": "i/N = 3/6 = 0.5.",
  "references": [
   {
    "label": "Gambler's ruin",
    "url": "https://en.wikipedia.org/wiki/Gambler's_ruin"
   }
  ]
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
  "solution": "5(1-(4/5)^10) = 4.46262.",
  "references": [
   {
    "label": "Coupon collector's problem",
    "url": "https://en.wikipedia.org/wiki/Coupon_collector's_problem"
   }
  ]
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
  "solution": "80/2 = 40.",
  "references": [
   {
    "label": "First-price sealed-bid auction",
    "url": "https://en.wikipedia.org/wiki/First-price_sealed-bid_auction"
   }
  ]
 }
]);
