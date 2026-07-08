"""
Seeds the database with representative demo data: 6 labs, 5 business units,
~18 assets, movement history, reusable BOM items, and a compliance trend.
Run with:  python -m app.seed
"""
from datetime import date, datetime
from .database import Base, engine, SessionLocal
from . import models


LABS = [
    ("Materials Testing Lab", "Bengaluru", 58),
    ("Electronics & EMI/EMC Lab", "Hyderabad", 71),
    ("Structural Testing Lab", "Bengaluru", 49),
    ("Avionics Systems Lab", "Bengaluru", 66),
    ("Propulsion Test Facility", "Nashik", 53),
    ("Software & Systems Integration Lab", "Pune", 77),
]

BUS = ["Aerospace Systems", "Defence Electronics", "Structures & Materials", "Propulsion", "Software Systems"]

ASSETS = [
    ("LAB-BLR-0472", "Digital Storage Oscilloscope 500MHz", "Test & Measurement", 0, 1, "available", 620000, "2025-09-14", "2026-09-14"),
    ("LAB-HYD-1183", "Vector Network Analyzer 20GHz", "Calibration-Controlled", 1, 1, "caldue", 2840000, "2025-07-20", "2026-07-19"),
    ("LAB-NSK-0261", "Vector Network Analyzer 40GHz", "Calibration-Controlled", 4, 3, "available", 3100000, "2025-11-02", "2026-11-02"),
    ("LAB-NSK-0262", "Vector Network Analyzer 40GHz (Unit 2)", "Calibration-Controlled", 4, 3, "available", 3100000, "2025-11-02", "2026-11-02"),
    ("LAB-BLR-0509", "Universal Testing Machine 100kN", "Mechanical Tooling", 0, 2, "inuse", 4200000, "2026-01-05", "2027-01-05"),
    ("LAB-BLR-0611", "Environmental Test Chamber -70C to 180C", "Test & Measurement", 2, 2, "overdue", 1980000, "2025-06-28", "2026-06-28"),
    ("LAB-BLR-0730", "Avionics Bus Analyzer (ARINC 429/1553)", "Test & Measurement", 3, 0, "inuse", 1450000, "2025-08-30", "2026-08-30"),
    ("LAB-BLR-0731", "Avionics Bus Analyzer (ARINC 429/1553) Unit 2", "Test & Measurement", 3, 0, "available", 1450000, "2025-08-30", "2026-08-30"),
    ("LAB-PUN-0902", "Rack Server - Systems Integration Bench", "IT / Compute", 5, 4, "available", 910000, None, None),
    ("LAB-HYD-1201", "Spectrum Analyzer 26.5GHz", "Calibration-Controlled", 1, 1, "available", 1670000, "2025-07-25", "2026-07-25"),
    ("LAB-BLR-0812", "Torque Wrench Set (Calibrated)", "Calibration-Controlled", 2, 2, "caldue", 40000, "2025-07-22", "2026-07-22"),
    ("LAB-NSK-0340", "Thrust Measurement Load Cell 50kN", "Calibration-Controlled", 4, 3, "overdue", 890000, "2025-06-15", "2026-06-15"),
    ("LAB-BLR-0455", "3-Axis Vibration Shaker System", "Test & Measurement", 2, 2, "maint", 3620000, "2025-10-11", "2026-10-11"),
    ("LAB-BLR-0980", "Precision Weighing Scale (Calibrated)", "Calibration-Controlled", 0, 2, "available", 110000, "2025-07-30", "2026-07-30"),
    ("LAB-HYD-1290", "EMI/EMC Chamber Probe Set", "Test & Measurement", 1, 1, "inuse", 2230000, "2025-12-01", "2026-12-01"),
    ("LAB-PUN-0955", "Logic Analyzer 200-Channel", "Test & Measurement", 5, 4, "available", 1140000, None, None),
    ("LAB-BLR-0388", "Digital Storage Oscilloscope 500MHz (Unit 2)", "Test & Measurement", 3, 0, "available", 620000, "2025-09-14", "2026-09-14"),
    ("LAB-NSK-0410", "Cryogenic Flow Meter", "Calibration-Controlled", 4, 3, "caldue", 1360000, "2025-07-17", "2026-07-17"),
]

