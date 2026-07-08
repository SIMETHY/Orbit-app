from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["assets"])


@router.get("/labs", response_model=list[schemas.LabOut])
def list_labs(db: Session = Depends(get_db)):
    return db.query(models.Lab).all()


@router.get("/business-units", response_model=list[schemas.BusinessUnitOut])
def list_business_units(db: Session = Depends(get_db)):
    return db.query(models.BusinessUnit).all()


@router.get("/assets", response_model=list[schemas.AssetOut])
def list_assets(
    q: Optional[str] = None,
    lab_id: Optional[int] = None,
    bu_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Asset)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(or_(
            models.Asset.name.ilike(like),
            models.Asset.id.ilike(like),
        ))
    if lab_id is not None:
        query = query.filter(models.Asset.lab_id == lab_id)
    if bu_id is not None:
        query = query.filter(models.Asset.bu_id == bu_id)
    if status:
        query = query.filter(models.Asset.status == status)
    return query.order_by(models.Asset.id).all()


@router.get("/assets/{asset_id}", response_model=schemas.AssetOut)
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.patch("/assets/{asset_id}/status", response_model=schemas.AssetOut)
def update_asset_status(asset_id: str, payload: schemas.AssetStatusUpdate, db: Session = Depends(get_db)):
    """Used by the 'Reserve' action in the UI — flips an asset to in-use, etc."""
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    valid = {"available", "inuse", "maint", "caldue", "overdue"}
    if payload.status not in valid:
        raise HTTPException(status_code=400, detail=f"status must be one of {sorted(valid)}")
    asset.status = payload.status
    db.commit()
    db.refresh(asset)
    return asset
