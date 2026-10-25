"""FastAPI router for owner memory management and search."""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.memory.schemas import (
    MemoryCreate,
    MemoryResponse,
    MemorySearchResult,
    MemoryUpdate,
)
from app.modules.memory.service import MemoryService

router = APIRouter(prefix="/memories", tags=["Memories"])


def get_memory_service(
    session: AsyncSession = Depends(get_db_session),
) -> MemoryService:
    """Dependency producing MemoryService instance."""
    return MemoryService(session)


@router.get("", response_model=List[MemoryResponse], summary="List stored memories")
async def list_memories(
    category: Optional[str] = Query(default=None),
    owner: User = Depends(get_current_owner),
    service: MemoryService = Depends(get_memory_service),
) -> List[MemoryResponse]:
    """Retrieve all active memories belonging to authenticated owner."""
    return await service.list_memories(owner.id, category=category)


@router.post(
    "",
    response_model=MemoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or record a personal memory",
)
async def create_memory(
    payload: MemoryCreate,
    owner: User = Depends(get_current_owner),
    service: MemoryService = Depends(get_memory_service),
) -> MemoryResponse:
    """Explicitly save a new personal fact or preference."""
    return await service.create_memory(owner.id, payload)


@router.get("/search", response_model=List[MemorySearchResult], summary="Hybrid memory search")
async def search_memories(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=5, ge=1, le=20),
    owner: User = Depends(get_current_owner),
    service: MemoryService = Depends(get_memory_service),
) -> List[MemorySearchResult]:
    """Query memories using hybrid semantic vector similarity + keyword matching."""
    return await service.hybrid_search(owner.id, query=q, limit=limit)


@router.patch("/{memory_id}", response_model=MemoryResponse, summary="Update memory")
async def update_memory(
    memory_id: uuid.UUID,
    payload: MemoryUpdate,
    owner: User = Depends(get_current_owner),
    service: MemoryService = Depends(get_memory_service),
) -> MemoryResponse:
    """Update existing memory content or category."""
    return await service.update_memory(memory_id, owner.id, payload)


@router.delete(
    "/{memory_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete memory",
)
async def delete_memory(
    memory_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: MemoryService = Depends(get_memory_service),
) -> None:
    """Permanently delete a memory record."""
    await service.delete_memory(memory_id, owner.id)
