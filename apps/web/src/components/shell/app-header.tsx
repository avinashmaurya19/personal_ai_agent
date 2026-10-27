"use client";

import React, { useState, useRef, useEffect } from "react";
import { NavViewId } from "./app-sidebar";
import { UserMenu } from "@/features/auth/user-menu";
import { TaskItem, DocumentItem, ConversationItem } from "@/lib/api-client";

interface AppHeaderProps {
  activeView: NavViewId;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  tasks?: TaskItem[];
  documents?: DocumentItem[];
  conversations?: ConversationItem[];
  onNavigateToView?: (view: NavViewId) => void;
  onSelectConversation?: (id: string) => void;
  onAskAssistant?: (prompt: string) => void;
}

export function AppHeader({
  activeView,
  searchQuery = "",
  onSearchChange,
  tasks = [],
  documents = [],
  conversations = [],
  onNavigateToView,
  onSelectConversation,
  onAskAssistant,
}: AppHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const matchingTasks = query
    ? tasks.filter((t) => t.title.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const matchingDocs = query
    ? documents.filter((d) => d.filename.toLowerCase().includes(query)).slice(0, 3)
    : [];

  const matchingConvs = query
    ? conversations
        .filter((c) => (c.title || "").toLowerCase().includes(query))
        .slice(0, 3)
    : [];

  const hasResults =
    matchingTasks.length > 0 || matchingDocs.length > 0 || matchingConvs.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query && onAskAssistant) {
      e.preventDefault();
      setIsDropdownOpen(false);
      onAskAssistant(searchQuery);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="h-14 w-full flex-shrink-0 bg-[#080B14]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 select-none z-40 relative">
      {/* Universal Search Bar */}
      <div className="relative flex items-center w-full max-w-md" ref={containerRef}>
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              onSearchChange?.(e.target.value);
              setIsDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, documents, or ask AceVertix..."
            className="h-9 w-full pl-9 pr-8 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange?.("");
                setIsDropdownOpen(false);
              }}
              className="absolute right-2.5 p-0.5 text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isDropdownOpen && query && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C1222] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-2 max-h-96 overflow-y-auto backdrop-blur-xl animate-fadeIn">
            {/* Quick Ask AI Option */}
            <div
              onClick={() => {
                setIsDropdownOpen(false);
                onAskAssistant?.(searchQuery);
              }}
              className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 cursor-pointer flex items-center justify-between text-xs text-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-indigo-400 text-[16px]">
                  smart_toy
                </span>
                <span className="truncate">
                  Ask AceVertix: <strong className="text-white">&quot;{searchQuery}&quot;</strong>
                </span>
              </div>
              <span className="text-[10px] bg-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-200 font-mono">
                ↵ Enter
              </span>
            </div>

            {/* Matching Tasks */}
            {matchingTasks.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2">
                  Tasks
                </span>
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onNavigateToView?.("tasks");
                    }}
                    className="p-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        check_box
                      </span>
                      <span className="truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Documents */}
            {matchingDocs.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2">
                  Documents
                </span>
                {matchingDocs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onNavigateToView?.("documents");
                    }}
                    className="p-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[15px] text-cyan-400">
                        description
                      </span>
                      <span className="truncate">{d.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Conversations */}
            {matchingConvs.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2">
                  Chat Sessions
                </span>
                {matchingConvs.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectConversation?.(c.id);
                      onNavigateToView?.("ai-assistant");
                    }}
                    className="p-2 rounded-xl hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[15px] text-indigo-400">
                        chat_bubble
                      </span>
                      <span className="truncate">{c.title || "Untitled Session"}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!hasResults && (
              <div className="py-2 px-3 text-center text-xs text-slate-500">
                No matching workspace items found. Press Enter to ask AceVertix.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right User Avatar (Clean, uncluttered, no redundant buttons) */}
      <div className="flex items-center gap-3">
        <UserMenu variant="header" />
      </div>
    </header>
  );
}
