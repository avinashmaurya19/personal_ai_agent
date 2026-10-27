"use client";

import React, { useState, useEffect } from "react";
import {
  api,
  TaskItem,
  DocumentItem,
  ConversationItem,
} from "@/lib/api-client";
import { MountainBackdrop } from "./components/mountain-backdrop";
import { HeroGreeting } from "./components/hero-greeting";
import { AiPromptCenter } from "./components/ai-prompt-center";
import { TodayWidget } from "./components/today-widget";
import { RecentDocumentsWidget } from "./components/recent-documents-widget";
import {
  DashboardInlineAssistant,
  InlineTurn,
} from "./components/dashboard-inline-assistant";

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
  onNavigateToChat: (conversationId: string) => void;
  onRefreshData?: () => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
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
  onNavigateToChat,
  onRefreshData,
  externalPrompt,
  onClearExternalPrompt,
}: StitchDashboardProps) {
  const [inlineSession, setInlineSession] = useState<{
    conversationId: string;
    turns: InlineTurn[];
    isGenerating: boolean;
    error: string | null;
  } | null>(null);

  const handleExecutePrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    let convId = inlineSession?.conversationId;

    try {
      if (!convId) {
        const title = promptText.length > 35 ? promptText.slice(0, 35) + "..." : promptText;
        const newConv = await api.createConversation({ title });
        convId = newConv.id;
      }

      const userTurn: InlineTurn = {
        id: "turn-" + Date.now(),
        role: "user",
        content: promptText,
      };

      setInlineSession((prev) => ({
        conversationId: convId!,
        turns: prev ? [...prev.turns, userTurn] : [userTurn],
        isGenerating: true,
        error: null,
      }));

      const reply = await api.sendMessage(convId, promptText);

      setInlineSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          turns: [
            ...prev.turns,
            { id: reply.id, role: "assistant", content: reply.content },
          ],
          isGenerating: false,
          error: null,
        };
      });

      // Refresh tasks, documents, and notifications on the dashboard
      onRefreshData?.();
    } catch (err: any) {
      console.error("Dashboard assistant execution error:", err);
      setInlineSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          isGenerating: false,
          error: err.message || "Failed to reach AI coordinator. Please try again.",
        };
      });
    }
  };

  // Listen to external prompts (e.g. from top universal search bar)
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleExecutePrompt(externalPrompt.trim());
      onClearExternalPrompt?.();
    }
  }, [externalPrompt]);

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
              handleExecutePrompt("Plan a 4-day weekend trip with travel itinerary, hotels, and schedule.")
            }
            onGenerateReport={onOpenResearch}
          />

          {/* AI Prompt Input Center with Source Chips & Suggestions */}
          <AiPromptCenter onSendPrompt={(text) => handleExecutePrompt(text)} />

          {/* Inline Assistant Response Expansion */}
          {inlineSession && (
            <DashboardInlineAssistant
              turns={inlineSession.turns}
              isGenerating={inlineSession.isGenerating}
              error={inlineSession.error}
              conversationId={inlineSession.conversationId}
              onOpenInChat={onNavigateToChat}
              onClose={() => setInlineSession(null)}
              onSendFollowUp={handleExecutePrompt}
            />
          )}
        </div>

        {/* Right Column (Widgets: 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Today's Agenda & Daily Briefing */}
          <TodayWidget
            tasks={tasks}
            onToggleTask={onToggleTask}
            onOpenTasks={onOpenTasks}
            onOpenDailyBriefing={() =>
              handleExecutePrompt("Generate a comprehensive daily briefing covering today's priorities and schedule.")
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
