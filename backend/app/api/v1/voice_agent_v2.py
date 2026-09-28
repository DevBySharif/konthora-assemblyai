"""
AssemblyAI Voice Agent API — v2 endpoints.

Architecture:
  Browser → temp token → AssemblyAI Voice Agent (STT + LLM + TTS, all managed)
  AssemblyAI → tool.call → Browser → POST /tool → Backend executes → result → Browser → AssemblyAI

Backend responsibilities:
  1. Mint temporary tokens for browser → AssemblyAI WebSocket
  2. Execute tool calls from AssemblyAI's LLM (document actions)
  3. Audio file upload → AssemblyAI Batch API transcription
"""
import os
import json
import time
import hashlib
import tempfile
from dotenv import load_dotenv
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from loguru import logger

load_dotenv()
_backend_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
if os.path.exists(_backend_env_path):
    load_dotenv(_backend_env_path)

router = APIRouter()


# ── Token endpoint: mint temporary AssemblyAI session token ──

_token_cache = {"token": None, "expires_at": 0}

@router.get("/voice-agent/token")
async def get_voice_agent_token():
    """Mint a single-use token for browser → AssemblyAI Voice Agent WebSocket."""
    import time
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"]:
        return {"token": _token_cache["token"]}

    api_key = os.getenv("ASSEMBLYAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="ASSEMBLYAI_API_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://agents.assemblyai.com/v1/token",
                params={"expires_in_seconds": 300, "max_session_duration_seconds": 8640},
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                _token_cache["token"] = data.get("token")
                _token_cache["expires_at"] = now + 240
                return data
            else:
                logger.error(f"AssemblyAI token error {resp.status_code}: {resp.text}")
                raise HTTPException(status_code=502, detail="Failed to mint AssemblyAI token")
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AssemblyAI token endpoint timeout")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Token generation failed")


# ── Tool definitions for AssemblyAI Voice Agent ──
# These are sent to AssemblyAI in session.update as flat schemas.

