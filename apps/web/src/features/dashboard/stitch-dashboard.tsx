"use client";

import React from "react";
import {
  TaskItem,
  DocumentItem,
  ConversationItem,
} from "@/lib/api-client";
import { MountainBackdrop } from "./components/mountain-backdrop";
import { HeroGreeting } from "./components/hero-greeting";
import { AiPromptCenter } from "./components/ai-prompt-center";
import { TodayWidget } from "./components/today-widget";
import { RecentDocumentsWidget } from "./components/recent-documents-widget";

interface StitchDashboardProps {
  tasks: TaskItem[];
  documents: DocumentItem[];
  conversations: ConversationItem[];
  onNewConversation: () => void;
  onOpenTasks: () => void;
  onOpenCalendar: () => void;
  onOpenDocs: () => void;
  onOpenEmails: () => void;
  onOpenResearch: () => void;
  onToggleTask: (task: TaskItem) => Promise<void>;
  onSendPrompt: (prompt: string, sources?: string[]) => void;
}

export function StitchDashboard({
  tasks,
  documents,
  onOpenTasks,
  onOpenCalendar,
  onOpenDocs,
  onOpenEmails,
  onOpenResearch,
  onToggleTask,
  onSendPrompt,
}: StitchDashboardProps) {
  return (
    <div className="relative w-full min-h-[calc(100vh-3.5rem)] select-none pb-12">
      {/* Mountain Twilight Panorama Backdrop */}
      <MountainBackdrop />

      {/* Main Content Grid matching screenshot */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column (Main Hero & AI Command Area: 8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Greeting & 5 Action Cards */}
          <HeroGreeting
            onCheckEmails={onOpenEmails}
            onAddTask={onOpenTasks}
            onSummarizeDoc={onOpenDocs}
            onPlanTrip={() =>
              onSendPrompt("Plan a 4-day weekend trip with travel itinerary, hotels, and schedule.")
            }
            onGenerateReport={onOpenResearch}
          />

          {/* AI Prompt Input Center with Source Chips & Suggestions */}
          <AiPromptCenter onSendPrompt={onSendPrompt} />
        </div>

        {/* Right Column (Widgets: 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Today's Agenda & Daily Briefing */}
          <TodayWidget
            tasks={tasks}
            onToggleTask={onToggleTask}
            onOpenTasks={onOpenTasks}
            onOpenDailyBriefing={() =>
              onSendPrompt("Generate a comprehensive daily briefing covering today's priorities and schedule.")
            }
          />

          {/* Recent Documents Widget */}
          <RecentDocumentsWidget
            documents={documents}
            onViewAll={onOpenDocs}
          />
        </div>
      </div>
    </div>
  );
}
