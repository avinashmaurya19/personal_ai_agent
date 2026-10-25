"""Tool execution audit model persisting runtime tool invocations and receipts."""

import uuid
from typing import Any, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ToolExecution(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tool invocation receipt and audit log."""

    __tablename__ = "tool_executions"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("messages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    tool_name: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )
    arguments: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )
    result: Mapped[Optional[Any]] = mapped_column(
        JSONB,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="success",
        # "success", "error", "blocked"
    )
    is_consequential: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    duration_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation")
    message: Mapped[Optional["Message"]] = relationship("Message")