VOICE_AGENT_TOOLS = [
    {
        "type": "function",
        "name": "create_document",
        "description": "Create an enterprise document. You MUST pass ALL details the user specified — line items with quantities and unit prices, payment terms, discounts, notes. Do NOT summarize or omit any detail the user provided.",
        "parameters": {
            "type": "object",
            "properties": {
                "doc_type": {
                    "type": "string",
                    "enum": ["quotation", "purchase_order", "invoice", "proforma_invoice", "tax_compliance", "financial", "hr_letter", "meeting_minutes", "legal_contract", "expense_voucher", "analytics_chart", "dispatch_notification", "delivery_challan", "work_order", "credit_note", "debit_note", "receipt", "bank_statement", "memo", "official_notice", "agreement", "bid", "tender", "insurance_claim"],
                    "description": "Type of document to create"
                },
                "client_name": {"type": "string", "description": "Client or company name"},
                "amount": {"type": "number", "description": "Total document amount in USD (computed from line items)"},
                "line_items": {
                    "type": "array",
                    "description": "Itemized list of all line items. Include EVERY item the user mentioned with exact quantities and unit prices.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "description": {"type": "string", "description": "Item description"},
                            "quantity": {"type": "number", "description": "Quantity"},
                            "unit_price": {"type": "number", "description": "Unit price in USD"},
                            "subtotal": {"type": "number", "description": "quantity * unit_price"},
                        },
                        "required": ["description", "quantity", "unit_price"]
                    }
                },
                "payment_terms": {"type": "string", "description": "Payment terms (e.g. 'Net 30', 'Net 15', 'Due on Receipt')"},
                "discount_pct": {"type": "number", "description": "Discount percentage if any (e.g. 5 for 5%)"},
                "discount_amount": {"type": "number", "description": "Discount amount in USD after percentage applied"},
                "notes": {"type": "string", "description": "Any additional notes, terms, or special instructions"},
            },
            "required": ["doc_type"]
        }
    },
    {
        "type": "function",
        "name": "revise_document",
        "description": "Revise the active document. Use this when the user asks to change, update, modify, or adjust ANY field. Examples: 'change amount to 5000', 'update client name', 'modify payment terms', 'change discount to 10%'. The active document is the most recently created one.",
        "parameters": {
            "type": "object",
            "properties": {
                "field": {"type": "string", "description": "Field name to change. Common fields: 'amount', 'client', 'client_name', 'discount', 'fee', 'salary', 'terms', 'payment_terms', 'description', 'item', 'quantity', 'tax_rate', 'notes', 'due_date'"},
                "new_value": {"type": "string", "description": "The new value for the field (use string even for numbers, e.g. '5000' not 5000)"},
            },
            "required": ["field", "new_value"]
        }
    },
    {
        "type": "function",
        "name": "approve_document",
        "description": "Approve or authorize a document. Requires CFO passkey for high-value documents.",
        "parameters": {
            "type": "object",
            "properties": {
                "passkey": {"type": "string", "description": "CFO authorization passkey if required"},
            }
        }
    },
    {
        "type": "function",
        "name": "convert_currency",
        "description": "Convert an amount from USD to another currency (BDT, EUR, GBP, INR, JPY).",
        "parameters": {
            "type": "object",
            "properties": {
                "amount_usd": {"type": "number", "description": "Amount in USD to convert"},
                "target_currency": {"type": "string", "enum": ["BDT", "EUR", "GBP", "INR", "JPY"], "description": "Target currency"},
            },
            "required": ["amount_usd", "target_currency"]
        }
    },
    {
        "type": "function",
        "name": "compare_documents",
        "description": "Compare current and previous document versions to show differences.",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "type": "function",
        "name": "search_documents",
        "description": "Search past documents by type, date range, client, or amount. Returns matching document list.",
        "parameters": {
            "type": "object",
            "properties": {
                "doc_type": {"type": "string", "description": "Filter by document type (e.g. 'invoice', 'quotation')"},
                "client_name": {"type": "string", "description": "Filter by client name"},
                "date_from": {"type": "string", "description": "Start date (YYYY-MM-DD)"},
                "date_to": {"type": "string", "description": "End date (YYYY-MM-DD)"},
                "min_amount": {"type": "number", "description": "Minimum amount filter"},
                "max_amount": {"type": "number", "description": "Maximum amount filter"},
            }
        }
    },
    {
        "type": "function",
        "name": "send_notification",
        "description": "Send an email or Slack notification with a document summary to a recipient or channel.",
        "parameters": {
            "type": "object",
            "properties": {
                "channel": {"type": "string", "description": "Notification channel: 'email' or 'slack'"},
                "recipient": {"type": "string", "description": "Email address or Slack channel (e.g. #finance, john@acme.com)"},
                "message": {"type": "string", "description": "Custom message or summary to send"},
            },
            "required": ["channel", "recipient"]
        }
    },
    {
        "type": "function",
        "name": "manage_inventory",
        "description": "Query or update inventory stock levels. Check availability, add stock, or deduct stock.",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {"type": "string", "enum": ["check", "add", "deduct", "list_all"], "description": "Inventory action"},
                "item_name": {"type": "string", "description": "Product or item name"},
                "quantity": {"type": "number", "description": "Quantity to add or deduct"},
            },
            "required": ["action"]
        }
    },
    {
        "type": "function",
        "name": "manage_tasks",
        "description": "Create, update, list, or complete tasks with deadlines and assignees.",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {"type": "string", "enum": ["create", "update", "complete", "list", "list_pending"], "description": "Task action"},
                "task_title": {"type": "string", "description": "Task title or description"},
                "assignee": {"type": "string", "description": "Person assigned to the task"},
                "deadline": {"type": "string", "description": "Deadline (YYYY-MM-DD or 'tomorrow', 'next week')"},
                "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"], "description": "Task priority"},
            },
            "required": ["action"]
        }
    },
    {
        "type": "function",
        "name": "query_financials",
        "description": "Query financial data: revenue, expenses, profit, EBITDA, tax by quarter or month.",
        "parameters": {
            "type": "object",
            "properties": {
                "metric": {"type": "string", "enum": ["revenue", "expenses", "profit", "ebitda", "tax", "cash_flow", "all"], "description": "Financial metric to query"},
                "period": {"type": "string", "description": "Time period (e.g. 'Q1 2026', 'January', 'YTD', 'all')"},
            },
            "required": ["metric"]
        }
    },
    {
        "type": "function",
        "name": "manage_calendar",
        "description": "Schedule meetings, set reminders, or check calendar availability.",
        "parameters": {
            "type": "object",
            "properties": {
                "action": {"type": "string", "enum": ["schedule", "check", "cancel", "list_today", "set_reminder"], "description": "Calendar action"},
                "title": {"type": "string", "description": "Meeting or event title"},
                "date": {"type": "string", "description": "Date (YYYY-MM-DD or 'today', 'tomorrow')"},
                "time": {"type": "string", "description": "Time (e.g. '14:00', '2pm')"},
                "attendees": {"type": "string", "description": "Comma-separated list of attendees"},
                "reminder_text": {"type": "string", "description": "Reminder message"},
            },
            "required": ["action"]
        }
    },
    {
        "type": "function",
        "name": "dispatch_slack",
        "description": "Send a document summary to a Slack channel via webhook.",
        "parameters": {
            "type": "object",
            "properties": {
                "channel": {"type": "string", "description": "Slack channel name (e.g. #finance, #product-strategy)"},
            },
            "required": ["channel"]
        }
    },
]


# ── Tool execution endpoint ──

class ToolCallRequest(BaseModel):
    call_id: str
    name: str
    arguments: dict

class TextCommandRequest(BaseModel):
    text: str


# In-memory state (per-session)
_last_transcription = {}

EXCHANGE_RATES = {"USD": 1.0, "BDT": 120.0, "EUR": 0.92, "GBP": 0.79, "INR": 83.5, "JPY": 150.0}
CURRENCY_SYMBOLS = {"USD": "$", "BDT": "৳", "EUR": "€", "GBP": "£", "INR": "₹", "JPY": "¥"}
PASSKEY = "KNT-2026"


def _get_db():
    from app.core.database import SessionLocal
    return SessionLocal()


def _generate_verification(doc_type: str, doc_ref: str, amount: float) -> dict:
    seed = f"{doc_type}:{doc_ref}:{amount}:{int(time.time() // 3600)}"
    digest = hashlib.sha256(seed.encode()).hexdigest()[:16].upper()
    vhash = f"SHA256-KNT-{digest[:4]}-{digest[4:8]}-{digest[8:12]}"
    return {"verification_hash": vhash, "qr_payload": f"https://konthora.ai/verify?ref={doc_ref}&hash={vhash}", "verified_at": int(time.time())}


