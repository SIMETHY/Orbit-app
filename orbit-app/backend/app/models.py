from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base


class Lab(Base):
    __tablename__ = "labs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    utilization_pct = Column(Float, default=0.0)  # trailing-30-day utilization

    assets = relationship("Asset", back_populates="lab")
    reuse_items = relationship("ReuseItem", back_populates="lab")


class BusinessUnit(Base):
    __tablename__ = "business_units"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    assets = relationship("Asset", back_populates="business_unit")


class Asset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True, index=True)  # human asset tag e.g. LAB-BLR-0472
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, index=True)  # available | inuse | maint | caldue | overdue
    book_value = Column(Float, default=0.0)
    last_calibrated = Column(Date, nullable=True)
    calibration_due = Column(Date, nullable=True)

    lab_id = Column(Integer, ForeignKey("labs.id"))
    bu_id = Column(Integer, ForeignKey("business_units.id"))

    lab = relationship("Lab", back_populates="assets")
    business_unit = relationship("BusinessUnit", back_populates="assets")
    movements = relationship("Movement", back_populates="asset")


class Movement(Base):
    __tablename__ = "movements"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    from_location = Column(String, nullable=False)
    to_location = Column(String, nullable=False)
    handled_by = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)  # in-transit | received

    asset = relationship("Asset", back_populates="movements")


class ReuseItem(Base):
    __tablename__ = "reuse_items"
    id = Column(String, primary_key=True, index=True)  # e.g. BOM-0091
    name = Column(String, nullable=False)
    source_project = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    quantity = Column(String, nullable=False)

    lab_id = Column(Integer, ForeignKey("labs.id"))
    lab = relationship("Lab", back_populates="reuse_items")


class ComplianceSnapshot(Base):
    """Monthly org-wide calibration compliance %, used for the trend chart."""
    __tablename__ = "compliance_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    month_label = Column(String, nullable=False)  # e.g. "Feb"
    compliance_pct = Column(Float, nullable=False)
    sort_order = Column(Integer, nullable=False)
