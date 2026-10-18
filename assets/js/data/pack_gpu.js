/* GPU pack: 50 CUDA coding problems + 25 answer-box GPU math problems. */
registerProblems([
{
  id: "gpu-101", track: "gpu", branch: "CUDA Basics",
  title: "Vector Addition", difficulty: "easy",
  tags: ["elementwise", "launch config"],
  summary: "One thread per element: c[i] = a[i] + b[i]. The hello-world of CUDA, bounds check included.",
  statement: "Implement `__global__ void vec_add(const float* a, const float* b, float* c, int n)` so that c[i] = a[i] + b[i] for every 0 <= i < n. The arrays a, b, c are device pointers to n float32 elements with 1 <= n <= 2^24. Threads whose global index is >= n must perform no memory access. Output c is checked elementwise with absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`#include <cuda_runtime.h>

__global__ void vec_add(const float* __restrict__ a,
                        const float* __restrict__ b,
                        float* __restrict__ c, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: guard i < n, then c[i] = a[i] + b[i];
}

// Launch hint:
//   int block = 256;
//   int grid  = (n + block - 1) / block;
//   vec_add<<<grid, block>>>(a, b, c, n);` },
  solution: "Compute the global index i = blockIdx.x * blockDim.x + threadIdx.x and guard with if (i < n). One thread per element is enough; the kernel is purely memory-bound. A grid-stride loop is an acceptable alternative and makes the kernel insensitive to grid size."
},
{
  id: "gpu-102", track: "gpu", branch: "CUDA Basics",
  title: "SAXPY", difficulty: "easy",
  tags: ["elementwise", "BLAS"],
  summary: "out[i] = alpha * x[i] + y[i] — the classic single-precision ax plus y.",
  statement: "Implement `__global__ void saxpy(const float* x, const float* y, float* out, float alpha, int n)` computing out[i] = alpha * x[i] + y[i] for 0 <= i < n. All arrays hold n float32 elements on the device, 1 <= n <= 2^24, and alpha is passed by value. Threads with i >= n must not touch memory. Results are compared with absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`#include <cuda_runtime.h>

__global__ void saxpy(const float* __restrict__ x,
                      const float* __restrict__ y,
                      float* __restrict__ out,
                      float alpha, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) out[i] = alpha * x[i] + y[i];
}

// Launch hint: grid = (n + 255) / 256, block = 256
//   saxpy<<<grid, block>>>(x, y, out, alpha, n);` },
  solution: "Straight elementwise map with a bounds check. Use __restrict__ pointers so the compiler can keep values in registers; the kernel moves 12 bytes per 2 FLOPs and is entirely memory-bound, so there is nothing to optimize beyond coalesced access, which the natural indexing already gives."
},
{
  id: "gpu-103", track: "gpu", branch: "CUDA Basics",
  title: "Vector Scale", difficulty: "easy",
  tags: ["elementwise"],
  summary: "Scale every element of a vector by a constant, in place semantics via separate output.",
  statement: "Implement `__global__ void vscale(const float* x, float* out, float s, int n)` computing out[i] = s * x[i] for 0 <= i < n. x and out are device arrays of n float32 values, 1 <= n <= 2^24; x and out may alias, so do not read out. Threads with index >= n must not write. Tolerance is 1e-6 absolute.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void vscale(const float* __restrict__ x,
                       float* __restrict__ out, float s, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) out[i] = s * x[i];
}

// Launch hint: vscale<<<(n + 255) / 256, 256>>>(x, out, s, n);` },
  solution: "Index, bounds-check, multiply, store. Aliasing is safe because each thread reads x[i] exactly once before writing out[i] at the same index. Nothing else is needed; the kernel is a pure bandwidth stream."
},
{
  id: "gpu-104", track: "gpu", branch: "CUDA Basics",
  title: "ReLU Activation", difficulty: "easy",
  tags: ["elementwise", "activation"],
  summary: "Apply max(0, x) elementwise — the most common activation in deep learning.",
  statement: "Implement `__global__ void relu(const float* x, float* out, int n)` computing out[i] = max(0.0f, x[i]) for 0 <= i < n. Both arrays are n float32 elements on the device, 1 <= n <= 2^24. Out-of-range threads must not access memory. Output is verified with absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void relu(const float* __restrict__ x,
                     float* __restrict__ out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) out[i] = fmaxf(0.0f, x[i]);
}

// Launch hint: relu<<<(n + 255) / 256, 256>>>(x, out, n);` },
  solution: "Elementwise map with fmaxf(x[i], 0.0f). Branchless (fmaxf compiles to a single instruction), so there is no divergence concern. The kernel is bandwidth-bound; correctness only requires the bounds guard."
},
{
  id: "gpu-105", track: "gpu", branch: "CUDA Basics",
  title: "Sigmoid Activation", difficulty: "easy",
  tags: ["elementwise", "activation"],
  summary: "out[i] = 1 / (1 + exp(-x[i])) with correct behavior for large |x|.",
  statement: "Implement `__global__ void sigmoid(const float* x, float* out, int n)` computing the logistic sigmoid out[i] = 1 / (1 + expf(-x[i])) for 0 <= i < n. Inputs span [-88, 88] so expf must not overflow; 1 <= n <= 2^24. Threads with i >= n do nothing. Verified with absolute tolerance 1e-5.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void sigmoid(const float* __restrict__ x,
                        float* __restrict__ out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        // TODO: out[i] = 1.0f / (1.0f + expf(-x[i]));
    }
}

// Launch hint: sigmoid<<<(n + 255) / 256, 256>>>(x, out, n);` },
  solution: "out[i] = 1.0f / (1.0f + expf(-x[i])) is stable for the stated input range because expf(88) is finite in float32. Use expf (single precision) rather than exp to avoid double-precision throttling on consumer GPUs. Still memory-bound: two 4-byte accesses per element."
},
{
  id: "gpu-106", track: "gpu", branch: "CUDA Basics",
  title: "Tanh Activation", difficulty: "easy",
  tags: ["elementwise", "activation"],
  summary: "Elementwise tanhf over a device array.",
  statement: "Implement `__global__ void tanh_act(const float* x, float* out, int n)` computing out[i] = tanhf(x[i]) for 0 <= i < n. Arrays hold n float32 values, 1 <= n <= 2^24. Threads beyond n must not write. Absolute tolerance 1e-5.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void tanh_act(const float* __restrict__ x,
                         float* __restrict__ out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) out[i] = tanhf(x[i]);
}

// Launch hint: tanh_act<<<(n + 255) / 256, 256>>>(x, out, n);` },
  solution: "Direct elementwise tanhf. No numerical subtlety: tanhf saturates gracefully to +/-1. The kernel is memory-bound, so the only real decision is one thread per element with coalesced indexing."
},
{
  id: "gpu-107", track: "gpu", branch: "CUDA Basics",
  title: "1D Box Stencil", difficulty: "medium",
  tags: ["stencil", "boundaries"],
  summary: "3-point moving average with edge replication — your first boundary-condition kernel.",
  statement: "Implement `__global__ void stencil3(const float* in, float* out, int n)` computing out[i] = (in[i-1] + in[i] + in[i+1]) / 3 for 0 <= i < n, where out-of-range indices replicate the nearest edge value (in[-1] = in[0], in[n] = in[n-1]). The arrays hold n float32 values, 1 <= n <= 2^24. Threads with i >= n do nothing. Absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void stencil3(const float* __restrict__ in,
                         float* __restrict__ out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        // TODO: read in[i-1], in[i], in[i+1] with edge replication,
        // then out[i] = sum / 3.0f;
    }
}

// Launch hint: stencil3<<<(n + 255) / 256, 256>>>(in, out, n);` },
  solution: "Clamp the neighbor indices: int l = max(i - 1, 0), r = min(i + 1, n - 1), then out[i] = (in[l] + in[i] + in[r]) / 3.0f. Handling the boundary with clamped indices keeps every thread on the same code path and avoids divergent special cases. For large n a shared-memory tile with halo helps, but the global-memory version is correct and still coalesced."
},
{
  id: "gpu-108", track: "gpu", branch: "CUDA Basics",
  title: "Matrix-Vector Product", difficulty: "medium",
  tags: ["matvec", "reduction per row"],
  summary: "y = A x with one thread per output row; watch the uncoalesced x reuse.",
  statement: "Implement `__global__ void matvec(const float* A, const float* x, float* y, int m, int n)` where A is a row-major m x n float32 matrix and x has length n. Compute y[i] = sum over j of A[i*n + j] * x[j] for 0 <= i < m, using one thread per row. Constraints: 1 <= m, n <= 8192. Threads with i >= m must not write. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void matvec(const float* __restrict__ A,
                       const float* __restrict__ x,
                       float* __restrict__ y, int m, int n) {
    int row = blockIdx.x * blockDim.x + threadIdx.x;
    if (row < m) {
        float acc = 0.0f;
        // TODO: loop j = 0..n-1, acc += A[row*n + j] * x[j];
        y[row] = acc;
    }
}

// Launch hint: matvec<<<(m + 255) / 256, 256>>>(A, x, y, m, n);` },
  solution: "One thread per row: acc += A[row*n + j] * x[j] in a scalar loop. Row-major layout makes A reads perfectly coalesced across threads, and x is reused so heavily it lives in L2/L1 cache. The follow-up optimization is one warp per row with a shuffle reduction, which also coalesces along the row for wide matrices."
},
{
  id: "gpu-109", track: "gpu", branch: "CUDA Basics",
  title: "Fused Bias + ReLU", difficulty: "easy",
  tags: ["fusion", "elementwise"],
  summary: "out[r][c] = relu(x[r][c] + bias[c]) — fuse two ops, save a memory round-trip.",
  statement: "Implement `__global__ void bias_relu(const float* x, const float* bias, float* out, int rows, int cols)` computing out[r*cols + c] = max(0.0f, x[r*cols + c] + bias[c]) for a row-major rows x cols matrix x and a per-column bias vector of length cols. Constraints: 1 <= rows*cols <= 2^24. One thread per element; threads beyond rows*cols do nothing. Absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void bias_relu(const float* __restrict__ x,
                          const float* __restrict__ bias,
                          float* __restrict__ out, int rows, int cols) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < rows * cols) {
        int c = i % cols;
        // TODO: out[i] = fmaxf(0.0f, x[i] + bias[c]);
    }
}

// Launch hint: bias_relu<<<(rows*cols + 255) / 256, 256>>>(x, bias, out, rows, cols);` },
  solution: "Derive the column c = i % cols from the flat index, then out[i] = fmaxf(0.0f, x[i] + bias[c]). The bias row is tiny and cached, so the modulo costs less than a separate bias-add kernel pass. Fusing the activation into the bias add halves global traffic compared to running them as two kernels."
},
{
  id: "gpu-110", track: "gpu", branch: "CUDA Basics",
  title: "Elementwise Clamp", difficulty: "easy",
  tags: ["elementwise"],
  summary: "Clamp every element into [lo, hi] — one line, but do it branch-free.",
  statement: "Implement `__global__ void vclamp(const float* x, float* out, float lo, float hi, int n)` computing out[i] = min(max(x[i], lo), hi) for 0 <= i < n. You may assume lo <= hi; 1 <= n <= 2^24. Threads with i >= n do nothing. Absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void vclamp(const float* __restrict__ x,
                       float* __restrict__ out,
                       float lo, float hi, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) out[i] = fminf(fmaxf(x[i], lo), hi);
}

// Launch hint: vclamp<<<(n + 255) / 256, 256>>>(x, out, lo, hi, n);` },
  solution: "fminf(fmaxf(x[i], lo), hi) is branchless and compiles to two instructions. An if/else version also works but adds divergence when values straddle both bounds. Pure memory-bound stream like the other elementwise maps."
},
{
  id: "gpu-111", track: "gpu", branch: "CUDA Basics",
  title: "Arange Kernel", difficulty: "easy",
  tags: ["elementwise", "indexing"],
  summary: "Fill out[i] = start + i * step — a kernel with no input array at all.",
  statement: "Implement `__global__ void arange(float* out, float start, float step, int n)` writing out[i] = start + (float)i * step for 0 <= i < n. out is a device array of n float32 values, 1 <= n <= 2^24. Threads with i >= n must not write. Absolute tolerance 1e-4 (values can be large; the reference computes start + i*step in float).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void arange(float* __restrict__ out,
                       float start, float step, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) out[i] = start + (float)i * step;
}

