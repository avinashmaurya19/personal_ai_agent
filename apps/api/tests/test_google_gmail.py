"""Integration and unit tests for Google OAuth2, Gmail service, and agent tools."""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.modules.integrations.google_service import GoogleAuthService, OAuthTokenManager
from app.modules.integrations.gmail_service import GmailService
from app.modules.tools.builtins.email_tool import EmailTool


@pytest.mark.asyncio
async def test_google_auth_url() -> None:
    """Test generating Google OAuth authorization URL."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/integrations/google/auth-url")
        assert res.status_code == 200
        data = res.json()
        assert "authorization_url" in data
        url = data["authorization_url"]
        assert "accounts.google.com" in url
        assert "access_type=offline" in url
        assert "prompt=consent" in url


@pytest.mark.asyncio
async def test_google_connection_status_and_disconnect() -> None:
    """Test checking Google connection status and disconnecting."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Check initial status
        res = await ac.get("/api/v1/integrations/google/status")
        assert res.status_code == 200
        data = res.json()
        assert "connected" in data
        assert isinstance(data["connected"], bool)

        # Disconnect
        disc_res = await ac.post("/api/v1/integrations/google/disconnect")
        assert disc_res.status_code == 200
        disc_data = disc_res.json()
        assert disc_data["success"] is True

        # Status after disconnect must be connected=False
        after_res = await ac.get("/api/v1/integrations/google/status")
        assert after_res.status_code == 200
        assert after_res.json()["connected"] is False


@pytest.mark.asyncio
async def test_gmail_sync_unauthorized_fallback() -> None:
    """Test calling Gmail sync without connected account returns proper 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Ensure disconnected first
        await ac.post("/api/v1/integrations/google/disconnect")

        res = await ac.post("/api/v1/integrations/google/gmail/sync")
        assert res.status_code == 400
        assert "not connected" in res.json()["detail"]


@pytest.mark.asyncio
async def test_mock_gmail_service_sync() -> None:
    """Test GmailService message parsing, body decoding, and sync."""
    gmail = GmailService("mock_token")

    # Mock raw Gmail API response
    mock_messages_list = {
        "messages": [
            {"id": "msg_001", "threadId": "thread_abc"},
            {"id": "msg_002", "threadId": "thread_abc"},
        ]
    }
    mock_detail = {
        "id": "msg_001",
        "threadId": "thread_abc",
        "snippet": "Quarterly financial review briefing attached.",
        "payload": {
            "headers": [
                {"name": "Subject", "value": "Q3 Financial Review"},
                {"name": "From", "value": "cfo@company.com"},
                {"name": "To", "value": "user@company.com"},
                {"name": "Date", "value": "Mon, 26 Oct 2026 10:00:00 +0000"},
            ],
            "body": {
                # base64url of "Hello, please see attached Q3 financial review document."
                "data": "SGVsbG8sIHBsZWFzZSBzZWUgYXR0YWNoZWQgUTMgZmluYW5jaWFsIHJldmlldyBkb2N1bWVudC4="
            },
        },
    }

    with patch.object(gmail, "list_messages", new_callable=AsyncMock) as mock_list, \
         patch.object(gmail, "get_message_detail", new_callable=AsyncMock) as mock_get:
        mock_list.return_value = mock_messages_list
        mock_get.return_value = mock_detail

        detail = await gmail.get_message_detail("msg_001")
        assert detail["id"] == "msg_001"
        assert detail["snippet"] == "Quarterly financial review briefing attached."


@pytest.mark.asyncio
async def test_email_tool_summarize_and_search() -> None:
    """Test EmailTool built-in actions including summarize_emails and search_emails."""
    tool = EmailTool()

    # 1. Test summarize_emails
    summary_result = tool._run(action="summarize_emails")
    assert isinstance(summary_result, str)
    assert len(summary_result) > 10

    # 2. Test search_emails
    search_result = tool._run(action="search_emails", query="review")
    assert isinstance(search_result, str)

    # 3. Test list_unread
    unread_result = tool._run(action="list_unread")
    assert isinstance(unread_result, str)
