"""FastAPI router for document ingestion, management, and chunk retrieval."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.documents.schemas import (
    ChunkSearchResult,
    DocumentResponse,
)
from app.modules.documents.service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])


def get_document_service(
    session: AsyncSession = Depends(get_db_session),
) -> DocumentService:
    """Dependency producing DocumentService instance."""
    return DocumentService(session)


@router.get("", response_model=List[DocumentResponse], summary="List uploaded documents")
async def list_documents(
    owner: User = Depends(get_current_owner),
    service: DocumentService = Depends(get_document_service),
) -> List[DocumentResponse]:
    """Retrieve all uploaded documents belonging to the authenticated owner."""
    return await service.list_documents(owner.id)


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest a document",
)
async def upload_document(
    file: UploadFile = File(...),
    owner: User = Depends(get_current_owner),
    service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    """Upload and parse a PDF, Markdown, or TXT file into embedded vector chunks."""
    content_bytes = await file.read()
    filename = file.filename or "uploaded_file.txt"
    content_type = file.content_type or "application/octet-stream"

    return await service.upload_and_process_document(
        owner_id=owner.id,
        filename=filename,
        content_bytes=content_bytes,
        content_type=content_type,
    )


@router.get(
    "/search",
    response_model=List[ChunkSearchResult],
    summary="Search document chunks via hybrid vector similarity",
)
async def search_document_chunks(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=4, ge=1, le=10),
    owner: User = Depends(get_current_owner),
    service: DocumentService = Depends(get_document_service),
) -> List[ChunkSearchResult]:
    """Search uploaded document chunks using pgvector cosine similarity."""
    return await service.hybrid_search(owner.id, query=q, limit=limit)


@router.get("/{document_id}", response_model=DocumentResponse, summary="Get document details")
async def get_document(
    document_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    """Retrieve metadata for a specific document."""
    return await service.get_document(document_id, owner.id)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete document",
)
async def delete_document(
    document_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: DocumentService = Depends(get_document_service),
) -> None:
    """Delete a document and all its embedded vector chunks."""
    await service.delete_document(document_id, owner.id)
