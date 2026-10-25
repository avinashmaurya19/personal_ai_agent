# Personal AI Assistant --- Development Plan

> **Purpose:** Build a useful personal AI assistant for one owner first,
> using free services and local infrastructure. Validate real workflows
> in daily use, then evolve the same codebase into a secure multi-user
> product for businesses.
>
> **Current phase:** Planning complete enough to begin Sprint 1.\
> **Initial interface:** Web only.\
> **Daily development budget:** Approximately 2 hours.\
> **Initial budget:** ₹0 target; no paid subscriptions or paid hosting
> required for local development.\
> **Models:** Local Ollama first, with optional free-tier Gemini and
> Mistral API providers. OpenAI is an adapter to add/enable later when
> API budget exists.

------------------------------------------------------------------------

## 1. Product vision

Build an assistant that helps its owner complete real digital work, not
just answer questions.

The assistant should be able to:

-   Understand requests expressed in natural language.
-   Remember useful preferences, projects, people, decisions and task
    context.
-   Search and summarize personal documents and connected information.
-   Plan multi-step work and track progress.
-   Work with email, calendar, tasks, notes, documents and research.
-   Draft communications and prepare changes for approval.
-   Execute authorized actions through tools and integrations.
-   Verify whether actions succeeded and report partial failures
    honestly.
-   Be accessible through a web application first, with WhatsApp and
    other channels considered later.

### Product principle

**One assistant, one source of truth, many tools and channels.**

The web interface, future WhatsApp adapter, and future MCP clients must
all call the same backend assistant runtime. Business logic must not be
duplicated inside each channel.

### What "do the work" means

For every workflow, distinguish these states:

1.  Requested --- the user asked for an outcome.
2.  Planned --- the assistant created a plan.
3.  Authorized --- policy allows the action or the user approved it.
4.  Executed --- the integration/tool performed the action.
5.  Verified --- the system checked the result.
6.  Reported --- the assistant explains what succeeded, failed, or
    remains pending.

Never claim that an email was sent, a task was created, or a meeting was
booked unless the relevant tool confirms it.

------------------------------------------------------------------------

## 2. Product scope and delivery strategy

### Stage A --- Personal MVP

Build for one owner and one web application. Keep the architecture
modular, but do not build expensive enterprise administration before it
is needed.

MVP capabilities:

-   Web chat and conversation history.
-   Local or free-tier LLM providers.
-   Dynamic model/provider selection.
-   Tool calling through a controlled registry.
-   Personal memory.
-   Document upload and RAG.
-   Tasks and reminders.
-   Email and calendar read/search/draft workflows where free API access
    is available.
-   Approval before consequential external actions.
-   Execution history and audit trail.

### Stage B --- Daily-use personal assistant

Add:

-   Reliable multi-step workflow execution.
-   Research and report generation.
-   Email drafting and approved sending.
-   Calendar coordination.
-   Daily briefing.
-   More connectors and MCP client support.
-   Scheduled workflows and notifications.
-   Better evaluation, retries and recovery.

### Stage C --- Customer-ready product

Only after the personal product is useful and stable:

-   Organization and tenant model.
-   Team membership and RBAC.
-   SSO and enterprise identity.
-   Tenant-isolated memory and documents.
-   Admin console and policy configuration.
-   Billing and usage metering.
-   Customer-managed/self-hosted deployment options.
-   Security review, backups, support and operational runbooks.

**Do not prematurely build full enterprise complexity in the personal
MVP.** However, use stable IDs, ownership fields, migrations, service
boundaries and permission checks from the beginning so future
multi-tenancy is a controlled evolution rather than a rewrite.

------------------------------------------------------------------------

## 3. Free-first technology decisions

