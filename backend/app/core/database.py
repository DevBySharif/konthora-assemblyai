"""
Database configuration — SQLAlchemy engine.

SQLite for hackathon, PostgreSQL for production.
Just change DATABASE_URL env var to switch.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./konthora.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_seeded = False


def get_db():
    """FastAPI dependency — yields a DB session, closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables."""
    from app.models import client, document, inventory, task, financial, calendar_event, staff  # noqa
    Base.metadata.create_all(bind=engine)


def ensure_seeded():
    """Seed database if empty. Called lazily on first DB access."""
    global _seeded
    if _seeded:
        return
    from app.models.client import Client
    db = SessionLocal()
    try:
        if db.query(Client).count() == 0:
            from scripts.seed import seed_database
            seed_database()
        _seeded = True
    except Exception:
        pass
    finally:
        db.close()
