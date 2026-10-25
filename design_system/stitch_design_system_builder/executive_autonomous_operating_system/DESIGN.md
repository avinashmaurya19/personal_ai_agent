---
name: Executive Autonomous Operating System
colors:
  surface: '#0f1320'
  surface-dim: '#0f1320'
  surface-bright: '#353948'
  surface-container-lowest: '#090e1b'
  surface-container-low: '#171b29'
  surface-container: '#1b1f2d'
  surface-container-high: '#252938'
  surface-container-highest: '#303443'
  on-surface: '#dfe1f5'
  on-surface-variant: '#c8c4d7'
  inverse-surface: '#dfe1f5'
  inverse-on-surface: '#2c303e'
  outline: '#918fa0'
  outline-variant: '#474554'
  surface-tint: '#c5c0ff'
  primary: '#c5c0ff'
  on-primary: '#2400a2'
  primary-container: '#8a80ff'
  on-primary-container: '#1f008f'
  inverse-primary: '#5546d7'
  secondary: '#c6c0ff'
  on-secondary: '#29158f'
  secondary-container: '#4336a7'
  on-secondary-container: '#b6afff'
  tertiary: '#ffb77b'
  on-tertiary: '#4d2700'
  tertiary-container: '#d47b1f'
  on-tertiary-container: '#432100'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#140067'
  on-primary-fixed-variant: '#3c28bf'
  secondary-fixed: '#e4dfff'
  secondary-fixed-dim: '#c6c0ff'
  on-secondary-fixed: '#150066'
  on-secondary-fixed-variant: '#4134a5'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77b'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6d3a00'
  background: '#0f1320'
  on-background: '#dfe1f5'
  surface-variant: '#303443'
  app-bg: '#070B18'
  sidebar-bg: '#0B1020'
  card-surface: '#11182A'
  elevated-surface: '#171F34'
  border-hairline: '#202A40'
  border-active: '#323F5D'
  text-primary: '#F1F5F9'
  text-secondary: '#94A3B8'
  text-tertiary: '#64748B'
  success: '#10B981'
  success-subtle: rgba(16, 185, 129, 0.12)
  warning: '#F59E0B'
  warning-subtle: rgba(245, 158, 11, 0.12)
  danger: '#F43F5E'
  danger-subtle: rgba(244, 63, 94, 0.12)
  accent-subtle: rgba(113, 101, 245, 0.14)
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.025em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  caption-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  caption-medium:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  metric-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

### Personality & Emotional Response
The design system establishes an autonomous executive operating system designed for high-agency digital work, strategic orchestration, and transparent multi-step tool execution. The product persona balances high technical authority with calm executive restraint. It is neither playful nor ornamental: it deliberately rejects common AI tropes such as shimmering rainbow gradients, cartoonish conversational avatars, and whimsical "magic" particle effects. Instead, it projects the deliberate, predictable precision of high-end developer instrumentation and mission-critical enterprise command systems.

Interactions evoke clarity, cognitive safety, and sovereign control. The system conveys mechanical competence and deep transparency: users must feel entirely confident delegating consequential tasks (e.g., executing email dispatches, running multi-model workflows, database mutations) because state, permissions, and tool inputs remain inspectable at every boundary.

### Design Movement: Technical Minimalist Dark UI
The design system draws from modern technical minimalism, utilitarian developer tooling, and structured data-dense executive cockpits. The aesthetic relies on:
- **Calibrated Value Stacking:** Strict tonal surface tiers step forward naturally through luminosity rather than dynamic ambient light.
- **Micro-Hairline Geometry:** Razor-thin structural borders (`1px solid #202A40`) separate concerns cleanly without visual clutter.
- **High-Density Typography:** High contrast neutral typography paired with tabular numeric readouts creates crisp visual legibility across dense metric cards and execution logs.
- **Instrumental Focus:** High-chroma electric indigo accents are reserved solely for focus targets, primary action verbs, active execution nodes, and user confirmations.

## Colors

### Surface Hierarchy & Foundation
The color architecture operates strictly in dark mode, mapping spatial depth to a sequence of four discrete container values:
- **Base Canvas (`#070B18`):** The lowest layer, representing the root viewport context.
- **Sidebar Surface (`#0B1020`):** Anchors left-hand global navigation rails, providing structural separation from the primary viewport.
- **Default Card Surface (`#11182A`):** The primary container for static content, metric modules, tabular rows, and conversation panels.
- **Elevated Interactive Surface (`#171F34`):** Raised surfaces such as input text boxes, flyout sheets, context menus, tooltips, and modal overlays.

