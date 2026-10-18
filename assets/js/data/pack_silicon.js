/* Silicon pack: 75 RTL / hardware-interview problems.
   rtl-101 .. rtl-145: Verilog coding tasks (kind "code").
   rtl-146 .. rtl-175: numeric answer-box questions (kind "answer"). */
registerProblems([

/* ============================ CODE PROBLEMS ============================ */

{
  id: "rtl-101", track: "silicon", branch: "RTL Design",
  title: "Parameterized Synchronous FIFO", difficulty: "medium",
  tags: ["FIFO", "pointers", "parameterized"],
  summary: "Single-clock FIFO with parameterized width/depth and bulletproof full/empty flags.",
  statement: "Implement module sync_fifo with parameters DATA_W (default 8) and DEPTH (default 16, a power of two). Ports: input clk, input rst_n (synchronous active-low reset), input wr_en, input [DATA_W-1:0] wr_data, input rd_en, output reg [DATA_W-1:0] rd_data, output full, output empty. Writes on wr_en when not full, reads on rd_en when not empty; rd_data updates on the clock edge that performs the read (standard FIFO, not FWFT). A simultaneous read and write must both succeed when the FIFO is neither full nor empty. Writes while full and reads while empty are ignored and must never corrupt stored data. After reset the FIFO is empty.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module sync_fifo #(\n    parameter DATA_W = 8,\n    parameter DEPTH  = 16\n) (\n    input  wire              clk,\n    input  wire              rst_n,\n    input  wire              wr_en,\n    input  wire [DATA_W-1:0] wr_data,\n    input  wire              rd_en,\n    output reg  [DATA_W-1:0] rd_data,\n    output wire              full,\n    output wire              empty\n);\n    // TODO: implement\nendmodule\n" },
  solution: "Use a memory array of DEPTH entries plus read and write pointers of $clog2(DEPTH)+1 bits each; the extra MSB distinguishes full from empty. full asserts when the pointers match in the low bits but differ in the MSB, empty when they are equal. Gate the pointer updates with (wr_en && !full) and (rd_en && !empty). On reset clear both pointers, which makes empty=1 and full=0."
},
{
  id: "rtl-102", track: "silicon", branch: "CDC & Timing",
  title: "Asynchronous FIFO with Gray Pointers", difficulty: "hard",
  tags: ["CDC", "FIFO", "gray code"],
  summary: "Cross two unrelated clock domains with a dual-clock FIFO using gray-coded, synchronized pointers.",
  statement: "Implement module async_fifo with parameters DATA_W (default 8) and ADDR_W (default 4, giving DEPTH = 2**ADDR_W). Write side ports: wr_clk, wr_rst_n, wr_en, [DATA_W-1:0] wr_data, output wr_full. Read side ports: rd_clk, rd_rst_n, rd_en, output [DATA_W-1:0] rd_data, output rd_empty. Resets are asynchronous assert, synchronous deassert in their own domain. Pointers must be gray-coded and passed through two-flop synchronizers before comparison in the opposite domain. wr_full and rd_empty are computed in their local domains only. Simultaneous operation at unrelated frequencies must never lose, duplicate, or reorder data.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module async_fifo #(\n    parameter DATA_W = 8,\n    parameter ADDR_W = 4\n) (\n    input  wire              wr_clk,\n    input  wire              wr_rst_n,\n    input  wire              wr_en,\n    input  wire [DATA_W-1:0] wr_data,\n    output wire              wr_full,\n    input  wire              rd_clk,\n    input  wire              rd_rst_n,\n    input  wire              rd_en,\n    output wire [DATA_W-1:0] rd_data,\n    output wire              rd_empty\n);\n    // TODO: implement (gray pointers + 2-flop synchronizers)\nendmodule\n" },
  solution: "Keep binary pointers of ADDR_W+1 bits locally in each domain and convert them to gray (g = b ^ (b>>1)) before crossing. Synchronize each gray pointer into the opposite domain with a two-flop chain, convert back (or compare in gray), and generate full in the write domain (write gray pointer equals synchronized read gray pointer with both MSBs inverted) and empty in the read domain (pointers equal). Use a true dual-port memory written on wr_clk and combinationally read on rd_clk. Gray coding guarantees only one bit flips per increment, so a synchronizer sample is always a valid old or new value."
},
{
  id: "rtl-103", track: "silicon", branch: "RTL Design",
  title: "Round-Robin Arbiter", difficulty: "medium",
  tags: ["arbiter", "fairness"],
  summary: "Four requesters, one resource, zero starvation: rotating-priority grant logic.",
  statement: "Implement module round_robin_arbiter with parameter N (default 4). Ports: input clk, input rst_n (synchronous active-low), input [N-1:0] req, output reg [N-1:0] grant (one-hot). Each cycle, if any req bit is set, grant exactly one requester; the granted requester then drops to lowest priority for the next arbitration so that priority rotates round-robin. If a granted requester keeps req high it may be re-granted only after all other active requesters have been served. When no request is active grant must be all zeros. After reset, requester 0 has highest priority.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module round_robin_arbiter #(\n    parameter N = 4\n) (\n    input  wire         clk,\n    input  wire         rst_n,\n    input  wire [N-1:0] req,\n    output reg  [N-1:0] grant\n);\n    // TODO: implement\nendmodule\n" },
  solution: "Maintain a one-hot (or binary) pointer to the requester just past the last grant. Build the grant combinationally as a fixed-priority arbitration of req masked twice: once with priority above the pointer, and if that is empty, over the full req vector (the classic double-arbiter / thermometer-mask trick). Update the pointer from the current grant each cycle a grant occurs. Register the grant or keep it combinational, but ensure it is one-hot and zero when req is zero."
},
{
  id: "rtl-104", track: "silicon", branch: "RTL Design",
  title: "8-bit Priority Encoder", difficulty: "easy",
  tags: ["combinational", "encoder"],
  summary: "Find the highest set bit: classic fixed-priority encoder with a valid flag.",
  statement: "Implement module priority_encoder_8. Ports: input [7:0] in, output reg [2:0] out, output reg valid. out is the index of the highest-priority (most-significant) set bit of in, so bit 7 wins over bit 0. valid is 1 when at least one input bit is set; when in is all zeros, out must be 0 and valid must be 0. The logic is purely combinational.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module priority_encoder_8 (\n    input  wire [7:0] in,\n    output reg  [2:0] out,\n    output reg        valid\n);\n    // TODO: implement\nendmodule\n" },
  solution: "Use a casex/if-else chain testing bits from in[7] down to in[0], assigning out the index of the first set bit. Set valid = |in. A casez with don't-care patterns (1xxxxxxx, 01xxxxxx, ...) is the cleanest synthesis-friendly form."
},
{
  id: "rtl-105", track: "silicon", branch: "RTL Design",
  title: "UART Transmitter (8N1)", difficulty: "medium",
  tags: ["UART", "protocol", "FSM"],
  summary: "Serialize a byte with start/stop framing at a parameterized bit rate.",
  statement: "Implement module uart_tx with parameter CLKS_PER_BIT (default 868, i.e. 100 MHz / 115200 baud). Ports: input clk, input rst_n (synchronous active-low), input tx_start, input [7:0] tx_data, output reg tx, output reg tx_busy. When tx_start pulses while idle, latch tx_data and transmit one start bit (0), 8 data bits LSB-first, and one stop bit (1), each lasting exactly CLKS_PER_BIT clocks. tx idles high and tx_busy is high for the whole frame including the stop bit. tx_start pulses arriving while tx_busy is high must be ignored.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module uart_tx #(\n    parameter CLKS_PER_BIT = 868\n) (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       tx_start,\n    input  wire [7:0] tx_data,\n    output reg        tx,\n    output reg        tx_busy\n);\n    // TODO: implement (8N1, LSB first)\nendmodule\n" },
  solution: "Use a small FSM (IDLE, START, DATA, STOP), a bit-time counter counting to CLKS_PER_BIT-1, and a 3-bit bit index. Latch tx_data into a shift register on tx_start and shift right each bit boundary, driving tx with the LSB. tx is 1 in IDLE, 0 during START, the shifted data bit during DATA, and 1 during STOP; tx_busy follows (state != IDLE)."
},
{
  id: "rtl-106", track: "silicon", branch: "RTL Design",
  title: "UART Receiver with 16x Oversampling", difficulty: "hard",
  tags: ["UART", "oversampling", "FSM"],
  summary: "Recover bytes from an asynchronous RX line by sampling mid-bit on a 16x baud tick.",
  statement: "Implement module uart_rx. Ports: input clk, input rst_n (synchronous active-low), input tick16 (a one-cycle enable at 16x the baud rate), input rx, output reg [7:0] rx_data, output reg rx_done, output reg frame_err. Synchronize rx through two flip-flops first. On detecting a falling edge while idle, wait 8 ticks (mid-start-bit), confirm the line is still low (else it was a glitch: return to idle), then sample each data bit 16 ticks apart, LSB first, for 8 bits, and finally check the stop bit is high. Pulse rx_done for exactly one clk when a full frame completes and set frame_err (held until the next frame starts) if the stop bit was low.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module uart_rx (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       tick16,\n    input  wire       rx,\n    output reg  [7:0] rx_data,\n    output reg        rx_done,\n    output reg        frame_err\n);\n    // TODO: implement (8N1, 16x oversampling, mid-bit sampling)\nendmodule\n" },
  solution: "Two-flop synchronize rx, then edge-detect the idle-to-start transition. Run an FSM with a 4-bit oversample counter reset at the start edge: at count 7 re-check the start bit, then at every count 15 shift in the sampled bit. After 8 data bits sample once more for the stop bit, raising rx_done and frame_err accordingly. All counter advances are gated by tick16 so the FSM works at the system clock."
},
{
  id: "rtl-107", track: "silicon", branch: "RTL Design",
  title: "SPI Master (Mode 0)", difficulty: "medium",
  tags: ["SPI", "protocol", "shift register"],
  summary: "Full-duplex 8-bit SPI master, CPOL=0 CPHA=0, MSB first.",
  statement: "Implement module spi_master with parameter DIV (default 4): sclk is derived from clk with a period of DIV clk cycles (toggle every DIV/2 clocks). Ports: input clk, input rst_n (synchronous active-low), input start, input [7:0] din, output reg sclk, output reg mosi, input miso, output reg cs_n, output reg [7:0] dout, output reg done. SPI mode 0: sclk idles low, mosi changes on the falling edge of sclk and miso is sampled on the rising edge, MSB first. Assert cs_n low for the whole 8-bit transfer, return it high one sclk half-period after the last bit, and pulse done for one clk with the received byte in dout. start while busy is ignored.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module spi_master #(\n    parameter DIV = 4\n) (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       start,\n    input  wire [7:0] din,\n    output reg        sclk,\n    output reg        mosi,\n    input  wire       miso,\n    output reg        cs_n,\n    output reg  [7:0] dout,\n    output reg        done\n);\n    // TODO: implement (SPI mode 0, MSB first)\nendmodule\n" },
  solution: "Generate sclk with a counter toggling every DIV/2 clocks while busy. Keep one 8-bit shift register loaded with din at start: on each sclk falling edge shift left and drive the new MSB onto mosi; on each rising edge shift miso into the receive register. Count 8 rising edges, then finish: deassert cs_n, pulse done with dout. Mode 0 sampling (launch on falling, capture on rising) is the only subtlety."
},
{
  id: "rtl-108", track: "silicon", branch: "RTL Design",
  title: "Simplified I2C Master", difficulty: "hard",
  tags: ["I2C", "protocol", "open-drain"],
  summary: "Single-byte I2C write/read master with open-drain modeling and ACK checking.",
  statement: "Implement module i2c_master with parameter DIV (default 250, clocks per half SCL period). Ports: input clk, input rst_n (synchronous active-low), input start, input [6:0] addr, input rw (1 = read, 0 = write), input [7:0] din, output reg scl_o, output reg sda_o, output reg sda_oe (1 = drive sda_o, 0 = release), input sda_i, output reg [7:0] dout, output reg busy, output reg ack_err, output reg done. Open drain is modeled with sda_oe rather than an inout. On start: issue a START condition, send addr then rw MSB-first, sample the ACK (ack_err=1 on NACK), then for writes send din and check ACK, for reads receive 8 bits and drive NACK, then issue STOP. done pulses one clk at completion; busy is high throughout.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module i2c_master #(\n    parameter DIV = 250\n) (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       start,\n    input  wire [6:0] addr,\n    input  wire       rw,\n    input  wire [7:0] din,\n    output reg        scl_o,\n    output reg        sda_o,\n    output reg        sda_oe,\n    input  wire       sda_i,\n    output reg  [7:0] dout,\n    output reg        busy,\n    output reg        ack_err,\n    output reg        done\n);\n    // TODO: implement (START, byte tx/rx, ACK check, STOP)\nendmodule\n" },
  solution: "Structure it as a flat FSM stepping through START, 8 address+rw bits, ACK sample, 8 data bits (direction chosen by rw), final ACK/NACK, STOP, all paced by a DIV-count half-bit timer. Change sda only while scl_o is low, sample while high, and use sda_oe=0 with sda_o=0 to emulate open-drain release. During ACK phases release the bus and sample sda_i. A linear FSM with a bit counter and a phase flag keeps the state count manageable."
},
{
  id: "rtl-109", track: "silicon", branch: "CDC & Timing",
  title: "Switch Debouncer", difficulty: "easy",
  tags: ["debounce", "glitches"],
  summary: "Turn a bouncing mechanical button into one clean level with a saturating counter.",
  statement: "Implement module debouncer with parameter STABLE_CLKS (default 1_000_000, i.e. 10 ms at 100 MHz). Ports: input clk, input rst_n (synchronous active-low), input btn, output reg clean. Synchronize btn through two flip-flops first. clean may only change after the synchronized input has held a new value for STABLE_CLKS consecutive clocks; any bounce restarts the count. After reset clean is 0.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module debouncer #(\n    parameter STABLE_CLKS = 1000000\n) (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire btn,\n    output reg  clean\n);\n    // TODO: implement (2-flop sync + stability counter)\nendmodule\n" },
  solution: "Two-flop synchronize btn, then run a counter that reloads whenever the synchronized value differs from the current clean output and counts while they differ. When the counter reaches STABLE_CLKS-1, update clean to the synchronized value and hold. Equivalently use a saturating up/down counter; either way the output can never glitch because it changes only after a full stability window."
},
{
  id: "rtl-110", track: "silicon", branch: "CDC & Timing",
  title: "Rising/Falling Edge Detector", difficulty: "easy",
  tags: ["edge detect", "synchronizer"],
  summary: "One-cycle pulses on both edges of an asynchronous input, done safely.",
  statement: "Implement module edge_detector. Ports: input clk, input rst_n (synchronous active-low), input sig (asynchronous), output reg rise, output reg fall. Synchronize sig with two flip-flops, then emit a one-clock pulse on rise when the synchronized signal goes 0-to-1 and on fall when it goes 1-to-0. Never assert rise and fall in the same cycle, and no pulses may appear after reset until the first real edge.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module edge_detector (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire sig,\n    output reg  rise,\n    output reg  fall\n);\n    // TODO: implement (2-flop sync + delay register)\nendmodule\n" },
  solution: "Pipe sig through two synchronizer flops and a third delay flop. rise = sync && !delayed, fall = !sync && delayed, both registered or combinational then registered for a clean one-cycle pulse. The two-flop stage is what makes an asynchronous input safe to compare."
},
{
  id: "rtl-111", track: "silicon", branch: "CDC & Timing",
  title: "Pulse Synchronizer (Toggle-Based)", difficulty: "medium",
  tags: ["CDC", "pulse", "toggle"],
  summary: "Move a single-clock pulse from domain A to a slower domain B without losing it.",
  statement: "Implement module pulse_sync. Ports: input clk_a, input rst_a_n (synchronous active-low), input pulse_a (one clk_a cycle), input clk_b, input rst_b_n (synchronous active-low), output reg pulse_b (one clk_b cycle). Each pulse_a must produce exactly one pulse_b, even if clk_b is much slower than clk_a. Pulses in domain A are guaranteed spaced far enough apart that a previous pulse has been acknowledged; you may assume pulse_a never arrives while the previous transfer is still in flight. Reset clears all state in both domains.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module pulse_sync (\n    input  wire clk_a,\n    input  wire rst_a_n,\n    input  wire pulse_a,\n    input  wire clk_b,\n    input  wire rst_b_n,\n    output reg  pulse_b\n);\n    // TODO: implement (toggle + 2-flop sync + edge detect)\nendmodule\n" },
  solution: "Convert the level pulse into a toggle in domain A: a register that flips on each pulse_a. Synchronize the toggle into domain B with two flops, delay one more flop, and XOR the last two B-domain values to regenerate a one-cycle pulse_b. This works at any frequency ratio because a level, not a pulse, crosses the boundary."
},
{
  id: "rtl-112", track: "silicon", branch: "CDC & Timing",
  title: "Multi-Bit CDC: 2-Flop Sync + Data Hold", difficulty: "medium",
  tags: ["CDC", "synchronizer", "multi-bit"],
  summary: "Cross an 8-bit data word safely by holding it stable while a control flag synchronizes.",
  statement: "Implement module cdc_data. Ports: input clk_a, input rst_a_n (synchronous active-low), input [7:0] data_a, input valid_a (one-cycle pulse meaning data_a is new), input clk_b, input rst_b_n (synchronous active-low), output reg [7:0] data_b, output reg valid_b (one clk_b cycle pulse). Because a multi-bit bus cannot be synchronized bit-by-bit, hold data_a stable in a source register from each valid_a until the transfer completes (valid_a is guaranteed not to re-arrive before the previous word is consumed), cross a toggle flag with a two-flop synchronizer, and capture the held data into data_b in domain B when the flag edge is seen. Pulse valid_b for one clk_b cycle on each captured word.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module cdc_data (\n    input  wire       clk_a,\n    input  wire       rst_a_n,\n    input  wire [7:0] data_a,\n    input  wire       valid_a,\n    input  wire       clk_b,\n    input  wire       rst_b_n,\n    output reg  [7:0] data_b,\n    output reg        valid_b\n);\n    // TODO: implement (hold data + toggle handshake across domains)\nendmodule\n" },
  solution: "In domain A, register data_a into a holding register and flip a toggle on each valid_a. In domain B, two-flop synchronize the toggle, edge-detect it, and on the edge capture the (now long-stable) holding register into data_b while pulsing valid_b. The data bus itself never passes through synchronizers; the synchronized flag guarantees the bus has been stable for at least two clk_b edges when sampled."
},
{
  id: "rtl-113", track: "silicon", branch: "CDC & Timing",
  title: "Even Clock Divider", difficulty: "easy",
  tags: ["clock divider", "duty cycle"],
  summary: "Divide a clock by any even N with a clean 50% duty cycle.",
  statement: "Implement module clkdiv_even with parameter N (default 8, always even). Ports: input clk, input rst_n (synchronous active-low), output reg clk_out. clk_out must toggle so that it completes one full period every N input clocks with an exact 50% duty cycle: high for N/2 input clocks, low for N/2. After reset clk_out is 0 and counting restarts.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module clkdiv_even #(\n    parameter N = 8\n) (\n    input  wire clk,\n    input  wire rst_n,\n    output reg  clk_out\n);\n    // TODO: implement (divide by even N, 50% duty)\nendmodule\n" },
  solution: "Count from 0 to N/2-1; when the counter hits N/2-1, toggle clk_out and restart the counter. That yields N/2 clocks high and N/2 low for any even N. Keep the counter width at $clog2(N/2) or larger."
},
{
  id: "rtl-114", track: "silicon", branch: "CDC & Timing",
  title: "Divide-by-3 Clock, 50% Duty", difficulty: "medium",
  tags: ["clock divider", "odd divide", "both edges"],
  summary: "The classic odd-divide trick: 50% duty divide-by-3 using both clock edges.",
  statement: "Implement module clkdiv3. Ports: input clk, input rst_n (synchronous active-low), output wire clk_out. Divide clk by 3 with an exact 50% duty cycle (1.5 input periods high, 1.5 low), which requires using both the rising and falling edges of clk. After reset clk_out is 0. You may use a posedge and a negedge always block and combine their outputs combinationally.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module clkdiv3 (\n    input  wire clk,\n    input  wire rst_n,\n    output wire clk_out\n);\n    // TODO: implement (50% duty divide-by-3, both edges)\nendmodule\n" },
  solution: "Build a divide-by-3 waveform with a 2-bit counter on the positive edge producing a signal high for 2 of 3 cycles, and a delayed version of it on the negative edge. OR (or AND, depending on polarity convention) the posedge and negedge waveforms so the 50% point lands on a falling edge. The standard construction: posedge counter gives clk_pos high for cycles 0-1; its negedge-shifted copy combined as clk_out = clk_pos & clk_neg (or the OR variant) produces the 50% duty output."
},
{
  id: "rtl-115", track: "silicon", branch: "RTL Design",
  title: "PWM Generator", difficulty: "easy",
  tags: ["PWM", "counter"],
  summary: "Free-running counter plus comparator: the two-line PWM that runs every LED fade.",
  statement: "Implement module pwm_gen with parameter W (default 8). Ports: input clk, input rst_n (synchronous active-low), input [W-1:0] duty, output reg pwm. A W-bit free-running counter gives a period of 2**W clocks; pwm is high exactly duty clocks per period. duty = 0 means always low, duty = 2**W-1 means high all but one clock per period. duty may change at any time and must take effect at the start of the next period without glitches.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module pwm_gen #(\n    parameter W = 8\n) (\n    input  wire         clk,\n    input  wire         rst_n,\n    input  wire [W-1:0] duty,\n    output reg          pwm\n);\n    // TODO: implement (period = 2**W clocks)\nendmodule\n" },
  solution: "Run a free-running W-bit counter and register the comparison pwm <= (counter < duty). Registering the compare output (and optionally the duty input) keeps the output glitch-free even if duty changes mid-period. With W bits the resolution is 1/2**W."
},
{
  id: "rtl-116", track: "silicon", branch: "RTL Design",
  title: "Hex 7-Segment Decoder", difficulty: "easy",
  tags: ["decoder", "combinational"],
  summary: "Map a 4-bit hex digit onto a 7-segment display with a plain case statement.",
  statement: "Implement module seven_seg. Ports: input [3:0] hex, output reg [6:0] seg. seg is active-high with bit ordering {g,f,e,d,c,b,a} (bit 6 = segment g, bit 0 = segment a). Decode all 16 hex digits 0-F using the standard glyph set (0 = 7'b0111111, 1 = 7'b0000110, 2 = 7'b1011011, and so on; A, b, C, d, E, F for 10-15). Purely combinational logic.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module seven_seg (\n    input  wire [3:0] hex,\n    output reg  [6:0] seg\n);\n    // TODO: implement ({g,f,e,d,c,b,a}, active high)\nendmodule\n" },
  solution: "A single always @* with a case over all 16 input values assigning the constant pattern for each glyph, plus a default of all-zeros, is the whole module. Mind the bit ordering: seg[0] is segment a, so write patterns as 7'b gfedcba."
},
{
  id: "rtl-117", track: "silicon", branch: "RTL Design",
  title: "Traffic Light Controller FSM", difficulty: "medium",
  tags: ["FSM", "Moore", "control"],
  summary: "Two-road intersection controller with yellow phases and a pedestrian request input.",
  statement: "Implement module traffic_light. Ports: input clk, input rst_n (synchronous active-low), input tick (one-cycle 1 Hz enable), input ped_req, output reg [1:0] ns_light, output reg [1:0] ew_light, where the encoding is 2'b00 = red, 2'b01 = yellow, 2'b10 = green. Normal cycle: NS green for 8 ticks, NS yellow for 3 (EW red meanwhile), then EW green for 8, EW yellow for 3, repeat. A pedestrian request (ped_req, level, may stay high) is remembered and forces the current green phase to end after a minimum of 2 ticks, going through the normal yellow phase into an all-red state for 2 ticks (both lights red) before resuming with the EW green... no: after all-red, resume with the light that was NOT green before the pedestrian interruption. ped_req has no effect during yellow or all-red beyond being latched. Moore outputs.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module traffic_light (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       tick,\n    input  wire       ped_req,\n    output reg  [1:0] ns_light,\n    output reg  [1:0] ew_light\n);\n    // TODO: implement (00=red, 01=yellow, 10=green)\nendmodule\n" },
  solution: "Use a state register {NS_G, NS_Y, EW_G, EW_Y, ALL_R} plus a 4-bit tick counter advanced only when tick is high, and a sticky ped flag cleared when the all-red state completes. In each green state transition on (counter >= 8) or (ped && counter >= 2); remember which direction was green with a 1-bit flag so all-red can hand off to the other direction. All outputs are pure functions of the state."
},
{
  id: "rtl-118", track: "silicon", branch: "RTL Design",
  title: "Vending Machine FSM", difficulty: "medium",
  tags: ["FSM", "money", "Mealy"],
  summary: "Accept nickels and dimes for a 15-cent item, vend, and return the nickel overpay.",
  statement: "Implement module vending_machine. Ports: input clk, input rst_n (synchronous active-low), input nickel (one-cycle pulse = 5 cents), input dime (one-cycle pulse = 10 cents), output reg dispense (one-cycle pulse), output reg change (one-cycle pulse, 5 cents back). The item costs 15 cents. Track the deposited total (0, 5, 10); coins arriving on the same cycle never happen. When the total reaches 15 exactly, pulse dispense only. When a dime takes the total from 10 to 20, pulse dispense and change together. Return to the zero state after dispensing.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module vending_machine (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire nickel,\n    input  wire dime,\n    output reg  dispense,\n    output reg  change\n);\n    // TODO: implement (item = 15 cents)\nendmodule\n" },
  solution: "Three states (S0, S5, S10) are enough. Transitions: nickel adds 5, dime adds 10. From S10 a nickel reaches exactly 15 (dispense), a dime reaches 20 (dispense + change); from S5 a dime also reaches 15. Make dispense and change registered one-cycle pulses asserted on the dispensing transition, and reset the state to S0."
},
{
  id: "rtl-119", track: "silicon", branch: "RTL Design",
  title: "Sequence Detector 1011 (Mealy, Overlapping)", difficulty: "medium",
  tags: ["FSM", "Mealy", "sequence detector"],
  summary: "Detect the overlapping pattern 1011 with a Mealy machine: output in the same cycle.",
  statement: "Implement module seq_det_mealy. Ports: input clk, input rst_n (synchronous active-low), input in (one bit per clock), output reg out. Detect the pattern 1011 on in with overlap allowed: after a detection, the trailing bits may be the start of a new match (e.g. input 1011011 contains two matches). As a Mealy machine, out is a function of state AND current input, and pulses high in the same cycle the final 1 of the pattern arrives. Trace carefully: after matching 1011, the suffix '1' restarts the prefix chain, and '101' is a valid prefix of the next match.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module seq_det_mealy (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire in,\n    output reg  out\n);\n    // TODO: implement (Mealy, pattern 1011, overlapping)\nendmodule\n" },
  solution: "States represent the longest matched prefix: S0 (none), S1 ('1'), S2 ('10'), S3 ('101'). out = 1 exactly when in state S3 and in = 1. For overlap, on that match the next state is S3 if the new bit extends '101'... compute per transition: from S3, in=1 goes to S1 (matched '1'... the suffix '11' longest prefix is '1' -> S1? The matched string '1011' longest proper suffix that is a prefix of '1011' is '1', so S1), in=0 goes to S2 ('1010' suffix '10'). S0 on 0 stays, on 1 -> S1; S1 on 1 stays S1, on 0 -> S2; S2 on 0 -> S0, on 1 -> S3."
},
{
  id: "rtl-120", track: "silicon", branch: "RTL Design",
  title: "Sequence Detector 1011 (Moore, Overlapping)", difficulty: "medium",
  tags: ["FSM", "Moore", "sequence detector"],
  summary: "Same 1011 pattern, Moore style: the output lags the final bit by one state.",
  statement: "Implement module seq_det_moore. Ports: input clk, input rst_n (synchronous active-low), input in (one bit per clock), output reg out. Detect the overlapping pattern 1011 exactly as in the Mealy version, but as a Moore machine out depends only on the state, so it goes high the cycle AFTER the final 1 arrives, for one cycle. Overlapping matches must still be found, and the detected state must fall through to the correct prefix state (the matched suffix '1' continues a potential new match).",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module seq_det_moore (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire in,\n    output reg  out\n);\n    // TODO: implement (Moore, pattern 1011, overlapping)\nendmodule\n" },
  solution: "Add a fifth state S4 (pattern found) to the prefix states S0..S3; out = (state == S4). From S4 the next-state logic mirrors S1's transitions, because the matched string ends in '1' which is a one-bit prefix of the pattern. Everything else matches the Mealy transition table."
},
{
  id: "rtl-121", track: "silicon", branch: "RTL Design",
  title: "Serial CRC-8 (Polynomial 0x07)", difficulty: "hard",
  tags: ["CRC", "LFSR", "serial"],
  summary: "Bit-serial CRC-8 with polynomial x^8+x^2+x+1, one message bit per clock.",
  statement: "Implement module crc8_serial. Ports: input clk, input rst_n (synchronous active-low), input start (one-cycle pulse: initialize the CRC state to 8'h00 and begin a new message), input din (one message bit per clock while active), input valid (high on cycles din carries a message bit), output [7:0] crc. On each valid cycle compute the CRC-8/SMBUS update with polynomial 0x07 (x^8 + x^2 + x + 1), MSB-first: feedback = din ^ crc[7]; next = {crc[6:0], 1'b0} ^ (feedback ? 8'h07 : 8'h00). crc reflects the current state at all times. Bits arrive MSB-first.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module crc8_serial (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       start,\n    input  wire       din,\n    input  wire       valid,\n    output wire [7:0] crc\n);\n    // TODO: implement (poly 0x07, MSB first)\nendmodule\n" },
  solution: "One 8-bit state register. The serial LFSR update is: fb = din ^ state[7]; next = {state[6:0],1'b0} ^ (8'h07 & {8{fb}}). Load 0 on start, apply the update only when valid, hold otherwise. crc is the state register read directly."
},
{
  id: "rtl-122", track: "silicon", branch: "RTL Design",
  title: "8-bit LFSR (x^8+x^6+x^5+x^4+1)", difficulty: "easy",
  tags: ["LFSR", "PRBS"],
  summary: "Fibonacci LFSR with taps at 8,6,5,4 and a seed load.",
  statement: "Implement module lfsr8. Ports: input clk, input rst_n (synchronous active-low), input load, input [7:0] seed, input en, output [7:0] out. A Fibonacci-style LFSR shifting right by one each enabled cycle: the new MSB is out[0] ^ out[2] ^ out[3] ^ out[4] (taps for polynomial x^8 + x^6 + x^5 + x^4 + 1). load has priority over en and loads seed. After reset out is 8'h01. An all-zero state must never be loaded (treat a zero seed as 8'h01).",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module lfsr8 (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       load,\n    input  wire [7:0] seed,\n    input  wire       en,\n    output wire [7:0] out\n);\n    // TODO: implement (Fibonacci, taps 8,6,5,4)\nendmodule\n" },
  solution: "Register holding the state; feedback = state[0] ^ state[2] ^ state[3] ^ state[4]; next = {feedback, state[7:1]}. Priority: reset > load (substitute 8'h01 for a zero seed) > en > hold. This yields a maximal-length 255-state sequence for any nonzero seed."
},
{
  id: "rtl-123", track: "silicon", branch: "RTL Design",
  title: "Parameterized Barrel Shifter", difficulty: "medium",
  tags: ["shifter", "datapath", "mux tree"],
  summary: "Shift an N-bit word by any amount in one cycle with a log-depth mux tree.",
  statement: "Implement module barrel_shifter with parameter W (default 8). Ports: input [W-1:0] data, input [$clog2(W)-1:0] shamt, input dir (1 = shift right, 0 = shift left), input arith (sign-extend on right shifts, only meaningful when dir = 1), output reg [W-1:0] result. Logical left shifts fill with zeros; logical right shifts fill with zeros; arithmetic right shifts replicate data[W-1]. The shift is purely combinational and any shamt from 0 to W-1 is legal.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module barrel_shifter #(\n    parameter W = 8\n) (\n    input  wire [W-1:0]        data,\n    input  wire [$clog2(W)-1:0] shamt,\n    input  wire                dir,\n    input  wire                arith,\n    output reg  [W-1:0]        result\n);\n    // TODO: implement (dir: 1=right, 0=left; arith: sign extend)\nendmodule\n" },
  solution: "Either express it directly (left: data << shamt; right logical: data >> shamt; arithmetic: $signed(data) >>> shamt) or build the explicit log2(W)-stage mux tree where stage k shifts by 2^k when shamt[k] is set. For arithmetic right shifts, pre-extend with sign copies. The mux tree is the answer interviewers want sketched; the operators are what you ship."
},
{
  id: "rtl-124", track: "silicon", branch: "Computer Architecture",
  title: "Leading-Zero Counter (32-bit)", difficulty: "medium",
  tags: ["LZC", "priority", "combinational"],
  summary: "Count leading zeros of a 32-bit word combinationally: the normalization block of every FPU.",
  statement: "Implement module lzc32. Ports: input [31:0] in, output reg [5:0] count, output reg zero. count is the number of leading zeros before the first 1 (0 when in[31] is 1, 32 when in is all zeros). zero is 1 only when in == 0. Purely combinational.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module lzc32 (\n    input  wire [31:0] in,\n    output reg  [5:0]  count,\n    output reg         zero\n);\n    // TODO: implement\nendmodule\n" },
  solution: "Structure it hierarchically: find the topmost set bit with a priority structure (a casez over 32 patterns works but is ugly; a binary tree of 16/8/4/2-bit decisions is the scalable answer). Each tree level contributes one bit of count. zero = ~|in, and count must read 32 in that case."
},
{
  id: "rtl-125", track: "silicon", branch: "Computer Architecture",
  title: "Signed Fixed-Point Multiplier (Q4.4)", difficulty: "hard",
  tags: ["fixed point", "multiplier", "datapath"],
  summary: "Multiply two signed Q4.4 numbers into a Q8.8 result with registered output and rounding-free truncation.",
  statement: "Implement module fxp_mult. Ports: input clk, input rst_n (synchronous active-low), input signed [7:0] a (Q4.4), input signed [7:0] b (Q4.4), input in_valid, output reg signed [15:0] p (Q8.8), output reg out_valid. One cycle after in_valid, p must hold the exact signed product a*b (which is already aligned as Q8.8) and out_valid must pulse for one clock. Back-to-back in_valid on consecutive cycles must produce back-to-back correct results. out_valid is 0 after reset and whenever no result emerges.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module fxp_mult (\n    input  wire               clk,\n    input  wire               rst_n,\n    input  wire signed [7:0]  a,\n    input  wire signed [7:0]  b,\n    input  wire               in_valid,\n    output reg  signed [15:0] p,\n    output reg                out_valid\n);\n    // TODO: implement (Q4.4 x Q4.4 -> Q8.8, 1-cycle latency)\nendmodule\n" },
  solution: "Sign-aware 8x8 multiply yields 16 bits with the binary point at position 8 automatically: p <= a * b with both declared signed. Pipeline the valid bit alongside (out_valid <= in_valid) so results line up one cycle later. The fixed-point subtlety is conceptual, not structural: the product of Q4.4 operands is Q8.8 with no shifting needed."
},
{
  id: "rtl-126", track: "silicon", branch: "Computer Architecture",
  title: "4-Stage Pipelined 32-bit Adder", difficulty: "medium",
  tags: ["pipelining", "adder", "latency"],
  summary: "Break a 32-bit add into four 8-bit stages to hit timing; carry and valid flow down the pipe.",
  statement: "Implement module pipe_adder32. Ports: input clk, input rst_n (synchronous active-low), input [31:0] a, input [31:0] b, input cin, input in_valid, output [31:0] sum, output cout, output out_valid. Each clock, one 8-bit slice of the addition completes and passes its carry to the next stage, so a result emerges 4 clocks after the inputs, at a throughput of one addition per clock. out_valid must be exactly in_valid delayed by 4 cycles. sum and cout are the registered outputs of the final stage. After reset all pipeline valids are 0.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module pipe_adder32 (\n    input  wire        clk,\n    input  wire        rst_n,\n    input  wire [31:0] a,\n    input  wire [31:0] b,\n    input  wire        cin,\n    input  wire        in_valid,\n    output wire [31:0] sum,\n    output wire        cout,\n    output wire        out_valid\n);\n    // TODO: implement (8 bits per stage, 4-cycle latency)\nendmodule\n" },
  solution: "Stage k computes {carry[k+1], sum_part[k]} = a[k*8 +: 8] + b[k*8 +: 8] + carry[k], registering its sum slice, carry, and valid. Carry ripples only 8 bits per cycle, cutting the critical path by ~4x. Pipe in_valid through a 4-bit shift register for out_valid."
},
{
  id: "rtl-127", track: "silicon", branch: "Computer Architecture",
  title: "8-bit Carry-Lookahead Adder", difficulty: "hard",
  tags: ["CLA", "adder", "fast arithmetic"],
  summary: "Generate/propagate logic that computes all 8 carries in O(1) gate depth.",
  statement: "Implement module cla8. Ports: input [7:0] a, input [7:0] b, input cin, output [7:0] sum, output cout, output pg (block propagate), output gg (block generate). Bit-level g = a&b, p = a^b; carries computed with lookahead: c1 = g0 | (p0&cin), c2 = g1 | (p1&g0) | (p1&p0&cin), and so on up to cout. pg = &p, gg is the block generate independent of cin, and pg/gg must be consistent with cout = gg | (pg & cin). Combinational only.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module cla8 (\n    input  wire [7:0] a,\n    input  wire [7:0] b,\n    input  wire       cin,\n    output wire [7:0] sum,\n    output wire       cout,\n    output wire       pg,\n    output wire       gg\n);\n    // TODO: implement (carry-lookahead, no ripple)\nendmodule\n" },
  solution: "Compute p and g vectors, then unroll the carry recurrence: each c[i+1] = g[i] | (p[i] & c[i]) expanded fully in terms of cin so no carry waits on the previous. sum = p ^ c (with c[0] = cin). pg = &p; gg = the cin-independent part of cout; cout = gg | (pg & cin). This is the building block for hierarchical CLAs."
},
{
  id: "rtl-128", track: "silicon", branch: "Computer Architecture",
  title: "8-bit ALU (add/sub/and/or/xor/slt)", difficulty: "easy",
  tags: ["ALU", "datapath"],
  summary: "A six-operation ALU with zero and overflow flags: the datapath atom.",
  statement: "Implement module alu8. Ports: input [7:0] a, input [7:0] b, input [2:0] op, output reg [7:0] y, output reg zero, output reg ovf. op encodings: 3'b000 = a+b, 3'b001 = a-b, 3'b010 = a&b, 3'b011 = a|b, 3'b100 = a^b, 3'b101 = signed less-than (y = 1 if a<b as signed, else 0); other opcodes drive y = 0. zero = (y == 0). ovf is 1 on signed overflow for add and subtract, 0 for all other ops. Purely combinational.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module alu8 (\n    input  wire [7:0] a,\n    input  wire [7:0] b,\n    input  wire [2:0] op,\n    output reg  [7:0] y,\n    output reg        zero,\n    output reg        ovf\n);\n    // TODO: implement (000 add, 001 sub, 010 and, 011 or, 100 xor, 101 slt)\nendmodule\n" },
  solution: "A case on op computes y; compute the adder result once with a 9-bit intermediate shared by add and sub (sub = a + ~b + 1). Signed overflow: same-sign operands producing a different-sign result — (a[7]==b[7]) && (y[7]!=a[7]) for add, and (a[7]!=b[7]) && (y[7]!=a[7]) for sub. zero is just ~|y. For slt use $signed comparison or sign/overflow reasoning."
},
{
  id: "rtl-129", track: "silicon", branch: "Computer Architecture",
  title: "Register File (2R1W, 32x8)", difficulty: "easy",
  tags: ["register file", "memory"],
  summary: "Two combinational read ports, one synchronous write port: the CPU's scratchpad.",
  statement: "Implement module regfile. Ports: input clk, input rst_n (synchronous active-low), input we, input [4:0] waddr, input [7:0] wdata, input [4:0] raddr1, input [4:0] raddr2, output [7:0] rdata1, output [7:0] rdata2. Register 0 is hardwired to zero: writes to address 0 are discarded and reads return 0. Writes occur on the clock edge when we is high; reads are combinational (asynchronous). Reading an address being written in the same cycle returns the OLD value. Reset clears all registers.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module regfile (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       we,\n    input  wire [4:0] waddr,\n    input  wire [7:0] wdata,\n    input  wire [4:0] raddr1,\n    input  wire [4:0] raddr2,\n    output wire [7:0] rdata1,\n    output wire [7:0] rdata2\n);\n    // TODO: implement (32x8, 2 async reads, 1 sync write, r0 = 0)\nendmodule\n" },
  solution: "A reg [7:0] mem [0:31] array with a reset loop, a clocked write guarded by (we && waddr != 0), and two continuous assigns rdataN = (raddrN == 0) ? 8'h00 : mem[raddrN]. Asynchronous reads plus the write guard give old-value semantics on read-during-write for free."
},
{
  id: "rtl-130", track: "silicon", branch: "Computer Architecture",
  title: "Direct-Mapped Cache Controller FSM", difficulty: "hard",
  tags: ["cache", "FSM", "memory hierarchy"],
  summary: "State machine for a direct-mapped write-back cache: compare, hit, refill, writeback.",
  statement: "Implement module cache_ctrl (control path only; the datapath is assumed). Ports: input clk, input rst_n (synchronous active-low), input req (a CPU access is pending), input we (1 = write, 0 = read), input hit (tag match and valid, from the datapath), input dirty (the evicted line needs write-back), input mem_ready (memory completed the requested burst), output reg stall (CPU must wait), output reg mem_req (issue memory transaction), output reg mem_we (1 = write-back burst, 0 = fill read), output reg line_we (write the filled line into the array). States: IDLE (wait for req), COMPARE (check tag; on hit and read, finish; on hit and write, update and finish dirty), ALLOCATE (mem_req read burst until mem_ready, then line_we pulse), WRITEBACK (mem_req write burst until mem_ready, then go to ALLOCATE). On miss with dirty=1 go to WRITEBACK first, otherwise ALLOCATE. stall is high in every state except IDLE. After a write hit the access completes in COMPARE.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module cache_ctrl (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire req,\n    input  wire we,\n    input  wire hit,\n    input  wire dirty,\n    input  wire mem_ready,\n    output reg  stall,\n    output reg  mem_req,\n    output reg  mem_we,\n    output reg  line_we\n);\n    // TODO: implement (IDLE/COMPARE/ALLOCATE/WRITEBACK)\nendmodule\n" },
  solution: "Four-state Moore-ish FSM. IDLE -> COMPARE on req. COMPARE: hit -> IDLE (drop stall); miss & dirty -> WRITEBACK; miss & clean -> ALLOCATE. WRITEBACK drives mem_req with mem_we=1 until mem_ready, then ALLOCATE. ALLOCATE drives mem_req with mem_we=0 until mem_ready, pulses line_we, and returns to COMPARE so the original access re-executes and now hits. stall = (state != IDLE)."
},
{
  id: "rtl-131", track: "silicon", branch: "RTL Design",
  title: "AXI4-Lite Slave (Register Bank)", difficulty: "hard",
  tags: ["AXI4-Lite", "bus", "protocol"],
  summary: "Four 32-bit registers behind a full AXI4-Lite slave with proper handshake discipline.",
  statement: "Implement module axi4lite_slave. Ports: input aclk, input aresetn (synchronous active-low); write address channel: input [3:0] awaddr, input awvalid, output reg awready; write data channel: input [31:0] wdata, input [3:0] wstrb, input wvalid, output reg wready; write response: output reg [1:0] bresp, output reg bvalid, input bready; read address: input [3:0] araddr, input arvalid, output reg arready; read data: output reg [31:0] rdata, output reg [1:0] rresp, output reg rvalid, input rready. Four 32-bit registers at word addresses 0-3 (byte addresses 0x0,0x4,0x8,0xC given in awaddr/araddr[3:0], use [3:2] to select). Honor AXI rules: a transfer completes only when VALID and READY coincide; once asserted, READY/VALID-style outputs hold until the handshake completes; wstrb selects which bytes of a register are written; bresp/rresp are 2'b00 (OKAY). Accept AW and W independently and respond only after both have completed.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module axi4lite_slave (\n    input  wire        aclk,\n    input  wire        aresetn,\n    input  wire [3:0]  awaddr,\n    input  wire        awvalid,\n    output reg         awready,\n    input  wire [31:0] wdata,\n    input  wire [3:0]  wstrb,\n    input  wire        wvalid,\n    output reg         wready,\n    output reg  [1:0]  bresp,\n    output reg         bvalid,\n    input  wire        bready,\n    input  wire [3:0]  araddr,\n    input  wire        arvalid,\n    output reg         arready,\n    output reg  [31:0] rdata,\n    output reg  [1:0]  rresp,\n    output reg         rvalid,\n    input  wire        rready\n);\n    // TODO: implement (4 x 32-bit regs, AXI4-Lite handshakes)\nendmodule\n" },
  solution: "Classic skid-free pattern: assert awready/wready when idle, latch awaddr and wdata/wstrb as their handshakes complete (independently, two flag bits), and when both flags are set perform the register write with per-byte wstrb muxing, then raise bvalid until bready. Read side: arready latches araddr, then rvalid with rdata selected by araddr[3:2] holds until rready. Every *_valid, once high, stays high until its handshake — that is the rule interviewers probe."
},
{
  id: "rtl-132", track: "silicon", branch: "RTL Design",
  title: "APB Slave (Register Bank)", difficulty: "medium",
  tags: ["APB", "bus", "protocol"],
  summary: "AMBA APB peripheral: setup/access two-phase writes and reads to four registers.",
  statement: "Implement module apb_slave. Ports: input pclk, input presetn (synchronous active-low), input psel, input penable, input pwrite, input [3:0] paddr, input [31:0] pwdata, output reg [31:0] prdata, output pready. Four 32-bit registers selected by paddr[3:2]. APB has two phases: setup (psel=1, penable=0) and access (psel=1, penable=1); a write commits in the access phase, and read data must be valid during the access phase. This slave never inserts wait states, so pready is constant 1. Registers reset to zero.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module apb_slave (\n    input  wire        pclk,\n    input  wire        presetn,\n    input  wire        psel,\n    input  wire        penable,\n    input  wire        pwrite,\n    input  wire [3:0]  paddr,\n    input  wire [31:0] pwdata,\n    output reg  [31:0] prdata,\n    output wire        pready\n);\n    // TODO: implement (4 x 32-bit regs, no wait states)\nendmodule\n" },
  solution: "wire wr = psel & penable & pwrite and wire rd = psel & ~pwrite. On wr, case paddr[3:2] into the four registers. prdata is a combinational (or setup-phase registered) mux on paddr[3:2]; pready ties to 1. The entire protocol fits in a few lines because the master does the two-phase sequencing."
},
{
  id: "rtl-133", track: "silicon", branch: "RTL Design",
  title: "Valid/Ready Pipeline Stage", difficulty: "medium",
  tags: ["handshake", "valid/ready", "backpressure"],
  summary: "Register one beat of a valid/ready stream with correct backpressure in both directions.",
  statement: "Implement module handshake_stage. Ports: input clk, input rst_n (synchronous active-low), input in_valid, output in_ready, input [7:0] in_data, output reg out_valid, input out_ready, output reg [7:0] out_data. A single registered buffer stage: data transfers upstream when in_valid && in_ready, downstream when out_valid && out_ready. in_ready must be 1 whenever the buffer is empty OR is being emptied this cycle (allowing full one-beat-per-cycle throughput when the downstream always accepts). Data must never be lost or duplicated under arbitrary valid/ready wiggling.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module handshake_stage (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       in_valid,\n    output wire       in_ready,\n    input  wire [7:0] in_data,\n    output reg        out_valid,\n    input  wire       out_ready,\n    output reg  [7:0] out_data\n);\n    // TODO: implement (1-deep registered stage)\nendmodule\n" },
  solution: "in_ready = !out_valid || out_ready. When in_ready, load out_data <= in_data and out_valid <= in_valid; otherwise hold (out_valid only falls when out_ready consumes). This is the transparent-when-draining register slice: combinatorial ready path but registered data/valid, sustaining 1 transfer/cycle."
},
{
  id: "rtl-134", track: "silicon", branch: "RTL Design",
  title: "Skid Buffer (2-Entry Elastic)", difficulty: "hard",
  tags: ["skid buffer", "valid/ready", "backpressure"],
  summary: "Break both valid and ready paths combinationally without ever dropping a beat.",
  statement: "Implement module skid_buffer. Ports: input clk, input rst_n (synchronous active-low), input in_valid, output in_ready, input [7:0] in_data, output out_valid, input out_ready, output [7:0] out_data. Unlike the simple stage, BOTH the data/valid path and the ready path must be fully registered (no combinational path from out_ready to in_ready or from in_valid to out_valid), which requires a 2-deep elastic buffer: a main output register plus a skid register that catches an in-flight beat when downstream stalls. Full throughput of one beat per clock must be sustained whenever downstream accepts.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module skid_buffer (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       in_valid,\n    output wire       in_ready,\n    input  wire [7:0] in_data,\n    output wire       out_valid,\n    input  wire       out_ready,\n    output wire [7:0] out_data\n);\n    // TODO: implement (registered on BOTH handshake directions)\nendmodule\n" },
  solution: "Register in_ready (accept when the skid slot is free). If the output register is full and not draining, the incoming beat lands in the skid register; when the output drains, the skid register feeds it. Implement with two registers and two valid bits: out stage and skid stage, refilling out from skid (or directly from input when empty). Both handshake directions are now pure registers, so it can be placed across a long physical path."
},
{
  id: "rtl-135", track: "silicon", branch: "CDC & Timing",
  title: "Retriggerable Pulse Stretcher", difficulty: "medium",
  tags: ["one-shot", "timer"],
  summary: "Turn a one-cycle pulse into an N-cycle level that re-arms on every new pulse.",
  statement: "Implement module pulse_stretcher with parameter N (default 8). Ports: input clk, input rst_n (synchronous active-low), input pulse_in (one-cycle pulse), output reg level_out. On each pulse_in, level_out goes high (starting the cycle AFTER the pulse) and stays high for exactly N clocks. A new pulse while level_out is high re-loads the full N-count (retriggerable). After the count expires level_out returns low until the next pulse.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module pulse_stretcher #(\n    parameter N = 8\n) (\n    input  wire clk,\n    input  wire rst_n,\n    input  wire pulse_in,\n    output reg  level_out\n);\n    // TODO: implement (retriggerable one-shot, N cycles)\nendmodule\n" },
  solution: "A down-counter: pulse_in loads N-1 (or N) into the counter regardless of current state (that is the retrigger), and while the counter is nonzero it decrements and level_out stays high. Map the exact count so the output is high for precisely N clocks, then self-clears."
},
{
  id: "rtl-136", track: "silicon", branch: "RTL Design",
  title: "Frequency Counter", difficulty: "medium",
  tags: ["counter", "measurement", "synchronizer"],
  summary: "Count signal edges inside a gate window to measure an unknown clock's frequency.",
  statement: "Implement module freq_counter. Ports: input clk (reference), input rst_n (synchronous active-low), input gate (a level, high for a known number of reference clocks), input sig (asynchronous signal to measure), output reg [15:0] count, output reg done. Synchronize sig through two flops, then count its rising edges while gate is high. When gate falls, latch the edge count into count and pulse done for one clock. A new gate window restarts the measurement from zero. Saturate the internal counter at 16'hFFFF rather than wrapping.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module freq_counter (\n    input  wire        clk,\n    input  wire        rst_n,\n    input  wire        gate,\n    input  wire        sig,\n    output reg  [15:0] count,\n    output reg         done\n);\n    // TODO: implement (count sig rising edges during gate)\nendmodule\n" },
  solution: "Two-flop sync of both sig and gate, then edge-detect each. While gate is high, increment a saturating 16-bit counter on sig rising edges. Detect the gate falling edge to transfer the counter into count, pulse done, and zero the working counter. Frequency = count / gate_time in the real system."
},
{
  id: "rtl-137", track: "silicon", branch: "RTL Design",
  title: "Thermometer-to-Binary Encoder (8-bit)", difficulty: "medium",
  tags: ["encoder", "ADC interface"],
  summary: "Count the ones in an 8-bit thermometer code; flag illegal patterns.",
  statement: "Implement module therm2bin. Ports: input [7:0] therm, output reg [2:0] bin, output reg error. A legal thermometer code has all ones contiguous from bit 0 upward (8'b00000111 is legal, 8'b00001101 is not). bin is the number of ones (0-8, but 8 means therm = 8'hFF; use bin = 7 in that case with error = 0 and treat full-scale as 7... precisely: bin = number of 1 bits clamped so that 8'hFF yields bin = 7 and error = 0). Any non-contiguous pattern asserts error = 1 and drives bin = 0. Combinational logic.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module therm2bin (\n    input  wire [7:0] therm,\n    output reg  [2:0] bin,\n    output reg        error\n);\n    // TODO: implement (count contiguous ones from LSB, flag bad codes)\nendmodule\n" },
  solution: "bin is the popcount of therm (equivalently a chain of half-adders or a sum of the bits) clamped to 7. Legality check: a thermometer code has at most one 0-to-1 transition region — detect with therm & (therm + 1) == 0 style logic or per-boundary XOR checks ensuring ones are contiguous from the LSB. error = illegal pattern."
},
{
  id: "rtl-138", track: "silicon", branch: "RTL Design",
  title: "Hamming(7,4) Encoder", difficulty: "medium",
  tags: ["ECC", "hamming", "parity"],
  summary: "Insert three parity bits among four data bits: single-error-correcting code, encode side.",
  statement: "Implement module hamming_enc. Ports: input [3:0] d, output [6:0] cw. Produce the classic (7,4) Hamming codeword with positions numbered 1-7 (position 1 = cw[0]): cw[0]=p1, cw[1]=p2, cw[2]=d[0], cw[3]=p4, cw[4]=d[1], cw[5]=d[2], cw[6]=d[3]. Parity bits cover power-of-two positions: p1 covers positions {1,3,5,7} = {p1, d[0], d[1], d[3]}, p2 covers {2,3,6,7} = {p2, d[0], d[2], d[3]}, p4 covers {4,5,6,7} = {p4, d[1], d[2], d[3]}, each chosen for even parity. Purely combinational.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module hamming_enc (\n    input  wire [3:0] d,\n    output wire [6:0] cw\n);\n    // TODO: implement (positions 1,2,4 are parity)\nendmodule\n" },
  solution: "p1 = d[0]^d[1]^d[3], p2 = d[0]^d[2]^d[3], p4 = d[1]^d[2]^d[3], then interleave into the codeword positions. Three XOR trees and a concatenation; the position numbering is the only thing to get right."
},
{
  id: "rtl-139", track: "silicon", branch: "RTL Design",
  title: "Hamming(7,4) Decoder with Correction", difficulty: "hard",
  tags: ["ECC", "hamming", "syndrome"],
  summary: "Compute the syndrome, flip the bad bit, and recover the data — SEC in action.",
  statement: "Implement module hamming_dec. Ports: input [6:0] cw (same layout as hamming_enc: position 1 = cw[0]), output reg [3:0] d, output reg error (any single-bit error was detected), output reg [2:0] err_pos (position of the erroneous bit, 1-7; 0 when no error). Recompute the three parity checks to form a syndrome s = {c4, c2, c1}; if nonzero it directly encodes the 1-based position of the corrupted bit. Correct that bit before extracting d = {corrected cw[6], cw[5], cw[4], cw[2]} (d[3], d[2], d[1], d[0] respectively). Combinational logic; assume at most one bit is wrong.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module hamming_dec (\n    input  wire [6:0] cw,\n    output reg  [3:0] d,\n    output reg        error,\n    output reg  [2:0] err_pos\n);\n    // TODO: implement (syndrome -> correct -> extract)\nendmodule\n" },
  solution: "c1 = cw[0]^cw[2]^cw[4]^cw[6], c2 = cw[1]^cw[2]^cw[5]^cw[6], c4 = cw[3]^cw[4]^cw[5]^cw[6]; syndrome {c4,c2,c1} IS the bit position (that is the elegance of Hamming codes). err_pos = syndrome, error = |syndrome. If error, XOR a one-hot decode of the syndrome into cw, then strip positions 3,5,6,7 as data bits."
},
{
  id: "rtl-140", track: "silicon", branch: "RTL Design",
  title: "Binary-to-Gray / Gray-to-Binary Converter", difficulty: "easy",
  tags: ["gray code", "combinational"],
  summary: "Both directions of gray conversion in one parameterized module.",
  statement: "Implement module gray_conv with parameter W (default 8). Ports: input [W-1:0] in, input dir (0 = binary to gray, 1 = gray to binary), output reg [W-1:0] out. Binary to gray: g = b ^ (b >> 1). Gray to binary: each output bit is the XOR of all input bits at or above it (prefix XOR, MSB first). Combinational.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module gray_conv #(\n    parameter W = 8\n) (\n    input  wire [W-1:0] in,\n    input  wire         dir,\n    output reg  [W-1:0] out\n);\n    // TODO: implement (dir: 0 = bin->gray, 1 = gray->bin)\nendmodule\n" },
  solution: "bin->gray is one line: in ^ (in >> 1). gray->bin needs the prefix XOR: out[W-1] = in[W-1], out[k] = out[k+1] ^ in[k] computed MSB down, or the log-depth cascade out = in ^ (in>>1) ^ (in>>2) ^ ... A generate-for over bits with an accumulating XOR is the clean parameterized form."
},
{
  id: "rtl-141", track: "silicon", branch: "RTL Design",
  title: "Single-Port Synchronous RAM", difficulty: "easy",
  tags: ["memory", "RAM"],
  summary: "64x8 RAM with registered read data: infer a real block RAM.",
  statement: "Implement module sp_ram. Ports: input clk, input we, input [5:0] addr, input [7:0] wdata, output reg [7:0] rdata. On each clock edge: if we is high, mem[addr] <= wdata; rdata <= mem[addr] (read-during-write to the same address returns the OLD data, matching block-RAM read-first behavior). No reset on the memory contents.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module sp_ram (\n    input  wire       clk,\n    input  wire       we,\n    input  wire [5:0] addr,\n    input  wire [7:0] wdata,\n    output reg  [7:0] rdata\n);\n    // TODO: implement (64x8, registered read, read-first)\nendmodule\n" },
  solution: "reg [7:0] mem [0:63]; and one clocked block: if (we) mem[addr] <= wdata; rdata <= mem[addr]; The nonblocking assignments make the read see the old value, which is exactly the read-first template synthesis tools map to block RAM."
},
{
  id: "rtl-142", track: "silicon", branch: "RTL Design",
  title: "Population Count (32-bit)", difficulty: "medium",
  tags: ["popcount", "adder tree", "combinational"],
  summary: "Count set bits in a 32-bit word in one cycle with an adder tree.",
  statement: "Implement module popcount32. Ports: input [31:0] in, output reg [5:0] count. count is the number of 1 bits in in, from 0 to 32. Purely combinational. Any structure is acceptable, but be prepared to discuss why a tree of adders beats a 32-deep ripple.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module popcount32 (\n    input  wire [31:0] in,\n    output reg  [5:0]  count\n);\n    // TODO: implement\nendmodule\n" },
  solution: "Sum 1-bit values pairwise: 16 2-bit partial sums, then 8 3-bit, 4 4-bit, 2 5-bit, 1 6-bit — a log-depth adder tree. A for-loop accumulating into a 6-bit variable also works functionally; the tree is the hardware answer with O(log n) delay."
},
{
  id: "rtl-143", track: "silicon", branch: "Verification",
  title: "Valid/Ready Protocol Monitor", difficulty: "medium",
  tags: ["verification", "monitor", "protocol checker"],
  summary: "A passive checker that flags valid/ready protocol violations in any DUT stream.",
  statement: "Implement module vr_monitor. Ports: input clk, input rst_n (synchronous active-low), input valid, input ready, input [7:0] data, output reg error. Watch a valid/ready channel and raise error (sticky until reset) on either protocol violation: (1) valid deasserts before the transfer completes (valid was high, ready low, and valid drops), or (2) data changes while valid is high and ready is low (data must remain stable during a stall). The monitor is passive: it must never affect the channel. error clears only on reset.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module vr_monitor (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       valid,\n    input  wire       ready,\n    input  wire [7:0] data,\n    output reg        error\n);\n    // TODO: implement (sticky protocol violation flag)\nendmodule\n" },
  solution: "Register valid, ready, and data each cycle. Violation 1: prev valid && !prev ready && !valid. Violation 2: prev valid && !prev ready && (data != prev_data). OR the two conditions into a sticky error register. In a real testbench these become immediate or concurrent assertions; here plain RTL does the same job."
},
{
  id: "rtl-144", track: "silicon", branch: "Verification",
  title: "Pseudo-Random Stimulus Generator", difficulty: "easy",
  tags: ["verification", "LFSR", "stimulus"],
  summary: "LFSR-driven random data and valid gaps for exercising a DUT with backpressure.",
  statement: "Implement module stim_gen. Ports: input clk, input rst_n (synchronous active-low), input en, input ready (the DUT's ready, so valid holds during stalls), output reg [7:0] data, output reg valid. Drive a valid/ready source with pseudo-random behavior: a 16-bit LFSR (taps 16,14,13,11: feedback = lfsr[15] ^ lfsr[13] ^ lfsr[12] ^ lfsr[10], shift left... precisely: new bit enters at position 0 and the register shifts LEFT, new bit into bit 0) generates both the data byte (lfsr[7:0]) and a random valid pattern (valid from lfsr[8] when free to change). valid may only change when en is high and either valid is low or the previous beat was accepted (valid && ready). On an accepted beat (valid && ready), present new random data on the next cycle. Seed the LFSR with 16'hACE1 on reset; valid resets to 0.",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module stim_gen (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire       en,\n    input  wire       ready,\n    output reg  [7:0] data,\n    output reg        valid\n);\n    // TODO: implement (LFSR 16,14,13,11; random valid + data)\nendmodule\n" },
  solution: "Advance the 16-bit Fibonacci LFSR only when en && (!valid || ready), i.e. whenever the generator is allowed to change state. On those cycles load data <= lfsr[7:0] and valid <= lfsr[8]; otherwise hold both so a stalled valid keeps its data stable, which is itself protocol-correct. This gives randomized gaps and data without any testbench code."
},
{
  id: "rtl-145", track: "silicon", branch: "RTL Design",
  title: "4-Tap Moving Average Filter", difficulty: "medium",
  tags: ["DSP", "FIR", "shift register"],
  summary: "Average the last four samples with a shift register and a divide-by-4 that is just a wire.",
  statement: "Implement module moving_avg4. Ports: input clk, input rst_n (synchronous active-low), input [7:0] sample, input in_valid, output reg [9:0] avg, output reg out_valid. Maintain the last 4 accepted samples; on each in_valid, shift the window and output the sum of the four most recent samples (including the new one) divided by 4, truncated, in avg (10 bits so the sum of four 8-bit values fits before the shift). out_valid pulses one cycle after in_valid. Before the window is full, divide by the number of samples seen so far is NOT required — instead output the sum of valid samples so far, shifted right by 2 (truncation acceptable, documented behavior).",
  kind: "code", languages: ["verilog"],
  starter: { verilog: "module moving_avg4 (\n    input  wire       clk,\n    input  wire       rst_n,\n    input  wire [7:0] sample,\n    input  wire       in_valid,\n    output reg  [9:0] avg,\n    output reg        out_valid\n);\n    // TODO: implement (4-tap moving average, >>2)\nendmodule\n" },
  solution: "A 4-deep 8-bit shift register clocked by in_valid, plus a 10-bit add of the four taps shifted right by 2 (free in hardware — just drop the two LSBs). Register avg and out_valid one cycle later. The power-of-two tap count is what makes the division free; that is why real filters pick 4/8/16 taps."
},

