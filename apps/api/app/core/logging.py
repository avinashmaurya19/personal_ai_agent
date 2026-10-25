"""Structured logging setup for FastAPI application."""

import logging
import sys
from app.config import settings


def setup_logging() -> None:
    """Configure structured root logger."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


logger = logging.getLogger("personal_ai.api")
