from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    doc_type = Column(String(50), nullable=False, index=True)
    doc_ref = Column(String(50), nullable=False, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    amount = Column(Float, default=0.0)
    line_items = Column(Text, default="[]")  # JSON string
    payment_terms = Column(String(50), default="")
    discount_pct = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    notes = Column(Text, default="")
    status = Column(String(50), default="DRAFT")
    approval_status = Column(String(100), default="PENDING")
    approved_by = Column(String(200), default="")
    verification_hash = Column(String(100), default="")
    qr_payload = Column(String(500), default="")
    revised = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    client = relationship("Client", back_populates="documents")
