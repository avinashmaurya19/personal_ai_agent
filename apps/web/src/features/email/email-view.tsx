"use client";

import React, { useState } from "react";
import { EmailThreadItem } from "@/lib/api-client";

interface EmailViewProps {
  emailThreads: EmailThreadItem[];
  onRefresh: () => void;
}

export function EmailView({ emailThreads, onRefresh }: EmailViewProps) {
  const [selectedThread, setSelectedThread] = useState<EmailThreadItem | null>(
    emailThreads[0] || null
  );

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Autonomous Email Triaging &amp; Briefings
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-secondary-container/30 text-secondary border border-secondary/20">
              <span className="material-symbols-outlined text-[13px]">mail</span> IMAP/SMTP Gateway Active
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Inspect autonomous inbox classification, AI-drafted responses, and thread summaries.
          </p>
        </div>
      </div>

      {/* Main Two-Pane Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 min-h-[500px]">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 bg-card-surface border border-border-hairline rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 border-b border-border-hairline flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">
              Inbox Threads ({emailThreads.length})
            </span>
            <button
              onClick={onRefresh}
              className="text-xs text-text-tertiary hover:text-text-primary flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Sync</span>
            </button>
          </div>

          <div className="divide-y divide-border-hairline/60 overflow-y-auto max-h-[540px]">
            {emailThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-tertiary">
                No email threads found in mock/local inbox.
              </div>
            ) : (
              emailThreads.map((thread) => {
                const isSelected = selectedThread?.thread_id === thread.thread_id;
                return (
                  <div
                    key={thread.thread_id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-elevated-surface border-l-2 border-l-primary"
                        : "hover:bg-elevated-surface/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {thread.last_sender}
                      </span>
                      <span className="text-[10px] text-text-tertiary font-mono">
                        {new Date(thread.last_activity).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary font-medium truncate mb-1">
                      {thread.subject}
                    </p>
                    <p className="text-[11px] text-text-tertiary line-clamp-2">
                      {thread.snippet}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail (7 cols) */}
        <div className="lg:col-span-7 bg-card-surface border border-border-hairline rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          {selectedThread ? (
            <div className="space-y-4">
              <div className="border-b border-border-hairline pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-subtle text-primary border border-primary/20">
                    Triaged by Personal AI
                  </span>
                  <span className="text-xs font-mono text-text-tertiary">
                    {new Date(selectedThread.last_activity).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-text-primary">
                  {selectedThread.subject}
                </h2>
                <div className="text-xs text-text-secondary flex items-center gap-2">
                  <span className="text-text-tertiary">From:</span>
                  <span className="font-semibold text-text-primary">{selectedThread.last_sender}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-elevated-surface border border-border-hairline text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                {selectedThread.snippet}
              </div>

              {/* AI Autonomous Suggestion / Draft Callout */}
              <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/30 space-y-2">
                <div className="flex items-center gap-2 text-secondary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  <span>AI Executive Analysis</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  This thread requires attention. Assistant suggests preparing an acknowledgment draft.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
              Select an email thread from the left to view contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
