from fastapi import APIRouter, HTTPException, Query

from app.models import AddPartyRequest, Party, ReorderRequest, SeatRequest, WaitEstimate
from app.store import ConflictError, NotFoundError, store

router = APIRouter(prefix="/parties", tags=["parties"])


@router.get("", response_model=list[Party])
def list_parties() -> list[Party]:
    return store.list_parties()


@router.post("", response_model=Party, status_code=201)
def add_party(body: AddPartyRequest) -> Party:
    return store.add_party(
        name=body.name,
        phone=body.phone,
        party_size=body.party_size,
        source=body.source,
        notes=body.notes,
    )


@router.post("/reorder", response_model=list[Party])
def reorder_queue(body: ReorderRequest) -> list[Party]:
    try:
        return store.reorder(body.ordered_ids)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/estimate-wait", response_model=WaitEstimate)
def estimate_wait(party_size: int = Query(..., alias="partySize", ge=1)) -> WaitEstimate:
    return WaitEstimate(minutes=store.estimate_wait(party_size))


@router.post("/{party_id}/notify", response_model=Party)
def notify_party(party_id: str) -> Party:
    try:
        return store.notify_party(party_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{party_id}/seat", response_model=Party)
def seat_party(party_id: str, body: SeatRequest) -> Party:
    try:
        return store.seat_party(party_id, body.table_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post("/{party_id}/remove", response_model=Party)
def remove_party(party_id: str) -> Party:
    try:
        return store.remove_party(party_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
