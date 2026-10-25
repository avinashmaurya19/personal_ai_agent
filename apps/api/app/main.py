"""FastAPI application entrypoint and ASGI app initialization."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger, setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context for startup and shutdown routines."""
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API runtime for Personal AI Assistant",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    """Handle custom application-level exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "details": exc.details},
    )


# Include top-level API routes
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root() -> dict[str, str]:
    """Root endpoint redirecting attention to API documentation."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }
