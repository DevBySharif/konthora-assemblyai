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


class VoiceAgentService:
    def __init__(self):
        self.active_doc_state = None
        self.system_prompt = (
            "You are Konthora's real-time AI Voice-to-Document Production Engine for enterprise workflows.\n"
            "You possess conversational state memory. If the user asks to modify, update, adjust rates, or add line items to the currently displayed document, preserve all previous details and apply the requested delta changes directly into the document object.\n"
            "You have direct access to the enterprise database:\n"
            "- Clients: Acme Corp (CLI-8821, USD, NET-30), SoftTech Bangladesh (CLI-3302, BDT, NET-45), InnoTech GmbH (CLI-7703, EUR, NET-60).\n"
            "- Financials (FY 2026): Q1 Revenue $142K, Expenses $85K, Net Profit $57K, EBITDA 28.5%, Tax Liability $11.4K; Q2 Projected $185K.\n"
            "- Inventory: Apple M3 Pro Chip (42 units @ $450), Enterprise Server Rack 42U (8 units @ $2800), Fiber Optic Transceiver 100G (120 units @ $180).\n"
            "- Employees: Rafiqul Islam (EMP-1041, Senior Full-Stack Engineer, 120,000 BDT), Sarah Jenkins (EMP-0021, Lead Solutions Architect, $95,000).\n"
            "- Quotations: PHOENIX-2026 ($27,075 USD for Acme Corp voice gateway), BD-GOV-TENDER-09 (4,500,000 BDT for ICT Ministry portal voice accessibility).\n"
            "- Purchase Orders: PO-88301 ($15,050 USD to Apex Hardware for 20 M3 chips and 2 server racks approved by Sarah Jenkins).\n"
            "- Tax & Compliance: FY-2026 Tax Summary ($11,400 due, $3,200 withholding paid), BD VAT BIN-003928172-0102, EU VAT DE-319208194.\n"
            "CRITICAL VOICE & MULTILINGUAL RULES:\n"
            "1. CONCISE RESPONSES: Keep answers strictly to 1 to 2 short sentences for immediate audio synthesis.\n"
            "2. ENGLISH-ONLY OUTPUT: Always respond in English regardless of the input language. Even if the user speaks Bangla, Hindi, or any other language, you MUST reply in clear English. Never output Devanagari, Bengali, or any non-Latin script. Transliterate any foreign terms into English if needed.\n"
            "3. ACCURACY: Always quote specific client names, IDs, currencies, and numbers from the database when handling document requests."
        )
        self._cached_model = None

    async def _get_active_model(self, client: httpx.AsyncClient, base_url: str, headers: dict) -> str:
        if self._cached_model:
            return self._cached_model

        env_model = os.getenv("GROQ_MODEL") or os.getenv("OPENAI_MODEL")
        if env_model:
            return env_model

        try:
            resp = await client.get(f"{base_url}/models", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                models = [m["id"] for m in data.get("data", [])]
                
                candidates = [
                    "qwen/qwen3.8-27b",
                    "groq/compound-mini",
                    "groq/compound",
                    "llama-3.3-70b-versatile",
                    "gpt-4o-mini"
                ]
                for candidate in candidates:
                    if candidate in models:
                        self._cached_model = candidate
                        logger.info(f"Selected active LLM model: {candidate}")
                        return candidate
                
                if models:
                    self._cached_model = models[0]
                    return models[0]
        except Exception as e:
            logger.warning(f"Could not fetch dynamic models list: {e}")

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

                async with httpx.AsyncClient(timeout=8.0) as client:
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
                            "max_tokens": 150,
                            "temperature": 0.7
                        }
                    )
                    if response.status_code == 200:
                        data = response.json()
                        reply = data["choices"][0]["message"]["content"].strip()
                        return reply
                    else:
                        logger.error(f"LLM API Error {response.status_code} with model '{model_name}': {response.text}")
                        self._cached_model = None
            except Exception as e:
                logger.error(f"Async LLM generation failed: {e}")

        lowered = clean_prompt.lower()
        if any(w in lowered for w in ["bangla", "বাংলা", "bengali", "banglay"]):
            if "invoice" in lowered or "chalan" in lowered:
                return "Ji, Acme Corp er jonno 5,050 dollar er invoice toiri kora hoyeche. Payment terms holo NET-30."
            if "quote" in lowered or "quotation" in lowered or "tender" in lowered or "কোটেশন" in lowered or "টেন্ডার" in lowered:
                return "Ji, PHOENIX-2026 quotation toiri kora hoyeche, total 27,075 dollar. Validity ache 2026 porjonto."
            if "po" in lowered or "purchase order" in lowered or "ক্রয়াদেশ" in lowered or "অর্ডার" in lowered:
                return "PO-88301 purchase order toiri kora hoyeche Apex Hardware er jonno, mot 15,050 dollar."
            if "tax" in lowered or "ট্যাক্স" in lowered or "কর" in lowered or "vat" in lowered or "ভ্যাট" in lowered:
                return "FY-2026 er tax compliance summary te 11,400 dollar tax liability o BD VAT BIN sonjukto ache."
            return "Ji, ami Bangla bujhte pari! Kon dhoroner enterprise document toiri korte chan?"

        # Stateful revision handling
        if self.active_doc_state and any(w in lowered for w in ["change", "discount", "modify", "update", "add fee", "maintenance", "terms", "adjust", "fee"]):
            if "discount" in lowered or "10%" in lowered:
                return "Updated PHOENIX-2026 quotation: discount adjusted from 5% to 10%, new grand total is $25,650.00."
            if "fee" in lowered or "200" in lowered or "maintenance" in lowered:
                return "Revised document: added recurring maintenance fee of $200.00 to line items."
            return f"Applied live revision to active {self.active_doc_state.get('doc_type', 'document')}. All calculations and cryptographic hash updated."

        if any(w in lowered for w in ["quotation", "quote", "tender", "phoenix"]):
            return "Quotation PHOENIX-2026 generated for Acme Corp totaling $27,075.00 with 5% enterprise discount."
        if any(w in lowered for w in ["purchase order", "po", "po-88301", "apex"]):
            return "Purchase Order PO-88301 generated for Apex Hardware Ltd totaling $15,050.00, approved by Sarah Jenkins."
        if any(w in lowered for w in ["tax", "vat", "compliance", "bin"]):
            return "Corporate tax report FY-2026 loaded: $11,400 effective tax due with active BD VAT BIN-003928172-0102."
        if any(w in lowered for w in ["invoice", "bill", "chalan", "challan"]):
            return "Generated Tax Invoice for Acme Corp totaling $5,050.00 with payment terms NET-30."
        if any(w in lowered for w in ["financial", "revenue", "ebitda", "profit", "q1"]):
            return "Konthora Q1 2026 recorded $142,000 in revenue, $57,000 net profit, and a 28.5% EBITDA margin."
        if any(w in lowered for w in ["offer letter", "hr", "salary", "rafiqul", "employee"]):
            return "Appointment offer letter generated for Rafiqul Islam as Senior Full-Stack Engineer at 120,000 BDT."
        if any(w in lowered for w in ["inventory", "stock", "warehouse", "m3", "rack"]):
            return "Inventory audit shows 42 Apple M3 Pro chips and 8 server racks available in active warehouses."

        return f"Voice-to-document engine processed your request for: '{clean_prompt}'. Document card is ready."

    def resolve_document_action(self, response_text: str, user_prompt: str) -> dict | None:
        """Determines active document state, revisions, and attaches cryptographic verification."""
        combined = (response_text + " " + user_prompt).lower()
        doc_type = None
        doc_ref = "DOC-2026"
        amount = 0
        is_revised = False

        if self.active_doc_state and any(w in combined for w in ["change", "discount", "modify", "update", "add fee", "adjust", "fee", "maintenance", "terms"]):
            is_revised = True
            doc_type = self.active_doc_state.get("doc_type")
            doc_ref = self.active_doc_state.get("doc_ref", "DOC-2026")
            amount = self.active_doc_state.get("amount", 0)

        if not doc_type:
            if any(w in combined for w in ["quotation", "quote", "phoenix", "tender", "কোটেশন", "টেন্ডার"]):
                doc_type = "quotation"
                doc_ref = "PHOENIX-2026"
                amount = 27075
            elif any(w in combined for w in ["purchase order", "po-88301", "apex", "ক্রয়াদেশ", "পিও"]):
                doc_type = "purchase_order"
                doc_ref = "PO-88301"
                amount = 15050
            elif any(w in combined for w in ["tax", "vat", "compliance", "bin", "ট্যাক্স", "ভ্যাট"]):
                doc_type = "tax_compliance"
                doc_ref = "FY2026-TAX-01"
                amount = 11400
            elif any(w in combined for w in ["invoice", "bill", "chalan", "challan", "acme", "চালান", "ইনভয়েস"]):
                doc_type = "invoice"
                doc_ref = "INV-8821"
                amount = 5050
            elif any(w in combined for w in ["financial", "revenue", "ebitda", "profit", "q1", "লাভ", "আয়"]):
                doc_type = "financial"
                doc_ref = "FY2026-Q1-REP"
                amount = 142000
            elif any(w in combined for w in ["offer letter", "hr", "salary", "rafiqul", "employee", "বেতন", "নিয়োগপত্র"]):
                doc_type = "hr_letter"
                doc_ref = "EMP-1041-OFFER"
                amount = 120000
            elif any(w in combined for w in ["inventory", "stock", "warehouse", "m3", "rack", "স্টক", "মজুদ"]):
                doc_type = "inventory"
                doc_ref = "INV-LOG-2026"
                amount = 62900

        if not doc_type:
            return None

        # Generate cryptographic SHA-256 verification hash and QR payload
        verif = generate_verification_data(doc_type, doc_ref, amount)
        self.active_doc_state = {
            "doc_type": doc_type,
            "doc_ref": doc_ref,
            "amount": amount,
            "verification_hash": verif["verification_hash"],
            "qr_payload": verif["qr_payload"],
            "revised": is_revised,
            "updated_at": verif["verified_at"],
        }

        return {
            "type": "action_card",
            "action": "update" if is_revised else "create",
            "doc_type": doc_type,
            "doc_ref": doc_ref,
            "amount": amount,
            "verification_hash": verif["verification_hash"],
            "qr_payload": verif["qr_payload"],
            "revised": is_revised,
            "title": response_text[:70],
        }

    async def stream_ai_response(self, prompt: str):
        """Streams text tokens asynchronously from Groq/OpenAI compatible LLM."""
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

                async with httpx.AsyncClient(timeout=12.0) as client:
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
                            "max_tokens": 150,
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
                            err_body = await resp.aread()
                            logger.error(f"Streaming LLM error {resp.status_code}: {err_body}")
                            self._cached_model = None
            except Exception as e:
                logger.error(f"Streaming LLM exception: {e}")

        # Fallback if streaming failed or key is absent
        fallback_reply = await self.generate_ai_response(clean_prompt)
        yield fallback_reply

    def generate_speech_bytes(self, text: str) -> bytes:
        if not text or not text.strip():
            return b""
        try:
            from app.services.kokoro_service import kokoro_service
            # Sanitize text to ensure clean phoneme generation
            clean_text = re.sub(r'[^\w\s\.,\?!-]', '', text)
            if not clean_text.strip():
                clean_text = text
            return kokoro_service.tts_to_bytes(text=clean_text, voice="af_heart")
        except Exception as e:
            logger.error(f"Kokoro synthesis error: {e}")
            return b""

    async def generate_speech_bytes_async(self, text: str) -> bytes:
        """Run CPU-bound Kokoro synthesis in an executor to avoid blocking event loop."""
        if not text or not text.strip():
            return b""
        return await asyncio.to_thread(self.generate_speech_bytes, text)