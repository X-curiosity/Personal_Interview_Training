"""Reference execution backend for Personal_Interview_Training.

Implements the frontend runner contract (assets/js/config.js):

    POST /execute
    { "language": "verilog", "code": "...", "tests": "..." }
    -> 200 { "stdout": "...", "stderr": "...", "code": 0 }

Security properties:
  * Optional API-key auth (X-Runner-Key) when RUNNER_API_KEY is set.
  * CORS allow-list from ALLOWED_ORIGINS; credentials are never combined
    with a wildcard origin.
  * Hard request-size limit (code + tests <= 128 KiB).
  * Compile/run timeouts with safe upper bounds.
  * Output truncation to <= 64 KiB per stream.
  * subprocess is always invoked with an argument array, never shell=True;
    user content only ever lands inside files in a per-request TemporaryDirectory.
  * Global semaphore bounds concurrent executions.
"""

from __future__ import annotations

import asyncio
import hmac
import os
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

KIB = 1024


# --------------------------------------------------------------------------
# Configuration (read per-request so tests can monkeypatch env vars).
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class Config:
    api_key: str
    allowed_origins: list[str]
    max_request_bytes: int      # hard cap on code+tests
    compile_timeout: float      # seconds
    run_timeout: float          # seconds
    max_output_bytes: int       # per-stream truncation
    max_vcd_bytes: int          # waveform dump cap
    max_concurrent: int


def _clamp(value: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, value))


def get_config() -> Config:
    """Build configuration from the environment, clamped to safe bounds."""
    return Config(
        api_key=os.environ.get("RUNNER_API_KEY", ""),
        allowed_origins=[
            o.strip()
            for o in os.environ.get("ALLOWED_ORIGINS", "").split(",")
            if o.strip()
        ],
        # hard bound: never accept more than 128 KiB of user text
        max_request_bytes=_clamp(
            int(os.environ.get("MAX_REQUEST_BYTES", 128 * KIB)), KIB, 128 * KIB
        ),
        # safe upper bounds so env misconfiguration cannot disable timeouts
        compile_timeout=_clamp(
            int(os.environ.get("COMPILE_TIMEOUT", "60")), 1, 300
        ),
        run_timeout=_clamp(int(os.environ.get("RUN_TIMEOUT", "10")), 1, 60),
        max_output_bytes=_clamp(
            int(os.environ.get("MAX_OUTPUT_BYTES", 64 * KIB)), KIB, 64 * KIB
        ),
        # a VCD is bigger than text output but still bounded
        max_vcd_bytes=_clamp(
            int(os.environ.get("MAX_VCD_BYTES", 1024 * KIB)), 16 * KIB, 4096 * KIB
        ),
        max_concurrent=_clamp(int(os.environ.get("MAX_CONCURRENT", "4")), 1, 32),
    )


# --------------------------------------------------------------------------
# App & middleware
# --------------------------------------------------------------------------

app = FastAPI(title="PIT Runner", version="1.0.0")

_origins = get_config().allowed_origins or ["http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    # never combine credentials with a wildcard origin
    allow_credentials="*" not in _origins,
    allow_methods=["GET", "POST"],
    allow_headers=["X-Runner-Key", "Content-Type"],
)

# One semaphore per configured limit; (re)created lazily so env changes in
# tests take effect. Real deployments set env before startup anyway.
_semaphores: dict[int, asyncio.Semaphore] = {}


def _semaphore(limit: int) -> asyncio.Semaphore:
    sem = _semaphores.get(limit)
    if sem is None:
        sem = asyncio.Semaphore(limit)
        _semaphores[limit] = sem
    return sem


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------

async def require_api_key(
    x_runner_key: str | None = Header(default=None),
    config: Config = Depends(get_config),
) -> None:
    """Enforce X-Runner-Key only when RUNNER_API_KEY is configured."""
    if config.api_key:
        supplied = x_runner_key or ""
        if not hmac.compare_digest(supplied, config.api_key):
            raise HTTPException(status_code=401, detail="invalid or missing X-Runner-Key")


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------

class ExecuteRequest(BaseModel):
    language: Literal["verilog"]
    # byte-level bounds are enforced in the handler (combined code+tests)
    code: str = ""
    tests: str = ""
    # ask for a value-change dump so the UI can draw waveforms
    dump: bool = False


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    code: int
    vcd: str | None = None


