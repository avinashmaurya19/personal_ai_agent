"""FastAPI router for calendar events, schedule inspection, and agenda lookups."""

from datetime import datetime
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.calendar.schemas import (
    AvailabilityResponse,
    CalendarEventCreate,
    CalendarEventResponse,
    CalendarEventUpdate,
)
from app.modules.calendar.service import CalendarService

router = APIRouter(prefix="/calendar", tags=["Calendar"])


def get_calendar_service(
    session: AsyncSession = Depends(get_db_session),
) -> CalendarService:
    """Dependency producing CalendarService instance."""
    return CalendarService(session)


@router.get("/events", response_model=List[CalendarEventResponse], summary="List calendar events")
async def list_events(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    owner: User = Depends(get_current_owner),
    service: CalendarService = Depends(get_calendar_service),
) -> List[CalendarEventResponse]:
    """Retrieve owner calendar events in chronological order."""
    return await service.list_events(owner.id, start_date=start_date, end_date=end_date)


@router.post(
    "/events",
    response_model=CalendarEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create calendar event",
)
async def create_event(
    payload: CalendarEventCreate,
    owner: User = Depends(get_current_owner),
    service: CalendarService = Depends(get_calendar_service),
) -> CalendarEventResponse:
    """Create and confirm a new calendar event."""
    return await service.create_event(owner.id, payload)


@router.get("/events/{event_id}", response_model=CalendarEventResponse, summary="Get single event")
async def get_event(
    event_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: CalendarService = Depends(get_calendar_service),
) -> CalendarEventResponse:
    """Retrieve details for a specific calendar event."""
    return await service.get_event(owner.id, event_id)


@router.patch("/events/{event_id}", response_model=CalendarEventResponse, summary="Update event")
async def update_event(
    event_id: uuid.UUID,
    payload: CalendarEventUpdate,
    owner: User = Depends(get_current_owner),
    service: CalendarService = Depends(get_calendar_service),
) -> CalendarEventResponse:
    """Update title, time, or location of a calendar event."""
    return await service.update_event(owner.id, event_id, payload)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete event")
async def delete_event(
    event_id: uuid.UUID,
    owner: User = Depends(get_current_owner),
    service: CalendarService = Depends(get_calendar_service),
) -> None:
    """Delete a calendar event."""
    await service.delete_event(owner.id, event_id)


@router.get("/availability", response_model=AvailabilityResponse, summary="Check day availability")
async def check_availability(
    target_date: Optional[datetime] = Query(default=None),
    owner: User = Depends(get_current_owner),
    service: CalendarService = Depends(get_calendar_service),
) -> AvailabilityResponse:
    """Inspect agenda and return busy events with open workday time slots."""
    effective_date = target_date or datetime.now()
    return await service.check_availability(owner.id, effective_date)
