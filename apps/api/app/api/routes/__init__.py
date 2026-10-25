"""API routes package aggregator."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.modules.conversations.router import router as conversations_router
from app.modules.llm.router import router as models_router
from app.modules.tools.router import router as tools_router
from app.modules.memory.router import router as memories_router
from app.modules.documents.router import router as documents_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(conversations_router)
api_router.include_router(models_router)
api_router.include_router(tools_router)
api_router.include_router(memories_router)
api_router.include_router(documents_router)
