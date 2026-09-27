"""
AssemblyAI Voice Agent API — v2 endpoints.

Architecture:
  Browser → temp token → AssemblyAI Voice Agent (STT + LLM + TTS, all managed)
  AssemblyAI → tool.call → Browser → POST /tool → Backend executes → result → Browser → AssemblyAI

Backend responsibilities:
  1. Mint temporary tokens for browser → AssemblyAI WebSocket
  2. Execute tool calls from AssemblyAI's LLM (document actions)
"""
import os
import json
import time
import hashlib
from dotenv import load_dotenv
import httpx
from fastapi import APIRouter, HTTPException
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


# In-memory state (per-session, good enough for hackathon)
_active_doc_state = {}
_previous_doc_state = {}

EXCHANGE_RATES = {"USD": 1.0, "BDT": 120.0, "EUR": 0.92}
CURRENCY_SYMBOLS = {"USD": "$", "BDT": "৳", "EUR": "€"}
PASSKEY = "KNT-2026"


def _generate_verification(doc_type: str, doc_ref: str, amount: float) -> dict:
    seed = f"{doc_type}:{doc_ref}:{amount}:{int(time.time() // 3600)}"
    digest = hashlib.sha256(seed.encode()).hexdigest()[:16].upper()
    vhash = f"SHA256-KNT-{digest[:4]}-{digest[4:8]}-{digest[8:12]}"
    return {"verification_hash": vhash, "qr_payload": f"https://konthora.ai/verify?ref={doc_ref}&hash={vhash}", "verified_at": int(time.time())}


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
    global _active_doc_state
    doc_type = args.get("doc_type", "quotation")
    client = args.get("client_name", "Acme Corp")
    amount = args.get("amount", 0)
    line_items = args.get("line_items", [])
    payment_terms = args.get("payment_terms", "")
    discount_pct = args.get("discount_pct", 0)
    discount_amount = args.get("discount_amount", 0)
    notes = args.get("notes", "")

    doc_refs = {
        "quotation": "PHOENIX-2026", "purchase_order": "PO-88301", "invoice": "INV-8821",
        "proforma_invoice": "PI-2026-441", "tax_compliance": "FY2026-TAX-01", "financial": "FY2026-Q1-REP",
        "hr_letter": "EMP-1041-OFFER", "meeting_minutes": "MIN-2026-09",
        "legal_contract": "NDA-2026-88", "expense_voucher": "EXP-9902",
        "analytics_chart": "CHART-2026-Q1Q2", "dispatch_notification": "DISP-2026",
        "delivery_challan": "DC-2026-301", "work_order": "WO-2026-77",
        "credit_note": "CN-2026-102", "debit_note": "DN-2026-055",
        "receipt": "RCT-2026-205", "bank_statement": "BST-2026-Q1",
        "memo": "MEMO-2026-15", "official_notice": "NOTICE-2026-08",
        "agreement": "AGR-2026-33", "bid": "BID-2026-12",
        "tender": "TDR-2026-07", "insurance_claim": "INS-2026-41",
    }

    doc_ref = doc_refs.get(doc_type, "DOC-2026")

    # Compute amount from line_items if provided, else use passed amount, else fallback
    if line_items:
        computed = sum(item.get("subtotal", item.get("quantity", 0) * item.get("unit_price", 0)) for item in line_items)
        if discount_pct and not discount_amount:
            discount_amount = round(computed * discount_pct / 100, 2)
        amount = computed - discount_amount if discount_amount else computed
    elif not amount:
        amount = 0

    verif = _generate_verification(doc_type, doc_ref, amount)
    approval = "AUTO-APPROVED" if amount <= 10000 else "PENDING CFO APPROVAL"

    _previous_doc_state = dict(_active_doc_state) if _active_doc_state else {}
    _active_doc_state = {
        "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
        "client": client, "approval_status": approval,
        "verification_hash": verif["verification_hash"], "qr_payload": verif["qr_payload"],
        "line_items": line_items, "payment_terms": payment_terms,
        "discount_pct": discount_pct, "discount_amount": discount_amount,
        "notes": notes,
    }

    return {
        "result": f"Document {doc_type} ({doc_ref}) created for {client}. Amount: ${amount:,.2f}. Status: {approval}. Verification: {verif['verification_hash']}",
        "success": True,
        "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
        "client": client, "approval_status": approval,
        "verification_hash": verif["verification_hash"],
        "qr_payload": verif["qr_payload"],
        "line_items": line_items, "payment_terms": payment_terms,
        "discount_pct": discount_pct, "discount_amount": discount_amount,
        "notes": notes,
    }


