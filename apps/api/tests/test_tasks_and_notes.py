"""Integration and unit tests for tasks and notes domain, API endpoints, and agent tools."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.modules.tools.builtins.note_manage_tool import NoteManageTool
from app.modules.tools.builtins.task_manage_tool import TaskManageTool


@pytest.mark.asyncio
async def test_task_crud_lifecycle() -> None:
    """Test full CRUD lifecycle for tasks via REST API."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create a task
        create_res = await ac.post(
            "/api/v1/tasks",
            json={
                "title": "Review Q4 Architecture Plan",
                "description": "Examine database scaling and background workers",
                "priority": "high",
                "due_date": "2026-10-31T18:00:00Z",
            },
        )
        assert create_res.status_code == 201
        task_data = create_res.json()
        task_id = task_data["id"]
        assert task_data["title"] == "Review Q4 Architecture Plan"
        assert task_data["priority"] == "high"
        assert task_data["status"] == "pending"
        assert task_data["completed_at"] is None

        # 2. List tasks
        list_res = await ac.get("/api/v1/tasks", params={"status": "pending"})
        assert list_res.status_code == 200
        tasks = list_res.json()
        assert any(t["id"] == task_id for t in tasks)

        # 3. Filter by priority
        filter_res = await ac.get("/api/v1/tasks", params={"priority": "high"})
        assert filter_res.status_code == 200
        assert any(t["id"] == task_id for t in filter_res.json())

        # 4. Mark task as completed
        update_res = await ac.patch(
            f"/api/v1/tasks/{task_id}",
            json={"status": "completed"},
        )
        assert update_res.status_code == 200
        updated = update_res.json()
        assert updated["status"] == "completed"
        assert updated["completed_at"] is not None

        # 5. Delete task
        del_res = await ac.delete(f"/api/v1/tasks/{task_id}")
        assert del_res.status_code == 204

        # Verify not found
        get_res = await ac.get(f"/api/v1/tasks/{task_id}")
        assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_note_crud_lifecycle() -> None:
    """Test full CRUD and search lifecycle for notes via REST API."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create a note
        create_res = await ac.post(
            "/api/v1/notes",
            json={
                "title": "Sprint 6 Architectural Decisions",
                "content": "Using psycopg 3 sync driver inside CrewAI tool threads to avoid event loop conflicts.",
                "tags": ["sprint6", "architecture", "crewai"],
            },
        )
        assert create_res.status_code == 201
        note_data = create_res.json()
        note_id = note_data["id"]
        assert note_data["title"] == "Sprint 6 Architectural Decisions"
        assert "sprint6" in note_data["tags"]

        # 2. List and search by keyword
        search_res = await ac.get("/api/v1/notes", params={"q": "psycopg"})
        assert search_res.status_code == 200
        notes = search_res.json()
        assert any(n["id"] == note_id for n in notes)

        # 3. Filter by tag
        tag_res = await ac.get("/api/v1/notes", params={"tag": "architecture"})
        assert tag_res.status_code == 200
        assert any(n["id"] == note_id for n in tag_res.json())

        # 4. Update note
        update_res = await ac.patch(
            f"/api/v1/notes/{note_id}",
            json={"title": "Sprint 6 Architectural Guidelines"},
        )
        assert update_res.status_code == 200
        assert update_res.json()["title"] == "Sprint 6 Architectural Guidelines"

        # 5. Delete note
        del_res = await ac.delete(f"/api/v1/notes/{note_id}")
        assert del_res.status_code == 204

        # Verify not found
        get_res = await ac.get(f"/api/v1/notes/{note_id}")
        assert get_res.status_code == 404


def test_task_manage_tool_execution() -> None:
    """Test TaskManageTool synchronous execution for create, list, complete, delete."""
    tool = TaskManageTool()

    # 1. Create
    res_create = tool.run(
        action="create",
        title="Automated Test Task For Tool",
        description="Verify tool runs synchronously",
        priority="urgent",
        due_date="2026-11-01",
    )
    assert "Task created successfully" in res_create
    assert "Automated Test Task For Tool" in res_create
    assert "URGENT" in res_create

    # 2. List
    res_list = tool.run(action="list", status_filter="pending")
    assert "Automated Test Task For Tool" in res_list

    # 3. Complete
    res_comp = tool.run(action="complete", task_id="Automated Test Task For Tool")
    assert "Task completed" in res_comp

    # 4. Delete
    res_del = tool.run(action="delete", task_id="Automated Test Task For Tool")
    assert "Task deleted" in res_del


def test_note_manage_tool_execution() -> None:
    """Test NoteManageTool synchronous execution for create, search, list."""
    tool = NoteManageTool()

    # 1. Create
    res_create = tool.run(
        action="create",
        title="Test Research Snippet",
        content="Antigravity pairs with CrewAI effectively.",
        tags=["crewai", "testing"],
    )
    assert "Note saved successfully" in res_create
    assert "Test Research Snippet" in res_create

    # 2. Search
    res_search = tool.run(action="search", query="Antigravity")
    assert "Test Research Snippet" in res_search
    assert "Antigravity pairs with CrewAI effectively" in res_search

    # 3. List
    res_list = tool.run(action="list")
    assert "Test Research Snippet" in res_list
