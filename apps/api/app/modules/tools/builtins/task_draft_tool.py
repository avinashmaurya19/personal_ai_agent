"""Safe tool for drafting tasks."""

from typing import Optional, Type
from crewai.tools import BaseTool
from pydantic import BaseModel
from app.modules.tools.schemas import TaskDraftInput


class TaskDraftTool(BaseTool):
    """Tool to prepare and structure a draft task for the user."""

    name: str = "task_draft"
    description: str = (
        "Creates a structured task draft with a title, description, priority, and optional due date. "
        "Use this tool when the user asks to save a to-do, create a task, or draft an action item."
    )
    args_schema: Type[BaseModel] = TaskDraftInput

    def _run(
        self,
        title: str,
        description: Optional[str] = "",
        priority: str = "medium",
        due_date: Optional[str] = None,
        **kwargs: object,
    ) -> str:
        """Execute task draft creation."""
        due_str = f", Due: {due_date}" if due_date else ""
        return (
            f"📋 Draft Task Created:\n"
            f"- Title: {title.strip()}\n"
            f"- Priority: {priority.upper()}{due_str}\n"
            f"- Notes: {description or 'None'}\n"
            f"- Status: DRAFTED (Pending user review)"
        )
