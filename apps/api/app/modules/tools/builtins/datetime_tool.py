"""Safe tool providing current system date and time."""

from datetime import datetime, timezone
from typing import Type
from crewai.tools import BaseTool
from pydantic import BaseModel
from app.modules.tools.schemas import EmptyInput


class CurrentDateTimeTool(BaseTool):
    """Tool to retrieve current date, time, and day of week."""

    name: str = "current_datetime"
    description: str = (
        "Returns the current date, time, day of the week, and UTC timestamp. "
        "Use this tool whenever the user asks for the current date, today's day, or the current time."
    )
    args_schema: Type[BaseModel] = EmptyInput

    def _run(self, **kwargs: object) -> str:
        """Execute date and time lookup."""
        now = datetime.now(timezone.utc)
        return (
            f"Current UTC Date & Time: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
            f"Day of Week: {now.strftime('%A')}\n"
            f"ISO Format: {now.isoformat()}"
        )
