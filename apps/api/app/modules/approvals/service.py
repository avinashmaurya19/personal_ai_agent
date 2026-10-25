"""Approval domain service managing human-in-the-loop action proposals and executions."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.pending_action import PendingAction
from app.modules.calendar.schemas import CalendarEventCreate
from app.modules.calendar.service import CalendarService
from app.modules.email.service import EmailService


class ApprovalService:
    """Manages pending consequential actions requiring explicit human authorization."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_actions(
        self, owner_id: uuid.UUID, status_filter: Optional[str] = "pending"
    ) -> List[PendingAction]:
        """List pending actions for owner, optionally filtered by status."""
        stmt = (
            select(PendingAction)
            .where(PendingAction.owner_id == owner_id)
            .order_by(PendingAction.created_at.desc())
        )
        if status_filter:
            stmt = stmt.where(PendingAction.status == status_filter)

        return list((await self.session.execute(stmt)).scalars().all())

    async def get_action(self, owner_id: uuid.UUID, action_id: uuid.UUID) -> PendingAction:
        """Retrieve single pending action verifying owner authorization."""
        stmt = select(PendingAction).where(PendingAction.id == action_id)
        result = await self.session.execute(stmt)
        action = result.scalar_one_or_none()
        if not action:
            raise NotFoundError("PendingAction", action_id)
        if action.owner_id != owner_id:
            raise PermissionDeniedError("Access to this action is denied")
        return action

    async def create_pending_action(
        self,
        owner_id: uuid.UUID,
        action_type: str,
        description: str,
        payload: Dict[str, Any],
    ) -> PendingAction:
        """Register a new consequential action in pending state."""
        action = PendingAction(
            owner_id=owner_id,
            action_type=action_type,
            description=description,
            payload=payload,
            status="pending",
        )
        self.session.add(action)
        await self.session.commit()
        await self.session.refresh(action)
        logger.info(f"Registered pending action {action.id} ({action_type}): {description}")
        return action

    async def decide_action(
        self,
        owner_id: uuid.UUID,
        action_id: uuid.UUID,
        approved: bool,
        rejection_reason: Optional[str] = None,
    ) -> PendingAction:
        """Approve or reject a pending action, executing the mutation if approved."""
        action = await self.get_action(owner_id, action_id)
        if action.status != "pending":
            raise AppException(f"Action {action_id} has already been resolved ({action.status})")

        if not approved:
            action.status = "rejected"
            action.rejection_reason = rejection_reason or "Rejected by owner"
            await self.session.commit()
            await self.session.refresh(action)
            logger.info(f"Action {action_id} rejected: {action.rejection_reason}")
            return action

        # Execute approved mutation
        if action.action_type == "send_email":
            email_svc = EmailService(self.session)
            await email_svc.execute_send(
                owner_id=owner_id,
                recipient=action.payload["recipient"],
                subject=action.payload["subject"],
                body=action.payload["body"],
                thread_id=action.payload.get("thread_id"),
            )
        elif action.action_type == "create_calendar_event":
            cal_svc = CalendarService(self.session)
            st = datetime.fromisoformat(action.payload["start_time"].replace("Z", "+00:00"))
            et = datetime.fromisoformat(action.payload["end_time"].replace("Z", "+00:00"))
            event_payload = CalendarEventCreate(
                title=action.payload["title"],
                description=action.payload.get("description"),
                start_time=st,
                end_time=et,
                location=action.payload.get("location"),
                attendees=action.payload.get("attendees", []),
            )
            await cal_svc.create_event(owner_id=owner_id, data=event_payload)
        else:
            raise AppException(f"Unsupported action type: {action.action_type}")

        action.status = "executed"
        action.executed_at = datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(action)
        logger.info(f"Action {action_id} approved and executed successfully")
        return action
