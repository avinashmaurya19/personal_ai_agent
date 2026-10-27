"""Calendar domain service managing events, agenda lookups, and schedule availability."""

from datetime import datetime, timedelta, timezone
from typing import List, Optional
import uuid
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import DEV_OWNER_ID
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.calendar import CalendarEvent
from app.modules.calendar.schemas import (
    AvailabilityResponse,
    AvailabilitySlot,
    CalendarEventCreate,
    CalendarEventUpdate,
)


class CalendarService:
    """Manages calendar events, agenda queries, and availability scheduling."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def ensure_seeded_calendar(self, owner_id: uuid.UUID) -> None:
        """Seed sample calendar events only for development dev owner stub if schedule is empty."""
        if owner_id != DEV_OWNER_ID:
            return

        stmt = select(func.count(CalendarEvent.id)).where(CalendarEvent.owner_id == owner_id)
        count = (await self.session.execute(stmt)).scalar() or 0
        if count > 0:
            return

        now = datetime.now(timezone.utc)
        # Tomorrow at 10:00 AM UTC
        tomorrow = now + timedelta(days=1)
        event_1_start = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 10, 0, tzinfo=timezone.utc)
        event_1_end = event_1_start + timedelta(hours=1)

        # In 3 days at 15:00 UTC
        later = now + timedelta(days=3)
        event_2_start = datetime(later.year, later.month, later.day, 15, 0, tzinfo=timezone.utc)
        event_2_end = event_2_start + timedelta(minutes=45)

        seeds = [
            CalendarEvent(
                owner_id=owner_id,
                title="Weekly Engineering Architecture Sync",
                description="Review pgvector RAG indexing, CrewAI tool boundaries, and async loop safety.",
                start_time=event_1_start,
                end_time=event_1_end,
                location="Google Meet / Local Office",
                attendees=["alex.carter@techcorp.io", "owner@personal.ai"],
                status="confirmed",
            ),
            CalendarEvent(
                owner_id=owner_id,
                title="Product Roadmap & Phase 2 Milestone Review",
                description="Sprint 7 review and Sprint 8 research tool planning.",
                start_time=event_2_start,
                end_time=event_2_end,
                location="Zoom",
                attendees=["priya.sharma@investors.vc", "owner@personal.ai"],
                status="confirmed",
            ),
        ]

        self.session.add_all(seeds)
        await self.session.commit()
        logger.info(f"Seeded {len(seeds)} calendar events for owner {owner_id}")

    async def list_events(
        self,
        owner_id: uuid.UUID,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[CalendarEvent]:
        """List events for owner within an optional date range ordered by start_time."""
        await self.ensure_seeded_calendar(owner_id)

        stmt = (
            select(CalendarEvent)
            .where(CalendarEvent.owner_id == owner_id)
            .order_by(CalendarEvent.start_time.asc())
        )

        if start_date:
            stmt = stmt.where(CalendarEvent.end_time >= start_date)
        if end_date:
            stmt = stmt.where(CalendarEvent.start_time <= end_date)

        return list((await self.session.execute(stmt)).scalars().all())

    async def get_event(self, owner_id: uuid.UUID, event_id: uuid.UUID) -> CalendarEvent:
        """Retrieve single calendar event verifying ownership."""
        stmt = select(CalendarEvent).where(CalendarEvent.id == event_id)
        result = await self.session.execute(stmt)
        event = result.scalar_one_or_none()
        if not event:
            raise NotFoundError("CalendarEvent", event_id)
        if event.owner_id != owner_id:
            raise PermissionDeniedError("Access to this event is denied")
        return event

    async def create_event(
        self, owner_id: uuid.UUID, data: CalendarEventCreate
    ) -> CalendarEvent:
        """Create a new scheduled calendar event."""
        event = CalendarEvent(
            owner_id=owner_id,
            title=data.title.strip(),
            description=data.description.strip() if data.description else None,
            start_time=data.start_time,
            end_time=data.end_time,
            location=data.location.strip() if data.location else None,
            attendees=[a.strip().lower() for a in data.attendees if a.strip()],
            status="confirmed",
        )
        self.session.add(event)
        await self.session.commit()
        await self.session.refresh(event)
        logger.info(f"Created calendar event {event.id}: {event.title}")
        return event

    async def update_event(
        self, owner_id: uuid.UUID, event_id: uuid.UUID, data: CalendarEventUpdate
    ) -> CalendarEvent:
        """Update fields of an existing calendar event."""
        event = await self.get_event(owner_id, event_id)

        if data.title is not None:
            event.title = data.title.strip()
        if data.description is not None:
            event.description = data.description.strip() if data.description else None
        if data.start_time is not None:
            event.start_time = data.start_time
        if data.end_time is not None:
            event.end_time = data.end_time
        if data.location is not None:
            event.location = data.location.strip() if data.location else None
        if data.attendees is not None:
            event.attendees = [a.strip().lower() for a in data.attendees if a.strip()]
        if data.status is not None:
            event.status = data.status

        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def delete_event(self, owner_id: uuid.UUID, event_id: uuid.UUID) -> None:
        """Delete an existing calendar event."""
        event = await self.get_event(owner_id, event_id)
        await self.session.delete(event)
        await self.session.commit()
        logger.info(f"Deleted calendar event {event_id}")

    async def check_availability(
        self, owner_id: uuid.UUID, target_date: datetime
    ) -> AvailabilityResponse:
        """Inspect daily schedule and compute open working hour slots (09:00 - 18:00 UTC)."""
        day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, tzinfo=timezone.utc)
        day_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=timezone.utc)

        events = await self.list_events(owner_id, start_date=day_start, end_date=day_end)

        # Standard workday: 09:00 - 18:00 UTC
        work_start = datetime(target_date.year, target_date.month, target_date.day, 9, 0, tzinfo=timezone.utc)
        work_end = datetime(target_date.year, target_date.month, target_date.day, 18, 0, tzinfo=timezone.utc)

        open_slots: List[AvailabilitySlot] = []
        current_cursor = work_start

        for ev in events:
            ev_start = ev.start_time if ev.start_time.tzinfo else ev.start_time.replace(tzinfo=timezone.utc)
            ev_end = ev.end_time if ev.end_time.tzinfo else ev.end_time.replace(tzinfo=timezone.utc)

            if ev_start > current_cursor:
                # Gap available
                open_slots.append(
                    AvailabilitySlot(
                        start=current_cursor.strftime("%H:%M UTC"),
                        end=ev_start.strftime("%H:%M UTC"),
                    )
                )
            if ev_end > current_cursor:
                current_cursor = ev_end

        if current_cursor < work_end:
            open_slots.append(
                AvailabilitySlot(
                    start=current_cursor.strftime("%H:%M UTC"),
                    end=work_end.strftime("%H:%M UTC"),
                )
            )

        return AvailabilityResponse(
            date=day_start.strftime("%Y-%m-%d"),
            busy_events=events,  # type: ignore[arg-type]
            suggested_open_slots=open_slots,
        )
