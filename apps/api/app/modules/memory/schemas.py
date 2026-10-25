"""Pydantic schemas for memory domain entities and search results."""

from datetime import datetime
from typing import Literal, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field

MemoryCategory = Literal["preference", "fact", "work", "routine", "personal", "general"]


class MemoryCreate(BaseModel):
    """Payload to create or record a new personal fact."""

    content: str = Field(..., min_length=2, max_length=1000)
    category: MemoryCategory = Field(default="general")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    source_conversation_id: Optional[uuid.UUID] = None


class MemoryUpdate(BaseModel):
    """Payload to update an existing memory."""

    content: Optional[str] = Field(default=None, min_length=2, max_length=1000)
    category: Optional[MemoryCategory] = None
    is_active: Optional[bool] = None


class MemoryResponse(BaseModel):
    """Response payload for a memory entity."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    category: str
    content: str
    confidence: float
    source_conversation_id: Optional[uuid.UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class MemorySearchResult(BaseModel):
    """Search match combining memory entity and hybrid score."""

    memory: MemoryResponse
    score: float
    match_type: Literal["semantic", "keyword", "hybrid"]