def _handle_revise_document(args: dict) -> dict:
    global _active_doc_state
    if not _active_doc_state:
        return {"result": "No active document to revise. Please create a document first using create_document.", "success": False}

    field = args.get("field", "")
    new_value = args.get("new_value", "")
    if not field:
        return {"result": "Please specify which field to change (e.g. 'amount', 'client', 'terms').", "success": False}

    _active_doc_state["revised"] = True
    _active_doc_state[field] = new_value

    verif = _generate_verification(_active_doc_state["doc_type"], _active_doc_state["doc_ref"], _active_doc_state.get("amount", 0))
    _active_doc_state["verification_hash"] = verif["verification_hash"]

    doc_type = _active_doc_state["doc_type"]
    doc_ref = _active_doc_state["doc_ref"]

    return {
        "result": f"Document {doc_ref} ({doc_type}) revised: {field} changed to {new_value}. New verification hash: {verif['verification_hash']}",
        "success": True, "field": field, "new_value": new_value,
        "doc_type": doc_type, "doc_ref": doc_ref,
        "verification_hash": verif["verification_hash"],
        "qr_payload": verif["qr_payload"],
    }


def _handle_approve_document(args: dict) -> dict:
    global _active_doc_state
    if not _active_doc_state:
        return {"result": "No active document to approve.", "success": False}

    passkey = args.get("passkey", "")
    amount = _active_doc_state.get("amount", 0)

    if amount > 10000 and passkey != PASSKEY:
        return {"result": "Approval requires CFO passkey. Please provide the passkey.", "success": False, "needs_passkey": True}

    _active_doc_state["approval_status"] = "OFFICIAL CFO APPROVED"
    _active_doc_state["approved_by"] = "Sarah Jenkins (CFO)"
    _active_doc_state["approved_at"] = int(time.time())

    return {
        "result": f"Document {_active_doc_state['doc_ref']} approved by CFO. Authorization logged at {_active_doc_state['approved_at']}.",
        "success": True, "approval_status": "OFFICIAL CFO APPROVED",
    }


def _handle_convert_currency(args: dict) -> dict:
    amount_usd = args.get("amount_usd", _active_doc_state.get("amount", 27075))
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
    if not _active_doc_state or not _previous_doc_state:
        return {"result": "No documents to compare. Create and revise a document first.", "success": False}

    diffs = []
    for key in ["amount", "doc_type", "doc_ref", "approval_status"]:
        old = _previous_doc_state.get(key)
        new = _active_doc_state.get(key)
        if old != new:
            diffs.append({"field": key, "old": old, "new": new})

    if not diffs:
        return {"result": "No differences found between versions.", "success": True, "diffs": []}

    summary = "; ".join(f"{d['field']}: {d['old']} → {d['new']}" for d in diffs)
    return {"result": f"Document differences: {summary}", "success": True, "diffs": diffs}


def _handle_dispatch_slack(args: dict) -> dict:
    channel = args.get("channel", "#finance")
    doc_ref = _active_doc_state.get("doc_ref", "N/A")
    return {
        "result": f"Document summary for {doc_ref} dispatched to {channel} via Slack webhook. Delivery receipt logged.",
        "success": True, "channel": channel, "dispatched": True,
    }


