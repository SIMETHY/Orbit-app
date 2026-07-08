from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class LabOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    location: str
    utilization_pct: float


class BusinessUnitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class AssetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    status: str
    book_value: float
    last_calibrated: Optional[date] = None
    calibration_due: Optional[date] = None
    lab: LabOut
    business_unit: BusinessUnitOut


class AssetStatusUpdate(BaseModel):
    status: str


class MovementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    asset_id: str
    from_location: str
    to_location: str
    handled_by: str
    timestamp: datetime
    status: str


class MovementCreate(BaseModel):
    asset_id: str
    from_location: str
    to_location: str
    handled_by: str
    status: str = "in-transit"


class ReuseItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    source_project: str
    condition: str
    quantity: str
    lab: LabOut


class ProcurementCheckResult(BaseModel):
    query: str
    match_count: int
    idle_count: int
    estimated_saving: Optional[float] = None
    matches: list[AssetOut]


class InsightOut(BaseModel):
    tag: str
    text: str
    impact: str


class DashboardOut(BaseModel):
    total_assets: int
    utilization_pct: float
    calibration_compliance_pct: float
    duplicate_spend_avoided: float
    reuse_items_reclaimed: int
    utilization_by_lab: list[dict]
    category_mix: list[dict]
    compliance_trend: list[dict]
