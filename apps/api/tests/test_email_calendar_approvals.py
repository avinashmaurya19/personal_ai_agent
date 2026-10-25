"""Integration and unit tests for email, calendar, approvals, and agent tools."""

from datetime import datetime, timedelta, timezone
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.modules.tools.builtins.calendar_tool import CalendarTool
from app.modules.tools.builtins.email_tool import EmailTool


@pytest.mark.asyncio
async def test_email_threads_and_draft_lifecycle() -> None:
    """Test mailbox thread listing, reading, and draft creation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. List threads (triggers initial auto-seed)
        res = await ac.get("/api/v1/emails/threads")
        assert res.status_code == 200
        threads = res.json()
        assert len(threads) >= 2
        first_tid = threads[0]["thread_id"]

        # 2. Get messages in first thread
        msg_res = await ac.get(f"/api/v1/emails/threads/{first_tid}")
        assert msg_res.status_code == 200
        msgs = msg_res.json()
        assert len(msgs) >= 1

        # 3. Mark thread as read
        read_res = await ac.post(f"/api/v1/emails/threads/{first_tid}/read")
        assert read_res.status_code == 204

        # 4. Create an email draft
        draft_res = await ac.post(
            "/api/v1/emails/drafts",
            json={
                "recipient": "colleague@company.com",
                "subject": "Sprint 7 Delivery Status",
                "body": "Hi, Sprint 7 is fully planned and proceeding on schedule.",
            },
        )
        assert draft_res.status_code == 201
        draft = draft_res.json()
        assert draft["is_draft"] is True
        assert draft["recipient"] == "colleague@company.com"

        # 5. List drafts
        drafts_res = await ac.get("/api/v1/emails/drafts")
        assert drafts_res.status_code == 200
        assert any(d["id"] == draft["id"] for d in drafts_res.json())


@pytest.mark.asyncio
async def test_calendar_events_and_availability() -> None:
    """Test calendar event CRUD and workday availability inspection."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        now = datetime.now(timezone.utc)
        st = (now + timedelta(days=2)).replace(hour=14, minute=0, second=0, microsecond=0)
        et = st + timedelta(minutes=45)

        # 1. Create a calendar event
        create_res = await ac.post(
            "/api/v1/calendar/events",
            json={
                "title": "System Integration Sync",
                "description": "Discuss approval gates and web UI drawers",
                "start_time": st.isoformat(),
                "end_time": et.isoformat(),
                "location": "Google Meet",
                "attendees": ["dev@company.com"],
            },
        )
        assert create_res.status_code == 201
        event = create_res.json()
        event_id = event["id"]
        assert event["title"] == "System Integration Sync"
        assert event["status"] == "confirmed"

        # 2. List events
        list_res = await ac.get("/api/v1/calendar/events")
        assert list_res.status_code == 200
        assert any(e["id"] == event_id for e in list_res.json())

        # 3. Check availability for that day
        avail_res = await ac.get(
            "/api/v1/calendar/availability",
            params={"target_date": st.isoformat()},
        )
        assert avail_res.status_code == 200
        avail = avail_res.json()
        assert len(avail["busy_events"]) >= 1

        # 4. Delete event
        del_res = await ac.delete(f"/api/v1/calendar/events/{event_id}")
        assert del_res.status_code == 204


@pytest.mark.asyncio
async def test_pending_action_approval_workflow() -> None:
    """Test human-in-the-loop approval and execution of a consequential action."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        tool = EmailTool()
        # 1. Assistant triggers consequential send_email action
        tool_out = tool.run(
            action="send_email",
            recipient="investor@fund.vc",
            subject="Personal AI Progress Report",
            body="Here is the comprehensive Sprint 7 progress report.",
        )
        assert "Human Authorization Required" in tool_out
        assert "PENDING OWNER APPROVAL" in tool_out

        # 2. Check pending approvals list
        appr_res = await ac.get("/api/v1/approvals", params={"status": "pending"})
        assert appr_res.status_code == 200
        actions = appr_res.json()
        matching = [a for a in actions if a["action_type"] == "send_email" and a["payload"]["recipient"] == "investor@fund.vc"]
        assert len(matching) >= 1
        action_id = matching[0]["id"]

        # 3. Owner authorizes action
        decide_res = await ac.post(
            f"/api/v1/approvals/{action_id}/decision",
            json={"approved": True},
        )
        assert decide_res.status_code == 200
        decided = decide_res.json()
        assert decided["status"] == "executed"
        assert decided["executed_at"] is not None


def test_calendar_tool_execution() -> None:
    """Test CalendarTool synchronous execution."""
    tool = CalendarTool()

    # 1. List events
    res_list = tool.run(action="list_events")
    assert "Upcoming Calendar Events" in res_list

    # 2. Check availability
    res_avail = tool.run(action="check_availability", date="2026-11-15")
    assert "Availability on 2026-11-15" in res_avail

    # 3. Propose/schedule event (generates PendingAction)
    res_prop = tool.run(
        action="schedule_event",
        title="Sprint 8 Research Kickoff",
        start_time="2026-11-05T14:00:00Z",
        end_time="2026-11-05T15:00:00Z",
        attendees=["researcher@company.com"],
    )
    assert "Human Authorization Required" in res_prop
    assert "PENDING OWNER APPROVAL" in res_prop
