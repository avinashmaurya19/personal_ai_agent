# Project Structure & Repository Layout

This project follows a monorepo architecture designed for a modular monolith. Avoid premature microservices, but maintain strict modularity within the codebase.

```text
personal-ai-assistant/
├── apps/
│   ├── web/                         # Next.js web application (TypeScript, Tailwind CSS)
│   │   ├── src/
│   │   │   ├── app/                 # Next.js App Router (pages, layouts)
│   │   │   ├── components/          # Reusable UI components (primitives, layout)
│   │   │   ├── features/            # Feature-sliced modules
│   │   │   │   ├── chat/            # Chat interface & real-time messaging
│   │   │   │   ├── conversations/   # Conversation sidebar & history
│   │   │   │   ├── tasks/           # Task tracking & approvals
│   │   │   │   ├── memory/          # Memory & context inspector
│   │   │   │   └── settings/        # Model provider & app settings
│   │   │   └── lib/                 # Utility functions, HTTP clients, helpers
│   │   └── package.json
│   └── api/                         # FastAPI backend application (Python 3.11+)
│       ├── app/
│       │   ├── main.py              # Application entry point & lifespan
│       │   ├── config.py            # Pydantic BaseSettings & env configs
│       │   ├── api/
│       │   │   ├── routes/          # Top-level API router aggregation
│       │   │   └── dependencies.py  # Common FastAPI dependencies (auth, db session)
│       │   ├── core/
│       │   │   ├── security.py      # Auth, token handling, owner verification
│       │   │   ├── logging.py       # Structured logging setup
│       │   │   └── exceptions.py    # Custom domain exceptions & handlers
│       │   ├── db/
│       │   │   ├── session.py       # Async SQLAlchemy engine & sessionmaker
│       │   │   ├── base.py          # Declarative Base & common model mixins
│       │   │   └── models/          # Core relational models (User, Conversation, Message)
│       │   ├── modules/             # Domain business modules (added as sprints progress)
│       │   │   ├── conversations/   # Conversation management & message history
│       │   │   ├── assistant/       # Assistant core coordinator & runtime
│       │   │   ├── llm/             # LLM provider gateway (Ollama, Gemini, Mistral)
│       │   │   ├── agents/          # Agent planning, loops, and CrewAI integration
│       │   │   ├── tools/           # Controlled tool registry & execution
│       │   │   ├── memory/          # Long-term memory & context builder
│       │   │   ├── knowledge/       # Document ingestion, RAG & pgvector search
│       │   │   ├── tasks/           # User tasks, reminders & scheduling
│       │   │   ├── approvals/       # Human-in-the-loop permission & approval engine
│       │   │   ├── integrations/    # External connectors (Email, Calendar, MCP)
│       │   │   └── executions/      # Tool run audit trails & verification
│       │   └── schemas/             # Cross-cutting Pydantic request/response schemas
│       ├── migrations/              # Alembic database migrations
│       ├── tests/                   # Pytest suite (unit & integration tests)
│       └── pyproject.toml
├── packages/
│   └── shared-contracts/            # Shared JSON schemas / TypeScript definitions
├── infra/
│   ├── docker/                      # Dockerfiles for apps
│   └── scripts/                     # Local setup & seed scripts
├── docs/                            # Deep-dive architecture and design documentation
├── .agent/                          # Antigravity agent configuration, rules, and skills
│   ├── rules/                       # Modular rules (awareness, structure, technical, standards, things-to-avoid)
│   └── skills/                      # Custom workflow skills (e.g. vibe-coding)
├── GEMINI.md                        # Master Antigravity project instructions (always-on)
├── PLANNING.md                      # Architecture, system state & design decisions
├── TASK.md                          # Active sprint task tracking & backlog
├── PRD.txt                          # Product Requirements Document
├── compose.yaml                     # Docker Compose (PostgreSQL, pgvector, Redis)
└── .env.example                     # Reference environment variables (names only)
```

## Structure Guidelines
1. **Incremental Creation**: Do not create empty dummy folders just to fill the tree. Create folders and modules as their sprint backlog is reached.
2. **Feature Isolation**: In `apps/web/src/features/`, encapsulate UI, hooks, and local state by business domain.
3. **Module Boundaries in Backend**: Logic belongs in `apps/api/app/modules/<module_name>`, not bloated into API route files.
4. **Single Source of Truth**: Backend handles all domain logic, authorization, and agent execution. The frontend is a client.
5. **No Files > 500 Lines**: Refactor into sub-modules or helpers when files grow large.
