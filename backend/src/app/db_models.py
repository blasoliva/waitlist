"""SQLAlchemy ORM models (the real, persisted tables).

Column types are deliberately generic (String, Integer) rather than
dialect-specific (e.g. Postgres ENUM) so the same schema works unchanged
across SQLite/Postgres/MySQL/etc.
"""

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PartyRow(Base):
    __tablename__ = "parties"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str]
    phone: Mapped[str]
    party_size: Mapped[int]
    status: Mapped[str] = mapped_column(index=True)
    source: Mapped[str]
    notes: Mapped[str | None]
    created_at: Mapped[str]
    quoted_wait_minutes: Mapped[int]
    table_id: Mapped[str | None] = mapped_column(ForeignKey("tables.id"))
    position: Mapped[int]


class TableRow(Base):
    __tablename__ = "tables"

    id: Mapped[str] = mapped_column(primary_key=True)
    label: Mapped[str]
    capacity: Mapped[int]
    status: Mapped[str]
    party_id: Mapped[str | None] = mapped_column(ForeignKey("parties.id"))
