# Active Task Tracker & Sprint Backlog

> **Current Sprint:** Sprint 8 — Research & Reporting  
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

### Sprint 6: Tasks, Notes & Reminders (Completed)
*Goal: Conversational task management, structured notes with tagging, priority and due dates, agent execution tools, and a unified Productivity Drawer in the web UI.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S6-01** | Define `Task` and `Note` SQLAlchemy models with priority, status, and tag support | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-02** | Generate and apply Alembic migration for tasks and notes tables | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-03** | Build `TaskService` and `NoteService` domain modules in `apps/api/app/modules/tasks/` | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-04** | Implement REST CRUD routers (`/api/v1/tasks`, `/api/v1/notes`) with query filtering | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-05** | Build agent execution tools (`TaskManageTool`, `NoteManageTool`) with thread-safe DB operations | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-06** | Build unified Tasks & Notes drawer in Next.js web app (filters, check-off, note editor) | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-07** | Connect task tool execution to agent coordinator for conversational task creation & status changes | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S6-08** | Write integration tests for task/note CRUD, query filters, and agent tool execution | 2h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 6 Definition of Done Checklist
- [x] `Task` and `Note` database models defined with owner isolation
- [x] Alembic migration applied successfully (`11a45ba2011b_create_tasks_and_notes_tables.py`)
- [x] REST API routes for tasks and notes with status/priority filtering
- [x] Agent tools `TaskManageTool` and `NoteManageTool` registered in runtime coordinator
- [x] Next.js Tasks & Notes drawer with check-off, filters, and quick creation
- [x] Natural language task commands ("remind me to...", "create task...", "mark task as done") verified via web chat
- [x] All automated tests passing cleanly (25/25 tests passing)

---

### Sprint 7: Email & Calendar Workflows (Completed)
*Goal: Local and cloud email/calendar integrations, thread search and summarization, draft generation, and human approval gates for external mutations.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S7-01** | Define `EmailMessage`, `CalendarEvent`, and `PendingAction` models with owner scoping | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-02** | Generate and apply Alembic migration for emails, calendar events, and pending actions | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-03** | Build `EmailService` and `CalendarService` with local seeded mailbox & Google OAuth adapter | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-04** | Implement REST CRUD endpoints (`/api/v1/emails`, `/api/v1/calendar`, `/api/v1/approvals`) | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-05** | Build agent tools (`EmailTool`, `CalendarTool`) enforcing read/draft vs approval policy | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-06** | Build Next.js Inbox, Calendar & Approvals Drawer with interactive action authorization | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-07** | Connect conversational email summarization and calendar scheduling to agent coordinator | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S7-08** | Write automated integration tests for email reading, draft generation, and approval execution | 2h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 7 Definition of Done Checklist
- [x] `EmailMessage`, `CalendarEvent`, and `PendingAction` database models created
- [x] Alembic migration applied cleanly (`664cdbfbcfa9_create_email_calendar_and_pending_.py`)
- [x] Pluggable provider adapter (local zero-cost mailbox + Google OAuth scaffolding)
- [x] REST API routes for emails, calendar agenda, and approval authorization
- [x] Agent tools `EmailTool` and `CalendarTool` registered in coordinator
- [x] Human approval policy: sending emails/invites generates a `PendingAction` held until owner approval
- [x] Next.js drawer for viewing inbox threads, calendar agenda, and approving pending actions
- [x] All automated tests passing cleanly (29/29 tests passing)

---
### Sprint 8: Research & Reporting (Completed)
*Goal: Pluggable web search (DDGS/free search), webpage scraping/extraction, source comparison, fact verification, and Markdown report generation.*

| ID | Task Description | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S8-01** | Add zero-cost search and scraping dependencies (`ddgs`, `beautifulsoup4`) | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-02** | Define `ResearchReport` database model with owner scoping, topic, and citations | 2h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-03** | Generate and apply Alembic migration for `research_reports` table | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-04** | Build `SearchService` (DDGS) and `WebScraperService` (clean markdown extraction) | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-05** | Implement agent tools `WebSearchTool` and `DeepResearchTool` in `ToolRegistry` | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-06** | Implement REST CRUD endpoints (`/api/v1/research`) for research report generation & inspection | 3h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-07** | Build Next.js Research & Notes Workspace in Stitch design system with report viewer | 4h | [x] | 2026-10-25 | 2026-10-25 |
| **S8-08** | Write automated unit and integration tests (`pytest`) covering search, scraping, and reports | 3h | [x] | 2026-10-25 | 2026-10-25 |

