"""Pydantic schemas for conversations and messages."""

from datetime import datetime
from typing import Any, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    """Payload to create a new conversation."""

    title: Optional[str] = Field(default=None, max_length=255)
    active_model_provider: str = Field(default="ollama", max_length=64)
    active_model_name: str = Field(default="llama3.2", max_length=128)


class ConversationResponse(BaseModel):
    """Response payload for a conversation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    active_model_provider: str
    active_model_name: str
    created_at: datetime
    updated_at: datetime


class MessageCreate(BaseModel):
    """Payload to send a message into a conversation."""

    content: str = Field(..., min_length=1)
    role: str = Field(default="user")


class MessageResponse(BaseModel):
    """Response payload for a persisted message turn."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    tool_calls: Optional[list[dict[str, Any]]] = None
    tool_results: Optional[list[dict[str, Any]]] = None
    token_count: int
    created_at: datetime
