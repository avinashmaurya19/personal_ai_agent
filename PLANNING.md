# Comprehensive System Architecture & Planning

> **Project:** Personal AI Assistant  
> **Status:** Stage A (Personal MVP) — Sprint 1  
> **Repository Model:** Monorepo (Next.js Web + FastAPI Backend + PostgreSQL/Redis Infra)  
> **Operating Budget:** ₹0 (Local Ollama default, Google Gemini & Mistral free-tier APIs)  

---

## 1. Executive Summary & Product Vision (Product Manager Lens)

The Personal AI Assistant is built to bridge the gap between passive conversational chatbots and proactive autonomous agents. Most commercial AI tools either charge steep monthly subscriptions or act merely as conversational surfaces without verified execution. This project is built for one owner first, proving genuine everyday utility—reading personal context, summarizing incoming documents, planning multi-step actions, and drafting emails/calendar updates—before expanding to multi-user enterprise readiness.

### 1.1 Core Principles
1. **One Assistant, One Truth, Many Channels**: A single centralized backend assistant runtime serves the Next.js web application today, and future WhatsApp, mobile, or MCP client interfaces tomorrow without duplication.
2. **The "Do the Work" Contract**: The assistant never assumes an action was executed. Every workflow advances through verified states:
   $$\text{Requested} \longrightarrow \text{Planned} \longrightarrow \text{Authorized} \longrightarrow \text{Executed} \longrightarrow \text{Verified} \longrightarrow \text{Reported}$$
3. **Free-First (₹0 Infrastructure)**: Runs entirely on local compute (Ollama local inference, Dockerized PostgreSQL + pgvector and Redis) with optional zero-cost cloud tiers (Gemini free tier, Mistral free tier).
4. **Privacy & Permission Gates**: Consequential actions (sending messages, deleting files, external mutations) require explicit human sign-off via an interactive approvals drawer.

---

## 2. High-Level Architecture (Software Architect Lens)

The system is organized as a **modular monolith** with clean boundaries between presentation, coordination, intelligence, and storage.

### 2.1 Component Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Presentation)"]
        WEB["Next.js Web App (TypeScript / Tailwind)"]
        FUTURE_CHANNELS["Future Channels (WhatsApp / MCP Clients)"]
    end

    subgraph APILayer ["API & Gateway (FastAPI)"]
        ROUTES["API Routers (/conversations, /messages, /tasks, /approvals)"]
        AUTH["Auth & Owner Boundary Check"]
        DEP["Dependency Injection Engine"]
    end

    subgraph CoreRuntime ["Assistant Runtime & Agent Engine"]
        RUNTIME["Assistant Runtime Coordinator"]
        CTX["Context Builder & Memory Ingestion"]
        PLANNER["Agent Planner & Loop (Google ADK / ReAct)"]
        REGISTRY["Controlled Tool Registry"]
        POLICY["Policy & Permission Filter (Safe vs Consequential)"]
    end

    subgraph ModelGateway ["Dynamic LLM Provider Gateway"]
        GATEWAY["Provider Interface"]
        OLLAMA["Local Ollama (Llama 3 / Mistral / Qwen)"]
        GEMINI["Google Gemini API (Free Tier)"]
        MISTRAL["Mistral API (Free Mode)"]
        OPENAI["OpenAI Adapter (Disabled for ₹0)"]
    end

    subgraph StorageLayer ["Persistence & External Services"]
        PG[("PostgreSQL 16 (Relational Source of Truth)")]
        PGV[("pgvector (Semantic Memory & RAG)")]
        REDIS[("Redis 7 (Job Queue & Fast Cache)")]
        FS["Local Filesystem / MinIO"]
        TOOLS["External APIs (Email, Calendar, Web Search)"]
    end

    WEB --> ROUTES
    FUTURE_CHANNELS -.-> ROUTES
    ROUTES --> AUTH --> DEP --> RUNTIME
    RUNTIME --> CTX
    CTX --> PG
    CTX --> PGV
    RUNTIME --> PLANNER
    PLANNER --> GATEWAY
    GATEWAY --> OLLAMA
    GATEWAY --> GEMINI
    GATEWAY --> MISTRAL
    GATEWAY -.-> OPENAI
    PLANNER --> REGISTRY
    REGISTRY --> POLICY
    POLICY -->|Consequential - Needs Approval| WEB
    POLICY -->|Approved or Safe| TOOLS
    RUNTIME --> PG
    RUNTIME --> REDIS