// Launch hint: arange<<<(n + 255) / 256, 256>>>(out, start, step, n);` },
  solution: "out[i] = start + (float)i * step with the bounds guard. Match the reference rounding exactly: convert i to float first, then multiply by step, then add start — reordering the arithmetic can exceed the tolerance for large n. No input traffic; the kernel is write-bandwidth-bound."
},
{
  id: "gpu-112", track: "gpu", branch: "CUDA Basics",
  title: "RGB to Grayscale", difficulty: "easy",
  tags: ["image", "layout"],
  summary: "Interleaved RGB to gray with the ITU-R 601 luma coefficients.",
  statement: "Implement `__global__ void rgb2gray(const unsigned char* rgb, float* gray, int npix)` for an image stored as interleaved RGB (3 bytes per pixel: rgb[3*p], rgb[3*p+1], rgb[3*p+2]). Compute gray[p] = 0.299f*R + 0.587f*G + 0.114f*B for 0 <= p < npix, with 1 <= npix <= 2^22. Threads beyond npix do nothing. Absolute tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void rgb2gray(const unsigned char* __restrict__ rgb,
                         float* __restrict__ gray, int npix) {
    int p = blockIdx.x * blockDim.x + threadIdx.x;
    if (p < npix) {
        // TODO: read rgb[3*p + {0,1,2}], apply luma weights,
        // store gray[p].
    }
}

// Launch hint: rgb2gray<<<(npix + 255) / 256, 256>>>(rgb, gray, npix);` },
  solution: "One thread per pixel: float r = rgb[3*p], g = rgb[3*p+1], b = rgb[3*p+2]; gray[p] = 0.299f*r + 0.587f*g + 0.114f*b. The 3-byte interleaved stride breaks perfect coalescing — a structure-of-arrays layout or uchar4 padding would fix it — but correctness only needs the right indices and weights."
},
{
  id: "gpu-113", track: "gpu", branch: "Memory Optimization",
  title: "Naive Matrix Transpose", difficulty: "medium",
  tags: ["transpose", "coalescing"],
  summary: "out[j][i] = in[i][j] directly in global memory — feel the uncoalesced writes.",
  statement: "Implement `__global__ void transpose_naive(const float* in, float* out, int w, int h)` transposing a row-major h x w float32 matrix: out has shape w x h row-major, i.e. out[i*h + j] = in[j*w + i] for 0 <= j < h, 0 <= i < w. Equivalently out[col][row] = in[row][col]. Constraints: 1 <= w, h <= 4096. Use one thread per input element with a 2D grid. Exact match expected (tolerance 0).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void transpose_naive(const float* __restrict__ in,
                                float* __restrict__ out, int w, int h) {
    int col = blockIdx.x * blockDim.x + threadIdx.x;  // x = column of input
    int row = blockIdx.y * blockDim.y + threadIdx.y;  // y = row of input
    if (col < w && row < h) {
        // TODO: out[col*h + row] = in[row*w + col];
    }
}

// Launch hint:
//   dim3 block(16, 16);
//   dim3 grid((w + 15) / 16, (h + 15) / 16);
//   transpose_naive<<<grid, block>>>(in, out, w, h);` },
  solution: "Direct index swap: out[col*h + row] = in[row*w + col]. Reads along a warp are coalesced (consecutive col), but writes stride by h — 32 separate transactions per warp. That is exactly the problem the tiled version solves; keep this one as the correctness baseline."
},
{
  id: "gpu-114", track: "gpu", branch: "Memory Optimization",
  title: "Tiled Transpose with Padding", difficulty: "medium",
  tags: ["transpose", "shared memory", "bank conflicts"],
  summary: "Transpose through a 32x32 shared tile padded to 33 columns: coalesced both ways, zero conflicts.",
  statement: "Implement `__global__ void transpose_tiled(const float* in, float* out, int w, int h)` with the same contract as the naive transpose: out[col*h + row] = in[row*w + col], 1 <= w, h <= 4096. Stage a 32x32 tile in shared memory declared as float tile[32][33] (the extra column kills bank conflicts), synchronize, then write the tile out transposed. Handle partial tiles at the edges with bounds checks. Tolerance 0.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void transpose_tiled(const float* __restrict__ in,
                                float* __restrict__ out, int w, int h) {
    __shared__ float tile[32][33];
    int x = blockIdx.x * 32 + threadIdx.x;   // input column
    int y = blockIdx.y * 32 + threadIdx.y;   // input row
    // TODO 1: if (x < w && y < h) tile[threadIdx.y][threadIdx.x] = in[y*w + x];
    __syncthreads();
    // TODO 2: write transposed. Output position is swapped:
    //   int xo = blockIdx.y * 32 + threadIdx.x;  // output column (old row)
    //   int yo = blockIdx.x * 32 + threadIdx.y;  // output row    (old col)
    //   if (xo < h && yo < w) out[yo*h + xo] = tile[threadIdx.x][threadIdx.y];
}

// Launch hint: dim3 block(32, 8); grid((w+31)/32, (h+31)/32) with four
// rows staged per thread, or simply dim3 block(32, 32), grid((w+31)/32, (h+31)/32).` },
  solution: "Load tile[ty][tx] = in[y*w + x] (coalesced reads, conflict-free shared writes), sync, then store out[yo*h + xo] = tile[tx][ty] with swapped block coordinates so both global accesses coalesce. The [32][33] padding makes the column-stride read of the tile bank-conflict-free (stride 33 is coprime with 32). Edge tiles are handled by the bounds checks on both load and store."
},
{
  id: "gpu-115", track: "gpu", branch: "Memory Optimization",
  title: "Naive GEMM", difficulty: "medium",
  tags: ["GEMM", "indexing"],
  summary: "C = A x B, one thread per output element. Slow but the baseline every optimization beats.",
  statement: "Implement `__global__ void gemm_naive(const float* A, const float* B, float* C, int M, int N, int K)` computing C = A x B where A is M x K, B is K x N, C is M x N, all row-major float32: C[i*N + j] = sum over k of A[i*K + k] * B[k*N + j]. Constraints: 1 <= M, N, K <= 1024. One thread per output element with a 2D grid; out-of-range threads return. Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void gemm_naive(const float* __restrict__ A,
                           const float* __restrict__ B,
                           float* __restrict__ C, int M, int N, int K) {
    int j = blockIdx.x * blockDim.x + threadIdx.x;  // column of C
    int i = blockIdx.y * blockDim.y + threadIdx.y;  // row of C
    if (i < M && j < N) {
        float acc = 0.0f;
        // TODO: for (int k = 0; k < K; ++k) acc += A[i*K + k] * B[k*N + j];
        C[i*N + j] = acc;
    }
}

// Launch hint:
//   dim3 block(16, 16);
//   dim3 grid((N + 15) / 16, (M + 15) / 16);
//   gemm_naive<<<grid, block>>>(A, B, C, M, N, K);` },
  solution: "Scalar k-loop per output element. Reads of A along a warp are broadcast (same row) while B reads stride by N, so each warp issues N-strided loads — brutal on bandwidth. The kernel is correct and is the reference for the tiled version, which reuses tiles from shared memory and cuts global traffic by the tile width."
},
{
  id: "gpu-116", track: "gpu", branch: "Memory Optimization",
  title: "Shared-Memory Tiled GEMM", difficulty: "hard",
  tags: ["GEMM", "shared memory", "tiling"],
  summary: "Classic 16x16 shared-tile GEMM: stage A and B tiles, accumulate, slide the window.",
  statement: "Implement `__global__ void gemm_tiled(const float* A, const float* B, float* C, int M, int N, int K)` with the GEMM contract C[i*N + j] = sum_k A[i*K + k] * B[k*N + j], all row-major, 1 <= M, N, K <= 2048. Use a 16x16 thread block with two __shared__ tiles As[16][16] and Bs[16][16], loop over K in 16-wide steps, and guard every global load against M/N/K edges (zero-fill out-of-range tile elements). Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`#define T 16

__global__ void gemm_tiled(const float* __restrict__ A,
                           const float* __restrict__ B,
                           float* __restrict__ C, int M, int N, int K) {
    __shared__ float As[T][T];
    __shared__ float Bs[T][T];
    int tx = threadIdx.x, ty = threadIdx.y;
    int row = blockIdx.y * T + ty;   // row of C
    int col = blockIdx.x * T + tx;   // col of C
    float acc = 0.0f;
    for (int t = 0; t < (K + T - 1) / T; ++t) {
        // TODO: stage As[ty][tx] = A[row*K + t*T + tx] (0 if out of range)
        //       stage Bs[ty][tx] = B[(t*T + ty)*N + col] (0 if out of range)
        __syncthreads();
        // TODO: for (int k = 0; k < T; ++k) acc += As[ty][k] * Bs[k][tx];
        __syncthreads();
    }
    if (row < M && col < N) C[row*N + col] = acc;
}

// Launch hint: dim3 block(T, T), grid((N+T-1)/T, (M+T-1)/T).` },
  solution: "Each block owns a 16x16 C tile. Per k-step, threads cooperatively load one 16x16 A tile and one 16x16 B tile into shared memory (coalesced), synchronize, then each thread accumulates 16 products from shared memory. Zero-filling out-of-range tile elements makes edge handling free since 0*x contributes nothing. Each global element is now fetched K/16 instead of K times — a 16x traffic reduction."
},
{
  id: "gpu-117", track: "gpu", branch: "Memory Optimization",
  title: "2D Convolution, Tiled with Halo", difficulty: "hard",
  tags: ["convolution", "shared memory", "halo"],
  summary: "3x3 convolution over a shared tile plus halo ring — the stencil optimization that matters.",
  statement: "Implement `__global__ void conv2d_3x3(const float* img, const float* ker, float* out, int w, int h)` applying a 3x3 kernel to an h x w row-major float32 image with zero padding outside: out[y*w + x] = sum over dy,dx in [-1,1] of ker[(dy+1)*3 + (dx+1)] * img[(y+dy)*w + (x+dx)] (treat out-of-range img reads as 0). Constraints: 1 <= w, h <= 2048. Use a 16x16 block with an 18x18 shared tile (16 outputs + 1-wide halo). Absolute tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void conv2d_3x3(const float* __restrict__ img,
                           const float* __restrict__ ker,
                           float* __restrict__ out, int w, int h) {
    __shared__ float tile[18][18];
    int tx = threadIdx.x, ty = threadIdx.y;          // 0..15
    int gx = blockIdx.x * 16 + tx;                   // global output x
    int gy = blockIdx.y * 16 + ty;                   // global output y
    // TODO 1: each thread loads tile[ty+1][tx+1] = img[gy*w+gx] (0 outside),
    //         and threads on the border also load the halo ring (18x18 total).
    __syncthreads();
    // TODO 2: if (gx < w && gy < h) accumulate the 3x3 window from tile
    //         and store out[gy*w + gx].
}

// Launch hint: dim3 block(16,16), grid((w+15)/16, (h+15)/16).` },
  solution: "Load the 18x18 input region into shared memory — center 16x16 cooperatively, then let edge threads grab the halo (or redundantly load 4 tiles per thread). After __syncthreads, each thread computes its 3x3 dot product entirely from shared memory: 9 shared reads instead of up to 9 global ones. Zero-fill handles image borders; the kernel weights, being read-only and uniform, could also live in __constant__ memory."
},
{
  id: "gpu-118", track: "gpu", branch: "Memory Optimization",
  title: "Separable Box Blur", difficulty: "medium",
  tags: ["image", "separable filter"],
  summary: "Blur an image with two 1D passes instead of one 2D pass — O(r) instead of O(r^2) per pixel.",
  statement: "Implement two kernels, `__global__ void blur_rows(const float* in, float* tmp, int w, int h)` and `__global__ void blur_cols(const float* tmp, float* out, int w, int h)`, together applying a 5-tap box blur (radius 2) to an h x w row-major float32 image with edge replication. blur_rows averages each pixel with its 4 horizontal neighbors into tmp; blur_cols does the same vertically from tmp into out. Constraints: 1 <= w, h <= 4096. One thread per pixel. Absolute tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void blur_rows(const float* __restrict__ in,
                          float* __restrict__ tmp, int w, int h) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    if (x < w && y < h) {
        float acc = 0.0f;
        // TODO: for dx = -2..2, clamp x+dx to [0, w-1], accumulate in[y*w + xc]
        tmp[y*w + x] = acc / 5.0f;
    }
}

__global__ void blur_cols(const float* __restrict__ tmp,
                          float* __restrict__ out, int w, int h) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    if (x < w && y < h) {
        float acc = 0.0f;
        // TODO: for dy = -2..2, clamp y+dy to [0, h-1], accumulate tmp[yc*w + x]
        out[y*w + x] = acc / 5.0f;
    }
}

