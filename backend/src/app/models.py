from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


def to_camel(snake: str) -> str:
    head, *tail = snake.split("_")
    return head + "".join(word.capitalize() for word in tail)


class CamelModel(BaseModel):
    # from_attributes lets Party.model_validate(party_row) build a response
    # straight from an ORM row, not just a dict.
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class PartyStatus(str, Enum):
    waiting = "waiting"
    notified = "notified"
    seated = "seated"
    removed = "removed"


class JoinSource(str, Enum):
    host = "host"
    kiosk = "kiosk"
    remote = "remote"


class TableStatus(str, Enum):
    available = "available"
    occupied = "occupied"


class Party(CamelModel):
    id: str
    name: str
    phone: str
    party_size: int = Field(ge=1)
    status: PartyStatus
    source: JoinSource
    notes: Optional[str] = None
    created_at: str
    quoted_wait_minutes: int = Field(ge=0)
    table_id: Optional[str] = None
    position: int


class Table(CamelModel):
    id: str
    label: str
    capacity: int = Field(ge=1)
    status: TableStatus
    party_id: Optional[str] = None


class AddPartyRequest(CamelModel):
    name: str = Field(min_length=1)
    phone: str = Field(min_length=1)
    party_size: int = Field(ge=1)
    source: JoinSource
    notes: Optional[str] = None


class SeatRequest(CamelModel):
    table_id: str


class ReorderRequest(CamelModel):
    ordered_ids: list[str]


class WaitEstimate(CamelModel):
    minutes: int = Field(ge=0)
