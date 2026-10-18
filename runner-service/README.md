# Verilog runner service

A small FastAPI service that compiles and runs Verilog submissions with Icarus Verilog. It implements the contract used by `assets/js/runner.js`:

```http
POST /execute
Content-Type: application/json
X-Runner-Key: optional

{"language":"verilog","code":"...","tests":"..."}
```

```json
{"stdout":"...","stderr":"...","code":0}
```

The service writes `code` and the optional appended `tests` to a fresh temporary directory, runs:

```text
iverilog -g2012 -o sim main.v
vvp sim
```

and removes the directory after the request.

## Local development

Requirements: Python 3.11+ and Icarus Verilog for real execution.

```bash
cp .env.example .env
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt -r requirements-dev.txt
.venv/bin/uvicorn app.main:app --reload --port 8080
```

Test without requiring Icarus—the subprocess layer is mocked:

```bash
make test
```

Health check:

```bash
curl http://localhost:8080/health
```

Execution example:

```bash
curl -X POST http://localhost:8080/execute \
  -H 'Content-Type: application/json' \
  -H 'X-Runner-Key: change-me' \
  -d '{"language":"verilog","code":"module m; initial begin $display(\"ok\"); $finish; end endmodule","tests":""}'
```

## Docker deployment

```bash
cp .env.example .env
# Set ALLOWED_ORIGINS and RUNNER_API_KEY.
docker compose up --build -d
```

The image uses a regular Python slim base and installs Icarus Verilog; no special hardware or container runtime is required.

Configure the website in `assets/js/config.js`:

```js
window.PIT_CONFIG = {
  runners: {
    verilog: "https://your-runner.example.com/execute"
  },
  runnerKey: null,
  // remaining Judge0/Pyodide settings...
};
```

## Configuration

| Variable | Default | Bounds/purpose |
|---|---:|---|
| `RUNNER_API_KEY` | empty | Enables `X-Runner-Key` checking when set |
| `ALLOWED_ORIGINS` | empty | Comma-separated CORS allow-list |
| `MAX_REQUEST_BYTES` | 131072 | Clamped to 1–128 KiB |
| `COMPILE_TIMEOUT` | 60 | Clamped to 1–300 seconds |
| `RUN_TIMEOUT` | 10 | Clamped to 1–60 seconds |
| `MAX_OUTPUT_BYTES` | 65536 | Clamped to 1–64 KiB per stream |
| `MAX_CONCURRENT` | 4 | Clamped to 1–32 executions |

## Security boundary

Included defenses:

- optional constant-time API-key comparison;
- CORS allow-list;
- request-size limits;
- compile and run timeouts;
- output truncation;
- argument-array subprocess calls with no shell;
- a fresh temporary directory per request;
- bounded concurrency;
- non-root container user;
- read-only root filesystem, `noexec` temporary storage, dropped Linux capabilities, `no-new-privileges`, and bounded PIDs in Compose.

A key embedded in browser JavaScript is not secret. The reference service is suitable for private/internal use, but compiling arbitrary untrusted HDL remains risky. A public deployment should place authentication and rate limiting in front of the API and execute every submission in a separately isolated job or sandbox such as gVisor, Kata Containers, or a disposable microVM.

## Files

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI API, limits, compilation, execution |
| `tests/test_execute.py` | Endpoint and subprocess-safety tests |
| `Dockerfile` | Python + Icarus, non-root runtime |
| `docker-compose.yml` | Hardened single-service deployment |
| `.env.example` | Configuration template |
| `Makefile` | Install, test, build, and Compose shortcuts |
