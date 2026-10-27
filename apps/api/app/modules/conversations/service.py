"""Conversation and message domain service with native CrewAI LLM integration."""

import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.conversation import Conversation
from app.db.models.message import Message
from app.modules.agent.coordinator import AgentCoordinator
from app.modules.conversations.schemas import ConversationCreate, MessageCreate
from app.modules.llm.service import CrewAILLMService
from app.modules.memory.service import MemoryService


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
        provider = data.active_model_provider or settings.DEFAULT_MODEL_PROVIDER
        model = data.active_model_name or settings.DEFAULT_MODEL_NAME

        conversation = Conversation(
            owner_id=owner_id,
            title=title,
            active_model_provider=provider,
            active_model_name=model,
        )
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def update_conversation_model(
        self,
        conversation_id: uuid.UUID,
        owner_id: uuid.UUID,
        provider: str,
        model: str,
    ) -> Conversation:
        """Switch active model and provider for an existing conversation."""
        conversation = await self.get_conversation(conversation_id, owner_id)
        # Clean model name if passed with provider prefix (e.g. "mistral/open-mistral-7b" -> "open-mistral-7b")
        clean_model = model.strip() if model else ""
        while "/" in clean_model:
            prefix, remainder = clean_model.split("/", 1)
            if prefix.lower() in ("mistral", "ollama", "gemini", "openai"):
                clean_model = remainder
            else:
                break

        conversation.active_model_provider = provider.lower().strip()
        conversation.active_model_name = clean_model or model
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
        """Persist user message, generate response via CrewAI LLM, and persist assistant turn."""
        conversation = await self.get_conversation(conversation_id, owner_id)

        # Update title from prompt if default
        if conversation.title == "New Conversation" and data.content.strip():
            conversation.title = data.content[:40].strip() + ("..." if len(data.content) > 40 else "")

        # 1. Persist user message first (guarantees no loss on LLM failure)
        user_message = Message(
            conversation_id=conversation_id,
            role=data.role,
            content=data.content,
            token_count=len(data.content.split()),
        )
        self.session.add(user_message)
        await self.session.commit()
        await self.session.refresh(user_message)

        # 2. Build dialogue history for CrewAI LLM
        history_stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(10)
        )
        history_result = await self.session.execute(history_stmt)
        recent_messages = list(reversed(history_result.scalars().all()))

        chat_messages = [
            {"role": m.role if m.role in ("user", "assistant", "system") else "user", "content": m.content}
            for m in recent_messages
        ]

        # 3. Ingest candidate memories & retrieve personalized context
        memory_service = MemoryService(self.session)
        await memory_service.ingest_from_message(
            owner_id=owner_id,
            conversation_id=conversation_id,
            content=data.content,
        )
        memory_context = await memory_service.build_context_for_prompt(
            owner_id=owner_id,
            query=data.content,
        )

        # 4. Call Agent Coordinator (orchestrates CrewAI agent + memory context + audited tools)
        tool_calls: list[dict[str, Any]] = []
        tool_results: list[dict[str, Any]] = []

        try:
            assistant_content, tool_calls, tool_results = await AgentCoordinator.run_turn(
                conversation_id=conversation_id,
                user_prompt=data.content,
                dialogue_history=recent_messages,
                provider=conversation.active_model_provider,
                model_name=conversation.active_model_name,
                session=self.session,
                memory_context=memory_context,
                owner_id=owner_id,
            )
            token_count = len(assistant_content.split())
            logger.info(
                f"Agent turn completed [{conversation.active_model_provider}/{conversation.active_model_name}], "
                f"tools invoked: {len(tool_calls)}"
            )
        except Exception as e:
            logger.error(f"Error executing agent turn: {e}")
            assistant_content = (
                f"⚠️ Error from {conversation.active_model_provider.capitalize()}: {str(e)}\n\n"
                "*(Your message is saved. Check model settings or API credentials.)*"
            )
            token_count = 0

        # 4. Persist assistant reply
        assistant_reply = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=assistant_content,
            tool_calls=tool_calls if tool_calls else None,
            tool_results=tool_results if tool_results else None,
            token_count=token_count,
        )
        self.session.add(assistant_reply)
        await self.session.commit()
        await self.session.refresh(assistant_reply)

        return assistant_reply
