"""Execution context for request and agent turn isolation."""

import contextvars
from typing import Optional
import uuid

# Global context variable for current owner ID across async turns and tools
current_owner_id_var: contextvars.ContextVar[Optional[uuid.UUID]] = contextvars.ContextVar(
    "current_owner_id", default=None
)


def get_current_owner_id(default: Optional[uuid.UUID] = None) -> uuid.UUID:
    """Retrieve the current owner_id from contextvar or fallback to provided default / DEV_OWNER_ID."""
    val = current_owner_id_var.get()
    if val is not None:
        return val
    if default is not None:
        return default
    from app.api.dependencies import DEV_OWNER_ID

    return DEV_OWNER_ID
