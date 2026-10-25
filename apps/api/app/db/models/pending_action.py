"""Pending action domain model for human-in-the-loop approval workflows."""

from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PendingAction(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Consequential action proposed by assistant awaiting owner authorization."""

    __tablename__ = "pending_actions"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        # "send_email", "create_calendar_event", "delete_record"
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    payload: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="pending",
        index=True,
        # "pending", "approved", "rejected", "executed"
    )
    executed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    owner: Mapped["User"] = relationship("User", back_populates="pending_actions", lazy="joined")  # type: ignore # noqa: F821
