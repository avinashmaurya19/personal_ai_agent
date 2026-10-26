"use client";

import React from "react";
import { NavViewId } from "./app-sidebar";

interface AppHeaderProps {
  activeView: NavViewId;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onQuickAction?: () => void;
  unreadNotificationsCount?: number;
}

const VIEW_TITLES: Record<NavViewId, { category: string; title: string }> = {
  overview: { category: "Platform", title: "Overview Dashboard" },
  "ai-assistant": { category: "Workspace", title: "AI Assistant" },
  tasks: { category: "Workspace", title: "Task Manager" },
  calendar: { category: "Workspace", title: "Calendar & Agenda" },
  memory: { category: "Knowledge", title: "Neural Memory Graph" },
  documents: { category: "Knowledge", title: "Document Intelligence (RAG)" },
  research: { category: "Knowledge", title: "Autonomous Research & Reporting" },
  notes: { category: "Knowledge", title: "Notes & Scratchpad" },
  workflows: { category: "Automation", title: "Autonomous Workflows" },
  approvals: { category: "Automation", title: "Human Approvals" },
  "activity-history": { category: "Automation", title: "Activity History" },
  email: { category: "Integrations", title: "Email Inbox" },
  "connected-apps": { category: "Integrations", title: "Connected Apps" },
  "mcp-servers": { category: "Integrations", title: "MCP Servers" },
  "model-providers": { category: "System", title: "Model Providers" },
  settings: { category: "System", title: "System Settings" },
};

export function AppHeader({
  activeView,
  searchQuery = "",
  onSearchChange,
  unreadNotificationsCount = 0,
}: AppHeaderProps) {
  const current = VIEW_TITLES[activeView] || {
    category: "Platform",
    title: "Overview",
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-sidebar-bg/90 backdrop-blur-md z-40 border-b border-border-hairline flex items-center justify-between px-6 select-none">
      {/* Breadcrumb Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary">
          <span className="hover:text-text-secondary cursor-pointer transition-colors">
            {current.category}
          </span>
          <span className="text-border-active">/</span>
          <span className="text-text-primary font-semibold">{current.title}</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-text-tertiary text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search memories, docs, actions... ⌘K"
            className="w-full h-[36px] pl-9 pr-4 bg-elevated-surface rounded-lg text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Agent Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-elevated-surface border border-border-hairline text-xs font-medium text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span>Agent Idle • 24ms local latency</span>
        </div>

        {/* Notifications Icon */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-lg hover:bg-elevated-surface text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-hairline"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger"></span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer text-primary">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
