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
from app.services.voice_agent_service import VoiceAgentService

# Ensure .env is explicitly loaded
load_dotenv()
_backend_env_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
if os.path.exists(_backend_env_path):
    load_dotenv(_backend_env_path)

router = APIRouter()
agent_service = VoiceAgentService()

# AssemblyAI Streaming v3 URL — locked to English to prevent Hindi/Bangla script misclassification
ASSEMBLYAI_V3_WS_URL = "wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&language_code=en"

# Punctuation regex for clause splitting on ., !, ?, ,, ;, or newline
CLAUSE_PATTERN = re.compile(r'([^.!?,\n;]+[.!?,\n;]+)')

async def process_llm_and_tts_stream(websocket: WebSocket, prompt: str):
    """Streams tokens from LLM and synthesizes audio at clause boundaries for ultra-low latency."""
    text_buffer = ""
    full_text = ""

    async for token in agent_service.stream_ai_response(prompt):
        if websocket.client_state != WebSocketState.CONNECTED:
            break

        text_buffer += token
        full_text += token

        # Send text delta to frontend for real-time text display
        with contextlib.suppress(Exception):
            await websocket.send_json({"type": "text_delta", "content": token})

        # Find all clause matches in buffer
        last_end = 0
        for match in CLAUSE_PATTERN.finditer(text_buffer):
            clause_text = match.group(1).strip()
            if clause_text and len(clause_text) > 1:
                audio_bytes = await agent_service.generate_speech_bytes_async(clause_text)
                if audio_bytes and websocket.client_state == WebSocketState.CONNECTED:
                    with contextlib.suppress(Exception):
                        await websocket.send_bytes(audio_bytes)
            last_end = match.end()
        if last_end > 0:
            text_buffer = text_buffer[last_end:]

    # Process remaining text in buffer if any
    remaining_text = text_buffer.strip()
    if remaining_text and len(remaining_text) > 1 and websocket.client_state == WebSocketState.CONNECTED:
        audio_bytes = await agent_service.generate_speech_bytes_async(remaining_text)
        if audio_bytes and websocket.client_state == WebSocketState.CONNECTED:
            with contextlib.suppress(Exception):
                await websocket.send_bytes(audio_bytes)

    # Emit final consolidated text response
    if websocket.client_state == WebSocketState.CONNECTED:
        with contextlib.suppress(Exception):
            await websocket.send_json({"type": "text_response", "text": full_text.strip(), "role": "assistant"})

        # Emit action_card with verification hash and audit QR payload
        action_card = agent_service.resolve_document_action(full_text.strip(), prompt)
        if action_card and websocket.client_state == WebSocketState.CONNECTED:
            with contextlib.suppress(Exception):
                await websocket.send_json(action_card)

@router.websocket("/ws/voice-agent")
async def voice_agent_websocket(websocket: WebSocket):
    await websocket.accept()
    logger.info("Voice Agent browser WebSocket client connected.")

    api_key = os.getenv("ASSEMBLYAI_API_KEY", "").strip()

    if not api_key:
        logger.warning("ASSEMBLYAI_API_KEY is not set in backend/.env. Running in direct text fallback mode.")
        try:
            while websocket.client_state == WebSocketState.CONNECTED:
                data = await websocket.receive()
                if "text" in data and data["text"]:
                    text_msg = data["text"]
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({"type": "transcript", "text": text_msg, "role": "user", "final": True})
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
        # Compatibility handling for websockets library versions
        ws_kwargs = {}
        ws_version = getattr(websockets, "__version__", "10.0")
        major_v = int(ws_version.split(".")[0]) if ws_version.split(".")[0].isdigit() else 10
        if major_v >= 14:
            ws_kwargs["additional_headers"] = headers
        else:
            ws_kwargs["extra_headers"] = headers

        async with websockets.connect(ASSEMBLYAI_V3_WS_URL, **ws_kwargs) as aai_ws:
            logger.info("Successfully connected to AssemblyAI Streaming v3 WebSocket API.")

            async def receive_from_browser():
                try:
                    while websocket.client_state == WebSocketState.CONNECTED:
                        message = await websocket.receive()
                        if "bytes" in message and message["bytes"]:
                            raw_bytes = message["bytes"]
                            # Only forward valid non-empty PCM buffers
                            if len(raw_bytes) > 0:
                                await aai_ws.send(raw_bytes)
                        elif "text" in message and message["text"]:
                            text_data = message["text"]
                            if websocket.client_state == WebSocketState.CONNECTED:
                                await websocket.send_json({"type": "transcript", "text": text_data, "role": "user", "final": True})
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
                            logger.info(f"AssemblyAI v3 session active. Session ID: {msg.get('id')}")

                        elif event_type == "Turn":
                            transcript = msg.get("transcript", "")
                            end_of_turn = msg.get("end_of_turn", False)

                            if transcript.strip():
                                if not end_of_turn:
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "text": transcript,
                                            "role": "user",
                                            "final": False
                                        })
                                else:
                                    logger.info(f"AssemblyAI v3 Final Turn: '{transcript}'")
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "text": transcript,
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

            # Explicitly terminate AssemblyAI session to prevent 1008 concurrent session errors
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