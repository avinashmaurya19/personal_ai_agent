"""Email module initialization."""

from app.modules.email.router import router
from app.modules.email.schemas import DraftEmailCreate, EmailResponse, EmailThreadSummary, SendEmailRequest
from app.modules.email.service import EmailService

__all__ = [
    "router",
    "EmailResponse",
    "EmailThreadSummary",
    "DraftEmailCreate",
    "SendEmailRequest",
    "EmailService",
]
