"""Pydantic schemas for web search, scraping, and synthesized research reports."""

import uuid
from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class SearchResultItem(BaseModel):
    """Individual web search query hit."""

    title: str
    url: str
    snippet: str


class ScrapedContent(BaseModel):
    """Extracted text content from a web page."""

    url: str
    title: str = ""
    text_content: str = ""
    success: bool = True
    error: Optional[str] = None


class ResearchReportCreate(BaseModel):
    """Payload to save an autonomous research report."""

    title: str = Field(..., max_length=255)
    topic: str = Field(..., max_length=255)
    summary: str = Field("", description="Brief executive overview")
    content: str = Field(..., description="Markdown report body with numbered citations")
    sources: List[dict[str, Any]] = Field(default_factory=list)
    status: str = Field("completed", max_length=50)
    source_conversation_id: Optional[uuid.UUID] = None


class ResearchReportResponse(BaseModel):
    """Serialized research report returned via API."""

    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    topic: str
    summary: str
    content: str
    sources: List[dict[str, Any]]
    status: str
    source_conversation_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResearchGenerateRequest(BaseModel):
    """Payload to trigger autonomous web research generation."""

    topic: str = Field(..., min_length=3, max_length=255)
    num_sources: int = Field(default=5, ge=1, le=10)
    provider: Optional[str] = None
    model: Optional[str] = None
