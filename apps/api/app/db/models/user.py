"""User domain model representing the system owner/account."""

from typing import Any, List, Optional
from sqlalchemy import Boolean, String, text
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
    hashed_password: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(512),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=text("true"),
        nullable=False,
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
    tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    notes: Mapped[List["Note"]] = relationship(
        "Note",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    emails: Mapped[List["EmailMessage"]] = relationship(
        "EmailMessage",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    calendar_events: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    pending_actions: Mapped[List["PendingAction"]] = relationship(
        "PendingAction",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    research_reports: Mapped[List["ResearchReport"]] = relationship(
        "ResearchReport",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    oauth_tokens: Mapped[List["OAuthToken"]] = relationship(
        "OAuthToken",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
