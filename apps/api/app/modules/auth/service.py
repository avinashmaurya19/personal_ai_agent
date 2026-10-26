"""Auth service handling registration, password verification, Google sign-in, and JWT issuance."""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import User
from app.modules.auth.schemas import (
    TokenResponse,
    UserProfileResponse,
    UserRegisterRequest,
)


class AuthService:
    """Authentication and identity provider service."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Query user record by normalized lowercase email."""
        stmt = select(User).where(User.email == email.lower().strip())
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Fetch user by primary UUID."""
        stmt = select(User).where(User.id == user_id)
        res = await self.session.execute(stmt)
        return res.scalar_one_or_none()

    async def register(self, data: UserRegisterRequest) -> TokenResponse:
        """Register a new user with email and hashed password."""
        existing = await self.get_user_by_email(data.email)
        if existing:
            raise AppException("An account with this email already exists.", status_code=400)

        hashed = hash_password(data.password)
        new_user = User(
            id=uuid.uuid4(),
            email=data.email.lower().strip(),
            full_name=data.full_name.strip(),
            hashed_password=hashed,
            is_active=True,
            preferences={"theme": "dark", "default_model": "llama3.2"},
        )
        self.session.add(new_user)
        await self.session.commit()
        await self.session.refresh(new_user)

        logger.info(f"Registered new user account {new_user.email} ({new_user.id})")
        token = create_access_token(user_id=new_user.id, email=new_user.email)
        return TokenResponse(
            access_token=token,
            user=UserProfileResponse.model_validate(new_user),
        )

    async def login(self, email: str, password: str) -> TokenResponse:
        """Authenticate user by email and password, issuing a JWT token."""
        user = await self.get_user_by_email(email)
        if not user or not user.hashed_password:
            raise AppException("Invalid email or password.", status_code=401)

        if not verify_password(password, user.hashed_password):
            raise AppException("Invalid email or password.", status_code=401)

        if not user.is_active:
            raise AppException("Account is disabled.", status_code=403)

        token = create_access_token(user_id=user.id, email=user.email)
        logger.info(f"User {user.email} logged in successfully")
        return TokenResponse(
            access_token=token,
            user=UserProfileResponse.model_validate(user),
        )

    async def authenticate_google(self, google_access_token: str) -> TokenResponse:
        """Exchange Google access token for user profile, upsert user, and issue session JWT."""
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {google_access_token}"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(userinfo_url, headers=headers)
            if resp.status_code != 200:
                logger.error(f"Google userinfo error: {resp.status_code} - {resp.text}")
                raise AppException("Failed to verify Google access token.", status_code=401)

            profile = resp.json()

        email = profile.get("email")
        if not email:
            raise AppException("Google account has no associated email.", status_code=400)

        name = profile.get("name") or email.split("@")[0]
        picture = profile.get("picture")

        user = await self.get_user_by_email(email)
        if not user:
            user = User(
                id=uuid.uuid4(),
                email=email.lower().strip(),
                full_name=name,
                avatar_url=picture,
                is_active=True,
                preferences={"theme": "dark", "default_model": "llama3.2"},
            )
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            logger.info(f"Created new user via Google Sign-In: {user.email} ({user.id})")
        else:
            # Update avatar or name if provided
            if picture and not user.avatar_url:
                user.avatar_url = picture
            if name and user.full_name == "Owner":
                user.full_name = name
            await self.session.commit()
            await self.session.refresh(user)

        token = create_access_token(user_id=user.id, email=user.email)
        return TokenResponse(
            access_token=token,
            user=UserProfileResponse.model_validate(user),
        )