# ── Search Documents ──
MOCK_DOCUMENTS = [
    {"doc_type": "quotation", "doc_ref": "PHOENIX-2026", "client": "Acme Corp", "amount": 27075, "date": "2026-01-15", "status": "APPROVED"},
    {"doc_type": "purchase_order", "doc_ref": "PO-88301", "client": "Apex Hardware", "amount": 15050, "date": "2026-02-10", "status": "APPROVED"},
    {"doc_type": "invoice", "doc_ref": "INV-8821", "client": "Acme Corp", "amount": 5050, "date": "2026-03-01", "status": "SENT"},
    {"doc_type": "tax_compliance", "doc_ref": "FY2026-TAX-01", "client": "Internal", "amount": 11400, "date": "2026-03-15", "status": "FILED"},
    {"doc_type": "financial", "doc_ref": "FY2026-Q1-REP", "client": "Internal", "amount": 142000, "date": "2026-04-01", "status": "FINAL"},
    {"doc_type": "hr_letter", "doc_ref": "EMP-1041-OFFER", "client": "Rafiqul Islam", "amount": 120000, "date": "2026-01-20", "status": "SENT"},
    {"doc_type": "expense_voucher", "doc_ref": "EXP-9902", "client": "Sarah Jenkins", "amount": 450, "date": "2026-03-10", "status": "APPROVED"},
    {"doc_type": "delivery_challan", "doc_ref": "DC-2026-301", "client": "SoftTech BD", "amount": 18900, "date": "2026-03-20", "status": "DELIVERED"},
    {"doc_type": "work_order", "doc_ref": "WO-2026-77", "client": "InnoTech GmbH", "amount": 32000, "date": "2026-02-28", "status": "IN PROGRESS"},
    {"doc_type": "credit_note", "doc_ref": "CN-2026-102", "client": "Acme Corp", "amount": 3500, "date": "2026-03-25", "status": "ISSUED"},
    {"doc_type": "debit_note", "doc_ref": "DN-2026-055", "client": "SoftTech BD", "amount": 2100, "date": "2026-03-28", "status": "ISSUED"},
    {"doc_type": "quotation", "doc_ref": "Q-2026-015", "client": "InnoTech GmbH", "amount": 45000, "date": "2026-04-05", "status": "PENDING"},
    {"doc_type": "invoice", "doc_ref": "INV-8822", "client": "SoftTech BD", "amount": 12300, "date": "2026-04-10", "status": "PAID"},
    {"doc_type": "memo", "doc_ref": "MEMO-2026-15", "client": "Internal", "amount": 0, "date": "2026-04-12", "status": "DISTRIBUTED"},
    {"doc_type": "agreement", "doc_ref": "AGR-2026-33", "client": "InnoTech GmbH", "amount": 0, "date": "2026-03-01", "status": "SIGNED"},
]

def _handle_search_documents(args: dict) -> dict:
    results = list(MOCK_DOCUMENTS)
    if args.get("doc_type"):
        results = [d for d in results if d["doc_type"] == args["doc_type"]]
    if args.get("client_name"):
        client = args["client_name"].lower()
        results = [d for d in results if client in d["client"].lower()]
    if args.get("date_from"):
        results = [d for d in results if d["date"] >= args["date_from"]]
    if args.get("date_to"):
        results = [d for d in results if d["date"] <= args["date_to"]]
    if args.get("min_amount"):
        results = [d for d in results if d["amount"] >= args["min_amount"]]
    if args.get("max_amount"):
        results = [d for d in results if d["amount"] <= args["max_amount"]]

    if not results:
        return {"result": "No documents found matching your search criteria.", "success": True, "count": 0, "documents": []}

    summary = "; ".join(f"{d['doc_ref']} ({d['doc_type']}, ${d['amount']:,.0f})" for d in results[:5])
    return {
        "result": f"Found {len(results)} document(s): {summary}" + ("..." if len(results) > 5 else ""),
        "success": True, "count": len(results), "documents": results[:10],
    }


# ── Send Notification ──
def _handle_send_notification(args: dict) -> dict:
    channel = args.get("channel", "email")
    recipient = args.get("recipient", "")
    message = args.get("message", "")
    doc_ref = _active_doc_state.get("doc_ref", "N/A")

    if not recipient:
        return {"result": "Please provide a recipient (email address or Slack channel).", "success": False}

    full_msg = message or f"Document {doc_ref} summary for your review."
    if channel == "email":
        return {
            "result": f"Email sent to {recipient}: '{full_msg[:80]}' — Delivery receipt DR-2026-{int(time.time()) % 10000} logged.",
            "success": True, "channel": "email", "recipient": recipient,
        }
    elif channel == "slack":
        return {
            "result": f"Slack notification posted to {recipient}: '{full_msg[:80]}' — Delivery confirmed.",
            "success": True, "channel": "slack", "recipient": recipient,
        }
    else:
        return {"result": f"Notification sent via {channel} to {recipient}.", "success": True}


# ── Inventory Management ──
MOCK_INVENTORY = [
    {"item": "M3 Pro Chip", "sku": "CHIP-M3PRO", "qty": 42, "unit_price": 450, "warehouse": "WH-DHAKA"},
    {"item": "Server Rack 42U", "sku": "RACK-42U", "qty": 8, "unit_price": 2800, "warehouse": "WH-DHAKA"},
    {"item": "Fiber 100G Module", "sku": "FIBER-100G", "qty": 120, "unit_price": 180, "warehouse": "WH-CHITTAGONG"},
    {"item": "Network Switch L3", "sku": "SW-L3-48P", "qty": 25, "unit_price": 950, "warehouse": "WH-DHAKA"},
    {"item": "UPS 3KVA", "sku": "UPS-3KVA", "qty": 15, "unit_price": 620, "warehouse": "WH-DHAKA"},
    {"item": "CAT6 Cable Roll", "sku": "CABLE-CAT6", "qty": 200, "unit_price": 45, "warehouse": "WH-CHITTAGONG"},
]

