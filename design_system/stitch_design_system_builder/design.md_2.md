# Personal AI Assistant --- UI Design Reference

**Document purpose:** Primary visual and UX reference for Google Stitch\
**Product stage:** Personal MVP first; customer-ready product later\
**Initial platform:** Web application only\
**Frontend target:** Next.js + TypeScript\
**Backend:** Python + FastAPI\
**Design direction:** Dashboard-first, dark, futuristic, premium and
practical

------------------------------------------------------------------------

## 1. Product context

Build a web-based Personal AI Assistant that helps one owner complete
real digital work. It is not simply a chatbot or a generic analytics
dashboard.

The assistant is intended to support:

-   Natural-language conversations and conversation history.
-   Multiple LLM providers through a provider-neutral backend.
-   Controlled agent/tool execution.
-   Personal memory that the owner can inspect and manage.
-   Document upload, retrieval and RAG.
-   Tasks, notes and reminders.
-   Email and calendar workflows.
-   Research and report generation.
-   Workflow execution, approvals and audit history.
-   Integrations and MCP connections in later phases.

The product must communicate trust, clarity and control. The interface
should make it easy to understand what the assistant knows, what it is
doing, what it has completed, and what still needs approval.

### Product principles

1.  One assistant, one source of truth, multiple tools and future
    channels.
2.  The web application is the first interface; do not design a native
    mobile app now.
3.  Build a coherent product system, not a collection of unrelated
    pages.
4.  The dashboard is the landing page; AI Chat is the primary work
    surface.
5.  Show execution status honestly. Never visually imply that an action
    succeeded before it is confirmed.
6.  Consequential actions must have clear approval states.
7.  Use realistic sample content only where needed for design previews.
    Mark sample data clearly and do not imply that unbuilt features are
    already functional.
8.  Keep the MVP visually complete but implement features progressively
    according to the development roadmap.

------------------------------------------------------------------------

## 2. Target users and experience

### Initial user

A single owner using the application for personal productivity and
digital work.

### Experience goals

-   Quickly understand today's priorities from the Overview.
-   Start or resume a conversation in one click.
-   See when the assistant is thinking, planning, calling a tool,
    waiting for approval, verifying or reporting.
-   Find saved memories and documents.
-   Understand pending tasks, meetings and approvals.
-   Configure model providers without exposing secrets.
-   Review previous activity and outcomes.

### Tone

Professional, calm, capable, transparent and approachable. Avoid playful
mascots, excessive decoration, or an overly corporate enterprise-admin
appearance.

------------------------------------------------------------------------

## 3. Visual design direction

### Overall style

Create a premium dark SaaS application with a restrained futuristic
character.

Use: - Deep navy / near-black page backgrounds. - Slightly lighter
sidebar and card surfaces. - Indigo / electric purple as the primary
accent. - Clear typography and strong information hierarchy. - Subtle
borders rather than heavy shadows. - Small, purposeful status
indicators. - Consistent spacing and component proportions. - Restrained
motion and hover feedback.

Avoid: - Excessive gradients, neon glows or glassmorphism. - Too many
cards on every page. - Decorative charts that do not communicate useful
information. - Tiny low-contrast text. - Inconsistent page layouts. -
Large empty areas caused by poorly balanced grids. - Fake live data or
misleading connection statuses.

### Color tokens

Treat these as initial design tokens. They may be refined as a system,
but keep the palette consistent across screens.

  Token                Value       Use
  -------------------- ----------- --------------------------------------
  App background       `#070B18`   Main page background
  Sidebar background   `#0B1020`   Navigation surface
  Card surface         `#11182A`   Cards and panels
  Elevated surface     `#171F34`   Inputs, popovers and elevated panels
  Primary accent       `#7165F5`   Main actions and selected navigation
  Secondary accent     `#958BFF`   Supporting accent
  Success              `#10B981`   Completed / connected / verified
  Warning              `#F59E0B`   Attention / pending
  Danger               `#F43F5E`   Failed / destructive / urgent
  Primary text         `#F1F5F9`   Headings and main content
  Secondary text       `#94A3B8`   Supporting content
  Border               `#202A40`   Dividers and card outlines

Do not use color alone to communicate status. Pair color with labels
and/or icons.

### Typography

-   Primary font: Inter or a visually equivalent sans-serif.
-   Use a clear hierarchy for page title, section title, card title,
    body, metadata and labels.
-   Keep body text comfortable to read.
-   Use tabular numerals for metrics where appropriate.

### Shape and spacing

-   Cards: approximately 10--14px corner radius.
-   Buttons and inputs: consistent heights and radii.
-   Use a predictable spacing scale.
-   Align cards and section headings to a consistent grid.
-   Prefer compact, readable cards over oversized dashboard tiles.

