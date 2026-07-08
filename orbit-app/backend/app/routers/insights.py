from datetime import date, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=list[schemas.InsightOut])
def get_insights(db: Session = Depends(get_db)):
    """
    Rule-based recommendation engine over live data. This stands in for the
    'AI layer' described in the blueprint: in production, swap the rules
    below for an LLM call (e.g. Claude API) that reasons over the same
    tables plus free-text project requests, and/or a small ML model for
    utilization forecasting.
    """
    insights = []
    assets = db.query(models.Asset).all()
    today = date.today()

    # 1. Reallocation: idle, high-value calibration-controlled instruments
    idle_high_value = sorted(
        [a for a in assets if a.status == "available" and a.category == "Calibration-Controlled"],
        key=lambda a: -a.book_value,
    )
    if idle_high_value:
        a = idle_high_value[0]
        insights.append(schemas.InsightOut(
            tag="Reallocation",
            text=(f"{a.name} ({a.id}) is currently idle in {a.lab.name}. "
                  f"Check open project requests in other business units for this instrument class "
                  f"before approving a new purchase."),
            impact=f"Est. saving \u20b9{a.book_value/100000:.1f}L in avoided purchase",
        ))

    # 2. Calibration risk: due within 15 days
    risk_window = today + timedelta(days=15)
    at_risk = [a for a in assets if a.calibration_due and today <= a.calibration_due <= risk_window]
    if at_risk:
        names = ", ".join(f"{a.name} ({a.id})" for a in at_risk[:3])
        insights.append(schemas.InsightOut(
            tag="Calibration Risk",
            text=f"{len(at_risk)} instrument(s) are due for calibration within 15 days, including {names}.",
            impact="Risk: possible test schedule slip if no backup unit is booked",
        ))

    # 3. Overdue calibration — usability risk
    overdue = [a for a in assets if a.calibration_due and a.calibration_due < today]
    if overdue:
        insights.append(schemas.InsightOut(
            tag="Compliance",
            text=(f"{len(overdue)} instrument(s) are past their calibration due date and should be treated "
                  f"as unusable for controlled measurements until recalibrated."),
            impact="Action: escalate to calibration department",
        ))

    # 4. Reuse: value sitting in the BOM bank
    reuse_items = db.query(models.ReuseItem).all()
    if reuse_items:
        insights.append(schemas.InsightOut(
            tag="Reuse",
            text=(f"{len(reuse_items)} leftover material lines are cataloged in the Reusable Materials Bank "
                  f"from closed projects and are available to claim against new BOMs."),
            impact="Reduces fresh material orders for matching project requirements",
        ))

    # 5. Capacity planning: lab with highest utilization
    labs = db.query(models.Lab).all()
    if labs:
        busiest = max(labs, key=lambda l: l.utilization_pct)
        insights.append(schemas.InsightOut(
            tag="Capacity Planning",
            text=(f"{busiest.name} is running at {busiest.utilization_pct:.0f}% trailing utilization, "
                  f"the highest across all labs — a leading indicator for a capacity review."),
            impact="Proactive flag for capital planning",
        ))

    # 6. Category concentration of calibration risk (batch renewal opportunity)
    cat_overdue = defaultdict(int)
    for a in overdue:
        cat_overdue[a.category] += 1
    if cat_overdue:
        cat, count = max(cat_overdue.items(), key=lambda kv: kv[1])
        insights.append(schemas.InsightOut(
            tag="Procurement",
            text=(f"{count} overdue instrument(s) fall in the '{cat}' category — "
                  f"a batch calibration contract may be more efficient than renewing individually."),
            impact="Suggested action: negotiate batch renewal with calibration vendor",
        ))

    return insights
