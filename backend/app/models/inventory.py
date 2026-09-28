from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(200), nullable=False)
    sku = Column(String(50), nullable=False, unique=True)
    qty = Column(Integer, default=0)
    unit_price = Column(Float, default=0.0)
    warehouse = Column(String(50), default="WH-DHAKA")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
