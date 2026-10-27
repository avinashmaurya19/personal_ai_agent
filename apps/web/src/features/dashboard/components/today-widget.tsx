"use client";

import React from "react";
import { TaskItem } from "@/lib/api-client";

interface TodayWidgetProps {
  tasks: TaskItem[];
  onToggleTask: (task: TaskItem) => Promise<void>;
  onOpenDailyBriefing: () => void;
  onOpenTasks?: () => void;
}

export function TodayWidget({
  tasks,
  onToggleTask,
  onOpenDailyBriefing,
  onOpenTasks,
}: TodayWidgetProps) {
  // Format current date: "Tue, 28 Oct 2026"
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const displayTasks = tasks.slice(0, 5);

  return (
    <div className="w-full rounded-2xl bg-[#0C1222]/80 border border-white/10 backdrop-blur-xl p-4 flex flex-col gap-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-white tracking-tight">Today</h2>
          <span className="text-xs text-slate-400 font-normal">{formattedDate}</span>
        </div>
        <button
          type="button"
          onClick={onOpenDailyBriefing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shadow-sm"
        >
          <span>Daily Briefing</span>
          <span className="text-xs">→</span>
        </button>
      </div>

      {/* Task List or Clean Empty State */}
      {displayTasks.length === 0 ? (
        <div className="py-7 px-4 flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
          <span className="material-symbols-outlined text-slate-500 text-[26px]">
            task_alt
          </span>
          <p className="text-xs font-semibold text-slate-300">
            No tasks scheduled for today
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs">
            Your schedule is clear. Create a task or ask AceVertix to plan your day.
          </p>
          {onOpenTasks && (
            <button
              type="button"
              onClick={onOpenTasks}
              className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 border border-indigo-500/30 transition-colors shadow-sm"
            >
              + Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          {displayTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task)}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[19px] transition-colors ${
                      isCompleted
                        ? "text-indigo-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {isCompleted ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span
                    className={`text-xs font-medium truncate ${
                      isCompleted
                        ? "line-through text-slate-500"
                        : "text-slate-200 group-hover:text-white"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 ml-2 flex-shrink-0">
                  {task.due_date || "All day"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
