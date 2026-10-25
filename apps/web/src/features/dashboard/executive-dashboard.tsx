"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Mail,
  Calendar,
  Clock,
  FileText,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Plus,
  Brain,
  RefreshCw,
  Sparkles,
  Bot,
  ExternalLink,
} from "lucide-react";
import {
  TaskItem,
  EmailThreadItem,
  CalendarEventItem,
  PendingActionItem,
  DocumentItem,
  MemoryItem,
  api,
} from "@/lib/api-client";
import { DashboardMetrics } from "@/features/dashboard/dashboard-metrics";
import { PriorityChart } from "@/features/dashboard/priority-chart";

interface ExecutiveDashboardProps {
  tasks: TaskItem[];
  emailThreads: EmailThreadItem[];
  calendarEvents: CalendarEventItem[];
  pendingActions: PendingActionItem[];
  documents: DocumentItem[];
  memories: MemoryItem[];
  activeModelName?: string;
  onRefresh: () => void;
  onOpenChat: () => void;
  onOpenTasks: () => void;
  onOpenInbox: () => void;
  onOpenDocs: () => void;
  onOpenMemory: () => void;
  onToggleTask: (task: TaskItem) => Promise<void>;
  onQuickAddTask: (title: string, priority: "low" | "medium" | "high" | "urgent") => Promise<void>;
  onDecideAction: (actionId: string, approved: boolean) => Promise<void>;
}

export function ExecutiveDashboard({
  tasks,
  emailThreads,
  calendarEvents,
  pendingActions,
  documents,
  memories,
  activeModelName,
  onRefresh,
  onOpenChat,
  onOpenTasks,
  onOpenInbox,
  onOpenDocs,
  onOpenMemory,
  onToggleTask,
  onQuickAddTask,
  onDecideAction,
}: ExecutiveDashboardProps) {
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isSubmittingTask) return;
    setIsSubmittingTask(true);
    try {
      await onQuickAddTask(quickTitle.trim(), quickPriority);
      setQuickTitle("");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                Personal AI Executive Dashboard
              </h1>
              <p className="text-xs text-slate-400">
                Continuous autonomous assistant &bull; Stage A MVP &bull; ₹0 Infrastructure Target
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onOpenTasks}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>Tasks</span>
          </button>

          <button
            onClick={onOpenInbox}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>Inbox</span>
            {pendingActions.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={onOpenDocs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>Docs</span>
          </button>

          <button
            onClick={onOpenMemory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Brain className="h-3.5 w-3.5 text-indigo-400" />
            <span>Memory</span>
          </button>

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Open Chat</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <DashboardMetrics
        tasks={tasks}
        emailThreads={emailThreads}
        calendarEvents={calendarEvents}
        pendingActions={pendingActions}
        documents={documents}
        memoriesCount={memories.length}
        activeModelName={activeModelName}
        onOpenInbox={onOpenInbox}
        onOpenTasks={onOpenTasks}
        onOpenDocs={onOpenDocs}
      />

      {/* Priority Graph */}
      <PriorityChart tasks={tasks} />

      {/* Main Grid: 3 Interactive Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Active Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-indigo-400" />
              <span>Active Tasks</span>
            </h2>
            <button
              onClick={onOpenTasks}
              className="text-xs text-indigo-400 hover:underline"
            >
              View all &rarr;
            </button>
          </div>

          {/* Quick Task Input */}
          <form
            onSubmit={handleTaskSubmit}
            className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 focus-within:border-indigo-500 transition-all"
          >
            <input
              type="text"
              placeholder="Add new task..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="flex-1 bg-transparent px-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/60 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Med</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              type="submit"
              disabled={isSubmittingTask || !quickTitle.trim()}
              className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2">
            {tasks.slice(0, 6).map((task) => {
              const isDone = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={`flex items-start space-x-3 p-3 rounded-xl border transition-all ${
                    isDone
                      ? "bg-slate-950/40 border-slate-900 opacity-60"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => onToggleTask(task)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-relaxed truncate ${
                        isDone ? "line-through text-slate-500" : "text-slate-200"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px]">
                      <span
                        className={`px-1.5 py-0.2 rounded capitalize ${
                          task.priority === "urgent" || task.priority === "high"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="text-slate-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Approvals & Agenda */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Pending Approvals Gate</span>
            </h2>
            <button onClick={onOpenInbox} className="text-xs text-indigo-400 hover:underline">
              Inbox &rarr;
            </button>
          </div>

          {/* Pending Actions List */}
          {pendingActions.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-xl bg-slate-950 border border-amber-500/30 p-3.5 space-y-2.5 shadow-md shadow-amber-500/5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase text-[10px]">
                      {action.action_type.replace("_", " ")}
                    </span>
                    <span className="text-slate-500">Action Required</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">{action.description}</p>
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => onDecideAction(action.id, false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-xs text-slate-300 hover:text-rose-400 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onDecideAction(action.id, true)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition-colors"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
              <span>Zero pending actions. Consequential mutations are guarded.</span>
            </div>
          )}

          {/* Upcoming Calendar Agenda */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-violet-400" />
              <span>Upcoming Agenda</span>
            </h3>
            <div className="space-y-2">
              {calendarEvents.slice(0, 3).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-semibold text-slate-200">{ev.title}</h4>
                    <span className="text-[10px] text-indigo-400">
                      {new Date(ev.start_time).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>
                      {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {ev.location && <span className="text-slate-500">&bull; {ev.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Documents & Mailbox */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Ingested Documents (RAG)</span>
            </h2>
            <button onClick={onOpenDocs} className="text-xs text-indigo-400 hover:underline">
              Manage &rarr;
            </button>
          </div>

          {/* Document Chunks Card */}
          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="truncate max-w-[200px]">
                  <p className="text-xs font-semibold text-slate-200 truncate">{doc.filename}</p>
                  <p className="text-[10px] text-slate-500">{doc.chunk_count} pgvector chunks</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-medium">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>

          {/* Mailbox Recent Activity */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center space-x-1.5">
              <Mail className="h-3.5 w-3.5 text-sky-400" />
              <span>Mailbox Threads</span>
            </h3>
            <div className="space-y-2">
              {emailThreads.slice(0, 3).map((th) => (
                <div
                  key={th.thread_id}
                  onClick={onOpenInbox}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                      {th.last_sender}
                    </span>
                    {th.has_unread && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 truncate">{th.subject}</p>
                  <p className="text-[10px] text-slate-500 truncate">{th.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
