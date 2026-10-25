"""Embedding generation service with Mistral, Ollama, and offline deterministic fallback."""

import hashlib
import math
from typing import List
import httpx

from app.config import settings
from app.core.logging import logger

EMBEDDING_DIM = 1024


class EmbeddingService:
    """Multi-provider embedding generator returning unit-normalized 1024-dim vectors."""

    @classmethod
    async def get_embedding(cls, text: str) -> List[float]:
        """Generate a 1024-dimensional embedding for the input text."""
        cleaned = text.strip()
        if not cleaned:
            return [0.0] * EMBEDDING_DIM

        # 1. Use Mistral Embeddings API when active key is configured and cloud allowed
        if (
            not settings.DISABLE_CLOUD_MODELS
            and settings.MISTRAL_API_KEY
            and not settings.MISTRAL_API_KEY.startswith("your_")
            and settings.MISTRAL_API_KEY != "disabled"
        ):
            try:
                return await cls._get_mistral_embedding(cleaned)
            except Exception as e:
                logger.warning(f"Mistral embedding API error, falling back to local embedder: {e}")

        # 2. Deterministic local unit-normalized vector
        return cls._deterministic_fallback_embed(cleaned)

    @classmethod
    def get_sync_embedding(cls, text: str) -> List[float]:
        """Generate a 1024-dimensional embedding synchronously for tools without event loop issues."""
        cleaned = text.strip()
        if not cleaned:
            return [0.0] * EMBEDDING_DIM

        if (
            not settings.DISABLE_CLOUD_MODELS
            and settings.MISTRAL_API_KEY
            and not settings.MISTRAL_API_KEY.startswith("your_")
            and settings.MISTRAL_API_KEY != "disabled"
        ):
            try:
                with httpx.Client(timeout=10.0) as client:
                    headers = {
                        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                        "Content-Type": "application/json",
                    }
                    payload = {
                        "model": "mistral-embed",
                        "input": [cleaned],
                    }
                    res = client.post(
                        f"{settings.MISTRAL_API_BASE_URL}/embeddings",
                        headers=headers,
                        json=payload,
                    )
                    if res.status_code == 200:
                        data = res.json()
                        vector = data["data"][0]["embedding"]
                        return cls._normalize(vector)
            except Exception as e:
                logger.warning(f"Mistral sync embedding API error: {e}")

        return cls._deterministic_fallback_embed(cleaned)

    @classmethod
    async def _get_mistral_embedding(cls, text: str) -> List[float]:
        """Call Mistral's official /embeddings API."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": "mistral-embed",
                "input": [text],
            }
            response = await client.post(
                f"{settings.MISTRAL_API_BASE_URL}/embeddings",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            vector = data["data"][0]["embedding"]
            return cls._normalize(vector)

    @staticmethod
    def _deterministic_fallback_embed(text: str, dim: int = EMBEDDING_DIM) -> List[float]:
        """Produce a deterministic 1024-dimensional unit vector using feature hashing."""
        vec = [0.0] * dim
        tokens = text.lower().replace(".", " ").replace(",", " ").split()
        if not tokens:
            tokens = ["empty"]

        for i, token in enumerate(tokens):
            h = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if ((h >> 10) & 1) else -1.0
            vec[idx] += sign * (1.0 / (i + 1.0))

        return EmbeddingService._normalize(vec)

    @staticmethod
    def _normalize(vector: List[float]) -> List[float]:
        """Normalize vector to unit length (L2 norm = 1.0) for cosine distance."""
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            return [float(x / norm) for x in vector]
        return vector
