# Comprehensive System Architecture & Planning

> **Project:** Personal AI Assistant  
> **Status:** Stage A (Personal MVP) — Sprint 7 (Active)  
> **Repository Model:** Monorepo (Next.js Web + FastAPI Backend + PostgreSQL/Redis Infra)  
> **Operating Budget:** ₹0 Target (Local Ollama default, Google Gemini & Mistral free-tier APIs)  
> **Weekly Cadence:** ~10 hours/week (2 hours/day, 5 days/week)

---

## 1. Executive Summary & Product Vision (Product Manager Lens)

The Personal AI Assistant bridges the gap between passive conversational chatbots and proactive autonomous agents. Most commercial AI tools either charge steep monthly subscriptions or act merely as conversational surfaces without verified execution. This project is built for one owner first, proving genuine everyday utility—reading personal context, summarizing incoming documents, planning multi-step actions, and drafting emails/calendar updates—before expanding to multi-user enterprise readiness.

### 1.1 Core Principles
1. **One Assistant, One Truth, Many Channels**: A single centralized backend assistant runtime serves the Next.js web application today, and future WhatsApp, mobile, or MCP client interfaces tomorrow without duplication.
2. **The "Do the Work" Contract**: The assistant never assumes an action was executed. Every workflow advances through verified states:
   $$\text{Requested} \longrightarrow \text{Planned} \longrightarrow \text{Authorized} \longrightarrow \text{Executed} \longrightarrow \text{Verified} \longrightarrow \text{Reported}$$
3. **Free-First (₹0 Infrastructure)**: Runs entirely on local compute (Ollama local inference, Dockerized PostgreSQL + pgvector and Redis) with optional zero-cost cloud tiers (Gemini free tier, Mistral free tier).
4. **Privacy & Permission Gates**: Consequential actions (sending messages, deleting files, external mutations) require explicit human sign-off via an interactive approvals drawer.

---

## 2. High-Level Architecture (Software Architect Lens)

The system is organized as a **modular monolith** with clean boundaries between presentation, coordination, intelligence, and storage.

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
        PLANNER["Agent Planner & Loop (CrewAI Multi-Agent Runtime)"]
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

## 4. Phase-by-Phase Master Development Plan

The system develops across **4 distinct phases** comprising **16 two-week sprints** (~20 hours per sprint, ~320 hours total).

```mermaid
flowchart LR
    P1["Phase 1: Personal Foundation<br/>(Sprints 1-4 | 80h)"] --> P2["Phase 2: Knowledge & Productivity<br/>(Sprints 5-8 | 80h)"]
    P2 --> P3["Phase 3: Automation & Integrations<br/>(Sprints 9-12 | 80h)"]
    P3 --> P4["Phase 4: Channels & Hardening<br/>(Sprints 13-16 | 80h)"]
```

---

### Phase 1: Personal Foundation (Sprints 1–4 | ~80 Hours)
**Objective:** Establish the local monorepo, web chat UI, database persistence, provider-agnostic model routing, basic tool execution, and personal memory.

- **Sprint 1 — Repository & Basic Web Chat (20h)**:
  - *Deliverables:* Monorepo skeleton (`apps/web`, `apps/api`, `infra/`), Docker Compose (`postgres`, `redis`), SQLAlchemy + Alembic, `User`/`Conversation`/`Message` models, FastAPI CRUD endpoints, Next.js chat UI with message persistence.
  - *Acceptance:* Messages persist to PostgreSQL; reloading browser retains history; owner-scoping verified.
- **Sprint 2 — LLM Gateway & Provider Adapters (20h)**:
  - *Deliverables:* Abstract `LLMProvider` interface; adapters for local Ollama, Google Gemini (Free tier), Mistral (Free mode); disabled OpenAI adapter; token usage/latency logging; dynamic model switcher in web UI.
  - *Acceptance:* Same chat endpoint works with Ollama, Gemini, and Mistral; zero cloud egress when `DISABLE_CLOUD_MODELS=true`.
