"""Thread-safe tool for inspecting calendar agenda, checking availability, and scheduling meetings."""

from datetime import datetime, timedelta, timezone
import json
from typing import List, Literal, Optional, Type
import uuid
from crewai.tools import BaseTool
import psycopg
from pydantic import BaseModel, Field

from app.api.dependencies import DEV_OWNER_ID
from app.core.context import get_current_owner_id
from app.config import settings


class CalendarToolInput(BaseModel):
    """Input parameters for calendar operations."""

    action: Literal["list_events", "check_availability", "propose_event", "schedule_event"] = Field(
        ...,
        description="Action to perform: 'list_events' (read agenda), 'check_availability' (find free slots on a date), 'propose_event' (draft/check meeting), or 'schedule_event' (propose scheduled invite requiring approval).",
    )
    date: Optional[str] = Field(
        default=None,
        description="Target date in YYYY-MM-DD format (defaults to today if omitted)",
    )
    title: Optional[str] = Field(
        default=None,
        description="Title or topic of the meeting",
    )
    start_time: Optional[str] = Field(
        default=None,
        description="Meeting start time in ISO format (e.g. '2026-10-29T14:00:00Z')",
    )
    end_time: Optional[str] = Field(
        default=None,
        description="Meeting end time in ISO format (e.g. '2026-10-29T14:30:00Z')",
    )
    attendees: Optional[List[str]] = Field(
        default_factory=list,
        description="List of attendee email addresses",
    )
    location: Optional[str] = Field(
        default="Google Meet",
        description="Meeting location or video link",
    )