The goal is to avoid subscriptions and paid hosting during initial
development. Free API tiers have quotas and can change; check current
terms before relying on them.

  -----------------------------------------------------------------------
  Layer                   Initial choice          Cost approach
  ----------------------- ----------------------- -----------------------
  Web frontend            Next.js + TypeScript    Open source; run
                                                  locally

  Backend                 Python + FastAPI        Open source; run
                                                  locally

  Agent framework         CrewAI                  Open source; use behind
                                                  our own interface

  Local model runtime     Ollama                  Local inference; no API
                                                  subscription

  Cloud model option 1    Gemini API              Free tier where
                                                  available; quotas apply

  Cloud model option 2    Mistral API             Free mode where
                                                  available; quotas apply

  Future model option     OpenAI API              Implement adapter, but
                                                  do not depend on it for
                                                  ₹0 operation

  Database                PostgreSQL              Local Docker container

  Vector search           pgvector                PostgreSQL extension

  Cache/queue             Redis                   Local Docker container

  File storage            MinIO or local          Self-hosted
                          filesystem during MVP   

  Migrations              Alembic                 Open source

  ORM                     SQLAlchemy              Open source

  Background jobs         Start with a simple     Local
                          worker + Redis queue    

  Workflow durability     Evaluate Temporal later Do not add before
                                                  workflows require it

  Web search              Pluggable search        Avoid assuming a free
                          adapter; evaluate       hosted search quota
                          SearXNG/local options   

  Observability           Structured logs; add    Local
                          OpenTelemetry when      
                          needed                  

  Deployment              Docker Compose on       No paid hosting
                          development machine     required

  Source control          Git                     Local; remote hosting
                                                  optional
  -----------------------------------------------------------------------

### Model strategy

Implement a provider-neutral interface, but keep the initial provider
list practical:

1.  **Ollama local models:** default when the machine has enough
    RAM/compute. Local inference avoids API token charges, but
    performance depends on hardware and model size.
2.  **Gemini API:** optional free-tier provider for tasks where a hosted
    model performs better. Free-tier availability, model access and rate
    limits vary. Do not send sensitive personal or confidential data to
    a free-tier service unless its current data-use terms are
    acceptable.
3.  **Mistral API:** optional free-mode provider. Mistral documents free
    mode with no credit card required, but it has limited usage and rate
    limits.
4.  **OpenAI:** keep an adapter slot in the provider architecture, but
    treat it as disabled until an API budget is available. Do not assume
    ChatGPT subscriptions include API credits.

Do not hardcode model names throughout agent code. Store provider/model
configuration centrally and allow per-task routing later. Start with
manual configuration; add intelligent routing only after we have
evaluation data.

### Cost and privacy rules

-   Local services are the default.
-   API keys are stored only in environment variables or a local secrets
    file excluded from Git.
-   Never put API keys in frontend code.
-   Add a provider-level switch to disable cloud providers.
-   Add request/token usage logging and conservative limits.
-   Do not send email contents, personal documents, credentials or
    confidential information to free-tier APIs without reviewing their
    current data-use policies.
-   Free-tier availability is not a production SLA.
-   No paid cloud deployment is required for Sprint 1.

------------------------------------------------------------------------

## 4. Initial system architecture

``` mermaid
flowchart TD
    WEB[Next.js Web App] --> API[FastAPI Backend]
    API --> AUTH[Local Owner Authentication]
    API --> CHAT[Conversation Service]
    CHAT --> CORE[Assistant Runtime]
    CORE --> CTX[Context Builder]
    CTX --> MEM[Custom Memory Service]
    CTX --> KNOW[Knowledge Retrieval]
    CORE --> ROUTER[LLM Provider Interface]
    ROUTER --> OLLAMA[Ollama Local]
    ROUTER --> GEMINI[Gemini Free Tier]
    ROUTER --> MISTRAL[Mistral Free Mode]
    ROUTER --> OPENAI[OpenAI Adapter - Disabled Initially]
    CORE --> PLAN[Planner and Tool Registry]
    PLAN --> POLICY[Permission and Approval Checks]
    POLICY --> EXEC[Tool Executor]
    EXEC --> CONNECTORS[Native API / MCP Connectors]
    CHAT --> DB[(PostgreSQL + pgvector)]
    MEM --> DB
    KNOW --> DB
    EXEC --> REDIS[(Redis)]
    KNOW --> FILES[Local Files / MinIO]
```

