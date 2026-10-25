"""Unit and integration tests for tools, registry, and agent execution."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.modules.tools.builtins.calculator_tool import SafeCalculatorTool, safe_eval_math
from app.modules.tools.builtins.datetime_tool import CurrentDateTimeTool
from app.modules.tools.builtins.note_search_tool import NoteSearchTool
from app.modules.tools.builtins.task_draft_tool import TaskDraftTool
from app.modules.tools.registry import ToolRegistry


def test_safe_calculator_eval() -> None:
    """Verify safe AST mathematical evaluation."""
    assert safe_eval_math("2 + 3") == 5
    assert safe_eval_math("15 * 4") == 60
    assert safe_eval_math("2 + 3 * 4") == 14
    assert safe_eval_math("(2 + 3) * 4") == 20
    assert safe_eval_math("2 ** 8") == 256
    assert safe_eval_math("sqrt(144)") == 12
    assert safe_eval_math("abs(-42)") == 42
    assert safe_eval_math("round(3.14159, 2)") == 3.14

    # Division by zero
    with pytest.raises(ZeroDivisionError):
        safe_eval_math("10 / 0")

    # Security: Code injection prevention
    with pytest.raises(ValueError):
        safe_eval_math("__import__('os').system('ls')")

    with pytest.raises(ValueError):
        safe_eval_math("open('/etc/passwd').read()")

    # Security: Giant exponent DoS protection
    with pytest.raises(ValueError) as exc:
        safe_eval_math("1001 ** 2")
    assert "too large" in str(exc.value).lower()


def test_tool_instances_run() -> None:
    """Verify each built-in safe tool executes with expected structure."""
    calc = SafeCalculatorTool()
    assert "84" in calc.run(expression="12 * 7")

    dt = CurrentDateTimeTool()
    dt_out = dt.run()
    assert "UTC" in dt_out
    assert "Day of Week" in dt_out

    task_tool = TaskDraftTool()
    task_out = task_tool.run(title="Buy groceries", priority="high", due_date="tomorrow")
    assert "Buy groceries" in task_out
    assert "HIGH" in task_out
    assert "DRAFTED" in task_out

    note_tool = NoteSearchTool()
    note_out = note_tool.run(query="meeting")
    assert "meeting" in note_out


def test_tool_registry() -> None:
    """Verify tool catalog registration and execution receipt logging."""
    registry = ToolRegistry()
    meta = registry.list_metadata()
    names = [m.name for m in meta]

    assert "calculator" in names
    assert "current_datetime" in names
    assert "task_draft" in names
    assert "note_search" in names

    # Executing registered tool
    rec = registry.execute_tool("calculator", {"expression": "100 / 4"})
    assert rec.status == "success"
    assert "25" in str(rec.result)
    assert rec.duration_ms >= 0

    # Executing unregistered tool fails gracefully
    err_rec = registry.execute_tool("nonexistent", {})
    assert err_rec.status == "error"
    assert "not found" in err_rec.error_message.lower()


@pytest.mark.asyncio
async def test_tools_api_endpoint() -> None:
    """Verify GET /api/v1/tools returns list of available tools."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/tools")
        assert res.status_code == 200
        tools = res.json()
        assert len(tools) >= 4
        tool_names = [t["name"] for t in tools]
        assert "calculator" in tool_names
        assert "current_datetime" in tool_names


@pytest.mark.asyncio
async def test_agent_message_with_tools() -> None:
    """Verify end-to-end conversation turn invokes tools and populates tool receipts."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        conv_res = await client.post("/api/v1/conversations", json={"title": "Agent Tool Test"})
        assert conv_res.status_code == 201
        conv_id = conv_res.json()["id"]

        # Send math turn
        msg_res = await client.post(
            f"/api/v1/conversations/{conv_id}/messages",
            json={"content": "Please calculate 2 + 2 for me."},
        )
        assert msg_res.status_code == 201
        data = msg_res.json()
        assert "4" in data["content"]
        assert data["tool_calls"] is not None
        assert len(data["tool_calls"]) > 0
        assert data["tool_results"] is not None
        assert len(data["tool_results"]) > 0
        assert data["tool_results"][0]["tool_name"] == "calculator"
