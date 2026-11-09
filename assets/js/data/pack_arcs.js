/* Build arcs: five ordered systems (CPU simulator, edge detector, stack VM,
   HPC kernel suite, FPGA bring-up). Each step is a real module of the whole. */
registerProblems([
 {
  "id": "sys-901",
  "track": "systems",
  "branch": "Build: CPU Simulator",
  "title": "Instruction Decoder",
  "difficulty": "medium",
  "tags": [
   "project",
   "arc",
   "bit-manipulation",
   "rv32i"
  ],
  "summary": "Decode instruction fields and selected I-style immediates.",
  "statement": "You are building one RV32I-subset machine, one tested layer at a time. Step 1 supplies the next stable interface; later steps call this API directly, so keep every name and signature exact.\n\nContract\nImplement decoded_t exactly as shown and void decode_instr(uint32_t instr, decoded_t *out). Extract opcode [6:0], rd [11:7], funct3 [14:12], rs1 [19:15], rs2 [24:20], and funct7 [31:25]. For OP-IMM (0x13), LOAD (0x03), JALR (0x67), and BRANCH (0x63), imm is the sign-extended upper 12 bits. This project intentionally gives BRANCH this simple decoder immediate; execution later reconstructs the true B-format offset. Other opcodes set imm to zero.\n\nConstraints and representation\nThe simulator uses C11 fixed-width integers and must compile cleanly with -Wall -Wextra -Werror. Inputs are ordinary 32-bit instruction words or addresses in the fixed 4096-byte machine. Do not use undefined signed overflow; use unsigned arithmetic where wraparound is intended. Return codes and architectural invariants are part of the interface.\n\nWorked example\nFor 0xfff10093 (an ADDI-shaped word), opcode=0x13, rd=1, rs1=2, rs2=31, funct7=0x7f, and imm=-1.\n\nEdge cases\nHandle 0x00000000 and 0xffffffff, sign bit 11, and every field at its maximum. out is valid writable storage.\n\nSystem integration\nThe executor will use these fields to choose operands and operations. This is not an isolated exercise: preserve the API so your implementation can be copied into the next step and ultimately execute a complete program.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint32_t opcode, rd, funct3, rs1, rs2, funct7; int32_t imm; } decoded_t;\nvoid decode_instr(uint32_t instr, decoded_t *out) { (void)instr; memset(out, 0, sizeof *out); }"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\nvoid decode_instr(uint32_t,decoded_t*);int main(void){decoded_t d;decode_instr(0xfff10093,&d);if(d.opcode!=0x13||d.rd!=1||d.funct3||d.rs1!=2||d.rs2!=31||d.funct7!=127||d.imm!=-1){puts(\"decode failed\");return 1;}decode_instr(0xffffffff,&d);if(d.opcode!=127||d.rd!=31||d.funct3!=7||d.rs1!=31||d.rs2!=31||d.funct7!=127||d.imm!=0){puts(\"all ones failed\");return 2;}decode_instr(0,&d);if(d.opcode||d.rd||d.imm){puts(\"zero failed\");return 3;}decode_instr(0x80002003,&d);if(d.imm!=-2048){puts(\"negative immediate failed\");return 4;}puts(\"ALL TESTS PASSED\");return 0;}"
  },
  "hints": [
   "Mask before shifting fields so unrelated bits cannot leak in.",
   "Use uint32_t for architectural wraparound and convert deliberately.",
   "Test the smallest invariant first, then compose it with the prior layer."
  ],
  "solution": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint32_t opcode, rd, funct3, rs1, rs2, funct7; int32_t imm; } decoded_t;\nvoid decode_instr(uint32_t i, decoded_t *o){o->opcode=i&127;o->rd=(i>>7)&31;o->funct3=(i>>12)&7;o->rs1=(i>>15)&31;o->rs2=(i>>20)&31;o->funct7=i>>25;uint32_t op=o->opcode;if(op==0x13||op==3||op==0x67||op==0x63)o->imm=(int32_t)i>>20;else o->imm=0;}",
  "arc": {
   "id": "cpu-sim",
   "name": "Build a CPU simulator in C",
   "step": 1,
   "total": 5
  }
 },
 {
  "id": "sys-902",
  "track": "systems",
  "branch": "Build: CPU Simulator",
  "title": "ALU and Register File",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "alu",
   "registers"
  ],
  "summary": "Implement RV32 integer operations and the hard-wired zero register.",
  "statement": "You are building one RV32I-subset machine, one tested layer at a time. Step 2 supplies the next stable interface; later steps call this API directly, so keep every name and signature exact.\n\nContract\nDefine regfile_t with int32_t x[32] and uint32_t pc. alu_exec supports ADD/SUB at funct3 0 (funct7 0x20 selects SUB), SLL 1, signed SLT 2, XOR 4, SRL/SRA 5 (0x20 selects arithmetic), OR 6, AND 7; unknown funct3 returns zero. Shift by b & 31. write_reg ignores rd zero and always preserves x0=0.\n\nConstraints and representation\nThe simulator uses C11 fixed-width integers and must compile cleanly with -Wall -Wextra -Werror. Inputs are ordinary 32-bit instruction words or addresses in the fixed 4096-byte machine. Do not use undefined signed overflow; use unsigned arithmetic where wraparound is intended. Return codes and architectural invariants are part of the interface.\n\nWorked example\nalu_exec(5, 0x20, -8, 1) is -4, while funct7 zero yields logical 0x7ffffffc. ADD of INT32_MAX and 1 wraps to INT32_MIN.\n\nEdge cases\nAvoid signed-overflow UB, distinguish logical and arithmetic right shift, mask large shift counts, and reject writes to x0.\n\nSystem integration\nThe instruction executor will route decoded operands through this ALU and commit with write_reg. This is not an isolated exercise: preserve the API so your implementation can be copied into the next step and ultimately execute a complete program.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { int32_t x[32]; uint32_t pc; } regfile_t;\nint32_t alu_exec(uint32_t f,uint32_t f7,int32_t a,int32_t b){(void)f;(void)f7;(void)a;(void)b;return 0;}\nvoid write_reg(regfile_t*r,uint32_t d,int32_t v){(void)r;(void)d;(void)v;}"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\nint32_t alu_exec(uint32_t,uint32_t,int32_t,int32_t);void write_reg(regfile_t*,uint32_t,int32_t);int main(void){regfile_t r={{0},0};if(alu_exec(0,0,INT32_MAX,1)!=INT32_MIN||alu_exec(0,0x20,3,5)!=-2||alu_exec(1,0,1,33)!=2||alu_exec(2,0,-1,1)!=1||alu_exec(5,0,-8,1)!=(int32_t)0x7ffffffc||alu_exec(5,0x20,-8,1)!=-4||alu_exec(4,0,5,3)!=6||alu_exec(6,0,4,3)!=7||alu_exec(7,0,7,3)!=3||alu_exec(3,0,1,2)!=0){puts(\"ALU failed\");return 1;}write_reg(&r,0,99);write_reg(&r,4,-7);if(r.x[0]!=0||r.x[4]!=-7){puts(\"register failed\");return 2;}puts(\"ALL TESTS PASSED\");return 0;}"
  },
  "hints": [
   "Mask before shifting fields so unrelated bits cannot leak in.",
   "Use uint32_t for architectural wraparound and convert deliberately.",
   "Test the smallest invariant first, then compose it with the prior layer."
  ],
  "solution": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { int32_t x[32]; uint32_t pc; } regfile_t;\nint32_t alu_exec(uint32_t f,uint32_t f7,int32_t a,int32_t b){uint32_t s=(uint32_t)b&31;switch(f){case 0:return f7==0x20?(int32_t)((uint32_t)a-(uint32_t)b):(int32_t)((uint32_t)a+(uint32_t)b);case 1:return(int32_t)((uint32_t)a<<s);case 2:return a<b;case 4:return a^b;case 5:return f7==0x20?a>>s:(int32_t)((uint32_t)a>>s);case 6:return a|b;case 7:return a&b;default:return 0;}}void write_reg(regfile_t*r,uint32_t d,int32_t v){if(d&&d<32)r->x[d]=v;r->x[0]=0;}",
  "arc": {
   "id": "cpu-sim",
   "name": "Build a CPU simulator in C",
   "step": 2,
   "total": 5
  }
 },
 {
  "id": "sys-903",
  "track": "systems",
  "branch": "Build: CPU Simulator",
  "title": "Byte-Addressable Memory",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "memory",
   "endianness"
  ],
  "summary": "Add checked little-endian byte, halfword, and word memory.",
  "statement": "You are building one RV32I-subset machine, one tested layer at a time. Step 3 supplies the next stable interface; later steps call this API directly, so keep every name and signature exact.\n\nContract\nDefine mem_t as 4096 bytes. mem_read and mem_write return 0 success, -1 out of range, -2 misaligned. funct3 0,1,2 means byte, halfword, word. Loads sign-extend byte and halfword; stores retain only the selected low bytes. Multi-byte accesses are little-endian and aligned to their size.\n\nConstraints and representation\nThe simulator uses C11 fixed-width integers and must compile cleanly with -Wall -Wextra -Werror. Inputs are ordinary 32-bit instruction words or addresses in the fixed 4096-byte machine. Do not use undefined signed overflow; use unsigned arithmetic where wraparound is intended. Return codes and architectural invariants are part of the interface.\n\nWorked example\nAfter storing 0x12345678 at address 0x10 as a word, bytes 0x10..0x13 are 78 56 34 12. Reading byte 0x80 returns -128.\n\nEdge cases\nAddress 4095 permits one byte but not a halfword; odd halfwords and non-multiple-of-four words fault. A narrow store must preserve neighbouring bytes.\n\nSystem integration\nLOAD and STORE in the executor will call this exact checked memory bus. This is not an isolated exercise: preserve the API so your implementation can be copied into the next step and ultimately execute a complete program.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint8_t mem[4096]; } mem_t;\nint mem_read(const mem_t*m,uint32_t a,uint32_t f,int32_t*o){(void)m;(void)a;(void)f;*o=0;return 0;}\nint mem_write(mem_t*m,uint32_t a,uint32_t f,int32_t v){(void)m;(void)a;(void)f;(void)v;return 0;}"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\nint mem_read(const mem_t*,uint32_t,uint32_t,int32_t*);int mem_write(mem_t*,uint32_t,uint32_t,int32_t);int main(void){mem_t m={{0}};int32_t v;m.mem[9]=0xaa;if(mem_write(&m,8,0,0x80)||m.mem[8]!=0x80||m.mem[9]!=0xaa||mem_read(&m,8,0,&v)||v!=-128){puts(\"byte failed\");return 1;}if(mem_write(&m,10,1,0x8000)||mem_read(&m,10,1,&v)||v!=-32768){puts(\"half failed\");return 2;}if(mem_write(&m,12,2,0x12345678)||m.mem[12]!=0x78||m.mem[15]!=0x12||mem_read(&m,12,2,&v)||v!=0x12345678){puts(\"word failed\");return 3;}if(mem_write(&m,4095,0,1)||mem_read(&m,4095,0,&v)||v!=1||mem_write(&m,4095,1,1)!=-1||mem_read(&m,3,1,&v)!=-2){puts(\"fault failed\");return 4;}puts(\"ALL TESTS PASSED\");return 0;}"
  },
  "hints": [
   "Mask before shifting fields so unrelated bits cannot leak in.",
   "Use uint32_t for architectural wraparound and convert deliberately.",
   "Test the smallest invariant first, then compose it with the prior layer."
  ],
  "solution": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint8_t mem[4096]; } mem_t;\nint mem_read(const mem_t*m,uint32_t a,uint32_t f,int32_t*o){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;uint32_t v=0;for(uint32_t i=0;i<n;i++)v|=(uint32_t)m->mem[a+i]<<(8*i);if(n==1)*o=(int8_t)v;else if(n==2)*o=(int16_t)v;else *o=(int32_t)v;return 0;}int mem_write(mem_t*m,uint32_t a,uint32_t f,int32_t v){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;for(uint32_t i=0;i<n;i++)m->mem[a+i]=(uint8_t)((uint32_t)v>>(8*i));return 0;}",
  "arc": {
   "id": "cpu-sim",
   "name": "Build a CPU simulator in C",
   "step": 3,
   "total": 5
  }
 },
 {
  "id": "sys-904",
  "track": "systems",
  "branch": "Build: CPU Simulator",
  "title": "Execute One Instruction",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "interpreter",
   "control-flow"
  ],
  "summary": "Fetch, decode, and execute the required RV32I subset.",
  "statement": "You are building one RV32I-subset machine, one tested layer at a time. Step 4 supplies the next stable interface; later steps call this API directly, so keep every name and signature exact.\n\nContract\nImplement step_instr(regfile_t *rf, mem_t *m): return 1 after an instruction, 0 only for 0x00000073 ECALL, and -1 for unsupported/faulting execution. Support OP, OP-IMM, LOAD, STORE, all six listed branches, JAL, JALR, LUI, and AUIPC. Reconstruct true B (13-bit) and J (21-bit) signed byte offsets; encoded low bit is zero. Links receive old pc+4, JALR clears target bit zero, and x0 remains zero.\n\nConstraints and representation\nThe simulator uses C11 fixed-width integers and must compile cleanly with -Wall -Wextra -Werror. Inputs are ordinary 32-bit instruction words or addresses in the fixed 4096-byte machine. Do not use undefined signed overflow; use unsigned arithmetic where wraparound is intended. Return codes and architectural invariants are part of the interface.\n\nWorked example\nAt pc 0x10, JAL x5,+8 writes 0x14 to x5 and sets pc=0x18. BEQ with encoded offset -8 branches from its own pc to pc-8.\n\nEdge cases\nTest taken and untaken signed/unsigned branches, negative immediates, memory faults, link registers, unsupported opcodes, and a complete sum 1..10 loop ending in ECALL.\n\nSystem integration\nThis is the CPU core: repeated calls now run real machine-code programs over the prior register and memory layers. This is not an isolated exercise: preserve the API so your implementation can be copied into the next step and ultimately execute a complete program.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\n/* Include your decoded_t, regfile_t, mem_t, decoder, ALU, and memory code from steps 1-3. */\ntypedef struct { uint32_t opcode, rd, funct3, rs1, rs2, funct7; int32_t imm; } decoded_t;\ntypedef struct { int32_t x[32]; uint32_t pc; } regfile_t;\ntypedef struct { uint8_t mem[4096]; } mem_t;\nint step_instr(regfile_t*rf,mem_t*m){(void)rf;(void)m;return -1;}"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\nint step_instr(regfile_t*,mem_t*);static void put(mem_t*m,uint32_t a,uint32_t w){memcpy(m->mem+a,&w,4);}static uint32_t I(int im,int rs,int f,int rd,int op){return((uint32_t)im&4095)<<20|rs<<15|f<<12|rd<<7|op;}static uint32_t R(int f7,int b,int a,int f,int d){return(uint32_t)f7<<25|b<<20|a<<15|f<<12|d<<7|0x33;}static uint32_t B(int z,int b,int a,int f){uint32_t u=(uint32_t)z;return((u>>12)&1)<<31|((u>>5)&63)<<25|b<<20|a<<15|f<<12|((u>>1)&15)<<8|((u>>11)&1)<<7|0x63;}int main(void){regfile_t r={{0},0};mem_t m={{0}};put(&m,0,I(10,0,0,1,0x13));put(&m,4,I(0,0,0,2,0x13));put(&m,8,R(0,1,2,0,2));put(&m,12,I(-1,1,0,1,0x13));put(&m,16,B(-8,0,1,1));put(&m,20,0x73);int q,n=0;while((q=step_instr(&r,&m))==1&&n++<100){}if(q||r.x[2]!=55){puts(\"loop failed\");return 1;}memset(&r,0,sizeof r);memset(&m,0,sizeof m);put(&m,0,I(64,0,0,1,0x13));put(&m,4,I(42,0,0,2,0x13));put(&m,8,2<<20|1<<15|2<<12|0x23);put(&m,12,I(0,1,2,3,3));put(&m,16,0x008002ef);put(&m,24,I(0,5,0,0,0x67));if(step_instr(&r,&m)!=1||step_instr(&r,&m)!=1||step_instr(&r,&m)!=1||step_instr(&r,&m)!=1||step_instr(&r,&m)!=1||r.x[3]!=42||r.pc!=24||r.x[5]!=20||step_instr(&r,&m)!=1||r.pc!=20||r.x[0]){puts(\"integration failed\");return 2;}puts(\"ALL TESTS PASSED\");return 0;}"
  },
  "hints": [
   "Mask before shifting fields so unrelated bits cannot leak in.",
   "Use uint32_t for architectural wraparound and convert deliberately.",
   "Test the smallest invariant first, then compose it with the prior layer."
  ],
  "solution": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint32_t opcode, rd, funct3, rs1, rs2, funct7; int32_t imm; } decoded_t;\ntypedef struct { int32_t x[32]; uint32_t pc; } regfile_t;\ntypedef struct { uint8_t mem[4096]; } mem_t;\nvoid decode_instr(uint32_t i, decoded_t *o){o->opcode=i&127;o->rd=(i>>7)&31;o->funct3=(i>>12)&7;o->rs1=(i>>15)&31;o->rs2=(i>>20)&31;o->funct7=i>>25;uint32_t op=o->opcode;if(op==0x13||op==3||op==0x67||op==0x63)o->imm=(int32_t)i>>20;else o->imm=0;}\nint32_t alu_exec(uint32_t f,uint32_t f7,int32_t a,int32_t b){uint32_t s=(uint32_t)b&31;switch(f){case 0:return f7==0x20?(int32_t)((uint32_t)a-(uint32_t)b):(int32_t)((uint32_t)a+(uint32_t)b);case 1:return(int32_t)((uint32_t)a<<s);case 2:return a<b;case 4:return a^b;case 5:return f7==0x20?a>>s:(int32_t)((uint32_t)a>>s);case 6:return a|b;case 7:return a&b;default:return 0;}}void write_reg(regfile_t*r,uint32_t d,int32_t v){if(d&&d<32)r->x[d]=v;r->x[0]=0;}\nint mem_read(const mem_t*m,uint32_t a,uint32_t f,int32_t*o){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;uint32_t v=0;for(uint32_t i=0;i<n;i++)v|=(uint32_t)m->mem[a+i]<<(8*i);if(n==1)*o=(int8_t)v;else if(n==2)*o=(int16_t)v;else *o=(int32_t)v;return 0;}int mem_write(mem_t*m,uint32_t a,uint32_t f,int32_t v){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;for(uint32_t i=0;i<n;i++)m->mem[a+i]=(uint8_t)((uint32_t)v>>(8*i));return 0;}\nstatic int32_t sx(uint32_t v,unsigned n){return(int32_t)(v<<(32-n))>>(32-n);}static uint32_t fetch(mem_t*m,uint32_t p){return(uint32_t)m->mem[p]|(uint32_t)m->mem[p+1]<<8|(uint32_t)m->mem[p+2]<<16|(uint32_t)m->mem[p+3]<<24;}int step_instr(regfile_t*r,mem_t*m){uint32_t p=r->pc;if(p>4092)return-1;uint32_t i=fetch(m,p),op=i&127,d=(i>>7)&31,f=(i>>12)&7,a=(i>>15)&31,b=(i>>20)&31,f7=i>>25,n=p+4;int32_t im=sx(i>>20,12),v=0;int ok=1;if(i==0x73)return 0;switch(op){case 0x33:v=alu_exec(f,f7,r->x[a],r->x[b]);write_reg(r,d,v);break;case 0x13:v=alu_exec(f,(f==5||f==1)?f7:0,r->x[a],im);write_reg(r,d,v);break;case 3:if(mem_read(m,(uint32_t)(r->x[a]+im),f,&v))return-1;write_reg(r,d,v);break;case 0x23:{int32_t z=sx(((i>>25)<<5)|d,12);if(mem_write(m,(uint32_t)(r->x[a]+z),f,r->x[b]))return-1;break;}case 0x63:{int32_t z=sx(((i>>31)<<12)|(((i>>7)&1)<<11)|(((i>>25)&63)<<5)|(((i>>8)&15)<<1),13);switch(f){case 0:ok=r->x[a]==r->x[b];break;case 1:ok=r->x[a]!=r->x[b];break;case 4:ok=r->x[a]<r->x[b];break;case 5:ok=r->x[a]>=r->x[b];break;case 6:ok=(uint32_t)r->x[a]<(uint32_t)r->x[b];break;case 7:ok=(uint32_t)r->x[a]>=(uint32_t)r->x[b];break;default:return-1;}if(ok)n=p+(uint32_t)z;break;}case 0x6f:{int32_t z=sx(((i>>31)<<20)|(((i>>12)&255)<<12)|(((i>>20)&1)<<11)|(((i>>21)&1023)<<1),21);write_reg(r,d,(int32_t)(p+4));n=p+(uint32_t)z;break;}case 0x67:write_reg(r,d,(int32_t)(p+4));n=((uint32_t)(r->x[a]+im))&~1u;break;case 0x37:write_reg(r,d,(int32_t)(i&0xfffff000));break;case 0x17:write_reg(r,d,(int32_t)(p+(i&0xfffff000)));break;default:return-1;}r->pc=n;r->x[0]=0;return 1;}",
  "arc": {
   "id": "cpu-sim",
   "name": "Build a CPU simulator in C",
   "step": 4,
   "total": 5
  }
 },
 {
  "id": "sys-905",
  "track": "systems",
  "branch": "Build: CPU Simulator",
  "title": "Cache, Cycles and the Finished Machine",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "cache",
   "performance"
  ],
  "summary": "Finish the machine with a direct-mapped data cache and cycle accounting.",
  "statement": "You are building one RV32I-subset machine, one tested layer at a time. Step 5 supplies the next stable interface; later steps call this API directly, so keep every name and signature exact.\n\nContract\nDefine dcache_t exactly. cache_reset clears tags, valid bits, hits, and misses. cache_access models 64 direct-mapped lines of 16 bytes: block=addr>>4, index=block&63, tag=block>>6; return 1 and count a hit only when valid tag matches, otherwise install and count a miss. run_program executes at most max_instr instructions, charging one cycle each plus eight for each LOAD/STORE cache miss. Halt returns cycles; fault or exhausting the guard returns zero. Instruction fetches never access this data cache.\n\nConstraints and representation\nThe simulator uses C11 fixed-width integers and must compile cleanly with -Wall -Wextra -Werror. Inputs are ordinary 32-bit instruction words or addresses in the fixed 4096-byte machine. Do not use undefined signed overflow; use unsigned arithmetic where wraparound is intended. Return codes and architectural invariants are part of the interface.\n\nWorked example\nAddresses 0x00 and 0x0f share a block: miss then hit. Address 0x400 maps to the same index with another tag and evicts it. A four-instruction program with two loads to one block costs 4 + 8 = 12 cycles.\n\nEdge cases\nReset all counters, distinguish block offset/index/tag, count an ECALL as an instruction, cache only effective data addresses, and return zero for JAL x0,0 when max_instr expires.\n\nSystem integration\nThe finished simulator can execute bounded programs and report a simple, reproducible performance metric. This is not an isolated exercise: preserve the API so your implementation can be copied into the next step and ultimately execute a complete program.",
  "kind": "code",
  "languages": [
   "c"
  ],
  "starter": {
   "c": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint32_t opcode, rd, funct3, rs1, rs2, funct7; int32_t imm; } decoded_t;\ntypedef struct { int32_t x[32]; uint32_t pc; } regfile_t;\ntypedef struct { uint8_t mem[4096]; } mem_t;\nvoid decode_instr(uint32_t i, decoded_t *o){o->opcode=i&127;o->rd=(i>>7)&31;o->funct3=(i>>12)&7;o->rs1=(i>>15)&31;o->rs2=(i>>20)&31;o->funct7=i>>25;uint32_t op=o->opcode;if(op==0x13||op==3||op==0x67||op==0x63)o->imm=(int32_t)i>>20;else o->imm=0;}\nint32_t alu_exec(uint32_t f,uint32_t f7,int32_t a,int32_t b){uint32_t s=(uint32_t)b&31;switch(f){case 0:return f7==0x20?(int32_t)((uint32_t)a-(uint32_t)b):(int32_t)((uint32_t)a+(uint32_t)b);case 1:return(int32_t)((uint32_t)a<<s);case 2:return a<b;case 4:return a^b;case 5:return f7==0x20?a>>s:(int32_t)((uint32_t)a>>s);case 6:return a|b;case 7:return a&b;default:return 0;}}void write_reg(regfile_t*r,uint32_t d,int32_t v){if(d&&d<32)r->x[d]=v;r->x[0]=0;}\nint mem_read(const mem_t*m,uint32_t a,uint32_t f,int32_t*o){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;uint32_t v=0;for(uint32_t i=0;i<n;i++)v|=(uint32_t)m->mem[a+i]<<(8*i);if(n==1)*o=(int8_t)v;else if(n==2)*o=(int16_t)v;else *o=(int32_t)v;return 0;}int mem_write(mem_t*m,uint32_t a,uint32_t f,int32_t v){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;for(uint32_t i=0;i<n;i++)m->mem[a+i]=(uint8_t)((uint32_t)v>>(8*i));return 0;}\nstatic int32_t sx(uint32_t v,unsigned n){return(int32_t)(v<<(32-n))>>(32-n);}static uint32_t fetch(mem_t*m,uint32_t p){return(uint32_t)m->mem[p]|(uint32_t)m->mem[p+1]<<8|(uint32_t)m->mem[p+2]<<16|(uint32_t)m->mem[p+3]<<24;}int step_instr(regfile_t*r,mem_t*m){uint32_t p=r->pc;if(p>4092)return-1;uint32_t i=fetch(m,p),op=i&127,d=(i>>7)&31,f=(i>>12)&7,a=(i>>15)&31,b=(i>>20)&31,f7=i>>25,n=p+4;int32_t im=sx(i>>20,12),v=0;int ok=1;if(i==0x73)return 0;switch(op){case 0x33:v=alu_exec(f,f7,r->x[a],r->x[b]);write_reg(r,d,v);break;case 0x13:v=alu_exec(f,(f==5||f==1)?f7:0,r->x[a],im);write_reg(r,d,v);break;case 3:if(mem_read(m,(uint32_t)(r->x[a]+im),f,&v))return-1;write_reg(r,d,v);break;case 0x23:{int32_t z=sx(((i>>25)<<5)|d,12);if(mem_write(m,(uint32_t)(r->x[a]+z),f,r->x[b]))return-1;break;}case 0x63:{int32_t z=sx(((i>>31)<<12)|(((i>>7)&1)<<11)|(((i>>25)&63)<<5)|(((i>>8)&15)<<1),13);switch(f){case 0:ok=r->x[a]==r->x[b];break;case 1:ok=r->x[a]!=r->x[b];break;case 4:ok=r->x[a]<r->x[b];break;case 5:ok=r->x[a]>=r->x[b];break;case 6:ok=(uint32_t)r->x[a]<(uint32_t)r->x[b];break;case 7:ok=(uint32_t)r->x[a]>=(uint32_t)r->x[b];break;default:return-1;}if(ok)n=p+(uint32_t)z;break;}case 0x6f:{int32_t z=sx(((i>>31)<<20)|(((i>>12)&255)<<12)|(((i>>20)&1)<<11)|(((i>>21)&1023)<<1),21);write_reg(r,d,(int32_t)(p+4));n=p+(uint32_t)z;break;}case 0x67:write_reg(r,d,(int32_t)(p+4));n=((uint32_t)(r->x[a]+im))&~1u;break;case 0x37:write_reg(r,d,(int32_t)(i&0xfffff000));break;case 0x17:write_reg(r,d,(int32_t)(p+(i&0xfffff000)));break;default:return-1;}r->pc=n;r->x[0]=0;return 1;}\ntypedef struct { uint32_t tag[64]; uint8_t valid[64]; uint32_t hits, misses; } dcache_t;\nvoid cache_reset(dcache_t*c){memset(c,0,sizeof *c);}\nint cache_access(dcache_t*c,uint32_t a){(void)c;(void)a;return 0;}\nuint64_t run_program(regfile_t*r,mem_t*m,dcache_t*c,uint32_t n){(void)r;(void)m;(void)c;(void)n;return 0;}"
  },
  "tests": {
   "c": "#include <stdio.h>\n#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\nint mem_write(mem_t*,uint32_t,uint32_t,int32_t);void cache_reset(dcache_t*);int cache_access(dcache_t*,uint32_t);uint64_t run_program(regfile_t*,mem_t*,dcache_t*,uint32_t);static void put(mem_t*m,uint32_t a,uint32_t w){memcpy(m->mem+a,&w,4);}static uint32_t I(int im,int rs,int f,int rd,int op){return((uint32_t)im&4095)<<20|rs<<15|f<<12|rd<<7|op;}int main(void){dcache_t c;cache_reset(&c);if(cache_access(&c,0)||!cache_access(&c,15)||cache_access(&c,1024)||cache_access(&c,0)||c.hits!=1||c.misses!=3){puts(\"cache failed\");return 1;}regfile_t r={{0},0};mem_t m={{0}};put(&m,0,I(64,0,0,1,0x13));put(&m,4,I(0,1,2,2,3));put(&m,8,I(0,1,2,3,3));put(&m,12,0x73);mem_write(&m,64,2,7);cache_reset(&c);uint64_t cy=run_program(&r,&m,&c,20);if(cy!=12||r.x[2]!=7||r.x[3]!=7||c.misses!=1||c.hits!=1){puts(\"cycles failed\");return 2;}memset(&r,0,sizeof r);memset(&m,0,sizeof m);put(&m,0,0x0000006f);cache_reset(&c);if(run_program(&r,&m,&c,5)!=0){puts(\"guard failed\");return 3;}puts(\"ALL TESTS PASSED\");return 0;}"
  },
  "hints": [
   "Mask before shifting fields so unrelated bits cannot leak in.",
   "Use uint32_t for architectural wraparound and convert deliberately.",
   "Test the smallest invariant first, then compose it with the prior layer."
  ],
  "solution": "#include <stdint.h>\n#include <stddef.h>\n#include <string.h>\n\ntypedef struct { uint32_t opcode, rd, funct3, rs1, rs2, funct7; int32_t imm; } decoded_t;\ntypedef struct { int32_t x[32]; uint32_t pc; } regfile_t;\ntypedef struct { uint8_t mem[4096]; } mem_t;\nint32_t alu_exec(uint32_t f,uint32_t f7,int32_t a,int32_t b){uint32_t s=(uint32_t)b&31;switch(f){case 0:return f7==0x20?(int32_t)((uint32_t)a-(uint32_t)b):(int32_t)((uint32_t)a+(uint32_t)b);case 1:return(int32_t)((uint32_t)a<<s);case 2:return a<b;case 4:return a^b;case 5:return f7==0x20?a>>s:(int32_t)((uint32_t)a>>s);case 6:return a|b;case 7:return a&b;default:return 0;}}void write_reg(regfile_t*r,uint32_t d,int32_t v){if(d&&d<32)r->x[d]=v;r->x[0]=0;}\nint mem_read(const mem_t*m,uint32_t a,uint32_t f,int32_t*o){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;uint32_t v=0;for(uint32_t i=0;i<n;i++)v|=(uint32_t)m->mem[a+i]<<(8*i);if(n==1)*o=(int8_t)v;else if(n==2)*o=(int16_t)v;else *o=(int32_t)v;return 0;}int mem_write(mem_t*m,uint32_t a,uint32_t f,int32_t v){uint32_t n=f==0?1:f==1?2:f==2?4:0;if(!n||a>4096-n)return-1;if(a&(n-1))return-2;for(uint32_t i=0;i<n;i++)m->mem[a+i]=(uint8_t)((uint32_t)v>>(8*i));return 0;}\nstatic int32_t sx(uint32_t v,unsigned n){return(int32_t)(v<<(32-n))>>(32-n);}static uint32_t fetch(mem_t*m,uint32_t p){return(uint32_t)m->mem[p]|(uint32_t)m->mem[p+1]<<8|(uint32_t)m->mem[p+2]<<16|(uint32_t)m->mem[p+3]<<24;}int step_instr(regfile_t*r,mem_t*m){uint32_t p=r->pc;if(p>4092)return-1;uint32_t i=fetch(m,p),op=i&127,d=(i>>7)&31,f=(i>>12)&7,a=(i>>15)&31,b=(i>>20)&31,f7=i>>25,n=p+4;int32_t im=sx(i>>20,12),v=0;int ok=1;if(i==0x73)return 0;switch(op){case 0x33:v=alu_exec(f,f7,r->x[a],r->x[b]);write_reg(r,d,v);break;case 0x13:v=alu_exec(f,(f==5||f==1)?f7:0,r->x[a],im);write_reg(r,d,v);break;case 3:if(mem_read(m,(uint32_t)(r->x[a]+im),f,&v))return-1;write_reg(r,d,v);break;case 0x23:{int32_t z=sx(((i>>25)<<5)|d,12);if(mem_write(m,(uint32_t)(r->x[a]+z),f,r->x[b]))return-1;break;}case 0x63:{int32_t z=sx(((i>>31)<<12)|(((i>>7)&1)<<11)|(((i>>25)&63)<<5)|(((i>>8)&15)<<1),13);switch(f){case 0:ok=r->x[a]==r->x[b];break;case 1:ok=r->x[a]!=r->x[b];break;case 4:ok=r->x[a]<r->x[b];break;case 5:ok=r->x[a]>=r->x[b];break;case 6:ok=(uint32_t)r->x[a]<(uint32_t)r->x[b];break;case 7:ok=(uint32_t)r->x[a]>=(uint32_t)r->x[b];break;default:return-1;}if(ok)n=p+(uint32_t)z;break;}case 0x6f:{int32_t z=sx(((i>>31)<<20)|(((i>>12)&255)<<12)|(((i>>20)&1)<<11)|(((i>>21)&1023)<<1),21);write_reg(r,d,(int32_t)(p+4));n=p+(uint32_t)z;break;}case 0x67:write_reg(r,d,(int32_t)(p+4));n=((uint32_t)(r->x[a]+im))&~1u;break;case 0x37:write_reg(r,d,(int32_t)(i&0xfffff000));break;case 0x17:write_reg(r,d,(int32_t)(p+(i&0xfffff000)));break;default:return-1;}r->pc=n;r->x[0]=0;return 1;}\ntypedef struct { uint32_t tag[64]; uint8_t valid[64]; uint32_t hits, misses; } dcache_t;void cache_reset(dcache_t*c){memset(c,0,sizeof *c);}int cache_access(dcache_t*c,uint32_t a){uint32_t b=a>>4,x=b&63,t=b>>6;if(c->valid[x]&&c->tag[x]==t){c->hits++;return 1;}c->valid[x]=1;c->tag[x]=t;c->misses++;return 0;}uint64_t run_program(regfile_t*r,mem_t*m,dcache_t*c,uint32_t max){uint64_t cy=0;for(uint32_t k=0;k<max;k++){uint32_t i=fetch(m,r->pc),op=i&127;uint32_t before=c->misses;if(op==3){int32_t im=sx(i>>20,12);cache_access(c,(uint32_t)(r->x[(i>>15)&31]+im));}else if(op==0x23){int32_t im=sx(((i>>25)<<5)|((i>>7)&31),12);cache_access(c,(uint32_t)(r->x[(i>>15)&31]+im));}int q=step_instr(r,m);cy+=1+8*(c->misses-before);if(q==0)return cy;if(q<0)return 0;}return 0;}",
  "arc": {
   "id": "cpu-sim",
   "name": "Build a CPU simulator in C",
   "step": 5,
   "total": 5
  }
 },
 {
  "id": "rtl-901",
  "track": "silicon",
  "branch": "Build: Vision Pipeline",
  "title": "RGB to Luma",
  "difficulty": "medium",
  "tags": [
   "verilog",
   "video",
   "fixed-point",
   "project",
   "arc"
  ],
  "summary": "Convert one RGB pixel per valid cycle to rounded BT.601-style luma.",
  "statement": "Implement **RGB to Luma**, one stage of a five-stage streaming FPGA vision ISP. Compute the exact unsigned fixed-point expression `y = (77*r + 150*g + 29*b + 128) >> 8`. The `+128` performs round-to-nearest before discarding eight fractional bits. The largest result fits in eight bits; preserve enough intermediate width.\n\nTiming contract: all state changes on the rising edge of `clk`. While `rst_n` is low, every output and validity register must be cleared. An input transfer occurs on a rising edge for which `in_valid` is high. Except where the final stage explicitly adds backpressure, the corresponding result must be registered and identified by `out_valid` exactly one clock later. Bubbles must propagate: if `in_valid` is low on a clock, `out_valid` must be low on the following cycle. Data presented while invalid is irrelevant. Use synthesizable Verilog/SystemVerilog accepted by `iverilog -g2012`; do not add or rename ports.\n\nConcrete example: pure red `(255,0,0)` produces 77, pure blue produces 29, and white produces 255. The checker uses X-strict comparisons (`!==`), so uninitialized or unknown outputs fail rather than accidentally matching. Reset is tested during activity; the reset cycle must cancel pending validity and leave deterministic zero outputs. Arithmetic widths and signedness are part of the contract: explicitly widen operands before addition, subtraction, or multiplication where necessary.\n\nEdge cases include consecutive valid samples, isolated bubbles, all-zero and maximum-valued data, and reset in the middle of a stream. It unlocks grayscale samples for the row-storage stage. This block is deliberately small enough to verify independently, but its port names and latency form a composition contract with later stages. The supplied testbench is authoritative and terminates with `$fatal(1, ...)` on any discrepancy.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module rgb2gray(input wire clk, rst_n, in_valid, input wire [7:0] r, g, b, output reg out_valid, output reg [7:0] y);\n  // TODO: implement this stage. Keep the port list exactly as given;\n  // this interface is what the next step of the build depends on.\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb; reg clk=0,rst_n=0,in_valid=0; reg[7:0]r,g,b; wire out_valid; wire[7:0]y; rgb2gray d(clk,rst_n,in_valid,r,g,b,out_valid,y); always #5 clk=~clk;\ntask send(input[7:0]rr,gg,bb, input[7:0]exp); begin @(negedge clk); in_valid=1;r=rr;g=gg;b=bb; @(posedge clk); #1; if(out_valid!==1||y!==exp)$fatal(1,\"pixel got v=%b y=%0d exp=%0d\",out_valid,y,exp); end endtask\ninitial begin repeat(2)@(posedge clk); rst_n=1; @(posedge clk); #1;if(out_valid!==0)$fatal(1,\"first valid\"); send(255,0,0,77); send(0,255,0,149); send(0,0,255,29); send(255,255,255,255); @(negedge clk);in_valid=0; @(posedge clk);#1;if(out_valid!==0)$fatal(1,\"bubble\"); @(negedge clk);in_valid=1;r=10;g=20;b=30;rst_n=0; @(posedge clk);#1;if(out_valid!==0||y!==0)$fatal(1,\"reset\"); rst_n=1;in_valid=0; @(posedge clk);#1;if(out_valid!==0)$fatal(1,\"post reset\");$display(\"ALL TESTS PASSED\");$finish;end \n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Use an intermediate at least 18 bits wide.",
   "Assign `out_valid <= in_valid` on every non-reset clock.",
   "Add 128 before shifting, not afterward."
  ],
  "solution": "module rgb2gray(input wire clk, rst_n, in_valid, input wire [7:0] r, g, b, output reg out_valid, output reg [7:0] y);\nreg [17:0] sum;\nalways @(posedge clk) begin\n if(!rst_n) begin out_valid<=0; y<=0; sum<=0; end\n else begin\n  out_valid<=in_valid;\n  if(in_valid) begin sum = 77*r + 150*g + 29*b + 128; y <= sum >> 8; end\n  else y<=0;\n end\nend\nendmodule",
  "arc": {
   "id": "vision-pipe",
   "name": "Build an edge detector in Verilog",
   "step": 1,
   "total": 5
  }
 },
 {
  "id": "rtl-902",
  "track": "silicon",
  "branch": "Build: Vision Pipeline",
  "title": "3x3 Line Buffer",
  "difficulty": "hard",
  "tags": [
   "verilog",
   "memory",
   "streaming",
   "project",
   "arc"
  ],
  "summary": "Turn a raster pixel stream into a rolling three-row neighborhood.",
  "statement": "Implement **3x3 Line Buffer**, one stage of a five-stage streaming FPGA vision ISP. Consume a contiguous, row-major 8\u00d78 raster (`localparam WIDTH=8`). Retain two prior rows and horizontal history. `p22` is the newest pixel; `p20..p22` are the current row, `p10..p12` the preceding row, and `p00..p02` the row before that. Suppress output for the first two complete rows. Thereafter assert one output for every accepted pixel (48 outputs total); at columns 0 and 1 the unavailable left samples are zero-filled. There is no end-of-frame flush.\n\nTiming contract: all state changes on the rising edge of `clk`. While `rst_n` is low, every output and validity register must be cleared. An input transfer occurs on a rising edge for which `in_valid` is high. Except where the final stage explicitly adds backpressure, the corresponding result must be registered and identified by `out_valid` exactly one clock later. Bubbles must propagate: if `in_valid` is low on a clock, `out_valid` must be low on the following cycle. Data presented while invalid is irrelevant. Use synthesizable Verilog/SystemVerilog accepted by `iverilog -g2012`; do not add or rename ports.\n\nConcrete example: for ramp pixels 0..63, the first complete horizontal window, on pixel 18, is rows `(0,1,2)`, `(8,9,10)`, `(16,17,18)`. The checker uses X-strict comparisons (`!==`), so uninitialized or unknown outputs fail rather than accidentally matching. Reset is tested during activity; the reset cycle must cancel pending validity and leave deterministic zero outputs. Arithmetic widths and signedness are part of the contract: explicitly widen operands before addition, subtraction, or multiplication where necessary.\n\nEdge cases include consecutive valid samples, isolated bubbles, all-zero and maximum-valued data, and reset in the middle of a stream. It unlocks the spatial neighborhood consumed by Sobel arithmetic. This block is deliberately small enough to verify independently, but its port names and latency form a composition contract with later stages. The supplied testbench is authoritative and terminates with `$fatal(1, ...)` on any discrepancy.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module linebuf3x3(input wire clk, rst_n, in_valid, input wire [7:0] pixel, output reg out_valid, output reg [7:0] p00,p01,p02,p10,p11,p12,p20,p21,p22);\n  // TODO: implement this stage. Keep the port list exactly as given;\n  // this interface is what the next step of the build depends on.\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg clk=0,rst_n=0,in_valid=0;reg[7:0]pixel;wire out_valid;wire[7:0]p00,p01,p02,p10,p11,p12,p20,p21,p22;linebuf3x3 d(clk,rst_n,in_valid,pixel,out_valid,p00,p01,p02,p10,p11,p12,p20,p21,p22);always #5 clk=~clk;integer n,c=0;\ninitial begin repeat(2)@(posedge clk);rst_n=1;for(n=0;n<64;n=n+1)begin @(negedge clk);in_valid=1;pixel=n;@(posedge clk);#1;if(out_valid)c=c+1;if(n==18)begin if(out_valid!==1||p00!==0||p01!==1||p02!==2||p10!==8||p11!==9||p12!==10||p20!==16||p21!==17||p22!==18)$fatal(1,\"first full window bad\");end end @(negedge clk);in_valid=0;@(posedge clk);#1;if(out_valid!==0)$fatal(1,\"flush\");if(c!==48)$fatal(1,\"count %0d\",c);@(negedge clk);rst_n=0;@(posedge clk);#1;if(out_valid!==0||p22!==0)$fatal(1,\"reset\");$display(\"ALL TESTS PASSED\");$finish;end \n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Use two arrays indexed by the raster column.",
   "Read old array values before scheduling nonblocking writes.",
   "Clear horizontal history at each row boundary."
  ],
  "solution": "module linebuf3x3(input wire clk, rst_n, in_valid, input wire [7:0] pixel, output reg out_valid, output reg [7:0] p00,p01,p02,p10,p11,p12,p20,p21,p22);\nlocalparam WIDTH=8; reg[7:0] mem0[0:WIDTH-1],mem1[0:WIDTH-1]; reg[7:0] h0a,h0b,h1a,h1b,h2a,h2b; integer col,row,i; reg[7:0] a,b;\nalways @(posedge clk) begin\n if(!rst_n) begin out_valid<=0;col<=0;row<=0;h0a<=0;h0b<=0;h1a<=0;h1b<=0;h2a<=0;h2b<=0;p00<=0;p01<=0;p02<=0;p10<=0;p11<=0;p12<=0;p20<=0;p21<=0;p22<=0;for(i=0;i<WIDTH;i=i+1)begin mem0[i]<=0;mem1[i]<=0;end end\n else begin out_valid<=0;if(in_valid)begin a=mem0[col];b=mem1[col];mem0[col]<=b;mem1[col]<=pixel;if(row>=2)begin out_valid<=1;p00<=h0a;p01<=h0b;p02<=a;p10<=h1a;p11<=h1b;p12<=b;p20<=h2a;p21<=h2b;p22<=pixel;end h0a<=h0b;h0b<=a;h1a<=h1b;h1b<=b;h2a<=h2b;h2b<=pixel;if(col==WIDTH-1)begin col<=0;row<=row+1;h0a<=0;h0b<=0;h1a<=0;h1b<=0;h2a<=0;h2b<=0;end else col<=col+1;end end\nend endmodule",
  "arc": {
   "id": "vision-pipe",
   "name": "Build an edge detector in Verilog",
   "step": 2,
   "total": 5
  }
 },
 {
  "id": "rtl-903",
  "track": "silicon",
  "branch": "Build: Vision Pipeline",
  "title": "Sobel X and Y",
  "difficulty": "hard",
  "tags": [
   "verilog",
   "sobel",
   "signed-arithmetic",
   "project",
   "arc"
  ],
  "summary": "Apply signed horizontal and vertical Sobel kernels to a 3\u00d73 window.",
  "statement": "Implement **Sobel X and Y**, one stage of a five-stage streaming FPGA vision ISP. Compute exactly `gx=(p02+2*p12+p22)-(p00+2*p10+p20)` and `gy=(p20+2*p21+p22)-(p00+2*p01+p02)`. Outputs are signed 11-bit values; the mathematical range is -1020 through +1020. Treat all pixels as unsigned magnitudes, widen them, then perform signed subtraction.\n\nTiming contract: all state changes on the rising edge of `clk`. While `rst_n` is low, every output and validity register must be cleared. An input transfer occurs on a rising edge for which `in_valid` is high. Except where the final stage explicitly adds backpressure, the corresponding result must be registered and identified by `out_valid` exactly one clock later. Bubbles must propagate: if `in_valid` is low on a clock, `out_valid` must be low on the following cycle. Data presented while invalid is irrelevant. Use synthesizable Verilog/SystemVerilog accepted by `iverilog -g2012`; do not add or rename ports.\n\nConcrete example: a vertical transition with all left-column pixels 0 and all right-column pixels 255 gives `gx=+1020, gy=0`; reversing it gives -1020. The checker uses X-strict comparisons (`!==`), so uninitialized or unknown outputs fail rather than accidentally matching. Reset is tested during activity; the reset cycle must cancel pending validity and leave deterministic zero outputs. Arithmetic widths and signedness are part of the contract: explicitly widen operands before addition, subtraction, or multiplication where necessary.\n\nEdge cases include consecutive valid samples, isolated bubbles, all-zero and maximum-valued data, and reset in the middle of a stream. It unlocks direction-independent edge magnitude. This block is deliberately small enough to verify independently, but its port names and latency form a composition contract with later stages. The supplied testbench is authoritative and terminates with `$fatal(1, ...)` on any discrepancy.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module sobel3x3(input wire clk,rst_n,in_valid,input wire[7:0]p00,p01,p02,p10,p11,p12,p20,p21,p22,output reg out_valid,output reg signed[10:0]gx,gy);\n  // TODO: implement this stage. Keep the port list exactly as given;\n  // this interface is what the next step of the build depends on.\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg clk=0,rst_n=0,in_valid=0;reg[7:0]p00,p01,p02,p10,p11,p12,p20,p21,p22;wire ov;wire signed[10:0]gx,gy;sobel3x3 d(clk,rst_n,in_valid,p00,p01,p02,p10,p11,p12,p20,p21,p22,ov,gx,gy);always #5 clk=~clk;\ntask go(input[7:0]a,b,c,d0,e,f,g,h,i,input signed[10:0]x,y);begin @(negedge clk);in_valid=1;p00=a;p01=b;p02=c;p10=d0;p11=e;p12=f;p20=g;p21=h;p22=i;@(posedge clk);#1;if(ov!==1||gx!==x||gy!==y)$fatal(1,\"got %0d,%0d exp %0d,%0d\",gx,gy,x,y);end endtask\ninitial begin repeat(2)@(posedge clk);rst_n=1;go(0,0,255,0,0,255,0,0,255,1020,0);go(255,255,0,255,0,0,255,255,0,-1020,0);go(42,42,42,42,42,42,42,42,42,0,0);go(0,0,0,0,0,0,255,255,255,0,1020);@(negedge clk);in_valid=0;@(posedge clk);#1;if(ov!==0)$fatal(1,\"bubble\");$display(\"ALL TESTS PASSED\");$finish;end \n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Zero-extend each pixel before casting it signed.",
   "The center pixel p11 has coefficient zero.",
   "Use a 12-bit temporary to avoid expression truncation."
  ],
  "solution": "module sobel3x3(input wire clk,rst_n,in_valid,input wire[7:0]p00,p01,p02,p10,p11,p12,p20,p21,p22,output reg out_valid,output reg signed[10:0]gx,gy);\nreg signed[11:0] sx,sy;\nalways @(posedge clk)begin if(!rst_n)begin out_valid<=0;gx<=0;gy<=0;end else begin out_valid<=in_valid;if(in_valid)begin sx=$signed({1'b0,p02})+($signed({1'b0,p12})<<<1)+$signed({1'b0,p22})-$signed({1'b0,p00})-($signed({1'b0,p10})<<<1)-$signed({1'b0,p20});sy=$signed({1'b0,p20})+($signed({1'b0,p21})<<<1)+$signed({1'b0,p22})-$signed({1'b0,p00})-($signed({1'b0,p01})<<<1)-$signed({1'b0,p02});gx<=sx;gy<=sy;end else begin gx<=0;gy<=0;end end end endmodule",
  "arc": {
   "id": "vision-pipe",
   "name": "Build an edge detector in Verilog",
   "step": 3,
   "total": 5
  }
 },
 {
  "id": "rtl-904",
  "track": "silicon",
  "branch": "Build: Vision Pipeline",
  "title": "Magnitude and Threshold",
  "difficulty": "hard",
  "tags": [
   "verilog",
   "saturation",
   "threshold",
   "project",
   "arc"
  ],
  "summary": "Convert signed Sobel gradients to a saturated L1 magnitude and one-bit edge.",
  "statement": "Implement **Magnitude and Threshold**, one stage of a five-stage streaming FPGA vision ISP. Take the 11-bit two\u2019s-complement absolute value of each gradient, add the magnitudes in a widened temporary, saturate the result to 2047, then set `edge_out` iff the saturated magnitude is strictly greater than `thresh`. Equality is not an edge. The one-bit decision and validity are registered.\n\nTiming contract: all state changes on the rising edge of `clk`. While `rst_n` is low, every output and validity register must be cleared. An input transfer occurs on a rising edge for which `in_valid` is high. Except where the final stage explicitly adds backpressure, the corresponding result must be registered and identified by `out_valid` exactly one clock later. Bubbles must propagate: if `in_valid` is low on a clock, `out_valid` must be low on the following cycle. Data presented while invalid is irrelevant. Use synthesizable Verilog/SystemVerilog accepted by `iverilog -g2012`; do not add or rename ports.\n\nConcrete example: `gx=-100, gy=50` has magnitude 150: threshold 149 produces edge 1, while threshold 150 produces edge 0. The checker uses X-strict comparisons (`!==`), so uninitialized or unknown outputs fail rather than accidentally matching. Reset is tested during activity; the reset cycle must cancel pending validity and leave deterministic zero outputs. Arithmetic widths and signedness are part of the contract: explicitly widen operands before addition, subtraction, or multiplication where necessary.\n\nEdge cases include consecutive valid samples, isolated bubbles, all-zero and maximum-valued data, and reset in the middle of a stream. It unlocks the binary edge decision used at the output of the integrated ISP. This block is deliberately small enough to verify independently, but its port names and latency form a composition contract with later stages. The supplied testbench is authoritative and terminates with `$fatal(1, ...)` on any discrepancy.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module sobel_thresh(input wire clk,rst_n,in_valid,input wire signed[10:0]gx,gy,input wire[10:0]thresh,output reg out_valid,output reg edge_out );\n  // TODO: implement this stage. Keep the port list exactly as given;\n  // this interface is what the next step of the build depends on.\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg clk=0,rst_n=0,in_valid=0;reg signed[10:0]gx,gy;reg[10:0]thresh;wire ov,edge_out ;sobel_thresh d(clk,rst_n,in_valid,gx,gy,thresh,ov,edge_out );always #5 clk=~clk;task go(input signed[10:0]x,y,input[10:0]t,input e);begin @(negedge clk);in_valid=1;gx=x;gy=y;thresh=t;@(posedge clk);#1;if(ov!==1||edge_out !==e)$fatal(1,\"bad x=%0d y=%0d t=%0d edge_out =%b\",x,y,t,edge_out );end endtask initial begin repeat(2)@(posedge clk);rst_n=1;go(-100,50,149,1);go(-100,50,150,0);go(1020,-1020,2039,1);go(1020,-1020,2040,0);@(negedge clk);in_valid=0;@(posedge clk);#1;if(ov!==0)$fatal(1,\"timing\");$display(\"ALL TESTS PASSED\");$finish;end \n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Two\u2019s-complement absolute value is `~x + 1`.",
   "Use 12 bits for the sum before saturation.",
   "The comparison is `>`, never `>=`."
  ],
  "solution": "module sobel_thresh(input wire clk,rst_n,in_valid,input wire signed[10:0]gx,gy,input wire[10:0]thresh,output reg out_valid,output reg edge_out );reg[10:0]ax,ay;reg[11:0]sum;always @(posedge clk)begin if(!rst_n)begin out_valid<=0;edge_out <=0;end else begin out_valid<=in_valid;if(in_valid)begin ax=gx[10]?(~gx+1'b1):gx;ay=gy[10]?(~gy+1'b1):gy;sum={1'b0,ax}+{1'b0,ay};edge_out <=((sum>2047?2047:sum)>thresh);end else edge_out <=0;end end endmodule",
  "arc": {
   "id": "vision-pipe",
   "name": "Build an edge detector in Verilog",
   "step": 4,
   "total": 5
  }
 },
 {
  "id": "rtl-905",
  "track": "silicon",
  "branch": "Build: Vision Pipeline",
  "title": "Integrated Edge Stream",
  "difficulty": "hard",
  "tags": [
   "verilog",
   "integration",
   "ready-valid",
   "project",
   "arc"
  ],
  "summary": "Compose grayscale, line buffering, Sobel, and threshold stages into a streaming edge ISP.",
  "statement": "Implement **Integrated Edge Stream**, one stage of a five-stage streaming FPGA vision ISP. Instantiate `rgb2gray`, `linebuf3x3`, `sobel3x3`, and `sobel_thresh` internally; do not duplicate their algorithms in the top level. The exact top interface is `edge_top(clk,rst_n,in_valid,in_ready,r,g,b,thresh,out_valid,out_ready,edge)`. Accept RGB only when `in_valid && in_ready`. A simple policy is permitted: deassert `in_ready` whenever the registered output is blocked, and callers need not present traffic while blocked. Hold `out_valid` and `edge_out` stable while `out_valid && !out_ready`. Pipeline the threshold alongside pixel data. The 8\u00d78 test image has a bright vertical band at columns 3\u20134 and threshold 100.\n\nTiming contract: all state changes on the rising edge of `clk`. While `rst_n` is low, every output and validity register must be cleared. An input transfer occurs on a rising edge for which `in_valid` is high. Except where the final stage explicitly adds backpressure, the corresponding result must be registered and identified by `out_valid` exactly one clock later. Bubbles must propagate: if `in_valid` is low on a clock, `out_valid` must be low on the following cycle. Data presented while invalid is irrelevant. Use synthesizable Verilog/SystemVerilog accepted by `iverilog -g2012`; do not add or rename ports.\n\nConcrete example: the Sobel support makes asserted edges at columns 3, 4, 5, and 6 around that two-pixel band; after draining, `out_valid` returns low. The checker uses X-strict comparisons (`!==`), so uninitialized or unknown outputs fail rather than accidentally matching. Reset is tested during activity; the reset cycle must cancel pending validity and leave deterministic zero outputs. Arithmetic widths and signedness are part of the contract: explicitly widen operands before addition, subtraction, or multiplication where necessary.\n\nEdge cases include consecutive valid samples, isolated bubbles, all-zero and maximum-valued data, and reset in the middle of a stream. It completes the reusable five-stage streaming edge detector. This block is deliberately small enough to verify independently, but its port names and latency form a composition contract with later stages. The supplied testbench is authoritative and terminates with `$fatal(1, ...)` on any discrepancy.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module edge_top(input wire clk,rst_n,in_valid,output wire in_ready,input wire[7:0]r,g,b,input wire[10:0]thresh,output reg out_valid,input wire out_ready,output reg edge_out );\n  // TODO: implement this stage. Keep the port list exactly as given;\n  // this interface is what the next step of the build depends on.\nendmodule\n"
  },
  "tests": {
   "verilog": "module tb;reg clk=0,rst_n=0,in_valid=0,out_ready=1;reg[7:0]r,g,b;reg[10:0]thresh=100;wire in_ready,out_valid,edge_out ;edge_top d(clk,rst_n,in_valid,in_ready,r,g,b,thresh,out_valid,out_ready,edge_out );always #5 clk=~clk;integer n,c=0,col,exp;initial begin repeat(3)@(posedge clk);rst_n=1;for(n=0;n<64;n=n+1)begin @(negedge clk);while(!in_ready)@(negedge clk);in_valid=1;if((n%8)>=3&&(n%8)<=4)begin r=255;g=255;b=255;end else begin r=0;g=0;b=0;end @(posedge clk);#1;if(out_valid)begin col=c%8;exp=(col==3||col==4||col==5||col==6);if(edge_out !==exp[0])$fatal(1,\"map c=%0d col=%0d edge_out =%b exp=%0d\",c,col,edge_out ,exp);c=c+1;end end @(negedge clk);in_valid=0;repeat(10)begin @(posedge clk);#1;if(out_valid)begin col=c%8;exp=(col==3||col==4||col==5||col==6);if(edge_out !==exp[0])$fatal(1,\"tail\");c=c+1;end end if(c!==48)$fatal(1,\"count %0d\",c);if(out_valid!==0)$fatal(1,\"valid stuck\");$display(\"ALL TESTS PASSED\");$finish;end \n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Instantiate the four prior modules verbatim.",
   "Delay threshold through registers to align it with gx/gy.",
   "An output register is elastic when it updates only if empty or ready."
  ],
  "solution": "module rgb2gray(input wire clk, rst_n, in_valid, input wire [7:0] r, g, b, output reg out_valid, output reg [7:0] y);\nreg [17:0] sum;\nalways @(posedge clk) begin\n if(!rst_n) begin out_valid<=0; y<=0; sum<=0; end\n else begin\n  out_valid<=in_valid;\n  if(in_valid) begin sum = 77*r + 150*g + 29*b + 128; y <= sum >> 8; end\n  else y<=0;\n end\nend\nendmodule\nmodule linebuf3x3(input wire clk, rst_n, in_valid, input wire [7:0] pixel, output reg out_valid, output reg [7:0] p00,p01,p02,p10,p11,p12,p20,p21,p22);\nlocalparam WIDTH=8; reg[7:0] mem0[0:WIDTH-1],mem1[0:WIDTH-1]; reg[7:0] h0a,h0b,h1a,h1b,h2a,h2b; integer col,row,i; reg[7:0] a,b;\nalways @(posedge clk) begin\n if(!rst_n) begin out_valid<=0;col<=0;row<=0;h0a<=0;h0b<=0;h1a<=0;h1b<=0;h2a<=0;h2b<=0;p00<=0;p01<=0;p02<=0;p10<=0;p11<=0;p12<=0;p20<=0;p21<=0;p22<=0;for(i=0;i<WIDTH;i=i+1)begin mem0[i]<=0;mem1[i]<=0;end end\n else begin out_valid<=0;if(in_valid)begin a=mem0[col];b=mem1[col];mem0[col]<=b;mem1[col]<=pixel;if(row>=2)begin out_valid<=1;p00<=h0a;p01<=h0b;p02<=a;p10<=h1a;p11<=h1b;p12<=b;p20<=h2a;p21<=h2b;p22<=pixel;end h0a<=h0b;h0b<=a;h1a<=h1b;h1b<=b;h2a<=h2b;h2b<=pixel;if(col==WIDTH-1)begin col<=0;row<=row+1;h0a<=0;h0b<=0;h1a<=0;h1b<=0;h2a<=0;h2b<=0;end else col<=col+1;end end\nend endmodule\nmodule sobel3x3(input wire clk,rst_n,in_valid,input wire[7:0]p00,p01,p02,p10,p11,p12,p20,p21,p22,output reg out_valid,output reg signed[10:0]gx,gy);\nreg signed[11:0] sx,sy;\nalways @(posedge clk)begin if(!rst_n)begin out_valid<=0;gx<=0;gy<=0;end else begin out_valid<=in_valid;if(in_valid)begin sx=$signed({1'b0,p02})+($signed({1'b0,p12})<<<1)+$signed({1'b0,p22})-$signed({1'b0,p00})-($signed({1'b0,p10})<<<1)-$signed({1'b0,p20});sy=$signed({1'b0,p20})+($signed({1'b0,p21})<<<1)+$signed({1'b0,p22})-$signed({1'b0,p00})-($signed({1'b0,p01})<<<1)-$signed({1'b0,p02});gx<=sx;gy<=sy;end else begin gx<=0;gy<=0;end end end endmodule\nmodule sobel_thresh(input wire clk,rst_n,in_valid,input wire signed[10:0]gx,gy,input wire[10:0]thresh,output reg out_valid,output reg edge_out );reg[10:0]ax,ay;reg[11:0]sum;always @(posedge clk)begin if(!rst_n)begin out_valid<=0;edge_out <=0;end else begin out_valid<=in_valid;if(in_valid)begin ax=gx[10]?(~gx+1'b1):gx;ay=gy[10]?(~gy+1'b1):gy;sum={1'b0,ax}+{1'b0,ay};edge_out <=((sum>2047?2047:sum)>thresh);end else edge_out <=0;end end endmodule\nmodule edge_top(input wire clk,rst_n,in_valid,output wire in_ready,input wire[7:0]r,g,b,input wire[10:0]thresh,output reg out_valid,input wire out_ready,output reg edge_out );\nwire v1,v2,v3,v4;wire[7:0]y,p00,p01,p02,p10,p11,p12,p20,p21,p22;wire signed[10:0]gx,gy;wire e4;reg[10:0]t1,t2,t3;assign in_ready=~out_valid|out_ready;\nrgb2gray a(clk,rst_n,in_valid&in_ready,r,g,b,v1,y);linebuf3x3 b0(clk,rst_n,v1,y,v2,p00,p01,p02,p10,p11,p12,p20,p21,p22);sobel3x3 c(clk,rst_n,v2,p00,p01,p02,p10,p11,p12,p20,p21,p22,v3,gx,gy);sobel_thresh d(clk,rst_n,v3,gx,gy,t3,v4,e4);\nalways@(posedge clk)begin if(!rst_n)begin t1<=0;t2<=0;t3<=0;out_valid<=0;edge_out <=0;end else begin if(in_valid&in_ready)t1<=thresh;if(v1)t2<=t1;if(v2)t3<=t2;if(out_ready|~out_valid)begin out_valid<=v4;edge_out <=e4;end end end endmodule",
  "arc": {
   "id": "vision-pipe",
   "name": "Build an edge detector in Verilog",
   "step": 5,
   "total": 5
  }
 },
 {
  "id": "py-911",
  "track": "python",
  "branch": "Build: Stack VM",
  "title": "Tokenizer",
  "difficulty": "medium",
  "tags": [
   "python",
   "interpreter",
   "project",
   "arc"
  ],
  "summary": "Turn source text into the stable token stream used by every later stage.",
  "statement": "This is step 1 of a five-part build. The shared language has integers, booleans, arithmetic, comparisons, unary minus, assignment, if/elif/else, while, def/return, calls, and parentheses. Every statement is parenthesized; a block is another pair of parentheses containing statements. This deliberate syntax avoids indentation tokens and lets each artifact feed the next step. Implement `tokenize(src) -> list[tuple[str, str]]`. Kinds are exactly `num`, `name`, `op`, `keyword`, and `eof`. Recognize nonnegative decimal integer literals and names beginning with a letter or underscore. Keywords are `if elif else while def return True False`. Operators are the single characters `+ - * / % ( ) < > = !` and the two-character forms `== != <= >= //`. Longest operator wins. Skip all whitespace and comments beginning with `#` through newline. Append exactly one `(\"eof\", \"\")`. Any other character raises `ValueError(\"unexpected character: X\")`; a lone `!` is still a valid operator token at this stage.\n\nComplete worked example: `x = 12 // 5 # floor\\nreturn x` produces `[('name','x'),('op','='),('num','12'),('op','//'),('num','5'),('keyword','return'),('name','x'),('eof','')]`. Notice that negative numbers are two tokens: `-2` becomes `('op','-'), ('num','2')`. Empty and comment-only input produce only EOF. Preserve token text exactly; do not convert numbers yet. This unlocks a parser that can report errors using original token spelling.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def tokenize(src):\n    raise NotImplementedError"
  },
  "tests": {
   "python": "assert tokenize(\"a+12 // 3\") == [(\"name\",\"a\"),(\"op\",\"+\"),(\"num\",\"12\"),(\"op\",\"//\"),(\"num\",\"3\"),(\"eof\",\"\")]\nassert tokenize(\"# hi\\nif True != False\") == [(\"keyword\",\"if\"),(\"keyword\",\"True\"),(\"op\",\"!=\"),(\"keyword\",\"False\"),(\"eof\",\"\")]\nassert tokenize(\"-2 <= x\")[:2] == [(\"op\",\"-\"),(\"num\",\"2\")]\ntry: tokenize(\"x,@\")\nexcept ValueError as e: assert str(e)==\"unexpected character: ,\"\nelse: assert False\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Scan with an index so two-character operators can be checked first.",
   "Consume maximal runs for numbers and identifiers.",
   "Always append EOF after the scan."
  ],
  "solution": "def tokenize(src):\n    out=[]; i=0; kws={\"if\",\"elif\",\"else\",\"while\",\"def\",\"return\",\"True\",\"False\"}\n    while i<len(src):\n        c=src[i]\n        if c.isspace(): i+=1; continue\n        if c=='#':\n            while i<len(src) and src[i]!='\\n': i+=1\n            continue\n        if c.isdigit():\n            j=i+1\n            while j<len(src) and src[j].isdigit(): j+=1\n            out.append((\"num\",src[i:j])); i=j; continue\n        if c.isalpha() or c=='_':\n            j=i+1\n            while j<len(src) and (src[j].isalnum() or src[j]=='_'): j+=1\n            text=src[i:j]; out.append((\"keyword\" if text in kws else \"name\",text)); i=j; continue\n        if i+1<len(src) and src[i:i+2] in (\"==\",\"!=\",\"<=\",\">=\",\"//\"):\n            out.append((\"op\",src[i:i+2])); i+=2; continue\n        if c in \"+-*/%()<>=!\": out.append((\"op\",c)); i+=1; continue\n        raise ValueError(\"unexpected character: \"+c)\n    out.append((\"eof\",\"\")); return out\n",
  "arc": {
   "id": "stack-vm",
   "name": "Build a stack VM in Python",
   "step": 1,
   "total": 5
  }
 },
 {
  "id": "py-912",
  "track": "python",
  "branch": "Build: Stack VM",
  "title": "Pratt Parser to AST",
  "difficulty": "hard",
  "tags": [
   "python",
   "interpreter",
   "project",
   "arc"
  ],
  "summary": "Parse the token stream into an exact tuple AST with precedence and structured statements.",
  "statement": "This is step 2 of a five-part build. The shared language has integers, booleans, arithmetic, comparisons, unary minus, assignment, if/elif/else, while, def/return, calls, and parentheses. Every statement is parenthesized; a block is another pair of parentheses containing statements. This deliberate syntax avoids indentation tokens and lets each artifact feed the next step. Implement `parse(tokens)`. Program input is a sequence of parenthesized statements and returns `(\"block\", [stmts])`. Exact nodes: `(\"num\",n)`, `(\"bool\",b)`, `(\"var\",name)`, `(\"bin\",op,left,right)`, `(\"un\",op,expr)`, `(\"assign\",name,expr)`, `(\"if\",[(cond,body),...],else_body_or_None)`, `(\"while\",cond,body)`, `(\"def\",name,[params],body)`, `(\"call\",name,[args])`, `(\"return\",expr_or_None)`, and `(\"block\",[stmts])`.\n\nGrammar examples are `(x = 1 + 2)`, `(return x)`, `(while (x < 3) ((x = x + 1)))`, and `(def add (a b) ((return a + b)))`. Calls use ordinary commas conceptually, but because comma is outside the tokenizer subset, this project uses whitespace-separated call arguments only when unambiguous; the required tests use zero or one argument, and multi-argument definitions may be called by nested unary helpers. Precedence low-to-high is right-associative assignment, non-associative comparisons, `+ -`, `* / // %`, unary `-`, call/parentheses. Assignment targets must be variables. `a < b < c` raises exactly `ValueError(\"chained comparison not supported\")`; all other syntax failures raise `ValueError(\"unexpected token: X\")`.\n\nWorked example: tokens for `(x = 1 + 2 * 3)` become `(\"block\",[(\"assign\",\"x\",(\"bin\",\"+\",(\"num\",1),(\"bin\",\"*\",(\"num\",2),(\"num\",3))))])`. This unlocks deterministic bytecode generation.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def parse(tokens):\n    raise NotImplementedError"
  },
  "tests": {
   "python": "a=parse(tokenize(\"(x = 1 + 2 * 3)(return -x)\"))\nassert a[0]==\"block\" and a[1][0][0]==\"assign\" and a[1][0][2][3][0]==\"bin\"\nassert parse(tokenize(\"(if (x < 2) ((return True)) else ((return False)))\"))[1][0][0]==\"if\"\ntry: parse(tokenize(\"(x = a < b < c)\"))\nexcept ValueError as e: assert str(e)==\"chained comparison not supported\"\nelse: assert False\ntry: parse(tokenize(\"(return +)\"))\nexcept ValueError as e: assert str(e)==\"unexpected token: +\"\nelse: assert False\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Use binding powers and parse the right side of assignment at the same power.",
   "Parse a block separately from a parenthesized expression.",
   "Remember whether the current expression already consumed a comparison."
  ],
  "solution": "def tokenize(src):\n    out=[]; i=0; kws={\"if\",\"elif\",\"else\",\"while\",\"def\",\"return\",\"True\",\"False\"}\n    while i<len(src):\n        c=src[i]\n        if c.isspace(): i+=1; continue\n        if c=='#':\n            while i<len(src) and src[i]!='\\n': i+=1\n            continue\n        if c.isdigit():\n            j=i+1\n            while j<len(src) and src[j].isdigit(): j+=1\n            out.append((\"num\",src[i:j])); i=j; continue\n        if c.isalpha() or c=='_':\n            j=i+1\n            while j<len(src) and (src[j].isalnum() or src[j]=='_'): j+=1\n            text=src[i:j]; out.append((\"keyword\" if text in kws else \"name\",text)); i=j; continue\n        if i+1<len(src) and src[i:i+2] in (\"==\",\"!=\",\"<=\",\">=\",\"//\"):\n            out.append((\"op\",src[i:i+2])); i+=2; continue\n        if c in \"+-*/%()<>=!\": out.append((\"op\",c)); i+=1; continue\n        raise ValueError(\"unexpected character: \"+c)\n    out.append((\"eof\",\"\")); return out\n\nclass _Parser:\n    def __init__(self,t): self.t=t; self.i=0\n    def cur(self): return self.t[self.i]\n    def take(self,text=None):\n        x=self.cur()\n        if text is not None and x[1]!=text: raise ValueError(\"unexpected token: \"+x[1])\n        self.i+=1; return x\n    def expr(self,minp=0):\n        k,x=self.take()\n        if k==\"num\": left=(\"num\",int(x))\n        elif x in (\"True\",\"False\"): left=(\"bool\",x==\"True\")\n        elif k==\"name\": left=(\"var\",x)\n        elif x=='-': left=(\"un\",\"-\",self.expr(50))\n        elif x=='(':\n            left=self.expr(); self.take(')')\n        else: raise ValueError(\"unexpected token: \"+x)\n        if left[0]=='var' and self.cur()[1]=='(':\n            self.take('('); args=[]\n            if self.cur()[1]!=')':\n                args.append(self.expr())\n                while self.cur()[1]==',': self.take(','); args.append(self.expr())\n            self.take(')'); left=(\"call\",left[1],args)\n        prec={'=':1,'==':2,'!=':2,'<':2,'<=':2,'>':2,'>=':2,'+':3,'-':3,'*':4,'/':4,'//':4,'%':4}\n        compared=False\n        while self.cur()[1] in prec and prec[self.cur()[1]]>=minp:\n            op=self.take()[1]; p=prec[op]\n            if p==2 and compared: raise ValueError(\"chained comparison not supported\")\n            if op=='=':\n                if left[0]!='var': raise ValueError(\"unexpected token: =\")\n                left=(\"assign\",left[1],self.expr(p)); continue\n            right=self.expr(p+1); left=(\"bin\",op,left,right)\n            if p==2: compared=True\n        return left\n    def block(self):\n        self.take('('); out=[]\n        while self.cur()[1]!=')': out.append(self.stmt())\n        self.take(')'); return (\"block\",out)\n    def stmt(self):\n        self.take('(')\n        if self.cur()[1]=='if':\n            self.take(); branches=[]; self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            while self.cur()[1]=='elif':\n                self.take(); self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            other=None\n            if self.cur()[1]=='else': self.take(); other=self.block()\n            node=(\"if\",branches,other)\n        elif self.cur()[1]=='while':\n            self.take(); self.take('('); c=self.expr(); self.take(')'); node=(\"while\",c,self.block())\n        elif self.cur()[1]=='def':\n            self.take(); name=self.take()[1]; self.take('('); ps=[]\n            while self.cur()[1]!=')':\n                ps.append(self.take()[1])\n            self.take(')'); node=(\"def\",name,ps,self.block())\n        elif self.cur()[1]=='return':\n            self.take(); node=(\"return\",None if self.cur()[1]==')' else self.expr())\n        else: node=self.expr()\n        self.take(')'); return node\n    def program(self):\n        out=[]\n        while self.cur()[0]!='eof': out.append(self.stmt())\n        return (\"block\",out)\n\ndef parse(tokens): return _Parser(tokens).program()\n",
  "arc": {
   "id": "stack-vm",
   "name": "Build a stack VM in Python",
   "step": 2,
   "total": 5
  }
 },
 {
  "id": "py-913",
  "track": "python",
  "branch": "Build: Stack VM",
  "title": "Bytecode Compiler",
  "difficulty": "hard",
  "tags": [
   "python",
   "interpreter",
   "project",
   "arc"
  ],
  "summary": "Lower exact AST tuples to resolved stack bytecode and absolute jumps.",
  "statement": "This is step 3 of a five-part build. The shared language has integers, booleans, arithmetic, comparisons, unary minus, assignment, if/elif/else, while, def/return, calls, and parentheses. Every statement is parenthesized; a block is another pair of parentheses containing statements. This deliberate syntax avoids indentation tokens and lets each artifact feed the next step. Implement `compile_ast(ast) -> list[tuple]`. Use these exact instructions: `PUSH value`, `LOAD name`, `STORE name` (pop, assign, then push the value), `BIN op`, `UN \"neg\"`, `JMP target`, `JZ target` (pop condition), `CALL name argc`, `RET \"none\"|\"value\"`, `FUNC name params_tuple`, and `HALT`. Targets are absolute instruction indexes. A function is emitted behind a `JMP`, begins with `FUNC`, and receives an implicit `RET none`. Always append one trailing `HALT`.\n\nCompile operands left-to-right. `if` emits a `JZ` around each body and a `JMP` to the common end; `while` jumps back to the condition. Calls push arguments in source order. Definitions execute no body at top level. Worked example, exact and normative: AST for `(x = 1 + 2)` compiles to `[('PUSH',1), ('PUSH',2), ('BIN','+'), ('STORE','x'), ('HALT',)]`. For `(while (x < 2) ((x = x + 1)))`, after an initial store, the condition target is the index of its first `LOAD`, and the `JZ` target is the first instruction after the backward `JMP`.\n\nReject unknown AST tags with `ValueError`; valid trees need no optimizer. Empty blocks compile to only HALT. This bytecode contract is consumed unchanged by both VM stages, so jump patching and STORE stack behavior are part of the public API.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def compile_ast(ast):\n    raise NotImplementedError"
  },
  "tests": {
   "python": "assert compile_ast(parse(tokenize(\"(x = 1 + 2)\"))) == [(\"PUSH\",1),(\"PUSH\",2),(\"BIN\",\"+\"),(\"STORE\",\"x\"),(\"HALT\",)]\nc=compile_ast(parse(tokenize(\"(x = 0)(while (x < 2) ((x = x + 1)))\")))\nassert c == [(\"PUSH\",0),(\"STORE\",\"x\"),(\"LOAD\",\"x\"),(\"PUSH\",2),(\"BIN\",\"<\"),(\"JZ\",11),(\"LOAD\",\"x\"),(\"PUSH\",1),(\"BIN\",\"+\"),(\"STORE\",\"x\"),(\"JMP\",2),(\"HALT\",)]\nf=compile_ast(parse(tokenize(\"(def one () ((return 1)))\")))\nassert f[0]==(\"JMP\",5) and f[1]==(\"FUNC\",\"one\",()) and f[-1]==(\"HALT\",)\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Emit placeholders for forward targets, then patch tuples.",
   "Compile STORE after its value so assignments remain expression-valued.",
   "A while loop records the condition index before compiling it."
  ],
  "solution": "def tokenize(src):\n    out=[]; i=0; kws={\"if\",\"elif\",\"else\",\"while\",\"def\",\"return\",\"True\",\"False\"}\n    while i<len(src):\n        c=src[i]\n        if c.isspace(): i+=1; continue\n        if c=='#':\n            while i<len(src) and src[i]!='\\n': i+=1\n            continue\n        if c.isdigit():\n            j=i+1\n            while j<len(src) and src[j].isdigit(): j+=1\n            out.append((\"num\",src[i:j])); i=j; continue\n        if c.isalpha() or c=='_':\n            j=i+1\n            while j<len(src) and (src[j].isalnum() or src[j]=='_'): j+=1\n            text=src[i:j]; out.append((\"keyword\" if text in kws else \"name\",text)); i=j; continue\n        if i+1<len(src) and src[i:i+2] in (\"==\",\"!=\",\"<=\",\">=\",\"//\"):\n            out.append((\"op\",src[i:i+2])); i+=2; continue\n        if c in \"+-*/%()<>=!\": out.append((\"op\",c)); i+=1; continue\n        raise ValueError(\"unexpected character: \"+c)\n    out.append((\"eof\",\"\")); return out\n\nclass _Parser:\n    def __init__(self,t): self.t=t; self.i=0\n    def cur(self): return self.t[self.i]\n    def take(self,text=None):\n        x=self.cur()\n        if text is not None and x[1]!=text: raise ValueError(\"unexpected token: \"+x[1])\n        self.i+=1; return x\n    def expr(self,minp=0):\n        k,x=self.take()\n        if k==\"num\": left=(\"num\",int(x))\n        elif x in (\"True\",\"False\"): left=(\"bool\",x==\"True\")\n        elif k==\"name\": left=(\"var\",x)\n        elif x=='-': left=(\"un\",\"-\",self.expr(50))\n        elif x=='(':\n            left=self.expr(); self.take(')')\n        else: raise ValueError(\"unexpected token: \"+x)\n        if left[0]=='var' and self.cur()[1]=='(':\n            self.take('('); args=[]\n            if self.cur()[1]!=')':\n                args.append(self.expr())\n                while self.cur()[1]==',': self.take(','); args.append(self.expr())\n            self.take(')'); left=(\"call\",left[1],args)\n        prec={'=':1,'==':2,'!=':2,'<':2,'<=':2,'>':2,'>=':2,'+':3,'-':3,'*':4,'/':4,'//':4,'%':4}\n        compared=False\n        while self.cur()[1] in prec and prec[self.cur()[1]]>=minp:\n            op=self.take()[1]; p=prec[op]\n            if p==2 and compared: raise ValueError(\"chained comparison not supported\")\n            if op=='=':\n                if left[0]!='var': raise ValueError(\"unexpected token: =\")\n                left=(\"assign\",left[1],self.expr(p)); continue\n            right=self.expr(p+1); left=(\"bin\",op,left,right)\n            if p==2: compared=True\n        return left\n    def block(self):\n        self.take('('); out=[]\n        while self.cur()[1]!=')': out.append(self.stmt())\n        self.take(')'); return (\"block\",out)\n    def stmt(self):\n        self.take('(')\n        if self.cur()[1]=='if':\n            self.take(); branches=[]; self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            while self.cur()[1]=='elif':\n                self.take(); self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            other=None\n            if self.cur()[1]=='else': self.take(); other=self.block()\n            node=(\"if\",branches,other)\n        elif self.cur()[1]=='while':\n            self.take(); self.take('('); c=self.expr(); self.take(')'); node=(\"while\",c,self.block())\n        elif self.cur()[1]=='def':\n            self.take(); name=self.take()[1]; self.take('('); ps=[]\n            while self.cur()[1]!=')':\n                ps.append(self.take()[1])\n            self.take(')'); node=(\"def\",name,ps,self.block())\n        elif self.cur()[1]=='return':\n            self.take(); node=(\"return\",None if self.cur()[1]==')' else self.expr())\n        else: node=self.expr()\n        self.take(')'); return node\n    def program(self):\n        out=[]\n        while self.cur()[0]!='eof': out.append(self.stmt())\n        return (\"block\",out)\n\ndef parse(tokens): return _Parser(tokens).program()\n\ndef compile_ast(ast):\n    code=[]\n    def emit(x): code.append(x); return len(code)-1\n    def patch(i,target): code[i]=code[i][:-1]+(target,)\n    def ex(n):\n        tag=n[0]\n        if tag=='num': emit((\"PUSH\",n[1]))\n        elif tag=='bool': emit((\"PUSH\",n[1]))\n        elif tag=='var': emit((\"LOAD\",n[1]))\n        elif tag=='un': ex(n[2]); emit((\"UN\",\"neg\"))\n        elif tag=='bin': ex(n[2]); ex(n[3]); emit((\"BIN\",n[1]))\n        elif tag=='assign': ex(n[2]); emit((\"STORE\",n[1]))\n        elif tag=='call':\n            for a in n[2]: ex(a)\n            emit((\"CALL\",n[1],len(n[2])))\n        else: raise ValueError(\"unexpected AST: \"+tag)\n    def st(n):\n        tag=n[0]\n        if tag=='block':\n            for q in n[1]: st(q)\n        elif tag in ('num','bool','var','un','bin','assign','call'): ex(n)\n        elif tag=='return':\n            if n[1] is None: emit((\"RET\",\"none\"))\n            else: ex(n[1]); emit((\"RET\",\"value\"))\n        elif tag=='while':\n            top=len(code); ex(n[1]); j=emit((\"JZ\",None)); st(n[2]); emit((\"JMP\",top)); patch(j,len(code))\n        elif tag=='if':\n            ends=[]\n            for cond,body in n[1]:\n                ex(cond); z=emit((\"JZ\",None)); st(body); ends.append(emit((\"JMP\",None))); patch(z,len(code))\n            if n[2] is not None: st(n[2])\n            end=len(code)\n            for j in ends: patch(j,end)\n        elif tag=='def':\n            skip=emit((\"JMP\",None)); emit((\"FUNC\",n[1],tuple(n[2]))); st(n[3]); emit((\"RET\",\"none\")); patch(skip,len(code))\n    st(ast); emit((\"HALT\",)); return code\n",
  "arc": {
   "id": "stack-vm",
   "name": "Build a stack VM in Python",
   "step": 3,
   "total": 5
  }
 },
 {
  "id": "py-914",
  "track": "python",
  "branch": "Build: Stack VM",
  "title": "VM Core",
  "difficulty": "hard",
  "tags": [
   "python",
   "interpreter",
   "project",
   "arc"
  ],
  "summary": "Execute stack bytecode, mutable variables, arithmetic, comparisons, and control flow.",
  "statement": "This is step 4 of a five-part build. The shared language has integers, booleans, arithmetic, comparisons, unary minus, assignment, if/elif/else, while, def/return, calls, and parentheses. Every statement is parenthesized; a block is another pair of parentheses containing statements. This deliberate syntax avoids indentation tokens and lets each artifact feed the next step. Implement `class VM` with `VM(bytecode)` and `run()`. The core executes `PUSH`, `LOAD`, `STORE`, `BIN`, `UN`, `JMP`, `JZ`, and `HALT`; it may also accept later-stage opcodes. Variables at this stage live in one dictionary. `LOAD x` missing from that dictionary raises exactly `RuntimeError(\"unbound variable: x\")`. Every required pop uses a checked helper and raises exactly `RuntimeError(\"stack underflow\")` on malformed bytecode. `JZ` pops and jumps when Python truth-testing says false.\n\nArithmetic uses Python semantics: `/` is true division, `//` floor division, `%` modulo; comparisons push booleans. `STORE` pops its input, records it as the latest expression value, then pushes it back, matching the compiler contract. `HALT` returns the latest value produced by PUSH, LOAD, STORE, BIN, or UN, or `None` if none exists. Worked trace for `PUSH 2; PUSH 3; BIN *; STORE x; HALT`: stack evolves `[] -> [2] -> [2,3] -> [6] -> [6]`, variables become `{x:6}`, and run returns `6`.\n\nJumps are absolute indexes and are trusted when in range. A count-to-ten loop can repeatedly load, compare, conditionally exit, increment, and jump backward. Division errors retain normal Python exception behavior. This unlocks replacing hand-authored bytecode with the assembled source pipeline.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "class VM:\n    def __init__(self, bytecode):\n        raise NotImplementedError\n    def run(self):\n        raise NotImplementedError"
  },
  "tests": {
   "python": "ops={\"+\":5,\"-\":-1,\"*\":6,\"/\":2/3,\"//\":0,\"%\":2,\"==\":False,\"!=\":True,\"<\":True,\"<=\":True,\">\":False,\">=\":False}\nfor op,want in ops.items(): assert VM([(\"PUSH\",2),(\"PUSH\",3),(\"BIN\",op),(\"HALT\",)]).run()==want\nloop=[(\"PUSH\",0),(\"STORE\",\"x\"),(\"LOAD\",\"x\"),(\"PUSH\",10),(\"BIN\",\"<\"),(\"JZ\",11),(\"LOAD\",\"x\"),(\"PUSH\",1),(\"BIN\",\"+\"),(\"STORE\",\"x\"),(\"JMP\",2),(\"LOAD\",\"x\"),(\"HALT\",)]\nassert VM(loop).run()==10\nfor code,msg in [([(\"LOAD\",\"x\"),(\"HALT\",)],\"unbound variable: x\"),([(\"BIN\",\"+\"),(\"HALT\",)],\"stack underflow\")]:\n try: VM(code).run(); assert False\n except RuntimeError as e: assert str(e)==msg\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Keep pc, stack, variables, and last value as separate state.",
   "Pop the right operand before the left operand.",
   "Do not implement JZ by peeking; it consumes its condition."
  ],
  "solution": "def tokenize(src):\n    out=[]; i=0; kws={\"if\",\"elif\",\"else\",\"while\",\"def\",\"return\",\"True\",\"False\"}\n    while i<len(src):\n        c=src[i]\n        if c.isspace(): i+=1; continue\n        if c=='#':\n            while i<len(src) and src[i]!='\\n': i+=1\n            continue\n        if c.isdigit():\n            j=i+1\n            while j<len(src) and src[j].isdigit(): j+=1\n            out.append((\"num\",src[i:j])); i=j; continue\n        if c.isalpha() or c=='_':\n            j=i+1\n            while j<len(src) and (src[j].isalnum() or src[j]=='_'): j+=1\n            text=src[i:j]; out.append((\"keyword\" if text in kws else \"name\",text)); i=j; continue\n        if i+1<len(src) and src[i:i+2] in (\"==\",\"!=\",\"<=\",\">=\",\"//\"):\n            out.append((\"op\",src[i:i+2])); i+=2; continue\n        if c in \"+-*/%()<>=!\": out.append((\"op\",c)); i+=1; continue\n        raise ValueError(\"unexpected character: \"+c)\n    out.append((\"eof\",\"\")); return out\n\nclass _Parser:\n    def __init__(self,t): self.t=t; self.i=0\n    def cur(self): return self.t[self.i]\n    def take(self,text=None):\n        x=self.cur()\n        if text is not None and x[1]!=text: raise ValueError(\"unexpected token: \"+x[1])\n        self.i+=1; return x\n    def expr(self,minp=0):\n        k,x=self.take()\n        if k==\"num\": left=(\"num\",int(x))\n        elif x in (\"True\",\"False\"): left=(\"bool\",x==\"True\")\n        elif k==\"name\": left=(\"var\",x)\n        elif x=='-': left=(\"un\",\"-\",self.expr(50))\n        elif x=='(':\n            left=self.expr(); self.take(')')\n        else: raise ValueError(\"unexpected token: \"+x)\n        if left[0]=='var' and self.cur()[1]=='(':\n            self.take('('); args=[]\n            if self.cur()[1]!=')':\n                args.append(self.expr())\n                while self.cur()[1]==',': self.take(','); args.append(self.expr())\n            self.take(')'); left=(\"call\",left[1],args)\n        prec={'=':1,'==':2,'!=':2,'<':2,'<=':2,'>':2,'>=':2,'+':3,'-':3,'*':4,'/':4,'//':4,'%':4}\n        compared=False\n        while self.cur()[1] in prec and prec[self.cur()[1]]>=minp:\n            op=self.take()[1]; p=prec[op]\n            if p==2 and compared: raise ValueError(\"chained comparison not supported\")\n            if op=='=':\n                if left[0]!='var': raise ValueError(\"unexpected token: =\")\n                left=(\"assign\",left[1],self.expr(p)); continue\n            right=self.expr(p+1); left=(\"bin\",op,left,right)\n            if p==2: compared=True\n        return left\n    def block(self):\n        self.take('('); out=[]\n        while self.cur()[1]!=')': out.append(self.stmt())\n        self.take(')'); return (\"block\",out)\n    def stmt(self):\n        self.take('(')\n        if self.cur()[1]=='if':\n            self.take(); branches=[]; self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            while self.cur()[1]=='elif':\n                self.take(); self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            other=None\n            if self.cur()[1]=='else': self.take(); other=self.block()\n            node=(\"if\",branches,other)\n        elif self.cur()[1]=='while':\n            self.take(); self.take('('); c=self.expr(); self.take(')'); node=(\"while\",c,self.block())\n        elif self.cur()[1]=='def':\n            self.take(); name=self.take()[1]; self.take('('); ps=[]\n            while self.cur()[1]!=')':\n                ps.append(self.take()[1])\n            self.take(')'); node=(\"def\",name,ps,self.block())\n        elif self.cur()[1]=='return':\n            self.take(); node=(\"return\",None if self.cur()[1]==')' else self.expr())\n        else: node=self.expr()\n        self.take(')'); return node\n    def program(self):\n        out=[]\n        while self.cur()[0]!='eof': out.append(self.stmt())\n        return (\"block\",out)\n\ndef parse(tokens): return _Parser(tokens).program()\n\ndef compile_ast(ast):\n    code=[]\n    def emit(x): code.append(x); return len(code)-1\n    def patch(i,target): code[i]=code[i][:-1]+(target,)\n    def ex(n):\n        tag=n[0]\n        if tag=='num': emit((\"PUSH\",n[1]))\n        elif tag=='bool': emit((\"PUSH\",n[1]))\n        elif tag=='var': emit((\"LOAD\",n[1]))\n        elif tag=='un': ex(n[2]); emit((\"UN\",\"neg\"))\n        elif tag=='bin': ex(n[2]); ex(n[3]); emit((\"BIN\",n[1]))\n        elif tag=='assign': ex(n[2]); emit((\"STORE\",n[1]))\n        elif tag=='call':\n            for a in n[2]: ex(a)\n            emit((\"CALL\",n[1],len(n[2])))\n        else: raise ValueError(\"unexpected AST: \"+tag)\n    def st(n):\n        tag=n[0]\n        if tag=='block':\n            for q in n[1]: st(q)\n        elif tag in ('num','bool','var','un','bin','assign','call'): ex(n)\n        elif tag=='return':\n            if n[1] is None: emit((\"RET\",\"none\"))\n            else: ex(n[1]); emit((\"RET\",\"value\"))\n        elif tag=='while':\n            top=len(code); ex(n[1]); j=emit((\"JZ\",None)); st(n[2]); emit((\"JMP\",top)); patch(j,len(code))\n        elif tag=='if':\n            ends=[]\n            for cond,body in n[1]:\n                ex(cond); z=emit((\"JZ\",None)); st(body); ends.append(emit((\"JMP\",None))); patch(z,len(code))\n            if n[2] is not None: st(n[2])\n            end=len(code)\n            for j in ends: patch(j,end)\n        elif tag=='def':\n            skip=emit((\"JMP\",None)); emit((\"FUNC\",n[1],tuple(n[2]))); st(n[3]); emit((\"RET\",\"none\")); patch(skip,len(code))\n    st(ast); emit((\"HALT\",)); return code\n\nclass VM:\n    def __init__(self,bytecode,globals=None,depth=0):\n        self.code=bytecode; self.globals={} if globals is None else globals; self.depth=depth\n        self.stack=[]; self.frames=[]; self.locals=self.globals; self.pc=0; self.last=None; self.funcs={}\n        for i,x in enumerate(bytecode):\n            if x[0]=='FUNC': self.funcs[x[1]]=(i+1,x[2])\n    def pop(self):\n        if not self.stack: raise RuntimeError(\"stack underflow\")\n        return self.stack.pop()\n    def run(self,entry=None,args=None):\n        if entry is not None:\n            if entry not in self.funcs: raise RuntimeError(\"unbound variable: \"+entry)\n            if self.depth>=64: raise RuntimeError(\"recursion limit exceeded\")\n            at,ps=self.funcs[entry]; vals=[] if args is None else args\n            self.locals=dict(zip(ps,vals)); self.pc=at; stop_on_ret=True\n        else: stop_on_ret=False\n        while True:\n            ins=self.code[self.pc]; self.pc+=1; op=ins[0]\n            if op=='PUSH': self.stack.append(ins[1]); self.last=ins[1]\n            elif op=='LOAD':\n                name=ins[1]\n                if name in self.locals: v=self.locals[name]\n                elif name in self.globals: v=self.globals[name]\n                else: raise RuntimeError(\"unbound variable: \"+name)\n                self.stack.append(v); self.last=v\n            elif op=='STORE': self.last=self.pop(); self.locals[ins[1]]=self.last; self.stack.append(self.last)\n            elif op=='UN': self.stack.append(-self.pop()); self.last=self.stack[-1]\n            elif op=='BIN':\n                b=self.pop(); a=self.pop(); f={'+':lambda:a+b,'-':lambda:a-b,'*':lambda:a*b,'/':lambda:a/b,'//':lambda:a//b,'%':lambda:a%b,'==':lambda:a==b,'!=':lambda:a!=b,'<':lambda:a<b,'<=':lambda:a<=b,'>':lambda:a>b,'>=':lambda:a>=b}[ins[1]]; self.stack.append(f()); self.last=self.stack[-1]\n            elif op=='JMP': self.pc=ins[1]\n            elif op=='JZ':\n                if not self.pop(): self.pc=ins[1]\n            elif op=='FUNC': pass\n            elif op=='CALL':\n                vals=[self.pop() for _ in range(ins[2])][::-1]\n                child=VM(self.code,self.globals,self.depth+1); v=child.run(ins[1],vals); self.stack.append(v); self.last=v\n            elif op=='RET':\n                v=None if ins[1]=='none' else self.pop()\n                return v\n            elif op=='HALT': return self.last\n            else: raise RuntimeError(\"unknown opcode: \"+op)\n",
  "arc": {
   "id": "stack-vm",
   "name": "Build a stack VM in Python",
   "step": 4,
   "total": 5
  }
 },
 {
  "id": "py-915",
  "track": "python",
  "branch": "Build: Stack VM",
  "title": "Functions, Recursion and the Assembled Pipeline",
  "difficulty": "hard",
  "tags": [
   "python",
   "interpreter",
   "project",
   "arc"
  ],
  "summary": "Wire all stages into a working interpreter with calls, scopes, returns, and bounded recursion.",
  "statement": "This is step 5 of a five-part build. The shared language has integers, booleans, arithmetic, comparisons, unary minus, assignment, if/elif/else, while, def/return, calls, and parentheses. Every statement is parenthesized; a block is another pair of parentheses containing statements. This deliberate syntax avoids indentation tokens and lets each artifact feed the next step. Implement `run_source(src, entry=\"main\", args=None)` and complete function execution in `VM`. It must call tokenize, parse, compile_ast, execute top-level code to establish globals, then invoke `entry` with `args` (default `[]`). A `FUNC` records its body address and parameter tuple. Each call gets fresh locals initialized from parameters. Reads check locals first, then globals; assignments inside a function are always local. There is intentionally no `global` declaration. Top-level assignments are global. Too few parameters may remain unbound and extra arguments may be ignored only if your zip-based binding naturally does so.\n\nCalls pop `argc` values, preserve source order, execute the named function, and push its return value. `RET value` pops and returns; `RET none` returns `None`. Recursion depth starts at zero for top-level execution and a requested 65th function activation raises exactly `RuntimeError(\"recursion limit exceeded\")`. Missing function names may use `RuntimeError(\"unbound variable: name\")`.\n\nComplete worked example: `(def fact (n) ((if (n <= 1) ((return 1)) else ((return n * fact(n - 1))))))(def main () ((return fact(5))))` tokenizes, parses, compiles definitions behind jumps, calls main, recursively creates frames with n values 5,4,3,2,1, then unwinds with 1,2,6,24,120; the result is `120`. Also support while loops inside functions and nested calls. This is the payoff: the five artifacts now form a tiny but complete interpreter.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def run_source(src, entry=\"main\", args=None):\n    raise NotImplementedError"
  },
  "tests": {
   "python": "fact=\"(def fact (n) ((if (n <= 1) ((return 1)) else ((return n * fact(n - 1))))))(def main () ((return fact(5))))\"\nassert run_source(fact)==120\nfib=\"(def fib (n) ((if (n <= 1) ((return n)) else ((return fib(n - 1) + fib(n - 2))))))(def main () ((return fib(10))))\"\nassert run_source(fib)==55\nloop=\"(def main () ((x = 0)(while (x < 10) ((x = x + 1)))(return x)))\"\nassert run_source(loop)==10\nnested=\"(def inc (x) ((return x + 1)))(def main () ((return inc(inc(3)))))\"\nassert run_source(nested)==5\ndeep=\"(def dive (n) ((return dive(n + 1))))(def main () ((return dive(0))))\"\ntry: run_source(deep)\nexcept RuntimeError as e: assert str(e)==\"recursion limit exceeded\"\nelse: assert False\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Index every FUNC before execution so recursion can find itself.",
   "Construct a child VM sharing globals but using a fresh locals dictionary.",
   "Check depth before entering a function, not after its body starts."
  ],
  "solution": "def tokenize(src):\n    out=[]; i=0; kws={\"if\",\"elif\",\"else\",\"while\",\"def\",\"return\",\"True\",\"False\"}\n    while i<len(src):\n        c=src[i]\n        if c.isspace(): i+=1; continue\n        if c=='#':\n            while i<len(src) and src[i]!='\\n': i+=1\n            continue\n        if c.isdigit():\n            j=i+1\n            while j<len(src) and src[j].isdigit(): j+=1\n            out.append((\"num\",src[i:j])); i=j; continue\n        if c.isalpha() or c=='_':\n            j=i+1\n            while j<len(src) and (src[j].isalnum() or src[j]=='_'): j+=1\n            text=src[i:j]; out.append((\"keyword\" if text in kws else \"name\",text)); i=j; continue\n        if i+1<len(src) and src[i:i+2] in (\"==\",\"!=\",\"<=\",\">=\",\"//\"):\n            out.append((\"op\",src[i:i+2])); i+=2; continue\n        if c in \"+-*/%()<>=!\": out.append((\"op\",c)); i+=1; continue\n        raise ValueError(\"unexpected character: \"+c)\n    out.append((\"eof\",\"\")); return out\n\nclass _Parser:\n    def __init__(self,t): self.t=t; self.i=0\n    def cur(self): return self.t[self.i]\n    def take(self,text=None):\n        x=self.cur()\n        if text is not None and x[1]!=text: raise ValueError(\"unexpected token: \"+x[1])\n        self.i+=1; return x\n    def expr(self,minp=0):\n        k,x=self.take()\n        if k==\"num\": left=(\"num\",int(x))\n        elif x in (\"True\",\"False\"): left=(\"bool\",x==\"True\")\n        elif k==\"name\": left=(\"var\",x)\n        elif x=='-': left=(\"un\",\"-\",self.expr(50))\n        elif x=='(':\n            left=self.expr(); self.take(')')\n        else: raise ValueError(\"unexpected token: \"+x)\n        if left[0]=='var' and self.cur()[1]=='(':\n            self.take('('); args=[]\n            if self.cur()[1]!=')':\n                args.append(self.expr())\n                while self.cur()[1]==',': self.take(','); args.append(self.expr())\n            self.take(')'); left=(\"call\",left[1],args)\n        prec={'=':1,'==':2,'!=':2,'<':2,'<=':2,'>':2,'>=':2,'+':3,'-':3,'*':4,'/':4,'//':4,'%':4}\n        compared=False\n        while self.cur()[1] in prec and prec[self.cur()[1]]>=minp:\n            op=self.take()[1]; p=prec[op]\n            if p==2 and compared: raise ValueError(\"chained comparison not supported\")\n            if op=='=':\n                if left[0]!='var': raise ValueError(\"unexpected token: =\")\n                left=(\"assign\",left[1],self.expr(p)); continue\n            right=self.expr(p+1); left=(\"bin\",op,left,right)\n            if p==2: compared=True\n        return left\n    def block(self):\n        self.take('('); out=[]\n        while self.cur()[1]!=')': out.append(self.stmt())\n        self.take(')'); return (\"block\",out)\n    def stmt(self):\n        self.take('(')\n        if self.cur()[1]=='if':\n            self.take(); branches=[]; self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            while self.cur()[1]=='elif':\n                self.take(); self.take('('); c=self.expr(); self.take(')'); branches.append((c,self.block()))\n            other=None\n            if self.cur()[1]=='else': self.take(); other=self.block()\n            node=(\"if\",branches,other)\n        elif self.cur()[1]=='while':\n            self.take(); self.take('('); c=self.expr(); self.take(')'); node=(\"while\",c,self.block())\n        elif self.cur()[1]=='def':\n            self.take(); name=self.take()[1]; self.take('('); ps=[]\n            while self.cur()[1]!=')':\n                ps.append(self.take()[1])\n            self.take(')'); node=(\"def\",name,ps,self.block())\n        elif self.cur()[1]=='return':\n            self.take(); node=(\"return\",None if self.cur()[1]==')' else self.expr())\n        else: node=self.expr()\n        self.take(')'); return node\n    def program(self):\n        out=[]\n        while self.cur()[0]!='eof': out.append(self.stmt())\n        return (\"block\",out)\n\ndef parse(tokens): return _Parser(tokens).program()\n\ndef compile_ast(ast):\n    code=[]\n    def emit(x): code.append(x); return len(code)-1\n    def patch(i,target): code[i]=code[i][:-1]+(target,)\n    def ex(n):\n        tag=n[0]\n        if tag=='num': emit((\"PUSH\",n[1]))\n        elif tag=='bool': emit((\"PUSH\",n[1]))\n        elif tag=='var': emit((\"LOAD\",n[1]))\n        elif tag=='un': ex(n[2]); emit((\"UN\",\"neg\"))\n        elif tag=='bin': ex(n[2]); ex(n[3]); emit((\"BIN\",n[1]))\n        elif tag=='assign': ex(n[2]); emit((\"STORE\",n[1]))\n        elif tag=='call':\n            for a in n[2]: ex(a)\n            emit((\"CALL\",n[1],len(n[2])))\n        else: raise ValueError(\"unexpected AST: \"+tag)\n    def st(n):\n        tag=n[0]\n        if tag=='block':\n            for q in n[1]: st(q)\n        elif tag in ('num','bool','var','un','bin','assign','call'): ex(n)\n        elif tag=='return':\n            if n[1] is None: emit((\"RET\",\"none\"))\n            else: ex(n[1]); emit((\"RET\",\"value\"))\n        elif tag=='while':\n            top=len(code); ex(n[1]); j=emit((\"JZ\",None)); st(n[2]); emit((\"JMP\",top)); patch(j,len(code))\n        elif tag=='if':\n            ends=[]\n            for cond,body in n[1]:\n                ex(cond); z=emit((\"JZ\",None)); st(body); ends.append(emit((\"JMP\",None))); patch(z,len(code))\n            if n[2] is not None: st(n[2])\n            end=len(code)\n            for j in ends: patch(j,end)\n        elif tag=='def':\n            skip=emit((\"JMP\",None)); emit((\"FUNC\",n[1],tuple(n[2]))); st(n[3]); emit((\"RET\",\"none\")); patch(skip,len(code))\n    st(ast); emit((\"HALT\",)); return code\n\nclass VM:\n    def __init__(self,bytecode,globals=None,depth=0):\n        self.code=bytecode; self.globals={} if globals is None else globals; self.depth=depth\n        self.stack=[]; self.frames=[]; self.locals=self.globals; self.pc=0; self.last=None; self.funcs={}\n        for i,x in enumerate(bytecode):\n            if x[0]=='FUNC': self.funcs[x[1]]=(i+1,x[2])\n    def pop(self):\n        if not self.stack: raise RuntimeError(\"stack underflow\")\n        return self.stack.pop()\n    def run(self,entry=None,args=None):\n        if entry is not None:\n            if entry not in self.funcs: raise RuntimeError(\"unbound variable: \"+entry)\n            if self.depth>=64: raise RuntimeError(\"recursion limit exceeded\")\n            at,ps=self.funcs[entry]; vals=[] if args is None else args\n            self.locals=dict(zip(ps,vals)); self.pc=at; stop_on_ret=True\n        else: stop_on_ret=False\n        while True:\n            ins=self.code[self.pc]; self.pc+=1; op=ins[0]\n            if op=='PUSH': self.stack.append(ins[1]); self.last=ins[1]\n            elif op=='LOAD':\n                name=ins[1]\n                if name in self.locals: v=self.locals[name]\n                elif name in self.globals: v=self.globals[name]\n                else: raise RuntimeError(\"unbound variable: \"+name)\n                self.stack.append(v); self.last=v\n            elif op=='STORE': self.last=self.pop(); self.locals[ins[1]]=self.last; self.stack.append(self.last)\n            elif op=='UN': self.stack.append(-self.pop()); self.last=self.stack[-1]\n            elif op=='BIN':\n                b=self.pop(); a=self.pop(); f={'+':lambda:a+b,'-':lambda:a-b,'*':lambda:a*b,'/':lambda:a/b,'//':lambda:a//b,'%':lambda:a%b,'==':lambda:a==b,'!=':lambda:a!=b,'<':lambda:a<b,'<=':lambda:a<=b,'>':lambda:a>b,'>=':lambda:a>=b}[ins[1]]; self.stack.append(f()); self.last=self.stack[-1]\n            elif op=='JMP': self.pc=ins[1]\n            elif op=='JZ':\n                if not self.pop(): self.pc=ins[1]\n            elif op=='FUNC': pass\n            elif op=='CALL':\n                vals=[self.pop() for _ in range(ins[2])][::-1]\n                child=VM(self.code,self.globals,self.depth+1); v=child.run(ins[1],vals); self.stack.append(v); self.last=v\n            elif op=='RET':\n                v=None if ins[1]=='none' else self.pop()\n                return v\n            elif op=='HALT': return self.last\n            else: raise RuntimeError(\"unknown opcode: \"+op)\n\ndef run_source(src,entry=\"main\",args=None):\n    code=compile_ast(parse(tokenize(src))); bootstrap=VM(code); bootstrap.run()\n    return VM(code,bootstrap.globals).run(entry,[] if args is None else args)\n",
  "arc": {
   "id": "stack-vm",
   "name": "Build a stack VM in Python",
   "step": 5,
   "total": 5
  }
 },
 {
  "id": "hpc-901",
  "track": "hpc",
  "branch": "Build: HPC Kernels",
  "title": "Cache-Aware Blocked Matrix Multiply",
  "difficulty": "medium",
  "tags": [
   "project",
   "arc",
   "hpc",
   "matrix-multiplication",
   "cache"
  ],
  "summary": "Implement `matmul_blocked(a, b, block) -> (result, stats)` for integer matrices stored as row-major Python lists. Matrix `a` is n\u00d7k and `b` is k\u00d7m; return their n\u00d7m product without changing either input. Reject a non-positive block, ragged input, or incompatible dimensions with `ValueError`. Empty dimensions are allowed when representable.",
  "statement": "Implement `matmul_blocked(a, b, block) -> (result, stats)` for integer matrices stored as row-major Python lists. Matrix `a` is n\u00d7k and `b` is k\u00d7m; return their n\u00d7m product without changing either input. Reject a non-positive block, ragged input, or incompatible dimensions with `ValueError`. Empty dimensions are allowed when representable.\n\nMachine model: a cache holds square tiles. Iterate output tiles, then reduction tiles. Every `(ii, jj, kk)` tile triple touches one clipped block from `a` and one clipped block from `b`, so count exactly two `block_loads`, even at an edge. Therefore `block_loads = 2*ceil(n/block)*ceil(m/block)*ceil(k/block)` for positive dimensions. `scalar_ops` counts multiply-add iterations, exactly `n*k*m`; it is independent of blocking. This deterministic traffic model replaces unreliable wall-clock timing.\n\nExample: multiplying `[[1,2,3],[4,5,6]]` by `[[7,8],[9,10],[11,12]]` with block 2 produces `[[58,64],[139,154]]`. There is one row tile, one column tile, and two reduction tiles, hence 4 block loads and 12 scalar operations. A clipped edge tile still counts as one block.\n\nUse only standard Python. Block sizes 1, 2, 3, and sizes larger than every matrix dimension must work. For an 8\u00d78 product, blocks 1, 2, 3, and 20 give 1024, 128, 54, and 2 loads, strictly decreasing. This kernel unlocks the suite's reusable compute counter and introduces cache-aware loop ordering for later performance modeling.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def matmul_blocked(a, b, block):\n    raise NotImplementedError(\"implement blocked multiplication\")"
  },
  "tests": {
   "python": "r,s=matmul_blocked([[1,2,3],[4,5,6]],[[7,8],[9,10],[11,12]],2)\nassert r==[[58,64],[139,154]] and s[\"scalar_ops\"]==12\nfor block in (1,2,3,20):\n    assert matmul_blocked([[1,2],[3,4]],[[5],[6]],block)[0]==[[17],[39]]\na=[[1]*8 for _ in range(8)]; b=[[1]*8 for _ in range(8)]\nloads=[matmul_blocked(a,b,x)[1][\"block_loads\"] for x in (1,2,3,20)]\nassert loads==[1024,128,54,2] and all(x>y for x,y in zip(loads,loads[1:]))\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Order loops by output tile, output column tile, then reduction tile.",
   "A clipped tile still contributes one A load and one B load.",
   "Keep the operation count separate from the block-load count."
  ],
  "solution": "def matmul_blocked(a, b, block):\n    if block <= 0: raise ValueError(\"block must be positive\")\n    n = len(a); k = len(a[0]) if n else 0\n    if any(len(r) != k for r in a): raise ValueError(\"a must be rectangular\")\n    if len(b) != k: raise ValueError(\"incompatible dimensions\")\n    m = len(b[0]) if k else 0\n    if any(len(r) != m for r in b): raise ValueError(\"b must be rectangular\")\n    out = [[0] * m for _ in range(n)]; loads = 0\n    for ii in range(0, n, block):\n        for jj in range(0, m, block):\n            for kk in range(0, k, block):\n                loads += 2\n                for i in range(ii, min(ii + block, n)):\n                    for j in range(jj, min(jj + block, m)):\n                        for q in range(kk, min(kk + block, k)):\n                            out[i][j] += a[i][q] * b[q][j]\n    return out, {\"block_loads\": loads, \"scalar_ops\": n * k * m}",
  "arc": {
   "id": "hpc-kernels",
   "name": "Build an HPC kernel suite",
   "step": 1,
   "total": 5
  }
 },
 {
  "id": "hpc-902",
  "track": "hpc",
  "branch": "Build: HPC Kernels",
  "title": "Tiled Transpose and Memory Traffic",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "hpc",
   "transpose",
   "memory-traffic"
  ],
  "summary": "Implement `transpose_tiled(matrix, tile) -> (transposed, stats)` for a rectangular row-major list of lists. Return the ordinary transpose and `{\"reads\": int, \"writes\": int, \"tile_visits\": int}`. Reject a non-positive tile or ragged matrix with `ValueError`; do not mutate the input. Empty input returns an empty transpose and zero counters.",
  "statement": "Implement `transpose_tiled(matrix, tile) -> (transposed, stats)` for a rectangular row-major list of lists. Return the ordinary transpose and `{\"reads\": int, \"writes\": int, \"tile_visits\": int}`. Reject a non-positive tile or ragged matrix with `ValueError`; do not mutate the input. Empty input returns an empty transpose and zero counters.\n\nMachine model: a cache line can supply the contiguous source segment belonging to one row inside one tile. Reading down a full column without tiling would cost one cache-line transaction per element, while a tile reuses each fetched row line across several columns. For each clipped tile beginning at `(i0,j0)`, increment `tile_visits` once and increment `reads` by that tile's height. Every copied scalar causes exactly one `write`. Thus visits are `ceil(rows/tile)*ceil(cols/tile)`, reads are `rows*ceil(cols/tile)`, and writes are `rows*cols`. These are modeled memory transactions, not wall-clock measurements or Python indexing counts.\n\nWorked example: a 5\u00d73 matrix with tile 2 has 3 row-tile groups and 2 column-tile groups, so it visits 6 tiles. Its reads are `5*2 = 10` cache lines and its writes are 15 values. The final row and column tiles are clipped but follow the same rules.\n\nHandle 1\u00d71 and non-square matrices, and permit tiles larger than the matrix. Use only the standard library. This step unlocks explicit memory-traffic accounting: combined with the operation count from blocked multiplication, those counters later become arithmetic intensity in the roofline model.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def transpose_tiled(matrix, tile):\n    raise NotImplementedError(\"implement tiled transpose\")"
  },
  "tests": {
   "python": "m=[[1,2,3],[4,5,6],[7,8,9],[10,11,12],[13,14,15]]\nt,s=transpose_tiled(m,2)\nassert t==[[1,4,7,10,13],[2,5,8,11,14],[3,6,9,12,15]]\nassert s=={\"reads\":10,\"writes\":15,\"tile_visits\":6}\nassert transpose_tiled([[9]],4)==([[9]],{\"reads\":1,\"writes\":1,\"tile_visits\":1})\nassert transpose_tiled([[1,2],[3,4],[5,6]],3)[0]==[[1,3,5],[2,4,6]]\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Allocate an output with cols rows and rows columns.",
   "A source tile contributes one modeled read per source row it spans.",
   "Use range steps of tile and min bounds for clipped edges."
  ],
  "solution": "def transpose_tiled(matrix, tile):\n    if tile <= 0: raise ValueError(\"tile must be positive\")\n    rows = len(matrix); cols = len(matrix[0]) if rows else 0\n    if any(len(r) != cols for r in matrix): raise ValueError(\"matrix must be rectangular\")\n    out = [[None] * rows for _ in range(cols)]; reads = writes = visits = 0\n    for i0 in range(0, rows, tile):\n        for j0 in range(0, cols, tile):\n            visits += 1; reads += min(tile, rows - i0)\n            for i in range(i0, min(i0 + tile, rows)):\n                for j in range(j0, min(j0 + tile, cols)):\n                    out[j][i] = matrix[i][j]; writes += 1\n    return out, {\"reads\": reads, \"writes\": writes, \"tile_visits\": visits}",
  "arc": {
   "id": "hpc-kernels",
   "name": "Build an HPC kernel suite",
   "step": 2,
   "total": 5
  }
 },
 {
  "id": "hpc-903",
  "track": "hpc",
  "branch": "Build: HPC Kernels",
  "title": "Halo Exchange Stencil",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "hpc",
   "stencil",
   "distributed-computing"
  ],
  "summary": "Implement `heat_step(grid, halo_width) -> (new_grid, exchange)` for a square floating-point grid. Perform one Jacobi 5-point step: every non-edge cell becomes one quarter of its north, south, west, and east neighbors from the original grid; copy all outer-edge cells unchanged. Reject a ragged/non-square grid or negative halo width with `ValueError`, and never mutate the input.",
  "statement": "Implement `heat_step(grid, halo_width) -> (new_grid, exchange)` for a square floating-point grid. Perform one Jacobi 5-point step: every non-edge cell becomes one quarter of its north, south, west, and east neighbors from the original grid; copy all outer-edge cells unchanged. Reject a ragged/non-square grid or negative halo width with `ValueError`, and never mutate the input.\n\nModel a distributed domain split into `min(4,n)` contiguous horizontal bands. Divide rows as evenly as possible, assigning one extra row to each earliest band. Every neighboring band pair exchanges halo rows in both directions. At a boundary, the rows exchanged are `min(halo_width,left_height) + min(halo_width,right_height)`; multiply their sum by row width n to obtain `cells`. `band_pairs` is one less than the number of nonempty bands. This clipped rule also defines tiny grids and halos wider than a band.\n\nExample: n=8 creates four bands of height 2 and three boundaries. Width 1 exchanges two rows per boundary, hence `cells = 3*2*8 = 48`; width 2 exchanges four rows per boundary, hence 96. A centered unit spike on a zero grid becomes zero at its old location and 0.25 at each of four neighbors, preserving total interior heat to floating tolerance.\n\nFor 2\u00d72 and 1\u00d71 grids there are no interior updates, so values are copied. Use standard Python and deterministic counters only. This unlocks decomposition and communication accounting, extending the local cache kernels into an HPC-style distributed stencil model.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def heat_step(grid, halo_width):\n    raise NotImplementedError(\"implement halo stencil\")"
  },
  "tests": {
   "python": "g=[[0.0]*7 for _ in range(7)]; g[3][3]=1.0\nn,e=heat_step(g,1)\nassert n[3][3]==0 and [n[2][3],n[4][3],n[3][2],n[3][4]]==[.25]*4\nassert abs(sum(map(sum,n[1:-1]))-1.0)<1e-9\nassert heat_step([[1.0]],2)[0]==[[1.0]]\nassert heat_step([[1.,2.],[3.,4.]],1)[0]==[[1.,2.],[3.,4.]]\nassert heat_step([[0.]*8 for _ in range(8)],1)[1]=={\"band_pairs\":3,\"cells\":48}\nassert heat_step([[0.]*8 for _ in range(8)],2)[1]=={\"band_pairs\":3,\"cells\":96}\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Copy the grid first so edges naturally remain unchanged.",
   "Compute band heights with divmod and assign extras to early bands.",
   "Count halo traffic in both directions at each adjacent band boundary."
  ],
  "solution": "def heat_step(grid, halo_width):\n    if halo_width < 0: raise ValueError(\"halo_width must be nonnegative\")\n    n = len(grid)\n    if any(len(r) != n for r in grid): raise ValueError(\"grid must be square\")\n    out = [r[:] for r in grid]\n    for i in range(1, n - 1):\n        for j in range(1, n - 1):\n            out[i][j] = .25 * (grid[i-1][j] + grid[i+1][j] + grid[i][j-1] + grid[i][j+1])\n    bands = min(4, n)\n    if not bands: return out, {\"band_pairs\": 0, \"cells\": 0}\n    base, extra = divmod(n, bands)\n    heights = [base + (i < extra) for i in range(bands)]\n    rows = sum(min(halo_width, heights[i]) + min(halo_width, heights[i+1]) for i in range(bands - 1))\n    return out, {\"band_pairs\": bands - 1, \"cells\": rows * n}",
  "arc": {
   "id": "hpc-kernels",
   "name": "Build an HPC kernel suite",
   "step": 3,
   "total": 5
  }
 },
 {
  "id": "hpc-904",
  "track": "hpc",
  "branch": "Build: HPC Kernels",
  "title": "Parallel Reduction and Strong Scaling",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "hpc",
   "reduction",
   "amdahl-law"
  ],
  "summary": "Implement `parallel_sum(values, workers) -> (total, stats)` as a deterministic model of parallel reduction. Require `workers > 0`, otherwise raise `ValueError`. Split values into `min(len(values), workers)` nonempty contiguous chunks. If n divided by the chunk count leaves leftovers, give one extra element to each earliest chunk. Sum each chunk in input order, store those sums in `partials`, then sum the partials in order. Empty input has zero chunks and an empty partial list.",
  "statement": "Implement `parallel_sum(values, workers) -> (total, stats)` as a deterministic model of parallel reduction. Require `workers > 0`, otherwise raise `ValueError`. Split values into `min(len(values), workers)` nonempty contiguous chunks. If n divided by the chunk count leaves leftovers, give one extra element to each earliest chunk. Sum each chunk in input order, store those sums in `partials`, then sum the partials in order. Empty input has zero chunks and an empty partial list.\n\nReturn stats `{\"chunks\": int, \"partials\": [...], \"speedup\": float}`. Model strong scaling with Amdahl's law and a fixed parallel fraction p=0.95: `speedup = 1 / ((1-p) + p/workers)`. The speedup uses the requested worker count even when there are fewer values, because it describes the machine configuration rather than measured elapsed time. Never time code.\n\nWorked example: values `range(7)` with 3 workers split into lengths 3, 2, 2: `[0,1,2]`, `[3,4]`, `[5,6]`. Partials are `[3,7,11]`, total is 21, and modeled speedup is `1/(0.05+0.95/3)`, about 2.7272727. With one worker the formula is exactly 1.0; increasing workers strictly increases modeled speedup toward the serial-limit ceiling of 20.\n\nSupport numeric values accepted by Python's `sum`, lengths 0 through large inputs, and workers greater than n. This step unlocks a compute-side scaling model that complements prior cache, traffic, and communication counters.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def parallel_sum(values, workers):\n    raise NotImplementedError(\"implement deterministic reduction\")"
  },
  "tests": {
   "python": "for n in list(range(8))+[1000]:\n    vals=list(range(n)); total,stats=parallel_sum(vals,3)\n    assert total==sum(vals) and stats[\"chunks\"]==min(n,3)\nassert parallel_sum(list(range(7)),3)[1][\"partials\"]==[3,7,11]\nassert parallel_sum([],4)[1][\"partials\"]==[]\nassert parallel_sum([1],1)[1][\"speedup\"]==1.0\nss=[parallel_sum([1],w)[1][\"speedup\"] for w in range(1,6)]\nassert all(a<b for a,b in zip(ss,ss[1:]))\nassert abs(ss[3]-(1/(.05+.95/4)))<1e-12\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Use divmod(n, chunks) to form deterministic chunk lengths.",
   "Give the first remainder chunks one additional value.",
   "Amdahl speedup depends on requested workers, not chunk count."
  ],
  "solution": "def parallel_sum(values, workers):\n    if workers <= 0: raise ValueError(\"workers must be positive\")\n    n = len(values); chunks = min(n, workers); partials = []\n    if chunks:\n        base, extra = divmod(n, chunks); start = 0\n        for i in range(chunks):\n            width = base + (i < extra)\n            partials.append(sum(values[start:start + width])); start += width\n    p = .95\n    return sum(partials), {\"chunks\": chunks, \"partials\": partials, \"speedup\": 1 / ((1-p) + p/workers)}",
  "arc": {
   "id": "hpc-kernels",
   "name": "Build an HPC kernel suite",
   "step": 4,
   "total": 5
  }
 },
 {
  "id": "hpc-905",
  "track": "hpc",
  "branch": "Build: HPC Kernels",
  "title": "Roofline Model and the Finished Suite",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "hpc",
   "roofline",
   "performance-modeling"
  ],
  "summary": "Implement two final functions. `roofline(flops, bytes, peak_flops, peak_bw)` returns `intensity = flops/bytes`, `attainable_flops = min(peak_flops, intensity*peak_bw)`, and `bound`, which is `\"memory\"` only when the bandwidth ceiling is strictly below peak compute and otherwise `\"compute\"`. If bytes is zero or negative, raise exactly `ValueError(\"bytes must be positive\")`. At the ridge point, equality is compute-bound.",
  "statement": "Implement two final functions. `roofline(flops, bytes, peak_flops, peak_bw)` returns `intensity = flops/bytes`, `attainable_flops = min(peak_flops, intensity*peak_bw)`, and `bound`, which is `\"memory\"` only when the bandwidth ceiling is strictly below peak compute and otherwise `\"compute\"`. If bytes is zero or negative, raise exactly `ValueError(\"bytes must be positive\")`. At the ridge point, equality is compute-bound.\n\nThe roofline machine model combines operation count with memory bandwidth. Example: with 1000 FLOPs, 100 bytes, peak 1000 FLOP/s, and bandwidth 100 byte/s, intensity is 10 FLOP/byte and the bandwidth ceiling is 1000 FLOP/s. This equals peak compute, so attainable performance is 1000 and the classification is compute. At intensity 1 under the same peaks, only 100 FLOP/s is attainable and the kernel is memory-bound.\n\nAlso implement `suite_report(sizes)`. Each nonnegative n represents multiplying two n\u00d7n all-one matrices with block 32. Problems are judged independently, so reimplement or directly model the earlier kernel locally. Its scalar operations are n\u00b3. Model transferred bytes as `max(1, 3*n*n*8)` for two inputs and one output of eight-byte scalars. Use fixed peaks 1.0e12 FLOP/s and 1.0e11 byte/s. Return `{\"runs\": [...], \"total_scalar_ops\": sum, \"peak_flops\": ..., \"peak_bw\": ...}`; each run has `size`, `scalar_ops`, `intensity`, `attainable_flops`, and `bound`, in input order.\n\nFor sizes [4,8], total operations are 64+512=576. This finishes the suite by composing cache-aware operation counts and deterministic traffic estimates into a portable performance report without NumPy or timing.",
  "kind": "code",
  "languages": [
   "python"
  ],
  "starter": {
   "python": "def roofline(flops, bytes, peak_flops, peak_bw):\n    raise NotImplementedError(\"implement roofline model\")\n\ndef suite_report(sizes):\n    raise NotImplementedError(\"assemble the suite report\")"
  },
  "tests": {
   "python": "assert roofline(100,100,1000,100)[\"bound\"]==\"memory\"\nassert roofline(2000,100,1000,100)[\"bound\"]==\"compute\"\nr=roofline(1000,100,1000,100)\nassert r=={\"intensity\":10.0,\"attainable_flops\":1000,\"bound\":\"compute\"}\ntry: roofline(1,0,1,1); assert False\nexcept ValueError as e: assert str(e)==\"bytes must be positive\"\ns=suite_report([4,8])\nassert set(s)=={\"runs\",\"total_scalar_ops\",\"peak_flops\",\"peak_bw\"}\nassert s[\"total_scalar_ops\"]==576 and [x[\"scalar_ops\"] for x in s[\"runs\"]]==[64,512]\nassert [x[\"size\"] for x in s[\"runs\"]]==[4,8] and all(x[\"bound\"]==\"memory\" for x in s[\"runs\"])\nprint(\"ALL TESTS PASSED\")"
  },
  "hints": [
   "Compare intensity times bandwidth with peak compute.",
   "Equality at the ridge point is compute-bound.",
   "For each n, use n cubed operations and 24*n*n modeled bytes."
  ],
  "solution": "def roofline(flops, bytes, peak_flops, peak_bw):\n    if bytes <= 0: raise ValueError(\"bytes must be positive\")\n    intensity = flops / bytes; memory_limit = intensity * peak_bw\n    return {\"intensity\": intensity, \"attainable_flops\": min(peak_flops, memory_limit), \"bound\": \"memory\" if memory_limit < peak_flops else \"compute\"}\n\ndef suite_report(sizes):\n    peak_flops = 1e12; peak_bw = 1e11; runs = []; total = 0\n    for n in sizes:\n        if n < 0: raise ValueError(\"sizes must be nonnegative\")\n        ops = n ** 3; total += ops\n        model = roofline(ops, max(1, 3*n*n*8), peak_flops, peak_bw)\n        runs.append({\"size\": n, \"scalar_ops\": ops, \"intensity\": model[\"intensity\"], \"attainable_flops\": model[\"attainable_flops\"], \"bound\": model[\"bound\"]})\n    return {\"runs\": runs, \"total_scalar_ops\": total, \"peak_flops\": peak_flops, \"peak_bw\": peak_bw}",
  "arc": {
   "id": "hpc-kernels",
   "name": "Build an HPC kernel suite",
   "step": 5,
   "total": 5
  }
 },
 {
  "id": "fpga-901",
  "track": "fpga",
  "branch": "Build: FPGA Bring-up",
  "title": "Heartbeat Blinker and Clock Divider",
  "difficulty": "easy",
  "tags": [
   "project",
   "arc",
   "fpga",
   "clock-divider",
   "counter"
  ],
  "summary": "Build the first visible sign of life: a deterministic LED heartbeat driven by the board clock.",
  "statement": "An FPGA board is silent after configuration unless the design drives a real output pin. Your first bring-up block is a heartbeat LED: it proves that the bitstream loaded, the oscillator reaches the fabric, reset is wired correctly, and the constraints map the logical `led` port to the physical LED pin. Implement `module blink(input wire clk, rst_n, input wire [3:0] half_period, output reg led)`.\n\nReset is synchronous and active-low. On a rising clock edge with `rst_n == 0`, clear both the LED and its counter. Otherwise, a counter counts inclusively from 0 through `half_period`; when it reaches `half_period`, reset the counter to 0 and toggle `led`. Thus each LED level lasts exactly `half_period + 1` rising edges, and the full waveform period is exactly `2 * (half_period + 1)` clocks. For example, `half_period=0` toggles on every active edge, `half_period=1` toggles every two clocks, and `half_period=3` toggles every four clocks.\n\nUse a `localparam` for the counter width. The output must be registered\u2014do not gate or divide the physical clock. A mid-count reset discards partial progress, forces `led` low on that reset edge, and makes the next interval begin from zero. This small block establishes the safe FPGA pattern used throughout the arc: keep one real board clock, derive timing with counters and clock enables, and initialize externally visible pins to harmless values.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module blink(input wire clk, input wire rst_n, input wire [3:0] half_period, output reg led);\n  // TODO: implement this module.\nendmodule\n"
  },
  "tests": {
   "verilog": "`timescale 1ns/1ps\nmodule tb;\n reg clk=0,rst_n=0; reg [3:0] half_period; wire led; integer i; reg expected;\n blink dut(.clk(clk),.rst_n(rst_n),.half_period(half_period),.led(led));\n always #5 clk=~clk;\n task reset; begin rst_n=0; @(posedge clk); #1; if(led !== 0) $fatal(1,\"LED not zero on reset\"); rst_n=1; end endtask\n task check_mode(input [3:0] hp); begin\n   half_period=hp; reset; expected=0;\n   for(i=0;i<3*(hp+1);i=i+1) begin @(posedge clk); #1; if((i%(hp+1))==hp) expected=~expected; if(led !== expected) $fatal(1,\"bad toggle hp=%0d cycle=%0d\",hp,i); end\n end endtask\n initial begin\n  half_period=0; check_mode(0); check_mode(1); check_mode(3);\n  half_period=3; reset; repeat(2) @(posedge clk); rst_n=0; @(posedge clk); #1; if(led !== 0) $fatal(1,\"mid-count reset failed\"); rst_n=1;\n  repeat(3) begin @(posedge clk); #1; if(led !== 0) $fatal(1,\"toggle too early after reset\"); end\n  @(posedge clk); #1; if(led !== 1) $fatal(1,\"toggle late after reset\");\n  $display(\"ALL TESTS PASSED\"); $finish;\n end\n\n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Write down the inclusive sequence for each half_period before coding.",
   "Compare the counter before incrementing it.",
   "Reset the counter and LED in the same synchronous reset branch."
  ],
  "solution": "module blink(input wire clk, input wire rst_n, input wire [3:0] half_period, output reg led);\n  localparam COUNTER_WIDTH = 4;\n  reg [COUNTER_WIDTH-1:0] count;\n  always @(posedge clk) begin\n    if (!rst_n) begin count <= 0; led <= 0; end\n    else if (count == half_period) begin count <= 0; led <= ~led; end\n    else count <= count + 1'b1;\n  end\nendmodule",
  "arc": {
   "id": "fpga-bringup",
   "name": "Build an FPGA bring-up design",
   "step": 1,
   "total": 5
  }
 },
 {
  "id": "fpga-902",
  "track": "fpga",
  "branch": "Build: FPGA Bring-up",
  "title": "Two-Flop Synchronizer and Debouncer",
  "difficulty": "medium",
  "tags": [
   "project",
   "arc",
   "fpga",
   "cdc",
   "debounce"
  ],
  "summary": "Safely bring an asynchronous mechanical input into the clock domain and reject contact bounce.",
  "statement": "A pushbutton is a real board pin: it is unrelated to the FPGA clock and its contacts chatter. Sampling it directly can violate setup or hold time and propagate metastability; treating one sample as a press also turns bounce into many presses. Implement two modules: `sync2(input wire clk, rst_n, async_in, output reg sync_out)` and `debounce(input wire clk, rst_n, noisy, output reg clean)`.\n\n`sync2` is the standard two-flop synchronizer. On each rising edge, its first register samples `async_in` and its second register samples the first. Because assignments are nonblocking, a stable transition appears at `sync_out` after two sampling edges. Both stages clear synchronously when active-low `rst_n` is asserted. In hardware, place this chain near the input and mark it appropriately in timing constraints; simulation cannot reproduce analog metastability, but can verify pipeline latency.\n\n`debounce` changes `clean` only after observing four consecutive samples of the opposite value. The first differing sample is sample 1; `clean` remains unchanged after samples 1, 2, and 3, then updates on the edge that captures sample 4. A sample equal to the current clean value cancels progress. If the candidate polarity changes, restart the run at one. For example, with `clean=0`, three high clocks followed by low is rejected; four high clocks changes `clean` to 1 on the fourth edge.\n\nUse localparams for widths and registered outputs. In a board design, feed the synchronized signal into the debouncer (the testbench also checks each primitive independently). Reset must clear history and outputs so a partially accumulated press cannot survive reset.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module sync2(input wire clk,input wire rst_n,input wire async_in,output reg sync_out);\n  // TODO: implement this module.\nendmodule\n\nmodule debounce(input wire clk,input wire rst_n,input wire noisy,output reg clean);\n  // TODO: implement this module.\nendmodule\n"
  },
  "tests": {
   "verilog": "`timescale 1ns/1ps\nmodule tb;\n reg clk=0,rst_n=0,async_in=0,noisy=0; wire sync_out,clean; integer i;\n sync2 s(.clk(clk),.rst_n(rst_n),.async_in(async_in),.sync_out(sync_out));\n debounce d(.clk(clk),.rst_n(rst_n),.noisy(noisy),.clean(clean)); always #5 clk=~clk;\n initial begin\n  @(posedge clk); #1; if(sync_out!==0||clean!==0) $fatal(1,\"reset outputs\"); rst_n=1;\n  #3 async_in=1; @(posedge clk); #1; if(sync_out!==0) $fatal(1,\"synchronizer lacks two stages\"); @(posedge clk); #1; if(sync_out!==1) $fatal(1,\"synchronizer latency\");\n  #2 async_in=0; @(posedge clk); #1; if(sync_out!==1) $fatal(1,\"async fall too early\"); @(posedge clk); #1; if(sync_out!==0) $fatal(1,\"async fall late\");\n  noisy=1; repeat(3) begin @(posedge clk); #1; if(clean!==0) $fatal(1,\"3-cycle glitch passed\"); end noisy=0; @(posedge clk); #1; if(clean!==0) $fatal(1,\"glitch cleanup\");\n  noisy=1; for(i=1;i<=3;i=i+1) begin @(posedge clk); #1; if(clean!==0) $fatal(1,\"debounce changed before fourth sample\"); end @(posedge clk); #1; if(clean!==1) $fatal(1,\"debounce did not change on fourth sample\");\n  noisy=0; repeat(2) @(posedge clk); rst_n=0; @(posedge clk); #1; if(sync_out!==0||clean!==0) $fatal(1,\"reset behaviour\");\n  $display(\"ALL TESTS PASSED\"); $finish;\n end\n\n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Use two distinct registers and nonblocking assignments in sync2.",
   "Track both the candidate value and how many consecutive samples matched it.",
   "Treat the first opposite sample as count one, not count zero."
  ],
  "solution": "module sync2(input wire clk,input wire rst_n,input wire async_in,output reg sync_out);\n  localparam STAGES=2; reg meta;\n  always @(posedge clk) begin if(!rst_n) begin meta<=0; sync_out<=0; end else begin meta<=async_in; sync_out<=meta; end end\nendmodule\nmodule debounce(input wire clk,input wire rst_n,input wire noisy,output reg clean);\n  localparam COUNT_WIDTH=2; reg [COUNT_WIDTH-1:0] count; reg candidate;\n  always @(posedge clk) begin\n    if(!rst_n) begin clean<=0; count<=0; candidate<=0; end\n    else if(noisy==clean) begin count<=0; candidate<=noisy; end\n    else if(noisy!=candidate) begin candidate<=noisy; count<=1; end\n    else if(count==3) begin clean<=candidate; count<=0; end\n    else count<=count+1'b1;\n  end\nendmodule",
  "arc": {
   "id": "fpga-bringup",
   "name": "Build an FPGA bring-up design",
   "step": 2,
   "total": 5
  }
 },
 {
  "id": "fpga-903",
  "track": "fpga",
  "branch": "Build: FPGA Bring-up",
  "title": "UART Transmitter",
  "difficulty": "medium",
  "tags": [
   "project",
   "arc",
   "fpga",
   "uart",
   "serial",
   "fsm"
  ],
  "summary": "Transmit observable debug bytes over a board UART with exact bit timing.",
  "statement": "Once clock, reset, LEDs, and inputs work, a UART transmit pin gives richer visibility without a logic analyzer. Implement `module uart_tx #(parameter CLKS_PER_BIT=4) (input wire clk, rst_n, start, input wire [7:0] data, output reg tx, output reg busy, output reg done)`. On a real board, `tx` is constrained to a USB-UART or header pin and `CLKS_PER_BIT` is derived from clock frequency divided by baud rate.\n\nThe line idles high. Accept `start` only while idle, capture `data`, assert `busy`, and send one low start bit, eight data bits least-significant-bit first, then one high stop bit. Every bit occupies exactly `CLKS_PER_BIT` rising-clock intervals. For `CLKS_PER_BIT=4`, after accepting start the line is low immediately after that edge and remains the start bit for four clock intervals; each following group of four intervals carries data[0], data[1], and so on. Keep `busy` high for the complete ten-bit frame.\n\nWhen the final stop-bit interval ends, deassert `busy`, leave `tx` high, and pulse `done` for exactly one clock. A `start` asserted during `busy` is ignored completely, even if `data` changes. A new frame may be requested after the transmitter returns idle. Reset is synchronous active-low and must produce idle-high `tx`, low `busy`, and low `done`.\n\nUse a localparam-derived counter width so parameter changes still compile. All outputs are registered. Avoid generated clocks and delays in synthesizable RTL; the board clock and counters define timing.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module uart_tx #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire start,input wire [7:0] data,output reg tx,output reg busy,output reg done);\n  // TODO: implement this module.\nendmodule\n"
  },
  "tests": {
   "verilog": "`timescale 1ns/1ps\nmodule tb;\n localparam C=4; reg clk=0,rst_n=0,start=0; reg [7:0] data; wire tx,busy,done; integer i,j; reg [9:0] expected;\n uart_tx #(.CLKS_PER_BIT(C)) dut(.*); always #5 clk=~clk;\n task send_check(input [7:0] b,input integer inject); begin\n  data=b; start=1; @(posedge clk); #1; start=0; expected={1'b1,b,1'b0};\n  if(busy!==1) $fatal(1,\"busy not asserted\");\n  for(i=0;i<10;i=i+1) for(j=0;j<C;j=j+1) begin\n   if(tx!==expected[i]) $fatal(1,\"tx bit mismatch bit=%0d tick=%0d\",i,j);\n   if(inject && i==3 && j==1) begin data=8'h00; start=1; end\n   @(posedge clk); #1; start=0;\n  end\n  if(busy!==0||done!==1||tx!==1) $fatal(1,\"bad frame completion\"); @(posedge clk); #1; if(done!==0) $fatal(1,\"done not pulse\");\n end endtask\n initial begin\n  @(posedge clk); #1; if(tx!==1||busy!==0||done!==0) $fatal(1,\"reset state\"); rst_n=1;\n  send_check(8'hA5,1); send_check(8'h3C,0); send_check(8'hC3,0);\n  $display(\"ALL TESTS PASSED\"); $finish;\n end\n\n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "A 10-bit shift/frame register can hold stop, data, and start bits.",
   "Separate the bit-duration counter from the frame bit index.",
   "Default done low every active cycle, setting it only on frame completion."
  ],
  "solution": "module uart_tx #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire start,input wire [7:0] data,output reg tx,output reg busy,output reg done);\n localparam COUNT_WIDTH=(CLKS_PER_BIT<=2)?1:$clog2(CLKS_PER_BIT); reg [COUNT_WIDTH-1:0] count; reg [3:0] bit_index; reg [9:0] frame;\n always @(posedge clk) begin\n  if(!rst_n) begin tx<=1; busy<=0; done<=0; count<=0; bit_index<=0; frame<=10'h3ff; end\n  else begin done<=0;\n   if(!busy) begin tx<=1; if(start) begin frame<={1'b1,data,1'b0}; tx<=0; busy<=1; count<=0; bit_index<=0; end end\n   else if(count==CLKS_PER_BIT-1) begin count<=0; if(bit_index==9) begin tx<=1; busy<=0; done<=1; end else begin bit_index<=bit_index+1'b1; tx<=frame[bit_index+1'b1]; end end\n   else count<=count+1'b1;\n  end\n end\nendmodule",
  "arc": {
   "id": "fpga-bringup",
   "name": "Build an FPGA bring-up design",
   "step": 3,
   "total": 5
  }
 },
 {
  "id": "fpga-904",
  "track": "fpga",
  "branch": "Build: FPGA Bring-up",
  "title": "UART Receiver with Framing Detection",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "fpga",
   "uart",
   "serial",
   "sampling"
  ],
  "summary": "Recover UART bytes at mid-bit timing, reject malformed frames, and recover from a break.",
  "statement": "Receiving from a real UART pin adds asynchronous timing and malformed-input concerns. In production the pin would first pass through a synchronizer; this exercise focuses on the receive state machine. Implement `module uart_rx #(parameter CLKS_PER_BIT=4) (input wire clk, rst_n, rx, output reg [7:0] data, output reg valid, output reg frame_error)` for 8-N-1 UART: idle high, one low start bit, eight LSB-first data bits, and one high stop bit.\n\nDetect a high-to-low opportunity only while armed by a high idle level. After detecting low, validate the start bit at its midpoint. Define detection as index 0; sample the start after `CLKS_PER_BIT/2` further rising edges (for 4 clocks/bit, the midpoint sample is index 2). If it is no longer low, abandon the false start. From that midpoint, sample each data bit every `CLKS_PER_BIT` clocks, then sample the stop bit one bit time after data[7].\n\nOn a high stop sample, update `data` and pulse `valid` for exactly one clock. On a low stop sample, suppress `valid` and pulse `frame_error` for one clock. Reset clears outputs and state synchronously. After an error or a line held low (a UART break), do not hang or emit false valid bytes: wait until high has been observed before arming another start. A correct frame after the line returns high must be received normally. Back-to-back frames are legal because the valid stop bit itself supplies the high level before the next start.\n\nUse localparam-derived counter sizing and registered outputs. The exact midpoint validation and periodic samples provide tolerance to phase offset, while stop checking prevents corrupted traffic from entering later board logic.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module uart_rx #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire rx,output reg [7:0] data,output reg valid,output reg frame_error);\n  // TODO: implement this module.\nendmodule\n"
  },
  "tests": {
   "verilog": "`timescale 1ns/1ps\nmodule tb;\n localparam C=4; reg clk=0,rst_n=0,rx=1; wire [7:0] data; wire valid,frame_error; integer vc=0,ec=0; reg [7:0] last;\n uart_rx #(.CLKS_PER_BIT(C)) dut(.*); always #5 clk=~clk;\n always @(posedge clk) begin #1;if(valid)begin vc=vc+1;last=data;end if(frame_error)ec=ec+1;end\n task bit_time(input v); begin rx=v; repeat(C) @(posedge clk); end endtask\n task frame(input [7:0] b,input stop_ok); integer k; begin bit_time(0); for(k=0;k<8;k=k+1) bit_time(b[k]); bit_time(stop_ok); end endtask\n initial begin\n  repeat(2) @(posedge clk); #1;if(valid!==0||frame_error!==0)$fatal(1,\"reset\");rst_n=1; repeat(C) @(posedge clk);\n  frame(8'h96,1); #1;if(vc!=1||last!==8'h96||ec!=0)$fatal(1,\"correct frame failed\");\n  frame(8'h12,1); frame(8'hE1,1); #1;if(vc!=3||last!==8'hE1)$fatal(1,\"back-to-back failed\");\n  frame(8'h55,0); #1;if(ec!=1||vc!=3)$fatal(1,\"bad stop not flagged\");\n  rx=0; repeat(60) @(posedge clk); #1;if(vc!=3)$fatal(1,\"break generated valid\");\n  rx=1; repeat(C) @(posedge clk); frame(8'h3A,1); #1;if(vc!=4||last!==8'h3A)$fatal(1,\"did not resynchronise\");\n  $display(\"ALL TESTS PASSED\");$finish;\n end\n\n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Use states for idle, start validation, data bits, and stop.",
   "Reset the per-bit counter after every sampling point.",
   "Keep an armed flag so a continuously low line is not repeatedly interpreted as starts."
  ],
  "solution": "module uart_rx #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire rx,output reg [7:0] data,output reg valid,output reg frame_error);\n localparam COUNT_WIDTH=(CLKS_PER_BIT<=2)?1:$clog2(CLKS_PER_BIT); localparam IDLE=0,START=1,BITS=2,STOP=3;\n reg [1:0] state; reg [COUNT_WIDTH-1:0] count; reg [2:0] bit_index; reg [7:0] shift; reg armed;\n always @(posedge clk) begin\n  if(!rst_n) begin data<=0;valid<=0;frame_error<=0;state<=IDLE;count<=0;bit_index<=0;shift<=0;armed<=0;end\n  else begin valid<=0;frame_error<=0;\n   case(state)\n    IDLE: begin count<=0; if(rx) armed<=1; else if(armed) begin state<=START; count<=0; armed<=0; end end\n    START: if(count==(CLKS_PER_BIT/2)-1) begin if(!rx) begin state<=BITS;count<=0;bit_index<=0;end else begin state<=IDLE;armed<=1;end end else count<=count+1'b1;\n    BITS: if(count==CLKS_PER_BIT-1) begin shift[bit_index]<=rx;count<=0;if(bit_index==7) state<=STOP;else bit_index<=bit_index+1'b1;end else count<=count+1'b1;\n    STOP: if(count==CLKS_PER_BIT-1) begin state<=IDLE;count<=0;if(rx) begin data<=shift;valid<=1;armed<=1;end else begin frame_error<=1;armed<=0;end end else count<=count+1'b1;\n   endcase\n  end\n end\nendmodule",
  "arc": {
   "id": "fpga-bringup",
   "name": "Build an FPGA bring-up design",
   "step": 4,
   "total": 5
  }
 },
 {
  "id": "fpga-905",
  "track": "fpga",
  "branch": "Build: FPGA Bring-up",
  "title": "Loopback Bring-up Top",
  "difficulty": "hard",
  "tags": [
   "project",
   "arc",
   "fpga",
   "uart",
   "integration",
   "buffering"
  ],
  "summary": "Integrate the ladder into a UART echo top with error dropping and one byte of elasticity.",
  "statement": "The final bring-up image connects real clock, reset, RX, and TX pins into a useful board-level loopback. Implement `module fpga_top #(parameter CLKS_PER_BIT=4) (input wire clk, rst_n, rx, output reg tx)` and include the `uart_rx` and `uart_tx` modules from the previous steps in the same submission. Instantiate both at the same clock-rate parameter. Every byte accompanied by the receiver's one-cycle `valid` pulse must be transmitted back in order. Bytes with a framing error are dropped because the receiver suppresses `valid`.\n\nUART receive and transmit can overlap. Add a one-entry holding register: if a valid byte arrives while the transmitter is busy, preserve it and launch it as soon as TX is idle. If TX is idle and no byte is pending, launch the received byte directly. If a byte arrives when both the transmitter is busy and the holding entry is already full, overflow drops the newest arriving byte; no overflow output is required, but this policy must be explicit and deterministic. Never overwrite the older pending byte.\n\n`tx` must idle high after synchronous active-low reset and after all echoes finish. All control state is clocked; the top output may simply reflect the registered transmitter output even though the required top port is declared `reg`. Do not create another clock. On a board, RX and TX connect to a USB-UART bridge, the clock to the oscillator pin, and reset to a conditioned reset source. A terminal can then type bytes and observe exact echoes, proving pin constraints, clocking, reset, serial timing, state machines, and integration.\n\nThe testbench sends three valid bytes and checks echo order, injects a frame with a low stop bit and confirms it is never echoed, then confirms the line remains idle high.",
  "kind": "code",
  "languages": [
   "verilog"
  ],
  "starter": {
   "verilog": "module fpga_top #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire rx,output reg tx);\n  // TODO: implement this module.\nendmodule\n"
  },
  "tests": {
   "verilog": "`timescale 1ns/1ps\nmodule tb;\n localparam C=4; reg clk=0,rst_n=0,rx=1; wire tx; integer k,n=0; reg [7:0] got; reg [7:0] expected_bytes[0:2];\n fpga_top #(.CLKS_PER_BIT(C)) dut(.*); always #5 clk=~clk;\n task bit_time(input v); begin rx=v;repeat(C)@(posedge clk);end endtask\n task feed(input [7:0] b,input stop_ok);integer i;begin bit_time(0);for(i=0;i<8;i=i+1)bit_time(b[i]);bit_time(stop_ok);end endtask\n task capture; integer i,j; begin\n  wait(tx===0); repeat(C/2) @(posedge clk); if(tx!==0)$fatal(1,\"false start\");\n  for(i=0;i<8;i=i+1) begin repeat(C)@(posedge clk); got[i]=tx; end\n  repeat(C)@(posedge clk); if(tx!==1)$fatal(1,\"echo bad stop\");\n  if(got!==expected_bytes[n])$fatal(1,\"echo order n=%0d got=%h want=%h\",n,got,expected_bytes[n]); n=n+1;\n end endtask\n initial begin expected_bytes[0]=8'h31;expected_bytes[1]=8'hA6;expected_bytes[2]=8'h5C;repeat(2)@(posedge clk);rst_n=1;repeat(C)@(posedge clk);fork begin capture;capture;capture;end begin feed(8'h31,1);feed(8'hA6,1);feed(8'h5C,1);feed(8'h77,0);rx=1;end join\n  repeat(80) begin @(posedge clk);#1;if(tx!==1)$fatal(1,\"bad frame echoed or tx not idle\");end if(n!==3)$fatal(1,\"missing echoes\");\n  $display(\"ALL TESTS PASSED\");$finish;\n end\n\n initial begin #200000; $fatal(1,\"simulation timeout: the design never responded\"); end\nendmodule"
  },
  "hints": [
   "Reuse the exact receiver and transmitter interfaces from the earlier steps.",
   "A pending flag plus one byte register is enough elasticity.",
   "Prioritize launching the older held byte; on full-buffer overflow, leave it untouched."
  ],
  "solution": "module uart_tx #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire start,input wire [7:0] data,output reg tx,output reg busy,output reg done);\n localparam COUNT_WIDTH=(CLKS_PER_BIT<=2)?1:$clog2(CLKS_PER_BIT); reg [COUNT_WIDTH-1:0] count; reg [3:0] bit_index; reg [9:0] frame;\n always @(posedge clk) begin\n  if(!rst_n) begin tx<=1; busy<=0; done<=0; count<=0; bit_index<=0; frame<=10'h3ff; end\n  else begin done<=0;\n   if(!busy) begin tx<=1; if(start) begin frame<={1'b1,data,1'b0}; tx<=0; busy<=1; count<=0; bit_index<=0; end end\n   else if(count==CLKS_PER_BIT-1) begin count<=0; if(bit_index==9) begin tx<=1; busy<=0; done<=1; end else begin bit_index<=bit_index+1'b1; tx<=frame[bit_index+1'b1]; end end\n   else count<=count+1'b1;\n  end\n end\nendmodule\nmodule uart_rx #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire rx,output reg [7:0] data,output reg valid,output reg frame_error);\n localparam COUNT_WIDTH=(CLKS_PER_BIT<=2)?1:$clog2(CLKS_PER_BIT); localparam IDLE=0,START=1,BITS=2,STOP=3;\n reg [1:0] state; reg [COUNT_WIDTH-1:0] count; reg [2:0] bit_index; reg [7:0] shift; reg armed;\n always @(posedge clk) begin\n  if(!rst_n) begin data<=0;valid<=0;frame_error<=0;state<=IDLE;count<=0;bit_index<=0;shift<=0;armed<=0;end\n  else begin valid<=0;frame_error<=0;\n   case(state)\n    IDLE: begin count<=0; if(rx) armed<=1; else if(armed) begin state<=START; count<=0; armed<=0; end end\n    START: if(count==(CLKS_PER_BIT/2)-1) begin if(!rx) begin state<=BITS;count<=0;bit_index<=0;end else begin state<=IDLE;armed<=1;end end else count<=count+1'b1;\n    BITS: if(count==CLKS_PER_BIT-1) begin shift[bit_index]<=rx;count<=0;if(bit_index==7) state<=STOP;else bit_index<=bit_index+1'b1;end else count<=count+1'b1;\n    STOP: if(count==CLKS_PER_BIT-1) begin state<=IDLE;count<=0;if(rx) begin data<=shift;valid<=1;armed<=1;end else begin frame_error<=1;armed<=0;end end else count<=count+1'b1;\n   endcase\n  end\n end\nendmodule\nmodule fpga_top #(parameter CLKS_PER_BIT=4)(input wire clk,input wire rst_n,input wire rx,output reg tx);\n wire [7:0] rx_data; wire rx_valid,rx_error; wire tx_wire,tx_busy,tx_done; reg tx_start; reg [7:0] tx_data; reg pending; reg [7:0] held;\n uart_rx #(.CLKS_PER_BIT(CLKS_PER_BIT)) u_rx(.clk(clk),.rst_n(rst_n),.rx(rx),.data(rx_data),.valid(rx_valid),.frame_error(rx_error));\n uart_tx #(.CLKS_PER_BIT(CLKS_PER_BIT)) u_tx(.clk(clk),.rst_n(rst_n),.start(tx_start),.data(tx_data),.tx(tx_wire),.busy(tx_busy),.done(tx_done));\n always @* tx=tx_wire;\n always @(posedge clk) begin\n  if(!rst_n) begin tx_start<=0;tx_data<=0;pending<=0;held<=0;end else begin\n   tx_start<=0;\n   if(!tx_busy && pending) begin tx_data<=held;tx_start<=1;pending<=0;end\n   if(rx_valid) begin\n    if(!tx_busy && !pending) begin tx_data<=rx_data;tx_start<=1;end\n    else if(!pending) begin held<=rx_data;pending<=1;end\n   end\n  end\n end\nendmodule",
  "arc": {
   "id": "fpga-bringup",
   "name": "Build an FPGA bring-up design",
   "step": 5,
   "total": 5
  }
 }
]);