### Architecture rules

-   PostgreSQL is the source of truth for users, conversations,
    messages, memories, tasks, approvals and execution records.
-   pgvector is for semantic retrieval, not a replacement for relational
    tables.
-   The LLM must never receive unrestricted SQL, shell or filesystem
    access.
-   Every tool has a schema, permission policy, timeout and audit
    record.
-   Read-only actions can generally run automatically.
-   Drafts and proposed changes can be created automatically.
-   Sending messages, deleting data, making purchases, changing external
    records or other consequential actions require explicit approval.
-   The backend enforces permissions; a prompt or model response cannot
    override them.
-   Tool results are treated as untrusted input. Do not follow
    instructions embedded in retrieved documents or external content.
-   Keep the first deployment as a modular monolith. Split services only
    when there is a measured reason.

------------------------------------------------------------------------

## 5. Repository structure

Use a monorepo. Keep the backend organized by business module rather
than putting all logic into route files.

``` text
personal-ai-assistant/
├── apps/
│   ├── web/                         # Next.js web application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── chat/
│   │   │   │   ├── conversations/
│   │   │   │   ├── tasks/
│   │   │   │   ├── memory/
│   │   │   │   └── settings/
│   │   │   └── lib/
│   │   └── package.json
│   └── api/                         # FastAPI application
│       ├── app/
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── api/
│       │   │   ├── routes/
│       │   │   └── dependencies.py
│       │   ├── core/
│       │   │   ├── security.py
│       │   │   ├── logging.py
│       │   │   └── exceptions.py
│       │   ├── db/
│       │   │   ├── session.py
│       │   │   ├── base.py
│       │   │   └── models/
│       │   ├── modules/
│       │   │   ├── conversations/
│       │   │   ├── assistant/
│       │   │   ├── llm/
│       │   │   ├── agents/
│       │   │   ├── tools/
│       │   │   ├── memory/
│       │   │   ├── knowledge/
│       │   │   ├── tasks/
│       │   │   ├── approvals/
│       │   │   ├── integrations/
│       │   │   └── executions/
│       │   └── schemas/
│       ├── migrations/
│       ├── tests/
│       └── pyproject.toml
├── packages/
│   └── shared-contracts/             # API schemas/types when useful
├── infra/
│   ├── docker/
│   └── scripts/
├── docs/
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   ├── SECURITY.md
│   ├── DATA_MODEL.md
│   ├── CONNECTORS.md
│   └── decisions/
├── .env.example
├── .gitignore
├── compose.yaml
├── Makefile
└── README.md
```

Do not create empty modules just to fill this tree. Add each module when
its sprint begins.

------------------------------------------------------------------------

## 6. Core domain model

Start with the smallest useful schema, but use ownership fields
consistently.

### Sprint 1 tables

-   `users`: local owner identity.
-   `conversations`: conversation metadata and owner ID.
-   `messages`: role, content, timestamps and conversation ID.
-   `provider_configs`: provider name, model name, enabled flag and
    non-secret configuration.
-   `agent_runs`: request status, timestamps and final outcome.

### Add in later sprints

-   `memories`, `memory_embeddings`
-   `documents`, `document_chunks`
-   `tasks`, `reminders`
-   `tool_registry`, `tool_executions`
-   `approvals`, `audit_logs`
-   `integrations`, `oauth_credentials`
-   `scheduled_jobs`, `job_executions`
-   `notifications`

Use UUID primary keys, UTC timestamps, foreign keys, indexes and Alembic
migrations. Add `owner_id` to user-owned records now. When moving to
multi-user organizations, introduce `organization_id` and membership
tables with explicit tenant isolation.

