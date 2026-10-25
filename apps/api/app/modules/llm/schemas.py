"""Standardized schemas for the LLM Gateway and provider adapters."""

from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


class LLMMessage(BaseModel):
    """Standardized representation of a single conversation turn."""

    role: Literal["system", "user", "assistant", "tool"]
    content: str


class LLMResponse(BaseModel):
    """Normalized response payload returned by any LLM provider."""

    content: str = Field(..., description="Generated text content")
    model_name: str = Field(..., description="Exact model name used for inference")
    provider: str = Field(..., description="Provider identifier (e.g. mistral, ollama, gemini)")
    prompt_tokens: int = Field(default=0, description="Tokens in the input prompt")
    completion_tokens: int = Field(default=0, description="Tokens in the generated response")
    total_tokens: int = Field(default=0, description="Total tokens consumed")
    latency_ms: float = Field(default=0.0, description="Round-trip latency in milliseconds")


class ModelOption(BaseModel):
    """Metadata describing an available model choice for the UI."""

    id: str
    name: str
    provider: str
    is_local: bool = False
    description: Optional[str] = None
