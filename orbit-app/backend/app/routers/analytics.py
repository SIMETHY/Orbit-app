from datetime import date
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=schemas.DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    assets = db.query(models.Asset).all()
    labs = db.query(models.Lab).all()
    reuse_items = db.query(models.ReuseItem).all()
    trend = (
        db.query(models.ComplianceSnapshot)
        .order_by(models.ComplianceSnapshot.sort_order)
        .all()
    )

    total_assets = len(assets)
    avg_utilization = sum(l.utilization_pct for l in labs) / len(labs) if labs else 0

    with_cal = [a for a in assets if a.calibration_due is not None]
    today = date.today()
    compliant = sum(1 for a in with_cal if a.calibration_due >= today)
    compliance_pct = (compliant / len(with_cal) * 100) if with_cal else 100.0

    idle_calibrated_value = sum(
        a.book_value for a in assets if a.status == "available" and a.category == "Calibration-Controlled"
    )

    cat_value = defaultdict(float)
    for a in assets:
        cat_value[a.category] += a.book_value
    total_value = sum(cat_value.values()) or 1
    category_mix = [
        {"category": cat, "pct": round(val / total_value * 100, 1)}
        for cat, val in cat_value.items()
    ]

    utilization_by_lab = [{"lab": l.name, "utilization_pct": l.utilization_pct} for l in labs]
    compliance_trend = [{"month": t.month_label, "compliance_pct": t.compliance_pct} for t in trend]

    return schemas.DashboardOut(
        total_assets=total_assets,
        utilization_pct=round(avg_utilization, 1),
        calibration_compliance_pct=round(compliance_pct, 1),
        duplicate_spend_avoided=idle_calibrated_value,
        reuse_items_reclaimed=len(reuse_items),
        utilization_by_lab=utilization_by_lab,
        category_mix=category_mix,
        compliance_trend=compliance_trend,
    )
