"""Data access layer, backed by the real database via SQLAlchemy.

This is the only module that queries the database. Routers call these
functions with a request-scoped Session (see app.db.get_db) and never touch
db_models or SQL directly — so swapping the database engine only ever
touches app/db.py.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db_models import PartyRow, TableRow


class NotFoundError(Exception):
    pass


class ConflictError(Exception):
    pass


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def estimate_wait_minutes(party_size: int, waiting_ahead: int) -> int:
    base = 10 if party_size <= 2 else 18 if party_size <= 4 else 28
    return base + waiting_ahead * 6


def list_parties(db: Session) -> list[PartyRow]:
    return list(db.execute(select(PartyRow).order_by(PartyRow.position)).scalars())


def list_tables(db: Session) -> list[TableRow]:
    return list(db.execute(select(TableRow).order_by(TableRow.label)).scalars())


def _get_party(db: Session, party_id: str) -> PartyRow:
    party = db.get(PartyRow, party_id)
    if party is None:
        raise NotFoundError(f"Party not found: {party_id}")
    return party


def _get_table(db: Session, table_id: str) -> TableRow:
    table = db.get(TableRow, table_id)
    if table is None:
        raise NotFoundError(f"Table not found: {table_id}")
    return table


def _waiting_count(db: Session) -> int:
    stmt = select(func.count()).select_from(PartyRow).where(PartyRow.status == "waiting")
    return db.execute(stmt).scalar_one()


def add_party(
    db: Session,
    *,
    name: str,
    phone: str,
    party_size: int,
    source: str,
    notes: str | None = None,
) -> PartyRow:
    waiting_ahead = _waiting_count(db)
    max_position = db.execute(select(func.max(PartyRow.position))).scalar_one()

    party = PartyRow(
        id=f"p_{uuid.uuid4().hex[:8]}",
        name=name,
        phone=phone,
        party_size=party_size,
        status="waiting",
        source=source,
        notes=notes,
        created_at=_now_iso(),
        quoted_wait_minutes=estimate_wait_minutes(party_size, waiting_ahead),
        position=(max_position if max_position is not None else -1) + 1,
    )
    db.add(party)
    db.commit()
    db.refresh(party)
    return party


def notify_party(db: Session, party_id: str) -> PartyRow:
    party = _get_party(db, party_id)
    party.status = "notified"
    db.commit()
    db.refresh(party)
    return party


def seat_party(db: Session, party_id: str, table_id: str) -> PartyRow:
    party = _get_party(db, party_id)
    table = _get_table(db, table_id)
    if table.status == "occupied":
        raise ConflictError(f"Table already occupied: {table_id}")

    party.status = "seated"
    party.table_id = table_id
    table.status = "occupied"
    table.party_id = party_id
    db.commit()
    db.refresh(party)
    return party


def remove_party(db: Session, party_id: str) -> PartyRow:
    party = _get_party(db, party_id)
    party.status = "removed"
    db.commit()
    db.refresh(party)
    return party


def reorder(db: Session, ordered_ids: list[str]) -> list[PartyRow]:
    parties_by_id = {p.id: p for p in list_parties(db)}
    for party_id in ordered_ids:
        if party_id not in parties_by_id:
            raise NotFoundError(f"Party not found: {party_id}")

    for index, party_id in enumerate(ordered_ids):
        parties_by_id[party_id].position = index

    db.commit()
    return list_parties(db)


def free_table(db: Session, table_id: str) -> TableRow:
    table = _get_table(db, table_id)
    table.status = "available"
    table.party_id = None
    db.commit()
    db.refresh(table)
    return table


def estimate_wait(db: Session, party_size: int) -> int:
    return estimate_wait_minutes(party_size, _waiting_count(db))
