"""Database models package aggregating declarative entities."""

from app.db.base import Base
from app.db.models.user import User
from app.db.models.conversation import Conversation
from app.db.models.message import Message
from app.db.models.tool_execution import ToolExecution
from app.db.models.memory import Memory
from app.db.models.document import Document, DocumentChunk
from app.db.models.task import Task
from app.db.models.note import Note
from app.db.models.email import EmailMessage
from app.db.models.calendar import CalendarEvent
from app.db.models.pending_action import PendingAction

__all__ = [
    "Base",
    "User",
    "Conversation",
    "Message",
    "ToolExecution",
    "Memory",
    "Document",
    "DocumentChunk",
    "Task",
    "Note",
    "EmailMessage",
    "CalendarEvent",
    "PendingAction",
]
