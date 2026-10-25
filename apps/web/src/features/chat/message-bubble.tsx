"use client";

import React, { useState } from "react";
import { Bot, User as UserIcon, Wrench, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { MessageItem } from "@/lib/api-client";

interface MessageBubbleProps {
  message: MessageItem;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [showTools, setShowTools] = useState(false);

  const hasTools = (message.tool_results && message.tool_results.length > 0) ||
                   (message.tool_calls && message.tool_calls.length > 0);

  return (
    <div className={`flex gap-3 py-3 px-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser
          ? "bg-indigo-600 text-white rounded-br-xs"
          : "bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-bl-xs"
      }`}>
        {/* Tool Activity Collapsible Section */}
        {hasTools && (
          <div className="mb-2.5 pb-2 border-b border-slate-700/60">
            <button
              onClick={() => setShowTools(!showTools)}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Used {message.tool_results?.length || message.tool_calls?.length} tool{(message.tool_results?.length || 1) > 1 ? "s" : ""}</span>
              {showTools ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {showTools && (
              <div className="mt-2 space-y-1.5 text-xs">
                {message.tool_results?.map((res: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {res.tool_name || "Tool"}
                      </span>
                      {res.duration_ms !== undefined && (
                        <span>{res.duration_ms}ms</span>
                      )}
                    </div>
                    {res.output && (
                      <div className="text-slate-300 whitespace-pre-wrap bg-slate-950/60 rounded p-1.5 mt-1 border border-slate-800/60">
                        {typeof res.output === "string" ? res.output : JSON.stringify(res.output, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        <div className={`mt-1.5 flex items-center gap-2 text-[10px] ${isUser ? "text-indigo-200 justify-end" : "text-slate-400 justify-start"}`}>
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {message.token_count > 0 && (
            <span>• {message.token_count} tokens</span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
