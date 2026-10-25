# Active Task Tracker & Sprint Backlog

> **Current Sprint:** Sprint 6 — Tasks, Notes & Reminders  
> **Phase Target:** Phase 2 — Knowledge & Daily Productivity (Sprints 5–8)  
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

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S4-01** | Define memory domain models and metadata categories in PostgreSQL | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S4-02** | Build candidate memory extraction pipeline from conversation turns | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S4-03** | Implement embedding provider abstraction and pgvector storage | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S4-04** | Implement hybrid semantic and keyword memory retrieval | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S4-05** | Implement recency and relevance scoring for context building | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S4-06** | Build memory management UI (view, search, edit, delete personal facts) | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S4-07** | Add tests for cross-conversation recall, owner-isolation, and fact deletion | 3h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 4 Definition of Done Checklist
- [x] `Memory` model and pgvector column (`087b94e69772_create_memories_table.py`)
- [x] Multi-provider `EmbeddingService` supporting Mistral 1024-dim embeddings & deterministic local fallback
- [x] `MemoryExtractor` automatically extracting durable preferences and personal facts from user message turns
- [x] Hybrid semantic vector + keyword search with recency decay scoring (`MemoryService.hybrid_search`)
- [x] Automated injection of retrieved memories into `AgentCoordinator` task context
- [x] Dedicated Next.js `MemoryDrawer` for viewing, filtering, searching, creating, and deleting personal memories
- [x] Full automated test suite passing (18/18 tests passing)

---

### 🎉 Phase 1: Personal Foundation (Sprints 1–4) — COMPLETE
*Exit Milestone Achieved:* A fully working local assistant monorepo capable of persistent conversations, dynamic LLM model switching (Mistral & local Ollama via native CrewAI), controlled tool execution with database receipts, and long-term memory recall via pgvector at ₹0 infrastructure cost.

---

---

## 📌 Phase 2: Knowledge & Daily Productivity (Sprints 5–8 | ~80 Hours)

| Sprint | Goal | Estimate | Status |
| :--- | :--- | :--- | :--- |
### Sprint 5: Document Knowledge & RAG (Completed)
*Goal: Upload personal PDF, Markdown, and TXT files, chunk and embed in pgvector, and enable grounded question-answering with exact source citations.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S5-01** | Define document schema (`Document`, `DocumentChunk`) in PostgreSQL with pgvector | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-02** | Implement multipart file upload API with size/extension validation & injection defense | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-03** | Build document text extraction (pypdf, markdown, txt) and semantic chunker | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-04** | Generate 1024-dim pgvector embeddings for document chunks via `EmbeddingService` | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-05** | Implement hybrid vector + keyword chunk search with citation metadata | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-06** | Create `document_search` tool in agent tool registry for grounded answering | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-07** | Build Document Management UI drawer (file upload, chunk count, delete) | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S5-08** | Add automated tests for upload, chunking, citation accuracy, and prompt injection defense | 3h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 5 Definition of Done Checklist
- [x] `Document` and `DocumentChunk` relational models created with pgvector 1024-dim embeddings
- [x] Alembic migration applied (`9707570b1dbc_create_documents_and_chunks_tables.py`)
- [x] Multipart upload API (`POST /api/v1/documents/upload`) with 15MB file size boundary and format verification
- [x] Text extraction pipeline with `pypdf` for PDFs, native utf-8/latin-1 for Markdown/TXT, and prompt injection token sanitization
- [x] Recursive semantic chunker with 500-character windows and 100-character overlaps preserving page numbers
- [x] `DocumentSearchTool` registered in default tool catalog for agent grounded RAG execution
- [x] Next.js `DocumentDrawer` for drag & drop file uploads, chunk status badges, search preview, and deletion
- [x] Full automated test suite passing (21/21 tests passing)

---

### Sprint 6: Tasks, Notes & Reminders (Active Sprint)
*Goal: Conversational task management, structured notes with tagging, priority and due dates, agent execution tools, and a unified Productivity Drawer in the web UI.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S6-01** | Define `Task` and `Note` SQLAlchemy models with priority, status, and tag support | 2h | [ ] | 2026-10-25 | |
| **S6-02** | Generate and apply Alembic migration for tasks and notes tables | 1h | [ ] | 2026-10-25 | |
| **S6-03** | Build `TaskService` and `NoteService` domain modules in `apps/api/app/modules/tasks/` | 3h | [ ] | 2026-10-25 | |
| **S6-04** | Implement REST CRUD routers (`/api/v1/tasks`, `/api/v1/notes`) with query filtering | 3h | [ ] | 2026-10-25 | |
| **S6-05** | Build agent execution tools (`TaskManageTool`, `NoteManageTool`) with thread-safe DB operations | 3h | [ ] | 2026-10-25 | |
| **S6-06** | Build unified Tasks & Notes drawer in Next.js web app (filters, check-off, note editor) | 4h | [ ] | 2026-10-25 | |
| **S6-07** | Connect task tool execution to agent coordinator for conversational task creation & status changes | 2h | [ ] | 2026-10-25 | |
| **S6-08** | Write integration tests for task/note CRUD, query filters, and agent tool execution | 2h | [ ] | 2026-10-25 | |

#### Sprint 6 Definition of Done Checklist
- [ ] `Task` and `Note` database models defined with owner isolation
- [ ] Alembic migration applied successfully
- [ ] REST API routes for tasks and notes with status/priority filtering
- [ ] Agent tools `TaskManageTool` and `NoteManageTool` registered in runtime coordinator
- [ ] Next.js Tasks & Notes drawer with check-off, filters, and quick creation
- [ ] Natural language task commands ("remind me to...", "create task...", "mark task as done") verified via web chat
- [ ] All automated tests passing cleanly

---
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
- **2026-10-25 (Fixed)**: Fixed `RuntimeError: Task got Future attached to a different loop` in `DocumentSearchTool` by using synchronous thread-safe `psycopg` connection and `EmbeddingService.get_sync_embedding()`, resolving CrewAI worker thread vs Uvicorn event loop conflict.
