from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Financial(Base):
    __tablename__ = "financials"

    id = Column(Integer, primary_key=True, index=True)
    period = Column(String(50), nullable=False, unique=True)
    revenue = Column(Float, default=0.0)
    expenses = Column(Float, default=0.0)
    profit = Column(Float, default=0.0)
    ebitda = Column(Float, default=0.0)
    ebitda_margin = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    cash_flow = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
