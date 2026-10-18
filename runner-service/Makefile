.PHONY: install dev-install test build run up down logs clean

PY ?= python3
VENV ?= .venv

install:
	$(PY) -m venv $(VENV)
	$(VENV)/bin/pip install -r requirements.txt

dev-install: install
	$(VENV)/bin/pip install pytest httpx

test: dev-install
	$(VENV)/bin/python -m pytest tests/ -v

build:
	docker build -t pit-runner .

run: build
	docker run --rm --gpus all -p 8080:8080 --env-file .env pit-runner

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f runner

clean:
	rm -rf $(VENV) .pytest_cache tests/__pycache__ app/__pycache__
