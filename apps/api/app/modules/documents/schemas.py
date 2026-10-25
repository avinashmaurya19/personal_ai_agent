"""Pydantic schemas for document ingestion and retrieval results."""

from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    """Response payload for a document record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    filename: str
    content_type: str
    file_size_bytes: int
    chunk_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DocumentChunkResponse(BaseModel):
    """Response payload for a single document chunk."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    chunk_index: int
    content: str
    page_number: Optional[int] = None
    token_count: int


class ChunkSearchResult(BaseModel):
    """Retrieved document chunk match with verified citation metadata."""

    document_id: uuid.UUID
    filename: str
    chunk_index: int
    page_number: Optional[int] = None
    content: str
    score: float
    citation: str
