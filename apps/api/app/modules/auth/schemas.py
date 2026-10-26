"""Pydantic schemas for authentication and user accounts."""

from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class UserRegisterRequest(BaseModel):
    """Payload to register a new user account."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)


class UserLoginRequest(BaseModel):
    """Payload to log in with email and password."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)


class GoogleAuthRequest(BaseModel):
    """Payload to authenticate via Google OAuth token."""

    access_token: str = Field(..., min_length=10)


class UserProfileResponse(BaseModel):
    """Public user profile response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool = True
    preferences: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class TokenResponse(BaseModel):
    """Access token return payload."""

    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse
