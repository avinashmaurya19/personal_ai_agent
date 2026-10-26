"""Unit and integration tests for user authentication and multi-user data isolation."""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_auth_registration_and_login_flow() -> None:
    """Test user registration, duplicate prevention, and password login."""
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "SecurePassword123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register new account
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": unique_email,
                "password": password,
                "full_name": "Test User Alpha",
            },
        )
        assert reg_res.status_code == 201
        reg_data = reg_res.json()
        assert "access_token" in reg_data
        token = reg_data["access_token"]
        assert reg_data["user"]["email"] == unique_email
        assert reg_data["user"]["full_name"] == "Test User Alpha"

        # 2. Duplicate registration should fail
        dup_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": unique_email,
                "password": password,
                "full_name": "Duplicate User",
            },
        )
        assert dup_res.status_code == 400

        # 3. Login with wrong password should fail
        bad_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "WrongPassword!"},
        )
        assert bad_login.status_code == 401

        # 4. Login with correct password should succeed
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": password},
        )
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # 5. Access /me endpoint with Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == unique_email


@pytest.mark.asyncio
async def test_multi_user_data_isolation() -> None:
    """Verify that User A's data is completely hidden from User B."""
    email_a = f"alice_{uuid.uuid4().hex[:8]}@example.com"
    email_b = f"bob_{uuid.uuid4().hex[:8]}@example.com"
    password = "Password123!"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register User A
        res_a = await ac.post(
            "/api/v1/auth/register",
            json={"email": email_a, "password": password, "full_name": "Alice"},
        )
        token_a = res_a.json()["access_token"]

        # Register User B
        res_b = await ac.post(
            "/api/v1/auth/register",
            json={"email": email_b, "password": password, "full_name": "Bob"},
        )
        token_b = res_b.json()["access_token"]

        # User A creates a task
        create_task_res = await ac.post(
            "/api/v1/tasks",
            headers={"Authorization": f"Bearer {token_a}"},
            json={
                "title": "Alice Confidential Strategy",
                "priority": "high",
            },
        )
        assert create_task_res.status_code == 201
        task_a_id = create_task_res.json()["id"]

        # User B lists tasks
        tasks_b_res = await ac.get(
            "/api/v1/tasks",
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert tasks_b_res.status_code == 200
        tasks_b = tasks_b_res.json()

        # User B MUST NOT see Alice's task!
        assert not any(t["id"] == task_a_id for t in tasks_b)
        assert not any(t["title"] == "Alice Confidential Strategy" for t in tasks_b)
