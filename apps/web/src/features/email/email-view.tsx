"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { EmailThreadItem, GoogleConnectionStatus, api } from "@/lib/api-client";
import { GmailHeader } from "./components/gmail-header";
import { GmailSidebar, GmailFolder } from "./components/gmail-sidebar";
import { GmailThreadList } from "./components/gmail-thread-list";
import { GmailMessageDetail } from "./components/gmail-message-detail";
import { GmailComposeModal } from "./components/gmail-compose-modal";

interface EmailViewProps {
  emailThreads: EmailThreadItem[];
  onRefresh: () => void;
}

export function EmailView({ emailThreads, onRefresh }: EmailViewProps) {
  const [selectedThread, setSelectedThread] = useState<EmailThreadItem | null>(null);
  const [currentFolder, setCurrentFolder] = useState<GmailFolder>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [starredThreadIds, setStarredThreadIds] = useState<Set<string>>(new Set());
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<GoogleConnectionStatus | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Check Google OAuth status
  const checkGoogleStatus = useCallback(async () => {
    try {
      const status = await api.getGoogleStatus();
      setGoogleStatus(status);
    } catch {
      setGoogleStatus({
        connected: false,
        email: null,
        scopes: [],
        expires_at: null,
      });
    }
  }, []);

  useEffect(() => {
    checkGoogleStatus();

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("google_connected") === "true") {
        setNotification({
          type: "success",
          text: "Google account successfully connected! Gmail access active.",
        });
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        checkGoogleStatus();
        onRefresh();
      } else if (urlParams.get("google_error")) {
        setNotification({
          type: "error",
          text: `Google connection failed: ${urlParams.get("google_error")}`,
        });
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [checkGoogleStatus, onRefresh]);

  const handleConnectGoogle = async () => {
    try {
      const res = await api.getGoogleAuthUrl();
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Failed to initiate Google authorization.",
      });
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!window.confirm("Are you sure you want to disconnect your Google account?")) return;
    try {
      await api.disconnectGoogle();
      setNotification({ type: "info", text: "Google account disconnected." });
      await checkGoogleStatus();
      onRefresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Failed to disconnect Google account.",
      });
    }
  };

  const handleSyncGmail = async () => {
    setIsSyncing(true);
    try {
      const result = await api.syncGmail(15);
      setNotification({
        type: "success",
        text: `Sync complete: ${result.synced_count} emails synced from Gmail!`,
      });
      onRefresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        text: err.message || "Failed to sync Gmail messages.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleStar = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  };

  const handleMarkRead = async (threadId: string) => {
    try {
      await api.markThreadRead(threadId);
      onRefresh();
    } catch (err) {
      console.error("Failed to mark thread read:", err);
    }
  };

  // Filter threads based on folder and search query
  const filteredThreads = useMemo(() => {
    return emailThreads.filter((t) => {
      // 1. Folder filter
      if (currentFolder === "starred" && !starredThreadIds.has(t.thread_id)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSender = t.last_sender.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        const matchesSnippet = t.snippet.toLowerCase().includes(q);
        if (!matchesSender && !matchesSubject && !matchesSnippet) {
          return false;
        }
      }

      return true;
    });
  }, [emailThreads, currentFolder, starredThreadIds, searchQuery]);

  const unreadCount = useMemo(() => {
    return emailThreads.filter((t) => t.has_unread).length;
  }, [emailThreads]);

  return (
    <div className="flex flex-col w-full pb-16 select-none">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between border shadow-sm ${
            notification.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : notification.type === "error"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">
              {notification.type === "success"
                ? "check_circle"
                : notification.type === "error"
                ? "error"
                : "info"}
            </span>
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-text-tertiary hover:text-text-primary ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Gmail App Shell */}
      <div className="rounded-2xl border border-border-hairline bg-card-surface shadow-2xl overflow-hidden flex flex-col min-h-[640px]">
        {/* Top Gmail Header Bar */}
        <GmailHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          googleStatus={googleStatus}
          isSyncing={isSyncing}
          onSync={handleSyncGmail}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnectGoogle}
        />

        {/* Lower Two-Column Layout: Sidebar + Message View */}
        <div className="flex flex-1 min-h-[560px] overflow-hidden">
          {/* Left Gmail Navigation Sidebar */}
          <GmailSidebar
            currentFolder={currentFolder}
            onSelectFolder={(f) => {
              setCurrentFolder(f);
              setSelectedThread(null);
            }}
            inboxCount={unreadCount}
            starredCount={starredThreadIds.size}
            onOpenCompose={() => setIsComposeOpen(true)}
            googleConnected={!!googleStatus?.connected}
            googleEmail={googleStatus?.email || null}
          />

          {/* Right Main Pane: Thread List or Thread Detail */}
          {selectedThread ? (
            <GmailMessageDetail
              thread={selectedThread}
              onBack={() => setSelectedThread(null)}
              isStarred={starredThreadIds.has(selectedThread.thread_id)}
              onToggleStar={handleToggleStar}
              onRefresh={onRefresh}
            />
          ) : (
            <GmailThreadList
              threads={filteredThreads}
              selectedThreadId={null}
              onSelectThread={(t) => setSelectedThread(t)}
              onRefresh={onRefresh}
              onMarkRead={handleMarkRead}
              starredThreadIds={starredThreadIds}
              onToggleStar={handleToggleStar}
            />
          )}
        </div>
      </div>

      {/* Floating Compose Modal (Dockable Gmail Style) */}
      <GmailComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={() => {
          setNotification({
            type: "success",
            text: "Message draft created successfully!",
          });
          onRefresh();
        }}
      />
    </div>
  );
}
