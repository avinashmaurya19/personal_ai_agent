"""Pydantic schemas for note domain operations."""

from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    """Payload to create a new note."""

    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: List[str] = Field(default_factory=list)
    source_conversation_id: Optional[uuid.UUID] = None


class NoteUpdate(BaseModel):
    """Payload to update an existing note."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    """Response payload for a note."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    content: str
    tags: List[str]
    source_conversation_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