### Icons

Use a consistent outline icon family such as Lucide. Icons should be
recognizable and consistent in size and stroke. Do not mix unrelated
icon styles.

------------------------------------------------------------------------

## 4. Global application shell

All authenticated workspace pages must share the same shell.

### Desktop layout

1.  Persistent left sidebar.
2.  Top header across the main content area.
3.  Main page content.
4.  Optional contextual panels or drawers when useful.

### Sidebar navigation

**WORKSPACE** - Overview --- `/dashboard` - AI Assistant --- `/chat` -
Tasks --- `/tasks` - Calendar --- `/calendar`

**KNOWLEDGE** - Memory --- `/memory` - Documents --- `/documents` -
Notes --- `/notes`

**AUTOMATION** - Workflows --- `/workflows` - Approvals ---
`/approvals` - Activity History --- `/history`

**INTEGRATIONS** - Email --- `/email` - Connected Apps ---
`/integrations` - MCP Servers --- `/integrations/mcp`

**SYSTEM** - Model Providers --- `/settings/providers` - Settings ---
`/settings`

Navigation items for features not yet implemented may be shown as
disabled or marked "Coming later". Do not make non-functional items
appear active.

### Header

Include: - Current page title or breadcrumb. - Global search entry point
(when supported). - Notifications entry point. - Owner profile menu.

Avoid placing too many unrelated controls in the header.

### Responsive behavior

-   Desktop is the primary design target.
-   On tablet, sidebar may collapse to icon navigation or a drawer.
-   On mobile web, use a compact navigation drawer and stack content
    vertically.
-   Preserve access to the primary AI Chat action.
-   Do not design a separate native mobile application.

------------------------------------------------------------------------

## 5. Screen specifications

Design each screen as part of the same application. Reuse the global
shell, typography, colors, spacing and components.

### Screen 01 --- Overview Dashboard

**Route:** `/dashboard`\
**Priority:** Sprint 1 visual foundation

Purpose: Give the owner a concise view of today's work and assistant
activity.

Recommended sections: 1. Welcome area with a short greeting and
assistant availability state. 2. Primary action to open AI Assistant. 3.
Summary cards for tasks, upcoming events, memories and indexed
documents. Only show values when data exists; otherwise use clear empty
or setup states. 4. Today's priorities with title, priority, due date
and status. 5. Upcoming agenda with event title, date and time. 6.
Recent assistant activity or conversations. 7. Quick actions such as Ask
AI, Create Task and Upload Document.

Layout guidance: - Avoid turning every metric into a large card. -
Establish a clear top-to-bottom reading order. - Use a balanced
responsive grid. - Show a useful first-time empty state when the user
has no data. - Do not fabricate charts or live system health metrics.

### Screen 02 --- AI Assistant Chat

**Route:** `/chat`\
**Priority:** Sprint 1

Purpose: Main conversational workspace.

Layout: - Conversation history panel with New Conversation and search. -
Main conversation area. - Composer anchored at the bottom of the
conversation area. - Optional contextual execution panel that can expand
when an agent workflow is active.

Include: - User and assistant messages. - Markdown-style assistant
responses. - Code blocks. - Copy response action. - Regenerate response
action. - Attachment affordance if supported by the current stage. -
Model selector only when provider selection is implemented. - Clear
empty state with a few suggested example prompts.

Design these distinct states: - No conversation selected. - Conversation
with messages. - Assistant thinking. - Assistant streaming a response. -
Tool execution started. - Tool execution completed. - Approval
required. - Execution failed. - Assistant completed with a final report.

For future agent activity, show a clear timeline: 1. Understanding
request. 2. Preparing plan. 3. Executing permitted tools. 4. Verifying
outcome. 5. Reporting result.

Do not show fake tool calls or pretend that the assistant is executing
actions when it is only generating a response.

### Screen 03 --- Basic Settings

**Route:** `/settings`\
**Priority:** Sprint 1

Include: - Owner profile summary. - Appearance preferences. - General
preferences. - Local application configuration where relevant.

Keep provider secrets and advanced integration configuration out of this
basic page.

### Screen 04 --- Model Providers

**Route:** `/settings/providers`\
**Priority:** Sprint 2

Provider cards: - Ollama (local). - Google Gemini. - Mistral AI. -
OpenAI (future / disabled initially).

Each card may show: - Provider name and icon. - Local or cloud label. -
Connection state. - Selected model, when configured. - Configure
action. - Enable/disable state.

Include design states for: - Not configured. - Connected. - Connection
failed. - Testing connection. - Provider disabled.

