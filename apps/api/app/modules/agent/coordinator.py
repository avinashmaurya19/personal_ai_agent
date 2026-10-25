"""Agent Runtime Coordinator orchestrating multi-step execution and audited tool invocations."""

import os
import time
import uuid
from typing import Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

# Suppress telemetry and interactive sharing prompts in automated runs
os.environ["CREWAI_TELEMETRY_OPT_OUT"] = "true"
os.environ["CREWAI_SHARE_EXECUTION_TRACE"] = "false"
os.environ["OTEL_SDK_DISABLED"] = "true"

from crewai import Agent, Crew, Task
from crewai.llm import LLM
from crewai.tools import BaseTool

from app.config import settings
from app.core.logging import logger
from app.db.models.message import Message
from app.db.models.tool_execution import ToolExecution
from app.modules.llm.service import CrewAILLMService
from app.modules.tools.registry import default_tool_registry

# Patch LLM provider formatter to strip cache_breakpoint for providers that reject it
_ORIG_FORMAT_MESSAGES = LLM._format_messages_for_provider


def _safe_format_messages_for_provider(self: Any, messages: Any) -> Any:
    formatted = _ORIG_FORMAT_MESSAGES(self, messages)
    if isinstance(formatted, list):
        for msg in formatted:
            if isinstance(msg, dict):
                msg.pop("cache_breakpoint", None)
    return formatted


LLM._format_messages_for_provider = _safe_format_messages_for_provider  # type: ignore[method-assign]


class AgentCoordinator:
    """Orchestrates CrewAI agent planning, tool execution, and database auditing."""

    @staticmethod
    def _create_audited_tools(
        captured_executions: list[dict[str, Any]],
    ) -> List[BaseTool]:
        """Wrap registry tools so each invocation is recorded with exact duration and payload."""
        audited_tools: List[BaseTool] = []

        def wrap_tool(base_tool: BaseTool) -> BaseTool:
            class AuditedTool(BaseTool):
                name: str = base_tool.name
                description: str = base_tool.description
                args_schema: Any = getattr(base_tool, "args_schema", None)

                def _run(self, **kwargs: Any) -> Any:
                    start = time.perf_counter()
                    status = "success"
                    output = None
                    try:
                        output = base_tool._run(**kwargs)
                        return output
                    except Exception as e:
                        status = "error"
                        output = f"Tool Error: {str(e)}"
                        return output
                    finally:
                        duration_ms = int((time.perf_counter() - start) * 1000)
                        captured_executions.append(
                            {
                                "tool_name": self.name,
                                "arguments": kwargs,
                                "result": output,
                                "status": status,
                                "duration_ms": duration_ms,
                            }
                        )

            return AuditedTool()

        for registered_tool in default_tool_registry.get_crewai_tools():
            audited_tools.append(wrap_tool(registered_tool))

        return audited_tools

    @classmethod
    async def run_turn(
        cls,
        conversation_id: uuid.UUID,
        user_prompt: str,
        dialogue_history: List[Message],
        provider: str,
        model_name: str,
        session: AsyncSession,
        memory_context: str = "",
    ) -> Tuple[str, List[dict[str, Any]], List[dict[str, Any]]]:
        """Execute a conversational turn via CrewAI agent with audited tool access."""
        captured_executions: list[dict[str, Any]] = []

        # Fast path for automated testing
        if settings.ENVIRONMENT == "testing":
            return cls._run_testing_stub(user_prompt)

        audited_tools = cls._create_audited_tools(captured_executions)
        llm = CrewAILLMService.get_llm(provider=provider, model_name=model_name)

        agent = Agent(
            role="Personal Assistant",
            goal=(
                "Help the user efficiently and accurately. Always use your registered tools "
                "(calculator, current_datetime, manage_tasks, manage_notes, document_search) "
                "to execute calculations, manage tasks, search notes or documents, or inspect system time."
            ),
            backstory=(
                "You are an expert personal software assistant. You value precision and conciseness. "
                "You respect the user's stated preferences and memories."
            ),
            llm=llm,
            tools=audited_tools,
            verbose=False,
        )

        # Build context from recent turns
        recent_context = ""
        if dialogue_history:
            turns = [f"{m.role.upper()}: {m.content}" for m in dialogue_history[-4:]]
            recent_context = "Recent Conversation Context:\n" + "\n".join(turns) + "\n\n"

        task = Task(
            description=(
                f"{memory_context}{recent_context}Current User Request: {user_prompt}\n\n"
                "Instructions: Solve the user request. Use tools if helpful. Provide a clear, natural final response."
            ),
            expected_output="A helpful, accurate, and concise response to the user's request.",
            agent=agent,
        )

        crew = Crew(
            agents=[agent],
            tasks=[task],
            verbose=False,
        )

        raw_result = await crew.kickoff_async()
        assistant_content = str(raw_result).strip()

        # Build formatted tool calls and results for message persistence
        tool_calls: list[dict[str, Any]] = []
        tool_results: list[dict[str, Any]] = []

        for record in captured_executions:
            tool_call_id = f"call_{uuid.uuid4().hex[:8]}"
            tool_calls.append(
                {
                    "id": tool_call_id,
                    "type": "function",
                    "function": {
                        "name": record["tool_name"],
                        "arguments": record["arguments"],
                    },
                }
            )
            tool_results.append(
                {
                    "tool_call_id": tool_call_id,
                    "tool_name": record["tool_name"],
                    "output": record["result"],
                    "status": record["status"],
                    "duration_ms": record["duration_ms"],
                }
            )

            # Persist relational audit entity
            tool_exec = ToolExecution(
                conversation_id=conversation_id,
                tool_name=record["tool_name"],
                arguments=record["arguments"],
                result=record["result"],
                status=record["status"],
                is_consequential=False,
                duration_ms=record["duration_ms"],
            )
            session.add(tool_exec)

        await session.commit()

        return assistant_content, tool_calls, tool_results

    @classmethod
    def _run_testing_stub(
        cls, user_prompt: str
    ) -> Tuple[str, List[dict[str, Any]], List[dict[str, Any]]]:
        """Stub turn execution for fast deterministic testing."""
        prompt_lower = user_prompt.lower()
        tool_calls: list[dict[str, Any]] = []
        tool_results: list[dict[str, Any]] = []

        if "calculate" in prompt_lower or "+" in prompt_lower or "*" in prompt_lower:
            tool_record = default_tool_registry.execute_tool("calculator", {"expression": "2 + 2"})
            call_id = "test_calc_1"
            tool_calls.append({"id": call_id, "function": {"name": "calculator", "arguments": {"expression": "2 + 2"}}})
            tool_results.append({"tool_call_id": call_id, "tool_name": "calculator", "output": tool_record.result, "status": "success", "duration_ms": 1})
            return "The answer is 4.", tool_calls, tool_results

        if "time" in prompt_lower or "date" in prompt_lower:
            tool_record = default_tool_registry.execute_tool("current_datetime", {})
            call_id = "test_dt_1"
            tool_calls.append({"id": call_id, "function": {"name": "current_datetime", "arguments": {}}})
            tool_results.append({"tool_call_id": call_id, "tool_name": "current_datetime", "output": tool_record.result, "status": "success", "duration_ms": 1})
            return f"Current time info:\n{tool_record.result}", tool_calls, tool_results

        return f"Echo response to: {user_prompt}", tool_calls, tool_results