// Launch hint: dim3 block(16,16), grid((w+15)/16, (h+15)/16); call rows then cols.` },
  solution: "A 5x5 box blur costs 25 taps per pixel; because the filter is separable, a horizontal 5-tap pass plus a vertical 5-tap pass computes the identical result with 10 taps. Clamp indices to the edge for the replicate boundary. The row pass is coalesced; the column pass strides by w, so a production version stages tiles in shared memory — but two simple global passes already beat the naive 2D kernel."
},
{
  id: "gpu-119", track: "gpu", branch: "Memory Optimization",
  title: "Privatized Histogram", difficulty: "hard",
  tags: ["histogram", "atomics", "shared memory"],
  summary: "256-bin histogram via per-block shared copies, atomically merged once per block.",
  statement: "Implement `__global__ void histogram_priv(const unsigned char* data, unsigned int* hist, int n)` computing a 256-bin histogram of byte values: for each of n bytes, hist[data[i]] += 1. Build a private 256-bin histogram in shared memory per block (zeroed first), accumulate into it with atomicAdd on shared memory, then merge into the global hist with one atomicAdd per bin per block. hist is pre-zeroed by the caller. Constraints: 1 <= n <= 2^28. Exact integer match required.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void histogram_priv(const unsigned char* __restrict__ data,
                               unsigned int* hist, int n) {
    __shared__ unsigned int sh[256];
    // TODO 1: zero sh[0..255] cooperatively (threads cover 256 bins), then __syncthreads();
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    int stride = gridDim.x * blockDim.x;
    // TODO 2: grid-stride loop: for (; i < n; i += stride)
    //            atomicAdd(&sh[data[i]], 1u);
    __syncthreads();
    // TODO 3: merge: for (int b = threadIdx.x; b < 256; b += blockDim.x)
    //            if (sh[b]) atomicAdd(&hist[b], sh[b]);
}

// Launch hint: use a fixed grid, e.g. 8 * numSMs blocks of 256 threads.` },
  solution: "Global atomics on 256 bins serialize horribly when many threads hit the same bin. A per-block shared copy turns the hot loop into fast shared-memory atomics (hardware-accelerated on modern architectures), and only 256 global atomics per block remain for the merge. Zero the shared array with a cooperative loop and __syncthreads before and after accumulation. A grid-stride loop decouples the launch size from n."
},
{
  id: "gpu-120", track: "gpu", branch: "Memory Optimization",
  title: "Vectorized SAXPY (float4)", difficulty: "medium",
  tags: ["vectorization", "float4", "bandwidth"],
  summary: "Process 4 floats per thread with float4 loads — quarter the instructions, same bytes.",
  statement: "Implement `__global__ void saxpy4(const float4* x, const float4* y, float4* out, float alpha, int n4)` computing saxpy on float4 elements: out[i] componentwise = alpha * x[i] + y[i], where the arrays hold n4 float4 elements (total floats = 4*n4, and the caller guarantees divisibility by 4 and 16-byte alignment). Constraints: 1 <= n4 <= 2^22. Threads with i >= n4 do nothing. Absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void saxpy4(const float4* __restrict__ x,
                       const float4* __restrict__ y,
                       float4* __restrict__ out, float alpha, int n4) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n4) {
        float4 xv = x[i], yv = y[i];
        float4 r;
        // TODO: r.x = alpha * xv.x + yv.x;  (same for .y, .z, .w)
        out[i] = r;
    }
}

// Launch hint: grid covers n4 (not n): ((n4 + 255) / 256), block 256.` },
  solution: "One float4 load per input per thread moves 16 bytes with a single memory instruction, cutting instruction count and index arithmetic by 4x while keeping the same byte traffic. The pointers are reinterpret_cast float4* on the host side. For memory-bound kernels the gain is modest once bandwidth-saturated, but it also relieves issue pressure, which helps at lower occupancy. Handle the tail with a scalar epilogue when n is not divisible by 4 (not needed here)."
},
{
  id: "gpu-121", track: "gpu", branch: "Memory Optimization",
  title: "Warp-Shuffle Reduction", difficulty: "medium",
  tags: ["reduction", "warp shuffle"],
  summary: "Reduce 1024 values in one block using __shfl_down_sync — no shared memory for the last 32.",
  statement: "Implement `__global__ void warp_reduce_sum(const float* in, float* out, int n)` where n = 1024 exactly and the kernel is launched with a single block of 1024 threads. Compute out[0] = sum of in[0..1023]. First reduce pairs in shared memory down to 32 values (one per warp lane... i.e., one value per warp lane after strided halving to 64, then 32), then finish with __shfl_down_sync(0xffffffff, v, offset) inside the first warp. Only thread 0 writes out[0]. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void warp_reduce_sum(const float* __restrict__ in,
                                float* __restrict__ out, int n) {
    __shared__ float sh[32];
    int tid = threadIdx.x;
    float v = in[tid] + in[tid + 512];   // 1024 -> 512
    // TODO 1: keep halving in registers/shared down to one value per warp:
    //         for (int s = 256; s >= 32; s >>= 1) needs shared storage,
    //         or use sh[] staging with __syncthreads().
    // TODO 2: first warp: for (int off = 16; off > 0; off >>= 1)
    //            v += __shfl_down_sync(0xffffffffu, v, off);
    // TODO 3: if (tid == 0) out[0] = v;
}

// Launch hint: warp_reduce_sum<<<1, 1024>>>(in, out, n);` },
  solution: "Halve in shared memory while more than 32 values remain (each step: sh staging, __syncthreads, v += partner). Once a single warp holds 32 partials, switch to __shfl_down_sync with offsets 16, 8, 4, 2, 1 — these need no shared memory and no __syncthreads because shuffles are warp-synchronous. Thread 0 then holds the total. This is the standard last-warp optimization in every fast reduction."
},
{
  id: "gpu-122", track: "gpu", branch: "Memory Optimization",
  title: "Shared-Memory Tiled 1D Stencil", difficulty: "medium",
  tags: ["stencil", "shared memory", "halo"],
  summary: "3-point stencil revisited: load the tile once, compute entirely from shared memory.",
  statement: "Implement `__global__ void stencil3_tiled(const float* in, float* out, int n)` with the same contract as the 1D box stencil: out[i] = (in[i-1] + in[i] + in[i+1]) / 3 with edge replication (in[-1] = in[0], in[n] = in[n-1]), 1 <= n <= 2^24. Launch with 256 threads per block; each block stages 258 values (256 outputs + 2 halo cells) in shared memory before computing. Threads with global i >= n must not write out. Absolute tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void stencil3_tiled(const float* __restrict__ in,
                               float* __restrict__ out, int n) {
    __shared__ float sh[256 + 2];
    int i = blockIdx.x * blockDim.x + threadIdx.x;   // global output index
    int tx = threadIdx.x;
    // TODO 1: center load: if (i < n) sh[tx + 1] = in[i]; else sh[tx + 1] = 0.0f;
    // TODO 2: halo: threads 0 and 255 (or tx==0 / tx==blockDim.x-1) load
    //         sh[0] = in[max(i-1,0)] and sh[257] = in[min(i+1,n-1)] with
    //         edge replication for block boundaries at 0 and n-1.
    __syncthreads();
    // TODO 3: if (i < n) out[i] = (sh[tx] + sh[tx+1] + sh[tx+2]) / 3.0f;
}

// Launch hint: stencil3_tiled<<<(n + 255) / 256, 256>>>(in, out, n);` },
  solution: "Each global element is read ~1.02x instead of ~3x: the block cooperatively loads 256 centers, and two threads fetch the left/right halo cells (clamped to the array edges for the first/last block). After __syncthreads, each output averages three shared values. The boundary replication for interior block edges is naturally satisfied because the halo holds real neighbor data; only the global array ends need clamping."
},
{
  id: "gpu-123", track: "gpu", branch: "Memory Optimization",
  title: "SoA Dot Product", difficulty: "medium",
  tags: ["coalescing", "SoA", "reduction"],
  summary: "Dot product over struct-of-arrays inputs with block reduce and a single atomicAdd.",
  statement: "Implement `__global__ void dot_soa(const float* xs, const float* ys, float* out, int n)` computing out[0] += sum over i of xs[i] * ys[i] (out is pre-zeroed by the caller; use atomicAdd to accumulate each block's partial). Data is stored struct-of-arrays: two separate contiguous arrays of n float32 values, 1 <= n <= 2^24. Use a per-block shared-memory reduction so each block issues at most one global atomicAdd. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void dot_soa(const float* __restrict__ xs,
                        const float* __restrict__ ys,
                        float* out, int n) {
    __shared__ float sh[256];
    int tid = threadIdx.x;
    int i = blockIdx.x * blockDim.x + tid;
    float v = 0.0f;
    // TODO 1: if (i < n) v = xs[i] * ys[i];
    sh[tid] = v;
    __syncthreads();
    // TODO 2: tree-reduce sh[] down to sh[0]
    // TODO 3: if (tid == 0) atomicAdd(out, sh[0]);
}

// Launch hint: dot_soa<<<(n + 255) / 256, 256>>>(xs, ys, out, n);` },
  solution: "Each thread multiplies one pair (perfectly coalesced because SoA keeps both streams contiguous), then a classic shared-memory tree reduction produces one partial per block, merged with a single atomicAdd. Contrast with array-of-structs float2 input: the same math would interleave x,y and waste half of every 128-byte transaction. AtomicAdd(float) non-determinism is why the tolerance is relative rather than exact."
},
{
  id: "gpu-124", track: "gpu", branch: "Memory Optimization",
  title: "Convolution with Constant Memory", difficulty: "medium",
  tags: ["constant memory", "convolution"],
  summary: "Put the 3x3 kernel weights in __constant__ memory and let the broadcast cache feed the warp.",
  statement: "A 3x3 filter is stored in `__constant__ float cK[9];` (already declared at file scope and filled by the host with cudaMemcpyToSymbol). Implement `__global__ void conv2d_const(const float* img, float* out, int w, int h)` computing out[y*w + x] = sum over dy,dx in [-1,1] of cK[(dy+1)*3 + (dx+1)] * img[(y+dy)*w + (x+dx)], with zero padding outside the image, 1 <= w, h <= 2048, one thread per pixel. Absolute tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__constant__ float cK[9];   // filled via cudaMemcpyToSymbol by the host

__global__ void conv2d_const(const float* __restrict__ img,
                             float* __restrict__ out, int w, int h) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    if (x < w && y < h) {
        float acc = 0.0f;
        // TODO: for dy in -1..1, dx in -1..1:
        //   int ix = x + dx, iy = y + dy;
        //   if (0 <= ix < w && 0 <= iy < h) acc += cK[...] * img[iy*w + ix];
        out[y*w + x] = acc;
    }
}

// Launch hint: dim3 block(16,16), grid((w+15)/16, (h+15)/16).` },
  solution: "Read weights from cK instead of a global pointer. Every thread in a warp reads the same weight address each cycle, which is exactly the constant-cache broadcast pattern: one fetch feeds the whole warp and stays cached across blocks. Global kernel weights would be re-fetched per thread from L2/L1. The image reads remain the traffic bottleneck, so this is best combined with the shared-tile version."
},
{
  id: "gpu-125", track: "gpu", branch: "Parallel Algorithms",
  title: "Block Reduction: Sum", difficulty: "medium",
  tags: ["reduction", "shared memory"],
  summary: "Sum 1024 floats in one block with a shared-memory tree reduction.",
  statement: "Implement `__global__ void block_sum(const float* in, float* out, int n)` launched with a single block of 512 threads and n = 1024: compute out[0] = sum of in[0..1023]. Each thread first adds two strided elements (in[tid] + in[tid + 512]), then a shared-memory tree reduction halves the active count each step with __syncthreads between steps. Thread 0 writes out[0]. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void block_sum(const float* __restrict__ in,
                          float* __restrict__ out, int n) {
    __shared__ float sh[512];
    int tid = threadIdx.x;
    sh[tid] = in[tid] + in[tid + blockDim.x];   // 1024 -> 512
    __syncthreads();
    // TODO: for (int s = blockDim.x / 2; s > 0; s >>= 1) {
    //           if (tid < s) sh[tid] += sh[tid + s];
    //           __syncthreads();
    //       }
    // TODO: if (tid == 0) out[0] = sh[0];
}

