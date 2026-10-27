export interface UpcomingFeature {
  title: string;
  detail: string;
  icon: string;
}

export interface ComingSoonModuleConfig {
  moduleName: string;
  icon: string;
  description: string;
  upcomingFeatures: UpcomingFeature[];
}

export const COMING_SOON_MODULES: Record<string, ComingSoonModuleConfig> = {
  calendar: {
    moduleName: "Calendar & Schedule Synchronization",
    icon: "calendar_today",
    description:
      "Live Google Calendar two-way synchronization, intelligent conflict resolution, and autonomous agenda planning.",
    upcomingFeatures: [
      {
        title: "Google Calendar Live Sync",
        detail: "Seamless two-way integration with your personal and work calendars.",
        icon: "sync",
      },
      {
        title: "Smart Conflict Detection",
        detail: "Automatic detection of overlapping commitments with buffer recommendations.",
        icon: "event_busy",
      },
      {
        title: "AI Executive Briefing",
        detail: "Instant agenda summaries with one-click direct meeting joins.",
        icon: "videocam",
      },
    ],
  },
  workflows: {
    moduleName: "Autonomous Workflows & Multi-Agent Pipelines",
    icon: "schema",
    description:
      "Design, orchestrate, and automate complex multi-agent reasoning chains and scheduled background tasks.",
    upcomingFeatures: [
      {
        title: "Multi-Step Graphs",
        detail: "Chain LLM agents, scrapers, and tools into reliable directed workflows.",
        icon: "account_tree",
      },
      {
        title: "Scheduled Triggers",
        detail: "Run autonomous briefings and summaries automatically at set intervals.",
        icon: "schedule",
      },
      {
        title: "Human Approval Gates",
        detail: "Safety boundaries before external actions or sensitive API writes.",
        icon: "verified",
      },
    ],
  },
  notes: {
    moduleName: "Smart Notes & Scratchpad",
    icon: "edit_note",
    description:
      "Context-aware scratchpad automatically indexed into your personal memory graph.",
    upcomingFeatures: [
      {
        title: "Bi-directional Linking",
        detail: "Connects related documents, tasks, and memory entities automatically.",
        icon: "link",
      },
      {
        title: "AI Inline Polishing",
        detail: "Summarize, format, or extract action items with 1 click.",
        icon: "auto_fix_high",
      },
      {
        title: "Vector Graph Indexing",
        detail: "Instantly searchable via natural language semantic queries.",
        icon: "psychology",
      },
    ],
  },
  "mcp-servers": {
    moduleName: "MCP Servers & Connectors",
    icon: "dns",
    description:
      "Connect local and cloud Model Context Protocol servers to dynamically expand your assistant's tool suite.",
    upcomingFeatures: [
      {
        title: "Dynamic Discovery",
        detail: "Connect any MCP server over stdio or SSE without code changes.",
        icon: "hub",
      },
      {
        title: "Sandboxed Permissions",
        detail: "Fine-grained permission controls per server connector.",
        icon: "security",
      },
      {
        title: "1-Click Marketplace",
        detail: "Install official plugins and connectors directly from UI.",
        icon: "extension",
      },
    ],
  },
  "activity-history": {
    moduleName: "Activity History & Audit Ledger",
    icon: "history",
    description:
      "Immutable telemetry ledger tracking every tool executed, tokens consumed, and model decision made.",
    upcomingFeatures: [
      {
        title: "Execution Timeline",
        detail: "Drill down into multi-agent thought steps and tool outputs.",
        icon: "visibility",
      },
      {
        title: "Token & Latency Metrics",
        detail: "Real-time telemetry across local and cloud providers.",
        icon: "speed",
      },
      {
        title: "Audit Verification",
        detail: "Cryptographic receipts of approved and executed actions.",
        icon: "receipt_long",
      },
    ],
  },
};
