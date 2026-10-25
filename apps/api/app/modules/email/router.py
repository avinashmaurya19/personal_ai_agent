"""FastAPI router for owner email threads, reading messages, and managing drafts."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.email.schemas import (
    DraftEmailCreate,
    EmailResponse,
    EmailThreadSummary,
)
from app.modules.email.service import EmailService

router = APIRouter(prefix="/emails", tags=["Emails"])


def get_email_service(
    session: AsyncSession = Depends(get_db_session),
) -> EmailService:
    """Dependency producing EmailService instance."""
    return EmailService(session)


@router.get("/threads", response_model=List[EmailThreadSummary], summary="List mailbox threads")
async def list_threads(
    unread_only: bool = Query(default=False, description="Filter only unread threads"),
    q: Optional[str] = Query(default=None, description="Search query across emails"),
    owner: User = Depends(get_current_owner),
    service: EmailService = Depends(get_email_service),
) -> List[EmailThreadSummary]:
    """Retrieve owner email threads with aggregated unread counters."""
    return await service.list_threads(owner.id, unread_only=unread_only, query=q)


@router.get("/threads/{thread_id}", response_model=List[EmailResponse], summary="Get messages in thread")
async def get_thread_messages(
    thread_id: str,
    owner: User = Depends(get_current_owner),
    service: EmailService = Depends(get_email_service),
) -> List[EmailResponse]:
    """Retrieve all chronological messages for a specific email thread."""
    return await service.get_thread_messages(owner.id, thread_id)


@router.post("/threads/{thread_id}/read", status_code=status.HTTP_204_NO_CONTENT, summary="Mark thread as read")
async def mark_thread_read(
    thread_id: str,
    owner: User = Depends(get_current_owner),
    service: EmailService = Depends(get_email_service),
) -> None:
    """Mark all messages in the specified thread as read."""
    await service.mark_thread_as_read(owner.id, thread_id)


@router.get("/drafts", response_model=List[EmailResponse], summary="List email drafts")
async def list_drafts(
    owner: User = Depends(get_current_owner),
    service: EmailService = Depends(get_email_service),
) -> List[EmailResponse]:
    """Retrieve pending email drafts."""
    return await service.list_drafts(owner.id)


@router.post("/drafts", response_model=EmailResponse, status_code=status.HTTP_201_CREATED, summary="Create email draft")
async def create_draft(
    payload: DraftEmailCreate,
    owner: User = Depends(get_current_owner),
    service: EmailService = Depends(get_email_service),
) -> EmailResponse:
    """Save an email draft without sending."""
    return await service.create_draft(owner.id, payload)
