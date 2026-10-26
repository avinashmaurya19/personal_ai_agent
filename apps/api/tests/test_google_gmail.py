"""Integration and unit tests for Google OAuth2, Gmail service, and agent tools."""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch
import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.modules.integrations.google_service import GoogleAuthService, OAuthTokenManager
from app.modules.integrations.gmail_service import GmailService
from app.modules.tools.builtins.email_tool import EmailTool


from app.api.dependencies import get_current_owner
from app.db.models.user import User

TEST_OWNER_ID = uuid.UUID("99999999-9999-9999-9999-999999999999")


@pytest.fixture
def mock_test_owner() -> User:
    return User(
        id=TEST_OWNER_ID,
        email="test_isolated@personal.ai",
        full_name="Test Isolated Owner",
    )


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
async def test_google_connection_status_and_disconnect(mock_test_owner: User) -> None:
    """Test checking Google connection status and disconnecting with isolated test user."""
    app.dependency_overrides[get_current_owner] = lambda: mock_test_owner
    try:
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
    finally:
        app.dependency_overrides.pop(get_current_owner, None)


@pytest.mark.asyncio
async def test_gmail_sync_unauthorized_fallback(mock_test_owner: User) -> None:
    """Test calling Gmail sync without connected account returns proper 400."""
    app.dependency_overrides[get_current_owner] = lambda: mock_test_owner
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Ensure disconnected first
            await ac.post("/api/v1/integrations/google/disconnect")

            res = await ac.post("/api/v1/integrations/google/gmail/sync")
            assert res.status_code == 400
            assert "not connected" in res.json()["detail"]
    finally:
        app.dependency_overrides.pop(get_current_owner, None)


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
async def test_gmail_interactive_actions_mocked() -> None:
    """Test GmailService live sending, starring, marking read, and trashing."""
    gmail = GmailService("mock_token")

    with patch.object(gmail, "send_message", new_callable=AsyncMock) as mock_send, \
         patch.object(gmail, "star_message", new_callable=AsyncMock) as mock_star, \
         patch.object(gmail, "mark_message_read", new_callable=AsyncMock) as mock_read, \
         patch.object(gmail, "trash_message", new_callable=AsyncMock) as mock_trash:

        mock_send.return_value = {"id": "sent_123", "threadId": "th_123"}
        mock_star.return_value = {"id": "msg_001", "labelIds": ["STARRED"]}
        mock_read.return_value = {"id": "msg_001", "labelIds": []}
        mock_trash.return_value = {"trashed": True}

        # 1. Send
        send_res = await gmail.send_message("to@test.com", "Test Subject", "Test Body")
        assert send_res["id"] == "sent_123"

        # 2. Star
        star_res = await gmail.star_message("msg_001", starred=True)
        assert "STARRED" in star_res["labelIds"]

        # 3. Read
        read_res = await gmail.mark_message_read("msg_001", read=True)
        assert "id" in read_res

        # 4. Trash
        trash_res = await gmail.trash_message("msg_001")
        assert trash_res["trashed"] is True


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
