"""Unit and integration tests for Memory Engine, pgvector search, and extraction."""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.modules.memory.embedding import EmbeddingService
from app.modules.memory.extractor import MemoryExtractor


def test_memory_extractor() -> None:
    """Verify rule-based extraction captures personal facts and discards casual banter."""
    # Preference
    pref_res = MemoryExtractor.extract_candidates("I prefer dark mode and high-contrast themes.")
    assert len(pref_res) == 1
    assert pref_res[0].category == "preference"
    assert "dark mode" in pref_res[0].content.lower()

    # Work / Role
    work_res = MemoryExtractor.extract_candidates("I work as a senior backend software engineer.")
    assert len(work_res) == 1
    assert work_res[0].category == "work"

    # Explicit instruction
    explicit_res = MemoryExtractor.extract_candidates("Remember that my flight leaves at 6 PM on Friday.")
    assert len(explicit_res) == 1
    assert explicit_res[0].category == "general"

    # Casual banter / Transient questions should return empty
    assert len(MemoryExtractor.extract_candidates("hello there!")) == 0
    assert len(MemoryExtractor.extract_candidates("what time is it?")) == 0
    assert len(MemoryExtractor.extract_candidates("can you calculate 2 + 2?")) == 0


@pytest.mark.asyncio
async def test_embedding_service_dimensions_and_normalization() -> None:
    """Verify embedding produces 1024-dim unit-normalized vectors."""
    vec = await EmbeddingService.get_embedding("Personal memory test fact")
    assert len(vec) == 1024
    norm_sq = sum(x * x for x in vec)
    # Unit norm check: length should be ~1.0
    assert 0.99 <= norm_sq <= 1.01


@pytest.mark.asyncio
async def test_memory_crud_api() -> None:
    """Verify memory creation, retrieval, updating, and deletion via API."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create Memory
        create_res = await client.post(
            "/api/v1/memories",
            json={
                "content": "My primary programming language is Python",
                "category": "work",
            },
        )
        assert create_res.status_code == 201
        created = create_res.json()
        mem_id = created["id"]
        assert created["content"] == "My primary programming language is Python"
        assert created["category"] == "work"

        # 2. List Memories
        list_res = await client.get("/api/v1/memories")
        assert list_res.status_code == 200
        memories = list_res.json()
        assert any(m["id"] == mem_id for m in memories)

        # 3. Update Memory
        patch_res = await client.patch(
            f"/api/v1/memories/{mem_id}",
            json={"content": "My primary programming languages are Python and TypeScript"},
        )
        assert patch_res.status_code == 200
        assert "TypeScript" in patch_res.json()["content"]

        # 4. Search Memory
        search_res = await client.get("/api/v1/memories/search?q=Python+programming")
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert len(search_data) >= 1
        assert search_data[0]["memory"]["id"] == mem_id
        assert search_data[0]["score"] > 0.3

        # 5. Delete Memory
        del_res = await client.delete(f"/api/v1/memories/{mem_id}")
        assert del_res.status_code == 204

        # Verify gone
        post_del_list = await client.get("/api/v1/memories")
        assert not any(m["id"] == mem_id for m in post_del_list.json())


@pytest.mark.asyncio
async def test_automatic_conversation_memory_ingestion() -> None:
    """Verify message turn automatically extracts and persists personal memories."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create conversation
        conv_res = await client.post("/api/v1/conversations", json={"title": "Memory Test"})
        assert conv_res.status_code == 201
        conv_id = conv_res.json()["id"]

        # Post turn containing durable personal fact
        msg_res = await client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"content": "Remember that my secret code is ALPHA-99."},
        )
        assert msg_res.status_code == 201

        # Check memories endpoint
        mem_res = await client.get("/api/v1/memories")
        assert mem_res.status_code == 200
        all_memories = mem_res.json()
        assert any("ALPHA-99" in m["content"] for m in all_memories)
