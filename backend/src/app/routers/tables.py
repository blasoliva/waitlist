from fastapi import APIRouter, HTTPException

from app.models import Table
from app.store import NotFoundError, store

router = APIRouter(prefix="/tables", tags=["tables"])


@router.get("", response_model=list[Table])
def list_tables() -> list[Table]:
    return store.list_tables()


@router.post("/{table_id}/free", response_model=Table)
def free_table(table_id: str) -> Table:
    try:
        return store.free_table(table_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
