"""In-memory mock database for the Waitlist API.

This stands in for a real database (see _docs/specs.md — the backend
persistence layer is still an open question). Every access goes through
this module so it can be swapped for a real database later without
touching the routers: replace the bodies of these functions with ORM/SQL
calls and keep the signatures.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.models import JoinSource, Party, PartyStatus, Table, TableStatus


class NotFoundError(Exception):
    pass


class ConflictError(Exception):
    pass


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def estimate_wait_minutes(party_size: int, waiting_ahead: int) -> int:
    base = 10 if party_size <= 2 else 18 if party_size <= 4 else 28
    return base + waiting_ahead * 6


def _seed() -> tuple[list[Party], list[Table]]:
    now = datetime.now(timezone.utc)
    parties = [
        Party(
            id="p1",
            name="Garcia",
            phone="555-0101",
            party_size=2,
            status=PartyStatus.waiting,
            source=JoinSource.host,
            created_at=(now - timedelta(minutes=12)).isoformat(),
            quoted_wait_minutes=15,
            position=0,
        ),
        Party(
            id="p2",
            name="Chen",
            phone="555-0102",
            party_size=4,
            status=PartyStatus.waiting,
            source=JoinSource.remote,
            created_at=(now - timedelta(minutes=8)).isoformat(),
            quoted_wait_minutes=25,
            position=1,
        ),
        Party(
            id="p3",
            name="Patel",
            phone="555-0103",
            party_size=3,
            status=PartyStatus.notified,
            source=JoinSource.kiosk,
            created_at=(now - timedelta(minutes=20)).isoformat(),
            quoted_wait_minutes=10,
            position=2,
        ),
    ]
    tables = [
        Table(id="t1", label="T1", capacity=2, status=TableStatus.available),
        Table(id="t2", label="T2", capacity=2, status=TableStatus.available),
        Table(id="t3", label="T3", capacity=4, status=TableStatus.available),
        Table(id="t4", label="T4", capacity=4, status=TableStatus.available),
        Table(id="t5", label="T5", capacity=6, status=TableStatus.available),
        Table(id="t6", label="T6", capacity=8, status=TableStatus.available),
    ]
    return parties, tables


class WaitlistStore:
    def __init__(self) -> None:
        self._parties: list[Party] = []
        self._tables: list[Table] = []
        self.reset()

    def reset(self) -> None:
        self._parties, self._tables = _seed()

    def list_parties(self) -> list[Party]:
        return list(self._parties)

    def list_tables(self) -> list[Table]:
        return list(self._tables)

    def _get_party(self, party_id: str) -> Party:
        for party in self._parties:
            if party.id == party_id:
                return party
        raise NotFoundError(f"Party not found: {party_id}")

    def _get_table(self, table_id: str) -> Table:
        for table in self._tables:
            if table.id == table_id:
                return table
        raise NotFoundError(f"Table not found: {table_id}")

    def add_party(
        self,
        *,
        name: str,
        phone: str,
        party_size: int,
        source: JoinSource,
        notes: Optional[str] = None,
    ) -> Party:
        waiting_ahead = sum(1 for p in self._parties if p.status == PartyStatus.waiting)
        max_position = max((p.position for p in self._parties), default=-1)
        party = Party(
            id=f"p_{uuid.uuid4().hex[:8]}",
            name=name,
            phone=phone,
            party_size=party_size,
            status=PartyStatus.waiting,
            source=source,
            notes=notes,
            created_at=_now_iso(),
            quoted_wait_minutes=estimate_wait_minutes(party_size, waiting_ahead),
            position=max_position + 1,
        )
        self._parties.append(party)
        return party

    def notify_party(self, party_id: str) -> Party:
        party = self._get_party(party_id)
        updated = party.model_copy(update={"status": PartyStatus.notified})
        self._replace_party(updated)
        return updated

    def seat_party(self, party_id: str, table_id: str) -> Party:
        party = self._get_party(party_id)
        table = self._get_table(table_id)
        if table.status == TableStatus.occupied:
            raise ConflictError(f"Table already occupied: {table_id}")

        updated_party = party.model_copy(update={"status": PartyStatus.seated, "table_id": table_id})
        updated_table = table.model_copy(update={"status": TableStatus.occupied, "party_id": party_id})
        self._replace_party(updated_party)
        self._replace_table(updated_table)
        return updated_party

    def remove_party(self, party_id: str) -> Party:
        party = self._get_party(party_id)
        updated = party.model_copy(update={"status": PartyStatus.removed})
        self._replace_party(updated)
        return updated

    def reorder(self, ordered_ids: list[str]) -> list[Party]:
        for party_id in ordered_ids:
            self._get_party(party_id)  # raises NotFoundError if unknown

        position_by_id = {party_id: index for index, party_id in enumerate(ordered_ids)}
        self._parties = [
            p.model_copy(update={"position": position_by_id[p.id]}) if p.id in position_by_id else p
            for p in self._parties
        ]
        return self.list_parties()

    def free_table(self, table_id: str) -> Table:
        table = self._get_table(table_id)
        updated = table.model_copy(update={"status": TableStatus.available, "party_id": None})
        self._replace_table(updated)
        return updated

    def estimate_wait(self, party_size: int) -> int:
        waiting_ahead = sum(1 for p in self._parties if p.status == PartyStatus.waiting)
        return estimate_wait_minutes(party_size, waiting_ahead)

    def _replace_party(self, updated: Party) -> None:
        self._parties = [updated if p.id == updated.id else p for p in self._parties]

    def _replace_table(self, updated: Table) -> None:
        self._tables = [updated if t.id == updated.id else t for t in self._tables]


store = WaitlistStore()


def reset_store() -> None:
    store.reset()
