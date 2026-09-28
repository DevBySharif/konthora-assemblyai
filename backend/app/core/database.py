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
    try:
        from app.models.client import Client
        db = SessionLocal()
        try:
            count = db.query(Client).count()
            if count == 0:
                _seed_data(db)
            _seeded = True
        finally:
            db.close()
    except Exception as e:
        from loguru import logger
        logger.error(f"ensure_seeded error: {e}")
        _seeded = True


def _seed_data(db):
    """Inline seed — populate DB with realistic enterprise data."""
    import json
    from app.models.client import Client
    from app.models.document import Document
    from app.models.inventory import Inventory
    from app.models.task import Task
    from app.models.financial import Financial
    from app.models.calendar_event import CalendarEvent
    from app.models.staff import Staff

    try:
        clients = [
            Client(name="Acme Corp", email="billing@acme.com", currency="USD", payment_terms="NET-30"),
            Client(name="SoftTech BD", email="accounts@softtech.bd", currency="BDT", payment_terms="NET-45"),
            Client(name="InnoTech GmbH", email="finance@innotech.de", currency="EUR", payment_terms="NET-60"),
        ]
        db.add_all(clients)
        db.flush()

        documents = [
            Document(doc_type="quotation", doc_ref="PHOENIX-2026", client_id=clients[0].id, amount=27075.0, line_items=json.dumps([{"description": "Voice Gateway Module", "quantity": 5, "unit_price": 3500, "subtotal": 17500}, {"description": "Enterprise License (Annual)", "quantity": 3, "unit_price": 2525, "subtotal": 7575}, {"description": "Integration & Deployment", "quantity": 1, "unit_price": 2000, "subtotal": 2000}]), payment_terms="NET-30", discount_pct=5.0, discount_amount=1353.75, notes="5% enterprise discount applied.", status="APPROVED", approval_status="AUTO-APPROVED", verification_hash="SHA256-KNT-A1B2-C3D4-E5F6"),
            Document(doc_type="purchase_order", doc_ref="PO-88301", client_id=clients[1].id, amount=15050.0, line_items=json.dumps([{"description": "M3 Pro Chip", "quantity": 20, "unit_price": 450, "subtotal": 9000}, {"description": "Server Rack 42U", "quantity": 2, "unit_price": 2800, "subtotal": 5600}]), payment_terms="NET-45", status="APPROVED", approval_status="AUTO-APPROVED", verification_hash="SHA256-KNT-F6E5-D4C3-B2A1"),
            Document(doc_type="invoice", doc_ref="INV-8821", client_id=clients[0].id, amount=5050.0, line_items=json.dumps([{"description": "Professional Services - Q1 2026", "quantity": 1, "unit_price": 5050, "subtotal": 5050}]), payment_terms="NET-30", status="SENT", approval_status="PENDING", verification_hash="SHA256-KNT-1A2B-3C4D-5E6F"),
            Document(doc_type="tax_compliance", doc_ref="FY2026-TAX-01", amount=11400.0, line_items="[]", status="FILED", approval_status="FILED", notes="BD VAT BIN: 000415826-0101.", verification_hash="SHA256-KNT-TAX-FY26"),
            Document(doc_type="financial", doc_ref="FY2026-Q1-REP", amount=142000.0, line_items="[]", status="FINAL", approval_status="APPROVED", notes="Q1 2026 Financial Report.", verification_hash="SHA256-KNT-Q1-2026"),
            Document(doc_type="hr_letter", doc_ref="EMP-1041-OFFER", amount=120000.0, line_items="[]", status="SENT", approval_status="APPROVED", notes="Offer letter for Rafiqul Islam.", verification_hash="SHA256-KNT-HR-1041"),
            Document(doc_type="expense_voucher", doc_ref="EXP-9902", amount=450.0, line_items="[]", status="APPROVED", approval_status="CFO APPROVED", verification_hash="SHA256-KNT-EXP-9902"),
            Document(doc_type="delivery_challan", doc_ref="DC-2026-301", client_id=clients[1].id, amount=18900.0, line_items="[]", status="DELIVERED", approval_status="AUTO-APPROVED", verification_hash="SHA256-KNT-DC-301"),
            Document(doc_type="work_order", doc_ref="WO-2026-77", client_id=clients[2].id, amount=32000.0, line_items="[]", payment_terms="NET-60", status="IN PROGRESS", approval_status="APPROVED", verification_hash="SHA256-KNT-WO-77"),
            Document(doc_type="credit_note", doc_ref="CN-2026-102", client_id=clients[0].id, amount=3500.0, line_items="[]", status="ISSUED", approval_status="APPROVED", verification_hash="SHA256-KNT-CN-102"),
            Document(doc_type="debit_note", doc_ref="DN-2026-055", client_id=clients[1].id, amount=2100.0, line_items="[]", status="ISSUED", approval_status="APPROVED", verification_hash="SHA256-KNT-DN-055"),
            Document(doc_type="quotation", doc_ref="Q-2026-015", client_id=clients[2].id, amount=45000.0, line_items="[]", payment_terms="NET-60", status="PENDING", approval_status="PENDING", verification_hash="SHA256-KNT-Q-015"),
            Document(doc_type="invoice", doc_ref="INV-8822", client_id=clients[1].id, amount=12300.0, line_items="[]", payment_terms="NET-30", status="PAID", approval_status="PAID", verification_hash="SHA256-KNT-INV-8822"),
            Document(doc_type="memo", doc_ref="MEMO-2026-15", amount=0.0, line_items="[]", status="DISTRIBUTED", approval_status="DISTRIBUTED", verification_hash="SHA256-KNT-MEMO-15"),
            Document(doc_type="agreement", doc_ref="AGR-2026-33", client_id=clients[2].id, amount=0.0, line_items="[]", status="SIGNED", approval_status="SIGNED", verification_hash="SHA256-KNT-AGR-33"),
        ]
        db.add_all(documents)

        inventory = [
            Inventory(item_name="M3 Pro Chip", sku="CHIP-M3PRO", qty=42, unit_price=450, warehouse="WH-DHAKA"),
            Inventory(item_name="Server Rack 42U", sku="RACK-42U", qty=8, unit_price=2800, warehouse="WH-DHAKA"),
            Inventory(item_name="Fiber 100G Module", sku="FIBER-100G", qty=120, unit_price=180, warehouse="WH-CHITTAGONG"),
            Inventory(item_name="Network Switch L3", sku="SW-L3-48P", qty=25, unit_price=950, warehouse="WH-DHAKA"),
            Inventory(item_name="UPS 3KVA", sku="UPS-3KVA", qty=15, unit_price=620, warehouse="WH-DHAKA"),
            Inventory(item_name="CAT6 Cable Roll", sku="CABLE-CAT6", qty=200, unit_price=45, warehouse="WH-CHITTAGONG"),
        ]
        db.add_all(inventory)

        tasks = [
            Task(task_id="TASK-001", title="Finalize Q2 financial projections", assignee="Sarah Jenkins", deadline="2026-04-20", priority="high", status="pending"),
            Task(task_id="TASK-002", title="Review NDA terms with InnoTech", assignee="Legal Team", deadline="2026-04-18", priority="medium", status="pending"),
            Task(task_id="TASK-003", title="Deploy Fiber 100G at Site-B", assignee="Rafiqul Islam", deadline="2026-05-01", priority="high", status="in_progress"),
            Task(task_id="TASK-004", title="Submit tax compliance documents", assignee="Finance Team", deadline="2026-04-15", priority="urgent", status="completed"),
            Task(task_id="TASK-005", title="Prepare board meeting agenda", assignee="CEO Office", deadline="2026-04-25", priority="medium", status="pending"),
        ]
        db.add_all(tasks)

        financials = [
            Financial(period="Q1 2026", revenue=142000, expenses=85000, profit=57000, ebitda=40500, ebitda_margin=28.5, tax=11400, cash_flow=52000),
            Financial(period="Q2 2026", revenue=185000, expenses=102000, profit=83000, ebitda=57500, ebitda_margin=31.0, tax=16600, cash_flow=71000),
            Financial(period="YTD 2026", revenue=327000, expenses=187000, profit=140000, ebitda=98000, ebitda_margin=30.0, tax=28000, cash_flow=123000),
        ]
        db.add_all(financials)

        events = [
            CalendarEvent(event_id="EVT-001", title="Q2 Strategy Review", date="2026-04-15", time="10:00", attendees="CEO, CFO, CTO", status="scheduled"),
            CalendarEvent(event_id="EVT-002", title="InnoTech Contract Signing", date="2026-04-18", time="14:00", attendees="Legal, InnoTech Team", status="scheduled"),
            CalendarEvent(event_id="EVT-003", title="Board Meeting", date="2026-04-25", time="09:00", attendees="Board Members", status="scheduled"),
            CalendarEvent(event_id="EVT-004", title="Fiber Deployment Kickoff", date="2026-04-20", time="11:00", attendees="Rafiqul, Infrastructure Team", status="scheduled"),
        ]
        db.add_all(events)

        staff = [
            Staff(name="Rafiqul Islam", employee_id="EMP-1041", role="Senior Full-Stack Engineer", department="Engineering", salary=120000, currency="BDT"),
            Staff(name="Sarah Jenkins", employee_id="EMP-0021", role="Chief Financial Officer", department="Finance", salary=95000, currency="USD"),
        ]
        db.add_all(staff)

        db.commit()
    except Exception as e:
        db.rollback()
        raise
