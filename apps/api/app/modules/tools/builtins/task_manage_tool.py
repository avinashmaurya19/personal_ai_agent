"""Thread-safe tool for creating, listing, and completing personal tasks."""

from datetime import datetime, timezone
import json
import re
from typing import Literal, Optional, Type
import uuid
from crewai.tools import BaseTool
import psycopg
from pydantic import BaseModel, Field

from app.api.dependencies import DEV_OWNER_ID
from app.config import settings


class TaskManageInput(BaseModel):
    """Input parameters for managing tasks."""

    action: Literal["create", "list", "complete", "delete"] = Field(
        ...,
        description="Action to perform: 'create' a new task, 'list' existing tasks, 'complete' a task, or 'delete' a task.",
    )
    title: Optional[str] = Field(
        default=None,
        description="Title of the task (required when action is 'create')",
    )
    description: Optional[str] = Field(
        default="",
        description="Optional detailed description or context for the task",
    )
    priority: Optional[Literal["low", "medium", "high", "urgent"]] = Field(
        default="medium",
        description="Priority level (low, medium, high, urgent)",
    )
    due_date: Optional[str] = Field(
        default=None,
        description="Optional due date (e.g., '2026-10-30', '2026-10-30T17:00:00Z')",
    )
    task_id: Optional[str] = Field(
        default=None,
        description="UUID or title search term for the task (required for 'complete' or 'delete')",
    )
    status_filter: Optional[str] = Field(
        default=None,
        description="Optional filter for 'list' action: 'pending', 'in_progress', 'completed', or 'cancelled'",
    )


class TaskManageTool(BaseTool):
    """Tool allowing the agent to create, list, and complete tasks in the database."""

    name: str = "manage_tasks"
    description: str = (
        "Manages user tasks in the database. Use this tool whenever the user asks to create a task, "
        "add a to-do, remind them of something, list their tasks, check pending tasks, or mark a task as completed."
    )
    args_schema: Type[BaseModel] = TaskManageInput

    def _parse_due_date(self, due_str: Optional[str]) -> Optional[datetime]:
        """Safely parse due date string into UTC datetime."""
        if not due_str:
            return None
        cleaned = due_str.strip()
        try:
            # Handle ISO formats
            return datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        except Exception:
            # Match YYYY-MM-DD
            match = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", cleaned)
            if match:
                y, m, d = (int(x) for x in match.groups())
                return datetime(y, m, d, 23, 59, 59, tzinfo=timezone.utc)
            return None

    def _run(
        self,
        action: str,
        title: Optional[str] = None,
        description: Optional[str] = "",
        priority: str = "medium",
        due_date: Optional[str] = None,
        task_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        **kwargs: object,
    ) -> str:
        """Execute task operations using synchronous psycopg connection."""
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

        try:
            with psycopg.connect(db_url) as conn:
                with conn.cursor() as cur:
                    if action == "create":
                        if not title or not title.strip():
                            return "Error: A title is required to create a task."
                        new_id = uuid.uuid4()
                        parsed_due = self._parse_due_date(due_date)
                        cur.execute(
                            """
                            INSERT INTO tasks (id, owner_id, title, description, status, priority, due_date, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, 'pending', %s, %s, NOW(), NOW())
                            """,
                            (
                                str(new_id),
                                str(DEV_OWNER_ID),
                                title.strip(),
                                (description or "").strip() or None,
                                priority.lower(),
                                parsed_due,
                            ),
                        )
                        conn.commit()
                        due_fmt = f", Due: {parsed_due.strftime('%Y-%m-%d %H:%M UTC')}" if parsed_due else ""
                        return (
                            f"✅ Task created successfully!\n"
                            f"- ID: {new_id}\n"
                            f"- Title: {title.strip()}\n"
                            f"- Priority: {priority.upper()}{due_fmt}\n"
                            f"- Status: pending"
                        )

                    elif action == "list":
                        query = """
                            SELECT id, title, status, priority, due_date
                            FROM tasks
                            WHERE owner_id = %s
                        """
                        params = [str(DEV_OWNER_ID)]
                        if status_filter:
                            query += " AND status = %s"
                            params.append(status_filter.lower())
                        query += " ORDER BY due_date ASC NULLS LAST, created_at DESC LIMIT 10"

                        cur.execute(query, params)
                        rows = cur.fetchall()
                        if not rows:
                            filter_msg = f" with status '{status_filter}'" if status_filter else ""
                            return f"No tasks found{filter_msg}."

                        lines = [f"📋 Tasks ({len(rows)} found):"]
                        for r_id, r_title, r_status, r_priority, r_due in rows:
                            due_str = f" [Due: {r_due.strftime('%Y-%m-%d')}]" if r_due else ""
                            lines.append(f"- [{r_status.upper()}] {r_title} (Priority: {r_priority}{due_str}) (ID: {r_id})")
                        return "\n".join(lines)

                    elif action == "complete":
                        if not task_id or not task_id.strip():
                            return "Error: Provide task_id or task title to complete."
                        target = task_id.strip()
                        # Match by UUID or title
                        cur.execute(
                            """
                            UPDATE tasks
                            SET status = 'completed', completed_at = NOW(), updated_at = NOW()
                            WHERE owner_id = %s AND (id::text = %s OR title ILIKE %s)
                            RETURNING id, title
                            """,
                            (str(DEV_OWNER_ID), target, f"%{target}%"),
                        )
                        updated = cur.fetchone()
                        if not updated:
                            return f"No matching task found for '{target}'."
                        conn.commit()
                        return f"✅ Task completed: '{updated[1]}' (ID: {updated[0]})"

                    elif action == "delete":
                        if not task_id or not task_id.strip():
                            return "Error: Provide task_id or task title to delete."
                        target = task_id.strip()
                        cur.execute(
                            """
                            DELETE FROM tasks
                            WHERE owner_id = %s AND (id::text = %s OR title ILIKE %s)
                            RETURNING id, title
                            """,
                            (str(DEV_OWNER_ID), target, f"%{target}%"),
                        )
                        deleted = cur.fetchone()
                        if not deleted:
                            return f"No matching task found for '{target}'."
                        conn.commit()
                        return f"🗑️ Task deleted: '{deleted[1]}' (ID: {deleted[0]})"

                    else:
                        return f"Unknown action: '{action}'. Valid actions: create, list, complete, delete."

        except Exception as exc:
            return f"Database error managing task: {str(exc)}"
