"""Calendar domain model for events and meetings."""

from datetime import datetime
from typing import List, Optional
import uuid
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CalendarEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Calendar meeting or scheduled personal event."""

    __tablename__ = "calendar_events"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    end_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    attendees: Mapped[List[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="confirmed",
        index=True,
        # "confirmed", "tentative", "cancelled"
    )

    owner: Mapped["User"] = relationship("User", back_populates="calendar_events", lazy="joined")  # type: ignore # noqa: F821
