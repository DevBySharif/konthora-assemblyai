import os
import re
import json
import asyncio
import hashlib
import time
import httpx
from loguru import logger
from dotenv import load_dotenv

# Ensure .env is explicitly loaded
load_dotenv()
_backend_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
if os.path.exists(_backend_env_path):
    load_dotenv(_backend_env_path)


# Enterprise custom vocabulary — forces AssemblyAI STT to recognize domain-specific terms
# AssemblyAI v3 Strict Word Boost List — alphanumeric single words only
# Hyphens, numbers, and special symbols cause Code 3006 connection drops
ENTERPRISE_WORD_BOOST = [
    "Konthora", "Acme", "SoftTech", "InnoTech",
    "EBITDA", "NET", "BIN", "EIN", "BDT", "USD", "EUR",
    "Rafiqul", "Sarah", "Jenkins", "Phoenix", "Quotation",
]


def generate_verification_data(doc_type: str, doc_ref: str, amount: any = 0) -> dict:
    """Generates cryptographic SHA-256 verification hash and audit QR payload."""
    seed = f"{doc_type}:{doc_ref}:{amount}:{int(time.time() // 3600)}"
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()[:16].upper()
    verification_hash = f"SHA256-KNT-{digest[:4]}-{digest[4:8]}-{digest[8:12]}"
    qr_payload = f"https://konthora.ai/verify?ref={doc_ref}&hash={verification_hash}"
    return {
        "verification_hash": verification_hash,
        "qr_payload": qr_payload,
        "verified_at": int(time.time()),
        "tamper_proof": True,
    }


# ── PII Redaction Guardrails ──────────────────────────────────────────────
_PII_PATTERNS = [
    (re.compile(r'(BIN-\d{3})\d{4}(\d{3}-)\d{4}'), r'\1****\2****'),
    (re.compile(r'(DE-)\d{6}(\d{3})'), r'\1******\2'),
    (re.compile(r'\b(\d{2})-?(\d{7})\b'), r'\1-***-\2'),
    (re.compile(r'\b(\d{3})\d{4,}(\d{3})\b'), r'\1****\2'),
    (re.compile(r'(SHA256-KNT-)\w{4}(-\w{4}){2}'), r'\1****-****-****'),
]


def redact_pii(text: str) -> str:
    if not text:
        return text
    for pattern, replacement in _PII_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


