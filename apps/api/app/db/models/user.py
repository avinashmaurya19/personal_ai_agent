"""User domain model representing the system owner/account."""

from typing import Any, List
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """User account entity."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Owner",
    )
    preferences: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    # Relationships
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
