"""Unit and integration tests for CrewAI native LLM Gateway."""

import pytest
from httpx import ASGITransport, AsyncClient
from crewai.llms.base_llm import BaseLLM
from app.config import settings
from app.core.exceptions import AppException
from app.main import app
from app.modules.llm.service import CrewAILLMService


@pytest.mark.asyncio
async def test_crewai_llm_service_instantiation() -> None:
    """Verify CrewAILLMService produces properly configured CrewAI LLM instances."""
    mistral_llm = CrewAILLMService.get_llm("mistral")
    assert isinstance(mistral_llm, BaseLLM)
    assert "mistral" in mistral_llm.model

    ollama_llm = CrewAILLMService.get_llm("ollama")
    assert isinstance(ollama_llm, BaseLLM)
    assert "llama" in ollama_llm.model

    # Unknown provider throws 400
    with pytest.raises(AppException) as exc:
        CrewAILLMService.get_llm("nonexistent")
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_openai_disabled_by_default() -> None:
    """Ensure OpenAI throws 403 to respect ₹0 budget constraints."""
    with pytest.raises(AppException) as exc:
        CrewAILLMService.get_llm("openai")
    assert exc.value.status_code == 403
    assert "budget" in exc.value.message.lower()


@pytest.mark.asyncio
async def test_disable_cloud_models_killswitch(monkeypatch: pytest.MonkeyPatch) -> None:
    """Verify that enabling DISABLE_CLOUD_MODELS blocks cloud calls but permits local Ollama."""
    monkeypatch.setattr(settings, "DISABLE_CLOUD_MODELS", True)

    # Local Ollama must still resolve
    local_llm = CrewAILLMService.get_llm("ollama")
    assert isinstance(local_llm, BaseLLM)

    # Cloud providers must raise 403 Forbidden
    with pytest.raises(AppException) as exc:
        CrewAILLMService.get_llm("mistral")
    assert exc.value.status_code == 403
    assert "blocked" in exc.value.message.lower()


@pytest.mark.asyncio
async def test_models_catalog_api() -> None:
    """Verify GET /api/v1/models returns active model choices."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/models")
        assert res.status_code == 200
        models = res.json()
        assert len(models) >= 1
        model_ids = [m["id"] for m in models]
        assert "ollama/llama3.2" in model_ids
        if settings.MISTRAL_API_KEY and not settings.MISTRAL_API_KEY.startswith("your_"):
            assert f"mistral/{settings.MISTRAL_MODEL_NAME}" in model_ids


@pytest.mark.asyncio
async def test_conversation_model_switch_api() -> None:
    """Verify PATCH /api/v1/conversations/{id}/model dynamically changes conversation active model."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        conv_res = await client.post("/api/v1/conversations", json={"title": "Switch Test"})
        assert conv_res.status_code == 201
        conv_id = conv_res.json()["id"]

        patch_res = await client.patch(
            f"/api/v1/conversations/{conv_id}/model",
            json={
                "active_model_provider": "mistral",
                "active_model_name": "open-mistral-7b",
            },
        )
        assert patch_res.status_code == 200
        updated = patch_res.json()
        assert updated["active_model_provider"] == "mistral"
        assert updated["active_model_name"] == "open-mistral-7b"
