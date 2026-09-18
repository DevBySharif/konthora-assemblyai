import pytest
from unittest.mock import patch
from app.services.voice_agent_service import VoiceAgentService

def test_voice_agent_service_speech_generation():
    service = VoiceAgentSession = VoiceAgentService()
    assert service.generate_speech_bytes("") == b""
    assert service.generate_speech_bytes("   ") == b""

@pytest.mark.asyncio
async def test_voice_agent_service_ai_response():
    service = VoiceAgentService()
    response = await service.generate_ai_response("Hello")
    assert isinstance(response, str) and len(response.strip()) > 0


@pytest.mark.asyncio
async def test_voice_agent_service_bangla_intent():
    service = VoiceAgentService()
    response = await service.generate_ai_response("তুমি কি বাংলায় কথা বলতে পারো?")
    assert "বাংলা" in response or "Bangla" in response or "bangla" in response.lower()

def test_voice_agent_websocket(client):
    with patch("app.api.v1.voice_agent.agent_service.generate_speech_bytes") as mock_synth:
        mock_synth.return_value = b"RIFFfake_wav_data"
        with client.websocket_connect("/api/v1/ws/voice-agent") as websocket:
            websocket.send_text("Hello test")
            msg1 = websocket.receive_json()
            assert msg1["type"] == "transcript"
            assert msg1["text"] == "hello test" or msg1["text"] == "Hello test"
            
            msg2 = websocket.receive_json()
            assert msg2["type"] == "text_response"
            assert len(msg2["text"].strip()) > 0
            
            audio = websocket.receive_bytes()
            assert audio == b"RIFFfake_wav_data"


def test_voice_agent_websocket_raw_bytes_ignored(client):
    with patch("app.api.v1.voice_agent.agent_service.generate_speech_bytes") as mock_synth:
        mock_synth.return_value = b"RIFFfake_wav_data"
        with client.websocket_connect("/api/v1/ws/voice-agent") as websocket:
            # Send raw audio bytes; should NOT return any text/system spam
            websocket.send_bytes(b"\x00\x00" * 100)
            # Send normal text afterwards; should work as expected
            websocket.send_text("Ping")
            msg1 = websocket.receive_json()
            assert msg1["type"] == "transcript"
            assert "Ping" in msg1["text"]
            msg2 = websocket.receive_json()
            assert msg2["type"] == "text_response"
            audio = websocket.receive_bytes()
            assert audio == b"RIFFfake_wav_data"


def test_voice_agent_websocket_disconnect_cleanly(client):
    with client.websocket_connect("/api/v1/ws/voice-agent") as websocket:
        # Just open and cleanly close without sending messages
        websocket.close()