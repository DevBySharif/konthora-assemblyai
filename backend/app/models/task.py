from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(20), nullable=False, unique=True)
    title = Column(String(300), nullable=False)
    assignee = Column(String(200), default="Unassigned")
    deadline = Column(String(50), default="TBD")
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, server_default=func.now())
