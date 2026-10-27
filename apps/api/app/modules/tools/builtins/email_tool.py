"""Thread-safe tool for searching mailbox threads, reading emails, and drafting replies."""

from datetime import datetime, timezone
import json
from typing import Literal, Optional, Type
import uuid
from crewai.tools import BaseTool
import psycopg
from pydantic import BaseModel, Field

from app.api.dependencies import DEV_OWNER_ID
from app.core.context import get_current_owner_id
from app.config import settings


class EmailToolInput(BaseModel):
    """Input parameters for email operations."""

    action: Literal["list_threads", "read_thread", "draft_reply", "send_email", "summarize_emails"] = Field(
        ...,
        description="Action to perform: 'list_threads' (summary of inbox), 'read_thread' (read all messages in thread), 'summarize_emails' (synthesize recent/unread emails into an executive briefing), 'draft_reply' (save draft without sending), or 'send_email' (propose sending email requiring approval).",
    )
    query: Optional[str] = Field(
        default=None,
        description="Search keyword to filter threads or emails",
    )
    thread_id: Optional[str] = Field(
        default=None,
        description="Thread ID to inspect or reply to",
    )
    recipient: Optional[str] = Field(
        default=None,
        description="Email address of the recipient (required for 'draft_reply' and 'send_email')",
    )
    subject: Optional[str] = Field(
        default=None,
        description="Subject line of the email",
    )
    body: Optional[str] = Field(
        default=None,
        description="Body contents of the email message or reply",
    )