// Launch hint: block_sum<<<1, 512>>>(in, out, n);` },
  solution: "Two-level load halves the data before the tree starts, so only 512 threads are needed for 1024 elements. The for-loop with stride s = 256, 128, ... 1 accumulates into sh[0]; the __syncthreads inside the loop is mandatory. For extra credit the last 32 elements can be reduced with warp shuffles to skip the final synchronizations. Note the if (tid < s) guard is warp-divergent only below s = 32."
},
{
  id: "gpu-126", track: "gpu", branch: "Parallel Algorithms",
  title: "Block Reduction: Maximum", difficulty: "easy",
  tags: ["reduction"],
  summary: "Same tree shape, different operator: max is associative too.",
  statement: "Implement `__global__ void block_max(const float* in, float* out, int n)` launched with a single block of 512 threads and n = 1024: compute out[0] = max of in[0..1023] using a shared-memory tree reduction with fmaxf. Each thread starts from fmaxf(in[tid], in[tid + 512]). Thread 0 writes the result. Exact match expected for the max (tolerance 0, since max involves no rounding).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void block_max(const float* __restrict__ in,
                          float* __restrict__ out, int n) {
    __shared__ float sh[512];
    int tid = threadIdx.x;
    sh[tid] = fmaxf(in[tid], in[tid + blockDim.x]);
    __syncthreads();
    // TODO: tree-reduce with fmaxf down to sh[0]; thread 0 writes out[0].
}

// Launch hint: block_max<<<1, 512>>>(in, out, n);` },
  solution: "Identical structure to the sum reduction with + replaced by fmaxf — any associative, commutative operator fits the tree pattern. Max (and min) have the nice property of being exact: no floating-point reordering error, so the result is bit-identical to the sequential answer. Initialize with the pairwise fmaxf so no sentinel like -INFINITY is needed."
},
{
  id: "gpu-127", track: "gpu", branch: "Parallel Algorithms",
  title: "Block Inclusive Scan", difficulty: "hard",
  tags: ["scan", "prefix sum", "shared memory"],
  summary: "Hillis-Steele inclusive scan of 1024 elements in shared memory.",
  statement: "Implement `__global__ void scan_inclusive(const float* in, float* out, int n)` launched with a single block of 1024 threads and n = 1024: compute the inclusive prefix sum out[i] = in[0] + ... + in[i]. Use the Hillis-Steele algorithm in shared memory: for offsets 1, 2, 4, ..., 512, every thread adds the value offset positions behind it, with double buffering or careful staging and __syncthreads() twice per step to avoid read-write hazards. Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void scan_inclusive(const float* __restrict__ in,
                               float* __restrict__ out, int n) {
    __shared__ float a[1024];
    __shared__ float b[1024];
    int tid = threadIdx.x;
    a[tid] = in[tid];
    __syncthreads();
    float* src = a; float* dst = b;
    // TODO: for (int off = 1; off < n; off <<= 1) {
    //           dst[tid] = src[tid] + (tid >= off ? src[tid - off] : 0.0f);
    //           __syncthreads();
    //           swap(src, dst);
    //       }
    // TODO: out[tid] = src[tid];
}

// Launch hint: scan_inclusive<<<1, 1024>>>(in, out, n);` },
  solution: "Hillis-Steele: at step offset = 2^k, each element adds the partial offset places behind; after log2(n) steps every position holds its inclusive prefix. Double buffering (or writing both src[tid] and the guarded src[tid-off] read into dst with a sync before and after) avoids in-place hazards. It does O(n log n) work — Blelloch's work-efficient scan is the harder follow-up — but for 1024 elements simplicity wins."
},
{
  id: "gpu-128", track: "gpu", branch: "Parallel Algorithms",
  title: "Block Exclusive Scan", difficulty: "medium",
  tags: ["scan", "prefix sum"],
  summary: "Exclusive scan = inclusive scan shifted right by one, identity in front.",
  statement: "Implement `__global__ void scan_exclusive(const float* in, float* out, int n)` launched with a single block of 1024 threads and n = 1024: compute the exclusive prefix sum out[i] = in[0] + ... + in[i-1], with out[0] = 0.0f. You may compute an inclusive scan in shared memory and shift it right by one position when writing out. Relative tolerance 1e-3; out[0] must be exactly 0.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void scan_exclusive(const float* __restrict__ in,
                               float* __restrict__ out, int n) {
    __shared__ float sh[1024];
    int tid = threadIdx.x;
    sh[tid] = in[tid];
    __syncthreads();
    // TODO: Hillis-Steele inclusive scan in sh[] (see scan_inclusive).
    // TODO: out[tid] = (tid == 0) ? 0.0f : sh[tid - 1];
}

// Launch hint: scan_exclusive<<<1, 1024>>>(in, out, n);` },
  solution: "Reuse the inclusive scan, then write out[tid] = tid ? sh[tid-1] : 0.0f. The shift must happen after the scan is fully synchronized, or threads read partially-updated neighbors. Exclusive scans are the workhorse of stream compaction and radix sort, where position offsets must not include the element itself."
},
{
  id: "gpu-129", track: "gpu", branch: "Parallel Algorithms",
  title: "Large-Array Scan (Multi-Block)", difficulty: "hard",
  tags: ["scan", "multi-block"],
  summary: "Scan up to 2^20 elements: per-block scans, then add scanned block sums.",
  statement: "Implement two kernels for an inclusive scan over n up to 2^20 elements with 1024-thread blocks. `__global__ void scan_local(const float* in, float* out, float* blockSums, int n)` performs an inclusive scan of each block's chunk into out and writes that block's total to blockSums[blockIdx.x]. The host then inclusively scans blockSums (small; done on CPU). `__global__ void add_block_offsets(float* out, const float* scannedSums, int n)` adds scannedSums[blockIdx.x - 1] (0 for block 0) to every element of the block. Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void scan_local(const float* __restrict__ in,
                           float* __restrict__ out,
                           float* __restrict__ blockSums, int n) {
    __shared__ float sh[1024];
    int tid = threadIdx.x;
    int i = blockIdx.x * blockDim.x + tid;
    sh[tid] = (i < n) ? in[i] : 0.0f;
    __syncthreads();
    // TODO 1: Hillis-Steele inclusive scan of sh[0..1023].
    // TODO 2: if (i < n) out[i] = sh[tid];
    // TODO 3: if (tid == blockDim.x - 1) blockSums[blockIdx.x] = sh[1023];
}

__global__ void add_block_offsets(float* __restrict__ out,
                                  const float* __restrict__ scannedSums, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n && blockIdx.x > 0) out[i] += scannedSums[blockIdx.x - 1];
}

// Launch hint: grid = (n + 1023) / 1024, block = 1024 for both kernels.` },
  solution: "The classic three-phase decomposition: (1) scan each block locally and record block totals, (2) scan the (few) block totals — with up to 2^20 elements there are at most 1024 block sums, trivially done on the host or with one more block-level scan, (3) a second pass adds each block's exclusive offset. Zero-padding out-of-range threads in phase 1 keeps the block total correct. This work-efficient structure is how thrust::inclusive_scan and CUB operate at scale."
},
{
  id: "gpu-130", track: "gpu", branch: "Parallel Algorithms",
  title: "Stream Compaction", difficulty: "hard",
  tags: ["compaction", "scan"],
  summary: "Filter with a predicate: scan the flags, scatter the survivors, keep the order.",
  statement: "Implement `__global__ void compact(const float* in, const int* flags, float* out, int* count, int n)` launched with a single block of 1024 threads and n = 1024. flags[i] is 0 or 1; copy every in[i] with flags[i] == 1 into out, preserving relative order, and write the number of kept elements to count[0]. Hint: the exclusive scan of flags gives each survivor its output position. Order must be exact; values compared with tolerance 1e-6.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void compact(const float* __restrict__ in,
                        const int* __restrict__ flags,
                        float* __restrict__ out,
                        int* count, int n) {
    __shared__ int sh[1024];
    int tid = threadIdx.x;
    sh[tid] = flags[tid];
    __syncthreads();
    // TODO 1: exclusive scan of sh[] (Hillis-Steele inclusive, then shift).
    // TODO 2: if (flags[tid]) out[sh[tid-1] (exclusive prefix)] = in[tid];
    // TODO 3: thread handling the last element writes count[0] = total kept.
}

// Launch hint: compact<<<1, 1024>>>(in, flags, out, count, n);` },
  solution: "Compute the exclusive scan of the 0/1 flags: survivor i's destination index is exactly its exclusive prefix. Scatter with if (flags[tid]) out[excl] = in[tid] — order is preserved because the scan is monotone. The total count is the inclusive scan's last value. This scatter-after-scan pattern generalizes to multi-block compaction using the gpu-129 offset technique, and it is the core of sparse and database kernels."
},
{
  id: "gpu-131", track: "gpu", branch: "Parallel Algorithms",
  title: "Global-Atomic Histogram", difficulty: "medium",
  tags: ["histogram", "atomics"],
  summary: "The straightforward histogram: atomicAdd straight into global memory. Measure the pain.",
  statement: "Implement `__global__ void histogram_atomic(const unsigned char* data, unsigned int* hist, int n)` computing a 256-bin histogram of n bytes directly with global-memory atomicAdd(&hist[data[i]], 1u). hist is pre-zeroed by the caller; 1 <= n <= 2^24. Use one thread per element with a bounds check. Exact integer match required (atomics are exact for integers).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void histogram_atomic(const unsigned char* __restrict__ data,
                                 unsigned int* hist, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    // TODO: if (i < n) atomicAdd(&hist[data[i]], 1u);
}

// Launch hint: histogram_atomic<<<(n + 255) / 256, 256>>>(data, hist, n);` },
  solution: "One atomicAdd per element directly on the global histogram. Correct by construction (integer atomics are exact), but contention on hot bins serializes: a skewed distribution collapses throughput toward one atomic per L2 latency. This is the baseline that motivates the shared-memory privatized version (gpu-119), which reduces global atomic traffic by a factor of the elements per block."
},
{
  id: "gpu-132", track: "gpu", branch: "Parallel Algorithms",
  title: "Counting Sort by Bins", difficulty: "hard",
  tags: ["sorting", "counting sort", "scan"],
  summary: "Sort small-int keys: histogram, exclusive scan of counts, scatter. Three phases, one idea.",
  statement: "Sort an array of n = 1024 integers with values in [0, 64) using a single block of 1024 threads. Implement `__global__ void counting_sort(const int* in, int* out, int n)`: (1) zero a 64-bin shared histogram and count with shared atomicAdd, (2) one thread computes the exclusive prefix over the 64 bin counts (a serial 64-step scan is fine), (3) scatter: for each element in original order... note that a plain atomicAdd-based scatter does not preserve stability — for this problem ties may appear in ANY order within a bin, so use atomicAdd on per-bin running offsets to get each element's slot. Exact match per bin multiset required (the checker verifies out is sorted and is a permutation of in).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void counting_sort(const int* __restrict__ in,
                              int* __restrict__ out, int n) {
    __shared__ int hist[64];     // bin counts -> then exclusive offsets
    int tid = threadIdx.x;
    // TODO 1: if (tid < 64) hist[tid] = 0; __syncthreads();
    // TODO 2: atomicAdd(&hist[in[tid]], 1); __syncthreads();
    // TODO 3: thread 0: serial exclusive scan of hist[] in place.
    //         __syncthreads();
    // TODO 4: int pos = atomicAdd(&hist[in[tid]], 1); out[pos] = in[tid];
}

// Launch hint: counting_sort<<<1, 1024>>>(in, out, n);` },
  solution: "Counting sort = histogram + prefix + scatter. Phase 3 turns counts into starting offsets per bin (serial 64-element scan by one thread is fine at this size). Phase 4's atomicAdd hands each element the next free slot of its bin; order within a bin is then arbitrary, which the checker permits. For a stable sort you would process elements in order per bin — that requires either multiple passes or a chained-scan decoupled-lookback design at scale."
},
{
  id: "gpu-133", track: "gpu", branch: "Parallel Algorithms",
  title: "Dot Product by Reduction", difficulty: "medium",
  tags: ["dot product", "reduction", "atomics"],
  summary: "sum(x[i]*y[i]) over 2^20 elements: block partials plus one atomic per block.",
  statement: "Implement `__global__ void dot(const float* x, const float* y, float* out, int n)` computing out[0] += sum over i of x[i] * y[i] for 1 <= n <= 2^20. out is pre-zeroed by the caller. Use a grid-stride load, a shared-memory tree reduction per block, and a single atomicAdd(out, partial) from thread 0 of each block. Relative tolerance 1e-3 (atomic order is nondeterministic).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void dot(const float* __restrict__ x,
                    const float* __restrict__ y,
                    float* out, int n) {
    __shared__ float sh[256];
    int tid = threadIdx.x;
    float v = 0.0f;
    for (int i = blockIdx.x * blockDim.x + tid; i < n;
         i += gridDim.x * blockDim.x) {
        v += x[i] * y[i];
    }
    sh[tid] = v;
    __syncthreads();
    // TODO: tree-reduce sh[]; if (tid == 0) atomicAdd(out, sh[0]);
}