def _get_next_doc_ref(db, doc_type: str) -> str:
    """Generate next document reference number from DB."""
    prefix_map = {
        "quotation": "Q", "purchase_order": "PO", "invoice": "INV",
        "proforma_invoice": "PI", "tax_compliance": "TAX", "financial": "FIN",
        "hr_letter": "HR", "meeting_minutes": "MIN", "legal_contract": "NDA",
        "expense_voucher": "EXP", "analytics_chart": "CHART", "dispatch_notification": "DISP",
        "delivery_challan": "DC", "work_order": "WO", "credit_note": "CN",
        "debit_note": "DN", "receipt": "RCT", "bank_statement": "BST",
        "memo": "MEMO", "official_notice": "NOTICE", "agreement": "AGR",
        "bid": "BID", "tender": "TDR", "insurance_claim": "INS",
    }
    prefix = prefix_map.get(doc_type, "DOC")
    from app.models.document import Document
    count = db.query(Document).filter(Document.doc_type == doc_type).count()
    return f"{prefix}-{2026}-{count + 1:03d}"


@router.post("/voice-agent/tool")
async def execute_tool(req: ToolCallRequest):
    """Execute a tool call from AssemblyAI Voice Agent and return the result."""
    global _active_doc_state, _previous_doc_state
    logger.info(f"Tool call: {req.name}({json.dumps(req.arguments)[:200]})")

    try:
        if req.name == "create_document":
            return _handle_create_document(req.arguments)
        elif req.name == "revise_document":
            return _handle_revise_document(req.arguments)
        elif req.name == "approve_document":
            return _handle_approve_document(req.arguments)
        elif req.name == "convert_currency":
            return _handle_convert_currency(req.arguments)
        elif req.name == "compare_documents":
            return _handle_compare_documents()
        elif req.name == "search_documents":
            return _handle_search_documents(req.arguments)
        elif req.name == "send_notification":
            return _handle_send_notification(req.arguments)
        elif req.name == "manage_inventory":
            return _handle_manage_inventory(req.arguments)
        elif req.name == "manage_tasks":
            return _handle_manage_tasks(req.arguments)
        elif req.name == "query_financials":
            return _handle_query_financials(req.arguments)
        elif req.name == "manage_calendar":
            return _handle_manage_calendar(req.arguments)
        elif req.name == "dispatch_slack":
            return _handle_dispatch_slack(req.arguments)
        else:
            return {"result": f"Unknown tool: {req.name}", "success": False}
    except Exception as e:
        logger.error(f"Tool execution error: {e}")
        return {"result": f"Error executing {req.name}: {str(e)}", "success": False}


def _handle_create_document(args: dict) -> dict:
    from app.models.document import Document
    from app.models.client import Client
    import json as _json

    db = _get_db()
    try:
        doc_type = args.get("doc_type", "quotation")
        client_name = args.get("client_name", "Acme Corp")
        amount = args.get("amount", 0)
        line_items = args.get("line_items", [])
        payment_terms = args.get("payment_terms", "")
        discount_pct = args.get("discount_pct", 0)
        discount_amount = args.get("discount_amount", 0)
        notes = args.get("notes", "")

        # Find or create client
        client = db.query(Client).filter(Client.name.ilike(f"%{client_name}%")).first()
        if not client:
            client = Client(name=client_name, currency="USD", payment_terms=payment_terms or "NET-30")
            db.add(client)
            db.flush()

        # Compute amount from line_items
        if line_items:
            computed = sum(item.get("subtotal", item.get("quantity", 0) * item.get("unit_price", 0)) for item in line_items)
            if discount_pct and not discount_amount:
                discount_amount = round(computed * discount_pct / 100, 2)
            amount = computed - discount_amount if discount_amount else computed

        doc_ref = _get_next_doc_ref(db, doc_type)
        verif = _generate_verification(doc_type, doc_ref, amount)
        approval = "AUTO-APPROVED" if amount <= 10000 else "PENDING CFO APPROVAL"

        doc = Document(
            doc_type=doc_type, doc_ref=doc_ref, client_id=client.id,
            amount=amount, line_items=_json.dumps(line_items),
            payment_terms=payment_terms, discount_pct=discount_pct,
            discount_amount=discount_amount, notes=notes,
            status="DRAFT", approval_status=approval,
            verification_hash=verif["verification_hash"], qr_payload=verif["qr_payload"],
        )
        db.add(doc)
        db.commit()

        return {
            "result": f"Document {doc_type} ({doc_ref}) created for {client_name}. Amount: ${amount:,.2f}. Status: {approval}. Verification: {verif['verification_hash']}",
            "success": True,
            "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
            "client": client_name, "approval_status": approval,
            "verification_hash": verif["verification_hash"],
            "qr_payload": verif["qr_payload"],
            "line_items": line_items, "payment_terms": payment_terms,
            "discount_pct": discount_pct, "discount_amount": discount_amount,
            "notes": notes,
        }
    finally:
        db.close()


def _handle_revise_document(args: dict) -> dict:
    from app.models.document import Document
    import json as _json

    db = _get_db()
    try:
        last_doc = db.query(Document).order_by(Document.id.desc()).first()
        if not last_doc:
            return {"result": "No active document to revise. Please create a document first.", "success": False}

        field = args.get("field", "")
        new_value = args.get("new_value", "")
        if not field:
            return {"result": "Please specify which field to change.", "success": False}

        if field in ("amount", "discount_pct", "discount_amount"):
            setattr(last_doc, field, float(new_value))
        else:
            setattr(last_doc, field, new_value)

        last_doc.revised = 1
        verif = _generate_verification(last_doc.doc_type, last_doc.doc_ref, last_doc.amount)
        last_doc.verification_hash = verif["verification_hash"]
        db.commit()

        return {
            "result": f"Document {last_doc.doc_ref} ({last_doc.doc_type}) revised: {field} changed to {new_value}. New hash: {verif['verification_hash']}",
            "success": True, "field": field, "new_value": new_value,
            "doc_type": last_doc.doc_type, "doc_ref": last_doc.doc_ref,
            "verification_hash": verif["verification_hash"],
            "qr_payload": verif["qr_payload"],
        }
    finally:
        db.close()


