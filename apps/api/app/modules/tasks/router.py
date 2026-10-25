"""FastAPI router for owner task CRUD and status management."""

from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.tasks.schemas import TaskCreate, TaskResponse, TaskUpdate
from app.modules.tasks.service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def get_task_service(
    session: AsyncSession = Depends(get_db_session),
) -> TaskService:
    """Dependency producing TaskService instance."""
    return TaskService(session)


@router.get("", response_model=List[TaskResponse], summary="List tasks")
async def list_tasks(
    status: Optional[str] = Query(default=None, description="Filter by status (pending, in_progress, completed, cancelled)"),
    priority: Optional[str] = Query(default=None, description="Filter by priority (low, medium, high, urgent)"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    owner: User = Depends(get_current_owner),
    service: TaskService = Depends(get_task_service),
) -> List[TaskResponse]:
    """Retrieve tasks belonging to authenticated owner with optional status/priority filters."""
    return await service.list_tasks(
        owner_id=owner.id,
        status=status,
        priority=priority,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
async def create_task(
    payload: TaskCreate,
    owner: User = Depends(get_current_owner),
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Create a new task for the owner."""
    return await service.create_task(owner_id=owner.id, data=payload)


@router.get("/{task_id}", response_model=TaskResponse, summary="Get single task")
async def get_task(
    task_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Retrieve details for a specific task."""
    return await service.get_task(owner_id=owner.id, task_id=task_id)


@router.patch("/{task_id}", response_model=TaskResponse, summary="Update task")
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    owner: User = Depends(get_current_owner),
    service: TaskService = Depends(get_task_service),
) -> TaskResponse:
    """Update task attributes such as status, priority, title, or due date."""
    return await service.update_task(
        owner_id=owner.id,
        task_id=task_id,
        data=payload,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete task")
async def delete_task(
    task_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: TaskService = Depends(get_task_service),
) -> None:
    """Delete a task permanently."""
    await service.delete_task(owner_id=owner.id, task_id=task_id)
