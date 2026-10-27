"""Email domain service managing mailbox threads, drafts, and realistic simulation seeding."""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import DEV_OWNER_ID
from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.core.logging import logger
from app.db.models.email import EmailMessage
from app.modules.email.schemas import DraftEmailCreate, EmailThreadSummary


class EmailService:
    """Manages email messages, mailbox threads, search, and drafts."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def ensure_seeded_mailbox(self, owner_id: uuid.UUID) -> None:
        """Seed sample emails only for development dev owner stub if mailbox is empty."""
        if owner_id != DEV_OWNER_ID:
            return

        stmt = select(func.count(EmailMessage.id)).where(EmailMessage.owner_id == owner_id)
        count = (await self.session.execute(stmt)).scalar() or 0
        if count > 0:
            return

        seeds = [
            EmailMessage(
                owner_id=owner_id,
                thread_id="th_alex_q4_sync",
                sender="alex.carter@techcorp.io",
                recipient="owner@personal.ai",
                subject="Q4 Roadmap & Team Sync",
                body=(
                    "Hey Avinash,\n\n"
                    "Can we schedule a 30-minute sync this Thursday at 2:00 PM UTC to go over "
                    "the project roadmap and technical milestones? Let me know if that time works for you.\n\n"
                    "Best,\nAlex Carter"
                ),
                snippet="Can we schedule a 30-minute sync this Thursday at 2:00 PM UTC...",
                is_read=False,
                is_draft=False,
                sent_at=datetime.now(timezone.utc),
            ),
            EmailMessage(
                owner_id=owner_id,
                thread_id="th_cloud_budget",
                sender="alerts@cloudinfra.com",
                recipient="owner@personal.ai",
                subject="Monthly Infrastructure Spend: ₹0.00",
                body=(
                    "Hello Avinash,\n\n"
                    "Your monthly infrastructure spend across local Dockerized services remains ₹0.00. "
                    "All local pgvector and Redis instances are running within expected limits.\n\n"
                    "Cloud Infrastructure Monitoring"
                ),
                snippet="Your monthly infrastructure spend across local Dockerized services remains ₹0.00...",
                is_read=True,
                is_draft=False,
                sent_at=datetime.now(timezone.utc),
            ),
            EmailMessage(
                owner_id=owner_id,
                thread_id="th_priya_feedback",
                sender="priya.sharma@investors.vc",
                recipient="owner@personal.ai",
                subject="Demo Feedback & Next Steps",
                body=(
                    "Hi Avinash,\n\n"
                    "Great progress on the Personal AI Assistant. The CrewAI tool execution and "
                    "transparent auditing in the web drawer look very solid. Let me know when "
                    "the email and calendar approval workflows are live so we can test them.\n\n"
                    "Regards,\nPriya Sharma"
                ),
                snippet="Great progress on the Personal AI Assistant. The CrewAI tool execution...",
                is_read=False,
                is_draft=False,
                sent_at=datetime.now(timezone.utc),
            ),
        ]

        self.session.add_all(seeds)
        await self.session.commit()
        logger.info(f"Seeded {len(seeds)} sample email messages for owner {owner_id}")

    async def list_threads(
        self,
        owner_id: uuid.UUID,
        unread_only: bool = False,
        query: Optional[str] = None,
    ) -> List[EmailThreadSummary]:
        """List distinct email threads with aggregated unread state and recent snippets."""
        await self.ensure_seeded_mailbox(owner_id)

        stmt = (
            select(EmailMessage)
            .where(EmailMessage.owner_id == owner_id, EmailMessage.is_draft == False)  # noqa: E712
            .order_by(EmailMessage.created_at.desc())
        )

        if query:
            clean_q = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    EmailMessage.subject.ilike(clean_q),
                    EmailMessage.body.ilike(clean_q),
                    EmailMessage.sender.ilike(clean_q),
                )
            )

        messages = list((await self.session.execute(stmt)).scalars().all())

        # Group by thread_id
        threads_map: dict[str, list[EmailMessage]] = {}
        for m in messages:
            threads_map.setdefault(m.thread_id, []).append(m)

        summaries: List[EmailThreadSummary] = []
        for tid, tmsgs in threads_map.items():
            has_unread = any(not m.is_read for m in tmsgs)
            if unread_only and not has_unread:
                continue

            last_msg = tmsgs[0]  # ordered desc
            summaries.append(
                EmailThreadSummary(
                    thread_id=tid,
                    subject=last_msg.subject,
                    last_sender=last_msg.sender,
                    recipient=last_msg.recipient,
                    snippet=last_msg.snippet,
                    message_count=len(tmsgs),
                    has_unread=has_unread,
                    last_activity=last_msg.created_at,
                )
            )

        return summaries

    async def get_thread_messages(
        self, owner_id: uuid.UUID, thread_id: str
    ) -> List[EmailMessage]:
        """Retrieve all messages in an email thread in chronological order."""
        stmt = (
            select(EmailMessage)
            .where(EmailMessage.owner_id == owner_id, EmailMessage.thread_id == thread_id)
            .order_by(EmailMessage.created_at.asc())
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def mark_thread_as_read(
        self, owner_id: uuid.UUID, thread_id: str
    ) -> None:
        """Mark all messages in a thread as read."""
        messages = await self.get_thread_messages(owner_id, thread_id)
        for m in messages:
            m.is_read = True
        await self.session.commit()

    async def create_draft(
        self, owner_id: uuid.UUID, data: DraftEmailCreate
    ) -> EmailMessage:
        """Create or save an email draft."""
        thread_id = data.thread_id or f"th_{uuid.uuid4().hex[:12]}"
        snippet = data.body.strip()[:100] + ("..." if len(data.body.strip()) > 100 else "")

        draft = EmailMessage(
            owner_id=owner_id,
            thread_id=thread_id,
            sender="owner@personal.ai",
            recipient=data.recipient.strip(),
            subject=data.subject.strip(),
            body=data.body.strip(),
            snippet=snippet,
            is_read=True,
            is_draft=True,
            sent_at=None,
        )
        self.session.add(draft)
        await self.session.commit()
        await self.session.refresh(draft)
        logger.info(f"Created email draft {draft.id} to {draft.recipient}")
        return draft

    async def list_drafts(self, owner_id: uuid.UUID) -> List[EmailMessage]:
        """List active email drafts for owner."""
        stmt = (
            select(EmailMessage)
            .where(EmailMessage.owner_id == owner_id, EmailMessage.is_draft == True)  # noqa: E712
            .order_by(EmailMessage.updated_at.desc())
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def execute_send(
        self, owner_id: uuid.UUID, recipient: str, subject: str, body: str, thread_id: Optional[str] = None
    ) -> EmailMessage:
        """Execute sending an email (invoked after human approval)."""
        tid = thread_id or f"th_{uuid.uuid4().hex[:12]}"
        snippet = body.strip()[:100] + ("..." if len(body.strip()) > 100 else "")

        sent_msg = EmailMessage(
            owner_id=owner_id,
            thread_id=tid,
            sender="owner@personal.ai",
            recipient=recipient.strip(),
            subject=subject.strip(),
            body=body.strip(),
            snippet=snippet,
            is_read=True,
            is_draft=False,
            sent_at=datetime.now(timezone.utc),
        )
        self.session.add(sent_msg)
        await self.session.commit()
        await self.session.refresh(sent_msg)
        logger.info(f"Dispatched email {sent_msg.id} to {recipient}")
        return sent_msg