### Chromatic Accents & Semantic States
- **Primary Accent (`#7165F5`):** Reserved for primary interactive controls, confirmed focus rings, active step progress indicators, and affirmative trigger states.
- **Secondary Accent (`#958BFF`):** Used for non-primary interactive elements, subtle iconography accents, tool argument tags, and hover highlights.
- **Functional Semantics:**
  - `success` (`#10B981`): Verified agent runs, healthy MCP integrations, greenlight criteria.
  - `warning` (`#F59E0B`): Human-in-the-loop pending approval gates, ambiguous intent confirmation, low context windows.
  - `danger` (`#F43F5E`): Terminal action requests, authentication or runner failures, unpermitted tool invocations.

### Accessibility Standards
All color-coded state indicators must be paired with visible textual metadata or iconography. Interactive borders must achieve a minimum 3:1 contrast against their surrounding surface, and all critical body copy (`#F1F5F9`) delivers greater than 11:1 contrast against canvas tones.

## Typography

### Structural Hierarchy & Usage
Typography is anchored by `Inter`, supported by `JetBrains Mono` for code payloads, file traces, MCP input/output payloads, and agent execution parameters.

- **Display & Section Headers:** Use negative letter-spacing (`-0.025em` down to `-0.015em`) with medium-to-semibold weights to ensure razor-sharp rendering on dark panels.
- **Body & Paragraphs:** Set in `body-base` (`14px/20px`) for dense assistant interactions, message bubbles, and workflow descriptions. Standardize on `body-lg` (`16px/24px`) strictly for long-form memory notes or synthesis documentation.
- **Tabular Numerals:** All numeric readouts, task counters, processing latencies, token counters, and tabular statistics must enable `font-variant-numeric: tabular-nums` to eliminate jitter across dynamic data updates.
- **Code & Diagnostics:** Technical tool calls, raw LLM input envelopes, and environment keys must be styled with `code-inline` or `code-block` using monospaced styling.

## Layout & Spacing

### Layout Model
The layout adheres to a fixed-sidebar, fluid-body desktop architecture:
1. **Left Navigation Shell:** Fixed width of `260px` on desktop (`>= 1024px`), rendering persistent category links, pinned integrations, and quick-action triggers.
2. **Global Application Header:** Fixed height of `56px`, anchoring page breadcrumbs, unified search bar (`⌘K`), system notification triggers, and the active session profile.
3. **Primary Canvas:** Fluid container with max-width bounding constraints (`1440px` for general dashboards; `1080px` centered for focused conversational threads).
4. **Contextual Execution Panel:** Right-hand dockable sheet (`380px` to `460px`) used for stepping through deep MCP actions, raw execution trees, and task approval chains without vacating the primary canvas.

### Responsive Behavior & Breakpoints
- **Desktop (`>= 1280px`):** Full 12-column or 4-column balanced grid, persistent sidebar, dual-pane thread views.
- **Tablet (`768px – 1279px`):** Sidebar collapses to an icon-only dock (`68px`); grid layouts adapt to 2 columns; right-hand inspector slides over as an overlay drawer.
- **Mobile (`< 768px`):** Sidebar transitions to a full-screen drawer triggered via header hamburger. Dashboard modules and activity timelines collapse to single-column vertical stacks. The unified message composer remains fixed to the bottom edge with safe-area inset preservation.

## Elevation & Depth

### Depth Through Tonal Layering
The design system avoids heavy drop shadows, neon glow artifacts, or frosted glassmorphism. Visual depth is achieved through rigid surface value progression and hairline borders:
- **Base Level (Canvas):** `#070B18`
- **Tier 1 (Sidebar / Structural Rails):** `#0B1020` with right hairline border (`1px solid #202A40`).
- **Tier 2 (Cards / Modules / Data Tables):** `#11182A` with perimeter hairline border (`1px solid #202A40`).
- **Tier 3 (Active Focus / Elevated Inputs):** `#171F34` with perimeter border (`1px solid #202A40`).

### Focused Overlays & Modals
When elevation demands explicit user focus (e.g., destructive dialogs, approval modals, flyout context menus):
- **Backdrop:** Flat `#070B18` with 80% opacity (`rgba(7, 11, 24, 0.8)`). No blur filter.
- **Overlay Container:** Rendered on surface `#171F34` with an accented border (`1px solid #323F5D`) and an ultra-diffused, black grounding shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.6)`.
- **Focus Rings:** Non-offset, high-precision ring: `0 0 0 2px #7165F5`.

## Shapes

