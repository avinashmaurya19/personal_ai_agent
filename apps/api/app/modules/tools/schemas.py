"""Schemas for tool arguments, execution results, and registry metadata."""

from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


class ToolMetadata(BaseModel):
    """Metadata describing a registered tool."""

    name: str = Field(..., max_length=64)
    description: str = Field(..., max_length=512)
    category: Literal["system", "math", "productivity", "search", "communication", "scheduling"] = "system"
    is_consequential: bool = False
    args_schema_name: Optional[str] = None
    input_schema: Optional[dict[str, Any]] = None


class ToolExecutionRecord(BaseModel):
    """Record of a tool invocation."""

    tool_name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    result: Any = None
    status: Literal["success", "error", "blocked"] = "success"
    is_consequential: bool = False
    duration_ms: int = 0
    error_message: Optional[str] = None


# --- Tool Specific Input Schemas ---


class EmptyInput(BaseModel):
    """Empty input schema for zero-argument tools."""

    pass


class CalculatorInput(BaseModel):
    """Input for safe mathematical calculator."""

    expression: str = Field(
        ...,
        description="Mathematical expression to evaluate (e.g., '15 * 47', '2 ** 8', 'math.sqrt(144)')",
    )


class TaskDraftInput(BaseModel):
    """Input for creating a draft task."""

    title: str = Field(..., min_length=2, max_length=255, description="Short title of the task")
    description: Optional[str] = Field(default="", max_length=1000, description="Detailed notes or context")
    priority: Literal["low", "medium", "high"] = Field(default="medium", description="Priority level")
    due_date: Optional[str] = Field(default=None, description="Due date string if mentioned (e.g. '2026-11-01')")


class NoteSearchInput(BaseModel):
    """Input for searching notes and message history."""

    query: str = Field(..., min_length=1, max_length=255, description="Keyword or phrase to search for")
    limit: int = Field(default=5, ge=1, le=20, description="Maximum number of matches to return")


class WebSearchInput(BaseModel):
    """Input for quick web search."""

    query: str = Field(..., min_length=1, max_length=255, description="Web search query string")
    max_results: int = Field(default=5, ge=1, le=10, description="Max search results to retrieve")


class DeepResearchInput(BaseModel):
    """Input for in-depth web research and markdown report generation."""

    topic: str = Field(..., min_length=2, max_length=255, description="Research topic or question to investigate")
    max_sources: int = Field(default=3, ge=1, le=5, description="Number of primary sources to scrape and synthesize")
