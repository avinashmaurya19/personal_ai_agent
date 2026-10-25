"""API routes package aggregator."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.modules.conversations.router import router as conversations_router
from app.modules.llm.router import router as models_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(conversations_router)
api_router.include_router(models_router)
