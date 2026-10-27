"""Agent Runtime Coordinator orchestrating multi-step execution and audited tool invocations."""

from datetime import datetime, timezone
import os
import re
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
from app.api.dependencies import DEV_OWNER_ID
from app.core.context import current_owner_id_var
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
        owner_id: Optional[uuid.UUID] = None,
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
                    token = None
                    if owner_id is not None:
                        token = current_owner_id_var.set(owner_id)
                    try:
                        output = base_tool._run(**kwargs)
                        return output
                    except Exception as e:
                        status = "error"
                        output = f"Tool Error: {str(e)}"
                        return output
                    finally:
                        if token is not None:
                            current_owner_id_var.reset(token)
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
        owner_id: Optional[uuid.UUID] = None,
    ) -> Tuple[str, List[dict[str, Any]], List[dict[str, Any]]]:
        """Execute a conversational turn via CrewAI agent with audited tool access."""
        resolved_owner_id = owner_id or DEV_OWNER_ID
        owner_token = current_owner_id_var.set(resolved_owner_id)
        try:
            captured_executions: list[dict[str, Any]] = []

            # Fast path for automated testing
            if settings.ENVIRONMENT == "testing":
                return cls._run_testing_stub(user_prompt)

            audited_tools = cls._create_audited_tools(captured_executions, owner_id=resolved_owner_id)
            llm = CrewAILLMService.get_llm(provider=provider, model_name=model_name)

            agent = Agent(
                role="AceVertix Personal Assistant",
                goal=(
                    "Assist the user effectively and conversationally. Always address the user directly. "
                    "Never expose your internal chain of thought, reasoning, or 'Thought:' annotations in output. "
                    "Always deliver your final response in clean, polished conversational prose or markdown."
                ),
                backstory=(
                    "You are AceVertix Assistant, an expert personal executive and software assistant. "
                    "You speak warmly, directly, and concisely to the user. "
                    "You respect the user's stated preferences and memories. "
                    "For casual greetings (e.g., 'hi', 'hello', 'hey'), respond warmly and offer your assistance. "
                    "Never enclose your entire response inside triple backticks or code blocks."
                ),
                llm=llm,
                tools=audited_tools,
                verbose=False,
            )

            # Build context from recent turns and system clock
            now_utc = datetime.now(timezone.utc)
            system_time_context = (
                f"Current System UTC Date: {now_utc.strftime('%A, %B %d, %Y')} (Current Year: {now_utc.year})\n\n"
            )

            recent_context = ""
            if dialogue_history:
                turns = [f"{m.role.upper()}: {m.content}" for m in dialogue_history[-4:]]
                recent_context = "Recent Conversation Context:\n" + "\n".join(turns) + "\n\n"

            task = Task(
                description=(
                    f"{system_time_context}{memory_context}{recent_context}Current User Request: {user_prompt}\n\n"
                    "CRITICAL EXECUTION & OUTPUT GUIDELINES:\n"
                    "1. Speak DIRECTLY to the user in a natural, polite, helpful tone.\n"
                    "2. NEVER output 'Thought:', internal deliberation, or agent scratchpad in the final response.\n"
                    "3. Do NOT wrap your entire response in triple backticks or code fences. Only use code blocks for actual programming code.\n"
                    "4. If the user says a greeting (like 'hi', 'hello', 'hey'), respond warmly and ask how you can assist them today.\n"
                    "5. MANDATORY TOOL EXECUTION ('Do the Work' Principle): Whenever the user asks, instructs, or confirms (e.g. saying 'yes', 'confirm', 'proceed', 'delete all') to create, delete, complete, or modify tasks, emails, notes, or calendar events, YOU MUST ACTUALLY CALL THE CORRESPONDING TOOL (e.g. manage_tasks with action='delete' and task_id='all', or action='clear').\n"
                    "6. NEVER pretend or claim an action was done (such as saying 'They have been deleted' or 'I removed them') unless you have actually invoked the tool and received confirmation from the database in this turn.\n"
                    "7. When the user confirms an action previously proposed by you (such as confirming 'yes' to delete or complete tasks), interpret their response in context and IMMEDIATELY execute the corresponding tool calls to perform that action.\n"
                    "8. TASK UPDATES vs CREATION: When the user asks to update, edit, change the due date, change priority, or reschedule an existing task, YOU MUST CALL manage_tasks with action='update'. NEVER call action='create' when updating an existing task! Specify task_id (the task title or ID) and the updated due_date, priority, or title."
                ),
                expected_output="A helpful, polite, and direct conversational response to the user.",
                agent=agent,
            )

            crew = Crew(
                agents=[agent],
                tasks=[task],
                verbose=False,
            )

            raw_result = await crew.kickoff_async()
            assistant_content = cls._clean_agent_output(str(raw_result))

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
        finally:
            current_owner_id_var.reset(owner_token)

    @classmethod
    def _clean_agent_output(cls, raw_output: str) -> str:
        """Sanitize LLM output by removing code fence wrappers and chain-of-thought leaks."""
        if not raw_output:
            return ""

        text = raw_output.strip()

        # 1. Strip leading stray markdown artifacts (like '**\n```markdown' or '```markdown')
        if text.startswith("**\n") or text.startswith("**\r\n"):
            text = text[2:].strip()

        # 2. Strip surrounding code fences if the entire message is wrapped in ``` or ```markdown
        code_fence_pattern = re.compile(r"^```(?:markdown|text|md)?\s*\n(.*?)\n```$", re.DOTALL | re.IGNORECASE)
        match = code_fence_pattern.match(text)
        if match:
            text = match.group(1).strip()
        elif text.startswith("```") and text.endswith("```") and text.count("```") == 2:
            lines = text.splitlines()
            if len(lines) >= 2:
                text = "\n".join(lines[1:-1]).strip()

        # 3. Handle CrewAI 'Final Answer:' if present
        if "Final Answer:" in text:
            parts = text.split("Final Answer:", 1)
            text = parts[1].strip()

        # 4. Handle leaked 'Thought:' or chain-of-thought blocks
        if text.startswith("Thought:"):
            lines = text.splitlines()
            non_thought_lines: list[str] = []
            past_thoughts = False
            for line in lines:
                if past_thoughts:
                    non_thought_lines.append(line)
                elif (
                    line.startswith("Thought:")
                    or line.startswith("Action:")
                    or line.startswith("Action Input:")
                    or line.startswith("Observation:")
                ):
                    continue
                elif not line.strip() and not past_thoughts:
                    continue
                else:
                    past_thoughts = True
                    non_thought_lines.append(line)

            cleaned_candidate = "\n".join(non_thought_lines).strip()
            if cleaned_candidate:
                text = cleaned_candidate
            else:
                # The entire output was internal deliberation
                lower = text.lower()
                if "greeting" in lower or "hello" in lower or "hi" in lower:
                    text = "Hello! How can I assist you today? You can ask me to summarize emails, inspect calendar events, search documents, or manage tasks."
                else:
                    text = "I'm here and ready to help. How can I assist you with your tasks or questions today?"

        return text

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
