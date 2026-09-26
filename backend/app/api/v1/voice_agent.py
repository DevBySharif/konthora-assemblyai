import os
import re
import json
import asyncio
import contextlib
from dotenv import load_dotenv
import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
from loguru import logger
from app.services.voice_agent_service import VoiceAgentService, ENTERPRISE_WORD_BOOST, redact_pii

# Ensure .env is explicitly loaded
load_dotenv()
_backend_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
if os.path.exists(_backend_env_path):
    load_dotenv(_backend_env_path)

router = APIRouter()
agent_service = VoiceAgentService()

# AssemblyAI Streaming v3 — word_boost passed as URL query param to avoid Code 3006
def _build_assemblyai_ws_url() -> str:
    import urllib.parse
    sanitized_boost = [re.sub(r'[^a-zA-Z0-9]', '', word) for word in ENTERPRISE_WORD_BOOST if word.strip()]
    sanitized_boost = [w for w in sanitized_boost if len(w) > 1]
    query_params = {"sample_rate": "16000", "language_code": "en"}
    if sanitized_boost:
        query_params["word_boost"] = json.dumps(sanitized_boost)
    return f"wss://streaming.assemblyai.com/v3/ws?{urllib.parse.urlencode(query_params)}"

ASSEMBLYAI_V3_WS_URL = _build_assemblyai_ws_url()

# Punctuation regex for clause splitting
CLAUSE_PATTERN = re.compile(r'([^.!?,\n;]+[.!?,\n;]+)')


async def process_llm_and_tts_stream(websocket: WebSocket, prompt: str):
    """Streams tokens from LLM, sends text immediately, synthesizes audio in background."""
    full_text = ""
    agent_service.clear_interrupt()

    # ── Phase 1: Stream text tokens ASAP (no TTS blocking) ──
    async for token in agent_service.stream_ai_response(prompt):
        if websocket.client_state != WebSocketState.CONNECTED:
            return
        if agent_service._interrupt_flag:
            break
        full_text += token
        with contextlib.suppress(Exception):
            await websocket.send_json({"type": "text_delta", "content": token})

    # ── Phase 2: Synthesize audio for complete response (background) ──
    if not agent_service._interrupt_flag and full_text.strip():
        # Split into clauses and synthesize audio
        clauses = CLAUSE_PATTERN.findall(full_text)
        if not clauses:
            clauses = [full_text.strip()]

        for clause in clauses:
            clause = clause.strip()
            if not clause or len(clause) < 2:
                continue
            if agent_service._interrupt_flag:
                break
            audio_bytes = await agent_service.generate_speech_bytes_async(clause)
            if audio_bytes and websocket.client_state == WebSocketState.CONNECTED:
                with contextlib.suppress(Exception):
                    await websocket.send_bytes(audio_bytes)

    # ── Phase 3: Emit final text + action card ──
    if websocket.client_state == WebSocketState.CONNECTED and not agent_service._interrupt_flag:
        with contextlib.suppress(Exception):
            await websocket.send_json({"type": "text_response", "text": full_text.strip(), "role": "assistant"})

        action_card = agent_service.resolve_document_action(full_text.strip(), prompt)
        if action_card and websocket.client_state == WebSocketState.CONNECTED:
            with contextlib.suppress(Exception):
                await websocket.send_json(action_card)

    agent_service.clear_interrupt()


