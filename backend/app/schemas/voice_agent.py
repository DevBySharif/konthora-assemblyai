from pydantic import BaseModel, Field

class VoiceAgentSessionConfig(BaseModel):
    voice_id: str = "af_heart"
    speed: float = 1.0
    system_prompt: str = "You are Konthora AI, a helpful, concise voice assistant."
