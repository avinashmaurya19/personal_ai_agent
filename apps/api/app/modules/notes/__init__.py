"""Notes module initialization."""

from app.modules.notes.router import router
from app.modules.notes.schemas import NoteCreate, NoteResponse, NoteUpdate
from app.modules.notes.service import NoteService

__all__ = ["router", "NoteCreate", "NoteResponse", "NoteUpdate", "NoteService"]