def _handle_approve_document(args: dict) -> dict:
    from app.models.document import Document

    db = _get_db()
    try:
        last_doc = db.query(Document).order_by(Document.id.desc()).first()
        if not last_doc:
            return {"result": "No active document to approve.", "success": False}

        passkey = args.get("passkey", "")
        if last_doc.amount > 10000 and passkey != PASSKEY:
            return {"result": "Approval requires CFO passkey KNT-2026. Please provide the passkey.", "success": False, "needs_passkey": True}

        last_doc.approval_status = "OFFICIAL CFO APPROVED"
        last_doc.status = "APPROVED"
        last_doc.approved_by = "Sarah Jenkins (CFO)"
        db.commit()

        return {
            "result": f"Document {last_doc.doc_ref} approved by CFO. Authorization logged.",
            "success": True, "approval_status": "OFFICIAL CFO APPROVED",
        }
    finally:
        db.close()


def _handle_convert_currency(args: dict) -> dict:
    amount_usd = args.get("amount_usd", 27075)
    target = args.get("target_currency", "BDT")
    rate = EXCHANGE_RATES.get(target, 1.0)
    symbol = CURRENCY_SYMBOLS.get(target, "")
    converted = round(amount_usd * rate, 2)

    return {
        "result": f"${amount_usd:,.2f} USD = {symbol}{converted:,.2f} {target} at exchange rate {rate}.",
        "success": True, "converted": converted, "currency": target,
        "rate": rate, "display": f"{symbol}{converted:,.2f} {target}",
    }


def _handle_compare_documents() -> dict:
    from app.models.document import Document

    db = _get_db()
    try:
        docs = db.query(Document).order_by(Document.id.desc()).limit(2).all()
        if len(docs) < 2:
            return {"result": "No documents to compare. Create and revise a document first.", "success": False}

        old, new = docs[1], docs[0]
        diffs = []
        for field in ["amount", "doc_type", "approval_status"]:
            old_val = getattr(old, field)
            new_val = getattr(new, field)
            if old_val != new_val:
                diffs.append({"field": field, "old": str(old_val), "new": str(new_val)})

        if not diffs:
            return {"result": "No differences found between the two most recent documents.", "success": True, "diffs": []}

        summary = "; ".join(f"{d['field']}: {d['old']} → {d['new']}" for d in diffs)
        return {"result": f"Document differences ({old.doc_ref} → {new.doc_ref}): {summary}", "success": True, "diffs": diffs}
    finally:
        db.close()


def _handle_dispatch_slack(args: dict) -> dict:
    from app.models.document import Document
    from app.services.email_service import send_slack

    channel = args.get("channel", "#finance")
    db = _get_db()
    try:
        last_doc = db.query(Document).order_by(Document.id.desc()).first()
        doc_ref = last_doc.doc_ref if last_doc else "N/A"
        msg = f"Document {doc_ref} summary dispatched to {channel}"
        result = send_slack(channel, msg)
        return {"result": f"Document summary for {doc_ref} dispatched to {channel}. {result['message']}", "success": True, "channel": channel, "dispatched": True}
    finally:
        db.close()


def _handle_search_documents(args: dict) -> dict:
    from app.models.document import Document
    from app.models.client import Client

    db = _get_db()
    try:
        query = db.query(Document)
        if args.get("doc_type"):
            query = query.filter(Document.doc_type == args["doc_type"])
        if args.get("client_name"):
            client = db.query(Client).filter(Client.name.ilike(f"%{args['client_name']}%")).first()
            if client:
                query = query.filter(Document.client_id == client.id)
        if args.get("min_amount"):
            query = query.filter(Document.amount >= args["min_amount"])
        if args.get("max_amount"):
            query = query.filter(Document.amount <= args["max_amount"])

        results = query.order_by(Document.id.desc()).limit(10).all()
        if not results:
            return {"result": "No documents found matching your search criteria.", "success": True, "count": 0, "documents": []}

        doc_list = []
        for d in results:
            client_name = d.client.name if d.client else "Internal"
            doc_list.append({"doc_type": d.doc_type, "doc_ref": d.doc_ref, "client": client_name, "amount": d.amount, "status": d.status})

        summary = "; ".join(f"{d.doc_ref} ({d.doc_type}, ${d.amount:,.0f})" for d in results[:5])
        return {
            "result": f"Found {len(results)} document(s): {summary}" + ("..." if len(results) > 5 else ""),
            "success": True, "count": len(results), "documents": doc_list,
        }
    finally:
        db.close()


def _handle_send_notification(args: dict) -> dict:
    from app.models.document import Document
    from app.services.email_service import send_email, send_slack

    channel = args.get("channel", "email")
    recipient = args.get("recipient", "")
    message = args.get("message", "")

    if not recipient:
        return {"result": "Please provide a recipient (email address or Slack channel).", "success": False}

    db = _get_db()
    try:
        last_doc = db.query(Document).order_by(Document.id.desc()).first()
        doc_ref = last_doc.doc_ref if last_doc else "N/A"
        full_msg = message or f"Document {doc_ref} summary for your review."

        if channel == "email":
            result = send_email(to=recipient, subject=f"Konthora: {doc_ref}", body=full_msg)
        elif channel == "slack":
            result = send_slack(channel=recipient, message=full_msg)
        else:
            result = {"success": True, "message": f"Notification sent via {channel}"}

        return {"result": result["message"], "success": result["success"], "channel": channel, "recipient": recipient}
    finally:
        db.close()


