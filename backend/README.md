# Waitlist API

FastAPI backend for the Waitlist app, implementing the contract in
[`../_docs/openapi.yaml`](../_docs/openapi.yaml). Persistence is currently an in-memory
mock store (`src/app/store.py`) — no real database yet; see
[`../_docs/specs.md`](../_docs/specs.md) for the open questions that will
decide the real backend/database.

Field names and enums match the frontend's existing mock API
(`frontend/src/api/waitlistApi.ts`) exactly, so the frontend can eventually
be pointed at this server without changing its data model.

## Setup

```sh
uv sync
```

## Run

```sh
uv run uvicorn app.main:app --app-dir src --reload --port 8000
```

Interactive docs: http://localhost:8000/docs

CORS is enabled for `http://localhost:5173` (the Vite dev server).

## Test

Tests were written first, against the OpenAPI contract, before the routes
were implemented.

```sh
uv run pytest
```