API key dialogs must use masked fields. Never reveal secrets. OpenAI
should be visibly marked as unavailable/disabled in the initial
zero-budget setup.

### Screen 05 --- Agent Activity

**Route:** `/activity`\
**Priority:** Sprint 3

Purpose: Make tool execution understandable.

Include: - Execution status. - Request summary. - Timeline of agent and
tool steps. - Tool name and concise purpose. - Started/completed
timestamps where available. - Result summary. - Failure and retry state
where applicable.

Use honest status labels such as Requested, Planned, Running, Waiting
for approval, Completed, Failed and Partially completed. Do not imply
success before verification.

### Screen 06 --- Memory

**Route:** `/memory`\
**Priority:** Sprint 4

Include: - Memory search. - Memory categories or filters. - Saved memory
list. - Memory detail panel. - Edit action. - Delete confirmation. -
Source/provenance and date where available. - Confidence only if the
backend actually supplies a meaningful value.

Include first-use, empty, loading and error states. The user must remain
in control of reviewing and deleting saved memories.

### Screen 07 --- Documents

**Route:** `/documents`\
**Priority:** Sprint 5

Include: - Document upload area. - Supported file type guidance. -
Document list. - File name, type and size. - Processing/indexing
status. - Indexed chunk count when available. - Search. - Document
detail view. - Processing progress and failure states. - Delete
confirmation.

Communicate that indexed documents can be retrieved by the assistant. Do
not claim a document is searchable until indexing has completed.

### Screen 08 --- Tasks

**Route:** `/tasks`\
**Priority:** Sprint 6

Include: - Task list. - Priority. - Due date. - Status. - Create/edit
task interaction. - Filters and search. - Empty state.

Keep task creation simple and consistent with the assistant's ability to
propose tasks from conversation.

### Screen 09 --- Calendar

**Route:** `/calendar`\
**Priority:** Sprint 7

Include: - Agenda view as the primary practical view. - Day/week/month
view where useful. - Upcoming events. - Event detail panel. - Meeting
date and time. - Calendar connection state.

Distinguish actual connected events from sample preview content.

### Screen 10 --- Workflows

**Route:** `/workflows`\
**Priority:** Sprint 9 and later

Include: - Workflow list. - Status. - Recent runs. - Workflow detail. -
Step/dependency visualization. - Progress and failure states. -
Pause/cancel affordances only when supported.

Do not overcomplicate the first workflow screen with an elaborate visual
automation builder unless the implementation requires it.

### Screen 11 --- Approvals

**Route:** `/approvals`\
**Priority:** Sprint 10

Include: - Pending approval list. - Action summary. - Exact proposed
action and target. - Relevant arguments or change summary. - Approve and
Reject actions. - Expired/rejected/completed states. - Clear warning for
consequential external actions.

Approval should be specific to the exact proposed action, not a blanket
permission.

### Screen 12 --- Activity History

**Route:** `/history`\
**Priority:** Sprint 10 and later

Include: - Chronological execution history. - Tool/action name. -
Status. - Timestamp. - Short result summary. - Filters. - Detail view
with audit information.

### Screen 13 --- Notifications

**Route:** `/notifications`\
**Priority:** Sprint 12

Include: - Notification list. - Read/unread states. - Notification
categories. - Related task, approval or workflow reference. - Empty
state.

### Screen 14 --- Email

**Route:** `/email`\
**Priority:** Sprint 7 and later

Include: - Thread list. - Sender and subject. - Date. - Read/unread
state. - Thread detail. - AI summary presentation. - Draft reply
presentation.

Clearly distinguish drafts from sent messages. Sending requires approval
in the product workflow.

### Screen 15 --- Connected Apps

**Route:** `/integrations`\
**Priority:** Later integration work

Include: - Available/connected integration cards. - Connection state. -
Permission summary. - Configure/disconnect affordances. - Clear
indication of which capabilities are read-only or write-enabled.

### Screen 16 --- MCP Servers

**Route:** `/integrations/mcp`\
**Priority:** Sprint 11

Include: - Configured server list. - Connection state. - Discovered
tools. - Tool permission summary. - Configure and disconnect states. -
Server error state.

Do not imply that a server is connected or a tool is available without
backend confirmation.

### Screen 17 --- Advanced Settings

**Route:** `/settings/advanced`\
**Priority:** Later hardening

Include only settings supported by the product, such as: - Security and
session preferences. - Data/privacy controls. - Provider availability. -
Usage limits. - Integration permissions. - Data export/deletion entry
points when implemented.

------------------------------------------------------------------------

## 6. Shared component library

Create a consistent reusable visual language for:

