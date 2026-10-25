# Active Task Tracker & Sprint Backlog

> **Current Sprint:** Sprint 1 — Monorepo Foundation & Web Chat Persistence  
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
| **S1-01** | Create monorepo skeleton, `.gitignore`, `.env.example`, and directory structure | 2h | [ ] | 2026-10-25 | - |
| **S1-02** | Scaffold Next.js 14+ web application in `apps/web` (TypeScript, Tailwind CSS) | 2h | [ ] | 2026-10-25 | - |
| **S1-03** | Scaffold FastAPI backend in `apps/api` with Pydantic settings & config validation | 2h | [ ] | 2026-10-25 | - |
| **S1-04** | Add Docker Compose (`compose.yaml`) for PostgreSQL 16 (pgvector) and Redis 7 | 2h | [ ] | 2026-10-25 | - |
| **S1-05** | Configure SQLAlchemy 2.0 (asyncio) and Alembic migration framework in `apps/api` | 2h | [ ] | 2026-10-25 | - |
| **S1-06** | Define core database models (`User`, `Conversation`, `Message`) & initial migration | 2h | [ ] | 2026-10-25 | - |
| **S1-07** | Implement FastAPI routes for health checks and conversation CRUD operations | 2h | [ ] | 2026-10-25 | - |
| **S1-08** | Build Next.js web chat UI (conversations sidebar, message feed, auto-scroll, input) | 2h | [ ] | 2026-10-25 | - |
| **S1-09** | Connect web chat to FastAPI backend and verify end-to-end message persistence | 2h | [ ] | 2026-10-25 | - |
| **S1-10** | Add automated integration tests (`pytest`) and local execution runbook | 2h | [ ] | 2026-10-25 | - |

#### Sprint 1 Definition of Done Checklist
- [ ] Monorepo structure (`apps/web`, `apps/api`, `infra/`, `packages/`, `docs/`) initialized
- [ ] Web app (`apps/web`) runs locally on port 3000
- [ ] FastAPI (`apps/api`) runs locally on port 8000 with Swagger docs (`/docs`)
- [ ] PostgreSQL + pgvector and Redis run locally via `docker compose up`
- [ ] Alembic creates and upgrades database schema without errors
- [ ] Chat messages persist across browser reloads
- [ ] Owner-scoping prevents cross-user conversation access
- [ ] `.env` is ignored by Git, and `.env.example` has no real secrets
- [ ] Automated tests pass

---

### Sprint 2: LLM Gateway & Provider Adapters (20 Hours)
*Goal: Switch between Ollama, Gemini, and Mistral without changing business logic.*

| ID | Task Description | Estimate | Status |
| :--- | :--- | :--- | :--- |
| **S2-01** | Define abstract `LLMProvider` interface and standardized completion schemas | 2h | [ ] |
| **S2-02** | Implement local Ollama provider adapter with streaming support | 3h | [ ] |
| **S2-03** | Implement Google Gemini API (Free tier) provider adapter | 3h | [ ] |
| **S2-04** | Implement Mistral API (Free tier) provider adapter | 2h | [ ] |
| **S2-05** | Add disabled OpenAI adapter interface slot | 1h | [ ] |
| **S2-06** | Add central provider/model configuration with `DISABLE_CLOUD_MODELS` switch | 2h | [ ] |
| **S2-07** | Implement token usage, latency logging, and timeout/retry error handling | 3h | [ ] |
| **S2-08** | Build dynamic model selector dropdown in web chat header | 2h | [ ] |
| **S2-09** | Add unit and integration tests for provider switching and outage behavior | 2h | [ ] |

---

### Sprint 3: Agent Runtime & Controlled Tools (20 Hours)
*Goal: Assistant can select and invoke registered tools under strict safety constraints.*

| ID | Task Description | Estimate | Status |
| :--- | :--- | :--- | :--- |
| **S3-01** | Integrate CrewAI multi-agent orchestration loop behind internal runtime coordinator | 4h | [ ] |
| **S3-02** | Create typed tool registry with Pydantic argument validation | 3h | [ ] |
| **S3-03** | Implement initial safe tools: date/time, calculator, task draft, note search | 3h | [ ] |
| **S3-04** | Persist tool execution records, status codes, and timestamps in database | 3h | [ ] |
| **S3-05** | Add tool activity and step-by-step reasoning feed in web UI | 4h | [ ] |
| **S3-06** | Test tool argument validation, unknown tool rejection, and failure recovery | 3h | [ ] |

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

- *(No items discovered yet)*