```

---

## 3. The "Do the Work" State Machine

Every action initiated by the user or proposed by the agent follows an immutable lifecycle state machine to guarantee that external actions are never hallucinated.

```mermaid
stateDiagram-v2
    [*] --> Requested: User initiates intent or prompt
    Requested --> Planned: Agent evaluates intent & drafts action plan
    Planned --> EvaluatingPolicy: Check Tool Registry & Safety Rules
    
    state EvaluatingPolicy <<choice>>
    EvaluatingPolicy --> Authorized: Action is Read-Only or Draft (Auto-Approved)
    EvaluatingPolicy --> PendingApproval: Action is Consequential (Send, Delete, Buy)

    PendingApproval --> Authorized: Owner reviews & approves via UI
    PendingApproval --> Rejected: Owner denies action
    Rejected --> Reported: Notify user of rejection

    Authorized --> Executed: Tool executes API call / mutation
    Executed --> Verified: Tool runner inspects return code & response
    Verified --> Reported: Assistant renders confirmed results & DB audit record
    Reported --> [*]
```

---

## 4. End-to-End Chat & Tool Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Owner (Web UI)
    participant Web as Next.js Web App
    participant API as FastAPI Backend
    participant Runtime as Assistant Runtime
    participant LLM as LLM Gateway (Ollama/Gemini)
    participant Tools as Tool Registry & Policy
    participant DB as PostgreSQL + pgvector

    Owner->>Web: Enter message ("Summarize today's agenda & draft email")
    Web->>API: POST /api/v1/conversations/{id}/messages
    API->>DB: Persist user message
    API->>Runtime: Process incoming turn
    Runtime->>DB: Retrieve conversation history + relevant personal memories
    Runtime->>LLM: Stream prompt + available tool schemas
    LLM-->>Runtime: Propose Tool Call: calendar_get_events()
    Runtime->>Tools: Execute calendar_get_events() [Safe/Read-only]
    Tools-->>Runtime: Return calendar events JSON
    Runtime->>LLM: Supply tool result to LLM
    LLM-->>Runtime: Propose Tool Call: email_draft_send(to, body) [Consequential]
    Runtime->>Tools: Evaluate Policy -> Consequential!
    Runtime->>DB: Store pending approval record
    Runtime-->>API: Stream status + Action Approval Request
    API-->>Web: Render approval prompt to Owner
    Owner->>Web: Clicks "Approve & Send"
    Web->>API: POST /api/v1/approvals/{id}/approve
    API->>Tools: Execute email sending tool
    Tools-->>API: Success receipt (Message ID: 12345)
    API->>DB: Record verified audit log
    API-->>Web: Display verified delivery confirmation
```

---

## 5. Relational Domain Model (Entity-Relationship Blueprint)

