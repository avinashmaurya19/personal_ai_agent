# Technical Guidelines & Architecture Rules

## 1. Technical Stack (Free-First / ₹0 Target)

| Component | Technology | Rationale & Cost Target |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind CSS | Local execution, modern reactive UI |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2 | High-performance async API, clean typing |
| **Agent Framework** | CrewAI Multi-Agent Runtime | Standardized tool calling and agent orchestration |
| **Database** | PostgreSQL 16+ with `pgvector` extension | Local Docker container; relational source of truth + vector embeddings |
| **Cache & Queue** | Redis 7+ | Local Docker container; job queue, fast session cache |
| **ORM & Migrations** | SQLAlchemy 2.0 (asyncio) + Alembic | Type-safe queries and declarative schema migrations |
| **Local LLM** | Ollama (Llama 3, Mistral, Qwen) | Free local inference; private, no API costs |
| **Cloud LLMs** | Google Gemini API (Free tier), Mistral API (Free tier) | Optional cloud fallback; rate-limited, zero subscription |
| **Paid Adapters** | OpenAI API Adapter | Prepared in code, but kept disabled initially |

## 2. Model Strategy & Provider Gateway
- **Provider-Neutral Interface**: Code must interact with an abstract `LLMProvider` interface, never direct vendor SDKs scattered in business logic.
- **Centrally Configured**: Model names, temperature, provider routing, and token caps reside in `config.py`.
- **Cloud Provider Kill-Switch**: Support `DISABLE_CLOUD_MODELS=true` to guarantee complete privacy and zero outgoing data.
- **Privacy Rule**: Never send personal documents, credentials, or sensitive data to free-tier cloud APIs without explicit user consent.

## 3. Data & Storage Principles
- **Relational Source of Truth**: PostgreSQL stores users, conversations, messages, memories, tasks, and audit logs.
- **pgvector Role**: Used strictly for semantic retrieval / similarity search, not as an unstructured replacement for relational foreign keys.
- **Ownership Scoping**: All database queries for user resources must explicitly filter by `owner_id`. No cross-user data leakage.

## 4. Agent Execution & Tool Security
- **The "Do the Work" Principle**: Workflows follow strict states: `Requested` ➔ `Planned` ➔ `Authorized` ➔ `Executed` ➔ `Verified` ➔ `Reported`.
- **Honest Action Reporting**: Never inform the user that an email was sent, task created, or record updated unless the underlying tool/database verified success.
- **Permission & Approval Gates**:
  - *Read-only actions* (search, fetch history, read doc): Execute automatically.
  - *Draft actions* (compose email draft, prepare plan): Execute automatically.
  - *Consequential actions* (send email, delete file, modify external record): Require explicit human approval via `@approvals`.
- **Restricted Tool Privileges**: The agent runtime must never have unrestricted shell, arbitrary SQL, or raw root filesystem access. Tools accept typed Pydantic arguments and validate boundaries.
- **Untrusted External Content**: Content retrieved from the web or uploaded files must be treated as untrusted data. Never execute instructions contained within retrieved text (prompt injection mitigation).

## 5. Coding & Typing Rules
- **Backend**: Strict type annotations on all function signatures (`typing`, `pydantic`). Use async/await for I/O and DB calls.
- **Frontend**: TypeScript in strict mode. No `any` types unless thoroughly justified.
- **Error Handling**: Use custom domain exceptions (`AppException`, `NotFoundError`, `PermissionDeniedError`) mapped to clean HTTP status codes via FastAPI exception handlers.