// Launch hint: any grid, e.g. min((n + 255) / 256, 4096) blocks of 256.` },
  solution: "Grid-stride accumulation gives each thread a register partial first (fewer shared-memory round trips), then the standard tree reduction produces one value per block, and one float atomicAdd merges block partials. Compared with one atomic per element this cuts atomic traffic by a factor of blockDim.x. A two-kernel version (partials array + second reduction) is deterministic; the single-atomic version is not, hence the relative tolerance."
},
{
  id: "gpu-134", track: "gpu", branch: "Parallel Algorithms",
  title: "Cumulative Products", difficulty: "hard",
  tags: ["scan", "prefix product"],
  summary: "Inclusive prefix product: same Hillis-Steele skeleton, multiply instead of add.",
  statement: "Implement `__global__ void scan_product(const float* in, float* out, int n)` launched with a single block of 1024 threads and n = 1024: compute out[i] = in[0] * in[1] * ... * in[i] (inclusive prefix product). Use the Hillis-Steele pattern in shared memory with multiplication as the operator and double buffering. Inputs satisfy |in[i]| in [0.5, 2.0] so products stay in float range for n = 1024... to be safe the checker uses relative tolerance 1e-2 with reference computed in double.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void scan_product(const float* __restrict__ in,
                             float* __restrict__ out, int n) {
    __shared__ float a[1024];
    __shared__ float b[1024];
    int tid = threadIdx.x;
    a[tid] = in[tid];
    __syncthreads();
    float* src = a; float* dst = b;
    // TODO: Hillis-Steele with multiply:
    //   for (int off = 1; off < n; off <<= 1)
    //       dst[tid] = src[tid] * (tid >= off ? src[tid - off] : 1.0f);
    //   swap buffers each step.
    // TODO: out[tid] = src[tid];
}

// Launch hint: scan_product<<<1, 1024>>>(in, out, n);` },
  solution: "Scan works for any associative operator; swap + for * and the additive identity 0 for the multiplicative identity 1 in the guarded term. Products of 1024 factors overflow float quickly, which is why the input range is restricted and the reference is double — the kernel itself just multiplies. Prefix products show up in polynomial evaluation and probability chains; numerically they are usually done in log-space in practice."
},
{
  id: "gpu-135", track: "gpu", branch: "Parallel Algorithms",
  title: "Top-4 per Row", difficulty: "hard",
  tags: ["top-k", "selection"],
  summary: "One block per row, k = 4: iterative max-extraction beats a full sort for tiny k.",
  statement: "Implement `__global__ void top4_rows(const float* X, float* out, int m, int n)` launched with one block of 256 threads per row (gridDim.x = m). For each row r of the row-major m x n matrix X (1 <= m <= 4096, 4 <= n <= 4096), write the 4 largest values of the row in descending order to out[r*4 .. r*4+3]. Ties: values only are checked, so any tie order is fine. Use 4 rounds of block-max reduction, masking out each winner by writing -INFINITY back... the input is read-only, so instead keep a per-thread 'taken' count: simplest correct approach is a shared copy of the row (n <= 4096 floats fits) that winners get masked in. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void top4_rows(const float* __restrict__ X,
                          float* __restrict__ out, int m, int n) {
    __shared__ float row[4096];
    __shared__ float red[256];
    __shared__ int   ridx[256];
    int r = blockIdx.x, tid = threadIdx.x;
    for (int j = tid; j < n; j += blockDim.x) row[j] = X[r * n + j];
    __syncthreads();
    for (int k = 0; k < 4; ++k) {
        // TODO: per-thread max over strided j, then block argmax-reduce
        //       using red[]/ridx[]; thread 0 writes out[r*4 + k] and
        //       masks row[winner] = -INFINITY; __syncthreads();
    }
}

// Launch hint: top4_rows<<<m, 256>>>(X, out, m, n);` },
  solution: "Small k means selection beats sorting: stage the row in shared memory, then repeat 4 times — each thread finds the max of its strided share (value + index), a block reduction picks the global argmax, thread 0 records it and masks the winner to -INFINITY. For ties in value, keep the smaller index to stay deterministic. Complexity is O(k * n / P + k * log P) per row; a full sort would be O(n log n) — fine for k = 4, and this pattern scales to warp-per-row with shuffle argmax."
},
{
  id: "gpu-136", track: "gpu", branch: "Parallel Algorithms",
  title: "Sparse Matrix-Vector (CSR)", difficulty: "medium",
  tags: ["SpMV", "CSR", "sparse"],
  summary: "y = A x in CSR format, one thread per row. Simple — and horribly load-imbalanced.",
  statement: "Implement `__global__ void spmv_csr(int m, const int* rowPtr, const int* colIdx, const float* vals, const float* x, float* y)` for a sparse m-row matrix in CSR form: row i occupies entries rowPtr[i] .. rowPtr[i+1]-1, and y[i] = sum over those entries of vals[e] * x[colIdx[e]]. Constraints: 1 <= m <= 2^20, total nonzeros <= 2^22, column indices valid. One thread per row. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void spmv_csr(int m,
                         const int* __restrict__ rowPtr,
                         const int* __restrict__ colIdx,
                         const float* __restrict__ vals,
                         const float* __restrict__ x,
                         float* __restrict__ y) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < m) {
        float acc = 0.0f;
        // TODO: for (int e = rowPtr[i]; e < rowPtr[i + 1]; ++e)
        //           acc += vals[e] * x[colIdx[e]];
        y[i] = acc;
    }
}

// Launch hint: spmv_csr<<<(m + 255) / 256, 256>>>(m, rowPtr, colIdx, vals, x, y);` },
  solution: "One thread per row walks its CSR segment and accumulates vals[e] * x[colIdx[e]]. Correctness is trivial; performance is not: consecutive threads read consecutive rowPtr but wildly different amounts of vals, so short-row threads idle (imbalance) and x gathers are random (cache-hostile). The standard upgrades are CSR-vector (one warp per row with shuffle reduction) or ELLPACK/merge-based SpMV for balanced work."
},
{
  id: "gpu-137", track: "gpu", branch: "Parallel Algorithms",
  title: "Min and Argmin", difficulty: "medium",
  tags: ["reduction", "argmin"],
  summary: "Reduce (value, index) pairs: min wins, smallest index breaks ties.",
  statement: "Implement `__global__ void block_argmin(const float* in, float* minVal, int* minIdx, int n)` launched with a single block of 512 threads and n = 1024: compute minVal[0] = minimum of in[0..1023] and minIdx[0] = the SMALLEST index attaining it. Carry (value, index) pairs through the shared-memory tree reduction; when values tie, keep the smaller index. minVal checked exactly, minIdx must be exact.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void block_argmin(const float* __restrict__ in,
                             float* minVal, int* minIdx, int n) {
    __shared__ float sv[512];
    __shared__ int   si[512];
    int tid = threadIdx.x;
    // TODO 1: each thread merges in[tid] and in[tid + 512] (keep smaller value,
    //         ties -> smaller index) into sv[tid], si[tid]. __syncthreads();
    // TODO 2: tree-reduce pairs: for stride s, if (tid < s) pick the better
    //         of (sv[tid],si[tid]) and (sv[tid+s],si[tid+s]). __syncthreads() per step.
    // TODO 3: if (tid == 0) { minVal[0] = sv[0]; minIdx[0] = si[0]; }
}

// Launch hint: block_argmin<<<1, 512>>>(in, minVal, minIdx, n);` },
  solution: "Define a compare on (value, index): a beats b if a.value < b.value, or values equal and a.index < b.index. It is associative, so the tree reduction works unchanged — just carry both arrays (or pack into a single unsigned long long for one shuffle-friendly word). The tie rule makes the result deterministic and equal to a sequential left-to-right scan. Argmin/argmax reductions feed top-k kernels and attention max-tracking."
},
{
  id: "gpu-138", track: "gpu", branch: "ML Kernels",
  title: "Row Softmax", difficulty: "medium",
  tags: ["softmax", "numerics"],
  summary: "Numerically stable softmax per row: subtract the max, exponentiate, normalize.",
  statement: "Implement `__global__ void softmax_rows(const float* X, float* out, int m, int n)` launched with one block of 256 threads per row (gridDim.x = m). For each row r of the row-major m x n matrix (1 <= m <= 8192, 1 <= n <= 4096): out[r][j] = exp(X[r][j] - max_j X[r][j]) / sum_j exp(X[r][j] - max). Do both reductions (max, then sum) in shared memory. Inputs are in [-50, 50]; subtracting the row max is required for stability. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void softmax_rows(const float* __restrict__ X,
                             float* __restrict__ out, int m, int n) {
    __shared__ float red[256];
    int r = blockIdx.x, tid = threadIdx.x;
    const float* row = X + (size_t)r * n;
    float* orow = out + (size_t)r * n;
    // TODO 1: block-reduce max over row (strided per-thread max, then tree
    //         reduce in red[]). Broadcast via red[0] or a shared scalar.
    // TODO 2: per-thread: e_j = expf(row[j] - mx) for strided j; store to
    //         orow[j] and accumulate a per-thread sum; block-reduce sum.
    // TODO 3: orow[j] /= sum for strided j.
}

// Launch hint: softmax_rows<<<m, 256>>>(X, out, m, n);` },
  solution: "Two block reductions per row: max first (stability — without it expf(50) overflows float32), then sum of shifted exponentials. Write exp values to out during the second pass and normalize in a third sweep, so each element is read from global memory once and written twice. Block reductions use the shared-tree pattern; the row max and sum are broadcast through shared scalars. The online (single-pass) variant fuses max and sum tracking."
},
{
  id: "gpu-139", track: "gpu", branch: "ML Kernels",
  title: "Layer Normalization", difficulty: "hard",
  tags: ["layernorm", "reduction", "fusion"],
  summary: "y = (x - mean) / sqrt(var + eps) * gamma + beta per row — two reductions, one kernel.",
  statement: "Implement `__global__ void layernorm(const float* X, const float* gamma, const float* beta, float* out, int m, int n, float eps)` launched with one block of 256 threads per row. For each row r (1 <= m <= 8192, 1 <= n <= 4096): mean = (1/n) sum x_j, var = (1/n) sum (x_j - mean)^2, out_j = (x_j - mean) / sqrt(var + eps) * gamma[j] + beta[j]. Use two shared-memory reductions (sum and sum of squared deviations) — or a single sum/sum-of-squares pass with var = E[x^2] - E[x]^2. Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void layernorm(const float* __restrict__ X,
                          const float* __restrict__ gamma,
                          const float* __restrict__ beta,
                          float* __restrict__ out, int m, int n, float eps) {
    __shared__ float red[256];
    int r = blockIdx.x, tid = threadIdx.x;
    const float* row = X + (size_t)r * n;
    // TODO 1: block-reduce sum -> mean (broadcast through a shared scalar).
    // TODO 2: block-reduce sum of (x - mean)^2 -> var.
    // TODO 3: for strided j: out[row... j] = (row[j] - mean) * rsqrtf(var + eps)
    //         * gamma[j] + beta[j];
}

// Launch hint: layernorm<<<m, 256>>>(X, gamma, beta, out, m, n, eps);` },
  solution: "Per row: reduce to get mean, reduce again for variance (or fuse via sum and sum-of-squares in one pass; the two-pass form is more numerically stable and the E[x^2]-mean^2 shortcut can catastrophically cancel). Normalize with rsqrtf(var + eps) and apply the affine scale/shift. gamma and beta are reused by every row so they ride the cache. Fusing everything into one kernel avoids re-reading X from global memory between passes — the whole point versus a library-composed version."
},
{
  id: "gpu-140", track: "gpu", branch: "ML Kernels",
  title: "Batch Normalization (Inference)", difficulty: "medium",
  tags: ["batchnorm", "elementwise"],
  summary: "Per-channel affine with precomputed statistics — elementwise once the stats exist.",
  statement: "Implement `__global__ void batchnorm_infer(const float* X, const float* gamma, const float* beta, const float* mean, const float* var, float* out, int N, int C, float eps)` for an N x C row-major tensor (N batch, C channels; 1 <= N*C <= 2^24): out[i*C + c] = gamma[c] * (X[i*C + c] - mean[c]) / sqrt(var[c] + eps) + beta[c]. Statistics are per channel and already computed. One thread per element. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void batchnorm_infer(const float* __restrict__ X,
                                const float* __restrict__ gamma,
                                const float* __restrict__ beta,
                                const float* __restrict__ mean,
                                const float* __restrict__ var,
                                float* __restrict__ out, int N, int C, float eps) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < N * C) {
        int c = i % C;
        // TODO: out[i] = gamma[c] * (X[i] - mean[c]) * rsqrtf(var[c] + eps) + beta[c];
    }
}

