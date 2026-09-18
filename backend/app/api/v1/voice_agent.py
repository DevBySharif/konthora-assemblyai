import os
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

# Standard AssemblyAI Streaming v3 URL
ASSEMBLYAI_V3_WS_URL = "wss://streaming.assemblyai.com/v3/ws?sample_rate=16000"

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
                    ai_reply = await agent_service.generate_ai_response(text_msg)
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({"type": "text_response", "text": ai_reply, "role": "assistant"})
                    audio_bytes = agent_service.generate_speech_bytes(ai_reply)
                    if audio_bytes and websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_bytes(audio_bytes)
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
                            ai_reply = await agent_service.generate_ai_response(text_data)
                            if websocket.client_state == WebSocketState.CONNECTED:
                                await websocket.send_json({"type": "text_response", "text": ai_reply, "role": "assistant"})
                            audio_bytes = agent_service.generate_speech_bytes(ai_reply)
                            if audio_bytes and websocket.client_state == WebSocketState.CONNECTED:
                                await websocket.send_bytes(audio_bytes)
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

                                    ai_reply = await agent_service.generate_ai_response(transcript)
                                    if websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_json({
                                            "type": "text_response",
                                            "text": ai_reply,
                                            "role": "assistant"
                                        })

                                    audio_bytes = agent_service.generate_speech_bytes(ai_reply)
                                    if audio_bytes and websocket.client_state == WebSocketState.CONNECTED:
                                        await websocket.send_bytes(audio_bytes)

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