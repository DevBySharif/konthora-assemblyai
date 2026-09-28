import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import contextlib
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.middleware.gzip import GZipMiddleware
from loguru import logger

from app.core.config import settings
from app.core.exceptions import TtsException
from app.api.v1.health import router as health_router
from app.api.v1.voice_agent_v2 import router as voice_agent_v2_router

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Konthora API...")
    # Init database + seed
    try:
        from app.core.database import init_db
        init_db()
        logger.info("Database initialized.")
        from scripts.seed import seed_database
        seed_database()
    except Exception as e:
        logger.error(f"Database init error: {e}")
    yield
    logger.info("Shutting down Konthora API.")

app = FastAPI(
    title="Konthora API",
    version="1.0.0",
    description="Backend speech synthesis processing engine for Konthora.",
    lifespan=lifespan
)

# Middleware stack. Starlette wraps in reverse order, so the LAST added middleware
# is the OUTERMOST. Order (outer -> inner): TrustedHost -> CORS -> GZip.
# Security response headers are emitted solely by Nginx at the edge (see
# deploy/nginx/security_headers.conf) to avoid duplication; Nginx is also the
# only layer that covers CORS preflight responses.
if settings.COMPRESSION_ENABLED:
    app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration (complying with cross-origin safety rules)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

@app.middleware("http")
async def add_robots_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response

# Register routes
app.include_router(health_router, prefix="/api/v1")
app.include_router(voice_agent_v2_router, prefix="/api/v1")

# Railway healthcheck — zero dependency, always returns 200
@app.get("/api/v1/health")
@app.head("/api/v1/health")
async def railway_health():
    return {"status": "alive", "service": "konthora-api", "version": "1.0.0"}

# Global Exception Handlers

@app.exception_handler(TtsException)
async def tts_exception_handler(request: Request, exc: TtsException):
    logger.warning(f"Business logic exception: [{exc.code}] - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation failure: {exc.errors()}")
    # Format a human-readable validation error response
    msg = "Invalid request payload parameters."
    if exc.errors():
        err = exc.errors()[0]
        # Translate location path to string
        field = ".".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = f"Validation failed at '{field}': {err.get('msg')}"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "INVALID_REQUEST",
            "message": msg
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled system exception: {exc}")
    # Privacy rule: never leak Python tracebacks or internal raw exceptions to clients
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred during processing."
        }
    )