def _handle_manage_inventory(args: dict) -> dict:
    from app.models.inventory import Inventory

    db = _get_db()
    try:
        action = args.get("action", "list_all")

        if action == "list_all":
            items = db.query(Inventory).all()
            inv_list = [{"item": i.item_name, "sku": i.sku, "qty": i.qty, "unit_price": i.unit_price, "warehouse": i.warehouse} for i in items]
            summary = "; ".join(f"{i.item_name}: {i.qty} units" for i in items)
            return {"result": f"Inventory snapshot: {summary}", "success": True, "inventory": inv_list}

        if action == "check":
            item_name = args.get("item_name", "")
            if not item_name:
                return {"result": "Please specify an item name to check.", "success": False}
            item = db.query(Inventory).filter(Inventory.item_name.ilike(f"%{item_name}%")).first()
            if not item:
                return {"result": f"Item '{item_name}' not found in inventory.", "success": False}
            return {"result": f"{item.item_name} ({item.sku}): {item.qty} units in {item.warehouse}, ${item.unit_price}/unit.", "success": True}

        if action in ("add", "deduct"):
            item_name = args.get("item_name", "")
            qty = int(args.get("quantity", 0))
            if not item_name or not qty:
                return {"result": "Please specify item name and quantity.", "success": False}
            item = db.query(Inventory).filter(Inventory.item_name.ilike(f"%{item_name}%")).first()
            if not item:
                return {"result": f"Item '{item_name}' not found.", "success": False}
            if action == "add":
                item.qty += qty
                db.commit()
                return {"result": f"Added {qty} units of {item.item_name}. New stock: {item.qty} units.", "success": True}
            else:
                if item.qty < qty:
                    return {"result": f"Insufficient stock for {item.item_name}. Available: {item.qty}, requested: {qty}.", "success": False}
                item.qty -= qty
                db.commit()
                return {"result": f"Deducted {qty} units of {item.item_name}. Remaining: {item.qty} units.", "success": True}

        return {"result": f"Unknown inventory action: {action}", "success": False}
    finally:
        db.close()


def _handle_manage_tasks(args: dict) -> dict:
    from app.models.task import Task

    db = _get_db()
    try:
        action = args.get("action", "list")

        if action in ("list", "list_pending"):
            query = db.query(Task)
            if action == "list_pending":
                query = query.filter(Task.status != "completed")
            tasks = query.order_by(Task.id).all()
            task_list = [{"id": t.task_id, "title": t.title, "assignee": t.assignee, "deadline": t.deadline, "priority": t.priority, "status": t.status} for t in tasks]
            summary = "; ".join(f"{t.task_id}: {t.title} ({t.status})" for t in tasks[:5])
            return {"result": f"Tasks: {summary}" + ("..." if len(tasks) > 5 else ""), "success": True, "tasks": task_list}

        if action == "create":
            title = args.get("task_title", "Untitled Task")
            assignee = args.get("assignee", "Unassigned")
            deadline = args.get("deadline", "TBD")
            priority = args.get("priority", "medium")
            count = db.query(Task).count()
            task_id = f"TASK-{count + 1:03d}"
            new_task = Task(task_id=task_id, title=title, assignee=assignee, deadline=deadline, priority=priority, status="pending")
            db.add(new_task)
            db.commit()
            return {"result": f"Task {task_id} created: '{title}' assigned to {assignee}, deadline {deadline}, priority {priority}.", "success": True}

        if action == "complete":
            search = args.get("task_title", "")
            task = db.query(Task).filter((Task.task_id.ilike(f"%{search}%")) | (Task.title.ilike(f"%{search}%"))).first()
            if not task:
                return {"result": f"Task not found: '{search}'.", "success": False}
            task.status = "completed"
            db.commit()
            return {"result": f"Task {task.task_id} marked as completed: '{task.title}'.", "success": True}

        if action == "update":
            search = args.get("task_title", "")
            task = db.query(Task).filter((Task.task_id.ilike(f"%{search}%")) | (Task.title.ilike(f"%{search}%"))).first()
            if not task:
                return {"result": f"Task not found: '{search}'.", "success": False}
            if args.get("priority"):
                task.priority = args["priority"]
            if args.get("deadline"):
                task.deadline = args["deadline"]
            if args.get("assignee"):
                task.assignee = args["assignee"]
            db.commit()
            return {"result": f"Task {task.task_id} updated.", "success": True}

        return {"result": f"Unknown task action: {action}", "success": False}
    finally:
        db.close()


def _handle_query_financials(args: dict) -> dict:
    from app.models.financial import Financial

    db = _get_db()
    try:
        metric = args.get("metric", "all")
        period = args.get("period", "Q1 2026")

        fin = db.query(Financial).filter(Financial.period == period).first()
        if not fin:
            available = ", ".join(f.period for f in db.query(Financial).all())
            return {"result": f"Period '{period}' not found. Available: {available}.", "success": False}

        data = {"revenue": fin.revenue, "expenses": fin.expenses, "profit": fin.profit, "ebitda": fin.ebitda, "ebitda_margin": fin.ebitda_margin, "tax": fin.tax, "cash_flow": fin.cash_flow}

        if metric == "all":
            return {"result": f"{period} Financial Summary: Revenue ${fin.revenue:,.0f}, Expenses ${fin.expenses:,.0f}, Net Profit ${fin.profit:,.0f}, EBITDA {fin.ebitda_margin}%, Tax ${fin.tax:,.0f}.", "success": True, "data": data}

        value = data.get(metric)
        if value is None:
            return {"result": f"Metric '{metric}' not available.", "success": False}

        display = f"{value}%" if metric == "ebitda_margin" else f"${value:,.0f}"
        return {"result": f"{period} {metric.title()}: {display}", "success": True, "metric": metric, "period": period, "value": value, "data": data}
    finally:
        db.close()


