"""FastAPI router for owner note CRUD and search."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.notes.schemas import NoteCreate, NoteResponse, NoteUpdate
from app.modules.notes.service import NoteService

router = APIRouter(prefix="/notes", tags=["Notes"])


def get_note_service(
    session: AsyncSession = Depends(get_db_session),
) -> NoteService:
    """Dependency producing NoteService instance."""
    return NoteService(session)


@router.get("", response_model=List[NoteResponse], summary="List or search notes")
async def list_notes(
    q: Optional[str] = Query(default=None, description="Search query across title and content"),
    tag: Optional[str] = Query(default=None, description="Filter by tag"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    owner: User = Depends(get_current_owner),
    service: NoteService = Depends(get_note_service),
) -> List[NoteResponse]:
    """Retrieve owner notes with optional keyword search and tag filtering."""
    return await service.list_notes(
        owner_id=owner.id,
        query=q,
        tag=tag,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new note",
)
async def create_note(
    payload: NoteCreate,
    owner: User = Depends(get_current_owner),
    service: NoteService = Depends(get_note_service),
) -> NoteResponse:
    """Create a new note for the owner."""
    return await service.create_note(owner_id=owner.id, data=payload)


@router.get("/{note_id}", response_model=NoteResponse, summary="Get single note")
async def get_note(
    note_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: NoteService = Depends(get_note_service),
) -> NoteResponse:
    """Retrieve details for a specific note."""
    return await service.get_note(owner_id=owner.id, note_id=note_id)


@router.patch("/{note_id}", response_model=NoteResponse, summary="Update note")
async def update_note(
    note_id: uuid.UUID,
    payload: NoteUpdate,
    owner: User = Depends(get_current_owner),
    service: NoteService = Depends(get_note_service),
) -> NoteResponse:
    """Update title, content, or tags of an existing note."""
    return await service.update_note(
        owner_id=owner.id,
        note_id=note_id,
        data=payload,
    )


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete note")
async def delete_note(
    note_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: NoteService = Depends(get_note_service),
) -> None:
    """Delete a note permanently."""
    await service.delete_note(owner_id=owner.id, note_id=note_id)
