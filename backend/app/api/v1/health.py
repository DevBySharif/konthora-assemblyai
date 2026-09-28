from fastapi import APIRouter
from app.schemas.tts import HealthResponse
from app.core.config import settings

router = APIRouter()

@router.get("/health")
@router.head("/health", include_in_schema=False)
def get_health():
    """Health check — returns alive if FastAPI is running."""
    return HealthResponse(
        status="alive",
        version="1.0.0",
        environment=settings.APP_ENV,
        modelReady=True,
        modelStatus="ready",
        ffmpegAvailable=False,
        queueDepth=0,
        queueCapacity=0,
    )
