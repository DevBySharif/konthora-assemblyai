from typing import Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    modelReady: bool
    modelStatus: str
    ffmpegAvailable: bool
    queueDepth: int
    queueCapacity: int
    transcriptionModelReady: Optional[bool] = None
    transcriptionModelStatus: Optional[str] = None
    transcriptionQueueDepth: Optional[int] = None
    transcriptionQueueCapacity: Optional[int] = None
