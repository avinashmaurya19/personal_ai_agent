"""Thread-safe tool for creating, listing, updating, and completing personal tasks."""

from datetime import datetime, timedelta, timezone
import json
import re
from typing import Literal, Optional, Type
import uuid
from crewai.tools import BaseTool
import psycopg
from pydantic import BaseModel, Field

from app.core.context import get_current_owner_id
from app.config import settings


class TaskManageInput(BaseModel):
    """Input parameters for managing tasks."""

    action: Literal["create", "list", "complete", "delete", "clear", "delete_all", "update", "reschedule"] = Field(
        ...,
        description="Action to perform: 'create' a new task, 'update'/'reschedule' an existing task, 'list' tasks, 'complete' a task, 'delete' a task, or 'clear'/'delete_all' to delete multiple tasks.",
    )
    title: Optional[str] = Field(
        default=None,
        description="Title of the task (required when action is 'create', optional for 'update')",
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
        description="Optional due date (e.g. 'tomorrow', '2026-10-28', '2026-10-28T17:00:00Z')",
    )
    task_id: Optional[str] = Field(
        default=None,
        description="UUID, title search term, or 'first'/'latest' for the task to update/complete/delete",
    )
    status_filter: Optional[str] = Field(
        default=None,
        description="Optional filter for 'list', 'delete', or 'clear' action: 'pending', 'in_progress', 'completed', or 'all'",
    )


