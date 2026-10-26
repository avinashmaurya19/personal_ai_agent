"use client";

import React, { useState } from "react";
import { EmailThreadItem } from "@/lib/api-client";

interface GmailThreadListProps {
  threads: EmailThreadItem[];
  selectedThreadId: string | null;
  onSelectThread: (thread: EmailThreadItem) => void;
  onRefresh: () => void;
  onMarkRead: (threadId: string) => void;
  starredThreadIds: Set<string>;
  onToggleStar: (threadId: string, e: React.MouseEvent) => void;
}

export function GmailThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  onRefresh,
  onMarkRead,
  starredThreadIds,
  onToggleStar,
}: GmailThreadListProps) {
  const [activeTab, setActiveTab] = useState<"primary" | "promotions" | "updates">("primary");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleSelectAll = () => {
    if (selectedIds.size === threads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(threads.map((t) => t.thread_id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatGmailDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      }
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-card-surface/40 select-none overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-12 border-b border-border-hairline px-4 flex items-center justify-between text-xs text-text-tertiary bg-card-surface/60">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={threads.length > 0 && selectedIds.size === threads.length}
            onChange={handleToggleSelectAll}
            className="w-4 h-4 rounded border-border-hairline bg-elevated-surface text-primary focus:ring-0 cursor-pointer"
          />

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-elevated-surface hover:text-text-primary transition"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          {selectedIds.size > 0 && (
            <>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => onMarkRead(id));
                  setSelectedIds(new Set());
                }}
                className="p-1.5 rounded-lg hover:bg-elevated-surface hover:text-text-primary transition"
                title="Mark selected as read"
              >
                <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
              </button>
              <span className="text-[11px] text-text-tertiary font-mono">
                {selectedIds.size} selected
              </span>
            </>
          )}
        </div>

        {/* Pagination & Count */}
        <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono">
          <span>{threads.length > 0 ? `1–${threads.length} of ${threads.length}` : "0 of 0"}</span>
        </div>
      </div>

      {/* Gmail Category Tabs */}
      <div className="flex border-b border-border-hairline bg-card-surface/20">
        <button
          onClick={() => setActiveTab("primary")}
          className={`flex items-center gap-3 px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "primary"
              ? "border-blue-500 text-blue-400 bg-blue-500/5"
              : "border-transparent text-text-tertiary hover:text-text-primary hover:bg-elevated-surface/30"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inbox</span>
          <span>Primary</span>
        </button>

        <button
          onClick={() => setActiveTab("promotions")}
          className={`flex items-center gap-3 px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "promotions"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-text-tertiary hover:text-text-primary hover:bg-elevated-surface/30"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">sell</span>
          <span>Promotions</span>
        </button>

        <button
          onClick={() => setActiveTab("updates")}
          className={`flex items-center gap-3 px-6 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "updates"
              ? "border-amber-500 text-amber-400 bg-amber-500/5"
              : "border-transparent text-text-tertiary hover:text-text-primary hover:bg-elevated-surface/30"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>Updates</span>
        </button>
      </div>

      {/* Email Thread Rows (True Gmail Table Style) */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-hairline/40">
        {threads.length === 0 ? (
          <div className="p-16 text-center text-xs text-text-tertiary space-y-2">
            <span className="material-symbols-outlined text-[42px] text-text-tertiary/40 block mx-auto">
              mark_email_unread
            </span>
            <p className="text-sm font-medium text-text-secondary">Your inbox is empty</p>
            <p className="text-xs text-text-tertiary">
              Sync live Gmail from the top bar or send an email to see messages here.
            </p>
          </div>
        ) : (
          threads.map((t) => {
            const isSelected = selectedThreadId === t.thread_id;
            const isChecked = selectedIds.has(t.thread_id);
            const isStarred = starredThreadIds.has(t.thread_id);
            const isUnread = t.has_unread;

            return (
              <div
                key={t.thread_id}
                onClick={() => onSelectThread(t)}
                className={`group flex items-center px-4 py-2.5 text-xs cursor-pointer transition-colors relative border-l-2 ${
                  isSelected
                    ? "bg-elevated-surface border-l-primary"
                    : isUnread
                    ? "bg-card-surface/90 border-l-transparent font-medium"
                    : "hover:bg-elevated-surface/50 border-l-transparent text-text-secondary"
                }`}
              >
                {/* 1. Selection & Star Tools */}
                <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onClick={(e) => handleToggleSelectRow(t.thread_id, e)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-border-hairline bg-elevated-surface text-primary focus:ring-0 cursor-pointer"
                  />
                  <button
                    onClick={(e) => onToggleStar(t.thread_id, e)}
                    className="text-text-tertiary hover:text-amber-400 p-0.5 transition"
                    title={isStarred ? "Starred" : "Not starred"}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isStarred ? "text-amber-400 fill-current" : "text-text-tertiary/60"
                      }`}
                    >
                      {isStarred ? "star" : "star_border"}
                    </span>
                  </button>
                </div>

                {/* 2. Sender Name (Gmail column: ~180px) */}
                <div
                  className={`w-44 flex-shrink-0 truncate pr-3 ${
                    isUnread ? "font-bold text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {t.last_sender.split("<")[0].replace(/"/g, "").trim() || t.last_sender}
                </div>

                {/* 3. Subject & Snippet (Gmail single continuous row) */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5 truncate pr-4">
                  <span
                    className={`truncate ${
                      isUnread ? "font-semibold text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {t.subject}
                  </span>
                  <span className="text-text-tertiary flex-shrink-0">-</span>
                  <span className="text-text-tertiary truncate text-[11px] font-normal">
                    {t.snippet}
                  </span>
                </div>

                {/* 4. Date Timestamp or Hover Actions */}
                <div className="flex-shrink-0 ml-auto flex items-center">
                  {/* Default: Timestamp */}
                  <span className="text-[11px] font-mono text-text-tertiary group-hover:hidden">
                    {formatGmailDate(t.last_activity)}
                  </span>

                  {/* On Hover: Quick Gmail Action Bar */}
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(t.thread_id);
                      }}
                      className="p-1 rounded hover:bg-elevated-surface hover:text-text-primary text-text-tertiary transition"
                      title="Mark as read"
                    >
                      <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(t.thread_id, e);
                      }}
                      className="p-1 rounded hover:bg-elevated-surface hover:text-amber-400 text-text-tertiary transition"
                      title="Star"
                    >
                      <span className="material-symbols-outlined text-[16px]">star</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
