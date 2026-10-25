"use client";

import React, { useState } from "react";
import {
  ConversationItem,
  MessageItem,
  ModelOption,
} from "@/lib/api-client";
import { ChatView } from "@/features/chat/chat-view";
import { ConversationList } from "@/features/conversations/conversation-list";

interface FloatingChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  messages: MessageItem[];
  models: ModelOption[];
  isLoadingMessages: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onModelChange: (provider: string, model: string) => Promise<void>;
}

export function FloatingChatWidget({
  isOpen,
  onToggle,
  conversations,
  selectedId,
  onSelectConversation,
  onCreateNewConversation,
  onDeleteConversation,
  messages,
  models,
  isLoadingMessages,
  onSendMessage,
  onModelChange,
}: FloatingChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  return (
    <>
      {/* 1. Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary-container hover:bg-primary text-on-primary font-semibold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group border border-primary/30"
          title="Open Assistant Chat"
        >
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">chat_spark</span>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-success animate-pulse ring-2 ring-sidebar-bg" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Chat with AI</span>
          <span className="material-symbols-outlined text-[16px] text-on-primary/70 group-hover:rotate-12 transition-transform">
            bolt
          </span>
        </button>
      )}

      {/* 2. Floating Chat Screen Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col overflow-hidden bg-card-surface border border-border-hairline rounded-2xl ${
            isExpanded
              ? "inset-4 sm:inset-6"
              : "bottom-6 right-6 w-full max-w-lg h-[640px] max-h-[90vh]"
          }`}
        >
          {/* Widget Top Controller Bar */}
          <div className="flex items-center justify-between border-b border-border-hairline bg-sidebar-bg/95 px-4 py-2.5 text-xs text-text-secondary select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-elevated-surface transition-colors"
                title={showSidebar ? "Hide conversations list" : "Show conversations list"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showSidebar ? "chevron_left" : "menu"}
                </span>
              </button>
              <div className="flex items-center gap-2 font-semibold text-text-primary">
                <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
                <span>Personal AI Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-elevated-surface transition-colors"
                title={isExpanded ? "Restore floating size" : "Expand chat view"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isExpanded ? "close_fullscreen" : "open_in_full"}
                </span>
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-elevated-surface transition-colors"
                title="Minimize chat to button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Widget Body */}
          <div className="flex-1 flex overflow-hidden">
            {showSidebar && (
              <div className="w-56 border-r border-border-hairline flex-shrink-0 bg-sidebar-bg">
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedId}
                  onSelect={onSelectConversation}
                  onCreateNew={onCreateNewConversation}
                  onDelete={onDeleteConversation}
                />
              </div>
            )}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-app-bg">
              <ChatView
                conversation={selectedConversation}
                messages={messages}
                models={models}
                isLoading={isLoadingMessages}
                onSendMessage={onSendMessage}
                onModelChange={onModelChange}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