class EmailTool(BaseTool):
    """Tool allowing the agent to read mailbox threads, draft replies, and request send authorization."""

    name: str = "email_inbox"
    description: str = (
        "Reads email threads, summarizes unread messages, drafts replies, and proposes sending emails. "
        "Use this tool whenever the user asks about incoming emails, wants an inbox summary, or wants to draft a response."
    )
    args_schema: Type[BaseModel] = EmailToolInput

    def _run(
        self,
        action: str,
        query: Optional[str] = None,
        thread_id: Optional[str] = None,
        recipient: Optional[str] = None,
        subject: Optional[str] = None,
        body: Optional[str] = None,
        **kwargs: object,
    ) -> str:
        """Execute email operations using synchronous psycopg connection."""
        owner_id = get_current_owner_id()
        owner_id_str = str(owner_id)
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

        try:
            with psycopg.connect(db_url) as conn:
                with conn.cursor() as cur:
                    if action == "list_threads":
                        # Check count and seed default only for DEV_OWNER stub
                        cur.execute("SELECT COUNT(*) FROM email_messages WHERE owner_id = %s", (owner_id_str,))
                        count = cur.fetchone()[0]
                        if count == 0 and owner_id == DEV_OWNER_ID:
                            # Seed default threads
                            now_str = datetime.now(timezone.utc).isoformat()
                            cur.execute(
                                """
                                INSERT INTO email_messages (id, owner_id, thread_id, sender, recipient, subject, body, snippet, is_read, is_draft, sent_at, created_at, updated_at)
                                VALUES 
                                (%s, %s, 'th_alex_q4_sync', 'alex.carter@techcorp.io', 'owner@personal.ai', 'Q4 Roadmap & Team Sync', 'Hey Avinash, can we schedule a 30-min sync this Thursday at 2 PM UTC?', 'Can we schedule a 30-min sync this Thursday...', false, false, %s, NOW(), NOW()),
                                (%s, %s, 'th_cloud_budget', 'alerts@cloudinfra.com', 'owner@personal.ai', 'Monthly Spend: ₹0.00', 'Your monthly infrastructure spend across local Dockerized services is ₹0.00.', 'Your monthly infrastructure spend is ₹0.00...', true, false, %s, NOW(), NOW())
                                """,
                                (str(uuid.uuid4()), owner_id_str, now_str, str(uuid.uuid4()), owner_id_str, now_str),
                            )
                            conn.commit()

                        q_filter = ""
                        params = [owner_id_str]
                        if query and query.strip():
                            q_filter = " AND (subject ILIKE %s OR body ILIKE %s OR sender ILIKE %s)"
                            clean_q = f"%{query.strip()}%"
                            params.extend([clean_q, clean_q, clean_q])

                        cur.execute(
                            f"""
                            SELECT thread_id, subject, sender, snippet, is_read, created_at
                            FROM email_messages
                            WHERE owner_id = %s AND is_draft = false {q_filter}
                            ORDER BY created_at DESC
                            LIMIT 10
                            """,
                            params,
                        )
                        rows = cur.fetchall()
                        if not rows:
                            return "No email threads found."

                        lines = [f"📬 Mailbox Threads ({len(rows)} found):"]
                        for tid, subj, snd, snip, is_r, crt in rows:
                            status_tag = "[READ]" if is_r else "[UNREAD]"
                            lines.append(f"- {status_tag} **{subj}** (From: {snd}) [Thread ID: {tid}]\n  Snippet: \"{snip}\"")
                        return "\n".join(lines)

                    elif action == "read_thread":
                        if not thread_id or not thread_id.strip():
                            return "Error: Provide thread_id to read."

                        cur.execute(
                            """
                            SELECT id, sender, recipient, subject, body, created_at
                            FROM email_messages
                            WHERE owner_id = %s AND thread_id = %s
                            ORDER BY created_at ASC
                            """,
                            (owner_id_str, thread_id.strip()),
                        )
                        rows = cur.fetchall()
                        if not rows:
                            return f"No messages found in thread '{thread_id}'."

                        # Mark as read
                        cur.execute(
                            "UPDATE email_messages SET is_read = true WHERE owner_id = %s AND thread_id = %s",
                            (owner_id_str, thread_id.strip()),
                        )
                        conn.commit()

                        lines = [f"📖 Thread '{rows[0][3]}' ({len(rows)} message(s)):"]
                        for mid, snd, rcp, subj, bdy, crt in rows:
                            lines.append(f"\n--- From: {snd} to {rcp} ({crt.strftime('%Y-%m-%d %H:%M')}) ---")
                            lines.append(bdy)
                        return "\n".join(lines)

                    elif action == "draft_reply":
                        if not recipient or not recipient.strip():
                            return "Error: Recipient email is required to draft a reply."
                        if not subject or not subject.strip():
                            return "Error: Subject is required to draft a reply."
                        if not body or not body.strip():
                            return "Error: Body is required to draft a reply."

                        draft_id = uuid.uuid4()
                        tid = thread_id.strip() if thread_id else f"th_{uuid.uuid4().hex[:12]}"
                        snippet = body.strip()[:100] + ("..." if len(body.strip()) > 100 else "")

                        cur.execute(
                            """
                            INSERT INTO email_messages (id, owner_id, thread_id, sender, recipient, subject, body, snippet, is_read, is_draft, created_at, updated_at)
                            VALUES (%s, %s, %s, 'owner@personal.ai', %s, %s, %s, %s, true, true, NOW(), NOW())
                            """,
                            (str(draft_id), owner_id_str, tid, recipient.strip(), subject.strip(), body.strip(), snippet),
                        )
                        conn.commit()
                        return (
                            f"📝 Email Draft Saved (Not Sent):\n"
                            f"- Draft ID: {draft_id}\n"
                            f"- Recipient: {recipient}\n"
                            f"- Subject: {subject}\n"
                            f"- Status: DRAFTED (Review or send via Approvals drawer)"
                        )

                    elif action == "send_email":
                        # Consequential action: create PendingAction
                        if not recipient or not recipient.strip():
                            return "Error: Recipient email is required to send an email."
                        if not subject or not subject.strip():
                            return "Error: Subject is required to send an email."
                        if not body or not body.strip():
                            return "Error: Body is required to send an email."

                        action_id = uuid.uuid4()
                        payload = {
                            "recipient": recipient.strip(),
                            "subject": subject.strip(),
                            "body": body.strip(),
                            "thread_id": thread_id.strip() if thread_id else None,
                        }
                        desc = f"Send email to '{recipient.strip()}' with subject '{subject.strip()}'"

                        cur.execute(
                            """
                            INSERT INTO pending_actions (id, owner_id, action_type, description, payload, status, created_at, updated_at)
                            VALUES (%s, %s, 'send_email', %s, %s, 'pending', NOW(), NOW())
                            """,
                            (str(action_id), owner_id_str, desc, json.dumps(payload)),
                        )
                        conn.commit()
                        return (
                            f"⚠️ Human Authorization Required:\n"
                            f"Action to send email has been created and is awaiting your review.\n"
                            f"- Action ID: {action_id}\n"
                            f"- Recipient: {recipient}\n"
                            f"- Subject: {subject}\n"
                            f"- Status: PENDING OWNER APPROVAL (Review and approve in the Approvals drawer)"
                        )

                    elif action == "summarize_emails":
                        # Check if Google OAuth connection is active
                        cur.execute("SELECT account_email FROM oauth_tokens WHERE owner_id = %s AND provider = 'google'", (owner_id_str,))
                        oauth_row = cur.fetchone()
                        account_header = f"Connected Gmail: {oauth_row[0]}" if oauth_row and oauth_row[0] else "Local Workspace Mailbox"

                        cur.execute(
                            """
                            SELECT thread_id, subject, sender, snippet, is_read, created_at
                            FROM email_messages
                            WHERE owner_id = %s AND is_draft = false
                            ORDER BY created_at DESC
                            LIMIT 8
                            """,
                            (owner_id_str,),
                        )
                        rows = cur.fetchall()
                        if not rows:
                            return f"📬 Inbox Briefing ({account_header}): Mailbox is completely empty. No emails to summarize."

                        unread_count = sum(1 for r in rows if not r[4])
                        summary_lines = [
                            f"📬 Executive Email Synthesis ({account_header}):",
                            f"Evaluated {len(rows)} recent thread(s) • {unread_count} Unread\n",
                        ]
                        for tid, subj, snd, snip, is_r, crt in rows:
                            tag = "🔴 [UNREAD]" if not is_r else "⚪ [READ]"
                            summary_lines.append(f"{tag} **{subj}** (From: {snd})\n   Key Snippet: {snip}\n   Thread ID: {tid}")

                        return "\n".join(summary_lines)

                    else:
                        return f"Unknown email action: '{action}'. Valid actions: list_threads, read_thread, draft_reply, send_email, summarize_emails."

        except Exception as exc:
            return f"Database error in email tool: {str(exc)}"
