# Personal AI Assistant

An autonomous, context-aware personal AI assistant built for one owner first, running on a strict **₹0 infrastructure target** using local models (Ollama) and free-tier cloud fallbacks (Gemini, Mistral), before scaling to multi-user enterprise capabilities.

Powered by a **modular monolith** backend (FastAPI, CrewAI, PostgreSQL + pgvector, Redis) and a modern reactive frontend (Next.js 14+, TypeScript, Tailwind CSS).

---

## 🎯 Core Principles

1. **One Assistant, One Truth, Many Channels**: A centralized assistant runtime serves the web application today, and future WhatsApp/MCP channels tomorrow without duplicated logic.
2. **"Do the Work" Principle**: Actions advance through verified states:
   $$\text{Requested} \longrightarrow \text{Planned} \longrightarrow \text{Authorized} \longrightarrow \text{Executed} \longrightarrow \text{Verified} \longrightarrow \text{Reported}$$
   The assistant never reports an external mutation succeeded unless verified by tool execution and database receipt.
3. **₹0 Infrastructure Target**: Built for local compute (Ollama, Dockerized PostgreSQL + pgvector, Redis) with free-tier cloud fallback.
4. **Human-in-the-Loop Approval**: Consequential actions (sending messages, deleting files, external mutations) require explicit human sign-off.

---

## 🏗️ Repository Layout

```text
personal-ai-assistant/
├── apps/
│   ├── web/                         # Next.js 14+ (App Router, TypeScript, Tailwind)
│   └── api/                         # FastAPI (Python 3.11+, SQLAlchemy async, Alembic, CrewAI)
├── packages/
│   └── shared-contracts/            # Shared JSON schemas and TypeScript definitions
├── infra/
│   ├── docker/                      # Application Dockerfiles
│   └── scripts/                     # Local setup and utility scripts
├── docs/                            # Deep-dive architecture and design documentation
├── .agent/                          # Antigravity agent configuration, rules, and skills
│   ├── rules/                       # Modular guidelines (awareness, structure, technical, standard, things-to-avoid)
│   └── skills/vibe-coding/          # Vibe coding workflow execution skill
├── GEMINI.md                        # Master Antigravity workspace instructions
├── PLANNING.md                      # Architecture, system state & design decisions
├── TASK.md                          # Active sprint task tracking & backlog
├── PRD.txt                          # Product Requirements Document
├── compose.yaml                     # Docker Compose (PostgreSQL, pgvector, Redis)
├── Makefile                         # Common development commands
└── .env.example                     # Reference environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for Next.js web application)
- Ollama (optional, for local LLM inference)

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Start Local Infrastructure
Start PostgreSQL (with `pgvector`) and Redis:
```bash
make up
```

Verify services:
```bash
make ps
```

---

## 🧠 Vibe Coding Workflow

This project adheres to the **4-Phase Vibe Coding Workflow** configured for **Google Antigravity**:
1. **Planning Phase**: Review [PRD.txt](./PRD.txt), explore architecture, and document designs with Mermaid diagrams in [PLANNING.md](./PLANNING.md) before writing code.
2. **Implementation Phase**: Write modular code (< 500 lines per file). Log mistakes in `.agent/rules/things-to-avoid.md`.
3. **Test Phase**: Execute tests (`pytest`) and verify persistence.
4. **Document Phase**: Mark completed tasks in [TASK.md](./TASK.md) and make atomic conventional commits.