- **Sprint 3 — Agent Runtime & Controlled Tools (20h)**:
  - *Deliverables:* CrewAI multi-agent orchestration integration behind internal runtime interface; tool registry with Pydantic input schemas; safe initial tools (date/time, calculator, task draft, note search); tool execution activity feed in web UI.
  - *Acceptance:* Agent invokes tools and uses results; unhandled or arbitrary shell/SQL/filesystem access is strictly blocked; tool runs recorded in DB.
  
  ```mermaid
  flowchart TD
      USER_MSG["User Prompt / Turn"] --> CONV_SVC["ConversationService"]
      CONV_SVC --> AGENT_COORD["AgentCoordinator (Runtime)"]
      
      subgraph ToolRegistryGroup ["Controlled Tool Registry"]
          REGISTRY["ToolRegistry"]
          T1["CurrentDateTimeTool (Safe / Read-Only)"]
          T2["SafeCalculatorTool (AST-Evaluated Math)"]
          T3["TaskDraftTool (Safe Draft)"]
          T4["NoteSearchTool (Read-Only Search)"]
          REGISTRY --> T1 & T2 & T3 & T4
      end

      AGENT_COORD --> CREW["CrewAI Agent & Execution Loop"]
      CREW <--> REGISTRY
      CREW --> DB_EXEC[("ToolExecution Audit (PostgreSQL)")]
      CREW --> FINAL_TURN["Assistant Response + Tool Receipts"]
      FINAL_TURN --> DB_MSG[("Message Turn (PostgreSQL)")]
      FINAL_TURN --> UI_FEED["Web UI Activity Feed"]
  ```
- **Sprint 4 — Custom Memory Engine (20h)**:
  - *Deliverables:* Memory extraction pipeline from conversation turns; deduplication & validation; pgvector embedding storage; hybrid semantic + keyword recall; memory viewer/editor/deletion UI.
  - *Acceptance:* Personal facts stored in one conversation are recalled in a separate session; owner-only memory access; user can inspect and delete memories.
  
  ```mermaid
  flowchart TD
      subgraph Ingestion ["Memory Extraction & Ingestion Pipeline"]
          MSG_TURN["New Message Turn"] --> EXTRACTOR["MemoryExtractor (Heuristic & Pattern Filter)"]
          EXTRACTOR --> DEDUP["Deduplication & Category Classifier"]
          DEDUP --> EMBEDDER["EmbeddingService (Mistral / Ollama / Fallback)"]
          EMBEDDER --> PG_VEC[("PostgreSQL 16 + pgvector (1024-dim Vectors)")]
      end

      subgraph Retrieval ["Hybrid Retrieval & Context Injection"]
          USER_PROMPT["User Query"] --> SEARCH["Hybrid Search (Cosine Sim + Keyword)"]
          PG_VEC --> SEARCH
          SEARCH --> SCORER["Scorer (Relevance + Recency Decay)"]
          SCORER --> PROMPT_INJECT["Injected Long-Term Memory Context"]
          PROMPT_INJECT --> AGENT_COORD["AgentCoordinator & CrewAI Execution"]
      end

      subgraph Management ["Owner Memory Management (UI)"]
          UI_VIEW["Web Memory Drawer / Modal"] --> API_MEM["FastAPI /api/v1/memories"]
          API_MEM --> PG_VEC
      end
  ```

*Phase 1 Exit Milestone:* A working local assistant capable of persistent conversation, dynamic model switching, tool execution, and long-term memory recall at ₹0 infrastructure cost.

---

### Phase 2: Knowledge & Daily Productivity (Sprints 5–8 | ~80 Hours)
**Objective:** Equip the assistant with personal document retrieval (RAG), task tracking, email/calendar workflows, and grounded web research.

- **Sprint 5 — Document Knowledge & RAG (20h)**:
  - *Deliverables:* File upload API (PDF, Markdown, TXT); chunking and embedding pipeline with pgvector; hybrid vector + text retrieval; citation and source document display in UI.
  - *Acceptance:* Answers ground strictly in uploaded documents with exact source citations; prompt injection defenses in place.

  ```mermaid
  flowchart TD
      subgraph IngestionPipeline ["Document Ingestion Pipeline"]
          FILE["User File (.pdf, .md, .txt)"] --> UPLOAD["FastAPI /api/v1/documents/upload"]
          UPLOAD --> PARSER["DocumentParser (pypdf / text)"]
          PARSER --> SANITIZER["Prompt Injection Sanitizer"]
          SANITIZER --> CHUNKER["Recursive Semantic Chunker (500 chars / 100 overlap)"]
          CHUNKER --> EMBED["EmbeddingService (1024-dim vectors)"]
          EMBED --> DB_DOC[("Document & DocumentChunk (PostgreSQL + pgvector)")]
      end

      subgraph RetrievalFlow ["RAG & Grounded Tool Execution"]
          QUERY["Agent / User Question"] --> DOC_TOOL["DocumentSearchTool"]
          DOC_TOOL --> VEC_SEARCH["pgvector Cosine Search (<=>)"]
          DB_DOC --> VEC_SEARCH
          VEC_SEARCH --> CITATION["Extract Chunks with Page/File Citation Metadata"]
          CITATION --> AGENT["CrewAI Agent Context & Grounded Synthesis"]
          AGENT --> VERIFIED_OUTPUT["Grounded Response with Source Citations"]
      end
  ```
