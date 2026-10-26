"""Centralized typed tool registry enforcing safety boundaries and execution auditing."""

import time
from typing import Any, Callable, Dict, List, Optional
from crewai.tools import BaseTool
from app.core.exceptions import AppException
from app.modules.tools.builtins.calculator_tool import SafeCalculatorTool
from app.modules.tools.builtins.calendar_tool import CalendarTool
from app.modules.tools.builtins.datetime_tool import CurrentDateTimeTool
from app.modules.tools.builtins.document_search_tool import DocumentSearchTool
from app.modules.tools.builtins.email_tool import EmailTool
from app.modules.tools.builtins.note_manage_tool import NoteManageTool
from app.modules.tools.builtins.note_search_tool import NoteSearchTool
from app.modules.tools.builtins.research_tool import DeepResearchTool, WebSearchTool
from app.modules.tools.builtins.task_draft_tool import TaskDraftTool
from app.modules.tools.builtins.task_manage_tool import TaskManageTool
from app.modules.tools.schemas import ToolExecutionRecord, ToolMetadata


class ToolRegistry:
    """Central catalog of available agent tools."""

    def __init__(self) -> None:
        self._tools: Dict[str, BaseTool] = {}
        self._metadata: Dict[str, ToolMetadata] = {}
        self._register_default_tools()

    def register(
        self,
        tool: BaseTool,
        category: str = "system",
        is_consequential: bool = False,
    ) -> None:
        """Register a tool instance in the catalog."""
        self._tools[tool.name] = tool
        schema_cls = getattr(tool, "args_schema", None)
        schema_name = schema_cls.__name__ if schema_cls else None
        schema_dict = None
        if schema_cls and hasattr(schema_cls, "model_json_schema"):
            schema_dict = schema_cls.model_json_schema()

        self._metadata[tool.name] = ToolMetadata(
            name=tool.name,
            description=tool.description,
            category=category,  # type: ignore[arg-type]
            is_consequential=is_consequential,
            args_schema_name=schema_name,
            input_schema=schema_dict,
        )

    def _register_default_tools(self) -> None:
        """Register the default safe tools for the Personal AI Assistant."""
        self.register(
            CurrentDateTimeTool(),
            category="system",
            is_consequential=False,
        )
        self.register(
            SafeCalculatorTool(),
            category="math",
            is_consequential=False,
        )
        self.register(
            TaskDraftTool(),
            category="productivity",
            is_consequential=False,
        )
        self.register(
            NoteSearchTool(),
            category="search",
            is_consequential=False,
        )
        self.register(
            DocumentSearchTool(),
            category="search",
            is_consequential=False,
        )
        self.register(
            TaskManageTool(),
            category="productivity",
            is_consequential=False,
        )
        self.register(
            NoteManageTool(),
            category="productivity",
            is_consequential=False,
        )
        self.register(
            EmailTool(),
            category="communication",
            is_consequential=False,
        )
        self.register(
            CalendarTool(),
            category="scheduling",
            is_consequential=False,
        )
        self.register(
            WebSearchTool(),
            category="search",
            is_consequential=False,
        )
        self.register(
            DeepResearchTool(),
            category="search",
            is_consequential=False,
        )

    def get_tool(self, name: str) -> BaseTool:
        """Retrieve a registered tool by name or raise 404."""
        if name not in self._tools:
            raise AppException(f"Tool '{name}' is not registered.", status_code=404)
        return self._tools[name]

    def list_metadata(self) -> List[ToolMetadata]:
        """Return catalog of tool metadata."""
        return list(self._metadata.values())

    def get_crewai_tools(self) -> List[BaseTool]:
        """Return all registered tools as CrewAI BaseTool instances."""
        return list(self._tools.values())

    def execute_tool(
        self,
        name: str,
        arguments: dict[str, Any],
        on_record: Optional[Callable[[ToolExecutionRecord], None]] = None,
    ) -> ToolExecutionRecord:
        """Execute a tool safely, record duration, and return receipt."""
        if name not in self._tools:
            record = ToolExecutionRecord(
                tool_name=name,
                arguments=arguments,
                status="error",
                error_message=f"Tool '{name}' not found.",
            )
            if on_record:
                on_record(record)
            return record

        tool = self._tools[name]
        meta = self._metadata[name]
        start_time = time.perf_counter()

        try:
            raw_output = tool.run(**arguments)
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            record = ToolExecutionRecord(
                tool_name=name,
                arguments=arguments,
                result=raw_output,
                status="success",
                is_consequential=meta.is_consequential,
                duration_ms=duration_ms,
            )
        except Exception as e:
            duration_ms = int((time.perf_counter() - start_time) * 1000)
            record = ToolExecutionRecord(
                tool_name=name,
                arguments=arguments,
                status="error",
                is_consequential=meta.is_consequential,
                duration_ms=duration_ms,
                error_message=str(e),
            )

        if on_record:
            on_record(record)

        return record


# Global singleton instance
default_tool_registry = ToolRegistry()
