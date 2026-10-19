/* Interview expansion pack 2: iq-301..iq-310 — RTL, CPU architecture, quant/trading. */
registerProblems([
{
  id: "iq-301", track: "interview", branch: "Hardware & RTL",
  title: "Design a Synchronous FIFO", difficulty: "hard",
  tags: ["FIFO", "RTL design", "pointers"],
  summary: "Specify pointers, full/empty logic, and the simultaneous read/write corner case for a single-clock FIFO.",
  statement: "Design a synchronous FIFO of depth 8 and width 32 bits. Give the register set, the exact full and empty conditions, and the behavior when read and write arrive on the same cycle at full and at empty. Follow-ups: why is depth a power of two convenient, what happens to flags on reset, and how would you assert correctness in simulation?",
  kind: "answer", answer: null,
  solution: "Keep write and read pointers one bit wider than the address (4 bits for depth 8): the low 3 bits address the RAM, the extra bit distinguishes wrap. Empty when both pointers are equal; full when the pointers differ only in the top bit (wr_ptr == {~rd_ptr[3], rd_ptr[2:0]}). On simultaneous read+write: at empty the write is stored but the read must not return it in the same cycle unless you add a fall-through path — document which; at full a same-cycle read+write can legally accept the new data because a slot frees, so full should be computed against next-state pointers or you lose throughput. Power-of-two depth makes pointer wrap free (natural overflow) and the full test a single XOR. On reset both pointers go to zero so the FIFO reads empty; RAM contents are don't-care. Assertions: never write when full, never read when empty, count of stored items matches pointer difference, and data read out matches data written in order (scoreboard).",
  votes: { up: 61, down: 2 }
},
{
  id: "iq-302", track: "interview", branch: "Hardware & RTL",
  title: "Blocking vs Non-Blocking in a Pipeline", difficulty: "medium",
  tags: ["Verilog", "blocking", "NBA"],
  summary: "Why = versus <= changes pipeline behavior, and the style rules that keep you safe.",
  statement: "A two-stage pipeline is written with blocking assignments (=) in one always block and non-blocking (<=) in another. Explain the behavioral difference at simulation time, why the blocking version can silently create a single-stage pipeline, and the coding guidelines professional teams enforce. Follow-ups: what belongs in combinational always blocks, and why is mixing the two in one block dangerous?",
  kind: "answer", answer: null,
  solution: "Non-blocking assignments schedule updates at the end of the time step, so every right-hand side reads the pre-edge values: stage2 <= stage1 and stage1 <= din gives a genuine two-stage shift. Blocking assignments execute immediately and in source order: stage2 = stage1 after stage1 = din reads the NEW stage1, collapsing two stages into one — functionally wrong but still compiling and passing shallow tests. Guidelines: use <= for all sequential (clocked) logic, = only in combinational always blocks, never mix both in one block, and never drive the same variable from two blocks. Mixing is dangerous because race order between blocks becomes simulator-dependent, so RTL and gate-level simulations can diverge. Lint rules (e.g. Verilator's BLKSEQ) exist precisely because this is a career-limiting bug class.",
  votes: { up: 55, down: 3 }
},
{
  id: "iq-303", track: "interview", branch: "Hardware & RTL",
  title: "Metastability and MTBF Math", difficulty: "hard",
  tags: ["CDC", "metastability", "MTBF"],
  summary: "Derive why one extra flop buys exponential reliability, and compute a real MTBF.",
  statement: "An asynchronous signal arrives at a 100 MHz clock domain. The flip-flop has tau = 30 ps and the effective asynchronous edge rate is 1 MHz. Using MTBF = exp(t_r/tau) / (f_clk * f_data * T0) with T0 = 1e-12 s, compute the MTBF for one synchronizer stage (t_r = 1 clock period minus setup budget, use 9 ns) versus two stages (t_r = 19 ns). Explain what the exponential term means physically. Follow-up: why doesn't a faster clock always improve MTBF?",
  kind: "answer", answer: null,
  solution: "One stage: t_r/tau = 9e-9/30e-12 = 300, so MTBF = e^300 / (1e8 * 1e6 * 1e-12) = e^300 / 1e2 — e^300 is about 1.9e130, giving roughly 1.9e128 seconds. Two stages: t_r/tau = 633, e^633 ≈ 3.5e274, MTBF ≈ 3.5e272 s. The exponential is the probability that a metastable flop has NOT resolved after t_r — metastability decays exponentially with resolution time, so each additional clock of slack multiplies reliability by e^(period/tau), an astronomically large factor. Physically the extra flop does not make the signal 'more synchronized'; it just waits longer before the value is consumed. A faster clock improves throughput but shortens t_r per stage, and since MTBF is exponential in t_r, a faster clock with the same stage count can be WORSE — you may need more stages, not fewer.",
  votes: { up: 48, down: 4 }
},
{
  id: "iq-304", track: "interview", branch: "Hardware & RTL",
  title: "FSM Encoding Trade-offs", difficulty: "medium",
  tags: ["FSM", "encoding", "one-hot"],
  summary: "Binary, one-hot and Gray encodings: area, timing, power and failure behavior.",
  statement: "You must implement a 16-state control FSM for an ASIC and the same FSM for a small FPGA. Compare binary, one-hot and Gray encodings on flip-flop count, next-state logic depth, timing, glitch behavior and power. Which do you pick for each target and why? Follow-up: how does safe FSM recovery from an illegal state interact with encoding choice?",
  kind: "answer", answer: null,
  solution: "Binary uses 4 flops but deeper next-state logic: fewer registers, more levels of gates, denser for ASICs where flops are cheap per-transistor but routing is not. One-hot uses 16 flops with shallow next-state logic (one AND path per state) — fastest and easiest to meet timing, and it maps beautifully onto FPGAs whose fabric is flop-rich with dedicated carry/logic paths, so one-hot is the usual FPGA default. Gray encoding changes one bit per transition along the main sequence, minimizing toggle power and avoiding multi-bit glitches when state is sampled combinationally — valuable if the state vector leaves the module or feeds an asynchronous observer. For illegal-state recovery, one-hot can land in a multi-hot state that satisfies several next-state terms at once, so 'safe' FSMs add a default branch or detect-and-reset logic; binary just decodes unused codes to a known state. Answer: binary (or gray) for the ASIC control path, one-hot for the FPGA.",
  votes: { up: 44, down: 3 }
},
{
  id: "iq-305", track: "interview", branch: "CPU & Architecture",
  title: "MESI Protocol Walkthrough", difficulty: "hard",
  tags: ["cache coherence", "MESI", "multicore"],
  summary: "Trace state transitions on a two-core system and explain where the bandwidth goes.",
  statement: "Two cores share memory with MESI-coherent private L1 caches and a write-back policy. Core 0 reads line X, core 1 reads X, core 1 writes X, core 0 reads X again, core 0 writes X. Walk the MESI state of X in each cache after every step and identify every bus transaction. Follow-ups: what does the Owned state buy you in MOESI, and why do false-sharing workloads collapse even though coherence is correct?",
  kind: "answer", answer: null,
  solution: "Step 1 — C0 reads: bus read, memory supplies, C0 = Exclusive. Step 2 — C1 reads: bus read, C0 snoops and drops to Shared, C1 = Shared. Step 3 — C1 writes: C1 issues bus upgrade/invalidate, C0's copy goes Invalid, C1 = Modified. Step 4 — C0 reads: bus read; C1 has the dirty data so it supplies it (or write-back then memory), C1 drops to Shared (clean after write-back), C0 = Shared. Step 5 — C0 writes: invalidate to C1, C1 = Invalid, C0 = Modified. Owned (MOESI) lets a dirty line be shared without writing back to memory — the owner supplies data on snoops, saving DRAM bandwidth on producer-consumer traffic. False sharing: two variables in ONE line ping the whole line between caches on every write, each transition costing an invalidate plus transfer; the protocol is correct, but the line granularity means throughput degrades to coherence-latency-bound — fixed by padding to separate cache lines.",
  votes: { up: 52, down: 2 }
},
{
  id: "iq-306", track: "interview", branch: "CPU & Architecture",
  title: "Store Buffer and Memory Ordering", difficulty: "hard",
  tags: ["memory model", "store buffer", "x86-TSO"],
  summary: "Why stores retire before they're visible, and the litmus test that proves it.",
  statement: "Explain what a store buffer does and why it exists. On x86-TSO, two cores run: core 0 does x=1; r1=y and core 1 does y=1; r2=x (all initially 0). Is the outcome r1=0 and r2=0 possible? Explain exactly why or why not, and what a store fence changes. Follow-up: why is this reordering still consistent with 'single-core correctness'?",
  kind: "answer", answer: null,
  solution: "The store buffer lets a store retire without waiting for cache coherence: the store sits in a per-core FIFO while the core runs ahead, and later loads first check the buffer (store-to-load forwarding) for their own stores. It exists because coherence round-trips are tens of cycles and stores are common — stalling would gut IPC. The r1=0 AND r2=0 outcome IS possible on TSO: each core's store can still be sitting in its store buffer when its load executes, so core 0's load of y misses core 1's buffered store (reads 0) and symmetrically for core 1. This is the classic store-buffering litmus test. An MFENCE (or a locked instruction) drains the store buffer before subsequent loads, forbidding the outcome. Single-core correctness survives because forwarding guarantees a core always sees its OWN most recent stores — reordering is only observable across cores, which is precisely what the memory model formalizes.",
  votes: { up: 47, down: 5 }
},
{
  id: "iq-307", track: "interview", branch: "CPU & Architecture",
  title: "Why Speculative Execution Leaks Secrets", difficulty: "hard",
  tags: ["Spectre", "speculation", "side channels"],
  summary: "The microarchitectural reasoning behind Spectre, and the taxonomy of mitigations.",
  statement: "Spectre variant 1 leaks data through bounds-check bypass. Explain the full mechanism: what the predictor is trained to do, what executes transiently, why the wrong-path instructions leave no architectural trace but DO leave a microarchitectural one, and how the attacker reads the secret. Then classify the mitigation families and their costs. Follow-up: why does the same reasoning make retpolines necessary for indirect branches?",
  kind: "answer", answer: null,
  solution: "The attacker trains the branch predictor so a bounds check is predicted 'in bounds', then supplies an out-of-bounds index. Before the branch resolves, the core transiently executes array1[x] with malicious x, then uses the loaded byte as an index into array2 — pulling a secret-dependent cache line. When the branch resolves, the transient results are squashed: registers and memory are architecturally untouched. But cache state is NOT rolled back: array2[secret*64] is now cached. The attacker times accesses to array2 candidates (Flush+Reload or Prime+Probe); the fast one reveals the secret byte. Mitigations: (1) stop speculation at the boundary — fences like LFENCE, cheap but serializing; (2) mask the index so even wrong-path execution stays in bounds (array index masking), cheap but per-site; (3) isolate address spaces (KPTI), large syscall overhead; (4) microcode/hardware fixes that tag or flush predictor state. Indirect branches are worse: the predictor can be trained to jump to an attacker-chosen gadget (BTI), and you can't mask a code pointer, so retpolines replace the indirect jump with a return-trampoline that the return stack predicts, keeping speculation in a harmless loop.",
  votes: { up: 58, down: 3 }
},
{
  id: "iq-308", track: "interview", branch: "Quant & Trading",
  title: "Fair Price of a Dice Game", difficulty: "medium",
  tags: ["expected value", "options thinking", "games"],
  summary: "Price a re-roll option: EV with one re-roll beats naive one-roll EV.",
  statement: "You may roll a fair die once and collect its value in dollars, or reject the first roll and roll again, collecting the second result (no further re-rolls). What is the fair price of this game, and what is the optimal strategy? Follow-up: how does the fair price change with a second re-roll option, and why is this structurally an American option?",
  kind: "answer", answer: null,
  solution: "Strategy: re-roll when the first result is below the expected value of a fresh roll, which is 3.5. So keep 4, 5, 6 and re-roll 1, 2, 3. Fair price = (1/2)(3.5) + (1/6)(4+5+6) = 1.75 + 2.5 = 4.25 dollars. With a second re-roll option the reservation threshold rises: now you keep first-roll values above the fair price of the one-re-roll game (4.25), i.e. keep 5 and 6, re-roll 1-4, giving (4/6)(4.25) + (1/6)(5+6) = 2.833 + 1.833 = 4.667. It is an American option because you choose exercise time based on current information, and the threshold structure (exercise when value exceeds continuation value) is exactly optimal stopping — the same backward-induction logic used to price American puts.",
  votes: { up: 63, down: 1 }
},
{
  id: "iq-309", track: "interview", branch: "Quant & Trading",
  title: "Making a Market: Spread vs Adverse Selection", difficulty: "hard",
  tags: ["market making", "adverse selection", "microstructure"],
  summary: "Why a market maker earns the spread from the uninformed and loses it to the informed.",
  statement: "You quote a bid-ask around your fair-value estimate. Explain the two counterparty types a market maker faces, why quoting tighter attracts more flow but worse selection, and how inventory risk feeds back into your quotes. Follow-ups: what is 'pinging', and how do latency and queue position change the economics?",
  kind: "answer", answer: null,
  solution: "Liquidity traders trade for reasons unrelated to value; against them you systematically earn half the spread per round trip. Informed traders trade because your quote is wrong relative to near-future value; they buy exactly when your ask is cheap and sell when your bid is rich, so every fill against them loses on average — adverse selection. Tightening your spread wins more of BOTH flows: volume rises but the informed share of fills rises faster, because informed traders hit the tightest prices first, so there is an optimal width balancing spread capture against selection losses. Inventory: a persistent position moves your fair estimate only slightly but moves your RISK a lot, so you skew quotes (lower both bid and ask when long) to attract offsetting flow — the spread is also an inventory-management fee. Pinging is probing with tiny orders to detect hidden size or your skew before a large informed order. Latency decides who cancels first when news arrives: the slower maker is systematically picked off, and queue position determines whether you get filled by the uninformed (good) or only after the informed have traded (toxic).",
  votes: { up: 41, down: 4 }
},
{
  id: "iq-310", track: "interview", branch: "Quant & Trading",
  title: "Kelly Criterion Bet Sizing", difficulty: "medium",
  tags: ["Kelly", "bet sizing", "log utility"],
  summary: "Derive f* = p - q/b and explain why full Kelly is the growth-rate maximum, not the comfort maximum.",
  statement: "A bet pays b-to-1: you win b dollars per dollar staked with probability p and lose the stake with probability q = 1-p. Derive the Kelly-optimal fraction of bankroll to bet. Compute it for p = 0.55, b = 1. Why does maximizing expected log growth differ from maximizing expected value, and why do practitioners use fractional Kelly? Follow-up: what breaks the formula when bets are correlated?",
  kind: "answer", answer: null,
  solution: "After one bet with fraction f, bankroll multiplies by (1 + b f) on a win and (1 - f) on a loss. Expected log growth is G(f) = p ln(1 + b f) + q ln(1 - f). Setting dG/df = p b/(1 + b f) - q/(1 - f) = 0 gives f* = (p b - q)/b = p - q/b. For p = 0.55, b = 1: f* = 0.55 - 0.45 = 0.10, ten percent of bankroll. Maximizing expected VALUE would push f to 100% whenever the edge is positive — and guarantees near-certain ruin over many trials because volatility drags the geometric mean; log utility prices that drag, so Kelly maximizes the long-run geometric growth rate, which no other fixed fraction can beat asymptotically. Practitioners bet half or quarter Kelly because edge estimates are noisy: overbetting a mis-estimated edge costs more growth than underbetting, and drawdowns at full Kelly are brutal (50%+ is routine). With correlated bets the independence assumption breaks: joint drawdown probabilities are understated, so effective fractions must shrink — portfolio Kelly replaces per-bet Kelly.",
  votes: { up: 57, down: 2 }
}
]);