@router.websocket("/ws/voice-agent")
async def voice_agent_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("Voice Agent browser WebSocket client connected.")

    api_key = os.getenv("ASSEMBLYAI_API_KEY", "").strip()

    if not api_key:
        logger.warning("ASSEMBLYAI_API_KEY not set. Running in text fallback mode.")
        try:
            while websocket.client_state == WebSocketState.CONNECTED:
                data = await websocket.receive()
                if "text" in data and data["text"]:
                    text_msg = data["text"]
                    try:
                        parsed = json.loads(text_msg)
                        if parsed.get("type") == "user_interrupt":
                            agent_service.request_interrupt()
                            if websocket.client_state == WebSocketState.CONNECTED:
                                await websocket.send_json({"type": "interrupt_ack"})
                            continue
                    except (json.JSONDecodeError, AttributeError):
                        pass
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({"type": "transcript", "text": redact_pii(text_msg), "role": "user", "final": True})
                    await process_llm_and_tts_stream(websocket, text_msg)
                elif "bytes" in data and data["bytes"]:
                    pass
        except (WebSocketDisconnect, RuntimeError):
            logger.info("Voice Agent fallback client disconnected cleanly.")
        except Exception as e:
            logger.error(f"Fallback loop closed: {e}")
        return

    headers = {"Authorization": api_key}

    try:
        ws_kwargs = {}
        ws_version = getattr(websockets, "__version__", "10.0")
        major_v = int(ws_version.split(".")[0]) if ws_version.split(".")[0].isdigit() else 10
        if major_v >= 14:
            ws_kwargs["additional_headers"] = headers
        else:
            ws_kwargs["extra_headers"] = headers

        async with websockets.connect(ASSEMBLYAI_V3_WS_URL, **ws_kwargs) as aai_ws:
            logger.info("Connected to AssemblyAI Streaming v3 WebSocket API.")

            # Send silent PCM frame to prevent keep-alive timeout
            try:
                await aai_ws.send(b'\x00' * 320)
            except Exception:
                pass

            async def receive_from_browser():
                try:
                    while websocket.client_state == WebSocketState.CONNECTED:
                        message = await websocket.receive()
                        if "bytes" in message and message["bytes"]:
                            raw_bytes = message["bytes"]
                            if len(raw_bytes) > 0:
                                await aai_ws.send(raw_bytes)
                        elif "text" in message and message["text"]:
                            text_data = message["text"]
                            try:
                                parsed = json.loads(text_data)
                                if parsed.get("type") == "user_interrupt":
                                    agent_service.request_interrupt()
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({"type": "interrupt_ack"})
                                    continue
                            except (json.JSONDecodeError, AttributeError):
                                pass
                            if websocket.client_state == WebSocketState.CONNECTED:
                                await websocket.send_json({"type": "transcript", "text": redact_pii(text_data), "role": "user", "final": True})
                            await process_llm_and_tts_stream(websocket, text_data)
                except (WebSocketDisconnect, RuntimeError):
                    logger.info("Browser client disconnected cleanly.")
                except Exception as e:
                    logger.debug(f"receive_from_browser loop ended: {e}")

            async def receive_from_assemblyai():
                try:
                    async for raw_msg in aai_ws:
                        if websocket.client_state != WebSocketState.CONNECTED:
                            break
                        msg = json.loads(raw_msg)
                        event_type = msg.get("type")

                        if event_type == "Begin":
                            logger.info(f"AssemblyAI v3 session active. ID: {msg.get('id')}")

                        elif event_type == "Turn":
                            transcript = msg.get("transcript", "")
                            end_of_turn = msg.get("end_of_turn", False)

                            if transcript.strip():
                                if not end_of_turn:
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "text": redact_pii(transcript),
                                            "role": "user",
                                            "final": False
                                        })
                                else:
                                    logger.info(f"AssemblyAI v3 Final Turn: '{transcript}'")
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "text": redact_pii(transcript),
                                            "role": "user",
                                            "final": True
                                        })
                                    await process_llm_and_tts_stream(websocket, transcript)

                except websockets.exceptions.ConnectionClosed as cc:
                    logger.error(f"AssemblyAI v3 Connection Closed Code {cc.code}: {cc.reason}")
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.error(f"AssemblyAI v3 receive loop error: {e}")

            browser_task = asyncio.create_task(receive_from_browser())
            aai_task = asyncio.create_task(receive_from_assemblyai())

            done, pending = await asyncio.wait(
                [browser_task, aai_task],
                return_when=asyncio.FIRST_COMPLETED,
            )
            for task in pending:
                task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await task

            # Terminate AssemblyAI session
            with contextlib.suppress(Exception):
                await aai_ws.send(json.dumps({"terminate_session": True}))
                await asyncio.sleep(0.05)

    except (WebSocketDisconnect, RuntimeError):
        logger.info("Voice Agent WebSocket disconnected.")
    except Exception as e:
        logger.exception(f"Failed to stream with AssemblyAI v3: {e}")
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close()
        except Exception:
            pass
    finally:
        await agent_service.close()
