"""Integration tests for conversations and message persistence."""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.db.models.conversation import Conversation
from app.db.models.user import User
from app.db.session import async_session_factory


@pytest.mark.asyncio
async def test_conversation_lifecycle_and_persistence() -> None:
    """Test creating conversation, posting messages, and fetching history."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create a conversation
        create_res = await client.post(
            "/api/v1/conversations",
            json={
                "title": "Test AI Chat",
                "active_model_provider": "ollama",
                "active_model_name": "llama3.2",
            },
        )
        assert create_res.status_code == 201
        conv_data = create_res.json()
        conv_id = conv_data["id"]
        assert conv_data["title"] == "Test AI Chat"

        # 2. List conversations
        list_res = await client.get("/api/v1/conversations")
        assert list_res.status_code == 200
        conversations = list_res.json()
        assert any(c["id"] == conv_id for c in conversations)

        # 3. Post a message to conversation
        msg_res = await client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"content": "Hello, assistant!"},
        )
        assert msg_res.status_code == 201
        assistant_reply = msg_res.json()
        assert assistant_reply["role"] == "assistant"
        assert len(assistant_reply["content"]) > 0

        # 4. Fetch messages history
        history_res = await client.get(f"/api/v1/conversations/{conv_id}/messages")
        assert history_res.status_code == 200
        messages = history_res.json()
        assert len(messages) >= 2
        assert messages[0]["role"] == "user"
        assert messages[0]["content"] == "Hello, assistant!"
        assert messages[1]["role"] == "assistant"


@pytest.mark.asyncio
async def test_conversation_ownership_protection() -> None:
    """Verify that a conversation owned by another user cannot be accessed."""
    other_owner_id = uuid.uuid4()

    # Manually create a conversation owned by a different user
    async with async_session_factory() as session:
        other_user = User(
            id=other_owner_id,
            email=f"other-{other_owner_id}@test.com",
            full_name="Other User",
            preferences={},
        )
        session.add(other_user)
        other_conv = Conversation(
            id=uuid.uuid4(),
            owner_id=other_owner_id,
            title="Private Conversation",
        )
        session.add(other_conv)
        await session.commit()
        other_conv_id = other_conv.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Default dev owner should receive 403 Forbidden
        res = await client.get(f"/api/v1/conversations/{other_conv_id}")
        assert res.status_code == 403
        assert "access" in res.json()["detail"].lower()