#### Sprint 8 Definition of Done Checklist
- [x] Dependencies added and pinned in `requirements.txt`
- [x] `ResearchReport` database model and Alembic migration applied cleanly
- [x] Zero-cost DuckDuckGo search and HTTP page extraction operational
- [x] `WebSearchTool` and `DeepResearchTool` registered in runtime coordinator
- [x] REST API routes for listing, reading, generating, and deleting research reports
- [x] Next.js frontend research view integrated into Stitch design shell
- [x] Automated tests passing (100% test pass rate, 33/33 tests green)

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
- **2026-10-25 (Completed)**: Extracted and implemented executive-grade dark UI design system from `stitch_design_system_builder.zip`:
  - Persistent left sidebar (`AppSidebar`) with workspace, knowledge, automation, integrations, system sections and "Avinash • Workspace Owner" profile.
  - Fixed top navbar (`AppHeader`) with breadcrumbs, global search `⌘K`, and live agent status badge (`24ms local latency`).
  - Executive Overview dashboard (`StitchDashboard`) with Command Desk banner, quick launchpad, 4 metric stat cards, Today's Priorities task manager, Upcoming Agenda with "Join Call", and multi-stream Recent Activity feed.
  - Dedicated views for AI Assistant (`StitchChatView`), Documents (`DocumentsView`), Memory (`MemoryView`), Tasks (`TasksView`), Approvals (`ApprovalsView`), Email (`EmailView`), and Settings (`SettingsView`).
  - Floating Action Button (FAB) at bottom-right ("Chat with AI") allowing chat overlay across all views.
  - All files strictly adhere to the <500 lines per file limit. Next.js build passes with 0 errors and all 29 backend tests pass.
