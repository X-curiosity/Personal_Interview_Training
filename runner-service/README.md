# PIT Runner Service

Reference execution backend for [Personal_Interview_Training](../README.md).
It implements the runner contract used by the static frontend
(`assets/js/config.js`) for languages that need real hardware or a simulator:

```
POST /execute
{ "language": "cuda"|"verilog", "code": "...", "tests": "..." }
→ 200 { "stdout": "...", "stderr": "...", "code": 0 }
```

## Architecture

```
frontend (static site)
   │  POST /execute  (X-Runner-Key)
   ▼
FastAPI app (app/main.py, uvicorn :8080)
   ├── auth dependency    — X-Runner-Key checked iff RUNNER_API_KEY is set
   ├── size guard         — code+tests ≤ 128 KiB (413 beyond that)
   ├── semaphore          — at most MAX_CONCURRENT executions
   └── per request: mkdtemp
         ├── cuda:    write main.cu (+tests appended)
         │            nvcc -O2 -std=c++17 main.cu -o main   →  ./main
         └── verilog: write main.v (+tests appended)
                      iverilog -g2012 -o sim main.v          →  vvp sim
   └── tempdir deleted; stdout/stderr truncated to 64 KiB each
```

All subprocess invocations use **argument arrays** (`subprocess.run([...])`)
— there is no `shell=True` anywhere, user text is never interpolated into a
command line, and user code only ever exists as a fixed-name file
(`main.cu` / `main.v`) inside a per-request temporary directory that is
deleted after the run. Compile/run timeouts are enforced with safe upper
bounds, and the container runs as a non-root user with a read-only root
filesystem, dropped capabilities and a PID limit.

## Local development

```bash
cd runner-service
make dev-install      # venv + runtime deps + pytest/httpx
make test             # runs the mocked test-suite (no nvcc/iverilog needed)
```

Run the API locally (requires `nvcc` and `iverilog` on PATH for real runs):

```bash
.venv/bin/uvicorn app.main:app --reload --port 8080
```

## Docker / deploy

```bash
cp .env.example .env          # set RUNNER_API_KEY + ALLOWED_ORIGINS
make build                    # docker build -t pit-runner .
make up                       # docker compose up -d --build (reserves 1 GPU)
```

Compose requires the
[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/)
on the host for the GPU reservation. For a CPU-only Verilog-only box, remove
the `deploy.resources` block.

Check it:

```bash
curl localhost:8080/health
curl -X POST localhost:8080/execute \
  -H "Content-Type: application/json" \
  -H "X-Runner-Key: $(grep RUNNER_API_KEY .env | cut -d= -f2)" \
  -d '{"language":"verilog","code":"module m; initial begin $display(\"hi\"); $finish; end endmodule","tests":""}'
```

## Frontend configuration

Point the runners in `assets/js/config.js` at this service:

```js
window.PIT_CONFIG = {
  runners: {
    cuda:    "https://your-gpu-runner.example.com/execute",
    verilog: "https://your-gpu-runner.example.com/execute"
  },
  // ...
};
```

Both languages can share one deployment (the image ships both toolchains),
or you can run two isolated instances. Add the exact frontend origin to
`ALLOWED_ORIGINS`, e.g. `https://your-site.example.com`. The frontend must
also send the `X-Runner-Key` header when auth is enabled.

## ⚠ Security warning

**A single long-running runner container is NOT strong multi-tenant
isolation.** Untrusted user code compiles and executes inside it; a kernel
exploit, container escape, or resource-exhaustion attack by one submission
can affect every other user of that container. The hardening here
(non-root user, read-only rootfs, dropped caps, PID limit, timeouts, output
caps, semaphores) reduces risk but does not eliminate it.

For a public-internet deployment, use **one isolated execution environment
per submission**, e.g.:

- **Kubernetes Jobs** (or equivalent) spawned per submission with
  `runAsNonRoot`, seccomp, no network, tight CPU/memory/PID limits — with
  sandboxed runtimes such as **gVisor (runsc)** or **Kata Containers** as the
  RuntimeClass;
- **network isolation**: deny egress from execution pods entirely (compile
  and run need no network), and isolate the runner API itself behind an
  ingress with auth;
- **rate limiting** per API key / IP at the edge (CDN, API gateway, or
  ingress annotations) in addition to the in-app concurrency semaphore;
- short-lived credentials and full audit logging of submissions.

Treat this service as a reference implementation for a trusted or
single-tenant environment, not as a hardened public code-execution platform.

## Files

| File | Purpose |
| --- | --- |
| `app/main.py` | FastAPI service: auth, validation, sandboxed compile/run |
| `tests/test_execute.py` | pytest suite (subprocess mocked — no nvcc/iverilog needed) |
| `Dockerfile` | NVIDIA CUDA devel base + Python + Icarus Verilog, non-root |
| `docker-compose.yml` | GPU reservation, read-only rootfs, dropped caps |
| `.env.example` | all configuration knobs with safe defaults |
| `Makefile` | `test` / `build` / `run` / `up` / `down` |
