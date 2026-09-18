import os
import re
import httpx
from loguru import logger
from dotenv import load_dotenv

# Ensure .env is explicitly loaded
load_dotenv()
_backend_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
if os.path.exists(_backend_env_path):
    load_dotenv(_backend_env_path)


class VoiceAgentService:
    def __init__(self):
        self.system_prompt = (
            "You are Konthora's real-time AI Voice Assistant for content and media production. "
            "CRITICAL VOICE & MULTILINGUAL RULES FOR LOW-LATENCY TTS:\n"
            "1. BANGLA/MULTILINGUAL HANDLING: When the user speaks Bangla or asks for Bangla, reply in conversational Banglish (Bangla using Latin/English alphabet, e.g., 'Ji, ami Bangla bujhte pari! Ki vabe shahajjo korte pari?') so that the Kokoro speech synthesis engine can pronounce every word cleanly without audio distortion.\n"
            "2. CONCISE RESPONSES: Keep answers strictly to 1 to 3 short sentences maximum.\n"
            "3. Clear, direct, and conversational tone. Never repeat static template sentences."
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
            return "Ji, ami Bangla bujhte pari! Apnar video script ba content toiri te kivabe shahajjo korte pari?"
        
        return f"I am ready to help you write or produce content for '{clean_prompt}'. What outline should we use?"

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