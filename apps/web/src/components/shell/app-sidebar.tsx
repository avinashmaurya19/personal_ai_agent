"use client";

import React from "react";
import { UserMenu } from "@/features/auth/user-menu";

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
  onNewChat?: () => void;
  pendingApprovalsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavEntry {
  id: NavViewId;
  label: string;
  icon: string;
  hasChevron?: boolean;
}

export function AppSidebar({
  activeView,
  onSelectView,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const menuItems: NavEntry[] = [
    { id: "overview", label: "Home", icon: "home", hasChevron: true },
    { id: "ai-assistant", label: "Chats", icon: "chat", hasChevron: true },
    { id: "tasks", label: "Tasks", icon: "check_box", hasChevron: true },
    { id: "calendar", label: "Calendar", icon: "calendar_today", hasChevron: true },
    { id: "email", label: "Emails", icon: "mail", hasChevron: true },
    { id: "documents", label: "Documents", icon: "description", hasChevron: true },
    { id: "connected-apps", label: "Integrations", icon: "hub", hasChevron: true },
    { id: "workflows", label: "Workflows", icon: "schema", hasChevron: false },
    { id: "memory", label: "Memory", icon: "psychology", hasChevron: false },
    { id: "settings", label: "Settings", icon: "settings", hasChevron: false },
  ];

  return (
    <aside
      className={`h-full flex-shrink-0 bg-[#090D18] border-r border-white/5 flex flex-col justify-between overflow-y-auto overflow-x-hidden select-none transition-all duration-300 z-30 ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      <div className={`flex flex-col ${isCollapsed ? "p-2 gap-3" : "p-4 gap-4"}`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
              <div className="w-full h-full bg-[#090D18] rounded-[10px] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-cyan-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold text-white tracking-tight truncate">
                AceVertix Assistant
              </span>
            )}
          </div>

          {/* Collapse/Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCollapsed ? "chevron_right" : "chevron_left"}
              </span>
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={() => {
            if (onNewChat) {
              onNewChat();
            } else {
              onSelectView("ai-assistant");
            }
          }}
          title="New Chat"
          className={`flex items-center rounded-xl bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#3b82f6] text-white font-medium text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all ${
            isCollapsed
              ? "w-10 h-10 mx-auto justify-center"
              : "w-full px-3.5 py-2.5 gap-2.5"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            chat_bubble
          </span>
          {!isCollapsed && <span>New Chat</span>}
        </button>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1 mt-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-medium transition-all group ${
                  isCollapsed
                    ? "w-10 h-10 mx-auto justify-center"
                    : "w-full justify-between px-3 py-2"
                } ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "gap-3"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors ${
                      isActive
                        ? "text-indigo-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.hasChevron && (
                  <span
                    className={`material-symbols-outlined text-[16px] transition-colors ${
                      isActive
                        ? "text-slate-400"
                        : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  >
                    chevron_right
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className={`border-t border-white/5 ${isCollapsed ? "p-2" : "p-2"}`}>
        <UserMenu
          variant="sidebar"
          collapsed={isCollapsed}
          onOpenSettings={() => onSelectView("settings")}
        />
      </div>
    </aside>
  );
}
