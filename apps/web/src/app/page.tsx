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
import { FloatingChatWidget } from "@/features/chat/floating-chat-widget";
import { DocumentsView } from "@/features/documents/documents-view";
import { MemoryView } from "@/features/memory/memory-view";
import { ResearchView } from "@/features/research/research-view";
import { TasksView } from "@/features/tasks/tasks-view";
import { ApprovalsView } from "@/features/approvals/approvals-view";
import { EmailView } from "@/features/email/email-view";
import { SettingsView } from "@/features/settings/settings-view";
import { ConnectedAppsView } from "@/features/integrations/connected-apps-view";
import { AuthProvider, useAuth } from "@/features/auth/auth-context";
import { AuthModal } from "@/features/auth/auth-modal";

function MainDashboard() {
  const [activeView, setActiveView] = useState<NavViewId>("overview");
  const [searchQuery, setSearchQuery] = useState("");

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
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/conversations/${id}`, {
        method: "DELETE",
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setSelectedId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedId) return;

    const tempUserMessage: MessageItem = {
      id: "temp-" + Date.now(),
      conversation_id: selectedId,
      role: "user",
      content,
      token_count: content.split(" ").length,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const assistantReply = await api.sendMessage(selectedId, content);
      setMessages((prev) => [...prev, assistantReply]);
      fetchConversations();
      loadDashboardData();
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorReply: MessageItem = {
        id: "err-" + Date.now(),
        conversation_id: selectedId,
        role: "assistant",
        content: `⚠️ Error sending message: ${err.message || "Failed to reach backend"}`,
        token_count: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app-bg text-text-primary">
      {/* 1. Persistent Left Navigation Sidebar */}
      <AppSidebar
        activeView={activeView}
        onSelectView={setActiveView}
        pendingApprovalsCount={pendingActions.length}
      />

      {/* 2. Main Page Column with Fixed Header */}
      <div className="pl-64 flex-1 flex flex-col h-full overflow-hidden">
        {/* Fixed Top Navbar */}
        <AppHeader
          activeView={activeView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadNotificationsCount={pendingActions.length}
        />

        {/* Global Connection Warning */}
        {error && (
          <div className="pt-14 bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs text-amber-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Active View Container */}
        <main className={`relative ${error ? "pt-2" : "pt-14"} flex-1 overflow-y-auto px-6 lg:px-8`}>
          <div className="pt-6 max-w-7xl mx-auto">
            {activeView === "overview" && (
              <StitchDashboard
                tasks={tasks}
                emailThreads={emailThreads}
                calendarEvents={calendarEvents}
                pendingActions={pendingActions}
                documents={documents}
                memories={memories}
                conversations={conversations}
                onNewConversation={() => setActiveView("ai-assistant")}
                onOpenTasks={() => setActiveView("tasks")}
                onOpenCalendar={() => setActiveView("calendar")}
                onOpenDocs={() => setActiveView("documents")}
                onOpenMemory={() => setActiveView("memory")}
                onToggleTask={handleToggleTask}
                onQuickAddTask={handleQuickAddTask}
                onDecideAction={handleDecideAction}
              />
            )}

            {activeView === "ai-assistant" && (
              <StitchChatView
                conversations={conversations}
                selectedId={selectedId}
                onSelectConversation={setSelectedId}
                onCreateNewConversation={handleCreateNewConversation}
                onDeleteConversation={handleDeleteConversation}
                messages={messages}
                models={models}
                isLoadingMessages={isLoadingMessages}
                onSendMessage={handleSendMessage}
                onModelChange={handleModelChange}
                pendingActions={pendingActions}
                onDecideAction={handleDecideAction}
              />
            )}

            {activeView === "tasks" && (
              <TasksView
                tasks={tasks}
                onRefresh={loadDashboardData}
                onToggleTask={handleToggleTask}
                onQuickAddTask={handleQuickAddTask}
              />
            )}

            {activeView === "calendar" && (
              <div className="py-6 space-y-4">
                <h1 className="text-2xl font-bold tracking-tight">Calendar &amp; Agenda</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calendarEvents.map((evt) => (
                    <div key={evt.id} className="p-4 rounded-xl bg-card-surface border border-border-hairline space-y-2">
                      <span className="text-xs font-mono text-text-tertiary">{new Date(evt.start_time).toLocaleString()}</span>
                      <h3 className="text-sm font-semibold">{evt.title}</h3>
                      <p className="text-xs text-text-secondary">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === "documents" && (
              <DocumentsView documents={documents} onRefresh={loadDashboardData} />
            )}

            {activeView === "research" && (
              <ResearchView reports={researchReports} onRefresh={loadDashboardData} />
            )}

            {activeView === "memory" && (
              <MemoryView memories={memories} onRefresh={loadDashboardData} />
            )}

            {activeView === "approvals" && (
              <ApprovalsView pendingActions={pendingActions} onDecideAction={handleDecideAction} />
            )}

            {activeView === "email" && (
              <EmailView emailThreads={emailThreads} onRefresh={loadDashboardData} />
            )}

            {(activeView === "model-providers" || activeView === "settings") && (
              <SettingsView models={models} />
            )}

            {activeView === "connected-apps" && (
              <ConnectedAppsView />
            )}

            {(activeView === "notes" || activeView === "workflows" || activeView === "activity-history" || activeView === "mcp-servers") && (
              <div className="py-12 text-center text-xs text-text-tertiary bg-card-surface border border-border-hairline rounded-2xl">
                <span className="material-symbols-outlined text-[32px] text-text-secondary mb-2 block">
                  construction
                </span>
                <h3 className="text-sm font-semibold text-text-primary">
                  {activeView.replace("-", " ").toUpperCase()}
                </h3>
                <p className="text-xs text-text-tertiary max-w-sm mx-auto mt-1">
                  Module connected to autonomous orchestrator. Active and ready.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. Floating Chat Button & Modal Widget */}
      <FloatingChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        conversations={conversations}
        selectedId={selectedId}
        onSelectConversation={setSelectedId}
        onCreateNewConversation={handleCreateNewConversation}
        onDeleteConversation={handleDeleteConversation}
        messages={messages}
        models={models}
        isLoadingMessages={isLoadingMessages}
        onSendMessage={handleSendMessage}
        onModelChange={handleModelChange}
      />
      {/* 4. Global Auth Modal */}
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
