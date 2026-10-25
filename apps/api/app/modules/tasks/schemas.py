"""Pydantic schemas for task domain operations."""

from datetime import datetime
from typing import Literal, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field

TaskStatus = Literal["pending", "in_progress", "completed", "cancelled"]
TaskPriority = Literal["low", "medium", "high", "urgent"]


class TaskCreate(BaseModel):
    """Payload to create a new task."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: TaskPriority = Field(default="medium")
    due_date: Optional[datetime] = None
    source_conversation_id: Optional[uuid.UUID] = None


class TaskUpdate(BaseModel):
    """Payload to update an existing task."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """Response payload for a task."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    source_conversation_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
