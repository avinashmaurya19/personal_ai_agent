"""Async SQLAlchemy database engine and session factory."""

from typing import AsyncGenerator
from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.config import settings

engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
}
if settings.ENVIRONMENT == "testing":
    engine_kwargs["poolclass"] = NullPool
else:
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs,
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an active async SQLAlchemy database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
