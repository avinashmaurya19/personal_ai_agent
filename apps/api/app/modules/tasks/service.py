"""Task domain service managing CRUD operations, status transitions, and query filtering."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.task import Task
from app.modules.tasks.schemas import TaskCreate, TaskUpdate


class TaskService:
    """Manages actionable tasks, filtering, due dates, and completion status."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_tasks(
        self,
        owner_id: uuid.UUID,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Task]:
        """List tasks for owner with optional status and priority filtering."""
        stmt = (
            select(Task)
            .where(Task.owner_id == owner_id)
            .order_by(
                # Null due dates sort last
                Task.due_date.asc().nullslast(),
                Task.created_at.desc(),
            )
            .limit(limit)
            .offset(offset)
        )
        if status:
            stmt = stmt.where(Task.status == status)
        if priority:
            stmt = stmt.where(Task.priority == priority)

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_task(self, owner_id: uuid.UUID, task_id: uuid.UUID) -> Task:
        """Retrieve a single task verifying owner ownership."""
        stmt = select(Task).where(Task.id == task_id)
        result = await self.session.execute(stmt)
        task = result.scalar_one_or_none()
        if not task:
            raise NotFoundError("Task", task_id)
        if task.owner_id != owner_id:
            raise PermissionDeniedError("Access to this task is denied")
        return task

    async def create_task(self, owner_id: uuid.UUID, data: TaskCreate) -> Task:
        """Create a new task record."""
        task = Task(
            owner_id=owner_id,
            title=data.title.strip(),
            description=data.description.strip() if data.description else None,
            priority=data.priority,
            due_date=data.due_date,
            source_conversation_id=data.source_conversation_id,
            status="pending",
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        logger.info(f"Created task {task.id}: {task.title}")
        return task

    async def update_task(
        self, owner_id: uuid.UUID, task_id: uuid.UUID, data: TaskUpdate
    ) -> Task:
        """Update fields of an existing task including status and completion time."""
        task = await self.get_task(owner_id, task_id)

        if data.title is not None:
            task.title = data.title.strip()
        if data.description is not None:
            task.description = data.description.strip() if data.description else None
        if data.priority is not None:
            task.priority = data.priority
        if data.due_date is not None:
            task.due_date = data.due_date

        if data.status is not None:
            if data.status == "completed" and task.status != "completed":
                task.completed_at = datetime.now(timezone.utc)
            elif data.status != "completed" and task.status == "completed":
                task.completed_at = None
            task.status = data.status

        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def delete_task(self, owner_id: uuid.UUID, task_id: uuid.UUID) -> None:
        """Delete an existing task."""
        task = await self.get_task(owner_id, task_id)
        await self.session.delete(task)
        await self.session.commit()
        logger.info(f"Deleted task {task_id}")