// Launch hint: batchnorm_infer<<<(N*C + 255) / 256, 256>>>(...);` },
  solution: "With inference-time statistics fixed, batchnorm collapses to an elementwise affine transform per channel: derive c = i % C and apply gamma[c] * (x - mean[c]) * rsqrtf(var[c] + eps) + beta[c]. The four per-channel vectors are tiny and cached. The training-mode version is the interesting kernel — it needs per-channel reductions across the batch, i.e., a column reduction, best done with a block per channel and strided accumulation."
},
{
  id: "gpu-141", track: "gpu", branch: "ML Kernels",
  title: "RMSNorm", difficulty: "medium",
  tags: ["rmsnorm", "reduction"],
  summary: "y = x / sqrt(mean(x^2) + eps) * gamma — layernorm without the mean subtraction.",
  statement: "Implement `__global__ void rmsnorm(const float* X, const float* gamma, float* out, int m, int n, float eps)` launched with one block of 256 threads per row of the m x n row-major matrix (1 <= m <= 8192, 1 <= n <= 4096): for each row, out_j = x_j * rsqrtf(mean(x^2) + eps) * gamma[j], where mean(x^2) = (1/n) sum_j x_j^2. One shared-memory reduction per row. Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void rmsnorm(const float* __restrict__ X,
                        const float* __restrict__ gamma,
                        float* __restrict__ out, int m, int n, float eps) {
    __shared__ float red[256];
    int r = blockIdx.x, tid = threadIdx.x;
    const float* row = X + (size_t)r * n;
    float* orow = out + (size_t)r * n;
    // TODO 1: per-thread strided sum of squares; block-reduce; ms = total / n.
    // TODO 2: float inv = rsqrtf(ms + eps);
    //         for strided j: orow[j] = row[j] * inv * gamma[j];
}

// Launch hint: rmsnorm<<<m, 256>>>(X, gamma, out, m, n, eps);` },
  solution: "Simpler than layernorm: no mean reduction, so a single sum-of-squares tree reduction suffices. Compute inv = rsqrtf(ms + eps) once per row into a register (each thread can compute it from the broadcast ms — no extra sync needed if the reduction result is read from shared memory). Modern LLMs prefer RMSNorm exactly because it drops the mean pass; one reduction and one normalize sweep, fully fused."
},
{
  id: "gpu-142", track: "gpu", branch: "ML Kernels",
  title: "GELU (tanh approximation)", difficulty: "easy",
  tags: ["activation", "elementwise"],
  summary: "0.5x(1 + tanh(sqrt(2/pi)(x + 0.044715x^3))) — the transformer activation.",
  statement: "Implement `__global__ void gelu_tanh(const float* x, float* out, int n)` computing the tanh approximation of GELU: out[i] = 0.5f * x[i] * (1.0f + tanhf(0.7978845608f * (x[i] + 0.044715f * x[i]*x[i]*x[i]))) for 0 <= i < n, 1 <= n <= 2^24. Threads beyond n do nothing. Absolute tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void gelu_tanh(const float* __restrict__ x,
                          float* __restrict__ out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        float v = x[i];
        // TODO: float inner = 0.7978845608f * (v + 0.044715f * v * v * v);
        //       out[i] = 0.5f * v * (1.0f + tanhf(inner));
    }
}

// Launch hint: gelu_tanh<<<(n + 255) / 256, 256>>>(x, out, n);` },
  solution: "Elementwise with the constant sqrt(2/pi) = 0.7978845608. Compute v*v*v once into a register rather than calling powf (which is a slow library call). tanhf saturates so no range issues. This is the approximation PyTorch uses by default for nn.GELU(approximate='tanh'); the exact erf version costs an extra special-function call."
},
{
  id: "gpu-143", track: "gpu", branch: "ML Kernels",
  title: "Embedding Lookup", difficulty: "easy",
  tags: ["embedding", "gather"],
  summary: "out[i][:] = table[idx[i]][:] — a gather, not a matmul.",
  statement: "Implement `__global__ void embed_lookup(const float* table, const int* idx, float* out, int B, int D)` where table is V x D row-major (V up to 2^17) and idx holds B valid row indices (0 <= idx[i] < V). Copy row idx[i] of the table into row i of out: out[i*D + j] = table[idx[i]*D + j] for 0 <= i < B, 0 <= j < D. Constraints: 1 <= B <= 2^16, 1 <= D <= 1024. Use one thread per output element. Exact match (tolerance 0).",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void embed_lookup(const float* __restrict__ table,
                             const int* __restrict__ idx,
                             float* __restrict__ out, int B, int D) {
    int t = blockIdx.x * blockDim.x + threadIdx.x;   // flat index over B*D
    if (t < B * D) {
        int i = t / D;
        int j = t % D;
        // TODO: out[t] = table[idx[i] * D + j];
    }
}

// Launch hint: embed_lookup<<<(B*D + 255) / 256, 256>>>(table, idx, out, B, D);` },
  solution: "One thread per output element: decompose the flat index into (row, dim), gather table[idx[i]*D + j]. Reads of the table row are coalesced across threads within a row; different rows may hit anywhere in the table (random-access gather), which is fine because embedding tables live in HBM and the rows are contiguous cache lines. Assigning one warp per embedding row and vectorizing with float4 when D % 4 == 0 are the standard speedups."
},
{
  id: "gpu-144", track: "gpu", branch: "ML Kernels",
  title: "Tiled Attention Scores", difficulty: "hard",
  tags: ["attention", "GEMM", "tiling"],
  summary: "S = Q K^T / sqrt(d) with 16x16 shared tiles — GEMM with a transpose and a scale.",
  statement: "Implement `__global__ void attn_scores(const float* Q, const float* K, float* S, int Tq, int Tk, int d)` computing S[i*Tk + j] = (1/sqrt(d)) * sum over t of Q[i*d + t] * K[j*d + t], where Q is Tq x d and K is Tk x d, all row-major float32 (1 <= Tq, Tk <= 1024, 1 <= d <= 128, and for this simplified problem d is a multiple of 16). Use a 16x16 thread block with shared tiles for Q and K rows, looping over d in steps of 16. Relative tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void attn_scores(const float* __restrict__ Q,
                            const float* __restrict__ K,
                            float* __restrict__ S, int Tq, int Tk, int d) {
    __shared__ float Qs[16][16];
    __shared__ float Ks[16][16];
    int tx = threadIdx.x, ty = threadIdx.y;
    int i = blockIdx.y * 16 + ty;   // query row
    int j = blockIdx.x * 16 + tx;   // key row
    float acc = 0.0f;
    for (int t = 0; t < d; t += 16) {
        // TODO: stage Qs[ty][tx] = Q[i*d + t + tx] and Ks[ty][tx] = K[j*d + t + tx]
        //       (bounds-check i, j; d is a multiple of 16).
        __syncthreads();
        // TODO: for (int u = 0; u < 16; ++u) acc += Qs[ty][u] * Ks[tx][u];
        __syncthreads();
    }
    if (i < Tq && j < Tk) S[i*Tk + j] = acc * rsqrtf((float)d);
}

// Launch hint: dim3 block(16,16), grid((Tk+15)/16, (Tq+15)/16).` },
  solution: "This is GEMM C = Q K^T with a scale: identical tiling to gpu-116 except the inner product runs along d within a tile-row pair — accumulate Qs[ty][u] * Ks[tx][u], multiplying a Q row-tile by a K row-tile elementwise then summing, which is the transposed-B GEMM pattern. Scale by rsqrtf(d) at the end. Real flash attention fuses the softmax and PV matmul into the same kernel with online rescaling to avoid materializing S at all."
},
{
  id: "gpu-145", track: "gpu", branch: "ML Kernels",
  title: "Fused Bias + GELU", difficulty: "easy",
  tags: ["fusion", "activation"],
  summary: "Per-column bias add fused with tanh-GELU — one kernel instead of two.",
  statement: "Implement `__global__ void bias_gelu(const float* X, const float* bias, float* out, int rows, int cols)` computing out[r*cols + c] = gelu_tanh(X[r*cols + c] + bias[c]) for a row-major rows x cols matrix and per-column bias, where gelu_tanh(v) = 0.5f*v*(1.0f + tanhf(0.7978845608f*(v + 0.044715f*v*v*v))). Constraints: 1 <= rows*cols <= 2^24. One thread per element. Absolute tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void bias_gelu(const float* __restrict__ X,
                          const float* __restrict__ bias,
                          float* __restrict__ out, int rows, int cols) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < rows * cols) {
        float v = X[i] + bias[i % cols];
        // TODO: out[i] = 0.5f * v * (1.0f + tanhf(0.7978845608f * (v + 0.044715f * v*v*v)));
    }
}

// Launch hint: bias_gelu<<<(rows*cols + 255) / 256, 256>>>(X, bias, out, rows, cols);` },
  solution: "Add the bias then apply the tanh-GELU inline. Unfused, this is two kernels and 2x the global traffic (write X+bias, read it back); fused, it is one read and one write. In transformer MLP blocks the bias+activation is further fused into the GEMM epilogue — cuBLASLt exposes exactly this as an epilogue op for the same bandwidth reason."
},
{
  id: "gpu-146", track: "gpu", branch: "ML Kernels",
  title: "Online Softmax (Single Pass)", difficulty: "hard",
  tags: ["softmax", "online", "flash attention"],
  summary: "Track running max and rescaled running sum in ONE pass — the flash-attention trick.",
  statement: "Implement `__global__ void softmax_online(const float* X, float* out, int m, int n)` launched with one block of 256 threads per row (1 <= m <= 8192, 1 <= n <= 4096). Compute the same stable row softmax as gpu-138, but find (max, sum-of-exps) in a single fused pass: each thread maintains a running max mj and running sum sj = sum exp(x - mj); when a larger x arrives, rescale sj *= expf(old_m - new_m) before adding expf(x - new_m). Reduce the per-thread (m, s) pairs block-wide with the same merge rule, then normalize. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void softmax_online(const float* __restrict__ X,
                               float* __restrict__ out, int m, int n) {
    __shared__ float sm[256];   // per-thread running max
    __shared__ float ss[256];   // per-thread running sum
    int r = blockIdx.x, tid = threadIdx.x;
    const float* row = X + (size_t)r * n;
    float* orow = out + (size_t)r * n;
    float mj = -INFINITY, sj = 0.0f;
    for (int j = tid; j < n; j += blockDim.x) {
        float x = row[j];
        // TODO: online update:
        //   float mnew = fmaxf(mj, x);
        //   sj = sj * expf(mj - mnew) + expf(x - mnew);
        //   mj = mnew;
    }
    // TODO: block-merge (m, s) pairs in sm[]/ss[] with the same rule:
    //   M = max(ma, mb); S = sa*expf(ma-M) + sb*expf(mb-M).
    // TODO: broadcast final M and S; for strided j:
    //   orow[j] = expf(row[j] - M) / S;
}

// Launch hint: softmax_online<<<m, 256>>>(X, out, m, n);` },
  solution: "The merge operator (M, S) = (max(ma,mb), sa*e^(ma-M) + sb*e^(mb-M)) is associative, so it composes per-thread sequential passes with a standard block reduction. One pass over the data finds both statistics, halving row reads versus the two-pass softmax; the normalize step still needs a second sweep unless values are cached. This is precisely the online-softmax inner loop of flash attention, where S tiles are too big to store."
},
{
  id: "gpu-147", track: "gpu", branch: "ML Kernels",
  title: "Hash-Based Dropout", difficulty: "medium",
  tags: ["dropout", "hash", "stateless RNG"],
  summary: "Deterministic dropout without curand: hash the index, compare against keep-probability.",
  statement: "Implement `__global__ void dropout_hash(const float* x, float* out, int n, unsigned int seed, float keep_p)` applying inverted dropout: out[i] = x[i] / keep_p if kept, else 0. Element i is kept when a per-element hash u32(i, seed) / 2^32 < keep_p, where u32 is the provided integer hash (already in the starter). Constraints: 1 <= n <= 2^24, 0 < keep_p <= 1. No curand allowed — determinism from (i, seed) only. Kept values checked with relative tolerance 1e-5; positions must match exactly.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__device__ __forceinline__ unsigned int u32hash(unsigned int i, unsigned int seed) {
    unsigned int h = i * 1664525u + 1013904223u + seed;
    h ^= h >> 16; h *= 2246822519u; h ^= h >> 13; h *= 3266489917u; h ^= h >> 16;
    return h;
}