- **Sprint 6 — Tasks, Notes & Reminders (20h)**:
  - *Deliverables:* Task and Note domain models; CRUD endpoints; conversational task extraction ("remind me to submit invoice by Friday"); priority and due dates; web task dashboard.
  - *Acceptance:* Assistant creates and updates tasks from natural dialogue with explicit confirmation and audit history.

  ```mermaid
  flowchart TD
      subgraph UserInput ["Natural Language & Web UI"]
          USER_CHAT["Chat Input: 'Remind me to finish Sprint 6 review by 5pm tomorrow'"]
          WEB_DRAWER["Tasks & Notes Drawer (Direct CRUD / Toggle)"]
      end

      subgraph BackendRouting ["FastAPI Routers & Coordinator"]
          CHAT_COORD["AgentCoordinator (CrewAI)"]
          TASK_ROUTER["Task & Note REST Routers (/api/v1/tasks, /api/v1/notes)"]
          USER_CHAT --> CHAT_COORD
          WEB_DRAWER --> TASK_ROUTER
      end

      subgraph ExecutionLayer ["Agent Tools & Domain Services"]
          TASK_TOOL["TaskManageTool (action: create, list, update)"]
          NOTE_TOOL["NoteManageTool (action: create, search, update)"]
          TASK_SVC["TaskService (Business Logic & Scoping)"]
          NOTE_SVC["NoteService (Business Logic & Tag Filtering)"]
          
          CHAT_COORD --> TASK_TOOL
          CHAT_COORD --> NOTE_TOOL
          TASK_TOOL --> TASK_SVC
          NOTE_TOOL --> NOTE_SVC
          TASK_ROUTER --> TASK_SVC
          TASK_ROUTER --> NOTE_SVC
      end

      subgraph StorageLayerDB ["PostgreSQL 16 Persistence"]
          TASKS_DB[("tasks table: id, user_id, title, description, status, priority, due_date")]
          NOTES_DB[("notes table: id, user_id, title, content, tags")]
          TASK_SVC --> TASKS_DB
          NOTE_SVC --> NOTES_DB
      end
  ```
