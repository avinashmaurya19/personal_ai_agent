"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  api,
  ConversationItem,
  MessageItem,
  ModelOption,
  TaskItem,
  EmailThreadItem,
  CalendarEventItem,
  PendingActionItem,
  DocumentItem,
  MemoryItem,
  ResearchReportItem,
} from "@/lib/api-client";
import { AppSidebar, NavViewId } from "@/components/shell/app-sidebar";
import { AppHeader } from "@/components/shell/app-header";
import { StitchDashboard } from "@/features/dashboard/stitch-dashboard";
import { StitchChatView } from "@/features/chat/stitch-chat-view";
import { DocumentsView } from "@/features/documents/documents-view";
import { MemoryView } from "@/features/memory/memory-view";
import { ResearchView } from "@/features/research/research-view";
import { TasksView } from "@/features/tasks/tasks-view";
import { ApprovalsView } from "@/features/approvals/approvals-view";
import { EmailView } from "@/features/email/email-view";
import { SettingsView } from "@/features/settings/settings-view";
import { ConnectedAppsView } from "@/features/integrations/connected-apps-view";
import { ComingSoonView } from "@/features/common/coming-soon-view";
import { COMING_SOON_MODULES } from "@/features/common/coming-soon-config";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import { AuthModal } from "@/features/auth/auth-modal";

