"""Pydantic schemas for email threads, messages, and drafts."""

from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class EmailResponse(BaseModel):
    """Response payload for a single email message or draft."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    thread_id: str
    sender: str
    recipient: str
    subject: str
    body: str
    snippet: str
    is_read: bool
    is_draft: bool
    sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class EmailThreadSummary(BaseModel):
    """Aggregated thread summary for mailbox listing."""

    thread_id: str
    subject: str
    last_sender: str
    recipient: str
    snippet: str
    message_count: int
    has_unread: bool
    last_activity: datetime


class DraftEmailCreate(BaseModel):
    """Payload to create or update an email draft."""

    recipient: str = Field(..., min_length=3)
    subject: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)
    thread_id: Optional[str] = None


class SendEmailRequest(BaseModel):
    """Payload to request sending an email (gated by approval)."""

    recipient: str = Field(..., min_length=3)
    subject: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)
    thread_id: Optional[str] = None