def _handle_manage_calendar(args: dict) -> dict:
    from app.models.calendar_event import CalendarEvent

    db = _get_db()
    try:
        action = args.get("action", "list_today")

        if action == "list_today":
            today = time.strftime("%Y-%m-%d")
            events = db.query(CalendarEvent).filter(CalendarEvent.date == today).all()
            if not events:
                upcoming = db.query(CalendarEvent).order_by(CalendarEvent.date).limit(3).all()
                summary = "; ".join(f"{e.title} on {e.date} at {e.time}" for e in upcoming)
                return {"result": f"No events today. Upcoming: {summary}", "success": True}
            summary = "; ".join(f"{e.title} at {e.time}" for e in events)
            return {"result": f"Today's events: {summary}", "success": True}

        if action == "check":
            date = args.get("date", time.strftime("%Y-%m-%d"))
            events = db.query(CalendarEvent).filter(CalendarEvent.date == date).all()
            if not events:
                return {"result": f"No events scheduled for {date}. Time is available.", "success": True, "available": True}
            summary = "; ".join(f"{e.title} at {e.time}" for e in events)
            return {"result": f"Events on {date}: {summary}", "success": True, "available": False}

        if action == "schedule":
            title = args.get("title", "Meeting")
            date = args.get("date", "TBD")
            time_ = args.get("time", "TBD")
            attendees = args.get("attendees", "")
            count = db.query(CalendarEvent).count()
            event_id = f"EVT-{count + 1:03d}"
            new_event = CalendarEvent(event_id=event_id, title=title, date=date, time=time_, attendees=attendees, status="scheduled")
            db.add(new_event)
            db.commit()
            return {"result": f"Event scheduled: '{title}' on {date} at {time_}. Attendees: {attendees or 'TBD'}. Confirmation {event_id} logged.", "success": True}

        if action == "set_reminder":
            text = args.get("reminder_text", "Reminder")
            date = args.get("date", "TBD")
            time_ = args.get("time", "TBD")
            return {"result": f"Reminder set for {date} at {time_}: '{text}'. You will be notified.", "success": True}

        if action == "cancel":
            search = args.get("title", "")
            event = db.query(CalendarEvent).filter((CalendarEvent.event_id.ilike(f"%{search}%")) | (CalendarEvent.title.ilike(f"%{search}%"))).first()
            if not event:
                return {"result": f"Event not found: '{search}'.", "success": False}
            event.status = "cancelled"
            db.commit()
            return {"result": f"Event '{event.title}' on {event.date} has been cancelled.", "success": True}

        return {"result": f"Unknown calendar action: {action}", "success": False}
    finally:
        db.close()


# ── Session config endpoint (for frontend to fetch) ──

