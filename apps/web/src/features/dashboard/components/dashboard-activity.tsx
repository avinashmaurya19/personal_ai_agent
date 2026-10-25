"use client";

import React, { useState } from "react";
import { ConversationItem, DocumentItem } from "@/lib/api-client";

interface DashboardActivityProps {
  conversations: ConversationItem[];
  documents: DocumentItem[];
}

export function DashboardActivity({
  conversations,
  documents,
}: DashboardActivityProps) {
  const [activityFilter, setActivityFilter] = useState<"all" | "chats" | "docs">("all");

  const showChats = activityFilter === "all" || activityFilter === "chats";
  const showDocs = activityFilter === "all" || activityFilter === "docs";

  return (
    <section className="bg-card-surface border border-border-hairline rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-border-hairline/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-primary border border-border-hairline">
            <span className="material-symbols-outlined text-[18px]">history</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-text-tertiary">
              Autonomous agent operations, indexing events, and workflow logs
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          {(["all", "chats", "docs"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActivityFilter(filter)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                activityFilter === filter
                  ? "bg-elevated-surface text-text-primary border border-border-hairline"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {filter === "all" ? "All Activity" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Items */}
      <div className="divide-y divide-border-hairline/60">
        {showChats &&
          conversations.slice(0, 3).map((conv) => (
            <div
              key={conv.id}
              className="py-3 flex items-start gap-3 hover:bg-elevated-surface/30 px-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center flex-shrink-0 mt-0.5 border border-secondary/20">
                <span className="material-symbols-outlined text-[18px]">forum</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-text-primary truncate">
                    {conv.title || "AI Research & Reasoning Session"}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success-subtle text-success">
                    Completed
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                  <span>
                    {new Date(conv.updated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>•</span>
                  <span>Model: {conv.active_model_name}</span>
                </div>
              </div>
            </div>
          ))}

        {showDocs &&
          documents.slice(0, 2).map((doc) => (
            <div
              key={doc.id}
              className="py-3 flex items-start gap-3 hover:bg-elevated-surface/30 px-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center flex-shrink-0 mt-0.5 border border-tertiary/20">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-text-primary truncate">
                    Indexed “{doc.filename}” ({doc.chunk_count} chunks)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                    Indexed
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                  <span>Vector Store: text-embedding-3-small</span>
                  <span>•</span>
                  <span>Status: 100% synchronized</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
