"use client";

import React from "react";
import {
  CheckSquare,
  Mail,
  Calendar,
  FileText,
  ShieldAlert,
  Cpu,
  TrendingUp,
} from "lucide-react";
import {
  TaskItem,
  EmailThreadItem,
  CalendarEventItem,
  PendingActionItem,
  DocumentItem,
} from "@/lib/api-client";

interface DashboardMetricsProps {
  tasks: TaskItem[];
  emailThreads: EmailThreadItem[];
  calendarEvents: CalendarEventItem[];
  pendingActions: PendingActionItem[];
  documents: DocumentItem[];
  memoriesCount: number;
  activeModelName?: string;
  onOpenInbox: () => void;
  onOpenTasks: () => void;
  onOpenDocs: () => void;
}

export function DashboardMetrics({
  tasks,
  emailThreads,
  calendarEvents,
  pendingActions,
  documents,
  memoriesCount,
  activeModelName,
  onOpenInbox,
  onOpenTasks,
  onOpenDocs,
}: DashboardMetricsProps) {
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const unreadEmails = emailThreads.filter((t) => t.has_unread).length;
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tasks Completion Metric */}
      <div
        onClick={onOpenTasks}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Tasks & To-Dos</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-100">{completedTasks}</span>
          <span className="text-xs text-slate-400">/ {tasks.length} done</span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{pendingTasks} pending</span>
            <span className="font-semibold text-indigo-400">{taskCompletionRate}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Inbox & Approvals Metric */}
      <div
        onClick={onOpenInbox}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Communications</span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
            <Mail className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-100">{unreadEmails}</span>
          <span className="text-xs text-slate-400">unread threads</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{emailThreads.length} total threads</span>
          {pendingActions.length > 0 ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">
              <ShieldAlert className="h-3 w-3" />
              <span>{pendingActions.length} pending sign-off</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">All approved</span>
          )}
        </div>
      </div>

      {/* 3. Calendar & Meetings Metric */}
      <div
        onClick={onOpenInbox}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Schedule & Agenda</span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-100">{calendarEvents.length}</span>
          <span className="text-xs text-slate-400">upcoming events</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[160px]">
            {calendarEvents[0]?.title || "No meetings today"}
          </span>
          <span className="text-emerald-400 font-medium">Synced</span>
        </div>
      </div>

      {/* 4. RAG Knowledge & Budget Metric */}
      <div
        onClick={onOpenDocs}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Knowledge & Compute</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Cpu className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-100">{totalChunks}</span>
          <span className="text-xs text-slate-400">pgvector chunks</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 truncate max-w-[120px]">{documents.length} docs, {memoriesCount} facts</span>
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
            <span>₹0.00 spend</span>
          </span>
        </div>
      </div>
    </div>
  );
}
