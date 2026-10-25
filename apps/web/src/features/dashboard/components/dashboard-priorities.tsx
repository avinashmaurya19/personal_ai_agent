"use client";

import React, { useState } from "react";
import { TaskItem } from "@/lib/api-client";

interface DashboardPrioritiesProps {
  tasks: TaskItem[];
  onOpenTasks: () => void;
  onToggleTask: (task: TaskItem) => Promise<void>;
  onQuickAddTask: (title: string, priority: "low" | "medium" | "high" | "urgent") => Promise<void>;
}

export function DashboardPriorities({
  tasks,
  onOpenTasks,
  onToggleTask,
  onQuickAddTask,
}: DashboardPrioritiesProps) {
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isAddingTask) return;
    setIsAddingTask(true);
    try {
      await onQuickAddTask(quickTitle.trim(), quickPriority);
      setQuickTitle("");
    } finally {
      setIsAddingTask(false);
    }
  };

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
    <section className="lg:col-span-7 flex flex-col bg-card-surface border border-border-hairline rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-hairline/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-elevated-surface flex items-center justify-center text-primary border border-border-hairline">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">
              Today's Priorities
            </h2>
            <p className="text-xs text-text-tertiary">
              {pendingTasks.length} active objectives for Avinash
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-elevated-surface text-text-secondary border border-border-hairline">
            {tasks.length} items
          </span>
          <button
            onClick={onOpenTasks}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Task Quick Add Form */}
      <form onSubmit={handleTaskSubmit} className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add high-priority task..."
          className="flex-1 h-9 px-3 bg-elevated-surface rounded-lg text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
        />
        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as any)}
          className="h-9 px-2 bg-elevated-surface rounded-lg text-xs text-text-secondary border border-border-hairline focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          type="submit"
          disabled={isAddingTask || !quickTitle.trim()}
          className="h-9 px-3 rounded-lg bg-primary text-on-primary text-xs font-medium hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Add</span>
        </button>
      </form>

      {/* Tasks List */}
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-tertiary">
            No tasks logged yet. Create your first priority above!
          </div>
        ) : (
          tasks.slice(0, 6).map((task) => {
            const isDone = task.status === "completed";
            return (
              <div
                key={task.id}
                className={`group p-3 rounded-xl border border-border-hairline transition-all flex items-start gap-3 ${
                  isDone
                    ? "bg-elevated-surface/40 opacity-70"
                    : "bg-elevated-surface hover:bg-surface-container-high"
                }`}
              >
                <button
                  onClick={() => onToggleTask(task)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
                    isDone
                      ? "bg-success text-on-primary"
                      : "bg-card-surface border border-border-hairline text-transparent hover:text-text-tertiary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isDone ? "line-through text-text-secondary" : "text-text-primary"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide flex-shrink-0 ${getPriorityBadgeClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-text-tertiary">
                        schedule
                      </span>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Today"}
                    </span>
                    <span>•</span>
                    <span className="text-text-tertiary truncate">
                      {task.description || "Active context objective"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
