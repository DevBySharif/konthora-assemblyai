from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    employee_id = Column(String(50), nullable=False, unique=True)
    role = Column(String(200), default="")
    department = Column(String(100), default="")
    salary = Column(Float, default=0.0)
    currency = Column(String(10), default="BDT")
    created_at = Column(DateTime, server_default=func.now())
