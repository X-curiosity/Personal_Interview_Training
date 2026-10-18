"""Tests for the runner service.

CI has no iverilog, so subprocess.run is mocked everywhere. The mocks
also let us assert that commands are invoked as argument arrays with no shell.
"""

from __future__ import annotations

import subprocess

import pytest
from fastapi.testclient import TestClient

from app import main
from app.main import app


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

class FakeProc:
    def __init__(self, returncode=0, stdout=b"", stderr=b""):
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


@pytest.fixture()
def client(monkeypatch):
    # deterministic config for every test
    monkeypatch.setenv("RUNNER_API_KEY", "test-key")
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://localhost:8000")
    monkeypatch.setenv("COMPILE_TIMEOUT", "60")
    monkeypatch.setenv("RUN_TIMEOUT", "10")
    return TestClient(app)


def ok_run(argv, **kwargs):
    return FakeProc(0, b"hello\n", b"")


def post(client, body, key="test-key"):
    headers = {"X-Runner-Key": key} if key is not None else {}
    return client.post("/execute", json=body, headers=headers)


VERILOG_BODY = {"language": "verilog", "code": "module m; endmodule", "tests": ""}


# --------------------------------------------------------------------------
# Health
# --------------------------------------------------------------------------

def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------

def test_auth_missing_key_rejected(client, monkeypatch):
    monkeypatch.setattr(main.subprocess, "run", ok_run)
    assert post(client, VERILOG_BODY, key=None).status_code == 401


def test_auth_wrong_key_rejected(client, monkeypatch):
    monkeypatch.setattr(main.subprocess, "run", ok_run)
    assert post(client, VERILOG_BODY, key="nope").status_code == 401


def test_auth_correct_key_accepted(client, monkeypatch):
    monkeypatch.setattr(main.subprocess, "run", ok_run)
    assert post(client, VERILOG_BODY).status_code == 200


def test_auth_disabled_when_env_empty(client, monkeypatch):
    monkeypatch.setenv("RUNNER_API_KEY", "")
    monkeypatch.setattr(main.subprocess, "run", ok_run)
    r = client.post("/execute", json=VERILOG_BODY)
    assert r.status_code == 200


# --------------------------------------------------------------------------
# Validation
# --------------------------------------------------------------------------

@pytest.mark.parametrize("language", ["python", "cuda"])
def test_invalid_language_rejected(client, language):
    r = post(client, {"language": language, "code": "invalid", "tests": ""})
    assert r.status_code == 422


def test_size_limit_rejected(client):
    big = "x" * (129 * 1024)
    r = post(client, {"language": "verilog", "code": big, "tests": ""})
    assert r.status_code == 413


def test_size_limit_combined_code_and_tests(client):
    # each field alone passes the pydantic max_length, together they exceed 128 KiB
    chunk = "x" * (100 * 1024)
    r = post(client, {"language": "verilog", "code": chunk, "tests": chunk})
    assert r.status_code == 413


# --------------------------------------------------------------------------
# Compile / run outcomes
# --------------------------------------------------------------------------

def test_compile_failure_returned(client, monkeypatch):
    def fake_run(argv, **kwargs):
        return FakeProc(1, b"", b"main.v: error: expected ';'\n")

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    r = post(client, VERILOG_BODY)
    assert r.status_code == 200
    body = r.json()
    assert body["code"] == 1
    assert "error" in body["stderr"]


def test_compile_timeout(client, monkeypatch):
    def fake_run(argv, **kwargs):
        raise subprocess.TimeoutExpired(cmd=argv, timeout=kwargs.get("timeout"))

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    r = post(client, VERILOG_BODY)
    assert r.status_code == 200
    body = r.json()
    assert body["code"] == 124
    assert "timed out" in body["stderr"]


def test_run_timeout(client, monkeypatch):
    calls = {"n": 0}

    def fake_run(argv, **kwargs):
        calls["n"] += 1
        if calls["n"] == 1:  # compile succeeds
            return FakeProc(0, b"", b"")
        raise subprocess.TimeoutExpired(cmd=argv, timeout=kwargs.get("timeout"))

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    r = post(client, VERILOG_BODY)
    assert r.status_code == 200
    body = r.json()
    assert body["code"] == 124
    assert "timed out" in body["stderr"]


def test_success_response(client, monkeypatch):
    monkeypatch.setattr(main.subprocess, "run", ok_run)
    r = post(client, VERILOG_BODY)
    assert r.status_code == 200
    body = r.json()
    assert body == {"stdout": "hello\n", "stderr": "", "code": 0}


def test_output_truncated_to_64kib(client, monkeypatch):
    def fake_run(argv, **kwargs):
        return FakeProc(0, b"x" * (70 * 1024), b"")

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    r = post(client, VERILOG_BODY)
    body = r.json()
    # first call is compile; truncation applies to both stages — either way the
    # returned stdout must stay within limit + marker
    assert len(body["stdout"].encode()) <= 64 * 1024 + len("\n[runner] output truncated\n")
    assert "truncated" in body["stdout"]


# --------------------------------------------------------------------------
# Command invocation: argument arrays, no shell
# --------------------------------------------------------------------------

def test_commands_use_argv_arrays_and_no_shell(client, monkeypatch):
    calls = []

    def fake_run(argv, **kwargs):
        calls.append((argv, kwargs))
        return FakeProc(0, b"", b"")

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    r = post(client, VERILOG_BODY)
    assert r.status_code == 200
    assert len(calls) == 2

    compile_argv, _ = calls[0]
    run_argv, _ = calls[1]

    # every invocation is an argument array, never a string, never shell=True
    for argv, kwargs in calls:
        assert isinstance(argv, list)
        assert all(isinstance(a, str) for a in argv)
        assert kwargs.get("shell", False) is False

    assert compile_argv[0] == "iverilog"
    assert run_argv[0] == "vvp"

    # user code never appears inside a command argument — only fixed filenames
    assert VERILOG_BODY["code"] not in compile_argv
    assert VERILOG_BODY["code"] not in run_argv
    assert "main.v" in compile_argv


def test_verilog_compile_flags(client, monkeypatch):
    calls = []

    def fake_run(argv, **kwargs):
        calls.append(argv)
        return FakeProc(0, b"", b"")

    monkeypatch.setattr(main.subprocess, "run", fake_run)
    post(client, VERILOG_BODY)
    compile_argv, run_argv = calls
    assert compile_argv[:3] == ["iverilog", "-g2012", "-o"]
    assert "main.v" in compile_argv
    assert run_argv == ["vvp", "sim"]


def test_tests_are_appended_to_source_file(client, monkeypatch, tmp_path):
    written = {}

    real_write_text = main.Path.write_text

    def spy_write_text(self, data, *args, **kwargs):
        written[str(self)] = data
        return real_write_text(self, data, *args, **kwargs)

    monkeypatch.setattr(main.Path, "write_text", spy_write_text)
    monkeypatch.setattr(main.subprocess, "run", ok_run)

    body = {"language": "verilog", "code": "// CODE", "tests": "// TESTS"}
    assert post(client, body).status_code == 200
    content = next(iter(written.values()))
    assert "// CODE" in content and "// TESTS" in content
