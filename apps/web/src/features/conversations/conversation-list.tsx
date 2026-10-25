"use client";

import React from "react";
import { MessageSquare, Plus, Trash2, Cpu } from "lucide-react";
import { ConversationItem } from "@/lib/api-client";

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
  onDelete,
}: ConversationListProps) {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-sm">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-500/20">
            AI
          </div>
          <span className="font-semibold text-slate-100 text-sm tracking-tight">Personal Assistant</span>
        </div>
        <button
          onClick={onCreateNew}
          className="p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1 text-xs font-medium px-2 shadow-sm"
          title="New Conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Model Indicator Badge */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/30 flex items-center gap-2 text-xs text-slate-400">
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        <span>Provider:</span>
        <span className="font-medium text-slate-300">Ollama (Llama 3.2)</span>
      </div>

      {/* Conversation Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No conversations yet.<br />Click "+ New" to begin.
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all ${
                  isSelected
                    ? "bg-slate-800 text-white font-medium shadow-inner"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => onDelete(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity text-slate-500 rounded"
                  title="Delete chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Sprint 1 MVP</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>₹0 Local Infra</span>
        </span>
      </div>
    </aside>
  );
}