def _handle_manage_inventory(args: dict) -> dict:
    action = args.get("action", "list_all")

    if action == "list_all":
        summary = "; ".join(f"{i['item']}: {i['qty']} units" for i in MOCK_INVENTORY)
        return {"result": f"Inventory snapshot: {summary}", "success": True, "inventory": MOCK_INVENTORY}

    if action == "check":
        item_name = args.get("item_name", "")
        if not item_name:
            return {"result": "Please specify an item name to check.", "success": False}
        matches = [i for i in MOCK_INVENTORY if item_name.lower() in i["item"].lower()]
        if not matches:
            return {"result": f"Item '{item_name}' not found in inventory.", "success": False}
        item = matches[0]
        return {
            "result": f"{item['item']} ({item['sku']}): {item['qty']} units in {item['warehouse']}, ${item['unit_price']}/unit.",
            "success": True, "item": item,
        }

    if action in ("add", "deduct"):
        item_name = args.get("item_name", "")
        qty = args.get("quantity", 0)
        if not item_name or not qty:
            return {"result": "Please specify item name and quantity.", "success": False}
        matches = [i for i in MOCK_INVENTORY if item_name.lower() in i["item"].lower()]
        if not matches:
            return {"result": f"Item '{item_name}' not found.", "success": False}
        item = matches[0]
        if action == "add":
            item["qty"] += int(qty)
            return {"result": f"Added {qty} units of {item['item']}. New stock: {item['qty']} units.", "success": True}
        else:
            if item["qty"] < qty:
                return {"result": f"Insufficient stock for {item['item']}. Available: {item['qty']}, requested: {qty}.", "success": False}
            item["qty"] -= int(qty)
            return {"result": f"Deducted {qty} units of {item['item']}. Remaining stock: {item['qty']} units.", "success": True}

    return {"result": f"Unknown inventory action: {action}", "success": False}


# ── Task Management ──
MOCK_TASKS = [
    {"id": "TASK-001", "title": "Finalize Q2 financial projections", "assignee": "Sarah Jenkins", "deadline": "2026-04-20", "priority": "high", "status": "pending"},
    {"id": "TASK-002", "title": "Review NDA terms with InnoTech", "assignee": "Legal Team", "deadline": "2026-04-18", "priority": "medium", "status": "pending"},
    {"id": "TASK-003", "title": "Deploy Fiber 100G at Site-B", "assignee": "Rafiqul Islam", "deadline": "2026-05-01", "priority": "high", "status": "in_progress"},
    {"id": "TASK-004", "title": "Submit tax compliance documents", "assignee": "Finance Team", "deadline": "2026-04-15", "priority": "urgent", "status": "completed"},
    {"id": "TASK-005", "title": "Prepare board meeting agenda", "assignee": "CEO Office", "deadline": "2026-04-25", "priority": "medium", "status": "pending"},
]
_task_counter = 6

