"""Database setup.

Swapping databases later means changing DATABASE_URL (and installing the
matching driver, e.g. psycopg for Postgres) — nothing else in the app talks
to SQLite directly. All schema/query code lives in db_models.py and
repository.py and uses only SQLAlchemy's generic, dialect-agnostic column
types and query API.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./waitlist.db")

# SQLite specific: a connection is normally pinned to the thread that opened
# it, but FastAPI may serve a request's sync route on a different worker
# thread each time. Every request gets its own Session/connection (see
# get_db below), so this is safe — it just relaxes SQLite's default check.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import db_models  # noqa: F401  registers the ORM models on Base

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        if db.query(db_models.PartyRow).count() == 0:
            from app.seed import seed_db

            seed_db(db)
