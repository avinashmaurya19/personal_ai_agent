"""FastAPI router for user authentication, registration, and profile queries."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_owner, get_db_session
from app.db.models.user import User
from app.modules.auth.schemas import (
    GoogleAuthRequest,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Accounts"])


def get_auth_service(
    session: AsyncSession = Depends(get_db_session),
) -> AuthService:
    """Dependency producing AuthService instance."""
    return AuthService(session)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register_user(
    payload: UserRegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Create a new account with email and password, returning JWT access token."""
    return await service.register(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in with email and password",
)
async def login_user(
    payload: UserLoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Authenticate email & password, returning JWT access token."""
    return await service.login(payload.email, payload.password)


@router.post(
    "/google",
    response_model=TokenResponse,
    summary="Sign in or register with Google OAuth token",
)
async def login_google(
    payload: GoogleAuthRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Authenticate with Google OAuth access token, creating or logging into account."""
    return await service.authenticate_google(payload.access_token)


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile",
)
async def get_current_user_profile(
    owner: User = Depends(get_current_owner),
) -> UserProfileResponse:
    """Return the profile of the currently authenticated user."""
    return UserProfileResponse.model_validate(owner)
