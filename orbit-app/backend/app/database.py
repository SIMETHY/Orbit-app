"""
Database configuration.

Uses SQLite by default (zero setup, file-based — great for a hackathon demo).
To point this at Postgres/MySQL for a production deployment, just change
DATABASE_URL, e.g.:
    postgresql://orbit:orbit@localhost:5432/orbit
No other code needs to change — SQLAlchemy abstracts the rest.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("ORBIT_DATABASE_URL", "sqlite:///./orbit.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
