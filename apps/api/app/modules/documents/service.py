"""Document service handling file ingestion, chunk embedding, and grounded search."""

import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.document import Document, DocumentChunk
from app.modules.documents.parser import chunk_document_segments, parse_document_bytes
from app.modules.documents.schemas import ChunkSearchResult
from app.modules.memory.embedding import EmbeddingService

MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB limit


class DocumentService:
    """Business logic for document ingestion, chunking, and RAG retrieval."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_documents(self, owner_id: uuid.UUID) -> List[Document]:
        """List all documents belonging to owner ordered by created_at desc."""
        stmt = (
            select(Document)
            .where(Document.owner_id == owner_id)
            .order_by(Document.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_document(
        self, document_id: uuid.UUID, owner_id: uuid.UUID
    ) -> Document:
        """Retrieve document verifying ownership."""
        stmt = select(Document).where(Document.id == document_id)
        result = await self.session.execute(stmt)
        doc = result.scalar_one_or_none()

        if doc is None:
            raise NotFoundError("Document", document_id)
        if doc.owner_id != owner_id:
            raise PermissionDeniedError("Access to this document is denied.")

        return doc

    async def delete_document(
        self, document_id: uuid.UUID, owner_id: uuid.UUID
    ) -> None:
        """Permanently delete document and its cascade chunks."""
        doc = await self.get_document(document_id, owner_id)
        await self.session.delete(doc)
        await self.session.commit()

    async def upload_and_process_document(
        self,
        owner_id: uuid.UUID,
        filename: str,
        content_bytes: bytes,
        content_type: str,
    ) -> Document:
        """Ingest, parse, chunk, and embed a document into PostgreSQL + pgvector."""
        file_size = len(content_bytes)
        if file_size > MAX_FILE_SIZE_BYTES:
            raise AppException(
                f"File '{filename}' exceeds maximum allowed size of 15MB.",
                status_code=400,
            )

        if file_size == 0:
            raise AppException(f"Uploaded file '{filename}' is empty.", status_code=400)

        # 1. Initialize Document entity in processing state
        doc = Document(
            owner_id=owner_id,
            filename=filename,
            content_type=content_type,
            file_size_bytes=file_size,
            chunk_count=0,
            status="processing",
        )
        self.session.add(doc)
        await self.session.commit()
        await self.session.refresh(doc)

        try:
            # 2. Parse text segments from document
            segments = parse_document_bytes(filename, content_bytes, content_type)
            if not segments:
                doc.status = "error"
                doc.error_message = "No readable text content extracted from document."
                await self.session.commit()
                return doc

            # 3. Chunk text into semantic pieces
            parsed_chunks = chunk_document_segments(segments)

            # 4. Generate embeddings and persist chunks
            for p_chunk in parsed_chunks:
                vector = await EmbeddingService.get_embedding(p_chunk.content)
                db_chunk = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=p_chunk.chunk_index,
                    content=p_chunk.content,
                    page_number=p_chunk.page_number,
                    embedding=vector,
                    token_count=p_chunk.token_count,
                )
                self.session.add(db_chunk)

            doc.chunk_count = len(parsed_chunks)
            doc.status = "ready"
            await self.session.commit()
            await self.session.refresh(doc)
            logger.info(f"Document '{filename}' processed successfully: {len(parsed_chunks)} chunks embedded.")
            return doc

        except Exception as e:
            logger.error(f"Error processing document '{filename}': {e}")
            doc.status = "error"
            doc.error_message = str(e)
            await self.session.commit()
            raise

    async def hybrid_search(
        self, owner_id: uuid.UUID, query: str, limit: int = 5
    ) -> List[ChunkSearchResult]:
        """Perform pgvector cosine similarity search across owner's document chunks."""
        cleaned = query.strip()
        if not cleaned:
            return []

        query_vec = await EmbeddingService.get_embedding(cleaned)

        # Query top-k matching chunks joined with owner's ready documents
        stmt = (
            select(
                DocumentChunk,
                Document.filename,
                DocumentChunk.embedding.cosine_distance(query_vec).label("distance"),
            )
            .join(Document, Document.id == DocumentChunk.document_id)
            .where(
                Document.owner_id == owner_id,
                Document.status == "ready",
                DocumentChunk.embedding.is_not(None),
            )
            .order_by("distance")
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        rows = result.all()

        search_results: List[ChunkSearchResult] = []
        for chunk, filename, dist in rows:
            cosine_sim = max(0.0, 1.0 - float(dist)) if dist is not None else 0.0

            page_info = f", Page {chunk.page_number}" if chunk.page_number else ""
            citation = f"[Doc: {filename}{page_info}]"

            search_results.append(
                ChunkSearchResult(
                    document_id=chunk.document_id,
                    filename=filename,
                    chunk_index=chunk.chunk_index,
                    page_number=chunk.page_number,
                    content=chunk.content,
                    score=round(cosine_sim, 4),
                    citation=citation,
                )
            )

        return search_results