-   `AppShell`
-   `Sidebar`
-   `Header`
-   `PageHeader`
-   `SectionHeader`
-   `PrimaryButton`
-   `SecondaryButton`
-   `IconButton`
-   `SearchInput`
-   `TextInput`
-   `Select`
-   `Tabs`
-   `StatusBadge`
-   `StatCard`
-   `TaskCard`
-   `ConversationItem`
-   `MessageBubble`
-   `MessageComposer`
-   `ActivityTimeline`
-   `ApprovalCard`
-   `DocumentRow`
-   `EmptyState`
-   `LoadingSkeleton`
-   `ErrorState`
-   `ConfirmDialog`
-   `Toast`
-   `DropdownMenu`

Components should have consistent spacing, radius, typography, icon
size, hover state, focus state and disabled state.

------------------------------------------------------------------------

## 7. Interaction and accessibility requirements

-   Use clear hover, focus, active, selected and disabled states.
-   Provide keyboard-visible focus indicators.
-   Ensure text and controls have sufficient contrast.
-   Do not rely on color alone for status.
-   Use confirmation dialogs for destructive actions.
-   Make loading and error states understandable.
-   Keep primary actions visually distinct.
-   Avoid unnecessary animation; use subtle transitions.
-   Respect reduced-motion preferences in implementation.
-   Keep dialogs and drawers easy to dismiss.
-   Ensure responsive behavior does not hide essential actions.

------------------------------------------------------------------------

## 8. Stitch generation workflow

Generate the product in controlled batches. Do not generate all pages in
one prompt.

### First generation batch --- establish the visual system

1.  Generate the application shell with sidebar and header.
2.  Generate the Overview Dashboard.
3.  Generate the AI Assistant Chat.
4.  Generate Basic Settings.

Review these together before generating the rest. Refine the global
shell and tokens first.

### Second batch --- model and agent experience

5.  Model Providers.
6.  Agent Activity.

### Third batch --- knowledge and productivity

7.  Memory.
8.  Documents.
9.  Tasks.
10. Calendar.

### Fourth batch --- automation

11. Workflows.
12. Approvals.
13. Activity History.
14. Notifications.

### Fifth batch --- integrations and advanced settings

15. Email.
16. Connected Apps.
17. MCP Servers.
18. Advanced Settings.

For every new page: - Reuse the established application shell. - Reuse
the established color and typography tokens. - Reuse the same card,
button, input and badge patterns. - Keep the page appropriate to its
actual product purpose. - Do not redesign the sidebar or header
independently. - Ask for a focused refinement rather than regenerating
the entire product when only one component needs adjustment.

------------------------------------------------------------------------

## 9. Development roadmap alignment

  Sprint      UI scope
  ----------- --------------------------------------------
  Sprint 1    App shell, Overview, Chat, Basic Settings
  Sprint 2    Model Providers
  Sprint 3    Agent Activity and tool execution states
  Sprint 4    Memory
  Sprint 5    Documents
  Sprint 6    Tasks and Notes
  Sprint 7    Email and Calendar
  Sprint 8    Research/report views
  Sprint 9    Workflow execution
  Sprint 10   Approvals and audit history
  Sprint 11   MCP management
  Sprint 12   Notifications and scheduled workflow views
  Sprint 13   Future channel-related settings
  Sprint 14   Security and privacy settings
  Sprint 15   Usability and reliability refinements
  Sprint 16   Future organization/admin experience

Designing a screen does not mean implementing its functionality in that
sprint. The existing development roadmap and acceptance criteria remain
authoritative.

------------------------------------------------------------------------

## 10. Implementation handoff expectations

The resulting design should be practical to implement using:

-   Next.js.
-   TypeScript.
-   Tailwind CSS.
-   Reusable React components.
-   Responsive CSS layouts.
-   Lucide-style icons.

Prefer: - Clear page hierarchy. - Repeatable component patterns. -
Sensible content widths. - Consistent spacing. - Practical tables and
lists. - Realistic empty/loading/error states. - Desktop-first
responsive design.

Do not create backend logic, API assumptions or fake live integrations
in the design.

### Final design acceptance criteria

The design is ready for frontend implementation when:

-   The Overview, Chat and Settings share one coherent application
    shell.
-   Navigation is consistent across all screens.
-   Color, typography, spacing and component styles are documented.
-   Desktop layouts are clear and responsive behavior is considered.
-   Chat has empty, normal, loading and error states.
-   Future agent execution and approval states are visually
    understandable.
-   No screen claims functionality that the roadmap does not support.
-   The result looks like one polished Personal AI Assistant product.

**Final instruction:** Design a coherent, premium, dark, dashboard-first
Personal AI Assistant. Prioritize usability, transparency, consistency
and implementation practicality over visual decoration.
