"use client";

import React from "react";
import { TaskItem } from "@/lib/api-client";

interface PriorityChartProps {
  tasks: TaskItem[];
}

export function PriorityChart({ tasks }: PriorityChartProps) {
  const counts = {
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  const total = tasks.length || 1;

  const items = [
    { label: "Urgent", count: counts.urgent, color: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/30" },
    { label: "High", count: counts.high, color: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" },
    { label: "Medium", count: counts.medium, color: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/30" },
    { label: "Low", count: counts.low, color: "bg-slate-500", text: "text-slate-400", border: "border-slate-500/30" },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Task Priority Distribution
        </h3>
        <span className="text-[11px] text-slate-400">{tasks.length} total tasks</span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800/80">
        {items.map((item) => {
          const widthPct = (item.count / total) * 100;
          if (widthPct === 0) return null;
          return (
            <div
              key={item.label}
              className={`h-full ${item.color} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
              style={{ width: `${widthPct}%` }}
              title={`${item.label}: ${item.count} (${Math.round(widthPct)}%)`}
            />
          );
        })}
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div
              key={item.label}
              className={`rounded-xl bg-slate-950/60 border ${item.border} p-2.5 flex flex-col justify-between`}
            >
              <div className="flex items-center space-x-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-[11px] font-medium text-slate-300">{item.label}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-base font-bold ${item.text}`}>{item.count}</span>
                <span className="text-[10px] text-slate-500">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