Never store OAuth access/refresh tokens as plaintext. Use authenticated
encryption with keys kept outside the database.

------------------------------------------------------------------------

## 7. API design

Use versioned REST endpoints first. Add streaming after basic
request/response behavior is tested.

Initial endpoints:

  Method   Endpoint                       Purpose
  -------- ------------------------------ --------------------------------
  GET      `/api/v1/health`               Health check
  POST     `/api/v1/chat`                 Send a message
  GET      `/api/v1/conversations`        List conversations
  GET      `/api/v1/conversations/{id}`   Retrieve conversation
  DELETE   `/api/v1/conversations/{id}`   Delete conversation
  GET      `/api/v1/providers`            Show enabled provider metadata
  GET      `/api/v1/tasks`                List tasks (later sprint)
  POST     `/api/v1/tasks`                Create task (later sprint)
  GET      `/api/v1/memories`             Review memories (later sprint)

The client must never receive provider secrets. Provider selection can
be requested by the client only if backend policy allows it.

Future events for streaming:

-   `message.started`
-   `agent.status`
-   `tool.started`
-   `tool.completed`
-   `approval.required`
-   `agent.completed`
-   `agent.failed`

------------------------------------------------------------------------

## 8. Detailed sprint roadmap

Assumption: 2 hours/day, 5 days/week = approximately 10 hours/week.
Estimates are planning targets, not guarantees.

### Phase 1 --- Personal foundation

#### Sprint 1 --- Repository and basic web chat (20 hours)

**Goal:** A local web application can send a message to FastAPI, receive
an answer from one configured provider and persist the conversation.

Tasks: 1. Create monorepo, Git configuration and documentation skeleton.
2. Scaffold Next.js web app. 3. Scaffold FastAPI backend. 4. Add
configuration and environment validation. 5. Add PostgreSQL and pgvector
through Docker Compose. 6. Add SQLAlchemy and Alembic. 7. Create users,
conversations and messages tables. 8. Add local owner identity for
development. 9. Add basic chat API and conversation retrieval. 10. Build
a simple web chat UI. 11. Add tests for health, chat persistence and
conversation ownership.

Acceptance criteria: - `docker compose up` starts the local dependencies
and API. - Web app loads locally. - User sends a message and receives a
response. - User and assistant messages are persisted. - Reloading the
page shows conversation history. - A conversation belonging to another
owner cannot be retrieved. - No API key is committed to Git.

#### Sprint 2 --- LLM gateway and provider adapters (20 hours)

**Goal:** Switch between Ollama, Gemini and Mistral without changing
chat or agent business logic.

Tasks: 1. Define a common model-provider interface. 2. Implement Ollama
adapter. 3. Implement Gemini adapter. 4. Implement Mistral adapter. 5.
Add OpenAI adapter interface but keep disabled without budget. 6. Add
provider/model configuration. 7. Normalize messages, responses, errors
and streaming where supported. 8. Add timeout, retry and rate-limit
handling. 9. Record provider, model, latency and token usage when
available. 10. Test provider switching and provider outage behavior.

Acceptance criteria: - Same chat endpoint works with each enabled
provider. - Switching provider requires configuration, not code
changes. - Missing or invalid keys produce safe errors. - Provider
failures do not lose the saved user message. - Cloud providers can be
disabled entirely.

#### Sprint 3 --- Agent runtime and controlled tools (20 hours)

**Goal:** The assistant can select and invoke registered tools.

Tasks: 1. Integrate CrewAI behind an internal agent interface. 2.
Define tool contract and registration. 3. Add safe initial tools:
date/time, calculator, task draft and note search. 4. Validate tool
arguments. 5. Persist tool calls and results. 6. Add execution IDs and
lifecycle states. 7. Add basic tool activity display in the web UI. 8.
Add tests for valid calls, invalid arguments and tool failures.

Acceptance criteria: - Assistant can call a tool and use its result. -
Tool execution is logged. - Unknown tools cannot execute. - No
unrestricted shell, arbitrary SQL or arbitrary filesystem tool is
exposed.

