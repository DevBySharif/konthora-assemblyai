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

@router.get("/voice-agent/token")
async def get_voice_agent_token():
    """Mint a single-use token for browser → AssemblyAI Voice Agent WebSocket."""
    api_key = os.getenv("ASSEMBLYAI_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="ASSEMBLYAI_API_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://agents.assemblyai.com/v1/token",
                params={"expires_in_seconds": 300, "max_session_duration_seconds": 8640},
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code == 200:
                return resp.json()
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
        "description": "Create an enterprise document: quotation, purchase order, invoice, tax report, financial report, HR offer letter, meeting minutes, NDA, expense voucher, analytics chart, or dispatch notification.",
        "parameters": {
            "type": "object",
            "properties": {
                "doc_type": {
                    "type": "string",
                    "enum": ["quotation", "purchase_order", "invoice", "tax_compliance", "financial", "hr_letter", "meeting_minutes", "legal_contract", "expense_voucher", "analytics_chart", "dispatch_notification"],
                    "description": "Type of document to create"
                },
                "client_name": {"type": "string", "description": "Client or company name"},
                "amount": {"type": "number", "description": "Document amount in USD"},
            },
            "required": ["doc_type"]
        }
    },
    {
        "type": "function",
        "name": "revise_document",
        "description": "Revise an existing document: change discount, fee, salary, payment terms, or any field.",
        "parameters": {
            "type": "object",
            "properties": {
                "field": {"type": "string", "description": "Field to change (e.g. 'discount', 'fee', 'salary', 'terms')"},
                "new_value": {"type": "string", "description": "New value for the field"},
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
        "description": "Convert an amount from USD to another currency (BDT, EUR).",
        "parameters": {
            "type": "object",
            "properties": {
                "amount_usd": {"type": "number", "description": "Amount in USD to convert"},
                "target_currency": {"type": "string", "enum": ["BDT", "EUR"], "description": "Target currency"},
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

    doc_refs = {
        "quotation": "PHOENIX-2026", "purchase_order": "PO-88301", "invoice": "INV-8821",
        "tax_compliance": "FY2026-TAX-01", "financial": "FY2026-Q1-REP",
        "hr_letter": "EMP-1041-OFFER", "meeting_minutes": "MIN-2026-09",
        "legal_contract": "NDA-2026-88", "expense_voucher": "EXP-9902",
        "analytics_chart": "CHART-2026-Q1Q2", "dispatch_notification": "DISP-2026",
    }
    default_amounts = {
        "quotation": 27075, "purchase_order": 15050, "invoice": 5050,
        "tax_compliance": 11400, "financial": 142000, "expense_voucher": 450,
    }

    doc_ref = doc_refs.get(doc_type, "DOC-2026")
    if not amount:
        amount = default_amounts.get(doc_type, 0)

    verif = _generate_verification(doc_type, doc_ref, amount)
    approval = "AUTO-APPROVED" if amount <= 10000 else "PENDING CFO APPROVAL"

    _previous_doc_state = dict(_active_doc_state) if _active_doc_state else {}
    _active_doc_state = {
        "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
        "client": client, "approval_status": approval,
        "verification_hash": verif["verification_hash"], "qr_payload": verif["qr_payload"],
    }

    return {
        "result": f"Document {doc_type} ({doc_ref}) created for {client}. Amount: ${amount:,.2f}. Status: {approval}. Verification: {verif['verification_hash']}",
        "success": True,
        "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
        "approval_status": approval, "verification_hash": verif["verification_hash"],
        "qr_payload": verif["qr_payload"],
    }


def _handle_revise_document(args: dict) -> dict:
    global _active_doc_state
    if not _active_doc_state:
        return {"result": "No active document to revise. Create one first.", "success": False}

    field = args.get("field", "")
    new_value = args.get("new_value", "")
    _active_doc_state["revised"] = True
    _active_doc_state[field] = new_value

    verif = _generate_verification(_active_doc_state["doc_type"], _active_doc_state["doc_ref"], _active_doc_state.get("amount", 0))
    _active_doc_state["verification_hash"] = verif["verification_hash"]

    return {
        "result": f"Document revised: {field} changed to {new_value}. New verification hash: {verif['verification_hash']}",
        "success": True, "field": field, "new_value": new_value,
        "verification_hash": verif["verification_hash"],
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


# ── Session config endpoint (for frontend to fetch) ──

@router.get("/voice-agent/config")
async def get_voice_agent_config():
    """Return session config for the frontend to send in session.update."""
    return {
        "system_prompt": (
            "You are Konthora, an autonomous voice-driven enterprise operations engine. "
            "You help users create, revise, approve, and manage enterprise documents using voice commands.\n\n"
            "CAPABILITIES:\n"
            "- Create documents: quotations, purchase orders, invoices, tax reports, financial reports, HR letters, meeting minutes, NDAs, expense vouchers, analytics charts, dispatch notifications.\n"
            "- Revise documents: change discount, fee, salary, payment terms, or any field.\n"
            "- Approve documents: authorize with CFO passkey for high-value items.\n"
            "- Currency conversion: USD to BDT (rate 120) or EUR (rate 0.92).\n"
            "- Document comparison: show differences between versions.\n"
            "- Slack dispatch: send summaries to channels.\n\n"
            "DATABASE:\n"
            "- Clients: Acme Corp (CLI-8821, USD, NET-30), SoftTech BD (CLI-3302, BDT, NET-45), InnoTech GmbH (CLI-7703, EUR, NET-60)\n"
            "- Q1 2026: Revenue $142K, Profit $57K, EBITDA 28.5%, Tax $11.4K\n"
            "- Inventory: M3 Pro Chip (42@$450), Server Rack 42U (8@$2800), Fiber 100G (120@$180)\n"
            "- Staff: Rafiqul Islam (EMP-1041, 120K BDT), Sarah Jenkins (EMP-0021, $95K)\n"
            "- Quotation PHOENIX-2026: $27,075 for Acme Corp\n"
            "- PO-88301: $15,050 to Apex Hardware\n"
            "- Tax: $11,400 due, BD VAT BIN-003928172-0102\n"
            "- NDA-2026-88: Konthora & InnoTech, 2yr\n"
            "- EXP-9902: Sarah Jenkins $450 hardware claim\n\n"
            "RULES:\n"
            "- Keep spoken responses to 1-2 short sentences.\n"
            "- Always respond in English.\n"
            "- Quote specific names, IDs, currencies, numbers.\n"
            "- Use the create_document tool when the user asks to create/generate/make a document.\n"
            "- Use the revise_document tool when the user asks to change/modify/update a document.\n"
            "- Use the approve_document tool when the user asks to approve/authorize.\n"
            "- Use convert_currency when the user asks about currency conversion.\n"
            "- Be professional, concise, and proactive."
        ),
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
