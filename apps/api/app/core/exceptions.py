"""Custom domain exception hierarchy for clean error handling."""

from typing import Any


class AppException(Exception):
    """Base exception for application-level domain errors."""

    def __init__(self, message: str, status_code: int = 400, details: Any = None) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class NotFoundError(AppException):
    """Resource not found error."""

    def __init__(self, resource: str, identifier: Any) -> None:
        super().__init__(
            message=f"{resource} '{identifier}' was not found.",
            status_code=404,
        )


class PermissionDeniedError(AppException):
    """Unauthorized or forbidden access error."""

    def __init__(self, message: str = "Access to requested resource is forbidden.") -> None:
        super().__init__(message=message, status_code=403)