#### Sprint 4 --- Custom memory engine (20 hours)

**Goal:** Remember useful personal facts and retrieve them in future
conversations.

Tasks: 1. Define memory types and metadata. 2. Build candidate-memory
extraction. 3. Add review/validation and deduplication. 4. Add embedding
provider abstraction. 5. Store vectors using pgvector. 6. Implement
semantic and keyword retrieval. 7. Add recency and relevance ranking. 8.
Add memory list, edit and delete APIs/UI. 9. Add provenance, confidence
and expiration fields. 10. Test cross-conversation recall and deletion.

Acceptance criteria: - A useful fact can be stored and retrieved in a
separate conversation. - Irrelevant conversation details are not
automatically promoted to permanent memory. - User can inspect and
delete a memory. - Memory retrieval is restricted to its owner.

### Phase 2 --- Knowledge and daily productivity

#### Sprint 5 --- Document knowledge and RAG (20 hours)

Tasks: - Upload PDF, DOCX, TXT and Markdown. - Store files locally or in
MinIO. - Extract text and metadata. - Chunk documents. - Generate
embeddings. - Implement hybrid retrieval. - Return document/page/source
references. - Apply owner-level access checks. - Evaluate retrieval with
a small question set.

Acceptance criteria: answers based on uploaded documents cite the source
and do not invent unsupported facts.

#### Sprint 6 --- Tasks, notes and reminders (20 hours)

Tasks: - Task CRUD and status transitions. - Priority and due dates. -
Notes. - Convert conversational requests into task proposals. - Reminder
scheduling. - Task search and summaries. - Web UI for tasks and notes. -
Audit task changes.

Acceptance criteria: the assistant can create, update and summarize
personal tasks with clear confirmation.

#### Sprint 7 --- Email and calendar read/draft workflows (20 hours)

Tasks: - Evaluate Google and Microsoft personal API access
requirements. - OAuth consent and token storage. - Search and read
emails. - Summarize email threads. - Draft replies without sending. -
Read calendar events. - Find availability and propose times. - Extract
commitments into tasks. - Add approval policy before sending or
modifying external records.

Acceptance criteria: the assistant can summarize selected email/calendar
data and create drafts/proposals. External writes require explicit
approval.

#### Sprint 8 --- Research and reporting (20 hours)

Tasks: - Add pluggable web-search adapter. - Search and collect source
URLs. - Summarize sources with citations. - Compare products, topics or
options. - Generate Markdown reports. - Export selected outputs. - Add
source freshness and failure handling. - Evaluate factual grounding.

Acceptance criteria: a research request produces a structured report
with traceable sources and clearly marked uncertainty.

### Phase 3 --- Reliable automation and integrations

#### Sprint 9 --- Durable workflow execution (20 hours)

Tasks: - Represent plans as execution graphs. - Track dependencies and
checkpoints. - Run long jobs in a worker. - Retry transient failures
safely. - Add idempotency keys. - Add cancellation and timeout
handling. - Verify tool outcomes. - Support partial completion and
resume.

Acceptance criteria: interrupted workflows can resume without blindly
repeating completed external actions.

#### Sprint 10 --- Approvals, permissions and audit (20 hours)

Tasks: - Define risk levels for tools. - Add policy checks before
execution. - Add approval records with expiry. - Build approve/reject
UI. - Add one-time approval binding to exact action arguments. - Add
audit event history. - Add safe handling of rejected/expired
approvals. - Test prompt injection and untrusted tool output scenarios.

Acceptance criteria: consequential actions cannot bypass backend
authorization or approval requirements.

#### Sprint 11 --- MCP client and connector framework (20 hours)

Tasks: - Implement MCP client connection. - Discover tools and
schemas. - Require explicit configuration/approval for each server. -
Map MCP tools into internal tool contracts. - Scope credentials and
permissions. - Add connector health, timeout and logging. - Add native
connector interface. - Test malicious or malformed tool metadata.