class TaskManageTool(BaseTool):
    """Tool allowing the agent to create, list, update, complete, and delete tasks in the database."""

    name: str = "manage_tasks"
    description: str = (
        "Manages user tasks in the database. Use this tool whenever the user asks to create a task, "
        "update or reschedule an existing task (action='update' or 'reschedule'), change a task's due date or priority, "
        "list tasks, check pending tasks, mark a task as completed, delete a task, or clear all tasks. "
        "CRITICAL: When the user asks to update, edit, or change an existing task, ALWAYS use action='update' "
        "with task_id set to the task's title or ID. NEVER call action='create' when updating an existing task."
    )
    args_schema: Type[BaseModel] = TaskManageInput

    def _parse_due_date(self, due_str: Optional[str]) -> Optional[datetime]:
        """Safely parse due date string into UTC datetime, handling relative and ISO strings."""
        if not due_str:
            return None
        cleaned = due_str.strip().lower()
        now = datetime.now(timezone.utc)

        if cleaned in ("today", "now"):
            return now.replace(hour=23, minute=59, second=59, microsecond=0)
        if cleaned in ("tomorrow", "tmrw"):
            return (now + timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=0)
        if cleaned == "yesterday":
            return (now - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=0)

        # Match in X days
        m_days = re.match(r"^in\s+(\d+)\s+days?$", cleaned)
        if m_days:
            days_count = int(m_days.group(1))
            return (now + timedelta(days=days_count)).replace(hour=23, minute=59, second=59, microsecond=0)

        try:
            # Handle ISO formats
            parsed_iso = datetime.fromisoformat(due_str.strip().replace("Z", "+00:00"))
            if parsed_iso.year < now.year:
                parsed_iso = parsed_iso.replace(year=now.year)
            return parsed_iso
        except Exception:
            pass

        # Match YYYY-MM-DD
        match = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", due_str.strip())
        if match:
            y, m, d = (int(x) for x in match.groups())
            if y < now.year:
                y = now.year
            return datetime(y, m, d, 23, 59, 59, tzinfo=timezone.utc)

        # Match Month Name Day (e.g. "October 28" or "28 October")
        for month_num, month_name in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1):
            if month_name in cleaned:
                digits = re.findall(r"\d+", cleaned)
                if digits:
                    day = int(digits[0])
                    year = now.year
                    if len(digits) > 1 and int(digits[1]) >= 2020:
                        year = max(now.year, int(digits[1]))
                    try:
                        return datetime(year, month_num, day, 23, 59, 59, tzinfo=timezone.utc)
                    except ValueError:
                        pass

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
        owner_id_str = str(get_current_owner_id())
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
                                owner_id_str,
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
                        params = [owner_id_str]
                        if status_filter and status_filter.lower() not in ("all", "*", "any"):
                            query += " AND status = %s"
                            params.append(status_filter.lower())
                        query += " ORDER BY due_date ASC NULLS LAST, created_at DESC LIMIT 10"

                        cur.execute(query, params)
                        rows = cur.fetchall()
                        if not rows:
                            filter_msg = (
                                f" with status '{status_filter}'"
                                if status_filter and status_filter.lower() not in ("all", "*", "any")
                                else ""
                            )
                            return f"No tasks found{filter_msg}."

                        lines = [f"📋 Tasks ({len(rows)} found):"]
                        for r_id, r_title, r_status, r_priority, r_due in rows:
                            due_str = f" [Due: {r_due.strftime('%Y-%m-%d')}]" if r_due else ""
                            lines.append(f"- [{r_status.upper()}] {r_title} (Priority: {r_priority}{due_str}) (ID: {r_id})")
                        return "\n".join(lines)

                    elif action == "complete":
                        target = (task_id or "").strip()
                        if not target:
                            return "Error: Provide task_id or task title to complete."

                        if target.lower() in ("all", "*", "everything", "all tasks", "pending"):
                            cur.execute(
                                """
                                UPDATE tasks
                                SET status = 'completed', completed_at = NOW(), updated_at = NOW()
                                WHERE owner_id = %s AND status = 'pending'
                                RETURNING id, title
                                """,
                                (owner_id_str,),
                            )
                            updated_rows = cur.fetchall()
                            conn.commit()
                            if not updated_rows:
                                return "No pending tasks found to complete."
                            lines = [f"✅ Successfully completed {len(updated_rows)} task(s):"]
                            for u_id, u_title in updated_rows:
                                lines.append(f"- {u_title} (ID: {u_id})")
                            return "\n".join(lines)

                        # Match single task by UUID or title
                        cur.execute(
                            """
                            UPDATE tasks
                            SET status = 'completed', completed_at = NOW(), updated_at = NOW()
                            WHERE owner_id = %s AND (id::text = %s OR title ILIKE %s)
                            RETURNING id, title
                            """,
                            (owner_id_str, target, f"%{target}%"),
                        )
                        updated = cur.fetchone()
                        if not updated:
                            return f"No matching task found for '{target}'."
                        conn.commit()
                        return f"✅ Task completed: '{updated[1]}' (ID: {updated[0]})"

                    elif action in ("delete", "clear", "delete_all"):
                        target = (task_id or "").strip()
                        is_bulk = (
                            action in ("clear", "delete_all")
                            or target.lower() in ("all", "*", "everything", "all tasks", "pending", "completed")
                        )

                        if is_bulk:
                            query = "DELETE FROM tasks WHERE owner_id = %s"
                            params = [owner_id_str]

                            eff_filter = status_filter
                            if not eff_filter and target.lower() in ("pending", "completed"):
                                eff_filter = target.lower()

                            if eff_filter and eff_filter.lower() != "all":
                                query += " AND status = %s"
                                params.append(eff_filter.lower())

                            query += " RETURNING id, title"
                            cur.execute(query, params)
                            deleted_rows = cur.fetchall()
                            conn.commit()

                            if not deleted_rows:
                                return "No matching tasks found to delete."
                            lines = [f"🗑️ Successfully deleted {len(deleted_rows)} task(s):"]
                            for d_id, d_title in deleted_rows:
                                lines.append(f"- {d_title} (ID: {d_id})")
                            return "\n".join(lines)

                        if not target:
                            return "Error: Provide task_id or task title to delete, or use 'all' to delete all tasks."

                        # Single deletion by UUID or title
                        cur.execute(
                            """
                            DELETE FROM tasks
                            WHERE owner_id = %s AND (id::text = %s OR title ILIKE %s)
                            RETURNING id, title
                            """,
                            (owner_id_str, target, f"%{target}%"),
                        )
                        deleted = cur.fetchone()
                        if not deleted:
                            return f"No matching task found for '{target}'."
                        conn.commit()
                        return f"🗑️ Task deleted: '{deleted[1]}' (ID: {deleted[0]})"

                    elif action in ("update", "reschedule", "modify", "edit"):
                        target = (task_id or title or "").strip()
                        if not target:
                            return "Error: Provide task_id or title search term for the task to update."

                        # 1. Locate the task
                        if target.lower() in ("first", "1st", "latest", "recent", "most recent", "first task"):
                            cur.execute(
                                """
                                SELECT id, title, description, priority, due_date, status
                                FROM tasks
                                WHERE owner_id = %s
                                ORDER BY created_at DESC
                                LIMIT 1
                                """,
                                (owner_id_str,),
                            )
                        else:
                            cur.execute(
                                """
                                SELECT id, title, description, priority, due_date, status
                                FROM tasks
                                WHERE owner_id = %s AND (id::text = %s OR title ILIKE %s)
                                ORDER BY created_at DESC
                                LIMIT 1
                                """,
                                (owner_id_str, target, f"%{target}%"),
                            )

                        existing = cur.fetchone()
                        if not existing:
                            return f"No matching task found for '{target}' to update."

                        e_id, e_title, e_desc, e_prio, e_due, e_status = existing

                        # 2. Determine updated fields
                        new_title = e_title
                        if title and title.strip() and title.strip().lower() not in ("first", "1st", "latest", "update", target.lower()):
                            new_title = title.strip()

                        new_desc = description.strip() if description and description.strip() else e_desc
                        new_prio = priority.lower() if priority and priority.lower() in ("low", "medium", "high", "urgent") else e_prio

                        parsed_due = self._parse_due_date(due_date) if due_date else e_due
                        new_status = status_filter.lower() if status_filter and status_filter.lower() in ("pending", "in_progress", "completed", "cancelled") else e_status

                        cur.execute(
                            """
                            UPDATE tasks
                            SET title = %s, description = %s, priority = %s, due_date = %s, status = %s, updated_at = NOW()
                            WHERE id = %s AND owner_id = %s
                            RETURNING id, title, priority, due_date, status
                            """,
                            (new_title, new_desc, new_prio, parsed_due, new_status, str(e_id), owner_id_str),
                        )
                        updated = cur.fetchone()
                        conn.commit()

                        due_str = f"Due: {updated[3].strftime('%Y-%m-%d')}" if updated[3] else "No due date"
                        return (
                            f"✅ Task updated successfully!\n"
                            f"- ID: {updated[0]}\n"
                            f"- Title: {updated[1]}\n"
                            f"- Priority: {updated[2].upper()}\n"
                            f"- {due_str}\n"
                            f"- Status: {updated[4]}"
                        )

                    else:
                        return f"Unknown action: '{action}'. Valid actions: create, list, update, complete, delete, clear."

        except Exception as exc:
            return f"Database error managing task: {str(exc)}"
