"""Note domain service managing note storage, tag indexing, and keyword search."""

from typing import List, Optional
import uuid
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.note import Note
from app.modules.notes.schemas import NoteCreate, NoteUpdate


class NoteService:
    """Manages rich personal notes, tag indexing, and retrieval."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_notes(
        self,
        owner_id: uuid.UUID,
        query: Optional[str] = None,
        tag: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Note]:
        """List notes for owner with optional keyword search and tag filtering."""
        stmt = (
            select(Note)
            .where(Note.owner_id == owner_id)
            .order_by(Note.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if query:
            clean_q = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    Note.title.ilike(clean_q),
                    Note.content.ilike(clean_q),
                )
            )

        if tag:
            # PostgreSQL JSONB array containment: tags @> '["tag"]'
            stmt = stmt.where(Note.tags.contains([tag.strip().lower()]))

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_note(self, owner_id: uuid.UUID, note_id: uuid.UUID) -> Note:
        """Retrieve a single note verifying owner ownership."""
        stmt = select(Note).where(Note.id == note_id)
        result = await self.session.execute(stmt)
        note = result.scalar_one_or_none()
        if not note:
            raise NotFoundError("Note", note_id)
        if note.owner_id != owner_id:
            raise PermissionDeniedError("Access to this note is denied")
        return note

    async def create_note(self, owner_id: uuid.UUID, data: NoteCreate) -> Note:
        """Create a new personal note."""
        clean_tags = [t.strip().lower() for t in data.tags if t.strip()]
        note = Note(
            owner_id=owner_id,
            title=data.title.strip(),
            content=data.content.strip(),
            tags=clean_tags,
            source_conversation_id=data.source_conversation_id,
        )
        self.session.add(note)
        await self.session.commit()
        await self.session.refresh(note)
        logger.info(f"Created note {note.id}: {note.title}")
        return note

    async def update_note(
        self, owner_id: uuid.UUID, note_id: uuid.UUID, data: NoteUpdate
    ) -> Note:
        """Update fields of an existing note."""
        note = await self.get_note(owner_id, note_id)

        if data.title is not None:
            note.title = data.title.strip()
        if data.content is not None:
            note.content = data.content.strip()
        if data.tags is not None:
            note.tags = [t.strip().lower() for t in data.tags if t.strip()]

        await self.session.commit()
        await self.session.refresh(note)
        return note

    async def delete_note(self, owner_id: uuid.UUID, note_id: uuid.UUID) -> None:
        """Delete an existing note."""
        note = await self.get_note(owner_id, note_id)
        await self.session.delete(note)
        await self.session.commit()
        logger.info(f"Deleted note {note_id}")
