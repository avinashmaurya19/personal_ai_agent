"use client";

import React from "react";

export type NavViewId =
  | "overview"
  | "ai-assistant"
  | "tasks"
  | "calendar"
  | "memory"
  | "documents"
  | "research"
  | "notes"
  | "workflows"
  | "approvals"
  | "activity-history"
  | "email"
  | "connected-apps"
  | "mcp-servers"
  | "model-providers"
  | "settings";

interface AppSidebarProps {
  activeView: NavViewId;
  onSelectView: (view: NavViewId) => void;
  pendingApprovalsCount?: number;
}

interface NavItem {
  id: NavViewId;
  label: string;
  icon: string;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AppSidebar({
  activeView,
  onSelectView,
  pendingApprovalsCount = 0,
}: AppSidebarProps) {
  const sections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        { id: "overview", label: "Overview", icon: "dashboard" },
        { id: "ai-assistant", label: "AI Assistant", icon: "chat" },
        { id: "tasks", label: "Tasks", icon: "check_circle" },
        { id: "calendar", label: "Calendar", icon: "calendar_today" },
      ],
    },
    {
      title: "Knowledge",
      items: [
        { id: "memory", label: "Memory", icon: "psychology" },
        { id: "documents", label: "Documents", icon: "description" },
        { id: "research", label: "Research", icon: "menu_book" },
        { id: "notes", label: "Notes", icon: "edit_note" },
      ],
    },
    {
      title: "Automation",
      items: [
        { id: "workflows", label: "Workflows", icon: "schema" },
        {
          id: "approvals",
          label: "Approvals",
          icon: "verified",
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: "bg-warning-subtle text-warning",
        },
        { id: "activity-history", label: "Activity History", icon: "history" },
      ],
    },
    {
      title: "Integrations",
      items: [
        { id: "email", label: "Email", icon: "mail" },
        { id: "connected-apps", label: "Connected Apps", icon: "hub" },
        { id: "mcp-servers", label: "MCP Servers", icon: "dns" },
      ],
    },
    {
      title: "System",
      items: [
        { id: "model-providers", label: "Model Providers", icon: "neurology" },
        { id: "settings", label: "Settings", icon: "settings" },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar-bg border-r border-border-hairline z-50 flex flex-col justify-between overflow-y-auto select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 flex flex-col gap-1.5 border-b border-border-hairline/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <span className="text-base font-semibold text-text-primary tracking-tight">
              Personal AI
            </span>
          </div>
          <div className="flex items-center mt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-subtle text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Active • Fast Mode
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex flex-col gap-3 px-3 py-3">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider uppercase text-text-tertiary">
                {section.title}
              </div>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectView(item.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left group ${
                        isActive
                          ? "bg-secondary-container text-on-secondary-container font-semibold shadow-sm"
                          : "text-text-secondary hover:bg-elevated-surface hover:text-text-primary"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`material-symbols-outlined text-[18px] transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-text-tertiary group-hover:text-text-secondary"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            item.badgeColor || "bg-card-surface text-text-secondary"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 m-3 bg-card-surface border border-border-hairline rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-elevated-surface flex items-center justify-center overflow-hidden border border-border-hairline">
              <span className="material-symbols-outlined text-text-secondary text-[20px]">
                account_circle
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-card-surface"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text-primary truncate">
              Avinash
            </span>
            <span className="text-[11px] text-text-tertiary truncate">
              Workspace Owner • Pro
            </span>
          </div>
        </div>
        <button
          onClick={() => onSelectView("settings")}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-elevated-surface"
          aria-label="User Settings"
        >
          <span className="material-symbols-outlined text-[18px]">unfold_more</span>
        </button>
      </div>
    </aside>
  );
}
