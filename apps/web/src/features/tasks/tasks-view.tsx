"use client";

import React, { useState } from "react";
import { TaskItem, api } from "@/lib/api-client";

interface TasksViewProps {
  tasks: TaskItem[];
  onRefresh: () => void;
  onToggleTask: (task: TaskItem) => Promise<void>;
  onQuickAddTask: (title: string, priority: "low" | "medium" | "high" | "urgent") => Promise<void>;
}

export function TasksView({
  tasks,
  onRefresh,
  onToggleTask,
  onQuickAddTask,
}: TasksViewProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onQuickAddTask(newTitle.trim(), newPriority);
      setNewTitle("");
      onRefresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTask(id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "medium":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      default:
        return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-6 border-b border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Task Manager &amp; Priorities
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Real-time Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track daily objectives, assistant-delegated tasks, and execution timelines.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <span className="text-2xl font-bold text-white mt-1 tabular-nums">{tasks.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
            <span className="material-symbols-outlined text-[20px]">task</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 tabular-nums">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1527]/75 border border-white/5 backdrop-blur-md shadow-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{completedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      <form
        onSubmit={handleCreate}
        className="mt-6 p-4 rounded-2xl bg-[#0C1222]/80 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center gap-3"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Create new objective or actionable task for Avinash..."
          className="flex-1 h-10 px-4 bg-white/5 rounded-xl text-xs text-white placeholder:text-slate-500 border border-white/10 focus:border-indigo-500/40 focus:outline-none transition-colors"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as any)}
          className="h-10 px-3 bg-white/5 rounded-xl text-xs text-slate-300 border border-white/10 focus:outline-none"
        >
          <option value="low" className="bg-[#0B1020] text-white">Low Priority</option>
          <option value="medium" className="bg-[#0B1020] text-white">Medium Priority</option>
          <option value="high" className="bg-[#0B1020] text-white">High Priority</option>
          <option value="urgent" className="bg-[#0B1020] text-white">Urgent</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting || !newTitle.trim()}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs font-semibold hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Create Task</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          {(["all", "pending", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? "bg-white/10 text-white border border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab} (
              {tasks.filter((t) =>
                tab === "all" ? true : tab === "completed" ? t.status === "completed" : t.status !== "completed"
              ).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-[#0C1222]/80 border border-white/5 rounded-2xl">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? "bg-white/[0.02] border-white/5 opacity-60"
                    : "bg-[#0D1527]/75 hover:bg-[#131F38]/90 border-white/5 hover:border-indigo-500/30 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isDone ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isDone ? "line-through text-slate-500" : "text-white"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-1.5">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                      {task.due_date && (
                        <>
                          <span>&bull;</span>
                          <span className="text-amber-400 font-mono">
                            Due {task.due_date}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all"
                  title="Delete task"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
