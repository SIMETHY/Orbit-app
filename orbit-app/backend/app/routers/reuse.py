from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/reuse-items", tags=["reuse"])


@router.get("", response_model=list[schemas.ReuseItemOut])
def list_reuse_items(db: Session = Depends(get_db)):
    return db.query(models.ReuseItem).all()
