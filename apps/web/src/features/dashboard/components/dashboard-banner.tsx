"use client";

import React from "react";

interface DashboardBannerProps {
  onNewConversation: () => void;
  onOpenTasks: () => void;
  onOpenDocs: () => void;
  onOpenMemory: () => void;
  memoryCount: number;
}

export function DashboardBanner({
  onNewConversation,
  onOpenTasks,
  onOpenDocs,
  onOpenMemory,
  memoryCount,
}: DashboardBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-card-surface border border-border-hairline p-6 lg:p-8 mb-6 shadow-xl">
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 bottom-0 w-64 h-32 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-subtle text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Assistant Online • 24ms local latency
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-elevated-surface text-text-secondary border border-border-hairline">
              <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
              Fast Routing Active
            </span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Good morning, Avinash
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Your personal assistant is active and synchronized across your daily schedule, neural memory graph, and document index.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onNewConversation}
            className="inline-flex items-center gap-2 px-5 h-[42px] rounded-xl bg-primary-container text-on-primary hover:brightness-110 active:scale-[0.98] font-medium text-sm transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">chat_spark</span>
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      {/* Quick Action Launchpad */}
      <div className="mt-6 pt-5 border-t border-border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onNewConversation}
          className="group flex items-center gap-3 p-3 rounded-xl bg-elevated-surface hover:bg-surface-container-high transition-all border border-border-hairline text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">neurology</span>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-text-primary truncate">Ask AI</span>
            <span className="block text-[11px] text-text-tertiary truncate">Instant query</span>
          </div>
        </button>

        <button
          onClick={onOpenTasks}
          className="group flex items-center gap-3 p-3 rounded-xl bg-elevated-surface hover:bg-surface-container-high transition-all border border-border-hairline text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">add_task</span>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-text-primary truncate">Create Task</span>
            <span className="block text-[11px] text-text-tertiary truncate">Assign or queue</span>
          </div>
        </button>

        <button
          onClick={onOpenDocs}
          className="group flex items-center gap-3 p-3 rounded-xl bg-elevated-surface hover:bg-surface-container-high transition-all border border-border-hairline text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 text-tertiary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-text-primary truncate">Upload Document</span>
            <span className="block text-[11px] text-text-tertiary truncate">Auto-vectorize</span>
          </div>
        </button>

        <button
          onClick={onOpenMemory}
          className="group flex items-center gap-3 p-3 rounded-xl bg-elevated-surface hover:bg-surface-container-high transition-all border border-border-hairline text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-success-subtle text-success flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-text-primary truncate">View Memory</span>
            <span className="block text-[11px] text-text-tertiary truncate">{memoryCount} nodes active</span>
          </div>
        </button>
      </div>
    </section>
  );
}