function MainDashboard() {
  const [activeView, setActiveView] = useState<NavViewId>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardExternalPrompt, setDashboardExternalPrompt] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved === "true") setIsSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  // --- Backend Data State ---
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [emailThreads, setEmailThreads] = useState<EmailThreadItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingActionItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [researchReports, setResearchReports] = useState<ResearchReportItem[]>([]);

  // --- Chat State ---
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      const [
        tasksData,
        threadsData,
        calData,
        actionsData,
        docsData,
        memsData,
        reportsData,
      ] = await Promise.all([
        api.getTasks().catch(() => []),
        api.getEmailThreads().catch(() => []),
        api.getCalendarEvents().catch(() => []),
        api.getPendingActions().catch(() => []),
        api.getDocuments().catch(() => []),
        api.getMemories().catch(() => []),
        api.getResearchReports().catch(() => []),
      ]);

      setTasks(tasksData);
      setEmailThreads(threadsData);
      setCalendarEvents(calData);
      setPendingActions(actionsData);
      setDocuments(docsData);
      setMemories(memsData);
      setResearchReports(reportsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  }, []);

  const { token } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, [token, loadDashboardData]);

  // Load Models
  useEffect(() => {
    api.getModels()
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, []);

  // Load Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      setError(null);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
      setError("Unable to connect to FastAPI backend. Ensure backend is running on port 8000.");
    }
  }, [selectedId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load Messages for Selected Conversation
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    setIsLoadingMessages(true);
    api.getMessages(selectedId)
      .then((data) => {
        if (isMounted) setMessages(data);
      })
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const handleCreateNewConversation = async () => {
    try {
      const newConv = await api.createConversation();
      setConversations((prev) => [newConv, ...prev]);
      setSelectedId(newConv.id);
      setMessages([]);
      setActiveView("ai-assistant");
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 1. Immediately update UI state
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (selectedId === id) {
        const nextId = remaining.length > 0 ? remaining[0].id : null;
        setSelectedId(nextId);
        if (!nextId) setMessages([]);
      }
      return remaining;
    });

    // 2. Perform backend delete
    try {
      await api.deleteConversation(id);
    } catch (err: any) {
      if (!err?.message?.includes("404")) {
        console.error("Failed to delete conversation:", err);
      }
    }
  };

  const handleSendMessage = async (content: string, explicitConvId?: string) => {
    const convId = explicitConvId || selectedId;
    if (!convId) return;

    const tempUserMessage: MessageItem = {
      id: "temp-" + Date.now(),
      conversation_id: convId,
      role: "user",
      content,
      token_count: content.split(" ").length,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsGenerating(true);

    try {
      const assistantReply = await api.sendMessage(convId, content);
      setMessages((prev) => [...prev, assistantReply]);
      fetchConversations();
      loadDashboardData();
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorReply: MessageItem = {
        id: "err-" + Date.now(),
        conversation_id: convId,
        role: "assistant",
        content: `⚠️ Error sending message: ${err.message || "Failed to reach backend"}`,
        token_count: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModelChange = async (provider: string, model: string) => {
    if (!selectedId) return;
    try {
      const updated = await api.updateConversationModel(selectedId, provider, model);
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? updated : c))
      );
    } catch (err) {
      console.error("Failed to update conversation model:", err);
    }
  };

  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const updated = await api.updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleQuickAddTask = async (title: string, priority: "low" | "medium" | "high" | "urgent") => {
    try {
      const created = await api.createTask({ title, priority });
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleDecideAction = async (actionId: string, approved: boolean) => {
    try {
      await api.decideAction(actionId, approved);
      setPendingActions((prev) => prev.filter((a) => a.id !== actionId));
      loadDashboardData();
    } catch (err) {
      console.error("Failed to decide action:", err);
    }
  };

  const handleAskAssistantFromHeader = async (prompt: string) => {
    if (activeView === "overview") {
      setDashboardExternalPrompt(prompt);
      return;
    }

    try {
      const newConv = await api.createConversation({
        title: prompt.length > 35 ? prompt.slice(0, 35) + "..." : prompt,
      });
      setConversations((prev) => [newConv, ...prev]);
      setSelectedId(newConv.id);
      setActiveView("ai-assistant");
      await handleSendMessage(prompt, newConv.id);
    } catch (err) {
      console.error("Failed to ask assistant from header:", err);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080B14] text-text-primary">
      {/* 1. Persistent Left Navigation Sidebar (Collapsible) */}
      <AppSidebar
        activeView={activeView}
        onSelectView={setActiveView}
        onNewChat={handleCreateNewConversation}
        pendingApprovalsCount={pendingActions.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* 2. Main Page Column with Flexible Header */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar with Universal Search */}
        <AppHeader
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tasks={tasks}
          documents={documents}
          conversations={conversations}
          onNavigateToView={setActiveView}
          onSelectConversation={setSelectedId}
          onAskAssistant={handleAskAssistantFromHeader}
        />

        {/* Global Connection Warning */}
        {error && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs text-amber-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Active View Container */}
        <main
          className={`flex-1 min-w-0 relative ${
            activeView === "ai-assistant"
              ? "p-0 overflow-hidden"
              : "overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8"
          }`}
        >
          {activeView === "overview" && (
            <div className="pt-4 max-w-6xl mx-auto">
              <StitchDashboard
                tasks={tasks}
                documents={documents}
                conversations={conversations}
                onNewConversation={handleCreateNewConversation}
                onOpenTasks={() => setActiveView("tasks")}
                onOpenCalendar={() => setActiveView("calendar")}
                onOpenDocs={() => setActiveView("documents")}
                onOpenEmails={() => setActiveView("email")}
                onOpenResearch={() => setActiveView("research")}
                onToggleTask={handleToggleTask}
                onNavigateToChat={(convId) => {
                  setSelectedId(convId);
                  setActiveView("ai-assistant");
                }}
                onRefreshData={() => {
                  loadDashboardData();
                  fetchConversations();
                }}
                externalPrompt={dashboardExternalPrompt}
                onClearExternalPrompt={() => setDashboardExternalPrompt(null)}
              />
            </div>
          )}

          {activeView === "ai-assistant" && (
            <StitchChatView
              conversations={conversations}
              selectedId={selectedId}
              onSelectConversation={setSelectedId}
              onCreateNewConversation={handleCreateNewConversation}
              onDeleteConversation={handleDeleteConversation}
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              isGenerating={isGenerating}
              onSendMessage={handleSendMessage}
              pendingActions={pendingActions}
              onDecideAction={handleDecideAction}
            />
          )}

          {activeView === "tasks" && (
            <div className="pt-4 max-w-4xl mx-auto">
              <TasksView
                tasks={tasks}
                onRefresh={loadDashboardData}
                onToggleTask={handleToggleTask}
                onQuickAddTask={handleQuickAddTask}
              />
            </div>
          )}

          {activeView === "documents" && (
            <div className="pt-4 max-w-5xl mx-auto">
              <DocumentsView documents={documents} onRefresh={loadDashboardData} />
            </div>
          )}

          {activeView === "research" && (
            <div className="pt-4 max-w-5xl mx-auto">
              <ResearchView reports={researchReports} onRefresh={loadDashboardData} />
            </div>
          )}

          {activeView === "memory" && (
            <div className="pt-4 max-w-4xl mx-auto">
              <MemoryView memories={memories} onRefresh={loadDashboardData} />
            </div>
          )}

          {activeView === "approvals" && (
            <div className="pt-4 max-w-4xl mx-auto">
              <ApprovalsView pendingActions={pendingActions} onDecideAction={handleDecideAction} />
            </div>
          )}

          {activeView === "email" && (
            <div className="pt-4 max-w-6xl mx-auto">
              <EmailView emailThreads={emailThreads} onRefresh={loadDashboardData} />
            </div>
          )}

          {(activeView === "model-providers" || activeView === "settings") && (
            <div className="pt-4 max-w-5xl mx-auto">
              <SettingsView models={models} />
            </div>
          )}

          {activeView === "connected-apps" && (
            <div className="pt-4 max-w-5xl mx-auto">
              <ConnectedAppsView />
            </div>
          )}

          {COMING_SOON_MODULES[activeView] && (
            <div className="pt-4 max-w-3xl mx-auto">
              <ComingSoonView
                moduleName={COMING_SOON_MODULES[activeView].moduleName}
                icon={COMING_SOON_MODULES[activeView].icon}
                description={COMING_SOON_MODULES[activeView].description}
                upcomingFeatures={COMING_SOON_MODULES[activeView].upcomingFeatures}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        onSuccess={() => {
          loadDashboardData();
          fetchConversations();
        }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
