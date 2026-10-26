"""Gmail REST API client for fetching, searching, reading, and sending emails."""

import base64
from datetime import datetime, timezone
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional
import uuid
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.logging import logger
from app.db.models.email import EmailMessage


class GmailService:
    """Async client interacting with Google Gmail REST API v1."""

    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me"

    def __init__(self, access_token: str) -> None:
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

    async def list_messages(
        self, max_results: int = 10, query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List recent messages matching optional Gmail query filter."""
        params: Dict[str, Any] = {"maxResults": max_results}
        if query:
            params["q"] = query

        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/messages", headers=self.headers, params=params
            )
            if resp.status_code != 200:
                logger.error(f"Gmail list_messages error: {resp.status_code} - {resp.text}")
                raise AppException(f"Gmail API error: {resp.text}", status_code=resp.status_code)

            data = resp.json()
            messages_meta = data.get("messages", [])
            return messages_meta

    async def get_message_detail(self, message_id: str) -> Dict[str, Any]:
        """Fetch full details and parsed headers of a specific email message."""
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/messages/{message_id}",
                headers=self.headers,
                params={"format": "full"},
            )
            if resp.status_code != 200:
                logger.error(f"Gmail get_message error: {resp.status_code} - {resp.text}")
                raise AppException(f"Gmail API error: {resp.text}", status_code=resp.status_code)

            msg_data = resp.json()
            return self._parse_message_payload(msg_data)

    def _parse_message_payload(self, msg_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract sender, recipient, subject, date, snippet, and plain text body."""
        payload = msg_data.get("payload", {})
        headers_list = payload.get("headers", [])

        headers: Dict[str, str] = {}
        for h in headers_list:
            headers[h.get("name", "").lower()] = h.get("value", "")

        subject = headers.get("subject", "(No Subject)")
        sender = headers.get("from", "unknown@gmail.com")
        recipient = headers.get("to", "me")
        date_str = headers.get("date", "")

        body_text = self._extract_body(payload)
        snippet = msg_data.get("snippet", body_text[:120])
        thread_id = msg_data.get("threadId", f"th_{msg_data.get('id')}")

        return {
            "id": msg_data.get("id"),
            "thread_id": thread_id,
            "sender": sender,
            "recipient": recipient,
            "subject": subject,
            "snippet": snippet,
            "body": body_text or snippet,
            "date_str": date_str,
            "unread": "UNREAD" in msg_data.get("labelIds", []),
        }

    def _extract_body(self, payload: Dict[str, Any]) -> str:
        """Recursively extract plain text body from MIME multipart parts."""
        mime_type = payload.get("mimeType", "")
        parts = payload.get("parts", [])

        if not parts and "data" in payload.get("body", {}):
            data_b64 = payload["body"]["data"]
            try:
                decoded = base64.urlsafe_b64decode(data_b64).decode("utf-8", errors="replace")
                return decoded.strip()
            except Exception:
                return ""

        extracted = []
        for part in parts:
            p_mime = part.get("mimeType", "")
            if p_mime == "text/plain" and "data" in part.get("body", {}):
                try:
                    text = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="replace")
                    extracted.append(text.strip())
                except Exception:
                    pass
            elif "parts" in part:
                sub_body = self._extract_body(part)
                if sub_body:
                    extracted.append(sub_body)

        return "\n\n".join(extracted)

    async def search_emails(
        self, query: str, max_results: int = 10
    ) -> List[Dict[str, Any]]:
        """Search Gmail and return detailed message objects."""
        meta_list = await self.list_messages(max_results=max_results, query=query)
        details = []
        for item in meta_list:
            mid = item.get("id")
            if mid:
                try:
                    detail = await self.get_message_detail(mid)
                    details.append(detail)
                except Exception as e:
                    logger.warning(f"Could not load details for message {mid}: {e}")
        return details

    async def send_message(
        self,
        recipient: str,
        subject: str,
        body: str,
        thread_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Construct RFC 2822 email and send via Gmail API."""
        msg = MIMEText(body)
        msg["to"] = recipient
        msg["subject"] = subject
        msg["from"] = "me"

        raw_b64 = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
        payload: Dict[str, Any] = {"raw": raw_b64}
        if thread_id:
            payload["threadId"] = thread_id

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.BASE_URL}/messages/send", headers=self.headers, json=payload
            )
            if resp.status_code not in (200, 201):
                logger.error(f"Gmail send_message error: {resp.status_code} - {resp.text}")
                raise AppException(f"Gmail Send failed: {resp.text}", status_code=resp.status_code)
            return resp.json()

    async def sync_recent_to_db(
        self, session: AsyncSession, owner_id: uuid.UUID, max_results: int = 10
    ) -> int:
        """Fetch latest messages from Gmail and persist or update them in PostgreSQL."""
        meta_list = await self.list_messages(max_results=max_results)
        imported_count = 0

        for item in meta_list:
            mid = item.get("id")
            if not mid:
                continue

            # Check if already present by snippet or thread
            try:
                detail = await self.get_message_detail(mid)
                stmt = select(EmailMessage).where(
                    EmailMessage.owner_id == owner_id,
                    EmailMessage.snippet == detail["snippet"][:100],
                )
                existing = (await session.execute(stmt)).scalar_one_or_none()
                if not existing:
                    new_msg = EmailMessage(
                        owner_id=owner_id,
                        thread_id=detail["thread_id"],
                        sender=detail["sender"],
                        recipient=detail["recipient"],
                        subject=detail["subject"],
                        body=detail["body"],
                        snippet=detail["snippet"],
                        is_read=not detail["unread"],
                        is_draft=False,
                        sent_at=datetime.now(timezone.utc),
                    )
                    session.add(new_msg)
                    imported_count += 1
            except Exception as e:
                logger.warning(f"Error syncing Gmail message {mid}: {e}")

        if imported_count > 0:
            await session.commit()
            logger.info(f"Synchronized {imported_count} live Gmail messages for owner {owner_id}")

        return imported_count