Acceptance criteria: external MCP tools can be connected under explicit
permissions and their executions are audited.

#### Sprint 12 --- Scheduling and proactive assistant (20 hours)

Tasks: - Recurring job definitions. - Background scheduler. - Daily
briefing. - Follow-up reminders. - Task and calendar summaries. -
Notification inbox in web app. - User-controlled schedules and quiet
periods. - Duplicate prevention and job history.

Acceptance criteria: configured scheduled jobs run reliably and users
can inspect, pause and delete them.

### Phase 4 --- Channels and product hardening

#### Sprint 13 --- WhatsApp channel feasibility and integration (20 hours, subject to access)

Tasks: - Review current WhatsApp Business Platform eligibility, terms
and pricing. - Create channel adapter design. - Implement webhook
verification. - Map sender identity to the owner. - Handle inbound text
and supported attachments. - Route messages to the same assistant
runtime. - Apply channel-specific permissions and approval rules. -
Handle delivery status and platform errors.

Important: WhatsApp is not itself an MCP client. Use the official
business messaging/webhook interface for WhatsApp. MCP is a separate
protocol for connecting AI clients and tool servers. Do not assume
WhatsApp messaging is free; keep it out of the ₹0 critical path until
current eligibility and charges are confirmed.

Acceptance criteria: a verified inbound message reaches the same
assistant runtime and the response is sent only through an authorized
channel configuration.

#### Sprint 14 --- Security, privacy and reliability (20 hours)

Tasks: - Authentication hardening. - Owner/tenant access tests. - Secret
and token protection. - Rate limits. - Input validation. - File upload
restrictions. - Backup and restore test. - Data export and deletion. -
Structured logs and trace IDs. - Dependency and container scanning. -
Failure and recovery tests.

Acceptance criteria: security and recovery checks pass before exposing
the app publicly.

#### Sprint 15 --- Personal daily-use validation (20 hours)

Tasks: - Create 20--30 realistic personal workflows. - Run repeated
tests and record failures. - Measure successful completion and human
correction rate. - Measure tool selection and memory recall. - Measure
response latency and API usage. - Improve the weakest workflows. - Write
user-facing help and operating notes.

Acceptance criteria: the assistant reliably handles the specific
workflows the owner actually uses, with transparent failures and
approvals.

#### Sprint 16 --- Customer-readiness architecture (20 hours; only after personal validation)

Tasks: - Add organizations and memberships. - Add organization_id to
tenant-owned data. - Add RBAC and organization policies. - Add
tenant-isolated memory and document search. - Add admin configuration. -
Add usage metering. - Design SaaS and customer-managed deployment
profiles. - Review data retention and support requirements. - Pilot with
a small, authorized test group only after security review.

Acceptance criteria: organization data is isolated and organization
admins can control users, tools, integrations and model settings.

------------------------------------------------------------------------

## 9. Initial personal workflows to validate

Keep a scenario catalogue. Add tests for success, denial, partial
failure, timeout and retry.

  -----------------------------------------------------------------------
  ID                      Workflow                Expected outcome
  ----------------------- ----------------------- -----------------------
  P-01                    Ask a general question  Grounded answer

  P-02                    Save a preference       Memory candidate and
                                                  visible stored memory

  P-03                    Recall preference later Correct memory
                                                  retrieved

  P-04                    Upload a PDF and ask    Answer with source
                          questions               reference

  P-05                    Summarize a long        Structured summary
                          document                

  P-06                    Create a task in        Task created and
                          natural language        confirmed

  P-07                    Ask for today's         Tasks and calendar
                          priorities              context summarized

  P-08                    Search an email thread  Relevant messages
                                                  summarized

  P-09                    Draft an email reply    Draft produced, not
                                                  sent

  P-10                    Request sending an      Approval required
                          email                   before send

  P-11                    Research a topic        Report with source
                                                  links

  P-12                    Multi-step request      Plan, progress and
                                                  final report

  P-13                    Tool returns an error   Honest failure report

  P-14                    User rejects approval   Action does not execute

  P-15                    Delete a memory         Memory no longer
                                                  retrieved

  P-16                    Ask through future      Same assistant runtime
                          WhatsApp channel        used
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Free-service reality check