# --------------------------------------------------------------------------
# Subprocess helpers — argument arrays only, never a shell.
# --------------------------------------------------------------------------

@dataclass
class ProcResult:
    code: int
    stdout: bytes
    stderr: bytes


def _run_argv(argv: list[str], timeout: float, cwd: str) -> ProcResult:
    """Run argv (no shell). Returns code 124 on timeout."""
    try:
        proc = subprocess.run(
            argv,               # list -> execve directly, no shell involved
            capture_output=True,
            timeout=timeout,
            cwd=cwd,
        )
        return ProcResult(proc.returncode, proc.stdout or b"", proc.stderr or b"")
    except subprocess.TimeoutExpired as exc:
        out = exc.stdout or b""
        if isinstance(out, str):
            out = out.encode()
        err = exc.stderr or b""
        if isinstance(err, str):
            err = err.encode()
        return ProcResult(
            124, out, err + f"\n[runner] timed out after {timeout}s\n".encode()
        )


def _truncate(data: bytes, limit: int) -> str:
    if len(data) > limit:
        data = data[:limit] + b"\n[runner] output truncated\n"
    return data.decode("utf-8", errors="replace")


def inject_dump(tests: str) -> str:
    """Add VCD dumping to a testbench without touching a user's sources.

    The dump is injected inside the last module (the testbench), because
    $dumpvars only records what is elaborated beneath its calling scope."""
    marker = "endmodule"
    index = tests.rfind(marker)
    if index == -1:
        return tests
    hook = (
        "initial begin\n"
        "  $dumpfile(\"pit.vcd\");\n"
        "  $dumpvars(0);\n"
        "end\n"
    )
    return tests[:index] + hook + tests[index:]


def _execute(
    language: str, code: str, tests: str, config: Config, dump: bool = False
) -> ExecuteResponse:
    """Compile and run inside a fresh tempdir; cleaned up on return."""
    with tempfile.TemporaryDirectory(prefix="pit-runner-") as workdir:
        work = Path(workdir)

        if dump and tests:
            tests = inject_dump(tests)

        source = work / "main.v"
        source.write_text(code + ("\n" + tests if tests else "") + "\n")
        compile_argv = [
            "iverilog", "-g2012", "-o", "sim", str(source.name),
        ]
        run_argv = ["vvp", "sim"]

        compiled = _run_argv(compile_argv, config.compile_timeout, workdir)
        if compiled.code != 0:
            return ExecuteResponse(
                stdout=_truncate(compiled.stdout, config.max_output_bytes),
                stderr=_truncate(compiled.stderr, config.max_output_bytes),
                code=compiled.code,
            )

        run = _run_argv(run_argv, config.run_timeout, workdir)
        vcd = None
        dump_file = work / "pit.vcd"
        if dump and dump_file.exists():
            data = dump_file.read_bytes()
            if len(data) > config.max_vcd_bytes:
                data = data[: config.max_vcd_bytes]
                vcd = data.decode("utf-8", errors="replace")
            else:
                vcd = data.decode("utf-8", errors="replace")
        return ExecuteResponse(
            stdout=_truncate(run.stdout, config.max_output_bytes),
            stderr=_truncate(run.stderr, config.max_output_bytes),
            code=run.code,
            vcd=vcd,
        )


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    """Early rejection of oversized bodies before parsing."""
    if request.method == "POST":
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 128 * KIB + 4 * KIB:
            return JSONResponse(status_code=413, content={"detail": "request too large"})
    return await call_next(request)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/execute", response_model=ExecuteResponse)
async def execute(
    payload: ExecuteRequest,
    _: None = Depends(require_api_key),
    config: Config = Depends(get_config),
) -> ExecuteResponse:
    # Hard request-size limit on the combined payload bytes.
    total = len(payload.code.encode("utf-8")) + len(payload.tests.encode("utf-8"))
    if total > config.max_request_bytes:
        raise HTTPException(status_code=413, detail="code+tests exceed 128 KiB")

    sem = _semaphore(config.max_concurrent)
    try:
        await asyncio.wait_for(sem.acquire(), timeout=30)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=503, detail="runner busy, try again later")
    try:
        return await asyncio.to_thread(
            _execute, payload.language, payload.code, payload.tests, config, payload.dump
        )
    finally:
        sem.release()
