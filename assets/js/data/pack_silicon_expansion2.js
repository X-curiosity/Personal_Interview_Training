/* Silicon expansion pack 2: rtl-601..rtl-620 (10 Verilog + 10 numeric), X-strict testbenches. */
registerProblems([
 {
  "id": "rtl-601",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Priority-Encoded First Set Bit",
  "difficulty": "easy",
  "tags": [
   "combinational",
   "priority encoder"
  ],
  "summary": "Locate the least-significant asserted request.",
  "statement": "Implement first_set8 as combinational logic. For the 8-bit input req, valid is high when any bit is set and the 3-bit index is the number of the least-significant set bit. When req is zero, valid must be low and index must be zero.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module first_set8(input wire [7:0] req,output reg valid,output reg [2:0] index);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb; reg[7:0] r; wire v; wire[2:0] i; first_set8 dut(r,v,i); initial begin r=0;#1;if(v||i!==0)$fatal(1,\"zero\");r=8'b10101000;#1;if(!v||i!==3)$fatal(1,\"priority\");r=8'h80;#1;if(!v||i!==7)$fatal(1,\"top\");r=8'hff;#1;if(i!==0)$fatal(1,\"bit zero\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Use a combinational casez ordered from req[0] through req[7], defaulting valid and index to zero."
 },
 {
  "id": "rtl-602",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Byte Lane Write Register",
  "difficulty": "hard",
  "tags": [
   "register",
   "byte enable"
  ],
  "summary": "Update selected bytes of a word independently.",
  "statement": "Implement byte_lane_reg with a 32-bit output q. A synchronous active-low reset clears q. On each rising edge, each asserted bit of 4-bit byte_en writes the corresponding byte of data into q; unselected bytes retain their values. Byte_en[0] controls q[7:0].",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module byte_lane_reg(input wire clk,input wire rst_n,input wire [3:0] byte_en,input wire [31:0] data,output reg [31:0] q);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg clk=0,rst_n=0;reg[3:0]be=0;reg[31:0]d=0;wire[31:0]q;byte_lane_reg dut(clk,rst_n,be,d,q);always #5 clk=~clk;initial begin repeat(2)@(posedge clk);rst_n<=1;be<=4'b0101;d<=32'hA1B2C3D4;@(posedge clk);#1;if(q!==32'h00B200D4)$fatal(1,\"first write\");be<=4'b1010;d<=32'h11223344;@(posedge clk);#1;if(q!==32'h11B233D4)$fatal(1,\"merge\");be<=0;d<=0;@(posedge clk);#1;if(q!==32'h11B233D4)$fatal(1,\"hold\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "In one clocked block clear q on reset; otherwise use four independent if statements assigning the four byte slices."
 },
 {
  "id": "rtl-603",
  "track": "silicon",
  "branch": "Verification",
  "title": "Consecutive Failure Alarm",
  "difficulty": "medium",
  "tags": [
   "monitor",
   "counter"
  ],
  "summary": "Raise an alarm after three failed checks in a row.",
  "statement": "Implement failure_alarm. On each rising edge with sample high, pass high clears the consecutive-failure count; pass low adds one. Assert sticky alarm upon the third consecutive sampled failure and hold it until synchronous active-low reset. Cycles with sample low do not affect the run.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module failure_alarm(input wire clk,input wire rst_n,input wire sample,input wire pass,output reg alarm);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "\nmodule tb;reg clk=0,rst_n=0,sample=0,pass=0;wire alarm;failure_alarm dut(clk,rst_n,sample,pass,alarm);always #5 clk=~clk;task take;input p;begin sample<=1;pass<=p;@(posedge clk);sample<=0;@(posedge clk);end endtask\ninitial begin repeat(2)@(posedge clk);rst_n<=1;take(0);take(0);#1;if(alarm!==1'b0)$fatal(1,\"early\");take(1);take(0);take(0);sample<=0;repeat(2)@(posedge clk);#1;if(alarm!==1'b0)$fatal(1,\"paused\");take(0);#1;if(alarm!==1'b1)$fatal(1,\"third\");take(1);#1;if(alarm!==1'b1)$fatal(1,\"sticky\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Store a two-bit run count. A sampled pass clears it; failures one and two increment it; failure three sets alarm."
 },
 {
  "id": "rtl-604",
  "track": "silicon",
  "branch": "Computer Architecture",
  "title": "Store Data Byte Replicator",
  "difficulty": "easy",
  "tags": [
   "load-store unit",
   "datapath"
  ],
  "summary": "Replicate narrow store operands across a bus.",
  "statement": "Implement store_replicate as combinational logic. Input size is 2'b00 for byte, 2'b01 for halfword, and 2'b10 for word. Output wdata must replicate data[7:0] four times for byte, data[15:0] twice for halfword, and pass all 32 bits for word. Reserved size 2'b11 produces zero.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module store_replicate(input wire [31:0] data,input wire [1:0] size,output reg [31:0] wdata);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg[31:0]d;reg[1:0]s;wire[31:0]w;store_replicate dut(d,s,w);initial begin d=32'h1234ABCD;s=0;#1;if(w!==32'hCDCDCDCD)$fatal(1,\"byte\");s=1;#1;if(w!==32'hABCDABCD)$fatal(1,\"half\");s=2;#1;if(w!==d)$fatal(1,\"word\");s=3;#1;if(w!==0)$fatal(1,\"reserved\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Use a combinational case on size and Verilog replication concatenations for byte and halfword."
 },
 {
  "id": "rtl-605",
  "track": "silicon",
  "branch": "Computer Architecture",
  "title": "Round-Robin Two-Way Arbiter",
  "difficulty": "hard",
  "tags": [
   "arbitration",
   "fairness"
  ],
  "summary": "Choose fairly between two persistent requesters.",
  "statement": "Implement rr_arb2 with combinational one-hot grants. With no requests grant neither; with one request grant it. When both request, grant the requester not granted on the previous contended cycle. After reset, requester 0 wins the first tie. Update the preference only on a clock edge where both requests are high. Reset is synchronous active-low.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module rr_arb2(input wire clk,input wire rst_n,input wire req0,input wire req1,output reg gnt0,output reg gnt1);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "\nmodule tb;reg clk=0,rst_n=0,r0=0,r1=0;wire g0,g1;rr_arb2 dut(clk,rst_n,r0,r1,g0,g1);always #5 clk=~clk;\ninitial begin repeat(2)@(posedge clk);rst_n<=1;r0<=1;r1<=1;#1;if(g0!==1'b1||g1!==1'b0)$fatal(1,\"first tie\");@(posedge clk);#1;if(g0!==1'b0||g1!==1'b1)$fatal(1,\"alternate\");@(posedge clk);#1;if(g0!==1'b1||g1!==1'b0)$fatal(1,\"alternate back\");r0<=0;#1;if(g0!==1'b0||g1!==1'b1)$fatal(1,\"single\");r0<=1;r1<=0;#1;if(g0!==1'b1||g1!==1'b0)$fatal(1,\"other single\");r1<=1;r0<=0;r1<=0;#1;if(g0!==1'b0||g1!==1'b0)$fatal(1,\"idle\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Keep a bit selecting the next tie winner, initialized to requester 0 and toggled only after a contended arbitration. Decode single-request cases independently."
 },
 {
  "id": "rtl-606",
  "track": "silicon",
  "branch": "CDC & Timing",
  "title": "Toggle Event Receiver",
  "difficulty": "hard",
  "tags": [
   "CDC",
   "pulse synchronization"
  ],
  "summary": "Recover source events encoded as toggle changes.",
  "statement": "Implement toggle_receiver in the destination clock domain. Pass async_toggle through two flip-flops, then compare the synchronized value with a delayed copy. Pulse pulse_event for exactly one destination cycle whenever the synchronized toggle changes. A synchronous active-low reset clears all state.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module toggle_receiver(input wire clk,input wire rst_n,input wire async_toggle,output reg pulse_event);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg clk=0,rst_n=0,t=0;wire e;integer hits=0;toggle_receiver dut(clk,rst_n,t,e);always #5 clk=~clk;always @(posedge clk)begin #1;if(e)hits=hits+1;end initial begin repeat(2)@(posedge clk);rst_n<=1;#3;t=1;repeat(5)@(posedge clk);if(hits!==1)$fatal(1,\"first\");#2;t=0;repeat(5)@(posedge clk);if(hits!==2)$fatal(1,\"second\");repeat(3)@(posedge clk);if(hits!==2)$fatal(1,\"width\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Register sync1, sync2, and sync2_d on each edge, and assign pulse_event from sync2 XOR sync2_d."
 },
 {
  "id": "rtl-607",
  "track": "silicon",
  "branch": "CDC & Timing",
  "title": "Minimum Pulse Width Filter",
  "difficulty": "medium",
  "tags": [
   "filter",
   "timing"
  ],
  "summary": "Reject input pulses shorter than two sampled cycles.",
  "statement": "Implement pulse_filter. The synchronous input noisy is sampled each rising edge. filtered becomes high only after noisy has been high on two consecutive edges, remains high while noisy remains high, and becomes low immediately on the first sampled low. Reset is synchronous active-low and clears the output and history.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module pulse_filter(input wire clk,input wire rst_n,input wire noisy,output reg filtered);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "\nmodule tb;reg clk=0,rst_n=0,n=0;wire f;pulse_filter dut(clk,rst_n,n,f);always #5 clk=~clk;\ninitial begin repeat(2)@(posedge clk);rst_n<=1;n<=1;@(posedge clk);n<=0;@(posedge clk);#1;if(f!==1'b0)$fatal(1,\"glitch\");n<=1;@(posedge clk);#1;if(f!==1'b0)$fatal(1,\"early\");@(posedge clk);#1;if(f!==1'b1)$fatal(1,\"qualified\");@(posedge clk);#1;if(f!==1'b1)$fatal(1,\"hold\");n<=0;@(posedge clk);#1;if(f!==1'b0)$fatal(1,\"release\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Remember the previous sample. Clear filtered on any low sample; on a high sample set it when the previous sample was also high."
 },
 {
  "id": "rtl-608",
  "track": "silicon",
  "branch": "Verification",
  "title": "Valid Stability Violation Monitor",
  "difficulty": "hard",
  "tags": [
   "protocol monitor",
   "stability"
  ],
  "summary": "Detect payload changes while backpressured.",
  "statement": "Implement stability_monitor for a ready/valid interface. If valid is high and ready is low, capture the 8-bit data at the start of the stall and assert sticky_error if data changes on any later stalled cycle. A transfer, an idle cycle, or reset ends the tracked stall. sticky_error persists until synchronous active-low reset.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module stability_monitor(input wire clk,input wire rst_n,input wire valid,input wire ready,input wire [7:0] data,output reg sticky_error);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "\nmodule tb;reg clk=0,rst_n=0,v=0,r=0;reg[7:0]d=0;wire e;stability_monitor dut(clk,rst_n,v,r,d,e);always #5 clk=~clk;\ninitial begin repeat(2)@(posedge clk);rst_n<=1;v<=1;r<=0;d<=8'h55;@(posedge clk);@(posedge clk);#1;if(e!==1'b0)$fatal(1,\"stable\");d<=8'h56;@(posedge clk);#1;if(e!==1'b1)$fatal(1,\"change\");v<=0;@(posedge clk);#1;if(e!==1'b1)$fatal(1,\"clear sticky\");v<=1;d<=8'h99;repeat(2)@(posedge clk);#1;if(e!==1'b1)$fatal(1,\"sticky\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Keep stalled and held_data registers. On the first valid&&!ready cycle capture data; on later such cycles compare it. Clear stalled whenever valid&&!ready is false."
 },
 {
  "id": "rtl-609",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Signed Clamp to Byte",
  "difficulty": "medium",
  "tags": [
   "signed arithmetic",
   "saturation"
  ],
  "summary": "Saturate a wide signed value to eight bits.",
  "statement": "Implement clamp8 as combinational logic. Interpret the 12-bit input x as two's-complement signed. Output x when it lies from -128 through 127 inclusive, output 8'sh7f above that range, and output 8'sh80 below it.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module clamp8(input wire signed [11:0] x,output reg signed [7:0] y);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg signed[11:0]x;wire signed[7:0]y;clamp8 dut(x,y);initial begin x=100;#1;if(y!==100)$fatal(1,\"inside\");x=300;#1;if(y!==8'sh7f)$fatal(1,\"high\");x=-400;#1;if(y!==8'sh80)$fatal(1,\"low\");x=-128;#1;if(y!==8'sh80)$fatal(1,\"edge low\");x=127;#1;if(y!==8'sh7f)$fatal(1,\"edge high\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Use signed comparisons against 12'sd127 and -12'sd128, otherwise select x[7:0]."
 },
 {
  "id": "rtl-610",
  "track": "silicon",
  "branch": "Computer Architecture",
  "title": "Pipeline Flushable Valid Bits",
  "difficulty": "hard",
  "tags": [
   "pipeline",
   "flush"
  ],
  "summary": "Track instruction validity through a short pipeline.",
  "statement": "Implement valid_pipe4 with a four-stage valid vector. On each rising edge, synchronous active-low reset or flush clears all stages. Otherwise shift in_valid into stage 0 and shift older validity toward stage 3. stall has lower priority than flush and holds every stage unchanged. out_valid reflects stage 3.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module valid_pipe4(input wire clk,input wire rst_n,input wire flush,input wire stall,input wire in_valid,output wire out_valid);\n  // TODO\nendmodule\n"
  },
  "tests": {
   "verilog": "\nmodule tb;reg clk=0,rst_n=0,flush=0,stall=0,iv=0;wire ov;valid_pipe4 dut(clk,rst_n,flush,stall,iv,ov);always #5 clk=~clk;\ninitial begin repeat(2)@(posedge clk);rst_n<=1;iv<=1;@(posedge clk);iv<=0;stall<=1;repeat(3)@(posedge clk);#1;if(ov!==1'b0)$fatal(1,\"advanced while stalled\");stall<=0;@(posedge clk);#1;if(ov!==1'b0)$fatal(1,\"too fast\");repeat(2)@(posedge clk);#1;if(ov!==1'b1)$fatal(1,\"latency\");flush<=1;stall<=1;@(posedge clk);#1;if(ov!==1'b0)$fatal(1,\"flush priority\");flush<=0;stall<=0;repeat(2)@(posedge clk);#1;if(ov!==1'b0)$fatal(1,\"cleared\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
  },
  "solution": "Store reg [3:0] valid. Clear it for reset or flush, retain it for stall, else assign {valid[2:0],in_valid}; out_valid is valid[3]."
 },
 {
  "id": "rtl-611",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Gray Code Transition Distance",
  "difficulty": "easy",
  "tags": [
   "Gray code",
   "Hamming distance"
  ],
  "summary": "Measure a valid adjacent Gray-code transition.",
  "statement": "A reflected Gray-code counter advances normally from one code word to the next. How many bits differ between any two adjacent code words? Enter the number.",
  "kind": "answer",
  "answer": "1",
  "tolerance": 0.01,
  "solution": "Adjacent reflected Gray-code words are constructed to differ in exactly one bit."
 },
 {
  "id": "rtl-612",
  "track": "silicon",
  "branch": "RTL Design",
  "title": "Decoder Output Count",
  "difficulty": "easy",
  "tags": [
   "decoder",
   "combinational logic"
  ],
  "summary": "Determine the width of a fully decoded output.",
  "statement": "A binary decoder has 7 input bits and one output for every possible input value. How many output lines does it have? Enter the integer.",
  "kind": "answer",
  "answer": "128",
  "tolerance": 0.01,
  "solution": "A 7-bit input has 2^7 = 128 distinct values, so a full decoder has 128 outputs."
 },
 {
  "id": "rtl-613",
  "track": "silicon",
  "branch": "Verification",
  "title": "Exhaustive Pairwise Stimulus Count",
  "difficulty": "easy",
  "tags": [
   "test planning",
   "stimulus"
  ],
  "summary": "Count all combinations of two small inputs.",
  "statement": "A combinational block has one 5-bit input and one 3-bit input. An exhaustive test applies every ordered pair of their values exactly once. How many test vectors are required?",
  "kind": "answer",
  "answer": "256",
  "tolerance": 0.01,
  "solution": "There are 2^5 times 2^3 = 2^8 = 256 ordered input combinations."
 },
 {
  "id": "rtl-614",
  "track": "silicon",
  "branch": "Verification",
  "title": "Fault Detection Percentage",
  "difficulty": "medium",
  "tags": [
   "coverage",
   "fault testing"
  ],
  "summary": "Compute detected-fault coverage.",
  "statement": "A campaign injects 240 distinct faults. Tests detect 222 of them. What fault coverage percentage is achieved? Enter the percentage without the percent sign.",
  "kind": "answer",
  "answer": "92.5",
  "tolerance": 0.01,
  "solution": "Coverage is 100 * 222 / 240 = 92.5 percent."
 },
 {
  "id": "rtl-615",
  "track": "silicon",
  "branch": "Verification",
  "title": "Cross Coverage Bin Product",
  "difficulty": "hard",
  "tags": [
   "functional coverage",
   "cross coverage"
  ],
  "summary": "Size a coverage cross after exclusions.",
  "statement": "A coverage cross combines 6 operation bins, 4 privilege bins, and 3 response bins. Nine cross combinations are declared illegal and therefore omitted. How many legal cross bins remain?",
  "kind": "answer",
  "answer": "63",
  "tolerance": 0.01,
  "solution": "The Cartesian product contains 6*4*3 = 72 bins; removing 9 illegal combinations leaves 63."
 },
 {
  "id": "rtl-616",
  "track": "silicon",
  "branch": "Computer Architecture",
  "title": "Set-Associative Cache Set Count",
  "difficulty": "medium",
  "tags": [
   "cache",
   "associativity"
  ],
  "summary": "Derive the number of cache sets.",
  "statement": "A 64 KiB cache uses 64-byte lines and is 8-way set associative. How many sets does the cache contain? Use 1 KiB = 1024 bytes.",
  "kind": "answer",
  "answer": "128",
  "tolerance": 0.01,
  "solution": "The cache has 65536/64 = 1024 lines, divided among 8 ways: 1024/8 = 128 sets."
 },
 {
  "id": "rtl-617",
  "track": "silicon",
  "branch": "Computer Architecture",
  "title": "Pipeline Throughput Completion Time",
  "difficulty": "hard",
  "tags": [
   "pipeline",
   "throughput"
  ],
  "summary": "Count cycles for a stream through a pipeline.",
  "statement": "A pipeline has latency 7 cycles and accepts one operation every cycle with no stalls. Counting from the edge that accepts the first operation through the edge that produces the last result, how many cycles elapse to process 50 operations? Use latency plus one cycle for each additional operation.",
  "kind": "answer",
  "answer": "56",
  "tolerance": 0.01,
  "solution": "The first result takes 7 cycles and the remaining 49 results arrive one per cycle, totaling 7+49 = 56 cycles."
 },
 {
  "id": "rtl-618",
  "track": "silicon",
  "branch": "Computer Architecture",
  "title": "Effective CPI with Miss Penalty",
  "difficulty": "medium",
  "tags": [
   "cache",
   "CPI"
  ],
  "summary": "Include cache misses in average cycles per instruction.",
  "statement": "A processor has base CPI 1.2. Each instruction performs one cache access; 4 percent of accesses miss and each miss adds 25 cycles. Assuming no overlap, what is the effective CPI?",
  "kind": "answer",
  "answer": "2.2",
  "tolerance": 0.01,
  "solution": "Miss cost per instruction is 0.04*25 = 1 cycle, so effective CPI is 1.2+1 = 2.2."
 },
 {
  "id": "rtl-619",
  "track": "silicon",
  "branch": "CDC & Timing",
  "title": "Clock Period from Frequency",
  "difficulty": "easy",
  "tags": [
   "clock",
   "period"
  ],
  "summary": "Convert clock frequency to period.",
  "statement": "What is the period in nanoseconds of a 400 MHz clock? Enter only the numeric value in nanoseconds.",
  "kind": "answer",
  "answer": "2.5",
  "tolerance": 0.01,
  "solution": "Period is 1/400 MHz = 2.5 ns."
 },
 {
  "id": "rtl-620",
  "track": "silicon",
  "branch": "CDC & Timing",
  "title": "Setup Slack with Skew",
  "difficulty": "hard",
  "tags": [
   "static timing",
   "setup slack"
  ],
  "summary": "Calculate setup slack including clock skew.",
  "statement": "A register path has a 4.0 ns clock period, 0.25 ns launch clock-to-Q, 2.70 ns maximum combinational delay, and 0.35 ns setup time. The capture clock arrives 0.10 ns later than the launch clock. Using setup slack = period + capture skew - clock-to-Q - combinational delay - setup, what is the slack in nanoseconds?",
  "kind": "answer",
  "answer": "0.8",
  "tolerance": 0.01,
  "solution": "Slack = 4.0 + 0.10 - 0.25 - 2.70 - 0.35 = 0.80 ns."
 }
]);