class CalendarTool(BaseTool):
    """Tool allowing the agent to inspect schedule availability, view agenda, and propose meetings."""

    name: str = "calendar_agenda"
    description: str = (
        "Inspects calendar events, checks free/busy availability on a specific date, and proposes new meetings. "
        "Use this tool whenever the user asks about upcoming meetings, asks 'am I free on...', or wants to schedule a meeting."
    )
    args_schema: Type[BaseModel] = CalendarToolInput

    def _parse_iso(self, ts: Optional[str]) -> Optional[datetime]:
        if not ts:
            return None
        try:
            return datetime.fromisoformat(ts.strip().replace("Z", "+00:00"))
        except Exception:
            return None

    def _run(
        self,
        action: str,
        date: Optional[str] = None,
        title: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        attendees: Optional[List[str]] = None,
        location: Optional[str] = "Google Meet",
        **kwargs: object,
    ) -> str:
        """Execute calendar operations using synchronous psycopg connection."""
        owner_id = get_current_owner_id()
        owner_id_str = str(owner_id)
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

        try:
            with psycopg.connect(db_url) as conn:
                with conn.cursor() as cur:
                    if action == "list_events":
                        # Check count and seed default only for DEV_OWNER stub
                        cur.execute("SELECT COUNT(*) FROM calendar_events WHERE owner_id = %s", (owner_id_str,))
                        count = cur.fetchone()[0]
                        if count == 0 and owner_id == DEV_OWNER_ID:
                            now = datetime.now(timezone.utc)
                            tomorrow = now + timedelta(days=1)
                            st = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 10, 0, tzinfo=timezone.utc).isoformat()
                            et = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 11, 0, tzinfo=timezone.utc).isoformat()
                            cur.execute(
                                """
                                INSERT INTO calendar_events (id, owner_id, title, description, start_time, end_time, location, attendees, status, created_at, updated_at)
                                VALUES (%s, %s, 'Weekly Engineering Architecture Sync', 'Review pgvector RAG indexing & tool safety', %s, %s, 'Google Meet', '["alex.carter@techcorp.io"]', 'confirmed', NOW(), NOW())
                                """,
                                (str(uuid.uuid4()), owner_id_str, st, et),
                            )
                            conn.commit()

                        cur.execute(
                            """
                            SELECT id, title, start_time, end_time, location, attendees
                            FROM calendar_events
                            WHERE owner_id = %s
                            ORDER BY start_time ASC
                            LIMIT 10
                            """,
                            (owner_id_str,),
                        )
                        rows = cur.fetchall()
                        if not rows:
                            return "No scheduled calendar events found."

                        lines = [f"📅 Upcoming Calendar Events ({len(rows)} found):"]
                        for eid, t, s, e, loc, att in rows:
                            st_str = s.strftime("%Y-%m-%d %H:%M")
                            et_str = e.strftime("%H:%M")
                            loc_str = f" @ {loc}" if loc else ""
                            lines.append(f"- **{t}**: {st_str} - {et_str} UTC{loc_str}")
                        return "\n".join(lines)

                    elif action == "check_availability":
                        target_dt = datetime.now(timezone.utc)
                        if date and date.strip():
                            try:
                                parts = [int(p) for p in date.strip().split("-")]
                                target_dt = datetime(parts[0], parts[1], parts[2], tzinfo=timezone.utc)
                            except Exception:
                                pass

                        day_start = datetime(target_dt.year, target_dt.month, target_dt.day, 0, 0, tzinfo=timezone.utc).isoformat()
                        day_end = datetime(target_dt.year, target_dt.month, target_dt.day, 23, 59, 59, tzinfo=timezone.utc).isoformat()

                        cur.execute(
                            """
                            SELECT title, start_time, end_time
                            FROM calendar_events
                            WHERE owner_id = %s AND end_time >= %s AND start_time <= %s
                            ORDER BY start_time ASC
                            """,
                            (owner_id_str, day_start, day_end),
                        )
                        busy = cur.fetchall()
                        date_str = target_dt.strftime("%Y-%m-%d")

                        if not busy:
                            return f"📅 Availability on {date_str}: Completely open! Working hours (09:00 - 18:00 UTC) are free."

                        busy_lines = [f"- {t}: {s.strftime('%H:%M')} - {e.strftime('%H:%M')} UTC" for t, s, e in busy]
                        return (
                            f"📅 Schedule on {date_str}:\n"
                            f"Busy Events:\n" + "\n".join(busy_lines) + "\n"
                            f"Open Working Hours available outside those times (09:00 - 18:00 UTC)."
                        )

                    elif action in ("propose_event", "schedule_event"):
                        if not title or not title.strip():
                            return "Error: Title is required for the event."
                        if not start_time or not end_time:
                            return "Error: Both start_time and end_time in ISO format are required."

                        st_dt = self._parse_iso(start_time)
                        et_dt = self._parse_iso(end_time)
                        if not st_dt or not et_dt:
                            return "Error: Invalid date format. Use ISO format (e.g. 2026-10-30T14:00:00Z)."

                        # Consequential action: register PendingAction
                        action_id = uuid.uuid4()
                        clean_attendees = [a.strip().lower() for a in (attendees or []) if a.strip()]
                        payload = {
                            "title": title.strip(),
                            "start_time": st_dt.isoformat(),
                            "end_time": et_dt.isoformat(),
                            "location": (location or "").strip() or "Google Meet",
                            "attendees": clean_attendees,
                        }
                        desc = f"Schedule meeting '{title.strip()}' on {st_dt.strftime('%Y-%m-%d %H:%M')} UTC with {', '.join(clean_attendees) or 'no extra attendees'}"

                        cur.execute(
                            """
                            INSERT INTO pending_actions (id, owner_id, action_type, description, payload, status, created_at, updated_at)
                            VALUES (%s, %s, 'create_calendar_event', %s, %s, 'pending', NOW(), NOW())
                            """,
                            (str(action_id), owner_id_str, desc, json.dumps(payload)),
                        )
                        conn.commit()
                        return (
                            f"⚠️ Human Authorization Required:\n"
                            f"Meeting invitation proposal has been prepared and is awaiting your review.\n"
                            f"- Action ID: {action_id}\n"
                            f"- Event: {title}\n"
                            f"- Time: {st_dt.strftime('%Y-%m-%d %H:%M')} - {et_dt.strftime('%H:%M')} UTC\n"
                            f"- Status: PENDING OWNER APPROVAL (Review and authorize in Approvals drawer)"
                        )

                    else:
                        return f"Unknown calendar action: '{action}'. Valid actions: list_events, check_availability, propose_event, schedule_event."

        except Exception as exc:
            return f"Database error in calendar tool: {str(exc)}"