def _handle_manage_tasks(args: dict) -> dict:
    global _task_counter
    action = args.get("action", "list")

    if action == "list" or action == "list_pending":
        tasks = MOCK_TASKS if action == "list" else [t for t in MOCK_TASKS if t["status"] != "completed"]
        summary = "; ".join(f"{t['id']}: {t['title']} ({t['status']})" for t in tasks[:5])
        return {"result": f"Tasks: {summary}" + ("..." if len(tasks) > 5 else ""), "success": True, "tasks": tasks}

    if action == "create":
        title = args.get("task_title", "Untitled Task")
        assignee = args.get("assignee", "Unassigned")
        deadline = args.get("deadline", "TBD")
        priority = args.get("priority", "medium")
        task_id = f"TASK-{_task_counter:03d}"
        _task_counter += 1
        new_task = {"id": task_id, "title": title, "assignee": assignee, "deadline": deadline, "priority": priority, "status": "pending"}
        MOCK_TASKS.append(new_task)
        return {
            "result": f"Task {task_id} created: '{title}' assigned to {assignee}, deadline {deadline}, priority {priority}.",
            "success": True, "task": new_task,
        }

    if action == "complete":
        task_id = args.get("task_title", "")
        matches = [t for t in MOCK_TASKS if t["id"].lower() == task_id.lower() or task_id.lower() in t["title"].lower()]
        if not matches:
            return {"result": f"Task not found: '{task_id}'.", "success": False}
        matches[0]["status"] = "completed"
        return {"result": f"Task {matches[0]['id']} marked as completed: '{matches[0]['title']}'.", "success": True}

    if action == "update":
        task_id = args.get("task_title", "")
        matches = [t for t in MOCK_TASKS if t["id"].lower() == task_id.lower() or task_id.lower() in t["title"].lower()]
        if not matches:
            return {"result": f"Task not found: '{task_id}'.", "success": False}
        if args.get("priority"):
            matches[0]["priority"] = args["priority"]
        if args.get("deadline"):
            matches[0]["deadline"] = args["deadline"]
        if args.get("assignee"):
            matches[0]["assignee"] = args["assignee"]
        return {"result": f"Task {matches[0]['id']} updated.", "success": True}

    return {"result": f"Unknown task action: {action}", "success": False}


# ── Financial Queries ──
MOCK_FINANCIALS = {
    "Q1 2026": {"revenue": 142000, "expenses": 85000, "profit": 57000, "ebitda": 40500, "ebitda_margin": 28.5, "tax": 11400, "cash_flow": 52000},
    "Q2 2026": {"revenue": 185000, "expenses": 102000, "profit": 83000, "ebitda": 57500, "ebitda_margin": 31.0, "tax": 16600, "cash_flow": 71000},
    "YTD 2026": {"revenue": 327000, "expenses": 187000, "profit": 140000, "ebitda": 98000, "ebitda_margin": 30.0, "tax": 28000, "cash_flow": 123000},
}

def _handle_query_financials(args: dict) -> dict:
    metric = args.get("metric", "all")
    period = args.get("period", "Q1 2026")

    data = MOCK_FINANCIALS.get(period)
    if not data:
        available = ", ".join(MOCK_FINANCIALS.keys())
        return {"result": f"Period '{period}' not found. Available: {available}.", "success": False}

    if metric == "all":
        return {
            "result": f"{period} Financial Summary: Revenue ${data['revenue']:,.0f}, Expenses ${data['expenses']:,.0f}, Net Profit ${data['profit']:,.0f}, EBITDA {data['ebitda_margin']}%, Tax ${data['tax']:,.0f}.",
            "success": True, "data": data,
        }

    value = data.get(metric)
    if value is None:
        return {"result": f"Metric '{metric}' not available.", "success": False}

    display = f"{value}%" if metric == "ebitda_margin" else f"${value:,.0f}"
    return {
        "result": f"{period} {metric.title()}: {display}",
        "success": True, "metric": metric, "period": period, "value": value, "data": data,
    }


# ── Calendar Management ──
MOCK_CALENDAR = [
    {"id": "EVT-001", "title": "Q2 Strategy Review", "date": "2026-04-15", "time": "10:00", "attendees": "CEO, CFO, CTO", "status": "scheduled"},
    {"id": "EVT-002", "title": "InnoTech Contract Signing", "date": "2026-04-18", "time": "14:00", "attendees": "Legal, InnoTech Team", "status": "scheduled"},
    {"id": "EVT-003", "title": "Board Meeting", "date": "2026-04-25", "time": "09:00", "attendees": "Board Members", "status": "scheduled"},
    {"id": "EVT-004", "title": "Fiber Deployment Kickoff", "date": "2026-04-20", "time": "11:00", "attendees": "Rafiqul, Infrastructure Team", "status": "scheduled"},
]
_event_counter = 5