MOVEMENTS = [
    ("LAB-BLR-0730", "Avionics Systems Lab", "Structural Testing Lab", "R. Menon", "2026-07-05 14:22", "received"),
    ("LAB-HYD-1201", "Electronics & EMI/EMC Lab", "Software & Systems Integration Lab", "K. Iyer", "2026-07-04 09:10", "in-transit"),
    ("LAB-NSK-0261", "Propulsion Test Facility", "Calibration Vendor (NABL)", "S. Patil", "2026-07-03 11:47", "received"),
    ("LAB-BLR-0611", "Structural Testing Lab", "Materials Testing Lab", "A. D'Souza", "2026-07-02 16:05", "in-transit"),
    ("LAB-BLR-0980", "Stores - Central", "Materials Testing Lab", "N. Rao", "2026-07-01 10:33", "received"),
]

REUSE = [
    ("BOM-0091", "Titanium Sheet Offcuts, Grade 5 (18kg)", "Project Falcon - Structures", "Unused, mill-certified", 2, "18 kg"),
    ("BOM-0114", "MIL-Spec Connectors, D38999 (46 pcs)", "Project Kestrel - Avionics", "New, sealed", 3, "46 pcs"),
    ("BOM-0158", "Carbon Fiber Prepreg Roll (remnant)", "Project Falcon - Structures", "Within cold-storage shelf life", 2, "6.4 sqm"),
    ("BOM-0203", "RF Coaxial Cable Assemblies (SMA, 1m)", "Project Orion - Defence Electronics", "Tested, good", 1, "22 pcs"),
    ("BOM-0247", "Aluminium Extrusion Profile 40x40", "Project Vega - Structures", "Cut lengths, reusable", 2, "14 m"),
    ("BOM-0271", "Stainless Fasteners Assortment (A4)", "Multiple closed projects", "Sorted, boxed", 0, "3,400 pcs"),
]

COMPLIANCE_TREND = [("Feb", 74), ("Mar", 79), ("Apr", 81), ("May", 85), ("Jun", 86), ("Jul", 88.7)]


def parse_date(s):
    return date.fromisoformat(s) if s else None


def run():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        lab_objs = []
        for name, loc, util in LABS:
            lab = models.Lab(name=name, location=loc, utilization_pct=util)
            db.add(lab)
            lab_objs.append(lab)
        db.flush()

        bu_objs = []
        for name in BUS:
            bu = models.BusinessUnit(name=name)
            db.add(bu)
            bu_objs.append(bu)
        db.flush()

        for aid, name, cat, lab_idx, bu_idx, status, value, lastcal, caldue in ASSETS:
            db.add(models.Asset(
                id=aid, name=name, category=cat, status=status, book_value=value,
                last_calibrated=parse_date(lastcal), calibration_due=parse_date(caldue),
                lab_id=lab_objs[lab_idx].id, bu_id=bu_objs[bu_idx].id,
            ))

        for aid, frm, to, by, ts, status in MOVEMENTS:
            db.add(models.Movement(
                asset_id=aid, from_location=frm, to_location=to, handled_by=by,
                timestamp=datetime.strptime(ts, "%Y-%m-%d %H:%M"), status=status,
            ))

        for rid, name, src, cond, lab_idx, qty in REUSE:
            db.add(models.ReuseItem(
                id=rid, name=name, source_project=src, condition=cond,
                quantity=qty, lab_id=lab_objs[lab_idx].id,
            ))

        for i, (label, pct) in enumerate(COMPLIANCE_TREND):
            db.add(models.ComplianceSnapshot(month_label=label, compliance_pct=pct, sort_order=i))

        db.commit()
        print(f"Seeded {len(ASSETS)} assets, {len(LABS)} labs, {len(BUS)} business units, "
              f"{len(MOVEMENTS)} movements, {len(REUSE)} reuse items.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
