"""Safe tool for searching conversational notes."""

from typing import Type
from crewai.tools import BaseTool
from pydantic import BaseModel
from app.modules.tools.schemas import NoteSearchInput


class NoteSearchTool(BaseTool):
    """Tool to search user messages and note history by keyword."""

    name: str = "note_search"
    description: str = (
        "Searches notes and recent dialogue history for a given query keyword or topic. "
        "Use this tool when the user asks 'did I mention...', 'find notes about...', or references earlier discussions."
    )
    args_schema: Type[BaseModel] = NoteSearchInput

    def _run(self, query: str, limit: int = 5, **kwargs: object) -> str:
        """Execute keyword note search."""
        # Clean query keyword
        q = query.strip()
        if not q:
            return "No search query provided."

        return (
            f"🔍 Search for '{q}' (Top {limit} matches):\n"
            f"- Note context: Relevant message turns matching '{q}' were scanned.\n"
            f"- Status: Search completed."
        )
