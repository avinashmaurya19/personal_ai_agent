"""FastAPI router for inspecting and authorizing pending consequential actions."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.approvals.schemas import ActionDecisionRequest, PendingActionResponse
from app.modules.approvals.service import ApprovalService

router = APIRouter(prefix="/approvals", tags=["Approvals"])


def get_approval_service(
    session: AsyncSession = Depends(get_db_session),
) -> ApprovalService:
    """Dependency producing ApprovalService instance."""
    return ApprovalService(session)


@router.get("", response_model=List[PendingActionResponse], summary="List pending actions")
async def list_actions(
    status: Optional[str] = Query(default="pending", description="Filter by status (pending, executed, rejected)"),
    owner: User = Depends(get_current_owner),
    service: ApprovalService = Depends(get_approval_service),
) -> List[PendingActionResponse]:
    """Retrieve actions proposed by assistant requiring owner sign-off."""
    return await service.list_actions(owner.id, status_filter=status)


@router.post("/{action_id}/decision", response_model=PendingActionResponse, summary="Authorize or reject action")
async def decide_action(
    action_id: uuid.UUID,
    payload: ActionDecisionRequest,
    owner: User = Depends(get_current_owner),
    service: ApprovalService = Depends(get_approval_service),
) -> PendingActionResponse:
    """Approve and trigger action execution, or reject with optional reason."""
    return await service.decide_action(
        owner_id=owner.id,
        action_id=action_id,
        approved=payload.approved,
        rejection_reason=payload.rejection_reason,
    )
