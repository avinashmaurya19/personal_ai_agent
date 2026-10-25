"""Memory domain service providing storage, extraction, hybrid search, and context ranking."""

from datetime import datetime, timezone
import uuid
from typing import List, Optional
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.memory import Memory
from app.modules.memory.embedding import EmbeddingService
from app.modules.memory.extractor import MemoryExtractor
from app.modules.memory.schemas import MemoryCreate, MemorySearchResult, MemoryUpdate


class MemoryService:
    """Manages long-term personal facts, hybrid semantic retrieval, and prompt context building."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_memories(
        self, owner_id: uuid.UUID, category: Optional[str] = None
    ) -> List[Memory]:
        """List active memories for an owner ordered by updated_at desc."""
        stmt = (
            select(Memory)
            .where(Memory.owner_id == owner_id, Memory.is_active == True)  # noqa: E712
            .order_by(Memory.updated_at.desc())
        )
        if category:
            stmt = stmt.where(Memory.category == category)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_memory(
        self, owner_id: uuid.UUID, data: MemoryCreate
    ) -> Memory:
        """Create or update a personal fact with a 1024-dimensional embedding."""
        cleaned = data.content.strip()

        # Check for near-exact duplicate to prevent memory clutter
        existing_stmt = select(Memory).where(
            Memory.owner_id == owner_id,
            Memory.is_active == True,  # noqa: E712
            Memory.content.ilike(cleaned),
        )
        existing_res = await self.session.execute(existing_stmt)
        existing = existing_res.scalar_one_or_none()

        if existing:
            existing.category = data.category
            existing.confidence = data.confidence
            await self.session.commit()
            await self.session.refresh(existing)
            return existing

        # Generate embedding vector
        vector = await EmbeddingService.get_embedding(cleaned)

        memory = Memory(
            owner_id=owner_id,
            category=data.category,
            content=cleaned,
            confidence=data.confidence,
            source_conversation_id=data.source_conversation_id,
            embedding=vector,
            is_active=True,
        )
        self.session.add(memory)
        await self.session.commit()
        await self.session.refresh(memory)
        return memory

    async def update_memory(
        self, memory_id: uuid.UUID, owner_id: uuid.UUID, data: MemoryUpdate
    ) -> Memory:
        """Update an existing memory entry."""
        memory = await self._get_owned_memory(memory_id, owner_id)

        if data.content is not None and data.content.strip():
            memory.content = data.content.strip()
            # Regenerate embedding vector on text update
            memory.embedding = await EmbeddingService.get_embedding(memory.content)

        if data.category is not None:
            memory.category = data.category

        if data.is_active is not None:
            memory.is_active = data.is_active

        await self.session.commit()
        await self.session.refresh(memory)
        return memory

    async def delete_memory(self, memory_id: uuid.UUID, owner_id: uuid.UUID) -> None:
        """Permanently delete a memory record."""
        memory = await self._get_owned_memory(memory_id, owner_id)
        await self.session.delete(memory)
        await self.session.commit()

    async def hybrid_search(
        self, owner_id: uuid.UUID, query: str, limit: int = 5
    ) -> List[MemorySearchResult]:
        """Perform hybrid semantic vector search + keyword ranking."""
        cleaned_query = query.strip()
        if not cleaned_query:
            return []

        query_vec = await EmbeddingService.get_embedding(cleaned_query)

        # 1. Retrieve top candidates using pgvector cosine distance
        vec_stmt = (
            select(Memory, Memory.embedding.cosine_distance(query_vec).label("distance"))
            .where(
                Memory.owner_id == owner_id,
                Memory.is_active == True,  # noqa: E712
                Memory.embedding.is_not(None),
            )
            .order_by("distance")
            .limit(limit * 2)
        )
        vec_result = await self.session.execute(vec_stmt)
        candidates = vec_result.all()

        results: List[MemorySearchResult] = []
        now = datetime.now(timezone.utc)
        query_words = set(cleaned_query.lower().split())

        for mem, dist in candidates:
            # Distance ranges from 0 (identical) to 2 (opposite)
            cosine_sim = max(0.0, 1.0 - float(dist)) if dist is not None else 0.0

            # Keyword overlap score
            content_words = set(mem.content.lower().split())
            overlap = len(query_words.intersection(content_words))
            keyword_score = min(1.0, overlap / max(1, len(query_words)))

            # Recency decay weight (1.0 for brand new, decaying gently over 30 days)
            age_days = (now - mem.updated_at).total_seconds() / 86400.0
            recency_weight = max(0.5, 1.0 - (age_days / 60.0))

            # Hybrid score: 70% semantic, 20% keyword, 10% recency
            final_score = (0.70 * cosine_sim) + (0.20 * keyword_score) + (0.10 * recency_weight)

            match_type: str = "hybrid"
            if keyword_score > 0.6 and cosine_sim < 0.3:
                match_type = "keyword"
            elif cosine_sim >= 0.6 and keyword_score == 0:
                match_type = "semantic"

            results.append(
                MemorySearchResult(
                    memory=mem,
                    score=round(final_score, 4),
                    match_type=match_type,  # type: ignore[arg-type]
                )
            )

        # Sort by final score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:limit]

    async def ingest_from_message(
        self, owner_id: uuid.UUID, conversation_id: uuid.UUID, content: str
    ) -> List[Memory]:
        """Extract candidate facts from user message and persist to memory."""
        candidates = MemoryExtractor.extract_candidates(content)
        created_memories: List[Memory] = []

        for candidate in candidates:
            try:
                mem = await self.create_memory(
                    owner_id=owner_id,
                    data=MemoryCreate(
                        content=candidate.content,
                        category=candidate.category,  # type: ignore[arg-type]
                        confidence=candidate.confidence,
                        source_conversation_id=conversation_id,
                    ),
                )
                created_memories.append(mem)
                logger.info(f"Ingested personal memory [{mem.category}]: {mem.content}")
            except Exception as e:
                logger.error(f"Failed to ingest candidate memory '{candidate.content}': {e}")

        return created_memories

    async def build_context_for_prompt(
        self, owner_id: uuid.UUID, query: str, limit: int = 4
    ) -> str:
        """Return formatted memory facts to inject into agent prompt."""
        matches = await self.hybrid_search(owner_id=owner_id, query=query, limit=limit)
        # Filter matches with a meaningful similarity threshold
        relevant = [m for m in matches if m.score >= 0.40]

        if not relevant:
            return ""

        facts = [f"- {m.memory.content} ({m.memory.category})" for m in relevant]
        return "Known User Facts & Preferences:\n" + "\n".join(facts) + "\n\n"

    async def _get_owned_memory(
        self, memory_id: uuid.UUID, owner_id: uuid.UUID
    ) -> Memory:
        """Fetch memory ensuring ownership."""
        stmt = select(Memory).where(Memory.id == memory_id)
        result = await self.session.execute(stmt)
        mem = result.scalar_one_or_none()

        if mem is None:
            raise NotFoundError("Memory", memory_id)
        if mem.owner_id != owner_id:
            raise PermissionDeniedError("Access to this memory is denied.")

        return mem
