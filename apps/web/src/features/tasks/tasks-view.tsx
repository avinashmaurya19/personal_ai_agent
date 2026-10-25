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

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "bg-danger-subtle text-danger border border-danger/20";
      case "medium":
        return "bg-warning-subtle text-warning border border-warning/20";
      default:
        return "bg-card-surface text-text-secondary border border-border-hairline";
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 pb-6 border-b border-border-hairline">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Task Management &amp; Autonomous Queues
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary-container/20 text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[13px]">check_circle</span> Orchestrator Active
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-3xl">
            Prioritize and inspect autonomous or manual tasks executed across your workspace.
          </p>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} className="mt-6 p-4 rounded-2xl bg-card-surface border border-border-hairline shadow-md flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Create new objective or actionable task for Avinash..."
          className="flex-1 h-10 px-4 bg-elevated-surface rounded-xl text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as any)}
          className="h-10 px-3 bg-elevated-surface rounded-xl text-xs text-text-secondary border border-border-hairline focus:outline-none"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting || !newTitle.trim()}
          className="h-10 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Create Task</span>
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="mt-6 flex items-center justify-between border-b border-border-hairline pb-3">
        <div className="flex items-center gap-2">
          {(["all", "pending", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              {tab} ({tasks.filter((t) => tab === "all" ? true : tab === "completed" ? t.status === "completed" : t.status !== "completed").length})
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-tertiary bg-card-surface border border-border-hairline rounded-2xl">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            return (
              <div
                key={task.id}
                className={`group p-4 rounded-xl border border-border-hairline transition-all flex items-start justify-between gap-4 ${
                  isDone
                    ? "bg-elevated-surface/40 opacity-70"
                    : "bg-card-surface hover:bg-elevated-surface/80"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                      isDone
                        ? "bg-success text-on-primary"
                        : "bg-elevated-surface border border-border-hairline text-transparent hover:text-text-tertiary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isDone ? "line-through text-text-secondary" : "text-text-primary"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${getPriorityBadgeClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mb-1.5">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                      <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                      {task.due_date && (
                        <>
                          <span>&bull;</span>
                          <span className="text-warning">
                            Due {new Date(task.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-tertiary hover:text-danger rounded-lg hover:bg-elevated-surface transition-all"
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