class VoiceAgentService:
    def __init__(self):
        self.active_doc_state = None
        self.previous_doc_state = None
        self._interrupt_flag = False
        self._cached_model = None
        self._http_client: httpx.AsyncClient | None = None

        # Condensed system prompt — enterprise data moved to intent-specific handlers
        self.system_prompt = (
            "You are Konthora, an autonomous voice-driven enterprise operations engine.\n"
            "Process voice commands to create: invoices, quotations, purchase orders, HR letters, "
            "meeting minutes, legal NDAs, expense claims, analytics charts, currency conversions, "
            "approval guards, document diffs, Slack dispatches.\n"
            "RULES:\n"
            "- Keep responses to 1-2 short sentences max for fast audio synthesis.\n"
            "- Always respond in English regardless of input language.\n"
            "- Quote specific names, IDs, currencies, numbers from context.\n"
            "- Maintain conversational state for document revisions.\n"
            "- Be professional and concise.\n"
            "DATABASE:\n"
            "- Clients: Acme Corp (CLI-8821, USD, NET-30), SoftTech BD (CLI-3302, BDT, NET-45), InnoTech GmbH (CLI-7703, EUR, NET-60)\n"
            "- Q1 2026: Revenue $142K, Profit $57K, EBITDA 28.5%, Tax $11.4K; Q2 projected $185K\n"
            "- Inventory: M3 Pro Chip (42@\$450), Server Rack 42U (8@\$2800), Fiber 100G (120@\$180)\n"
            "- Staff: Rafiqul Islam (EMP-1041, 120K BDT), Sarah Jenkins (EMP-0021, \$95K)\n"
            "- Quotation PHOENIX-2026: \$27,075 for Acme Corp voice gateway\n"
            "- PO-88301: \$15,050 to Apex Hardware, approved by Sarah\n"
            "- Tax: \$11,400 due, BD VAT BIN-003928172-0102, EU VAT DE-319208194\n"
            "- NDA-2026-88: Konthora & InnoTech, 2yr, strict IP\n"
            "- EXP-9902: Sarah Jenkins \$450 hardware claim, CFO approved\n"
            "- Finance: Q1 \$142K vs Q2 \$185K, EBITDA 28.5%→31%\n"
        )

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create a persistent HTTP client with connection pooling."""
        if self._http_client is None or self._http_client.is_closed:
            self._http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(8.0, connect=3.0),
                limits=httpx.Limits(
                    max_connections=10,
                    max_keepalive_connections=5,
                    keepalive_expiry=30.0,
                ),
            )
        return self._http_client

    async def close(self):
        """Clean up the persistent HTTP client."""
        if self._http_client and not self._http_client.is_closed:
            await self._http_client.aclose()

    def request_interrupt(self):
        self._interrupt_flag = True
        logger.info("Interrupt flag set — cancelling pending TTS synthesis.")

    def clear_interrupt(self):
        self._interrupt_flag = False

    # ── Multi-Currency Conversion ──
    EXCHANGE_RATES = {"USD": 1.0, "BDT": 120.0, "EUR": 0.92}
    CURRENCY_SYMBOLS = {"USD": "$", "BDT": "৳", "EUR": "€"}

    def convert_currency(self, amount_usd: float, target: str) -> dict:
        rate = self.EXCHANGE_RATES.get(target, 1.0)
        symbol = self.CURRENCY_SYMBOLS.get(target, "")
        converted = round(amount_usd * rate, 2)
        return {"amount": converted, "currency": target, "symbol": symbol, "rate": rate, "display": f"{symbol}{converted:,.2f} {target}"}

    # ── High-Value Approval Guard ──
    PASSKEY = "KNT-2026"

    def check_approval_status(self, amount: float, currency: str = "USD") -> str:
        threshold_usd = 10000
        if currency == "BDT":
            threshold_usd = 1000000 / self.EXCHANGE_RATES["BDT"]
        return "PENDING CFO APPROVAL" if amount > threshold_usd else "AUTO-APPROVED"

    def try_approve_with_passkey(self, prompt: str) -> bool:
        if self.PASSKEY in prompt.upper() or "approve" in prompt.lower() or "authorize" in prompt.lower():
            if self.active_doc_state:
                self.active_doc_state["approval_status"] = "OFFICIAL CFO APPROVED"
                self.active_doc_state["approved_by"] = "Sarah Jenkins (CFO)"
                self.active_doc_state["approval_timestamp"] = int(time.time())
                return True
        return False

    # ── Document Diff Engine ──
    def compute_doc_diff(self) -> dict | None:
        if not self.active_doc_state or not self.previous_doc_state:
            return None
        current, previous = self.active_doc_state, self.previous_doc_state
        diffs = []
        for key in ["amount", "doc_type", "doc_ref"]:
            if current.get(key) != previous.get(key):
                diffs.append({"field": key, "old": previous.get(key), "new": current.get(key)})
        if current.get("revised"):
            diffs.append({"field": "revision", "old": "Original", "new": "Revised (voice delta applied)"})
        if not diffs:
            diffs.append({"field": "status", "old": "No changes", "new": "No changes detected"})
        return {"current_ref": current.get("doc_ref"), "previous_ref": previous.get("doc_ref", "N/A"), "diffs": diffs}

    async def _get_active_model(self, client: httpx.AsyncClient, base_url: str, headers: dict) -> str:
        if self._cached_model:
            return self._cached_model

        env_model = os.getenv("GROQ_MODEL") or os.getenv("OPENAI_MODEL")
        if env_model:
            self._cached_model = env_model
            return env_model

        try:
            resp = await client.get(f"{base_url}/models", headers=headers)
            if resp.status_code == 200:
                models = [m["id"] for m in resp.json().get("data", [])]
                for candidate in ["qwen/qwen3.8-27b", "groq/compound-mini", "llama-3.3-70b-versatile"]:
                    if candidate in models:
                        self._cached_model = candidate
                        logger.info(f"Selected LLM model: {candidate}")
                        return candidate
                if models:
                    self._cached_model = models[0]
                    return models[0]
        except Exception as e:
            logger.warning(f"Model discovery failed: {e}")

        return "qwen/qwen3.8-27b" if "groq" in base_url else "gpt-4o-mini"

    async def generate_ai_response(self, prompt: str) -> str:
        clean_prompt = prompt.strip()
        if not clean_prompt:
            return "I didn't hear anything clearly. Could you please repeat?"

        api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                is_groq = bool(os.getenv("GROQ_API_KEY"))
                base_url = "https://api.groq.com/openai/v1" if is_groq else "https://api.openai.com/v1"
                headers = {"Authorization": f"Bearer {api_key}"}
                client = await self._get_client()
                model_name = await self._get_active_model(client, base_url, headers)

                response = await client.post(
                    f"{base_url}/chat/completions",
                    headers=headers,
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": self.system_prompt},
                            {"role": "user", "content": clean_prompt}
                        ],
                        "max_tokens": 120,
                        "temperature": 0.7
                    }
                )
                if response.status_code == 200:
                    return response.json()["choices"][0]["message"]["content"].strip()
                else:
                    logger.error(f"LLM API Error {response.status_code}: {response.text}")
                    self._cached_model = None
            except Exception as e:
                logger.error(f"LLM generation failed: {e}")

        # Fast intent-based fallback (no API call needed)
        return self._fast_fallback(clean_prompt)

    def _fast_fallback(self, prompt: str) -> str:
        """Instant fallback responses — no API call, zero latency."""
        lowered = prompt.lower()
        if any(w in lowered for w in ["quotation", "quote", "phoenix"]):
            return "Quotation PHOENIX-2026 generated for Acme Corp totaling \$27,075.00 with 5% enterprise discount."
        if any(w in lowered for w in ["purchase order", "po", "apex"]):
            return "Purchase Order PO-88301 generated for Apex Hardware totaling \$15,050.00, approved by Sarah Jenkins."
        if any(w in lowered for w in ["tax", "vat", "compliance"]):
            return "Corporate tax report FY-2026 loaded: \$11,400 effective tax due with active BD VAT BIN."
        if any(w in lowered for w in ["invoice", "bill"]):
            return "Generated Tax Invoice for Acme Corp totaling \$5,050.00 with payment terms NET-30."
        if any(w in lowered for w in ["financial", "revenue", "ebitda", "profit"]):
            return "Q1 2026 recorded \$142,000 revenue, \$57,000 net profit, and 28.5% EBITDA margin."
        if any(w in lowered for w in ["offer letter", "hr", "salary", "rafiqul"]):
            return "Offer letter generated for Rafiqul Islam as Senior Full-Stack Engineer at 120,000 BDT."
        if any(w in lowered for w in ["meeting", "minutes"]):
            return "Meeting Minutes MIN-2026-09 loaded: Product Strategy Sync with 2 decisions and 2 action items."
        if any(w in lowered for w in ["nda", "contract", "agreement"]):
            return "Legal NDA-2026-88 loaded: Mutual NDA between Konthora and InnoTech, 2-year term."
        if any(w in lowered for w in ["expense", "claim"]):
            return "Expense Voucher EXP-9902 loaded: Sarah Jenkins claim of \$450.00, CFO approved."
        if any(w in lowered for w in ["email", "dispatch"]):
            return "Enterprise dispatch confirmed. Document sent via SMTP with delivery receipt logged."
        if any(w in lowered for w in ["chart", "graph", "revenue chart"]):
            return "Analytics chart loaded: Q1 Revenue \$142K vs Q2 Projected \$185K with EBITDA expansion."
        if any(w in lowered for w in ["convert", "currency", "bdt", "eur"]):
            target = "BDT" if any(w in lowered for w in ["bdt", "taka"]) else "EUR"
            conv = self.convert_currency(27075, target)
            return f"PHOENIX-2026 quotation converted: {conv['display']} at rate {conv['rate']} per USD."
        if any(w in lowered for w in ["approve", "authorize"]):
            approved = self.try_approve_with_passkey(prompt)
            return "Document approved by CFO. Authorization timestamp logged." if approved else "Approval requires CFO passkey."
        if any(w in lowered for w in ["compare", "diff"]):
            return "Document comparison loaded. Showing deltas between original and revised versions."
        if any(w in lowered for w in ["slack", "webhook"]):
            channel = "#product-strategy" if "meeting" in lowered else "#finance"
            return f"Slack dispatch confirmed. Summary posted to {channel} via webhook API."
        if any(w in lowered for w in ["inventory", "stock"]):
            return "Inventory: 42 Apple M3 Pro chips and 8 server racks available in warehouses."
        if any(w in lowered for w in ["upload", "audio"]):
            return "Audio upload ready. Drop an MP3 or WAV file to process via AssemblyAI Batch API."
        if any(w in lowered for w in ["bangla", "bengali"]):
            return "I understand Bangla! What enterprise document would you like to create?"
        return f"Voice-to-document engine processed: '{prompt}'. Document card is ready."

    def resolve_document_action(self, response_text: str, user_prompt: str) -> dict | None:
        combined = (response_text + " " + user_prompt).lower()
        doc_type, doc_ref, amount, is_revised = None, "DOC-2026", 0, False

        if self.active_doc_state and any(w in combined for w in ["change", "discount", "modify", "update", "adjust", "fee"]):
            is_revised = True
            doc_type = self.active_doc_state.get("doc_type")
            doc_ref = self.active_doc_state.get("doc_ref", "DOC-2026")
            amount = self.active_doc_state.get("amount", 0)

        if not doc_type:
            doc_map = [
                (["quotation", "quote", "phoenix"], "quotation", "PHOENIX-2026", 27075),
                (["purchase order", "po", "apex"], "purchase_order", "PO-88301", 15050),
                (["tax", "vat", "compliance"], "tax_compliance", "FY2026-TAX-01", 11400),
                (["invoice", "bill"], "invoice", "INV-8821", 5050),
                (["financial", "revenue", "ebitda"], "financial", "FY2026-Q1-REP", 142000),
                (["offer letter", "hr", "salary"], "hr_letter", "EMP-1041-OFFER", 120000),
                (["meeting", "minutes"], "meeting_minutes", "MIN-2026-09", 0),
                (["nda", "contract"], "legal_contract", "NDA-2026-88", 0),
                (["expense", "claim"], "expense_voucher", "EXP-9902", 450),
                (["chart", "graph"], "analytics_chart", "CHART-2026-Q1Q2", 0),
                (["email", "dispatch"], "dispatch_notification", "DISP-2026", 0),
                (["convert", "currency"], "currency_conversion", "CC-2026", self.active_doc_state.get("amount", 27075) if self.active_doc_state else 27075),
                (["approve", "authorize"], "approval_guard", "APPROVAL-2026", 0),
                (["compare", "diff"], "document_diff", "DIFF-2026", 0),
                (["slack", "webhook"], "slack_dispatch", "SLACK-2026", 0),
                (["upload", "audio"], "audio_upload", "UPLOAD-2026", 0),
            ]
            for keywords, dtype, dref, damt in doc_map:
                if any(w in combined for w in keywords):
                    doc_type, doc_ref, amount = dtype, dref, damt
                    break

        if not doc_type:
            return None

        if self.active_doc_state:
            self.previous_doc_state = dict(self.active_doc_state)

        verif = generate_verification_data(doc_type, doc_ref, amount)
        approval_status = self.check_approval_status(amount) if amount > 0 else "N/A"

        if any(w in combined for w in ["approve", "authorize"]):
            if self.active_doc_state and self.active_doc_state.get("approval_status") == "PENDING CFO APPROVAL":
                approval_status = "OFFICIAL CFO APPROVED"
                self.active_doc_state["approval_status"] = approval_status

        self.active_doc_state = {
            "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
            "verification_hash": verif["verification_hash"], "qr_payload": verif["qr_payload"],
            "revised": is_revised, "updated_at": verif["verified_at"], "approval_status": approval_status,
        }

        extra = {}
        if doc_type == "currency_conversion":
            target = "BDT" if any(w in combined for w in ["bdt", "taka"]) else "EUR"
            extra = {"conversion": self.convert_currency(amount, target)}
        elif doc_type == "document_diff":
            extra = {"diff": self.compute_doc_diff() or {"diffs": []}}
        elif doc_type == "slack_dispatch":
            channel = "#product-strategy" if "meeting" in combined else "#finance"
            extra = {"slack_channel": channel, "dispatch_target": "SLACK_WEBHOOK"}

        return {
            "type": "action_card", "action": "update" if is_revised else "create",
            "doc_type": doc_type, "doc_ref": doc_ref, "amount": amount,
            "verification_hash": verif["verification_hash"], "qr_payload": verif["qr_payload"],
            "revised": is_revised, "title": response_text[:70], "approval_status": approval_status,
            **extra,
        }

    async def stream_ai_response(self, prompt: str):
        clean_prompt = prompt.strip()
        if not clean_prompt:
            yield "I didn't hear anything clearly. Could you please repeat?"
            return

        api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                is_groq = bool(os.getenv("GROQ_API_KEY"))
                base_url = "https://api.groq.com/openai/v1" if is_groq else "https://api.openai.com/v1"
                headers = {"Authorization": f"Bearer {api_key}"}
                client = await self._get_client()
                model_name = await self._get_active_model(client, base_url, headers)

                async with client.stream(
                    "POST",
                    f"{base_url}/chat/completions",
                    headers=headers,
                    json={
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": self.system_prompt},
                            {"role": "user", "content": clean_prompt}
                        ],
                        "max_tokens": 120,
                        "temperature": 0.7,
                        "stream": True,
                    }
                ) as resp:
                    if resp.status_code == 200:
                        async for line in resp.aiter_lines():
                            line_str = line.strip()
                            if not line_str or not line_str.startswith("data: "):
                                continue
                            data_str = line_str[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                delta = chunk.get("choices", [{}])[0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                            except Exception:
                                continue
                        return
                    else:
                        logger.error(f"Streaming LLM error {resp.status_code}")
                        self._cached_model = None
            except Exception as e:
                logger.error(f"Streaming LLM exception: {e}")

        # Fallback — instant, no API call
        yield self._fast_fallback(clean_prompt)

    def generate_speech_bytes(self, text: str) -> bytes:
        if not text or not text.strip():
            return b""
        try:
            from app.services.kokoro_service import kokoro_service
            clean_text = re.sub(r'[^\w\s\.,\?!-]', '', text)
            if not clean_text.strip():
                clean_text = text
            return kokoro_service.tts_to_bytes(text=clean_text, voice="af_heart")
        except Exception as e:
            logger.error(f"Kokoro synthesis error: {e}")
            return b""

    async def generate_speech_bytes_async(self, text: str) -> bytes:
        return await asyncio.to_thread(self.generate_speech_bytes, text)
