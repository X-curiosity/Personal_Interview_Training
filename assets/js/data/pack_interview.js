/* Interview pack: 60 frequently-asked company interview questions.
   Open-ended Q&A — no `answer` field; the reveal box shows `solution`.
   Branches: Hardware & RTL, CPU & Architecture, GPU & CUDA, Quant & Trading (15 each). */
registerProblems([
/* ============ Hardware & RTL (iq-101 .. iq-115) ============ */
{
  id: "iq-101", track: "interview", branch: "Hardware & RTL",
  title: "Race Conditions in Verilog Simulation", difficulty: "easy",
  tags: ["race conditions", "NVIDIA-style"],
  summary: "Two always blocks touch the same signal on the same clock edge — explain the race, the event scheduler, and the coding rule that prevents it.",
  statement: "Two always blocks write and read the same signal on the same clock edge. What happens, and is the result deterministic? Explain how the Verilog event scheduler makes this a race, and give the coding rule that prevents it. A strong answer names the active and non-blocking regions of the scheduler and states the = versus <= discipline.",
  kind: "answer",
  solution: "Verilog executes always blocks in an arbitrary order within the active region of a timestep, so if one block reads a signal with blocking assignment while another writes it, the observed value depends on simulator scheduling order — a true race. Non-blocking assignments defer updates to the NBA region at the end of the timestep, so all reads in the active region see the old value and behavior becomes deterministic. The standard rule: use <= for sequential logic, = only inside combinational blocks, and never mix both on the same variable. Races are especially nasty because RTL sim, gate-level sim, and hardware can each pick a different winner. Follow-up trap: blocking assignments inside a clocked always block can silently create the same race between two clocked blocks.",
  votes: { up: 54, down: 2 }
},
{
  id: "iq-102", track: "interview", branch: "Hardware & RTL",
  title: "Mealy vs Moore FSM Tradeoffs", difficulty: "medium",
  tags: ["FSM", "Intel-style"],
  summary: "When does a Mealy machine beat a Moore machine? Cover state count, latency, glitch risk, and timing paths.",
  statement: "Explain the difference between Mealy and Moore state machines and when you would choose each. Give an example where Mealy needs fewer states, and discuss the output-glitch and timing implications. A strong answer covers state count, response latency, and what happens to Mealy outputs when inputs glitch.",
  kind: "answer",
  solution: "A Moore machine's outputs depend only on the current state; a Mealy machine's outputs depend on state and current inputs. Mealy therefore typically needs fewer states and reacts one cycle earlier — a classic example is an edge detector, which needs one state in Mealy form but two in Moore. The price is that Mealy outputs are combinational on the inputs, so they can glitch and they lengthen the input-to-output timing path, which matters when the FSM drives another block or a tight interface. Moore outputs are registered by construction, clean and easy to time, at the cost of an extra cycle of latency. Follow-up: in synchronous designs you often register Mealy outputs to keep the early decoding without the glitch risk.",
  votes: { up: 48, down: 3 }
},
{
  id: "iq-103", track: "interview", branch: "Hardware & RTL",
  title: "Async Assert, Sync Deassert Reset", difficulty: "easy",
  tags: ["reset", "Qualcomm-style"],
  summary: "The standard reset rule: assert asynchronously, deassert synchronously. Explain the circuit and the failure mode each half protects against.",
  statement: "Why do we assert reset asynchronously but deassert it synchronously? Describe the reset synchronizer circuit and the specific failure mode each half of the rule protects against. A strong answer mentions recovery/removal timing and multi-bit state machines.",
  kind: "answer",
  solution: "Asserting asynchronously guarantees the flops enter a known state immediately, even without a running clock, which is essential for power-up and fault recovery. Deassertion is the dangerous edge: if reset releases near the clock edge, flops can violate recovery/removal timing and go metastable, and different flops may leave reset on different cycles, corrupting state machines and counters. A reset synchronizer — two flops clocked by the destination clock with asynchronous reset pins — deasserts cleanly on a clock edge so the whole domain leaves reset together with a full cycle to settle. Follow-up trap: each clock domain needs its own deassertion synchronizer; one globally synced reset is not enough.",
  votes: { up: 51, down: 2 }
},
{
  id: "iq-104", track: "interview", branch: "Hardware & RTL",
  title: "Glitch-Free Clock Muxing", difficulty: "hard",
  tags: ["clock mux", "Apple-style"],
  summary: "Switch between two asynchronous clocks at runtime with no glitches or runt pulses — why is a plain mux broken, and what is the standard fix?",
  statement: "You must switch a block between two asynchronous clocks at runtime with no glitches and no short pulses. Design the mux and explain why a plain combinational select is broken. What constraints apply to the select signal, and what happens if one clock is not running?",
  kind: "answer",
  solution: "A combinational mux can switch at any moment, producing a runt pulse that violates minimum pulse width and can clock a flop mid-transition. The standard glitch-free mux gives each clock an enable generated by a negative-edge flop (or low-transparent latch) followed by a rising-edge flop, so each enable only changes while its own clock is low; the enables are one-hot, and the final OR of (clk_i AND en_i) can never glitch. The select is handshaken into both domains, so switching takes a few cycles of each clock. Follow-up traps: both clocks must be running to complete the switch, the select must stay stable during the handshake, and if a source clock can be gated off you need a variant that tolerates a dead clock.",
  votes: { up: 37, down: 5 }
},
{
  id: "iq-105", track: "interview", branch: "Hardware & RTL",
  title: "Clock Gating: Pros and Cons", difficulty: "medium",
  tags: ["clock gating", "ARM-style"],
  summary: "Why clock gating is the biggest dynamic-power lever, the latch-based ICG cell, and the timing/DFT costs it introduces.",
  statement: "What is clock gating, why is it the single biggest dynamic-power lever, and what can go wrong with a naive implementation? Describe the correct integrated clock-gating cell and the implications for timing and scan testing.",
  kind: "answer",
  solution: "Dynamic power is roughly alpha*C*V^2*f, and the clock network plus flop clock pins are the most active nets in the chip, so stopping the clock on idle blocks saves a large fraction of power. The naive AND gate on the clock glitches if enable changes while the clock is high; the correct ICG cell is a low-transparent latch on enable followed by an AND, so enable is only sampled while the clock is low. Costs: clock-tree insertion delay and skew grow, enable becomes a timing-critical path that synthesis must check for both edges, and scan testing needs a test-enable override so flops stay controllable. Follow-up: coarse gating of whole blocks saves the most, but synthesis-added fine-grained gating captures idle cycles you never thought about.",
  votes: { up: 44, down: 3 }
},
{
  id: "iq-106", track: "interview", branch: "Hardware & RTL",
  title: "Why Inferred Latches Are Dangerous", difficulty: "easy",
  tags: ["latches", "AMD-style"],
  summary: "How incomplete if/case statements infer latches, why teams ban them, and the one legitimate use of a latch.",
  statement: "Why do design teams ban inferred latches in RTL? Show how one gets inferred, explain why latches complicate timing analysis and test, and name one legitimate use of a deliberate latch.",
  kind: "answer",
  solution: "Latches get inferred when a combinational always block does not assign a signal on every path — an if without else, or a case without default. They are level-sensitive, so they pass glitches straight through while open, they make timing analysis much harder because time borrows across the latch boundary, and they break scan because latch state is not controllable or observable like flop state. In FPGA flows there may be no latch primitive at all, so the tool emulates one horribly with LUT feedback loops. The legitimate uses: high-performance designs deliberately use latch-based time borrowing, and every ICG cell contains a latch — but those are instantiated intentionally, not inferred by accident. Follow-up: full_case and parallel_case pragmas can reintroduce sim/silicon mismatches that look exactly like latch bugs.",
  votes: { up: 46, down: 3 }
},
{
  id: "iq-107", track: "interview", branch: "Hardware & RTL",
  title: "Retiming Intuition", difficulty: "hard",
  tags: ["retiming", "NVIDIA-style"],
  summary: "What transformation is retiming allowed to make, what does it preserve, and what limits it? Walk a long combinational cone example.",
  statement: "Explain retiming: what transformation is the tool allowed to make, what does it preserve, and what limits it? Walk through an example with a long combinational cone between two registers. A strong answer states the cycle-conservation invariant and what retiming cannot do.",
  kind: "answer",
  solution: "Retiming moves registers across combinational logic — pushing a flop forward or backward through gates — so the worst register-to-register delay shrinks without changing the visible input/output behavior. The invariant is that the number of registers on every cycle of the circuit graph is preserved, so functionality and boundary latency stay identical. Example: a multiplier followed by a long adder tree between two flops — sliding the destination flop backward into the tree balances the stages and can double the achievable frequency. Limits: registers cannot cross black boxes, memories, or logic with incompatible enables/resets, and initial states must remain computable after the move. Follow-up trap: retiming cannot create parallelism — it rebalances existing flops, so a 3-cycle latency stays 3 cycles.",
  votes: { up: 33, down: 6 }
},
{
  id: "iq-108", track: "interview", branch: "Hardware & RTL",
  title: "Synchronizer MTBF Tradeoffs", difficulty: "medium",
  tags: ["CDC", "Broadcom-style"],
  summary: "What sets a two-flop synchronizer's MTBF, the exponential resolution-time lever, and when you go to three flops.",
  statement: "What determines the MTBF of a two-flop synchronizer, and how do you decide between two and three flops? Give the intuition behind the MTBF formula and the design knobs you control. A strong answer explains why the exponential term dominates and why multi-bit buses need more than per-bit synchronizers.",
  kind: "answer",
  solution: "A flip-flop sampling an asynchronous input can go metastable, and it resolves exponentially with time constant tau; the failure rate is roughly f_data * f_clk * T0 * exp(-t_resolve/tau), where t_resolve is the slack given to the second flop. MTBF is the inverse, and it is brutally sensitive: one extra nanosecond of resolution time can buy decades of MTBF because of the exponential. Two flops suffice when the synchronizer path has a full cycle of slack and toggle rates are moderate; three flops (or a slower staging clock) are used for very high data rates or when the required MTBF is centuries, as in safety-critical crossings. Follow-up: you can never make metastability impossible, only astronomically rare — and multi-bit buses need Gray coding or a handshake, because per-bit synchronizers can capture the bus mid-transition.",
  votes: { up: 41, down: 4 }
},
{
  id: "iq-109", track: "interview", branch: "Hardware & RTL",
  title: "Valid/Ready Handshake Rules", difficulty: "medium",
  tags: ["handshake", "Tesla-style"],
  summary: "When does a valid/ready transfer occur, what rules must each side obey, and what deadlock and throughput mistakes do juniors make?",
  statement: "Describe the valid/ready handshake: when exactly does a transfer occur, and what rules must the producer and consumer each obey? Explain the classic deadlock mistake and how a skid buffer restores full throughput when you register the interface.",
  kind: "answer",
  solution: "A transfer happens exactly on cycles where valid AND ready are both high at the clock edge: valid means the producer has data, ready means the consumer can take it. The key rules: once valid is asserted with data, it must stay asserted with stable data until accepted, and valid must never combinationally wait on ready — if both sides wait for each other, you deadlock. Registering valid and ready to break timing paths inserts bubbles that halve throughput; a skid buffer (a two-entry elastic buffer) decouples both sides and restores one transfer per cycle. Follow-up traps: long combinational ready-from-valid chains across many blocks become the critical path, and AXI-Stream's rule that valid may not depend on ready exists precisely to prevent cross-module deadlock.",
  votes: { up: 43, down: 2 }
},
{
  id: "iq-110", track: "interview", branch: "Hardware & RTL",
  title: "What Synthesis Actually Does to Your RTL", difficulty: "hard",
  tags: ["synthesis", "Intel-style"],
  summary: "From RTL to netlist: what the tool optimizes, what it can never fix, and why the netlist can behave differently from your simulation.",
  statement: "Walk through what a synthesis tool actually does from RTL to gate-level netlist. What does it optimize, what can it NOT fix no matter how good your constraints are, and why can the netlist behave differently from your RTL simulation?",
  kind: "answer",
  solution: "Synthesis elaborates your RTL into a generic netlist of inferred flops, muxes and operators, runs technology-independent optimizations — constant propagation, dead-code elimination, FSM re-encoding, resource sharing — then maps to the target cell library and optimizes against your area, timing and power constraints. It will happily restructure logic, duplicate registers to fix fanout, retime, and flatten hierarchy if allowed. What it cannot fix is bad architecture: if your algorithm needs three passes over the data or your critical path is a 64-bit ripple chain, no constraint file saves you. Sim/silicon mismatches come from x-optimism in simulation, incomplete sensitivity lists, latches created by full_case pragmas, and uninitialized state the sim happened to mask. Follow-up: always read elaboration warnings — inferred latches and multidriven nets are bugs you wrote, not bugs the tool made.",
  votes: { up: 36, down: 4 }
},
{
  id: "iq-111", track: "interview", branch: "Hardware & RTL",
  title: "Blocking Assignment in a Clocked Block", difficulty: "medium",
  tags: ["blocking assignment", "AMD-style"],
  summary: "Show what breaks when you use = inside always @(posedge clk) — a two-line swap bug, and the hardware it actually describes.",
  statement: "Show what goes wrong when you use blocking assignments (=) inside an always @(posedge clk) block. Give a two-line example that simulates wrong, explain the hardware it actually describes, and state when blocking inside a clocked block is acceptable.",
  kind: "answer",
  solution: "Inside a clocked block, = updates the variable immediately, so a later statement in the same block — or another always block reading it — sees the NEW value, not the pre-edge value. The classic bug: writing a swap as a = b; b = a degenerates to two copies of b, because the second line reads the just-written a; with non-blocking assignments both right-hand sides are sampled at the edge and the swap works. Non-blocking also removes order-dependence between always blocks, which otherwise lets one simulator ordering chain logic through while another does not — and synthesis may match neither. Blocking inside clocked blocks is not illegal: it is the right choice for local temporaries, provided the temp is assigned before use and never read by another block. Follow-up: the safe mental model is that <= describes flop inputs, = describes combinational wiring.",
  votes: { up: 47, down: 3 }
},
{
  id: "iq-112", track: "interview", branch: "Hardware & RTL",
  title: "case vs if-else: Priority Hardware", difficulty: "easy",
  tags: ["priority logic", "Qualcomm-style"],
  summary: "What hardware does an if-else chain imply versus a case statement, why it matters for timing, and when synthesis ignores the difference.",
  statement: "What hardware does an if-else-if chain imply versus a case statement, and why does the distinction matter for timing and area? When can synthesis ignore the difference, and what is dangerous about casex and casez?",
  kind: "answer",
  solution: "An if-else-if chain infers a priority encoder: each condition gates the branches below it, so the logic is a serial chain and the last branch sits at the deepest level. A full, mutually exclusive case infers a parallel mux where every branch has equal delay — better timing and often smaller area. If your conditions are actually mutually exclusive but you wrote if-else, you paid for priority logic you did not need; if they overlap and you wrote case, simulation and synthesis can disagree. Synthesis can sometimes prove mutual exclusivity and flatten the if-else anyway, but do not count on it for complex conditions. Follow-up: casex and casez are dangerous because don't-care bits can mask real bugs and create x-masking mismatches — prefer plain case, or unique case to state your intent and let the tool check it.",
  votes: { up: 45, down: 2 }
},
{
  id: "iq-113", track: "interview", branch: "Hardware & RTL",
  title: "X-Propagation and X-Optimism", difficulty: "medium",
  tags: ["x-propagation", "Apple-style"],
  summary: "Why RTL simulation is x-optimistic, how that hides real bugs, and how gate-level sim and x-prop tools fill the gap.",
  statement: "What is x-propagation, why is RTL simulation described as x-optimistic, and how does that hide real bugs? Explain how gate-level simulation and dedicated x-propagation tools help, and why if (sig == 1'bx) never works.",
  kind: "answer",
  solution: "Uninitialized or unknown signals are modeled as x, and the RTL simulator's truth tables are optimistic: an if(x) silently takes the else branch, and x AND 0 evaluates to 0, so the sim resolves ambiguity that silicon will resolve randomly. This masks real bugs — an uninitialized state register can look fine in RTL sim for months and then hang the state machine during bring-up. Gate-level simulation is x-pessimistic instead: x's multiply through the netlist until everything drowns, which catches reset bugs but is too noisy and slow to run early. Modern x-propagation flows use formal analysis or random 2-state initialization to find where uninitialized state can actually reach an observable output. Follow-up: the classic trap is if (sig == 1'bx) — that comparison is always false in simulation, so the check silently never fires; you need a case equality operator or an assertion.",
  votes: { up: 38, down: 4 }
},
{
  id: "iq-114", track: "interview", branch: "Hardware & RTL",
  title: "Why Verification Takes 70% of the Schedule", difficulty: "medium",
  tags: ["verification", "Broadcom-style"],
  summary: "Why checking a design costs more than writing it: state-space explosion, respin economics, and what actually shrinks the effort.",
  statement: "The industry rule of thumb says verification is 60 to 70 percent of project effort. Why is checking a design so much more expensive than writing it? What levers actually shrink verification effort, and why is coverage alone not proof of correctness?",
  kind: "answer",
  solution: "Design effort scales with what you intended to build; verification effort scales with the state space of everything the design could possibly do, and that grows exponentially with interfaces, modes, and concurrency. A bug found in silicon costs a respin — millions of dollars and months of schedule — so teams rationally pay for coverage closure, regressions, formal proofs, and emulation to buy confidence, and the last 10 percent of coverage is brutally slow because it is the corner cases nobody imagined. You shrink the effort with reusable verification IP and UVM environments, assertions embedded in the RTL (they catch bugs near the source, where debug is cheap), formal verification for control logic, and designing for verifiability with simpler interfaces and fewer modes. Follow-up trap: coverage measures what you looked at, not what you should have looked at — a coverage hole is an unasked question, and 100 percent code coverage with no assertions proves almost nothing.",
  votes: { up: 40, down: 5 }
},
{
  id: "iq-115", track: "interview", branch: "Hardware & RTL",
  title: "Constrained Random vs Directed Testing", difficulty: "hard",
  tags: ["CRV", "NVIDIA-style"],
  summary: "When constrained-random beats directed tests, what each misses, and how coverage closure — not test count — is the exit criterion.",
  statement: "When do you choose constrained-random verification over directed tests, and what does each approach systematically miss? How do you know when constrained-random testing is done, and why is random stimulus without checking worthless?",
  kind: "answer",
  solution: "Directed tests are cheap to write and target specific known behaviors — ideal for bring-up and protocol conformance — but they only test what you thought of, so they scale linearly with engineer-hours and miss the interactions nobody imagined. Constrained random automates stimulus generation within legal bounds, so one environment explores orders of magnitude more state space, especially cross-products of features and timing coincidences; its weakness is that reaching deep states, like a rare FIFO occupancy coinciding with error injection, may need careful constraint crafting or coverage-driven feedback. You know it is done when functional coverage is closed — every covergroup bin hit — and the bug-discovery curve has flattened across many seeds; coverage, not test count, is the exit criterion. Follow-up trap: random stimulus without a scoreboard and assertions just generates waves nobody checks — stimulus is the easy half of verification, checking is the hard half.",
  votes: { up: 34, down: 5 }
},

/* ============ CPU & Architecture (iq-116 .. iq-130) ============ */
{
  id: "iq-116", track: "interview", branch: "CPU & Architecture",
  title: "Pipeline Hazards and Forwarding", difficulty: "easy",
  tags: ["pipelining", "Intel-style"],
  summary: "Name the three hazard classes, show a data hazard that forwarding fixes, and identify the one case that still needs a stall.",
  statement: "In a classic 5-stage RISC pipeline, name the three hazard classes and show a two-instruction sequence that stalls without forwarding. Explain how forwarding fixes it, and identify the one dependent case that still requires a stall bubble even with full forwarding.",
  kind: "answer",
  solution: "The three classes are data hazards (a consumer needs a producer's result), control hazards (branches redirect the fetch stream), and structural hazards (two stages want the same resource, like a single memory port). Example: add x1, x2, x3 followed by sub x4, x1, x5 — the sub reads x1 in decode while the add only writes it back three cycles later. Forwarding routes the add's result from the EX/MEM pipeline register straight back to the ALU input, eliminating the stall entirely. The case forwarding cannot fix is load-use: the load's data only exists at the end of MEM, but the dependent instruction needs it at the start of EX in the same cycle, so one bubble is mandatory. Follow-up: control hazards are handled by prediction rather than stalls because waiting for branch resolution every time would cost around 20 percent of IPC.",
  votes: { up: 52, down: 1 }
},
{
  id: "iq-117", track: "interview", branch: "CPU & Architecture",
  title: "Why Deeper Pipelines Hurt", difficulty: "medium",
  tags: ["pipeline depth", "ARM-style"],
  summary: "If pipelining raises frequency, why stop at ~15-20 stages? Quantify misprediction penalty, register overhead, and the Pentium 4 lesson.",
  statement: "If pipelining raises clock frequency, why did the industry stop around 15 to 20 stages instead of going to 50? Quantify the costs that grow with pipeline depth and explain what the Pentium 4 era taught the industry.",
  kind: "answer",
  solution: "Each stage adds register overhead — setup time and clock skew eat a fixed chunk of every cycle — so frequency gains flatten while the number of in-flight instructions grows linearly. The killer is the branch misprediction penalty: a 20-stage pipeline flushes 15 or more cycles per miss, and performance scales with frequency times (1 minus miss-rate times penalty), so the two terms fight each other. Power also climbs superlinearly because pipeline registers, speculation machinery, and clock distribution all grow with depth. The 31-stage Prescott Pentium 4 was the cautionary tale: huge frequency, mediocre IPC, terrible performance per watt, and the industry pivoted to wider, not deeper, cores. Follow-up: modern high-frequency cores still exist, but the effective depth is hidden behind excellent branch prediction and aggressive out-of-order scheduling.",
  votes: { up: 42, down: 3 }
},
{
  id: "iq-118", track: "interview", branch: "CPU & Architecture",
  title: "Register Renaming Intuition", difficulty: "hard",
  tags: ["OoO", "Apple-style"],
  summary: "How renaming removes WAR and WAW hazards, why RAW survives, and what still bounds ILP after renaming.",
  statement: "Explain how register renaming enables out-of-order execution. Which false dependencies does it remove, which real dependency remains, and why? Walk through a short instruction sequence showing two uses of the same architectural register.",
  kind: "answer",
  solution: "The ISA exposes 16 to 32 architectural registers, but the core has hundreds of physical registers; the renamer maps each instruction's destination to a fresh physical register and records source mappings in a rename table. This eliminates WAR and WAW hazards — the false dependencies caused purely by reusing the same architectural name — so instructions that merely share register names can execute in any order. The RAW dependency is real dataflow and survives, becoming a tracked dependency between physical registers. Example: x1 = load; x2 = x1 + 3; x1 = load2; x3 = x1 * 2 — after renaming, the second load's x1 maps to a different physical register, so the multiply issues without waiting on the add chain. Follow-up trap: renaming removes name conflicts, not the fundamental limit — the program's true dependency chain still bounds the achievable ILP.",
  votes: { up: 39, down: 4 }
},
{
  id: "iq-119", track: "interview", branch: "CPU & Architecture",
  title: "ROB vs Reservation Stations", difficulty: "medium",
  tags: ["ROB", "AMD-style"],
  summary: "What problem each structure solves, the instruction lifecycle through both, and why retirement must be in program order.",
  statement: "Distinguish the reorder buffer from reservation stations: what problem does each solve, and what happens to an instruction in each from dispatch to retire? Explain why retirement must be in-order even though execution is out-of-order.",
  kind: "answer",
  solution: "Reservation stations hold decoded instructions waiting for their operands; each cycle, any ready instruction issues to a free execution unit — that is the dynamic, out-of-order scheduler. The reorder buffer holds every instruction in program order from dispatch to retire, tracking completion; it exists to make out-of-order execution look in-order to the outside world. An instruction is dispatched into both structures, issues from its reservation station when operands are ready, writes its result to the ROB and the bypass network, then retires from the ROB head in program order, updating architectural state. In-order retire is what makes precise exceptions possible: if an older instruction faults, you squash everything younger in the ROB and present a clean architectural state to the handler. Follow-up: the ROB doubles as the speculation recovery mechanism — a mispredicted branch just flushes ROB entries younger than the branch.",
  votes: { up: 44, down: 2 }
},
{
  id: "iq-120", track: "interview", branch: "CPU & Architecture",
  title: "Store Buffers and Store-to-Load Forwarding", difficulty: "medium",
  tags: ["store buffer", "Intel-style"],
  summary: "Why stores can't write the cache at execute time, how forwarding serves younger loads, and the TSO reordering this creates.",
  statement: "What is a store buffer and why can't stores just write the cache when they execute? Explain store-to-load forwarding, and describe the memory-ordering subtlety the store buffer creates for other cores observing your stores.",
  kind: "answer",
  solution: "Stores cannot write the cache at execute time because the instruction may be speculative or not yet retired — a mispredicted or excepting store must never reach memory. So stores sit in a store buffer and commit to the L1 in order once they are the oldest instruction and the line is in the right coherence state. A younger load whose address matches a pending store gets the data forwarded straight from the buffer instead of waiting for the cache. The subtlety: a core observes its OWN stores early via forwarding while other cores see them only at commit, which is exactly what TSO permits — a store followed by a load of a different address can appear reordered to another core. Follow-up: store buffer capacity bounds store throughput; a burst of cache-missing stores stalls the pipeline when the buffer fills, and memory fences work by draining it.",
  votes: { up: 40, down: 3 }
},
{
  id: "iq-121", track: "interview", branch: "CPU & Architecture",
  title: "Consistency vs Coherence", difficulty: "medium",
  tags: ["memory model", "NVIDIA-style"],
  summary: "Define both terms precisely, show a program where coherence holds but the consistency model still surprises, and why locks need fences.",
  statement: "Define memory coherence and memory consistency precisely, and explain why they are separate problems. Give an example program where coherence is fully maintained but the consistency model still produces a surprising result.",
  kind: "answer",
  solution: "Coherence is per-location: all cores must agree on the order of writes to a single address, and a read must eventually observe the latest write — enforced by protocols like MESI keeping caches consistent line by line. Consistency is cross-location: it defines which interleavings of reads and writes to DIFFERENT addresses are legal — the contract the whole machine offers to software. They are separate because coherence is a cache-hardware property, while consistency involves store buffers, speculation, and even the compiler. Example: core A runs x=1 then r1=y while core B runs y=1 then r2=x — coherence holds, yet both r1 and r2 can read 0 on x86, because each core's load bypasses its own buffered store. Follow-up: that example is exactly why locks and atomics need fences — the coherence protocol alone gives you no cross-address ordering guarantees.",
  votes: { up: 45, down: 3 }
},
{
  id: "iq-122", track: "interview", branch: "CPU & Architecture",
  title: "MESI and the O in MOESI", difficulty: "easy",
  tags: ["MESI", "AMD-style"],
  summary: "Walk the four MESI states, then explain what Owned adds and when cache-to-cache dirty transfer saves bandwidth.",
  statement: "Walk through the four MESI states and what each guarantees about the line. What does the O state in MOESI add, and in what workload pattern does it save memory bandwidth?",
  kind: "answer",
  solution: "Modified: I have the only copy, it is dirty, and I must write it back on eviction. Exclusive: I have the only copy, it is clean, and I can silently upgrade to Modified on a write with no bus transaction. Shared: several caches hold clean copies, so a write requires invalidating everyone first. Invalid: I do not have the line. MOESI adds Owned: a dirty line that may exist in multiple caches — the owner services snoops and is responsible for writeback while the others hold Shared copies. That saves a memory round-trip when a dirty line passes between cores, which happens constantly in producer-consumer workloads, and is why AMD favored MOESI. Follow-up: the interesting transition is M-to-S on a snoop hit — the dirty data must be supplied either by writing back to memory (MESI) or by direct cache-to-cache transfer (MOESI and modern interconnects).",
  votes: { up: 50, down: 2 }
},
{
  id: "iq-123", track: "interview", branch: "CPU & Architecture",
  title: "False Sharing", difficulty: "medium",
  tags: ["false sharing", "Google-style"],
  summary: "Two threads, two variables, one cache line: why it looks like lock contention, how to diagnose it, and the padding fix.",
  statement: "Two threads update different variables on different cores, yet performance collapses as if they shared a single lock. Explain what is happening at the coherence level, how you would diagnose it, and the standard fix — plus when the fix backfires.",
  kind: "answer",
  solution: "Coherence operates at cache-line granularity (64 bytes), not variable granularity: two hot variables on the same line make the line ping-pong between the cores' caches in Modified state on every write, serializing the threads with hundred-cycle coherence transfers. It looks exactly like lock contention in wall-clock profiles, but no lock exists — diagnose it with performance counters showing heavy hit-modified snoop traffic, or by testing whether padding restores scaling. The fix is to pad and align hot per-thread data onto separate cache lines, or restructure so each thread owns whole lines. The classic offender is a results array where thread i writes results[i] — embarrassingly parallel code that runs slower than the single-threaded version. Follow-up trap: over-aligning everything wastes cache capacity and can hurt; only pad what is actually hot and contended.",
  votes: { up: 46, down: 2 }
},
{
  id: "iq-124", track: "interview", branch: "CPU & Architecture",
  title: "Cache Write Policies", difficulty: "easy",
  tags: ["write-back", "ARM-style"],
  summary: "Write-through vs write-back, write-allocate vs no-allocate — which combinations real CPUs use, and when streaming stores override them.",
  statement: "Compare write-through and write-back caches, and write-allocate versus write-no-allocate on store misses. Which combination do real CPU caches use and why, and when would you deliberately bypass that policy?",
  kind: "answer",
  solution: "Write-through pushes every store to the next level immediately — simple and always consistent with memory, but it burns bandwidth on every write. Write-back only writes a line down when a dirty line is evicted — it coalesces repeated writes to the same line and saves bandwidth, at the cost of dirty-state tracking and more complex evictions. Write-allocate brings the line into the cache on a store miss and pairs naturally with write-back; write-no-allocate streams the store past the cache and pairs with write-through. Real CPUs use write-back plus write-allocate throughout L1/L2/L3 because written data has strong temporal locality and bandwidth is the scarce resource. Follow-up: non-temporal streaming stores (movnt) exist precisely to override write-allocate when you know the data will never be re-read — caching it would just evict useful lines.",
  votes: { up: 43, down: 2 }
},
{
  id: "iq-125", track: "interview", branch: "CPU & Architecture",
  title: "Hardware Prefetcher Types", difficulty: "medium",
  tags: ["prefetching", "Qualcomm-style"],
  summary: "Next-line, stride, and stream prefetchers: how each detects its pattern, when prefetching makes things worse, and the coverage/accuracy tradeoff.",
  statement: "Describe the main hardware prefetcher types and how each detects its pattern. When do prefetchers make performance WORSE, and what two metrics should you use to evaluate a prefetcher?",
  kind: "answer",
  solution: "Next-line prefetchers fetch line N+1 whenever line N is touched — nearly free and effective on any sequential access. Stride prefetchers track per-PC or per-page access deltas and issue prefetches at the observed stride, covering regular non-unit patterns like column walks. Stream buffers detect sequential runs and allocate a FIFO of upcoming lines, decoupling pattern detection from demand misses, while more aggressive correlating prefetchers learn irregular patterns at higher storage and accuracy cost. Prefetchers hurt when accuracy is low: useless prefetches consume bandwidth, evict useful lines, and can delay demand misses in the queue — a scanning workload competing with a bandwidth-bound neighbor is the classic casualty. Follow-up: evaluate on coverage (fraction of misses eliminated) versus accuracy (fraction of prefetches used), plus timeliness — a perfectly accurate prefetch issued too late is just bandwidth waste.",
  votes: { up: 38, down: 4 }
},
{
  id: "iq-126", track: "interview", branch: "CPU & Architecture",
  title: "TLB Hierarchy and Huge Pages", difficulty: "easy",
  tags: ["TLB", "Intel-style"],
  summary: "Why the TLB exists, what a miss costs, why huge pages can give 10%+ on big heaps, and the catches of huge pages.",
  statement: "Why does the TLB exist, what happens on a TLB miss, and why do huge pages help so much for large working sets? What are the downsides of huge pages that make operating systems cautious about them?",
  kind: "answer",
  solution: "Every virtual memory access needs a virtual-to-physical translation, and a 4-level page-table walk is up to 4 dependent memory reads per access — that would multiply memory latency several-fold. The TLB caches recent translations: a small L1 iTLB/dTLB answering in about a cycle, a larger shared L2 TLB behind it, plus hardware walk caches for intermediate page-table levels. A TLB miss triggers a hardware page walk; only if the entry is genuinely not present does the OS take a page fault. Huge pages (2MB or 1GB) multiply each TLB entry's reach by 512x or more, so big working sets stop thrashing the TLB — databases and JVM heaps routinely gain over 10 percent. The catches: huge pages need contiguous physical memory, suffer internal fragmentation, make individual faults and reclaim far more expensive, and the OS compaction that creates them can stall the system.",
  votes: { up: 48, down: 2 }
},
{
  id: "iq-127", track: "interview", branch: "CPU & Architecture",
  title: "Speculation and Spectre Intuition", difficulty: "hard",
  tags: ["Spectre", "Google-style"],
  summary: "Why squashed speculative instructions still leak data through the cache, the bounds-check bypass gadget, and what mitigations cost.",
  statement: "Explain how Spectre works at the microarchitectural level: why does transient execution of a mispredicted path leak data even though the instructions are squashed? Sketch the classic bounds-check-bypass attack and describe what the mitigations cost.",
  kind: "answer",
  solution: "Speculative execution runs instructions past an unresolved branch; on misprediction their architectural effects are flushed, but microarchitectural side effects — cache lines fetched, TLB entries filled — remain visible. Spectre trains the branch predictor to speculate into a gadget that reads a secret (an out-of-bounds index that passes the still-in-flight bounds check) and then encodes the secret into cache state, for example by touching array2[secret * 4096]. The attacker later times accesses to array2 and recovers the secret — a cache side channel exfiltrating data the program architecturally never read. Mitigations include retpolines and IBRS to make indirect branches un-speculatable, fences to serialize speculation, and hardware fixes that partition predictor state — costing single digits up to tens of percent on indirect-branch-heavy code. Follow-up trap: the bounds check itself does not help because it is precisely the check that gets speculated past; you must stop speculation across trust boundaries or close the side channel.",
  votes: { up: 36, down: 5 }
},
{
  id: "iq-128", track: "interview", branch: "CPU & Architecture",
  title: "Amdahl vs Gustafson", difficulty: "medium",
  tags: ["scaling laws", "NVIDIA-style"],
  summary: "Compute both speedups for a 90%-parallel workload, explain why the two laws model different worlds, and which workloads fit each.",
  statement: "State Amdahl's law and Gustafson's law, and compute the speedup each predicts for a workload that is 90 percent parallelizable on 64 processors. Why do both laws exist, and which kinds of workloads does each one actually describe?",
  kind: "answer",
  solution: "Amdahl models a fixed problem size: speedup = 1 / (s + p/N), so with a 10 percent serial fraction the ceiling is 10x no matter how many processors you add; on 64 processors you get about 8.6x. Gustafson models scaling the problem with the machine: speedup = N - s*(N-1), so the same split on 64 processors gives about 57.7x, because the serial part does not grow with the workload. Neither is more correct — Amdahl describes latency-sensitive fixed jobs like a game frame or a trade decision, Gustafson describes throughput workloads where bigger machines justify bigger problems, like rendering, training, and simulation. The interview trap is quoting only Amdahl: it explains why parallelizing one hot loop caps out, but not why supercomputers are useful. Follow-up: in practice the serial fraction itself grows with N through coordination and load imbalance, which is why real scaling curves sit between the two laws.",
  votes: { up: 41, down: 3 }
},
{
  id: "iq-129", track: "interview", branch: "CPU & Architecture",
  title: "SIMD vs SIMT vs Superscalar", difficulty: "medium",
  tags: ["parallelism", "Apple-style"],
  summary: "What the programmer sees, what the hardware replicates, and what each model does with divergent control flow.",
  statement: "Contrast SIMD, SIMT, and superscalar execution along three axes: what the programmer writes, what the hardware replicates, and what happens to divergent control flow. Which spends area on finding parallelism, and which spends it on more ALUs?",
  kind: "answer",
  solution: "Superscalar finds parallelism BETWEEN instructions of one thread: the renamer and scheduler extract ILP dynamically, and the programmer writes ordinary scalar code. SIMD replicates the datapath: one instruction operates on a vector of lanes, the programmer or compiler expresses data parallelism explicitly, and divergence is handled with masks — divergent work costs both paths under complementary masks. SIMT is SIMD wearing a thread abstraction: the programmer writes scalar per-thread code, hardware groups 32 threads into a warp sharing one PC, and divergence is handled by scheduling each taken path with inactive lanes masked off. So superscalar spends area on FINDING parallelism, while SIMD and SIMT spend that area on more ALUs but demand regular, data-parallel code. Follow-up: SIMT's independent threads are a programming illusion — the hardware cost model is still the warp, which is why GPU code cares about warp-level uniformity.",
  votes: { up: 39, down: 3 }
},
{
  id: "iq-130", track: "interview", branch: "CPU & Architecture",
  title: "Why Frequency Scaling Died, and DVFS", difficulty: "hard",
  tags: ["DVFS", "Intel-style"],
  summary: "Dennard scaling's breakdown, the power wall at ~4-5GHz, and how DVFS exploits the V-squared term to manage what power remains.",
  statement: "Why did clock frequency stop scaling around 2005? Explain the breakdown of Dennard scaling and the power wall, then describe how DVFS manages power on a modern chip and why the voltage term matters more than the frequency term.",
  kind: "answer",
  solution: "Dennard scaling said shrinking transistors keeps power density constant because voltage and current shrink together, so each process node gave faster clocks for free; around the 90 to 65nm nodes, leakage current exploded and threshold voltage could not drop further, so voltage stopped scaling while capacitance kept shrinking. With dynamic power proportional to C*V^2*f and V stuck, pushing frequency past roughly 4-5GHz hits the power wall — you physically cannot cool a dense die at that power density. The industry pivoted to spending the fixed power budget on more cores instead of more frequency. DVFS exploits the V^2 term: since voltage must rise with frequency, dropping one frequency bin cuts power by roughly three times the frequency ratio, so firmware runs demanding bursts at high bins and everything else low, under thermal and turbo budgets. Follow-up: modern chips add per-core DVFS and race-to-idle — finishing work fast and sleeping often beats running slow continuously, because leakage is paid whenever the core is powered.",
  votes: { up: 35, down: 4 }
},

/* ============ GPU & CUDA (iq-131 .. iq-145) ============ */
{
  id: "iq-131", track: "interview", branch: "GPU & CUDA",
  title: "Warps, SMs, and Occupancy", difficulty: "easy",
  tags: ["occupancy", "NVIDIA-style"],
  summary: "Define warp, SM and occupancy, explain zero-cost warp switching as the latency-hiding mechanism, and why 100% occupancy is not the goal.",
  statement: "Define warp, streaming multiprocessor, and occupancy, and explain how the GPU hides memory latency differently from a CPU. Why is 100 percent occupancy not always the goal, and what should you measure instead?",
  kind: "answer",
  solution: "A warp is 32 threads executing in lockstep on one scheduler; an SM is the physical core containing multiple warp schedulers, a register file, and shared memory, hosting many resident warps at once. Occupancy is the ratio of resident warps per SM to the architectural maximum, limited by registers per thread, shared memory per block, and block size. The GPU hides latency by switching to another ready warp every cycle with zero context-switch cost, so a warp stalled on a 400-cycle memory access is invisible if enough other warps are resident. 100 percent occupancy is not always the goal: with enough instruction-level parallelism, a few warps issuing back-to-back independent instructions can saturate the units, and register-hungry low-occupancy kernels often win. Follow-up: occupancy is a means to latency hiding, not a utilization metric — measure issue-slot utilization and stall reasons, not occupancy alone.",
  votes: { up: 49, down: 2 }
},
{
  id: "iq-132", track: "interview", branch: "GPU & CUDA",
  title: "Warp Divergence and How to Kill It", difficulty: "medium",
  tags: ["divergence", "NVIDIA-style"],
  summary: "The cost of one PC per warp, then the restructurings: partition by predicate, predication, ballot-based uniform exits.",
  statement: "Explain what warp divergence costs at the hardware level and walk through restructuring a divergent kernel. What transformations turn if/else-heavy per-thread code into warp-friendly code, and what synchronization rule bites you on Volta and later?",
  kind: "answer",
  solution: "Within a warp there is a single program counter: when threads take different paths the hardware executes each path serially with the other lanes masked off, so a two-way if/else can cost the sum of both paths, and nested divergence multiplies the damage. The standard mitigations: sort or partition the data so threads with the same branch decision land in the same warp, replace short branches with predication or select, and hoist divergent decisions to block or grid granularity where possible. Example: a per-thread early exit in a loop — restructure so the whole warp tests the exit condition together using ballot intrinsics, exiting only when all lanes agree. Follow-up trap: with Volta's independent thread scheduling, a __syncthreads inside divergent code is illegal or undefined — synchronize only at warp-uniform points.",
  votes: { up: 46, down: 2 }
},
{
  id: "iq-133", track: "interview", branch: "GPU & CUDA",
  title: "Memory Coalescing Rules", difficulty: "medium",
  tags: ["coalescing", "AMD-style"],
  summary: "Sectors, transactions per warp-instruction, stride penalties, and why struct-of-arrays beats array-of-structs on the GPU.",
  statement: "State the coalescing rules for global memory access and the cost model behind them. Given a choice between struct-of-arrays and array-of-structs layouts, which wins on the GPU and why? What happens to bandwidth as the access stride grows?",
  kind: "answer",
  solution: "Global memory is fetched in 32-byte sectors, and the hardware coalesces a warp's accesses into as few transactions as possible — ideally one 128-byte transaction per warp for consecutive 4-byte accesses. The cost model is transactions per warp instruction, not bytes: a warp touching 32 scattered lines costs 32 transactions, roughly 32 times the bandwidth of a coalesced one. Struct-of-arrays wins for GPU kernels: with array-of-structs, thread i's field access strides by the whole struct and scatters across lines, while struct-of-arrays gives consecutive threads consecutive addresses. Efficiency degrades with stride — stride 2 halves it, stride 32 reduces it to 1/32 — though modern L1/L2 caches and sector-based fetching soften small misalignments. Follow-up: the general principle is to organize data by access pattern rather than by object, which is why AoS-to-SoA transforms are a standard optimization pass.",
  votes: { up: 44, down: 2 }
},
{
  id: "iq-134", track: "interview", branch: "GPU & CUDA",
  title: "Shared Memory Bank Conflicts", difficulty: "medium",
  tags: ["bank conflicts", "NVIDIA-style"],
  summary: "32 banks, same-bank-different-address serialization, the broadcast exception, and the +1 padding trick for tiled transpose.",
  statement: "How is shared memory banked, what exactly is a bank conflict, and what is the broadcast exception? Explain why a tiled matrix transpose hits a 32-way conflict and how padding fixes it — and name the padding-free alternative.",
  kind: "answer",
  solution: "Shared memory is split into 32 banks of 4 bytes, with bank index = (byte address / 4) mod 32. A warp's accesses are serviced in parallel only if each lane hits a different bank; if k lanes hit different addresses in the SAME bank, the access serializes into k cycles. The exception: all lanes reading the same address is a broadcast and costs one cycle — a conflict requires same bank, different address. In a tiled transpose, reading tile[ty][tx] is conflict-free, but writing tile[tx][ty] makes consecutive lanes stride by the tile width — 32 floats lands every lane on bank 0, a 32-way conflict; padding the tile to 33 columns shifts each row by one bank and restores full parallelism. Follow-up: the padding-free alternative is XOR-swizzled indexing, which is what CUTLASS and cuDNN use, and 64-bit accesses change the banking math since each element spans two consecutive banks.",
  votes: { up: 45, down: 2 }
},
{
  id: "iq-135", track: "interview", branch: "GPU & CUDA",
  title: "Tensor Cores Intuition", difficulty: "hard",
  tags: ["tensor cores", "NVIDIA-style"],
  summary: "What a tensor core instruction actually computes, why structured MMA arrays beat CUDA cores 10x, and the layout/type constraints they impose.",
  statement: "What does a tensor core actually compute per instruction, and why does it deliver an order of magnitude more throughput than CUDA cores? What constraints do tensor cores impose on data types, matrix shapes, and memory layout — and where does the real engineering difficulty lie?",
  kind: "answer",
  solution: "A tensor core executes a small fixed matrix multiply-accumulate — fragments like 16x8x16 of D = A*B + C — in one instruction, distributed across a warp with each lane holding specific registers of the fragments. The throughput jump comes from structure: the hardware wires up a dense MAC array fed once per tile instead of re-fetching operands per FLOP, so operand reuse is built into the datapath, and low-precision inputs (fp16, bf16, tf32, fp8) with fp32 accumulate multiply the effective density further. The constraints: shapes must match fragment sizes or be padded, operands must be in specific layouts (hence ldmatrix and swizzled shared-memory staging), and you need enough arithmetic intensity to keep the array fed. Follow-up: the hard part of tensor-core kernels is not the MMA instruction — it is data movement: shared-memory swizzles, cp.async pipelines, and keeping fragments resident across the K loop without exposing latency.",
  votes: { up: 38, down: 4 }
},
{
  id: "iq-136", track: "interview", branch: "GPU & CUDA",
  title: "CUDA Streams vs CUDA Graphs", difficulty: "medium",
  tags: ["streams", "NVIDIA-style"],
  summary: "What streams overlap, the legacy default-stream trap, launch overhead, and when capturing a graph beats submitting streams.",
  statement: "What problem do CUDA streams solve, and what are their synchronization semantics? When do CUDA graphs beat streams, what overhead does each mechanism remove, and what is frozen when you capture a graph?",
  kind: "answer",
  solution: "Streams are independent queues of work: kernels and copies in different streams may overlap, enabling compute/copy concurrency via asynchronous memcpy, while operations within one stream serialize in issue order. Cross-stream dependencies are expressed with events and stream-wait calls — and the legacy default stream implicitly synchronizes with everything, a classic source of lost overlap. Streams still pay per-launch CPU overhead on the order of microseconds, so workloads of many small kernels become launch-bound. CUDA graphs capture a DAG of kernels, copies and dependencies once, then launch the whole graph in one call, removing per-node CPU cost and letting the driver pre-plan execution — which is why inference frameworks capture entire models as graphs. Follow-up trap: capture freezes the pointers and shapes baked into the nodes — dynamic shapes or changing pointers force expensive re-instantiation.",
  votes: { up: 40, down: 3 }
},
{
  id: "iq-137", track: "interview", branch: "GPU & CUDA",
  title: "Unified Memory Pitfalls", difficulty: "medium",
  tags: ["unified memory", "NVIDIA-style"],
  summary: "What cudaMallocManaged promises, why page faults make naive use slow, prefetch/advise fixes, and when managed memory is right.",
  statement: "What does cudaMallocManaged promise, and why does naive use underperform explicit cudaMemcpy? Explain the page-fault mechanism, the role of prefetch and mem-advise hints, and the workloads where managed memory is genuinely the right choice.",
  kind: "answer",
  solution: "Unified memory gives one pointer valid on host and device, with the driver migrating pages on demand. The trap: on a page fault the GPU stalls while the driver migrates and remaps pages — faults cost microseconds each and serialize, so a kernel walking a large managed array can run slower than explicit copies streamed over PCIe with cudaMemcpyAsync. cudaMemPrefetchAsync migrates pages in bulk ahead of use, and cudaMemAdvise hints like read-mostly and preferred-location let the driver replicate or pin pages, recovering most of the performance. Managed memory is genuinely right for irregular pointer-heavy structures like graphs and trees where explicit copies are impractical, for prototyping, and for oversubscribing GPU memory. Follow-up: on systems with coherent NVLink-C2C interconnects, managed memory behaves far better — the answer is hardware-generation dependent, and saying so scores points.",
  votes: { up: 37, down: 4 }
},
{
  id: "iq-138", track: "interview", branch: "GPU & CUDA",
  title: "Pinned Memory and True Async Copies", difficulty: "easy",
  tags: ["pinned memory", "NVIDIA-style"],
  summary: "Why pinned memory doubles copy throughput, why 'async' on pageable memory silently serializes, and the cost of pinning too much.",
  statement: "Why does cudaHostAlloc (pinned memory) make host-device copies faster, and what does cudaMemcpyAsync actually require to overlap with compute? What is the downside of pinning large amounts of memory, and when would you use zero-copy mapped memory instead?",
  kind: "answer",
  solution: "Pageable copies go through a staging buffer: the driver first memcpy's into a pinned staging area, then the DMA engine transfers, adding a full extra copy. Pinned (page-locked) memory lets the DMA engine read host RAM directly, roughly doubling effective copy throughput to the interconnect's limit, and it is required for cudaMemcpyAsync to truly overlap with kernel execution — on pageable memory the 'async' call silently serializes. The downside: pinning removes pages from the OS paging pool and allocation is slow, so pinning gigabytes starves the OS and other processes. Zero-copy mapped memory lets kernels read host RAM directly over the interconnect — excellent for tiny read-once data, terrible for anything re-read, since every access crosses the bus. Follow-up: a robust pipeline uses a small pool of pinned staging buffers with double buffering, not one giant pinned region.",
  votes: { up: 42, down: 2 }
},
{
  id: "iq-139", track: "interview", branch: "GPU & CUDA",
  title: "Why ML Compilers Fuse Kernels", difficulty: "medium",
  tags: ["kernel fusion", "Tesla-style"],
  summary: "Memory-bound op chains waste HBM round-trips; fusion turns intermediates into registers. When fusion is impossible or counterproductive.",
  statement: "Why do ML compilers fuse kernels so aggressively? Quantify the win for a simple chain like bias-add followed by GELU, state the general principle, and explain when fusion is impossible or actively counterproductive.",
  kind: "answer",
  solution: "Elementwise and small-op kernels are memory-bound: each kernel in a chain reads and writes the full tensor through HBM, so N ops means 2N tensor-sized memory round-trips. Fusing bias-add plus GELU into one kernel keeps the intermediate value in registers: two round-trips total instead of four — nearly a 2x speedup — and it also eliminates launch overheads and intermediate allocations. The general principle is that fusion raises arithmetic intensity by turning intermediate tensors into register or shared-memory values. Fusion is impossible when there is a cross-tile dependency the fused kernel cannot express — softmax needs whole-row statistics before normalizing, which is exactly what online-softmax tricks work around — and counterproductive when the fused kernel blows the register budget and tanks occupancy. Follow-up: FlashAttention is the extreme case, fusing the entire attention block specifically to never materialize the quadratic score matrix in HBM.",
  votes: { up: 41, down: 3 }
},
{
  id: "iq-140", track: "interview", branch: "GPU & CUDA",
  title: "The Roofline Model", difficulty: "medium",
  tags: ["roofline", "AMD-style"],
  summary: "Axes, the two ceilings, machine balance, and how roofline tells you whether to optimize compute or memory for a given kernel.",
  statement: "Draw the roofline model: what are the axes, what defines the two ceilings, and how does it tell you whether to optimize compute or memory? Apply it to a saxpy-like kernel versus a well-tiled GEMM, and define machine balance.",
  kind: "answer",
  solution: "The x-axis is arithmetic intensity in FLOPs per byte moved from DRAM; the y-axis is attained FLOP/s. The roofline is min(peak FLOP/s, intensity times peak bandwidth) — a flat compute roof and a diagonal bandwidth roof meeting at the machine balance point. Plot your kernel's intensity and attained performance: on the diagonal, more FLOPs or better instructions do nothing — only reducing bytes (fusion, tiling, layout) moves you right; under the compute roof, you work on ILP, tensor cores, and instruction efficiency. A saxpy-like kernel has intensity around 0.25 FLOP/byte and is hopeless to optimize on the compute side, while a well-tiled GEMM has intensity in the hundreds and lives near the compute roof. Follow-up: machine balance — peak FLOP/s divided by peak bandwidth — is the minimum intensity any kernel must reach to be compute-bound; on modern GPUs it is tens of FLOP/byte, which is why memory optimization dominates.",
  votes: { up: 43, down: 2 }
},
{
  id: "iq-141", track: "interview", branch: "GPU & CUDA",
  title: "Reduce-Then-Scan Primitives", difficulty: "hard",
  tags: ["scan", "NVIDIA-style"],
  summary: "Why reduction and scan are the fundamental primitives, Blelloch's O(N) scan, multi-level scaling, and the fp-associativity trap.",
  statement: "Why are reduction and scan called the fundamental GPU primitives? Sketch an efficient block-level scan, explain how to scale it to arrays far larger than one block, and state the mathematical requirement the operator must satisfy — plus why floating point breaks it.",
  kind: "answer",
  solution: "Reduction is the prototype of combining values with an associative operator: a tree reduction does N-1 operations in log2(N) rounds, optimized with sequential shared-memory addressing, warp shuffles for the final 32 elements, and loop unrolling. Scan looks serial but is not: Hillis-Steele does log N rounds of offset adds, while Blelloch does an up-sweep (literally a reduction) followed by a down-sweep, doing O(N) work instead of O(N log N) — hence reduce-then-scan. For large arrays, each block scans its tile and outputs its total, a second kernel scans the per-block totals, and a third adds each block's prefix back; decoupled lookback turns the middle pass into a single-pass producer-consumer chain. The requirement is associativity (plus an identity element), and floating-point addition is not truly associative — parallel reductions change rounding order, so results are not bitwise reproducible run to run. Follow-up: that non-determinism matters for ML reproducibility and is why some libraries offer deterministic reduction modes at a performance cost.",
  votes: { up: 36, down: 4 }
},
{
  id: "iq-142", track: "interview", branch: "GPU & CUDA",
  title: "Why GEMM Tiling Works", difficulty: "medium",
  tags: ["GEMM", "NVIDIA-style"],
  summary: "The arithmetic-intensity math of shared-memory tiles, register tiling one level down, and why cuBLAS tile shapes get exotic.",
  statement: "Explain why tiling GEMM into shared memory is such a massive win, with the arithmetic-intensity math. Why do cuBLAS and CUTLASS use such exotic tile shapes, and what beyond tiling accounts for the last few percent of peak?",
  kind: "answer",
  solution: "Naive GEMM reads a row of A and a column of B from global memory per output element: for N-cubed FLOPs it moves on the order of N-cubed words — intensity around 2 FLOP/byte, deep in bandwidth-bound territory. With T-by-T tiles staged in shared memory, each loaded element is reused T times, so global traffic drops by a factor of T and intensity scales with T — the entire game is making T large enough to cross the machine balance point so the kernel becomes compute-bound. Register tiling repeats the same trick one level down: each thread computes a small sub-tile so shared-memory reads also get reused. cuBLAS tile shapes like 128x128x8 with double-buffered asynchronous copies balance shared-memory budget, register pressure, and wave quantization across the SM count. Follow-up: the last few percent come from swizzling shared-memory layouts to eliminate bank conflicts and software-pipelining the loads so latency never exposes — data movement, not math, is the whole craft.",
  votes: { up: 42, down: 2 }
},
{
  id: "iq-143", track: "interview", branch: "GPU & CUDA",
  title: "Persistent Kernels", difficulty: "hard",
  tags: ["persistent kernels", "NVIDIA-style"],
  summary: "Launch one wave and loop: the launch/tail-latency problems it solves, and the co-residency and deadlock hazards it creates.",
  statement: "What is a persistent kernel, and what launch and tail-latency problems does it solve? What makes programming one harder than the usual one-task-per-block model, and what is the co-residency constraint that can deadlock you?",
  kind: "answer",
  solution: "Instead of launching one block per work item, you launch exactly enough blocks to fill the GPU once — a single wave — and each block loops, pulling work from a global atomic counter or queue. This removes repeated block launch and scheduling overhead, lets blocks keep state like accumulators or queues resident in shared memory across work items, and smooths the tail effect where the last partial wave leaves SMs idle. It is the standard trick behind split-K GEMMs, persistent attention kernels, and warp-specialized producer-consumer designs on Hopper. The hazards: you must never launch more blocks than can be co-resident, or unscheduled blocks will wait on queue entries that resident blocks never produce — a deadlock; you handle load balancing yourself; and debugging is harder with no grid-level mapping of work to block. Follow-up: persistent blocks can cooperate with cooperative-groups grid sync, but only when co-residency is guaranteed — the same occupancy constraint in disguise.",
  votes: { up: 34, down: 5 }
},
{
  id: "iq-144", track: "interview", branch: "GPU & CUDA",
  title: "Hopper Thread-Block Clusters and TMA", difficulty: "hard",
  tags: ["H100 clusters", "NVIDIA-style"],
  summary: "The missing hierarchy level between block and grid: DSMEM, multicast loads, cluster sizing tradeoffs, and what TMA offloads.",
  statement: "What problem do thread-block clusters and distributed shared memory on H100 solve, and how do they change kernel design? What does the TMA add, and why is cluster size 2 often the sweet spot?",
  kind: "answer",
  solution: "Before Hopper the model had two levels: threads in a block share fast memory and sync cheaply; blocks in a grid communicate only through global memory. As SMs got faster relative to DRAM, kernels like GEMM wanted a middle level — tiles bigger than one SM's shared memory, but with SM-to-SM bandwidth far better than HBM. Clusters (up to 8 or 16 blocks co-scheduled on adjacent SMs within a GPC) provide exactly that: any block can read and write another block's shared memory (DSMEM) at fabric speed, enabling multicast loads — one L2 fetch feeds every block in the cluster — and cluster-level reductions without global round-trips. TMA (the Tensor Memory Accelerator) offloads the tiled global-to-shared copies themselves: one thread issues an asynchronous bulk tensor copy with bounds and strides, replacing per-thread address arithmetic and freeing warps to compute. Follow-up: clusters constrain scheduling because all blocks must be co-resident, so larger clusters trade scheduling flexibility for locality — which is why cluster size 2 is often the sweet spot.",
  votes: { up: 33, down: 5 }
},
{
  id: "iq-145", track: "interview", branch: "GPU & CUDA",
  title: "Why Accumulate in FP32?", difficulty: "easy",
  tags: ["numerics", "NVIDIA-style"],
  summary: "fp16's 10 mantissa bits absorb small terms and grow error with n; fp32 accumulators are free and the fix is one line.",
  statement: "Why do fp16 and bf16 kernels accumulate in fp32, and what goes wrong if you do not? Give the error intuition for a long summation, and the one-line fix in a reduction kernel — plus why tree reductions help accuracy for free.",
  kind: "answer",
  solution: "fp16 has only 10 mantissa bits, about 3 decimal digits, and a tiny exponent range; summing a long array in fp16 rounds each new term against a growing magnitude, so error grows with the number of terms and small values get absorbed entirely — catastrophic in softmax denominators and dot products. bf16 keeps fp32's range but is even coarser at 8 mantissa bits. Accumulating in fp32 costs almost nothing on modern hardware — tensor cores do it natively and the ALU path runs at the same speed — while error then comes only from the final cast. The one-line fix: declare the accumulator float and cast each fp16 product to float when adding. Follow-up: pairwise or tree summation reduces error growth from O(n) to O(log n), which a tree reduction gives you for free — parallelism and accuracy pointing the same way for once.",
  votes: { up: 44, down: 2 }
},

/* ============ Quant & Trading (iq-146 .. iq-160) ============ */
{
  id: "iq-146", track: "interview", branch: "Quant & Trading",
  title: "EV vs Variance Tradeoffs", difficulty: "easy",
  tags: ["expected value", "SIG-style"],
  summary: "A sure $10 vs a higher-EV risky bet: what the right answer depends on, and how firms bridge to Kelly sizing.",
  statement: "Two bets: A pays +$10 with certainty; B pays $30 with probability 0.5 and -$5 otherwise. Which do you take, and what does the correct answer depend on? Connect your reasoning to how a trading firm evaluates strategies that repeat thousands of times per day.",
  kind: "answer",
  solution: "EV of A is $10; EV of B is 0.5*30 + 0.5*(-5) = $12.50, so a risk-neutral player takes B. The correct choice depends on bankroll and repetition count: a single play with real downside favors A, while over thousands of repetitions the law of large numbers makes B's edge dominate and variance washes out. Firms think exactly this way: a market maker accepts small per-trade risk all day because the bet repeats ten thousand times daily and the edge compounds, while a slow strategy needs a much higher Sharpe to survive the drawdowns between payoffs. The formal bridge from EV to sizing is the Kelly criterion or mean-variance utility — maximize growth rate, not raw EV. Follow-up trap: positive EV with oversized bets still ruins you — EV alone never answers the sizing question.",
  votes: { up: 47, down: 2 }
},
{
  id: "iq-147", track: "interview", branch: "Quant & Trading",
  title: "Market Making: Adverse Selection and Inventory", difficulty: "hard",
  tags: ["market making", "Jane-Street-style", "Optiver-style"],
  summary: "What the spread compensates you for, why fills are systematically toxic, and how quotes should skew as inventory builds.",
  statement: "You are quoting bid and ask in a stock. What are you earning the spread for, what is adverse selection, and how should your quotes move as your inventory grows? Walk through the logic — width, skew, and why 'capture the spread on both sides' fails.",
  kind: "answer",
  solution: "You earn the spread as compensation for two things: providing immediacy to impatient traders, and bearing the risk that whoever trades with you knows something you do not. Adverse selection is the core problem: informed flow buys right before the price rises, so your fills are systematically toxic, and your spread must exceed your expected loss to informed traders — which is why spreads widen with volatility, around news, and for illiquid names. Inventory risk is the second force: if you are long ten thousand shares, an adverse move hurts, so you skew quotes — lowering both bid and ask — to attract sellers and discourage buyers, mean-reverting toward flat. The full picture: quote around a fair-value estimate with width set by volatility and adverse-selection estimates, skew by inventory, and cancel and requote constantly as the book moves. Follow-up trap: 'just capture the spread on both sides' fails because fills are correlated with information — the side that gets filled is usually the wrong side.",
  votes: { up: 42, down: 4 }
},
{
  id: "iq-148", track: "interview", branch: "Quant & Trading",
  title: "Delta Hedging and Why Vol Matters", difficulty: "medium",
  tags: ["options", "SIG-style"],
  summary: "What delta hedging neutralizes, how gamma rebalancing harvests realized vol, and why P&L is realized minus implied.",
  statement: "What is an option's delta, and what does delta-hedging actually accomplish? If you are delta-hedged, why does realized volatility still determine your P&L, and what does that say about what an options trader is really trading?",
  kind: "answer",
  solution: "Delta is the option's sensitivity to the underlying — a 0.5-delta call gains fifty cents per one-dollar move — and delta hedging means holding minus-delta shares so the portfolio is locally insensitive to direction. What remains is gamma: as the stock moves, your delta changes, and mechanically rebalancing forces you to buy low and sell high when you are long the option. That rebalancing harvests realized volatility, while you paid implied volatility upfront through the premium; a hedged long option's P&L is roughly proportional to realized variance minus implied variance. So an options trader is not betting on direction at all — they are trading the spread between implied and realized volatility. Follow-up trap: hedging is discrete and costly in practice — transaction costs and overnight gaps mean you cannot harvest continuously, and being short gamma through a gap move is precisely how desks blow up.",
  votes: { up: 44, down: 3 }
},
{
  id: "iq-149", track: "interview", branch: "Quant & Trading",
  title: "Three Types of Arbitrage", difficulty: "medium",
  tags: ["arbitrage", "Citadel-style"],
  summary: "Define true arb, give three real types, and explain the friction or residual risk that lets each one persist.",
  statement: "Define arbitrage precisely, then give three distinct real-world types and explain why each still exists despite everyone looking for it. What general principle keeps prices from being perfectly efficient?",
  kind: "answer",
  solution: "True arbitrage is a riskless profit from simultaneous trades with no net investment; in practice, 'arb' strategies carry small residual risks and are really compensation for providing the correction. Three types: venue arbitrage — the same instrument priced differently on two exchanges, kept small by colocation and latency costs; ETF-versus-basket arbitrage — the ETF trades away from NAV and authorized participants create or redeem to close it, persisting because creation has fees and delays; merger arbitrage — a target trades below the announced deal price, and the discount survives because deal-break risk is real, so it is not riskless. The general principle: every persistent arb exists because the convergence mechanism has costs, capacity limits, or genuine risk — the 'free money' is really wages for warehousing that friction. Follow-up: latency races in cross-venue arbitrage are winner-take-all, which is why speed investment has diminishing social value but undiminished private value.",
  votes: { up: 40, down: 3 }
},
{
  id: "iq-150", track: "interview", branch: "Quant & Trading",
  title: "Kelly Criterion vs Markowitz", difficulty: "hard",
  tags: ["bet sizing", "Two-Sigma-style", "HRT-style"],
  summary: "Growth-rate maximization vs single-period mean-variance: where they disagree, why full Kelly is unbettable, and the correlated-bets trap.",
  statement: "Contrast the Kelly criterion with Markowitz mean-variance optimization: what does each maximize, and when do they disagree? Explain why practitioners bet fractional Kelly, and what goes wrong when you apply per-bet Kelly to a correlated book.",
  kind: "answer",
  solution: "Kelly maximizes the long-run geometric growth rate of wealth: for a bet paying b-to-1 with win probability p, the optimal fraction is f* = p - q/b, derived by maximizing expected log wealth, so compounding and ruin avoidance are built in. Markowitz maximizes expected return for a given variance — a single-period, quadratic-utility framework with no notion of compounding or path. They disagree because Kelly is path-aware and aggressive: full Kelly bets far more than a typical mean-variance allocation, and its drawdowns are brutal — a 50 percent drawdown at some point is essentially guaranteed. Practitioners bet half or quarter Kelly because edge estimates are noisy: overbetting a misestimated edge is far costlier than underbetting, and fractional Kelly keeps most of the growth with a fraction of the variance. Follow-up trap: with correlated bets, Kelly requires the joint distribution — naive per-bet Kelly overbets a correlated book, which is exactly the mistake that kills leveraged funds.",
  votes: { up: 35, down: 6 }
},
{
  id: "iq-151", track: "interview", branch: "Quant & Trading",
  title: "Why Backtests Overfit", difficulty: "medium",
  tags: ["backtesting", "Two-Sigma-style"],
  summary: "Sharpe-3 in sample means you selected on noise: the specific bias mechanisms and the practices that make a backtest trustworthy.",
  statement: "A strategy backtests at Sharpe 3. Why should your default reaction be skepticism, and what are the specific mechanisms by which backtests overfit? Describe the practices that make a backtest trustworthy, and why live performance is almost always worse.",
  kind: "answer",
  solution: "A Sharpe-3 backtest usually means the strategy was selected BECAUSE it backtested well — the winner's curse: test thousands of variants and the best one's in-sample Sharpe is mostly luck, even if every variant was computed honestly. The specific mechanisms: parameter fishing through grid searches, look-ahead bias from using data unavailable at decision time (revised fundamentals, closing prices in intraday signals), survivorship bias from testing only stocks that still exist, and ignoring costs — a 5bp signal is pure loss after 8bp of costs and impact. Trust comes from walk-forward out-of-sample testing with a final held-out period, deflating the Sharpe for the number of trials, realistic cost and fill models, and insisting on an economic story for why the edge exists and who is paying you. Follow-up: even a genuine edge decays — once it is traded at size, capacity limits and crowding compress it, so live Sharpe below backtest Sharpe is the rule, not the exception.",
  votes: { up: 43, down: 3 }
},
{
  id: "iq-152", track: "interview", branch: "Quant & Trading",
  title: "What Latency Is Actually Worth", difficulty: "medium",
  tags: ["latency", "HRT-style"],
  summary: "Queue position is winner-take-all, the tick-to-trade budget, and when being a microsecond faster is worth nothing.",
  statement: "In high-frequency trading, what exactly is latency worth, and where do the microseconds actually get spent? Why is being one microsecond faster sometimes worth everything and sometimes worth nothing?",
  kind: "answer",
  solution: "Latency matters when you are racing: queue position in the book is time-priority, so being first to cancel a stale quote or first to lift after a correlated signal moves is winner-take-all — the faster firm gets the fill and the slower one gets adversely selected. The microseconds go into exchange and network propagation (colocation, microwave and fiber routes), feed handling and book building (kernel bypass, FPGA feed handlers), signal computation, and the order-entry path — serious firms budget full tick-to-trade in single-digit microseconds. Latency is worth nothing when the opportunity is patient: if your alpha holds for seconds, no race exists and paying for speed is waste. The sharp insight is that latency's value derives from adverse selection — being slow means the market only trades with you when you are wrong. Follow-up: returns are brutally nonlinear — going from 10 to 9 microseconds only matters if a competitor sits between you and the top of the queue.",
  votes: { up: 39, down: 4 }
},
{
  id: "iq-153", track: "interview", branch: "Quant & Trading",
  title: "Order Types and Matching Engine Intuition", difficulty: "medium",
  tags: ["order book", "Optiver-style"],
  summary: "Price-time priority, what a large market order does to the book, and why marketable limit orders dominate in practice.",
  statement: "Explain how a limit order book matches orders under price-time priority, and what happens when a large market order arrives. Why do marketable limit orders dominate in practice, and why is the displayed book not the true available liquidity?",
  kind: "answer",
  solution: "The book holds resting limit orders sorted by price, with time priority within each level: a new buy matches against the best ask, then the next, walking the book until filled or until it rests as a new bid. A large market order consumes multiple levels — the visible slippage traces the book's depth profile, the purest demonstration that liquidity has a price. Marketable limit orders — a limit buy priced at or above the ask — dominate because they get market-order immediacy while capping the worst fill price, protecting against a thin book or a momentum ignition sweeping levels. Other types map to intents: IOC and FOK probe liquidity without resting, post-only guarantees maker status and rebates, iceberg hides size. Follow-up trap: the displayed book is not the real supply — hidden liquidity, rapid cancellations, and spoof-resistant depth mean slippage estimates from top-of-book alone are wildly optimistic.",
  votes: { up: 41, down: 3 }
},
{
  id: "iq-154", track: "interview", branch: "Quant & Trading",
  title: "Correlation Traps in Diversification", difficulty: "medium",
  tags: ["correlation", "Citadel-style"],
  summary: "The combined-Sharpe math people get wrong, crisis correlation spikes, and sizing for the tail correlation, not the average.",
  statement: "A colleague says: 'These two strategies are uncorrelated, so combining them doubles my Sharpe.' What is wrong with that reasoning? Give the correct diversification math and explain the real-world failure mode that strikes exactly when diversification is needed most.",
  kind: "answer",
  solution: "If two return streams have equal Sharpe S and correlation rho, the equal-weighted combination has Sharpe about 2S over sqrt(2(1+rho)) — at zero correlation you gain sqrt(2), roughly 1.41x, not 2x; overstating diversification is the first error. Worse, correlations are estimated, unstable, and regime-dependent: the correlation you measured in calm markets is not the one you get in a crisis, when diversified strategies de-risk simultaneously and correlations spike toward one — the August 2007 quant quake, where 'uncorrelated' quant books unwound together, is the canonical example. Tail correlation is what kills portfolios, and it is nearly unobservable in normal-period data. Robust practice: diversify across genuinely different mechanisms rather than different backtests of the same factor, stress the book under scenario correlations, and size positions for the crisis correlation, not the average one. Follow-up: a low-Sharpe strategy can still raise portfolio Sharpe if its correlation is low enough — marginal contribution to risk, not standalone quality, is the right lens.",
  votes: { up: 38, down: 4 }
},
{
  id: "iq-155", track: "interview", branch: "Quant & Trading",
  title: "Fat Tails and Broken Risk Models", difficulty: "easy",
  tags: ["fat tails", "Jane-Street-style"],
  summary: "The once-in-14,000-years move that happens every decade: why variance-based risk measures underprice crashes.",
  statement: "What does it mean that market returns have fat tails, and why does that break standard risk models? Give one concrete number showing how wrong the normal distribution is, and name one market phenomenon that exists because of fat tails.",
  kind: "answer",
  solution: "Fat tails — excess kurtosis — mean extreme moves occur far more often than a normal distribution predicts. The classic number: under a normal model, a five-sigma daily move should happen about once in 14,000 years, yet equity indices have produced several in living memory, and October 1987 was around twenty sigma — statistically impossible under normality. It breaks risk models because variance-based measures like VaR and standard deviation treat tails as negligible, systematically underpricing crash risk and the options that insure against it. That mispricing is exactly why the volatility smile exists: the market prices out-of-the-money puts far above their normal-model value. Practical consequences: use fat-tailed distributions like Student-t, expect drawdowns beyond any Gaussian estimate, and treat leverage with respect because ruin lives in the tails. Follow-up trap: six-sigma events every few years is not the model being slightly off — it is the model being the wrong shape entirely.",
  votes: { up: 45, down: 2 }
},
{
  id: "iq-156", track: "interview", branch: "Quant & Trading",
  title: "Fermi Estimation, Structured", difficulty: "easy",
  tags: ["Fermi", "SIG-style"],
  summary: "Estimate a mid-cap's daily dollar volume with an explicit decomposition, and what separates strong Fermi answers from weak ones.",
  statement: "Estimate the daily dollar trading volume of a mid-cap US stock, showing your structure out loud. What makes a Fermi answer strong versus weak in an interview, and how should you react when the interviewer challenges one of your factors?",
  kind: "answer",
  solution: "Structure: name an anchor, decompose multiplicatively, then sanity-check. Anchor: a mid-cap has market cap around $10B; typical daily turnover for a mid-cap is 0.5 to 1 percent of shares outstanding; so daily dollar volume is roughly $10B times 0.007, about $70M — call it $50-100M. Cross-check: at a $50 share price that is about 1.5 million shares a day, matching the reported order of magnitude for real mid-caps. A strong answer states assumptions explicitly, uses round numbers, propagates honest uncertainty ('confident within 3x either way'), and ends with a sanity check against a known reference. Follow-up: the interviewer cares about the decomposition and your composure — if a factor is challenged, update it and recompute quickly instead of defending it; the estimate itself is almost beside the point.",
  votes: { up: 40, down: 3 }
},
{
  id: "iq-157", track: "interview", branch: "Quant & Trading",
  title: "Mental Math Under Time Pressure", difficulty: "easy",
  tags: ["mental math", "Optiver-style"],
  summary: "Compute 17x24, 15% of 280, and 3/7 fast — and the general techniques that make speed and reliability coexist.",
  statement: "Optiver-style warm-up: compute 17 times 24, 15 percent of 280, and 3/7 as a decimal — fast. What general techniques make mental arithmetic both faster and more reliable under time pressure, and when is a quick approximation better than a slow exact answer?",
  kind: "answer",
  solution: "Decompose into friendly parts: 17 x 24 = 17 x 25 - 17 = 425 - 17 = 408, using quarters because 25 is 100/4. Convert percentages to fraction shortcuts: 15% of 280 = 10% + 5% = 28 + 14 = 42. Memorize the sevenths cycle: 1/7 = 0.142857 repeating and the digits merely rotate, so 3/7 = 0.428571... — about 0.429. The meta-technique is estimating first (17 x 24 is near 400) so digit errors are caught instantly, and drilling reflexes — squares to 25, fraction-decimal tables, complements to 100 — until they bypass subvocalization. Reliability comes from writing intermediate results down immediately, because working memory, not arithmetic, is the bottleneck under pressure. Follow-up: interviewers reward a fast approximation with stated error bounds over a slow exact answer — 'about 0.43' in two seconds beats '0.428571' in ten.",
  votes: { up: 43, down: 2 }
},
{
  id: "iq-158", track: "interview", branch: "Quant & Trading",
  title: "The Vol Smile and Skew", difficulty: "hard",
  tags: ["volatility", "SIG-style"],
  summary: "Why OTM puts trade rich to Black-Scholes, what 1987 did to the smile, and how a vol trader reads and trades skew.",
  statement: "Why do out-of-the-money puts trade at higher implied volatilities than at-the-money options, contradicting Black-Scholes? Explain the smile and skew, what the market is telling you through them, and how a volatility trader uses skew — including the risk of selling it.",
  kind: "answer",
  solution: "Black-Scholes assumes constant volatility and lognormal returns; real markets crash discontinuously and returns have fat left tails, so the market prices downside protection far above the model — the smile, really a skew in equities, is implied vol repricing crash risk strike by strike. Skew steepened permanently after October 1987: before it the smile was nearly flat; afterwards everyone had seen a 20 percent one-day gap and demanded put premium accordingly. Economically, OTM puts are insurance with convex, jump-driven payoffs, and structural flows — banks issuing products that are short downside — keep them rich. A vol trader reads skew as the market's implied distribution: steep skew means expensive tail insurance, an opportunity to sell if you can warehouse gap risk, and relative skew across names or maturities is itself a trading signal. Follow-up trap: selling skew is picking up pennies with short-gamma jump exposure — you earn steadily and lose it all in one gap, so position limits and tail hedges are not optional.",
  votes: { up: 34, down: 6 }
},
{
  id: "iq-159", track: "interview", branch: "Quant & Trading",
  title: "Market Impact, Slippage, and Capacity", difficulty: "medium",
  tags: ["market impact", "HRT-style"],
  summary: "Decompose slippage, the square-root impact law, and why every strategy's AUM limit is set where impact eats alpha.",
  statement: "What are slippage and market impact, and why does impact scale sublinearly with order size while total cost grows superlinearly? Explain how this sets the capacity constraint on a trading strategy and why execution algorithms are a profit center.",
  kind: "answer",
  solution: "Slippage is the gap between your decision price and your average fill; it decomposes into spread cost from crossing to take liquidity, fees, and market impact — the adverse move your own order causes by consuming book depth and signaling your intent. Impact scales sublinearly with size — empirically near the square root of order size relative to daily volume — because the book refills as you trade and your information diffuses gradually; but total cost still grows superlinearly, since you trade more shares at worse prices. The capacity constraint follows directly: if your alpha is 20 basis points and trading 5 percent of daily volume costs 25 basis points of impact, the strategy is dead at that size — every fund's AUM limit sits where marginal impact eats marginal alpha. Follow-up: this is why execution algorithms — VWAP and TWAP slicing, dark pools, opportunistic liquidity seeking — are a profit center: reducing impact directly expands the strategy's capacity.",
  votes: { up: 37, down: 3 }
},
{
  id: "iq-160", track: "interview", branch: "Quant & Trading",
  title: "Risk-Neutral Probabilities from Prices", difficulty: "hard",
  tags: ["risk-neutral", "Jane-Street-style"],
  summary: "A $1 binary at $0.65 implies 65% risk-neutral — why that differs from the true probability, and how to trade the gap.",
  statement: "An option on a binary event paying $1 trades at $0.65. What probability does the market imply, and why might it differ from the true probability? If your model says the true probability is 75 percent, how do you trade the gap — and what should make you hesitate?",
  kind: "answer",
  solution: "In a risk-neutral world, price equals discounted expected payoff, so a $1 binary at $0.65 implies a risk-neutral probability of roughly 65 percent, ignoring rates. The gap to the true probability is the risk premium: risk-neutral probabilities are true probabilities reweighted by marginal utility — the market overweights states where payoffs hedge losses, which is why insurance-style contracts trade rich and favorites beat longshots in betting markets. If your model says the true probability is 75 percent, the trade is buying at 65 cents for a 10-cent edge — sized by Kelly on that edge, and hedged against the question of WHY your probability is better: superior information, a better model, or are you simply misreading the risk premium. The hesitation is the essence of trading: an apparent mispricing is a claim that the market's risk premium is wrong, and that requires a reason. Follow-up trap: implied probabilities across a chain must be internally consistent — if they are not, there is an arbitrage, and 'free' arbs in liquid markets usually mean you are missing a cost like borrow, dividends, or margin.",
  votes: { up: 33, down: 5 }
}
]);