```mermaid
erDiagram
    USERS ||--o{ CONVERSATIONS : owns
    USERS ||--o{ TASKS : owns
    USERS ||--o{ MEMORIES : owns
    USERS ||--o{ DOCUMENTS : owns
    USERS ||--o{ APPROVALS : owns
    CONVERSATIONS ||--o{ MESSAGES : contains
    CONVERSATIONS ||--o{ EXECUTIONS : generates
    MESSAGES ||--o{ EXECUTIONS : triggers
    APPROVALS ||--o| EXECUTIONS : authorizes

    USERS {
        uuid id PK
        string email UK
        string full_name
        jsonb preferences
        datetime created_at
    }

    CONVERSATIONS {
        uuid id PK
        uuid owner_id FK
        string title
        string active_model_provider
        string active_model_name
        datetime created_at
        datetime updated_at
    }

    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        jsonb tool_calls
        jsonb tool_results
        int token_count
        datetime created_at
    }

    MEMORIES {
        uuid id PK
        uuid owner_id FK
        string category
        text content
        vector embedding_vector
        datetime created_at
    }

    TASKS {
        uuid id PK
        uuid owner_id FK
        string title
        text description
        string status
        string priority
        datetime due_date
        datetime created_at
    }

    APPROVALS {
        uuid id PK
        uuid owner_id FK
        uuid conversation_id FK
        string action_name
        jsonb proposed_payload
        string status
        text denial_reason
        datetime created_at
        datetime resolved_at
    }

    EXECUTIONS {
        uuid id PK
        uuid conversation_id FK
        string tool_name
        jsonb input_args
        jsonb output_data
        string status
        bool verified
        datetime executed_at
    }
```

---

## 6. Implementation Strategy & Technical Roadmap (Software Developer Lens)

### 6.1 Phased Delivery Overview
- **Sprint 1 (Current)**: Foundation — Monorepo setup, Next.js web chat interface, FastAPI backend, Docker Compose (Postgres + Redis), Alembic migrations, conversation/message persistence.
- **Sprint 2**: LLM Gateway — Unified interface for Ollama, Gemini API (Free tier), Mistral API (Free tier), model switching in UI.
- **Sprint 3**: Agent Runtime & Tool Registry — Google ADK / ReAct loop, tool registry with Pydantic schemas, permission classification.
- **Sprint 4**: Personal Memory Engine — Structured key-value preferences + pgvector similarity matching, context window optimizer.
- **Sprint 5**: Document Knowledge & RAG — Document upload, parsing, vector embedding storage, grounded search.
- **Sprint 6**: Task & Reminders — Task management API, scheduled worker with Redis.
- **Sprint 7**: Email & Calendar Integration — Local/free connectors for read, draft, and approval-gated actions.
- **Sprint 8–16**: Advanced durable workflows, WhatsApp channel, security audits, and multi-tenant preparation.

---

## 7. Sprint 1 Execution Blueprint

```mermaid
flowchart LR
    S1["S1-01 Monorepo & Docs"] --> S2["S1-02 Next.js App"]
    S1 --> S3["S1-03 FastAPI Backend"]
    S3 --> S4["S1-04 Docker Compose (Postgres/Redis)"]
    S4 --> S5["S1-05 SQLAlchemy & Alembic"]
    S5 --> S6["S1-06 Models (User, Conv, Msg)"]
    S6 --> S7["S1-07 API Routes (/health, /conversations)"]
    S2 --> S8["S1-08 Web Chat UI"]
    S7 & S8 --> S9["S1-09 End-to-End Chat Persistence"]
    S9 --> S10["S1-10 Integration Tests & Runbook"]
```

### Sprint 1 Definition of Done Checklist
- [ ] Monorepo structure (`apps/web`, `apps/api`, `infra/`, `packages/`, `docs/`) initialized.
- [ ] Next.js 14+ App Router runs locally on port 3000.
- [ ] FastAPI runs locally on port 8000 with interactive docs (`/docs`).
- [ ] PostgreSQL 16 + pgvector and Redis run via `compose.yaml`.
- [ ] Alembic migrations run cleanly to create `users`, `conversations`, and `messages` tables.
- [ ] User can create a conversation and send a message via the UI.
- [ ] Message history loads and persists across page reloads.
- [ ] Automated tests in `apps/api/tests` pass.
- [ ] `.env` is safely ignored in `.gitignore`, and `.env.example` is documented.
