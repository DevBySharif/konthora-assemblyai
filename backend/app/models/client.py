from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    email = Column(String(200), default="")
    currency = Column(String(10), default="USD")
    payment_terms = Column(String(50), default="NET-30")
    created_at = Column(DateTime, server_default=func.now())

    documents = relationship("Document", back_populates="client")
