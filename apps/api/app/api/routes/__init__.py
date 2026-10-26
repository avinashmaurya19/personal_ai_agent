"""API routes package aggregator."""

from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.modules.conversations.router import router as conversations_router
from app.modules.llm.router import router as models_router
from app.modules.tools.router import router as tools_router
from app.modules.memory.router import router as memories_router
from app.modules.documents.router import router as documents_router
from app.modules.tasks.router import router as tasks_router
from app.modules.notes.router import router as notes_router
from app.modules.email.router import router as emails_router
from app.modules.calendar.router import router as calendar_router
from app.modules.approvals.router import router as approvals_router
from app.modules.research.router import router as research_router
from app.modules.integrations.router import router as integrations_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(conversations_router)
api_router.include_router(conversations_router, prefix="/chat")
api_router.include_router(models_router)
api_router.include_router(models_router, prefix="/chat")
api_router.include_router(tools_router)
api_router.include_router(memories_router)
api_router.include_router(documents_router)
api_router.include_router(tasks_router)
api_router.include_router(notes_router)
api_router.include_router(emails_router)
api_router.include_router(calendar_router)
api_router.include_router(approvals_router)
api_router.include_router(research_router)
api_router.include_router(integrations_router)
