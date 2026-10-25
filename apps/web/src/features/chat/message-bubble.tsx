import React from "react";
import { Bot, User as UserIcon } from "lucide-react";
import { MessageItem } from "@/lib/api-client";

interface MessageBubbleProps {
  message: MessageItem;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

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