- **Sprint 7 — Email & Calendar Read/Draft Workflows (20h)**:
  - *Deliverables:* OAuth connection for Google/Microsoft personal APIs; thread search and summarization; calendar event reading; draft creation for replies/invites without sending; approval policy gate for external mutations.
  - *Acceptance:* Assistant drafts emails and calendar invites; all external mutations strictly held in pending state awaiting interactive owner approval.

  ```mermaid
  sequenceDiagram
      autonumber
      actor Owner as Workspace Owner
      participant Web as Next.js Web App
      participant API as FastAPI Integrations Router
      participant Google as Google Identity & Gmail REST API
      participant DB as PostgreSQL (oauth_tokens & emails)
      participant Agent as CrewAI Agent & EmailTool

      Owner->>Web: Clicks "Connect Gmail"
      Web->>API: GET /api/v1/integrations/google/auth-url
      API-->>Web: {"auth_url": "https://accounts.google.com/..."}
      Web->>Google: Redirect to Google Consent Screen
      Google-->>Owner: Request consent (email, profile, gmail scopes)
      Owner->>Google: Approves consent
      Google->>API: Callback /api/v1/integrations/google/callback?code=XYZ
      API->>Google: Exchange authorization code for tokens
      Google-->>API: access_token, refresh_token, expires_in
      API->>Google: Fetch user profile (userinfo)
      API->>DB: Upsert OAuthToken record
      API-->>Web: Redirect to /?google_connected=true
      Web->>API: POST /api/v1/integrations/google/gmail/sync
      API->>Google: GET /gmail/v1/users/me/messages
      Google-->>API: Live messages and MIME payloads
      API->>DB: Upsert EmailMessage records
      Owner->>Agent: "Summarize my emails"
      Agent->>EmailTool: action='summarize_emails'
      EmailTool->>DB: Read live synced messages
      EmailTool-->>Agent: Synthesized thread summaries
      Agent-->>Owner: Executive briefing
  ```

  ```mermaid
  flowchart TD
      subgraph UserInput ["Natural Language & Web UI"]
          USER_CHAT["Chat: 'Summarize unread emails and draft a reply to Alex'"]
          INBOX_DRAWER["Inbox, Calendar & Approvals Drawer"]
      end

      subgraph BackendRouting ["FastAPI Routers & Coordinator"]
          CHAT_COORD["AgentCoordinator (CrewAI)"]
          INBOX_ROUTER["Email & Calendar REST Routers (/api/v1/emails, /api/v1/calendar)"]
          APPROVAL_ROUTER["Approvals REST Router (/api/v1/approvals)"]
          USER_CHAT --> CHAT_COORD
          INBOX_DRAWER --> INBOX_ROUTER
          INBOX_DRAWER --> APPROVAL_ROUTER
      end

      subgraph ExecutionLayer ["Agent Tools & Safety Gates"]
          EMAIL_TOOL["EmailTool (email_inbox: search, read_thread, draft_reply, send)"]
          CALENDAR_TOOL["CalendarTool (calendar_agenda: list_events, check_availability, draft_invite)"]
          APPROVAL_GATE["Approval Engine: Read/Draft = Auto; Send/Mutate = Pending Action"]
          
          CHAT_COORD --> EMAIL_TOOL
          CHAT_COORD --> CALENDAR_TOOL
          EMAIL_TOOL --> APPROVAL_GATE
          CALENDAR_TOOL --> APPROVAL_GATE
      end

      subgraph DomainServices ["Domain Services (FastAPI)"]
          EMAIL_SVC["EmailService (Local Mailbox + Google/MS Provider Adapter)"]
          CALENDAR_SVC["CalendarService (Agenda, Availability, Event CRUD)"]
          APPROVAL_SVC["ApprovalService (Pending Action Storage & Execution)"]

          APPROVAL_GATE -->|Read/Draft| EMAIL_SVC
          APPROVAL_GATE -->|Read/Draft| CALENDAR_SVC
          APPROVAL_GATE -->|Mutation| APPROVAL_SVC
          APPROVAL_ROUTER --> APPROVAL_SVC
          APPROVAL_SVC -->|When Approved| EMAIL_SVC
          APPROVAL_SVC -->|When Approved| CALENDAR_SVC
      end

      subgraph StorageLayerDB ["PostgreSQL 16 Persistence"]
          EMAILS_DB[("emails table: id, user_id, subject, sender, recipient, body, is_read, thread_id")]
          CALENDAR_DB[("calendar_events table: id, user_id, title, start_time, end_time, attendees")]
          APPROVALS_DB[("pending_actions table: id, user_id, action_type, payload, status")]
          EMAIL_SVC --> EMAILS_DB
          CALENDAR_SVC --> CALENDAR_DB
          APPROVAL_SVC --> APPROVALS_DB
      end
  ```
- **Sprint 8 — Research & Reporting (20h)**:
  - *Deliverables:* Pluggable web search adapter (DDGS / SearXNG); source scraping, citation extraction, comparison matrices, and Markdown report exporter.
  - *Acceptance:* Produces structured research reports with verifiable citations and highlighted uncertainty.
  ```mermaid
  flowchart TD
      subgraph ResearchArchitecture ["Sprint 8: Research & Reporting Architecture"]
          USER_QUERY["User Query / Autonomous Goal"]
          ROUTER["Assistant Coordinator (CrewAI)"]
          SEARCH_TOOL["WebSearchTool / DeepResearchTool"]
          DDGS["SearchService (DuckDuckGo DDGS - ₹0)"]
          SCRAPER["WebScraperService (HTML to Clean Text)"]
          SYNTHESIZER["Synthesis Agent (Multi-Source Cross-Check)"]
          REPORT_DB[("PostgreSQL: research_reports")]
          UI_VIEW["Next.js Research & Notes Workspace"]

          USER_QUERY --> ROUTER
          ROUTER --> SEARCH_TOOL
          SEARCH_TOOL --> DDGS
          SEARCH_TOOL --> SCRAPER
          SCRAPER --> SYNTHESIZER
          SYNTHESIZER --> REPORT_DB
          REPORT_DB --> UI_VIEW
      end
  ```

