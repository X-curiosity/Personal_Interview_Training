/* Silicon expansion: rtl-501 through rtl-537. */
registerProblems([
  {
    "id": "rtl-501",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Saturating Event Counter",
    "difficulty": "easy",
    "tags": [
      "counter",
      "saturation"
    ],
    "summary": "Count accepted events without wrapping.",
    "statement": "Implement sat_counter. On each rising edge with en high, increment count unless it is already 8’hFF. A synchronous active-low reset clears count. Saturation must persist until reset.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module sat_counter(input wire clk,input wire rst_n,input wire en,output reg [7:0] count);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,en=0; wire [7:0] count; integer i; sat_counter dut(clk,rst_n,en,count); always #5 clk=~clk;\ninitial begin repeat(2) @(posedge clk); rst_n<=1; en<=1; for(i=0;i<260;i=i+1) @(posedge clk); #1; if(count!==8'hff) $fatal(1,\"saturation\"); en=0; repeat(2) @(posedge clk); #1; if(count!==8'hff) $fatal(1,\"hold\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Use an 8-bit register; under reset assign zero, otherwise increment only when en && count != 8’hFF."
  },
  {
    "id": "rtl-502",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Loadable Down Counter",
    "difficulty": "easy",
    "tags": [
      "counter",
      "load"
    ],
    "summary": "Build a counter with load priority and a terminal flag.",
    "statement": "Implement down_counter with clk, synchronous active-low rst_n, load, 8-bit load_value, en, 8-bit count, and zero. Reset clears count. Load has priority over en. When enabled, a nonzero count decrements; zero holds. zero is combinationally true exactly when count is zero.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module down_counter(input wire clk,input wire rst_n,input wire load,input wire [7:0] load_value,input wire en,output reg [7:0] count,output wire zero);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,load=0,en=0; reg [7:0] load_value=0; wire [7:0] count; wire zero; down_counter dut(clk,rst_n,load,load_value,en,count,zero); always #5 clk=~clk;\ninitial begin repeat(2) @(posedge clk); rst_n<=1; load<=1; load_value<=3; @(posedge clk); load<=0; en<=1; repeat(3) @(posedge clk); #1; if(count!==0||!zero) $fatal(1,\"countdown\"); repeat(2) @(posedge clk); if(count!==0) $fatal(1,\"underflow\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Assign zero as count==0. In the clocked block implement reset, load, then guarded decrement in priority order."
  },
  {
    "id": "rtl-503",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "One-Cycle Request Acknowledger",
    "difficulty": "easy",
    "tags": [
      "handshake",
      "pulse"
    ],
    "summary": "Acknowledge a held request only once.",
    "statement": "Implement req_ack with clk, synchronous active-low rst_n, req, and registered ack. Pulse ack for one cycle on the first cycle of each new high interval of req. A request held high must not produce repeated acknowledgements; req must return low before rearming.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module req_ack(input wire clk,input wire rst_n,input wire req,output reg ack);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,req=0; wire ack; integer hits=0; req_ack dut(clk,rst_n,req,ack); always #5 clk=~clk; always @(posedge clk) begin #1; if(ack) hits=hits+1; end\ninitial begin repeat(2) @(posedge clk); rst_n<=1; req<=1; repeat(4) @(posedge clk); req<=0; repeat(2) @(posedge clk); req<=1; repeat(2) @(posedge clk); #2; if(hits!==2) $fatal(1,\"ack count\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Remember whether the current high interval was served. ack is req && !served; clear served when req is low."
  },
  {
    "id": "rtl-504",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Four-Entry Register File",
    "difficulty": "medium",
    "tags": [
      "register file",
      "decoder"
    ],
    "summary": "Create a small two-read, one-write register file.",
    "statement": "Implement regfile4x8 with clk, synchronous active-low rst_n, write enable/address/data, two 2-bit read addresses, and two 8-bit combinational read outputs. A write updates one register on the rising edge. Reset clears all four registers. Reads always reflect stored contents.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module regfile4x8(input wire clk,input wire rst_n,input wire we,input wire [1:0] waddr,input wire [7:0] wdata,input wire [1:0] raddr_a,input wire [1:0] raddr_b,output wire [7:0] rdata_a,output wire [7:0] rdata_b);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,we=0; reg [1:0] wa=0,ra=0,rb=0; reg [7:0] wd=0; wire [7:0] a,b; regfile4x8 dut(clk,rst_n,we,wa,wd,ra,rb,a,b); always #5 clk=~clk;\ninitial begin repeat(2) @(posedge clk); rst_n<=1; we<=1; wa<=2; wd<=8'hA6; @(posedge clk); we<=0; ra<=2; rb<=1; #2; if(a!==8'hA6||b!==0) $fatal(1,\"read\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Use reg [7:0] mem[0:3], clear it in a reset loop, write mem[waddr] when enabled, and continuously assign both read ports."
  },
  {
    "id": "rtl-505",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Signed Magnitude Absolute Value",
    "difficulty": "easy",
    "tags": [
      "combinational",
      "signed arithmetic"
    ],
    "summary": "Compute magnitude and flag the most-negative special case.",
    "statement": "Implement abs8 for an 8-bit two’s-complement input x. Output 8-bit magnitude and overflow. For negative x, magnitude is -x; otherwise it is x. Assert overflow only for x=8’h80, whose representable unsigned magnitude remains 8’h80. Logic is combinational.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module abs8(input wire [7:0] x,output wire [7:0] magnitude,output wire overflow);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg [7:0] x; wire [7:0] m; wire o; abs8 dut(x,m,o); initial begin x=8'hFB; #1; if(m!==5||o) $fatal(1,\"negative\"); x=8'h7f; #1; if(m!==8'h7f||o) $fatal(1,\"positive\"); x=8'h80; #1; if(m!==8'h80||!o) $fatal(1,\"limit\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Test x[7], select (~x)+1 for negative values, and decode 8’h80 for overflow."
  },
  {
    "id": "rtl-506",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Parity-Protected Byte Register",
    "difficulty": "medium",
    "tags": [
      "parity",
      "error detection"
    ],
    "summary": "Store a byte and detect a corrupted parity bit.",
    "statement": "Implement parity_reg with clk, synchronous active-low rst_n, load, 8-bit din, inject_error, 8-bit dout, and parity_error. On load store din and its even parity bit (^din). On any clock with inject_error high, invert only the stored parity bit; load has priority. parity_error must continuously compare stored parity with ^dout.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module parity_reg(input wire clk,input wire rst_n,input wire load,input wire [7:0] din,input wire inject_error,output reg [7:0] dout,output wire parity_error);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,load=0,inject_error=0; reg [7:0] din=0; wire [7:0] dout; wire parity_error; parity_reg dut(clk,rst_n,load,din,inject_error,dout,parity_error); always #5 clk=~clk;\ninitial begin repeat(2) @(posedge clk); rst_n<=1; load<=1; din<=8'h37; @(posedge clk); load<=0; #1; if(parity_error) $fatal(1,\"clean\"); inject_error<=1; @(posedge clk); inject_error<=0; #1; if(!parity_error||dout!==8'h37) $fatal(1,\"detect\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Keep a parity register beside dout. On load assign ^din; on injection invert it. Compare it against ^dout."
  },
  {
    "id": "rtl-507",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Sequence Detector 1011",
    "difficulty": "medium",
    "tags": [
      "FSM",
      "sequence detector"
    ],
    "summary": "Detect overlapping occurrences of a serial pattern.",
    "statement": "Implement seq1011 with clk, synchronous active-low rst_n, serial input bit_in, and registered one-cycle detected. Process one input bit per clock and pulse when the suffix 1011 completes. Overlapping matches are required.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module seq1011(input wire clk,input wire rst_n,input wire bit_in,output reg detected);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,bit_in=0; wire detected; integer hits=0; reg [7:0] bits=8'b1011011; integer i; seq1011 dut(clk,rst_n,bit_in,detected); always #5 clk=~clk; always @(posedge clk) begin #1;if(detected)hits=hits+1;end\ninitial begin repeat(2) @(posedge clk); rst_n<=1; for(i=6;i>=0;i=i-1) begin bit_in<=bits[i]; @(posedge clk); end #2; if(hits!==2) $fatal(1,\"overlap\"); $display(\"ALL TESTS PASSED\"); $finish; end endmodule\n"
    },
    "solution": "Use states representing matched prefixes: none, 1, 10, 101. From state 101 and input 1 pulse detected and retain the suffix state for overlap."
  },
  {
    "id": "rtl-508",
    "track": "silicon",
    "branch": "Verification",
    "title": "Sticky Error Monitor",
    "difficulty": "easy",
    "tags": [
      "assertion monitor",
      "sticky flag"
    ],
    "summary": "Latch any protocol violation until explicitly cleared.",
    "statement": "Implement error_monitor with clk, synchronous active-low rst_n, clear, valid, ready, and sticky_error. A violation is valid high while ready is low. sticky_error sets on a violation and remains set. clear removes it unless a violation occurs in the same cycle, in which case setting has priority.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module error_monitor(input wire clk,input wire rst_n,input wire clear,input wire valid,input wire ready,output reg sticky_error);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,clear=0,valid=0,ready=1; wire e; error_monitor dut(clk,rst_n,clear,valid,ready,e); always #5 clk=~clk;\ninitial begin repeat(2) @(posedge clk); rst_n<=1; valid<=1; ready<=0; @(posedge clk); valid<=0; #1;if(!e)$fatal(1,\"set\"); clear<=1; @(posedge clk); clear<=0; #1;if(e)$fatal(1,\"clear\"); clear<=1;valid<=1;ready<=0;@(posedge clk);#1;if(!e)$fatal(1,\"priority\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "In priority order: reset clears, violation sets, otherwise clear clears. With no event retain the flag."
  },
  {
    "id": "rtl-509",
    "track": "silicon",
    "branch": "Verification",
    "title": "Transaction Latency Watchdog",
    "difficulty": "medium",
    "tags": [
      "watchdog",
      "verification"
    ],
    "summary": "Flag a response that takes too many cycles.",
    "statement": "Implement latency_watchdog parameterized by MAX_CYCLES=4. Inputs are clk, synchronous active-low rst_n, start, done; outputs busy and one-cycle timeout. start when idle begins timing. done while busy completes without timeout. If done has not arrived by MAX_CYCLES rising edges after start, pulse timeout and clear busy. Ignore start while busy.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module latency_watchdog #(parameter MAX_CYCLES=4)(input wire clk,input wire rst_n,input wire start,input wire done,output reg busy,output reg timeout);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,start=0,done=0; wire busy,timeout; integer hits=0; latency_watchdog #(.MAX_CYCLES(3)) dut(clk,rst_n,start,done,busy,timeout); always #5 clk=~clk; always @(posedge clk)begin #1;if(timeout)hits=hits+1;end\ninitial begin repeat(2)@(posedge clk);rst_n<=1;start<=1;@(posedge clk);start<=0;repeat(3)@(posedge clk);#2;if(hits!==1||busy)$fatal(1,\"timeout\");start<=1;@(posedge clk);start<=0;done<=1;@(posedge clk);done<=0;repeat(2)@(posedge clk);#2;if(hits!==1)$fatal(1,\"false timeout\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "Track elapsed edges with a counter while busy, default timeout low each cycle, and give done priority over expiration."
  },
  {
    "id": "rtl-510",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Two-Bit Branch Counter",
    "difficulty": "medium",
    "tags": [
      "branch prediction",
      "saturating counter"
    ],
    "summary": "Implement one classic prediction state machine.",
    "statement": "Implement branch_counter with clk, synchronous active-low rst_n, update, taken, and predict_taken. Use a 2-bit saturating state: 0 strongly not taken through 3 strongly taken. Reset to state 1. On update increment for taken or decrement for not taken, saturating at endpoints. Prediction is true in states 2 and 3.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module branch_counter(input wire clk,input wire rst_n,input wire update,input wire taken,output wire predict_taken);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb; reg clk=0,rst_n=0,update=0,taken=0; wire p; branch_counter dut(clk,rst_n,update,taken,p); always #5 clk=~clk;\ninitial begin repeat(2)@(posedge clk);rst_n<=1;#1;if(p)$fatal(1,\"reset\");update<=1;taken<=1;@(posedge clk);#1;if(!p)$fatal(1,\"taken\");taken<=0;repeat(3)@(posedge clk);#1;if(p)$fatal(1,\"saturate low\");taken<=1;repeat(5)@(posedge clk);#1;if(!p)$fatal(1,\"saturate high\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "Store a 2-bit state, compare against endpoints before increment/decrement, and assign prediction from the state MSB."
  },
  {
    "id": "rtl-511",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Direct-Mapped Cache Index Split",
    "difficulty": "easy",
    "tags": [
      "cache",
      "address decoding"
    ],
    "summary": "Split a small byte address into tag, index, and offset.",
    "statement": "Implement cache_split for a 16-bit byte address. The cache has 16 direct-mapped lines and 16 bytes per line. Output 8-bit tag, 4-bit index, and 4-bit offset using pure combinational wiring.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module cache_split(input wire [15:0] addr,output wire [7:0] tag,output wire [3:0] index,output wire [3:0] offset);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb;reg[15:0]a;wire[7:0]t;wire[3:0]i,o;cache_split dut(a,t,i,o);initial begin a=16'hABCD;#1;if(t!==8'hAB||i!==4'hC||o!==4'hD)$fatal(1,\"split\");a=16'h1230;#1;if(t!==8'h12||i!==3||o!==0)$fatal(1,\"split2\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "The low four bits are byte offset, the next four select one of 16 lines, and the upper eight are the tag."
  },
  {
    "id": "rtl-512",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Pipeline Valid Shift",
    "difficulty": "easy",
    "tags": [
      "pipeline",
      "valid bits"
    ],
    "summary": "Delay data and validity through three stages.",
    "statement": "Implement pipe3 with clk, synchronous active-low rst_n, in_valid, 8-bit in_data, out_valid, and 8-bit out_data. Every cycle shift data and valid through exactly three registered stages. Bubbles must propagate via valid bits. Reset clears all valid stages; data values during invalid cycles are irrelevant.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module pipe3(input wire clk,input wire rst_n,input wire in_valid,input wire [7:0] in_data,output wire out_valid,output wire [7:0] out_data);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb;reg clk=0,rst_n=0,v=0;reg[7:0]d=0;wire ov;wire[7:0]od;integer n=0;pipe3 dut(clk,rst_n,v,d,ov,od);always #5 clk=~clk;always @(posedge clk)begin #1;if(ov)begin n=n+1;if(od!==8'h5A)$fatal(1,\"data\");end end\ninitial begin repeat(2)@(posedge clk);rst_n<=1;v<=1;d<=8'h5A;@(posedge clk);v<=0;repeat(4)@(posedge clk);#2;if(n!==1)$fatal(1,\"valid\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "Use three data registers and a 3-bit valid shift register. Drive outputs from stage three."
  },
  {
    "id": "rtl-513",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Reset Deassertion Synchronizer",
    "difficulty": "medium",
    "tags": [
      "reset",
      "synchronizer"
    ],
    "summary": "Asynchronously assert but synchronously release a local reset.",
    "statement": "Implement reset_sync with clk, asynchronous active-low arst_n, and active-low srst_n. srst_n must go low immediately when arst_n goes low. After arst_n rises, srst_n may rise only after two rising clock edges. Use a two-flop synchronizer whose flops both have asynchronous clear.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module reset_sync(input wire clk,input wire arst_n,output wire srst_n);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb;reg clk=0,arst_n=0;wire srst_n;reset_sync dut(clk,arst_n,srst_n);always #5 clk=~clk;initial begin #2;if(srst_n!==0)$fatal(1,\"assert\");#5;arst_n=1;#2;if(srst_n!==0)$fatal(1,\"early\");@(posedge clk);#1;if(srst_n!==0)$fatal(1,\"one edge\");@(posedge clk);#1;if(srst_n!==1)$fatal(1,\"release\");#2;arst_n=0;#1;if(srst_n!==0)$fatal(1,\"async\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "Use a 2-bit shift register in always @(posedge clk or negedge arst_n); asynchronously clear it and otherwise shift in one. srst_n is the second bit."
  },
  {
    "id": "rtl-514",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Clock Enable Pulse Divider",
    "difficulty": "easy",
    "tags": [
      "clock enable",
      "counter"
    ],
    "summary": "Generate a periodic enable without creating a new clock.",
    "statement": "Implement tick_div parameterized by DIV=5 with clk, synchronous active-low rst_n, and registered tick. Pulse tick high for exactly one clock every DIV input clocks. The first pulse after reset occurs on the DIVth rising edge with rst_n high.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module tick_div #(parameter DIV=5)(input wire clk,input wire rst_n,output reg tick);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb;reg clk=0,rst_n=0;wire tick;integer c=0,h=0;tick_div #(.DIV(4)) dut(clk,rst_n,tick);always #5 clk=~clk;always @(posedge clk)begin #1;c=c+1;if(tick)begin h=h+1;if((c%4)!=0)$fatal(1,\"phase\");end end\ninitial begin repeat(2)@(posedge clk);c=0;rst_n<=1;repeat(12)@(posedge clk);#2;if(h!==3)$fatal(1,\"count\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "Count from zero through DIV-1. At the terminal count clear the counter and assert tick; default tick low otherwise."
  },
  {
    "id": "rtl-515",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Stable-Bus Qualification Filter",
    "difficulty": "hard",
    "tags": [
      "CDC",
      "qualification"
    ],
    "summary": "Accept a synchronized bus only after consecutive equal samples.",
    "statement": "Implement stable_bus with clk, synchronous active-low rst_n, asynchronous 4-bit async_data, 4-bit data_out, and one-cycle update. First pass every bit through two register stages. Update data_out and pulse update only after the second-stage value has been identical for three consecutive clock samples and differs from data_out. Reset clears all state.",
    "kind": "code",
    "languages": [
      "verilog"
    ],
    "starter": {
      "verilog": "module stable_bus(input wire clk,input wire rst_n,input wire [3:0] async_data,output reg [3:0] data_out,output reg update);\n  // TODO\nendmodule\n"
    },
    "tests": {
      "verilog": "\nmodule tb;reg clk=0,rst_n=0;reg[3:0]a=0;wire[3:0]d;wire u;integer h=0;stable_bus dut(clk,rst_n,a,d,u);always #5 clk=~clk;always @(posedge clk)begin #1;if(u)h=h+1;end\ninitial begin repeat(2)@(posedge clk);rst_n<=1;a<=4'h9;repeat(6)@(posedge clk);#2;if(d!==9||h!==1)$fatal(1,\"qualify\");a<=3;@(posedge clk);a<=9;repeat(5)@(posedge clk);#2;if(d!==9||h!==1)$fatal(1,\"glitch\");$display(\"ALL TESTS PASSED\");$finish;end endmodule\n"
    },
    "solution": "Synchronize into two 4-bit registers. Compare each second-stage sample with the previous sample, count equal runs, and commit only when the run reaches three and the value is new."
  },
  {
    "id": "rtl-516",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Minimum Width for a Modulo-1000 Counter",
    "difficulty": "easy",
    "tags": [
      "counter",
      "bit width"
    ],
    "summary": "Size a binary state register.",
    "statement": "What is the minimum number of flip-flops required to represent every count from 0 through 999?",
    "kind": "answer",
    "answer": "10",
    "tolerance": 0.01,
    "solution": "ceil(log2(1000)) = 10 because 2^9=512 and 2^10=1024."
  },
  {
    "id": "rtl-517",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Balanced Mux Tree Depth",
    "difficulty": "medium",
    "tags": [
      "multiplexer",
      "logic depth"
    ],
    "summary": "Find depth in a balanced selection network.",
    "statement": "A 64-to-1 mux is built only from 2-to-1 muxes as a balanced tree. How many mux levels lie on any input-to-output path?",
    "kind": "answer",
    "answer": "6",
    "tolerance": 0.01,
    "solution": "Each level halves 64 choices, so log2(64)=6 levels."
  },
  {
    "id": "rtl-518",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Register Bank Storage Bits",
    "difficulty": "easy",
    "tags": [
      "register file",
      "area"
    ],
    "summary": "Count storage bits in a register bank.",
    "statement": "A register bank contains 24 registers, each 40 bits wide. Ignoring parity and decode logic, how many storage bits does it contain?",
    "kind": "answer",
    "answer": "960",
    "tolerance": 0.01,
    "solution": "24 multiplied by 40 equals 960 bits."
  },
  {
    "id": "rtl-519",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "One-Hot State Register Cost",
    "difficulty": "easy",
    "tags": [
      "FSM",
      "one-hot"
    ],
    "summary": "Count state bits under one-hot encoding.",
    "statement": "How many state flip-flops are used by a strictly one-hot encoded FSM with 13 legal states?",
    "kind": "answer",
    "answer": "13",
    "tolerance": 0.01,
    "solution": "Strict one-hot encoding assigns one flip-flop to every legal state."
  },
  {
    "id": "rtl-520",
    "track": "silicon",
    "branch": "RTL Design",
    "title": "Adder Pipeline Throughput",
    "difficulty": "medium",
    "tags": [
      "pipeline",
      "throughput"
    ],
    "summary": "Distinguish throughput from latency.",
    "statement": "A fully pipelined adder has 5-cycle latency and accepts one operation each cycle at 400 MHz. What is its peak result rate in millions of results per second?",
    "kind": "answer",
    "answer": "400",
    "tolerance": 0.01,
    "solution": "After filling, one result emerges each 2.5 ns cycle, or 400 million per second."
  },
  {
    "id": "rtl-521",
    "track": "silicon",
    "branch": "Verification",
    "title": "Constrained Test Cartesian Count",
    "difficulty": "easy",
    "tags": [
      "coverage",
      "stimulus"
    ],
    "summary": "Count all combinations in a compact exhaustive test.",
    "statement": "A test exhaustively combines a 3-bit opcode, two privilege modes, and four response types. How many distinct combinations are there?",
    "kind": "answer",
    "answer": "64",
    "tolerance": 0.01,
    "solution": "There are 8 opcodes times 2 modes times 4 responses = 64."
  },
  {
    "id": "rtl-522",
    "track": "silicon",
    "branch": "Verification",
    "title": "Coverage Closure Remaining Bins",
    "difficulty": "easy",
    "tags": [
      "coverage",
      "metrics"
    ],
    "summary": "Translate coverage percentage into uncovered bins.",
    "statement": "A covergroup has 250 equally weighted bins and reports 92 percent bin coverage. How many bins remain uncovered?",
    "kind": "answer",
    "answer": "20",
    "tolerance": 0.01,
    "solution": "Eight percent of 250 is 20 uncovered bins."
  },
  {
    "id": "rtl-523",
    "track": "silicon",
    "branch": "Verification",
    "title": "Random Detection Confidence",
    "difficulty": "hard",
    "tags": [
      "probability",
      "verification"
    ],
    "summary": "Compute repeated-trial bug detection probability.",
    "statement": "Each independent random test detects a bug with probability 0.2. What is the probability, as a percentage, that at least one of 5 tests detects it? Round to two decimals.",
    "kind": "answer",
    "answer": "67.23",
    "tolerance": 0.01,
    "solution": "The miss probability is 0.8^5=0.32768, so detection is 1-0.32768=0.67232, or 67.232 percent."
  },
  {
    "id": "rtl-524",
    "track": "silicon",
    "branch": "Verification",
    "title": "Scoreboard Queue Peak",
    "difficulty": "medium",
    "tags": [
      "scoreboard",
      "transactions"
    ],
    "summary": "Track expected transactions through a trace.",
    "statement": "A scoreboard starts empty. It observes 7 requests, then 3 responses, then 5 requests, then 6 responses. What is the maximum number of outstanding expected transactions?",
    "kind": "answer",
    "answer": "9",
    "tolerance": 0.01,
    "solution": "Occupancy goes 0 to 7 to 4 to 9 to 3, so the peak is 9."
  },
  {
    "id": "rtl-525",
    "track": "silicon",
    "branch": "Verification",
    "title": "Assertion Sampling Count",
    "difficulty": "medium",
    "tags": [
      "assertions",
      "sampling"
    ],
    "summary": "Count enabled property evaluations.",
    "statement": "A property is sampled for 120 clock edges, but reset disables assertion sampling for the first 8 edges and a clock-enable disables 12 other edges. The disabled sets do not overlap. How many evaluations occur?",
    "kind": "answer",
    "answer": "100",
    "tolerance": 0.01,
    "solution": "Subtract all 20 distinct disabled edges from 120, yielding 100 evaluations."
  },
  {
    "id": "rtl-526",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Cache Byte Offset Bits",
    "difficulty": "easy",
    "tags": [
      "cache",
      "address fields"
    ],
    "summary": "Determine a cache address field width.",
    "statement": "A byte-addressed cache uses 128-byte cache lines. How many address bits select a byte within a line?",
    "kind": "answer",
    "answer": "7",
    "tolerance": 0.01,
    "solution": "log2(128)=7 offset bits."
  },
  {
    "id": "rtl-527",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Direct-Mapped Cache Index Bits",
    "difficulty": "easy",
    "tags": [
      "cache",
      "index"
    ],
    "summary": "Determine direct-mapped index width.",
    "statement": "A 32 KiB direct-mapped cache has 64-byte lines. How many index bits select a cache line?",
    "kind": "answer",
    "answer": "9",
    "tolerance": 0.01,
    "solution": "There are 32768/64=512 lines, requiring log2(512)=9 index bits."
  },
  {
    "id": "rtl-528",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Average Memory Access Time",
    "difficulty": "medium",
    "tags": [
      "cache",
      "latency"
    ],
    "summary": "Calculate average access latency.",
    "statement": "A cache hits 95 percent of accesses with 2 ns hit time. A miss adds a 60 ns penalty. What is average memory access time in ns?",
    "kind": "answer",
    "answer": "5",
    "tolerance": 0.01,
    "solution": "AMAT = 2 + 0.05*60 = 5 ns."
  },
  {
    "id": "rtl-529",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Pipeline Speedup with Stalls",
    "difficulty": "hard",
    "tags": [
      "pipeline",
      "CPI"
    ],
    "summary": "Compute speedup from CPI and clock period.",
    "statement": "An unpipelined processor takes 8 ns per instruction. A pipelined version has a 2 ns clock and average CPI of 1.25. What is the speedup? Give a numeric ratio.",
    "kind": "answer",
    "answer": "3.2",
    "tolerance": 0.01,
    "solution": "Pipelined time is 2*1.25=2.5 ns per instruction; 8/2.5=3.2."
  },
  {
    "id": "rtl-530",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "Branch Misprediction CPI",
    "difficulty": "medium",
    "tags": [
      "branch prediction",
      "CPI"
    ],
    "summary": "Find CPI impact of control hazards.",
    "statement": "A processor has base CPI 1.0. Branches are 20 percent of instructions, 8 percent are mispredicted, and each misprediction costs 5 cycles. What is total CPI?",
    "kind": "answer",
    "answer": "1.08",
    "tolerance": 0.01,
    "solution": "Added CPI is 0.20*0.08*5=0.08, giving 1.08."
  },
  {
    "id": "rtl-531",
    "track": "silicon",
    "branch": "Computer Architecture",
    "title": "DRAM Transfer Bandwidth",
    "difficulty": "medium",
    "tags": [
      "memory",
      "bandwidth"
    ],
    "summary": "Calculate ideal channel bandwidth.",
    "statement": "A memory channel transfers 16 bytes per clock at 1.6 GHz. Ignoring overhead, what is peak bandwidth in GB/s using decimal GB?",
    "kind": "answer",
    "answer": "25.6",
    "tolerance": 0.01,
    "solution": "16*1.6 billion bytes/s = 25.6 GB/s."
  },
  {
    "id": "rtl-532",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Two-Flop Synchronizer Latency",
    "difficulty": "easy",
    "tags": [
      "CDC",
      "synchronizer"
    ],
    "summary": "Express nominal synchronization latency in time.",
    "statement": "A two-flop synchronizer is clocked at 250 MHz. Ignoring phase uncertainty, what is its nominal two-cycle latency in ns?",
    "kind": "answer",
    "answer": "8",
    "tolerance": 0.01,
    "solution": "The period is 4 ns, and two cycles take 8 ns."
  },
  {
    "id": "rtl-533",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Setup Slack Calculation",
    "difficulty": "easy",
    "tags": [
      "timing",
      "setup"
    ],
    "summary": "Calculate setup slack from an explicit path budget.",
    "statement": "A path has a 5.0 ns clock period, 0.4 ns clock-to-Q, 3.7 ns combinational delay, and 0.3 ns setup time. Assume zero skew. What is setup slack in ns?",
    "kind": "answer",
    "answer": "0.6",
    "tolerance": 0.01,
    "solution": "Slack = 5.0 - 0.4 - 3.7 - 0.3 = 0.6 ns."
  },
  {
    "id": "rtl-534",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Hold Slack with Skew",
    "difficulty": "hard",
    "tags": [
      "timing",
      "hold"
    ],
    "summary": "Evaluate a minimum-delay hold check.",
    "statement": "For a hold check, clock-to-Q minimum is 0.12 ns, data-path minimum is 0.18 ns, hold time is 0.10 ns, and destination clock arrives 0.08 ns later than source clock. Using hold slack = clock-to-Q + data minimum - hold - positive skew, what is slack in ns?",
    "kind": "answer",
    "answer": "0.12",
    "tolerance": 0.01,
    "solution": "Slack = 0.12+0.18-0.10-0.08 = 0.12 ns."
  },
  {
    "id": "rtl-535",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Clock Frequency from Setup Path",
    "difficulty": "medium",
    "tags": [
      "timing",
      "frequency"
    ],
    "summary": "Convert minimum safe period to frequency.",
    "statement": "A register path has 0.5 ns clock-to-Q, 2.6 ns logic delay, 0.4 ns setup, and 0.5 ns uncertainty. What maximum clock frequency in MHz follows from this path? Round to two decimals.",
    "kind": "answer",
    "answer": "250",
    "tolerance": 0.01,
    "solution": "Required period is 4.0 ns, corresponding to 250 MHz."
  },
  {
    "id": "rtl-536",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Metastability Rate Improvement",
    "difficulty": "hard",
    "tags": [
      "metastability",
      "MTBF"
    ],
    "summary": "Apply an exponential reliability factor.",
    "statement": "Adding a synchronizer stage increases available resolution time by 1.5 ns. If the metastability time constant is 0.05 ns, by what multiplicative factor does MTBF improve, using exp(delta_time/tau)? Give the nearest integer.",
    "kind": "answer",
    "answer": "10686474581524",
    "tolerance": 0.01,
    "solution": "delta_time/tau=30, and exp(30)=10,686,474,581,524 approximately."
  },
  {
    "id": "rtl-537",
    "track": "silicon",
    "branch": "CDC & Timing",
    "title": "Asynchronous FIFO Capacity",
    "difficulty": "medium",
    "tags": [
      "CDC",
      "FIFO"
    ],
    "summary": "Relate address bits to FIFO storage.",
    "statement": "An asynchronous FIFO uses 6 address bits for storage indexing, plus one wrap bit in each pointer. How many data entries can the FIFO store?",
    "kind": "answer",
    "answer": "64",
    "tolerance": 0.01,
    "solution": "Six address bits select 2^6=64 entries; the extra pointer bit distinguishes wrap, not extra storage."
  }
]);
