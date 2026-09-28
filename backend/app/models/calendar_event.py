from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(20), nullable=False, unique=True)
    title = Column(String(300), nullable=False)
    date = Column(String(20), nullable=False)
    time = Column(String(20), default="TBD")
    attendees = Column(String(500), default="")
    status = Column(String(20), default="scheduled")
    created_at = Column(DateTime, server_default=func.now())
