"""Calendar module initialization."""

from app.modules.calendar.router import router
from app.modules.calendar.schemas import (
    AvailabilityResponse,
    AvailabilitySlot,
    CalendarEventCreate,
    CalendarEventResponse,
    CalendarEventUpdate,
)
from app.modules.calendar.service import CalendarService

__all__ = [
    "router",
    "CalendarEventCreate",
    "CalendarEventUpdate",
    "CalendarEventResponse",
    "AvailabilitySlot",
    "AvailabilityResponse",
    "CalendarService",
]