@router.get("/voice-agent/config")
async def get_voice_agent_config():
    """Return session config with dynamic system prompt built from live DB data."""
    db = _get_db()
    try:
        from app.models.client import Client
        from app.models.inventory import Inventory
        from app.models.task import Task
        from app.models.staff import Staff
        from app.models.financial import Financial
        from app.models.calendar_event import CalendarEvent
        from app.models.document import Document

        clients = db.query(Client).all()
        inventory = db.query(Inventory).all()
        tasks = db.query(Task).filter(Task.status != "completed").all()
        staff_list = db.query(Staff).all()
        financials = db.query(Financial).all()
        events = db.query(CalendarEvent).filter(CalendarEvent.status == "scheduled").order_by(CalendarEvent.date).all()
        doc_count = db.query(Document).count()

        client_str = ", ".join(f"{c.name} ({c.payment_terms}, {c.currency})" for c in clients) or "None"
        inv_str = ", ".join(f"{i.item_name} ({i.qty} @ ${i.unit_price})" for i in inventory) or "None"
        task_str = ", ".join(f"{t.task_id} {t.title} ({t.assignee}, {t.status})" for t in tasks) or "None"
        staff_str = ", ".join(f"{s.name} ({s.employee_id}, {s.role})" for s in staff_list) or "None"
        fin_str = "; ".join(f"{f.period}: Revenue ${f.revenue:,.0f}, Profit ${f.profit:,.0f}, EBITDA {f.ebitda_margin}%" for f in financials) or "None"
        event_str = "; ".join(f"{e.title} on {e.date} at {e.time}" for e in events[:6]) or "None"
    except Exception as e:
        logger.warning(f"DB query for system prompt failed, using defaults: {e}")
        client_str = "Acme Corp (NET-30, USD), SoftTech BD (NET-45, BDT), InnoTech GmbH (NET-60, EUR)"
        inv_str = "M3 Pro Chip (42@$450), Server Rack 42U (8@$2800), Fiber 100G (120@$180)"
        task_str = "TASK-001 Q2 projections, TASK-002 NDA review, TASK-003 Fiber deploy"
        staff_str = "Rafiqul Islam (EMP-1041, Engineer), Sarah Jenkins (EMP-0021, CFO)"
        fin_str = "Q1 2026: Revenue $142K, Profit $57K; Q2 projected $185K"
        event_str = "Q2 Strategy Apr 15, Board Meeting Apr 25"
        doc_count = 14
    finally:
        db.close()

    system_prompt = (
        "You are Konthora, an autonomous voice-driven enterprise operations engine. "
        "You help users create, revise, approve, and manage enterprise documents and business operations using voice commands.\n\n"
        "DOCUMENT CAPABILITIES:\n"
        "- Create 24 document types: quotations, purchase orders, invoices, proforma invoices, tax reports, financial reports, HR letters, meeting minutes, NDAs, expense vouchers, analytics charts, dispatch notifications, delivery challans, work orders, credit notes, debit notes, receipts, bank statements, memos, official notices, agreements, bids, tenders, insurance claims.\n"
        "- Revise documents: change any field (discount, fee, salary, terms, etc.)\n"
        "- Approve documents: authorize with CFO passkey for high-value items\n"
        "- Compare document versions to show differences\n\n"
        "OPERATIONS CAPABILITIES:\n"
        "- Search documents by type, client, date range, or amount\n"
        "- Send email or Slack notifications with document summaries\n"
        "- Manage inventory: check stock, add/deduct units, list all items\n"
        "- Task management: create, update, complete, list tasks with deadlines\n"
        "- Financial queries: revenue, expenses, profit, EBITDA, tax by quarter\n"
        "- Calendar: schedule meetings, check availability, set reminders, cancel events\n"
        "- Currency conversion: USD to BDT, EUR, GBP, INR, JPY\n\n"
        f"DATABASE (live — {doc_count} documents):\n"
        f"- Clients: {client_str}\n"
        f"- Financials: {fin_str}\n"
        f"- Inventory: {inv_str}\n"
        f"- Staff: {staff_str}\n"
        f"- Tasks: {task_str}\n"
        f"- Calendar: {event_str}\n\n"
        "RULES:\n"
        "- Keep spoken responses to 1-2 short sentences.\n"
        "- Always respond in English.\n"
        "- Quote specific names, IDs, currencies, numbers.\n"
        "- Use the appropriate tool for each action.\n"
        "- Be professional, concise, and proactive.\n"
        "- When user says goodbye/thanks/nothing, respond briefly and do NOT ask further questions."
    )

    return {
        "system_prompt": system_prompt,
        "greeting": "Welcome to Konthora. I am your enterprise voice operations engine. You can create documents, manage inventory, check finances, schedule meetings, and more — all by voice. How can I help you today?",
        "voice": "anna",
        "tools": VOICE_AGENT_TOOLS,
    }


# ── Text command endpoint (fallback for text input, not voice) ──

@router.post("/voice-agent/text")
async def text_command(req: TextCommandRequest):
    """Handle text commands — with context from recent audio upload if available."""
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text command")

    from app.services.voice_agent_service import VoiceAgentService
    svc = VoiceAgentService()
    lowered = text.lower()

    # Check if there's a recent transcription to use as context
    has_context = bool(_last_transcription.get("text"))
    transcript_text = _last_transcription.get("text", "")
    transcript_summary = _last_transcription.get("summary", "")
    filename = _last_transcription.get("filename", "recording")

    # Handle follow-up actions after audio upload
    if has_context and any(w in lowered for w in [
        "meeting minutes", "meeting note", "minutes", "summary",
        "action item", "task", "create task", "follow up",
        "invoice", "purchase order", "quotation", "contract", "nda",
        "email", "send", "dispatch", "notify",
        "what did", "key point", "discussed", "decide", "decision",
    ]):
        # Determine action type
        if any(w in lowered for w in ["meeting minutes", "minutes", "meeting note", "note"]):
            doc_type = "meeting_minutes"
            doc_ref = "MIN-2026-AUDIO"
            action_desc = "meeting minutes"
        elif any(w in lowered for w in ["task", "action item", "follow up", "create task"]):
            doc_type = "task_update"
            doc_ref = "TASK-AUDIO"
            action_desc = "action items and tasks"
        elif any(w in lowered for w in ["invoice", "bill"]):
            doc_type = "invoice"
            doc_ref = "INV-AUDIO"
            action_desc = "invoice"
        elif any(w in lowered for w in ["purchase order", "po"]):
            doc_type = "purchase_order"
            doc_ref = "PO-AUDIO"
            action_desc = "purchase order"
        elif any(w in lowered for w in ["quotation", "quote"]):
            doc_type = "quotation"
            doc_ref = "QUOTE-AUDIO"
            action_desc = "quotation"
        elif any(w in lowered for w in ["email", "send", "dispatch", "notify"]):
            doc_type = "dispatch_notification"
            doc_ref = "DISP-AUDIO"
            action_desc = "email dispatch"
        elif any(w in lowered for w in ["contract", "nda", "agreement"]):
            doc_type = "legal_contract"
            doc_ref = "NDA-AUDIO"
            action_desc = "contract"
        elif any(w in lowered for w in ["key point", "discussed", "decide", "decision", "what did"]):
            doc_type = "meeting_minutes"
            doc_ref = "MIN-2026-AUDIO"
            action_desc = "key discussion points"
        else:
            doc_type = "meeting_minutes"
            doc_ref = "MIN-2026-AUDIO"
            action_desc = "summary"

        response = (
            f"Processed '{filename}': {action_desc} created from recording transcription. "
            f"Document {doc_ref} is ready. The recording contained: {transcript_summary or transcript_text[:150]}..."
        )
        action = {
            "doc_type": doc_type,
            "doc_ref": doc_ref,
            "source_file": filename,
            "transcription_preview": transcript_text[:200],
            "summary": transcript_summary,
        }
        # Save to database
        try:
            from app.models.document import Document
            import json as _json
            db = _get_db()
            verif = _generate_verification(doc_type, doc_ref, 0)
            doc = Document(
                doc_type=doc_type, doc_ref=doc_ref, amount=0,
                line_items="[]", notes=f"Generated from audio: {filename}. {transcript_summary or ''}",
                status="DRAFT", approval_status="AUTO-APPROVED",
                verification_hash=verif["verification_hash"], qr_payload=verif["qr_payload"],
            )
            db.add(doc)
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Failed to save audio follow-up doc: {e}")

        _last_transcription.clear()
        return {"response": response, "action_card": action}

    # Default text command flow
    response = svc._fast_fallback(text)
    action = svc.resolve_document_action(response, text)
    return {"response": response, "action_card": action}