/* =========================== ANSWER PROBLEMS =========================== */

{
  id: "rtl-146", track: "silicon", branch: "CDC & Timing",
  title: "Setup Slack: Passing Path", difficulty: "easy",
  tags: ["setup time", "slack", "STA"],
  summary: "Compute setup slack with positive clock skew.",
  statement: "A register-to-register path has: clock period Tclk = 10 ns, launch flop clock-to-Q tco = 1.0 ns, combinational delay tcomb = 5.4 ns, capture flop setup time tsu = 1.2 ns, and clock skew of +0.5 ns (capture clock arrives 0.5 ns LATER than launch). Ignoring hold and jitter, what is the setup slack in ns? (Positive means passing.)",
  kind: "answer", answer: "2.9", tolerance: 0.01,
  solution: "Setup slack = Tclk + skew - tco - tcomb - tsu = 10 + 0.5 - 1.0 - 5.4 - 1.2 = 2.9 ns. Positive skew helps setup (it gives the data more time) but hurts hold."
},
{
  id: "rtl-147", track: "silicon", branch: "CDC & Timing",
  title: "Setup Slack: Failing Path", difficulty: "easy",
  tags: ["setup time", "slack", "STA"],
  summary: "Compute setup slack with negative skew — and get a negative answer.",
  statement: "A path has Tclk = 5 ns, tco = 0.8 ns, tcomb = 3.6 ns, tsu = 0.9 ns, and skew of -0.2 ns (capture clock arrives EARLY). What is the setup slack in ns? A negative answer is expected; give the signed value.",
  kind: "answer", answer: "-0.5", tolerance: 0.01,
  solution: "Slack = Tclk + skew - tco - tcomb - tsu = 5 - 0.2 - 0.8 - 3.6 - 0.9 = -0.5 ns. The path violates setup by 0.5 ns; fixes: reduce tcomb (pipeline/restructure), lower skew, or slow the clock."
},
{
  id: "rtl-148", track: "silicon", branch: "CDC & Timing",
  title: "Hold Slack: Passing Path", difficulty: "medium",
  tags: ["hold time", "slack", "STA"],
  summary: "Compute hold slack — note the clock period is irrelevant.",
  statement: "For a register-to-register path: launch tco(min) = 0.5 ns, minimum combinational delay tcomb(min) = 0.6 ns, capture hold time thold = 0.4 ns, skew = +0.3 ns (capture clock arrives later). What is the hold slack in ns?",
  kind: "answer", answer: "0.4", tolerance: 0.01,
  solution: "Hold slack = tco(min) + tcomb(min) - thold - skew = 0.5 + 0.6 - 0.4 - 0.3 = 0.4 ns. Hold depends only on minimum delays and skew, never on the clock period — that is why slowing the clock cannot fix a hold violation."
},
{
  id: "rtl-149", track: "silicon", branch: "CDC & Timing",
  title: "Hold Slack: Violation", difficulty: "medium",
  tags: ["hold time", "slack", "STA"],
  summary: "A too-fast path with skew gives a hold violation; compute how bad.",
  statement: "A path has tco(min) = 0.3 ns, tcomb(min) = 0.2 ns, thold = 0.6 ns, skew = +0.1 ns (capture clock later). What is the hold slack in ns? Give the signed value.",
  kind: "answer", answer: "-0.2", tolerance: 0.01,
  solution: "Hold slack = tco + tcomb - thold - skew = 0.3 + 0.2 - 0.6 - 0.1 = -0.2 ns. The new data arrives at the capture flop 0.2 ns too early. Fix by adding delay (buffers) in the data path — never by changing the clock frequency."
},
{
  id: "rtl-150", track: "silicon", branch: "CDC & Timing",
  title: "Maximum Clock Frequency", difficulty: "easy",
  tags: ["critical path", "fmax", "STA"],
  summary: "From tco, tcomb, tsu and skew to fmax in MHz.",
  statement: "The critical path of a design has tco = 1.0 ns, tcomb = 4.2 ns, tsu = 0.8 ns, with a helpful skew of +0.1 ns (capture clock later). What is the maximum clock frequency in MHz? Round to 2 decimals.",
  kind: "answer", answer: "169.49", tolerance: 0.01,
  solution: "Tmin = tco + tcomb + tsu - skew = 1.0 + 4.2 + 0.8 - 0.1 = 5.9 ns. fmax = 1/Tmin = 1/(5.9e-9) = 169.49 MHz."
},
{
  id: "rtl-151", track: "silicon", branch: "CDC & Timing",
  title: "Max Frequency: Pick the Critical Path", difficulty: "easy",
  tags: ["critical path", "fmax", "STA"],
  summary: "Three candidate paths; the worst one sets the clock.",
  statement: "A design has three register-to-register paths with combinational delays 8.2 ns, 7.5 ns and 9.1 ns. Every flop has tco + tsu overhead totaling 1.4 ns per path, and skew is 0. What is the maximum clock frequency in MHz? Round to 2 decimals.",
  kind: "answer", answer: "95.24", tolerance: 0.01,
  solution: "Critical path = max(8.2, 7.5, 9.1) = 9.1 ns. Tmin = 9.1 + 1.4 = 10.5 ns. fmax = 1/(10.5e-9) = 95.24 MHz. Optimizing the 8.2 ns path alone buys nothing until the 9.1 ns path is fixed."
},
{
  id: "rtl-152", track: "silicon", branch: "CDC & Timing",
  title: "MTBF of a Synchronizer", difficulty: "hard",
  tags: ["metastability", "MTBF", "synchronizer"],
  summary: "Plug tau, T0, f1, f2 into the metastability MTBF formula.",
  statement: "A single synchronizer stage resolves for t_r = 1.0 ns. The flop has tau = 30 ps and T0 = 1e-13 s. The asynchronous input changes at f1 = 100 MHz and the sampling clock is f2 = 50 MHz. Using MTBF = e^(t_r/tau) / (T0 * f1 * f2), where e is Euler's number, what is the MTBF in seconds? Give your answer in scientific notation with 5 significant digits (e.g. 1.2345e6).",
  kind: "answer", answer: "5.9912e11", tolerance: 0.01,
  solution: "t_r/tau = 1e-9 / 30e-12 = 33.333. e^33.333 = 2.9956e14. Denominator: 1e-13 * 1e8 * 5e7 = 500. MTBF = 2.9956e14 / 500 = 5.9912e11 s (about 19,000 years)."
},
{
  id: "rtl-153", track: "silicon", branch: "CDC & Timing",
  title: "MTBF with Two-Stage Synchronizer", difficulty: "hard",
  tags: ["metastability", "MTBF", "synchronizer"],
  summary: "A longer resolution time explodes the MTBF — compute it.",
  statement: "A two-flop synchronizer gives the second stage t_r = 1.2 ns of resolution time. The flops have tau = 25 ps, T0 = 2e-13 s, data rate f1 = 200 MHz, clock f2 = 100 MHz. Using MTBF = e^(t_r/tau) / (T0 * f1 * f2) with e = Euler's number, compute the MTBF in seconds (scientific notation, 5 significant digits).",
  kind: "answer", answer: "1.7542e17", tolerance: 0.01,
  solution: "t_r/tau = 1.2e-9 / 25e-12 = 48. e^48 = 7.0167e20. Denominator: 2e-13 * 2e8 * 1e8 = 4000. MTBF = 7.0167e20 / 4000 = 1.7542e17 s — billions of years. The exponential in t_r/tau is the entire argument for the extra flop."
},
{
  id: "rtl-154", track: "silicon", branch: "CDC & Timing",
  title: "MTBF Improvement Factor", difficulty: "medium",
  tags: ["metastability", "MTBF", "synchronizer"],
  summary: "Same design, 1 ns more resolution time: by what factor does MTBF grow?",
  statement: "In a given design (tau = 40 ps), increasing the synchronizer resolution time from 0.5 ns to 1.5 ns changes nothing else (T0, f1, f2 unchanged). Using MTBF proportional to e^(t_r/tau), by what factor does the MTBF improve? Give the factor in scientific notation with 5 significant digits.",
  kind: "answer", answer: "7.2005e10", tolerance: 0.01,
  solution: "Ratio = e^((1.5-0.5)ns / 40ps) = e^(1e-9/40e-12) = e^25 = 7.2005e10. One extra nanosecond of resolution time buys a ~72-billion-fold reliability improvement — synchronizer stages are nearly free insurance."
},
{
  id: "rtl-155", track: "silicon", branch: "RTL Design",
  title: "FIFO Depth: Simple Burst", difficulty: "medium",
  tags: ["FIFO depth", "burst", "buffering"],
  summary: "Producer bursts faster than the consumer drains; how deep must the FIFO be?",
  statement: "A producer writes a burst of 80 words at 100 MHz (one word per clock, back to back). The consumer reads continuously at 50 MHz, starting as soon as the first word is available, and never stalls. What minimum FIFO depth (in words) guarantees no overflow?",
  kind: "answer", answer: "40", tolerance: 0.01,
  solution: "Burst duration = 80 / 100 MHz = 800 ns. Words drained in that time = 800 ns * 50 MHz = 40. Worst-case occupancy = 80 - 40 = 40 words. Depth = burst * (1 - f_read/f_write) = 80 * (1 - 0.5) = 40."
},
{
  id: "rtl-156", track: "silicon", branch: "RTL Design",
  title: "FIFO Depth: Closer Rates", difficulty: "medium",
  tags: ["FIFO depth", "burst", "buffering"],
  summary: "Same formula, tighter rate gap.",
  statement: "A producer writes a 120-word burst at 80 MHz; the consumer drains continuously at 60 MHz starting immediately. What minimum FIFO depth (in words) prevents overflow?",
  kind: "answer", answer: "30", tolerance: 0.01,
  solution: "Depth = burst * (1 - f_read/f_write) = 120 * (1 - 60/80) = 120 * 0.25 = 30 words. Check: burst lasts 120/80 MHz = 1.5 us; consumer removes 1.5 us * 60 MHz = 90; 120 - 90 = 30."
},
{
  id: "rtl-157", track: "silicon", branch: "RTL Design",
  title: "FIFO Depth: Round Up", difficulty: "medium",
  tags: ["FIFO depth", "burst", "buffering"],
  summary: "When the math is not an integer, round up.",
  statement: "A producer writes a 256-word burst at 96 MHz; the consumer drains continuously at 64 MHz starting immediately. What minimum integer FIFO depth (in words) prevents overflow?",
  kind: "answer", answer: "86", tolerance: 0.01,
  solution: "Depth = 256 * (1 - 64/96) = 256 * (1/3) = 85.33..., which must be rounded UP to 86 words. (In practice you would also add margin for CDC pointer latency and pick a power of two, e.g. 128.)"
},
{
  id: "rtl-158", track: "silicon", branch: "CDC & Timing",
  title: "Duty Cycle: Divide-by-5", difficulty: "easy",
  tags: ["duty cycle", "clock divider"],
  summary: "Counter-based divider with an asymmetric high time.",
  statement: "A divide-by-5 circuit drives its output high for 2 input clock cycles and low for 3. What is the output duty cycle in percent?",
  kind: "answer", answer: "40", tolerance: 0.01,
  solution: "Duty = high_time / period = 2/5 = 0.4 = 40%. Only a both-edges or PLL-based divider achieves 50% for odd divide ratios."
},
{
  id: "rtl-159", track: "silicon", branch: "CDC & Timing",
  title: "Duty Cycle: Divide-by-3 Both Edges", difficulty: "medium",
  tags: ["duty cycle", "clock divider", "odd divide"],
  summary: "The both-edges divide-by-3 trick lands exactly on 50%.",
  statement: "A divide-by-3 circuit uses a posedge-clocked counter waveform combined with a negedge-clocked copy so the output is high for exactly 1.5 input periods and low for 1.5. What is the duty cycle in percent?",
  kind: "answer", answer: "50", tolerance: 0.01,
  solution: "Duty = 1.5 / 3 = 50%. Using both edges lets an odd divider hit 50% duty; a single-edge counter can only produce multiples of one full input period (e.g. 1/3 = 33.3% or 2/3 = 66.7%)."
},
{
  id: "rtl-160", track: "silicon", branch: "CDC & Timing",
  title: "Duty Cycle: Mod-10 Counter", difficulty: "easy",
  tags: ["duty cycle", "clock divider"],
  summary: "High for six counts out of ten.",
  statement: "A mod-10 counter generates an output that is high while the count is 0-5 and low while the count is 6-9. What is the duty cycle in percent?",
  kind: "answer", answer: "60", tolerance: 0.01,
  solution: "High for 6 of 10 input clocks: duty = 6/10 = 60%."
},
{
  id: "rtl-161", track: "silicon", branch: "CDC & Timing",
  title: "Duty Cycle: Divide-by-7", difficulty: "easy",
  tags: ["duty cycle", "clock divider"],
  summary: "High for 4 of 7 cycles — give the percentage to 2 decimals.",
  statement: "A divide-by-7 counter output is high for 4 input clock cycles and low for 3. What is the duty cycle in percent? Round to 2 decimals.",
  kind: "answer", answer: "57.14", tolerance: 0.01,
  solution: "Duty = 4/7 = 0.571428... = 57.14%."
},
{
  id: "rtl-162", track: "silicon", branch: "RTL Design",
  title: "FSM Encoding: One-Hot vs Binary (20 states)", difficulty: "easy",
  tags: ["FSM", "state encoding", "flip-flops"],
  summary: "How many flip-flops does one-hot cost versus binary for 20 states?",
  statement: "An FSM has 20 states. One-hot encoding uses one flip-flop per state; binary encoding uses ceil(log2(N)). How many MORE flip-flops does one-hot need than binary?",
  kind: "answer", answer: "15", tolerance: 0.01,
  solution: "One-hot: 20 flip-flops. Binary: ceil(log2(20)) = 5 flip-flops. Difference: 20 - 5 = 15. One-hot trades flops for simpler next-state/output logic and is often faster in FPGAs where flops are abundant."
},
{
  id: "rtl-163", track: "silicon", branch: "RTL Design",
  title: "FSM Encoding: Binary Width (100 states)", difficulty: "easy",
  tags: ["FSM", "state encoding", "flip-flops"],
  summary: "Minimum binary state-register width for 100 states.",
  statement: "An FSM has 100 states encoded in minimal binary. How many flip-flops does the state register need?",
  kind: "answer", answer: "7", tolerance: 0.01,
  solution: "ceil(log2(100)) = 7, since 2^6 = 64 < 100 <= 128 = 2^7. The 28 unused codes should transition to a safe state for fault tolerance."
},
{
  id: "rtl-164", track: "silicon", branch: "RTL Design",
  title: "FSM Encoding: From One-Hot to Binary", difficulty: "easy",
  tags: ["FSM", "state encoding", "flip-flops"],
  summary: "A 9-flop one-hot machine re-encoded in binary needs how many flops?",
  statement: "A one-hot FSM uses 9 flip-flops (so it has 9 states). If it were re-encoded with minimal binary encoding instead, how many flip-flops would the state register need?",
  kind: "answer", answer: "4", tolerance: 0.01,
  solution: "ceil(log2(9)) = 4, since 2^3 = 8 < 9 <= 16 = 2^4. Binary saves 5 flops but adds decode logic to every next-state and output equation."
},
{
  id: "rtl-165", track: "silicon", branch: "CDC & Timing",
  title: "Binary to Gray Conversion", difficulty: "easy",
  tags: ["gray code", "conversion"],
  summary: "Convert binary 10110110 to gray; answer as the gray code's decimal value.",
  statement: "Convert the 8-bit binary value 0b10110110 to gray code using g = b ^ (b >> 1). Give the resulting gray code as a decimal number.",
  kind: "answer", answer: "237", tolerance: 0.01,
  solution: "b = 0b10110110 = 182. b >> 1 = 0b01011011 = 91. g = 182 ^ 91 = 0b10110110 ^ 0b01011011 = 0b11101101 = 237. Only one gray bit changes per increment — the whole reason async FIFO pointers are gray-coded."
},
{
  id: "rtl-166", track: "silicon", branch: "CDC & Timing",
  title: "Binary to Gray Conversion (2)", difficulty: "easy",
  tags: ["gray code", "conversion"],
  summary: "Convert binary 01101001 to gray; answer in decimal.",
  statement: "Convert the 8-bit binary value 0b01101001 to gray code using g = b ^ (b >> 1). Give the resulting gray code as a decimal number.",
  kind: "answer", answer: "93", tolerance: 0.01,
  solution: "b = 0b01101001 = 105. b >> 1 = 0b00110100 = 52. g = 105 ^ 52 = 0b01101001 ^ 0b00110100 = 0b01011101 = 93."
},
{
  id: "rtl-167", track: "silicon", branch: "CDC & Timing",
  title: "Gray to Binary Conversion", difficulty: "medium",
  tags: ["gray code", "conversion"],
  summary: "Invert the gray code 1011 back to binary; answer in decimal.",
  statement: "The 4-bit gray code value 0b1011 was produced by g = b ^ (b >> 1). Recover the original binary value using prefix XOR (each binary bit is the XOR of all gray bits at or above it). Give the answer as a decimal number.",
  kind: "answer", answer: "13", tolerance: 0.01,
  solution: "b3 = g3 = 1; b2 = b3 ^ g2 = 1 ^ 0 = 1; b1 = b2 ^ g1 = 1 ^ 1 = 0; b0 = b1 ^ g0 = 0 ^ 1 = 1. Binary = 0b1101 = 13. Gray-to-binary is an MSB-first running XOR."
},
{
  id: "rtl-168", track: "silicon", branch: "CDC & Timing",
  title: "Propagation Delay: Series Chain", difficulty: "easy",
  tags: ["propagation delay", "gates"],
  summary: "Sum the delays along a chain of three gates.",
  statement: "A signal passes through an AND gate (2.0 ns), then an OR gate (1.5 ns), then a NAND gate (1.8 ns), with no wiring delay. What is the total propagation delay in ns?",
  kind: "answer", answer: "5.3", tolerance: 0.01,
  solution: "Delays in series add: 2.0 + 1.5 + 1.8 = 5.3 ns."
},
{
  id: "rtl-169", track: "silicon", branch: "CDC & Timing",
  title: "Propagation Delay: Critical of Two Paths", difficulty: "easy",
  tags: ["propagation delay", "critical path"],
  summary: "Two reconvergent paths; only the slower one matters.",
  statement: "A block has two parallel paths from input to output: path A = AND (2 ns) + XOR (3 ns) + INV (1.5 ns); path B = NAND (1 ns) + OR (2.5 ns) + AND (2 ns). What is the block's worst-case propagation delay in ns?",
  kind: "answer", answer: "6.5", tolerance: 0.01,
  solution: "Path A = 2 + 3 + 1.5 = 6.5 ns; path B = 1 + 2.5 + 2 = 5.5 ns. Worst case = max(6.5, 5.5) = 6.5 ns. The critical path sets the delay, and optimizing path B alone would change nothing."
},
{
  id: "rtl-170", track: "silicon", branch: "CDC & Timing",
  title: "Propagation Delay: XOR Chain", difficulty: "easy",
  tags: ["propagation delay", "parity"],
  summary: "Four cascaded XOR gates.",
  statement: "A parity tree is (incorrectly) built as a linear chain of 4 XOR gates, each with 1.2 ns delay. What is the worst-case propagation delay from the first input to the output in ns?",
  kind: "answer", answer: "4.8", tolerance: 0.01,
  solution: "4 * 1.2 = 4.8 ns. A balanced tree would give ceil(log2) depth instead of linear depth — depth, not gate count, sets delay."
},
{
  id: "rtl-171", track: "silicon", branch: "Computer Architecture",
  title: "Dynamic Power Estimate (1)", difficulty: "medium",
  tags: ["power", "CMOS", "energy"],
  summary: "P = a*C*V^2*f with real numbers; answer in mW.",
  statement: "A logic block has activity factor a = 0.25, total switched capacitance C = 8 pF, supply V = 1.1 V, and clock f = 800 MHz. Using P = a*C*V^2*f, what is the dynamic power in mW? Round to 3 decimals.",
  kind: "answer", answer: "1.936", tolerance: 0.01,
  solution: "P = 0.25 * 8e-12 * (1.1)^2 * 800e6 = 0.25 * 8e-12 * 1.21 * 8e8 = 1.936e-3 W = 1.936 mW."
},
{
  id: "rtl-172", track: "silicon", branch: "Computer Architecture",
  title: "Dynamic Power Estimate (2)", difficulty: "medium",
  tags: ["power", "CMOS", "energy"],
  summary: "Another P = a*C*V^2*f plug-in; answer in mW.",
  statement: "A clock tree has activity factor a = 0.1 (effective), capacitance C = 20 pF, V = 0.9 V, f = 1 GHz. Using P = a*C*V^2*f, what is the dynamic power in mW?",
  kind: "answer", answer: "1.62", tolerance: 0.01,
  solution: "P = 0.1 * 20e-12 * (0.9)^2 * 1e9 = 0.1 * 20e-12 * 0.81 * 1e9 = 1.62e-3 W = 1.62 mW."
},
{
  id: "rtl-173", track: "silicon", branch: "Computer Architecture",
  title: "Voltage Scaling and Power", difficulty: "medium",
  tags: ["power", "DVFS", "CMOS"],
  summary: "Drop V from 1.2 to 0.9 at fixed f: what percent of dynamic power remains?",
  statement: "A block runs at fixed frequency and activity. The supply is reduced from 1.2 V to 0.9 V. Using P proportional to V^2, what percentage of the original dynamic power remains? Round to 2 decimals.",
  kind: "answer", answer: "56.25", tolerance: 0.01,
  solution: "P2/P1 = (0.9/1.2)^2 = (0.75)^2 = 0.5625 = 56.25%. The quadratic voltage dependence is why DVFS is the strongest power lever — though in practice f must also drop at lower V."
},
{
  id: "rtl-174", track: "silicon", branch: "CDC & Timing",
  title: "Max Frequency with Jitter", difficulty: "medium",
  tags: ["fmax", "jitter", "STA"],
  summary: "Add clock jitter to the period budget, then invert.",
  statement: "A critical path has tco = 1.1 ns, tcomb = 3.8 ns, tsu = 0.7 ns. Clock jitter (uncertainty) is 0.4 ns, and skew is +0.2 ns (capture clock later). What is the maximum clock frequency in MHz? Round to 2 decimals.",
  kind: "answer", answer: "172.41", tolerance: 0.01,
  solution: "Tmin = tco + tcomb + tsu + jitter - skew = 1.1 + 3.8 + 0.7 + 0.4 - 0.2 = 5.8 ns. fmax = 1/(5.8e-9) = 172.41 MHz. Jitter eats directly into the period budget like extra setup time."
},
{
  id: "rtl-175", track: "silicon", branch: "RTL Design",
  title: "FIFO Depth: Slow Consumer", difficulty: "medium",
  tags: ["FIFO depth", "burst", "buffering"],
  summary: "100-word burst into a slower reader; size the buffer.",
  statement: "A producer writes a 100-word burst at 50 MHz; the consumer drains continuously at 40 MHz starting immediately. What minimum FIFO depth (in words) prevents overflow?",
  kind: "answer", answer: "20", tolerance: 0.01,
  solution: "Depth = burst * (1 - f_read/f_write) = 100 * (1 - 40/50) = 100 * 0.2 = 20 words. Check: burst lasts 2 us; 2 us * 40 MHz = 80 words drained; 100 - 80 = 20."
}

]);
