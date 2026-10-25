"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Cpu, Brain, FileText } from "lucide-react";
import { MessageItem, ConversationItem, ModelOption } from "@/lib/api-client";
import { MessageBubble } from "@/features/chat/message-bubble";
import { MemoryDrawer } from "@/features/memory/memory-drawer";
import { DocumentDrawer } from "@/features/documents/document-drawer";

interface ChatViewProps {
  conversation: ConversationItem | null;
  messages: MessageItem[];
  models: ModelOption[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onModelChange: (provider: string, model: string) => Promise<void>;
}

export function ChatView({
  conversation,
  messages,
  models,
  isLoading,
  onSendMessage,
  onModelChange,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const content = input.trim();
    setInput("");
    setIsSending(true);
    try {
      await onSendMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">Personal AI Assistant</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Select an existing conversation from the sidebar or click &quot;+ New&quot; to begin your session.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950">
      {/* Chat Top Bar */}
      <header className="h-14 px-6 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="truncate max-w-xs">
            <h1 className="text-sm font-semibold text-slate-100 truncate">{conversation.title}</h1>
          </div>

          {/* Model Switcher Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={`${conversation.active_model_provider}/${conversation.active_model_name}`}
              onChange={(e) => {
                const val = e.target.value;
                const slashIdx = val.indexOf("/");
                const provider = slashIdx !== -1 ? val.slice(0, slashIdx) : val;
                const model = slashIdx !== -1 ? val.slice(slashIdx + 1) : "";
                onModelChange(provider, model);
              }}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {!models.some((m) => m.id === `${conversation.active_model_provider}/${conversation.active_model_name}`) && (
                <option value={`${conversation.active_model_provider}/${conversation.active_model_name}`} className="bg-slate-900 text-slate-200">
                  {conversation.active_model_name} ({conversation.active_model_provider})
                </option>
              )}
              {models.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-200">
                  {opt.name} {opt.is_local ? "🏠 Local" : "☁️ Cloud"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDocsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-200 transition-colors"
            title="Open Document Knowledge (RAG)"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Docs</span>
          </button>

          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-200 transition-colors"
            title="Open Personal Memory Engine"
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>Memory</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 ml-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Drawers */}
      <MemoryDrawer isOpen={isMemoryOpen} onClose={() => setIsMemoryOpen(false)} />
      <DocumentDrawer isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            Loading message history...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <Sparkles className="w-6 h-6 text-slate-600 mb-2" />
            <p>This conversation is empty. Say hello to get started!</p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message (Enter to send, Shift+Enter for new line)..."
            rows={1}
            disabled={isSending}
            className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none max-h-32 min-h-[38px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors flex-shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-center text-[11px] text-slate-500">
          Personal AI runs locally. Actions with external side effects strictly require human authorization.
        </div>
      </div>
    </div>
  );
}
