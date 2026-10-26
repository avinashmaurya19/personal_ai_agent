"use client";

import React from "react";

export type GmailFolder = "inbox" | "starred" | "sent" | "drafts" | "ai_triaged";

interface GmailSidebarProps {
  currentFolder: GmailFolder;
  onSelectFolder: (folder: GmailFolder) => void;
  inboxCount: number;
  starredCount: number;
  onOpenCompose: () => void;
  googleConnected: boolean;
  googleEmail: string | null;
}

export function GmailSidebar({
  currentFolder,
  onSelectFolder,
  inboxCount,
  starredCount,
  onOpenCompose,
  googleConnected,
  googleEmail,
}: GmailSidebarProps) {
  const folders: { id: GmailFolder; label: string; icon: string; count?: number }[] = [
    { id: "inbox", label: "Inbox", icon: "inbox", count: inboxCount },
    { id: "starred", label: "Starred", icon: "star", count: starredCount > 0 ? starredCount : undefined },
    { id: "sent", label: "Sent", icon: "send" },
    { id: "drafts", label: "Drafts", icon: "drafts" },
    { id: "ai_triaged", label: "AI Triaged", icon: "smart_toy" },
  ];

  return (
    <div className="w-56 flex-shrink-0 flex flex-col justify-between p-3 select-none border-r border-border-hairline bg-card-surface/50">
      <div className="space-y-4">
        {/* Gmail-style Compose Button */}
        <button
          onClick={onOpenCompose}
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all group"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
            edit
          </span>
          <span className="font-semibold tracking-wide">Compose</span>
        </button>

        {/* Folders List */}
        <nav className="space-y-1">
          {folders.map((f) => {
            const isActive = currentFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFolder(f.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-text-secondary hover:bg-elevated-surface hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isActive ? "text-primary" : "text-text-tertiary"
                    }`}
                  >
                    {f.icon}
                  </span>
                  <span>{f.label}</span>
                </div>
                {f.count !== undefined && f.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive
                        ? "bg-primary text-on-primary font-bold"
                        : "bg-elevated-surface text-text-tertiary"
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account Info Pill */}
      <div className="p-3 rounded-xl bg-elevated-surface/80 border border-border-hairline text-[11px] space-y-1">
        <div className="flex items-center gap-2 text-text-tertiary">
          <span className="material-symbols-outlined text-[14px]">account_circle</span>
          <span className="font-medium">Active Mailbox</span>
        </div>
        <p className="font-mono text-text-primary text-[10px] truncate" title={googleEmail || "Mailbox"}>
          {googleConnected && googleEmail ? googleEmail : "Personal AI Mailbox"}
        </p>
      </div>
    </div>
  );
}
