import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers import parties, tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Waitlist API", version="0.1.0", lifespan=lifespan)

# Comma-separated list of origins the frontend is served from. Defaults to
# the local Vite dev server; set CORS_ALLOWED_ORIGINS when deploying the
# frontend elsewhere (e.g. "https://waitlist.example.com").
allowed_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parties.router, prefix="/api")
app.include_router(tables.router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
