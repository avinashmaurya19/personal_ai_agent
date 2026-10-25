"""FastAPI dependency injection utilities."""

import uuid
from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.db.session import get_db_session

# Stable local development owner UUID
DEV_OWNER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
DEV_OWNER_EMAIL = "owner@personal.ai"


async def get_current_owner(
    session: AsyncSession = Depends(get_db_session),
) -> User:
    """Retrieve or automatically initialize the local single-tenant owner for development."""
    stmt = select(User).where(User.id == DEV_OWNER_ID)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=DEV_OWNER_ID,
            email=DEV_OWNER_EMAIL,
            full_name="Personal Owner",
            preferences={"theme": "dark", "default_model": "llama3.2"},
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user