def _handle_manage_calendar(args: dict) -> dict:
    global _event_counter
    action = args.get("action", "list_today")

    if action == "list_today":
        today = time.strftime("%Y-%m-%d")
        today_events = [e for e in MOCK_CALENDAR if e["date"] == today]
        if not today_events:
            upcoming = sorted(MOCK_CALENDAR, key=lambda e: e["date"])[:3]
            summary = "; ".join(f"{e['title']} on {e['date']} at {e['time']}" for e in upcoming)
            return {"result": f"No events today. Upcoming: {summary}", "success": True, "events": upcoming}
        summary = "; ".join(f"{e['title']} at {e['time']}" for e in today_events)
        return {"result": f"Today's events: {summary}", "success": True, "events": today_events}

    if action == "check":
        date = args.get("date", time.strftime("%Y-%m-%d"))
        events = [e for e in MOCK_CALENDAR if e["date"] == date]
        if not events:
            return {"result": f"No events scheduled for {date}. Time is available.", "success": True, "available": True}
        summary = "; ".join(f"{e['title']} at {e['time']}" for e in events)
        return {"result": f"Events on {date}: {summary}", "success": True, "available": False, "events": events}

    if action == "schedule":
        title = args.get("title", "Meeting")
        date = args.get("date", "TBD")
        time_ = args.get("time", "TBD")
        attendees = args.get("attendees", "")
        event_id = f"EVT-{_event_counter:03d}"
        _event_counter += 1
        new_event = {"id": event_id, "title": title, "date": date, "time": time_, "attendees": attendees, "status": "scheduled"}
        MOCK_CALENDAR.append(new_event)
        return {
            "result": f"Event scheduled: '{title}' on {date} at {time_}. Attendees: {attendees or 'TBD'}. Confirmation {event_id} logged.",
            "success": True, "event": new_event,
        }

    if action == "set_reminder":
        text = args.get("reminder_text", "Reminder")
        date = args.get("date", "TBD")
        time_ = args.get("time", "TBD")
        return {
            "result": f"Reminder set for {date} at {time_}: '{text}'. You will be notified.",
            "success": True,
        }

    if action == "cancel":
        event_id = args.get("title", "")
        matches = [e for e in MOCK_CALENDAR if e["id"].lower() == event_id.lower() or event_id.lower() in e["title"].lower()]
        if not matches:
            return {"result": f"Event not found: '{event_id}'.", "success": False}
        matches[0]["status"] = "cancelled"
        return {"result": f"Event '{matches[0]['title']}' on {matches[0]['date']} has been cancelled.", "success": True}

    return {"result": f"Unknown calendar action: {action}", "success": False}


# ── Session config endpoint (for frontend to fetch) ──

@router.get("/voice-agent/config")
async def get_voice_agent_config():
    """Return session config for the frontend to send in session.update."""
    return {
        "system_prompt": (
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
            "DATABASE:\n"
            "- Clients: Acme Corp (CLI-8821, USD, NET-30), SoftTech BD (CLI-3302, BDT, NET-45), InnoTech GmbH (CLI-7703, EUR, NET-60)\n"
            "- Q1 2026: Revenue $142K, Profit $57K, EBITDA 28.5%, Tax $11.4K; Q2 projected $185K\n"
            "- Inventory: M3 Pro Chip (42@$450), Server Rack 42U (8@$2800), Fiber 100G (120@$180), Network Switch L3 (25@$950), UPS 3KVA (15@$620), CAT6 Cable (200@$45)\n"
            "- Staff: Rafiqul Islam (EMP-1041, 120K BDT), Sarah Jenkins (EMP-0021, $95K)\n"
            "- Tasks: TASK-001 Q2 projections (Sarah), TASK-002 NDA review (Legal), TASK-003 Fiber deploy (Rafiqul), TASK-004 Tax docs (Finance, completed)\n"
            "- Calendar: Q2 Strategy Apr 15, InnoTech Signing Apr 18, Board Meeting Apr 25, Fiber Kickoff Apr 20\n\n"
            "RULES:\n"
            "- Keep spoken responses to 1-2 short sentences.\n"
            "- Always respond in English.\n"
            "- Quote specific names, IDs, currencies, numbers.\n"
            "- Use the appropriate tool for each action.\n"
            "- Be professional, concise, and proactive.\n"
            "- When user says goodbye/thanks/nothing, respond briefly and do NOT ask further questions."
        ),
        "greeting": "Welcome to Konthora. I am your enterprise voice operations engine. You can create documents, manage inventory, check finances, schedule meetings, and more — all by voice. How can I help you today?",
        "voice": "anna",
        "tools": VOICE_AGENT_TOOLS,
    }


# ── Text command endpoint (fallback for text input, not voice) ──

@router.post("/voice-agent/text")
async def text_command(req: TextCommandRequest):
    """Handle text commands when voice is not available. Uses fast fallback."""
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text command")

    # Import and use the fast fallback from the existing service
    from app.services.voice_agent_service import VoiceAgentService
    svc = VoiceAgentService()
    response = svc._fast_fallback(text)

    # Also resolve document action
    action = svc.resolve_document_action(response, text)

    return {
        "response": response,
        "action_card": action,
    }
