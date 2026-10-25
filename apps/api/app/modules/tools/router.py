"""FastAPI router for tool catalog and audit logs."""

import uuid
from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.conversation import Conversation
from app.db.models.tool_execution import ToolExecution
from app.db.models.user import User
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.modules.tools.registry import default_tool_registry
from app.modules.tools.schemas import ToolMetadata

router = APIRouter(prefix="/tools", tags=["Tools"])


@router.get("", response_model=List[ToolMetadata], summary="List registered agent tools")
async def list_tools() -> List[ToolMetadata]:
    """Retrieve catalog of all active registered tools."""
    return default_tool_registry.list_metadata()


@router.get(
    "/executions/{conversation_id}",
    summary="Get tool execution audit receipts for a conversation",
)
async def get_tool_executions(
    conversation_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    session: AsyncSession = Depends(get_db_session),
) -> List[dict[str, Any]]:
    """Retrieve all tool execution records associated with a conversation."""
    conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
    conv_res = await session.execute(conv_stmt)
    conv = conv_res.scalar_one_or_none()

    if not conv:
        raise NotFoundError("Conversation", conversation_id)
    if conv.owner_id != owner.id:
        raise PermissionDeniedError("Access denied.")

    stmt = (
        select(ToolExecution)
        .where(ToolExecution.conversation_id == conversation_id)
        .order_by(ToolExecution.created_at.asc())
    )
    result = await session.execute(stmt)
    records = result.scalars().all()

    return [
        {
            "id": str(r.id),
            "conversation_id": str(r.conversation_id),
            "message_id": str(r.message_id) if r.message_id else None,
            "tool_name": r.tool_name,
            "arguments": r.arguments,
            "result": r.result,
            "status": r.status,
            "is_consequential": r.is_consequential,
            "duration_ms": r.duration_ms,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
