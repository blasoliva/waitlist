# Waitlist

A restaurant waitlist management application for hosts and staff to manage customer queues and table flow.

## Overview

Waitlist helps restaurant staff efficiently manage their waitlist, track parties, and streamline the seating process. The application is designed for host/staff use at the restaurant.

## Features

### Customer Join Methods

Customers can join the waitlist through multiple channels:

- **Host Stand Entry** — Staff manually adds walk-in customers
- **Self Check-in** — QR code or kiosk-based self-registration
- **Remote Join** — Customers join via app/web before arriving

### Host-Facing Capabilities

- View and manage the waitlist queue
- Drag and reorder parties
- Assign tables to parties
- Estimated wait time display
- Update party status (waiting, notified, seated, removed)

## Project Structure

```
frontend/    React + TypeScript + Vite app (host dashboard, kiosk, remote join)
backend/     FastAPI + SQLAlchemy API
_docs/       Specs and the OpenAPI contract (openapi.yaml)
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, dnd-kit
- **Backend**: FastAPI (Python), SQLAlchemy, managed with [uv](https://docs.astral.sh/uv/)
- **Database**: SQLite for local development, accessed via SQLAlchemy (database-agnostic) — see [`backend/README.md`](backend/README.md#database)

## Getting Started

### Prerequisites

- **Node.js** (managed via [nvm](https://github.com/nvm-sh/nvm)): `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"` if `node`/`npm` aren't already on your `PATH`.
- **uv** for the backend: https://docs.astral.sh/uv/getting-started/installation/

### Backend

```sh
cd backend
uv sync
uv run uvicorn app.main:app --app-dir src --reload --port 8000
```

- API: http://localhost:8000/api
- Interactive docs: http://localhost:8000/docs
- Creates and seeds `backend/waitlist.db` (SQLite) on first run.

### Frontend

```sh
cd frontend
npm install
npm run dev
```

- App: http://localhost:5173
- Expects the backend at `http://localhost:8000/api` by default; override with `VITE_API_BASE_URL` (see `frontend/.env.example`).

Run both at once (in separate terminals) to use the app end to end.

## Testing

### Backend

```sh
cd backend
uv run pytest
```

Each test runs against its own fresh, seeded, in-memory SQLite database — independent of `backend/waitlist.db`.

### Frontend

No automated test suite yet. `npm run build` type-checks the app, and `npm run lint` runs the linter.

## License

TBD
