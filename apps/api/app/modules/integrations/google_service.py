"""Google OAuth2 and token management service using async HTTP."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode
import uuid
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger
from app.db.models.oauth import OAuthToken


class GoogleAuthService:
    """Manages Google OAuth2 URLs, code exchange, and token refresh."""

    AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
    USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"

    DEFAULT_SCOPES = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/userinfo.email",
    ]

    @classmethod
    def get_authorization_url(cls, state: Optional[str] = None) -> str:
        """Construct the Google OAuth2 consent screen URL."""
        if not settings.GOOGLE_CLIENT_ID:
            raise AppException("GOOGLE_CLIENT_ID is not configured in settings.", status_code=500)

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(cls.DEFAULT_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "include_granted_scopes": "true",
        }
        if state:
            params["state"] = state

        return f"{cls.AUTH_ENDPOINT}?{urlencode(params)}"

    @classmethod
    async def exchange_code_for_tokens(cls, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access and refresh tokens."""
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise AppException("Google OAuth credentials are not fully configured.", status_code=500)

        payload = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(cls.TOKEN_ENDPOINT, data=payload)
            if resp.status_code != 200:
                logger.error(f"Failed to exchange Google OAuth code: {resp.status_code} - {resp.text}")
                raise AppException(f"Google token exchange failed: {resp.text}", status_code=400)
            return resp.json()

    @classmethod
    async def refresh_access_token(cls, refresh_token: str) -> Dict[str, Any]:
        """Request a fresh access token using a stored refresh token."""
        payload = {
            "refresh_token": refresh_token,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "grant_type": "refresh_token",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(cls.TOKEN_ENDPOINT, data=payload)
            if resp.status_code != 200:
                logger.error(f"Failed to refresh Google token: {resp.status_code} - {resp.text}")
                raise AppException(f"Failed to refresh Google access token: {resp.text}", status_code=400)
            return resp.json()

    @classmethod
    async def get_user_email(cls, access_token: str) -> Optional[str]:
        """Retrieve user's email address from Google userinfo API."""
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(cls.USERINFO_ENDPOINT, headers=headers)
                if resp.status_code == 200:
                    return resp.json().get("email")
        except Exception as e:
            logger.warning(f"Could not fetch Google userinfo email: {e}")
        return None


class OAuthTokenManager:
    """Handles token persistence, lookup, and automated proactive refreshing."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_token_record(
        self, owner_id: uuid.UUID, provider: str = "google"
    ) -> Optional[OAuthToken]:
        """Fetch the OAuth token database record for owner and provider."""
        stmt = select(OAuthToken).where(
            OAuthToken.owner_id == owner_id,
            OAuthToken.provider == provider,
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def get_valid_access_token(
        self, owner_id: uuid.UUID, provider: str = "google"
    ) -> Optional[str]:
        """Retrieve a valid access token, proactively refreshing it if expired or near expiry."""
        token = await self.get_token_record(owner_id, provider)
        if not token:
            return None

        # Check if expired or expiring within 60 seconds
        now = datetime.now(timezone.utc)
        is_expired = token.expires_at and (token.expires_at <= now + timedelta(seconds=60))

        if is_expired and token.refresh_token:
            try:
                refreshed = await GoogleAuthService.refresh_access_token(token.refresh_token)
                token.access_token = refreshed["access_token"]
                expires_in = refreshed.get("expires_in", 3600)
                token.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                await self.session.commit()
                logger.info(f"Refreshed Google OAuth access token for owner {owner_id}")
            except Exception as e:
                logger.error(f"Error refreshing access token for {owner_id}: {e}")
                return None

        return token.access_token

    async def save_or_update_token(
        self,
        owner_id: uuid.UUID,
        provider: str,
        access_token: str,
        refresh_token: Optional[str] = None,
        expires_in: Optional[int] = None,
        scopes: Optional[List[str]] = None,
        account_email: Optional[str] = None,
    ) -> OAuthToken:
        """Create or update OAuth token record in database."""
        token = await self.get_token_record(owner_id, provider)
        expires_at = None
        if expires_in:
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        if token:
            token.access_token = access_token
            if refresh_token:
                token.refresh_token = refresh_token
            if expires_at:
                token.expires_at = expires_at
            if scopes:
                token.scopes = scopes
            if account_email:
                token.account_email = account_email
        else:
            token = OAuthToken(
                owner_id=owner_id,
                provider=provider,
                access_token=access_token,
                refresh_token=refresh_token,
                expires_at=expires_at,
                scopes=scopes or [],
                account_email=account_email,
            )
            self.session.add(token)

        await self.session.commit()
        await self.session.refresh(token)
        return token

    async def delete_token(
        self, owner_id: uuid.UUID, provider: str = "google"
    ) -> None:
        """Remove OAuth connection token for owner and provider."""
        token = await self.get_token_record(owner_id, provider)
        if token:
            await self.session.delete(token)
            await self.session.commit()
            logger.info(f"Removed {provider} OAuth token for owner {owner_id}")