Free tiers and policies change. Re-check the provider's official page
before creating an account or depending on a quota.

  ------------------------------------------------------------------------------------------------------------------------------------------------
  Service           What is free      Limitations /     Official information
                                      caution           
  ----------------- ----------------- ----------------- ------------------------------------------------------------------------------------------
  Ollama            Run supported     Hardware, RAM,    https://ollama.com/download
                    models locally    disk and speed    
                                      limits            

  Gemini API        Free tier for     Model/rate        https://ai.google.dev/gemini-api/docs/pricing
                    eligible models   limits; free-tier 
                                      data-use terms    
                                      need review       

  Mistral API       Free mode, no     Limited included  https://docs.mistral.ai/getting-started/quickstarts/studio/activate-and-generate-api-key
                    card required     usage and rate    
                    according to docs limits            

  OpenAI API        No free API       API usage is      https://platform.openai.com/pricing/
                    allowance should  billed separately 
                    be assumed        from ChatGPT      
                                      plans             

  PostgreSQL        Open-source local Local disk and    https://www.postgresql.org/
                    database          backup            
                                      responsibility    

  pgvector          Open-source       Local resource    https://github.com/pgvector/pgvector
                    PostgreSQL        usage             
                    extension                           

  Redis             Open-source local Configure         https://redis.io/
                    deployment        persistence and   
                                      memory limits     

  Cloudflare        Free hosted       Not a substitute  https://developers.cloudflare.com/workers/platform/limits/
  Workers           worker quota      for a             
                                      long-running      
                                      FastAPI host      

  Supabase          Free hosted       Pausing, storage  https://supabase.com/pricing
                    project quota     and database      
                                      limits; not       
                                      needed if running 
                                      local PostgreSQL  
  ------------------------------------------------------------------------------------------------------------------------------------------------

### Recommended ₹0 setup

Run these locally:

-   Next.js
-   FastAPI
-   PostgreSQL + pgvector
-   Redis
-   Ollama (if hardware permits)
-   Local file storage

Optionally use Gemini or Mistral free API mode for model comparison and
tasks that are too demanding for local hardware.

Do not make paid hosting, a paid vector database, a paid workflow
platform, or a paid model API a prerequisite for the personal MVP.

------------------------------------------------------------------------

## 11. Security and safe execution baseline

Even for a personal project, build these protections before connecting
accounts:

-   Keep secrets out of source control and frontend bundles.
-   Use least-privilege OAuth scopes.
-   Separate read, draft and write operations.
-   Require explicit approval for sending email, deleting files,
    changing external records or other consequential actions.
-   Bind approval to the exact action and arguments; do not treat
    approval as blanket permission.
-   Log tool name, arguments (with sensitive values redacted), result
    status and timestamp.
-   Use idempotency for external writes.
-   Validate tool arguments against schemas.
-   Treat documents, emails, webpages and MCP tool outputs as untrusted
    data.
-   Never expose arbitrary shell or unrestricted SQL tools to the agent.
-   Provide a way to revoke integration credentials.
-   Keep a user-visible history of actions and approvals.
-   Back up the database and test restoring it.

------------------------------------------------------------------------

## 12. Development workflow

For each task:

1.  Read the acceptance criteria.
2.  Understand the relevant design and API contract.
3.  Implement the smallest complete vertical slice.
4.  Add tests before moving to the next feature.
5.  Run formatting, linting and tests.
6.  Update docs and environment examples.
7.  Commit the work with a clear message.
8.  Record blockers and decisions.

Suggested daily two-hour allocation:

