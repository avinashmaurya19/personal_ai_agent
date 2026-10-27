"""Thread-safe tool for creating, searching, and managing personal notes."""

import json
from typing import List, Literal, Optional, Type
import uuid
from crewai.tools import BaseTool
import psycopg
from pydantic import BaseModel, Field

from app.core.context import get_current_owner_id
from app.config import settings


class NoteManageInput(BaseModel):
    """Input parameters for managing notes."""

    action: Literal["create", "search", "list"] = Field(
        ...,
        description="Action to perform: 'create' a new note, 'search' notes by keyword, or 'list' recent notes.",
    )
    title: Optional[str] = Field(
        default=None,
        description="Title or subject of the note (required when action is 'create')",
    )
    content: Optional[str] = Field(
        default=None,
        description="Main body or content of the note (required when action is 'create')",
    )
    tags: Optional[List[str]] = Field(
        default_factory=list,
        description="Optional list of tags for categorization (e.g. ['project', 'ideas'])",
    )
    query: Optional[str] = Field(
        default=None,
        description="Keyword to search for across note titles and content (used when action is 'search')",
    )


class NoteManageTool(BaseTool):
    """Tool allowing the agent to save, search, and recall notes in the database."""

    name: str = "manage_notes"
    description: str = (
        "Manages personal notes and snippets in the database. Use this tool when the user asks to save a note, "
        "record thoughts/meeting notes, search notes, or recall notes about a topic."
    )
    args_schema: Type[BaseModel] = NoteManageInput

    def _run(
        self,
        action: str,
        title: Optional[str] = None,
        content: Optional[str] = None,
        tags: Optional[List[str]] = None,
        query: Optional[str] = None,
        **kwargs: object,
    ) -> str:
        """Execute note operations using synchronous psycopg connection."""
        owner_id_str = str(get_current_owner_id())
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

        try:
            with psycopg.connect(db_url) as conn:
                with conn.cursor() as cur:
                    if action == "create":
                        if not title or not title.strip():
                            return "Error: A title is required to create a note."
                        if not content or not content.strip():
                            return "Error: Content is required to create a note."
                        new_id = uuid.uuid4()
                        clean_tags = [t.strip().lower() for t in (tags or []) if t.strip()]
                        cur.execute(
                            """
                            INSERT INTO notes (id, owner_id, title, content, tags, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                            """,
                            (
                                str(new_id),
                                owner_id_str,
                                title.strip(),
                                content.strip(),
                                json.dumps(clean_tags),
                            ),
                        )
                        conn.commit()
                        tags_str = f" [Tags: {', '.join(clean_tags)}]" if clean_tags else ""
                        return (
                            f"📝 Note saved successfully!\n"
                            f"- ID: {new_id}\n"
                            f"- Title: {title.strip()}{tags_str}"
                        )

                    elif action == "search":
                        target_q = (query or title or "").strip()
                        if not target_q:
                            return "Error: Provide a query term to search notes."

                        cur.execute(
                            """
                            SELECT id, title, content, tags, updated_at
                            FROM notes
                            WHERE owner_id = %s AND (title ILIKE %s OR content ILIKE %s)
                            ORDER BY updated_at DESC
                            LIMIT 5
                            """,
                            (owner_id_str, f"%{target_q}%", f"%{target_q}%"),
                        )
                        rows = cur.fetchall()
                        if not rows:
                            return f"No notes found matching '{target_q}'."

                        lines = [f"🔍 Notes matching '{target_q}' ({len(rows)} found):"]
                        for r_id, r_title, r_content, r_tags, r_upd in rows:
                            snippet = r_content[:150] + ("..." if len(r_content) > 150 else "")
                            tags_display = f" [Tags: {', '.join(r_tags)}]" if r_tags else ""
                            lines.append(f"- **{r_title}**{tags_display}:\n  \"{snippet}\"")
                        return "\n".join(lines)

                    elif action == "list":
                        cur.execute(
                            """
                            SELECT id, title, content, tags, updated_at
                            FROM notes
                            WHERE owner_id = %s
                            ORDER BY updated_at DESC
                            LIMIT 5
                            """,
                            (owner_id_str,),
                        )
                        rows = cur.fetchall()
                        if not rows:
                            return "No notes found."

                        lines = [f"📝 Recent Notes ({len(rows)} found):"]
                        for r_id, r_title, r_content, r_tags, r_upd in rows:
                            tags_display = f" [Tags: {', '.join(r_tags)}]" if r_tags else ""
                            lines.append(f"- {r_title}{tags_display} (Updated: {r_upd.strftime('%Y-%m-%d')})")
                        return "\n".join(lines)

                    else:
                        return f"Unknown action: '{action}'. Valid actions: create, search, list."

        except Exception as exc:
            return f"Database error managing note: {str(exc)}"
