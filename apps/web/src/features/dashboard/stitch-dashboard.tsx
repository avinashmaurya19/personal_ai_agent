"use client";

import React from "react";
import {
  TaskItem,
  EmailThreadItem,
  CalendarEventItem,
  PendingActionItem,
  DocumentItem,
  MemoryItem,
  ConversationItem,
} from "@/lib/api-client";
import { DashboardBanner } from "./components/dashboard-banner";
import { DashboardStatCards } from "./components/dashboard-stat-cards";
import { DashboardPriorities } from "./components/dashboard-priorities";
import { DashboardAgenda } from "./components/dashboard-agenda";
import { DashboardActivity } from "./components/dashboard-activity";

interface StitchDashboardProps {
  tasks: TaskItem[];
  emailThreads: EmailThreadItem[];
  calendarEvents: CalendarEventItem[];
  pendingActions: PendingActionItem[];
  documents: DocumentItem[];
  memories: MemoryItem[];
  conversations: ConversationItem[];
  onNewConversation: () => void;
  onOpenTasks: () => void;
  onOpenCalendar: () => void;
  onOpenDocs: () => void;
  onOpenMemory: () => void;
  onToggleTask: (task: TaskItem) => Promise<void>;
  onQuickAddTask: (title: string, priority: "low" | "medium" | "high" | "urgent") => Promise<void>;
  onDecideAction: (actionId: string, approved: boolean) => Promise<void>;
}

export function StitchDashboard({
  tasks,
  calendarEvents,
  documents,
  memories,
  conversations,
  onNewConversation,
  onOpenTasks,
  onOpenCalendar,
  onOpenDocs,
  onOpenMemory,
  onToggleTask,
  onQuickAddTask,
}: StitchDashboardProps) {
  return (
    <div className="flex flex-col w-full pb-20 select-none">
      {/* 1. Command Desk / Welcome Banner & Quick Action Launchpad */}
      <DashboardBanner
        onNewConversation={onNewConversation}
        onOpenTasks={onOpenTasks}
        onOpenDocs={onOpenDocs}
        onOpenMemory={onOpenMemory}
        memoryCount={memories.length}
      />

      {/* 2. Overview Statistics Cards */}
      <DashboardStatCards
        tasks={tasks}
        calendarEvents={calendarEvents}
        documents={documents}
        memories={memories}
        onOpenTasks={onOpenTasks}
        onOpenCalendar={onOpenCalendar}
        onOpenDocs={onOpenDocs}
        onOpenMemory={onOpenMemory}
      />

      {/* 3. Main Grid: Two Balanced Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <DashboardPriorities
          tasks={tasks}
          onOpenTasks={onOpenTasks}
          onToggleTask={onToggleTask}
          onQuickAddTask={onQuickAddTask}
        />
        <DashboardAgenda
          calendarEvents={calendarEvents}
          onOpenCalendar={onOpenCalendar}
        />
      </div>

      {/* 4. Bottom Section: Recent Multi-stream Activity Log */}
      <DashboardActivity
        conversations={conversations}
        documents={documents}
      />
    </div>
  );
}