-   20 minutes: review design and task.
-   80 minutes: implementation.
-   20 minutes: tests, documentation and commit.

A task is not complete merely because the code runs once. It is complete
when the acceptance criteria and relevant tests pass.

------------------------------------------------------------------------

## 13. Sprint 1 backlog --- start here

Sprint 1 is limited to the personal web MVP foundation.

  ID      Task                                                 Estimate
  ------- -------------------------------------------------- ----------
  S1-01   Create monorepo, Git and documentation                     2h
  S1-02   Scaffold Next.js web app                                   2h
  S1-03   Scaffold FastAPI backend and settings                      2h
  S1-04   Add Docker Compose for PostgreSQL and Redis                2h
  S1-05   Configure SQLAlchemy and Alembic                           2h
  S1-06   Create user, conversation and message models               2h
  S1-07   Implement health and conversation APIs                     2h
  S1-08   Build basic web chat UI                                    2h
  S1-09   Connect web chat to API and persist messages               2h
  S1-10   Add integration tests and local run instructions           2h

### Sprint 1 definition of done

-   [ ] Repository structure exists and is documented.
-   [ ] Web app runs locally.
-   [ ] API runs locally.
-   [ ] PostgreSQL is available through Docker Compose.
-   [ ] Alembic creates and upgrades the schema.
-   [ ] Chat messages persist.
-   [ ] Conversation history loads after refresh.
-   [ ] Ownership checks prevent cross-owner access.
-   [ ] `.env` is ignored by Git.
-   [ ] `.env.example` contains names only, never real secrets.
-   [ ] Tests pass.

**Important sequencing:** Sprint 1 proves the web/backend/database
foundation. Sprint 2 adds dynamic LLM providers. Sprint 3 adds CrewAI
and tool execution. Do not mix all three concerns into the first
sprint.

------------------------------------------------------------------------

## 14. Decisions intentionally postponed

Do not implement these until the product needs them:

-   Native Flutter mobile app.
-   WhatsApp integration before channel access and cost are understood.
-   Full enterprise multi-tenancy and billing.
-   Kubernetes and microservices.
-   Multiple specialist agents.
-   Fine-tuning or custom ML model training.
-   A separate vector database.
-   Paid workflow infrastructure.
-   Advanced voice features.
-   Unrestricted autonomous execution.

Keep the interfaces extensible, but avoid paying complexity costs before
validating the personal workflows.

------------------------------------------------------------------------

## 15. Official references

-   Google Gemini API pricing:
    https://ai.google.dev/gemini-api/docs/pricing
-   Google Gemini API rate limits:
    https://ai.google.dev/gemini-api/docs/rate-limits
-   Mistral free-mode setup:
    https://docs.mistral.ai/getting-started/quickstarts/studio/activate-and-generate-api-key
-   Mistral usage and limits:
    https://docs.mistral.ai/admin/billing-usage/usage-limits
-   Ollama downloads: https://ollama.com/download
-   Ollama pricing and local usage: https://ollama.com/pricing
-   Google Agent Development Kit: https://google.github.io/adk-docs/
-   PostgreSQL: https://www.postgresql.org/
-   pgvector: https://github.com/pgvector/pgvector
-   FastAPI: https://fastapi.tiangolo.com/
-   Next.js: https://nextjs.org/docs
-   Alembic: https://alembic.sqlalchemy.org/
-   Model Context Protocol: https://modelcontextprotocol.io/
-   OpenAI API pricing: https://platform.openai.com/pricing/

------------------------------------------------------------------------

## Final direction

Build the personal assistant first. Use local infrastructure and free
API tiers. Prove that it can reliably handle real daily workflows. Keep
the model, tool, memory and channel layers replaceable. Once it is
genuinely useful to its owner, add organization isolation,
administration, billing and customer deployment capabilities.

**The first milestone is not "an AI that can do everything." It is a
dependable web assistant that can chat, remember, retrieve, use a small
set of safe tools, and report exactly what it did.**