- **2026-10-25 (Fixed)**: Fixed LiteLLM/Mistral `Invalid model: mistral/open-mistral-7b` (400 Bad Request) caused by model names already containing the provider prefix (`mistral/open-mistral-7b`) being prefixed again to `mistral/mistral/open-mistral-7b`. Added automatic model prefix normalization in [`CrewAILLMService.get_llm`](file:///Users/avinashmaurya/AceVertix/Personal%20AI/apps/api/app/modules/llm/service.py) and [`ConversationService.update_conversation_model`](file:///Users/avinashmaurya/AceVertix/Personal%20AI/apps/api/app/modules/conversations/service.py). Added unit test coverage (30/30 tests pass).
- **2026-10-26 (Completed)**: Implemented complete Google OAuth2 & Gmail Integration:
  - Database schema & model `OAuthToken` in `apps/api/app/db/models/oauth.py` with Alembic migration `b78de5db5a6a_create_oauth_tokens_table.py`.
  - Backend `GoogleAuthService` & `OAuthTokenManager` (`apps/api/app/modules/integrations/google_service.py`) supporting authorization URL generation, OAuth callback exchange, proactive token refresh within 60s of expiration, and userinfo retrieval.
  - Backend `GmailService` (`apps/api/app/modules/integrations/gmail_service.py`) supporting message listing, MIME header parsing, base64 body decoding, live Gmail search, and direct sync into database `EmailMessage` records.
  - REST endpoints mounted under `/api/v1/integrations/google` (`/auth-url`, `/callback`, `/status`, `/disconnect`, `/gmail/sync`, `/gmail/search`).
  - Agent `EmailTool` updated with `summarize_emails` and automatic Gmail integration awareness.
  - Frontend integration:
    - Updated `api-client.ts` with Google OAuth, Gmail sync & search methods; factored out types into `api-types.ts` to strictly maintain <500 lines per file limit.
    - Updated `EmailView` (`apps/web/src/features/email/email-view.tsx`) with live Google connection status badge, "Connect Gmail" button, "Sync Live Gmail" action with spinner, and "Disconnect" option.
    - Updated `SettingsView` (`apps/web/src/features/settings/settings-view.tsx`) with Google Workspace & Gmail OAuth card.
    - Added dedicated `ConnectedAppsView` (`apps/web/src/features/integrations/connected-apps-view.tsx`) accessible via sidebar.
  - Tests: Added `apps/api/tests/test_google_gmail.py` covering OAuth URLs, status checks, disconnects, mock Gmail parsing, and EmailTool actions (100% test pass rate, 38/38 tests passing). Fixed `.gitignore` to track `apps/web/src/lib/`. Next.js build passes with 0 errors.
- **2026-10-26 (Completed)**: Overhauled Email UI to authentic Gmail application design (`apps/web/src/features/email/`):
  - Top `GmailHeader`: Search in mail input, live sync button, active Google account status badge.
  - Left `GmailSidebar`: Gmail-style "+ Compose" button, folder navigation (`Inbox`, `Starred`, `Sent`, `Drafts`, `AI Triaged`) with dynamic unread counts.
  - Central `GmailThreadList`: True Gmail row layout featuring selection checkboxes, star toggling, bold unread typography, single-row `Subject - Snippet` truncation, date/time formatting, category tabs (`Primary`, `Promotions`, `Updates`), and on-hover quick actions (archive, mark as read, star).
  - Detailed `GmailMessageDetail`: Gmail reading view with back navigation, sender circular initial avatars, recipient details, Personal AI Executive Briefing card with 1-click smart reply prompts, and expandable inline reply editor with "AI Polish".
  - Floating `GmailComposeModal`: Dockable bottom-right compose window with recipient, subject, body, and "Draft with Personal AI" auto-generator.
  - Modularized across 5 files under `components/` strictly adhering to the <500 lines limit. Next.js build passes with 0 errors.
- **2026-10-26 (Completed)**: Added live Gmail interactive actions & rich HTML rendering:
  - Backend: Added `modify_message_labels`, `star_message`, `mark_message_read`, and `trash_message` to `GmailService`.
  - Backend: Added REST routes `POST /integrations/google/gmail/send`, `POST /integrations/google/gmail/messages/{id}/star`, `POST /integrations/google/gmail/messages/{id}/read`, and `POST /integrations/google/gmail/messages/{id}/trash`.
  - Backend: Enhanced `_extract_body` to handle HTML emails gracefully and extract star labels.
  - Backend: Added `POST /api/v1/emails/send` fallback endpoint.
  - Frontend: Wired live outbound email dispatching in `GmailComposeModal` and `GmailMessageDetail`.
  - Frontend: Added isolated sandboxed iframe body rendering for rich HTML emails (newsletters, styled messages).
  - Frontend: Wired live star toggling and trash synchronization with Google.
  - Tests: Added unit tests for live Gmail actions in `test_google_gmail.py` (all tests passing). Next.js builds cleanly.
- **2026-10-26 (Fixed)**: Fixed Gmail session persistence & auto-sync across app launches:
  - Cause 1: `test_google_gmail.py` ran against `DEV_OWNER_ID` and executed `disconnect`, deleting the real stored OAuth token in PostgreSQL during test runs. Isolated tests to an independent `TEST_OWNER_ID`.
  - Cause 2: UI showed a brief flash of "Connect Gmail" on launch because `googleStatus` initialized to `null`. Added `localStorage` status caching and a loading skeleton so the UI never flashes "Connect Gmail" when already authorized.
  - Cause 3: On app launch, Gmail messages were not auto-fetched unless the user manually clicked "Sync Gmail". Added automatic background sync on initial load whenever Google OAuth is connected.
- **2026-10-26 (Completed)**: Implemented complete User Authentication & Multi-User Data Isolation:
  - Database schema: Added `hashed_password`, `avatar_url`, and `is_active` fields to `User` model with Alembic migration `a3ac604abf42_add_auth_fields_to_users.py`.
  - Backend Security & Token Engine: Created `apps/api/app/core/security.py` using native `bcrypt` password hashing and `PyJWT` with HS256 tokens.
  - Backend Auth Module: Created schemas, service, and router under `apps/api/app/modules/auth/` mounted at `/api/v1/auth` (`/register`, `/login`, `/google`, `/me`).
  - Strict Multi-User Isolation: Updated `get_current_owner` dependency to extract Bearer JWT tokens with fallback to `DEV_OWNER_ID` in development/testing mode. Every query across tasks, notes, emails, memories, documents, and conversations strictly filters by the authenticated `owner_id`.
  - Frontend Authentication Engine:
    - Modularized `api-client.ts`, `api-auth.ts`, `api-integrations.ts`, and `api-types.ts` strictly keeping each under the 500-line limit.
    - Added `AuthProvider` and `useAuth` hook (`apps/web/src/features/auth/auth-context.tsx`) managing JWT tokens in `localStorage`.
    - Added dark Stitch `AuthModal` dialog (`apps/web/src/features/auth/auth-modal.tsx`) with Sign In and Register tabs.
    - Added responsive `UserMenu` (`apps/web/src/features/auth/user-menu.tsx`) in both `AppHeader` and `AppSidebar` with active sandbox badges, account switching, and sign out.
  - Verification: All 41 backend tests passing (100% test pass rate in `pytest`). Frontend Next.js production build succeeds with 0 errors. All files strictly adhere to the <500-line limit.
- **2026-10-27 (Completed)**: Overhauled UI across all pages matching the AceVertix Assistant executive aesthetic:
  - Global Branding & Color Palette: Set deep `#080B14` midnight theme, luminous cyan/purple gradients, and glassmorphic panels in `tailwind.config.ts` and `globals.css`.
  - Sidebar Navigation (`AppSidebar`): Rebuilt to match the screenshot with AceVertix Assistant glowing logo, "+ New Chat" gradient button, right navigation chevrons, and unified section routing.
  - Floating Header (`AppHeader` & `UserMenu`): Clean glass header with search toggle, apps grid, and bold white circular "A" user avatar.
  - Alpine Twilight Mountain Hero (`MountainBackdrop` & `HeroGreeting`): Sunset alpine silhouette with starfield, dynamic time-based greeting ("Good morning/afternoon/evening, [User] 👋"), and 5 quick action cards (unread emails, add task, summarize doc, plan trip, generate report).
  - Unified AI Prompt Center (`AiPromptCenter`): Large rounded input with interactive source filters (Web search, My documents, Gmail, Calendar, Notion), glowing purple send button, and quick suggestion pills.
  - Today & Recent Documents Widgets (`TodayWidget` & `RecentDocumentsWidget`): "Today" widget with "Daily Briefing →" pill and task checkboxes with times; "Recent Documents" widget with red PDF and blue Doc badge styling.
  - Dedicated Calendar View (`CalendarView`): Integrated schedule, event creator, and 1-click meeting "Join Call" actions.
  - Quality Verification: Next.js production build succeeds with 0 errors (`next build`). All 41 backend tests passing in `pytest`. Every file strictly adheres to the <500 lines per file limit.
- **2026-10-27 (Completed)**: UI Polish & User Feedback Implementation:
  - Removed Floating Chat Button: Removed redundant/overlapping floating bottom-right widget to keep clean interface.
  - Chat Page Polish (`StitchChatView`): Removed model switcher dropdown as requested; enriched empty state with twilight glow and quick prompt cards; upgraded message bubbles and bottom composer with purple gradient send button.
  - Polished All App Pages: Upgraded `DocumentsView`, `TasksView`, `MemoryView`, and `SettingsView` to match the AceVertix dark glass `#0D1527` aesthetic with stats cards, glowing badges, and real-time indicators.
  - Added Executive "Coming Soon" View (`ComingSoonView`): Replaced construction placeholders with rich preview cards, floating glowing icons, and notification alerts for in-development modules (Workflows, Notes, MCP Servers, Activity History).
  - Fixed Generation Indicator: Added prominent animated generating response indicator with pulsing bot avatar, bouncing dots, and header status badge; wired `isGenerating` state across all prompt triggers and input composer.
  - Fixed Stretched Boxes: Constrained page container max-widths (`max-w-6xl` for home, `max-w-4xl` for tasks/memory, `max-w-3xl` for chat); changed message bubbles from stretched wide blocks to content-fitted `w-fit max-w-2xl` with rich `MarkdownRenderer` for headings, bullet points, and code blocks.
  - Verification: 100% tests pass (41/41 in `pytest`), `next build` passes with 0 errors, all files <500 lines.
- **2026-10-27 (Fixed)**: Assistant Output Sanitization & Chat UI/UX Overhaul:
  - Root Cause Fixed: CrewAI agent previously leaked internal deliberations (`Thought: The user's response is a casual greeting...`) and wrapped markdown output inside triple backticks (```markdown ... ```), causing `MarkdownRenderer` to display the entire response as a cyan monospace terminal block.
  - Backend Output Sanitization (`coordinator.py`):
    - Added explicit instructions to agent backstory & task to speak directly to the user in a natural tone, never output 'Thought:' deliberation, and never wrap full responses in code blocks.
    - Added `_clean_agent_output` filter to unwrap whole-message code fences, extract final answers, and gracefully transform accidental greeting deliberations into warm greetings.
    - Cleaned 4 legacy assistant messages in PostgreSQL database.
  - Frontend Markdown & Typography (`markdown-renderer.tsx`):
    - Added automatic client-side unwrapping for markdown fences and thought leak filtering.
    - Added support for numbered ordered lists (`1. `, `2. `) alongside bullet lists (`- `, `* `).
    - Upgraded code block rendering with a language header bar and one-click copy button, replacing the raw cyan terminal block.
  - Chat Experience Polish (`stitch-chat-view.tsx`):
    - Redesigned user message bubble with modern vibrant indigo styling (`bg-gradient-to-r from-indigo-600 to-indigo-500`), crisp contrast, and refined typography.
    - Redesigned assistant bubble with clean dark obsidian glass (`bg-[#0D1527]/95 border-white/10 text-[13.5px]`), eliminating cyan terminal styling.
    - Added a prominent "+ New Conversation" button directly at the top of the sessions sidebar.
  - Verification: All 41 backend tests passing (100% in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: 9 Critical UI & System Issues Resolved:
  - 1. Fixed horizontal scrolling in Chat view: Removed viewport-overflowing `w-screen` and fixed padding offset (`pl-60`), placed `AppSidebar` and `AppHeader` into modern reactive flex containers (`w-full overflow-hidden`, `min-w-0`), and set `overflow-x-hidden` on transcripts.
  - 2. Added Collapsible Navigation Sidebar (`AppSidebar`): Sidebar now collapses smoothly between `w-60` (full menu) and `w-16` (icon mode) with a toggle button (`chevron_left` / `chevron_right`) and remembers user preference in `localStorage`.
  - 3. Cleaned Top Right Header: Removed redundant search and apps icons; kept clean User Avatar with profile & sign-out menu.
  - 4. Connected Universal Search Bar (`AppHeader`): Top search bar is now 100% functional with live auto-search across tasks, documents, and chat sessions with dropdown navigation and "Ask AceVertix: <query>" on Enter.
  - 5. Fixed Today Tasks & Recent Documents Empty State: Removed hardcoded fake demo items ("Prepare release sheet", "PRD_AceVertix.pdf") and replaced with clean, dedicated empty states and action buttons when real data is 0.
  - 6 & 9. Fixed Google & Gmail OAuth Disconnect Bug:
    - Root Cause: During Google OAuth redirect callback, the browser performed a top-level GET navigation without an `Authorization: Bearer` header, causing `get_current_owner` to fall back to `DEV_OWNER_ID` (`00000000-0000-0000-0000-000000000001`). As a result, the token was saved under DEV_OWNER while the frontend requested status using the logged-in user JWT (`avinashmaurya539239@gmail.com`).
    - Fix: Updated `google_oauth_callback` in `router.py` to extract `owner_id` from the OAuth `state` parameter (`owner_<id>`) and fallback to email matching in `User` table; migrated existing stored token in PostgreSQL to user `234484fe-9923-4d25-bc1a-41c27069708f`. Both Gmail and Integrations now report "Connected".
  - 7. Calendar View Coming Soon: Replaced mock calendar view with executive `ComingSoonView` detailing upcoming Google Calendar 2-way sync and AI schedule briefing features.
  - 8. Removed 'Embedding Model' Stat Card: Removed the 3rd stat card from `DocumentsView`, rebalancing the grid into 3 clean metric cards (`TOTAL DOCUMENTS`, `VECTOR CHUNKS`, `VECTOR DATABASE`).
  - Deep Proactive Audit Fixes:
    - Fixed Prompt Dispatch Race Condition: When clicking prompts on the dashboard with no conversation selected, asynchronous state update left `selectedId` empty, causing `handleSendMessage` to silently abort. Updated `handleSendMessage` to accept an explicit `targetConvId`.
    - Fixed Unauthenticated Conversation Deletion: Replaced raw `fetch` call in `handleDeleteConversation` with authenticated `api.deleteConversation(id)`.
    - Removed Fake Seeded Emails: Cleaned mock emails (`priya.sharma@investors.vc`, `alex.carter@techcorp.io`, `alerts@cloudinfra.com`) from user's database and disabled automatic mock seeding for all authenticated non-dev users in `email/service.py` and `calendar/service.py`.
    - Upgraded Chat Composer: Replaced single-line input with expandable multi-line `textarea` supporting `Enter` to send and `Shift+Enter` for newlines.
    - Fixed Email Toast Notification: Corrected success toast message to "Email sent successfully via Gmail!".
  - Verification: 100% tests pass (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Agent Tool Execution Multi-User Context Isolation:
  - Root Cause: Built-in agent tools (`task_manage_tool.py`, `note_manage_tool.py`, `calendar_tool.py`, `email_tool.py`, `research_tool.py`) hardcoded `DEV_OWNER_ID` (`00000000-0000-0000-0000-000000000001`). When the user asked the chat assistant to create or list tasks/emails, the agent created tasks in PostgreSQL under `DEV_OWNER_ID`. When the frontend fetched `/api/v1/tasks` using the authenticated user JWT (`avinashmaurya539239@gmail.com`), the query filtered by Avinash's `owner_id` (`234484fe-9923-4d25-bc1a-41c27069708f`), resulting in 0 tasks displayed on the Tasks page. Similarly, `email_tool.py` looked for OAuth tokens under `DEV_OWNER_ID`, falsely reporting that Gmail was disconnected.
  - Context Engine Architecture (`apps/api/app/core/context.py`):
    - Implemented `current_owner_id_var` using Python's `contextvars.ContextVar` and `get_current_owner_id()` helper with graceful fallback to `DEV_OWNER_ID` for tests and CLI stubs.
    - Updated `AgentCoordinator.run_turn` and `ConversationService.add_user_message` to pass and set `current_owner_id_var` throughout the turn.
    - Wrapped tool execution in `AuditedTool._run` to guarantee the authenticated `owner_id` is propagated even when CrewAI executes tools across worker threads.
  - Multi-Tool Owner Isolation:
    - `TaskManageTool`: Updated `create`, `list`, `complete`, and `delete` to operate dynamically on `get_current_owner_id()`.
    - `NoteManageTool`: Updated `create`, `search`, and `list` to operate dynamically on `get_current_owner_id()`.
    - `CalendarTool`: Updated `list_events`, `check_availability`, and `propose_event` to use `get_current_owner_id()`, restricting mock seeding to `DEV_OWNER_ID`.
    - `EmailTool`: Updated `list_threads`, `read_thread`, `draft_reply`, `send_email`, and `summarize_emails` (including `oauth_tokens` check) to query `get_current_owner_id()`.
    - `ResearchTool`: Persists generated research reports under `get_current_owner_id()`.
    - `DocumentSearchTool`: Added owner filter `d.owner_id = %s` ensuring RAG vector similarity search respects owner boundaries.
  - Data Migration & Verification:
    - Migrated existing chat tasks in PostgreSQL (`Optimize reasoning time`, `Improve system speed and performance`, `Design AceVertix Website`) to Avinash's `owner_id` (`234484fe-9923-4d25-bc1a-41c27069708f`).
    - Verified tasks now display cleanly on `/tasks` view and Today's dashboard widget.
    - Verified `EmailTool` immediately recognizes the connected Gmail account (`avinashmaurya539239@gmail.com`) and synthesizes real unread emails.
    - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Task List Query 'status=all' Bug:
  - Root Cause: When the user asked "show me the task list", the LLM called `manage_tasks(action='list', status_filter='all')`. Because `task_manage_tool.py` directly appended `query += " AND status = %s"` with value `'all'`, PostgreSQL executed `WHERE owner_id = %s AND status = 'all'`. Since valid task statuses in the database are `pending`, `in_progress`, `completed`, and `cancelled` (never literal string `'all'`), the query matched 0 rows and returned `"No tasks found with status 'all'."`. The assistant then misinformed the user that their task list was completely empty.
  - Fix: Updated `task_manage_tool.py` and `TaskService.list_tasks` to check `if status_filter and status_filter.lower() not in ("all", "*", "any"):` before appending the SQL WHERE clause. Tested directly with `status_filter='all'`, `None`, and `'pending'`: all tasks now return reliably.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Task Update Action Support & Date Year Protection:
  - Root Cause: `TaskManageTool` did not support an `update` or `reschedule` action (`action` only accepted `"create"`, `"list"`, `"complete"`, `"delete"`, `"clear"`). When the user asked to "update the first task 'Attend Google seminar' date for tomorrow", the LLM had no update action available and invoked `action='create'`, creating duplicate tasks instead of modifying the existing one. In addition, `_parse_due_date` lacked relative date handling and year protection, causing relative dates or LLM training cutoff dates to save with legacy years (2023 instead of 2026).
  - Implementation:
    - Updated `TaskManageTool` in `apps/api/app/modules/tools/builtins/task_manage_tool.py`:
      - Added `action in ("update", "reschedule", "modify", "edit")` supporting in-place modification of title, description, priority, due date, or status.
      - Supported target matching by UUID, title search phrase, or ordinal terms (`"first"`, `"latest"`, `"1st"`).
      - Enhanced `_parse_due_date` with relative date resolution (`"today"`, `"tomorrow"`, `"in X days"`) and year guards (`parsed.year < now.year` automatically adjusts to the current system year).
    - Updated `AgentCoordinator` in `apps/api/app/modules/agent/coordinator.py`:
      - Injected current UTC system date and year (`Current System UTC Date: Tuesday, October 27, 2026`) directly into the agent task context.
      - Added strict prompt directive: whenever a user requests an update, edit, or reschedule of an existing task, the agent MUST call `manage_tasks` with `action='update'` and NEVER `action='create'`.
    - Cleaned up duplicate "Attend Google Seminar" tasks in PostgreSQL and updated the remaining task to `2026-10-28`.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Task List Query 'status=all' Bug:
  - Root Cause: When the user asked "show me the task list", the LLM called `manage_tasks(action='list', status_filter='all')`. Because `task_manage_tool.py` directly appended `query += " AND status = %s"` with value `'all'`, PostgreSQL executed `WHERE owner_id = %s AND status = 'all'`. Since valid task statuses in the database are `pending`, `in_progress`, `completed`, and `cancelled` (never literal string `'all'`), the query matched 0 rows and returned `"No tasks found with status 'all'."`. The assistant then misinformed the user that their task list was completely empty.
  - Fix: Updated `task_manage_tool.py` and `TaskService.list_tasks` to check `if status_filter and status_filter.lower() not in ("all", "*", "any"):` before appending the SQL WHERE clause. Tested directly with `status_filter='all'`, `None`, and `'pending'`: all tasks now return reliably.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Conversation Deletion HTTP 204 Error & Task Bulk Deletion Execution:
  - 1. Fixed Chat Session Deletion UI Freeze:
    - Root Cause: `DELETE /api/v1/conversations/{id}` returned HTTP 204 No Content. In `ApiClient.request`, calling `response.json()` on an empty 204 response threw `SyntaxError: Unexpected end of JSON input`. This uncaught error prevented `setConversations` from running, leaving the deleted chat session visible in the sidebar. When clicked again, the backend returned 404 Not Found (since it was already deleted), continuing to throw errors.
    - Fix: Updated `ApiClient.request` in `apps/web/src/lib/api-client.ts` to detect HTTP 204 or empty content bodies (`response.status === 204 || !text.trim()`) and return safely without throwing JSON parse errors. Updated `handleDeleteConversation` in `page.tsx` to immediately remove the conversation from React state and smoothly catch 404 retries.
  - 2. Fixed Assistant Fake Deletion ("Do the Work" Principle & Bulk Task Support):
    - Root Cause: `TaskManageTool` only supported single-task deletion by ID or title term and did not support bulk operations or clear actions (`action='clear'`, `task_id='all'`). Furthermore, the Agent Coordinator instructions lacked enforcement for user confirmation turns (e.g. user replying "yes" to "Would you like me to delete all five tasks?"), leading the LLM to hallucinate conversational confirmation without calling the tool.
    - Fix:
      - Extended `TaskManageTool` schema to support `action="clear"` / `"delete_all"` and `task_id="all"` with optional `status_filter` (e.g. `pending`, `completed`, `all`).
      - Added bulk completion support (`action="complete"` with `task_id="all"`).
      - Strengthened Agent prompt guidelines in `coordinator.py` with the "Do the Work" Principle: mandating tool execution whenever the user requests or confirms any task or state modification and prohibiting claiming success without database confirmation.
      - Executed real bulk deletion of the 5 pending tasks in PostgreSQL; task count is now verified clean.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Task List Query 'status=all' Bug:
  - Root Cause: When the user asked "show me the task list", the LLM called `manage_tasks(action='list', status_filter='all')`. Because `task_manage_tool.py` directly appended `query += " AND status = %s"` with value `'all'`, PostgreSQL executed `WHERE owner_id = %s AND status = 'all'`. Since valid task statuses in the database are `pending`, `in_progress`, `completed`, and `cancelled` (never literal string `'all'`), the query matched 0 rows and returned `"No tasks found with status 'all'."`. The assistant then misinformed the user that their task list was completely empty.
  - Fix: Updated `task_manage_tool.py` and `TaskService.list_tasks` to check `if status_filter and status_filter.lower() not in ("all", "*", "any"):` before appending the SQL WHERE clause. Tested directly with `status_filter='all'`, `None`, and `'pending'`: all tasks now return reliably.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Task Update Action Support & Date Year Protection:
  - Root Cause: `TaskManageTool` did not support an `update` or `reschedule` action (`action` only accepted `"create"`, `"list"`, `"complete"`, `"delete"`, `"clear"`). When the user asked to "update the first task 'Attend Google seminar' date for tomorrow", the LLM had no update action available and invoked `action='create'`, creating duplicate tasks instead of modifying the existing one. In addition, `_parse_due_date` lacked relative date handling and year protection, causing relative dates or LLM training cutoff dates to save with legacy years (2023 instead of 2026).
  - Implementation:
    - Updated `TaskManageTool` in `apps/api/app/modules/tools/builtins/task_manage_tool.py`:
      - Added `action in ("update", "reschedule", "modify", "edit")` supporting in-place modification of title, description, priority, due date, or status.
      - Supported target matching by UUID, title search phrase, or ordinal terms (`"first"`, `"latest"`, `"1st"`).
      - Enhanced `_parse_due_date` with relative date resolution (`"today"`, `"tomorrow"`, `"in X days"`) and year guards (`parsed.year < now.year` automatically adjusts to the current system year).
    - Updated `AgentCoordinator` in `apps/api/app/modules/agent/coordinator.py`:
      - Injected current UTC system date and year (`Current System UTC Date: Tuesday, October 27, 2026`) directly into the agent task context.
      - Added strict prompt directive: whenever a user requests an update, edit, or reschedule of an existing task, the agent MUST call `manage_tasks` with `action='update'` and NEVER `action='create'`.
    - Cleaned up duplicate "Attend Google Seminar" tasks in PostgreSQL and updated the remaining task to `2026-10-28`.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
- **2026-10-27 (Fixed)**: Task List Query 'status=all' Bug:
  - Root Cause: When the user asked "show me the task list", the LLM called `manage_tasks(action='list', status_filter='all')`. Because `task_manage_tool.py` directly appended `query += " AND status = %s"` with value `'all'`, PostgreSQL executed `WHERE owner_id = %s AND status = 'all'`. Since valid task statuses in the database are `pending`, `in_progress`, `completed`, and `cancelled` (never literal string `'all'`), the query matched 0 rows and returned `"No tasks found with status 'all'."`. The assistant then misinformed the user that their task list was completely empty.
  - Fix: Updated `task_manage_tool.py` and `TaskService.list_tasks` to check `if status_filter and status_filter.lower() not in ("all", "*", "any"):` before appending the SQL WHERE clause. Tested directly with `status_filter='all'`, `None`, and `'pending'`: all tasks now return reliably.
  - Verification: 100% backend tests passing (41/41 in `pytest`), Next.js production build succeeded with 0 errors (`next build`), all files strictly under 500 lines.
