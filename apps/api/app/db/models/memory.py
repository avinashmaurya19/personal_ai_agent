"""Long-term memory domain model supporting vector similarity and owner scoping."""

import uuid
from typing import Optional
from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Memory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Personal memory entry storing facts, preferences, and knowledge vectors."""

    __tablename__ = "memories"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="general",
        index=True,
        # "preference", "fact", "work", "routine", "personal", "general"
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=1.0,
    )
    source_conversation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    embedding: Mapped[Optional[list[float]]] = mapped_column(
        Vector(1024),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )

    # Relationships
    owner: Mapped["User"] = relationship("User")
    conversation: Mapped[Optional["Conversation"]] = relationship("Conversation")
