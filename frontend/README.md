# Waitlist Frontend

React + TypeScript + Vite app for the Waitlist project: the host dashboard
(queue management, table assignment), kiosk self check-in, and remote join
pages described in [`../_docs/specs.md`](../_docs/specs.md).

Talks to the FastAPI backend in [`../backend`](../backend) through a single
API client, [`src/api/waitlistApi.ts`](src/api/waitlistApi.ts) — every
request goes through that module.

## Setup

```sh
npm install
```

## Run

```sh
npm run dev
```

- App: http://localhost:5173
- Expects the backend at `http://localhost:8000/api` by default. To point
  it elsewhere, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

## Build

```sh
npm run build
```

Type-checks the app (`tsc -b`) and builds a production bundle with Vite.

## Lint

```sh
npm run lint
```

## Test

No automated test suite yet.
