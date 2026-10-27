"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ConversationItem,
  MessageItem,
  PendingActionItem,
} from "@/lib/api-client";
import { useAuth } from "@/features/auth/auth-context";
import { MarkdownRenderer } from "./components/markdown-renderer";

interface StitchChatViewProps {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  messages: MessageItem[];
  isLoadingMessages: boolean;
  isGenerating?: boolean;
  onSendMessage: (content: string) => Promise<void>;
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
  isLoadingMessages,
  isGenerating = false,
  onSendMessage,
  pendingActions = [],
  onDecideAction,
}: StitchChatViewProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isSendingLocal, setIsSendingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isBusy = isGenerating || isSendingLocal;
  const activeConversation = conversations.find((c) => c.id === selectedId);

  const displayName =
    user?.full_name || (user?.email ? user.email.split("@")[0] : "Avinash");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBusy]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isBusy) return;
    const text = inputText.trim();
    setInputText("");
    setIsSendingLocal(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSendingLocal(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    onSendMessage(prompt);
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || "Untitled conversation")
      .toLowerCase()
      .includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden bg-[#080B14] text-text-primary select-none">
      {/* 1. LEFT PANE: Sessions List */}
      <aside className="w-[270px] flex-shrink-0 flex flex-col justify-between bg-[#090D18] border-r border-white/5">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & New Chat Button */}
          <div className="p-3.5 flex flex-col gap-2.5 border-b border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Conversations
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-400 border border-white/5">
                {conversations.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onCreateNewConversation}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Conversation</span>
            </button>

            {/* Search Filter */}
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter sessions..."
                className="w-full h-8 pl-8 pr-3 bg-white/5 rounded-lg text-xs text-white placeholder:text-slate-500 border border-white/5 focus:outline-none focus:border-indigo-500/40 transition-colors"
              />
            </div>
          </div>

          {/* History Items Scrollable */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
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
                        ? "bg-white/10 border-white/15 text-white shadow-sm"
                        : "border-transparent hover:bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        className={`material-symbols-outlined text-[17px] mt-0.5 flex-shrink-0 ${
                          isSelected ? "text-indigo-400" : "text-slate-500"
                        }`}
                      >
                        chat_bubble
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs truncate ${
                            isSelected
                              ? "font-semibold text-white"
                              : "text-slate-300"
                          }`}
                        >
                          {c.title || "Untitled Session"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {new Date(c.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => onDeleteConversation(c.id, e)}
                      aria-label="Delete session"
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity rounded text-slate-500"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        delete
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footnote Status */}
          <div className="p-3 bg-[#070A12] border-t border-white/5 flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Autonomous Engine Active
            </span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CHAT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full bg-[#080B14] min-w-0 overflow-hidden relative">
        {/* Chat Header */}
        <header className="h-14 px-6 bg-[#090D18]/80 border-b border-white/5 flex items-center justify-between flex-shrink-0 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-semibold text-white tracking-tight truncate">
              {activeConversation?.title || "New Chat Session"}
            </h1>
            {isBusy ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Generating Response...
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Assistant Ready
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-xs font-medium text-slate-300 border border-white/5">
              <span className="material-symbols-outlined text-indigo-400 text-[16px]">
                psychology
              </span>
              <span>Memory Context Active</span>
            </div>
          </div>
        </header>

        {/* Messages Transcript */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6 space-y-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-24">
            {isLoadingMessages ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Loading message history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="my-10 flex flex-col items-center text-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-lg shadow-purple-500/20">
                  <div className="w-full h-full bg-[#0D1424] rounded-[14px] flex items-center justify-center text-indigo-300">
                    <span className="material-symbols-outlined text-[28px]">
                      smart_toy
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    How can I assist you today, {displayName}?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ask questions, query your connected documents, plan daily tasks, or execute autonomous research workflows.
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg mt-2">
                  {[
                    "Summarize my unread emails and top priorities",
                    "Add a new task: Prepare Q4 roadmap review",
                    "Summarize the latest document I uploaded",
                    "Give me a daily briefing for today",
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => handleQuickPrompt(promptText)}
                      className="p-3 text-left rounded-xl bg-[#0D1527]/80 hover:bg-[#131F38]/90 border border-white/5 hover:border-indigo-500/30 text-xs text-slate-200 transition-all shadow-sm"
                    >
                      <span className="line-clamp-2">{promptText}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 w-full ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md ${
                        isUser
                          ? "bg-indigo-600 text-white ring-2 ring-indigo-400/30"
                          : "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-purple-500/20"
                      }`}
                    >
                      {isUser ? (
                        displayName.charAt(0).toUpperCase()
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          smart_toy
                        </span>
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`flex flex-col gap-1.5 max-w-[85%] ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                        <span className="font-semibold text-slate-300">
                          {isUser ? displayName : "AceVertix Assistant"}
                        </span>
                        <span>&bull;</span>
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl leading-relaxed border ${
                          isUser
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-400/20 rounded-tr-sm shadow-md px-4 py-2.5 text-xs sm:text-[13.5px]"
                            : "bg-[#0D1527]/95 text-slate-100 border-white/10 rounded-tl-sm shadow-xl backdrop-blur-md px-5 py-4 text-xs sm:text-[13.5px]"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Stepper Card for Pending Actions / Execution */}
            {pendingActions.length > 0 && onDecideAction && (
              <div className="bg-[#0D1424] border border-amber-500/40 rounded-2xl overflow-hidden shadow-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">
                      security
                    </span>
                    <span>High Consequence Boundary: Authorization Required</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    Human in the Loop
                  </span>
                </div>
                {pendingActions.map((action) => (
                  <div key={action.id} className="space-y-2">
                    <p className="text-xs text-slate-300">
                      Action{" "}
                      <code className="text-indigo-400 font-mono">
                        {action.action_type}
                      </code>{" "}
                      requested with params:
                    </p>
                    <pre className="p-2 rounded bg-black/40 text-[11px] font-mono text-slate-200 overflow-x-auto border border-white/5">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onDecideAction(action.id, true)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          verified
                        </span>
                        <span>Approve Execution</span>
                      </button>
                      <button
                        onClick={() => onDecideAction(action.id, false)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs font-medium border border-white/10 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* In-Flight Response Generator Indicator */}
            {isBusy && (
              <div className="flex items-start gap-3 self-start max-w-2xl animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg shadow-purple-500/25 ring-2 ring-indigo-400/40 animate-pulse">
                  <span className="material-symbols-outlined text-[16px]">
                    smart_toy
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1">
                    <span className="font-semibold text-indigo-300">
                      AceVertix Assistant
                    </span>
                    <span>&bull;</span>
                    <span className="text-emerald-400 font-medium">
                      Thinking...
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#0D1527]/95 border border-indigo-500/30 shadow-xl backdrop-blur-md flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">
                      Synthesizing workspace context &amp; drafting response...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Composer */}
        <div className="p-4 bg-[#090D18]/90 border-t border-white/5">
          <form
            onSubmit={handleSend}
            className="max-w-3xl mx-auto bg-[#0B1120]/90 border border-white/10 rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl focus-within:border-indigo-500/50 transition-colors"
          >
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={
                isBusy
                  ? "AceVertix is thinking..."
                  : "Ask anything, query documents, or issue autonomous tasks... (Enter to send, Shift+Enter for newline)"
              }
              disabled={isBusy}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60 resize-none max-h-32 leading-relaxed"
            />
            <button
              type="submit"
              disabled={isBusy || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all flex-shrink-0"
              aria-label="Send message"
            >
              {isBusy ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[16px]">
                  send
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
