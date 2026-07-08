from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/calibration", tags=["calibration"])


@router.get("/register", response_model=list[schemas.AssetOut])
def calibration_register(db: Session = Depends(get_db)):
    """All calibration-controlled instruments, soonest due date first."""
    return (
        db.query(models.Asset)
        .filter(models.Asset.calibration_due.isnot(None))
        .order_by(models.Asset.calibration_due.asc())
        .all()
    )


@router.get("/summary")
def calibration_summary(db: Session = Depends(get_db)):
    today = date.today()
    soon = today + timedelta(days=30)
    assets = db.query(models.Asset).filter(models.Asset.calibration_due.isnot(None)).all()

    valid = sum(1 for a in assets if a.calibration_due >= soon)
    due_soon = sum(1 for a in assets if today <= a.calibration_due < soon)
    overdue = sum(1 for a in assets if a.calibration_due < today)

    return {
        "valid": valid,
        "due_soon": due_soon,
        "overdue": overdue,
        "avg_cycle_days": 11,  # placeholder KPI — wire to real calibration-vendor turnaround data later
    }
