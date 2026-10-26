"""FastAPI dependency injection utilities."""

from typing import Optional
import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import decode_access_token
from app.db.models.user import User
from app.db.session import get_db_session

# Optional bearer authentication scheme
security_scheme = HTTPBearer(auto_error=False)

# Stable local development owner UUID
DEV_OWNER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
DEV_OWNER_EMAIL = "owner@personal.ai"


async def get_current_owner(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    session: AsyncSession = Depends(get_db_session),
) -> User:
    """Retrieve the authenticated User from JWT token, falling back to DEV_OWNER in dev."""
    if auth_credentials and auth_credentials.credentials:
        token = auth_credentials.credentials
        payload = decode_access_token(token)
        if not payload or "sub" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            user_id = uuid.UUID(payload["sub"])
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Malformed user identifier in token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        stmt = select(User).where(User.id == user_id)
        user = (await session.execute(stmt)).scalar_one_or_none()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account does not exist or has been disabled.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    # Fallback for local development or testing when no Bearer header is passed
    if settings.ENVIRONMENT in ("development", "testing"):
        stmt = select(User).where(User.id == DEV_OWNER_ID)
        user = (await session.execute(stmt)).scalar_one_or_none()
        if user is None:
            user = User(
                id=DEV_OWNER_ID,
                email=DEV_OWNER_EMAIL,
                full_name="Personal Owner",
                preferences={"theme": "dark", "default_model": "llama3.2"},
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
        headers={"WWW-Authenticate": "Bearer"},
    )