*Phase 2 Exit Milestone:* Assistant actively handles everyday personal productivity—documents, tasks, email/calendar drafts, and research.

---

### Phase 3: Reliable Automation & Integrations (Sprints 9–12 | ~80 Hours)
**Objective:** Enable durable multi-step workflows, human-in-the-loop authorization gates, Model Context Protocol (MCP) tool expansion, and proactive background scheduling.

- **Sprint 9 — Durable Workflow Execution (20h)**:
  - *Deliverables:* Plan representation as execution graphs; step checkpoints; Redis background worker; idempotency keys; retry and pause/resume logic.
  - *Acceptance:* Interrupted workflows resume from last verified checkpoint without repeating completed external actions.
- **Sprint 10 — Approvals, Permissions & Audit Trail (20h)**:
  - *Deliverables:* Policy engine classifying tools (Read/Draft = auto; Consequential = approval required); approval cards in UI; one-time approval tokens bound to exact args; immutable audit log.
  - *Acceptance:* Consequential actions (send email, delete record, execute mutation) cannot execute without interactive owner sign-off.
- **Sprint 11 — MCP Client & Connector Framework (20h)**:
  - *Deliverables:* Model Context Protocol (MCP) client; dynamic tool discovery and schema validation; connector credential scoping and health monitoring.
  - *Acceptance:* External MCP tool servers connect securely under explicit permission contracts.
- **Sprint 12 — Scheduling & Proactive Assistant (20h)**:
  - *Deliverables:* Cron-based recurring job runner; automated daily morning briefings (agenda, tasks, urgent emails); web notification drawer.
  - *Acceptance:* Scheduled jobs run autonomously in background; user can pause, adjust, or disable schedules.

*Phase 3 Exit Milestone:* Assistant autonomously runs multi-step background automations with bulletproof human authorization and MCP extensibility.

---

### Phase 4: Channels & Product Hardening (Sprints 13–16 | ~80 Hours)
**Objective:** Extend access to mobile/messaging channels, harden security and reliability, validate daily usage scenarios, and prepare tenant isolation for enterprise growth.

- **Sprint 13 — WhatsApp Channel Feasibility & Integration (20h)**:
  - *Deliverables:* Inbound webhook receiver; HMAC signature validation; sender phone mapping to owner; message routing to core runtime; outbound notification adapter.
  - *Acceptance:* Owner can message the assistant via WhatsApp; messages execute through the same runtime without duplicated logic.
- **Sprint 14 — Security, Privacy & Reliability (20h)**:
  - *Deliverables:* Token protection, strict rate limiting, input sanitization, automated database backup/restore scripts, Docker vulnerability scanning, failure injection tests.
  - *Acceptance:* Zero unauthenticated endpoints; data export and purge verified; all unit/integration suites pass cleanly.
- **Sprint 15 — Personal Daily-Use Validation (20h)**:
  - *Deliverables:* Execution of 25+ real-world owner workflows; latency and token consumption benchmarks; prompt and retrieval tuning; end-user documentation.
  - *Acceptance:* >95% success rate on owner daily workflows with transparent failure reporting.
- **Sprint 16 — Customer-Readiness Architecture (20h)**:
  - *Deliverables:* Schema migration adding `organization_id` and tenant scoping; RBAC role matrix; tenant-isolated vector search; admin policy console design.
  - *Acceptance:* Multi-tenant data isolation verified by automated cross-tenant security tests.

*Phase 4 Exit Milestone:* A battle-tested, secure personal digital assistant ready for seamless transition into a commercial multi-user product.

---

## 5. Sprint 1 Detailed Execution Blueprint

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

### Sprint 1 Definition of Done
- [ ] Monorepo structure (`apps/web`, `apps/api`, `infra/`, `packages/`, `docs/`) initialized.
- [ ] Next.js 14+ App Router runs locally on port 3000.
- [ ] FastAPI runs locally on port 8000 with interactive Swagger docs (`/docs`).
- [ ] PostgreSQL 16 + pgvector and Redis run via `compose.yaml`.
- [ ] Alembic migrations run cleanly to create `users`, `conversations`, and `messages` tables.
- [ ] User can create conversations and send messages via the web UI.
- [ ] Message history loads and persists across page reloads.
- [ ] Automated tests in `apps/api/tests` pass.
- [ ] `.env` is safely ignored in `.gitignore`, and `.env.example` is documented.
