"""Conversation and message domain service."""

import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.db.models.conversation import Conversation
from app.db.models.message import Message
from app.modules.conversations.schemas import ConversationCreate, MessageCreate


class ConversationService:
    """Business logic for conversations and chat turns."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_conversations(self, owner_id: uuid.UUID) -> List[Conversation]:
        """List all conversations belonging to the owner, ordered by updated_at desc."""
        stmt = (
            select(Conversation)
            .where(Conversation.owner_id == owner_id)
            .order_by(Conversation.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_conversation(
        self, owner_id: uuid.UUID, data: ConversationCreate
    ) -> Conversation:
        """Create a new conversation session."""
        title = data.title or "New Conversation"
        conversation = Conversation(
            owner_id=owner_id,
            title=title,
            active_model_provider=data.active_model_provider,
            active_model_name=data.active_model_name,
        )
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def get_conversation(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID
    ) -> Conversation:
        """Retrieve a specific conversation enforcing ownership checks."""
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        result = await self.session.execute(stmt)
        conversation = result.scalar_one_or_none()

        if conversation is None:
            raise NotFoundError("Conversation", conversation_id)

        if conversation.owner_id != owner_id:
            raise PermissionDeniedError("You do not have access to this conversation.")

        return conversation

    async def delete_conversation(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID
    ) -> None:
        """Delete conversation and all its cascade-associated messages."""
        conversation = await self.get_conversation(conversation_id, owner_id)
        await self.session.delete(conversation)
        await self.session.commit()

    async def list_messages(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID
    ) -> List[Message]:
        """Fetch all messages for a conversation in chronological order."""
        # Ensure conversation exists and belongs to owner
        await self.get_conversation(conversation_id, owner_id)

        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_user_message(
        self, conversation_id: uuid.UUID, owner_id: uuid.UUID, data: MessageCreate
    ) -> Message:
        """Persist user message and generate a placeholder assistant acknowledgement for Sprint 1."""
        conversation = await self.get_conversation(conversation_id, owner_id)

        # Update conversation title from first user prompt if still default
        if conversation.title == "New Conversation" and data.content.strip():
            conversation.title = data.content[:40].strip() + ("..." if len(data.content) > 40 else "")

        user_message = Message(
            conversation_id=conversation_id,
            role=data.role,
            content=data.content,
            token_count=len(data.content.split()),
        )
        self.session.add(user_message)

        # In Sprint 1, before LLM Gateway (Sprint 2) is connected, create an assistant acknowledgement
        assistant_reply = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=f"Received: \"{data.content}\"\n\n*(Assistant message persistence active. Provider integration coming in Sprint 2)*",
            token_count=15,
        )
        self.session.add(assistant_reply)

        await self.session.commit()
        await self.session.refresh(user_message)
        await self.session.refresh(assistant_reply)

        return assistant_reply
