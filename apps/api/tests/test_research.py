"""Integration and unit tests for Sprint 8: Research & Reporting."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.modules.research.service import SearchService, WebScraperService
from app.modules.tools.builtins.research_tool import DeepResearchTool, WebSearchTool


@pytest.mark.asyncio
async def test_search_and_scraper_services() -> None:
    """Verify DuckDuckGo search and scraper services extract valid text."""
    results = SearchService.search("artificial intelligence", max_results=2)
    assert len(results) >= 1
    assert results[0].url.startswith("http")

    scraped = WebScraperService.scrape_url("https://example.com/test")
    assert scraped.success is True
    assert len(scraped.text_content) > 0


@pytest.mark.asyncio
async def test_research_tools_execution() -> None:
    """Verify WebSearchTool and DeepResearchTool run and return formatted strings."""
    search_tool = WebSearchTool()
    output = search_tool._run(query="fastapi python", max_results=2)
    assert "Web search results" in output

    deep_tool = DeepResearchTool()
    report_output = deep_tool._run(topic="quantum computing", max_sources=2)
    assert "quantum computing" in report_output.lower()
    assert "Verifiable Sources" in report_output


@pytest.mark.asyncio
async def test_research_api_endpoints() -> None:
    """Verify REST API routes for research reports CRUD and live search."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Quick Search
        search_res = await client.get("/api/v1/research/search?q=agentic+ai")
        assert search_res.status_code == 200
        hits = search_res.json()
        assert len(hits) >= 1
        assert "url" in hits[0]

        # 2. Create Report
        create_res = await client.post(
            "/api/v1/research",
            json={
                "title": "Agentic AI Overview",
                "topic": "agentic ai",
                "summary": "Analysis of autonomous agent capabilities.",
                "content": "# Agentic AI\nAutonomous execution is advancing rapidly.",
                "sources": [{"title": "Agent Source", "url": "https://example.com"}],
            },
        )
        assert create_res.status_code == 201
        report = create_res.json()
        report_id = report["id"]
        assert report["title"] == "Agentic AI Overview"

        # 3. List Reports
        list_res = await client.get("/api/v1/research")
        assert list_res.status_code == 200
        reports = list_res.json()
        assert len(reports) >= 1

        # 4. Get Report by ID
        get_res = await client.get(f"/api/v1/research/{report_id}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == report_id

        # 5. Autonomous Generate Endpoint
        gen_res = await client.post(
            "/api/v1/research/generate",
            json={
                "topic": "distributed systems",
                "num_sources": 2,
            },
        )
        assert gen_res.status_code == 201
        gen_report = gen_res.json()
        assert "distributed systems" in gen_report["topic"].lower()

        # 6. Delete Report
        del_res = await client.delete(f"/api/v1/research/{report_id}")
        assert del_res.status_code == 204
