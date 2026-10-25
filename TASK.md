# Active Task Tracker & Sprint Backlog

> **Current Sprint:** Sprint 1 — Repository Monorepo, Web Chat & Backend Foundation  
> **Last Updated:** 2026-10-25  
> **Workflow Rule:** Mark tasks completed `[x]` immediately after finishing. Add new discovered tasks to the "Discovered During Work" section below.

---

## Sprint 1 Backlog: Personal Web MVP Foundation

| ID | Task | Estimate | Status | Assigned Date | Completion Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S1-00** | Initialize Vibe Coding rules (`.cursor/rules/`, `PRD.txt`, `PLANNING.md`, `TASK.md`) | 1h | [x] | 2026-10-25 | 2026-10-25 |
| **S1-01** | Create monorepo skeleton, `.gitignore`, `.env.example`, and baseline documentation | 2h | [ ] | 2026-10-25 | - |
| **S1-02** | Scaffold Next.js 14+ web application in `apps/web` (TypeScript, Tailwind CSS) | 2h | [ ] | 2026-10-25 | - |
| **S1-03** | Scaffold FastAPI backend application in `apps/api` with Pydantic settings & config | 2h | [ ] | 2026-10-25 | - |
| **S1-04** | Add Docker Compose (`compose.yaml`) for PostgreSQL 16 (pgvector) and Redis 7 | 2h | [ ] | 2026-10-25 | - |
| **S1-05** | Configure SQLAlchemy 2.0 (asyncio) and Alembic migration framework in `apps/api` | 2h | [ ] | 2026-10-25 | - |
| **S1-06** | Define core database models (`User`, `Conversation`, `Message`) & initial migration | 2h | [ ] | 2026-10-25 | - |
| **S1-07** | Implement FastAPI routes for health check and conversation CRUD operations | 2h | [ ] | 2026-10-25 | - |
| **S1-08** | Build Next.js web chat UI (conversations sidebar, message stream, message input) | 2h | [ ] | 2026-10-25 | - |
| **S1-09** | Connect web chat to FastAPI backend and verify end-to-end message persistence | 2h | [ ] | 2026-10-25 | - |
| **S1-10** | Add automated integration tests (`pytest`) and local execution runbook | 2h | [ ] | 2026-10-25 | - |

---

## 🔍 Discovered During Work

> *New sub-tasks, bugs, or refactorings identified during implementation must be logged here with the date discovered.*

- *(No items discovered yet)*

---

## 🏁 Definition of Done Checklist for Sprint 1
- [ ] Monorepo structure exists and is documented
- [ ] Web app (`apps/web`) runs locally on port 3000
- [ ] FastAPI (`apps/api`) runs locally on port 8000
- [ ] PostgreSQL + pgvector and Redis run locally via `docker compose up`
- [ ] Alembic creates and upgrades the schema without errors
- [ ] Chat messages persist across page reloads
- [ ] Owner-scoping prevents cross-user access
- [ ] `.env` is ignored by Git, and `.env.example` has no real secrets
- [ ] Automated tests pass
