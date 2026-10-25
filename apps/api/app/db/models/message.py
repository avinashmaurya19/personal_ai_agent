"""Message domain model representing turns in a conversation."""

import uuid
from typing import Any, Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Message(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Message entity belonging to a conversation."""

    __tablename__ = "messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        # 'user', 'assistant', 'system', 'tool'
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )
    tool_calls: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(
        JSONB,
        nullable=True,
    )
    tool_results: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(
        JSONB,
        nullable=True,
    )
    token_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="messages",
    )
