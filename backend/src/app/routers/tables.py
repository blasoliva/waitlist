from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import repository
from app.db import get_db
from app.models import Table
from app.repository import NotFoundError

router = APIRouter(prefix="/tables", tags=["tables"])


@router.get("", response_model=list[Table])
def list_tables(db: Session = Depends(get_db)) -> list[Table]:
    return [Table.model_validate(t) for t in repository.list_tables(db)]


@router.post("/{table_id}/free", response_model=Table)
def free_table(table_id: str, db: Session = Depends(get_db)) -> Table:
    try:
        table = repository.free_table(db, table_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return Table.model_validate(table)