### Corner Curvature Rules
The shape language is modern, calculated, and consistent, aligning with the `roundedness: 2` scale:
- **Cards & Data Modules:** Standardized at `12px` (`0.75rem`) to create a refined, compact dashboard container.
- **Modal Dialogs & Large Sheets:** Standardized at `14px` (`0.875rem`).
- **Interactive Controls (Inputs, Selects, Buttons):** Standardized at `8px` (`0.5rem`) to provide ergonomic alignment against parent card boundaries.
- **Badges, Tags & Metric Chips:** Standardized at `6px` (`0.375rem`) or pill-shaped (`9999px`) for discrete status dots.
- **Message Bubbles:** Standardized at `12px`, with agent response bubbles adopting a sharp top-left corner (`2px`) to subtly ground conversational identity.

## Components

### Buttons
- **Primary:** Background `#7165F5`, text `#F1F5F9`, font weight 500. Hover: `#5E50EE`. Active: `#5345E0`. Focus: `0 0 0 2px #958BFF`.
- **Secondary:** Background `#171F34`, border `1px solid #202A40`, text `#F1F5F9`. Hover: border `#323F5D`, background `#1C2640`.
- **Destructive:** Background `#F43F5E`, text `#FFFFFF`. Hover: `#E11D48`.
- **Ghost:** Transparent background, text `#94A3B8`. Hover: `#171F34`, text `#F1F5F9`.
- **Heights & Geometry:** Fixed heights: Sm (`32px`), Md (`38px`), Lg (`44px`). Border radius `8px`.

### Form Inputs & Search Fields
- **Container:** Background `#171F34`, border `1px solid #202A40`, text `#F1F5F9`, border radius `8px`.
- **Placeholder:** Text `#64748B`.
- **Focus State:** Border `#7165F5`, ring `0 0 0 1px #7165F5`.
- **Heights:** Unified strictly to `38px` across single-line inputs and select triggers.

### Cards & Statistic Cards (`StatCard`)
- **Structure:** Background `#11182A`, border `1px solid #202A40`, padding `1.25rem`, radius `12px`.
- **Metrics Layout:** Top row holds title (`caption-medium`, `#94A3B8`) and optional status icon. Value rendered in `metric-xl` (`tabular-nums`, `#F1F5F9`). Bottom row hosts comparison trend chips.

### Status Badges & Chips
- **Geometry:** Height `22px`, radius `6px`, padding `0 8px`, typography `caption-medium`.
- **Tokens:**
  - *Success (Completed / Connected):* Text `#10B981`, background `rgba(16, 185, 129, 0.12)`, border `1px solid rgba(16, 185, 129, 0.25)`.
  - *Warning (Pending / Waiting for Approval):* Text `#F59E0B`, background `rgba(245, 158, 11, 0.12)`, border `1px solid rgba(245, 158, 11, 0.25)`.
  - *Danger (Failed / Blocked):* Text `#F43F5E`, background `rgba(244, 63, 94, 0.12)`, border `1px solid rgba(244, 63, 94, 0.25)`.
  - *Neutral (Planned / Queued):* Text `#94A3B8`, background `#171F34`, border `1px solid #202A40`.

### Task Cards & Approval Cards (`ApprovalCard`)
- **Approval Flow Pattern:** Distinct visual variant of `Card`. Left hairline indicator colored by action consequence (`#F59E0B` for state modifications; `#F43F5E` for external dispatch/deletion).
- **Header:** Displays proposed tool invocation (e.g., `send_email`, `exec_query`), associated agent, and requested execution parameters in formatted monospace snippet blocks.
- **Footer:** Inline binary action cluster (`Approve` primary button vs. `Reject / Abort` ghost button).

### Conversational Elements (`MessageBubble` & `MessageComposer`)
- **User Bubble:** Aligned right, background `#171F34`, border `1px solid #323F5D`, text `#F1F5F9`, radius `12px`.
- **Assistant Bubble:** Aligned left, background `#11182A`, border `1px solid #202A40`, radius `12px 12px 12px 2px`. Renders streaming token status and structured tool inspection accordions directly below the markdown payload.
- **Message Composer:** Anchored bottom dock; background `#11182A`, border `1px solid #202A40`, inner input background `#171F34`. Includes file attachment trigger, model selector pill, token cost gauge, and send button (`#7165F5`).

### Activity Timeline & Stepper
- **Line Structure:** Continuous vertical stroke `1px solid #202A40` with node markers (`8px` bullet).
- **Node States:** Completed (`#10B981`), Active Processing (pulsing `#7165F5`), Pending (`#202A40`).

### Empty States & Loading Skeletons
- **Empty State:** Border `1px dashed #202A40`, background transparent or `#0B1020`, centered icon container (`48px` surface `#171F34`), descriptive body text, and direct creation trigger.
- **Skeletons:** Background `#171F34` with subtle pulse transition (`opacity: 0.6` to `1.0`), border radius matching target components (`8px` for buttons, `12px` for cards).