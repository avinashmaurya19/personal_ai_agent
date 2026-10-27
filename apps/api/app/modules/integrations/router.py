"""FastAPI router for Google OAuth2 connection, token callbacks, and Gmail integration."""

from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.config import settings
from app.core.exceptions import AppException
from app.db.models.email import EmailMessage
from app.db.models.user import User
from app.modules.integrations.gmail_service import GmailService
from app.modules.integrations.google_service import GoogleAuthService, OAuthTokenManager


class LiveGmailSendRequest(BaseModel):
    """Payload to dispatch an authentic outbound email via Gmail API."""

    recipient: str = Field(..., min_length=3)
    subject: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)
    thread_id: Optional[str] = None


class MessageLabelUpdateRequest(BaseModel):
    """Payload to toggle a message state (starred or read)."""

    value: bool = True

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

    # Determine accurate target owner ID using OAuth state parameter or user email
    target_owner_id = owner.id
    if state and state.startswith("owner_"):
        try:
            target_owner_id = uuid.UUID(state.replace("owner_", ""))
        except ValueError:
            pass
    elif email:
        matched_user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if matched_user:
            target_owner_id = matched_user.id

    token_mgr = OAuthTokenManager(session)
    await token_mgr.save_or_update_token(
        owner_id=target_owner_id,
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
        await gmail.sync_recent_to_db(session=session, owner_id=target_owner_id, max_results=5)
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


@router.post("/gmail/send", summary="Send live email via Gmail API")
async def send_live_gmail(
    payload: LiveGmailSendRequest,
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Send an outbound email directly through the owner's authorized Gmail account."""
    token_mgr = OAuthTokenManager(session)
    access_token = await token_mgr.get_valid_access_token(owner.id, "google")
    if not access_token:
        raise AppException("Google account is not connected. Authorize via /auth-url first.", status_code=400)

    gmail = GmailService(access_token=access_token)
    res = await gmail.send_message(
        recipient=payload.recipient,
        subject=payload.subject,
        body=payload.body,
        thread_id=payload.thread_id,
    )

    # Persist sent email to workspace database
    sent_msg = EmailMessage(
        owner_id=owner.id,
        thread_id=payload.thread_id or f"th_{res.get('id', 'sent')}",
        sender="me",
        recipient=payload.recipient,
        subject=payload.subject,
        body=payload.body,
        snippet=payload.body[:120],
        is_read=True,
        is_draft=False,
        sent_at=datetime.now(timezone.utc),
    )
    session.add(sent_msg)
    await session.commit()

    return {"status": "sent", "id": res.get("id"), "threadId": res.get("threadId"), "recipient": payload.recipient}


@router.post("/gmail/messages/{message_id}/star", summary="Toggle star status on Gmail message")
async def star_live_gmail_message(
    message_id: str,
    payload: Optional[MessageLabelUpdateRequest] = None,
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Star or unstar a message in Gmail."""
    token_mgr = OAuthTokenManager(session)
    access_token = await token_mgr.get_valid_access_token(owner.id, "google")
    if not access_token:
        raise AppException("Google account is not connected.", status_code=400)

    is_starred = payload.value if payload else True
    gmail = GmailService(access_token=access_token)
    res = await gmail.star_message(message_id, starred=is_starred)
    return {"status": "ok", "starred": is_starred, "id": message_id}


@router.post("/gmail/messages/{message_id}/read", summary="Toggle read status on Gmail message")
async def read_live_gmail_message(
    message_id: str,
    payload: Optional[MessageLabelUpdateRequest] = None,
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Mark a message as read or unread in Gmail."""
    token_mgr = OAuthTokenManager(session)
    access_token = await token_mgr.get_valid_access_token(owner.id, "google")
    if not access_token:
        raise AppException("Google account is not connected.", status_code=400)

    is_read = payload.value if payload else True
    gmail = GmailService(access_token=access_token)
    res = await gmail.mark_message_read(message_id, read=is_read)
    return {"status": "ok", "is_read": is_read, "id": message_id}


@router.post("/gmail/messages/{message_id}/trash", summary="Move Gmail message to trash")
async def trash_live_gmail_message(
    message_id: str,
    session: AsyncSession = Depends(get_db_session),
    owner: User = Depends(get_current_owner),
) -> Dict[str, Any]:
    """Move a message to Google Trash."""
    token_mgr = OAuthTokenManager(session)
    access_token = await token_mgr.get_valid_access_token(owner.id, "google")
    if not access_token:
        raise AppException("Google account is not connected.", status_code=400)

    gmail = GmailService(access_token=access_token)
    res = await gmail.trash_message(message_id)
    return {"status": "ok", "trashed": True, "id": message_id}
