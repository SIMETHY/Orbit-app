from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models  # noqa: F401  (ensures models are registered before create_all)
from .routers import assets, calibration, reuse, movements, procurement, insights, analytics

# Creates tables if they don't exist yet. Run `python -m app.seed` separately
# to (re)populate demo data.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ORBIT API",
    description="Enterprise Asset & Calibration Intelligence Platform — backend API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to the deployed frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, prefix="/api")
app.include_router(calibration.router, prefix="/api")
app.include_router(reuse.router, prefix="/api")
app.include_router(movements.router, prefix="/api")
app.include_router(procurement.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "orbit-api"}
