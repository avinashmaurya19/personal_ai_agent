"""Pydantic schemas for calendar events and availability checks."""

from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class CalendarEventCreate(BaseModel):
    """Payload to create a new calendar event."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str] = Field(default_factory=list)


class CalendarEventUpdate(BaseModel):
    """Payload to update an existing calendar event."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    attendees: Optional[List[str]] = None
    status: Optional[str] = None


class CalendarEventResponse(BaseModel):
    """Response payload for a calendar event."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: List[str]
    status: str
    created_at: datetime
    updated_at: datetime


class AvailabilitySlot(BaseModel):
    """Available time window for scheduling."""

    start: str
    end: str


class AvailabilityResponse(BaseModel):
    """Availability inspection result for a target date."""

    date: str
    busy_events: List[CalendarEventResponse]
    suggested_open_slots: List[AvailabilitySlot]
