"""Demo seed data — same parties/tables the old in-memory mock used."""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db_models import PartyRow, TableRow


def seed_db(db: Session) -> None:
    now = datetime.now(timezone.utc)

    db.add_all(
        [
            PartyRow(
                id="p1",
                name="Garcia",
                phone="555-0101",
                party_size=2,
                status="waiting",
                source="host",
                notes=None,
                created_at=(now - timedelta(minutes=12)).isoformat(),
                quoted_wait_minutes=15,
                table_id=None,
                position=0,
            ),
            PartyRow(
                id="p2",
                name="Chen",
                phone="555-0102",
                party_size=4,
                status="waiting",
                source="remote",
                notes=None,
                created_at=(now - timedelta(minutes=8)).isoformat(),
                quoted_wait_minutes=25,
                table_id=None,
                position=1,
            ),
            PartyRow(
                id="p3",
                name="Patel",
                phone="555-0103",
                party_size=3,
                status="notified",
                source="kiosk",
                notes=None,
                created_at=(now - timedelta(minutes=20)).isoformat(),
                quoted_wait_minutes=10,
                table_id=None,
                position=2,
            ),
        ]
    )

    db.add_all(
        [
            TableRow(id=f"t{i}", label=f"T{i}", capacity=capacity, status="available", party_id=None)
            for i, capacity in enumerate([2, 2, 4, 4, 6, 8], start=1)
        ]
    )

    db.commit()