__global__ void dropout_hash(const float* __restrict__ x,
                             float* __restrict__ out, int n,
                             unsigned int seed, float keep_p) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        // TODO: float u = (float)u32hash((unsigned)i, seed) * (1.0f / 4294967296.0f);
        //       out[i] = (u < keep_p) ? x[i] / keep_p : 0.0f;
    }
}

// Launch hint: dropout_hash<<<(n + 255) / 256, 256>>>(x, out, n, seed, keep_p);` },
  solution: "Stateless counter-based RNG: hash (i, seed) to a uniform-looking 32-bit value, scale by 2^-32, and threshold against keep_p. Inverted dropout divides kept values by keep_p so the expected magnitude is preserved and inference needs no scaling. Because each element's mask depends only on its index, the kernel is deterministic, reproducible across launches and grid sizes, and needs no RNG state — this is the same trick as philox counter-based generators in curand."
},
{
  id: "gpu-148", track: "gpu", branch: "ML Kernels",
  title: "L2 Row Normalization", difficulty: "medium",
  tags: ["normalization", "reduction"],
  summary: "Divide each row by its L2 norm (clamped below by eps) — embeddings' best friend.",
  statement: "Implement `__global__ void l2_normalize_rows(const float* X, float* out, int m, int n, float eps)` launched with one block of 256 threads per row of an m x n row-major matrix (1 <= m <= 8192, 1 <= n <= 4096): out_j = x_j / max(sqrt(sum_j x_j^2), eps). One shared-memory sum-of-squares reduction per row, then a normalize sweep. Relative tolerance 1e-4.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void l2_normalize_rows(const float* __restrict__ X,
                                  float* __restrict__ out, int m, int n,
                                  float eps) {
    __shared__ float red[256];
    int r = blockIdx.x, tid = threadIdx.x;
    const float* row = X + (size_t)r * n;
    float* orow = out + (size_t)r * n;
    // TODO 1: per-thread strided sum of squares -> block reduce -> shared scalar.
    // TODO 2: float inv = 1.0f / fmaxf(sqrtf(total), eps);
    // TODO 3: for strided j: orow[j] = row[j] * inv;
}

// Launch hint: l2_normalize_rows<<<m, 256>>>(X, out, m, n, eps);` },
  solution: "Single reduction: sum of squares per row, then scale every element by 1/max(norm, eps). The max with eps guards zero vectors (a zero row maps to a zero row rather than NaN). Cosine-similarity pipelines run this on both embedding tables so similarity becomes a plain dot product — moving the norm cost out of every pairwise comparison."
},
{
  id: "gpu-149", track: "gpu", branch: "ML Kernels",
  title: "SiLU / Swish", difficulty: "easy",
  tags: ["activation", "elementwise"],
  summary: "x * sigmoid(x) — the LLaMA-era activation, one line of CUDA.",
  statement: "Implement `__global__ void silu(const float* x, float* out, int n)` computing out[i] = x[i] * (1.0f / (1.0f + expf(-x[i]))) for 0 <= i < n, 1 <= n <= 2^24, inputs in [-60, 60]. Threads beyond n do nothing. Absolute tolerance 1e-5.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void silu(const float* __restrict__ x,
                     float* __restrict__ out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) {
        float v = x[i];
        // TODO: out[i] = v / (1.0f + expf(-v));
    }
}

