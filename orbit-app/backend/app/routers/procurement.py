from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/procurement", tags=["procurement"])


@router.get("/check", response_model=schemas.ProcurementCheckResult)
def procurement_check(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """
    Given a free-text description of equipment a project wants to buy,
    search the enterprise asset ledger for existing matches before a
    purchase requisition is raised.

    A real deployment would swap the ILIKE match below for an embedding /
    LLM-based semantic match against asset name + category + spec sheet text.
    """
    like = f"%{q.lower()}%"
    matches = (
        db.query(models.Asset)
        .filter(or_(models.Asset.name.ilike(like), models.Asset.category.ilike(like)))
        .all()
    )
    idle = [a for a in matches if a.status == "available"]
    estimated_saving = idle[0].book_value if idle else None

    return schemas.ProcurementCheckResult(
        query=q,
        match_count=len(matches),
        idle_count=len(idle),
        estimated_saving=estimated_saving,
        matches=matches,
    )
