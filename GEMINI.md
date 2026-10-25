# Personal AI Assistant — Antigravity Agent Guidelines

Welcome to the **Personal AI Assistant** project. You are operating as an expert software architect and full-stack engineer pairing with the repository owner.

---

## 1. Project Awareness & Workflow
- **Always read `PLANNING.md`** at the beginning of each planning session to stay aligned with the architecture, goals, and technical constraints.
- **Always check `TASK.md`** before starting any work. If a task isn't listed, add it under `### Discovered During Work` with today's date.
- **Follow the Vibe Coding Workflow** (`.agent/skills/vibe-coding/SKILL.md`):
  1. *Planning Phase*: Outline plan with Mermaid diagrams in `PLANNING.md` before writing code.
  2. *Implementation Phase*: Code in modular chunks (<500 lines per file). Log mistakes in `.agent/rules/things-to-avoid.md`.
  3. *Test Phase*: Run tests and verify functionality.
  4. *Document Phase*: Check off tasks in `TASK.md`, update documentation, and suggest a commit message for the user.
- **NO Autonomous Git Commits**: The agent must NEVER run `git commit` or `git push` autonomously. The repository owner handles all commits manually. Provide suggested commit commands instead.

---

## 2. Core Constraints & Anti-Patterns
- **Production-Level Code Only**: We are building production software, not learning tutorials or proof-of-concept demos. Write clean, robust, deterministic code with proper typing, validation, error handling, and tests.
- **Strict Dependency Management**: Always maintain clean, pinned `requirements.txt` (and `requirements-dev.txt`) in `apps/api` for deterministic container and environment builds.
- **Zero Unnecessary Code**: Never write speculative abstractions, fake wrappers, or reinvent features that battle-tested frameworks (like CrewAI, FastAPI, SQLAlchemy) already provide.
- **500-Line Limit**: Never create a file longer than 500 lines of code. Split into sub-modules or helpers.
- **₹0 Infrastructure Target**: Built for local compute (Ollama local inference, Dockerized PostgreSQL + pgvector, Redis) with free-tier cloud fallback (Gemini API, Mistral API).
- **The "Do the Work" Principle**: Workflows follow strict states: `Requested` ➔ `Planned` ➔ `Authorized` ➔ `Executed` ➔ `Verified` ➔ `Reported`. Never claim an action succeeded unless verified by tool execution and database receipt.
- **No Premature Enterprise Complexity**: Keep models owner-scoped with stable IDs, but do not introduce multi-tenant orgs, billing, or complex role matrices before Personal MVP validation.
- **Never Commit Secrets**: Ensure `.env` is ignored. Only update `.env.example` with placeholder names.

---

## 3. Directory Layout
```text
├── apps/
│   ├── web/                    # Next.js 14+ (App Router, TypeScript, Tailwind)
│   └── api/                    # FastAPI (Python 3.11+, SQLAlchemy async, Alembic)
├── infra/                      # Docker Compose & local scripts
├── .agent/
│   ├── rules/                  # Modular guidelines (awareness, structure, technical, standard, things-to-avoid)
│   └── skills/vibe-coding/     # Vibe coding workflow execution skill
├── GEMINI.md                   # Primary Antigravity workspace instructions
├── PLANNING.md                 # System architecture, Mermaid diagrams, & design decisions
├── TASK.md                     # Active task tracker and sprint backlog
├── PRD.txt                     # Product Requirements Document
└── compose.yaml                # PostgreSQL (pgvector) + Redis local setup
```

Refer to detailed rules in `.agent/rules/` for in-depth technical and coding standards.
