"""FastAPI router for conversations and message turns."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.conversations.schemas import (
    ConversationCreate,
    ConversationModelUpdate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from app.modules.conversations.service import ConversationService

router = APIRouter(prefix="/conversations", tags=["Conversations"])


def get_conversation_service(
    session: AsyncSession = Depends(get_db_session),
) -> ConversationService:
    """Dependency producing ConversationService instance."""
    return ConversationService(session)


@router.get("", response_model=List[ConversationResponse], summary="List owner conversations")
async def list_conversations(
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> List[ConversationResponse]:
    """Retrieve all conversations belonging to the authenticated owner."""
    return await service.list_conversations(owner.id)


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation",
)
async def create_conversation(
    payload: ConversationCreate,
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    """Create a new chat conversation session."""
    return await service.create_conversation(owner.id, payload)


@router.get("/{conversation_id}", response_model=ConversationResponse, summary="Get conversation details")
async def get_conversation(
    conversation_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    """Retrieve conversation metadata by ID."""
    return await service.get_conversation(conversation_id, owner.id)


@router.patch(
    "/{conversation_id}/model",
    response_model=ConversationResponse,
    summary="Update conversation active model",
)
async def update_conversation_model(
    conversation_id: uuid.UUID,
    payload: ConversationModelUpdate,
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> ConversationResponse:
    """Switch the model provider or model name for this conversation."""
    return await service.update_conversation_model(
        conversation_id, owner.id, payload.active_model_provider, payload.active_model_name
    )


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete conversation",
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> None:
    """Delete a conversation and all its associated messages."""
    await service.delete_conversation(conversation_id, owner.id)


@router.get(
    "/{conversation_id}/messages",
    response_model=List[MessageResponse],
    summary="List conversation messages",
)
async def list_messages(
    conversation_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> List[MessageResponse]:
    """Retrieve all messages in a conversation in chronological order."""
    return await service.list_messages(conversation_id, owner.id)


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send message into conversation",
)
async def send_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    owner: User = Depends(get_current_owner),
    service: ConversationService = Depends(get_conversation_service),
) -> MessageResponse:
    """Post a user message into the conversation and return the persisted assistant response."""
    return await service.add_user_message(conversation_id, owner.id, payload)
