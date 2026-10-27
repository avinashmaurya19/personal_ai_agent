"use client";

import React, { useState, useRef, useEffect } from "react";
import { MarkdownRenderer } from "@/features/chat/components/markdown-renderer";

export interface InlineTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface DashboardInlineAssistantProps {
  turns: InlineTurn[];
  isGenerating: boolean;
  error?: string | null;
  conversationId: string;
  onOpenInChat: (convId: string) => void;
  onClose: () => void;
  onSendFollowUp: (prompt: string) => void;
}

export function DashboardInlineAssistant({
  turns,
  isGenerating,
  error,
  conversationId,
  onOpenInChat,
  onClose,
  onSendFollowUp,
}: DashboardInlineAssistantProps) {
  const [followUp, setFollowUp] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as turns arrive or during generation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, isGenerating]);

  // Find last assistant reply for copy action
  const lastAssistantReply = [...turns].reverse().find((t) => t.role === "assistant")?.content || "";

  const handleCopy = () => {
    if (!lastAssistantReply || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(lastAssistantReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || isGenerating) return;
    onSendFollowUp(followUp.trim());
    setFollowUp("");
  };

  return (
    <div className="w-full rounded-2xl bg-[#0B1120]/95 border border-indigo-500/20 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      {/* Top Gradient Accent Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-wide">AceVertix Copilot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                Dashboard Assistant
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              {isGenerating ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping inline-block" />
                  <span className="text-purple-300 font-medium">Synthesizing & executing tools...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Ready • Verified from personal context</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          {lastAssistantReply && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy assistant reply"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copied ? "check" : "content_copy"}
              </span>
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}

          {/* Open in Full Chat */}
          <button
            type="button"
            onClick={() => onOpenInChat(conversationId)}
            title="Open in dedicated Chat view"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-medium text-indigo-300 hover:text-indigo-200 transition-all shadow-sm"
          >
            <span>Open in Chat</span>
            <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
          </button>

          {/* Close / Dismiss */}
          <button
            type="button"
            onClick={onClose}
            title="Close assistant card"
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>

      {/* Turns Feed Container */}
      <div
        ref={scrollRef}
        className="max-h-[380px] overflow-y-auto px-5 py-4 flex flex-col gap-4 text-xs select-text scroll-smooth"
      >
        {turns.map((turn) => {
          if (turn.role === "user") {
            return (
              <div
                key={turn.id}
                className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-slate-200"
              >
                <span className="material-symbols-outlined text-[16px] text-indigo-400 flex-shrink-0 mt-0.5">
                  person
                </span>
                <div className="flex-1 min-w-0 font-medium leading-relaxed">{turn.content}</div>
              </div>
            );
          }

          return (
            <div
              key={turn.id}
              className="px-4 py-3 rounded-xl bg-[#070A14]/90 border border-white/5 text-slate-200 shadow-inner"
            >
              <MarkdownRenderer content={turn.content} />
            </div>
          );
        })}

        {/* Loading Indicator while generating */}
        {isGenerating && (
          <div className="flex flex-col gap-2.5 px-4 py-3.5 rounded-xl bg-[#070A14]/70 border border-white/5">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              <span className="text-[11px] font-medium">Executing agent tools & synthesizing response...</span>
            </div>
            <div className="space-y-1.5 animate-pulse pt-1">
              <div className="h-2.5 bg-white/10 rounded w-5/6" />
              <div className="h-2.5 bg-white/5 rounded w-4/6" />
              <div className="h-2.5 bg-white/10 rounded w-3/6" />
            </div>
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
            <span className="material-symbols-outlined text-[16px] text-red-400 flex-shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1 text-[11px] leading-relaxed">{error}</div>
          </div>
        )}
      </div>

      {/* Follow-up Composer Footer */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-white/5 bg-white/[0.02] flex items-center gap-2"
      >
        <div className="relative flex-1 flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-slate-500 text-[16px] pointer-events-none">
            chat_bubble
          </span>
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            disabled={isGenerating}
            placeholder="Ask a follow-up or next instruction..."
            className="w-full h-9 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.07] disabled:opacity-50 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={!followUp.trim() || isGenerating}
          className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          <span>Send</span>
          <span className="material-symbols-outlined text-[14px]">send</span>
        </button>
      </form>
    </div>
  );
}
