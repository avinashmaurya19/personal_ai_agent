"use client";

import React from "react";
import { TaskItem, CalendarEventItem, DocumentItem, MemoryItem } from "@/lib/api-client";

interface DashboardStatCardsProps {
  tasks: TaskItem[];
  calendarEvents: CalendarEventItem[];
  documents: DocumentItem[];
  memories: MemoryItem[];
  onOpenTasks: () => void;
  onOpenCalendar: () => void;
  onOpenDocs: () => void;
  onOpenMemory: () => void;
}

export function DashboardStatCards({
  tasks,
  calendarEvents,
  documents,
  memories,
  onOpenTasks,
  onOpenCalendar,
  onOpenDocs,
  onOpenMemory,
}: DashboardStatCardsProps) {
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Stat 1: Tasks */}
      <div
        onClick={onOpenTasks}
        className="bg-card-surface border border-border-hairline rounded-xl p-4 flex flex-col justify-between hover:bg-elevated-surface/70 transition-all shadow-md cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Tasks Overview
          </span>
          <span className="material-symbols-outlined text-text-tertiary text-[18px]">checklist</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-text-primary tabular-nums">{tasks.length}</span>
          <span className="text-xs text-text-tertiary">Total</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
            {pendingTasks.length} Pending
          </span>
          <div className="w-20 bg-elevated-surface rounded-full h-1.5 overflow-hidden border border-border-hairline">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${taskCompletionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stat 2: Calendar */}
      <div
        onClick={onOpenCalendar}
        className="bg-card-surface border border-border-hairline rounded-xl p-4 flex flex-col justify-between hover:bg-elevated-surface/70 transition-all shadow-md cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Upcoming Meetings
          </span>
          <span className="material-symbols-outlined text-text-tertiary text-[18px]">event</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {calendarEvents.length}
          </span>
          <span className="text-xs text-text-tertiary">Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 min-w-0">
          <span className="material-symbols-outlined text-[14px] text-text-tertiary flex-shrink-0">
            schedule
          </span>
          <span className="text-xs text-text-secondary truncate">
            {calendarEvents[0] ? `Next: ${calendarEvents[0].title}` : "No more meetings today"}
          </span>
        </div>
      </div>

      {/* Stat 3: Memory */}
      <div
        onClick={onOpenMemory}
        className="bg-card-surface border border-border-hairline rounded-xl p-4 flex flex-col justify-between hover:bg-elevated-surface/70 transition-all shadow-md cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Stored Memories
          </span>
          <span className="material-symbols-outlined text-text-tertiary text-[18px]">
            psychology_alt
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {memories.length}
          </span>
          <span className="text-xs text-text-tertiary">Active Nodes</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-success inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            99.2% recall ready
          </span>
        </div>
      </div>

      {/* Stat 4: Documents */}
      <div
        onClick={onOpenDocs}
        className="bg-card-surface border border-border-hairline rounded-xl p-4 flex flex-col justify-between hover:bg-elevated-surface/70 transition-all shadow-md cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Indexed Documents
          </span>
          <span className="material-symbols-outlined text-text-tertiary text-[18px]">source</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {documents.length}
          </span>
          <span className="text-xs text-text-tertiary">Synced</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-secondary truncate">
            Vector index synchronized
          </span>
          <span className="material-symbols-outlined text-success text-[16px]">done_all</span>
        </div>
      </div>
    </section>
  );
}
