/* interview expansion — references/images enriched. */
registerProblems([
 {
  "id": "iq-201",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Asynchronous FIFO Pointer Crossing",
  "difficulty": "hard",
  "tags": [
   "CDC",
   "asynchronous FIFO",
   "Gray code"
  ],
  "summary": "Design a dual-clock FIFO and justify Gray-coded pointers, synchronizer placement, and conservative full and empty flags.",
  "statement": "Design an asynchronous FIFO whose writer and reader use unrelated clocks. Explain how storage, binary and Gray-coded pointers, pointer synchronizers, and full and empty detection fit together. Why is synchronizing every bit of a binary pointer unsafe? Follow-ups: derive the full condition for power-of-two depth, state where each flag is generated, and explain what reset or clock stoppage does to the interface.",
  "kind": "answer",
  "answer": null,
  "solution": "Use a dual-port memory written only in the write domain and read only in the read domain. Each side keeps a local binary pointer for addressing and arithmetic, converts its next pointer to Gray code with g = b XOR (b >> 1), and passes that Gray value through a two-flop synchronizer into the other domain. A binary increment can change many bits, so independent sampling can create a pointer value that never existed; adjacent Gray values differ in one bit, limiting an asynchronous observation to the old or new count. Empty is generated in the read domain when the next read Gray pointer equals the synchronized write pointer. Full is generated in the write domain when the next write Gray pointer equals the synchronized read pointer with the wrap-identifying top bits inverted. Synchronizer latency makes deassertion conservative: empty or full may remain asserted briefly, but overflow and underflow are prevented. Reset must establish matching zero pointers in both domains, and requests must wait until local reset synchronization completes. If one clock stops, the opposite side may eventually report full or empty and safely stop; it cannot rely on a prompt flag deassertion. A strong implementation also constrains the Gray bus skew so the physical crossing preserves the one-bit-change assumption.",
  "votes": {
   "up": 58,
   "down": 3
  },
  "references": [
   {
    "label": "Clock domain crossing",
    "url": "https://en.wikipedia.org/wiki/Clock_domain_crossing"
   },
   {
    "label": "FIFO (computing and electronics)",
    "url": "https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics)"
   }
  ]
 },
 {
  "id": "iq-202",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Pulse Transfer Between Unrelated Clocks",
  "difficulty": "medium",
  "tags": [
   "CDC",
   "pulse synchronizer",
   "handshake"
  ],
  "summary": "Choose a safe pulse-crossing scheme based on source rate, destination clock behavior, and loss requirements.",
  "statement": "A one-cycle event pulse must cross from a fast clock domain to a slower unrelated domain without being lost. Explain why a two-flop level synchronizer is insufficient and propose two correct circuits with different throughput and reliability tradeoffs. Follow-ups: what minimum event spacing does each impose, how does back-pressure work, and what changes if the destination clock may stop temporarily?",
  "kind": "answer",
  "answer": null,
  "solution": "A narrow source pulse can rise and fall entirely between destination edges, so a two-flop synchronizer may never sample it. One solution toggles a source-domain bit on every event; the destination synchronizes the toggle and XORs consecutive synchronized samples to recreate a one-cycle pulse. This works only if events are separated long enough for each toggle to traverse the synchronizer and be observed—otherwise two toggles can cancel. The lossless solution is a request/acknowledge handshake: the source raises request and holds it, the destination synchronizes request, emits one pulse, raises acknowledge, and the source synchronizes acknowledge before dropping request. The next event waits until acknowledge returns low, giving lower throughput but explicit back-pressure and no pulse-width assumption. If the destination clock stops, the toggle scheme cannot promise retention of multiple events; the handshake safely holds one pending event indefinitely. For bursts, use an asynchronous FIFO or Gray-coded event counter rather than stretching pulses. Reset must initialize both sides consistently or a reset transition itself can appear as an event.",
  "votes": {
   "up": 49,
   "down": 2
  },
  "references": [
   {
    "label": "Clock domain crossing",
    "url": "https://en.wikipedia.org/wiki/Clock_domain_crossing"
   }
  ]
 },
 {
  "id": "iq-203",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Signed Width Rules in SystemVerilog",
  "difficulty": "medium",
  "tags": [
   "SystemVerilog",
   "signed arithmetic",
   "bit width"
  ],
  "summary": "Reason about expression sizing and signedness, then make arithmetic intent explicit and check overflow correctly.",
  "statement": "Review an RTL datapath where logic signed [7:0] a and b are added into logic signed [8:0] sum using sum = a + b. Is the ninth bit guaranteed to contain the mathematical carry or sign extension? Explain SystemVerilog expression width and signedness rules and give robust alternatives. Follow-ups: discuss unsized literals, mixed signed and unsigned operands, and how you would assert that a narrowing assignment did not overflow.",
  "kind": "answer",
  "answer": null,
  "solution": "The destination width does not automatically widen the operands before evaluation. The addition is generally evaluated at the maximum operand width—eight bits here—and only then extended to nine, so overflow may already have been discarded. Make intent explicit by extending operands first, for example sum = $signed({a[7], a}) + $signed({b[7], b});. Mixed signed and unsigned operands can make the whole expression unsigned, so cast at the boundary rather than trusting declaration context. Unsized decimal literals are at least 32-bit signed values and unsized based literals have additional sizing rules; both can unexpectedly widen or change signedness. For deliberate narrowing, compute into a full-precision temporary and assert that discarded high bits all equal the retained sign bit for signed values, or are zero for unsigned values. Also test boundary vectors such as 127 + 1 and -128 + -1; ordinary random tests often miss exactly the width failures that matter.",
  "votes": {
   "up": 45,
   "down": 4
  },
  "references": [
   {
    "label": "SystemVerilog",
    "url": "https://en.wikipedia.org/wiki/SystemVerilog"
   },
   {
    "label": "Two's complement",
    "url": "https://en.wikipedia.org/wiki/Two's_complement"
   }
  ]
 },
 {
  "id": "iq-204",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Timing Exceptions That Can Hide Bugs",
  "difficulty": "hard",
  "tags": [
   "STA",
   "false path",
   "multicycle path"
  ],
  "summary": "Distinguish legitimate timing exceptions from constraints that merely silence violations and can ship functional failures.",
  "statement": "A timing report contains a failing register-to-register path, and a teammate proposes either set_false_path or a two-cycle multicycle constraint. Explain the proof obligation for each exception and the paired setup and hold constraints required for a multicycle path. Follow-ups: give legitimate examples, explain why asynchronous clock declarations are not sufficient CDC verification, and describe how exceptions should be audited before signoff.",
  "kind": "answer",
  "answer": null,
  "solution": "A false path is valid only when no functional execution can require the launched value to be captured at the endpoint; it removes timing analysis entirely and must not be used merely because a path is difficult. Legitimate examples include a static configuration pin after mode entry or the combinational path into the first stage of a recognized synchronizer, with CDC checks covering the crossing. A multicycle setup exception is valid only when protocol or enable logic guarantees the destination samples the value after N cycles. Moving setup capture to N normally requires a corresponding hold adjustment of N-1 so hold is not checked against the wrong edge; exact syntax depends on startpoint or endpoint intent. Generated clocks and asynchronous clock groups describe timing relationships but do not prove data coherency or that a handshake exists. Audit exceptions by tracing endpoints, reviewing mode and enable logic, running structural CDC and formal assertions where useful, reporting unconstrained paths, and requiring ownership and rationale for every wildcard. An overbroad exception produces a clean report while permitting real silicon failure, making it more dangerous than an obvious violation.",
  "votes": {
   "up": 53,
   "down": 5
  },
  "references": [
   {
    "label": "Static timing analysis",
    "url": "https://en.wikipedia.org/wiki/Static_timing_analysis"
   }
  ]
 },
 {
  "id": "iq-205",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Ready Path Deadlock in a Packet Pipeline",
  "difficulty": "hard",
  "tags": [
   "flow control",
   "deadlock",
   "elastic pipeline"
  ],
  "summary": "Diagnose cyclic back-pressure and redesign buffering so a packet pipeline remains live at full throughput.",
  "statement": "Three valid/ready pipeline blocks are connected in a ring for recirculating packets. Simulation occasionally reaches a state where every block holds valid data and every ready signal is low forever. Diagnose the architectural error and propose a redesign that guarantees forward progress while preserving one transfer per cycle when unstalled. Follow-ups: distinguish deadlock from combinational-loop timing failure, state useful assertions, and explain how packet-level resource dependencies can still deadlock even after the signal loop is broken.",
  "kind": "answer",
  "answer": null,
  "solution": "The ring has no empty slot, so every producer waits for its occupied successor and no transfer can create space: this is a circular wait, not merely a slow ready path. Provide at least one bubble by limiting occupancy, add sufficient elastic buffering plus an admission rule that reserves an output slot, or introduce an escape queue whose routing cannot participate in the dependency cycle. Each link should use a registered elastic or skid stage so there is no combinational ready loop and still sustain one item per cycle after filling. Assertions should require payload stability while valid and not ready, prevent overflow and underflow, track accepted items without duplication, and express bounded progress under a fair downstream-ready assumption. Breaking the combinational loop fixes implementation timing but does not by itself prove liveness. Packet protocols can retain a higher-level cycle when headers hold one resource while requesting another; analyze a channel-dependency graph and impose an acyclic ordering or a deadlock-free escape path.",
  "votes": {
   "up": 47,
   "down": 4
  },
  "references": [
   {
    "label": "Deadlock (computer science)",
    "url": "https://en.wikipedia.org/wiki/Deadlock_(computer_science)"
   },
   {
    "label": "Flow control (data)",
    "url": "https://en.wikipedia.org/wiki/Flow_control_(data)"
   }
  ]
 },
 {
  "id": "iq-206",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "ECC Scrubbing and Double-Bit Faults",
  "difficulty": "medium",
  "tags": [
   "ECC",
   "memory reliability",
   "fault handling"
  ],
  "summary": "Explain SECDED behavior, read-modify-write implications, scrubbing, and the policy for uncorrectable errors.",
  "statement": "You are adding SECDED protection to an on-chip SRAM. Explain what happens on clean reads, single-bit errors, and double-bit errors, including whether corrected data should be written back. Follow-ups: how do partial writes interact with ECC, why is background scrubbing needed, and what telemetry and system response should accompany an uncorrectable error?",
  "kind": "answer",
  "answer": null,
  "solution": "SECDED stores parity bits computed over each protected word. A zero syndrome with correct overall parity is clean; a syndrome identifying one bad bit allows correction before returning data, while the overall parity distinction prevents treating a two-bit corruption as correctable. A corrected word should normally be rewritten so a persistent single error does not combine with a later error into an uncorrectable word. Partial writes require reading the old protected word, merging byte enables, and regenerating ECC, unless the macro supports independently protected lanes; that read-modify-write must be atomic with respect to other accesses. Background scrubbing periodically reads and repairs words that software may not touch, bounding fault accumulation. Log address, syndrome, source, and correction counts; repeated corrections at one location can trigger row retirement. A double-bit event must not silently return corrected-looking data: poison or fail the transaction, raise a machine-check path according to system policy, and preserve enough evidence for diagnosis. SECDED detects but does not generally correct two-bit faults.",
  "votes": {
   "up": 44,
   "down": 2
  },
  "references": [
   {
    "label": "ECC memory",
    "url": "https://en.wikipedia.org/wiki/ECC_memory"
   },
   {
    "label": "Hamming code",
    "url": "https://en.wikipedia.org/wiki/Hamming_code"
   }
  ]
 },
 {
  "id": "iq-207",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Arbiter Fairness Under Sustained Load",
  "difficulty": "medium",
  "tags": [
   "arbitration",
   "fairness",
   "formal verification"
  ],
  "summary": "Compare fixed-priority and round-robin arbiters and formulate fairness properties with defensible assumptions.",
  "statement": "Four requesters share a one-cycle resource. Compare fixed-priority and round-robin arbitration for latency, area, and starvation. Describe a synthesizable round-robin policy and the verification properties you would write. Follow-ups: when should the priority pointer advance, how do back-pressure and request withdrawal affect fairness, and can you promise a finite wait without assumptions about the granted transaction?",
  "kind": "answer",
  "answer": null,
  "solution": "Fixed priority is shallow and deterministic for the highest class but can starve lower classes under sustained load. Round robin remembers the requester after the last completed grant and searches cyclically from the next position, bounding arbitration opportunities for continuously asserted requests at modest state and decode cost. Advance the pointer on an accepted transfer, not merely when a grant is offered; otherwise downstream back-pressure can rotate ownership away from an unconsumed item or distort fairness. Assert grants are one-hot or zero, every grant corresponds to a request, payload remains stable while blocked, and a continuously asserted request is granted within a bound when the resource completes transactions. A finite wait cannot be promised if a winner may hold the resource forever or the sink never becomes ready, so liveness properties need explicit fairness assumptions. If requests may withdraw, define whether that is legal and whether fairness applies only to persistent requests. Weighted round robin is appropriate for bandwidth classes, but weights bound service share rather than absolute latency under arbitrary stalls.",
  "votes": {
   "up": 46,
   "down": 3
  }
 },
 {
  "id": "iq-208",
  "track": "interview",
  "branch": "Hardware & RTL",
  "title": "Power-Domain Isolation Sequence",
  "difficulty": "hard",
  "tags": [
   "low power",
   "isolation",
   "retention"
  ],
  "summary": "Order isolation, retention, power switching, and reset to avoid corrupting an always-on neighbor.",
  "statement": "A switchable logic domain drives status signals into an always-on controller and contains a small amount of retained state. Specify a safe power-down and power-up sequence using isolation, retention, power-good, clocks, and reset. Follow-ups: where should isolation and level shifting physically live, what failures result from the wrong order, and how would you verify the sequence beyond ordinary RTL simulation?",
  "kind": "answer",
  "answer": null,
  "solution": "For power-down, stop new transactions and drain or abort outstanding work, save retention state while voltage and clock are valid, assert isolation so outputs clamp to protocol-safe values, stop the clock as required, and only then open the power switch. For power-up, close the switch, wait for power-good and supply settling, keep isolation asserted, establish clocks, restore retained state or apply reset to non-retained flops, synchronize reset release, then remove isolation and resume traffic. Isolation cells should be powered by the receiving or always-on supply so they still clamp when the source is off; level shifter placement follows voltage direction and library rules, often combined with isolation. Removing isolation too early propagates unknown or partially powered values; saving too late corrupts retention, and releasing reset before clocks or power stabilize can create divergent state. Verify with a power-intent-aware simulator that models corruption, static low-power checks for missing or misplaced cells, assertions on the controller sequence, and gate-level tests across shutdown during active traffic and faulted power-good timing.",
  "votes": {
   "up": 51,
   "down": 4
  }
 },
 {
  "id": "iq-209",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "Branch Predictor Aliasing and Recovery",
  "difficulty": "hard",
  "tags": [
   "branch prediction",
   "aliasing",
   "speculation recovery"
  ],
  "summary": "Analyze destructive predictor aliasing and connect prediction checkpoints to precise recovery after a miss.",
  "statement": "Two hot branches with opposite behavior repeatedly map to the same predictor entry and accuracy collapses. Explain destructive aliasing in bimodal and history-based predictors and propose ways to reduce it within a fixed storage budget. Follow-ups: what state must be checkpointed at prediction or rename, when should predictor tables be trained, and how does the machine recover global history and younger instructions after a misprediction?",
  "kind": "answer",
  "answer": null,
  "solution": "A bimodal table indexed by low address bits lets unrelated branches update the same saturating counter, so oppositely biased branches pull it back and forth. History-based predictors can also alias when different address/history pairs fold to one entry, although combining address and history may separate patterns a bimodal table cannot. Mitigations include better hashing, partial tags, skewed banks with different hashes, separating branch classes, or a tagged multi-history design; under fixed bits, tags reduce the number of prediction entries, so the tradeoff must be measured. At prediction, checkpoint the speculative global history and enough rename or recovery state to restore the architectural path. On resolution, train with the actual outcome—carefully avoiding duplicate or wrong-path updates—and on a miss redirect fetch, squash all younger work, restore the branch checkpoint, then shift in the real outcome. Training only at retirement simplifies wrong-path concerns but delays learning; training at resolution improves responsiveness but needs recovery discipline. The target predictor and return stack also need repair when their speculative state followed the wrong path.",
  "votes": {
   "up": 55,
   "down": 4
  }
 },
 {
  "id": "iq-210",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "Memory Dependence Speculation Replay",
  "difficulty": "hard",
  "tags": [
   "load-store queue",
   "memory dependence",
   "replay"
  ],
  "summary": "Let loads bypass unresolved stores safely, detect violations, and recover without losing precise state.",
  "statement": "An out-of-order core has an older store whose address is not ready and a younger load whose address is ready. Compare waiting with speculatively issuing the load. Describe the structures needed to detect a memory-order violation and recover. Follow-ups: explain partial address overlap and forwarding, identify the role of a dependence predictor, and discuss livelock or performance risks in a replay design.",
  "kind": "answer",
  "answer": null,
  "solution": "Waiting is correct but serializes every ambiguous load behind older stores. Speculative issue predicts independence, reads the cache, and records the load in the load queue. When each older store resolves its address, the store queue compares it against younger executed loads; an overlap means the load may have consumed stale data. The core then squashes and replays the load and its dependent younger work, often restarting from that load while preserving older instructions. If an older store already has matching address and data, exact byte masks determine whether the load can receive all bytes by forwarding, merge forwarded and cached bytes, or must wait for missing store data. A store-set or similar predictor learns store-load pairs that previously conflicted and delays only likely dependences. Recovery must prevent a violating load from retiring and must clear stale wakeups. Repeated optimistic replay can livelock or flood queues, so a violation should train the predictor and may force conservative ordering on retry. Comparisons often begin with page-offset bits for speed, but final physical-address checks must resolve synonyms correctly.",
  "votes": {
   "up": 50,
   "down": 5
  }
 },
 {
  "id": "iq-211",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "Inclusive, Exclusive, and Non-Inclusive Caches",
  "difficulty": "medium",
  "tags": [
   "cache hierarchy",
   "inclusion",
   "snoops"
  ],
  "summary": "Compare hierarchy inclusion policies in usable capacity, eviction behavior, and coherence lookup cost.",
  "statement": "Compare inclusive, exclusive, and non-inclusive policies for a private upper cache backed by a shared last-level cache. Discuss effective capacity, lookup and fill complexity, coherence snoop filtering, and what happens when the lower level evicts a line. Follow-ups: why can an inclusive lower-level eviction invalidate a hot upper-level line, and what metadata can decouple snoop filtering from data inclusion?",
  "kind": "answer",
  "answer": null,
  "solution": "An inclusive hierarchy guarantees every upper-level line also has a lower-level copy. The shared level can act as a snoop filter, but duplicate data reduces effective capacity, and evicting a lower-level line requires back-invalidating all upper copies before reuse. An exclusive hierarchy aims to hold a line in only one level, maximizing aggregate capacity; fills and evictions become swaps or victim moves, adding traffic and latency, and coherence must locate the sole copy. A non-inclusive policy permits but does not require duplication, giving replacement freedom and often better capacity behavior, but the data array alone cannot prove whether private copies exist. A separate directory or presence bits can track sharers and filter snoops without forcing the lower data cache to retain every upper line. Inclusive back-invalidations are especially harmful when many private hot lines map to a pressured shared set. Policy names describe guarantees, not whether a particular access probes levels serially or in parallel, so performance also depends on implementation.",
  "votes": {
   "up": 43,
   "down": 3
  }
 },
 {
  "id": "iq-212",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "Precise Exceptions with Out-of-Order Completion",
  "difficulty": "medium",
  "tags": [
   "precise exceptions",
   "retirement",
   "reorder buffer"
  ],
  "summary": "Preserve an exact architectural boundary when younger instructions finish before an older fault is known.",
  "statement": "A divide-by-zero is detected after several younger instructions have already completed, including a load and an arithmetic operation. Explain how an out-of-order processor presents a precise exception. Follow-ups: when may register and store effects become architectural, what information is retained for the faulting instruction, and how are interrupts different from faults discovered during execution?",
  "kind": "answer",
  "answer": null,
  "solution": "Execution completion updates speculative physical registers and queue entries, not committed architectural state. Instructions retire in program order from the reorder-buffer head. The divide records its exception type and relevant metadata in its entry; when it reaches the head, all older instructions have committed and no younger instruction has. Retirement stops, younger entries and their speculative mappings are flushed, the saved program counter and cause are exposed to the handler, and fetch redirects to the exception vector. Stores remain in a store queue and cannot update coherent memory until they are irrevocably committed, so a younger completed store leaves no visible effect. The machine preserves the faulting instruction's address, cause, and restart convention; depending on the ISA, the saved PC identifies that instruction for retry or the next instruction for a trap. External interrupts are normally sampled at a legal instruction boundary and delayed until a precise boundary is available, whereas a synchronous fault is attached to the instruction that caused it. Non-restartable operations require special serialization or buffered side effects.",
  "votes": {
   "up": 48,
   "down": 2
  }
 },
 {
  "id": "iq-213",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "Virtual Cache Synonyms and Homonyms",
  "difficulty": "hard",
  "tags": [
   "virtual memory",
   "VIPT cache",
   "aliasing"
  ],
  "summary": "Derive safe VIPT geometry and handle virtual synonyms, address-space homonyms, and large cache pressure.",
  "statement": "Explain synonyms and homonyms in virtually addressed caches and why a virtually indexed, physically tagged L1 is a common compromise. For 4 KiB pages and 64-byte lines, derive the index-bit limit that avoids translation-dependent set selection. Follow-ups: what does that imply for an 8-way L1 capacity, how can a larger design cope, and why are address-space identifiers relevant to TLBs and fully virtual tags?",
  "kind": "answer",
  "answer": null,
  "solution": "Synonyms are different virtual addresses mapping to one physical line; duplicate cached copies can diverge. Homonyms are identical virtual addresses in different address spaces mapping to different physical lines; context distinguishes them. VIPT starts set lookup using page-offset bits while the TLB translates in parallel, then compares physical tags, avoiding homonyms in the cache tag and detecting the physical line. With 4 KiB pages and 64-byte lines, the page offset has 12 bits and the line offset consumes 6, leaving at most 6 safe set-index bits: 64 sets. At 8 ways, capacity is 64 sets times 8 ways times 64 bytes = 32 KiB. Larger VIPT caches can increase associativity, use larger pages, add alias detection or page coloring, or accept extra lookup steps. A physically indexed cache avoids synonyms but puts translation before indexing. TLB entries need address-space identifiers so entries from multiple processes can coexist without a flush; a fully virtually tagged cache would likewise need process identity and explicit synonym management.",
  "votes": {
   "up": 52,
   "down": 5
  }
 },
 {
  "id": "iq-214",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "Atomic Read-Modify-Write and Cache Lines",
  "difficulty": "medium",
  "tags": [
   "atomics",
   "coherence",
   "contention"
  ],
  "summary": "Connect atomic operations to exclusive line ownership, ordering semantics, and scalability under contention.",
  "statement": "Explain how a coherent multicore implements an atomic fetch-add without allowing another core to interleave a write. Contrast a locked cache-line operation with a bus-wide lock, and discuss why a shared atomic counter scales poorly. Follow-ups: what happens if the operand crosses a cache-line boundary, how do acquire and release semantics differ from atomicity, and when would per-core counters help?",
  "kind": "answer",
  "answer": null,
  "solution": "The core obtains the target line in an exclusive or modified coherence state, performs the read-modify-write while retaining ownership, and prevents conflicting coherence requests from observing an intermediate value. Modern aligned cacheable atomics therefore lock ownership of the line or its local pipeline path, not the entire system bus. A cross-line or uncacheable operand may require a much heavier global mechanism or may be unsupported, which is why alignment is part of the contract. A contended counter forces the line to migrate among cores; each increment serializes behind ownership transfer, so throughput collapses with core count even though every operation is correct. Per-core or sharded counters eliminate the hot line and combine values only when needed, trading exact instantaneous reads for scalability. Atomicity says the update is indivisible; acquire and release constrain ordering of other memory operations around it. A relaxed fetch-add can still be indivisible without publishing preceding data or preventing following reads from moving, so the memory-order choice must match the synchronization protocol.",
  "votes": {
   "up": 47,
   "down": 3
  }
 },
 {
  "id": "iq-215",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "SMT Throughput Versus Interference",
  "difficulty": "medium",
  "tags": [
   "SMT",
   "resource sharing",
   "quality of service"
  ],
  "summary": "Explain how simultaneous threads fill execution slots while competing for front-end, queue, and cache resources.",
  "statement": "A core supports two simultaneous hardware threads. Explain when enabling the second thread improves total throughput and when it slows both workloads. Identify which structures are duplicated, partitioned, or competitively shared in a plausible design. Follow-ups: how would you measure whether the pairing is beneficial, and what controls can provide quality of service or reduce a side channel?",
  "kind": "answer",
  "answer": null,
  "solution": "A second thread improves throughput when one thread leaves issue slots unused because of cache misses, branch recovery, or limited instruction-level parallelism; the other can use otherwise idle front-end and execution bandwidth. It hurts when both demand the same bottleneck, such as fetch bandwidth, integer ports, load queues, memory bandwidth, or cache capacity, creating destructive interference. Architectural register state and control state are duplicated, while rename resources, queues, predictors, execution units, and caches may be statically partitioned, dynamically shared, or selectively replicated. Evaluate weighted speedup or throughput alongside each workload's slowdown, tail latency, miss rates, queue occupancy, and port utilization; aggregate IPC alone can hide starvation. Controls include fetch or issue quotas, way or queue partitioning, thread priority, bandwidth throttles, and disabling co-scheduling for sensitive workloads. Shared predictors and caches also expose timing channels, so stronger isolation may require flushing, partitioning, or scheduling different trust domains at different times, with an explicit utilization cost.",
  "votes": {
   "up": 42,
   "down": 4
  }
 },
 {
  "id": "iq-216",
  "track": "interview",
  "branch": "CPU & Architecture",
  "title": "DRAM Scheduling Fairness and Row Locality",
  "difficulty": "hard",
  "tags": [
   "DRAM",
   "memory controller",
   "fairness"
  ],
  "summary": "Balance row-buffer efficiency against starvation, bank parallelism, write draining, and latency guarantees.",
  "statement": "A memory controller prioritizes ready row hits over older row misses. Throughput rises, but one pointer-chasing core suffers extreme tail latency beside a streaming workload. Explain the behavior and design a scheduler that balances row locality with fairness. Follow-ups: discuss bank-level parallelism, read-versus-write queues, write-drain thresholds, and which metrics reveal starvation that average bandwidth hides.",
  "kind": "answer",
  "answer": null,
  "solution": "A first-ready, first-come-first-served policy serves commands that hit an open row before older commands requiring precharge and activation. The stream generates a continuing supply of row hits, so it maximizes bus efficiency while the latency-sensitive miss can age indefinitely. Add bounded aging: retain row-hit priority normally, but promote requests past an age threshold or allocate per-source service credits so every source makes progress. Schedule independently across banks where timing constraints permit, because a conflict in one bank need not block useful work in another. Reads usually have priority because cores wait on them; writes accumulate in a buffer and are drained in batches above a high watermark to amortize bus turnaround, stopping at a low watermark or when an urgent read appears. Too-long write drains create read tail spikes, while too-short drains waste command cycles. Measure per-source latency percentiles, maximum age, slowdown relative to solo execution, queue residence time, and fairness—not only row-hit rate and aggregate bandwidth. Refresh and timing constraints must also enter the age guarantee because the scheduler cannot issue commands that violate device timing.",
  "votes": {
   "up": 49,
   "down": 4
  }
 }
]);
