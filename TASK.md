# Active Task Tracker & Sprint Backlog

> **Current Sprint:** Sprint 3 — Agent Runtime & Controlled Tools  
> **Phase Target:** Phase 1 — Personal Foundation (Sprints 1–4)  
> **Last Updated:** 2026-10-25  
> **Workflow Rule:** Mark completed tasks `[x]` immediately after finishing. Add new sub-tasks or bugs discovered during development to the `### 🔍 Discovered During Work` section.

---

## 📌 Phase 1: Personal Foundation (Sprints 1–4 | ~80 Hours)

### Sprint 1: Repository Foundation, Web Chat & Persistence (Active Sprint)
*Goal: Local monorepo with Next.js web chat talking to FastAPI, persisting conversations in PostgreSQL via Docker.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S1-00** | Initialize Antigravity Vibe Coding workflow (`GEMINI.md`, `.agent/`, `PRD.txt`, `PLANNING.md`, `TASK.md`) | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-01** | Create monorepo skeleton, `.gitignore`, `.env.example`, and directory structure | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-02** | Scaffold Next.js 14+ web application in `apps/web` (TypeScript, Tailwind CSS) | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-03** | Scaffold FastAPI backend in `apps/api` with Pydantic settings & config validation | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-04** | Add Docker Compose (`compose.yaml`) for PostgreSQL 16 (pgvector) and Redis 7 | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-05** | Configure SQLAlchemy 2.0 (asyncio) and Alembic migration framework in `apps/api` | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-06** | Define core database models (`User`, `Conversation`, `Message`) & initial migration | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-07** | Implement FastAPI routes for health checks and conversation CRUD operations | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-08** | Build Next.js web chat UI (conversations sidebar, message feed, auto-scroll, input) | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-09** | Connect web chat to FastAPI backend and verify end-to-end message persistence | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-10** | Add automated integration tests (`pytest`) and local execution runbook | 2h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 1 Definition of Done Checklist
- [x] Monorepo structure (`apps/web`, `apps/api`, `infra/`, `packages/`, `docs/`) initialized
- [x] Web app (`apps/web`) builds cleanly & runs locally on port 3000
- [x] FastAPI (`apps/api`) runs locally on port 8000 with Swagger docs (`/docs`)
- [x] PostgreSQL + pgvector and Redis run locally via `docker compose up`
- [x] Alembic creates and upgrades database schema without errors
- [x] Chat messages persist across browser reloads
- [x] Owner-scoping prevents cross-user conversation access
- [x] `.env` is ignored by Git, and `.env.example` has no real secrets
- [x] Automated tests pass (4/4 tests passing in `apps/api/tests`)

---

### Sprint 2: LLM Gateway & Provider Adapters (20 Hours)
*Goal: Switch between Ollama, Gemini, and Mistral without changing business logic.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S2-01** | Define abstract `LLMProvider` interface and standardized completion schemas | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-02** | Implement local Ollama provider adapter with streaming support | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-03** | Implement Google Gemini API (Free tier) provider adapter | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-04** | Implement Mistral API adapter using configured `open-mistral-7b` credentials | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-05** | Add disabled OpenAI adapter interface slot | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-06** | Add central provider/model configuration with `DISABLE_CLOUD_MODELS` switch | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-07** | Implement token usage, latency logging, and timeout/retry error handling | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-08** | Build dynamic model selector dropdown in web chat header | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S2-09** | Add unit and integration tests for provider switching and outage behavior | 2h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 2 Definition of Done Checklist
- [x] CrewAI native LLM integration (`from crewai import LLM`) unified across providers
- [x] Model options catalog endpoint (`GET /api/v1/models`) listing active local & cloud models
- [x] Mistral API connected with `open-mistral-7b`
- [x] Ollama local integration configured for `llama3.2`
- [x] OpenAI adapter disabled to respect ₹0 budget target
- [x] Dynamic model switching dropdown in web chat header with instant persistence
- [x] All 9 automated tests passing with coverage for model switching & safety switches

---

### Sprint 3: Agent Runtime & Controlled Tools (20 Hours)
*Goal: Assistant can select and invoke registered tools under strict safety constraints.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S3-01** | Integrate CrewAI multi-agent orchestration loop behind internal runtime coordinator | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S3-02** | Create typed tool registry with Pydantic argument validation | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S3-03** | Implement initial safe tools: date/time, calculator, task draft, note search | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S3-04** | Persist tool execution records, status codes, and timestamps in database | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S3-05** | Add tool activity and step-by-step reasoning feed in web UI | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S3-06** | Test tool argument validation, unknown tool rejection, and failure recovery | 3h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 3 Definition of Done Checklist
- [x] Internal `AgentCoordinator` orchestrating CrewAI multi-agent loop with async execution (`await crew.kickoff_async()`)
- [x] Centralized `ToolRegistry` with Pydantic argument schemas and introspection endpoint (`GET /api/v1/tools`)
- [x] Initial safe toolset implemented:
  - `SafeCalculatorTool`: AST-parsed math execution (blocks code injection, DoS exponents, zero division)
  - `CurrentDateTimeTool`: System UTC time and day-of-week reporting
  - `TaskDraftTool`: Structured to-do drafting
  - `NoteSearchTool`: Read-only message and note keyword search
