from fastapi import APIRouter
from app.schemas.tts import HealthResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health")
@router.head("/health", include_in_schema=False)
def get_health():
    """Health check — returns alive if FastAPI is running."""
    try:
        from app.services.kokoro_service import KokoroService
        from app.services.audio_service import AudioService
        from app.core.queue import TtsQueueManager
        from app.services.transcription_service import TranscriptionService
        from app.core.transcription_queue import TranscriptionQueueManager

        kokoro_service = KokoroService()
        audio_service = AudioService()
        queue_manager = TtsQueueManager()
        trans_service = TranscriptionService()
        trans_queue = TranscriptionQueueManager()

        model_ready, model_status, _ = kokoro_service.get_status()
        trans_ready, trans_status, _ = trans_service.get_status()

        return HealthResponse(
            status="alive",
            version="1.0.0",
            environment=settings.APP_ENV,
            modelReady=model_ready,
            modelStatus=model_status,
            ffmpegAvailable=audio_service.is_ffmpeg_available(),
            queueDepth=queue_manager.get_queue_depth(),
            queueCapacity=settings.TTS_MAX_QUEUE_SIZE,
            transcriptionModelReady=trans_ready,
            transcriptionModelStatus=trans_status,
            transcriptionQueueDepth=trans_queue.get_queue_depth(),
            transcriptionQueueCapacity=settings.TRANSCRIPTION_MAX_QUEUE_SIZE
        )
    except Exception:
        return HealthResponse(
            status="alive",
            version="1.0.0",
            environment=settings.APP_ENV,
            modelReady=False,
            modelStatus="starting",
            ffmpegAvailable=False,
            queueDepth=0,
            queueCapacity=0,
        )
