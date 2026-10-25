"""Unit test for the health check endpoint."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint() -> None:
    """Verify that /api/v1/health returns 200 with status ok."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "ok"
        assert "version" in payload
        assert "environment" in payload


@pytest.mark.asyncio
async def test_root_endpoint() -> None:
    """Verify that root endpoint returns application info."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        payload = response.json()
        assert "app" in payload
        assert "docs" in payload
