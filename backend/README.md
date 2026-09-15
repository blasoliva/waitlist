# Waitlist API

FastAPI backend for the Waitlist app, implementing the contract in
[`../_docs/openapi.yaml`](../_docs/openapi.yaml). Persisted with SQLAlchemy;
see [`../_docs/specs.md`](../_docs/specs.md) for the open questions that will
shape the eventual production backend/database choice.

Field names and enums match the frontend's existing API client
(`frontend/src/api/waitlistApi.ts`) exactly.

## Database

Persistence is via SQLAlchemy against `DATABASE_URL` (default:
`sqlite:///./waitlist.db`, created and seeded automatically on first run).
The app is database-agnostic: `app/db_models.py` and `app/repository.py`
only use SQLAlchemy's generic column types and query API, never
dialect-specific SQL. To point at a different database, set `DATABASE_URL`
and install the matching driver, e.g.:

```sh
DATABASE_URL=postgresql+psycopg://user:pass@localhost/waitlist uv add psycopg[binary]
```

No application code needs to change.

## Setup

```sh
uv sync
```

## Run

```sh
uv run uvicorn app.main:app --app-dir src --reload --port 8000
```

Interactive docs: http://localhost:8000/docs

CORS defaults to allowing `http://localhost:5173` (the Vite dev server). If
the frontend is deployed elsewhere, set `CORS_ALLOWED_ORIGINS` to a
comma-separated list of the origin(s) it's served from, e.g.:

```sh
CORS_ALLOWED_ORIGINS=https://waitlist.example.com,http://localhost:5173
```

## Test

Tests were written first, against the OpenAPI contract, before the routes
were implemented. Each test runs against its own fresh, seeded, in-memory
SQLite database (see `tests/conftest.py`) — no dependency on the dev
database file.

```sh
uv run pytest
```
