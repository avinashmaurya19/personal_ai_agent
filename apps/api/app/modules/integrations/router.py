"""FastAPI router for Google OAuth2 connection, token callbacks, and Gmail integration."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.config import settings
from app.core.exceptions import AppException
from app.db.models.user import User
from app.modules.integrations.gmail_service import GmailService
from app.modules.integrations.google_service import GoogleAuthService, OAuthTokenManager

router = APIRouter(prefix="/integrations/google", tags=["Google & Gmail Integration"])


@router.get("/auth-url", summary="Get Google OAuth authorization URL")
async def get_google_auth_url(
    owner: User = Depends(get_current_owner),
) -> Dict[str, str]:
    """Generate the Google OAuth2 consent screen URL."""
    state = f"owner_{owner.id}"
    url = GoogleAuthService.get_authorization_url(state=state)
    return {"auth_url": url, "authorization_url": url}


@router.get("/callback", summary="Google OAuth redirect callback")
async def google_oauth_callback(
    code: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> RedirectResponse:
    """Handle Google OAuth2 code redirect, exchange for tokens, and persist."""
    if error:
        redirect_url = f"{settings.FRONTEND_URL}?google_error={error}"
        return RedirectResponse(url=redirect_url)

    if not code:
        raise AppException("Missing authorization code in Google callback.", status_code=400)

    token_data = await GoogleAuthService.exchange_code_for_tokens(code)
    access_token = token_data.get("access_token", "")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    scopes = token_data.get("scope", "").split()

    # Fetch Google account email
    email = await GoogleAuthService.get_user_email(access_token)

    token_mgr = OAuthTokenManager(session)
    await token_mgr.save_or_update_token(
        owner_id=owner.id,
        provider="google",
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        scopes=scopes,
        account_email=email,
    )

    # Automatically sync initial batch of messages if possible
    try:
        gmail = GmailService(access_token=access_token)
        await gmail.sync_recent_to_db(session=session, owner_id=owner.id, max_results=5)
    except Exception:
        pass

    redirect_url = f"{settings.FRONTEND_URL}?google_connected=true"
    return RedirectResponse(url=redirect_url)


@router.get("/status", summary="Check Google connection status")
async def get_google_status(
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Check whether Google / Gmail is connected for the owner."""
    token_mgr = OAuthTokenManager(session)
    token = await token_mgr.get_token_record(owner.id, "google")
    if not token:
        return {"connected": False, "provider": "google"}

    return {
        "connected": True,
        "provider": "google",
        "account_email": token.account_email,
        "email": token.account_email,
        "scopes": token.scopes,
        "expires_at": token.expires_at.isoformat() if token.expires_at else None,
    }


@router.post("/disconnect", summary="Disconnect Google account")
async def disconnect_google(
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Revoke stored Google tokens and disconnect integration."""
    token_mgr = OAuthTokenManager(session)
    await token_mgr.delete_token(owner.id, "google")
    return {"disconnected": True, "success": True, "message": "Google disconnected successfully."}


@router.post("/gmail/sync", summary="Synchronize live Gmail messages to workspace")
async def sync_gmail_messages(
    max_results: int = Query(default=10, ge=1, le=50),
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Fetch recent live Gmail messages and cache into workspace mailbox."""
    token_mgr = OAuthTokenManager(session)
    access_token = await token_mgr.get_valid_access_token(owner.id, "google")
    if not access_token:
        raise AppException("Google account is not connected. Authorize via /auth-url first.", status_code=400)

    gmail = GmailService(access_token=access_token)
    imported = await gmail.sync_recent_to_db(session=session, owner_id=owner.id, max_results=max_results)
    return {"status": "ok", "imported_count": imported}


@router.get("/gmail/search", summary="Search live Gmail inbox")
async def search_live_gmail(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=10, ge=1, le=30),
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> List[Dict[str, Any]]:
    """Query live Gmail inbox using standard Gmail search syntax."""
    token_mgr = OAuthTokenManager(session)
    access_token = await token_mgr.get_valid_access_token(owner.id, "google")
    if not access_token:
        raise AppException("Google account is not connected.", status_code=400)

    gmail = GmailService(access_token=access_token)
    return await gmail.search_emails(query=q, max_results=limit)
