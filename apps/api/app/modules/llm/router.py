"""FastAPI router for model metadata and catalog using CrewAI service."""

from typing import List
from fastapi import APIRouter
from app.modules.llm.schemas import ModelOption
from app.modules.llm.service import CrewAILLMService

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("", response_model=List[ModelOption], summary="List available LLM models")
async def list_models() -> List[ModelOption]:
    """Return all currently configured and active model choices."""
    return CrewAILLMService.list_available_models()
