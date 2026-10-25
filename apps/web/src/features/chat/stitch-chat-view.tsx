"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ConversationItem,
  MessageItem,
  ModelOption,
  PendingActionItem,
} from "@/lib/api-client";

interface StitchChatViewProps {
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
  pendingActions?: PendingActionItem[];
  onDecideAction?: (actionId: string, approved: boolean) => Promise<void>;
}

export function StitchChatView({
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
  pendingActions = [],
  onDecideAction,
}: StitchChatViewProps) {
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText.trim();
    setInputText("");
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || "Untitled conversation").toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-app-bg text-text-primary select-none">
      {/* 1. LEFT PANE: Conversation History Bar */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col justify-between bg-sidebar-bg/95 border-r border-border-hairline">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & New Chat Button */}
          <div className="p-4 flex flex-col gap-3 border-b border-border-hairline">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-text-tertiary">
                Sessions
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-elevated-surface text-text-secondary border border-border-hairline">
                {conversations.length} threads
              </span>
            </div>
            <button
              onClick={onCreateNewConversation}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-primary-container text-on-primary text-xs font-semibold shadow-sm hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>New Conversation</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-on-primary/20 text-on-primary">
                ⌘N
              </kbd>
            </button>
            <div className="relative flex items-center mt-1">
              <span className="material-symbols-outlined absolute left-2.5 text-text-tertiary text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter threads..."
                className="w-full h-8 pl-8 pr-3 bg-elevated-surface rounded-lg text-xs text-text-primary placeholder:text-text-tertiary border border-border-hairline focus:border-border-active focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* History Items Scrollable */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-tertiary">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className={`group relative flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-elevated-surface border-border-active shadow-sm"
                        : "border-transparent hover:bg-elevated-surface/50 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r bg-primary"></span>
                    )}
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        className={`material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 ${
                          isSelected ? "text-primary" : "text-text-tertiary"
                        }`}
                      >
                        chat_bubble
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs truncate ${
                            isSelected ? "font-semibold text-text-primary" : "text-text-secondary"
                          }`}
                        >
                          {c.title || "Untitled Session"}
                        </p>
                        <p className="text-[10px] text-text-tertiary truncate mt-0.5 font-mono">
                          {c.active_model_name} &bull; {new Date(c.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => onDeleteConversation(c.id, e)}
                      aria-label="Delete"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-opacity rounded text-text-tertiary"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footnote Status in Sidebar */}
          <div className="p-3 bg-surface-container-lowest border-t border-border-hairline flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                MCP Tool Gateway Active
              </span>
              <span className="font-mono text-text-tertiary">4 Tools</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. RIGHT / MAIN CHAT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full bg-app-bg min-w-0 overflow-hidden relative">
        {/* Context Bar */}
        <header className="h-14 px-6 bg-sidebar-bg/70 border-b border-border-hairline flex items-center justify-between flex-shrink-0 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-semibold text-text-primary truncate">
              {activeConversation?.title || "New Chat Session"}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-subtle text-primary border border-primary/20">
              Active Session
            </span>
            <div className="h-4 w-px bg-border-hairline mx-1"></div>
            {/* Model Selector */}
            <select
              value={`${activeConversation?.active_model_provider || "ollama"}:${activeConversation?.active_model_name || "llama3.2"}`}
              onChange={(e) => {
                const [provider, model] = e.target.value.split(":");
                onModelChange(provider, model);
              }}
              className="bg-elevated-surface text-text-secondary text-xs rounded-lg px-2.5 py-1 border border-border-hairline focus:border-border-active focus:outline-none"
            >
              {models.map((m) => (
                <option key={`${m.provider}-${m.id}`} value={`${m.provider}:${m.id}`}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-elevated-surface text-xs font-medium text-text-secondary border border-border-hairline">
              <span className="material-symbols-outlined text-primary text-[15px]">psychology</span>
              <span>Memory Recall Active</span>
            </div>
          </div>
        </header>

        {/* Messages Transcript */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="max-w-[840px] mx-auto flex flex-col gap-6 pb-24">
            {messages.length === 0 ? (
              <div className="my-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                </div>
                <h3 className="text-base font-semibold text-text-primary">
                  How can I assist you today, Avinash?
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  Ask questions, summarize documents, plan projects, or query your calendar and tasks.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${
                      isUser ? "self-end max-w-[85%] flex-row-reverse" : "self-start max-w-[90%]"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ring-1 ring-border-hairline ${
                        isUser
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-gradient-to-tr from-primary-container to-secondary text-on-primary"
                      }`}
                    >
                      {isUser ? "AM" : <span className="material-symbols-outlined text-[16px]">smart_toy</span>}
                    </div>

                    {/* Bubble */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <div
                        className={`flex items-center gap-2 text-[10px] text-text-tertiary ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="font-medium text-text-secondary">
                          {isUser ? "Avinash" : "Personal AI"}
                        </span>
                        <span>&bull;</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                          isUser
                            ? "bg-elevated-surface text-text-primary border-border-active rounded-tr-sm"
                            : "bg-card-surface text-text-primary border-border-hairline rounded-tl-sm shadow-md"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Stepper Card for Pending Actions / Execution */}
            {pendingActions.length > 0 && onDecideAction && (
              <div className="bg-card-surface border border-warning/40 rounded-2xl overflow-hidden shadow-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <div className="flex items-center gap-2 text-warning text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">security</span>
                    <span>High Consequence Boundary: Authorization Required</span>
                  </div>
                  <span className="text-[10px] text-text-tertiary uppercase">Human in the Loop</span>
                </div>
                {pendingActions.map((action) => (
                  <div key={action.id} className="space-y-2">
                    <p className="text-xs text-text-secondary">
                      Action <code className="text-primary font-mono">{action.action_type}</code> requested with params:
                    </p>
                    <pre className="p-2 rounded bg-elevated-surface text-[11px] font-mono text-text-primary overflow-x-auto">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onDecideAction(action.id, true)}
                        className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>Approve Execution</span>
                      </button>
                      <button
                        onClick={() => onDecideAction(action.id, false)}
                        className="px-3 py-1.5 rounded-lg bg-elevated-surface text-text-secondary hover:text-text-primary text-xs font-medium border border-border-hairline transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-text-tertiary animate-pulse">
                <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                <span>Synthesizing neural context and generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Composer */}
        <div className="p-4 bg-sidebar-bg/90 border-t border-border-hairline">
          <form
            onSubmit={handleSend}
            className="max-w-[840px] mx-auto bg-elevated-surface border border-border-hairline rounded-2xl p-2 flex items-center gap-2 focus-within:border-border-active transition-colors shadow-lg"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything, query documents, or issue autonomous tasks..."
              className="flex-1 bg-transparent px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="h-9 px-4 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