// Launch hint: silu<<<(n + 255) / 256, 256>>>(x, out, n);` },
  solution: "out[i] = x[i] / (1.0f + expf(-x[i])) — same value as x * sigmoid(x) with one fewer multiply. Inputs are bounded so expf cannot overflow. SiLU (Swish) gates the FFN in LLaMA-style models, usually as silu(gate) * up fused into one kernel; here it stands alone as a pure elementwise map."
},
{
  id: "gpu-150", track: "gpu", branch: "ML Kernels",
  title: "Cross-Entropy Loss per Row", difficulty: "hard",
  tags: ["loss", "softmax", "numerics"],
  summary: "loss[r] = logsumexp(row) - x[target] — the stable form, no softmax materialized.",
  statement: "Implement `__global__ void cross_entropy(const float* logits, const int* targets, float* loss, int m, int n)` launched with one block of 256 threads per row. For each row r of the m x n row-major logits matrix (1 <= m <= 8192, 1 <= n <= 4096, 0 <= targets[r] < n): loss[r] = log( sum_j exp(x_j - mx) ) + mx - x[targets[r]], where mx is the row max (logsumexp trick for stability). Logits are in [-50, 50]. Only thread 0 writes loss[r]. Absolute tolerance 1e-3.",
  kind: "code", languages: ["cuda"],
  starter: { cuda:
`__global__ void cross_entropy(const float* __restrict__ logits,
                              const int* __restrict__ targets,
                              float* __restrict__ loss, int m, int n) {
    __shared__ float red[256];
    int r = blockIdx.x, tid = threadIdx.x;
    const float* row = logits + (size_t)r * n;
    // TODO 1: block-reduce row max mx.
    // TODO 2: block-reduce s = sum_j expf(row[j] - mx).
    // TODO 3: if (tid == 0) loss[r] = logf(s) + mx - row[targets[r]];
}

// Launch hint: cross_entropy<<<m, 256>>>(logits, targets, loss, m, n);` },
  solution: "Cross-entropy with logits is logsumexp minus the target logit: log(s) + mx - x_t. Never compute softmax-then-log — that round-trips through a number that can underflow to 0 for confident wrong predictions; the fused form stays stable for the full input range. Two block reductions (max, shifted-sum) as in softmax, but only a scalar output per row. The backward kernel (softmax minus one-hot) pairs with this in training loops."
},
{"id":"gpu-151","track":"gpu","branch":"Memory Optimization","title":"Occupancy: Register-Limited Blocks","difficulty":"medium","tags":["occupancy", "registers"],"summary":"How many thread blocks fit on one SM when registers are the binding resource?","statement":"A GPU streaming multiprocessor (SM) has 65536 registers, supports at most 2048 resident threads, and at most 32 resident blocks. A kernel is launched with 256 threads per block, each thread using 40 registers, and no shared memory. Assuming registers are allocated per-thread uniformly, how many blocks can reside on one SM simultaneously?","kind":"answer","answer":"6","tolerance":0.01,"solution":"Registers per block = 256 threads x 40 regs = 10240. Register limit: floor(65536/10240) = 6 blocks. Thread limit: floor(2048/256) = 8 blocks. Block-slot limit: 32. Answer = min(6, 8, 32) = 6."},
{"id":"gpu-152","track":"gpu","branch":"Memory Optimization","title":"Occupancy: Theoretical Percentage","difficulty":"easy","tags":["occupancy"],"summary":"Convert resident blocks per SM into a theoretical occupancy percentage.","statement":"Using the same GPU as before (2048 threads max per SM), a kernel launched with 256 threads per block achieves 6 resident blocks per SM. What is the theoretical occupancy, expressed as a percentage (0-100)?","kind":"answer","answer":"75.00","tolerance":0.01,"solution":"Resident threads = 6 blocks x 256 = 1536. Occupancy = 1536/2048 = 75.00%."},
{"id":"gpu-153","track":"gpu","branch":"Memory Optimization","title":"Occupancy: Shared-Memory-Limited Blocks","difficulty":"medium","tags":["occupancy", "shared memory"],"summary":"Find resident blocks per SM when shared memory is the binding resource.","statement":"An SM provides 48 KB of shared memory, 65536 registers, at most 1024 resident threads, and at most 16 resident blocks. A kernel uses 128 threads per block, 24 registers per thread, and 12 KB of shared memory per block. How many blocks can be resident on one SM?","kind":"answer","answer":"4","tolerance":0.01,"solution":"Shared-memory limit: floor(48/12) = 4 blocks. Register limit: floor(65536/(128x24)) = 21. Thread limit: floor(1024/128) = 8. Block-slot limit: 16. Answer = min = 4."},
{"id":"gpu-154","track":"gpu","branch":"Memory Optimization","title":"Occupancy: Three-Way Tie","difficulty":"medium","tags":["occupancy", "registers", "shared memory"],"summary":"Combine register, shared-memory and thread limits to find resident blocks per SM.","statement":"An SM has 65536 registers, 64 KB shared memory, at most 2048 resident threads, and at most 32 resident blocks. A kernel launches 512 threads per block using 32 registers per thread and 8 KB of shared memory per block. How many blocks fit on one SM?","kind":"answer","answer":"4","tolerance":0.01,"solution":"Registers: floor(65536/(512x32)) = floor(65536/16384) = 4. Shared: floor(64/8) = 8. Threads: floor(2048/512) = 4. Slots: 32. Answer = min(4,8,4,32) = 4."},
{"id":"gpu-155","track":"gpu","branch":"Memory Optimization","title":"Achieved Bandwidth: Array Copy","difficulty":"easy","tags":["bandwidth", "bytes/time"],"summary":"Compute achieved copy bandwidth in GB/s from element count and kernel time.","statement":"A device-to-device copy kernel moves an array of N = 2^24 float32 elements and completes in 0.08 ms. Each element is read once and written once (4 bytes each way). What is the achieved bandwidth in GB/s (use 1 GB = 10^9 bytes)?","kind":"answer","answer":"1677.72","tolerance":0.01,"solution":"Bytes moved = 2 x 16777216 elements x 4 B = 134217728 B. Time = 8e-05 s. Bandwidth = 134217728/8e-05 = 1677.72 GB/s."},
{"id":"gpu-156","track":"gpu","branch":"Memory Optimization","title":"Achieved Bandwidth: SAXPY","difficulty":"medium","tags":["bandwidth", "saxpy"],"summary":"Compute achieved bandwidth for a saxpy kernel (two reads, one write per element).","statement":"A saxpy kernel out[i] = alpha*x[i] + y[i] runs on N = 2^20 float32 elements and finishes in 12 microseconds. It reads x and y and writes out (three 4-byte accesses per element, alpha is in a register). What is the achieved bandwidth in GB/s (1 GB = 10^9 bytes)?","kind":"answer","answer":"1048.58","tolerance":0.01,"solution":"Bytes = 3 x 1048576 x 4 B = 12582912 B. Time = 1.2e-05 s. Bandwidth = 12582912/1.2e-05 = 1048.58 GB/s."},
{"id":"gpu-162","track":"gpu","branch":"Memory Optimization","title":"Bandwidth Efficiency","difficulty":"easy","tags":["bandwidth", "roofline"],"summary":"Express achieved bandwidth as a percentage of peak HBM bandwidth.","statement":"A memory-bound kernel achieves 800 GB/s on a GPU whose HBM peak bandwidth is 2000 GB/s. What percentage of peak bandwidth does the kernel achieve?","kind":"answer","answer":"40.00","tolerance":0.01,"solution":"Efficiency = 800/2000 x 100 = 40.00%."},
{"id":"gpu-157","track":"gpu","branch":"Memory Optimization","title":"Bank Conflicts: Stride 2","difficulty":"easy","tags":["shared memory", "bank conflicts"],"summary":"Count the way-ness of bank conflicts for a stride-2 shared-memory access.","statement":"Shared memory on this GPU has 32 banks; a 4-byte word at address w maps to bank (w mod 32). A warp executes float v = s[threadIdx.x * 2]; where s is a shared float array. Threads in the warp hit addresses with stride 2 words. How many ways is the resulting bank conflict (i.e., how many threads share the worst-case bank)? Answer with the integer multiplicity (1 means conflict-free).","kind":"answer","answer":"2","tolerance":0.01,"solution":"Stride 2 words: thread t hits bank (2t mod 32). Threads t and t+16 map to the same bank, so each bank serves 2 threads per half-warp -> 2-way conflict. In general the multiplicity is gcd(stride, 32) = gcd(2,32) = 2."},
{"id":"gpu-158","track":"gpu","branch":"Memory Optimization","title":"Bank Conflicts: Stride 32","difficulty":"easy","tags":["shared memory", "bank conflicts"],"summary":"Count the way-ness of bank conflicts for a stride-32 shared-memory access.","statement":"With 32 shared-memory banks (4-byte words, bank = address mod 32), a warp executes float v = s[threadIdx.x * 32]; All 32 threads hit words 32 apart. What is the bank-conflict multiplicity (integer; 1 means conflict-free)?","kind":"answer","answer":"32","tolerance":0.01,"solution":"Every thread hits bank (32t mod 32) = 0: all 32 threads pile onto bank 0. gcd(32,32) = 32, so the access is fully serialized as a 32-way conflict."},
{"id":"gpu-159","track":"gpu","branch":"Memory Optimization","title":"Bank Conflicts: Stride 33","difficulty":"medium","tags":["shared memory", "bank conflicts", "padding"],"summary":"Show why padding a tile by one column eliminates bank conflicts.","statement":"With 32 shared-memory banks (4-byte words, bank = address mod 32), a warp executes float v = s[threadIdx.x * 33]; This is the classic padded-tile access. What is the bank-conflict multiplicity (integer; 1 means conflict-free)?","kind":"answer","answer":"1","tolerance":0.01,"solution":"gcd(33, 32) = 1, so the map t -> 33t mod 32 is a permutation of the 32 banks: every thread lands on a different bank. Multiplicity = 1, i.e. conflict-free. This is exactly why tiles are padded by one column."},
{"id":"gpu-160","track":"gpu","branch":"Memory Optimization","title":"Shared Memory Tile Bytes","difficulty":"easy","tags":["shared memory", "tiling"],"summary":"Compute the byte size of a padded 32x32 float tile in shared memory.","statement":"A tiled transpose stage a 32x32 tile of float32 in shared memory, padded to 33 columns to avoid bank conflicts: __shared__ float tile[32][33]; How many bytes does this shared array occupy?","kind":"answer","answer":"4224","tolerance":0.01,"solution":"Elements = 32 rows x 33 columns = 1056. Bytes = 1056 x 4 = 4224 B (4.1250 KB)."},
{"id":"gpu-161","track":"gpu","branch":"Memory Optimization","title":"Tiled GEMM Traffic Reduction","difficulty":"medium","tags":["GEMM", "tiling", "arithmetic intensity"],"summary":"By what factor does T-wide shared-memory tiling cut GEMM global-memory traffic?","statement":"In a naive GEMM C = A x B (square N x N, row-major, one thread per output element), every element of A and B is fetched from global memory N times. With shared-memory tiling of width T = 16, each element is fetched only N/T times from global memory. By what factor does tiling reduce the total global-memory traffic of A and B reads?","kind":"answer","answer":"16","tolerance":0.01,"solution":"Naive: each A element is read N times (once per output column of its row), likewise B. Tiled: the tile is loaded once into shared memory and reused by T outputs, so each element is fetched N/T times. Reduction factor = N/(N/T) = T = 16."},
{"id":"gpu-163","track":"gpu","branch":"CUDA Basics","title":"Grid Size: Exact Division","difficulty":"easy","tags":["launch config", "grid dim"],"summary":"How many blocks of 256 threads cover exactly 2^20 elements?","statement":"A kernel processes N = 2^20 elements with one element per thread and 256 threads per block. N divides evenly. How many blocks must the grid contain?","kind":"answer","answer":"4096","tolerance":0.01,"solution":"Blocks = N / threads = 1048576/256 = 4096."},
{"id":"gpu-164","track":"gpu","branch":"CUDA Basics","title":"Grid Size: Ceiling Division","difficulty":"easy","tags":["launch config", "grid dim"],"summary":"How many blocks of 256 threads are needed for 1,000,000 elements (round up)?","statement":"A kernel processes N = 1,000,000 elements, one element per thread, 256 threads per block, using grid = (N + 255) / 256 and an i < n bounds check. How many blocks are launched?","kind":"answer","answer":"3907","tolerance":0.01,"solution":"ceil(1000000/256) = ceil(3906.25) = 3907. Equivalently (1000000 + 255)/256 = 1000255/256 = 3907 (integer division)."},
{"id":"gpu-165","track":"gpu","branch":"CUDA Basics","title":"2D Grid for an Image","difficulty":"easy","tags":["launch config", "2D grid"],"summary":"How many 16x16 blocks tile a 1024x1024 image?","statement":"An image kernel uses 16 x 16 thread blocks over a 1024 x 1024 pixel image with one thread per pixel. Both dimensions divide evenly. How many blocks are in the grid in total?","kind":"answer","answer":"4096","tolerance":0.01,"solution":"Blocks per dimension = 1024/16 = 64. Total = 64 x 64 = 4096."},
{"id":"gpu-166","track":"gpu","branch":"CUDA Basics","title":"Grid-Stride: Fewer Blocks","difficulty":"medium","tags":["grid-stride", "launch config"],"summary":"How many 256-thread blocks are needed when each thread handles 4 elements?","statement":"A grid-stride kernel processes N = 2^20 elements with 256 threads per block, and each thread is responsible for exactly 4 elements (N divides evenly). How many blocks does the grid need?","kind":"answer","answer":"1024","tolerance":0.01,"solution":"Elements per block = 256 x 4 = 1024. Blocks = 1048576/1024 = 1024."},
{"id":"gpu-167","track":"gpu","branch":"CUDA Basics","title":"Coalesced Warp Transaction","difficulty":"easy","tags":["coalescing", "memory"],"summary":"How many bytes does a fully coalesced warp fetch for consecutive float32 loads?","statement":"A warp executes float v = g[idx]; where the 32 threads read 32 consecutive float32 elements from global memory and the segment is perfectly coalesced and aligned. How many bytes of useful data does the warp obtain for this single load instruction?","kind":"answer","answer":"128","tolerance":0.01,"solution":"32 threads x 4 bytes = 128 bytes. A fully coalesced warp-wide float load maps to one 128-byte cache-line-sized transaction of useful data."},
{"id":"gpu-168","track":"gpu","branch":"CUDA Basics","title":"Arithmetic Intensity of SAXPY","difficulty":"medium","tags":["arithmetic intensity", "roofline"],"summary":"Compute the arithmetic intensity (FLOP per byte) of saxpy.","statement":"The saxpy kernel out[i] = alpha*x[i] + y[i] performs 2 floating-point operations per element (one multiply, one add) and moves 3 float32 words per element (read x, read y, write out; alpha stays in a register). What is its arithmetic intensity in FLOP/byte? Round to 4 decimal places.","kind":"answer","answer":"0.1667","tolerance":0.01,"solution":"Traffic = 3 words x 4 B = 12 B per element. AI = 2 FLOP / 12 B = 0.1667 FLOP/byte. Far below any GPU ridge point, so saxpy is always memory-bound."},
{"id":"gpu-169","track":"gpu","branch":"Parallel Algorithms","title":"Amdahl's Law: GPU Offload","difficulty":"medium","tags":["Amdahl", "speedup"],"summary":"Compute overall speedup when 90% of a program is offloaded to a 100x-faster GPU.","statement":"A program spends 90% of its runtime in a kernel that, once ported to the GPU, runs 100x faster. The remaining 10% stays serial on the CPU at the original speed (ignore transfer time). Using Amdahl's law, what is the overall speedup? Round to 2 decimal places.","kind":"answer","answer":"9.17","tolerance":0.01,"solution":"Speedup = 1 / ((1 - p) + p/s) = 1 / (0.10 + 0.90/100) = 1 / 0.109 = 9.17. The serial 10% caps the speedup at 10x no matter how fast the GPU gets."},
{"id":"gpu-170","track":"gpu","branch":"Parallel Algorithms","title":"Amdahl's Law: 95% Parallel","difficulty":"medium","tags":["Amdahl", "speedup"],"summary":"Compute overall speedup when 95% of the work gets a 64x GPU speedup.","statement":"95% of a workload's runtime is parallelized on a GPU with a 64x speedup on that part; 5% remains serial. What is the overall speedup by Amdahl's law? Round to 2 decimal places.","kind":"answer","answer":"15.42","tolerance":0.01,"solution":"Speedup = 1 / (0.05 + 0.95/64) = 1 / (0.05 + 0.01484375) = 1 / 0.06484375 = 15.42. Ceiling = 1/0.05 = 20x."},
{"id":"gpu-171","track":"gpu","branch":"Parallel Algorithms","title":"Divergence: Serialized Paths","difficulty":"medium","tags":["warp divergence", "SIMT"],"summary":"How many cycles does a divergent warp take when both branch paths serialize?","statement":"Within one warp, 16 lanes take branch A (40 cycles of work) and 16 lanes take branch B (25 cycles of work). Under SIMT execution the two paths execute serially: while one half-warp runs, the other half is masked off. How many cycles does the warp spend on the if/else in total?","kind":"answer","answer":"65","tolerance":0.01,"solution":"Divergent paths cannot execute concurrently: the warp pays for both. Total = 40 + 25 = 65 cycles, versus max(40,25) = 40 if the warp were uniform. Divergence penalty = 25 extra cycles."},
{"id":"gpu-172","track":"gpu","branch":"Parallel Algorithms","title":"Divergence: Counting Split Warps","difficulty":"medium","tags":["warp divergence", "warps"],"summary":"How many of 8 warps are divergent for the branch threadIdx.x < 48?","statement":"A block has 256 threads (8 warps of 32 consecutive threads). The kernel contains if (threadIdx.x < 48) { A } else { B }. A warp is divergent if its lanes take different paths. How many of the 8 warps are divergent?","kind":"answer","answer":"1","tolerance":0.01,"solution":"Warp 0 = threads 0-31, all < 48: uniform A. Warp 1 = threads 32-63: threads 32-47 take A, 48-63 take B -> divergent. Warps 2-7 (threads 64-255): uniform B. Exactly 1 divergent warp. Branching on whole-warp boundaries (multiples of 32) avoids divergence."},
{"id":"gpu-173","track":"gpu","branch":"Parallel Algorithms","title":"Reduction Tree Depth","difficulty":"easy","tags":["reduction", "tree"],"summary":"How many halving steps does a 1024-thread tree reduction need?","statement":"A block of 1024 threads performs a shared-memory tree reduction: each step halves the number of active threads (1024 -> 512 -> 256 -> ...). How many reduction steps are needed to reach a single value?","kind":"answer","answer":"10","tolerance":0.01,"solution":"Each step halves the active count, so steps = log2(1024) = 10. (512, 256, 128, 64, 32, 16, 8, 4, 2, 1.)"},
{"id":"gpu-174","track":"gpu","branch":"ML Kernels","title":"Roofline: Softmax Is Memory-Bound","difficulty":"hard","tags":["roofline", "softmax", "arithmetic intensity"],"summary":"Use the roofline model to find the attainable performance of a softmax kernel.","statement":"A row-softmax kernel performs about 5 FLOPs per element and moves 8 bytes per element (read x once, write p once, float32), giving arithmetic intensity 0.6250 FLOP/byte. The GPU peaks at 20 TFLOP/s compute and 2000 GB/s memory bandwidth (ridge point = 10 FLOP/byte). What is the maximum attainable performance of this kernel in TFLOP/s? Round to 2 decimal places.","kind":"answer","answer":"1.25","tolerance":0.01,"solution":"AI = 5/8 = 0.6250 FLOP/byte < ridge 10, so the kernel is memory-bound. Attainable = AI x bandwidth = 0.6250 x 2000 GB/s = 1250 GFLOP/s = 1.25 TFLOP/s."},
{"id":"gpu-175","track":"gpu","branch":"ML Kernels","title":"Roofline: Attention Scores Are Compute-Bound","difficulty":"hard","tags":["roofline", "attention", "arithmetic intensity"],"summary":"Use the roofline model to find attainable performance of a compute-bound attention kernel.","statement":"A tiled attention-score kernel (S = QK^T) has arithmetic intensity 64 FLOP/byte thanks to shared-memory reuse. The GPU peaks at 20 TFLOP/s compute and 2000 GB/s bandwidth (ridge point = 10 FLOP/byte). What is the maximum attainable performance in TFLOP/s? Round to 2 decimal places.","kind":"answer","answer":"20.00","tolerance":0.01,"solution":"AI = 64 FLOP/byte > ridge 10 FLOP/byte, so the kernel is compute-bound. Memory could sustain AI x BW = 128 TFLOP/s, but the compute roof caps it at 20 TFLOP/s. Answer = 20.00."}
]);
