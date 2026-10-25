"""Pydantic schemas for pending action human-in-the-loop approvals."""

from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class PendingActionCreate(BaseModel):
    """Payload to record an action proposed by an agent."""

    action_type: str = Field(..., min_length=2, max_length=64)
    description: str = Field(..., min_length=2)
    payload: Dict[str, Any] = Field(default_factory=dict)


class ActionDecisionRequest(BaseModel):
    """Payload to authorize or reject a pending action."""

    approved: bool
    rejection_reason: Optional[str] = None


class PendingActionResponse(BaseModel):
    """Response payload for a pending action."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    action_type: str
    description: str
    payload: Dict[str, Any]
    status: str
    executed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