- [x] `ToolExecution` database model and Alembic migration (`0a1ce9cb0a27_create_tool_executions_table.py`)
- [x] Collapsible Tool Activity UI badge & drawer in `MessageBubble` rendering execution duration and tool receipts
- [x] Full automated test suite passing (14/14 tests passing)

---

### Sprint 4: Custom Memory Engine (20 Hours)
*Goal: Remember personal facts and recall them across conversations using pgvector.*

| ID | Task Description | Estimate | Status |
| :--- | :--- | :--- | :--- |
| **S4-01** | Define memory domain models and metadata categories in PostgreSQL | 2h | [ ] |
| **S4-02** | Build candidate memory extraction pipeline from conversation turns | 3h | [ ] |
| **S4-03** | Implement embedding provider abstraction and pgvector storage | 3h | [ ] |
| **S4-04** | Implement hybrid semantic and keyword memory retrieval | 4h | [ ] |
| **S4-05** | Implement recency and relevance scoring for context building | 2h | [ ] |
| **S4-06** | Build memory management UI (view, search, edit, delete personal facts) | 3h | [ ] |
| **S4-07** | Add tests for cross-conversation recall, owner-isolation, and fact deletion | 3h | [ ] |

---

## 📌 Phase 2: Knowledge & Daily Productivity (Sprints 5–8 | ~80 Hours)

| Sprint | Goal | Estimate | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 5: Document Knowledge & RAG** | Upload PDF/MD/TXT files, chunk, embed in pgvector, hybrid search with source citations | 20h | [ ] |
| **Sprint 6: Tasks, Notes & Reminders** | Natural language task creation, priority/due dates, reminder schedules, task dashboard UI | 20h | [ ] |
| **Sprint 7: Email & Calendar Workflows** | Google/Microsoft OAuth, thread summarization, draft emails/invites, approval policy for mutations | 20h | [ ] |
| **Sprint 8: Research & Reporting** | Pluggable web search, source comparison, fact verification, Markdown report generation | 20h | [ ] |

---

## 📌 Phase 3: Reliable Automation & Integrations (Sprints 9–12 | ~80 Hours)

| Sprint | Goal | Estimate | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 9: Durable Workflow Execution** | Execution graphs, checkpoints, Redis background worker, idempotency keys, resume interrupted jobs | 20h | [ ] |
| **Sprint 10: Approvals, Permissions & Audit** | Risk level classification, interactive approval cards in UI, one-time execution tokens, audit log | 20h | [ ] |
| **Sprint 11: MCP Client & Connectors** | Model Context Protocol client, dynamic tool discovery, permission scoping, health monitoring | 20h | [ ] |
| **Sprint 12: Scheduling & Proactive Assistant** | Background scheduler, daily morning briefing, follow-up reminders, notification inbox in web UI | 20h | [ ] |

---

## 📌 Phase 4: Channels & Product Hardening (Sprints 13–16 | ~80 Hours)

| Sprint | Goal | Estimate | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 13: WhatsApp Channel Integration** | Webhook verification, sender mapping, messaging adapter routed to unified assistant runtime | 20h | [ ] |
| **Sprint 14: Security, Privacy & Reliability** | Auth hardening, rate limiting, DB backup/restore scripts, container security scan, failure recovery | 20h | [ ] |
| **Sprint 15: Personal Daily-Use Validation** | Run 25+ real-world workflows, benchmark latency/tokens, tune prompt/retrieval, user runbook | 20h | [ ] |
| **Sprint 16: Customer-Readiness Architecture** | Schema migration for `organization_id`, RBAC role matrix, tenant-isolated vector search, admin console | 20h | [ ] |

---

## 🔍 Discovered During Work

> *New sub-tasks, bugs, or refactorings identified during implementation must be logged here with the date discovered.*

- **2026-10-25 (Fixed)**: Root `.env` loading in `apps/api/app/config.py` updated to resolve root directory `.env` dynamically when launched from `apps/api` via `dev.sh`.
- **2026-10-25 (Fixed)**: Guarded cloud provider listing against placeholder credentials (`your_*`, `disabled`) in `CrewAILLMService.list_available_models()`.
- **2026-10-25 (Fixed)**: Added fallback handling and resilient slash-parsing in model switcher dropdown (`apps/web/src/features/chat/chat-view.tsx`).
- **2026-10-25 (Fixed)**: Updated `ConversationCreate` schema to default to configured `DEFAULT_MODEL_PROVIDER` and `DEFAULT_MODEL_NAME`.
