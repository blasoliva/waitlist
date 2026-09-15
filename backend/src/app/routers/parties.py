from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import repository
from app.db import get_db
from app.models import AddPartyRequest, Party, ReorderRequest, SeatRequest, WaitEstimate
from app.repository import ConflictError, NotFoundError

router = APIRouter(prefix="/parties", tags=["parties"])


@router.get("", response_model=list[Party])
def list_parties(db: Session = Depends(get_db)) -> list[Party]:
    return [Party.model_validate(p) for p in repository.list_parties(db)]


@router.post("", response_model=Party, status_code=201)
def add_party(body: AddPartyRequest, db: Session = Depends(get_db)) -> Party:
    party = repository.add_party(
        db,
        name=body.name,
        phone=body.phone,
        party_size=body.party_size,
        source=body.source.value,
        notes=body.notes,
    )
    return Party.model_validate(party)


@router.post("/reorder", response_model=list[Party])
def reorder_queue(body: ReorderRequest, db: Session = Depends(get_db)) -> list[Party]:
    try:
        parties = repository.reorder(db, body.ordered_ids)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [Party.model_validate(p) for p in parties]


@router.get("/estimate-wait", response_model=WaitEstimate)
def estimate_wait(party_size: int = Query(..., alias="partySize", ge=1), db: Session = Depends(get_db)) -> WaitEstimate:
    return WaitEstimate(minutes=repository.estimate_wait(db, party_size))


@router.post("/{party_id}/notify", response_model=Party)
def notify_party(party_id: str, db: Session = Depends(get_db)) -> Party:
    try:
        party = repository.notify_party(db, party_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return Party.model_validate(party)


@router.post("/{party_id}/seat", response_model=Party)
def seat_party(party_id: str, body: SeatRequest, db: Session = Depends(get_db)) -> Party:
    try:
        party = repository.seat_party(db, party_id, body.table_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return Party.model_validate(party)


@router.post("/{party_id}/remove", response_model=Party)
def remove_party(party_id: str, db: Session = Depends(get_db)) -> Party:
    try:
        party = repository.remove_party(db, party_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return Party.model_validate(party)