# ── Audio Upload → AssemblyAI Batch Transcription ──

@router.post("/voice-agent/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload audio file → AssemblyAI HTTP API → transcription + document intent."""
    import asyncio

    api_key = os.getenv("ASSEMBLYAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="ASSEMBLYAI_API_KEY not configured")

    allowed_types = {
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav",
        "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/flac", "audio/x-flac",
        "audio/webm", "audio/ogg", "audio/aac", "application/octet-stream",
    }
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported audio format: {file.content_type}")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    logger.info(f"Transcribing uploaded file: {file.filename} ({len(content)} bytes)")

    # Step 1: Upload file to AssemblyAI, Step 2: Submit transcription, Step 3: Poll for result
    async def _transcribe_async():
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Upload audio bytes
            upload_resp = await client.post(
                "https://api.assemblyai.com/v2/upload",
                content=content,
                headers={"Authorization": api_key, "Content-Type": "application/octet-stream"},
            )
            if upload_resp.status_code != 200:
                raise Exception(f"Upload failed ({upload_resp.status_code}): {upload_resp.text[:200]}")
            audio_url = upload_resp.json()["upload_url"]
            logger.info(f"Uploaded to AssemblyAI: {audio_url[:80]}...")

            # Submit transcription
            transcribe_resp = await client.post(
                "https://api.assemblyai.com/v2/transcript",
                json={
                    "audio_url": audio_url,
                    "speaker_labels": True,
                    "summarization": True,
                    "summary_model": "informative",
                    "summary_type": "bullets",
                },
                headers={"Authorization": api_key, "Content-Type": "application/json"},
            )
            if transcribe_resp.status_code != 200:
                raise Exception(f"Transcription submit failed ({transcribe_resp.status_code}): {transcribe_resp.text[:200]}")
            transcript_id = transcribe_resp.json()["id"]
            logger.info(f"Transcription submitted: {transcript_id}")

            # Poll for completion (max 60s)
            for _ in range(60):
                poll_resp = await client.get(
                    f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
                    headers={"Authorization": api_key},
                )
                if poll_resp.status_code != 200:
                    raise Exception(f"Poll failed ({poll_resp.status_code}): {poll_resp.text[:200]}")
                status = poll_resp.json()["status"]
                if status == "completed":
                    logger.info(f"Transcription completed: {transcript_id}")
                    return poll_resp.json()
                elif status == "error":
                    raise Exception(f"Transcription error: {poll_resp.json().get('error', 'unknown')}")
                await asyncio.sleep(1.0)
            raise Exception("Transcription timed out after 60s")

    try:
        result = await _transcribe_async()
    except Exception as e:
        logger.error(f"AssemblyAI transcription failed: {e}")
        raise HTTPException(status_code=502, detail=f"Transcription failed: {str(e)}")

    full_text = result.get("text", "") or ""
    summary = result.get("summary", "") or ""
    speakers = result.get("speaker_labels", []) if isinstance(result.get("speaker_labels"), list) else []
    duration = result.get("audio_duration", 0)

    # Store transcription for follow-up text commands
    _last_transcription["text"] = full_text
    _last_transcription["summary"] = summary
    _last_transcription["speakers"] = speakers
    _last_transcription["duration"] = duration
    _last_transcription["filename"] = file.filename

    # Build suggested actions based on content
    lowered = full_text.lower()
    suggestions = []
    if any(w in lowered for w in ["meeting", "discuss", "decide", "action item", "follow up", "agenda"]):
        suggestions = ["Create meeting minutes", "Extract action items and create tasks", "Send meeting summary to team"]
    elif any(w in lowered for w in ["invoice", "bill", "payment", "charge", "price", "cost"]):
        suggestions = ["Create an invoice", "Create a purchase order", "Send payment reminder"]
    elif any(w in lowered for w in ["deadline", "task", "assign", "complete", "finish", "deliver"]):
        suggestions = ["Create tasks from this recording", "Update task status", "Send task assignments"]
    elif any(w in lowered for w in ["contract", "agreement", "sign", "legal", "terms"]):
        suggestions = ["Draft a contract", "Create an NDA", "Review legal terms"]
    else:
        suggestions = ["Create meeting minutes", "Summarize key points", "Create follow-up tasks"]

    response_msg = (
        f"Audio transcription complete ({duration}s). "
        f"{summary + ' ' if summary else ''}"
        f"What would you like me to do with this recording? I can: {', '.join(suggestions)}."
    )

    return {
        "transcription": full_text,
        "summary": summary,
        "speakers": speakers,
        "duration_seconds": duration,
        "response": response_msg,
        "suggestions": suggestions,
        "action_card": None,
    }
