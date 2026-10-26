"""Database model for storing external provider OAuth tokens."""

from datetime import datetime
from typing import Optional
import uuid
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OAuthToken(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Stores OAuth2 access and refresh tokens for connected integrations."""

    __tablename__ = "oauth_tokens"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    account_email: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    access_token: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    refresh_token: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    scopes: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    token_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Bearer",
    )

    owner: Mapped["User"] = relationship("User", back_populates="oauth_tokens", lazy="joined")  # type: ignore # noqa: F821
