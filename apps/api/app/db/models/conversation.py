"""Conversation domain model representing an ongoing chat session."""

import uuid
from typing import Any, List
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Conversation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Conversation entity owned by a user."""

    __tablename__ = "conversations"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="New Conversation",
    )
    active_model_provider: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="ollama",
    )
    active_model_name: Mapped[str] = mapped_column(
        String(128),
        nullable=False,
        default="llama3.2",
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="conversations",
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )
