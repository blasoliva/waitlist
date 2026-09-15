from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import parties, tables

app = FastAPI(title="Waitlist API", version="0.1.0")

# Local Vite dev server for the frontend (frontend/).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parties.router, prefix="/api")
app.include_router(tables.router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
