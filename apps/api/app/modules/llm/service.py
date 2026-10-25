"""CrewAI Native LLM Service and provider resolver."""

from typing import List, Optional
from crewai import LLM

from app.config import settings
from app.core.exceptions import AppException
from app.modules.llm.schemas import ModelOption


class CrewAILLMService:
    """Unified service for creating and resolving CrewAI native LLMs."""

    @staticmethod
    def get_llm(provider: Optional[str] = None, model_name: Optional[str] = None) -> LLM:
        """Instantiate a CrewAI native LLM instance for the requested provider and model."""
        prov = (provider or settings.DEFAULT_MODEL_PROVIDER).lower().strip()

        # Enforce cloud provider killswitch
        if settings.DISABLE_CLOUD_MODELS and prov in ("mistral", "gemini", "openai"):
            raise AppException(
                message=f"Cloud model provider '{prov}' is blocked by policy (DISABLE_CLOUD_MODELS=true).",
                status_code=403,
            )

        # Normalize model name by stripping redundant provider prefixes (e.g. "mistral/open-mistral-7b" -> "open-mistral-7b")
        cleaned_model = model_name.strip() if model_name else None
        if cleaned_model:
            while "/" in cleaned_model:
                prefix, remainder = cleaned_model.split("/", 1)
                if prefix.lower() in ("mistral", "ollama", "gemini", "openai"):
                    cleaned_model = remainder
                else:
                    break

        if prov == "mistral":
            if not settings.MISTRAL_API_KEY:
                raise AppException("Mistral API key is not configured.", status_code=500)
            chosen_model = cleaned_model or settings.MISTRAL_MODEL_NAME or "open-mistral-7b"
            return LLM(
                model=f"mistral/{chosen_model}",
                api_key=settings.MISTRAL_API_KEY,
                base_url=settings.MISTRAL_API_BASE_URL,
            )

        elif prov == "ollama":
            chosen_model = cleaned_model or "llama3.2"
            return LLM(
                model=f"ollama/{chosen_model}",
                base_url=settings.OLLAMA_BASE_URL,
            )

        elif prov == "gemini":
            if not settings.GEMINI_API_KEY:
                raise AppException("Gemini API key is not configured.", status_code=500)
            chosen_model = cleaned_model or "gemini-1.5-flash"
            return LLM(
                model=f"gemini/{chosen_model}",
                api_key=settings.GEMINI_API_KEY,
            )

        elif prov == "openai":
            raise AppException(
                message="OpenAI adapter is disabled to preserve ₹0 infrastructure budget.",
                status_code=403,
            )

        else:
            raise AppException(
                message=f"Unsupported model provider '{prov}'. Supported: mistral, ollama, gemini.",
                status_code=400,
            )

    @staticmethod
    def list_available_models() -> List[ModelOption]:
        """Return catalog of available models based on active credentials."""
        options: List[ModelOption] = []

        # Local Ollama
        options.append(
            ModelOption(
                id="ollama/llama3.2",
                name="Llama 3.2 (Local)",
                provider="ollama",
                is_local=True,
                description="Local private inference via Ollama (zero network egress)",
            )
        )

        if not settings.DISABLE_CLOUD_MODELS:
            # Mistral
            if (
                settings.MISTRAL_API_KEY
                and not settings.MISTRAL_API_KEY.startswith("your_")
                and settings.MISTRAL_API_KEY != "disabled"
            ):
                options.append(
                    ModelOption(
                        id=f"mistral/{settings.MISTRAL_MODEL_NAME}",
                        name=f"Mistral ({settings.MISTRAL_MODEL_NAME})",
                        provider="mistral",
                        is_local=False,
                        description="Fast cloud inference via official Mistral API",
                    )
                )

            # Gemini
            if (
                settings.GEMINI_API_KEY
                and not settings.GEMINI_API_KEY.startswith("your_")
                and settings.GEMINI_API_KEY != "disabled"
            ):
                options.append(
                    ModelOption(
                        id="gemini/gemini-1.5-flash",
                        name="Gemini 1.5 Flash (Free Tier)",
                        provider="gemini",
                        is_local=False,
                        description="High-speed multimodal reasoning via Gemini free tier",
                    )
                )

        return options
