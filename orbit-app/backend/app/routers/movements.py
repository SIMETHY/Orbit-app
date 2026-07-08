from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/movements", tags=["movements"])


@router.get("", response_model=list[schemas.MovementOut])
def list_movements(db: Session = Depends(get_db)):
    return db.query(models.Movement).order_by(models.Movement.timestamp.desc()).all()


@router.post("", response_model=schemas.MovementOut, status_code=201)
def log_movement(payload: schemas.MovementCreate, db: Session = Depends(get_db)):
    """Log a new inter-lab transfer (e.g. from a QR/RFID scan event)."""
    from datetime import datetime

    asset = db.query(models.Asset).filter(models.Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    movement = models.Movement(
        asset_id=payload.asset_id,
        from_location=payload.from_location,
        to_location=payload.to_location,
        handled_by=payload.handled_by,
        status=payload.status,
        timestamp=datetime.utcnow(),
    )
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement
